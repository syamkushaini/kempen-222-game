import type { BlocId } from '../types';
import type { Effect, EventDef } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'machinery' | 'dossier' | 'fiscal', n: number): Effect => ({ t, n });
const rival = (who: 'pm' | 'opp' | 'partners', n: number): Effect => ({ t: 'rival', who, n });
const hot = (issue: 'liberties' | 'transport' | 'studentDebt' | 'health' | 'rural' | 'wages', n: number): Effect => ({ t: 'salience', issue, n });
const econ = (growth: number, inflation = 0): Effect => ({ t: 'economy', growth, inflation });
const nat = (health = 0, education = 0, standing = 0): Effect => ({ t: 'nation', health, education, standing });
const BORNEO: BlocId[] = ['borneo_native', 'borneo_urban'];
const VILLAGE: BlocId[] = ['heartland', 'felda', 'agri'];
const POOR: BlocId[] = ['urban_b40', 'gig'];
const TOWN: BlocId[] = ['m40', 'urban_lib'];

/**
 * Forty more things that can land on the desk, each with its own picture: the price of breakfast, a leaked chat group, a
 * heritage house in the way of a road. Written ahead of play (nothing is made up while a game runs), kept to the same sizes of
 * consequence as the rest, and told without taking a side against anyone’s faith or way of life. Every person and company in
 * them is invented. Text lives in `src/i18n/events8.ts` and `events9.ts`.
 */
export const NEW_EVENTS: Record<string, EventDef> = {
  // ----- the cost of living and the price of things -----
  nasiLemakPrice: {
    role: 'any', weight: 3,
    choices: [
      { effects: [eff('funds', -40_000), mood([...POOR, 'm40'], 0.025), eff('cred', 1)] },
      { effects: [], gamble: { chance: 0.5, win: [mood('all', 0.01), eff('cred', 1)], lose: [mood(POOR, -0.03), eff('cred', -2)] } },
      { effects: [eff('cred', -1), mood([...POOR, 'undi18'], -0.015)] },
    ],
  },
  cooperativeBank: {
    role: 'gov', weight: 2,
    choices: [
      { effects: [eff('fiscal', 1), mood(VILLAGE, 0.03), eff('cred', -1)] },
      { effects: [mood(['agri', 'felda'], -0.04), eff('cred', 1), eff('trust', -2)] },
      { effects: [], gamble: { chance: 'stability', win: [mood(VILLAGE, 0.02), eff('cred', 1)], lose: [mood(['agri', 'felda'], -0.03), eff('trust', -3)] } },
    ],
  },
  gigInsurance: {
    role: 'any', weight: 3,
    choices: [
      { effects: [eff('funds', -60_000), mood(['gig', 'undi18'], 0.035), eff('cred', 1)] },
      { effects: [mood(['gig'], 0.02), mood(['smallbiz'], -0.03)] },
      { effects: [mood(['gig'], -0.015), eff('cred', -1)] },
    ],
  },
  nightMarket: {
    role: 'any', weight: 3,
    choices: [
      { effects: [mood(['smallbiz', 'urban_b40', 'heartland'], 0.02), mood(TOWN, -0.01), eff('cred', 1)] },
      { effects: [eff('funds', -30_000), mood(['smallbiz'], 0.005), mood(TOWN, 0.02)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('cred', 1)], lose: [mood(['smallbiz', 'urban_b40'], -0.03)] } },
    ],
  },
  electricityTariff: {
    role: 'gov', weight: 3,
    choices: [
      { effects: [mood(['smallbiz'], -0.025), econ(-0.1), eff('trust', 1)] },
      { effects: [eff('fiscal', 1), mood(['urban_b40', 'm40'], 0.02)] },
      { effects: [], gamble: { chance: 0.5, win: [econ(0.1)], lose: [eff('trust', -3), mood('all', -0.015)] } },
    ],
  },
  cropGlut: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('funds', -80_000), mood(VILLAGE, 0.035), eff('cred', 1)] },
      { effects: [], gamble: { chance: 0.45, win: [mood(VILLAGE, 0.03), mood(['smallbiz'], 0.01)], lose: [mood(VILLAGE, -0.02)] } },
      { effects: [mood(['agri', 'felda'], -0.035)] },
    ],
  },
  // ----- places, and what is built in them -----
  lakeResort: {
    role: 'any', weight: 2, needs: { states: true },
    choices: [
      { effects: [eff('funds', 60_000), mood(['smallbiz'], 0.015), mood(TOWN, -0.03), eff('cred', -1)] },
      { effects: [eff('cred', 2), mood(TOWN, 0.02)] },
      { effects: [], gamble: { chance: 'cred', win: [eff('cred', 2), mood(['urban_lib'], 0.02)], lose: [mood(['smallbiz'], -0.02), eff('cred', -1)] } },
    ],
  },
  trawlers: {
    role: 'any', weight: 3,
    choices: [
      { effects: [mood(['agri'], 0.02), mood(['smallbiz'], -0.015), eff('cred', 1)] },
      { effects: [eff('funds', 50_000), mood(['agri'], -0.04), eff('cred', -2)] },
      { effects: [eff('funds', -50_000), mood(['agri', 'heartland'], 0.02)] },
    ],
  },
  heritageHouse: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('funds', -20_000), eff('cred', 2), mood(TOWN, 0.025), mood(['smallbiz'], -0.01)] },
      { effects: [eff('cred', -1), mood(TOWN, -0.03), mood(['smallbiz', 'heartland'], 0.01)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('cred', 2), mood(['urban_lib'], 0.015)], lose: [eff('funds', -60_000), eff('cred', -1)] } },
    ],
  },
  stateBanquet: {
    role: 'any', weight: 2, needs: { states: true },
    choices: [
      { effects: [eff('funds', -30_000), eff('cred', 2)] },
      { effects: [], gamble: { chance: 'cred', win: [mood(['smallbiz'], 0.01)], lose: [mood('all', -0.02), eff('cred', -2)] } },
      { effects: [eff('unity', -2), eff('cred', -1)] },
    ],
  },
  hawkerLicence: {
    role: 'any', weight: 3,
    choices: [
      { effects: [mood(['smallbiz', 'urban_b40'], 0.03), eff('cred', -1)] },
      { effects: [mood(['smallbiz', 'urban_b40'], -0.03), mood(TOWN, 0.015), eff('cred', 1)] },
      { effects: [eff('funds', -20_000), mood(['smallbiz'], 0.015), mood(['undi18'], 0.01)] },
    ],
  },
  ferryStops: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('funds', -50_000), mood(BORNEO, 0.035), eff('cred', 1)] },
      { effects: [mood(BORNEO, -0.03), mood(['smallbiz'], 0.01)] },
      { effects: [], gamble: { chance: 'cred', win: [mood(BORNEO, 0.03)], lose: [mood(BORNEO, -0.04), eff('cred', -2)] } },
    ],
  },
  // ----- the screen in your pocket -----
  fakeNewsLaw: {
    role: 'gov', weight: 3,
    choices: [
      { effects: [mood(['heartland', 'seniors'], 0.01), mood(['urban_lib', 'undi18'], -0.04), hot('liberties', 0.2)] },
      { effects: [eff('cred', 1), mood(['urban_lib'], 0.01), eff('trust', -1)] },
      { effects: [mood(['urban_lib'], 0.01), eff('stability', -1)] },
    ],
  },
  memeWar: {
    role: 'any', weight: 3,
    choices: [
      { effects: [], gamble: { chance: 0.55, win: [mood(['undi18', 'gig'], 0.04), eff('cred', 1)], lose: [mood(['undi18'], -0.03), eff('cred', -2)] } },
      { effects: [eff('funds', -40_000), mood(['undi18'], -0.03), eff('cred', -1)] },
      { effects: [] },
    ],
  },
  whatsappLeak: {
    role: 'any', weight: 3,
    choices: [
      { effects: [eff('unity', -3), eff('cred', 1)] },
      { effects: [], gamble: { chance: 'unity', win: [eff('unity', 2), mood(['undi18'], 0.01)], lose: [eff('unity', -3), eff('cred', -1)] } },
      { effects: [eff('unity', -2), eff('machinery', -2)] },
    ],
  },
  tongueSlip: {
    role: 'any', weight: 3,
    choices: [
      { effects: [eff('cred', 1), mood('all', -0.005)] },
      { effects: [], gamble: { chance: 0.5, win: [mood(['undi18', 'gig'], 0.025)], lose: [mood('all', -0.025), eff('cred', -2)] } },
      { effects: [mood(['heartland'], 0.01), eff('cred', -2)] },
    ],
  },
  newsPortal: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('cred', 1), mood(TOWN, 0.015)] },
      { effects: [eff('funds', -60_000), mood('all', 0.015), eff('cred', -2)] },
      { effects: [] },
    ],
  },
  // ----- the party's own house -----
  twoBranches: {
    role: 'any', weight: 3,
    choices: [
      { effects: [eff('unity', -3), eff('machinery', 3)] },
      { effects: [eff('funds', -60_000), eff('unity', 2), eff('machinery', 2)] },
      { effects: [eff('unity', 1)] },
    ],
  },
  youngTalent: {
    role: 'any', weight: 3,
    choices: [
      { effects: [eff('unity', -3), mood(['undi18', 'gig'], 0.035), eff('cred', 1)] },
      { effects: [eff('unity', 2), mood(['undi18'], -0.03)] },
      { effects: [], gamble: { chance: 0.5, win: [mood(['undi18', 'gig'], 0.03), eff('unity', 1)], lose: [eff('unity', -2)] } },
    ],
  },
  veteranMp: {
    role: 'any', weight: 3,
    choices: [
      { effects: [eff('unity', 2), mood(['seniors'], 0.01)] },
      { effects: [eff('unity', -4), mood(['undi18'], 0.02), eff('cred', 1)] },
      { effects: [eff('unity', 1), mood(['undi18'], -0.015)] },
    ],
  },
  billboardSponsor: {
    role: 'any', weight: 3,
    choices: [
      { effects: [eff('funds', 100_000), eff('cred', -2), mood(['urban_lib'], -0.01)] },
      { effects: [eff('cred', 1), eff('unity', 1)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('funds', 60_000)], lose: [eff('cred', -2)] } },
    ],
  },
  womensQuota: {
    role: 'any', weight: 3,
    choices: [
      { effects: [eff('unity', -2), mood(TOWN, 0.03), eff('cred', 1)] },
      { effects: [mood(['m40'], 0.01)] },
      { effects: [eff('unity', 1), mood(TOWN, -0.03)] },
    ],
  },
  memberApp: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('funds', -70_000), eff('machinery', 4), mood(['undi18'], 0.01)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('machinery', 3)], lose: [eff('machinery', -1), eff('cred', -1)] } },
      { effects: [] },
    ],
  },
  hallFire: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('funds', -20_000), eff('machinery', 2), eff('unity', 3)] },
      { effects: [eff('funds', -10_000)] },
      { effects: [], gamble: { chance: 'unity', win: [eff('funds', 90_000)], lose: [eff('unity', -2)] } },
    ],
  },
  // ----- the House, and the government's own business -----
  cabinetLeak: {
    role: 'gov', weight: 3,
    choices: [
      { effects: [eff('unity', -2), eff('stability', 1), eff('cred', -1)] },
      { effects: [eff('cred', 2), eff('stability', -2)] },
      { effects: [eff('trust', -1)] },
    ],
  },
  extraHoliday: {
    role: 'gov', weight: 2,
    choices: [
      { effects: [mood(['heartland', 'civil', 'urban_b40'], 0.02), mood(['smallbiz'], -0.025), econ(-0.1)] },
      { effects: [mood(['smallbiz'], 0.015), mood(['civil'], -0.02)] },
      { effects: [eff('cred', 1)] },
    ],
  },
  airMiles: {
    role: 'gov', weight: 3,
    choices: [
      { effects: [eff('cred', 2), eff('trust', 2)] },
      { effects: [], gamble: { chance: 'cred', win: [nat(0, 0, 2), eff('cred', 1)], lose: [eff('trust', -4), eff('cred', -2)] } },
      { effects: [eff('stability', -2)] },
    ],
  },
  houseWalkout: {
    role: 'opp', weight: 3,
    choices: [
      { effects: [eff('unity', 2), eff('cred', -1), mood(TOWN, 0.01)] },
      { effects: [eff('cred', 2), eff('dossier', 4)] },
      { effects: [eff('unity', -1)] },
    ],
  },
  sharpQuestion: {
    role: 'opp', weight: 3,
    choices: [
      { effects: [eff('dossier', -8), rival('pm', -0.01), eff('cred', 1)] },
      { effects: [mood(['undi18'], 0.02), eff('cred', -1)] },
      { effects: [mood(['heartland'], 0.015), eff('cred', 1)] },
    ],
  },
  partyAnniversary: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('funds', -90_000), eff('unity', 4), eff('cred', -1)] },
      { effects: [eff('funds', -30_000), eff('cred', 2), eff('unity', 2)] },
      { effects: [eff('unity', -1)] },
    ],
  },
  consultants: {
    role: 'gov', weight: 2,
    choices: [
      { effects: [eff('fiscal', 1), nat(2, 2, 1)] },
      { effects: [nat(0, 1, 0), eff('cred', 1), eff('stability', -1)] },
      { effects: [eff('cred', -2), mood(['civil'], 0.01)] },
    ],
  },
  schoolMeals: {
    role: 'gov', weight: 3, needs: { education: 70 },
    choices: [
      { effects: [eff('fiscal', 1), nat(0, 5), mood(['urban_b40', 'heartland'], 0.03)] },
      { effects: [nat(0, 3), mood(['urban_b40'], 0.015)] },
      { effects: [], gamble: { chance: 0.5, win: [nat(0, 4), eff('cred', 1)], lose: [nat(0, -1), mood(['urban_b40'], -0.02)] } },
    ],
  },
  // ----- everyday life -----
  trafficJam: {
    role: 'any', weight: 3,
    choices: [
      { effects: [mood(TOWN, -0.02), mood(['urban_b40'], 0.01), eff('cred', 1), hot('transport', 0.2)] },
      { effects: [eff('funds', -60_000), mood(['urban_b40', 'm40'], 0.025)] },
      { effects: [], gamble: { chance: 0.5, win: [mood(['m40', 'smallbiz'], 0.02)], lose: [eff('cred', -2), mood(['m40'], -0.02)] } },
    ],
  },
  goldMedal: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('funds', -40_000), mood('all', 0.015)] },
      { effects: [mood(['undi18'], -0.005), eff('cred', 1)] },
      { effects: [eff('funds', -30_000), mood(['undi18', 'heartland'], 0.02), eff('cred', 1)] },
    ],
  },
  scamCalls: {
    role: 'gov', weight: 3,
    choices: [
      { effects: [eff('fiscal', 1), nat(0, 0, 1), mood(['seniors', 'm40'], 0.025)] },
      { effects: [mood(['seniors', 'm40'], 0.01), eff('cred', -1)] },
      { effects: [eff('funds', -30_000), mood(['seniors'], 0.015), eff('cred', 1)] },
    ],
  },
  tuitionCentres: {
    role: 'any', weight: 2,
    choices: [
      { effects: [mood(['m40', 'urban_b40'], 0.02), mood(['smallbiz'], -0.015), eff('cred', 1), hot('studentDebt', 0.1)] },
      { effects: [mood(['smallbiz'], 0.01), mood(['m40'], -0.01)] },
      { effects: [eff('funds', -50_000), mood(['undi18', 'm40'], 0.03)] },
    ],
  },
  strayCats: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('funds', -30_000), eff('cred', 1), mood(['urban_lib', 'undi18'], 0.02)] },
      { effects: [mood(['urban_lib', 'undi18'], -0.04), mood(['heartland'], 0.005)] },
      { effects: [eff('cred', -1)] },
    ],
  },
  // ----- other nations -----
  visaFree: {
    role: 'gov', weight: 2,
    choices: [
      { effects: [mood(['smallbiz'], 0.025), nat(0, 0, 2), econ(0.15)] },
      { effects: [econ(0.05), eff('cred', 1)] },
      { effects: [mood(['smallbiz'], -0.015)] },
    ],
  },
  foreignCampus: {
    role: 'gov', weight: 2,
    choices: [
      { effects: [nat(0, 6, 1), mood(TOWN, 0.02), mood(['civil'], -0.015)] },
      { effects: [nat(0, 3, 0), eff('cred', 1)] },
      { effects: [mood(['civil'], 0.015), nat(0, -2, -1)] },
    ],
  },
  carbonRule: {
    role: 'gov', weight: 2,
    choices: [
      { effects: [eff('fiscal', 1), econ(-0.1), nat(0, 0, 3), mood(['urban_lib'], 0.02)] },
      { effects: [], gamble: { chance: 0.5, win: [nat(0, 0, 1), mood(['smallbiz'], 0.015)], lose: [nat(0, 0, -3), eff('cred', -2)] } },
      { effects: [nat(0, 0, -3), mood(['smallbiz'], 0.01)] },
    ],
  },
};
