import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { startCareer } from './career';
import { EVENTS, eligible, resolveEvent } from './events';
import { DESK_EVENTS } from './eventList11';
import { PLEDGES } from './policy';
import { billDef, agenda } from './govern';
import { PLEDGE_IDS } from './types';
import { forStanding } from './standing';
import { leadsOpposition } from './formation';
import { artFor } from '../../ui/art';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps'), BP = PARTY_IDS.indexOf('bp');
const world = getWorld('career')!;
const ids = Object.keys(DESK_EVENTS);
const career = (player = PS) => {
  const c = startCareer(world, { player, difficulty: 'normal', seed: 5 });
  c.career!.obligations = [];
  c.parties[player]!.funds = scaled(world, 5_000_000);
  return c;
};

describe('four decisions for a party of any size', () => {
  it('are in the game, with the words in both languages for every option and every result', () => {
    expect(ids).toEqual(['donorStrings', 'missingVolunteers', 'manifestoMistake', 'manaPeruntukan']);
    for (const id of ids) {
      const def = EVENTS[id];
      expect(def, id).toBe(DESK_EVENTS[id]);
      expect(def.choices, id).toHaveLength(3);
      for (const text of [EVENTS_EN[id], EVENTS_MS[id]]) {
        expect(text.body.length, id).toBeGreaterThan(60);
        expect(text.options, id).toHaveLength(3);
        def.choices.forEach((ch, i) => {
          expect(Array.isArray(text.results[i]), `${id} ${i}`).toBe(!!ch.gamble);
          for (const r of [text.results[i]].flat()) expect(r.length, `${id} r${i}`).toBeGreaterThan(20);
        });
      }
      expect(STRINGS.en[`event.${id}.title` as StringKey], id).toBeTruthy();
      expect(STRINGS.ms[`event.${id}.o2` as StringKey], id).toBeTruthy();
      // Nobody is trapped: one choice costs nothing.
      expect(def.choices.some((c) => !c.effects.some((e) => e.t === 'funds' && e.n < 0)), id).toBe(true);
    }
    expect(EVENTS_EN.manaPeruntukan.title).toBe('“Mana Peruntukan?”');
  });

  it('have the consequences the player wrote: money, credibility, the branches and the mood of the voters', () => {
    const [reject, privately, disclosed] = EVENTS.donorStrings.choices;
    expect(reject.effects).toEqual([{ t: 'cred', n: 3 }]);
    expect(privately.effects).toEqual([{ t: 'funds', n: 100_000 }, { t: 'cred', n: -4 }]);
    expect(privately.gamble!.chance).toBe(0.6);
    expect(disclosed.effects).toEqual([{ t: 'cred', n: 2 }]);
    expect(disclosed.gamble!.chance).toBe(0.6);
    expect(disclosed.gamble!.win.some((e) => e.t === 'funds' && e.n === 100_000)).toBe(true);
    const [pay, longer, cut] = EVENTS.missingVolunteers.choices;
    expect(pay.effects).toEqual([{ t: 'funds', n: -15_000 }, { t: 'machinery', n: 2 }]);
    expect(longer.gamble).toMatchObject({ chance: 0.5, win: [{ t: 'machinery', n: 2 }], lose: [{ t: 'unity', n: -3 }] });
    expect(cut.effects).toContainEqual({ t: 'unity', n: 1 });
    const [admit, edit, blame] = EVENTS.manifestoMistake.choices;
    expect(admit.effects).toContainEqual({ t: 'cred', n: 2 });
    expect(edit.gamble).toMatchObject({ chance: 0.6, lose: [{ t: 'cred', n: -4 }] });
    expect(blame.effects).toEqual([{ t: 'cred', n: -2 }, { t: 'unity', n: -2 }]);
    const [explain, promise, incumbent] = EVENTS.manaPeruntukan.choices;
    expect(explain.effects).toEqual([{ t: 'cred', n: 2 }]);
    expect(promise.gamble).toMatchObject({ chance: 'cred', lose: [{ t: 'cred', n: -2 }] });
    expect(incumbent.gamble).toMatchObject({ chance: 0.5, lose: [{ t: 'cred', n: -2 }] });
  });

  it('come to the places they are written for: three to anyone, “where is the money” only across the floor', () => {
    for (const id of ['donorStrings', 'missingVolunteers', 'manifestoMistake']) for (const at of ['pm', 'gov', 'lead', 'opp'] as const) expect(forStanding(id, EVENTS[id], at), `${id} ${at}`).toBe(true);
    for (const at of ['pm', 'gov'] as const) expect(forStanding('manaPeruntukan', EVENTS.manaPeruntukan, at)).toBe(false);
    for (const at of ['lead', 'opp'] as const) expect(forStanding('manaPeruntukan', EVENTS.manaPeruntukan, at)).toBe(true);
    const gov = career(PS); gov.career!.government.pm = PS;
    const opp = career(BP); opp.career!.government.pm = PS; opp.career!.government.partners = [];
    expect(eligible(gov, 'donorStrings')).toBe(true);
    expect(eligible(opp, 'manaPeruntukan')).toBe(true);
    expect(eligible(gov, 'manaPeruntukan')).toBe(false);
    // Volunteers and the manifesto come late in a term, when there is a campaign to speak of.
    expect(eligible(gov, 'missingVolunteers')).toBe(false);
    gov.career!.week = Math.ceil(gov.career!.length * 0.8);
    expect(eligible(gov, 'missingVolunteers')).toBe(true);
    expect(eligible(gov, 'manifestoMistake')).toBe(true);
  });

  it('can be answered every way, and what is gambled on is worked out', () => {
    for (const id of ids) {
      const c = id === 'manaPeruntukan' ? career(BP) : career(PS);
      c.career!.government.pm = PS;
      if (id === 'manaPeruntukan') c.career!.government.partners = [];
      EVENTS[id].choices.forEach((_, choice) => {
        for (let seed = 1; seed <= 6; seed++) {
          const copy = structuredClone(c);
          copy.rng = seed * 7919;
          expect(resolveEvent(world, copy, { id: 1, kind: 'event', from: null, event: id }, choice), `${id} ${choice}`).toBeDefined();
          expect(copy.news.at(-1)!.key, id).toMatch(new RegExp(`^event\\.${id}\\.r${choice}[wl]?$`));
          expect(isValidCampaign(JSON.parse(JSON.stringify(copy)), world), `${id} ${choice}`).toBe(true);
        }
      });
    }
    // The donor's money arrives when it is taken, and not when it is turned down.
    const c = career(PS);
    const before = c.parties[PS]!.funds;
    const copy = structuredClone(c);
    resolveEvent(world, copy, { id: 1, kind: 'event', from: null, event: 'donorStrings' }, 0);
    expect(copy.parties[PS]!.funds).toBe(before);
    const took = structuredClone(c);
    resolveEvent(world, took, { id: 1, kind: 'event', from: null, event: 'donorStrings' }, 1);
    expect(took.parties[PS]!.funds - before).toBe(scaled(world, 100_000));
  });

  it('each have a picture of their own', () => { for (const id of ids) expect(artFor('event', id), id).toBeTruthy(); });
});

describe('three Acts more, to promise and to table', () => {
  const acts = ['tollCut', 'epfWithdrawal', 'civilReform'] as const;
  it('are pledges, are laws once passed, and have the words in both languages', () => {
    for (const id of acts) {
      expect(PLEDGE_IDS).toContain(id);
      expect(PLEDGES[id].law, id).toBe(true);
      expect(PLEDGES[id].amend, id).toBeUndefined();
      expect(STRINGS.en[`pledge.${id}` as StringKey], id).toMatch(/Act/);
      expect(STRINGS.ms[`pledge.${id}` as StringKey], id).toMatch(/Akta/);
    }
    expect(STRINGS.en['pledge.tollCut']).toContain('National Toll Rationalisation Act');
    expect(STRINGS.en['pledge.epfWithdrawal']).toContain('Retirement Flexibility Act');
    expect(STRINGS.en['pledge.civilReform']).toContain('Public Service Performance Act');
  });
  it('please who they should, and the civil service’s unions oppose the reform', () => {
    expect(PLEDGES.tollCut.appeal.m40).toBeGreaterThan(0);
    expect(PLEDGES.tollCut.appeal.gig).toBeGreaterThan(0);
    expect(PLEDGES.epfWithdrawal.appeal.gig).toBeGreaterThan(0);
    expect(PLEDGES.epfWithdrawal.appeal.seniors).toBeLessThan(0);
    expect(PLEDGES.civilReform.appeal.civil).toBeLessThan(-0.1);
    expect(PLEDGES.civilReform.appeal.urban_lib).toBeGreaterThan(0);
  });
  it('can be put to the House by a government that promised them', () => {
    const c = career(PS);
    c.career!.government.pm = PS;
    for (const id of acts) { c.career!.promises = [...new Set([...c.career!.promises, id])]; }
    for (const id of acts) {
      expect(agenda(c)).toContain(`pledge:${id}`);
      expect(billDef(`pledge:${id}`)).not.toBeNull();
    }
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
});

describe('“You lead the opposition”', () => {
  const outcome = (pm: number, partners: number[]) => ({ pm, partners, seats: 0, minority: false, stability: 60, trust: 60, day: 0, deals: [] as never[] });
  it('is said only of the largest party outside the government, however few seats that is', () => {
    const c = career(BP);
    const [ps, bp, pt, gbk] = [PS, BP, PARTY_IDS.indexOf('pt'), PARTY_IDS.indexOf('gbk')];
    const tally = PARTY_IDS.map(() => 0);
    tally[ps] = 100; tally[bp] = 40; tally[pt] = 60; tally[gbk] = 10;
    // Pakatan Sinar governs: Perikatan Teguh (60) is the larger of the two outside it, and Barisan Pusaka (40) is only in opposition.
    expect(leadsOpposition(c, outcome(ps, []), tally)).toBe(false);
    expect(leadsOpposition(career(pt), outcome(ps, []), tally)).toBe(true);
    // When Perikatan Teguh joins the government, Barisan Pusaka is the largest left outside.
    expect(leadsOpposition(c, outcome(ps, [pt]), tally)).toBe(true);
    // Pooled independents are not a party that can lead.
    tally[PARTY_IDS.indexOf('oth')] = 90;
    expect(leadsOpposition(c, outcome(ps, [pt]), tally)).toBe(true);
    // Everyone else in the government: the one left outside leads, though it has three seats.
    tally[bp] = 3;
    expect(leadsOpposition(c, outcome(ps, [pt, gbk]), tally)).toBe(true);
  });
  it('has its own words for the rest, in both languages', () => {
    expect(STRINGS.en['form.outcome.oppositionBack']).toBe('You are in opposition, but not at its head.');
    expect(STRINGS.ms['form.outcome.oppositionBack']).toBeTruthy();
  });
});
