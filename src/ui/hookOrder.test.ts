import { describe, expect, it } from 'vitest';

describe('hooks are asked in the same order every time', () => {
  it('is never asked behind && , || or ?: in the screens, or the page breaks when the window crosses a width', async () => {
    const { readFileSync, readdirSync } = await import('node:fs');
    const dir = new URL('.', import.meta.url);
    const bad: string[] = [];
    for (const file of readdirSync(dir).filter((f) => /\.tsx?$/.test(f) && !f.endsWith('.test.ts'))) {
      readFileSync(new URL(file, dir), 'utf8').split('\n').forEach((line, i) => {
        const code = line.replace(/\/\/.*$/, '');
        if (/(&&|\|\||\?)\s*!?use[A-Z][A-Za-z]*\(/.test(code)) bad.push(`${file}:${i + 1}: ${code.trim()}`);
      });
    }
    expect(bad).toEqual([]);
  });
});
