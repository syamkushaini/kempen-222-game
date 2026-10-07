import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { lastElection } from '../election';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { draftPact, signPact } from './diplomacy';
import {
  BLOC_FAMILIES, cleanLayers, DEFAULT_LAYERS, dominantFamily, FAMILY_IDS, LAYER_IDS, layerPins, machineryHeat, TARGETS, type LayerId,
} from './layers';

const world = getWorld('career')!;
const [PS, BP] = PARTY_IDS.map((_, i) => i);
const last = lastElection(world);
/** How the map shows the last election: the winner, the lead, and how firm. */
const display = last.seats.map((o) => {
  const shares = o.votes.map((v) => v / Math.max(1, o.valid));
  const sorted = [...shares].sort((a, b) => b - a);
  const margin = sorted[0] - sorted[1];
  return { winner: o.winner, margin, cls: margin < 0.04 ? 'marginal' : margin < 0.12 ? 'leaning' : 'safe', stale: false };
});
const lastWinners = last.seats.map((o) => ({ winner: o.winner }));
const on = (...ids: LayerId[]) => new Set(ids);
const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
const input = { world, campaign: c, display, last: lastWinners };

describe('map layers', () => {
  it('start with the tents and flags, as the map always had', () => {
    expect(DEFAULT_LAYERS).toEqual(['campaign']);
    expect(LAYER_IDS).toHaveLength(8);
  });

  it('read from storage keep only what is known, once each', () => {
    expect(cleanLayers(['marginal', 'nope', 'marginal', 3, 'blocs'])).toEqual(['marginal', 'blocs']);
    expect(cleanLayers(null)).toBeNull();
    expect(cleanLayers('marginal')).toBeNull();
    expect(cleanLayers([])).toEqual([]);
  });

  it('mark nothing when nothing is ticked', () => {
    expect(layerPins(input, on())).toEqual([]);
    expect(layerPins(input, on('campaign', 'machinery'))).toEqual([]);
  });

  it('mark the close seats, and only those', () => {
    const pins = layerPins(input, on('marginal'));
    const close = display.filter((d) => d.cls === 'marginal').length;
    expect(close).toBeGreaterThan(0);
    expect(pins).toHaveLength(close);
    expect(pins.every((p) => p.kind === 'ring' && p.layer === 'marginal')).toBe(true);
  });

  it('mark seats that have changed hands, in the old party’s colour', () => {
    const moved = display.map((d, i) => (i % 10 === 0 ? { ...d, winner: (d.winner + 1) % 3 } : d));
    const pins = layerPins({ ...input, display: moved }, on('flipped'));
    expect(pins).toHaveLength(moved.filter((d, i) => d.winner !== display[i].winner).length);
    for (const p of pins) {
      const i = world.seatIndex.get(p.seat)!;
      expect(p.party).toBe(display[i].winner);
    }
    // At the last election itself, nothing has changed hands.
    expect(layerPins(input, on('flipped'))).toEqual([]);
  });

  it('mark the player’s seats and their closest chances', () => {
    const pins = layerPins(input, on('mine'));
    const held = display.filter((d) => d.winner === PS).length;
    expect(pins.filter((p) => p.kind === 'square')).toHaveLength(held);
    const targets = pins.filter((p) => p.kind === 'bullseye');
    expect(targets).toHaveLength(TARGETS);
    // Every target is a seat someone else holds, and they are the closest of those.
    const margins = targets.map((p) => display[world.seatIndex.get(p.seat)!].margin);
    expect(targets.every((p) => display[world.seatIndex.get(p.seat)!].winner !== PS)).toBe(true);
    expect(Math.max(...margins)).toBeLessThanOrEqual(
      [...display.filter((d) => d.winner !== PS && d.winner >= 0).map((d) => d.margin)].sort((a, b) => a - b)[TARGETS + 20],
    );
  });

  it('mark seats with no fresh poll', () => {
    const fogged = display.map((d, i) => (i < 7 ? { ...d, stale: true } : d));
    expect(layerPins({ ...input, display: fogged }, on('unpolled'))).toHaveLength(7);
  });

  it('say which family of voters is largest in every seat', () => {
    const pins = layerPins(input, on('blocs'));
    expect(pins).toHaveLength(world.seats.length);
    expect(new Set(pins.map((p) => p.family))).toSatisfy((s: Set<string>) => s.size >= 3);
    for (const f of FAMILY_IDS) expect(BLOC_FAMILIES[f].length).toBeGreaterThan(0);
    // A seat of Borneo's interior is a Borneo seat.
    const sabah = world.seats.find((s) => s.blocs[11] > 0.5);
    if (sabah) expect(dominantFamily(sabah.blocs)).toBe('borneo');
  });

  it('show where the player stands aside, and where others stand aside for them', () => {
    const bp = structuredClone(c);
    signPact(world, bp, PS, BP, draftPact(world, bp, PS, BP, 'targeted', last));
    const pins = layerPins({ ...input, campaign: bp }, on('pacts'));
    expect(pins.length).toBeGreaterThan(0);
    expect(pins.every((p) => p.kind === 'down' || p.kind === 'up')).toBe(true);
    for (const p of pins) {
      const sd = bp.standDowns[p.seat];
      if (p.kind === 'down' && p.party === PS) expect(sd[PS]).toBeGreaterThanOrEqual(0);
      if (p.kind === 'up') expect(sd.some((v, q) => v === PS && q !== PS)).toBe(true);
    }
  });

  it('put several marks on one seat side by side', () => {
    const pins = layerPins(input, on('marginal', 'blocs'));
    const both = pins.filter((p) => p.of === 2);
    expect(both.length).toBeGreaterThan(0);
    for (const p of both) expect([0, 1]).toContain(p.slot);
  });

  it('show the strength of the branches, by seat, for a contest with more than one seat', () => {
    const heat = machineryHeat(world, c)!;
    expect(Object.keys(heat).length).toBeGreaterThan(100);
    for (const v of Object.values(heat)) { expect(v).toBeGreaterThan(0); expect(v).toBeLessThanOrEqual(1); }
    expect(machineryHeat(world, undefined)).toBeNull();
    expect(machineryHeat(getWorld('byelection')!, c)).toBeNull();
  });
});
