import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { ADVICE_EVERY, adviceFor, canFollow, followAdvice, gainOf, voice, weeksToWait } from './advice';
import { hire } from './staff';
import type { Campaign } from './types';

const PS = PARTY_IDS.indexOf('ps');
const base = getWorld('career')!;
const career = (): Campaign => startCareer(base, { player: PS, difficulty: 'normal', seed: 5 });
/** Hires the best of the three offered for a role (the one with the highest skill). */
const best = (c: Campaign, role: 'manager' | 'strategist' | 'media' | 'treasurer') => {
  const r = ['manager', 'strategist', 'media', 'treasurer'].indexOf(role);
  const i = c.team.pool[r].reduce((b, p, j, a) => (p.skill > a[b].skill ? j : b), 0);
  hire(c, role, i);
  return c.team.staff[r]!;
};

describe('what the people the leader has hired suggest', () => {
  it('gives more for a better person, and nothing for nobody', () => {
    expect([1, 2, 3, 4, 5].map(gainOf)).toEqual([1, 2, 2, 3, 4]);
    const c = career();
    expect(adviceFor(base, c, 'manager')).toBeNull();
    expect(canFollow(base, c, 'manager')).toEqual({ ok: false, reason: 'nobody' });
  });

  it('is in their own field: the manager on a party coming apart, the treasurer on easy money, the media on a name that has slipped', () => {
    const c = career();
    best(c, 'manager'); best(c, 'treasurer'); best(c, 'media'); best(c, 'strategist');
    const k = c.career!;
    c.parties[PS]!.unity = 60;
    expect(adviceFor(base, c, 'manager')?.id).toBe('meeting');
    c.parties[PS]!.unity = 90;
    k.orders.donors = 2;
    expect(adviceFor(base, c, 'treasurer')?.id).toBe('clean');
    k.orders.donors = 0;
    k.government.trust = 95;
    k.credibility = 50;
    expect(adviceFor(base, c, 'media')?.id).toBe('profile');
    expect(adviceFor(base, c, 'strategist')?.id).toBe('paper');
    k.credibility = 95;
    k.government.trust = 50;
    expect(adviceFor(base, c, 'media')?.id).toBe('honest');
    k.government.trust = 95;
    expect(adviceFor(base, c, 'media')).toBeNull();
  });

  it('is followed for a little money, does what it says, and is not asked again for a quarter', () => {
    const c = career();
    const who = best(c, 'manager');
    const k = c.career!;
    c.parties[PS]!.unity = 60;
    const funds = c.parties[PS]!.funds, cred = k.credibility;
    expect(canFollow(base, c, 'manager').ok).toBe(true);
    expect(followAdvice(base, c, 'manager')).toBe(true);
    expect(c.parties[PS]!.unity).toBe(60 + gainOf(who.skill));
    expect(k.credibility).toBeGreaterThan(cred);
    expect(c.parties[PS]!.funds).toBeLessThan(funds);
    expect(k.adviceTaken!.manager).toBe(k.week);
    expect(c.news.some((n) => n.key === 'news.advice.followed')).toBe(true);
    // Again at once: no.
    c.parties[PS]!.unity = 60;
    expect(canFollow(base, c, 'manager')).toEqual({ ok: false, reason: 'wait' });
    expect(followAdvice(base, c, 'manager')).toBe(false);
    expect(weeksToWait(c, 'manager')).toBe(ADVICE_EVERY);
    k.week += ADVICE_EVERY;
    expect(canFollow(base, c, 'manager').ok).toBe(true);
  });

  it('is refused for a team that has not been paid, a purse that cannot meet it, and a desk with something waiting', () => {
    const c = career();
    best(c, 'manager');
    c.parties[PS]!.unity = 60;
    c.team.unpaid = true;
    expect(canFollow(base, c, 'manager')).toEqual({ ok: false, reason: 'unpaid' });
    delete c.team.unpaid;
    c.parties[PS]!.funds = 0;
    expect(canFollow(base, c, 'manager')).toEqual({ ok: false, reason: 'funds' });
    c.parties[PS]!.funds = 1_000_000;
    c.inbox.push({ id: 1, kind: 'event', from: null, event: 'flood' });
    expect(canFollow(base, c, 'manager')).toEqual({ ok: false, reason: 'phase' });
  });

  it('can turn the donors off for the treasurer, and a better treasurer adds more to the name', () => {
    const c = career();
    best(c, 'treasurer');
    c.career!.orders.donors = 2;
    const cred = c.career!.credibility;
    expect(followAdvice(base, c, 'treasurer')).toBe(true);
    expect(c.career!.orders.donors).toBe(1);
    expect(c.career!.credibility).toBeGreaterThan(cred);
  });
});

describe('the team speaks up through the game', () => {
  it('says nothing with nobody hired, then each hired person takes a turn', () => {
    const c = career();
    expect(voice(base, c)).toBeNull();
    best(c, 'manager'); best(c, 'media');
    const k = c.career!;
    c.parties[PS]!.unity = 90; k.credibility = 90; k.government.trust = 95; k.orders.donors = 0;
    c.parties[PS]!.machinery = c.parties[PS]!.machinery.map(() => 100);
    const roles = new Set<string>();
    for (let w = 0; w < 6; w++) { k.week = w; const v = voice(base, c); expect(v).not.toBeNull(); roles.add(v!.role); expect(v!.line).toBeGreaterThanOrEqual(1); }
    expect(roles).toEqual(new Set(['manager', 'media']));
  });

  it('puts someone with a suggestion to follow first, and goes quiet when wages are unpaid', () => {
    const c = career();
    best(c, 'manager'); best(c, 'treasurer');
    c.parties[PS]!.unity = 90; c.career!.credibility = 90; c.career!.orders.donors = 2;
    expect(voice(base, c)?.role).toBe('treasurer');
    expect(voice(base, c)?.advice?.id).toBe('clean');
    c.team.unpaid = true;
    expect(voice(base, c)).toBeNull();
  });
});
