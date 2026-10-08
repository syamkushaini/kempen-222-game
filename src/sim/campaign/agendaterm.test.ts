import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { REASK_WEEKS, agendaTerm, resolveAgenda } from './agenda';
import { TRUST_CEILING, TRUST_QUIET, skipAhead, startCareer, termWeek } from './career';
import { playable } from './field';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const world = getWorld('career:johor')!;
const me = playable(world)[0];
const start = (seed = 3): Campaign => {
  const c = startCareer(world, { player: me, difficulty: 'normal', seed });
  c.career!.obligations = [];
  return c;
};
const asked = (c: Campaign) => c.inbox.filter((s) => s.kind === 'agenda');
/** Brings the state's question to the desk in the given week and takes it off again. */
function put(c: Campaign, week: number) {
  c.career!.week = week;
  c.inbox = [];
  agendaTerm(world, c);
  const scene = asked(c)[0];
  c.inbox = [];
  return scene;
}

describe('the state’s question, put again in a state career', () => {
  it('comes back twice a term, once each time, and only in a state', () => {
    const c = start();
    c.career!.week = REASK_WEEKS[0] - 1;
    agendaTerm(world, c);
    expect(asked(c)).toHaveLength(0);
    c.career!.week = REASK_WEEKS[0];
    agendaTerm(world, c);
    expect(asked(c)).toHaveLength(1);
    c.inbox = [];
    agendaTerm(world, c);
    expect(asked(c)).toHaveLength(0);
    c.career!.week = REASK_WEEKS[1];
    agendaTerm(world, c);
    expect(asked(c)).toHaveLength(1);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    const general = getWorld('career')!;
    const g = startCareer(general, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 1 });
    g.career!.week = REASK_WEEKS[0];
    agendaTerm(general, g);
    expect(asked(g)).toHaveLength(0);
  });

  it('moves opinion, not the campaign, in the years between elections', () => {
    const c = start();
    const scene = put(c, REASK_WEEKS[0]);
    const mood = JSON.stringify(c.career!.mood);
    const drift = JSON.stringify(c.drift.support.nat);
    resolveAgenda(world, c, scene, 0);
    expect(JSON.stringify(c.career!.mood)).not.toBe(mood);
    expect(JSON.stringify(c.drift.support.nat)).toBe(drift);
    expect(c.career!.agendaAnswers).toEqual([0]);
  });

  it('believes a leader who says again what they said, and punishes one who changes their answer', () => {
    const same = start();
    resolveAgenda(world, same, put(same, REASK_WEEKS[0]), 0);
    const cred = same.career!.credibility;
    resolveAgenda(world, same, put(same, REASK_WEEKS[1]), 0);
    expect(same.career!.credibility).toBe(Math.min(100, cred + 2));

    const flip = start();
    resolveAgenda(world, flip, put(flip, REASK_WEEKS[0]), 0);
    const cred2 = flip.career!.credibility;
    resolveAgenda(world, flip, put(flip, REASK_WEEKS[1]), 1);
    expect(flip.career!.credibility).toBe(cred2 - 4);
    // Silence is neither.
    const quiet = start();
    resolveAgenda(world, quiet, put(quiet, REASK_WEEKS[0]), 0);
    const cred3 = quiet.career!.credibility;
    resolveAgenda(world, quiet, put(quiet, REASK_WEEKS[1]), 2);
    expect(quiet.career!.credibility).toBe(cred3);
  });
});

describe('public trust', () => {
  const trusted = (lean: number, levers = [0, 0, 0]) => {
    const c = startCareer(getWorld('career')!, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 5 });
    c.career!.obligations = [];
    c.career!.government.trust = 30;
    c.career!.orders.state = lean as 0 | 1 | 2 | 3;
    c.career!.levers = levers;
    c.career!.week = 60;
    return c;
  };
  const after = (c: Campaign, weeks: number) => { for (let i = 0; i < weeks && c.phase === 'term'; i++) { c.inbox = []; termWeek(getWorld('career')!, c); } return c.career!.government.trust; };

  it('recovers slowly while the government leaves state resources and the institutions alone, and never past the ceiling', () => {
    const t = after(trusted(0), 52);
    expect(t).toBeGreaterThan(34);
    expect(t).toBeLessThan(TRUST_CEILING);
    const high = trusted(0); high.career!.government.trust = TRUST_CEILING + 5;
    expect(after(high, 20)).toBeLessThanOrEqual(TRUST_CEILING + 5);
  });

  it('does not recover while state resources are leant on, or soon after an institution was', () => {
    expect(after(trusted(2), 26)).toBeLessThan(30);
    const recent = trusted(0, [60 - TRUST_QUIET + 10, 0, 0]);
    expect(after(recent, 4)).toBeLessThanOrEqual(30);
  });
});
void skipAhead;
