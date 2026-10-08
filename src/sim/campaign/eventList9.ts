import type { BlocId } from '../types';
import type { Effect, EventDef, Who } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'machinery' | 'dossier' | 'fiscal', n: number): Effect => ({ t, n });
const rel = (who: Who, n: number): Effect => ({ t: 'relation', who, n });
const econ = (growth: number, inflation = 0): Effect => ({ t: 'economy', growth, inflation });
const nat = (health = 0, education = 0, standing = 0): Effect => ({ t: 'nation', health, education, standing });
const POOR: BlocId[] = ['urban_b40', 'gig'];
const TOWN: BlocId[] = ['m40', 'urban_lib'];
const VILLAGE: BlocId[] = ['heartland', 'felda', 'agri'];

/**
 * What lands on the desk of someone who leads a government, and of someone who is a partner in one but does not lead it. The
 * two have different troubles: the first decides, and answers for it; the second is asked, is outvoted, and has to choose
 * between the credit of being in office and the freedom of being separate. Text lives in `src/i18n/events10.ts` to `events13.ts`.
 * Every person and company in them is invented.
 */
export const GOVERNING_SEATS: Record<string, EventDef> = {
  // ===== leading the government =====
  cabinetReshuffle: {
    role: 'pm', seats: ['pm'], weight: 3, needs: { partners: true },
    choices: [
      { effects: [rel('partners', 4), eff('unity', -2), eff('stability', 2)] },
      { effects: [eff('unity', 2), rel('partners', -3), eff('stability', -1)] },
      { effects: [], gamble: { chance: 'stability', win: [eff('stability', 1)], lose: [rel('partners', -4), eff('stability', -3)] } },
    ],
  },
  giveawayBudget: {
    role: 'pm', seats: ['pm'], weight: 3, needs: { late: true },
    choices: [
      { effects: [eff('fiscal', 1), mood('all', 0.025), eff('trust', -2), eff('cred', -1)] },
      { effects: [eff('fiscal', 1), mood(['urban_b40', 'heartland', 'seniors'], 0.03)] },
      { effects: [mood('all', -0.01), eff('cred', 2), eff('trust', 2)] },
    ],
  },
  emergencyPowers: {
    role: 'pm', seats: ['pm'], weight: 2, needs: { slump: true },
    choices: [
      { effects: [eff('cred', 2), eff('trust', 2), mood(['urban_lib'], 0.01)] },
      { effects: [], gamble: { chance: 'stability', win: [econ(0.3), eff('trust', -1)], lose: [eff('trust', -4), mood(TOWN, -0.03)] } },
      { effects: [econ(0.2), eff('trust', -4), eff('cred', -3), mood(['urban_lib', 'undi18'], -0.04)] },
    ],
  },
  healthRumour: {
    role: 'pm', seats: ['pm'], weight: 2,
    choices: [
      { effects: [eff('trust', 1), eff('cred', 1)] },
      { effects: [eff('stability', 1)] },
      { effects: [], gamble: { chance: 0.5, win: [mood(['undi18'], 0.02)], lose: [eff('cred', -2), eff('trust', -2)] } },
    ],
  },
  nationalAddress: {
    role: 'pm', seats: ['pm'], weight: 3, needs: { slump: true },
    choices: [
      { effects: [eff('trust', 1), eff('cred', 1)] },
      { effects: [eff('fiscal', 1), econ(0.25), mood('all', 0.015)] },
      { effects: [eff('cred', -1), mood('all', -0.005)] },
    ],
  },
  stateVisit: {
    role: 'pm', seats: ['pm'], weight: 2,
    choices: [
      { effects: [econ(0.2), nat(0, 0, 2), mood(['smallbiz'], 0.015), mood(['urban_lib'], -0.015)] },
      { effects: [nat(0, 0, -1), eff('cred', 2), mood(['urban_lib'], 0.02)] },
      { effects: [eff('trust', 1)] },
    ],
  },
  payReview: {
    role: 'pm', seats: ['pm'], weight: 3,
    choices: [
      { effects: [eff('fiscal', 1), mood(['civil'], 0.04), eff('stability', 1)] },
      { effects: [eff('fiscal', -1), mood(['civil'], -0.04)] },
      { effects: [], gamble: { chance: 0.55, win: [mood(['civil'], 0.015)], lose: [mood(['civil'], -0.02), eff('trust', -1)] } },
    ],
  },
  judicialPanel: {
    role: 'pm', seats: ['pm'], weight: 2,
    choices: [
      { effects: [eff('cred', 2), eff('trust', 2), eff('stability', -1)] },
      { effects: [], gamble: { chance: 'stability', win: [eff('stability', 2)], lose: [eff('trust', -3), eff('cred', -2)] } },
      { effects: [eff('stability', 1), eff('cred', -1)] },
    ],
  },
  seatTalks: {
    role: 'pm', seats: ['pm'], weight: 3, needs: { partners: true, late: true },
    choices: [
      { effects: [rel('partners', 4), eff('unity', -3)] },
      { effects: [rel('partners', -4), eff('unity', 2)] },
      { effects: [], gamble: { chance: 0.5, win: [rel('partners', 2), eff('unity', 1)], lose: [rel('partners', -3), eff('stability', -2)] } },
    ],
  },
  inflationCommittee: {
    role: 'pm', seats: ['pm'], weight: 3, needs: { hot: true },
    choices: [
      { effects: [eff('fiscal', 1), mood(POOR, 0.03), econ(-0.1, -0.3)] },
      { effects: [eff('fiscal', 1), mood(['m40', 'urban_b40'], 0.025)] },
      { effects: [econ(-0.2, -0.4), mood(['smallbiz'], -0.02), eff('cred', 1)] },
    ],
  },
  railStrike: {
    role: 'pm', seats: ['pm'], weight: 2,
    choices: [
      { effects: [eff('fiscal', 1), mood(['urban_b40', 'gig'], 0.02), eff('trust', 1)] },
      { effects: [], gamble: { chance: 'stability', win: [eff('trust', 1)], lose: [mood(['urban_b40'], -0.02)] } },
      { effects: [mood(['urban_b40'], -0.03), eff('trust', -3), econ(0.1)] },
    ],
  },
  mpAllowance: {
    role: 'pm', seats: ['pm'], weight: 2,
    choices: [
      { effects: [eff('unity', 3), eff('cred', -3), mood('all', -0.015)] },
      { effects: [eff('unity', -3), eff('cred', 2)] },
      { effects: [eff('unity', 1), mood(['civil'], 0.01), eff('cred', -1)] },
    ],
  },
  // ===== a partner in the government =====
  juniorCredit: {
    role: 'partner', seats: ['gov'], weight: 3,
    choices: [
      { effects: [rel('pm', -3), mood('all', 0.015), eff('cred', -1)] },
      { effects: [rel('pm', 2), eff('cred', 1)] },
      { effects: [eff('unity', -2)] },
    ],
  },
  postsForMine: {
    role: 'partner', seats: ['gov'], weight: 3,
    choices: [
      { effects: [rel('pm', 2), eff('unity', -2)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('unity', 3), rel('pm', -1)], lose: [rel('pm', -4), eff('unity', -2)] } },
      { effects: [eff('stability', -3), rel('pm', -3), eff('unity', 2)] },
    ],
  },
  outvoted: {
    role: 'partner', seats: ['gov'], weight: 3,
    choices: [
      { effects: [rel('pm', 2), eff('cred', -1), eff('unity', -1)] },
      { effects: [rel('pm', -3), eff('cred', 1), mood(TOWN, 0.01)] },
      { effects: [eff('unity', -2), eff('stability', -2), eff('cred', 1)] },
    ],
  },
  unpopularBill: {
    role: 'partner', seats: ['gov'], weight: 3,
    choices: [
      { effects: [rel('pm', 3), eff('unity', -3), mood(VILLAGE, -0.015)] },
      { effects: [eff('unity', 1)] },
      { effects: [rel('pm', -4), eff('stability', -2), eff('cred', 2)] },
    ],
  },
  crossoverOffer: {
    role: 'partner', seats: ['gov'], weight: 2,
    choices: [
      { effects: [eff('cred', 2), rel('pm', 2)] },
      { effects: [], gamble: { chance: 'cred', win: [rel('opp', 3), eff('unity', 2)], lose: [rel('pm', -5), eff('cred', -2)] } },
      { effects: [rel('pm', 3), rel('opp', -3)] },
    ],
  },
  partnerMinisterRow: {
    role: 'partner', seats: ['gov'], weight: 3,
    choices: [
      { effects: [rel('pm', -2), eff('unity', 1)] },
      { effects: [eff('unity', -2), eff('cred', 2), rel('pm', 1)] },
      { effects: [eff('cred', -1), eff('unity', 1)] },
    ],
  },
  allocationFight: {
    role: 'partner', seats: ['gov'], weight: 3,
    choices: [
      { effects: [rel('pm', -3), mood('all', 0.01), eff('cred', 1)] },
      { effects: [eff('unity', -2)] },
      { effects: [eff('funds', 60_000), eff('cred', -2)] },
    ],
  },
  posterLogo: {
    role: 'partner', seats: ['gov'], weight: 2,
    choices: [
      { effects: [rel('pm', -2), eff('unity', 2)] },
      { effects: [rel('pm', 2), eff('unity', -1)] },
      { effects: [eff('cred', 1)] },
    ],
  },
  mergerOffer: {
    role: 'partner', seats: ['gov'], weight: 2,
    choices: [
      { effects: [rel('pm', 3), eff('unity', -4), eff('machinery', 2)] },
      { effects: [rel('pm', -3), eff('unity', 2), eff('cred', 1)] },
      { effects: [], gamble: { chance: 0.4, win: [rel('pm', 2), eff('unity', 2)], lose: [rel('pm', -3), eff('cred', -1)] } },
    ],
  },
  trailingInCoalition: {
    role: 'partner', seats: ['gov'], weight: 3, needs: { unityBelow: 60 },
    choices: [
      { effects: [rel('pm', -3), mood('all', 0.015), eff('stability', -2)] },
      { effects: [rel('pm', 2), eff('unity', -1)] },
      { effects: [eff('cred', 1), rel('pm', -1)] },
    ],
  },
  budgetShare: {
    role: 'partner', seats: ['gov'], weight: 3,
    choices: [
      { effects: [eff('unity', 2), rel('pm', -2)] },
      { effects: [rel('pm', 2), eff('unity', -3)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('unity', 2), rel('pm', 1)], lose: [eff('unity', -3)] } },
    ],
  },
  coalitionSummit: {
    role: 'partner', seats: ['gov'], weight: 2,
    choices: [
      { effects: [rel('pm', 2), eff('stability', 1)] },
      { effects: [rel('pm', -2), eff('unity', 2)] },
      { effects: [eff('unity', -1), eff('cred', -1)] },
    ],
  },
  stateSeatSwap: {
    role: 'partner', seats: ['gov'], weight: 2,
    choices: [
      { effects: [rel('pm', 3), eff('unity', -3)] },
      { effects: [], gamble: { chance: 0.5, win: [rel('pm', 1), eff('unity', 2)], lose: [rel('pm', -3)] } },
      { effects: [rel('pm', -4), eff('unity', 2)] },
    ],
  },
  leverageFile: {
    role: 'partner', seats: ['gov'], weight: 2,
    choices: [
      { effects: [rel('pm', -1), eff('cred', 2)] },
      { effects: [], gamble: { chance: 0.45, win: [mood('all', 0.01), eff('cred', 1)], lose: [rel('pm', -5), eff('cred', -2)] } },
      { effects: [eff('dossier', 4)] },
    ],
  },
  honoursList: {
    role: 'partner', seats: ['gov'], weight: 2,
    choices: [
      { effects: [rel('pm', 1), eff('unity', 2), eff('cred', -1)] },
      { effects: [eff('cred', 1), eff('unity', -1)] },
      { effects: [eff('unity', 2)] },
    ],
  },
  restlessMembers: {
    role: 'partner', seats: ['gov'], weight: 3, needs: { unityBelow: 55 },
    choices: [
      { effects: [eff('unity', 2), eff('cred', -1)] },
      { effects: [eff('unity', -3), eff('cred', 1)] },
      { effects: [eff('funds', -30_000), eff('unity', 3)] },
    ],
  },
};
