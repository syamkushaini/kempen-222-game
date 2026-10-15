import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { endDay, playerRole, startFormation } from './formation';
import { standingOf } from './standing';

const idx = (id: (typeof PARTY_IDS)[number]) => PARTY_IDS.indexOf(id);
const [PS, BP, PT, GBK, GBS, OTH] = (['ps', 'bp', 'pt', 'gbk', 'gbs', 'oth'] as const).map(idx);
const world = getWorld('career')!;

/** BP, the smaller partner of a pact with PS, in a House where PS can form the government without BP's own signature. */
const talks = (pact: boolean) => {
  const c = startCareer(world, { player: BP, difficulty: 'normal', seed: 5 });
  const tally = new Array<number>(PARTY_IDS.length).fill(0);
  tally[PS] = 62; tally[BP] = 40; tally[PT] = 55; tally[GBK] = 20; tally[GBS] = 5; tally[OTH] = 40;
  if (pact) c.pacts = [{ a: PS, b: BP, week: 1 }];
  startFormation(world, c, tally);
  for (let d = 0; d < 8 && !c.formation!.outcome; d++) endDay(world, c);
  return c;
};

describe('a pact partner when the leader of the pact forms the government', () => {
  it('is in the government, with the place it was offered, and stands as a partner', () => {
    const c = talks(true);
    const o = c.formation!.outcome!;
    expect(o.pm).toBe(PS);
    expect(o.partners).toContain(BP);
    expect(playerRole(c, o)).toBe('partner');
    expect(o.deals[BP]!.posts).toBeGreaterThan(0);
    c.career!.government = o;
    expect(standingOf(c)).toBe('gov');
  });

  it('is left in opposition when there was no pact and the player signed to nobody', () => {
    const o = talks(false).formation!.outcome!;
    if (o.pm !== BP) expect(o.partners).not.toContain(BP);
  });
});
