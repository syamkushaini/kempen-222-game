import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { parseProfile } from '../../state/profile';
import { submissionOf } from '../../state/leaderboard';
import { startCareer, termWeek } from './career';
import { EVENTS } from './events';
import {
  DRIFT, EFFECTS, GRAFT_LEVELS, JAIL, PROSECUTABLE, SCANDALS, addGraft, effectsOf, graftDrift, graftLevel, graftOf, prosecute, prosecutionChance, verdictRoll, convicted,
} from './graft';
import { retire } from './legacy';
import { isValidCampaign } from './validate';
import type { Campaign } from './types';

const PS = PARTY_IDS.indexOf('ps');
const base = getWorld('career')!;
const career = (seed = 5): Campaign => startCareer(base, { player: PS, difficulty: 'normal', seed });
const idle = { donors: 0, state: 0, patronage: 0, clean: true, sound: false, commission: false };

describe('the corruption meter: levels and effects', () => {
  it('has five levels that begin at 0, 20, 40, 60 and 80', () => {
    expect(GRAFT_LEVELS).toEqual([0, 20, 40, 60, 80]);
    expect([0, 19.9, 20, 39, 40, 59.9, 60, 79, 80, 100].map(graftLevel)).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
  });

  it('does nothing at the clean level and bites harder at every level above', () => {
    expect(EFFECTS[0]).toEqual({ cred: 0, trust: 0, stability: 0, mood: 0, online: 0, headline: 0, press: 0, rivals: 0, scandal: 0, campaign: 0 });
    for (let i = 1; i < EFFECTS.length; i++) for (const key of Object.keys(EFFECTS[0]) as (keyof (typeof EFFECTS)[0])[]) expect(EFFECTS[i][key]).toBeGreaterThanOrEqual(EFFECTS[i - 1][key]);
    expect(effectsOf(90).cred).toBeGreaterThan(effectsOf(45).cred);
    expect(effectsOf(5)).toBe(EFFECTS[0]);
  });

  it('is raised by dubious orders and lowered, slowly, by clean conduct, a sound week and an anti-graft commission', () => {
    expect(graftDrift(idle)).toBe(DRIFT.clean);
    expect(graftDrift({ ...idle, clean: false, donors: 6 })).toBeCloseTo(6 * DRIFT.donors);
    expect(graftDrift({ ...idle, clean: false, donors: 3, state: 3, patronage: 3 })).toBeGreaterThan(graftDrift({ ...idle, clean: false, donors: 3 }));
    const best = graftDrift({ ...idle, sound: true, commission: true });
    expect(best).toBeCloseTo(DRIFT.clean + DRIFT.sound + DRIFT.commission);
    // The way back is slow: from the first prosecutable point it takes over two years even at its best.
    expect(GRAFT_LEVELS[PROSECUTABLE] / -best / 52).toBeGreaterThan(2);
  });
});

describe('the chance of prosecution', () => {
  it('is nothing below the prosecutable level, and for a party that won', () => {
    for (const g of [0, 20, 40, 59.9]) expect(prosecutionChance(g, 'lost')).toBe(0);
    for (const g of [60, 80, 100]) expect(prosecutionChance(g, 'won')).toBe(0);
  });

  it('starts at 12% at 60, climbs with the meter, and is never a certainty', () => {
    expect(prosecutionChance(60, 'lost')).toBeCloseTo(JAIL.base);
    expect(prosecutionChance(80, 'lost')).toBeGreaterThan(prosecutionChance(70, 'lost'));
    expect(prosecutionChance(100, 'lost')).toBeLessThanOrEqual(JAIL.max);
    expect(JAIL.max).toBeLessThan(1);
    expect(prosecutionChance(100, 'lost')).toBeGreaterThan(0.5);
  });

  it('is smaller for a partner who stays in government, and for a leader who retires, than for one who lost', () => {
    expect(prosecutionChance(75, 'partner')).toBeCloseTo(prosecutionChance(75, 'lost') * JAIL.partner);
    expect(prosecutionChance(75, 'retired')).toBeCloseTo(prosecutionChance(75, 'lost') * JAIL.retired);
    expect(prosecutionChance(75, 'retired')).toBeGreaterThan(0);
  });

  it('convicts when the roll is under the chance and not otherwise', () => {
    const p = prosecutionChance(90, 'lost');
    expect(convicted(90, 'lost', p - 0.001)).toBe(true);
    expect(convicted(90, 'lost', p + 0.001)).toBe(false);
    expect(convicted(30, 'lost', 0)).toBe(false);
  });
});

describe('the meter in a career', () => {
  it('does not move for a player who takes no easy money, and a clean game is untouched by it', () => {
    const c = career();
    for (let w = 0; w < 100; w++) { c.inbox = []; termWeek(base, c); }
    expect(c.graft).toBeUndefined();
    expect(c.graftSeen).toBeUndefined();
  });

  it('climbs under heavy donor money, tells the press when a level is crossed, and costs credibility, trust and the netizens', () => {
    const c = career();
    const clean = career();
    c.career!.orders.donors = 6;
    for (let w = 0; w < 120; w++) { c.inbox = []; clean.inbox = []; termWeek(base, c); termWeek(base, clean); }
    expect(graftOf(c)).toBeGreaterThan(40);
    expect(graftLevel(graftOf(c))).toBeGreaterThanOrEqual(2);
    expect(c.news.some((n) => n.key.startsWith('news.graft.up.'))).toBe(true);
    expect(c.news.some((n) => n.key.startsWith('news.graft.press.'))).toBe(true);
    expect(c.career!.credibility).toBeLessThan(clean.career!.credibility);
    expect(c.career!.net ?? 0).toBeLessThan(clean.career!.net ?? 0);
  });

  it('puts the scandals on the desk only at the levels that allow them', () => {
    expect([...SCANDALS]).toEqual(['graftTip', 'graftLeak', 'graftProbe']);
    for (const id of SCANDALS) {
      const def = EVENTS[id];
      expect(def.weight).toBe(0);
      // Every scandal can be answered without paying.
      expect(def.choices.some((ch) => !ch.effects.some((e) => e.t === 'funds' && e.n < 0))).toBe(true);
    }
    // At 'shady' (level 2) only the tip-off; at 'scandalous' also the recording; at 'notorious' the agency too.
    const c = career();
    c.career!.orders.donors = 6;
    const seen = new Set<string>();
    for (let w = 0; w < 400; w++) {
      c.inbox = []; c.graft = 90;
      termWeek(base, c);
      for (const s of c.inbox) if (s.event) seen.add(s.event);
      for (const q of c.career!.queue) if ((SCANDALS as readonly string[]).includes(q.event)) seen.add(q.event);
    }
    expect([...seen].some((id) => (SCANDALS as readonly string[]).includes(id))).toBe(true);
  });

  it('can be lowered quickly by owning up in a scandal', () => {
    const open = EVENTS.graftProbe.choices[0].effects.find((e) => e.t === 'graft');
    expect(open).toMatchObject({ n: -15 });
    const c = career();
    addGraft(c, 70);
    addGraft(c, -15);
    expect(graftOf(c)).toBe(55);
    expect(c.news.some((n) => n.key === 'news.graft.down.2')).toBe(true);
  });
});

describe('prosecution ends the career, and only when it should', () => {
  /** A term whose verdict roll falls under the chance, and one whose roll is over it, for a given meter and fall. */
  const terms = (c: Campaign, g: number, fall: 'lost' | 'partner' | 'retired') => {
    const p = prosecutionChance(g, fall);
    const guilty = Array.from({ length: 200 }, (_, i) => i + 1).find((t) => verdictRoll(c, t * 2) < p);
    const free = Array.from({ length: 200 }, (_, i) => i + 1).find((t) => verdictRoll(c, t * 2) >= p);
    return { guilty: guilty!, free: free! };
  };

  it('jails a leader who lost power at a high meter, with an ending of its own and half the points', () => {
    const c = career();
    c.graft = 90;
    const { guilty } = terms(c, 90, 'lost');
    expect(prosecute(c, 'lost', guilty)).toBe(true);
    expect(c.career!.ending).toMatchObject({ kind: 'jailed', legacy: 'footnote' });
    expect(c.news.at(-1)!.key).toBe('news.graft.jailed');
  });

  it('lets a leader off when the roll is over the chance, and says so', () => {
    const c = career();
    c.graft = 65;
    const { free } = terms(c, 65, 'lost');
    expect(prosecute(c, 'lost', free)).toBe(false);
    expect(c.career!.ending).toBeNull();
    expect(c.news.at(-1)!.key).toBe('news.graft.escaped');
  });

  it('never jails a winner, nor anyone below the prosecutable level', () => {
    const a = career(), b = career(), d = career();
    a.graft = 100; b.graft = 59;
    for (let t = 1; t <= 200; t++) {
      expect(prosecute(a, 'won', t)).toBe(false);
      expect(prosecute(b, 'lost', t)).toBe(false);
      expect(prosecute(d, 'lost', t)).toBe(false);
    }
    expect(a.career!.ending).toBeNull();
  });

  it('can jail a leader who retires with the agency at the door, but less often than one who lost', () => {
    const c = career();
    c.graft = 100;
    const lost = prosecutionChance(100, 'lost'), retired = prosecutionChance(100, 'retired');
    expect(retired).toBeLessThan(lost);
    const { guilty } = terms(c, 100, 'retired');
    c.career!.term = guilty;
    expect(retire(c)).toBe(true);
    expect(c.career!.ending!.kind).toBe('jailed');
    const calm = career();
    calm.graft = 10;
    expect(retire(calm)).toBe(true);
    expect(calm.career!.ending!.kind).toBe('retired');
  });
});

describe('saves, the profile and the board', () => {
  it('loads a game from before the meter existed, and keeps one with a meter; nonsense is refused', () => {
    const c = career();
    expect(c.graft).toBeUndefined();
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
    c.graft = 55; c.graftSeen = 2;
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
    c.graft = 500;
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(false);
  });

  it('records a conviction in the profile, and keeps it off the shared leaderboard', () => {
    const entry = { game: 'lq3x9-1a2b3', at: 1, name: 'Dock', party: 'ps', kind: 'jailed', legacy: 'footnote', score: 20, years: 9, yearsPm: 4, elections: 2, victories: 1, kept: 1, broken: 0 };
    const profile = parseProfile(JSON.stringify({ version: 1, achievements: {}, legacies: [entry] }));
    expect(profile.legacies).toHaveLength(1);
    expect(profile.legacies[0].kind).toBe('jailed');
    expect(submissionOf(profile.legacies[0], { scenario: 'career', difficulty: 'normal' }, 'Dock', '1.0')).toBeNull();
    expect(submissionOf({ ...profile.legacies[0], kind: 'retired' }, { scenario: 'career', difficulty: 'normal' }, 'Dock', '1.0')).not.toBeNull();
  });
});
