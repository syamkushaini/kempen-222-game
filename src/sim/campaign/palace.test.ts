import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { EARLIEST_DISSOLUTION, PALACE_WAIT, canDissolve, dissolve, palaceRefusal, startCareer } from './career';
import { startFormation } from './formation';
import { newCampaign } from './turn';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const base = getWorld('career')!;
const ready = (seed = 5): Campaign => {
  const c = startCareer(base, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  c.career!.week = EARLIEST_DISSOLUTION + 4;
  return c;
};

describe('the Palace and a request to dissolve Parliament', () => {
  it('has no reason to refuse a government that has a majority and its footing', () => {
    const c = ready();
    c.career!.government = { ...c.career!.government, stability: 70, trust: 70, minority: false };
    expect(palaceRefusal(c)).toBe(0);
    for (let seed = 1; seed <= 10; seed++) { const d = ready(seed); d.career!.government.stability = 70; d.career!.government.minority = false; expect(dissolve(base, d)).toBe(true); }
  });

  it('refuses a shaky minority more often than not, shakes the government, and asks it to wait', () => {
    const shaky = ready();
    shaky.career!.government = { ...shaky.career!.government, stability: 20, trust: 25, minority: true };
    expect(palaceRefusal(shaky)).toBeGreaterThan(0.5);
    let refused = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const c = ready(seed);
      c.career!.government = { ...c.career!.government, stability: 20, trust: 25, minority: true };
      if (!dissolve(base, c)) {
        refused++;
        expect(c.career!.palaceNo).toBe(c.career!.week);
        expect(c.career!.government.stability).toBe(12);
        expect(canDissolve(c)).toBe(false);
        expect(c.news.some((n) => n.key === 'news.palace.refused')).toBe(true);
        c.career!.week += PALACE_WAIT;
        expect(canDissolve(c)).toBe(true);
        expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
      }
    }
    expect(refused).toBeGreaterThan(10);
    expect(refused).toBeLessThan(30);
  });

  it('is capped, so that no government is certain to be refused', () => {
    const c = ready();
    c.career!.government = { ...c.career!.government, stability: 5, trust: 0, minority: true };
    expect(palaceRefusal(c)).toBeLessThanOrEqual(0.6);
  });
});

describe('the Palace in the talks that follow a hung result', () => {
  const hung = getWorld('general')!;
  const tally = (seats: number[]) => { const out = new Array<number>(PARTY_IDS.length).fill(0); seats.forEach((n, i) => { out[i] = n; }); return out; };

  it('invites first the leader with most behind them, and says so', () => {
    const c = newCampaign(hung, { player: PS, difficulty: 'normal', seed: 1 });
    startFormation(hung, c, tally([85, 40, 70, 3, 4, 1, 3, 0, 0, 0]));
    expect(c.formation!.invited).toBe(PS);
    expect(c.news.some((n) => n.key === 'form.invited')).toBe(true);
    for (const lang of ['en', 'ms'] as const) for (const k of ['form.invited', 'news.palace.refused', 'orders.dissolve.palace']) expect(STRINGS[lang][k as StringKey], k).toBeTruthy();
  });

  it('does not intervene where one party won outright', () => {
    const c = newCampaign(hung, { player: PS, difficulty: 'normal', seed: 1 });
    startFormation(hung, c, tally([130, 40, 30, 3, 4, 1, 3, 0, 0, 0]));
    expect(c.formation!.outcome!.pm).toBe(PS);
    expect(c.news.some((n) => n.key === 'form.invited')).toBe(false);
  });
});
