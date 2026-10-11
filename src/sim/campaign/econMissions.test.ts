import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { Rng } from '../rng';
import { acceptMission, isEconomic, missionsOf, missionsWeek, progressOf, rewardOf } from './missions';
import { repayDebt, treasuryCap } from './treasury';
import type { Mission } from './types';

const PS = PARTY_IDS.indexOf('ps'), PT = PARTY_IDS.indexOf('pt');
const world = getWorld('career')!;
const career = (player = PS) => { const c = startCareer(world, { player, difficulty: 'normal', seed: 5 }); c.inbox = []; return c; };
const offer = (c: ReturnType<typeof career>, m: Partial<Mission> & Pick<Mission, 'kind' | 'need'>): number => {
  const ms = missionsOf(c);
  ms.seq += 1;
  ms.offers.push({ id: ms.seq, main: false, tier: 1, weeks: 26, ...m } as Mission);
  expect(acceptMission(c, ms.seq)).toBe(true);
  return ms.seq;
};

describe('economic missions', () => {
  it('know which kinds are about the economy, and pay in public trust and a good name', () => {
    for (const k of ['debt', 'treasury', 'health', 'education', 'standing'] as const) expect(isEconomic(k)).toBe(true);
    expect(isEconomic('funds')).toBe(false);
    const r = rewardOf({ kind: 'debt', tier: 2, main: false });
    expect(r).toEqual([{ t: 'cred', n: 4 }, { t: 'trust', n: 4 }]);
  });

  it('judge the debt by how far it has fallen since the mission was taken', () => {
    const c = career();
    const k = c.career!;
    k.economy.debt = 63;
    const id = offer(c, { kind: 'debt', need: 1 });
    const m = missionsOf(c).active.find((a) => a.id === id)!;
    expect(m.from).toBe(63);
    expect(progressOf(world, c, m)).toEqual({ have: 0, need: 1 });
    k.treasury = treasuryCap(world, c);
    expect(repayDebt(world, c, treasuryCap(world, c))).toBe(true);
    const p = progressOf(world, c, m);
    expect(p.have).toBeGreaterThan(0);
    expect(p.have).toBeLessThan(63 - 30);
  });

  it('judge the treasury by how full it is, and the nation by its figures', () => {
    const c = career();
    const k = c.career!;
    k.treasury = 0;
    const t = missionsOf(c); void t;
    const a = offer(c, { kind: 'treasury', need: 50 });
    const b = offer(c, { kind: 'health', need: 60 });
    const act = missionsOf(c).active;
    expect(progressOf(world, c, act.find((x) => x.id === a)!).have).toBe(0);
    k.treasury = treasuryCap(world, c) / 2;
    expect(progressOf(world, c, act.find((x) => x.id === a)!).have).toBe(50);
    k.nation = { health: 61, education: 55, standing: 55 };
    expect(progressOf(world, c, act.find((x) => x.id === b)!)).toEqual({ have: 61, need: 60 });
  });

  it('are offered only to a party in government', () => {
    const seenBy = (player: number) => {
      const c = career(player);
      const rng = new Rng(7);
      const kinds = new Set<string>();
      for (let w = 1; w <= 800; w++) {
        c.career!.week = w;
        c.inbox = [];
        missionsWeek(world, c, rng);
        for (const o of missionsOf(c).offers) kinds.add(o.kind);
        // Turn every offer down at once so that new ones keep coming.
        missionsOf(c).offers = [];
        missionsOf(c).active = [];
      }
      return kinds;
    };
    expect([...seenBy(PS)].some((k) => isEconomic(k as never))).toBe(true);
    expect([...seenBy(PT)].some((k) => isEconomic(k as never))).toBe(false);
  });
});
