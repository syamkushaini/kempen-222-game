import { BLOC_IDS, PARTY_IDS, type BlocId, type PartyId } from './types';

/**
 * How each voter bloc behaves by default. These are design numbers, tuned by
 * hand. They set how blocs differ from each other; the seat-by-seat baseline
 * (see baseline.ts) is then fitted so the blocs together reproduce the real
 * last-election result in every seat.
 */
export interface BlocDef {
  /** Starting lean toward each party, in logit units. Missing means 0. */
  lean: Partial<Record<PartyId, number>>;
  /** Typical share of the bloc that votes. */
  turnout: number;
  /** Share of the bloc that stays undecided until the last days. */
  undecided: number;
  /**
   * Share of the bloc that votes early, by post or from overseas. These votes
   * are cast before polling day, so polling-day shocks (weather, a last-minute
   * scandal) do not reach them.
   */
  early: number;
}

export const BLOCS: Record<BlocId, BlocDef> = {
  undi18:        { lean: { pt: 0.6, ps: 0.3, bp: -0.6, oth: 0.3, genba: 1.0 },                         turnout: 0.68, undecided: 0.30, early: 0.005 },
  heartland:     { lean: { pt: 1.2, bp: 0.6, ps: -1.2 },                                    turnout: 0.80, undecided: 0.10, early: 0.005 },
  felda:         { lean: { bp: 1.0, pt: 0.9, ps: -1.3 },                                    turnout: 0.82, undecided: 0.10, early: 0.005 },
  agri:          { lean: { pt: 0.8, bp: 0.6, ps: -0.8, gbk: 0.4, gbs: 0.3, cahaya: 0.2, suara: 0.2 },                turnout: 0.76, undecided: 0.12, early: 0.005 },
  civil:         { lean: { pt: 0.7, bp: 0.7, ps: -0.6, gbk: 0.5, gbs: 0.4 },                turnout: 0.84, undecided: 0.12, early: 0.25 },
  urban_b40:     { lean: { ps: 0.3, pt: 0.2, genba: 0.2 },                                              turnout: 0.70, undecided: 0.20, early: 0.005 },
  gig:           { lean: { ps: 0.3, pt: 0.3, bp: -0.3, genba: 0.5 },                                    turnout: 0.62, undecided: 0.25, early: 0.005 },
  m40:           { lean: { ps: 0.5, pt: -0.1, genba: 0.3 },                                             turnout: 0.76, undecided: 0.18, early: 0.01 },
  urban_lib:     { lean: { ps: 2.2, bp: -0.8, pt: -1.8, gbk: -0.6, gbs: -0.6, genba: 0.8 },             turnout: 0.74, undecided: 0.10, early: 0.03 },
  smallbiz:      { lean: { ps: 1.2, bp: 0.1, pt: -1.2, genba: 0.2 },                                    turnout: 0.72, undecided: 0.12, early: 0.01 },
  seniors:       { lean: { bp: 0.9, pt: 0.2, ps: -0.3, gbk: 0.4 },                          turnout: 0.72, undecided: 0.08, early: 0.005 },
  borneo_native: { lean: { gbk: 1.0, gbs: 0.6, bp: 0.3, legasi: 0.2, ps: -0.6, pt: -0.8, cahaya: 1.0, suara: 1.0 },  turnout: 0.62, undecided: 0.15, early: 0.005 },
  borneo_urban:  { lean: { ps: 1.0, legasi: 0.4, gbk: 0.2, pt: -1.0, cahaya: 0.4, suara: 0.2 },                      turnout: 0.60, undecided: 0.18, early: 0.01 },
};

/** BLOCS as arrays in index order, for the hot loops. */
export const BLOC_LEAN: number[][] = BLOC_IDS.map((b) => PARTY_IDS.map((p) => BLOCS[b].lean[p] ?? 0));
export const BLOC_TURNOUT: number[] = BLOC_IDS.map((b) => BLOCS[b].turnout);
export const BLOC_UNDECIDED: number[] = BLOC_IDS.map((b) => BLOCS[b].undecided);
export const BLOC_EARLY: number[] = BLOC_IDS.map((b) => BLOCS[b].early);
