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

describe('a state election finished and saved before this existed', () => {
  beforeEach(() => { store().quitToTitle(); });

  it('can be carried on from the saved game, without playing it again', () => {
    store().startCampaign({ name: 'Old', scenario: 'state:perlis', player: PS, difficulty: 'normal' });
    finish();
    const done = store().game!;
    const result = electionResult(worldOf(done.campaign)!, done.campaign)!;
    // A save from before carrying on: no `carried` anywhere in it.
    const old = JSON.parse(serializeSave(done));
    expect(old.campaign.carried).toBeUndefined();
    store().quitToTitle();
    const loaded = parseSave(JSON.stringify(old));
    if (!loaded.ok) throw new Error('save not read');
    useStore.setState({ game: loaded.state });
    store().carryOn();
    expect(store().game!.campaign.phase).toBe('campaign');
    expect(lastElection(worldOf(store().game!.campaign)!).tally).toEqual(result.tally);
  });
});
