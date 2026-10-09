import { describe, expect, it } from 'vitest';
import { getWorld, worldOf } from '../../data/world';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { answerEvent, nextTerm, resumeTerm, skipAhead, startCareer, termWeek } from './career';
import { factionsOf } from './factions';
import { endDay } from './formation';
import { ACTIVITIES, activityWait, canDoActivity, doActivity } from './party';
import { canAid } from './sectors';
import { carryStamps, dropStale } from './stamps';
import { closeNight, endWeek } from './turn';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const base = getWorld('career')!;
const career = (seed = 5): Campaign => {
  const c = startCareer(base, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  c.parties[PS]!.funds = scaled(base, 5_000_000);
  return c;
};

describe('what was marked with a week of the last parliament', () => {
  it('is moved back by the weeks gone by, so the wait is what is left of it and no more', () => {
    const c = career();
    const k = c.career!;
    k.week = 250;
    k.activity = { recruit: 245, assembly: 120 };
    k.sectorAid = { oil: 248 };
    k.echoes = [{ week: 255, event: 'flood', kind: 'good' }];
    carryStamps(k, 260);
    k.week = 1;
    expect(activityWait(c, 'recruit')).toBe(ACTIVITIES.recruit.every - 16);
    expect(activityWait(c, 'assembly')).toBe(0);
    expect(k.sectorAid.oil).toBe(-12);
    expect(k.echoes[0].week).toBe(-5);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('is not believed when it is later than this week, as an older save has it, and is dropped when the week turns', () => {
    const c = career();
    const k = c.career!;
    k.week = 18;
    k.activity = { recruit: 231, school: 231, assembly: 172 };
    k.sectorAid = { oil: 240 };
    for (const id of ['recruit', 'school', 'assembly'] as const) {
      expect(activityWait(c, id)).toBe(0);
      expect(canDoActivity(base, c, id)).toEqual({ ok: true });
    }
    k.government.pm = PS;
    expect(canAid(base, c, 'oil')).toEqual({ ok: true });
    dropStale(k);
    expect(k.activity).toEqual({});
    expect(k.sectorAid).toEqual({});
    // A mark of this parliament is left alone.
    expect(doActivity(base, c, 'recruit')).toBe(true);
    c.inbox = [];
    termWeek(base, c);
    expect(k.activity.recruit).toBe(18);
    expect(activityWait(c, 'recruit')).toBeGreaterThan(0);
  });

  it('never keeps the party waiting longer than the rule says, in the parliament after an election', () => {
    const c = career();
    let world = base;
    let done = false;
    for (let g = 0; g < 4000 && c.phase !== 'campaign'; g++) {
      if (c.phase !== 'term') { if (c.phase === 'done') resumeTerm(c); else if (c.phase === 'formation') endDay(world, c); continue; }
      factionsOf(c).mood = [95, 95, 95]; factionsOf(c).wing = [95, 95, 95];
      c.parties[PS]!.unity = Math.max(c.parties[PS]!.unity, 70);
      if (c.inbox.length) { answerEvent(world, c, c.inbox.shift()!, 0); continue; }
      // Late in the term, the party holds a drive and a school.
      if (!done && c.career!.week > c.career!.length - 30) { c.parties[PS]!.funds = scaled(world, 5_000_000); done = doActivity(world, c, 'recruit') && doActivity(world, c, 'school'); }
      skipAhead(world, c, done ? 1 : 13);
    }
    expect(done).toBe(true);
    while (c.phase === 'campaign') endWeek(world, c);
    closeNight(world, c);
    for (let d = 0; d < 10 && c.phase === 'formation'; d++) endDay(world, c);
    expect(nextTerm(world, c)).toBe(true);
    world = worldOf(c)!;
    expect(c.career!.week).toBe(1);
    for (const id of ['recruit', 'school', 'assembly'] as const) expect(activityWait(c, id)).toBeLessThanOrEqual(ACTIVITIES[id].every);
    for (const mark of Object.values(c.career!.activity ?? {})) expect(mark).toBeLessThan(1);
    for (const e of c.career!.echoes ?? []) expect(e.week).toBeLessThanOrEqual(1 + 10);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  }, 60_000);
});
