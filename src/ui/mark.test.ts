import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LOGO_GOLD, logoDots, logoSvg, TWO } from './mark';

describe('the mark', () => {
  const dots = logoDots();

  it('is a chamber of thirty seats with a bare majority lit and one gold seat at the line', () => {
    expect(dots).toHaveLength(30);
    const lit = dots.filter((d) => d.kind !== 'dim').length;
    expect(lit).toBeGreaterThan(dots.length / 2);
    expect(lit).toBeLessThan(dots.length * 0.6);
    expect(dots.filter((d) => d.kind === 'gold')).toHaveLength(1);
    // The gold seat is the last of those lit, going round from the left.
    expect(dots.findIndex((d) => d.kind === 'gold')).toBe(lit - 1);
    expect(dots.slice(lit).every((d) => d.kind === 'dim')).toBe(true);
  });

  it('keeps every seat inside the square and above the number', () => {
    for (const d of dots) {
      expect(d.x).toBeGreaterThan(8);
      expect(d.x).toBeLessThan(112);
      expect(d.y).toBeGreaterThan(8);
      expect(d.y).toBeLessThanOrEqual(60);
    }
  });

  it('draws as a picture with the three 2s, for the result card', () => {
    const svg = logoSvg();
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.split(TWO).length - 1).toBe(3);
    expect(svg).toContain(LOGO_GOLD);
    expect(svg.split('<circle').length - 1).toBe(30);
  });

  it('is the same mark on the page that loads before the game does', () => {
    // The splash and the browser icon are plain HTML, written out by hand: they must be the mark, not an old one.
    const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
    expect(html.split(TWO).length - 1).toBeGreaterThanOrEqual(3);
    expect(html).toContain(LOGO_GOLD.replace('#', '%23'));
    expect(html).not.toContain('e8b04a');
  });
});
