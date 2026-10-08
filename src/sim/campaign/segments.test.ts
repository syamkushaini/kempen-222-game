import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { projectElection } from '../election';
import { BLOC_IDS, PARTY_IDS, type BlocId } from '../types';
import { canDo, doAction, effectiveDynamics, expectedPitchGain, expectedSeatGain } from './actions';
import { MIN_SEGMENT, heard, pitchValue, resentful, segmentsIn } from './segments';
import { playWeek } from './ai';
import { truth } from './actions';
import { newCampaign } from './turn';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const world = getWorld('general')!;

const idx = (b: BlocId) => BLOC_IDS.indexOf(b);
/** A seat of ours where one group is a large part of the electorate. */
const seatWhere = (b: BlocId, min: number) => world.seats.find((s, i) => world.baseline.contesting[i][PS] && s.blocs[idx(b)] >= min);

const fresh = () => {
  const c = newCampaign(world, { player: PS, difficulty: 'normal', seed: 11 });
  c.parties[PS]!.funds = 1e9;
  return c;
};
/** Our votes in a seat after a ceramah, pitched as given. */
const votesAfter = (seatId: string, segment?: BlocId) => {
  const c = fresh();
  c.parties[PS]!.location = world.seats[world.seatIndex.get(seatId)!].state;
  doAction(world, c, PS, 'ceramah', segment ? { seat: seatId, segment } : { seat: seatId });
  return projectElection(world, effectiveDynamics(c), c.standDowns).seats[world.seatIndex.get(seatId)!].votes[PS];
};

describe('pitching an event to one voter group', () => {
  it('lands hardest on its target, softly on its own family, and against groups set against it', () => {
    expect(heard('heartland', 'heartland')).toBeGreaterThan(heard('heartland', 'felda'));
    expect(heard('heartland', 'felda')).toBeGreaterThan(0);
    expect(heard('heartland', 'urban_lib')).toBeLessThan(0);
    expect(heard('urban_lib', 'heartland')).toBeLessThan(0);
    expect(heard('undi18', 'seniors')).toBeLessThan(0);
  });

  it('is worth more than a plain ceramah where the group is most of the seat, and less where it is a sliver', () => {
    const big = seatWhere('heartland', 0.35)!;
    expect(big).toBeDefined();
    expect(pitchValue(big, 'heartland')).toBeGreaterThan(1);
    const small = segmentsIn(big).at(-1)!;
    expect(pitchValue(big, small)).toBeLessThan(1);
  });

  it('is not worth it to lean on the biggest group when a large group is set against it', () => {
    // A seat that is split between the countryside and the city: favouring either costs the other.
    const split = world.seats.find((s) => s.blocs[idx('heartland')] >= 0.25 && s.blocs[idx('urban_lib')] >= 0.2);
    if (!split) return;
    expect(resentful(split, 'heartland')).toContain('urban_lib');
    expect(pitchValue(split, 'heartland')).toBeLessThan(pitchValue(seatWhere('heartland', 0.5) ?? split, 'heartland'));
  });

  it('has a best and a worst pitch in a seat of ours: aiming at the right group beats a plain ceramah, the wrong one falls short', () => {
    const c = fresh();
    let better = 0, worse = 0, seats = 0;
    world.seats.forEach((seat, i) => {
      if (!world.baseline.contesting[i][PS]) return;
      seats++;
      const plain = expectedPitchGain(world, c, PS, 'ceramah', seat.id, null)!;
      const gains = segmentsIn(seat).map((b) => expectedPitchGain(world, c, PS, 'ceramah', seat.id, b)!);
      if (Math.max(...gains) > plain + 0.1) better++;
      if (Math.min(...gains) < plain - 0.1) worse++;
    });
    // Most seats have a group worth aiming at, and most also have a group that is a waste of the night.
    expect(better / seats).toBeGreaterThan(0.5);
    expect(worse / seats).toBeGreaterThan(0.5);
  });

  it('does in the real event what the forecast says: the pitch the forecast prefers moves more votes', () => {
    const c = fresh();
    let agreed = 0, tried = 0;
    for (const seat of world.seats.filter((_s, i) => world.baseline.contesting[i][PS]).slice(0, 40)) {
      const options = segmentsIn(seat).map((b) => ({ b, gain: expectedPitchGain(world, c, PS, 'ceramah', seat.id, b)! }));
      options.sort((x, y) => y.gain - x.gain);
      const best = options[0], worst = options.at(-1)!;
      if (best.gain - worst.gain < 0.5) continue;
      tried++;
      if (votesAfter(seat.id, best.b) > votesAfter(seat.id, worst.b)) agreed++;
    }
    expect(tried).toBeGreaterThan(10);
    expect(agreed).toBe(tried);
  });

  it('is refused for a group that is not in the seat, and for events that cannot be pitched', () => {
    const c = fresh();
    const seat = world.seats.find((s, i) => world.baseline.contesting[i][PS] && s.blocs[idx('borneo_native')] < MIN_SEGMENT)!;
    expect(canDo(world, c, PS, 'ceramah', { seat: seat.id, segment: 'borneo_native' })).toEqual({ ok: false, reason: 'noTarget' });
    const there = segmentsIn(seat)[0];
    expect(canDo(world, c, PS, 'ceramah', { seat: seat.id, segment: there }).ok).toBe(true);
  });

  it('shows what it expects, adjusted for the pitch, and survives a save', () => {
    const seat = seatWhere('heartland', 0.4)!;
    const c = fresh();
    const aimed = expectedSeatGain(world, c, PS, 'ceramah', seat.id, 'heartland')!;
    expect(aimed).toBe(expectedPitchGain(world, c, PS, 'ceramah', seat.id, 'heartland'));
    expect(expectedSeatGain(world, c, PS, 'tv', seat.id, 'heartland')).toBeNull();
    doAction(world, c, PS, 'ceramah', { seat: seat.id, segment: 'heartland' });
    expect(c.dyn.support.seatBloc?.[seat.id]).toBeDefined();
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
});

describe('rivals aiming their events', () => {
  it('pitch seat events to a group when they can read the race, and not on the easiest level', () => {
    const aimed = (difficulty: 'easy' | 'normal') => {
      const c = newCampaign(world, { player: PS, difficulty, seed: 4 });
      const PT = PARTY_IDS.indexOf('pt');
      let n = 0, total = 0;
      for (let w = 0; w < 3; w++) {
        for (const r of playWeek(world, c, PT, truth(world, c), [])) {
          if (r.id !== 'ceramah' && r.id !== 'walkabout' && r.id !== 'townhall') continue;
          total++;
          if (r.target.segment !== undefined) n++;
        }
        c.parties[PT]!.days = 7;
        c.parties[PT]!.used = {};
      }
      return { n, total };
    };
    const normal = aimed('normal');
    expect(normal.total).toBeGreaterThan(3);
    expect(normal.n).toBeGreaterThan(0);
    expect(aimed('easy').n).toBe(0);
  });
});
