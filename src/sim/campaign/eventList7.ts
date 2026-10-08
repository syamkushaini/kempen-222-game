import type { BlocId } from '../types';
import type { Effect, EventDef, Who } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'fiscal' | 'dossier', n: number): Effect => ({ t, n });
const rel = (who: Who, n: number): Effect => ({ t: 'relation', who, n });
const nat = (health = 0, education = 0, standing = 0): Effect => ({ t: 'nation', health, education, standing });
const BORNEO: BlocId[] = ['borneo_native', 'borneo_urban'];
const VILLAGE: BlocId[] = ['heartland', 'felda', 'agri'];

/**
 * Stories of a state’s own customs, told with care and without taking a side against anyone’s faith or way of life; three
 * stories told in chapters; and two that are modelled, in fiction and without a name, on the great political stories of the
 * country. Text lives in `src/i18n/events7.ts`.
 */
export const STORY_EVENTS_2: Record<string, EventDef> = {
  // ----- a state's own customs: the player governs the state, or is in its career -----
  adatSuccession: {
    role: 'any', weight: 3, needs: { holds: 'nsembilan' },
    choices: [
      { effects: [mood(VILLAGE, 0.02), eff('cred', 1), rel('opp', 2)] },
      { effects: [], gamble: { chance: 'cred', win: [eff('unity', 2), mood(VILLAGE, 0.01)], lose: [mood(VILLAGE, -0.04), eff('cred', -3)] } },
      { effects: [eff('cred', 0), mood(['m40', 'civil'], 0.01)] },
    ],
  },
  weekendChange: {
    role: 'any', weight: 3, needs: { holds: 'kelantan' },
    choices: [
      { effects: [mood(VILLAGE, 0.03), mood(['smallbiz', 'm40'], -0.03)] },
      { effects: [mood(['smallbiz', 'm40'], 0.03), mood(VILLAGE, -0.03), eff('cred', -1)] },
      { effects: [mood('all', 0.005), eff('stability', -1)] },
    ],
  },
  nativeLand: {
    role: 'any', weight: 3, needs: { holds: 'sabah' },
    choices: [
      { effects: [mood(['borneo_native'], 0.05), eff('fiscal', 0.5), eff('cred', 1)] },
      { effects: [mood(['borneo_native'], 0.015), mood(['smallbiz'], 0.01)] },
      { effects: [mood(['borneo_native'], -0.05), eff('cred', -2)] },
    ],
  },
  longhouseRoad: {
    role: 'any', weight: 3, needs: { holds: 'sarawak' },
    choices: [
      { effects: [eff('funds', -60_000), mood(BORNEO, 0.03), eff('cred', 1)] },
      { effects: [mood(BORNEO, -0.03), nat(0, 0, 0), mood(['smallbiz'], 0.02)] },
      { effects: [], gamble: { chance: 0.5, win: [mood(BORNEO, 0.02), eff('cred', 1)], lose: [mood(BORNEO, -0.04), eff('cred', -2)] } },
    ],
  },
  processionRoute: {
    role: 'any', weight: 3, needs: { holds: 'penang' },
    choices: [
      { effects: [mood(['urban_lib', 'm40', 'urban_b40'], 0.02), mood(VILLAGE, -0.01), eff('cred', 1)] },
      { effects: [mood(['urban_b40'], -0.02), eff('stability', 1)] },
      { effects: [eff('cred', 2), eff('funds', -20_000), mood(['m40', 'urban_lib'], 0.015)] },
    ],
  },
  rulerRemarks: {
    role: 'any', weight: 3, needs: { holds: 'johor' },
    choices: [
      { effects: [mood(VILLAGE, 0.02), mood(['urban_lib'], -0.02), eff('cred', 0)] },
      { effects: [eff('cred', 1), eff('stability', 1)] },
      { effects: [mood(['urban_lib', 'm40'], 0.015), mood(VILLAGE, -0.015), eff('cred', -1)] },
    ],
  },

  // ----- the port: a contract, a protest, an audit -----
  portBid: {
    role: 'gov', weight: 3,
    choices: [
      { effects: [eff('funds', 120_000), eff('cred', -2), mood(['urban_lib', 'm40'], -0.02)], then: { event: 'portProtest', after: 9 } },
      { effects: [eff('cred', 2), eff('fiscal', 0.5), mood(['urban_lib', 'm40'], 0.02)], then: { event: 'portProtest', after: 9 } },
      { effects: [eff('stability', -1)] },
    ],
  },
  portProtest: {
    role: 'gov', weight: 0,
    choices: [
      { effects: [eff('cred', 1), mood(['civil', 'urban_b40'], 0.02)], then: { event: 'portAudit', after: 10 } },
      { effects: [mood(['civil', 'urban_b40'], -0.03), eff('stability', -1)], then: { event: 'portAudit', after: 10 } },
      { effects: [eff('funds', -50_000), mood(['civil'], 0.01)], then: { event: 'portAudit', after: 10 } },
    ],
  },
  portAudit: {
    role: 'gov', weight: 0,
    choices: [
      { effects: [eff('cred', 3), eff('trust', 3), eff('fiscal', 0.5)] },
      { effects: [], gamble: { chance: 'cred', win: [eff('cred', 1)], lose: [eff('cred', -5), eff('trust', -5)] } },
    ],
  },

  // ----- the youth fund: a reporter, an inquiry, a verdict -----
  youthFund: {
    role: 'any', weight: 3,
    choices: [
      { effects: [eff('dossier', 5), eff('cred', 1)], then: { event: 'youthFundProbe', after: 8 } },
      { effects: [eff('cred', -1), mood(['undi18', 'gig'], -0.02)], then: { event: 'youthFundProbe', after: 8 } },
      { effects: [mood(['undi18', 'gig'], 0.01)], then: { event: 'youthFundProbe', after: 12 } },
    ],
  },
  youthFundProbe: {
    role: 'any', weight: 0,
    choices: [
      { effects: [eff('unity', -2), eff('cred', 2), mood(['undi18', 'gig'], 0.02)], then: { event: 'youthFundVerdict', after: 10 } },
      { effects: [eff('unity', 1), eff('cred', -2)], then: { event: 'youthFundVerdict', after: 10 } },
      { effects: [eff('funds', -40_000), eff('cred', 1)], then: { event: 'youthFundVerdict', after: 10 } },
    ],
  },
  youthFundVerdict: {
    role: 'any', weight: 0,
    choices: [
      { effects: [eff('cred', 3), mood(['undi18', 'm40'], 0.03)] },
      { effects: [eff('cred', -3), mood(['undi18', 'm40'], -0.03)] },
    ],
  },

  // ----- the river: a complaint, a fish kill, a court -----
  riverFactory: {
    role: 'gov', weight: 3,
    choices: [
      { effects: [eff('funds', -50_000), mood(VILLAGE, 0.02), mood(['smallbiz'], -0.01)], then: { event: 'fishKill', after: 9 } },
      { effects: [mood(VILLAGE, -0.02), mood(['smallbiz'], 0.02)], then: { event: 'fishKill', after: 9 } },
      { effects: [eff('cred', -1)], then: { event: 'fishKill', after: 9 } },
    ],
  },
  fishKill: {
    role: 'gov', weight: 0,
    choices: [
      { effects: [eff('funds', -90_000), mood(VILLAGE, 0.03), nat(2, 0, 0)], then: { event: 'riverCourt', after: 10 } },
      { effects: [mood(VILLAGE, -0.04), nat(-2, 0, 0)], then: { event: 'riverCourt', after: 10 } },
      { effects: [], gamble: { chance: 'stability', win: [mood(VILLAGE, 0.01)], lose: [mood(VILLAGE, -0.04), eff('cred', -3)] }, then: { event: 'riverCourt', after: 10 } },
    ],
  },
  riverCourt: {
    role: 'gov', weight: 0,
    choices: [
      { effects: [eff('cred', 2), mood(VILLAGE, 0.02), mood(['smallbiz'], -0.02)] },
      { effects: [eff('cred', -2), mood(VILLAGE, -0.03), mood(['smallbiz'], 0.02)] },
    ],
  },

  // ----- a fund that lost its money: a fiction of the kind the country has seen -----
  sovereignFund: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('dossier', 8), eff('cred', 1), mood('all', -0.01)], then: { event: 'fundProbe', after: 10 } },
      { effects: [eff('cred', -2), mood('all', -0.015)], then: { event: 'fundProbe', after: 10 } },
      { effects: [eff('stability', -2), mood(['m40', 'urban_lib'], 0.01)], then: { event: 'fundProbe', after: 8 } },
    ],
  },
  fundProbe: {
    role: 'any', weight: 0,
    choices: [
      { effects: [eff('cred', 2), eff('unity', -3), eff('trust', 2)], then: { event: 'fundTrial', after: 14 } },
      { effects: [eff('cred', -3), eff('trust', -3)], then: { event: 'fundTrial', after: 14 } },
      { effects: [eff('funds', -80_000), eff('cred', 1)], then: { event: 'fundTrial', after: 14 } },
    ],
  },
  fundTrial: {
    role: 'any', weight: 0,
    choices: [
      { effects: [eff('cred', 3), mood(['m40', 'urban_lib', 'undi18'], 0.03)] },
      { effects: [eff('cred', -4), mood(['m40', 'urban_lib', 'undi18'], -0.03)] },
    ],
  },

  // ----- a night in a hotel: a fiction of the kind the country has seen -----
  hotelMeeting: {
    role: 'pm', weight: 2, needs: { shaky: 55 },
    choices: [
      { effects: [eff('stability', 4), eff('cred', -2), eff('funds', -100_000)], then: { event: 'hotelAftermath', after: 3 } },
      { effects: [eff('stability', -3), eff('cred', 2), mood('all', 0.01)], then: { event: 'hotelAftermath', after: 3 } },
      { effects: [], gamble: { chance: 'stability', win: [eff('stability', 5)], lose: [eff('stability', -6), eff('cred', -2)] }, then: { event: 'hotelAftermath', after: 3 } },
    ],
  },
  hotelAftermath: {
    role: 'pm', weight: 0,
    choices: [
      { effects: [eff('stability', 2), eff('unity', -2)] },
      { effects: [eff('stability', -2), eff('cred', 1)] },
      { effects: [{ t: 'falls' }, eff('cred', -1)] },
    ],
  },
};
