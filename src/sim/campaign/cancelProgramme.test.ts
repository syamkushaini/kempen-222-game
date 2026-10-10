import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { cancelProgramme, canCancel, enact, programmesOf, repeal } from './govern';

const PS = PARTY_IDS.indexOf('ps');
const world = getWorld('career')!;
const career = () => {
  const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
  c.inbox = [];
  return c;
};

describe('cancelling a programme and repealing an Act take their cost off the standing commitments', () => {
  it('records what each passed promise added, and a programme can be cancelled for a price', () => {
    const c = career();
    const k = c.career!;
    const before = k.fiscal;
    enact(c, 'pledge:cashAid', PS);
    expect(k.programmes?.cashAid).toBe(2);
    expect(k.fiscal).toBe(before + 2);
    expect(canCancel(c, 'cashAid')).toBe(true);
    const trust = k.government.trust, cred = k.credibility;
    expect(cancelProgramme(c, 'cashAid')).toBe(true);
    expect(k.fiscal).toBe(before);
    expect(k.programmes?.cashAid).toBe(0);
    expect(k.government.trust).toBe(trust - 2);
    expect(k.credibility).toBe(cred - 2);
    expect(cancelProgramme(c, 'cashAid')).toBe(false);
  });

  it('is not for an Act, which is repealed instead, and repealing takes its cost off too', () => {
    const c = career();
    const k = c.career!;
    enact(c, 'pledge:gigRights', PS);
    (k.laws ??= []).push('gigRights');
    expect(canCancel(c, 'gigRights')).toBe(false);
    const fiscal = k.fiscal;
    expect(repeal(c, 'gigRights')).toBe(true);
    expect(k.fiscal).toBe(fiscal - 0.5);
    expect(k.programmes?.gigRights).toBe(0);
  });

  it('finds the programmes of a game saved before they were recorded, from the promises kept', () => {
    const c = career();
    const k = c.career!;
    k.delivery.cashAid = 'kept';
    k.fiscal = 3;
    expect(programmesOf(k)).toEqual([['cashAid', 2]]);
    expect(cancelProgramme(c, 'cashAid')).toBe(true);
    expect(k.fiscal).toBe(1);
    expect(programmesOf(k)).toEqual([]);
  });
});
