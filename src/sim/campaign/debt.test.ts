import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { answerEvent, startCareer, termWeek } from './career';
import { AFTER_BANKRUPT, DEBT_LADDER, debtWeek } from './debt';
import type { Campaign } from './types';

const [PS, BP] = PARTY_IDS.map((_, i) => i);
const world = getWorld('career')!;
const career = (player = PS): Campaign => { const c = startCareer(world, { player, difficulty: 'normal', seed: 5 }); c.inbox = []; return c; };

describe('the ladder of a debt that is not paid down', () => {
  it('puts the alarm to the head of the government once a parliament, and the crisis likewise', () => {
    const c = career();
    const k = c.career!;
    k.economy.debt = DEBT_LADDER.alarm + 1;
    expect(debtWeek(world, c)).toBe(false);
    expect(c.inbox.map((s) => s.event)).toEqual(['debtAlarm']);
    // Not again in the same parliament.
    c.inbox = [];
    debtWeek(world, c);
    expect(c.inbox).toHaveLength(0);
    k.economy.debt = DEBT_LADDER.crisis + 1;
    debtWeek(world, c);
    expect(c.inbox.map((s) => s.event)).toEqual(['debtCrisis']);
  });

  it('is bankruptcy at the top: the debt is restructured, the books are wiped and the government is out', () => {
    const c = career();
    const k = c.career!;
    k.economy.debt = DEBT_LADDER.bankrupt;
    k.fiscal = 6;
    k.treasury = 5e9;
    expect(debtWeek(world, c)).toBe(true);
    expect(k.economy.debt).toBe(AFTER_BANKRUPT);
    expect(k.fiscal).toBe(0);
    expect(k.treasury).toBe(0);
    expect(k.tabled.tax).toBe(1);
    expect(Object.values(k.tabled.lines).every((v) => v === -1)).toBe(true);
  });

  it('opens the talks for a government that goes bankrupt, whoever heads it', () => {
    for (const player of [PS, BP]) {
      const c = career(player);
      c.career!.economy.debt = DEBT_LADDER.bankrupt;
      termWeek(world, c);
      expect(c.phase).toBe('formation');
    }
  });

  it('lets the head of government take the bailout or restructure, and the stonewall can end in bankruptcy', () => {
    const accept = career();
    accept.career!.economy.debt = 108;
    debtWeek(world, accept);
    const scene = accept.inbox[0];
    answerEvent(world, accept, accept.inbox.splice(0, 1)[0], 0);
    expect(scene.event).toBe('debtCrisis');
    expect(accept.career!.economy.debt).toBeCloseTo(100, 5);
    expect(accept.career!.fiscal).toBe(0);
    const restructure = career();
    restructure.career!.economy.debt = 108;
    debtWeek(world, restructure);
    answerEvent(world, restructure, restructure.inbox.splice(0, 1)[0], 1);
    expect(restructure.career!.economy.debt).toBeCloseTo(93, 5);
  });

  it('rescues a government the player does not head without asking them', () => {
    const c = career(BP);
    c.career!.economy.debt = 108;
    c.career!.fiscal = 4;
    debtWeek(world, c);
    expect(c.inbox).toHaveLength(0);
    expect(c.career!.fiscal).toBe(0);
    expect(c.career!.economy.debt).toBeLessThan(108);
  });
});
