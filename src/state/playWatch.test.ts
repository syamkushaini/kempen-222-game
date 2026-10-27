import { beforeEach, describe, expect, it } from 'vitest';
import { PARTY_IDS } from '../sim/types';
import { changes, placeOf, screenOf } from './playWatch';
import { useStore } from './store';

const store = () => useStore.getState();
const PT = PARTY_IDS.indexOf('pt');

describe('what the counting sees in the game', () => {
  beforeEach(() => { store().quitToTitle(); });

  it('is on the title screen with no game', () => {
    expect(placeOf(store())).toEqual({ mode: null, scenario: null, difficulty: null, screen: 'title', week: null });
  });

  it('counts a new game as a start, and the same game loaded later as a resume', () => {
    const title = store();
    store().startCampaign({ name: 'Secret name', scenario: 'state:perak', player: PT, difficulty: 'hard', backstory: null });
    const game = store().game!;
    expect(changes(title, store(), Date.now())).toEqual([{ t: 'start', extra: { detail: null } }]);
    expect(changes(title, store(), game.createdAt + 60 * 60_000)).toEqual([{ t: 'resume' }]);
    expect(placeOf(store())).toEqual({ mode: 'state', scenario: 'state:perak', difficulty: 'hard', screen: 'campaign', week: 1 });
    // The place says nothing about who is playing.
    expect(JSON.stringify(placeOf(store()))).not.toContain('Secret');
  });

  it('counts nothing for an ordinary week, and the election with how it went when polling day comes', () => {
    store().startCampaign({ name: 'A', scenario: 'state:perak', player: PT, difficulty: 'normal', backstory: null });
    const seen: string[] = [];
    for (let i = 0; i < 40 && store().game!.campaign.phase === 'campaign'; i++) {
      // Decisions waiting would hold the week up; they are not what is being tested.
      useStore.setState((s) => ({ game: { ...s.game!, campaign: { ...s.game!.campaign, inbox: [] } } }));
      const before = store();
      store().endWeek();
      for (const ch of changes(before, store(), Date.now())) seen.push(`${ch.t}:${ch.extra?.detail ?? ''}`);
    }
    expect(store().game!.campaign.phase).toBe('night');
    expect(screenOf(store())).toBe('night');
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatch(/^election:(majority|largest|gained|held|lost)$/);
  });

  it('counts a new parliament and the end of a career', () => {
    store().startCampaign({ name: 'A', scenario: 'career', player: PT, difficulty: 'normal', backstory: null });
    const before = store();
    const later = structuredClone(before.game!);
    const k = later.campaign.career!;
    k.term += 1;
    expect(changes(before, { game: later }, Date.now())).toEqual([{ t: 'term', extra: { n: k.term } }]);
    const over = structuredClone(later);
    over.campaign.career!.ending = { kind: 'retired', legacy: 'footnote', score: 10 };
    expect(changes({ game: later }, { game: over }, Date.now())).toEqual([{ t: 'end', extra: { detail: 'retired', n: k.term } }]);
    expect(screenOf({ game: over, showNight: false })).toBe('legacy');
  });
});
