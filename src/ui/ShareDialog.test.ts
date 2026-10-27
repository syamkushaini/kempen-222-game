import { describe, expect, it } from 'vitest';
import { getWorld } from '../data/world';
import { startCareer } from '../sim/campaign/career';
import { legacyOf } from '../sim/campaign/legacy';
import { summarise } from './../sim/campaign/night';
import { lastElection } from '../sim/election';
import { seatName, type Format } from './hooks';
import { electionCard, biggestUpset } from './ShareDialog';
import { translate, type StringKey } from '../i18n/strings';
import { PARTY_IDS } from '../sim/types';

const world = getWorld('career')!;
const PS = PARTY_IDS.indexOf('ps');
const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
const t = (key: StringKey, vars?: Record<string, string | number>) => translate('en', key, vars);
const f: Format = { int: String, pct: (x, d = 1) => `${(x * 100).toFixed(d)}%`, rm: (n) => `RM${Math.round(n)}`, days: String, time: String, dateTime: String };

describe('biggestUpset', () => {
  it('finds nothing where the result matches what came before', () => {
    expect(biggestUpset(world, c, lastElection(world))).toBeNull();
  });

  it('names the seat with the widest margin flipped to the player', () => {
    const before = lastElection(world);
    const i = before.seats.findIndex((s) => s.winner !== PS);
    const result = { ...before, seats: before.seats.map((s, j) => (j === i ? { ...s, winner: PS } : s)) };
    expect(biggestUpset(world, c, result)).toBe(seatName(world, before.seats[i].seatId));
  });
});

describe('electionCard', () => {
  it('carries the player’s current political persona as a badge', () => {
    const result = lastElection(world);
    const summary = summarise(world, c, result);
    const card = electionCard(t, f, world, c, result, summary);
    expect(card.badges).toContain(t(`legacy.${legacyOf(c).legacy}` as StringKey));
  });
});
