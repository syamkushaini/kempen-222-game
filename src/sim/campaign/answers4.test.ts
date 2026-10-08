import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { beginCampaign, startCareer } from './career';
import { factionsOf } from './factions';
import {
  CHEST_BONUS, CHEST_PENALTY, FATIGUE_PER_TERM, LANDSLIDE, LANDSLIDE_HIT, PROBE, fatigueOf, holdingsWeek, landslide, openChest, probeChance, setAside, trade,
} from './party';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const base = getWorld('career')!;
const career = (seed = 5): Campaign => {
  const c = startCareer(base, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  c.parties[PS]!.funds = scaled(base, 5_000_000);
  return c;
};
const lot = scaled(base, 100_000);

describe('weariness with a party that stays in government', () => {
  it('is nothing for a first parliament, and grows with every one after', () => {
    expect(fatigueOf(0)).toBe(0);
    expect(fatigueOf(1)).toBe(0);
    expect(fatigueOf(2)).toBeCloseTo(FATIGUE_PER_TERM, 9);
    expect(fatigueOf(4)).toBeCloseTo(3 * FATIGUE_PER_TERM, 9);
    expect(FATIGUE_PER_TERM * 25 * 3).toBeGreaterThan(2);
  });
  it('is carried by the career and starts at one for a party that begins in government', () => {
    const c = career();
    expect(c.career!.govRun).toBe(1);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });
});

describe('a landslide', () => {
  it('is more than two seats in three, and splits the party it makes', () => {
    expect(LANDSLIDE).toBeGreaterThan(0.66);
    expect(Math.ceil(LANDSLIDE * 222)).toBe(150);
    const c = career();
    const f = factionsOf(c);
    const [mood, wing, unity] = [[...f.mood], [...f.wing], c.parties[PS]!.unity];
    landslide(c);
    expect(f.mood.every((m, i) => m === Math.max(0, mood[i] - LANDSLIDE_HIT.faction))).toBe(true);
    expect(f.wing.every((m, i) => m === Math.max(0, wing[i] - LANDSLIDE_HIT.wing))).toBe(true);
    expect(c.parties[PS]!.unity).toBe(unity - LANDSLIDE_HIT.unity);
    expect(c.news.some((n) => n.key === 'news.landslide')).toBe(true);
  });
});

describe('the law and what the party owns', () => {
  it('looks more often at a party that owns more, up to a limit, and never at one that owns nothing', () => {
    const none = career();
    expect(probeChance(base, none.career!)).toBe(0);
    const some = career(); trade(base, some, 'hotel', 5);
    const lots = career(); trade(base, lots, 'hotel', 40);
    expect(probeChance(base, some.career!)).toBeGreaterThan(0);
    expect(probeChance(base, lots.career!)).toBeGreaterThan(probeChance(base, some.career!));
    expect(probeChance(base, lots.career!)).toBeLessThanOrEqual(PROBE.max);
  });

  it('takes part of the largest holding, some credibility, and tells the papers', () => {
    let probed = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const c = career(seed);
      trade(base, c, 'hotel', 30); trade(base, c, 'media', 3);
      const [assets, cred] = [c.career!.assets, c.career!.credibility];
      const rng = new Rng(seed);
      for (let w = 0; w < 60; w++) holdingsWeek(base, c, rng);
      if (c.news.some((n) => n.key === 'news.probe')) {
        probed++;
        expect(c.career!.assets).toBeLessThan(assets);
        expect(c.career!.credibility).toBeLessThan(cred);
      }
    }
    expect(probed).toBeGreaterThan(5);
  });
});

describe('a war chest', () => {
  it('is set aside out of reach, and taken back at a price', () => {
    const c = career();
    const funds = c.parties[PS]!.funds;
    expect(setAside(base, c, 3)).toBe(true);
    expect(c.career!.chest).toBe(3 * lot);
    expect(c.parties[PS]!.funds).toBe(funds - 3 * lot);
    expect(setAside(base, c, -1)).toBe(true);
    expect(c.career!.chest).toBe(2 * lot);
    expect(c.parties[PS]!.funds).toBe(funds - 3 * lot + Math.round(lot * (1 - CHEST_PENALTY)));
    expect(setAside(base, c, -5)).toBe(false);
    c.parties[PS]!.funds = 0;
    expect(setAside(base, c, 1)).toBe(false);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('comes out when the campaign begins, with the donors’ share', () => {
    const c = career();
    setAside(base, c, 4);
    const funds = c.parties[PS]!.funds;
    const sum = openChest(c);
    expect(sum).toBe(Math.round(4 * lot * (1 + CHEST_BONUS)));
    expect(c.parties[PS]!.funds).toBe(funds + sum);
    expect(c.career!.chest).toBeUndefined();
    const d = career();
    setAside(base, d, 2);
    const before = d.parties[PS]!.funds;
    beginCampaign(base, d);
    expect(d.parties[PS]!.funds).toBeGreaterThan(before + 2 * lot);
  });

  it('has its words in both languages', () => {
    for (const lang of ['en', 'ms'] as const) for (const k of ['party.chest', 'party.chest.desc', 'party.fatigue', 'party.probe', 'news.fatigue', 'news.landslide', 'news.chest.opened', 'news.probe']) expect(STRINGS[lang][k as StringKey], k).toBeTruthy();
  });
});
