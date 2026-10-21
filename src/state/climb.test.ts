import { beforeEach, describe, expect, it } from 'vitest';
import { getWorld, worldOf } from '../data/world';
import { FOUNDING_SLOT } from '../sim/campaign/founding';
import { PARTY_IDS } from '../sim/types';
import { electionResult } from '../sim/campaign/turn';
import { useStore } from './store';

const P = PARTY_IDS.indexOf(FOUNDING_SLOT);
const store = () => useStore.getState();

/** Plays a contest to its end, so that the button to carry on is what is showing. */
function playToTheEnd() {
  for (let i = 0; i < 40 && store().game!.campaign.phase === 'campaign'; i++) store().endWeek();
  for (let i = 0; i < 5 && store().game!.campaign.phase === 'night'; i++) store().finishNight();
}

describe('carrying a new party on to the next contest', () => {
  beforeEach(() => { store().quitToTitle(); });

  it('takes a by-election to the state election with its stronghold and a following of its own', async () => {
    store().startCampaign({ name: 'Baru', scenario: 'byelection:P.057', player: P, difficulty: 'normal', founded: true, seed: 5 });
    expect(store().game!.campaign.newParty).toBe(true);
    playToTheEnd();
    const before = store().game!;
    expect(before.campaign.phase).toBe('done');
    const decided = electionResult(worldOf(before.campaign)!, before.campaign)!.seats[0].winner;
    await store().climb();
    const next = store().game!;
    expect(next.id).not.toBe(before.id);
    expect(next.campaign.scenario).toBe('state:perak');
    expect(next.campaign.newParty).toBe(true);
    expect(next.campaign.stronghold?.place).toBe('P.057');
    expect(next.campaign.stronghold!.share).toBeGreaterThan(0);
    expect(next.campaign.following).toBeGreaterThan(0);
    // the seats of the stronghold start with the vote it really won there
    const w = worldOf(next.campaign)!;
    expect(next.campaign.stronghold!.shares).toHaveLength(PARTY_IDS.length);
    // the seat reads as the by-election ended: whoever won it is first in the last election, and the party that lost is not shown winning
    const home = w.seats.filter((x) => x.state === 'P.057' || x.id === 'P.057');
    for (const s of home) expect(s.last.votes.indexOf(Math.max(...s.last.votes))).toBe(decided);
    // and the same game is rebuilt from what is saved
    expect(next.start).toMatchObject({ founded: true, stronghold: next.campaign.stronghold });
    expect(getWorld('state:perak')).not.toBe(w);
  });

  it('shows the Kuala Kurau by-election in the state election as it ended, whoever won it', async () => {
    for (const seed of [3, 5, 7]) {
      store().quitToTitle();
      store().startCampaign({ name: 'Baru', scenario: 'byelection:dun:perak:N.09', player: P, difficulty: 'normal', founded: true, seed });
      playToTheEnd();
      const before = store().game!;
      const decided = electionResult(worldOf(before.campaign)!, before.campaign)!.seats[0].winner;
      await store().climb();
      const w = worldOf(store().game!.campaign)!;
      expect(w.id).toBe('state:perak');
      const s = w.seats[w.seatIndex.get('N.09')!];
      expect(s.last.votes.indexOf(Math.max(...s.last.votes))).toBe(decided);
      // playing the state election again starts from the same by-election result
      store().restart();
      const again = worldOf(store().game!.campaign)!.seats[w.seatIndex.get('N.09')!];
      expect(again.last.votes).toEqual(s.last.votes);
    }
  });
});
