import type { BlocId, PartyId } from '../types';
import type { Effect, EventDef, Who } from './events';
import type { IssueId } from './types';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'fiscal', n: number): Effect => ({ t, n });
const rel = (who: Who, n: number): Effect => ({ t: 'relation', who, n });
const hot = (issue: IssueId, n: number): Effect => ({ t: 'salience', issue, n });
const econ = (growth: number, inflation = 0): Effect => ({ t: 'economy', growth, inflation });
/** Changes in how well the country is looked after (health, schooling) and how it stands among nations. */
const nat = (health = 0, education = 0, standing = 0): Effect => ({ t: 'nation', health, education, standing });
const BORNEO: BlocId[] = ['borneo_native', 'borneo_urban'];
const gbk: PartyId = 'gbk', gbs: PartyId = 'gbs';

/**
 * The challenges of governing: the hospitals and the schools, the books, other
 * nations, and the federation's own quarrels. They come to those who sit in the
 * government, and the ones tied to a figure come when it is low. Other nations are
 * never named: "a trading partner", "a great power". Text is in i18n/events3.ts.
 */
export const GOVERNING_EVENTS: Record<string, EventDef> = {
  // ----- health -----
  wardsFull: {
    role: 'gov', weight: 10, needs: { health: 50 },
    choices: [
      { effects: [eff('fiscal', 1), nat(10), eff('cred', 1)] },
      { effects: [eff('stability', -3), nat(2), mood(['heartland', 'felda', 'seniors'], -0.02)] },
      { effects: [nat(6), mood(['urban_b40', 'seniors'], -0.03), eff('cred', -2)] },
    ],
  },
  outbreak: {
    role: 'gov', weight: 3,
    choices: [
      { effects: [econ(-0.8), nat(4, -3, -3)] },
      { effects: [], gamble: { chance: 'stability', win: [nat(3, 0, 1), eff('cred', 2)], lose: [nat(-10), mood('all', -0.03)] } },
      { effects: [], gamble: { chance: 0.3, win: [econ(0.1)], lose: [nat(-14, -3, -4), mood('all', -0.05), eff('cred', -3)] } },
    ],
  },
  // ----- education -----
  examResults: {
    role: 'gov', weight: 10, needs: { education: 50 },
    choices: [
      { effects: [eff('fiscal', 1), nat(0, 9), mood(['civil', 'm40'], 0.015)] },
      { effects: [eff('cred', -2), mood(['undi18'], -0.01)] },
      { effects: [nat(0, -3), mood(['undi18'], 0.02), eff('cred', -3)] },
    ],
  },
  campusProtest: {
    role: 'gov', weight: 4,
    choices: [
      { effects: [eff('fiscal', 1), mood(['undi18', 'gig'], 0.05), hot('studentDebt', 0.2), nat(0, 2)] },
      { effects: [], gamble: { chance: 'cred', win: [mood(['undi18'], 0.025), eff('cred', 2)], lose: [mood(['undi18', 'gig'], -0.04)] } },
      { effects: [mood(['undi18', 'gig'], -0.04), hot('studentDebt', 0.2)] },
    ],
  },
  teacherStrike: {
    role: 'gov', weight: 4,
    choices: [
      { effects: [eff('fiscal', 1), nat(0, 4), mood(['civil'], 0.03)] },
      { effects: [], gamble: { chance: 'stability', win: [eff('cred', 2)], lose: [nat(0, -6), mood(['civil'], -0.04), eff('stability', -3)] } },
      { effects: [nat(0, -5), mood(['civil', 'm40'], -0.03)] },
    ],
  },
  // ----- the books -----
  ratingsWarning: {
    role: 'gov', weight: 10, needs: { debt: 65 },
    choices: [
      { effects: [econ(-0.8), eff('fiscal', -1), nat(-2, -2, 4), mood('all', -0.015)] },
      { effects: [eff('fiscal', -1), nat(0, 0, 2), mood(['smallbiz'], -0.04), mood(['m40'], -0.03)] },
      { effects: [], gamble: { chance: 0.4, win: [eff('cred', 1)], lose: [nat(0, 0, -10), econ(-0.6, 0.3)] } },
    ],
  },
  // ----- other nations -----
  tradeDispute: {
    role: 'gov', weight: 5,
    choices: [
      { effects: [econ(-0.5, 0.4), nat(0, 0, -3), mood(['heartland', 'felda'], 0.02), eff('cred', 1)] },
      { effects: [], gamble: { chance: 'cred', win: [econ(0.2), nat(0, 0, 3)], lose: [econ(-0.5), nat(0, 0, -2)] } },
      { effects: [econ(-0.2), nat(0, 0, 2), mood(['smallbiz'], 0.02), eff('cred', -3)] },
    ],
  },
  seaIncident: {
    role: 'gov', weight: 4,
    choices: [
      { effects: [], gamble: { chance: 0.5, win: [mood(['heartland', 'felda', 'agri'], 0.04)], lose: [nat(0, 0, -6), eff('stability', -4)] } },
      { effects: [nat(0, 0, 1), mood(['heartland'], -0.01)] },
      { effects: [nat(0, 0, 2)], then: { event: 'mediationAward', after: 8 } },
    ],
  },
  mediationAward: {
    role: 'gov', weight: 0,
    choices: [
      { effects: [nat(0, 0, 3), mood(['heartland', 'felda'], -0.02)] },
      { effects: [nat(0, 0, -5), mood(['heartland', 'felda'], 0.02)] },
    ],
  },
  summitHost: {
    role: 'gov', weight: 4,
    choices: [
      { effects: [eff('fiscal', 0.5), nat(0, 0, 8), mood('all', 0.01), eff('cred', -1)] },
      { effects: [nat(0, 0, 3)] },
      { effects: [nat(0, 0, -5)] },
    ],
  },
  refugeeBoats: {
    role: 'gov', weight: 3,
    choices: [
      { effects: [eff('fiscal', 0.5), nat(0, 0, 6), mood(['heartland', 'felda'], -0.03)] },
      { effects: [nat(0, 0, -7), mood(['heartland', 'felda'], 0.03)] },
      { effects: [], gamble: { chance: 'stability', win: [nat(0, 0, 3), eff('stability', 2)], lose: [nat(0, 0, -3), mood(['heartland'], -0.02)] } },
    ],
  },
  investorDelegation: {
    role: 'gov', weight: 4,
    choices: [
      { effects: [eff('fiscal', 0.5), econ(0.3), nat(0, 0, 3), mood(['urban_b40'], 0.02)] },
      { effects: [], gamble: { chance: 0.5, win: [econ(0.2), mood(['urban_b40', 'gig'], 0.03), nat(0, 0, 2)], lose: [nat(0, 0, -2), mood(['smallbiz'], -0.01)] } },
      { effects: [eff('cred', 1), mood(['heartland'], 0.01)] },
    ],
  },
  twoPowers: {
    role: 'pm', weight: 3,
    choices: [
      { effects: [econ(0.3), nat(0, 0, -3), rel('opp', -4)] },
      { effects: [econ(0.2), nat(0, 0, -2), mood(['heartland', 'felda'], 0.01)] },
      { effects: [], gamble: { chance: 'stability', win: [nat(0, 0, 5), eff('cred', 2)], lose: [nat(0, 0, -4), econ(-0.3)] } },
    ],
  },
  // ----- the federation and the Palace -----
  royaltiesRow: {
    role: 'gov', weight: 4, needs: { partners: true },
    choices: [
      { effects: [eff('fiscal', 1), mood(BORNEO, 0.05), rel(gbk, 10), rel(gbs, 10), mood(['heartland'], -0.01)] },
      { effects: [eff('fiscal', 0.5), mood(BORNEO, 0.02), rel(gbk, 4), rel(gbs, 4)] },
      { effects: [mood(BORNEO, -0.04), rel(gbk, -8), rel(gbs, -8), eff('stability', -3)] },
    ],
  },
  palaceConcern: {
    role: 'pm', weight: 3,
    choices: [
      { effects: [eff('cred', 2), eff('stability', 2)] },
      { effects: [], gamble: { chance: 'stability', win: [mood(['heartland', 'felda'], 0.02)], lose: [eff('stability', -5), eff('cred', -2), nat(0, 0, -2)] } },
    ],
  },
  stateDefiance: {
    role: 'pm', weight: 3,
    choices: [
      { effects: [rel('opp', -8), eff('stability', -2), eff('cred', 1)] },
      { effects: [eff('cred', 1), eff('stability', 1)] },
      { effects: [eff('cred', -2), mood(['civil'], -0.01)] },
    ],
  },
};
