import type { StandDowns } from '../transfer';
import type { Dynamics, Region, RegionId } from '../types';
import type { SegmentId } from './segments';

export type Difficulty = 'easy' | 'normal' | 'hard';
export type Phase = 'term' | 'campaign' | 'night' | 'formation' | 'done';

export const DAYS_PER_WEEK = 7;

export const ACTION_IDS = [
  'ceramah', 'walkabout', 'megarally',
  'canvass', 'gotv', 'build',
  'tv', 'social', 'billboards', 'attack',
  'dinner', 'crowdfund', 'tycoon',
  // Added later, each with a catch: a different audience, a risk, or a price paid in something other than money.
  'townhall', 'charity', 'youth', 'festival', 'conference', 'debate', 'manifesto', 'radio',
  // Paid for in the dark: a hand on the keyboards.
  'troops',
  // The thing that is done in one state and no other.
  'local',
] as const;
export type ActionId = (typeof ACTION_IDS)[number];
export type Family = 'ground' | 'machinery' | 'media' | 'funds';
export type TargetKind = 'seat' | 'state' | 'party' | 'none';

export type Posture = 'policy' | 'attack' | 'warm';
export const POSTURES: readonly Posture[] = ['policy', 'attack', 'warm'];

export interface ActionTarget {
  seat?: string;
  /** Region id. */
  state?: RegionId;
  /** Party index, for attacks. */
  party?: number;
  /** The voter group a seat event is pitched to; absent for one pitched to everyone. */
  segment?: SegmentId;
  /** A debate: the issue the question is about, and how the player answers it. */
  topic?: IssueId;
  posture?: Posture;
}

/** How an action turned out; drives the news line and nothing else. */
export type Quality = 'weak' | 'ok' | 'great' | 'flop' | 'viral' | 'backfire';

export interface ActionReport {
  id: ActionId;
  party: number;
  target: ActionTarget;
  quality: Quality;
  /** Money raised, for fundraising actions. */
  raised?: number;
}

/**
 * How free a hand a state chief has: the number of operations they may run in
 * a week (1, 2, or everything on offer).
 */
export type ChiefLevel = 1 | 2 | 3;

/** One party's campaign resources. */
export interface PartyCampaign {
  funds: number;
  /** Days the campaign can use each week. Smaller parties run smaller operations. */
  capacity: number;
  /** Days left this week, in half-day steps. */
  days: number;
  /** Where the leader is. */
  location: RegionId;
  /** Organisational strength per region, 0-100, in the order of the world's regions. */
  machinery: number[];
  /** How many times each limited action has been used this week, by key. */
  used: Record<string, number>;
  /** Fundraising dinners held per state over the whole campaign. */
  dinners: Record<RegionId, number>;
  crowdfunds: number;
  /** 0 = never took tycoon money, 1 = took it (secret), 2 = exposed. */
  tycoon: 0 | 1 | 2;
  /** Seats where the leader appeared this week. Public knowledge. */
  visits: string[];
  /** Regions where a chief runs the ground campaign on the leader's behalf, and how free a hand each has. */
  chiefs: Record<RegionId, ChiefLevel>;
  /** Chiefs never spend the party's funds below this. */
  chiefFloor: number;
  /** How well the party holds together, 0-100. */
  unity: number;
  /** How many times each one-off or fading action has been taken this campaign, by action id. Absent until used. */
  plays?: Record<string, number>;
  /** What is still owed to a lender who advanced the party's income. Absent when nothing is owed. */
  loan?: number;
  /** Money spent on this campaign so far, which the law puts a limit on. */
  spent: number;
  /** The Election Commission has already fined the party for overspending in this campaign. */
  fined: boolean;
}

/** An electoral pact: two parties that have agreed where each stands aside for the other. */
export interface Pact { a: number; b: number; week: number }

/** A moment that needs the player's answer: a phone call, an offer, an audience at the Palace. */
export type SceneKind = 'pactOffer' | 'poach' | 'summons' | 'unityAdvice' | 'event' | 'vote' | 'houseVote' | 'agenda' | 'partyPoll' | 'redraw';
export interface Scene {
  id: number;
  kind: SceneKind;
  /** The party on the other end; null for the Palace. */
  from: number | null;
  /** Pact offers: seats the player would stand aside in, and seats the other party would. */
  give?: string[];
  get?: string[];
  /** Pact offers from a partner: of the seats the player would give, those the partner asks for as the price of standing together. */
  ask?: string[];
  /** Poaching: the seat whose incumbent is being courted. */
  seat?: string;
  /** Events between elections: which one. */
  event?: string;
  /** Votes in the House: the bill being voted on. */
  bill?: string;
}

// ---------- forming a government ----------

export const SENIOR_IDS = ['dpm', 'finance', 'home', 'deputy'] as const;
export type SeniorId = (typeof SENIOR_IDS)[number];

export const DEMAND_IDS = [
  'autonomy', 'oilRoyalty', 'sabahCm', 'subsidies', 'reformAgenda', 'reformPause',
  'courtCases', 'valuesAgenda', 'devFunds', 'speaker', 'localPosts',
] as const;
export type DemandId = (typeof DEMAND_IDS)[number];

/** What a would-be head of government puts on the table for a party's support. */
export interface Offer {
  /** Seats at the cabinet table. */
  posts: number;
  senior: SeniorId | null;
  demands: DemandId[];
  /** Money under the table. */
  cash: number;
}

export interface Outcome {
  /** Party whose leader heads the government. */
  pm: number;
  /** Parties in government with them. */
  partners: number[];
  /** Seats the government commands, including independents. */
  seats: number;
  /** Appointed without a proven majority. */
  minority: boolean;
  /** How long this government is likely to last, 0-100. */
  stability: number;
  /** Public trust in how it was put together, 0-100. */
  trust: number;
  /** [party]: what each partner was promised. Called in later. */
  deals: (Offer | null)[];
  /** Day of the talks on which it was settled; 0 if the election settled it. */
  day: number;
}

/** The talks after an election that nobody won outright. */
export interface Formation {
  day: number;
  /** Last day the Palace has allowed. */
  deadline: number;
  extended: boolean;
  /** Meetings the player can still hold today. */
  meetings: number;
  /** [party]: seats won. */
  seats: number[];
  /** Parties whose leaders are trying to form the government. */
  claimants: number[];
  /** [party]: the claimant the party has signed for, or null. A claimant backs itself. */
  pledge: (number | null)[];
  /** Independents decide one by one: how hard each is to win, and who has them. */
  indep: { bar: number; pledge: number | null }[];
  /** [claimant][party]: the offer on the table. */
  offers: (Offer | null)[][];
  /** [party]: the player has sounded them out and knows what they want. */
  known: boolean[];
  /** The leader the Palace invited first to show a majority: the one with most behind them when the talks opened. */
  invited?: number;
  /** The Palace has advised the leaders to consider a unity government. */
  unityAdvice: boolean;
  outcome: Outcome | null;
}

export type PollScope = 'national' | 'state' | 'seat';
export type PollQuality = 'quick' | 'full';

export interface Poll {
  id: number;
  week: number;
  scope: PollScope;
  /** State id or seat id; null for national polls. */
  target: string | null;
  quality: PollQuality;
  /** Published by the media for everyone, not commissioned by the player. */
  public: boolean;
  /** Margin of error, as a share (0.04 = plus or minus 4 points). */
  moe: number;
  /** National polls: vote share per party nationwide. */
  national?: number[];
  /** National polls: vote share per party within each region. */
  regions?: Record<Region, number[]>;
  /** State and seat polls: vote share per party in each polled seat. */
  seats?: Record<string, number[]>;
  /**
   * National polls: the player's share of the vote within each voter group, in the order of the groups, or null for a
   * group with nobody in it here. A smaller sample than the whole poll, so a rougher reading. Absent in older polls.
   */
  groups?: (number | null)[];
}

/**
 * A line in the news feed. Stored as a translation key plus variables so it
 * reads correctly after the language is switched. Variable values starting
 * with "@" are references resolved when shown: "@seat:P.001", "@state:kl",
 * "@party:2", "@seats:P.001,P.002", "@states:kl,johor", "@rm:250000".
 */
export interface NewsItem {
  week: number;
  /** Party index the item is about, or null for general news. */
  party: number | null;
  key: string;
  vars?: Record<string, string | number>;
  tone: 'good' | 'bad' | 'neutral';
}

/** The week just ended, as the player can know it. */
export interface Recap {
  /** The week it describes. */
  week: number;
  daysTotal: number;
  daysLeft: number;
  /** Campaign money spent that week. */
  spent: number;
  /** Campaign money spent so far, so that next week's figure can be told from it. */
  spentToDate: number;
  /** Seats where the player's leader appeared. */
  mine: string[];
  /** Where each rival's leader appeared. */
  rivals: { party: number; seats: string[] }[];
  /** Close seats a rival's leader visited that the player's did not. */
  missed: { seat: string; party: number }[];
}

/** One of the player's choices in the campaign: what it was, and how far it moved the projection when taken. */
export interface Decision {
  news: NewsItem;
  /** Change in the party's projected seats. */
  seats: number;
  /** Change in the party's projected share of the national vote, as a fraction. */
  share: number;
}

// ---------- the years between elections ----------

export const ISSUE_IDS = [
  'subsidies', 'wages', 'taxes',
  'graft', 'reform', 'liberties',
  'health', 'transport', 'studentDebt',
  'values', 'federalism', 'rural',
] as const;
export type IssueId = (typeof ISSUE_IDS)[number];
export const N_ISSUES = ISSUE_IDS.length;

export const PLEDGE_IDS = [
  'cashAid', 'fuelSubsidy', 'minWage', 'taxCut', 'graftCommission', 'termLimit', 'hospitals', 'transitPass',
  'debtWriteOff', 'civilPay', 'borneoFund', 'settlerDebt', 'floorPrices', 'valuesSchools', 'repealLaws', 'homes',
  // Added with the laws that, once passed, stay on the books (see `law` in policy.ts): promises of an Act, of a programme, and of money for a region.
  'partyHopBan', 'fixedTerm', 'infoAct', 'localVote', 'gigRights', 'oilRoyalty',
  'schoolMeals', 'healthCover', 'greenGrid', 'villageRoads', 'smeLoans', 'seniorPension',
] as const;
export type PledgeId = (typeof PLEDGE_IDS)[number];

/** What the leader spends their own time on, week after week, until told otherwise. */
export const FOCUS_IDS = ['tour', 'funds', 'media', 'policy', 'leaders', 'dirt'] as const;
export type FocusId = (typeof FOCUS_IDS)[number];

/** How much effort or money goes into something: none, a little, a fair amount, a lot. */
export type Level = 0 | 1 | 2 | 3;

/** Standing orders: what the party does every week of the term without being asked. */
export interface Orders {
  focus: FocusId;
  /** The leader being cultivated under the "leaders" focus. */
  courting: number | null;
  /** Weekly spending on branches, on staying in the public eye, and on digging into rivals. */
  budget: { machinery: Level; media: Level; research: Level };
  /** Regions where the machinery money and the leader's tours go. Up to three; none means everywhere. */
  focusStates: RegionId[];
  /** How hard the party leans on tycoons and corporate donors. */
  donors: Level;
  /** How hard a governing party leans on state resources. */
  state: Level;
}

/** An election's result in every seat, kept so the next term can be fitted to it. */
export interface SeatResults {
  votes: number[][];
  turnout: number[];
  /** What the seat would have done with every party standing, where a pact kept some off the ballot. */
  basis: ({ votes: number[]; turnout: number } | null)[];
}

// ---------- governing ----------

/** The main lines of the annual budget. */
export const LINE_IDS = ['aid', 'health', 'education', 'rural', 'civil'] as const;
export type LineId = (typeof LINE_IDS)[number];
/** Cut, hold or boost. */
export type Dial = -1 | 0 | 1;
/** Concrete things a budget can pay for inside its lines: each notices a few groups of voters and costs a little more than holding the line. */
export const MEASURE_IDS = [
  'cashTopUp', 'fuelPrice', 'clinics', 'hospitalBeds', 'scholarships', 'schoolRepairs', 'roads', 'farmInputs', 'civilBonus', 'pensions',
] as const;
export type MeasureId = (typeof MEASURE_IDS)[number];
export interface Budget { lines: Record<LineId, Dial>; tax: Dial; /** What the budget pays for in particular, at most three; absent in one that is only dials. */ measures?: MeasureId[] }

export const PORTFOLIO_IDS = ['finance', 'home', 'economy', 'education', 'health', 'rural', 'works', 'defence'] as const;
export type PortfolioId = (typeof PORTFOLIO_IDS)[number];

/** What kind of person a minister is the player chose: each brings something and costs something. */
export const MINISTER_TRAITS = ['expert', 'loyalist', 'rising', 'fixer'] as const;
export type MinisterTrait = (typeof MINISTER_TRAITS)[number];

export interface Minister {
  portfolio: PortfolioId;
  party: number;
  /** Index into the pool of invented names. */
  name: number;
  /** 1 (out of their depth) to 5 (formidable). */
  skill: number;
  /** Set on a minister the player appointed; ministers of other parties, and those from before this existed, have none. */
  trait?: MinisterTrait;
  /** Holding the post until the player appoints someone: a stand-in, weak, and a small drag on the government. */
  acting?: boolean;
  /** The risk of this minister's kind has already come to pass. */
  done?: boolean;
}

/** A person the player may appoint to a post. */
export interface Candidate { name: number; skill: number; trait: MinisterTrait }
/** A post the player's party holds and has yet to fill, with the people on offer. */
export interface Appointment { portfolio: PortfolioId; options: Candidate[] }

/** How well the country is looked after, and how it stands among other nations, each from 0 to 100. */
export interface Nation { health: number; education: number; standing: number }

/** The figures everyone watches. All in per cent; debt is per cent of national income. */
export interface Economy { growth: number; inflation: number; jobless: number; debt: number }

/** A bill on its way to a vote: `pledge:<id>` for a manifesto promise, `demand:<id>` for something owed to a partner. */
export interface Bill { id: string; weeks: number }

/** Something the head of government promised a partner when the government was formed. */
export interface Obligation { party: number; demand: DemandId; due: number; done: boolean }

/** Ways a government can lean on institutions that are meant to be independent. */
export const LEVER_IDS = ['agency', 'police', 'broadcaster'] as const;
export type LeverId = (typeof LEVER_IDS)[number];

/** What the player has done over the whole career, for the day it ends. */
export interface CareerRecord {
  elections: number;
  /** Elections after which the player headed the government. */
  victories: number;
  weeksPm: number;
  weeksGov: number;
  weeksOpp: number;
  kept: PledgeId[];
  broken: number;
  bestSeats: number;
  /** Governments the player led that fell between elections. */
  falls: number;
  /** Governments the player brought down. */
  toppled: number;
  /** How each election went, in order: the seats won and whether the player came out heading the government. Absent in a game saved before it existed. */
  terms?: { seats: number; pm: boolean }[];
}

export const LEGACY_IDS = ['statesman', 'reformer', 'survivor', 'promiser', 'plotter', 'premier', 'kingmaker', 'conscience', 'nearly', 'footnote'] as const;
export type LegacyId = (typeof LEGACY_IDS)[number];
export type EndingKind = 'retired' | 'ousted' | 'wipedOut';
export interface Ending { kind: EndingKind; legacy: LegacyId; score: number }

/** A career: the long game across terms. Null in one-off contests. */
export interface Career {
  /** The player founded this party: it began as a one-seat party and grows by winning over the groups its platform suits. */
  founded?: boolean;
  /** The state of the country beyond the budget's figures; absent in a game saved before it existed. */
  nation?: Nation;
  /** How far each partner in the player's government has gone towards walking out, 0 to 100, by party. Absent while none has a complaint. */
  plots?: Record<number, number>;
  /** The mood of each member party of the player's coalition, 0 to 100 in the order they are listed, or -1 for one that has walked out. Absent while all are as they began. */
  members?: number[];
  /** Which parliament this is, starting at 1. */
  term: number;
  /** Week of the term, starting at 1. The election campaign follows the last one. */
  week: number;
  /** Weeks in the term before the campaign begins. */
  length: number;
  /** Who governs. */
  government: Outcome;
  /** The week the Palace last refused a request to dissolve Parliament, or absent if it never has. */
  palaceNo?: number;
  /** The talks now under way are a change of government between elections. */
  midterm: boolean;
  /** The last election seat by seat, once there has been one in this career. */
  results: SeatResults | null;
  orders: Orders;
  /** Money tied up in party businesses. */
  assets: number;
  /** What each kind of business accounts for; the rest of `assets` is plain property. Absent in a game saved before kinds existed. */
  holdings?: Partial<Record<'property' | 'hotel' | 'media' | 'plantation' | 'college', number>>;
  /** Members on the party's rolls. Absent until the first week of a term, when it is set to what the party would ordinarily have. */
  rolls?: number;
  /** A recruitment drive's lift to the rolls the party can sustain, fading back to 1. */
  drive?: number;
  /** The week each activity was last done. */
  activity?: Partial<Record<'recruit' | 'assembly' | 'school', number>>;
  /** How far voters believe what the player says, 0-100. */
  credibility: number;
  /** What the party has dug up on its rivals, 0-100. Spent on attacks. */
  dossier: number;
  /** [party][issue]: where each party stands, -2 to 2. */
  stances: number[][];
  /** What was decided about the boundaries before the next parliament: the party that asked for a map that suits it, or null for the commission left alone. Absent if the question did not arise (see redraw.ts). */
  redraw?: { by: number | null };
  /** The party's factions and wings, made the first time they are looked at (see factions.ts). */
  factions?: { size: number[]; mood: number[]; wing: number[]; chief: number[]; deputy?: { name: number; faction: number; ambition: number } };
  /** The shadow cabinet the player has named from the opposition benches, by portfolio (see shadow.ts). */
  shadow?: Partial<Record<PortfolioId, { name: number; skill: number }>>;
  /** The trail left by the defections the party has bought: investigators follow it (see party.ts). */
  trail?: number;
  /** How many times the government has leaned on each institution in this parliament (see govern.ts). */
  leverUses?: Partial<Record<LeverId, number>>;
  /** The sectors of the economy, each from 0 to 100 around a middling 50 (see sectors.ts). */
  sectors?: Record<string, number>;
  /** [sector]: the week the government last gave it support. */
  sectorAid?: Record<string, number>;
  /** The government dissolved the states it governs together with the House (see career.ts). */
  together?: boolean;
  /** The post whose holder is at the centre of a scandal the player has yet to answer (see events.ts). */
  scandal?: PortfolioId;
  /** The week the opposition last opened a committee inquiry (see committee.ts). */
  committee?: number;
  /** The coalition the player has given a name and a mark: who belongs (see alliance.ts). */
  alliance?: { name: number; mark: number; members: number[] };
  /** The promises in the player's manifesto that are made in their short form: half the price, half the appeal (see policy.ts). */
  brief?: PledgeId[];
  /** [party]: the player's promises that party has copied for its own manifesto (see policy.ts). */
  copied?: Record<number, PledgeId[]>;
  /** Acts the voters themselves approved in a referendum; no court strikes them down (see courts.ts). */
  mandated?: PledgeId[];
  /** Acts that passed on a thin margin; a constitutional court may strike them down (see courts.ts). */
  shaky?: PledgeId[];
  /** [seat]: the party that holds it and for how many terms in a row (see tenure.ts). */
  tenure?: Record<string, [number, number]>;
  /** How freely the party draws on the states it governs, 0 to 2 (see patronage.ts). */
  patronage?: number;
  /** Members on the rolls on paper only, not yet found out (see party.ts). */
  padded?: number;
  /** [seat]: the faction a safe seat was given to as a reward (see safeseat.ts). */
  safe?: Record<string, number>;
  /** The seat the party made fall vacant on purpose this term, to be fought for in a by-election (see contests.ts). */
  forced?: string;
  /** Foreign money taken, in lots of what a donor gives, and not yet found out (see party.ts). */
  foreign?: number;
  /** Parties the player's party has taken in, in this career so far (see merge.ts). */
  merged?: number[];
  /** Parties that keep the player's government in office from outside the cabinet, and until when (see supply.ts). */
  supply?: { party: number; until: number; price: 'cash' | 'policy' }[];
  /** The week each state's branches were last disciplined, by state. */
  disciplined?: Record<string, number>;
  /** States where the party has stood for the first time and its branches are still young, so that they grow slowly (see party.ts). */
  fresh?: string[];
  /** What the party's members and branches are worth at this election, in logit units across all groups, fixed when the campaign begins (see party.ts). Absent outside a campaign. */
  grass?: number;
  /** Parliaments in a row the player's party has sat in government, as head or as partner, this one included: the longer it has, the more tired the voters are of it (see party.ts). */
  govRun?: number;
  /** Money set aside for the next campaign, out of reach of the weeks between (see party.ts). */
  chest?: number;
  /** Parliaments in a row the player's party has headed the government, this one included. */
  pmRun?: number;
  /** The party's leader may not head the government this term: a term limit passed into law applies (see nextTerm). The party governs, and the player leads it from outside the premiership. */
  limited?: boolean;
  /** How the player answered each time their state's question was put in a state career, in order (see agenda.ts). */
  agendaAnswers?: number[];
  /** Promises that became law, in this term or one before: an Act of Parliament need not be promised twice. Absent in a game saved before it existed. */
  laws?: PledgeId[];
  /** Stances as they were at the last election. */
  stances0: number[][];
  /** [issue]: the last week the player changed that stance, or 0. */
  turned: number[];
  /** [issue]: how much voters care about it right now; 1 is normal. */
  salience: number[];
  /** [bloc][party]: how opinion has moved since the last election. */
  mood: number[][];
  /** [party]: lift from staying in the public eye. */
  profile: number[];
  /** [party]: what each party will promise at the next election. */
  manifesto: PledgeId[][];
  /** The player's manifesto has been published and can no longer be changed. */
  launched: boolean;
  /** What the player promised at the last election, for the day they have to deliver. */
  promises: PledgeId[];
  /** Things events have left behind. */
  flags: string[];
  /** Events already seen this term. */
  fired: string[];
  /** Events due later because of earlier choices. */
  queue: { event: string; week: number }[];
  /** No event comes out of the blue before this week. */
  quietUntil: number;

  economy: Economy;
  /** The budget the head of government means to table next. */
  budget: Budget;
  /** The budget in force. */
  tabled: Budget;
  /** Standing commitments taken on since the last election, in budget units. */
  fiscal: number;
  /** The player chose to fight state elections in person when a round of state polls falls due (see aside.ts), rather than leave them to the model. */
  realStates?: boolean;
  /** The player's party is one they made, founded or made their own: it may stand in any seat, at a price (see slate.ts). */
  own?: boolean;
  /** The seats of a party the player made: where it has candidates carried over, and what was paid for those added this time. */
  slate?: { held: string[]; added: Record<string, number> };
  cabinet: Minister[];
  /** Posts of the player's party waiting for the player to choose who fills them. Absent in a game saved before this existed. */
  appointments?: Appointment[];
  /** Bills the player's government has before the House. */
  bills: Bill[];
  /** What became of each promise the player's government took to a vote. */
  delivery: Partial<Record<PledgeId, 'kept' | 'failed'>>;
  /** What the player, as head of government, owes the partners. */
  obligations: Obligation[];
  /** [lever]: the week it was last pulled this term, or 0. */
  levers: number[];
  /** The week of the last no-confidence motion this term, or 0. */
  motion: number;
  /** How many bills a rival-led government has put to the House this term. */
  rivalBills: number;
  record: CareerRecord;
  /** Set when the career is over. */
  ending: Ending | null;

  /** [seat]: the party now holding it, where a by-election since the general election has changed that. */
  house: Record<string, number>;
  /** [state]: the party that governs it. */
  states: Record<string, number>;
  /** How many rounds of state polls have been held this term. */
  rounds: number;
}

/**
 * Extra difficulty the player can choose, apart from how well the rivals play.
 * `fog` hides the chances of anything left to luck; `noisy` doubles the error of every poll.
 */
/** Optional ways to make a campaign harder, and the goal of a set challenge (an id in challenges.ts). */
export interface Challenge { fog: boolean; noisy: boolean; goal?: string }

/** A campaign in progress: everything the rules need, as plain JSON. */
export interface Campaign {
  /** Which contest this is; matches the id of the world it is played in. */
  scenario: string;
  /** Party index the player leads. */
  player: number;
  difficulty: Difficulty;
  /** Absent in a game played without any. */
  challenge?: Challenge;
  totalWeeks: number;
  /** Current week, starting at 1. */
  week: number;
  phase: Phase;
  seed: number;
  /** Random generator state. */
  rng: number;
  /** How opinion has drifted since the last election. Fixed for the campaign and hidden from the player. */
  drift: Dynamics;
  /** Campaign effects so far. These fade week by week. */
  dyn: Dynamics;
  /** Indexed by party; null for the pooled independents, who do not campaign. */
  parties: (PartyCampaign | null)[];
  polls: Poll[];
  news: NewsItem[];
  /** What the player decided in this campaign, and what each choice moved when it was taken. */
  ledger: Decision[];
  /** A look back at the week just ended; absent in the first week. */
  recap?: Recap;
  /** Set when polling day arrives: the generator state the election runs with. */
  election: { rng: number } | null;

  /** How the leaders get on: [a][b], -100 to 100, the same both ways. */
  relations: number[][];
  /** Seats where a party stands aside for a pact partner. */
  standDowns: StandDowns;
  pacts: Pact[];
  /** Parties that have privately promised to back the player once the votes are in. */
  understandings: number[];
  /** [party]: how many times the player has sat down with its leader. */
  met: number[];
  /** Seats whose incumbent has changed sides this campaign. */
  katak: string[];
  /** The question of the state being fought for: absent until asked, 'asked' while it waits, then 'answered:<choice>' (see agenda.ts). */
  agenda?: string;
  /** Seats where the player's party has put up a candidate it had none in last time, and what each cost (see entry.ts). */
  entered?: Record<string, number>;
  /** Parties that have already put a pact offer to the player. */
  offered: number[];
  /** Scenes waiting for the player's answer. */
  inbox: Scene[];
  nextScene: number;
  formation: Formation | null;
  career: Career | null;
  /** The player leads a party founded for this contest, with a following of its own but no past. Absent in a career, where `career.founded` says so. */
  newParty?: boolean;
  team: Team;
}

export * from './teamTypes';
import type { Team } from './teamTypes';
