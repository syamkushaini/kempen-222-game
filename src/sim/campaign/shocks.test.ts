import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { answerEvent, startCareer } from './career';
import { raise, rollEvent } from './events';
import { Rng } from '../rng';
import { treasuryOf } from './treasury';
import type { Campaign } from './types';

const PS = PARTY_IDS.indexOf('ps');
const world = getWorld('career')!;
const career = (): Campaign => { const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 }); c.inbox = []; c.career!.appointments = []; return c; };
const answer = (c: Campaign, event: string, choice: number) => {
  raise(c, event);
  const scene = c.inbox.find((s) => s.event === event)!;
  c.inbox = c.inbox.filter((s) => s !== scene);
  answerEvent(world, c, scene, choice);
};

describe('booms and busts that give notice', () => {
  it('chain a warning to the day itself, whichever way the leader answers', () => {
    for (const [warn, next] of [['boomWarn', 'boom'], ['stormWarn', null]] as const) {
      for (const choice of [0, 1, 2]) {
        const c = career();
        answer(c, warn, choice);
        const queued = c.career!.queue.map((q) => q.event);
        expect(queued).toHaveLength(1);
        if (next) expect(queued).toEqual([next]);
        else expect(['dip', 'crash']).toContain(queued[0]);
        // The day arrives nine weeks on.
        c.career!.week += 9;
        c.career!.quietUntil = 0;
        expect(rollEvent(c, new Rng(1))).toBe(true);
        expect(c.inbox.some((s) => s.event === queued[0])).toBe(true);
      }
    }
  });

  it('lets a buffer soften the storm and carrying on harden it', () => {
    const buffer = career(); answer(buffer, 'stormWarn', 0);
    const carry = career(); answer(carry, 'stormWarn', 1);
    expect(buffer.career!.queue[0].event).toBe('dip');
    expect(carry.career!.queue[0].event).toBe('crash');
  });

  it('asks what to do with a windfall: bank it, pay the debt, spend it or cut taxes', () => {
    const bank = career(); const t0 = treasuryOf(bank); answer(bank, 'boom', 0);
    expect(treasuryOf(bank)).toBeGreaterThan(t0);
    const pay = career(); const d0 = pay.career!.economy.debt; answer(pay, 'boom', 1);
    expect(pay.career!.economy.debt).toBeLessThan(d0);
    const spend = career(); const f0 = spend.career!.fiscal; const m0 = spend.career!.economy.growth; answer(spend, 'boom', 2);
    expect(spend.career!.fiscal).toBeGreaterThan(f0);
    expect(spend.career!.economy.growth).toBeGreaterThan(m0);
    const cut = career(); const g0 = cut.career!.economy.growth; answer(cut, 'boom', 3);
    expect(cut.career!.economy.growth).toBeGreaterThan(g0);
  });

  it('asks how to meet a shock: stimulus, austerity or a bank rescue, each with its price', () => {
    const stimulus = career(); const d0 = stimulus.career!.economy.debt; answer(stimulus, 'crash', 0);
    expect(stimulus.career!.economy.debt).toBeGreaterThan(d0);
    const austere = career(); const f0 = austere.career!.fiscal = 3; answer(austere, 'crash', 1);
    expect(austere.career!.fiscal).toBeLessThan(f0);
    const rescue = career(); const t0 = rescue.career!.government.trust; answer(rescue, 'crash', 2);
    expect(rescue.career!.government.trust).toBeLessThan(t0);
    const dip = career(); const g0 = dip.career!.economy.growth; answer(dip, 'dip', 1);
    expect(dip.career!.economy.growth).toBeLessThan(g0);
  });
});
