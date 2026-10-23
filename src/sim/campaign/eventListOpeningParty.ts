import { Rng } from '../rng';
import type { BlocId } from '../types';
import type { Effect, EventDef, Who } from './events';
import { openingFlag } from './eventListOpening';
import { standingOf, type Standing } from './standing';
import type { Campaign } from './types';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'machinery', n: number): Effect => ({ t, n });
const rel = (who: Who, n: number): Effect => ({ t: 'relation', who, n });

/** How many of the opening stories of its place a party that was already there is dealt. */
export const PARTY_OPENING_DEALT = 2;

const first = { first: true } as const;

/**
 * Four small stories for each of the three places a career can begin in: leading the government, a partner in it, and across the floor. The
 * game deals two of the four by its seed, so that two careers begun as the same party do not open with the same two weeks. They are written
 * to suit a state's government as well as the country's. Every person and place is invented. Text lives in `src/i18n/events28.ts`.
 */
export const PARTY_OPENING_STORIES: Record<string, EventDef> = {
  // Leading the government
  startPmHundredDays: {
    role: 'pm', seats: ['pm'], weight: 0, after: 5, topic: 'house', needs: { flag: openingFlag('startPmHundredDays'), ...first },
    choices: [
      { effects: [eff('cred', 1), eff('stability', -1), mood(['m40', 'civil'], 0.015)] },
      { effects: [eff('cred', 2), mood(['m40'], 0.005)] },
      { effects: [], gamble: { chance: 'cred', win: [eff('stability', 2), mood('all', 0.01)], lose: [eff('cred', -2), mood(['urban_lib'], -0.015)] } },
    ],
  },
  startPmSecretary: {
    role: 'pm', seats: ['pm'], weight: 0, after: 9, topic: 'economy', needs: { flag: openingFlag('startPmSecretary'), ...first },
    choices: [
      { effects: [eff('trust', 2), eff('cred', 1), eff('funds', -20_000)] },
      { effects: [eff('stability', 1), eff('unity', -1), mood(['civil'], 0.01)] },
      { effects: [eff('cred', -1), mood(['smallbiz'], 0.015), eff('trust', -1)] },
    ],
  },
  startPmClaimants: {
    role: 'pm', seats: ['pm'], weight: 0, after: 13, topic: 'house', needs: { flag: openingFlag('startPmClaimants'), ...first },
    choices: [
      { effects: [eff('unity', 3), eff('cred', -1)] },
      { effects: [eff('cred', 2), eff('unity', -2)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('unity', 2), eff('stability', 2)], lose: [eff('unity', -3), eff('stability', -2)] } },
    ],
  },
  startPmSchoolVisit: {
    role: 'pm', seats: ['pm'], weight: 0, after: 17, topic: 'media', needs: { flag: openingFlag('startPmSchoolVisit'), ...first },
    choices: [
      { effects: [eff('cred', 2), mood(['undi18', 'm40'], 0.01), eff('trust', 1)] },
      { effects: [eff('cred', -1), mood(['undi18'], 0.02)] },
      { effects: [eff('unity', 1), eff('cred', -1), mood(['civil'], 0.01)] },
    ],
  },
  // A partner in the government
  startGovRearRow: {
    role: 'gov', seats: ['gov'], weight: 0, after: 21, topic: 'party', needs: { flag: openingFlag('startGovRearRow'), ...first },
    choices: [
      { effects: [eff('unity', 2), rel('pm', -3), mood('all', 0.005)] },
      { effects: [rel('pm', 1), eff('cred', 1)] },
      { effects: [], gamble: { chance: 'cred', win: [mood(['undi18', 'urban_b40'], 0.02), rel('pm', 1)], lose: [eff('cred', -1), rel('pm', -1)] } },
    ],
  },
  startGovDeputy: {
    role: 'gov', seats: ['gov'], weight: 0, after: 25, topic: 'party', needs: { flag: openingFlag('startGovDeputy'), ...first },
    choices: [
      { effects: [eff('unity', 2), eff('cred', -1)] },
      { effects: [eff('cred', 2), eff('unity', -2)] },
      { effects: [eff('unity', 1), eff('machinery', 1)] },
    ],
  },
  startGovBackbench: {
    role: 'gov', seats: ['gov'], weight: 0, after: 29, topic: 'house', needs: { flag: openingFlag('startGovBackbench'), ...first },
    choices: [
      { effects: [eff('unity', 3), rel('pm', -2), eff('cred', -1)] },
      { effects: [eff('unity', -1), eff('stability', 1), rel('pm', 1)] },
      { effects: [eff('unity', 1), rel('pm', 1), eff('funds', -10_000)] },
    ],
  },
  startGovMemo: {
    role: 'gov', seats: ['gov'], weight: 0, after: 33, topic: 'house', needs: { flag: openingFlag('startGovMemo'), ...first },
    choices: [
      { effects: [rel('pm', 3), eff('cred', -2)] },
      { effects: [eff('cred', 2), rel('pm', -1), eff('stability', -1)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('cred', 1), rel('pm', 1)], lose: [eff('cred', -2), rel('pm', -2)] } },
    ],
  },
  // Across the floor
  startOppShadow: {
    role: 'opp', seats: ['lead', 'opp'], weight: 0, after: 37, topic: 'house', needs: { flag: openingFlag('startOppShadow'), ...first },
    choices: [
      { effects: [eff('unity', 2), eff('cred', -1)] },
      { effects: [eff('cred', 2), eff('unity', -2), mood(['undi18', 'm40'], 0.01)] },
      { effects: [eff('unity', 1), eff('machinery', 1), eff('cred', 1)] },
    ],
  },
  startOppMotion: {
    role: 'opp', seats: ['lead', 'opp'], weight: 0, after: 41, topic: 'house', needs: { flag: openingFlag('startOppMotion'), ...first },
    choices: [
      { effects: [eff('cred', 1), mood('all', 0.005), eff('unity', 1)] },
      { effects: [eff('cred', -1), eff('unity', 2)] },
      { effects: [], gamble: { chance: 0.5, win: [mood('all', 0.015), eff('cred', 1)], lose: [eff('cred', -2), eff('unity', -1)] } },
    ],
  },
  startOppLeak: {
    role: 'opp', seats: ['lead', 'opp'], weight: 0, after: 45, topic: 'scandal', needs: { flag: openingFlag('startOppLeak'), ...first },
    choices: [
      { effects: [eff('cred', 2), eff('trust', 1)] },
      { effects: [], gamble: { chance: 0.5, win: [mood('all', 0.02), eff('cred', 1)], lose: [eff('cred', -3), eff('trust', -2)] } },
      { effects: [rel('opp', 1), eff('unity', 1)] },
    ],
  },
  startOppVacancy: {
    role: 'opp', seats: ['lead', 'opp'], weight: 0, after: 49, topic: 'local', needs: { flag: openingFlag('startOppVacancy'), ...first },
    choices: [
      { effects: [eff('machinery', 2), eff('funds', -20_000), eff('unity', 1)] },
      { effects: [eff('cred', 2), mood(['heartland'], 0.01)] },
      { effects: [eff('unity', -1), eff('machinery', 1), mood(['civil'], 0.01)] },
    ],
  },
};

/** The four stories of each place to stand. */
const POOLS: Record<'pm' | 'gov' | 'opp', string[]> = {
  pm: ['startPmHundredDays', 'startPmSecretary', 'startPmClaimants', 'startPmSchoolVisit'],
  gov: ['startGovRearRow', 'startGovDeputy', 'startGovBackbench', 'startGovMemo'],
  opp: ['startOppShadow', 'startOppMotion', 'startOppLeak', 'startOppVacancy'],
};
export const PARTY_OPENING_IDS = Object.keys(PARTY_OPENING_STORIES);
const poolOf = (at: Standing): string[] => POOLS[at === 'pm' ? 'pm' : at === 'gov' ? 'gov' : 'opp'];

/** The stories dealt to a career begun from this place under this seed: two of the four written for it, the same two for the same seed. */
export function partyOpeningDeal(seed: number, at: Standing): string[] {
  const rng = new Rng((seed ^ 0x7b1d3) >>> 0);
  const pool = [...poolOf(at)];
  const dealt: string[] = [];
  while (dealt.length < PARTY_OPENING_DEALT && pool.length) dealt.push(pool.splice(rng.int(pool.length), 1)[0]);
  return dealt;
}

/** Hands a career of a party that was already there its opening stories, by the place it begins in. */
export function dealPartyOpening(c: Campaign): void {
  c.career!.flags.push(...partyOpeningDeal(c.rng, standingOf(c)).map(openingFlag));
}
