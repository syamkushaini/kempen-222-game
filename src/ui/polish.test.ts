import { describe, expect, it } from 'vitest';
import { getWorld } from '../data/world';
import { startCareer } from '../sim/campaign/career';
import { MINISTER_NAMES } from '../sim/campaign/govern';
import { addScene } from '../sim/campaign/diplomacy';
import { retire } from '../sim/campaign/legacy';
import { pushNews } from '../sim/campaign/news';
import { PARTY_IDS } from '../sim/types';
import { BEATS, melodyBar, SCALE, SFX } from './audio';
import { emblemSvg, LEADER_LOOKS, leaderPortrait, MINISTER_LOOKS, ministerPortrait, portraitSvg } from './faces';
import { soundFor } from './feedback';
import { hemicycle, wrap } from './shareCard';

describe('portraits', () => {
  it('give every leader and every minister a face of their own', () => {
    expect(MINISTER_LOOKS).toHaveLength(MINISTER_NAMES.length);
    const leaders = Object.values(LEADER_LOOKS).map((look) => portraitSvg(look, '#888888'));
    expect(new Set(leaders).size).toBe(6);
    expect(new Set(MINISTER_LOOKS.map((look) => portraitSvg(look, '#888888'))).size).toBe(MINISTER_NAMES.length);
    for (const svg of leaders) {
      expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
      expect(svg.endsWith('</svg>')).toBe(true);
      expect(svg).not.toMatch(/undefined|NaN/);
    }
    for (const kind of ['palace', 'house', 'desk'] as const) expect(emblemSvg(kind)).not.toMatch(/undefined|NaN/);
  });

  it('are the same picture every time, in the party’s colour, and nobody for the independents', () => {
    expect(leaderPortrait(0)).toBe(leaderPortrait(0));
    expect(leaderPortrait(0)).not.toBe(leaderPortrait(1));
    expect(leaderPortrait(0)!.startsWith('data:image/svg+xml,')).toBe(true);
    expect(leaderPortrait(PARTY_IDS.indexOf('oth'))).toBeNull();
    expect(ministerPortrait(3, 0)).not.toBe(ministerPortrait(3, 1));
  });
});

describe('the chamber on the result card', () => {
  it('seats every member, inside the half circle, without overlap', () => {
    for (const n of [1, 2, 5, 15, 42, 59, 222]) {
      const { dots, r } = hemicycle(n);
      expect(dots, String(n)).toHaveLength(n);
      for (const d of dots) {
        expect(d.y).toBeGreaterThanOrEqual(-1e-9);
        expect(Math.hypot(d.x, d.y)).toBeLessThanOrEqual(1 + 1e-9);
      }
      let nearest = Infinity;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) nearest = Math.min(nearest, Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y));
      if (n > 1) expect(nearest, String(n)).toBeGreaterThanOrEqual(2 * r);
    }
    expect(hemicycle(0).dots).toEqual([]);
  });

  it('runs from the left of the chamber to the right, so a party sits together', () => {
    const { dots } = hemicycle(222);
    const angle = (d: { x: number; y: number }) => Math.atan2(d.y, d.x);
    for (let i = 1; i < dots.length; i++) expect(angle(dots[i])).toBeLessThanOrEqual(angle(dots[i - 1]) + 1e-9);
    expect(dots[0].x).toBeLessThan(0);
    expect(dots.at(-1)!.x).toBeGreaterThan(0);
  });

  it('breaks text to fit, and trims what will not', () => {
    const measure = (s: string) => s.length;
    expect(wrap('one two three four', 9, measure)).toEqual(['one two', 'three', 'four']);
    expect(wrap('one two three four', 9, measure, 2)).toEqual(['one two', 'three…']);
    expect(wrap('', 9, measure)).toEqual([]);
    expect(wrap('supercalifragilistic', 5, measure)).toEqual(['supercalifragilistic']);
  });
});

describe('sound', () => {
  it('has effects that start at once and end soon', () => {
    for (const [name, tones] of Object.entries(SFX)) {
      expect(tones.length, name).toBeGreaterThan(0);
      expect(Math.min(...tones.map((t) => t.at)), name).toBe(0);
      for (const t of tones) {
        expect(t.dur, name).toBeGreaterThan(0);
        expect(t.at + t.dur, name).toBeLessThan(1.2);
        expect(t.gain ?? 0.12, name).toBeLessThanOrEqual(0.4);
      }
    }
  });

  it('writes a tune that stays in its scale and is the same for the same bar', () => {
    for (let bar = 0; bar < 40; bar++) {
      const notes = melodyBar(7, bar);
      expect(notes).toHaveLength(BEATS);
      expect(melodyBar(7, bar)).toEqual(notes);
      for (const step of notes) expect(step === -1 || (step >= 0 && step < SCALE.length)).toBe(true);
    }
    const sounded = Array.from({ length: 40 }, (_, bar) => melodyBar(7, bar)).flat().filter((s) => s >= 0).length;
    expect(sounded).toBeGreaterThan(120);
    expect(sounded).toBeLessThan(280);
    expect(melodyBar(7, 3)).not.toEqual(melodyBar(8, 3));
  });

  it('picks one sound for what just happened', () => {
    const world = getWorld('career')!;
    const a = startCareer(world, { player: 0, difficulty: 'normal', seed: 5 });
    const next = () => structuredClone(a);
    expect(soundFor(a, next(), null)).toBeNull();
    let b = next(); b.career!.week++;
    expect(soundFor(a, b, null)).toBe('tick');
    b = next(); addScene(b, { kind: 'event', from: null, event: 'budget' });
    expect(soundFor(a, b, null)).toBe('ring');
    b = next(); pushNews(b, { party: 0, key: 'news.gov.passed', tone: 'good' });
    expect(soundFor(a, b, null)).toBe('gavel');
    b = next(); pushNews(b, { party: 0, key: 'news.gov.defeated', tone: 'bad' });
    expect(soundFor(a, b, null)).toBe('bad');
    b = next(); retire(b);
    expect(soundFor(a, b, null)).toBe('fanfare');
    expect(soundFor(a, next(), { tone: 'good', raised: true })).toBe('coin');
    expect(soundFor(a, next(), { tone: 'bad' })).toBe('bad');
    expect(soundFor(a, next(), { tone: 'neutral' })).toBe('tick');
  });
});
