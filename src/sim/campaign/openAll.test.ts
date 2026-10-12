import { describe, expect, it } from 'vitest';
import { getWorld, newPartyWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { CHOOSE_DAYS, canChoose, openAndChooseAll } from './candidates';
import { FOUNDING_SLOT } from './founding';
import { foundForContest } from './career';
import { newCampaign } from './turn';
import type { Campaign } from './types';

const PS = PARTY_IDS.indexOf('ps');
const stateWorld = getWorld('state:perak')!;
const established = (): Campaign => newCampaign(stateWorld, { player: PS, difficulty: 'normal', seed: 3 });
const fresh = (): { c: Campaign; w: ReturnType<typeof newPartyWorld> } => {
  const w = newPartyWorld('state:perak')!;
  const c = newCampaign(w, { player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'normal', seed: 3 });
  foundForContest(w, c, null);
  return { c, w };
};

describe('choosing the best candidate in every seat at once', () => {
  it('opens as many seats as the leader has days for, closest first, and chooses in all of them', () => {
    const c = established();
    const pc = c.parties[PS]!;
    pc.days = 6;
    const keys = c.team.keySeats.length;
    const r = openAndChooseAll(stateWorld, c);
    expect(r.opened).toBe(Math.floor(6 / CHOOSE_DAYS));
    expect(c.team.keySeats.length).toBe(keys + r.opened);
    expect(c.team.keySeats.every((k) => k.pick !== null)).toBe(true);
    expect(r.chosen).toBe(keys + r.opened);
    expect(pc.days).toBeCloseTo(0, 6);
  });

  it('stops when the days run out, and a second press does nothing more', () => {
    const c = established();
    c.parties[PS]!.days = 1;
    const r1 = openAndChooseAll(stateWorld, c);
    expect(r1.opened).toBe(2);
    const r2 = openAndChooseAll(stateWorld, c);
    expect(r2).toEqual({ opened: 0, chosen: 0 });
  });

  it('works for a party founded for the contest, and does nothing once nomination day has passed', () => {
    const { c, w } = fresh();
    c.parties[c.player]!.days = 4;
    expect(openAndChooseAll(w!, c).opened).toBe(8);
    c.week = 99;
    expect(canChoose(c)).toBe(false);
    expect(openAndChooseAll(w!, c)).toEqual({ opened: 0, chosen: 0 });
  });
});
