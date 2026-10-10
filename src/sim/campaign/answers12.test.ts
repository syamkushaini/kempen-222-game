import { describe, expect, it } from 'vitest';
import { getWorld, worldOf } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { answerEvent, nextTerm, resumeTerm, skipAhead, startCareer } from './career';
import { factionsOf, deputyOf } from './factions';
import { endDay } from './formation';
import { closeNight, endWeek } from './turn';
import { govMoney } from './treasury';
import { COURT, REFERENDUM, callReferendum, canReferendum, courtWeek, isContested, referendumOdds, strikeChance } from './courts';
import { agenda, enact, forgetAct, resolveVote } from './govern';
import {
  BRIEF, COPY, copyPledges, isBrief, launchManifesto, manifestoCost, pledgeValue, policyEffect, setBrief, togglePledge, PLEDGES,
} from './policy';
import type { Campaign, PledgeId } from './types';
import { PLEDGE_IDS } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const BP = PARTY_IDS.indexOf('bp');
const world = getWorld('career')!;
const career = (seed = 5): Campaign => {
  const c = startCareer(world, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  c.parties[PS]!.funds = scaled(world, 5_000_000);
  return c;
};
const contested = PLEDGE_IDS.filter(isContested);

describe('a short promise', () => {
  it('costs and appeals half as much, and only the player’s manifesto can be shortened before it is launched', () => {
    const c = career();
    const k = c.career!;
    const id = k.manifesto[PS][0];
    expect(setBrief(c, id, true)).toBe(true);
    expect(isBrief(k, id)).toBe(true);
    expect(setBrief(c, id, true)).toBe(false);
    expect(manifestoCost([id], k.brief)).toBe(PLEDGES[id].cost * BRIEF.share);
    const nonMember = PLEDGE_IDS.find((x) => !k.manifesto[PS].includes(x))!;
    expect(setBrief(c, nonMember, true)).toBe(false);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    // Taking it out of the manifesto takes it out of the short ones too.
    togglePledge(c, id);
    expect(k.brief).toBeUndefined();
  });
  it('moves voters less than the full promise once the manifesto is out', () => {
    const effect = (brief: boolean) => {
      const c = career();
      const k = c.career!;
      k.manifesto[PS] = ['cashAid'];
      if (brief) setBrief(c, 'cashAid', true);
      k.launched = true;
      return policyEffect(c).map((row) => row[PS]);
    };
    const full = effect(false), short = effect(true);
    const gain = (v: number[]) => v.reduce((a, x) => a + x, 0);
    expect(gain(short)).toBeLessThan(gain(full));
  });
  it('does half as much when it is passed, and costs less credibility when it fails', () => {
    const run = (brief: boolean) => {
      const c = career();
      const k = c.career!;
      k.manifesto[PS] = ['cashAid'];
      k.promises = ['cashAid'];
      if (brief) setBrief(c, 'cashAid', true);
      const before = k.mood.map((r) => r[PS]);
      const fiscal = k.fiscal;
      enact(c, 'pledge:cashAid', PS);
      return { lift: k.mood.map((r, b) => r[PS] - before[b]).reduce((a, x) => a + x, 0), fiscal: k.fiscal - fiscal };
    };
    const full = run(false), short = run(true);
    expect(short.lift).toBeCloseTo(full.lift * BRIEF.share, 9);
    expect(short.fiscal).toBeCloseTo(full.fiscal * BRIEF.share, 9);
    expect(BRIEF.failed).toBeLessThan(2);
    expect(BRIEF.kept).toBeLessThan(3);
    void resolveVote;
  });
});

describe('a rival copying a promise', () => {
  it('copies popular promises from the player’s manifesto when it is launched, a few at most each', () => {
    const c = career();
    const k = c.career!;
    const popular = PLEDGE_IDS.filter((id) => pledgeValue(id) >= COPY.from && !PLEDGES[id].law).slice(0, 4);
    expect(popular.length).toBeGreaterThanOrEqual(2);
    k.manifesto[PS] = popular;
    for (let p = 0; p < k.manifesto.length; p++) if (p !== PS) k.manifesto[p] = [];
    launchManifesto(c);
    const copied = Object.entries(k.copied ?? {});
    expect(copied.length).toBeGreaterThan(0);
    for (const [p, ids] of copied) {
      expect(Number(p)).not.toBe(PS);
      expect(ids.length).toBeLessThanOrEqual(COPY.perParty);
      for (const id of ids) { expect(popular).toContain(id); expect(k.manifesto[Number(p)]).toContain(id); }
    }
    expect(c.news.some((n) => n.key === 'news.copied')).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
  it('is worth less to the player for each copier, and less believed coming from the copier', () => {
    const effect = (copiers: number) => {
      const c = career();
      const k = c.career!;
      k.manifesto[PS] = ['cashAid'];
      k.launched = true;
      if (copiers) k.copied = Object.fromEntries([BP, PARTY_IDS.indexOf('pt')].slice(0, copiers).map((p) => [p, ['cashAid' as PledgeId]]));
      return policyEffect(c).map((row) => row[PS]).reduce((a, x) => a + x, 0);
    };
    expect(effect(1)).toBeLessThan(effect(0));
    expect(effect(2)).toBeLessThan(effect(1));
  });
  it('copies nothing when nothing is popular or a rival has no room', () => {
    const c = career();
    const k = c.career!;
    k.manifesto[PS] = [];
    copyPledges(c, new Rng(1));
    expect(k.copied).toBeUndefined();
  });
});

describe('a referendum', () => {
  const asPm = (c: Campaign, id: PledgeId) => {
    const k = c.career!;
    k.government.pm = PS;
    k.limited = false;
    k.manifesto[PS] = [id];
    k.promises = [id];
    k.delivery = {};
    k.bills = [];
    // The government pays for a referendum from its own treasury.
    k.treasury = 10 * govMoney(world, REFERENDUM.money);
  };
  it('is for contested promises only, once a parliament, and costs money', () => {
    expect(contested.length).toBeGreaterThanOrEqual(3);
    const c = career();
    const id = contested[0];
    asPm(c, id);
    expect(agenda(c)).toContain(`pledge:${id}`);
    expect(canReferendum(world, c, id).ok).toBe(true);
    const tame = PLEDGE_IDS.find((x) => !isContested(x))!;
    asPm(c, tame);
    expect(canReferendum(world, c, tame)).toEqual({ ok: false, reason: 'tame' });
    asPm(c, id);
    // The government pays, from its treasury, and the party's own purse is not touched.
    c.career!.treasury = 0;
    expect(canReferendum(world, c, id)).toEqual({ ok: false, reason: 'funds' });
    c.career!.treasury = govMoney(world, 5_000_000);
    const treasury = c.career!.treasury;
    const funds = c.parties[PS]!.funds;
    expect(callReferendum(world, c, id)).toBe(true);
    expect(c.career!.treasury).toBe(treasury - govMoney(world, REFERENDUM.money));
    expect(c.parties[PS]!.funds).toBe(funds);
    expect(canReferendum(world, c, id).ok).toBe(false);
    expect(callReferendum(world, c, id)).toBe(false);
  });
  it('carries or loses, and a carried Act cannot be struck down', () => {
    const law = contested.find((id) => PLEDGES[id].law)!;
    expect(law).toBeTruthy();
    let won = 0, lost = 0;
    for (let seed = 1; seed <= 24; seed++) {
      const c = structuredClone(career());
      c.rng = seed * 7919;
      asPm(c, law);
      const cred = c.career!.credibility;
      callReferendum(world, c, law);
      const k = c.career!;
      if (k.delivery[law] === 'kept') {
        won++;
        expect(k.laws).toContain(law);
        expect(k.mandated).toContain(law);
        expect(k.credibility).toBe(Math.min(100, cred + REFERENDUM.credibility));
        expect(strikeChance(c, law)).toBe(0);
      } else {
        lost++;
        expect(k.delivery[law]).toBe('failed');
        expect(k.credibility).toBe(cred - REFERENDUM.failCredibility);
        expect(k.laws ?? []).not.toContain(law);
      }
    }
    expect(won).toBeGreaterThan(0);
    expect(lost).toBeGreaterThan(0);
  });
  it('is likelier the more the voters like the promise and trust the government', () => {
    const c = career();
    const id = contested[0];
    asPm(c, id);
    const base = referendumOdds(world, c, id);
    c.career!.credibility = 100;
    c.career!.government.trust = 100;
    expect(referendumOdds(world, c, id)).toBeGreaterThan(base);
  });
});

describe('the constitutional court', () => {
  it('looks only once a year, and rarely, and shaky Acts are likelier to go', () => {
    const c = career();
    const k = c.career!;
    k.laws = ['minWage'];
    expect(strikeChance(c, 'minWage')).toBe(COURT.sound);
    k.shaky = ['minWage'];
    expect(strikeChance(c, 'minWage')).toBe(COURT.shaky);
    k.mandated = ['minWage'];
    expect(strikeChance(c, 'minWage')).toBe(0);
    k.week = 10;
    k.mandated = undefined as never;
    delete k.mandated;
    courtWeek(c, new Rng(1));
    expect(k.laws).toEqual(['minWage']);
  });
  it('strikes a shaky Act down in the end: it leaves the books, may be promised again, and costs the government', () => {
    let struck = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const c = structuredClone(career());
      const k = c.career!;
      k.government.pm = PS;
      k.laws = ['minWage'];
      k.shaky = ['minWage'];
      k.delivery = { minWage: 'kept' };
      const [cred, trust] = [k.credibility, k.government.trust];
      const rng = new Rng(seed);
      k.week = COURT.every;
      courtWeek(c, rng);
      if (k.laws?.length) continue;
      struck++;
      expect(k.shaky).toBeUndefined();
      expect(k.delivery.minWage).toBeUndefined();
      expect(k.credibility).toBe(cred - COURT.credibility);
      expect(k.government.trust).toBe(trust - COURT.trust);
      expect(c.news.at(-1)).toMatchObject({ key: 'news.court.struck' });
    }
    expect(struck).toBeGreaterThan(0);
    expect(struck).toBeLessThan(40);
  });
  it('is told of an Act that is repealed', () => {
    const c = career();
    const k = c.career!;
    k.shaky = ['minWage'];
    k.mandated = ['minWage'];
    forgetAct(k, 'minWage');
    expect(k.shaky).toBeUndefined();
    expect(k.mandated).toBeUndefined();
  });
  it('marks an Act that scraped through the House as shaky, and one that did not as sound', () => {
    const run = (share: number) => {
      const c = career();
      c.career!.government.pm = PS;
      enact(c, 'pledge:minWage', PS, share);
      return c.career!.shaky ?? [];
    };
    expect(run(0.5)).toContain('minWage');
    expect(run(0.7)).toEqual([]);
  });
});

describe('what is built over a parliament goes into the next', () => {
  it('lists every field of that kind in the career’s next term (a regression for fields that were dropped)', async () => {
    const src = await import('node:fs').then((fs) => fs.readFileSync(new URL('./career.ts', import.meta.url), 'utf8'));
    for (const field of ['factions', 'fresh', 'tenure', 'trail', 'foreign', 'padded', 'safe', 'patronage', 'mandated', 'shaky']) {
      expect(src, field).toMatch(new RegExp(`k\\.${field}\\b`));
    }
  });
});

describe('a whole parliament', () => {
  it('leaves the next one with what the party built: the factions and their deputy, the member’s tenure, the trail and the rest', () => {
    const c = career();
    const k = c.career!;
    const deputy = { ...deputyOf(c) };
    const chief = [...factionsOf(c).chief];
    k.trail = 3; k.foreign = 2; k.padded = 100; k.patronage = 1; k.safe = {}; k.fresh = ['perak'];
    let w = world;
    for (let g = 0; g < 4000 && c.phase !== 'campaign'; g++) {
      if (c.phase === 'term') { factionsOf(c).mood = [95, 95, 95]; factionsOf(c).wing = [95, 95, 95]; c.parties[PS]!.unity = Math.max(c.parties[PS]!.unity, 70); k.trail = Math.max(k.trail ?? 0, 3); if (c.inbox.length) answerEvent(w, c, c.inbox.shift()!, 0); else skipAhead(w, c, 26); }
      else if (c.phase === 'formation') endDay(w, c);
      else if (c.phase === 'done') resumeTerm(c);
    }
    while (c.phase === 'campaign') endWeek(w, c);
    closeNight(w, c);
    for (let d = 0; d < 10 && c.phase === 'formation'; d++) endDay(w, c);
    expect(nextTerm(w, c)).toBe(true);
    w = worldOf(c)!;
    const now = c.career!;
    expect(now.factions!.chief).toEqual(chief);
    expect(now.factions!.deputy).toMatchObject({ name: deputy.name, faction: deputy.faction });
    expect(now.tenure).toBeTruthy();
    expect(Object.keys(now.tenure!).length).toBeGreaterThan(100);
    expect(now.trail).toBeGreaterThan(0);
    expect(now.foreign ?? 0).toBeGreaterThanOrEqual(0);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), w)).toBe(true);
  }, 90_000);
});

describe('strings', () => {
  it('exist in both languages', () => {
    const keys = ['manifesto.full', 'manifesto.brief', 'manifesto.briefDesc', 'manifesto.briefNote', 'manifesto.copied', 'referendum.title', 'referendum.desc', 'referendum.odds', 'referendum.call', 'referendum.no.phase', 'referendum.no.bill', 'referendum.no.tame', 'referendum.no.funds', 'referendum.no.again', 'news.copied', 'news.referendum.won', 'news.referendum.lost', 'news.court.struck'] as StringKey[];
    for (const key of keys) { expect(STRINGS.en[key], key).toBeTruthy(); expect(STRINGS.ms[key], key).toBeTruthy(); }
  });
});
