import { describe, expect, it } from 'vitest';
import { noteRecent, synergyFor } from './synergy';

describe('synergy', () => {
  it('gives no bonus with nothing recent', () => {
    expect(synergyFor(undefined, 'P.001', 'ceramah', 'urban')).toBe(1);
  });

  it('combos a townhall into a ceramah in an urban seat', () => {
    const recent: Record<string, string[]> = {};
    noteRecent(recent as any, 'P.001', 'townhall');
    expect(synergyFor(recent as any, 'P.001', 'ceramah', 'urban')).toBe(1.5);
  });

  it('does not apply the urban-only bonus in a rural seat', () => {
    const recent: Record<string, string[]> = {};
    noteRecent(recent as any, 'P.001', 'townhall');
    expect(synergyFor(recent as any, 'P.001', 'ceramah', 'rural')).toBe(1);
  });

  it('is seat-specific: a combo in one seat does not leak into another', () => {
    const recent: Record<string, string[]> = {};
    noteRecent(recent as any, 'P.001', 'townhall');
    expect(synergyFor(recent as any, 'P.002', 'ceramah', 'urban')).toBe(1);
  });

  it('caps the recent list so it does not grow without bound', () => {
    const recent: Record<string, string[]> = {};
    for (let i = 0; i < 20; i++) noteRecent(recent as any, 'P.001', 'canvass' as any);
    expect(recent['P.001'].length).toBe(6);
  });

  it('takes the best of several matching combos', () => {
    const recent: Record<string, string[]> = {};
    noteRecent(recent as any, 'P.001', 'townhall');
    noteRecent(recent as any, 'P.001', 'walkabout');
    expect(synergyFor(recent as any, 'P.001', 'ceramah', 'urban')).toBe(1.5);
  });
});
