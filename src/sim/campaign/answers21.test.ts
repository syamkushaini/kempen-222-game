import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { BLOC_IDS, PARTY_IDS } from '../types';
import { ACTIONS, THEME_FOCUS, THEME_REACH, doAction, scaled } from './actions';
import { startCareer } from './career';
import { PLEDGES } from './policy';
import { POWERS, POWER_IDS, canUse, powerWait, usePower } from './statepowers';
import { newCampaign } from './turn';
import { LOCAL_THEMES, PLEDGE_IDS, type Campaign } from './types';
import { voteNeed, whipCount } from './govern';
import { isValidCampaign } from './validate';
import { majorityLine } from '../election';

const PS = PARTY_IDS.indexOf('ps');
const careerWorld = getWorld('career')!;
const career = (seed = 5): Campaign => {
  const c = startCareer(careerWorld, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  c.parties[PS]!.funds = scaled(careerWorld, 5_000_000);
  return c;
};

describe('an amendment of the constitution', () => {
  it('needs two thirds of the House, and an ordinary law needs a majority', () => {
    const amend = PLEDGE_IDS.filter((id) => PLEDGES[id].amend);
    expect(amend).toEqual(expect.arrayContaining(['termLimit', 'fixedTerm', 'partyHopBan', 'oilRoyalty', 'localVote']));
    expect(voteNeed(careerWorld, 'pledge:termLimit')).toBe(Math.ceil((careerWorld.seats.length * 2) / 3));
    expect(voteNeed(careerWorld, 'pledge:cashAid')).toBe(majorityLine(careerWorld));
    expect(voteNeed(careerWorld, 'demand:autonomy')).toBe(majorityLine(careerWorld));
    expect(voteNeed(careerWorld, 'pledge:termLimit')).toBeGreaterThan(voteNeed(careerWorld, 'pledge:cashAid'));
    expect(STRINGS.en['manifesto.amend' as StringKey]).toBeTruthy();
    expect(STRINGS.ms['manifesto.amendNote' as StringKey]).toBeTruthy();
  });
  it('is not carried by a government that has a majority but not two thirds', async () => {
    const { resolveVote } = await import('./govern');
    let carried = 0, ordinary = 0;
    for (let seed = 1; seed <= 12; seed++) {
      const c = startCareer(careerWorld, { player: PS, difficulty: 'normal', seed });
      const w = whipCount(careerWorld, c, 'pledge:termLimit', PS);
      expect(w.yes + w.wavering).toBeLessThan(voteNeed(careerWorld, 'pledge:termLimit') + 30);
      resolveVote(careerWorld, c, { id: 1, kind: 'vote', from: null, bill: 'pledge:termLimit' }, 0);
      if (c.career!.delivery.termLimit === 'kept') carried++;
      const d = startCareer(careerWorld, { player: PS, difficulty: 'normal', seed });
      resolveVote(careerWorld, d, { id: 1, kind: 'vote', from: null, bill: 'pledge:cashAid' }, 0);
      if (d.career!.delivery.cashAid === 'kept') ordinary++;
    }
    expect(ordinary).toBeGreaterThan(carried);
  });
});

describe('a manifesto for a state or a seat', () => {
  const by = getWorld('byelection:P.057') ?? getWorld('general')!;
  it('is about one thing, and does more for those it speaks to than the all-purpose one', () => {
    expect(LOCAL_THEMES).toHaveLength(4);
    for (const theme of LOCAL_THEMES) { expect(THEME_REACH[theme]).toHaveLength(BLOC_IDS.length); for (const k of [`theme.${theme}`] as StringKey[]) { expect(STRINGS.en[k]).toBeTruthy(); expect(STRINGS.ms[k]).toBeTruthy(); } }
    expect(THEME_REACH.roads[BLOC_IDS.indexOf('felda')]).toBeGreaterThan(THEME_REACH.roads[BLOC_IDS.indexOf('urban_lib')]);
    expect(THEME_REACH.jobs[BLOC_IDS.indexOf('gig')]).toBeGreaterThan(THEME_REACH.jobs[BLOC_IDS.indexOf('seniors')]);
    expect(THEME_FOCUS).toBeGreaterThan(1);
    expect(ACTIONS.manifesto).toBeDefined();
  });
  it('is available in a by-election and a state’s election, and is spent on a theme there', () => {
    const state = getWorld('state:perak');
    for (const w of [by, state].filter((x) => x && x.rules.kind !== 'general')) {
      expect(w!.rules.actions).toContain('manifesto');
      const c = newCampaign(w!, { player: PS, difficulty: 'normal', seed: 3 });
      c.parties[PS]!.days = 7; c.parties[PS]!.funds = 5_000_000;
      const lift = (theme?: (typeof LOCAL_THEMES)[number]) => {
        const d = structuredClone(c);
        doAction(w!, d, PS, 'manifesto', theme ? { theme } : {});
        return d.dyn.support.nat.map((r) => r[PS]);
      };
      const plain = lift(), roads = lift('roads');
      const i = BLOC_IDS.indexOf('felda');
      expect(roads[i]).toBeGreaterThanOrEqual(plain[i]);
      expect(roads.reduce((a, b) => a + b, 0)).not.toBe(plain.reduce((a, b) => a + b, 0));
    }
  });
});

describe('the powers of a state', () => {
  const stateCareer = (): Campaign => {
    const c = career();
    c.scenario = 'career:perak';
    c.career!.government.pm = PS;
    c.career!.limited = false;
    return c;
  };
  it('are for the head of a state’s government only', () => {
    const c = career();
    c.career!.government.pm = PS;
    expect(canUse(careerWorld, c, 'land')).toEqual({ ok: false, reason: 'phase' });
    const s = stateCareer();
    for (const id of POWER_IDS) expect(canUse(careerWorld, s, id).ok, id).toBe(true);
  });
  it('bring money, a trail and a grievance, and are used once in a while', () => {
    const s = stateCareer();
    const k = s.career!;
    const funds = s.parties[PS]!.funds, cred = k.credibility;
    expect(usePower(careerWorld, s, 'land')).toBe(true);
    expect(s.parties[PS]!.funds).toBe(funds + scaled(careerWorld, POWERS.land.money));
    expect(k.trail).toBe(POWERS.land.trail);
    expect(k.credibility).toBe(cred + POWERS.land.credibility);
    expect(powerWait(s, 'land')).toBe(POWERS.land.every);
    expect(canUse(careerWorld, s, 'land')).toEqual({ ok: false, reason: 'wait' });
    k.week += POWERS.land.every;
    expect(canUse(careerWorld, s, 'land').ok).toBe(true);
    s.scenario = careerWorld.id;
    expect(isValidCampaign(JSON.parse(JSON.stringify(s)), careerWorld)).toBe(true);
  });
  it('can cost money too: the development grants, if the party can afford them', () => {
    const s = stateCareer();
    s.parties[PS]!.funds = 0;
    expect(canUse(careerWorld, s, 'grants')).toEqual({ ok: false, reason: 'funds' });
    s.parties[PS]!.funds = scaled(careerWorld, 1_000_000);
    const mood = s.career!.mood[BLOC_IDS.indexOf('felda')][PS];
    expect(usePower(careerWorld, s, 'grants')).toBe(true);
    expect(s.career!.mood[BLOC_IDS.indexOf('felda')][PS]).toBeGreaterThan(mood);
    expect(s.career!.trail).toBeUndefined();
    for (const id of POWER_IDS) for (const key of [`power.${id}`, `power.${id}.desc`, `news.power.${id}`] as StringKey[]) { expect(STRINGS.en[key]).toBeTruthy(); expect(STRINGS.ms[key]).toBeTruthy(); }
  });
});
