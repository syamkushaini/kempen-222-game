import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { MINISTER_NAMES, STATE_PORTFOLIOS, cleanLabel, fillCabinet, ministerName, portfoliosOf, renameMinister } from './office';
import { Rng } from '../rng';
import { PORTFOLIO_IDS } from './types';
import { SHADOW_COST } from './shadow';
import { isValidCampaign } from './validate';
import { playable } from './field';

const PS = PARTY_IDS.indexOf('ps');
const world = getWorld('career')!;

describe('a cabinet like Malaysia’s', () => {
  it('has twenty-five federal portfolios and ten for a state, each named in both languages', () => {
    expect(PORTFOLIO_IDS).toHaveLength(25);
    expect(portfoliosOf('career')).toHaveLength(25);
    expect(portfoliosOf('career:perak')).toEqual(STATE_PORTFOLIOS);
    expect(STATE_PORTFOLIOS).toHaveLength(10);
    for (const id of PORTFOLIO_IDS) for (const lang of ['en', 'ms'] as const) expect(STRINGS[lang][`portfolio.${id}` as StringKey], `${lang} ${id}`).toBeTruthy();
    // The portfolios that read differently in a state have words of their own.
    for (const id of ['environment', 'tourism'] as const) for (const lang of ['en', 'ms'] as const) expect(STRINGS[lang][`portfolio.${id}.assembly` as StringKey], `${lang} ${id}`).toBeTruthy();
    // Religious affairs is named plainly, with no one faith in the name.
    expect(`${STRINGS.en['portfolio.religion']} ${STRINGS.ms['portfolio.religion']}`).not.toMatch(/islam/i);
  });

  it('is filled in a federal career, with a different name for each minister', () => {
    const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
    const cabinet = c.career!.cabinet;
    expect(cabinet.map((m) => m.portfolio).sort()).toEqual([...PORTFOLIO_IDS].sort());
    expect(new Set(cabinet.map((m) => m.name)).size).toBe(25);
    expect(MINISTER_NAMES.length).toBeGreaterThanOrEqual(40);
  });

  it('is a council of ten in a state career', () => {
    const w = getWorld('career:perak')!;
    const c = startCareer(w, { player: playable(w)[0], difficulty: 'normal', seed: 5 });
    expect(c.career!.cabinet.map((m) => m.portfolio).sort()).toEqual([...STATE_PORTFOLIOS].sort());
  });

  it('fills the posts missing from a game saved with eight, once, with the head of the government’s party', () => {
    const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
    const k = c.career!;
    const old = new Set(['finance', 'home', 'economy', 'education', 'health', 'rural', 'works', 'defence']);
    k.cabinet = k.cabinet.filter((m) => old.has(m.portfolio));
    k.appointments = [];
    expect(k.cabinet).toHaveLength(8);
    fillCabinet(c, new Rng(1));
    expect(k.cabinet).toHaveLength(25);
    expect(new Set(k.cabinet.map((m) => m.name)).size).toBe(25);
    const before = JSON.stringify(k.cabinet);
    fillCabinet(c, new Rng(2));
    expect(JSON.stringify(k.cabinet)).toBe(before);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
});

describe('naming a minister', () => {
  it('lets the player give a name of their own, and take it back for the invented one', () => {
    const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
    const m = c.career!.cabinet.find((x) => x.portfolio === 'digital')!;
    const invented = ministerName(m);
    expect(invented).toBe(MINISTER_NAMES[m.name]);
    expect(renameMinister(c, 'digital', '  Dr.   Aminah   <script>  ')).toBe(true);
    expect(m.label).toBe('Dr. Aminah script');
    expect(ministerName(m)).toBe('Dr. Aminah script');
    expect(renameMinister(c, 'digital', '   ')).toBe(true);
    expect(m.label).toBeUndefined();
    expect(ministerName(m)).toBe(invented);
    expect(cleanLabel('x'.repeat(60))).toHaveLength(24);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
});

describe('the cost of a shadow minister', () => {
  it('is a month of a minister’s pay, about RM29,000', () => {
    expect(SHADOW_COST).toBe(29_000);
  });
});
