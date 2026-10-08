import { describe, expect, it } from 'vitest';
import { getWorld, worldOf } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { MERGED } from '../transfer';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { answerEvent, beginCampaign, nextTerm, resumeTerm, skipAhead, startCareer } from './career';
import { houseTally } from './contests';
import { factionsOf } from './factions';
import { endDay } from './formation';
import { MERGER, canMerge, foldMerged, merge, standMerged } from './merge';
import { pactSeats } from './diplomacy';
import { candidatesFor } from './office';
import { SHADOW_COST, canShadow, nameShadow, shadowWeek } from './shadow';
import { closeNight, endWeek } from './turn';
import { PORTFOLIO_IDS, type Campaign } from './types';
import { isValidCampaign } from './validate';

const [PS, BP, PT, GBK, GBS, LEGASI] = PARTY_IDS.map((_, i) => i);
void BP;
const base = getWorld('career')!;
const career = (player = PS, seed = 5): Campaign => {
  const c = startCareer(base, { player, difficulty: 'normal', seed });
  c.career!.obligations = [];
  c.parties[player]!.funds = scaled(base, 5_000_000);
  return c;
};

describe('taking in a small ally', () => {
  const ready = (ally = LEGASI) => { const c = career(); c.relations[PS][ally] = c.relations[ally][PS] = 80; return c; };

  it('is open to a small ally whose leader is warm, and not to a big party or a cold one', () => {
    const c = ready();
    expect(canMerge(base, c, LEGASI)).toEqual({ ok: true });
    c.relations[PS][LEGASI] = c.relations[LEGASI][PS] = 10;
    expect(canMerge(base, c, LEGASI)).toEqual({ ok: false, reason: 'warmth' });
    const big = ready(PT);
    expect(canMerge(base, big, PT)).toEqual({ ok: false, reason: 'size' });
    expect(canMerge(base, c, PS)).toEqual({ ok: false, reason: 'none' });
  });

  it('gives the party the ally’s seats in the House, its place in the government, and costs unity and credibility', () => {
    const c = ready();
    const k = c.career!;
    const before = houseTally(base, c);
    const [unity, cred] = [c.parties[PS]!.unity, k.credibility];
    expect(merge(base, c, LEGASI)).toBe(true);
    const after = houseTally(base, c);
    expect(after[PS]).toBe(before[PS] + before[LEGASI]);
    expect(after[LEGASI]).toBe(0);
    expect(k.government.partners).not.toContain(LEGASI);
    expect(c.parties[PS]!.unity).toBeLessThan(unity);
    expect(k.credibility).toBe(cred - MERGER.credibility);
    expect(k.merged).toEqual([LEGASI]);
    expect(canMerge(base, c, LEGASI)).toEqual({ ok: false, reason: 'already' });
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('keeps the ally off the ballot at the next election, its voters following the party that took it in', () => {
    const c = ready();
    merge(base, c, LEGASI);
    beginCampaign(base, c);
    const stood = Object.values(c.standDowns).filter((row) => row[LEGASI] === MERGED + PS);
    expect(stood.length).toBeGreaterThan(0);
    expect(pactSeats(c)).toBe(0);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
    expect(base.baseline.contesting.some((row, i) => row[LEGASI] && !c.standDowns[base.seats[i].id])).toBe(false);
  });

  it('folds what the ally won into the party’s result, for good', () => {
    const c = ready();
    merge(base, c, LEGASI);
    const results = { votes: base.seats.map((s) => [...s.last.votes]), turnout: base.seats.map((s) => s.last.turnout), basis: base.seats.map(() => null) };
    const folded = foldMerged(c, results);
    folded.votes.forEach((row, i) => { expect(row[LEGASI]).toBe(0); expect(row[PS]).toBe(results.votes[i][PS] + results.votes[i][LEGASI]); });
    void standMerged;
  });

  it('is carried through an election and into the next parliament, where the ally is gone', () => {
    const c = ready();
    merge(base, c, LEGASI);
    let world = base;
    for (let g = 0; g < 4000 && c.phase !== 'campaign'; g++) {
      if (c.phase === 'term') { factionsOf(c).mood = [95, 95, 95]; factionsOf(c).wing = [95, 95, 95]; c.parties[PS]!.unity = Math.max(c.parties[PS]!.unity, 70); if (c.inbox.length) answerEvent(world, c, c.inbox.shift()!, 0); else skipAhead(world, c, 26); }
      else if (c.phase === 'formation') endDay(world, c);
      else if (c.phase === 'done') resumeTerm(c);
    }
    while (c.phase === 'campaign') endWeek(world, c);
    closeNight(world, c);
    for (let d = 0; d < 10 && c.phase === 'formation'; d++) endDay(world, c);
    expect(nextTerm(world, c)).toBe(true);
    world = worldOf(c)!;
    expect(world.seats.every((s) => s.last.votes[LEGASI] === 0)).toBe(true);
    expect(c.career!.merged).toBeUndefined();
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    for (const lang of ['en', 'ms'] as const) for (const k of ['party.merge', 'party.merge.do', 'news.merger']) expect(STRINGS[lang][k as StringKey], k).toBeTruthy();
    void GBK; void GBS;
  }, 60_000);
});

describe('a shadow cabinet', () => {
  const opposition = () => career(PT);

  it('is for the opposition, costs a name each, and fills in as posts are named', () => {
    const gov = career(PS);
    expect(canShadow(base, gov)).toBe(false);
    const c = opposition();
    expect(canShadow(base, c)).toBe(true);
    const funds = c.parties[PT]!.funds;
    expect(nameShadow(base, c, 'finance')).toBe(true);
    expect(c.parties[PT]!.funds).toBe(funds - scaled(base, SHADOW_COST));
    const who = c.career!.shadow!.finance!;
    expect(who.skill).toBeGreaterThanOrEqual(2);
    expect(who.skill).toBeLessThanOrEqual(5);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('earns credibility at half a cabinet and again at a whole one, once', () => {
    const c = opposition();
    const k = c.career!;
    const cred = k.credibility;
    PORTFOLIO_IDS.slice(0, 3).forEach((id) => nameShadow(base, c, id));
    expect(k.credibility).toBe(cred);
    nameShadow(base, c, PORTFOLIO_IDS[3]);
    expect(k.credibility).toBe(cred + 2);
    PORTFOLIO_IDS.slice(4).forEach((id) => nameShadow(base, c, id));
    expect(k.credibility).toBe(cred + 5);
    nameShadow(base, c, PORTFOLIO_IDS[0]);
    expect(k.credibility).toBe(cred + 5);
  });

  it('gets the party talked of, a little more with a better cabinet', () => {
    const profile = (skillBoost: number) => {
      const c = opposition();
      for (const id of PORTFOLIO_IDS) nameShadow(base, c, id);
      for (const s of Object.values(c.career!.shadow!)) s.skill = skillBoost;
      c.career!.profile[PT] = 0;
      shadowWeek(c);
      return c.career!.profile[PT];
    };
    expect(profile(5)).toBeGreaterThan(profile(2));
    expect(profile(2)).toBeGreaterThan(0);
  });

  it('puts whoever shadowed a post first on the list for it, in government', () => {
    const c = career(PS);
    // someone who holds no post in the cabinet already
    const free = Array.from({ length: 20 }, (_, n) => n).find((n) => !c.career!.cabinet.some((m) => m.name === n))!;
    c.career!.shadow = { health: { name: free, skill: 5 } };
    const first = candidatesFor(c, 'health')[0];
    expect(first).toMatchObject({ name: free, skill: 5, trait: 'expert' });
    for (const lang of ['en', 'ms'] as const) for (const k of ['shadow.title', 'shadow.desc', 'news.shadow.named']) expect(STRINGS[lang][k as StringKey], k).toBeTruthy();
  });
});
