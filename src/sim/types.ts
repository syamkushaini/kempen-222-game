// Core simulation types. The simulation is plain TypeScript with no React or
// browser dependencies, so it can be unit-tested and run headless.

/**
 * Fictional parties and coalitions. Order is the index order of every per-party array.
 * `oth` is the pool of independents and the smallest parties; the three after it are
 * small parties named and kept apart because they win votes, and sometimes a seat.
 */
export const PARTY_IDS = ['ps', 'bp', 'pt', 'gbk', 'gbs', 'legasi', 'oth', 'genba', 'cahaya', 'suara'] as const;
export type PartyId = (typeof PARTY_IDS)[number];
export const N_PARTIES = PARTY_IDS.length;

/**
 * Small parties that appear on ballots and in the House and the talks, but run
 * no campaign of their own: no money, days or leader's tour. Their support moves
 * only with the voters and with what the campaigning parties do.
 */
export const MINOR_IDS = ['genba', 'cahaya', 'suara'] as const;
export type MinorId = (typeof MINOR_IDS)[number];
export const isMinor = (p: number) => (MINOR_IDS as readonly string[]).includes(PARTY_IDS[p]);

/** The parties that campaign: everyone except the pool and the small parties. */
export type FieldedId = Exclude<PartyId, 'oth' | MinorId>;
export const isFielded = (id: PartyId): id is FieldedId => id !== 'oth' && !(MINOR_IDS as readonly string[]).includes(id);

/** Voter blocs. Order is the index order of every per-bloc array. */
export const BLOC_IDS = [
  'undi18', 'heartland', 'felda', 'agri', 'civil', 'urban_b40', 'gig',
  'm40', 'urban_lib', 'smallbiz', 'seniors', 'borneo_native', 'borneo_urban',
] as const;
export type BlocId = (typeof BLOC_IDS)[number];
export const N_BLOCS = BLOC_IDS.length;

export type Region = 'peninsular' | 'sabah' | 'sarawak';
/**
 * A group of seats within a contest: a state in a general election, a
 * parliamentary seat's area in a state election.
 */
export type RegionId = string;
export type SeatKind = 'urban' | 'semi' | 'rural';
export type StateId =
  | 'perlis' | 'kedah' | 'kelantan' | 'terengganu' | 'penang' | 'perak' | 'pahang'
  | 'selangor' | 'kl' | 'putrajaya' | 'nsembilan' | 'melaka' | 'johor'
  | 'labuan' | 'sabah' | 'sarawak';

/** States and federal territories, roughly north to south, then Borneo. */
export const STATE_IDS: StateId[] = [
  'perlis', 'kedah', 'penang', 'perak', 'kelantan', 'terengganu', 'pahang',
  'selangor', 'kl', 'putrajaya', 'nsembilan', 'melaka', 'johor',
  'sabah', 'labuan', 'sarawak',
];

/** Static facts about one constituency. Never changes during a game. */
export interface SeatData {
  /** Official code, e.g. "P.001". */
  id: string;
  name: string;
  /** The region this seat belongs to. */
  state: RegionId;
  region: Region;
  kind: SeatKind;
  /** 0 (deep rural) to 1 (city). */
  urbanity: number;
  /** Registered voters. */
  electorate: number;
  /** Share of the electorate in each bloc; sums to 1. Indexed by BLOC_IDS. */
  blocs: number[];
  /** The most recent general election in this seat. */
  last: {
    /** Valid votes per party, indexed by PARTY_IDS. 0 means did not contest. */
    votes: number[];
    /** Ballots issued / electorate. */
    turnout: number;
    /** Valid votes / ballots issued. */
    validRate: number;
  };
  /**
   * What the last election would have been had every party stood, where pacts
   * kept some off the ballot. The model is fitted to this, so that a party
   * which stood aside last time can stand again.
   */
  basis?: { votes: number[]; turnout: number };
}

/**
 * Everything that can move voters during a game, as offsets from the baseline.
 * Support values are in logit units (about +0.1 is a 2-point swing in a close
 * two-way race). All-zero dynamics reproduce the last election exactly.
 *
 * Layers add together: national-by-bloc + state-by-bloc + seat-level.
 */
export interface Dynamics {
  support: {
    /** [bloc][party] */
    nat: number[][];
    /** region -> [bloc][party] */
    state: Record<RegionId, number[][]>;
    /** seat id -> [party] */
    seat: Record<string, number[]>;
  };
  turnout: {
    /** [bloc]: how motivated the whole bloc is, whoever they support. */
    nat: number[];
    /** [party]: how motivated each party's supporters are, nationally. */
    party: number[];
    /** region -> [party] */
    state: Record<RegionId, number[]>;
    /** seat id -> [party] */
    seat: Record<string, number[]>;
  };
  /**
   * [party]: extra pull on undecided voters when they finally choose. Zero means
   * undecideds split the same way as decided voters in their bloc.
   */
  lateSwing: number[];
}

/** How one bloc in one seat is projected to vote. */
export interface BlocProjection {
  /** Registered voters in this bloc. */
  voters: number;
  /** Share of the bloc that turns out. */
  turnout: number;
  /** Vote share per party among those who turn out. Indexed by PARTY_IDS. */
  shares: number[];
}

export type SeatClass = 'safe' | 'leaning' | 'marginal';

/** Projected or actual outcome in one seat. */
export interface SeatOutcome {
  seatId: string;
  /** Valid votes per party. */
  votes: number[];
  valid: number;
  /** Ballots issued / electorate. */
  turnout: number;
  /** Index into PARTY_IDS. */
  winner: number;
  runnerUp: number;
  /** Winner's lead over the runner-up as a share of valid votes. */
  margin: number;
  cls: SeatClass;
  /** Share of the electorate that has not firmly decided. */
  undecided: number;
  blocs: BlocProjection[];
}

export interface ElectionOutcome {
  seats: SeatOutcome[];
  /** Seats won per party. */
  tally: number[];
  /** Total valid votes per party. */
  votes: number[];
  /** National turnout (ballots issued / electorate). */
  turnout: number;
}
