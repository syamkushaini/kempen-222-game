import { describe, expect, it } from 'vitest';
import { ACTIONS } from '../../sim/campaign/actions';
import { SCENES } from './scenes';

describe('the scenes played on the map', () => {
  it('cover every action a player can take, and nothing else', () => {
    expect(Object.keys(SCENES).sort()).toEqual(Object.keys(ACTIONS).sort());
  });
  it('are played in one of the five kinds of light', () => {
    for (const s of Object.values(SCENES)) expect(['day', 'dusk', 'night', 'indoor', 'studio']).toContain(s.mood);
  });
});
