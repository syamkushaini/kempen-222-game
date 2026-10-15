import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { emptyProfile, hang, legacyEntry } from '../../state/profile';
import { newGame } from '../../state/game';
import { PARTY_IDS } from '../types';
import { inGovernment, skipAhead, startCareer } from './career';
import { endCareer, OUSTED_BELOW, retire } from './legacy';
import { canSwitch, SWITCH_COST, switchParty, takers } from './switching';
import { isValidCampaign } from './validate';
import type { Campaign } from './types';

const [PS, BP] = ['ps', 'bp'].map((id) => PARTY_IDS.indexOf(id as (typeof PARTY_IDS)[number]));
const world = getWorld('career')!;
const ousted = (): Campaign => {
  const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
  c.career!.obligations = [];
  c.parties[PS]!.unity = OUSTED_BELOW - 1;
  endCareer(c, 'ousted');
  return c;
};

describe('joining another party after being removed from your own', () => {
  it('is possible only for a leader their own party removed', () => {
    const live = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
    expect(canSwitch(live)).toBe(false);
    expect(takers(world, live)).toEqual([]);
    expect(switchParty(world, live, BP)).toBe(false);
    retire(live);
    expect(canSwitch(live)).toBe(false);
    const c = ousted();
    expect(canSwitch(c)).toBe(true);
    expect(takers(world, c)).not.toContain(PS);
    expect(takers(world, c)).toContain(BP);
    expect(switchParty(world, c, PS)).toBe(false);
    expect(c.career!.ending).not.toBeNull();
  });

  it('puts the leader at the head of the new party, with a lower word and little faith behind them', () => {
    const c = ousted();
    const word = c.career!.credibility;
    expect(switchParty(world, c, BP)).toBe(true);
    const k = c.career!;
    expect(c.player).toBe(BP);
    expect(k.ending).toBeNull();
    expect(k.credibility).toBe(word - SWITCH_COST.credibility);
    expect(c.parties[BP]!.unity).toBeLessThanOrEqual(SWITCH_COST.unity);
    expect(k.previous).toEqual([{ party: PS, term: 1, week: k.week }]);
    expect(k.govRun).toBe(inGovernment(c, BP) ? 1 : 0);
    expect(k.promises).toEqual(k.manifesto[BP]);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });

  it('lets the career go on, through the rest of the term and into the election', () => {
    const c = ousted();
    switchParty(world, c, BP);
    c.parties[BP]!.unity = 60;
    for (let i = 0; i < 40 && c.phase === 'term' && !c.career!.ending; i++) {
      c.inbox = [];
      skipAhead(world, c, 10);
    }
    expect(c.career!.ending?.kind).not.toBe('ousted');
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  }, 60_000);

  it('can happen again if the new party removes the leader too', () => {
    const c = ousted();
    switchParty(world, c, BP);
    c.parties[BP]!.unity = OUSTED_BELOW - 1;
    endCareer(c, 'ousted');
    expect(switchParty(world, c, PS)).toBe(true);
    expect(c.career!.previous).toHaveLength(2);
  });

  it('keeps one place in the gallery, brought up to date when the career really ends', () => {
    const c = ousted();
    const g = newGame('Test', c, 1000);
    const first = legacyEntry(g, 10)!;
    const profile = hang(emptyProfile(), first);
    expect(profile.legacies).toHaveLength(1);
    expect(hang(profile, legacyEntry(g, 20)!)).toBe(profile);
    switchParty(world, c, BP);
    retire(c);
    const later = hang(profile, legacyEntry(newGame('Test', c, 1000), 30)!);
    expect(later.legacies).toHaveLength(1);
    expect(later.legacies[0].kind).toBe('retired');
    expect(later.legacies[0].party).toBe('bp');
  });
});
