import type { BlocId } from '../types';
import type { Effect, EventDef, Who } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'machinery' | 'dossier', n: number): Effect => ({ t, n });
const rel = (who: Who, n: number): Effect => ({ t: 'relation', who, n });
const rival = (who: 'pm' | 'opp' | 'partners', n: number): Effect => ({ t: 'rival', who, n });
const hot = (issue: 'health' | 'rural' | 'transport' | 'wages', n: number): Effect => ({ t: 'salience', issue, n });
const POOR: BlocId[] = ['urban_b40', 'gig'];
const TOWN: BlocId[] = ['m40', 'urban_lib'];
const VILLAGE: BlocId[] = ['heartland', 'felda', 'agri'];

/**
 * What lands on the desk of someone in opposition. The leader of the opposition is the government's counterpart: their words
 * move the government's standing, they hold the shadow cabinet, and everybody else in opposition looks to them or away from
 * them. A smaller opposition party has less to say to the House and more to do with its own seats, its own few votes and the
 * choice between the leader of the opposition and the government. Text lives in `src/i18n/events12.ts` and `events13.ts`.
 * Every person and company in them is invented.
 */
export const OPPOSITION_SEATS: Record<string, EventDef> = {
  // ===== leading the opposition =====
  shadowGaffe: {
    role: 'opp', seats: ['lead'], weight: 3,
    choices: [
      { effects: [eff('unity', -2), eff('cred', 2)] },
      { effects: [eff('cred', -2), eff('unity', 2)] },
      { effects: [eff('unity', -1)] },
    ],
  },
  censureMotion: {
    role: 'opp', seats: ['lead'], weight: 3, needs: { shaky: 70 },
    choices: [
      { effects: [], gamble: { chance: 'unity', win: [eff('stability', -3), rival('pm', -0.01), eff('cred', 1)], lose: [eff('cred', -2), eff('stability', 2)] } },
      { effects: [rival('pm', -0.004), eff('cred', 1)] },
      { effects: [eff('cred', 1), mood(['seniors'], 0.005)] },
    ],
  },
  bipartisanOffer: {
    role: 'opp', seats: ['lead'], weight: 3,
    choices: [
      { effects: [eff('cred', 2), eff('unity', -2), mood('all', 0.005)] },
      { effects: [eff('unity', 2), eff('cred', -1)] },
      { effects: [], gamble: { chance: 'cred', win: [eff('cred', 2), eff('unity', 1)], lose: [eff('cred', -1)] } },
    ],
  },
  crossoverHints: {
    role: 'opp', seats: ['lead'], weight: 3, needs: { shaky: 60 },
    choices: [
      { effects: [eff('unity', -1), eff('stability', -3), eff('cred', -1)] },
      { effects: [eff('unity', 1), eff('stability', -1)] },
      { effects: [eff('cred', 2), eff('stability', 1)] },
    ],
  },
  inquiryCall: {
    role: 'opp', seats: ['lead'], weight: 3,
    choices: [
      { effects: [eff('cred', 1), rival('pm', -0.005)] },
      { effects: [], gamble: { chance: 0.45, win: [rival('pm', -0.01), eff('stability', -2)], lose: [eff('cred', -1)] } },
      { effects: [eff('dossier', 5)] },
    ],
  },
  massRally: {
    role: 'opp', seats: ['lead'], weight: 3, needs: { late: true },
    choices: [
      { effects: [eff('funds', -80_000), mood('all', 0.02), eff('unity', 2)] },
      { effects: [mood(['undi18', 'gig'], 0.015)] },
      { effects: [eff('funds', -50_000), eff('machinery', 3), mood(VILLAGE, 0.015)] },
    ],
  },
  oppositionPact: {
    role: 'opp', seats: ['lead'], weight: 3,
    choices: [
      { effects: [rel('opp', 4), eff('unity', -2), eff('machinery', 2)] },
      { effects: [eff('unity', 2), rel('opp', -3)] },
      { effects: [], gamble: { chance: 'cred', win: [rel('opp', 2), eff('cred', 1)], lose: [rel('opp', -3), eff('cred', -1)] } },
    ],
  },
  speakerBars: {
    role: 'opp', seats: ['lead'], weight: 2,
    choices: [
      { effects: [eff('cred', 1), eff('unity', 2), rival('pm', -0.003)] },
      { effects: [eff('cred', -1)] },
      { effects: [eff('unity', 2), eff('cred', -2), mood(TOWN, 0.01)] },
    ],
  },
  taxPledge: {
    role: 'opp', seats: ['lead'], weight: 3,
    choices: [
      { effects: [mood(['smallbiz', 'm40'], 0.03), eff('cred', -2)] },
      { effects: [eff('cred', 2), mood(['smallbiz'], -0.01)] },
      { effects: [mood(POOR, 0.02), eff('cred', -1)] },
    ],
  },
  civilServantFile: {
    role: 'opp', seats: ['lead'], weight: 2,
    choices: [
      { effects: [], gamble: { chance: 'cred', win: [rival('pm', -0.01), eff('dossier', -6)], lose: [eff('cred', -3)] } },
      { effects: [eff('cred', 2), eff('dossier', 2)] },
      { effects: [eff('cred', 1), eff('unity', -1)] },
    ],
  },
  pollLead: {
    role: 'opp', seats: ['lead'], weight: 3,
    choices: [
      { effects: [eff('cred', -1), mood('all', 0.005)] },
      { effects: [eff('funds', -50_000), mood('all', 0.015)] },
      { effects: [eff('cred', 2), eff('dossier', 4)] },
    ],
  },
  nationalMourning: {
    role: 'opp', seats: ['lead'], weight: 2,
    choices: [
      { effects: [eff('cred', 2), mood('all', 0.01)] },
      { effects: [eff('cred', 1), rival('pm', -0.003)] },
      { effects: [eff('cred', -3), eff('unity', 2)] },
    ],
  },
  whispersAgainstYou: {
    role: 'opp', seats: ['lead'], weight: 3, needs: { unityBelow: 55 },
    choices: [
      { effects: [eff('unity', 3), eff('cred', -1)] },
      { effects: [eff('unity', 2), eff('cred', 1)] },
      { effects: [], gamble: { chance: 'unity', win: [eff('unity', 5)], lose: [eff('unity', -5)] } },
    ],
  },
  creditRow: {
    role: 'opp', seats: ['lead'], weight: 3,
    choices: [
      { effects: [eff('cred', 1), rival('pm', -0.004)] },
      { effects: [eff('cred', 2), mood('all', 0.005)] },
      { effects: [eff('cred', -1), eff('unity', 1)] },
    ],
  },
  ethicsComplaint: {
    role: 'opp', seats: ['lead'], weight: 2,
    choices: [
      { effects: [eff('cred', 2)] },
      { effects: [eff('unity', 2), eff('cred', -2)] },
      { effects: [], gamble: { chance: 0.5, win: [mood('all', 0.005)], lose: [eff('cred', -2)] } },
    ],
  },
  foreignInvite: {
    role: 'opp', seats: ['lead'], weight: 2,
    choices: [
      { effects: [eff('cred', 1), eff('funds', -30_000), mood(TOWN, 0.015)] },
      { effects: [eff('unity', 1)] },
      { effects: [eff('cred', 1), eff('unity', 1)] },
    ],
  },
  budgetTip: {
    role: 'opp', seats: ['lead'], weight: 2,
    choices: [
      { effects: [], gamble: { chance: 0.5, win: [rival('pm', -0.01), eff('cred', 1)], lose: [eff('cred', -3)] } },
      { effects: [eff('cred', 2)] },
      { effects: [rival('pm', -0.004), eff('cred', -1)] },
    ],
  },
  showcaseState: {
    role: 'opp', seats: ['lead'], weight: 3, needs: { states: true },
    choices: [
      { effects: [eff('funds', -60_000), mood('all', 0.015), eff('cred', 1)] },
      { effects: [eff('cred', 1)] },
      { effects: [eff('cred', -2), eff('unity', 1)] },
    ],
  },
  millionPetition: {
    role: 'opp', seats: ['lead'], weight: 2,
    choices: [
      { effects: [eff('cred', 1), rival('pm', -0.005), eff('machinery', 2)] },
      { effects: [eff('cred', 1), mood('all', 0.005)] },
      { effects: [eff('machinery', 3), eff('cred', -1)] },
    ],
  },
  govtFumbles: {
    role: 'opp', seats: ['lead'], weight: 3, needs: { hot: true },
    choices: [
      { effects: [mood(POOR, 0.02), eff('cred', -1), rival('pm', -0.004), hot('wages', 0.1)] },
      { effects: [eff('cred', 2), mood(['m40'], 0.01)] },
      { effects: [eff('cred', 1), eff('dossier', 3)] },
    ],
  },
  wooPartner: {
    role: 'opp', seats: ['lead'], weight: 2,
    choices: [
      { effects: [], gamble: { chance: 0.4, win: [eff('stability', -3), rel('partners', 3)], lose: [eff('cred', -2), rel('partners', -3)] } },
      { effects: [rel('partners', 2), eff('stability', -1), eff('cred', -1)] },
      { effects: [eff('unity', 1)] },
    ],
  },
  resignCalls: {
    role: 'opp', seats: ['lead'], weight: 3,
    choices: [
      { effects: [rival('pm', -0.006), eff('cred', -1)] },
      { effects: [], gamble: { chance: 0.45, win: [eff('stability', -3), eff('cred', 1)], lose: [eff('cred', -2)] } },
      { effects: [eff('cred', 2)] },
    ],
  },
  // ===== in opposition, but not leading it =====
  leadFreeze: {
    role: 'opp', seats: ['opp'], weight: 3,
    choices: [
      { effects: [rel('opp', -3), eff('cred', 1)] },
      { effects: [rel('opp', 2), eff('unity', -1)] },
      { effects: [eff('unity', 2), eff('cred', 1), rel('opp', -2)] },
    ],
  },
  govtCourts: {
    role: 'opp', seats: ['opp'], weight: 3,
    choices: [
      { effects: [rel('pm', 3), eff('cred', -2), mood(VILLAGE, 0.02)] },
      { effects: [eff('cred', 2), eff('unity', 1)] },
      { effects: [], gamble: { chance: 0.5, win: [mood('all', 0.01), eff('cred', 1)], lose: [rel('pm', -3), eff('cred', -2)] } },
    ],
  },
  seatDealLead: {
    role: 'opp', seats: ['opp'], weight: 3,
    choices: [
      { effects: [rel('opp', 3), eff('unity', -3)] },
      { effects: [rel('opp', -2), eff('unity', 2)] },
      { effects: [], gamble: { chance: 0.5, win: [rel('opp', 2), eff('unity', 1)], lose: [rel('opp', -2)] } },
    ],
  },
  swingVotes: {
    role: 'opp', seats: ['opp'], weight: 3,
    choices: [
      { effects: [eff('funds', 60_000), eff('cred', -3), rel('pm', 2)] },
      { effects: [eff('cred', 2)] },
      { effects: [eff('unity', -1)] },
    ],
  },
  speakingTime: {
    role: 'opp', seats: ['opp'], weight: 2,
    choices: [
      { effects: [eff('cred', 1), eff('unity', 1)] },
      { effects: [eff('cred', -1)] },
      { effects: [mood(['undi18'], 0.02)] },
    ],
  },
  constituencyClinic: {
    role: 'opp', seats: ['opp'], weight: 3,
    choices: [
      { effects: [eff('funds', -40_000), mood(['heartland', 'urban_b40', 'seniors'], 0.03)] },
      { effects: [eff('cred', 1), rel('pm', -1)] },
      { effects: [mood('all', 0.01), eff('cred', -1)] },
    ],
  },
  ministryOffer: {
    role: 'opp', seats: ['opp'], weight: 2,
    choices: [
      { effects: [rel('pm', 3), eff('cred', -2), eff('unity', -2)] },
      { effects: [eff('cred', 2), eff('unity', 1)] },
      { effects: [], gamble: { chance: 0.4, win: [rel('pm', 2), eff('funds', 70_000)], lose: [rel('pm', -3), eff('cred', -1)] } },
    ],
  },
  nicheCause: {
    role: 'opp', seats: ['opp'], weight: 3,
    choices: [
      { effects: [mood(['seniors'], 0.025), eff('cred', 1), hot('health', 0.2)] },
      { effects: [rel('opp', 2)] },
      { effects: [eff('unity', -2)] },
    ],
  },
  donorSmall: {
    role: 'opp', seats: ['opp'], weight: 2,
    choices: [
      { effects: [eff('funds', 80_000), eff('cred', -2)] },
      { effects: [eff('funds', 40_000), eff('cred', 1)] },
      { effects: [eff('cred', 2)] },
    ],
  },
  mergerInvite: {
    role: 'opp', seats: ['opp'], weight: 2,
    choices: [
      { effects: [rel('opp', 3), eff('unity', -4), eff('machinery', 2)] },
      { effects: [eff('unity', 2), eff('cred', 1), rel('opp', -2)] },
      { effects: [], gamble: { chance: 0.5, win: [rel('opp', 2), eff('unity', 1)], lose: [rel('opp', -3)] } },
    ],
  },
  defectionYours: {
    role: 'opp', seats: ['opp'], weight: 3,
    choices: [
      { effects: [eff('unity', -2), eff('cred', 1)] },
      { effects: [], gamble: { chance: 'unity', win: [eff('unity', 3)], lose: [eff('unity', -3), eff('cred', -1)] } },
      { effects: [eff('unity', -1), eff('cred', 1)] },
    ],
  },
  constituencyFlood: {
    role: 'opp', seats: ['opp'], weight: 3,
    choices: [
      { effects: [eff('funds', -40_000), mood(VILLAGE, 0.03), eff('cred', 1)] },
      { effects: [eff('cred', 1), rel('pm', -1), mood(VILLAGE, 0.01)] },
      { effects: [mood(VILLAGE, 0.01), eff('cred', -2)] },
    ],
  },
  localProtest: {
    role: 'opp', seats: ['opp'], weight: 3,
    choices: [
      { effects: [mood(['urban_b40', 'heartland'], 0.02), eff('cred', -1)] },
      { effects: [eff('cred', 1), mood('all', 0.005)] },
      { effects: [eff('unity', -1)] },
    ],
  },
  shadowPortfolio: {
    role: 'opp', seats: ['opp'], weight: 2,
    choices: [
      { effects: [rel('opp', 2), eff('unity', -1)] },
      { effects: [], gamble: { chance: 0.4, win: [rel('opp', 2), eff('unity', 2)], lose: [rel('opp', -2)] } },
      { effects: [eff('unity', 1), eff('cred', 1)] },
    ],
  },
  mediaBlackout: {
    role: 'opp', seats: ['opp'], weight: 3,
    choices: [
      { effects: [eff('funds', -50_000), mood('all', 0.01)] },
      { effects: [], gamble: { chance: 0.5, win: [mood(['undi18', 'gig'], 0.03)], lose: [eff('cred', -2)] } },
      { effects: [rel('opp', 2), mood('all', 0.005)] },
    ],
  },
  volunteerShortage: {
    role: 'opp', seats: ['opp'], weight: 3,
    choices: [
      { effects: [eff('funds', -40_000), eff('machinery', 3)] },
      { effects: [eff('machinery', 2), mood(['undi18'], 0.01)] },
      { effects: [eff('unity', -1), eff('machinery', -1)] },
    ],
  },
  borrowedLogo: {
    role: 'opp', seats: ['opp'], weight: 2,
    choices: [
      { effects: [eff('cred', -1), eff('unity', -3), mood('all', 0.015)] },
      { effects: [eff('unity', 2), eff('cred', 1)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('unity', 1), mood('all', 0.01)], lose: [eff('cred', -2)] } },
    ],
  },
  trappedVote: {
    role: 'opp', seats: ['opp'], weight: 3,
    choices: [
      { effects: [rel('pm', 3), eff('unity', -3)] },
      { effects: [rel('pm', -2), eff('cred', 1)] },
      { effects: [eff('cred', -2)] },
    ],
  },
  endorsement: {
    role: 'opp', seats: ['opp'], weight: 3,
    choices: [
      { effects: [mood(['heartland', 'seniors'], 0.02), eff('cred', 1)] },
      { effects: [mood(['heartland'], 0.01), eff('cred', -1)] },
      { effects: [eff('cred', 1)] },
    ],
  },
  councilWin: {
    role: 'opp', seats: ['opp'], weight: 3,
    choices: [
      { effects: [eff('machinery', 3), mood('all', 0.01)] },
      { effects: [eff('cred', 1), mood('all', 0.015)] },
      { effects: [eff('unity', 1)] },
    ],
  },
};
