import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EVENTS } from '../../sim/campaign/events';
import { AVOID, KIND_SCENES, LEAD, promptFor, STYLE, TAIL } from './prompts';
import { allScenes } from './scenes';
import { SCENE_ART } from './recipes';

const FILE = new URL('../../../scripts/art/prompts.json', import.meta.url);

const allPrompts = () => Object.fromEntries(Object.entries(allScenes()).map(([id, s]) => [id, promptFor(s.title, s.body)]));

describe('the words that go to an image model', () => {
  it('say the look, and what must not be in a picture, for every decision', () => {
    const all = allPrompts();
    expect(Object.keys(all)).toHaveLength(Object.keys(EVENTS).length + Object.keys(KIND_SCENES).length);
    for (const [id, text] of Object.entries(all)) {
      expect(text, id).toContain(STYLE);
      expect(text, id).toContain(AVOID);
      expect(text.length, id).toBeGreaterThan(900);
      expect(text.length, id).toBeLessThan(2400);
    }
    for (const kind of Object.keys(SCENE_ART)) expect(KIND_SCENES[kind], kind).toBeDefined();
    expect(STYLE).toMatch(/16:9/);
    expect(STYLE).toMatch(/songkok/);
  });

  it('are kept in scripts/art/prompts.json, in step with the game’s own words', () => {
    const now = JSON.stringify({ style: STYLE, avoid: AVOID, lead: LEAD, tail: TAIL, scenes: allScenes() }, null, 1) + '\n';
    if (process.env.WRITE_ART_PROMPTS) {
      mkdirSync(new URL('../../../scripts/art/', import.meta.url), { recursive: true });
      writeFileSync(FILE, now);
    }
    expect(existsSync(FILE), 'run: WRITE_ART_PROMPTS=1 npx vitest run src/ui/art/prompts.test.ts').toBe(true);
    expect(readFileSync(FILE, 'utf8') === now, 'the prompts are out of date: run WRITE_ART_PROMPTS=1 npx vitest run src/ui/art/prompts.test.ts').toBe(true);
  });
});
