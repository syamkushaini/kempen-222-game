import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { answerEvent, canDissolve, dissolve, nextTerm, resumeTerm, skipAhead, startCareer } from './career';
import { factionsOf } from './factions';
import { endDay } from './formation';
import { closeNight, endWeek } from './turn';
import { worldOf } from '../../data/world';
import { statesHeld } from './contests';
import { EVENTS, gambleChance, resolveEvent } from './events';
import { LEVER_STRAIN, canPull, leverStrain, pullLever } from './govern';
import { aidSector, canAid, SECTOR, SECTORS, SECTOR_IDS, sectorsOf, sectorsWeek } from './sectors';
import { CASE, CASE_BASE, caseChance, fightOdds, trialWeek } from './trial';
import { BACKSTORY_IDS } from './teamTypes';
import type { Campaign } from './types';
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
const pm = (c: Campaign) => { c.career!.government.pm = PS; c.career!.limited = false; };

describe('leaning on the same institution again', () => {
  it('costs more trust each time, and makes the agency’s attack likelier to backfire', () => {
    const c = career();
    pm(c);
    const k = c.career!;
    const costs: number[] = [];
    for (let n = 0; n < 4; n++) {
      k.levers = k.levers.map(() => 0);
      k.government.trust = 80;
      expect(leverStrain(k, 'police')).toBe(n);
      expect(canPull(c, 'police')).toBe(true);
      pullLever(world, c, 'police');
      costs.push(80 - k.government.trust);
    }
    expect(costs[1]).toBe(costs[0] + LEVER_STRAIN.trust);
    expect(costs[3]).toBe(costs[0] + 3 * LEVER_STRAIN.trust);
    expect(k.leverUses!.police).toBe(4);
    expect(leverStrain(k, 'police')).toBeLessThanOrEqual(LEVER_STRAIN.max);
    expect(leverStrain(k, 'agency')).toBe(0);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
  it('backfires more often the more it has been done', () => {
    const backfires = (uses: number) => {
      let n = 0;
      for (let seed = 1; seed <= 60; seed++) {
        const c = structuredClone(career());
        pm(c);
        c.rng = seed * 4099;
        c.career!.leverUses = { agency: uses };
        pullLever(world, c, 'agency');
        if (c.news.at(-1)!.key.endsWith('backfire')) n++;
      }
      return n;
    };
    expect(backfires(4)).toBeGreaterThan(backfires(0));
  });
});

describe('the sectors of the economy', () => {
  it('start in the middle and wander, with shocks now and then, and stay between nothing and a hundred', () => {
    const c = career();
    expect(sectorsOf(c.career!)).toEqual({ oil: 50, electronics: 50, tourism: 50, farming: 50 });
    const rng = new Rng(3);
    let shocks = 0;
    for (let w = 0; w < 2000; w++) {
      const before = c.news.length;
      sectorsWeek(c, rng);
      if (c.news.length > before && c.news.at(-1)!.key.startsWith('news.sector.')) shocks++;
      for (const id of SECTOR_IDS) { expect(c.career!.sectors![id]).toBeGreaterThanOrEqual(0); expect(c.career!.sectors![id]).toBeLessThanOrEqual(100); }
    }
    expect(shocks).toBeGreaterThan(5);
    expect(shocks).toBeLessThan(40);
  });
  it('are credited to the government among those who live by each, and move growth', () => {
    const run = (level: number) => {
      const c = career();
      pm(c);
      c.career!.sectors = { oil: level, electronics: 50, tourism: 50, farming: 50 };
      const g = c.career!.economy.growth;
      const mood = c.career!.mood[BLOCS.indexOf('borneo_native')][PS];
      sectorsWeek(c, { next: () => 0.99, int: () => 0, normal: () => 0 } as unknown as Rng);
      return { growth: c.career!.economy.growth - g, mood: c.career!.mood[BLOCS.indexOf('borneo_native')][PS] - mood };
    };
    const good = run(100), bad = run(0);
    expect(good.mood).toBeGreaterThan(0);
    expect(bad.mood).toBeLessThan(0);
    expect(good.growth).toBeGreaterThan(bad.growth);
    expect(SECTORS.oil.blocs).toContain('borneo_native');
  });
  it('can be helped by the head of government, once in a while, at the treasury’s cost', () => {
    const c = career();
    pm(c);
    const k = c.career!;
    k.sectors = { oil: 20, electronics: 50, tourism: 50, farming: 50 };
    const fiscal = k.fiscal;
    expect(canAid(world, c, 'oil').ok).toBe(true);
    expect(aidSector(world, c, 'oil')).toBe(true);
    expect(k.sectors.oil).toBe(20 + SECTOR.aid);
    expect(k.fiscal).toBe(fiscal + SECTOR.fiscal);
    expect(canAid(world, c, 'oil')).toEqual({ ok: false, reason: 'wait' });
    expect(canAid(world, c, 'farming').ok).toBe(true);
    c.career!.government.pm = BP;
    expect(canAid(world, c, 'farming')).toEqual({ ok: false, reason: 'phase' });
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
  it('have words in both languages', () => {
    for (const id of SECTOR_IDS) {
      for (const key of [`sector.${id}`, `news.sector.${id}.up`, `news.sector.${id}.down`, `news.sector.${id}.aid`] as StringKey[]) {
        expect(STRINGS.en[key], key).toBeTruthy();
        expect(STRINGS.ms[key], key).toBeTruthy();
      }
    }
  });
});
const BLOCS = ['undi18', 'heartland', 'felda', 'agri', 'civil', 'urban_b40', 'gig', 'm40', 'urban_lib', 'smallbiz', 'seniors', 'borneo_native', 'borneo_urban'];

describe('a case in court', () => {
  it('is likelier for a leader whose life was lived near the law, and for a party that has bought members or taken foreign money', () => {
    const c = career();
    const chance = (backstory: (typeof BACKSTORY_IDS)[number]) => { c.team.leader.backstory = backstory; return caseChance(c); };
    expect(chance('fixer')).toBeGreaterThan(chance('technocrat'));
    expect(chance('tycoon')).toBeGreaterThan(chance('organiser'));
    for (const id of BACKSTORY_IDS) expect(chance(id)).toBe(CASE_BASE[id]);
    c.team.leader.backstory = 'organiser';
    const base = caseChance(c);
    c.career!.trail = 5;
    expect(caseChance(c)).toBeCloseTo(base + 5 * CASE.perTrail, 9);
    c.career!.foreign = 1;
    c.career!.padded = 10;
    expect(caseChance(c)).toBeGreaterThan(base + 5 * CASE.perTrail);
    c.career!.trail = 100;
    expect(caseChance(c)).toBe(CASE.max);
  });
  it('is brought at most once in a parliament, and not in the first year', () => {
    let cases = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const c = structuredClone(career());
      c.seed = seed * 7919;
      c.team.leader.backstory = 'fixer';
      c.career!.trail = 8;
      c.career!.week = 26;
      trialWeek(c);
      expect(c.inbox.some((s) => s.event === 'courtCase')).toBe(false);
      for (let y = 1; y <= 5; y++) { c.career!.week = 52 * y; c.inbox = []; trialWeek(c); if (c.inbox.some((s) => s.event === 'courtCase')) cases++; }
      expect(c.career!.flags.filter((f) => f.startsWith('case')).length).toBeLessThanOrEqual(1);
    }
    expect(cases).toBeGreaterThan(5);
    expect(cases).toBeLessThanOrEqual(20);
  });
  it('is answered by fighting, settling, or leaving, and a case lost ends the career', () => {
    const answer = (choice: number, seed = 1) => {
      const c = structuredClone(career());
      c.rng = seed * 13007;
      const scene = { id: 1, kind: 'event' as const, from: null, event: 'courtCase' };
      c.career!.credibility = 60;
      const funds = c.parties[PS]!.funds;
      resolveEvent(world, c, scene, choice);
      return { c, funds };
    };
    const left = answer(2);
    expect(left.c.career!.ending?.kind).toBe('retired');
    const settled = answer(1);
    expect(settled.c.career!.ending).toBeNull();
    expect(settled.c.career!.credibility).toBe(52);
    expect(settled.c.parties[PS]!.funds).toBe(settled.funds - scaled(world, 200_000));
    let won = 0, lost = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const r = answer(0, seed);
      if (r.c.career!.ending?.kind === 'ousted') lost++; else { won++; expect(r.c.career!.credibility).toBe(64); }
    }
    expect(won).toBeGreaterThan(5);
    expect(lost).toBeGreaterThan(5);
    expect(gambleChance(career(), 'case')).toBe(fightOdds(career()));
  });
  it('has words for every option in both languages', () => {
    const def = EVENTS.courtCase;
    for (const text of [EVENTS_EN.courtCase, EVENTS_MS.courtCase]) {
      expect(text.options).toHaveLength(def.choices.length);
      expect(text.results).toHaveLength(def.choices.length);
      def.choices.forEach((choice, i) => expect(Array.isArray(text.results[i])).toBe(!!choice.gamble));
    }
  });
});

describe('the states going to the polls with the country', () => {
  it('can be asked for at dissolution, and is remembered', () => {
    const c = career();
    pm(c);
    const k = c.career!;
    k.week = 200;
    k.government.stability = 80;
    k.states = { perak: PS, selangor: PS, johor: BP };
    expect(statesHeld(c, PS)).toBe(2);
    expect(canDissolve(c)).toBe(true);
    // The Palace may say no; try until it does not.
    let ok = false;
    for (let seed = 1; seed <= 30 && !ok; seed++) { c.rng = seed * 91; k.palaceNo = undefined; ok = dissolve(world, c, true); }
    expect(ok).toBe(true);
    expect(c.career!.together).toBe(true);
    expect(c.news.some((n) => n.key === 'news.dissolve.together')).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
  it('is not remembered if not asked for, or if the party governs no state', () => {
    const c = career();
    pm(c);
    const k = c.career!;
    k.week = 200;
    k.states = { johor: BP };
    let ok = false;
    for (let seed = 1; seed <= 30 && !ok; seed++) { c.rng = seed * 91; k.palaceNo = undefined; ok = dissolve(world, c, true); }
    expect(ok).toBe(true);
    expect(c.career!.together).toBeUndefined();
  });
});

describe('the states decided with the country', () => {
  it('are settled by how the country voted in them when the term ends', () => {
    const c = career();
    const k = c.career!;
    k.states = { perak: PS, selangor: PS, johor: BP };
    k.together = true;
    let w = world;
    for (let g = 0; g < 4000 && c.phase !== 'campaign'; g++) {
      if (c.phase === 'term') { factionsOf(c).mood = [95, 95, 95]; factionsOf(c).wing = [95, 95, 95]; c.parties[PS]!.unity = Math.max(c.parties[PS]!.unity, 70); if (c.inbox.length) answerEvent(w, c, c.inbox.shift()!, 0); else skipAhead(w, c, 26); }
      else if (c.phase === 'formation') endDay(w, c);
      else if (c.phase === 'done') resumeTerm(c);
    }
    while (c.phase === 'campaign') endWeek(w, c);
    closeNight(w, c);
    for (let d = 0; d < 10 && c.phase === 'formation'; d++) endDay(w, c);
    expect(nextTerm(w, c)).toBe(true);
    w = worldOf(c)!;
    const states = c.career!.states;
    // Each of the party’s states was settled: someone governs it, and the news says who.
    expect(states.perak).toBeDefined();
    expect(states.selangor).toBeDefined();
    expect(c.career!.together).toBeUndefined();
    expect(c.news.some((n) => n.key === 'news.states.won' || n.key === 'news.states.held')).toBe(true);
  }, 90_000);
});

describe('strings', () => {
  it('exist in both languages', () => {
    for (const key of ['sectors.title', 'sectors.desc', 'sectors.lives', 'sectors.level', 'sectors.aid', 'house.lever.strain', 'orders.dissolve.together', 'news.dissolve.together'] as StringKey[]) {
      expect(STRINGS.en[key], key).toBeTruthy();
      expect(STRINGS.ms[key], key).toBeTruthy();
    }
  });
});
