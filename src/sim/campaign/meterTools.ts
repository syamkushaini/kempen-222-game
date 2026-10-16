import type { BlocId } from '../types';
import type { Effect } from './events';
import type { Tool } from './econTools';

// What a head of government can do about the six meters that are not the budget's (see pestel.ts and defence.ts): three acts for each,
// the same kind of thing as the economy's tools. Each has a price (money, votes, trust or another meter) and a time before it can be
// done again, and shows what it does before it is used. For each meter there is a cheap and quiet act, a costly and strong one, and a
// risky one that does most for the meter and costs something else. The two defence meters are a country's only. Money is at
// general-election scale.

export const METER_GOALS = ['cohesion', 'tech', 'environment', 'law', 'readiness', 'influence'] as const;
export type MeterGoal = (typeof METER_GOALS)[number];
/** The goals that belong to a country and not to a state: a state has no armed forces. */
export const DEFENCE_GOALS: readonly string[] = ['readiness', 'influence'];

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'cred' | 'stability' | 'trust' | 'fiscal', n: number): Effect => ({ t, n });
const pub = (n: number): Effect => ({ t: 'public', n });
const pest = (p: { cohesion?: number; tech?: number; environment?: number; law?: number }): Effect => ({ t: 'pestel', ...p });
const forces = (readiness: number, influence = 0): Effect => ({ t: 'defence', ...(readiness ? { readiness } : {}), ...(influence ? { influence } : {}) });
const nat = (health = 0, education = 0, standing = 0): Effect => ({ t: 'nation', health, education, standing });
const econ = (growth: number, inflation = 0): Effect => ({ t: 'economy', growth, inflation });

export const METER_TOOLS: Tool[] = [
  // How people hold together
  { id: 'dialogueWeek', goal: 'cohesion', wait: 26, effects: [pub(-30_000), pest({ cohesion: 3 }), mood(['urban_b40'], 0.01)] },
  { id: 'sharedFacilities', goal: 'cohesion', wait: 52, effects: [pub(-200_000), pest({ cohesion: 7 }), mood(['heartland', 'urban_b40'], 0.02)] },
  { id: 'unityCampaign', goal: 'cohesion', wait: 39, effects: [pub(-60_000), pest({ cohesion: 6 }), eff('cred', -2), mood(['urban_lib'], -0.02)] },
  // Technology
  { id: 'openData', goal: 'tech', wait: 26, effects: [pub(-30_000), pest({ tech: 3 }), eff('cred', 1)] },
  { id: 'schoolsFibre', goal: 'tech', wait: 52, effects: [pub(-220_000), pest({ tech: 7 }), nat(0, 2, 0), mood(['undi18'], 0.02)] },
  { id: 'foreignTechDeal', goal: 'tech', wait: 39, effects: [pest({ tech: 6, law: -3 }), nat(0, 0, -2), econ(0.2), mood(['civil'], -0.02)] },
  // The environment
  { id: 'namePolluters', goal: 'environment', wait: 26, effects: [pest({ environment: 3 }), eff('cred', 1), mood(['smallbiz'], -0.01)] },
  { id: 'greenFund', goal: 'environment', wait: 52, effects: [pub(-200_000), pest({ environment: 7 }), mood(['agri'], 0.02)] },
  { id: 'permitFreeze', goal: 'environment', wait: 39, effects: [pest({ environment: 6 }), econ(-0.3), mood(['agri', 'smallbiz'], -0.03)] },
  // The rule of law
  { id: 'clerkDrive', goal: 'law', wait: 26, effects: [pub(-40_000), pest({ law: 3 })] },
  { id: 'oversightBody', goal: 'law', wait: 52, effects: [pub(-180_000), pest({ law: 7 }), eff('cred', 2), mood(['civil'], 0.02)] },
  { id: 'purgeDepartment', goal: 'law', wait: 39, effects: [pest({ law: 6 }), eff('stability', -3), mood(['civil'], -0.03)] },
  // The armed forces' readiness (a country's only)
  { id: 'jointExercises', goal: 'readiness', wait: 26, effects: [pub(-40_000), forces(3), nat(0, 0, 1)] },
  { id: 'equipmentRenewal', goal: 'readiness', wait: 52, effects: [pub(-250_000), forces(7, 2)] },
  { id: 'buyAbroad', goal: 'readiness', wait: 39, effects: [pub(-60_000), forces(5), nat(0, 0, -3), mood(['heartland'], -0.01)] },
  // How much say the armed forces have (a country's only)
  { id: 'oversightBoard', goal: 'influence', wait: 26, effects: [pub(-20_000), forces(-1, -3), eff('cred', 1)] },
  { id: 'quietPayDeal', goal: 'influence', wait: 52, effects: [pub(-150_000), forces(1, -5), mood(['civil'], -0.02)] },
  { id: 'reshuffleChiefs', goal: 'influence', wait: 39, effects: [forces(-2, -7), eff('stability', -3)] },
];
