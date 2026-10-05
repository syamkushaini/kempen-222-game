import { beforeEach, describe, expect, it } from 'vitest';
import { foundedWorld, getWorld } from '../data/world';
import { CHALLENGES } from '../sim/campaign/challenges';
import { FOUNDING_SLOT } from '../sim/campaign/founding';
import { endWeek, newCampaign } from '../sim/campaign/turn';
import { PARTY_IDS } from '../sim/types';
import { newGame, parseSave, serializeSave, startOf } from './game';
import { useStore } from './store';

const PS = PARTY_IDS.indexOf('ps'), PT = PARTY_IDS.indexOf('pt');
const perak = getWorld('state:perak')!;
const store = () => useStore.getState();

describe('starting a game again', () => {
  beforeEach(() => { store().quitToTitle(); });

  it('begins the same contest, party and settings afresh, under the same name', () => {
    store().startCampaign({ name: 'My Perak', scenario: 'state:perak', player: PT, difficulty: 'hard', backstory: 'firebrand', challenge: { fog: true, noisy: false } });
    const first = store().game!;
    store().act('canvass', { state: perak.states[0] });
    store().endWeek();
    expect(store().game!.campaign.week).toBe(2);
    store().restart();
    const again = store().game!;
    expect(again.id).not.toBe(first.id);
    expect(again.name).toBe('My Perak');
    expect(again.campaign).toMatchObject({ scenario: 'state:perak', player: PT, difficulty: 'hard', week: 1, phase: 'campaign', challenge: { fog: true, noisy: false } });
    expect(again.campaign.team.leader.backstory).toBe('firebrand');
    expect(again.campaign.ledger).toEqual([]);
    expect(again.start).toEqual(first.start);
  });

  it('draws fresh luck for an ordinary game and keeps the fixed seed of a set challenge', () => {
    store().startCampaign({ name: 'A', scenario: 'state:perak', player: PS, difficulty: 'normal' });
    const seeds = new Set([store().game!.campaign.seed]);
    for (let i = 0; i < 4; i++) { store().restart(); seeds.add(store().game!.campaign.seed); }
    expect(seeds.size).toBeGreaterThan(1);

    const def = CHALLENGES.find((c) => c.id === 'perak')!;
    store().startCampaign({ name: 'C', scenario: def.scenario, player: PARTY_IDS.indexOf(def.party), difficulty: 'hard', seed: def.seed, challenge: { fog: false, noisy: false, goal: def.id } });
    const drift = JSON.stringify(store().game!.campaign.drift);
    store().endWeek();
    store().restart();
    expect(store().game!.campaign.seed).toBe(def.seed);
    expect(JSON.stringify(store().game!.campaign.drift)).toBe(drift);
    expect(store().game!.campaign.challenge?.goal).toBe('perak');
  });

  it('starts a founded party again as founded, with the platform it was given', () => {
    const stances = [2, 0, 0, 0, -1, -1, 1, -1, 1, 2, 0, 2];
    const player = PARTY_IDS.indexOf(FOUNDING_SLOT);
    store().startCampaign({ name: 'New Party', scenario: 'career', player, difficulty: 'normal', founded: true, stances });
    store().advance(4);
    store().restart();
    const c = store().game!.campaign;
    expect(c.career!.founded).toBe(true);
    expect(c.career!.week).toBe(1);
    expect(c.career!.stances[player]).toEqual(stances);
    expect(foundedWorld().seats).toHaveLength(222);
  });

  it('survives a save and load, and is worked out for a game saved before the setup was kept', () => {
    store().startCampaign({ name: 'Kept', scenario: 'state:perak', player: PT, difficulty: 'hard' });
    const g = store().game!;
    const back = parseSave(serializeSave(g));
    expect(back.ok && back.state.start).toEqual(g.start);

    // An older save: no record of the setup, so it is read off the game itself.
    const old = newGame('Old', newCampaign(perak, { player: PT, difficulty: 'easy', seed: 9, backstory: 'organiser', challenge: { noisy: true } }));
    endWeek(perak, old.campaign);
    expect(old.start).toBeUndefined();
    expect(startOf(old)).toEqual({ scenario: 'state:perak', player: PT, difficulty: 'easy', backstory: 'organiser', ideology: null, challenge: { fog: false, noisy: true } });
    store().loadGame(old);
    store().restart();
    expect(store().game!.campaign).toMatchObject({ scenario: 'state:perak', player: PT, difficulty: 'easy', week: 1, challenge: { fog: false, noisy: true } });

    // A setup that has been tampered with is dropped, not trusted.
    const bad = JSON.parse(serializeSave(g));
    bad.start = { scenario: 5, player: 'x' };
    const read = parseSave(JSON.stringify(bad));
    expect(read.ok && read.state.start).toBeUndefined();
  });

  it('new game leaves for the title screen and asks it to open on the set-up; main menu just leaves', () => {
    store().startCampaign({ name: 'X', scenario: 'state:perak', player: PS, difficulty: 'normal' });
    store().setMenuOpen(true);
    store().newGameSetup();
    expect(store().game).toBeNull();
    expect(store().setupWanted).toBe(true);
    store().clearSetupWanted();
    store().startCampaign({ name: 'Y', scenario: 'state:perak', player: PS, difficulty: 'normal' });
    store().quitToTitle();
    expect(store().game).toBeNull();
    expect(store().setupWanted).toBe(false);
  });
});
