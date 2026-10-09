import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { EVENTS } from '../../sim/campaign/events';
import { artFor, ScenePicture } from './index';
import { Figure, lookOf, type Mood, type Pose } from './figure';
import { parse, PARTS, Scene, toneOf, unknown } from './kit';
import { feel } from './people';
import { EVENT_ART, SCENE_ART } from './recipes';
import type { SceneKind } from '../../sim/campaign/types';

const KINDS: SceneKind[] = ['pactOffer', 'poach', 'summons', 'unityAdvice', 'event', 'vote', 'houseVote', 'agenda', 'partyPoll', 'redraw'];

describe('the pictures of decisions', () => {
  it('give every event something to look at, and every kind of decision', () => {
    for (const id of Object.keys(EVENTS)) expect(EVENT_ART[id], `event ${id}`).toBeTruthy();
    for (const id of Object.keys(EVENT_ART)) expect(EVENTS[id], `art for ${id} has no event`).toBeTruthy();
    for (const kind of KINDS.filter((k) => k !== 'event')) expect(SCENE_ART[kind], kind).toBeTruthy();
  });

  it('are written with parts the kit can draw, placed inside the picture', () => {
    for (const [id, text] of [...Object.entries(SCENE_ART), ...Object.entries(EVENT_ART)]) {
      const recipe = parse(text);
      expect(unknown(recipe), id).toEqual([]);
      expect(recipe.items.length, id).toBeGreaterThan(0);
      expect(recipe.items.every((i) => i.x >= 0 && i.x <= 100 && i.s > 0 && i.s < 4), id).toBe(true);
    }
    expect(Object.keys(PARTS).length).toBeGreaterThan(80);
  });

  it('draw, and are not all alike', () => {
    const seen = new Set<string>();
    for (const [id, text] of Object.entries(EVENT_ART)) {
      const svg = renderToStaticMarkup(createElement(Scene, { recipe: parse(text), seed: 1 }));
      expect(svg, id).toContain('<svg');
      expect(svg.length, id).toBeGreaterThan(400);
      seen.add(text);
    }
    expect(seen.size).toBeGreaterThan(Object.keys(EVENT_ART).length * 0.97);
  });

  it('are found for a scene, and nothing is drawn for what has none', () => {
    expect(artFor('event', 'flood')).toBeTruthy();
    expect(artFor('vote')).toBeTruthy();
    expect(artFor('event', 'noSuchEvent')).toBeNull();
    expect(renderToStaticMarkup(createElement(ScenePicture, { kind: 'event', event: 'flood', seed: 1 }))).toContain('scene-art');
    expect(renderToStaticMarkup(createElement(ScenePicture, { kind: 'nothing', seed: 1 }))).toBe('');
  });

  it('give every person a face, clothes and a way of standing of their own', () => {
    const looks = new Set(Array.from({ length: 40 }, (_, i) => JSON.stringify(lookOf(i))));
    expect(looks.size).toBeGreaterThan(30);
    expect(JSON.stringify(lookOf(7))).toBe(JSON.stringify(lookOf(7)));
    const all = Array.from({ length: 60 }, (_, i) => lookOf(i));
    for (const outfit of ['batik', 'shirt', 'tee', 'melayu', 'kurung']) expect(all.some((l) => l.outfit === outfit), outfit).toBe(true);
    for (const head of ['hair', 'songkok', 'tudung', 'bald', 'bun']) expect(all.some((l) => l.head === head), head).toBe(true);
    const poses: Pose[] = ['down', 'up', 'out', 'point', 'hips', 'head', 'hold', 'fold', 'wave'];
    const moods: Mood[] = ['calm', 'glad', 'cross', 'worried', 'shock'];
    const drawn = new Set<string>();
    for (const pose of poses) for (const mood of moods) drawn.add(renderToStaticMarkup(createElement('svg', null, createElement(Figure, { i: 3, uid: 'u', pose, mood }))));
    expect(drawn.size).toBe(poses.length * moods.length);
  });

  it('read the temper of a scene from what is in it, and the faces follow', () => {
    expect(toneOf(parse(EVENT_ART.flood))).toBe('tense');
    expect(toneOf(parse(EVENT_ART.footballFinal))).toBe('glad');
    expect(toneOf(parse(EVENT_ART.openHouse))).toBe('plain');
    expect(new Set([0, 1, 2, 3, 4].map((i) => feel('tense', i))).has('glad')).toBe(false);
    expect([0, 1, 2, 3].map((i) => feel('glad', i)).filter((m) => m === 'glad').length).toBeGreaterThanOrEqual(3);
    // The same scene with another seed is the same scene with other people in it.
    const a = renderToStaticMarkup(createElement(Scene, { recipe: parse(EVENT_ART.budget), seed: 1 }));
    const b = renderToStaticMarkup(createElement(Scene, { recipe: parse(EVENT_ART.budget), seed: 2 }));
    expect(a).not.toBe(b);
    expect(a).not.toContain('<text');
  });
});
