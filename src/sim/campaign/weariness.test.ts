import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { nextTerm, startCareer, termWeek, TERM_WEEKS } from './career';
import { endDay } from './formation';
import { FATIGUE_PER_TERM, WEARY_RELIEF, fatigueOf, weariness, wearyOf } from './party';
import { autoPlayWeek, closeNight, endWeek } from './turn';
import type { Campaign } from './types';

const base = getWorld('career')!;
const PS = PARTY_IDS.indexOf('ps');

describe('how weary the voters get of a government', () => {
  it('is spared by up to half when the government did well, and not at all when it did badly', () => {
    expect(weariness(0)).toBeCloseTo(FATIGUE_PER_TERM, 9);
    expect(weariness(1)).toBeCloseTo(FATIGUE_PER_TERM * (1 - WEARY_RELIEF), 9);
    expect(weariness(0.5)).toBeLessThan(weariness(0.2));
    expect(weariness(-3)).toBe(weariness(0));
    expect(weariness(9)).toBe(weariness(1));
  });

  it('is read for an old save from the parliaments in a row, as it always was', () => {
    expect(wearyOf({ govRun: 3 })).toBeCloseTo(fatigueOf(3), 9);
    expect(wearyOf({ govRun: 3, weary: 0.04 })).toBe(0.04);
    expect(wearyOf({})).toBe(0);
  });
});

import { governmentScore } from './record';
import { pushNews } from './news';

describe('how a government is scored', () => {
  const game = () => startCareer(base, { player: PS, difficulty: 'normal', seed: 5 });
  it('is high for a strong economy, credibility and kept promises, and low for the opposite', () => {
    const good = game(), bad = game();
    Object.assign(good.career!.economy, { growth: 6, inflation: 2, jobless: 3 }); good.career!.credibility = 95;
    Object.assign(bad.career!.economy, { growth: -1, inflation: 8, jobless: 9 }); bad.career!.credibility = 20;
    pushNews(good, { party: PS, key: 'news.gov.reckoning', vars: { kept: 6, total: 6 }, tone: 'good' });
    pushNews(bad, { party: PS, key: 'news.gov.reckoning', vars: { kept: 0, total: 6 }, tone: 'bad' });
    expect(governmentScore(good.career!, good.news)).toBeGreaterThan(0.95);
    expect(governmentScore(bad.career!, bad.news)).toBeLessThan(0.05);
    expect(weariness(governmentScore(good.career!, good.news))).toBeLessThan(weariness(governmentScore(bad.career!, bad.news)));
  });
});

/** A career played through an election, its government's record as given at the dissolution. */
function through(seed: number): Campaign {
  const c = startCareer(base, { player: PS, difficulty: 'normal', seed });
  const k = c.career!;
  k.govRun = 1;
  k.week = TERM_WEEKS;
  termWeek(base, c);
  Object.assign(k.economy, { growth: 6, inflation: 2, jobless: 3 }); k.credibility = 95;
  while (c.phase === 'campaign') { autoPlayWeek(base, c); endWeek(base, c); }
  closeNight(base, c);
  for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(base, c);
  // Whoever the talks produced, the question is what staying in government does: make the player's party the one that stayed.
  c.formation!.outcome = { ...c.formation!.outcome!, pm: PS, partners: [] };
  nextTerm(base, c);
  return c;
}

describe('the weariness a parliament adds', () => {
  it('is carried in the career, and is less than the whole of it for a government that did well', () => {
    let stayed = 0;
    for (const seed of [2, 4, 5, 7]) {
      const c = through(seed);
      expect(c.career!.govRun).toBe(2);
      stayed++;
      expect(c.career!.weary).toBeGreaterThan(0);
      expect(c.career!.weary!).toBeLessThan(FATIGUE_PER_TERM);
    }
    expect(stayed).toBe(4);
  });
});
