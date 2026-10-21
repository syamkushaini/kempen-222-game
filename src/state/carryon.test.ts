import { beforeEach, describe, expect, it } from 'vitest';
import { lastElection } from '../sim/election';
import { worldOf } from '../data/world';
import { electionResult } from '../sim/campaign/turn';
import { PARTY_IDS } from '../sim/types';
import { parseSave, serializeSave } from './game';
import { useStore } from './store';

const PS = PARTY_IDS.indexOf('ps');
const store = () => useStore.getState();

/** Plays a state election to its end. */
function finish() {
  for (let i = 0; i < 20 && store().game!.campaign.phase === 'campaign'; i++) store().endWeek();
  if (store().game!.campaign.phase !== 'done') store().finishNight();
}

describe('playing a state election again from its result', () => {
  beforeEach(() => { store().quitToTitle(); });

  it('makes what every party won the last election of the next one, again and again', () => {
    store().startCampaign({ name: 'PRN', scenario: 'state:perlis', player: PS, difficulty: 'normal' });
    finish();
    let c = store().game!.campaign;
    expect(c.phase).toBe('done');
    for (let round = 0; round < 3; round++) {
      c = store().game!.campaign;
      const result = electionResult(worldOf(c)!, c)!;
      store().carryOn();
      const next = store().game!.campaign;
      expect(next.scenario).toBe('state:perlis');
      expect(next.phase).toBe('campaign');
      expect(next.week).toBe(1);
      // The last election the player sees is the one just played, for every party.
      expect(lastElection(worldOf(next)!).tally).toEqual(result.tally);
      expect(lastElection(worldOf(next)!).votes.map(Math.round)).toEqual(result.votes.map(Math.round));
      finish();
    }
  });

  it('is kept when the game is saved, loaded or started again', () => {
    store().startCampaign({ name: 'PRN', scenario: 'state:perlis', player: PS, difficulty: 'normal' });
    finish();
    store().carryOn();
    const g = store().game!;
    const tally = lastElection(worldOf(g.campaign)!).tally;
    const loaded = parseSave(serializeSave(g));
    expect(loaded.ok && lastElection(worldOf(loaded.state.campaign)!).tally).toEqual(tally);
    store().restart();
    expect(lastElection(worldOf(store().game!.campaign)!).tally).toEqual(tally);
  });

  it('is not offered in a set challenge', () => {
    store().startCampaign({ name: 'C', scenario: 'state:perlis', player: PS, difficulty: 'normal', challenge: { fog: false, noisy: false, goal: 'perak' } });
    finish();
    const id = store().game!.id;
    store().carryOn();
    expect(store().game!.id).toBe(id);
  });
});
