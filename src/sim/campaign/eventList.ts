import type { BlocId } from '../types';
import type { Effect, EventDef, Who } from './events';
import type { IssueId } from './types';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'machinery' | 'dossier' | 'donors' | 'state' | 'fiscal', n: number): Effect => ({ t, n });
const flag = (id: string): Effect => ({ t: 'flag', id });
const rel = (who: Who, n: number): Effect => ({ t: 'relation', who, n });
const hot = (issue: IssueId, n: number): Effect => ({ t: 'salience', issue, n });

/**
 * What happens between elections. Text lives in the translations under
 * `event.<id>.title`, `.body`, `.o<n>` for each choice and `.r<n>` for its
 * result (`.r<n>w` and `.r<n>l` where the choice is a gamble).
 */
export const EVENTS: Record<string, EventDef> = {
  // ----- anyone -----
  flood: {
    role: 'any', weight: 3, times: 2,
    choices: [
      { effects: [eff('funds', -40_000), mood(['heartland', 'agri', 'felda', 'seniors'], 0.03), eff('cred', 2)] },
      { effects: [], gamble: { chance: 0.5, win: [mood('all', 0.01)], lose: [eff('cred', -3), mood('all', -0.01)] } },
      { effects: [mood(['heartland', 'agri'], -0.02)] },
    ],
  },
  oldVideo: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('cred', 1), mood('all', -0.005)] },
      { effects: [], gamble: { chance: 0.4, win: [mood(['heartland', 'undi18'], 0.03)], lose: [mood('all', -0.03), eff('cred', -3)] } },
      { effects: [mood('all', -0.01)] },
    ],
  },
  youthWing: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('unity', -3), mood(['undi18', 'gig'], 0.04)] },
      { effects: [eff('unity', 2), mood(['undi18'], -0.04)] },
    ],
  },
  // A seat falls vacant. Fought with one decision and settled by the voters of that seat: see contests.ts.
  byElection: { role: 'any', weight: 4, times: 3, choices: [{ effects: [] }, { effects: [] }, { effects: [] }] },
  // A round of state polls, raised when it falls due rather than by chance: see contests.ts.
  statePolls: { role: 'any', weight: 0, times: 3, choices: [{ effects: [] }, { effects: [] }, { effects: [] }] },
  influencer: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('funds', -30_000), mood(['undi18', 'gig'], 0.03), eff('cred', -1)] },
      { effects: [], gamble: { chance: 0.5, win: [mood(['undi18'], 0.05), eff('cred', 2)], lose: [mood(['undi18'], -0.03)] } },
      { effects: [] },
    ],
  },
  warlord: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('unity', 4), eff('cred', -2), eff('machinery', 2)] },
      { effects: [eff('unity', -5), eff('cred', 1)] },
      { effects: [eff('unity', 1), flag('warlord')] },
    ],
  },
  forum: {
    role: 'any', weight: 2,
    choices: [
      { effects: [mood(['urban_lib', 'm40'], 0.03), mood(['heartland', 'civil'], -0.015), hot('reform', 0.3)] },
      { effects: [mood(['urban_lib'], -0.02)] },
    ],
  },
  riders: {
    role: 'any', weight: 2,
    choices: [
      { effects: [mood(['gig', 'undi18', 'urban_b40'], 0.04), mood(['smallbiz'], -0.04), hot('wages', 0.3)] },
      { effects: [mood(['smallbiz'], 0.03), mood(['gig'], -0.04)] },
      { effects: [] },
    ],
  },
  settlers: {
    role: 'any', weight: 2,
    choices: [
      { effects: [mood(['felda'], 0.06), eff('cred', -2), hot('rural', 0.3)] },
      { effects: [mood(['felda'], 0.02), mood(['m40'], 0.01)] },
      { effects: [mood(['felda'], -0.02)] },
    ],
  },
  podcast: {
    role: 'any', weight: 2,
    choices: [
      { effects: [], gamble: { chance: 'cred', win: [mood(['undi18', 'gig', 'm40'], 0.04)], lose: [mood('all', -0.02), eff('cred', -2)] } },
      { effects: [mood(['undi18'], 0.01)] },
      { effects: [] },
    ],
  },
  adviser: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('cred', 4), mood(['m40', 'civil'], 0.02), eff('unity', -2)] },
      { effects: [eff('unity', 1)] },
    ],
  },
  // ----- money -----
  accountsLeak: {
    role: 'any', weight: 2, needs: { donors: true },
    choices: [
      { effects: [eff('cred', 4), eff('donors', -1)] },
      { effects: [eff('cred', -4)] },
      { effects: [eff('unity', -3), eff('cred', -1)] },
    ],
  },
  donorFavour: {
    role: 'any', weight: 3, needs: { donors: true, notFlag: 'owesDonor' },
    choices: [
      { effects: [eff('funds', 120_000), flag('owesDonor'), eff('cred', -1)], then: { event: 'donorLeak', after: 20 } },
      { effects: [eff('donors', -1)] },
      { effects: [eff('donors', -3), eff('cred', 4), mood(['urban_lib', 'm40'], 0.02)] },
    ],
  },
  donorLeak: {
    role: 'any', weight: 0, needs: { flag: 'owesDonor' },
    choices: [
      { effects: [], gamble: { chance: 0.4, win: [], lose: [eff('cred', -8), mood('all', -0.04)] } },
      { effects: [eff('funds', -120_000), eff('cred', -2)] },
      { effects: [eff('unity', -4), eff('cred', -4)] },
    ],
  },
  probe: {
    role: 'gov', weight: 3, needs: { state: true },
    choices: [
      { effects: [eff('state', -3), eff('trust', -3)] },
      { effects: [eff('state', -1), eff('unity', -4), eff('trust', -2)] },
      { effects: [], gamble: { chance: 0.5, win: [], lose: [eff('trust', -12), mood('all', -0.05), eff('stability', -6), eff('cred', -5), eff('state', -3)] } },
    ],
  },
  firmWindfall: {
    role: 'any', weight: 1, needs: { assets: true },
    choices: [
      { effects: [{ t: 'dividend', pct: 0.1 }] },
      { effects: [{ t: 'assets', pct: 0.12 }] },
    ],
  },
  firmBust: {
    role: 'any', weight: 1, needs: { assets: true },
    choices: [
      { effects: [{ t: 'dividend', pct: -0.15 }] },
      { effects: [{ t: 'assets', pct: -0.4 }, eff('cred', -1)] },
    ],
  },
  // ----- in government -----
  pricesGov: {
    role: 'gov', weight: 3, times: 2,
    choices: [
      { effects: [hot('subsidies', 0.5), { t: 'economy', inflation: 0.4 }, mood(['urban_b40', 'heartland', 'gig'], 0.03), eff('fiscal', 0.5)] },
      { effects: [hot('subsidies', 0.5), { t: 'economy', inflation: 0.8 }, mood('all', -0.02)] },
      { effects: [hot('subsidies', 0.5), { t: 'economy', inflation: 0.2, growth: -0.3 }, mood(['urban_b40'], 0.03), mood(['smallbiz'], -0.05)] },
    ],
  },
  minister: {
    role: 'gov', weight: 2,
    choices: [
      { effects: [eff('unity', -3), eff('trust', 3), eff('cred', 2)] },
      { effects: [eff('trust', -6), mood('all', -0.03), eff('unity', 1)] },
      { effects: [eff('trust', -2)] },
    ],
  },
  // Budget day and the no-confidence motion are worked out by the governing rules, not by fixed effects.
  budget: { role: 'pm', weight: 0, yearly: 40, choices: [{ effects: [] }, { effects: [] }] },
  budgetRevolt: {
    role: 'pm', weight: 0, needs: { partners: true },
    choices: [
      { effects: [eff('fiscal', 1), eff('stability', 6)] },
      { effects: [], gamble: { chance: 'stability', win: [eff('stability', 4), eff('cred', 2)], lose: [{ t: 'falls' }] } },
    ],
  },
  motion: { role: 'pm', weight: 3, times: 2, needs: { partners: true, shaky: 35 }, choices: [{ effects: [] }, { effects: [] }] },
  // A partner's ultimatum, raised when it has drifted far enough towards the door and never by chance: see plots.ts.
  ultimatum: { role: 'pm', weight: 0, choices: [{ effects: [] }, { effects: [] }, { effects: [], gamble: { chance: 0.5, win: [], lose: [] } }] },
  downgrade: {
    role: 'pm', weight: 6, needs: { debt: 75 },
    choices: [
      { effects: [eff('fiscal', -1), eff('cred', 3), mood('all', -0.02)] },
      { effects: [eff('cred', -4), eff('stability', -3)] },
    ],
  },
  budgetAsk: {
    role: 'partner', weight: 0, yearly: 38,
    choices: [
      { effects: [mood('all', 0.015), rel('pm', -2)] },
      { effects: [rel('pm', 5)] },
      { effects: [], gamble: { chance: 0.5, win: [mood('all', 0.03)], lose: [rel('pm', -12), eff('stability', -5)] } },
    ],
  },
  downturnGov: {
    role: 'gov', weight: 1,
    choices: [
      { effects: [{ t: 'economy', growth: -0.9 }, eff('fiscal', 1.5), mood('all', 0.01)] },
      { effects: [{ t: 'economy', growth: -1.5 }, eff('cred', 2), mood('all', -0.02)] },
    ],
  },
  walkoutThreat: {
    role: 'pm', weight: 4, needs: { partners: true, shaky: 45 },
    choices: [
      { effects: [eff('unity', -4), eff('stability', 8)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('stability', 5), eff('cred', 2)], lose: [{ t: 'falls' }] } },
    ],
  },
  plotWhispers: {
    role: 'pm', weight: 3, needs: { partners: true, shaky: 55 },
    choices: [
      { effects: [eff('stability', 6), eff('unity', -3)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('stability', 8)], lose: [eff('stability', -8)] } },
      { effects: [eff('stability', -3)] },
    ],
  },
  // ----- in opposition -----
  pricesOpp: {
    role: 'opp', weight: 3, times: 2,
    choices: [
      { effects: [hot('subsidies', 0.5), { t: 'rival', who: 'pm', n: -0.02 }, rel('pm', -8)] },
      { effects: [hot('subsidies', 0.5), eff('cred', 3), mood(['m40', 'urban_b40'], 0.02)] },
      { effects: [hot('subsidies', 0.5)] },
    ],
  },
  shadowBudget: {
    role: 'opp', weight: 0, yearly: 42,
    choices: [
      { effects: [eff('cred', 4), eff('funds', -20_000)] },
      { effects: [mood('all', 0.02), eff('cred', -4)] },
      { effects: [] },
    ],
  },
  permit: {
    role: 'opp', weight: 2,
    choices: [
      {
        effects: [],
        gamble: {
          chance: 0.5,
          win: [mood(['undi18', 'urban_lib'], 0.04), eff('unity', 3), hot('liberties', 0.4)],
          lose: [mood(['seniors', 'civil'], -0.03), eff('funds', -30_000)],
        },
      },
      { effects: [eff('unity', -1)] },
      { effects: [eff('cred', 2), eff('funds', -15_000)] },
    ],
  },
  hotelMeeting: {
    role: 'opp', weight: 4, needs: { shaky: 50, notFlag: 'move' },
    choices: [
      { effects: [flag('move'), eff('cred', -1)], then: { event: 'hotelNumbers', after: 3 } },
      { effects: [eff('cred', 2)] },
    ],
  },
  hotelNumbers: {
    role: 'opp', weight: 0, needs: { flag: 'move' },
    choices: [
      { effects: [], gamble: { chance: 0.45, win: [{ t: 'falls' }], lose: [eff('cred', -8), mood('all', -0.04), rel('pm', -20)] } },
      { effects: [eff('cred', -2)] },
    ],
  },
  downturnOpp: {
    role: 'opp', weight: 1,
    choices: [
      { effects: [{ t: 'economy', growth: -1.5 }, mood(['urban_b40', 'gig'], 0.02), { t: 'rival', who: 'pm', n: -0.01 }] },
      { effects: [{ t: 'economy', growth: -1.5 }, eff('cred', 3), rel('pm', 8)] },
    ],
  },
  targeted: {
    role: 'opp', weight: 1,
    choices: [
      { effects: [eff('unity', 3)], gamble: { chance: 0.6, win: [mood('all', 0.02)], lose: [mood('all', -0.02)] } },
      { effects: [eff('cred', 3)] },
      { effects: [mood('all', -0.02), eff('unity', -2)] },
    ],
  },
  // ----- the fund: a scandal that takes years to come out -----
  fundGov: {
    role: 'gov', weight: 0, at: 30, needs: { notFlag: 'fund' },
    choices: [
      { effects: [flag('fund'), flag('fundAudit'), eff('trust', 4), eff('unity', -3), hot('graft', 0.4)], then: { event: 'fundGovEnd', after: 45 } },
      { effects: [flag('fund'), eff('trust', -5), hot('graft', 0.4)], then: { event: 'fundGovEnd', after: 45 } },
    ],
  },
  fundGovEnd: {
    role: 'gov', weight: 0, needs: { flag: 'fund' },
    choices: [
      { effects: [eff('unity', -5), eff('trust', 5), eff('cred', 3), mood(['urban_lib', 'm40'], 0.02)] },
      { effects: [], gamble: { chance: 0.35, win: [eff('unity', 2)], lose: [eff('trust', -12), mood('all', -0.05), eff('stability', -8)] } },
    ],
  },
  fundOpp: {
    role: 'opp', weight: 0, at: 30, needs: { notFlag: 'fund' },
    choices: [
      { effects: [flag('fund'), flag('fundPush'), mood(['urban_lib', 'm40'], 0.03), hot('graft', 0.5)], then: { event: 'fundOppEnd', after: 45 } },
      { effects: [flag('fund'), eff('cred', 1), hot('graft', 0.3)], then: { event: 'fundOppEnd', after: 45 } },
    ],
  },
  fundOppEnd: {
    role: 'opp', weight: 0, needs: { flag: 'fund' },
    choices: [
      { effects: [eff('unity', 4), mood(['urban_lib', 'undi18', 'm40'], 0.03), { t: 'rival', who: 'pm', n: -0.03 }, rel('pm', -10)] },
      { effects: [eff('cred', 4), { t: 'rival', who: 'pm', n: -0.02 }] },
    ],
  },
  // ----- the deputy: an ambition that comes to a head at the party assembly -----
  deputy: {
    role: 'any', weight: 0, at: 100,
    choices: [
      { effects: [eff('unity', 4), flag('heir')] },
      { effects: [eff('unity', -3), flag('challenger')] },
      { effects: [flag('challenger')] },
    ],
  },
  assemblyFight: {
    role: 'any', weight: 0, at: 180, needs: { flag: 'challenger' },
    choices: [
      { effects: [], gamble: { chance: 'unity', win: [eff('unity', 8), eff('cred', 2)], lose: [eff('unity', -15), eff('cred', -5)] } },
      { effects: [eff('funds', -100_000), eff('unity', 3), eff('cred', -2)] },
    ],
  },
  assemblyCalm: {
    role: 'any', weight: 0, at: 180, needs: { flag: 'heir' },
    choices: [
      { effects: [eff('unity', 3)] },
      { effects: [eff('unity', -2), mood(['undi18'], 0.02)] },
    ],
  },
};
