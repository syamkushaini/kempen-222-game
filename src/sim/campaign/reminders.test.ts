import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { remindersOf } from './reminders';
import type { Campaign } from './types';

const PS = PARTY_IDS.indexOf('ps');
const world = getWorld('career')!;
const career = (): Campaign => { const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 }); c.inbox = []; return c; };
const ids = (c: Campaign) => remindersOf(world, c).map((r) => r.id);

describe('things the player may have missed', () => {
  it('says nothing about a game that is going quietly', () => {
    const c = career();
    c.career!.week = 10;
    c.career!.appointments = [];
    c.team.staff[0] = { name: 0, skill: 3, wage: 1 } as never;
    expect(remindersOf(world, c).filter((r) => r.level !== 'note')).toEqual([]);
  });

  it('tells the head of government that budget day is near and the plan is untouched', () => {
    const c = career();
    c.career!.week = 35;
    expect(ids(c)).toContain('budget');
    c.career!.budget.lines.health = 1;
    expect(ids(c)).not.toContain('budget');
    c.career!.week = 10;
    expect(ids(c)).not.toContain('budget');
  });

  it('warns of posts waiting, a manifesto not out, a debt climbing and money running out, most pressing first', () => {
    const c = career();
    const k = c.career!;
    k.week = k.length - 15;
    k.appointments = [{ portfolio: 'health', options: [] }];
    k.economy.debt = 97;
    expect(ids(c)).toEqual(expect.arrayContaining(['appoint', 'manifesto', 'debt']));
    const levels = remindersOf(world, c).map((r) => r.level);
    expect(levels).toEqual([...levels].sort((a, b) => ['urgent', 'warn', 'note'].indexOf(a) - ['urgent', 'warn', 'note'].indexOf(b)));
    c.parties[PS]!.funds = 1;
    k.orders.budget = { machinery: 3, media: 3, research: 3 };
    expect(ids(c)).toContain('funds');
  });

  it('reminds a campaign of the candidates it has not chosen, until nomination closes', () => {
    const c = career();
    c.phase = 'campaign';
    c.week = 1;
    c.team.keySeats = [{ seat: 'P.001', options: [], pick: null } as never, { seat: 'P.002', options: [], pick: 0 } as never];
    const r = remindersOf(world, c).find((x) => x.id === 'candidates')!;
    expect(r.vars?.n).toBe(1);
    c.team.keySeats.forEach((s) => { s.pick = 0; });
    expect(ids(c)).not.toContain('candidates');
  });
});
