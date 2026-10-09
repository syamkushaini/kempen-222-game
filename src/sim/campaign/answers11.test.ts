import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { BLOC_IDS, PARTY_IDS } from '../types';
import { ACTIONS, EFFECT, LOCAL_IDS, LOCAL_REACH, canDo, doAction, hasLocal, localReach, scaled } from './actions';
import { HOPEFUL_NAMES, HOPEFUL_TRAITS, diversityBonus } from './candidates';
import { startCareer } from './career';
import { MEDIA_AIMED, MEDIA_FOCUS, aimReach } from './segments';
import { TENURE, applyTenure, personalVote, recordTenure, retireIncumbent, termsHeld } from './tenure';
import { newCampaign } from './turn';
import { isValidCampaign } from './validate';
import type { Campaign, SeatResults } from './types';

const PS = PARTY_IDS.indexOf('ps');
const general = getWorld('general')!;
const career = getWorld('career')!;

describe('media aimed at one group', () => {
  const flat = BLOC_IDS.map(() => 1);
  it('reaches the target more than twice as well and the groups unlike it less', () => {
    const r = aimReach(flat, 'undi18');
    expect(r[BLOC_IDS.indexOf('undi18')]).toBe(MEDIA_FOCUS);
    expect(r[BLOC_IDS.indexOf('heartland')]).toBeLessThan(0.5);
    // A group set against it takes it badly.
    expect(Math.min(...aimReach(flat, 'urban_lib'))).toBeLessThan(0);
    expect(Math.max(...r)).toBe(MEDIA_FOCUS);
    // The groups like the target hear it as before.
    expect(aimReach(flat, 'heartland')[BLOC_IDS.indexOf('felda')]).toBe(1);
  });
  it('is open to television, radio and social media only, and to a group that exists', () => {
    const c = newCampaign(general, { player: PS, difficulty: 'normal', seed: 3 });
    expect([...MEDIA_AIMED].sort()).toEqual(['radio', 'social', 'tv']);
    expect(canDo(general, c, PS, 'tv', { segment: 'seniors' }).ok).toBe(true);
    expect(canDo(general, c, PS, 'social', { segment: 'gig' }).ok).toBe(true);
    expect(canDo(general, c, PS, 'radio', { state: 'perak', segment: 'felda' }).ok).toBe(true);
    expect(canDo(general, c, PS, 'canvass', { state: 'perak', segment: 'felda' })).toEqual({ ok: false, reason: 'noTarget' });
    expect(canDo(general, c, PS, 'manifesto', { segment: 'felda' })).toEqual({ ok: false, reason: 'noTarget' });
  });
  it('lifts the target bloc more than an unaimed push, and the opposed bloc less', () => {
    const run = (segment?: (typeof BLOC_IDS)[number]) => {
      const c = newCampaign(general, { player: PS, difficulty: 'normal', seed: 3 });
      doAction(general, c, PS, 'tv', segment ? { segment } : {});
      return c.dyn.support.nat.map((row) => row[PS]);
    };
    const plain = run();
    const aimed = run('seniors');
    const i = BLOC_IDS.indexOf('seniors');
    expect(aimed[i]).toBeGreaterThan(plain[i]);
    expect(aimed[BLOC_IDS.indexOf('undi18')]).toBeLessThan(plain[BLOC_IDS.indexOf('undi18')]);
  });
});

describe('the local event', () => {
  it('belongs to a state, reaches the groups of that place, and is free to everyone in the general election', () => {
    expect(ACTIONS.local.target).toBe('state');
    expect(general.rules.actions).toContain('local');
    expect(LOCAL_IDS.length).toBeGreaterThanOrEqual(13);
    for (const id of LOCAL_IDS) {
      expect(LOCAL_REACH[id], id).toHaveLength(BLOC_IDS.length);
      expect(STRINGS.en[`local.${id}` as StringKey], id).toBeTruthy();
      expect(STRINGS.ms[`local.${id}` as StringKey], id).toBeTruthy();
    }
    expect(hasLocal(general, 'sabah')).toBe(true);
    const reach = (st: string, bloc: (typeof BLOC_IDS)[number]) => localReach(general, st)[BLOC_IDS.indexOf(bloc)];
    expect(reach('sabah', 'borneo_native')).toBeGreaterThan(reach('sabah', 'heartland') * 5);
    expect(reach('kedah', 'agri')).toBeGreaterThan(reach('penang', 'agri'));
    expect(reach('penang', 'urban_lib')).toBeGreaterThan(reach('kelantan', 'urban_lib'));
    expect(hasLocal(general, 'nowhere')).toBe(false);
  });
  it('lifts the groups of the place in the place', () => {
    const c = newCampaign(general, { player: PS, difficulty: 'normal', seed: 3 });
    c.parties[PS]!.funds = 5_000_000;
    c.parties[PS]!.days = 7;
    c.parties[PS]!.location = 'sabah';
    expect(canDo(general, c, PS, 'local', { state: 'sabah' }).ok).toBe(true);
    const report = doAction(general, c, PS, 'local', { state: 'sabah' });
    expect(report.id).toBe('local');
    const rows = c.dyn.support.state.sabah;
    const native = rows[BLOC_IDS.indexOf('borneo_native')][PS];
    expect(native).toBeGreaterThan(0.05);
    expect(native).toBeGreaterThan(rows[BLOC_IDS.indexOf('heartland')][PS] * 5);
    expect(native).toBeLessThanOrEqual(EFFECT.local * 2 * 1.6 * 1.4);
    expect(canDo(general, c, PS, 'local', { state: 'sabah' })).toEqual({ ok: false, reason: 'usedThisWeek' });
    expect(scaled(general, 45_000)).toBeGreaterThan(0);
  });
});

describe('a candidate’s own background', () => {
  const city = { blocs: BLOC_IDS.map((b) => (b === 'urban_lib' ? 0.2 : b === 'm40' ? 0.2 : b === 'undi18' ? 0.15 : b === 'gig' ? 0.1 : 0.35 / 9)), urbanity: 1 };
  const village = { blocs: BLOC_IDS.map((b) => (b === 'heartland' ? 0.6 : 0.4 / 12)), urbanity: 0.1 };
  const borneo = { blocs: BLOC_IDS.map((b) => (b === 'borneo_native' ? 0.6 : 0.4 / 12)), urbanity: 0.2 };
  const name = (pred: (t: (typeof HOPEFUL_TRAITS)[number]) => boolean) => HOPEFUL_TRAITS.findIndex(pred);
  it('has a table of traits for every name', () => {
    expect(HOPEFUL_TRAITS).toHaveLength(HOPEFUL_NAMES.length);
  });
  it('gives nothing to the default candidate and a bonus, never a penalty, to the others', () => {
    for (let n = 0; n < HOPEFUL_NAMES.length; n++) for (const seat of [city, village, borneo]) expect(diversityBonus(seat, n)).toBeGreaterThanOrEqual(0);
    expect(diversityBonus(city, name((t) => !t.woman && !t.young && t.ethnic === 'malay'))).toBe(0);
  });
  it('suits the seat: a young woman in a city, a minority candidate in a city, a Borneo native in Borneo', () => {
    const youngWoman = name((t) => t.woman && t.young && t.ethnic === 'malay');
    expect(diversityBonus(city, youngWoman)).toBeGreaterThan(diversityBonus(village, youngWoman));
    const chinese = name((t) => !t.woman && !t.young && t.ethnic === 'chinese');
    expect(diversityBonus(city, chinese)).toBeGreaterThan(diversityBonus(village, chinese));
    const bumi = name((t) => !t.woman && !t.young && t.ethnic === 'bumi');
    expect(diversityBonus(borneo, bumi)).toBeGreaterThan(diversityBonus(city, bumi));
  });
});

describe('a member of long standing', () => {
  const start = (): Campaign => startCareer(career, { player: PS, difficulty: 'normal', seed: 5 });
  it('has a personal vote that grows with the terms and stops growing', () => {
    expect(personalVote(1)).toBe(0);
    expect(personalVote(2)).toBeCloseTo(TENURE.perTerm, 9);
    expect(personalVote(3)).toBeGreaterThan(personalVote(2));
    expect(personalVote(50)).toBe(TENURE.max);
  });
  it('is counted at every election: a party that wins again has held it longer, a new winner begins again', () => {
    const c = start();
    const k = c.career!;
    const winners = career.seats.map(() => PS);
    const votes = (win: number[]): SeatResults => ({ votes: win.map((w) => PARTY_IDS.map((_, p) => (p === w ? 100 : 10))) } as unknown as SeatResults);
    recordTenure(career, c, votes(winners));
    const first = { ...k.tenure! };
    recordTenure(career, c, votes(winners));
    const i = 0;
    const id = career.seats[i].id;
    expect(k.tenure![id][1]).toBe(first[id][1] + 1);
    expect(termsHeld(c, id)).toBe(k.tenure![id][1]);
    recordTenure(career, c, votes(winners.map((w, n) => (n === i ? PARTY_IDS.indexOf('bp') : w))));
    expect(k.tenure![id]).toEqual([PARTY_IDS.indexOf('bp'), 1]);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), career)).toBe(true);
  });
  it('lifts the party that holds the seat at the start of a campaign, and half of it goes with a replacement', () => {
    const c = start();
    const k = c.career!;
    const seat = career.seats.find((s) => s.last.votes.indexOf(Math.max(...s.last.votes)) === PS)!.id;
    k.tenure = { [seat]: [PS, 4] };
    // It is the campaign's, kept apart from what the voters think: it is not carried into the next parliament's reckoning.
    const drift = c.drift.support.seat[seat]?.[PS] ?? 0;
    applyTenure(career, c);
    expect(c.held!.support.seat[seat]![PS]).toBeCloseTo(TENURE.max, 9);
    expect(retireIncumbent(c, seat)).toBeCloseTo(TENURE.max / 2, 9);
    expect(c.held!.support.seat[seat]![PS]).toBeCloseTo(TENURE.max / 2, 9);
    expect(c.drift.support.seat[seat]?.[PS] ?? 0).toBe(drift);
    // A seat the party has since lost gets nothing.
    k.tenure = { [seat]: [PS, 4] };
    k.house[seat] = PARTY_IDS.indexOf('bp');
    const now = c.held!.support.seat[seat]![PS];
    applyTenure(career, c);
    expect(c.held!.support.seat[seat]![PS]).toBe(now);
  });
});

describe('strings', () => {
  it('exist in both languages', () => {
    const keys = ['action.local', 'action.local.desc', 'news.me.local', 'media.aim.title', 'media.aim.note', 'trait.woman', 'trait.young', 'trait.malay', 'trait.chinese', 'trait.indian', 'trait.bumi', 'slate.tenure'] as StringKey[];
    for (const key of keys) { expect(STRINGS.en[key], key).toBeTruthy(); expect(STRINGS.ms[key], key).toBeTruthy(); }
  });
});
