// ---------- the people around the leader ----------

/** What a leader is good at, each from 1 to 5. Three is ordinary. */
export const STAT_IDS = ['charisma', 'organisation', 'cunning', 'integrity'] as const;
export type StatId = (typeof STAT_IDS)[number];

/** Where the leader came from. Sets what they are good at, and brings its own events in a career. */
export const BACKSTORY_IDS = ['organiser', 'technocrat', 'firebrand', 'tycoon', 'fixer', 'activist'] as const;
export type BackstoryId = (typeof BACKSTORY_IDS)[number];

export interface Leader {
  /** Null for a party's usual leader, who is ordinary at everything. */
  backstory: BackstoryId | null;
  /** In the order of STAT_IDS. */
  stats: number[];
}

/** The four people a leader relies on. */
export const ROLE_IDS = ['manager', 'strategist', 'media', 'treasurer'] as const;
export type RoleId = (typeof ROLE_IDS)[number];

export interface Staffer {
  /** Index into the pool of invented names. */
  name: number;
  /** 1 to 5. */
  skill: number;
  /** Something in their past that will hurt if it comes out. Hidden until they are vetted. */
  skeleton: boolean;
  vetted: boolean;
}

/** The kinds of people who want to be the party's candidate. */
export const HOPEFUL_KINDS = ['warlord', 'professional', 'celebrity', 'loyalist'] as const;
export type HopefulKind = (typeof HOPEFUL_KINDS)[number];

export interface Hopeful {
  kind: HopefulKind;
  name: number;
  skeleton: boolean;
  vetted: boolean;
}

/** A seat close enough that who stands for the party there matters. */
export interface KeySeat {
  seat: string;
  options: Hopeful[];
  /** Index into `options` once nomination papers are filed; null while undecided. */
  pick: number | null;
  /** The candidate's past has come out. */
  blown: boolean;
}

/** Public figures and organisations whose backing moves voters. */
export const ENDORSER_IDS = [
  'influencer', 'singer', 'watchdog', 'unions', 'chamber', 'settlers', 'preacher', 'statesman', 'elders', 'students',
] as const;
export type EndorserId = (typeof ENDORSER_IDS)[number];

/** Newspapers, broadcasters and websites, each with its own readers and its own leanings. */
export const OUTLET_IDS = ['perdana', 'warisan', 'ledger', 'kini', 'tribune', 'viral'] as const;
export type OutletId = (typeof OUTLET_IDS)[number];

/** The player's own people, and the public figures and press around the contest. */
export interface Team {
  leader: Leader;
  /** [role]: who holds the job, or null. */
  staff: (Staffer | null)[];
  /** [role]: who could be hired for it. */
  pool: Staffer[][];
  keySeats: KeySeat[];
  /** [endorser]: the party they have come out for, or null. */
  endorsers: (number | null)[];
  /** [outlet][party]: how kindly the outlet treats each party, -2 to 2. */
  media: number[][];
  /** Paid accounts pushing the player's line online: 0 never, 1 running, 2 exposed. */
  troopers: 0 | 1 | 2;
  /** The team was not paid at the last payday and is not working. Absent when paid, so older saves need no change. */
  unpaid?: boolean;
  /** [region]: the player's chief there, once met. Absent in a game saved before chiefs were people. */
  chiefs?: Record<string, ChiefPerson>;
}

/** One of the player's regional chiefs. */
export interface ChiefPerson {
  /** Index into the chiefs' names. */
  name: number;
  /** 1 to 5: how much their rallies draw. */
  skill: number;
  /** 0 to 100: kept by turning up in their region, lost by staying away. */
  loyalty: number;
  /** Something in their past that a campaign may bring out. */
  skeleton: boolean;
  /** 0 for the chief the party began with; one more for each deputy who has stepped up since. */
  generation: number;
}
