import { describe, expect, it } from 'vitest';
import { translate, type StringKey } from '../i18n/strings';

// The words on buttons and menu lines have to fit their boxes in both languages. A label can shrink a little to stay on
// its line, but not for ever: these are the lengths at which each kind of label still fits at a phone's width.
const LIMITS: { what: string; max: number; keys: StringKey[] }[] = [
  { what: 'a main menu line', max: 20, keys: ['title.continue', 'menu.new', 'menu.load', 'challenges.title', 'menu.honours', 'howto.title'] },
  { what: 'a word under a main menu line', max: 48, keys: ['menu.new.hint', 'menu.challenges.hint', 'howto.hint'] },
  { what: 'a button on a result or a recap', max: 26, keys: ['verdict.go', 'recap.go', 'settings.done', 'desk.look'] },
  { what: 'a screen in the phone\'s bottom bar', max: 12, keys: ['nav.map', 'group.people', 'group.intel', 'group.run.campaign', 'group.run.term'] },
  { what: 'the name of a way to play', max: 24, keys: ['title.mode.quick', 'title.mode.custom', 'title.mode.career'] },
  { what: 'a step of the set-up', max: 22, keys: ['steps.contest', 'steps.who', 'steps.rules', 'steps.next', 'steps.back'] },
  { what: 'a side of the chamber', max: 20, keys: ['chamber.gov', 'chamber.opp', 'chamber.cross', 'chamber.yours', 'chamber.free'] },
];

describe('labels fit their boxes in both languages', () => {
  for (const { what, max, keys } of LIMITS) {
    it(`${what} is at most ${max} characters`, () => {
      for (const lang of ['en', 'ms'] as const) {
        for (const key of keys) {
          const text = translate(lang, key);
          expect(text, `${lang} ${key} is missing`).not.toBe(key);
          expect(text.length, `${lang} ${key}: "${text}"`).toBeLessThanOrEqual(max);
        }
      }
    });
  }

});

describe('class names that mean one thing', () => {
  it('does not style a bare .count: the by-election count panel is "panel count", and a badge rule of that name squeezed it to a sliver', async () => {
    const { readFileSync, readdirSync } = await import('node:fs');
    const dir = new URL('.', import.meta.url);
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.css'))) {
      const css = readFileSync(new URL(file, dir), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      // A rule whose selector ends in plain ".count" (not .count-badge, .count-story and the like, nor ".panel.count" or ".count .something").
      const bare = css.split('}').map((rule) => rule.split('{')[0]).flatMap((sel) => sel.split(',')).map((sel) => sel.trim()).filter((sel) => /(^|\s)\.count$/.test(sel));
      expect(bare, file).toEqual([]);
    }
  });
});
