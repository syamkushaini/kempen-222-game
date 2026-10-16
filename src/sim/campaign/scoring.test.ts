import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { emptyProfile, hang, legacyEntry, noteAchieved, parseProfile } from '../../state/profile';
import { newGame } from '../../state/game';
import { PARTY_IDS } from '../types';
import { ACHIEVEMENT_IDS, BOW_OUT_SCORE } from './achievements';
import { startCareer } from './career';
import { LEGACY_BONUS, legacyOf, endCareer } from './legacy';
import { ACHIEVEMENT_POINTS, ALL_POINTS, SCORE_MAX, pointsOf } from './scoring';
import { LEGACY_IDS } from './types';

const world = getWorld('career')!;
const career = () => startCareer(world, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 5 });

describe('points for achievements', () => {
  it('has a worth for every achievement, in the four sizes the scheme uses', () => {
    for (const id of ACHIEVEMENT_IDS) expect(ACHIEVEMENT_POINTS[id], id).toBeGreaterThan(0);
    expect(Object.keys(ACHIEVEMENT_POINTS).sort()).toEqual([...ACHIEVEMENT_IDS].sort());
    expect(ALL_POINTS).toBe(2230);
    expect(pointsOf(['firstWin', 'statesman'])).toBe(110);
    expect(pointsOf([])).toBe(0);
    // The rare ones are worth the most.
    expect(Math.max(...ACHIEVEMENT_IDS.map((id) => ACHIEVEMENT_POINTS[id]))).toBe(100);
    expect(ACHIEVEMENT_POINTS.knives).toBeLessThan(ACHIEVEMENT_POINTS.firstWin);
  });
});

describe('a career’s score has no ceiling', () => {
  it('passes 100 for a long career, grows with what it did, and never goes below nothing', () => {
    const c = career();
    const k = c.career!;
    expect(legacyOf(c).score).toBeGreaterThanOrEqual(0);
    k.record.weeksPm = 1040; k.record.weeksGov = 1040; k.record.elections = 4; k.record.victories = 4; k.record.bestSeats = 150;
    k.record.kept = ['homes', 'minWage', 'transitPass', 'hospitals'];
    k.credibility = 80;
    const long = legacyOf(c);
    expect(long.score).toBeGreaterThan(300);
    k.record.weeksPm = 2080; k.record.elections = 8; k.record.victories = 8;
    expect(legacyOf(c).score).toBeGreaterThan(long.score);
    expect(legacyOf(c).score).toBeLessThan(SCORE_MAX);
    k.record = { ...k.record, weeksPm: 0, weeksGov: 0, elections: 0, victories: 0, bestSeats: 0, kept: [], broken: 400, falls: 20, toppled: 0 };
    k.credibility = 0;
    expect(legacyOf(c).score).toBe(0);
  });

  it('adds what each way of being remembered is worth, and every legacy has a figure', () => {
    for (const id of LEGACY_IDS) expect(LEGACY_BONUS[id], id).toBeGreaterThanOrEqual(0);
    expect(LEGACY_BONUS.statesman).toBeGreaterThan(LEGACY_BONUS.premier);
    expect(BOW_OUT_SCORE).toBeGreaterThan(100);
  });
});

describe('what the career brings to the board', () => {
  it('counts the achievements this game earned, once each, and keeps them apart from other games’', () => {
    let p = emptyProfile();
    p = noteAchieved(p, 'a', ['majority', 'premier']);
    expect(noteAchieved(p, 'a', ['majority'])).toBe(p);
    p = noteAchieved(p, 'a', ['majority', 'landslide']);
    p = noteAchieved(p, 'b', ['firstWin']);
    expect(p.achievedIn!.a).toEqual(['majority', 'premier', 'landslide']);
    expect(pointsOf(p.achievedIn!.a)).toBe(40 + 25 + 75);
    expect(p.achievedIn!.b).toEqual(['firstWin']);
    expect(parseProfile(JSON.stringify(p)).achievedIn).toEqual(p.achievedIn);
    expect(parseProfile(JSON.stringify({ ...p, achievedIn: { a: ['nonsense', 'majority'] } })).achievedIn).toEqual({ a: ['majority'] });
  });

  it('puts them in the gallery entry’s score, with the part they came to', () => {
    const c = career();
    endCareer(c, 'retired');
    const g = newGame('Test', c, 1000);
    const base = legacyEntry(g, 1)!;
    const entry = legacyEntry(g, 2, 140)!;
    expect(entry.score).toBe(base.score + 140);
    expect(entry.ach).toBe(140);
    // The one hung is brought up to date when it changes.
    const hung = hang(hang(emptyProfile(), base), entry);
    expect(hung.legacies).toHaveLength(1);
    expect(hung.legacies[0].score).toBe(entry.score);
  });
});
