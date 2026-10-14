import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { ISSUE_IDS } from './types';
import { blocSizes, stanceReaction, stanceVerdict, standFeeling, VERDICT_CLEAR } from './policy';

const world = getWorld('career')!;
const career = () => startCareer(world, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 5 });

describe('whether a stance is good or bad for the vote', () => {
  it('adds up what a move wins and loses over all the voters, and calls it by the difference', () => {
    const c = career(), k = c.career!, me = c.player;
    let seen = { good: 0, bad: 0, mixed: 0, little: 0 };
    ISSUE_IDS.forEach((_, i) => {
      const here = k.stances[me][i];
      for (const to of [-2, -1, 0, 1, 2]) {
        if (to === here) continue;
        const v = stanceVerdict(world, k, i, here, to);
        expect(v.net).toBeCloseTo(v.gain - v.loss, 9);
        expect(v.gain).toBeGreaterThanOrEqual(0);
        expect(v.loss).toBeGreaterThanOrEqual(0);
        if (v.kind === 'good') expect(v.net).toBeGreaterThanOrEqual(VERDICT_CLEAR);
        if (v.kind === 'bad') expect(v.net).toBeLessThanOrEqual(-VERDICT_CLEAR);
        if (v.kind === 'mixed') expect(Math.abs(v.net)).toBeLessThan(VERDICT_CLEAR);
        seen[v.kind]++;
      }
    });
    // Every kind of answer is given somewhere, so the verdict is not always the same.
    expect(seen.good).toBeGreaterThan(0);
    expect(seen.bad).toBeGreaterThan(0);
    expect(seen.mixed + seen.little).toBeGreaterThan(0);
  });

  it('names the groups it pleases and annoys, with their shares of the voters', () => {
    const c = career(), k = c.career!, me = c.player;
    const i = ISSUE_IDS.indexOf('subsidies');
    const v = stanceVerdict(world, k, i, k.stances[me][i], k.stances[me][i] + 1 > 2 ? 1 : k.stances[me][i] + 1);
    const total = blocSizes(world).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 3);
    for (const g of [...v.pleased, ...v.annoyed]) { expect(g.share).toBeGreaterThan(0); expect(g.share).toBeLessThan(1); }
    for (const g of v.pleased) expect(g.change).toBeGreaterThan(0);
    for (const g of v.annoyed) expect(g.change).toBeLessThan(0);
    // The same reaction the game applies: no group is named that the reaction leaves out.
    const reaction = stanceReaction(k, i, k.stances[me][i], k.stances[me][i] + 1 > 2 ? 1 : k.stances[me][i] + 1).map((r) => r.bloc);
    for (const g of [...v.pleased, ...v.annoyed]) expect(reaction).toContain(g.bloc);
  });

  it('says who likes and dislikes where the party stands now', () => {
    const c = career(), k = c.career!;
    let any = false;
    ISSUE_IDS.forEach((_, i) => {
      const f = standFeeling(world, k, c.player, i);
      for (const g of f.pleased) { expect(g.share).toBeGreaterThan(0); any = true; }
    });
    expect(any).toBe(true);
  });
});
