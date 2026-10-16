import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { OUSTED_BELOW } from './legacy';
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

  it('warns well before the party removes its leader, urgently when it is close, and says nothing while it is steady', () => {
    const c = career();
    c.career!.week = 10;
    c.career!.appointments = [];
    const me = c.parties[PS]!;
    me.unity = OUSTED_BELOW + 30;
    expect(ids(c)).not.toContain('oust');
    me.unity = OUSTED_BELOW + 15;
    expect(remindersOf(world, c).find((r) => r.id === 'oust')).toMatchObject({ level: 'warn', tab: 'party', vars: { unity: OUSTED_BELOW + 15, limit: OUSTED_BELOW } });
    me.unity = OUSTED_BELOW + 5;
    expect(remindersOf(world, c).find((r) => r.id === 'oust')?.level).toBe('urgent');
  });

  it('tells a leader held to a term limit that the party governs and they do not', () => {
    const c = career();
    const k = c.career!;
    k.week = 10;
    k.appointments = [];
    expect(ids(c)).not.toContain('limited');
    k.limited = true;
    expect(remindersOf(world, c).find((r) => r.id === 'limited')).toMatchObject({ level: 'note', tab: 'party' });
    // Only for the leader of the governing party: not for someone across the floor.
    k.government.pm = PARTY_IDS.indexOf('bp');
    expect(ids(c)).not.toContain('limited');
  });

  it('has words in both languages for each', () => {
    for (const lang of ['en', 'ms'] as const) for (const id of ['oust', 'limited']) expect(STRINGS[lang][`remind.${id}` as StringKey], `${lang} ${id}`).toBeTruthy();
    // The briefing words them its own way: an urgent one as 'a', the rest as 'w'.
    for (const lang of ['en', 'ms'] as const) for (const key of ['brief.a.oust', 'brief.w.oust', 'brief.w.limited']) expect(STRINGS[lang][key as StringKey], `${lang} ${key}`).toBeTruthy();
    expect(STRINGS.en['remind.oust' as StringKey]).toContain('{unity}');
    expect(STRINGS.ms['remind.oust' as StringKey]).toContain('{limit}');
  });
});
