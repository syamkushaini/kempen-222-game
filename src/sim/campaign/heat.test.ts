import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { HEAT_MAX, clearedHeat, heatOpen, heatRules } from './heat';
import { newCampaign } from './turn';
import { isValidCampaign } from './validate';

const general = getWorld('general')!;

describe('heat', () => {
  it('adds one thing a rung and keeps what is below', () => {
    expect(heatRules(0)).toEqual({ difficulty: null, fog: false, noisy: false, lean: false });
    expect(heatRules(1)).toMatchObject({ fog: true, noisy: false });
    expect(heatRules(2)).toMatchObject({ fog: true, noisy: true, difficulty: null });
    expect(heatRules(3)).toMatchObject({ noisy: true, difficulty: 'hard', lean: false });
    expect(heatRules(HEAT_MAX)).toEqual({ difficulty: 'hard', fog: true, noisy: true, lean: true });
  });

  it('opens the rung above the highest cleared, up to the top', () => {
    expect(heatOpen(undefined)).toBe(1);
    expect(heatOpen(2)).toBe(3);
    expect(heatOpen(HEAT_MAX)).toBe(HEAT_MAX);
  });

  it('is kept in the campaign, passes validation, and clears nothing before the votes are counted', () => {
    const c = newCampaign(general, { player: 0, difficulty: 'hard', seed: 5, challenge: { fog: true, noisy: true, lean: true, heat: 4 } });
    expect(c.challenge).toMatchObject({ fog: true, noisy: true, lean: true, heat: 4 });
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), general)).toBe(true);
    expect(clearedHeat(general, c)).toBeNull();
  });

  it('is not recorded for a game played at no heat', () => {
    expect(newCampaign(general, { player: 0, difficulty: 'normal', seed: 5 }).challenge).toBeUndefined();
  });
});
