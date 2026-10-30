import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { answerEvent } from './career';
import { EVENTS, raise, rollEvent, seatOf } from './events';
import { ID_BLOCK, ID_COOL, ID_COOL_FACTOR, PRESSURE, pressure, recency } from './eventContext';
import { GOVERNING_ONLY, TOPICS, topicOf } from './standing';
import { isValidCampaign } from './validate';
import type { Campaign } from './types';

const [PS, BP, PT] = PARTY_IDS.map((_, i) => i);
const world = getWorld('career')!;
const career = (player = PS, seed = 5): Campaign => { const c = startCareer(world, { player, difficulty: 'normal', seed }); c.inbox = []; c.career!.appointments = []; return c; };
const topicIds = (topic: string) => Object.keys(EVENTS).filter((id) => topicOf(id, EVENTS[id]) === topic);

describe('events that fit what is going on are likelier', () => {
  it('make a kind of trouble likelier when its cause is there and rarer when it is not, within bounds', () => {
    const c = career();
    const k = c.career!;
    k.economy.inflation = 2.8;
    const plain = pressure(c, 'cost');
    k.economy.inflation = 5;
    expect(pressure(c, 'cost')).toBeGreaterThan(plain);
    k.economy.inflation = 1.5;
    expect(pressure(c, 'cost')).toBeLessThan(plain);
    c.parties[PS]!.unity = 30;
    expect(pressure(c, 'party')).toBeGreaterThan(1.5);
    c.parties[PS]!.unity = 95;
    expect(pressure(c, 'party')).toBeLessThan(1);
    k.government.stability = 20;
    expect(pressure(c, 'house')).toBeGreaterThan(1.2);
    k.economy.growth = 0.5; k.economy.debt = 90;
    expect(pressure(c, 'economy')).toBeGreaterThan(2);
    expect(pressure(c, 'weather')).toBe(1);
    for (const topic of new Set(Object.values(TOPICS))) {
      const p = pressure(c, topic);
      expect(p).toBeGreaterThanOrEqual(PRESSURE.min);
      expect(p).toBeLessThanOrEqual(PRESSURE.max);
    }
  });

  it('draw more of what fits: with prices climbing, cost-of-living events come more often than with prices steady', () => {
    const count = (inflation: number) => {
      let n = 0;
      const cost = new Set(topicIds('cost'));
      for (let seed = 1; seed <= 24; seed++) {
        const c = career(PS, seed);
        c.career!.economy.inflation = inflation;
        c.career!.quietUntil = 0;
        const rng = new Rng(seed * 31);
        for (let w = 0; w < 140; w++) {
          c.career!.week = w + 5; c.career!.economy.inflation = inflation; c.career!.quietUntil = 0;
          c.inbox = [];
          if (rollEvent(c, rng)) { const e = c.inbox.at(-1)?.event; if (e && cost.has(e)) n++; }
        }
      }
      return n;
    };
    expect(count(5.2)).toBeGreaterThan(count(1.8));
  });
});

describe('an event that has just come does not come again by chance', () => {
  it('is blocked for a while, rarer for a year, and plain after that; a game with no history is unaffected', () => {
    const c = career();
    const k = c.career!;
    expect(recency(c, 'flood')).toBe(1);
    k.eventWeeks = { flood: 10 };
    k.week = 10 + ID_BLOCK - 1;
    expect(recency(c, 'flood')).toBe(0);
    k.week = 10 + ID_BLOCK;
    expect(recency(c, 'flood')).toBe(ID_COOL_FACTOR);
    k.week = 10 + ID_COOL;
    expect(recency(c, 'flood')).toBe(1);
  });

  it('is written down when an event comes, so that rolling over many weeks never puts the same event on the desk twice in a row', () => {
    const c = career();
    const rng = new Rng(4);
    let last: string | undefined;
    let repeats = 0, drawn = 0;
    for (let w = 0; w < 400; w++) {
      c.career!.week = (w % 250) + 5; c.career!.quietUntil = 0; c.inbox = [];
      if (rollEvent(c, rng)) { drawn++; const id = c.inbox.at(-1)?.event; if (id && id === last) repeats++; last = id; }
    }
    expect(drawn).toBeGreaterThan(30);
    expect(c.career!.eventWeeks && Object.keys(c.career!.eventWeeks).length).toBeGreaterThan(10);
    expect(repeats).toBe(0);
  });
});

describe('events that name a place in government are not put to someone who does not hold it', () => {
  it('only come to the head of government, a partner or the opposition that they are written for', () => {
    for (const player of [PS, BP, PT]) {
      const c = career(player);
      const rng = new Rng(player + 20);
      const bad: string[] = [];
      for (let w = 0; w < 500; w++) {
        const k = c.career!;
        k.week = (w % 240) + 5; k.quietUntil = 0; c.inbox = [];
        if (!rollEvent(c, rng)) continue;
        const id = c.inbox.at(-1)?.event;
        const def = id ? EVENTS[id] : undefined;
        if (!id || !def || def.seats || GOVERNING_ONLY.includes(id)) continue;
        const at = seatOf(c);
        if (def.role === 'pm' && at !== 'pm') bad.push(`${id} (pm) came to ${at}`);
        if (def.role === 'opp' && at !== 'opp') bad.push(`${id} (opp) came to ${at}`);
        if ((def.role === 'gov' || def.role === 'partner') && at === 'opp') bad.push(`${id} (${def.role}) came to the opposition`);
        if (def.role === 'partner' && at === 'pm') bad.push(`${id} (partner) came to the head of government`);
      }
      expect(bad).toEqual([]);
    }
  });

  it('does not ask the head of government what their own partners are asked: the budget is being drafted by them, not for them', () => {
    expect(EVENTS.budgetAsk.role).toBe('partner');
    const c = career(PS);
    c.career!.government.partners = [BP];
    expect(seatOf(c)).toBe('pm');
    // The head of government is not offered the partners' question; a partner is.
    const k = c.career!;
    const asked = (player: number) => { const d = career(player); d.career!.government.pm = PS; d.career!.government.partners = [BP]; d.career!.week = 38; d.career!.quietUntil = 99; d.inbox = []; rollEvent(d, new Rng(1)); return d.inbox.some((s) => s.event === 'budgetAsk'); };
    void k;
    expect(asked(PS)).toBe(false);
    expect(asked(BP)).toBe(true);
  });
});

describe('a decision about a minister under fire has a sequel that depends on what was decided', () => {
  const answer = (choice: number) => {
    const c = career(PS);
    c.career!.appointments = [];
    raise(c, 'ministerScandal');
    const scene = c.inbox.find((x) => x.event === 'ministerScandal')!;
    c.inbox = c.inbox.filter((x) => x !== scene);
    answerEvent(world, c, scene, choice);
    return c;
  };

  it('queues a different story for sacking, standing by and suspending, each some weeks on', () => {
    const queued = [0, 1, 2].map((choice) => { const q = answer(choice).career!.queue; return q.map((x) => x.event); });
    expect(queued[0]).toContain('ministerSacked');
    expect(queued[1]).toContain('ministerReview');
    expect(queued[2]).toContain('ministerVerdict');
    const c = answer(0);
    const due = c.career!.queue.find((x) => x.event === 'ministerSacked')!;
    expect(due.week).toBeGreaterThan(c.career!.week);
  });

  it('comes to the desk when it falls due, and reaches only those who govern', () => {
    const c = answer(0);
    c.career!.week += 10;
    c.career!.quietUntil = 0;
    expect(rollEvent(c, new Rng(1))).toBe(true);
    expect(c.inbox.some((x) => x.event === 'ministerSacked')).toBe(true);
    // An opposition party never carries the story: it is not theirs.
    const opp = career(PT);
    opp.career!.queue.push({ event: 'ministerSacked', week: opp.career!.week });
    opp.career!.quietUntil = 0;
    rollEvent(opp, new Rng(1));
    expect(opp.inbox.some((x) => x.event === 'ministerSacked')).toBe(false);
  });

  it('has choices with prices of their own: a minister can be dropped, kept or left to the review', () => {
    for (const id of ['ministerSacked', 'ministerReview', 'ministerVerdict']) expect(EVENTS[id].choices.length).toBe(3);
    expect(EVENTS.ministerReview.choices[1].effects.some((e) => e.t === 'minister')).toBe(true);
    expect(EVENTS.ministerVerdict.choices[0].gamble?.win.some((e) => e.t === 'minister' && e.act === 'keep')).toBe(true);
  });
});

describe('the event history is saved with the game', () => {
  it('survives a save and a load, and a game saved before it still loads with a plain history', () => {
    const c = career();
    const rng = new Rng(2);
    for (let w = 0; w < 120; w++) { c.career!.week = w + 5; c.career!.quietUntil = 0; c.inbox = []; rollEvent(c, rng); }
    expect(Object.keys(c.career!.eventWeeks ?? {}).length).toBeGreaterThan(5);
    const copy = JSON.parse(JSON.stringify(c));
    expect(isValidCampaign(copy, world)).toBe(true);
    expect(copy.career.eventWeeks).toEqual(c.career!.eventWeeks);
    delete copy.career.eventWeeks;
    expect(isValidCampaign(copy, world)).toBe(true);
    const old = copy as Campaign;
    expect(recency(old, 'flood')).toBe(1);
    old.career!.week = 30; old.career!.quietUntil = 0; old.inbox = [];
    expect(() => rollEvent(old, new Rng(1))).not.toThrow();
  });
});
