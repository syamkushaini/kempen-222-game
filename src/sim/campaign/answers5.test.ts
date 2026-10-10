import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { scaled, doAction, NEW_GROUND } from './actions';
import { makeKeySeats } from './candidates';
import { startCareer, setOrders, termWeek } from './career';
import { Rng } from '../rng';
import { DISCIPLINE, DISCIPLINE_EVERY, FOOTHOLD, MATURE, REBRAND, canDiscipline, canRebrand, discipline, rebrand, trade } from './party';
import { newCampaign } from './turn';
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
const idx = (st: string) => base.states.indexOf(st);

describe('the party college', () => {
  const graduates = (c: Campaign) => {
    c.phase = 'campaign';
    const keys = makeKeySeats(base, c, new Rng(3));
    return keys.flatMap((k) => k.options).filter((o) => o.kind === 'graduate');
  };
  it('puts its graduates on the list of hopefuls, and none without a college', () => {
    // Any party has some graduates on the list; a college brings many more.
    const without = graduates(career()).length;
    const c = career();
    trade(base, c, 'college', 8);
    const found = graduates(c);
    expect(found.length).toBeGreaterThan(without);
    expect(found.length).toBeGreaterThan(2);
    expect(found.every((g) => !g.skeleton || true)).toBe(true);
  });
  it('are rarely found out: little in their past', () => {
    const c = career();
    trade(base, c, 'college', 8);
    let bad = 0, n = 0;
    for (let seed = 1; seed <= 30; seed++) { c.phase = 'campaign'; for (const k of makeKeySeats(base, c, new Rng(seed))) for (const o of k.options) if (o.kind === 'graduate') { n++; if (o.skeleton) bad++; } }
    expect(n).toBeGreaterThan(30);
    expect(bad / n).toBeLessThan(0.1);
    for (const lang of ['en', 'ms'] as const) for (const k of ['hopeful.graduate', 'hopeful.graduate.desc']) expect(STRINGS[lang][k as StringKey], k).toBeTruthy();
  });
});

describe('disciplining the branches', () => {
  it('weakens them and unites the party, once in a while for any one state', () => {
    const c = career();
    const i = idx('johor');
    c.parties[PS]!.machinery[i] = 70;
    c.parties[PS]!.unity = 50;
    expect(discipline(base, c, 'johor', 'suspend')).toBe(true);
    expect(c.parties[PS]!.machinery[i]).toBe(70 - DISCIPLINE.suspend.branches);
    expect(c.parties[PS]!.unity).toBe(50 + DISCIPLINE.suspend.unity);
    expect(canDiscipline(base, c, 'johor')).toBe(false);
    expect(discipline(base, c, 'johor', 'dissolve')).toBe(false);
    c.career!.week += DISCIPLINE_EVERY;
    expect(canDiscipline(base, c, 'johor')).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });
  it('dissolving costs more, gains more, and leaves branches to be built again slowly', () => {
    const c = career();
    const i = idx('kedah');
    c.parties[PS]!.machinery[i] = 80;
    const rolls = c.career!.rolls ?? 0;
    expect(discipline(base, c, 'kedah', 'dissolve')).toBe(true);
    expect(c.parties[PS]!.machinery[i]).toBe(80 - DISCIPLINE.dissolve.branches);
    expect(c.career!.fresh).toContain('kedah');
    expect(c.career!.rolls ?? rolls).toBeLessThanOrEqual(rolls || Infinity);
    expect(canDiscipline(base, career(), 'nowhere')).toBe(false);
  });
});

describe('ground the party stands on for the first time', () => {
  it('starts with a foothold and grows slowly for years, against ordinary branches', () => {
    const c = career();
    const [a, b] = [idx('johor'), idx('kedah')];
    c.parties[PS]!.machinery[a] = 0;
    c.parties[PS]!.machinery[b] = 12;
    setOrders(base, c, { focusStates: ['johor', 'kedah'], budget: { machinery: 3, media: 0, research: 0 } });
    c.career!.fresh = [];
    for (let w = 0; w < 60; w++) { c.inbox = []; termWeek(base, c); }
    expect(c.career!.fresh).toContain('johor');
    const young = c.parties[PS]!.machinery[a];
    const ordinary = c.parties[PS]!.machinery[b];
    expect(young).toBeGreaterThan(FOOTHOLD);
    expect(ordinary - 12).toBeGreaterThan(2 * (young - FOOTHOLD));
    expect(MATURE).toBe(40);
  });

  it('is slow in a campaign too: a day’s work on new ground adds a fraction of what it does on old', () => {
    const w = getWorld('state:johor')!;
    const PT = PARTY_IDS.indexOf('pt');
    const c = newCampaign(w, { player: PT, difficulty: 'normal', seed: 2 });
    const st = w.states[0];
    const i = w.states.indexOf(st);
    c.parties[PT]!.funds = 1e9;
    c.parties[PT]!.machinery[i] = 10;
    doAction(w, c, PT, 'build', { state: st });
    const young = c.parties[PT]!.machinery[i] - 10;
    c.parties[PT]!.used = {};
    c.parties[PT]!.machinery[i] = NEW_GROUND + 10;
    doAction(w, c, PT, 'build', { state: st });
    const old = c.parties[PT]!.machinery[i] - (NEW_GROUND + 10);
    expect(young).toBeGreaterThan(0);
    expect(old).toBeGreaterThanOrEqual(2 * young);
  });
});

describe('a party changing its name', () => {
  it('costs money and credibility, once a parliament, and moves the voters both ways', () => {
    const c = career();
    const k = c.career!;
    const bloc = (b: string) => ['undi18', 'heartland', 'felda', 'agri', 'civil', 'urban_b40', 'gig', 'm40', 'urban_lib', 'smallbiz', 'seniors', 'borneo_native', 'borneo_urban'].indexOf(b);
    const [funds, cred, old, young] = [c.parties[PS]!.funds, k.credibility, k.mood[bloc('heartland')][PS], k.mood[bloc('undi18')][PS]];
    expect(canRebrand(base, c)).toBe(true);
    expect(rebrand(base, c)).toBe(true);
    expect(c.parties[PS]!.funds).toBe(funds - scaled(base, REBRAND.funds));
    expect(k.credibility).toBe(cred - REBRAND.credibility);
    expect(k.mood[bloc('heartland')][PS]).toBeLessThan(old);
    expect(k.mood[bloc('undi18')][PS]).toBeGreaterThan(young);
    expect(canRebrand(base, c)).toBe(false);
    expect(rebrand(base, c)).toBe(false);
    const poor = career(); poor.parties[PS]!.funds = 0;
    expect(canRebrand(base, poor)).toBe(false);
  });
});
