import { describe, expect, it } from 'vitest';
import { getWorld, worldOf } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { answerEvent, beginCampaign, nextTerm, resumeTerm, skipAhead, startCareer, LEADER_OUT } from './career';
import { CHOOSE_DAYS, LEADER_LIFT, candidatesWeek, canOpen, canStand, choose, openSeat, standLeader } from './candidates';
import { factionsOf } from './factions';
import { endDay } from './formation';
import { recordResults } from './results';
import { closeNight, endWeek, newCampaign } from './turn';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const base = getWorld('career')!;
const campaign = (seed = 5): Campaign => {
  const c = startCareer(base, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  beginCampaign(base, c);
  return c;
};
const seatsOf = (_c: Campaign) => base.seats.filter((_, i) => base.baseline.contesting[i][PS]).map((s) => s.id);

describe('every seat has a candidate', () => {
  it('the party’s own choice in every seat it stands in that the leader is not choosing for, with pasts only now and then', () => {
    const c = campaign();
    const d = c.team.defaults!;
    const keys = new Set(c.team.keySeats.map((k) => k.seat));
    expect(Object.keys(d).length + keys.size).toBeGreaterThanOrEqual(seatsOf(c).length - 1);
    for (const id of keys) expect(d[id]).toBeUndefined();
    const bad = Object.values(d).filter((h) => h.skeleton).length / Object.keys(d).length;
    expect(bad).toBeLessThan(0.12);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('the leader can open any of them for half a day, and the hopefuls come forward as in the seats that matter most', () => {
    const c = campaign();
    const seat = Object.keys(c.team.defaults!)[0];
    const days = c.parties[PS]!.days;
    expect(canOpen(base, c, seat)).toBe(true);
    expect(openSeat(base, c, seat)).toBe(true);
    expect(c.parties[PS]!.days).toBe(days - CHOOSE_DAYS);
    const key = c.team.keySeats.find((k) => k.seat === seat)!;
    expect(key.options).toHaveLength(3);
    expect(canOpen(base, c, seat)).toBe(true); // the party’s choice stays until the leader picks
    expect(choose(base, c, seat, 0)).toBe(true);
    expect(c.team.defaults![seat]).toBeUndefined();
    expect(canOpen(base, c, seat)).toBe(false);
    c.parties[PS]!.days = 0;
    expect(canOpen(base, c, Object.keys(c.team.defaults!)[0])).toBe(false);
  });

  it('the party’s own choices are found out now and then, together, and it costs the seat', () => {
    let found = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const c = campaign(seed);
      for (const h of Object.values(c.team.defaults!)) h.skeleton = true;
      const rng = new Rng(seed);
      for (let w = 0; w < 4; w++) candidatesWeek(c, rng);
      if (c.news.some((n) => n.key === 'news.candidate.scandals')) found++;
    }
    expect(found).toBeGreaterThan(15);
    for (const lang of ['en', 'ms'] as const) for (const k of ['slate.party', 'slate.open', 'slate.stand', 'news.candidate.scandals', 'news.leader.lost.pm']) expect(STRINGS[lang][k as StringKey], k).toBeTruthy();
  });
});

describe('the leader standing in a seat of their own', () => {
  it('draws voters there, once, before nomination day', () => {
    const c = campaign();
    const seat = seatsOf(c)[0];
    const before = c.held?.support.seat[seat]?.[PS] ?? 0;
    expect(canStand(base, c, seat)).toBe(true);
    expect(standLeader(base, c, seat)).toBe(true);
    expect((c.held?.support.seat[seat]?.[PS] ?? 0) - before).toBeGreaterThanOrEqual(LEADER_LIFT - 0.07);
    expect(c.team.leaderSeat).toBe(seat);
    expect(canStand(base, c, seatsOf(c)[1])).toBe(false);
  });

  const play = (c: Campaign, loseSeat: boolean) => {
    let world = base;
    for (let g = 0; g < 4000 && c.phase !== 'campaign'; g++) {
      if (c.phase === 'term') { factionsOf(c).mood = [95, 95, 95]; c.parties[PS]!.unity = Math.max(c.parties[PS]!.unity, 70); if (c.inbox.length) answerEvent(world, c, c.inbox.shift()!, 0); else skipAhead(world, c, 26); }
      else if (c.phase === 'formation') endDay(world, c);
      else if (c.phase === 'done') resumeTerm(c);
    }
    expect(c.team.defaults).toBeDefined();
    while (c.phase === 'campaign') endWeek(world, c);
    closeNight(world, c);
    for (let d = 0; d < 10 && c.phase === 'formation'; d++) endDay(world, c);
    c.formation!.outcome = { ...c.formation!.outcome!, pm: PS };
    const recorded = recordResults(world, c);
    const lost = base.seats.findIndex((_, i) => recorded.votes[i].indexOf(Math.max(...recorded.votes[i])) !== PS && base.baseline.contesting[i][PS]);
    const won = base.seats.findIndex((_, i) => recorded.votes[i].indexOf(Math.max(...recorded.votes[i])) === PS);
    c.team.leaderSeat = base.seats[loseSeat ? lost : won].id;
    const cred = c.career!.credibility;
    expect(nextTerm(world, c)).toBe(true);
    return { c, cred, world: worldOf(c)! };
  };

  it('costs the leader the premiership if they lose it, whatever the party did', () => {
    const { c, cred, world } = play(career(), true);
    expect(c.career!.limited).toBe(true);
    expect(c.career!.government.pm).toBe(PS);
    expect(c.career!.credibility).toBeLessThan(cred - LEADER_OUT.credibility + 20);
    expect(c.news.some((n) => n.key === 'news.leader.lost.pm')).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  }, 60_000);

  it('is no matter if they win it', () => {
    const { c } = play(career(), false);
    expect(c.news.some((n) => n.key.startsWith('news.leader.lost'))).toBe(false);
    expect(c.career!.limited).toBeUndefined();
  }, 60_000);
});

function career(): Campaign {
  const c = startCareer(base, { player: PS, difficulty: 'normal', seed: 5 });
  c.career!.obligations = [];
  return c;
}
void newCampaign;
