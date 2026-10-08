import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { lastElection } from '../election';
import { N_BLOCS, N_PARTIES, PARTY_IDS } from '../types';
import { resolveStatePolls, ROUNDS } from './contests';
import { startCareer, syncOpinion } from './career';
import { lean, pulse, swing, topParty, votedStates } from './statevotes';
import { STRINGS, type StringKey } from '../../i18n/strings';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const base = getWorld('career')!;
const career = (): Campaign => startCareer(base, { player: PS, difficulty: 'normal', seed: 5 });
const mood = (c: Campaign, n: number) => { for (let b = 0; b < N_BLOCS; b++) c.career!.mood[b][c.player] = n; syncOpinion(c); };

describe('the seats of a state election', () => {
  it('are kept for every state of the round, with the seats the state gave the last general election', () => {
    const c = career();
    expect(pulse(c)).toBeNull();
    c.career!.rounds = 1;
    resolveStatePolls(base, c, 1);
    const votes = c.career!.stateVotes!;
    expect(Object.keys(votes).sort()).toEqual([...ROUNDS[1].states].sort());
    const last = lastElection(base);
    for (const [st, v] of Object.entries(votes)) {
      expect(v.seats).toHaveLength(N_PARTIES);
      expect(v.seats.reduce((a, n) => a + n, 0)).toBe(base.seatsByState[st].length);
      const then = new Array<number>(N_PARTIES).fill(0);
      for (const i of base.seatsByState[st]) then[last.seats[i].winner]++;
      expect(v.before).toEqual(then);
      expect(v.week).toBe(c.career!.week);
    }
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('say which way the voters are leaning for the player’s party', () => {
    const up = career();
    up.career!.rounds = 1;
    mood(up, 3);
    resolveStatePolls(base, up, 0);
    const down = career();
    down.career!.rounds = 1;
    mood(down, -3);
    resolveStatePolls(base, down, 2);
    const [a, b] = [pulse(up)!, pulse(down)!];
    expect(a.states).toBe(ROUNDS[1].states.length);
    expect(a.seats).toBeGreaterThan(a.before);
    expect(b.seats).toBeLessThan(b.before);
    expect(votedStates(up).every(([, v]) => lean(v, PS) >= 0)).toBe(true);
    expect(votedStates(down).some(([, v]) => lean(v, PS) < 0)).toBe(true);
    const [st, v] = votedStates(up)[0];
    expect(swing(v, PS)).toBe(v.seats[PS] - v.before[PS]);
    expect(topParty(v)).toBeGreaterThanOrEqual(0);
    expect(st).toBeTruthy();
  });

  it('of later rounds are added to those of the earlier ones', () => {
    const c = career();
    resolveStatePolls(base, c, 1);
    const first = Object.keys(c.career!.stateVotes!).length;
    resolveStatePolls(base, c, 1);
    expect(Object.keys(c.career!.stateVotes!).length).toBeGreaterThan(first);
  });

  it('have words in both languages', () => {
    for (const key of ['title', 'note', 'pulse', 'read.up', 'read.down', 'read.flat', 'gainer', 'top', 'week', 'person', 'seats']) {
      expect(STRINGS.en[`statevote.${key}` as StringKey], key).toBeTruthy();
      expect(STRINGS.ms[`statevote.${key}` as StringKey], key).toBeTruthy();
    }
  });
});
