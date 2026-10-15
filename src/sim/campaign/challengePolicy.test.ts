import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { startCareer } from './career';
import { CHALLENGE, METHODS, canChallenge, challenge, challengeOdds, challengeWait, isAct, targets } from './challengePolicy';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const [PS, , PT] = PARTY_IDS.map((_, i) => i);
const world = getWorld('career')!;
/** An opposition party with a dossier, money, and a government that has an Act, a programme and a bill. */
const setup = (): Campaign => {
  const c = startCareer(world, { player: PT, difficulty: 'normal', seed: 5 });
  const k = c.career!;
  k.dossier = 80;
  c.parties[PT]!.funds = scaled(world, 1_000_000);
  k.laws = ['minWage'];
  k.programmes = { cashAid: 2 };
  k.bills = [{ id: 'pledge:fuelSubsidy', weeks: 3 }];
  return c;
};

describe('contesting the government’s policies', () => {
  it('lists every Act, programme and bill of the government, and only to the opposition', () => {
    const c = setup();
    expect(targets(c)).toEqual(expect.arrayContaining(['minWage', 'cashAid', 'fuelSubsidy']));
    expect(isAct(c, 'minWage')).toBe(true);
    const gov = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
    gov.career!.dossier = 80;
    gov.career!.laws = ['minWage'];
    expect(canChallenge(world, gov, 'minWage', 'public')).toEqual({ ok: false, reason: 'seat' });
  });

  it('allows the court for an Act only, a debate for a bill or an Act, and refuses without money or dossier', () => {
    const c = setup();
    expect(canChallenge(world, c, 'minWage', 'court').ok).toBe(true);
    expect(canChallenge(world, c, 'cashAid', 'court')).toEqual({ ok: false, reason: 'method' });
    expect(canChallenge(world, c, 'cashAid', 'debate')).toEqual({ ok: false, reason: 'method' });
    expect(canChallenge(world, c, 'fuelSubsidy', 'debate').ok).toBe(true);
    expect(canChallenge(world, c, 'cashAid', 'public').ok).toBe(true);
    expect(canChallenge(world, c, 'notAPolicy' as never, 'public').ok).toBe(false);
    c.career!.dossier = CHALLENGE.dossier.public - 1;
    expect(canChallenge(world, c, 'cashAid', 'public')).toEqual({ ok: false, reason: 'dossier' });
    c.career!.dossier = 80;
    c.parties[PT]!.funds = 0;
    expect(canChallenge(world, c, 'cashAid', 'public')).toEqual({ ok: false, reason: 'funds' });
  });

  it('spends the money and dossier, and waits before the next, and never takes on the same policy twice', () => {
    const c = setup();
    const k = c.career!;
    const money = c.parties[PT]!.funds;
    expect(challenge(world, c, 'cashAid', 'public')).toBe(true);
    expect(c.parties[PT]!.funds).toBe(money - scaled(world, CHALLENGE.money.public));
    expect(k.dossier).toBe(80 - CHALLENGE.dossier.public);
    expect(challengeWait(c)).toBe(CHALLENGE.every);
    expect(canChallenge(world, c, 'minWage', 'court')).toEqual({ ok: false, reason: 'wait' });
    k.week += CHALLENGE.every;
    expect(canChallenge(world, c, 'cashAid', 'public')).toEqual({ ok: false, reason: 'again' });
    expect(canChallenge(world, c, 'minWage', 'court').ok).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });

  it('can strike an Act down in court, delay a bill in the House, and has odds that read as chances', () => {
    let struck = false, delayed = false;
    for (let seed = 1; seed <= 60 && !(struck && delayed); seed++) {
      const a = setup(); a.career!.week = 10 + seed; a.rng = seed;
      const odds = challengeOdds(world, a, 'minWage', 'court');
      expect(odds).toBeGreaterThan(0);
      expect(odds).toBeLessThan(1);
      challenge(world, a, 'minWage', 'court');
      if (!a.career!.laws?.includes('minWage')) struck = true;
      const b = setup(); b.career!.week = 10 + seed; b.rng = seed;
      challenge(world, b, 'fuelSubsidy', 'debate');
      if (b.career!.bills[0].weeks > 3) delayed = true;
    }
    expect(struck).toBe(true);
    expect(delayed).toBe(true);
  });

  it('has words in both languages for everything it says', () => {
    const keys = ['title', 'desc', 'wait', 'none', 'kind.act', 'kind.bill', 'kind.programme', 'unpopular', 'popular', 'done', 'debate', 'court', 'public', 'cost'].map((x) => `contest.${x}`);
    for (const lang of ['en', 'ms'] as const) {
      for (const key of keys) expect(STRINGS[lang][key as StringKey], `${lang} ${key}`).toBeTruthy();
      for (const key of ['debate.delayed', 'debate.won', 'debate.lost', 'court.won', 'court.lost', 'public.won', 'public.lost']) expect(STRINGS[lang][`news.contest.${key}` as StringKey], `${lang} ${key}`).toBeTruthy();
    }
    expect(METHODS).toHaveLength(3);
  });
});
