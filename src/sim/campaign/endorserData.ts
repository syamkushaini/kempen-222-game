import { BLOC_IDS, type BlocId, type Dynamics, type PartyId } from '../types';
import { ENDORSER_IDS, type Campaign, type EndorserId } from './types';

export interface EndorserDef {
  /** [bloc]: what their backing adds to a party's support, in logit units. Some put other voters off. */
  lift: Partial<Record<BlocId, number>>;
  /** What their time costs, at general-election scale. */
  money: number;
  /** How readily they come out for each party without being asked, and how warmly they take its call. */
  natural: Partial<Record<PartyId, number>>;
  /** An endorser who will think less of anyone they are seen with. */
  rival?: EndorserId;
}

export const ENDORSERS: Record<EndorserId, EndorserDef> = {
  // Eight million followers and a view on everything.
  influencer: { lift: { undi18: 0.08, gig: 0.06, seniors: -0.02 }, money: 80_000, natural: { ps: 0.4, pt: 0.3, bp: 0.1 } },
  // Three decades of hits. Every wedding band knows the songs.
  singer: { lift: { urban_b40: 0.05, heartland: 0.05, felda: 0.03 }, money: 120_000, natural: { bp: 0.4, pt: 0.3, ps: 0.2 } },
  // The clean-government coalition. Its endorsement cannot be bought, which is why it is worth having.
  watchdog: { lift: { urban_lib: 0.08, m40: 0.06 }, money: 0, natural: { ps: 0.6, legasi: 0.2 } },
  unions: { lift: { civil: 0.05, urban_b40: 0.06, gig: 0.04, smallbiz: -0.04 }, money: 0, natural: { ps: 0.3, bp: 0.3 }, rival: 'chamber' },
  chamber: { lift: { smallbiz: 0.08, m40: 0.04, urban_b40: -0.02 }, money: 0, natural: { bp: 0.5, ps: 0.2 }, rival: 'unions' },
  settlers: { lift: { felda: 0.1, agri: 0.06 }, money: 0, natural: { bp: 0.4, pt: 0.4 } },
  // A well-loved preacher with a television slot.
  preacher: { lift: { heartland: 0.07, seniors: 0.04, urban_lib: -0.04 }, money: 0, natural: { pt: 0.6, bp: 0.2 } },
  // Retired, revered, and never quite out of politics.
  statesman: { lift: { seniors: 0.06, civil: 0.05, heartland: 0.02 }, money: 0, natural: { bp: 0.4, ps: 0.2, pt: 0.2 } },
  // The council of community elders in the Borneo interior.
  elders: { lift: { borneo_native: 0.1, borneo_urban: 0.04 }, money: 0, natural: { gbk: 0.5, gbs: 0.3, legasi: 0.2 } },
  students: { lift: { undi18: 0.06, urban_lib: 0.04 }, money: 0, natural: { ps: 0.5, pt: 0.2 } },
};

/** Adds what the endorsers who have declared bring to their parties. Changes `dyn` in place. */
export function addEndorsements(c: Campaign, dyn: Dynamics): void {
  c.team.endorsers.forEach((p, e) => {
    if (p === null) return;
    for (const [bloc, v] of Object.entries(ENDORSERS[ENDORSER_IDS[e]].lift)) dyn.support.nat[BLOC_IDS.indexOf(bloc as BlocId)][p] += v;
  });
}
