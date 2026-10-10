import { describe, expect, it } from 'vitest';
import { getWorld, worldOf } from '../../data/world';
import { STRINGS, translate, type StringKey } from '../../i18n/strings';
import { lastElection, majorityLine } from '../election';
import { emptyDynamics } from '../dynamics';
import { PARTY_IDS } from '../types';
import { heldOf, scaled, truth } from './actions';
import { advisersOf } from './advisers';
import { soundest } from './soundest';
import { answerEvent, beginCampaign, nextTerm, resumeTerm, skipAhead, startCareer, termWeek } from './career';
import { COUNTRY_ONLY, EVENTS } from './events';
import { endDay } from './formation';
import { ksuOf, replaceKsu } from './ksu';
import { careerWeeks, legacyOf } from './legacy';
import { borrow } from './loan';
import { now, shownWeek } from './news';
import { petition, recordResults, settledOpinion } from './results';
import { spendingLimit } from './spending';
import { closeNight, endWeek, newCampaign, playerPoll } from './turn';
import type { Campaign } from './types';

// What a play-through of several hundred careers by a player choosing at random turned up, and stays fixed.

const [PS, BP] = PARTY_IDS.map((_, i) => i);
const base = getWorld('career')!;
const career = (player = PS, seed = 5): Campaign => startCareer(base, { player, difficulty: 'normal', seed });

/** Plays the years between elections without choosing anything in particular, up to the day parliament is dissolved. */
function toCampaign(c: Campaign): void {
  for (let g = 0; g < 4000 && c.phase !== 'campaign' && !c.career!.ending; g++) {
    const world = worldOf(c)!;
    if (c.phase === 'term') { if (c.inbox.length) { const scene = c.inbox.shift()!; answerEvent(world, c, scene, soundest(scene)); } else skipAhead(world, c, 13); }
    else if (c.phase === 'formation') endDay(world, c);
    else if (c.phase === 'done') resumeTerm(c);
  }
}

describe('money', () => {
  it('asks nothing for what costs nothing', () => {
    expect(scaled(base, 0)).toBe(0);
    expect(scaled(getWorld('state:perlis')!, 0)).toBe(0);
    expect(scaled(base, 40_000)).toBe(40_000);
  });

  it('says so when a week’s income goes to a lender', () => {
    const world = getWorld('general')!;
    const c = newCampaign(world, { player: PS, difficulty: 'normal', seed: 3 });
    expect(borrow(world, c)).toBe(true);
    const funds = c.parties[PS]!.funds;
    endWeek(world, c);
    const item = c.news.find((n) => n.key === 'news.income.lender');
    expect(item).toBeDefined();
    expect(c.news.some((n) => n.key === 'news.income')).toBe(false);
    // What the lender took never reached the party.
    const [came, paid] = [Number(String(item!.vars!.rm).slice(4)), Number(String(item!.vars!.paid).slice(4))];
    expect(paid).toBeGreaterThan(0);
    expect(c.parties[PS]!.funds).toBeLessThanOrEqual(funds + came - paid);
  });
});

describe('what a campaign leaves behind', () => {
  it('keeps what lasts only one campaign out of the next parliament’s picture of the voters', () => {
    const c = career();
    toCampaign(c);
    const world = worldOf(c)!;
    expect(c.phase).toBe('campaign');
    const settled = JSON.stringify(settledOpinion(c));
    // A burst of campaigning, and a level that holds for the whole campaign: neither is opinion that has settled.
    for (const row of c.dyn.support.nat) row[PS] += 0.4;
    for (const row of heldOf(c).support.nat) row[PS] += 0.4;
    expect(JSON.stringify(settledOpinion(c))).toBe(settled);
    const part = (o: { votes: number[] }) => o.votes[PS] / o.votes.reduce((a, b) => a + b, 0);
    expect(part(truth(world, c))).toBeGreaterThan(part(lastElection(world)));
    while (c.phase === 'campaign') endWeek(world, c);
    const results = recordResults(world, c);
    const share = (rows: number[][]) => rows.reduce((a, r) => a + r[PS], 0) / rows.reduce((a, r) => a + r.reduce((x, y) => x + y, 0), 0);
    expect(share(results.basis.map((b) => b!.votes))).toBeLessThan(share(results.votes) - 0.03);
  }, 60_000);

  it('carries a term’s campaign levels no further than the election', () => {
    const c = career();
    toCampaign(c);
    let world = worldOf(c)!;
    heldOf(c).support.nat[0][PS] += 0.1;
    while (c.phase === 'campaign') endWeek(world, c);
    closeNight(world, c);
    for (let d = 0; d < 20 && c.phase === 'formation'; d++) endDay(world, c);
    expect(nextTerm(world, c)).toBe(true);
    world = worldOf(c)!;
    expect(c.held).toBeUndefined();
    expect(c.dyn).toEqual(emptyDynamics());
    // The count of weeks in the career is the weeks sat through, not the parliaments times five years.
    const r = c.career!.record;
    expect(careerWeeks(c)).toBe(r.weeksPm + r.weeksGov + r.weeksOpp + r.elections * c.totalWeeks);
    // The government has the seats its parties hold in the House that was elected.
    const g = c.career!.government;
    const tally = lastElection(world).tally;
    const own = [g.pm, ...g.partners].reduce((a, p) => a + tally[p], 0);
    expect(g.seats).toBeGreaterThanOrEqual(own);
    expect(g.seats).toBeLessThanOrEqual(own + tally[PARTY_IDS.indexOf('oth')]);
    expect(g.minority).toBe(g.seats < majorityLine(world));
  }, 60_000);
});

describe('petitions', () => {
  it('report the seats that were overturned, and no seat nobody else fought', () => {
    const world = getWorld('general')!;
    const c = newCampaign(world, { player: PS, difficulty: 'normal', seed: 3 });
    const pc = c.parties[PS]!;
    pc.fined = true;
    pc.spent = 2 * spendingLimit(world);
    const votes = world.seats.map((s) => [...s.last.votes]);
    // One of the party's narrowest wins was a walkover: there is no runner-up to give it to.
    const mine = votes.map((row, i) => ({ i, row })).filter((x) => x.row.indexOf(Math.max(...x.row)) === PS);
    const walkover = mine[0].i;
    votes[walkover] = votes[walkover].map((_, p) => (p === PS ? 1 : 0));
    const out = petition(world, c, { votes, turnout: world.seats.map((s) => s.last.turnout), basis: world.seats.map(() => null) });
    expect(out.lost.length).toBeGreaterThan(0);
    expect(out.lost).not.toContain(world.seats[walkover].id);
    for (const id of out.lost) {
      const row = out.results.votes[world.seatIndex.get(id)!];
      expect(row.indexOf(Math.max(...row))).not.toBe(PS);
    }
    const flipped = out.results.votes.filter((row, i) => votes[i].indexOf(Math.max(...votes[i])) === PS && row.indexOf(Math.max(...row)) !== PS).length;
    expect(flipped).toBe(out.lost.length);
  });
});

describe('the people round a leader', () => {
  it('each have a name and a face of their own', () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const c = career(PS, seed);
      const k = c.career!;
      const names = () => [...k.cabinet.map((m) => m.name), ...Object.values(advisersOf(c)).map((a) => a.name), ksuOf(c).name];
      expect(new Set(names()).size, `seed ${seed}`).toBe(names().length);
      replaceKsu(c);
      expect(new Set(names()).size, `seed ${seed}, a new head of the service`).toBe(names().length);
    }
  });
});

describe('weeks as the player counts them', () => {
  it('number a career’s campaign from one, and leave the term’s weeks alone', () => {
    const c = career();
    expect(shownWeek(c, 31)).toEqual({ week: 31, campaign: false });
    c.career!.week = 100;
    beginCampaign(base, c);
    expect(c.phase).toBe('campaign');
    expect(now(c)).toBe(c.career!.week + 1);
    expect(shownWeek(c, now(c))).toEqual({ week: 1, campaign: true });
    expect(shownWeek(c, 31)).toEqual({ week: 31, campaign: false });
    // A contest on its own has only its own weeks.
    const single = newCampaign(getWorld('general')!, { player: PS, difficulty: 'normal', seed: 1 });
    expect(shownWeek(single, 3)).toEqual({ week: 3, campaign: false });
  });

  it('do not take a poll that was never on offer', () => {
    const world = getWorld('general')!;
    const c = newCampaign(world, { player: PS, difficulty: 'normal', seed: 1 });
    const [funds, polls] = [c.parties[PS]!.funds, c.polls.length];
    expect(playerPoll(world, c, 'seat', null, 'quick')).toBeNull();
    expect(playerPoll(world, c, 'state', 'nowhere', 'quick')).toBeNull();
    expect(playerPoll(world, c, 'seat', 'P.999', 'quick')).toBeNull();
    expect(c.parties[PS]!.funds).toBe(funds);
    expect(c.polls).toHaveLength(polls);
  });
});

describe('a government between elections', () => {
  it('is a minority or not as the House now stands', () => {
    const c = career();
    const g = c.career!.government;
    expect(g.pm).toBe(PS);
    c.inbox = [];
    g.seats = majorityLine(base) - 1;
    g.minority = false;
    termWeek(base, c);
    expect(c.career!.government.minority).toBe(true);
  });
});

describe('a career in one state', () => {
  it('is judged on its share of that state’s seats, as a career in the country is on the country’s', () => {
    const state = startCareer(getWorld('career:perlis')!, { player: PS, difficulty: 'normal', seed: 5 });
    const country = career(BP);
    // Six of Perlis's fifteen is as good a best result as 89 of the Dewan Rakyat's 222.
    for (const c of [state, country]) { c.career!.record = { ...c.career!.record, weeksPm: 0, weeksGov: 0 }; c.career!.credibility = 50; }
    state.career!.record.bestSeats = 6;
    country.career!.record.bestSeats = 89;
    expect(legacyOf(state).legacy).toBe('nearly');
    expect(legacyOf(country).legacy).toBe('nearly');
    expect(Math.abs(legacyOf(state).score - legacyOf(country).score)).toBeLessThanOrEqual(1);
  });
});

describe('a state’s own words', () => {
  it('names the state’s offices, not the country’s, wherever a text was written for the country', () => {
    const credit = 'event.juniorCredit.o1' as StringKey;
    expect(translate('en', credit)).toContain('Prime Minister');
    expect(translate('en', credit, undefined, true)).toContain('Chief Minister');
    expect(translate('ms', credit, undefined, true)).toContain('Menteri Besar');
    expect(translate('en', 'news.palace.refused', undefined, true)).toContain('dissolve the Assembly');
    expect(translate('en', 'news.member.left', { member: 'X', n: 3 }, true)).toContain('Its 3 assembly members will');
    expect(translate('en', 'news.member.left', { member: 'X', n: 1 }, true)).toContain('Its 1 assembly member will');
    expect(translate('ms', 'news.member.left', { member: 'X', n: 3 }, true)).toContain('3 ADUN-nya');
    expect(translate('en', 'party.pad.desc', { pct: 10 }, true)).toContain('Once a term.');
    // What was written for a state is used as it was written; the title screen and the guide speak of the country in any game.
    expect(translate('en', 'legacy.premier', undefined, true)).toBe('The Chief Minister');
    expect(translate('en', 'legacy.kingmaker.text', undefined, true)).toContain('Chief ministers came and went');
    expect(translate('en', 'title.career.federal.desc', undefined, true)).toContain('Parliament');
    expect(translate('en', 'howto.goal.text', undefined, true)).toBe(translate('en', 'howto.goal.text'));
  });

  it('leaves no event that can happen in a state speaking of the Prime Minister, Parliament or MPs', () => {
    for (const lang of ['en', 'ms'] as const) {
      for (const id of Object.keys(EVENTS)) {
        if (COUNTRY_ONLY.has(id)) continue;
        for (const key of Object.keys(STRINGS[lang]).filter((k) => k.startsWith(`event.${id}.`))) {
          expect(translate(lang, key as StringKey, undefined, true), key).not.toMatch(/Prime Minister|prime minister|Parliament|\bMPs?\b|Perdana Menteri|perdana menteri|Parlimen/);
        }
      }
    }
  });
});

describe('counts in English', () => {
  it('read "1 week", not "1 weeks", and leave every other number alone', () => {
    expect(translate('en', 'grand.running', { n: 1 })).toBe('The government of national unity runs for 1 more week.');
    expect(translate('en', 'grand.running', { n: 11 })).toBe('The government of national unity runs for 11 more weeks.');
    expect(translate('en', 'grand.running', { n: 21 })).toBe('The government of national unity runs for 21 more weeks.');
    expect(translate('en', 'seat.pollMeta', { n: 1, moe: 1 })).toBe('Week 1, ±1 point');
    expect(translate('en', 'seat.pollMeta', { n: 1, moe: 1.5 })).toBe('Week 1, ±1.5 points');
    expect(translate('en', 'news.partyPoll.left', { name: 'X', n: 1, party: 'Y' })).toContain('1 of its seats');
    expect(translate('ms', 'grand.running', { n: 1 })).toContain('1 minggu');
  });
});
