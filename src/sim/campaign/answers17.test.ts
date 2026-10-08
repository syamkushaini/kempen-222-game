import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { BLOC_IDS, PARTY_IDS } from '../types';
import { ACTIONS, EFFECT, ONLINE, POSTURE, canDo, debateOdds, doAction, expectedPitchGain, saturation } from './actions';
import { startCareer } from './career';
import { OVERLAY_IDS, OVERLAY_MIX, addAimedPitch, isOverlay, resentfulOf, segmentShare, segmentsOf } from './segments';
import { newCampaign } from './turn';
import { OUTDOOR, WEATHER_EFFECT, inMonsoon, weatherFactor, weatherIn } from './weather';
import { ACTION_IDS, POSTURES } from './types';

const PS = PARTY_IDS.indexOf('ps');
const BP = PARTY_IDS.indexOf('bp');
const general = getWorld('general')!;
const fresh = (seed = 3) => newCampaign(general, { player: PS, difficulty: 'normal', seed });

describe('groups that are not one of the thirteen', () => {
  it('have a share of every seat worked out from the seat, and the right ones are on offer', () => {
    const coastal = general.seats.find((s) => s.state === 'kelantan' && s.kind === 'rural')!;
    const city = general.seats.find((s) => s.kind === 'urban')!;
    expect(segmentShare(coastal, 'fishers')).toBeGreaterThan(0);
    expect(segmentShare(city, 'fishers')).toBe(0);
    expect(segmentsOf(coastal)).toContain('fishers');
    expect(segmentsOf(city)).not.toContain('fishers');
    const rural = general.seats.find((s) => s.urbanity < 0.2)!;
    expect(segmentShare(rural, 'ruralYouth')).toBeGreaterThan(segmentShare(city, 'ruralYouth'));
    // The undecided are most where the last result was close.
    const close = [...general.seats].sort((a, b) => margin(a) - margin(b));
    expect(segmentShare(close[0], 'swing')).toBeGreaterThan(segmentShare(close[close.length - 1], 'swing'));
    for (const id of OVERLAY_IDS) { expect(isOverlay(id)).toBe(true); expect(STRINGS.en[`bloc.${id}` as StringKey]).toBeTruthy(); expect(STRINGS.ms[`bloc.${id}` as StringKey]).toBeTruthy(); }
  });
  it('can be pitched to, in a seat that has them, and not elsewhere', () => {
    const c = fresh();
    c.parties[PS]!.days = 7;
    c.parties[PS]!.funds = 5_000_000;
    const seat = general.seats.find((s, i) => s.state === 'kelantan' && general.baseline.contesting[i][PS] && segmentShare(s, 'fishers') >= 0.03)!;
    const city = general.seats.find((s, i) => s.kind === 'urban' && general.baseline.contesting[i][PS])!;
    expect(canDo(general, c, PS, 'ceramah', { seat: seat.id, segment: 'fishers' }).ok).toBe(true);
    expect(canDo(general, c, PS, 'ceramah', { seat: city.id, segment: 'fishers' })).toEqual({ ok: false, reason: 'noTarget' });
    // And not for television, which is aimed at the thirteen only.
    expect(canDo(general, c, PS, 'tv', { segment: 'fishers' })).toEqual({ ok: false, reason: 'noTarget' });
    const before = c.dyn.support.seat[seat.id]?.[PS] ?? 0;
    doAction(general, c, PS, 'ceramah', { seat: seat.id, segment: 'fishers' });
    expect(c.dyn.support.seatBloc![seat.id][BLOC_IDS.indexOf('agri')][PS]).toBeGreaterThan(0);
    expect(c.dyn.support.seat[seat.id]?.[PS] ?? 0).toBeGreaterThan(before);
    expect(Math.abs(OVERLAY_MIX.fishers.agri! + OVERLAY_MIX.fishers.heartland! + OVERLAY_MIX.fishers.borneo_native! - 1)).toBeLessThan(1e-9);
    expect(expectedPitchGain(general, c, PS, 'ceramah', seat.id, 'fishers')).not.toBeNull();
    expect(resentfulOf(seat, 'swing')).toEqual([]);
    expect(addAimedPitch(c.dyn, seat, PS, 'swing', 0.1, 1)).toBeGreaterThan(0.05);
  });
});
const margin = (s: (typeof general.seats)[number]) => {
  const v = [...s.last.votes].sort((a, b) => b - a);
  return (v[0] - (v[1] ?? 0)) / v.reduce((a, b) => a + b, 0);
};

describe('a debate as a game of choices', () => {
  const career = () => startCareer(getWorld('career')!, { player: PS, difficulty: 'normal', seed: 5 });
  it('is won more on a question the party’s line is the country’s on, and the way of answering counts', () => {
    const world = getWorld('career')!;
    const c = career();
    const k = c.career!;
    // Make the party’s line on wages and the rival’s opposite, with a country that cares.
    k.stances[PS][1] = 2; k.stances[BP][1] = -2;
    const same = debateOdds(world, c, PS, BP);
    const onIt = debateOdds(world, c, PS, BP, 'wages', 'policy');
    expect(onIt).not.toBe(same);
    k.stances[PS][1] = -2; k.stances[BP][1] = 2;
    const against = debateOdds(world, c, PS, BP, 'wages', 'policy');
    expect(against).not.toBe(onIt);
    expect(onIt - against).toBeGreaterThan(0.05);
    // Substance counts double only under that posture.
    k.stances[PS][1] = 2; k.stances[BP][1] = -2;
    const warm = debateOdds(world, c, PS, BP, 'wages', 'warm');
    expect(Math.abs(onIt - same)).toBeGreaterThan(Math.abs(warm - same) - 0.07);
    expect(POSTURES).toHaveLength(3);
    for (const x of POSTURES) { expect(POSTURE[x]).toBeDefined(); for (const key of [`debate.posture.${x}`, `debate.posture.${x}.desc`] as StringKey[]) { expect(STRINGS.en[key]).toBeTruthy(); expect(STRINGS.ms[key]).toBeTruthy(); } }
    expect(debateOdds(world, c, PS, BP, 'wages', 'attack')).toBeLessThan(debateOdds(world, c, PS, BP, 'wages', 'policy'));
  });
  it('is the same as it was when no question is chosen', () => {
    const c = fresh();
    const odds = debateOdds(general, c, PS, BP);
    expect(odds).toBeGreaterThanOrEqual(0.12);
    expect(odds).toBeLessThanOrEqual(0.85);
    expect(debateOdds(general, c, PS, BP, undefined, 'policy')).toBe(odds);
  });
  it('can be played with any posture', () => {
    for (const posture of POSTURES) {
      const c = fresh();
      c.parties[PS]!.days = 7;
      const report = doAction(general, c, PS, 'debate', { party: BP, topic: 'wages', posture });
      expect(['great', 'weak']).toContain(report.quality);
    }
  });
});

describe('cybertroopers', () => {
  it('are cheap and work, but come out more often each time, and then cost the voters and the leader’s name', () => {
    expect(ACTION_IDS).toContain('troops');
    expect(ACTIONS.troops.target).toBe('party');
    let exposed = 0, worked = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const c = structuredClone(fresh(seed));
      c.parties[PS]!.days = 7; c.parties[PS]!.funds = 5_000_000;
      const nat = c.dyn.support.nat.map((r) => r[BP]).reduce((a, b) => a + b, 0);
      const r = doAction(general, c, PS, 'troops', { party: BP });
      if (r.quality === 'backfire') { exposed++; expect(c.dyn.support.nat.map((x) => x[PS]).reduce((a, b) => a + b, 0)).toBeLessThan(0); }
      else { worked++; expect(c.dyn.support.nat.map((x) => x[BP]).reduce((a, b) => a + b, 0)).toBeLessThan(nat); }
    }
    expect(exposed).toBeGreaterThan(2);
    expect(worked).toBeGreaterThan(10);
    expect(EFFECT.troopsExposed + EFFECT.troopsStep * 3).toBeGreaterThan(EFFECT.troopsExposed);
  });
  it('are likelier to be found out the more they have been used', () => {
    const rate = (plays: number) => {
      let n = 0;
      for (let seed = 1; seed <= 60; seed++) {
        const c = structuredClone(fresh(seed));
        c.parties[PS]!.days = 7; c.parties[PS]!.funds = 5_000_000;
        c.parties[PS]!.plays = { troops: plays };
        if (doAction(general, c, PS, 'troops', { party: BP }).quality === 'backfire') n++;
      }
      return n;
    };
    expect(rate(3)).toBeGreaterThan(rate(0));
  });
  it('cost the leader’s credibility when they come out, in a career', () => {
    const world = getWorld('career')!;
    let seen = false;
    for (let seed = 1; seed <= 40 && !seen; seed++) {
      const c = startCareer(world, { player: PS, difficulty: 'normal', seed });
      c.phase = 'campaign'; c.week = 1; c.totalWeeks = 5; c.parties[PS]!.days = 7; c.parties[PS]!.funds = 5_000_000; c.parties[PS]!.plays = { troops: 4 };
      const cred = c.career!.credibility;
      if (doAction(world, c, PS, 'troops', { party: BP }).quality === 'backfire') { seen = true; expect(c.career!.credibility).toBe(cred - EFFECT.troopsCred); }
    }
    expect(seen).toBe(true);
  });
});

describe('what is done on a phone', () => {
  it('wears the audience out: each one in a week is worth less than the last', () => {
    const c = fresh();
    c.parties[PS]!.days = 7; c.parties[PS]!.funds = 5_000_000;
    expect(ONLINE).toEqual(['social', 'troops']);
    expect(saturation(c.parties[PS]!)).toBe(1);
    c.parties[PS]!.used.online = 1;
    expect(saturation(c.parties[PS]!)).toBe(1);
    c.parties[PS]!.used.online = 3;
    expect(saturation(c.parties[PS]!)).toBeCloseTo(EFFECT.online ** 2, 9);
    doAction(general, c, PS, 'social', {});
    expect(c.parties[PS]!.used.online).toBe(4);
  });
});

describe('the weather', () => {
  it('is the same for everyone and every look, and varies by week and place', () => {
    const c = fresh();
    expect(weatherIn(general, c, 'kelantan')).toBe(weatherIn(general, c, 'kelantan'));
    const seen = new Set<string>();
    for (let w = 1; w <= 200; w++) { c.week = w; seen.add(weatherIn(general, c, 'kelantan')); }
    expect([...seen].sort()).toEqual(['fair', 'flood', 'rain']);
  });
  it('is wetter on the east coast in the monsoon, and spares what is done indoors', () => {
    const count = (monsoon: boolean) => {
      let wet = 0;
      for (let seed = 0; seed < 40; seed++) {
        const c = fresh();
        c.seed = monsoon ? seed * 10 : seed * 10 + 5;
        expect(inMonsoon(c)).toBe(monsoon);
        for (let w = 1; w <= 20; w++) { c.week = w; if (weatherIn(general, c, 'kelantan') !== 'fair') wet++; }
      }
      return wet;
    };
    expect(count(true)).toBeGreaterThan(count(false) * 1.4);
    expect(OUTDOOR).toContain('ceramah');
    expect(OUTDOOR).not.toContain('townhall');
    expect(OUTDOOR).not.toContain('social');
    expect(WEATHER_EFFECT.flood).toBeLessThan(WEATHER_EFFECT.rain);
    const c = fresh();
    expect(weatherFactor(general, c, 'townhall', 'kelantan')).toBe(1);
    expect(weatherFactor(general, c, 'ceramah', null)).toBe(1);
  });
  it('thins a rally in the rain', () => {
    const seat = general.seats.find((s, i) => s.state === 'kelantan' && general.baseline.contesting[i][PS])!;
    const lift = (weatherWeek: 'fair' | 'flood') => {
      for (let w = 1; w < 400; w++) {
        const c = fresh();
        c.week = w;
        if (weatherIn(general, c, 'kelantan') !== weatherWeek) continue;
        c.parties[PS]!.days = 7; c.parties[PS]!.funds = 5_000_000;
        doAction(general, c, PS, 'ceramah', { seat: seat.id });
        return { lift: c.dyn.support.seat[seat.id]![PS], c };
      }
      throw new Error('no such week');
    };
    // The luck of the day is the same: the same seed gives the same roll before the sky is applied.
    const fair = lift('fair'), flood = lift('flood');
    expect(fair.lift).toBeGreaterThan(0);
    expect(flood.lift).toBeLessThan(fair.lift);
  });
  it('has words in both languages', () => {
    for (const key of ['weather.fair', 'weather.rain', 'weather.flood', 'action.troops', 'action.troops.desc', 'news.me.troops.ok', 'news.me.troops.backfire', 'debate.prep', 'debate.odds'] as StringKey[]) {
      expect(STRINGS.en[key], key).toBeTruthy();
      expect(STRINGS.ms[key], key).toBeTruthy();
    }
  });
});
