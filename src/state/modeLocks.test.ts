import { beforeEach, describe, expect, it } from 'vitest';
import { emptyJourney } from '../sim/campaign/journey';
import { useStore } from './store';

const setJourney = (governed: number, dunWon = 0) => useStore.setState((s) => ({ profile: { ...s.profile, journey: { ...emptyJourney(), governed: Array(governed).fill('selangor').map((_, i) => ['selangor', 'nsembilan', 'melaka', 'johor', 'pahang', 'perak'][i]) as never, dunWon, state: dunWon ? 'selangor' : null } } }));

describe('the locked ways to play', () => {
  beforeEach(() => { useStore.setState({ simulating: false }); setJourney(0); });

  it('keeps the simulator shut at the start and opens it after five states are taken', () => {
    useStore.getState().setSimulating(true);
    expect(useStore.getState().simulating).toBe(false);
    setJourney(5);
    useStore.getState().setSimulating(true);
    expect(useStore.getState().simulating).toBe(true);
  });

  it('does not start a challenge until the first state is taken, and does after', async () => {
    const spec = { scenario: 'general', party: 'pt', difficulty: 'easy', fog: false, noisy: false } as never;
    useStore.getState().quitToTitle();
    useStore.getState().startChallenge(spec);
    await new Promise((r) => setTimeout(r, 150));
    expect(useStore.getState().game).toBeNull();
    setJourney(1);
    useStore.getState().startChallenge(spec);
    await new Promise((r) => setTimeout(r, 150));
    expect(useStore.getState().game).not.toBeNull();
  });
});
