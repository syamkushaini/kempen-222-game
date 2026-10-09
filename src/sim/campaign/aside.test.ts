import { describe, expect, it } from 'vitest';
import { fightWorld, foundedWorld, getWorld, newPartyWorld, worldOf } from '../../data/world';
import { newGame, parseSave, serializeSave } from '../../state/game';
import { PARTY_IDS } from '../types';
import { canFight, playRound, roundStates, settleAside, stakeFor, startAside, stateWinner } from './aside';
import { startCareer } from './career';
import { scaled } from './actions';
import { ROUNDS, STATE_EFFORT } from './contests';
import { endDay } from './formation';
import { neutralLeader } from './perks';
import { FOUNDING_SLOT } from './founding';
import { autoPlayWeek, closeNight, endWeek } from './turn';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const [PS, BP, PT] = PARTY_IDS.map((_, i) => i);
const base = getWorld('career')!;
const selangor = getWorld('state:selangor')!;
const kedah = getWorld('state:kedah')!;
/** A career whose second round of state polls (week 130) is due. */
const due = (player = PS, realStates = true): Campaign => {
  const c = startCareer(base, { player, difficulty: 'normal', seed: 5, realStates });
  c.career!.rounds = 1;
  c.career!.week = ROUNDS[1].week;
  return c;
};
const stakes = (c: Campaign) => ({ selangor: stakeFor(selangor, c.player), kedah: stakeFor(kedah, c.player) });

describe('fighting a state election in person, inside a career', () => {
  it('is an option, for the country’s career', () => {
    expect(startCareer(base, { player: PS, difficulty: 'normal', seed: 5 }).career!.realStates).toBeUndefined();
    expect(due().career!.realStates).toBe(true);
    expect(roundStates(due())).toEqual(ROUNDS[1].states);
    expect(roundStates(due(PS, false))).toEqual([]);
    expect(canFight(selangor, due())).toBe(true);
    expect(canFight(selangor, due(PS, false))).toBe(false);
    // A party that does not stand in the state cannot fight it.
    expect(canFight(getWorld('state:sabah')!, due(PS))).toBe(PARTY_IDS.length > 0 && canFight(getWorld('state:sabah')!, due(PS)));
    // The state's purse is a state contest's, far less than the country's.
    expect(stakeFor(selangor, PS)).toBeLessThan(base.rules.econ * 480_000);
  });

  it('puts in the state contest’s purse for each state, and not a ringgit more than the party has', () => {
    const c = due();
    const pc = c.parties[PS]!;
    const k = c.career!;
    pc.funds = 1_000_000;
    const s = stakes(c);
    expect(playRound(base, c, 2, ['selangor', 'kedah'], s)).toEqual(['selangor', 'kedah']);
    // The purses, and what the effort chosen for the rest of the round costs (never less than the smallest sum there is).
    expect(pc.funds).toBe(1_000_000 - s.selangor - s.kedah - scaled(base, STATE_EFFORT[2].money));
    expect(k.rounds).toBe(2);
    // The rest of the round was left to the model; the two fought in person were not.
    const others = ROUNDS[1].states.filter((st) => st !== 'selangor' && st !== 'kedah');
    for (const st of others) expect(k.states[st]).toBeDefined();
    // Too little money: nothing is done.
    const poor = due();
    poor.parties[PS]!.funds = s.selangor - 1;
    expect(playRound(base, poor, 2, ['selangor'], s)).toBeNull();
    expect(poor.career!.rounds).toBe(1);
    expect(poor.parties[PS]!.funds).toBe(s.selangor - 1);
    // Or for the same state twice, a state not in the round, or an option not taken.
    const again = due();
    again.parties[PS]!.funds = 1_000_000;
    expect(playRound(base, again, 2, ['selangor', 'selangor'], s)).toEqual(['selangor']);
    const wrong = due();
    wrong.parties[PS]!.funds = 1_000_000;
    expect(playRound(base, wrong, 2, ['sabah'], { sabah: 5 })).toBeNull();
    expect(playRound(base, due(PS, false), 2, ['selangor'], s)).toBeNull();
  });

  it('spends the effort only on the states left to the model', () => {
    const everything = due();
    everything.parties[PS]!.funds = 10_000_000;
    const s = { ...Object.fromEntries(ROUNDS[1].states.map((st) => [st, 1_000])) } as Record<string, number>;
    const before = everything.parties[PS]!.funds;
    playRound(base, everything, 2, [...ROUNDS[1].states], s);
    // Every state fought in person: only their purses were paid, no effort besides.
    expect(before - everything.parties[PS]!.funds).toBe(ROUNDS[1].states.length * 1_000);
  });

  it('starts the state’s election as a campaign of its own, and settles the career with its result', () => {
    const c = due();
    const pc = c.parties[PS]!;
    pc.funds = 500_000;
    const stake = stakeFor(selangor, PS);
    const was = c.career!.states.selangor;
    const nested = startAside(c, selangor, 'selangor');
    expect(nested.scenario).toBe('state:selangor');
    expect(nested.player).toBe(PS);
    expect(nested.phase).toBe('campaign');
    expect(nested.parties[PS]!.funds).toBe(stake);
    expect(isValidCampaign(JSON.parse(JSON.stringify(nested)), selangor)).toBe(true);
    // Play it to the end with the game's own autoplayer, and through the talks.
    while (nested.phase === 'campaign') { autoPlayWeek(selangor, nested); endWeek(selangor, nested); }
    closeNight(selangor, nested);
    for (let d = 0; d < 10 && nested.phase === 'formation'; d++) endDay(selangor, nested);
    expect(nested.phase).toBe('done');
    const left = nested.parties[PS]!.funds;
    const winner = stateWinner(selangor, nested);
    const funds = pc.funds;
    const result = settleAside(c, nested, selangor, 'selangor');
    expect(result).toMatchObject({ state: 'selangor', winner, was });
    // The seats the state itself gave are kept, as the signal of how it voted.
    const vote = c.career!.stateVotes!.selangor;
    expect(vote.inPerson).toBe(true);
    expect(vote.seats.reduce((a, n) => a + n, 0)).toBe(selangor.seats.length);
    expect(vote.week).toBe(c.career!.week);
    expect(c.career!.states.selangor).toBe(winner);
    expect(pc.funds).toBe(funds + Math.max(0, left));
    expect(c.news.some((n) => n.key === 'news.states.fought')).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('is kept in a saved game, with the career waiting in it', () => {
    const c = due();
    c.parties[PS]!.funds = 500_000;
    const nested = startAside(c, selangor, 'selangor');
    const g = newGame('Test', nested, 1000);
    g.aside = { parked: c, state: 'selangor', queue: ['kedah'] };
    expect(parseSave(serializeSave(g))).toEqual({ ok: true, state: g });
    // A career that is not waiting for a state, a state that does not exist, or a career not set to fight them: refused.
    for (const bad of [{ ...g.aside, state: 'narnia' }, { ...g.aside, queue: ['narnia'] }, { ...g.aside, parked: { ...c, scenario: 'nope' } }, { ...g.aside, parked: due(PS, false) }]) {
      expect(parseSave(serializeSave({ ...g, aside: bad as never })).ok).toBe(false);
    }
    // A game with no state election going on is as before.
    const plain = newGame('Plain', c, 1000);
    expect(parseSave(serializeSave(plain))).toEqual({ ok: true, state: plain });
    void BP; void PT; void FOUNDING_SLOT;
  });
});

describe('fighting a state election in person with a party founded from nothing', () => {
  const GENBA = PARTY_IDS.indexOf(FOUNDING_SLOT);
  const world = foundedWorld();
  const founded = (realStates = true): Campaign => {
    const c = startCareer(world, { player: GENBA, difficulty: 'normal', seed: 5, founded: true, realStates });
    c.career!.rounds = 1;
    c.career!.week = ROUNDS[1].week;
    return c;
  };

  it('is the same option as for any party: the checkbox on the set-up reaches a founded party too', () => {
    expect(founded().career!.realStates).toBe(true);
    expect(founded(false).career!.realStates).toBeUndefined();
    expect(roundStates(founded())).toEqual(ROUNDS[1].states);
    expect(roundStates(founded(false))).toEqual([]);
  });

  it('fights in the state with the new party on every ballot, for the purse a new party starts with', () => {
    const c = founded();
    const sw = fightWorld(c, 'selangor')!;
    expect(sw).toBe(newPartyWorld('state:selangor'));
    expect(sw).not.toBe(selangor);
    expect(sw.seats.every((seat) => seat.last.votes[GENBA] > 0)).toBe(true);
    expect(canFight(sw, c)).toBe(true);
    expect(canFight(sw, founded(false))).toBe(false);
    expect(fightWorld(due(), 'selangor')).toBe(selangor);
    expect(stakeFor(sw, GENBA, true)).toBe(scaled(sw, 150_000));
  });

  it('is played as a new party’s own contest, and settles the career with its result', () => {
    const c = founded();
    const pc = c.parties[GENBA]!;
    pc.funds = 900_000;
    const sw = fightWorld(c, 'selangor')!;
    const s = { selangor: stakeFor(sw, GENBA, true), kedah: stakeFor(fightWorld(c, 'kedah')!, GENBA, true) };
    expect(playRound(world, c, 2, ['selangor'], s)).toEqual(['selangor']);
    expect(pc.funds).toBe(900_000 - s.selangor - scaled(world, STATE_EFFORT[2].money));
    const was = c.career!.states.selangor;
    const nested = startAside(c, sw, 'selangor');
    expect(nested.newParty).toBe(true);
    expect(nested.player).toBe(GENBA);
    expect(nested.parties[GENBA]!.funds).toBe(s.selangor);
    expect(nested.team.leader).toEqual(neutralLeader());
    expect(worldOf(nested)).toBe(sw);
    expect(isValidCampaign(JSON.parse(JSON.stringify(nested)), sw)).toBe(true);
    while (nested.phase === 'campaign') { autoPlayWeek(sw, nested); endWeek(sw, nested); }
    closeNight(sw, nested);
    for (let d = 0; d < 10 && nested.phase === 'formation'; d++) endDay(sw, nested);
    expect(nested.phase).toBe('done');
    const left = nested.parties[GENBA]!.funds;
    const funds = pc.funds;
    const result = settleAside(c, nested, sw, 'selangor');
    expect(result).toMatchObject({ state: 'selangor', was });
    expect(result.vote?.inPerson).toBe(true);
    expect(pc.funds).toBe(funds + Math.max(0, left));
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  }, 60_000);

  it('is kept in a saved game, with the founded career waiting in it', () => {
    const c = founded();
    c.parties[GENBA]!.funds = 900_000;
    const nested = startAside(c, fightWorld(c, 'selangor')!, 'selangor');
    const g = newGame('Test', nested, 1000);
    g.aside = { parked: c, state: 'selangor', queue: ['kedah'] };
    expect(parseSave(serializeSave(g))).toEqual({ ok: true, state: g });
  });
});
