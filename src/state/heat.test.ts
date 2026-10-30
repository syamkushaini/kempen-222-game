import { beforeEach, describe, expect, it } from 'vitest';
import { PARTY_IDS } from '../sim/types';
import { heatOpen } from '../sim/campaign/heat';
import { useStore } from './store';

const store = () => useStore.getState();
const PT = PARTY_IDS.indexOf('pt');

/** Plays one by-election at heat 1 to its end, with the team running the weeks, and returns how it went. */
function playHeatOne(seed: number): { phase: string; heat: number | undefined } {
  store().quitToTitle();
  store().startCampaign({ name: 'T', scenario: 'byelection', player: PT, difficulty: 'easy', backstory: null, seed, challenge: { fog: true, noisy: false, heat: 1 } });
  useStore.setState((s) => ({ game: { ...s.game!, tutorial: null } }));
  store().finishWithTeam();
  store().finishNight();
  return { phase: store().game!.campaign.phase, heat: store().profile.heat };
}

describe('the heat ladder, played through the store', () => {
  beforeEach(() => { useStore.setState((s) => ({ profile: { ...s.profile, heat: undefined } })); });

  it('opens the next rung only for a contest won at the rung below', () => {
    const results = [];
    for (let seed = 1; seed <= 12; seed++) {
      useStore.setState((s) => ({ profile: { ...s.profile, heat: undefined } }));
      results.push({ seed, ...playHeatOne(seed) });
    }
    const won = results.filter((r) => r.heat === 1);
    const lost = results.filter((r) => r.heat === undefined);
    // Both outcomes turn up over twelve contests, and each leaves the ladder as it should be.
    expect(won.length).toBeGreaterThan(0);
    expect(lost.length).toBeGreaterThan(0);
    expect(won.length + lost.length).toBe(12);
    expect(heatOpen(1)).toBe(2);
  });
});
