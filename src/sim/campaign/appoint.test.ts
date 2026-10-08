import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { startCareer } from './career';
import { resolveEvent } from './events';
import { governWeek, reshuffle, vacate } from './govern';
import { ACTING_DRAG, appoint, cabinetWeek, TRAIT_EFFECT, waitingForChoice } from './office';
import { MINISTER_TRAITS, PORTFOLIO_IDS, type Campaign } from './types';
import { isValidCampaign } from './validate';

const [PS, BP, PT] = PARTY_IDS.map((_, i) => i);
const base = getWorld('career')!;
const career = (player = PS, seed = 5): Campaign => startCareer(base, { player, difficulty: 'normal', seed });
const own = (c: Campaign) => c.career!.cabinet.filter((m) => m.party === c.player);

describe('appointing ministers', () => {
  it('leaves the posts of the player’s own party to the player, with three people on offer for each', () => {
    const c = career();
    const k = c.career!;
    expect(own(c).length).toBeGreaterThan(0);
    // Every post the player's party holds waits for a choice, and a stand-in holds it.
    expect(k.appointments!.map((a) => a.portfolio).sort()).toEqual(own(c).map((m) => m.portfolio).sort());
    for (const m of own(c)) expect(m).toMatchObject({ acting: true, skill: 2 });
    for (const a of k.appointments!) {
      expect(a.options).toHaveLength(3);
      expect(new Set(a.options.map((o) => o.trait)).size).toBe(3);
      expect(new Set(a.options.map((o) => o.name)).size).toBe(3);
      // None of them is already in the cabinet at another post.
      for (const o of a.options) expect(k.cabinet.some((m) => m.portfolio !== a.portfolio && m.name === o.name)).toBe(false);
    }
    // Other parties choose their own.
    for (const m of k.cabinet.filter((x) => x.party !== PS)) expect(m.acting).toBeUndefined();
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('asks nothing of a player whose party is not in government', () => {
    const c = career(PT);
    expect(c.career!.appointments).toEqual([]);
    expect(c.career!.cabinet.every((m) => !m.acting)).toBe(true);
  });

  it('puts the chosen person in the post, and what they bring comes at once', () => {
    const c = career();
    const k = c.career!;
    const post = own(c)[0].portfolio;
    const kinds = k.appointments!.find((a) => a.portfolio === post)!.options.map((o) => o.trait);
    const chosen = kinds[0];
    const unity = c.parties[PS]!.unity, cred = k.credibility, funds = c.parties[PS]!.funds, mood = k.mood[0][PS];
    expect(appoint(base, c, post, 0)).toBe(true);
    const m = k.cabinet.find((x) => x.portfolio === post)!;
    expect(m).toMatchObject({ party: PS, trait: chosen });
    expect(m.acting).toBeUndefined();
    expect(waitingForChoice(k, post)).toBe(false);
    if (chosen === 'expert') { expect(k.credibility).toBe(cred + TRAIT_EFFECT.expert.credibility); expect(c.parties[PS]!.unity).toBe(unity + TRAIT_EFFECT.expert.unity); expect(m.skill).toBeGreaterThanOrEqual(4); }
    if (chosen === 'loyalist') expect(c.parties[PS]!.unity).toBe(unity + TRAIT_EFFECT.loyalist.unity);
    if (chosen === 'rising') expect(k.mood[0][PS]).toBeCloseTo(mood + TRAIT_EFFECT.rising.mood, 9);
    if (chosen === 'fixer') expect(c.parties[PS]!.funds).toBe(funds + scaled(base, TRAIT_EFFECT.fixer.funds));
    expect(c.news.at(-1)!.key).toBe('news.gov.appointed');
    // A post cannot be filled twice, nor one the player does not hold.
    expect(appoint(base, c, post, 1)).toBe(false);
    const theirs = k.cabinet.find((x) => x.party !== PS)!;
    expect(appoint(base, c, theirs.portfolio, 0)).toBe(false);
  });

  it('keeps every name in the cabinet different, whoever is chosen', () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const c = career(PS, seed);
      for (const a of [...c.career!.appointments!]) appoint(base, c, a.portfolio, seed % 3);
      expect(c.career!.appointments).toEqual([]);
      expect(new Set(c.career!.cabinet.map((m) => m.name)).size, `seed ${seed}`).toBe(PORTFOLIO_IDS.length);
    }
  });

  it('wears a government down a little for every post still held by a stand-in', () => {
    const c = career();
    const k = c.career!;
    const n = own(c).length;
    k.government.stability = 60;
    cabinetWeek(c, new Rng(1));
    expect(k.government.stability).toBeCloseTo(60 - ACTING_DRAG * n, 9);
    for (const a of [...k.appointments!]) appoint(base, c, a.portfolio, 0);
    const steady = k.government.stability;
    cabinetWeek(c, new Rng(1));
    expect(k.government.stability).toBe(steady);
  });

  it('lets an ambitious minister turn on the leader in time, once', () => {
    const c = career();
    const k = c.career!;
    const post = own(c)[0].portfolio;
    k.appointments = [{ portfolio: post, options: [{ name: 0, skill: 4, trait: 'rising' }] }];
    appoint(base, c, post, 0);
    const unity = c.parties[PS]!.unity;
    const rng = new Rng(3);
    for (let w = 0; w < 3000 && !k.cabinet.find((m) => m.portfolio === post)!.done; w++) cabinetWeek(c, rng);
    expect(k.cabinet.find((m) => m.portfolio === post)!.done).toBe(true);
    expect(c.parties[PS]!.unity).toBe(unity - 6);
    expect(c.news.some((n) => n.key === 'news.gov.ambition')).toBe(true);
    for (let w = 0; w < 500; w++) cabinetWeek(c, rng);
    expect(c.parties[PS]!.unity).toBe(unity - 6);
  });

  it('makes a fixer’s scandal cost the party, and hands the post back to the player without them', () => {
    const c = career();
    const k = c.career!;
    const post = own(c)[0].portfolio;
    k.appointments = [{ portfolio: post, options: [{ name: 3, skill: 3, trait: 'fixer' }] }];
    appoint(base, c, post, 0);
    const cred = k.credibility, trust = k.government.trust;
    const rng = new Rng(7);
    for (let w = 0; w < 3000 && !k.scandal; w++) cabinetWeek(c, rng);
    // The scandal goes to the player to answer; sacking the minister is what leaves the post to fill.
    const scene = c.inbox.find((s) => s.event === 'ministerScandal')!;
    expect(scene).toBeDefined();
    resolveEvent(base, c, scene, 0);
    const m = k.cabinet.find((x) => x.portfolio === post)!;
    expect(m.acting).toBe(true);
    expect(k.credibility).toBe(cred - 3);
    expect(k.government.trust).toBe(trust - 2);
    const slot = k.appointments!.find((a) => a.portfolio === post)!;
    expect(slot.options).toHaveLength(3);
    expect(slot.options.some((o) => o.name === 3)).toBe(false);
  });

  it('puts a dismissed minister’s post to the player to fill again', () => {
    const c = career();
    const k = c.career!;
    const theirs = k.cabinet.find((m) => m.party === BP)!;
    expect(reshuffle(c, theirs.portfolio)).toBe(true);
    const m = k.cabinet.find((x) => x.portfolio === theirs.portfolio)!;
    expect(m).toMatchObject({ party: PS, acting: true });
    const slot = k.appointments!.find((a) => a.portfolio === theirs.portfolio)!;
    expect(slot.options.some((o) => o.name === theirs.name)).toBe(false);
    expect(appoint(base, c, theirs.portfolio, 0)).toBe(true);
  });

  it('passes the posts of a party that leaves to the player, who has them to fill; and takes them away if the player leaves', () => {
    const c = career();
    const k = c.career!;
    const before = own(c).length;
    vacate(c, BP);
    expect(own(c).length).toBeGreaterThan(before);
    expect(k.appointments!.map((a) => a.portfolio).sort()).toEqual(own(c).map((m) => m.portfolio).sort());
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
    vacate(c, PS);
    expect(k.appointments).toEqual([]);
  });

  it('is still loadable from a game saved before it existed', () => {
    const c = career();
    for (const m of c.career!.cabinet) { delete m.acting; delete m.trait; delete m.done; }
    delete c.career!.appointments;
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
    // And it plays on: nothing in a week of government needs the new fields.
    governWeek(c, new Rng(2));
    expect(MINISTER_TRAITS).toHaveLength(4);
  });
});
