import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { CHALLENGES, challengeById, goalResult, type ChallengeDef } from './challenges';
import { summarise } from './night';
import { autoPlayWeek, electionResult, endWeek, newCampaign, playable } from './turn';
import { isValidCampaign } from './validate';

const start = (def: ChallengeDef) => {
  const world = getWorld(def.scenario)!;
  const campaign = newCampaign(world, {
    player: PARTY_IDS.indexOf(def.party), difficulty: 'hard', seed: def.seed, challenge: { fog: !!def.fog, noisy: !!def.noisy, goal: def.id },
  });
  return { world, campaign };
};

/** Plays a challenge to the count and says whether the goal was met. */
function play(def: ChallengeDef, skilled: boolean) {
  const { world, campaign } = start(def);
  while (campaign.phase === 'campaign') { if (skilled) autoPlayWeek(world, campaign); endWeek(world, campaign); }
  return goalResult(def.goal, summarise(world, campaign, electionResult(world, campaign)!));
}

describe('the set challenges', () => {
  it('each name a real contest, a party that can be played in it, and a goal that can be met', () => {
    expect(new Set(CHALLENGES.map((c) => c.id)).size).toBe(CHALLENGES.length);
    for (const def of CHALLENGES) {
      const world = getWorld(def.scenario);
      expect(world, def.id).not.toBeNull();
      expect(playable(world!).map((p) => PARTY_IDS[p]), def.id).toContain(def.party);
      expect(world!.rules.career, def.id).toBeFalsy();
      if (def.goal.kind === 'seats') expect(def.goal.atLeast).toBeLessThanOrEqual(world!.seats.length);
      expect(challengeById(def.id)).toBe(def);
    }
    expect(challengeById('nonsense')).toBeUndefined();
    expect(challengeById(undefined)).toBeUndefined();
  });

  it('start the same way every time, keep their goal, and stay a valid save', () => {
    for (const def of CHALLENGES) {
      const a = start(def), b = start(def);
      expect(a.campaign.drift).toEqual(b.campaign.drift);
      expect(a.campaign.challenge).toEqual({ fog: !!def.fog, noisy: !!def.noisy, goal: def.id });
      expect(isValidCampaign(JSON.parse(JSON.stringify(a.campaign)), a.world)).toBe(true);
    }
  });

  it('judge a result against the goal', () => {
    expect(goalResult({ kind: 'win' }, { seats: 1, before: 0 })).toEqual({ met: true, got: 1, need: 1 });
    expect(goalResult({ kind: 'win' }, { seats: 0, before: 1 }).met).toBe(false);
    expect(goalResult({ kind: 'seats', atLeast: 30 }, { seats: 29, before: 24 })).toEqual({ met: false, got: 29, need: 30 });
    expect(goalResult({ kind: 'gain', atLeast: 15 }, { seats: 45, before: 30 })).toEqual({ met: true, got: 15, need: 15 });
    expect(goalResult({ kind: 'gain', atLeast: 15 }, { seats: 40, before: 30 }).met).toBe(false);
  });
}, 120_000);

describe('how hard they are', () => {
  it('are not met by a player who does nothing', () => {
    for (const def of CHALLENGES) expect(play(def, false).met, def.id).toBe(false);
  }, 120_000);

  it('can be met by the game’s own autoplayer in most of them', () => {
    const met = CHALLENGES.filter((def) => play(def, true).met).map((c) => c.id);
    expect(met.length).toBeGreaterThanOrEqual(5);
  }, 120_000);
});
