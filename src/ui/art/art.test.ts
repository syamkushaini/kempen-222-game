import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { EVENTS } from '../../sim/campaign/events';
import { artFor, ScenePicture } from './index';
import { parse, PARTS, Scene, unknown } from './kit';
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
});
