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
import { fitHeadline, ground, hemicycle, luminance, mix, posterChamber, wrap } from './shareCard';
import { toneOf, voiceOf, type Result } from './cardVoice';
import { translate, type StringKey } from '../i18n/strings';

describe('portraits', () => {
  it('give every leader and every minister a face of their own', () => {
    expect(MINISTER_LOOKS).toHaveLength(MINISTER_NAMES.length);
    const leaders = Object.values(LEADER_LOOKS).map((look) => portraitSvg(look, '#888888'));
    expect(new Set(leaders).size).toBe(Object.keys(LEADER_LOOKS).length);
    expect(leaders).toHaveLength(PARTY_IDS.length - 1); // every party but the pool
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

describe('the result poster', () => {
  const r = (over: Partial<Result>): Result => ({ verdict: 'majority', seats: 120, before: 80, total: 222, majority: 112, margin: 0, ...over });
  const VERDICTS = ['majority', 'largest', 'gained', 'held', 'lost', 'won', 'creditable', 'defeated'] as const;

  it('speaks proudly of a clear win and dryly of a squeaker or a loss, and never mocks', () => {
    expect(toneOf(r({ seats: 130 }))).toBe('grand'); // 18 over the line
    expect(toneOf(r({ seats: 113 }))).toBe('cheeky'); // one over it
    expect(toneOf(r({ verdict: 'largest', seats: 95 }))).toBe('grand');
    expect(toneOf(r({ verdict: 'largest', seats: 70 }))).toBe('cheeky');
    expect(toneOf(r({ verdict: 'gained', seats: 100, before: 80 }))).toBe('grand'); // 20 of 222
    expect(toneOf(r({ verdict: 'gained', seats: 84, before: 80 }))).toBe('cheeky');
    expect(toneOf(r({ verdict: 'won', margin: 0.08 }))).toBe('grand');
    expect(toneOf(r({ verdict: 'won', margin: 0.004 }))).toBe('cheeky');
    for (const verdict of ['held', 'lost', 'creditable', 'defeated'] as const) expect(toneOf(r({ verdict }))).toBe('cheeky');
    expect(voiceOf(r({ verdict: 'lost' }))).toEqual({ shout: 'card.shout.lost', line: 'card.line.lost.cheeky', tone: 'cheeky' });
  });

  it('has a shout for every result and a line for every result the voice can pick, in both languages', () => {
    for (const lang of ['en', 'ms'] as const) {
      for (const verdict of VERDICTS) {
        for (const over of [{}, { seats: 400, margin: 0.5, before: 0 }, { seats: 0, margin: 0 }]) {
          const { shout, line } = voiceOf(r({ verdict, ...over }));
          for (const key of [shout, line]) {
            expect(translate(lang, key as StringKey), `${lang} ${key}`).not.toBe(key);
            // translate() falls back to English, so a Bahasa line that was never written would pass the check above.
            if (lang === 'ms') expect(translate('ms', key as StringKey), `ms ${key}`).not.toBe(translate('en', key as StringKey));
          }
        }
      }
    }
  });

  it('keeps every line short enough to sit on one row over the chamber at a readable size', () => {
    // 740 px wide at 17 px is about 88 characters of ordinary text; the longest line is held well inside that.
    for (const lang of ['en', 'ms'] as const) {
      for (const verdict of VERDICTS) {
        for (const tone of ['grand', 'cheeky'] as const) {
          const key = `card.line.${verdict}.${tone}` as StringKey;
          const line = translate(lang, key);
          if (line !== key) expect(line.length, `${lang} ${key}`).toBeLessThanOrEqual(84);
        }
      }
    }
  });

  it('is built on the party’s colour, darkened until white type stands out from it', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mix('not-a-colour', '#ffffff', 0.5)).toBe('not-a-colour');
    expect(luminance('#ffffff')).toBeCloseTo(1, 3);
    expect(luminance('#000000')).toBe(0);
    for (const color of ['#d4a437', '#ffd700', '#e63946', '#3558b8', '#27a644', '#7c4dff', '#ffffff']) {
      const [light, deep] = ground(color);
      expect(luminance(light), color).toBeLessThanOrEqual(0.17);
      expect(luminance(deep), color).toBeLessThanOrEqual(luminance(light));
    }
    // A colour that is already dark stays dark, and a grey one stays grey.
    expect(luminance(ground('#1a2a6c')[0])).toBeLessThanOrEqual(0.17);
    const grey = ground('#888888')[0];
    expect(grey.slice(1, 3)).toBe(grey.slice(3, 5));
  });

  it('fits a headline on one line where it can, and on two where it cannot', () => {
    const measure = (s: string, size: number) => s.length * size * 0.6;
    expect(fitHeadline('THE HOUSE IS OURS', 740, measure)).toEqual({ size: 68, lines: ['THE HOUSE IS OURS'] });
    const mid = fitHeadline('WE FOUGHT. WE’LL BE BACK.', 740, measure);
    expect(mid.lines).toHaveLength(1);
    expect(mid.size).toBeLessThan(68);
    expect(mid.size).toBeGreaterThanOrEqual(40);
    expect(fitHeadline('A VERY LONG SHOUT THAT CANNOT POSSIBLY FIT ON ONE LINE AT ANY SIZE', 740, measure).lines.length).toBe(2);
  });

  it('draws the chamber with a hole for the number, the same seats in the same order, and none touching', () => {
    for (const n of [1, 3, 9, 30, 59, 112, 222]) {
      const { dots, r } = posterChamber(n);
      expect(dots, String(n)).toHaveLength(n);
      for (const d of dots) {
        const rho = Math.hypot(d.x, d.y);
        expect(rho, String(n)).toBeGreaterThanOrEqual(0.62 - 1e-9); // nothing inside the hole
        expect(rho, String(n)).toBeLessThanOrEqual(1 + 1e-9);
        expect(d.y, String(n)).toBeGreaterThanOrEqual(-1e-9);
      }
      let nearest = Infinity;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) nearest = Math.min(nearest, Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y));
      if (n > 1) expect(nearest, String(n)).toBeGreaterThanOrEqual(2 * r - 1e-9);
      // Left to right, as the plain chamber runs, so that the player's seats are a wedge on the left.
      for (let i = 1; i < n; i++) expect(Math.atan2(dots[i].y, dots[i].x), String(n)).toBeLessThanOrEqual(Math.atan2(dots[i - 1].y, dots[i - 1].x) + 1e-9);
    }
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
