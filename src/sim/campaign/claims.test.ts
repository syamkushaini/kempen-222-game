import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { Rng } from '../rng';
import { CLAIM_GAP, canClaim, claim, claimChance, claimsWeek, makeClaims } from './claims';
import { startCareer, termWeek } from './career';
import { relation } from './diplomacy';
import { canInterview, coverage, INTERVIEW_GAP, interview, termMediaWeek, usualCoverage } from './media';
import { BLOC_IDS } from '../types';
import { isValidCampaign } from './validate';
import { OUTLET_IDS, type Campaign } from './types';

const world = getWorld('career')!;
const [PS, BP] = ['ps', 'bp'].map((id) => PARTY_IDS.indexOf(id as never));

/** A game in which the player's party is a partner in a government headed by someone else, with two promises owed. */
const partner = (): Campaign => {
  const c = startCareer(world, { player: BP, difficulty: 'normal', seed: 5 });
  c.inbox = [];
  const k = c.career!;
  expect(k.government.pm).toBe(PS);
  k.government.deals[BP] = { posts: 3, senior: null, demands: ['devFunds', 'subsidies'], cash: 0 };
  makeClaims(c);
  return c;
};

describe('promises owed to a partner', () => {
  it('lists what the head of government promised the player, each with a week it falls due', () => {
    const c = partner();
    const k = c.career!;
    expect(k.claims).toHaveLength(2);
    expect(k.claims!.map((x) => x.demand)).toEqual(['devFunds', 'subsidies']);
    expect(k.claims!.every((x) => x.party === PS && !x.done && x.due > k.week)).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });

  it('are not listed for a head of government, who owes them rather than is owed', () => {
    const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
    makeClaims(c);
    expect(c.career!.claims).toBeUndefined();
  });

  it('can be pressed: a press either keeps the promise or costs the head of government’s goodwill, and then must wait', () => {
    let kept = 0, refused = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const c = partner();
      c.career!.week = 10 + seed;
      const before = relation(c, BP, PS);
      const result = claim(c, 0);
      expect(['granted', 'refused']).toContain(result);
      const item = c.career!.claims![0];
      if (result === 'granted') { kept++; expect(item.done).toBe(true); expect(relation(c, BP, PS)).toBeGreaterThan(before); }
      else { refused++; expect(item.done).toBe(false); expect(relation(c, BP, PS)).toBeLessThan(before); }
      expect(canClaim(c, 0)).toMatchObject({ ok: false, reason: result === 'granted' ? 'done' : 'wait' });
      c.career!.week += CLAIM_GAP;
      if (result === 'refused') expect(canClaim(c, 0).ok).toBe(true);
    }
    expect(kept).toBeGreaterThan(0);
    expect(refused).toBeGreaterThan(0);
  });

  it('work more often once the promise is overdue and the head of government is fond of the party', () => {
    const c = partner();
    const item = c.career!.claims![0];
    const early = claimChance(c, item);
    c.career!.week = item.due + 5;
    expect(claimChance(c, item)).toBeGreaterThan(early);
    c.relations[BP][PS] = 90; c.relations[PS][BP] = 90;
    expect(claimChance(c, item)).toBeGreaterThan(claimChance(partner(), item));
  });

  it('go unkept past their time: noted once, with the party’s members unhappy', () => {
    const c = partner();
    const k = c.career!;
    k.week = k.claims![1].due + 1;
    const unity = c.parties[BP]!.unity;
    for (let i = 0; i < 3; i++) claimsWeek(c, new Rng(i + 1));
    const late = k.claims!.filter((x) => x.late);
    expect(late.length).toBeGreaterThan(0);
    expect(c.parties[BP]!.unity).toBeLessThan(unity);
    expect(c.news.filter((n) => n.key === 'news.claim.late').length).toBe(late.length);
  });
});

describe('the press between elections', () => {
  it('can be sat down with in a term, free of days, and an outlet will not have the same leader every week', () => {
    const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
    c.inbox = [];
    expect(canInterview(c, 'kini').ok).toBe(true);
    const days = c.parties[PS]!.days;
    expect(interview(c, 'kini')).not.toBeNull();
    expect(c.parties[PS]!.days).toBe(days);
    expect(canInterview(c, 'kini')).toMatchObject({ ok: false, reason: 'pressWait', weeks: INTERVIEW_GAP });
    expect(canInterview(c, 'ledger').ok).toBe(true);
    c.career!.week += INTERVIEW_GAP;
    expect(canInterview(c, 'kini').ok).toBe(true);
  });

  it('keeps warm coverage moving its audience between elections, and lets it fade', () => {
    const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
    const k = c.career!, me = PS, o = OUTLET_IDS.indexOf('kini');
    const usual = usualCoverage(c)[o][me];
    c.team.media[o][me] = Math.min(2, usual + 2);
    const bloc = BLOC_IDS.indexOf('urban_lib');
    const mood = k.mood[bloc][me];
    termMediaWeek(c);
    expect(k.mood[bloc][me]).toBeGreaterThan(mood);
    // After the fade weeks, a step has gone back towards the outlet's habit.
    const warm = coverage(c, 'kini', me);
    k.week = 12;
    termMediaWeek(c);
    expect(coverage(c, 'kini', me)).toBeLessThan(warm);
    termWeek(world, c);
    expect(c.phase).toBe('term');
  });
});
