import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { START_DEFENCE } from './defence';
import {
  DOCTRINES, GRADES, METERS, PEERS, REPORT_KEEP, STRONG_AT, TITLE_WEEKS, WEAK_AT, adoptDoctrine, doctrineHeld, gradeOf, peerScore, rankAmong, reportScores, storyWeek, wellness,
} from './doctrines';
import { playable } from './field';
import { capitalOf, capitalUsed, setStance, stanceOf, STANCE_IDS } from './stances';
import { isValidCampaign } from './validate';
import type { Campaign } from './types';

const world = getWorld('career')!;
const career = (): Campaign => startCareer(world, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 5 });
/** Runs the story week by week, as the term does, and returns the campaign. */
const weeks = (c: Campaign, n: number) => { for (let i = 0; i < n; i++) { c.career!.week++; storyWeek(c); } };

describe('doctrines', () => {
  it('are five named ways of governing, each within what a leader always has, and one is a country’s only', () => {
    expect(DOCTRINES).toHaveLength(5);
    for (const d of DOCTRINES) {
      expect((Object.values(d.notches) as number[]).reduce((a, n) => a + Math.abs(n), 0), d.id).toBeLessThanOrEqual(5);
      for (const lang of ['en', 'ms'] as const) for (const suffix of ['', '.desc']) expect(STRINGS[lang][`doctrine.${d.id}${suffix}` as StringKey], `${lang} ${d.id}`).toBeTruthy();
    }
    expect(DOCTRINES.filter((d) => d.federal).map((d) => d.id)).toEqual(['securityFirst']);
  });

  it('set every slider in one click, clearing what it does not name, and are recognised while held', () => {
    const c = career();
    setStance(c, 'cohesion', 2); setStance(c, 'readiness', -2);
    expect(adoptDoctrine(c, 'techTiger')).toBe(true);
    const k = c.career!;
    expect(stanceOf(k, 'tech')).toBe(2);
    expect(stanceOf(k, 'law')).toBe(1);
    expect(stanceOf(k, 'environment')).toBe(-1);
    expect(stanceOf(k, 'cohesion')).toBe(0);
    expect(stanceOf(k, 'readiness')).toBe(0);
    expect(doctrineHeld(c)?.id).toBe('techTiger');
    expect(capitalUsed(k)).toBeLessThanOrEqual(capitalOf(k));
    setStance(c, 'law', 2);
    expect(doctrineHeld(c)).toBeUndefined();
    expect(adoptDoctrine(c, 'nonsense')).toBe(false);
    for (const d of DOCTRINES) { k.credibility = 0; expect(adoptDoctrine(c, d.id), d.id).toBe(true); expect(doctrineHeld(c)?.id, d.id).toBe(d.id); }
    const opp = career(); opp.career!.government.pm = (PARTY_IDS.indexOf('bp'));
    expect(adoptDoctrine(opp, 'techTiger')).toBe(false);
  });

  it('keep the armed forces to a country', () => {
    const w = getWorld('career:perak')!;
    const state = playable(w).map((player) => startCareer(w, { player, difficulty: 'normal', seed: 5 })).find((x) => x.career!.government.pm === x.player)!;
    expect(adoptDoctrine(state, 'securityFirst')).toBe(false);
    expect(adoptDoctrine(state, 'techTiger')).toBe(true);
    expect(STANCE_IDS.filter((id) => stanceOf(state.career!, id) !== 0)).toEqual(['tech', 'environment', 'law'].sort((a, b) => STANCE_IDS.indexOf(a as never) - STANCE_IDS.indexOf(b as never)));
  });

  it('earn a title after a year, once, with credibility and a headline, and lose the count when changed', () => {
    const c = career();
    const k = c.career!;
    adoptDoctrine(c, 'cleanGovernment');
    const cred = k.credibility;
    weeks(c, TITLE_WEEKS - 2);
    expect(k.titles).toBeUndefined();
    weeks(c, 4);
    expect(k.titles).toEqual(['cleanGovernment']);
    expect(k.credibility).toBeGreaterThan(cred);
    expect(c.news.filter((n) => n.key === 'news.title')).toHaveLength(1);
    weeks(c, 60);
    expect(k.titles).toEqual(['cleanGovernment']);
    // Changing a slider ends the count.
    adoptDoctrine(c, 'greenReformer');
    weeks(c, 10);
    setStance(c, 'law', 2);
    weeks(c, 1);
    expect(k.doctrine).toBeUndefined();
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
});

describe('tipping points', () => {
  it('are a moment the first time a meter is strong or weak, once, with a headline and a little gained or lost', () => {
    const c = career();
    const k = c.career!;
    const cred = k.credibility;
    k.pestel = { cohesion: 75, tech: 50, environment: 20, law: 55 };
    weeks(c, 1);
    expect(k.milestones).toEqual(expect.arrayContaining(['cohesion:good', 'environment:bad']));
    expect(c.news.some((n) => n.key === 'news.milestone.cohesion.good' && n.tone === 'good')).toBe(true);
    expect(c.news.some((n) => n.key === 'news.milestone.environment.bad' && n.tone === 'bad')).toBe(true);
    const count = c.news.length, stab = k.government.stability;
    weeks(c, 5);
    expect(c.news.length).toBe(count);
    expect(k.government.stability).toBe(stab);
    expect(k.credibility).toBe(cred + 2 - 1);
  });

  it('read the armed forces’ say the other way about: a great say is a bad moment, a small one a good one', () => {
    const c = career();
    const k = c.career!;
    k.defence = { ...START_DEFENCE, influence: 80 };
    expect(wellness(k, 'influence')).toBe(20);
    weeks(c, 1);
    expect(k.milestones).toContain('influence:bad');
    k.defence = { ...START_DEFENCE, influence: 10 };
    weeks(c, 1);
    expect(k.milestones).toContain('influence:good');
    for (const lang of ['en', 'ms'] as const) for (const m of METERS) for (const kind of ['good', 'bad']) expect(STRINGS[lang][`news.milestone.${m}.${kind}` as StringKey], `${lang} ${m} ${kind}`).toBeTruthy();
    expect(STRONG_AT).toBe(70); expect(WEAK_AT).toBe(30);
  });

  it('leave the armed forces out of a state', () => {
    const w = getWorld('career:perak')!;
    const state = playable(w).map((player) => startCareer(w, { player, difficulty: 'normal', seed: 5 })).find((x) => x.career!.government.pm === x.player)!;
    weeks(state, 1);
    expect((state.career!.milestones ?? []).some((m) => m.startsWith('readiness') || m.startsWith('influence'))).toBe(false);
    expect(Object.keys(reportScores(state))).not.toContain('readiness');
  });
});

describe('the annual report', () => {
  it('grades the country each year, ranks it against five invented peers, and keeps the last few', () => {
    const c = career();
    const k = c.career!;
    // A term opens in its first week, so the year ends 51 weeks on.
    weeks(c, 50);
    expect(k.scorecards).toBeUndefined();
    weeks(c, 1);
    expect(k.scorecards).toHaveLength(1);
    const card = k.scorecards![0];
    expect(card.year).toBe(1);
    expect(Object.keys(card.scores).sort()).toEqual([...METERS, 'education', 'health', 'standing'].sort());
    expect(card.rank).toBeGreaterThanOrEqual(1);
    expect(card.rank).toBeLessThanOrEqual(PEERS.length + 1);
    expect(c.news.some((n) => n.key === 'news.report' && n.vars?.of === 6)).toBe(true);
    // The term is 252 weeks, so four full years are reported; and no more are kept than the limit.
    weeks(c, k.length - k.week);
    expect(k.scorecards!.map((r) => r.year)).toEqual([1, 2, 3, 4]);
    expect(k.scorecards!.length).toBeLessThanOrEqual(REPORT_KEEP);
    // The same year is never written twice.
    const n = k.scorecards!.length;
    storyWeek(c);
    expect(k.scorecards!.length).toBe(n);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });

  it('gives letters by score, peers that are the same every time, and a rank that follows the score', () => {
    expect([90, 75, 60, 45, 10].map(gradeOf)).toEqual([...GRADES]);
    for (const p of PEERS) expect(peerScore(p.id, p.base, p.trend, 1, 2)).toBe(peerScore(p.id, p.base, p.trend, 1, 2));
    expect(rankAmong(99, 1, 1)).toBe(1);
    expect(rankAmong(0, 1, 1)).toBe(PEERS.length + 1);
    expect(rankAmong(60, 1, 3)).toBeLessThanOrEqual(rankAmong(40, 1, 3));
    for (const lang of ['en', 'ms'] as const) {
      for (const key of ['doctrines.title', 'doctrines.desc', 'doctrines.adopt', 'doctrines.held', 'news.title', 'news.report', 'report.title', 'report.desc', 'report.none', 'report.year', 'report.overall', 'report.rank', 'report.peers', 'report.milestones', 'report.tip', 'report.you']) expect(STRINGS[lang][key as StringKey], `${lang} ${key}`).toBeTruthy();
      for (const p of PEERS) expect(STRINGS[lang][`report.peer.${p.id}` as StringKey], `${lang} ${p.id}`).toBeTruthy();
    }
  });
});
