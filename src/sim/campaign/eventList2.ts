import type { BlocId, PartyId } from '../types';
import type { Effect, EventDef, Who } from './events';
import type { IssueId } from './types';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'machinery' | 'dossier' | 'donors' | 'state' | 'fiscal', n: number): Effect => ({ t, n });
const rel = (who: Who, n: number): Effect => ({ t: 'relation', who, n });
const rival = (who: Who, n: number): Effect => ({ t: 'rival', who, n });
const hot = (issue: IssueId, n: number): Effect => ({ t: 'salience', issue, n });
const econ = (growth: number, inflation = 0): Effect => ({ t: 'economy', growth, inflation });
const BORNEO: BlocId[] = ['borneo_native', 'borneo_urban'];
const gbk: PartyId = 'gbk', gbs: PartyId = 'gbs', bp: PartyId = 'bp';

/**
 * The second batch of events between elections: the leader's own past, the
 * people around them, the press, the economy, the party, the institutions,
 * Borneo, and the life of the country. Text is in i18n/events2.ts.
 */
export const MORE_EVENTS: Record<string, EventDef> = {
  // ----- the leader's past -----
  organiserWarlords: {
    role: 'any', weight: 3, needs: { backstory: 'organiser' },
    choices: [{ effects: [eff('unity', 4), eff('cred', -2)] }, { effects: [eff('unity', -3), eff('cred', 3)] }],
  },
  organiserReunion: {
    role: 'any', weight: 3, needs: { backstory: 'organiser' },
    choices: [{ effects: [eff('unity', 2), eff('cred', -3)] }, { effects: [eff('unity', -2), eff('cred', 1)] }],
  },
  technocratLecture: {
    role: 'any', weight: 3, needs: { backstory: 'technocrat' },
    choices: [
      { effects: [], gamble: { chance: 0.5, win: [mood(['m40', 'urban_lib', 'undi18'], 0.03)], lose: [mood(['heartland', 'felda'], -0.02)] } },
      { effects: [eff('funds', -30_000), mood('all', 0.005)] },
    ],
  },
  technocratOffer: {
    role: 'any', weight: 3, needs: { backstory: 'technocrat' },
    choices: [
      { effects: [eff('cred', 3), eff('unity', 2)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('unity', 4)], lose: [eff('unity', -4)] } },
    ],
  },
  firebrandSpeech: {
    role: 'any', weight: 3, needs: { backstory: 'firebrand' },
    choices: [{ effects: [eff('cred', 3), rel('partners', -6), rel('opp', -3)] }, { effects: [eff('cred', -3), rel('partners', 3)] }],
  },
  firebrandRally: {
    role: 'any', weight: 3, needs: { backstory: 'firebrand' },
    choices: [
      { effects: [mood('all', 0.03), eff('cred', -5)] },
      { effects: [], gamble: { chance: 'cred', win: [mood('all', 0.01), eff('cred', 3)], lose: [mood('all', -0.02)] } },
    ],
  },
  tycoonAudit: {
    role: 'any', weight: 3, needs: { backstory: 'tycoon' },
    choices: [
      { effects: [eff('funds', -60_000), eff('cred', 5)] },
      { effects: [], gamble: { chance: 0.5, win: [mood('all', 0.01)], lose: [eff('cred', -6)] } },
    ],
  },
  tycoonFriends: {
    role: 'any', weight: 3, needs: { backstory: 'tycoon' },
    choices: [{ effects: [eff('funds', 150_000), eff('cred', -4)] }, { effects: [eff('cred', 2), eff('donors', -1)] }],
  },
  fixerDebt: {
    role: 'any', weight: 3, needs: { backstory: 'fixer' },
    choices: [{ effects: [eff('dossier', 12), rival('opp', -0.006), eff('cred', -1)] }, { effects: [eff('cred', 2)] }],
  },
  fixerProfile: {
    role: 'any', weight: 3, needs: { backstory: 'fixer' },
    choices: [
      { effects: [], gamble: { chance: 'cred', win: [eff('cred', 4)], lose: [eff('cred', -4)] } },
      { effects: [eff('cred', -2), eff('dossier', -6)] },
    ],
  },
  activistVigil: {
    role: 'any', weight: 3, needs: { backstory: 'activist' },
    choices: [{ effects: [mood(['urban_lib', 'undi18'], 0.03), rel(bp, -5), hot('liberties', 0.2)] }, { effects: [eff('cred', 2)] }],
  },
  activistComrades: {
    role: 'any', weight: 3, needs: { backstory: 'activist' },
    choices: [{ effects: [eff('unity', -1), eff('cred', 3)] }, { effects: [mood(['urban_lib'], -0.02), mood(['m40'], 0.01)] }],
  },

  // ----- the people around the leader -----
  staffPoached: {
    role: 'any', weight: 2, needs: { staff: true },
    choices: [
      { effects: [eff('funds', -40_000), eff('unity', 1)] },
      { effects: [], gamble: { chance: 'unity', win: [eff('unity', 2)], lose: [eff('unity', -3), eff('dossier', -5)] } },
    ],
  },
  staffLeak: {
    role: 'any', weight: 2,
    choices: [{ effects: [eff('unity', -3), eff('dossier', 5)] }, { effects: [eff('cred', 1), mood('all', -0.01)] }],
  },
  internRevolt: {
    role: 'any', weight: 2,
    choices: [{ effects: [eff('funds', -20_000), mood(['undi18'], 0.02)] }, { effects: [mood(['undi18', 'gig'], -0.03)] }],
  },
  speechwriter: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('cred', -1)] },
      { effects: [], gamble: { chance: 0.4, win: [], lose: [eff('cred', -4), eff('unity', -1)] } },
    ],
  },

  // ----- the press -----
  talkShow: {
    role: 'any', weight: 3, times: 2,
    choices: [
      { effects: [], gamble: { chance: 'cred', win: [mood('all', 0.02)], lose: [mood('all', -0.02)] } },
      { effects: [mood('all', -0.005)] },
    ],
  },
  deepfake: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('funds', -30_000), eff('cred', 2)] },
      { effects: [], gamble: { chance: 0.5, win: [], lose: [mood('all', -0.03)] } },
      { effects: [], gamble: { chance: 0.6, win: [mood(['undi18', 'gig'], 0.03)], lose: [eff('cred', -3)] } },
    ],
  },
  editorDinner: {
    role: 'any', weight: 2,
    choices: [
      { effects: [], gamble: { chance: 0.6, win: [eff('dossier', 10), eff('cred', 2)], lose: [eff('cred', -4)] } },
      { effects: [] },
    ],
  },
  newsroomRaid: {
    role: 'gov', weight: 2,
    choices: [
      { effects: [eff('trust', -5), mood(['urban_lib', 'undi18'], -0.03), eff('stability', 2), hot('liberties', 0.3)] },
      { effects: [eff('trust', 4), rel('pm', -5), mood(['urban_lib'], 0.02), hot('liberties', 0.3)] },
    ],
  },
  filmBan: {
    role: 'pm', weight: 2,
    choices: [
      { effects: [mood(['heartland', 'seniors'], 0.02), mood(['urban_lib', 'undi18'], -0.03), hot('values', 0.2)] },
      { effects: [mood(['urban_lib', 'undi18'], 0.03), mood(['heartland', 'seniors'], -0.03), hot('values', 0.2)] },
    ],
  },

  // ----- money and the economy -----
  ringgitSlide: {
    role: 'pm', weight: 3,
    choices: [{ effects: [eff('fiscal', 1), econ(0, -0.3)] }, { effects: [econ(0.1, 0.6), eff('cred', 2)] }],
  },
  tolls: {
    role: 'pm', weight: 2,
    choices: [
      { effects: [eff('fiscal', 1.5), mood(['m40', 'urban_b40', 'gig'], 0.03)] },
      { effects: [eff('fiscal', 0.5), mood(['m40'], 0.01)] },
      { effects: [mood(['m40', 'urban_b40', 'gig'], -0.03), eff('cred', 2)] },
    ],
  },
  riceShortage: {
    role: 'gov', weight: 3,
    choices: [
      { effects: [eff('fiscal', 1), mood(['urban_b40', 'heartland', 'seniors'], 0.02)] },
      { effects: [], gamble: { chance: 0.4, win: [mood('all', 0.01)], lose: [mood('all', -0.03), eff('cred', -2)] } },
    ],
  },
  megaProject: {
    role: 'pm', weight: 2,
    choices: [
      { effects: [econ(0.4), eff('fiscal', 2), mood(['heartland', 'agri'], 0.02)] },
      { effects: [eff('cred', 3), econ(-0.2)] },
      { effects: [], gamble: { chance: 'cred', win: [econ(0.3), eff('fiscal', 1), eff('cred', 2)], lose: [eff('cred', -3)] } },
    ],
  },
  gigStrike: {
    role: 'any', weight: 3,
    choices: [
      { effects: [mood(['gig', 'undi18'], 0.05), mood(['smallbiz'], -0.02), hot('wages', 0.2)] },
      { effects: [mood(['smallbiz'], 0.03), mood(['gig'], -0.05), eff('funds', 50_000)] },
      { effects: [mood(['gig'], -0.01)] },
    ],
  },
  dryTaps: {
    role: 'any', weight: 3,
    choices: [
      { effects: [eff('funds', -40_000), mood(['urban_b40', 'm40'], 0.02)] },
      { effects: [], gamble: { chance: 0.5, win: [rival('pm', -0.008)], lose: [eff('cred', -3)] } },
    ],
  },
  pensionCall: {
    role: 'any', weight: 3,
    choices: [
      { effects: [mood(['urban_b40', 'gig'], 0.04), mood(['seniors'], -0.02), eff('cred', -3)] },
      { effects: [eff('cred', 3), mood(['urban_b40', 'gig'], -0.03)] },
    ],
  },
  subsidyReform: {
    role: 'pm', weight: 3,
    choices: [
      { effects: [eff('fiscal', -1.5), mood(['m40', 'smallbiz'], -0.03), eff('cred', 4), econ(0, 0.4)] },
      { effects: [eff('cred', -3)] },
    ],
  },
  foreignWorkers: {
    role: 'gov', weight: 2,
    choices: [
      { effects: [mood(['smallbiz'], 0.04), mood(['urban_b40', 'gig'], -0.03), econ(0.2)] },
      { effects: [mood(['urban_b40', 'gig'], 0.03), mood(['smallbiz'], -0.04), econ(-0.1)] },
    ],
  },
  windfall: {
    role: 'pm', weight: 2,
    choices: [
      { effects: [eff('fiscal', -1), eff('cred', 3)] },
      { effects: [mood('all', 0.02), econ(0, 0.3)] },
      { effects: [rel(gbk, 10), rel(gbs, 6), mood(BORNEO, 0.04), hot('federalism', 0.2)] },
    ],
  },
  haze: {
    role: 'gov', weight: 2,
    choices: [
      { effects: [mood('all', 0.01), econ(-0.1)] },
      { effects: [eff('fiscal', 0.5), mood(['seniors', 'urban_b40', 'm40'], 0.015)] },
    ],
  },

  // ----- the party -----
  youthQuota: {
    role: 'any', weight: 2,
    choices: [{ effects: [eff('unity', -2), mood(['undi18'], 0.03)] }, { effects: [eff('unity', 1), mood(['undi18'], -0.02)] }],
  },
  topTable: {
    role: 'any', weight: 2,
    choices: [{ effects: [mood(['m40', 'urban_lib'], 0.02), eff('unity', -1)] }, { effects: [mood(['m40', 'urban_lib'], -0.02), eff('unity', 1)] }],
  },
  founderMemoir: {
    role: 'any', weight: 2,
    choices: [{ effects: [eff('cred', 2)] }, { effects: [eff('unity', -3), mood('all', 0.005)] }],
  },
  branchBrawl: {
    role: 'any', weight: 3,
    choices: [{ effects: [eff('unity', -2), eff('cred', 2)] }, { effects: [mood('all', -0.015)] }],
  },
  defectorsKnock: {
    role: 'any', weight: 2,
    choices: [{ effects: [eff('unity', -3), mood('all', -0.01), eff('dossier', 8)] }, { effects: [eff('cred', 4)] }],
  },
  partyPolls: {
    role: 'any', weight: 0, at: 100,
    choices: [
      { effects: [], gamble: { chance: 'unity', win: [eff('unity', 6)], lose: [eff('unity', -6)] } },
      { effects: [eff('unity', 2), eff('cred', -2)] },
    ],
  },
  merchandise: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('unity', -2), eff('cred', 3)] },
      { effects: [], gamble: { chance: 0.5, win: [], lose: [eff('cred', -5)] } },
    ],
  },
  oldGuard: {
    role: 'any', weight: 2,
    choices: [{ effects: [eff('unity', -4), mood(['undi18', 'urban_lib'], 0.02), eff('cred', 2)] }, { effects: [eff('unity', 2)] }],
  },

  // ----- institutions -----
  acquittal: {
    role: 'any', weight: 2,
    choices: [{ effects: [eff('cred', 2), mood(['urban_lib'], -0.01)] }, { effects: [mood(['urban_lib'], 0.02), rel('opp', -6), rel('pm', -6), hot('graft', 0.2)] }],
  },
  boundaries: {
    role: 'pm', weight: 2,
    choices: [{ effects: [eff('trust', -8), mood('all', -0.01), eff('unity', 2)] }, { effects: [eff('trust', 5), eff('cred', 3), eff('unity', -2)] }],
  },
  auditReport: {
    role: 'gov', weight: 3, times: 2,
    choices: [{ effects: [eff('stability', -2), eff('trust', 5)] }, { effects: [eff('trust', -3)] }],
  },
  custodyDeath: {
    role: 'gov', weight: 2,
    choices: [
      { effects: [eff('trust', 5), mood(['urban_lib', 'urban_b40'], 0.03), eff('stability', -2), hot('liberties', 0.3)] },
      { effects: [eff('trust', -4), mood(['urban_lib'], -0.02)] },
    ],
  },
  whistleblower: {
    role: 'opp', weight: 3,
    choices: [
      { effects: [], gamble: { chance: 0.7, win: [rival('pm', -0.012), hot('graft', 0.3)], lose: [eff('cred', -5)] } },
      { effects: [eff('cred', 2), eff('dossier', 10)] },
    ],
  },
  shadowCabinet: {
    role: 'opp', weight: 2,
    choices: [{ effects: [eff('unity', -3), eff('cred', 4)] }, { effects: [eff('unity', 1)] }],
  },

  // ----- Borneo and the federation -----
  borneoThird: {
    role: 'any', weight: 2,
    choices: [
      { effects: [rel(gbk, 8), rel(gbs, 5), mood(BORNEO, 0.04), mood(['heartland'], -0.01), hot('federalism', 0.3)] },
      { effects: [rel(gbk, -5), rel(gbs, -3)] },
    ],
  },
  oilRights: {
    role: 'pm', weight: 2,
    choices: [
      { effects: [rel(gbk, 12), eff('fiscal', 1.5), mood(BORNEO, 0.03)] },
      { effects: [rel(gbk, -15), eff('stability', -5), mood(BORNEO, -0.03)] },
    ],
  },
  borneoHighway: {
    role: 'any', weight: 2,
    choices: [{ effects: [eff('funds', -30_000), mood(BORNEO, 0.03)] }, { effects: [mood(BORNEO, -0.01)] }],
  },
  peninsulaGaffe: {
    role: 'any', weight: 2,
    choices: [{ effects: [eff('unity', -2), mood(BORNEO, 0.02)] }, { effects: [mood(BORNEO, -0.04)] }],
  },
  stateDefiance: {
    role: 'any', weight: 3, needs: { states: true },
    choices: [{ effects: [eff('unity', 1), eff('cred', -2)] }, { effects: [eff('unity', -3), eff('cred', 2)] }],
  },

  // ----- the life of the country -----
  durianFeast: {
    role: 'any', weight: 2,
    choices: [{ effects: [rel('pm', 8), rel('opp', 4), eff('unity', -1)] }, { effects: [] }],
  },
  footballFinal: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('funds', -20_000)], gamble: { chance: 0.5, win: [mood('all', 0.02)], lose: [mood('all', -0.01)] } },
      { effects: [mood(['urban_b40', 'undi18'], 0.02)] },
    ],
  },
  openHouse: {
    role: 'any', weight: 3, times: 2,
    choices: [{ effects: [eff('funds', -60_000), mood('all', 0.015)] }, { effects: [eff('machinery', 2), mood('all', 0.005)] }],
  },
  danceTrend: {
    role: 'any', weight: 2,
    choices: [
      { effects: [], gamble: { chance: 0.5, win: [mood(['undi18', 'gig'], 0.05)], lose: [eff('cred', -3), mood(['seniors'], -0.01)] } },
      { effects: [eff('cred', 1)] },
    ],
  },
  examLeak: {
    role: 'gov', weight: 2,
    choices: [{ effects: [mood(['m40', 'undi18'], -0.02), eff('trust', 3)] }, { effects: [eff('trust', -4)] }],
  },
  potholes: {
    role: 'any', weight: 2,
    choices: [
      { effects: [], gamble: { chance: 0.6, win: [mood('all', 0.02)], lose: [mood('all', -0.02)] } },
      { effects: [eff('cred', 1)] },
    ],
  },
  shophouses: {
    role: 'any', weight: 2,
    choices: [
      { effects: [mood(['urban_lib', 'smallbiz'], 0.03), eff('donors', -1)] },
      { effects: [eff('funds', 100_000), mood(['urban_lib', 'smallbiz'], -0.03)] },
    ],
  },
  roguePoll: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('funds', -30_000), eff('cred', 1)] },
      { effects: [], gamble: { chance: 0.5, win: [mood('all', 0.01)], lose: [eff('unity', -2)] } },
    ],
  },
  marketScolding: {
    role: 'any', weight: 3,
    choices: [{ effects: [mood(['urban_b40', 'heartland', 'seniors'], 0.02)] }, { effects: [mood(['urban_b40', 'heartland'], -0.03), eff('cred', 1)] }],
  },
};
