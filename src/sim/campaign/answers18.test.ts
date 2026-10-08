import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { TIES, tieBetween } from './cast';
import { CHAMBER, SPEAKER_NAMES, leanWord, rebelShare, speakerOf } from './chamber';
import { startCareer, beginCampaign } from './career';
import { houseTally } from './contests';
import { relation } from './diplomacy';
import { EARLY, agreeEarly, canAgreeEarly, dropEarly, earlyPacts } from './earlypact';
import { EVENTS } from './events';
import { GRAND, canUnite, formUnity, grandWeek, wouldJoin } from './grand';
import { prepWeeks, whipCount } from './govern';
import { KSU, draftingShift, ksuOf, ksuWeek, replaceKsu } from './ksu';
import { RIVAL_PRESSURE, canOfferDeputy, isRival, offerDeputy, plotPressure } from './plots';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const [PS, BP, PT, GBK, GBS, LEGASI] = PARTY_IDS.map((_, i) => i);
void GBS;
const world = getWorld('career')!;
const career = (seed = 5): Campaign => {
  const c = startCareer(world, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  c.parties[PS]!.funds = scaled(world, 5_000_000);
  return c;
};
const pm = (c: Campaign) => { c.career!.government.pm = PS; c.career!.limited = false; };

describe('ties between leaders', () => {
  it('are in the table, symmetric, and add to how two leaders feel, on top of what the game keeps', () => {
    expect(TIES.length).toBeGreaterThanOrEqual(5);
    expect(tieBetween(BP, PT)).toEqual(tieBetween(PT, BP));
    expect(tieBetween(PS, LEGASI)).toMatchObject({ kind: 'feud' });
    expect(tieBetween(PS, GBK)).toBeNull();
    const c = career();
    const raw = c.relations[BP][PT];
    expect(relation(c, BP, PT)).toBe(Math.min(100, raw + tieBetween(BP, PT)!.n));
    expect(relation(c, PS, LEGASI)).toBe(Math.max(-100, c.relations[PS][LEGASI] + tieBetween(PS, LEGASI)!.n));
    expect(relation(c, PS, GBK)).toBe(c.relations[PS][GBK]);
    for (const kind of ['kin', 'friends', 'feud']) for (const lang of ['en', 'ms'] as const) expect(STRINGS[lang][`tie.${kind}` as StringKey]).toBeTruthy();
  });
});

describe('seats agreed early', () => {
  const lastYear = (c: Campaign) => { c.career!.week = c.career!.length - 30; };
  it('can be agreed only in the last year, with a leader who is warm, up to three, and are remembered', () => {
    const c = career();
    c.relations[PS][BP] = c.relations[BP][PS] = 60;
    expect(canAgreeEarly(world, c, BP)).toEqual({ ok: false, reason: 'window' });
    lastYear(c);
    const check = canAgreeEarly(world, c, BP);
    if (!check.ok) { expect(['empty', 'none']).toContain(check.reason); return; }
    expect(agreeEarly(world, c, BP)).toBe(true);
    expect(earlyPacts(c)[BP].give.length + earlyPacts(c)[BP].get.length).toBeGreaterThanOrEqual(2);
    expect(canAgreeEarly(world, c, BP)).toEqual({ ok: false, reason: 'already' });
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
  it('are dropped at a price, and signed when the campaign opens, with goodwill', () => {
    const tryParty = (p: number) => {
      const c = career();
      c.relations[PS][p] = c.relations[p][PS] = 60;
      lastYear(c);
      return { c, ok: agreeEarly(world, c, p) };
    };
    const found = [BP, PT, GBK, LEGASI].map(tryParty).find((r) => r.ok);
    if (!found) return;
    const { c } = found;
    const p = Number(Object.keys(earlyPacts(c))[0]);
    // Dropping costs.
    const d = structuredClone(c);
    const rel = relation(d, PS, p), cred = d.career!.credibility;
    expect(dropEarly(d, p)).toBe(true);
    expect(relation(d, PS, p)).toBeLessThan(rel);
    expect(d.career!.credibility).toBe(cred - EARLY.credibility);
    expect(dropEarly(d, p)).toBe(false);
    // Signing at the start of the campaign.
    const rel0 = relation(c, PS, p);
    beginCampaign(world, c);
    expect(c.pacts.some((x) => (x.a === PS && x.b === p) || (x.a === p && x.b === PS))).toBe(true);
    expect(relation(c, PS, p)).toBeGreaterThan(rel0);
    expect(c.career!.early).toBeUndefined();
  });
});

describe('a government of national unity', () => {
  const shaky = () => { const c = career(); pm(c); c.career!.government.stability = 20; c.relations[PS][PT] = c.relations[PT][PS] = 10; return c; };
  it('can be asked for by a shaky government, once, from the parties that matter and do not hate it', () => {
    const calm = career(); pm(calm); calm.career!.government.stability = 80; calm.career!.government.minority = false;
    expect(canUnite(world, calm)).toEqual({ ok: false, reason: 'calm' });
    const c = shaky();
    const asked = wouldJoin(world, c);
    expect(asked.length).toBeGreaterThan(0);
    for (const p of asked) expect(c.career!.government.partners).not.toContain(p);
    const seats = c.career!.government.seats;
    expect(formUnity(world, c)).toBe(true);
    const g = c.career!.government;
    expect(g.stability).toBeGreaterThanOrEqual(GRAND.stability);
    expect(g.seats).toBeGreaterThan(seats);
    for (const p of asked) expect(g.partners).toContain(p);
    expect(c.career!.grand!.until).toBe(c.career!.week + GRAND.weeks);
    expect(canUnite(world, c)).toEqual({ ok: false, reason: 'once' });
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
  it('is paid for by the members at the polls, and comes apart at the end', () => {
    const c = shaky();
    formUnity(world, c);
    const k = c.career!;
    const members = k.grand!.members;
    const out = c.parties.map((_, p) => p).filter((p) => c.parties[p] && p !== PS && !k.government.partners.includes(p));
    const [m0, o0] = [k.mood[0][members[0]], out.length ? k.mood[0][out[0]] : 0];
    grandWeek(world, c);
    expect(k.mood[0][members[0]]).toBeLessThan(m0);
    if (out.length) expect(k.mood[0][out[0]]).toBeGreaterThan(o0);
    k.week = k.grand!.until;
    const rel = relation(c, PS, members[0]);
    grandWeek(world, c);
    expect(k.grand).toBeUndefined();
    for (const p of members) expect(k.government.partners).not.toContain(p);
    expect(relation(c, PS, members[0])).toBeLessThan(rel);
  });
});

describe('an ally that could lead', () => {
  it('pushes harder at the door while it is not deputy, and is calmed by being made so', () => {
    const c = career();
    pm(c);
    const g = c.career!.government;
    const tally = houseTally(world, c);
    const rival = g.partners.find((p) => (tally[p] ?? 0) >= 0.5 * (tally[PS] ?? 0)) ?? g.partners[0];
    // Force the condition if no partner is large enough.
    const t2 = [...tally]; t2[rival] = Math.max(t2[rival], t2[PS]);
    g.deals[rival] = { ...g.deals[rival]!, senior: null };
    expect(isRival(c, rival, t2)).toBe(true);
    const before = plotPressure(c, rival, t2);
    expect(before - plotPressure(c, rival)).toBeCloseTo(RIVAL_PRESSURE, 9);
    expect(canOfferDeputy(c, rival).ok).toBe(true);
    const rel = relation(c, PS, rival);
    expect(offerDeputy(c, rival)).toBe(true);
    expect(g.deals[rival]!.senior).toBe('dpm');
    expect(relation(c, PS, rival)).toBeGreaterThan(rel);
    expect(isRival(c, rival, t2)).toBe(false);
    expect(plotPressure(c, rival, t2)).toBeLessThan(before);
    expect(canOfferDeputy(c, rival)).toEqual({ ok: false, reason: 'already' });
  });
  it('takes the post from whoever had it, who does not forget', () => {
    const c = career();
    pm(c);
    const g = c.career!.government;
    const [a, b] = g.partners;
    g.deals[a] = { ...g.deals[a]!, senior: 'dpm' };
    g.deals[b] = { ...g.deals[b]!, senior: null };
    const rel = relation(c, PS, a);
    offerDeputy(c, b);
    expect(g.deals[a]!.senior).toBeNull();
    expect(relation(c, PS, a)).toBeLessThan(rel);
  });
});

describe('the House and its Speaker', () => {
  it('has a Speaker with a lean, the same every time, and rebels in a party that is not at peace', () => {
    const c = career();
    const sp = speakerOf(c);
    expect(SPEAKER_NAMES[sp.name]).toBeTruthy();
    expect(speakerOf(c)).toBe(sp);
    expect(['against', 'fair', 'for']).toContain(leanWord(sp.lean));
    expect(rebelShare(80)).toBe(0);
    expect(rebelShare(40)).toBeGreaterThan(0);
    expect(rebelShare(0)).toBe(CHAMBER.rebel);
    expect(rebelShare(20)).toBeGreaterThan(rebelShare(40));
  });
  it('counts a party’s rebels against its own bill', () => {
    const c = career();
    pm(c);
    const k = c.career!;
    c.parties[PS]!.unity = 90;
    const calm = whipCount(world, c, 'pledge:cashAid', PS);
    c.parties[PS]!.unity = 10;
    const uproar = whipCount(world, c, 'pledge:cashAid', PS);
    expect(uproar.yes).toBeLessThan(calm.yes);
    expect(uproar.no).toBeGreaterThan(calm.no);
    expect(uproar.yes + uproar.no + uproar.wavering).toBe(calm.yes + calm.no + calm.wavering);
    void k;
  });
  it('has words for a ruling in both languages', () => {
    const def = EVENTS.speakerRuling;
    for (const text of [EVENTS_EN.speakerRuling, EVENTS_MS.speakerRuling]) {
      expect(text.options).toHaveLength(def.choices.length);
      expect(text.results).toHaveLength(def.choices.length);
      def.choices.forEach((choice, i) => expect(Array.isArray(text.results[i])).toBe(!!choice.gamble));
    }
  });
});

describe('the head of the civil service', () => {
  it('is a person with an outlook, who shapes how long a bill takes to draft', () => {
    const c = career();
    pm(c);
    const h = ksuOf(c);
    expect(['reformist', 'cautious', 'political']).toContain(h.outlook);
    expect(ksuOf(c)).toBe(h);
    expect(draftingShift(false, 4, 'cautious')).toBe(KSU.slow);
    expect(draftingShift(false, 1, 'cautious')).toBe(0);
    expect(draftingShift(true, 0, 'reformist')).toBe(-KSU.quick);
    expect(draftingShift(true, 4, 'political')).toBe(0);
    const k = c.career!;
    const weeks = (outlook: 'reformist' | 'cautious' | 'political') => { k.ksu = { name: 0, outlook, trust: 50 }; return prepWeeks(k, 'pledge:graftCommission'); };
    expect(weeks('reformist')).toBeLessThanOrEqual(weeks('political'));
    expect(weeks('cautious')).toBeGreaterThanOrEqual(weeks('political'));
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
  it('leaks if they do not trust the government, and a new one starts afresh at some cost', () => {
    const c = career();
    pm(c);
    ksuOf(c).trust = 5;
    let leaks = 0;
    const rng = new Rng(2);
    for (let w = 0; w < 400; w++) { const n = c.news.length; ksuWeek(c, rng); if (c.news.length > n && c.news.at(-1)!.key === 'news.ksu.leak') leaks++; }
    expect(leaks).toBeGreaterThan(1);
    const old = { ...ksuOf(c) };
    const stab = c.career!.government.stability;
    replaceKsu(c);
    const now = ksuOf(c);
    expect(now.outlook).not.toBe(old.outlook);
    expect(now.trust).toBe(KSU.replaced);
    expect(c.career!.government.stability).toBe(stab + KSU.replaceStability);
  });
  it('writes a memo every year, with words in both languages', () => {
    const def = EVENTS.ksuMemo;
    expect(def.yearly).toBe(35);
    for (const text of [EVENTS_EN.ksuMemo, EVENTS_MS.ksuMemo]) {
      expect(text.options).toHaveLength(def.choices.length);
      expect(text.results).toHaveLength(def.choices.length);
    }
  });
});

describe('strings', () => {
  it('exist in both languages', () => {
    const keys = ['chamber.title', 'chamber.speaker', 'chamber.rebels', 'chamber.calm', 'ksu.title', 'ksu.trust', 'grand.title', 'grand.desc', 'grand.form', 'grand.running', 'rival.badge', 'rival.deputy', 'early.title', 'early.desc', 'early.agree', 'early.drop', 'news.grand.formed', 'news.grand.ended', 'news.early.agreed', 'news.early.dropped', 'news.ksu.leak', 'news.deputy.offered'] as StringKey[];
    for (const key of keys) { expect(STRINGS.en[key], key).toBeTruthy(); expect(STRINGS.ms[key], key).toBeTruthy(); }
  });
});
