import { lastElection, majorityLine, type World } from '../election';
import { clamp } from '../math';
import {
  BLOC_IDS, N_BLOCS, N_PARTIES, PARTY_IDS, isMinor,
  type ElectionOutcome, type RegionId,
} from '../types';
import { economicMood, lift } from './office';
import { firstGovernment, beginCampaign, startCareer, syncOpinion } from './career';
import { START_UNITY, LEADER_STATS, RIVAL_STAFF, startRelations } from './cast';
import { draftPact, inPact, signPact } from './diplomacy';
import { endDay } from './formation';
import { forPowers, powersOf } from './stateScope';
import { defaultManifestos, FISCAL_ROOM, manifestoCost, MAX_PLEDGES, nationalAppeal, PLEDGES, startStances } from './policy';
import { partyLeaderStats } from './perks';
import { campaigns, freshParty, playable } from './field';
import { truth } from './actions';
import { autoPlayWeek, closeNight, electionResult, endWeek } from './turn';
import {
  ISSUE_IDS, N_ISSUES, PLEDGE_IDS, ROLE_IDS, STAT_IDS,
  type Campaign, type Career, type Difficulty, type Economy, type PledgeId, type RoleId,
} from './types';

// The simulator: a whole contest run with nobody at the controls. Every number that shapes it is in a SimConfig, which
// can be edited, saved and run again. The same campaign rules, voter model and talks apply as in a game that is played;
// the party in focus is run by the same logic as its rivals (see `SimHooks` in types.ts).

/** One point on a slider is this much in the model's units (about a point of vote share in a close two-way race). */
export const POINT = 0.05;
/** How much a year of good or bad economic news is worth to the governing parties, per step of economic mood. */
export const ECONOMY_PM = 0.1;
export const SIM_VERSION = 1;

/** What is set for one party. */
export interface PartySim {
  /** [issue]: where the party stands, -2 to 2, in the order of ISSUE_IDS. */
  stances: number[];
  manifesto: PledgeId[];
  /** How far voters believe the party's word, 0 to 100. */
  credibility: number;
  /** How much the party is in the public eye, in points (capped at ±1.6). */
  profile: number;
  /** The leader's abilities, 1 to 5, in the order of STAT_IDS. */
  leader: number[];
  /** The person in each job, 0 (nobody) to 5, in the order of ROLE_IDS. */
  staff: number[];
  funds: number;
  /** Days the campaign can use each week. */
  days: number;
  /** 0 to 100. */
  unity: number;
  /** A multiple of the branch network the party starts with. */
  machinery: number;
}

export interface SimPact { a: number; b: number; mode: 'targeted' | 'stronger' }

/** Everything the simulator can change. Plain data, so it can be saved as it is. */
export interface SimConfig {
  v: number;
  /** 'career' for the general election, or 'career:<state>'. */
  scenario: string;
  seed: number;
  difficulty: Difficulty;
  /** Weeks of campaigning; the contest's usual when null. */
  weeks: number | null;
  /** The party whose campaign is the one looked at. It is run like any other. */
  focus: number;

  // ----- conditions
  /** [party]: the national mood, in points of vote. */
  mood: number[];
  /** [bloc][party]: the mood among one group of voters, in points. */
  blocSwing: number[][];
  /** region -> [party]: the mood in one state, in points. */
  stateSwing: Record<RegionId, number[]>;
  /** [bloc]: how motivated each group is to turn out, in points. */
  turnoutBloc: number[];
  /** [party]: how motivated each party's own supporters are, in points. */
  turnoutParty: number[];
  /** [party]: extra pull on the undecided, in points. */
  lateSwing: number[];
  /** [issue]: how much the issue matters to voters, 0 to 2 (1 is usual). */
  salience: number[];
  /** A multiple of the usual random drift of opinion in the states and seats. */
  volatility: number;
  /** A multiple of the usual surprise on polling day. */
  surprise: number;
  economy: Economy;

  // ----- parties
  parties: PartySim[];

  // ----- coalitions
  government: { pm: number; partners: number[] };
  /** [a][b]: how leaders feel about each other, -100 to 100. Kept symmetrical. */
  relations: number[][];
  /** Electoral pacts signed on the first day, in addition to any the contest opens with. */
  pacts: SimPact[];
  /** Parties may make pacts and raid each other's members on their own during the campaign. */
  freePacts: boolean;
}

/** The parties that take the field in a contest, in order. */
export function fieldedParties(world: World): number[] {
  return PARTY_IDS.map((_, p) => p).filter((p) => campaigns(world, p));
}

/** The parties whose campaign can be put in focus. */
export const focusable = (world: World): number[] => playable(world).filter((p) => !isMinor(p));

const zeros = (n: number) => new Array<number>(n).fill(0);

const STAFF_DEFAULT = (p: number) => ROLE_IDS.map((r) => (RIVAL_STAFF[PARTY_IDS[p] as keyof typeof RIVAL_STAFF] as Partial<Record<RoleId, number>> | undefined)?.[r] ?? 0);

/** The contest as the game opens it, nothing changed. */
export function defaultSimConfig(world: World, focus?: number): SimConfig {
  const fieldedNow = fieldedParties(world);
  const stances = startStances();
  const manifestos = defaultManifestos();
  const first = firstGovernment(world);
  const parties: PartySim[] = PARTY_IDS.map((id, p) => {
    const fresh = freshParty(world, p);
    const unity = fresh?.unity ?? START_UNITY[id as keyof typeof START_UNITY] ?? 65;
    return {
      stances: [...stances[p]],
      manifesto: manifestos[p].filter((m) => !world.id.startsWith('career:') || stateCanPromise(world.id, m)),
      credibility: 60,
      profile: 0,
      leader: [...(LEADER_STATS[id as keyof typeof LEADER_STATS] ?? partyLeaderStats(p))],
      staff: STAFF_DEFAULT(p),
      funds: fresh?.funds ?? 0,
      days: fresh?.capacity ?? 0,
      unity,
      machinery: 1,
    };
  });
  return {
    v: SIM_VERSION,
    scenario: world.id,
    seed: 1,
    difficulty: 'normal',
    weeks: null,
    focus: focus ?? focusable(world)[0] ?? fieldedNow[0],
    mood: zeros(N_PARTIES),
    blocSwing: Array.from({ length: N_BLOCS }, () => zeros(N_PARTIES)),
    stateSwing: Object.fromEntries(world.states.map((st) => [st, zeros(N_PARTIES)])),
    turnoutBloc: zeros(N_BLOCS),
    turnoutParty: zeros(N_PARTIES),
    lateSwing: zeros(N_PARTIES),
    salience: new Array<number>(N_ISSUES).fill(1),
    volatility: 1,
    surprise: 1,
    economy: { growth: 4.2, inflation: 2.8, jobless: 3.6, debt: 63 },
    parties,
    government: { pm: first.pm, partners: [...first.partners] },
    relations: startRelations().map((row) => [...row]),
    pacts: [],
    freePacts: true,
  };
}

/** Whether a state's assembly can promise something. */
export function stateCanPromise(scenario: string, id: PledgeId): boolean {
  if (!scenario.startsWith('career:')) return true;
  const state = scenario.slice('career:'.length);
  return powersOf({ scenario: `career:${state}` } as Campaign).includes(id);
}

/** The promises on offer in a contest. */
export const pledgesIn = (scenario: string): PledgeId[] => PLEDGE_IDS.filter((id) => stateCanPromise(scenario, id));

/** A copy of a config with one thing changed, for the editors. */
export const withConfig = (cfg: SimConfig, patch: Partial<SimConfig>): SimConfig => ({ ...cfg, ...patch });

/** Mends a config that came from a file or an older version: anything missing is taken from the contest's defaults, and every number is kept in range. */
export function cleanConfig(world: World, raw: unknown): SimConfig {
  const base = defaultSimConfig(world);
  if (typeof raw !== 'object' || raw === null) return base;
  const r = raw as Partial<SimConfig>;
  const num = (x: unknown, fallback: number, lo: number, hi: number) => (typeof x === 'number' && Number.isFinite(x) ? clamp(x, lo, hi) : fallback);
  const list = (x: unknown, n: number, fallback: number[], lo: number, hi: number) =>
    Array.from({ length: n }, (_, i) => num(Array.isArray(x) ? x[i] : undefined, fallback[i], lo, hi));
  const fielded = fieldedParties(world);
  const focus = fielded.includes(r.focus as number) && focusable(world).includes(r.focus as number) ? (r.focus as number) : base.focus;
  const cfg: SimConfig = {
    ...base,
    seed: Math.round(num(r.seed, base.seed, 1, 2 ** 31 - 1)),
    difficulty: r.difficulty === 'easy' || r.difficulty === 'hard' ? r.difficulty : 'normal',
    weeks: r.weeks == null ? null : Math.round(num(r.weeks, world.rules.weeks, 2, 16)),
    focus,
    mood: list(r.mood, N_PARTIES, base.mood, -15, 15),
    blocSwing: Array.from({ length: N_BLOCS }, (_, b) => list(Array.isArray(r.blocSwing) ? r.blocSwing[b] : undefined, N_PARTIES, base.blocSwing[b], -15, 15)),
    stateSwing: Object.fromEntries(world.states.map((st) => [st, list((r.stateSwing as Record<string, unknown> | undefined)?.[st], N_PARTIES, base.stateSwing[st], -15, 15)])),
    turnoutBloc: list(r.turnoutBloc, N_BLOCS, base.turnoutBloc, -15, 15),
    turnoutParty: list(r.turnoutParty, N_PARTIES, base.turnoutParty, -15, 15),
    lateSwing: list(r.lateSwing, N_PARTIES, base.lateSwing, -15, 15),
    salience: list(r.salience, N_ISSUES, base.salience, 0, 2),
    volatility: num(r.volatility, 1, 0, 3),
    surprise: num(r.surprise, 1, 0, 3),
    economy: {
      growth: num(r.economy?.growth, base.economy.growth, -6, 9),
      inflation: num(r.economy?.inflation, base.economy.inflation, -1, 12),
      jobless: num(r.economy?.jobless, base.economy.jobless, 2, 12),
      debt: num(r.economy?.debt, base.economy.debt, 0, 120),
    },
    parties: base.parties.map((d, p) => {
      const x = (Array.isArray(r.parties) ? r.parties[p] : undefined) as Partial<PartySim> | undefined;
      const manifesto = Array.isArray(x?.manifesto) ? x!.manifesto.filter((m, i, a) => (PLEDGE_IDS as readonly string[]).includes(m) && a.indexOf(m) === i && stateCanPromise(world.id, m)).slice(0, MAX_PLEDGES) : d.manifesto;
      return {
        stances: list(x?.stances, N_ISSUES, d.stances, -2, 2).map(Math.round),
        manifesto,
        credibility: num(x?.credibility, d.credibility, 0, 100),
        profile: num(x?.profile, d.profile, -1.6, 1.6),
        leader: list(x?.leader, STAT_IDS.length, d.leader, 1, 5).map(Math.round),
        staff: list(x?.staff, ROLE_IDS.length, d.staff, 0, 5).map(Math.round),
        funds: num(x?.funds, d.funds, 0, 1e9),
        days: num(x?.days, d.days, 0, 7),
        unity: num(x?.unity, d.unity, 0, 100),
        machinery: num(x?.machinery, d.machinery, 0, 2),
      };
    }),
    government: {
      pm: fielded.includes(r.government?.pm as number) ? (r.government!.pm as number) : base.government.pm,
      partners: Array.isArray(r.government?.partners) ? r.government!.partners.filter((p) => fielded.includes(p)) : base.government.partners,
    },
    relations: base.relations.map((row, a) => row.map((v, b) => (a === b ? 0 : num((r.relations as number[][] | undefined)?.[a]?.[b], v, -100, 100)))),
    pacts: Array.isArray(r.pacts) ? r.pacts.filter((p) => fielded.includes(p?.a) && fielded.includes(p?.b) && p.a !== p.b).map((p) => ({ a: p.a, b: p.b, mode: p.mode === 'stronger' ? 'stronger' as const : 'targeted' as const })) : [],
    freePacts: r.freePacts === false ? false : true,
  };
  cfg.government.partners = cfg.government.partners.filter((p) => p !== cfg.government.pm);
  // A relation is the same from both sides.
  for (let a = 0; a < N_PARTIES; a++) for (let b = a + 1; b < N_PARTIES; b++) cfg.relations[b][a] = cfg.relations[a][b];
  return cfg;
}

// ---------- the results ----------

/** One week of the campaign, as the race stood at its end. */
export interface TrendPoint {
  week: number;
  /** [party]: share of the vote if polling day were that day. */
  share: number[];
  /** [party]: seats if polling day were that day. */
  seats: number[];
}

export interface Flip { seat: string; name: string; state: RegionId; from: number; to: number; margin: number }

export interface Government {
  pm: number;
  partners: number[];
  seats: number;
  minority: boolean;
  stability: number;
  trust: number;
  /** The day of the talks on which it was settled; 0 if the election settled it. */
  day: number;
  /** Parties that tried to form a government. */
  claimants: number[];
  /** The posts each partner was given. */
  posts: Record<number, number>;
}

export interface SimResult {
  seed: number;
  weeks: number;
  /** [party]: seats won. */
  seats: number[];
  /** [party]: seats at the last election, for comparison. */
  before: number[];
  /** [party]: share of the vote. */
  share: number[];
  /** [party]: share of the vote at the last election. */
  shareBefore: number[];
  turnout: number;
  need: number;
  totalSeats: number;
  /** [state]: [party] seats. */
  byState: Record<RegionId, number[]>;
  flips: Flip[];
  /** Seats won by under three points, and by under one. */
  close: { three: number; one: number };
  pactSeats: number;
  trend: TrendPoint[];
  government: Government | null;
  /** Parties that did not stand any candidate to speak of; hidden from the tables. */
  absent: number[];
}

const sharesOf = (o: ElectionOutcome): number[] => {
  const total = o.votes.reduce((a, b) => a + b, 0) || 1;
  return o.votes.map((v) => v / total);
};

// ---------- running ----------

/**
 * Builds the campaign a config describes, ready for its first week. To `watch` it, every party including the one in focus is run
 * by the game's own logic; to `play` it (the sandbox), the party in focus is the player's, with the leader and team the config gives it.
 */
export function buildCampaign(world: World, cfg: SimConfig, mode: 'watch' | 'play' = 'watch'): Campaign {
  const me = cfg.focus;
  const c = startCareer(world, { player: me, difficulty: cfg.difficulty, seed: cfg.seed, backstory: null });
  const k = c.career!;
  const playing = mode === 'play';
  c.sim = {
    // The player's own credibility, leader and team are the game's own, which the player can change in play.
    credibility: cfg.parties.map((p, i) => (playing && i === me ? null : p.credibility)),
    leaders: cfg.parties.map((p, i) => (playing && i === me ? null : [...p.leader])),
    staff: cfg.parties.map((p, i) => (playing && i === me ? null : (Object.fromEntries(ROLE_IDS.map((r, j) => [r, p.staff[j]])) as Partial<Record<RoleId, number>>))),
    noNewPacts: !cfg.freePacts,
    noise: cfg.surprise,
    ...(playing ? { sandbox: true } : { auto: true }),
  };
  if (playing) {
    c.team.leader = { backstory: null, stats: [...cfg.parties[me].leader] };
    c.team.staff = ROLE_IDS.map((_, j) => (cfg.parties[me].staff[j] > 0 ? { name: j, skill: cfg.parties[me].staff[j], skeleton: false, vetted: true } : null));
  }

  // Who governs as the campaign opens.
  const seats = lastElection(world).tally;
  k.government = {
    ...k.government,
    pm: cfg.government.pm, partners: [...cfg.government.partners],
    seats: seats[cfg.government.pm] + cfg.government.partners.reduce((a, p) => a + seats[p], 0),
  };

  // The state of the economy, and what voters make of it.
  k.economy = { ...k.economy, ...cfg.economy };
  const feel = ECONOMY_PM * economicMood(k.economy);
  for (let b = 0; b < N_BLOCS; b++) for (let p = 0; p < N_PARTIES; p++) k.mood[b][p] = (cfg.mood[p] + cfg.blocSwing[b][p]) * POINT;
  lift(k, cfg.government.pm, 'all', feel);
  for (const p of cfg.government.partners) lift(k, p, 'all', feel / 2);
  k.profile = cfg.parties.map((p) => clamp(p.profile * POINT, -0.08, 0.08));

  // Where the parties stand and what they promise. Moving costs no credibility here: that is set on its own.
  // Voters judge a party by how far it has moved from where it stood at the last election (stances0), so a party left as it was changes nothing.
  k.stances = cfg.parties.map((p) => [...p.stances]);
  k.turned = new Array<number>(N_ISSUES).fill(0);
  k.salience = [...cfg.salience];
  k.manifesto = cfg.parties.map((p, i) => forPowers(c, i, p.manifesto));
  k.launched = true;
  k.promises = [];
  k.credibility = cfg.parties[me].credibility;

  // How the leaders feel about each other.
  for (let a = 0; a < N_PARTIES; a++) for (let b = 0; b < N_PARTIES; b++) if (a !== b) c.relations[a][b] = cfg.relations[a][b];
  c.parties.forEach((pc, p) => { if (pc) pc.unity = cfg.parties[p].unity; });

  beginCampaign(world, c);
  if (cfg.weeks !== null) c.totalWeeks = cfg.weeks;

  // The campaign trail: what the parties have to spend, and the branches they have.
  c.parties.forEach((pc, p) => {
    if (!pc) return;
    const s = cfg.parties[p];
    pc.funds = Math.round(s.funds);
    pc.capacity = s.days;
    pc.days = s.days;
    pc.unity = s.unity;
    pc.machinery = pc.machinery.map((m) => (m > 0 ? clamp(Math.round(m * s.machinery), 0, 100) : 0));
  });

  // The opinion that lasts the whole campaign.
  const d = c.drift;
  for (const st of world.states) {
    for (const row of d.support.state[st] ?? []) for (let p = 0; p < N_PARTIES; p++) row[p] *= cfg.volatility;
  }
  for (const v of Object.values(d.support.seat)) for (let p = 0; p < N_PARTIES; p++) v[p] *= cfg.volatility;
  for (const st of world.states) {
    const swing = cfg.stateSwing[st];
    if (!swing || swing.every((v) => v === 0)) continue;
    d.support.state[st] ??= Array.from({ length: N_BLOCS }, () => zeros(N_PARTIES));
    for (const row of d.support.state[st]!) for (let p = 0; p < N_PARTIES; p++) row[p] += swing[p] * POINT;
  }
  for (let b = 0; b < N_BLOCS; b++) d.turnout.nat[b] += cfg.turnoutBloc[b] * POINT;
  for (let p = 0; p < N_PARTIES; p++) {
    d.turnout.party[p] += cfg.turnoutParty[p] * POINT;
    d.lateSwing[p] += cfg.lateSwing[p] * POINT;
  }

  // Pacts signed on the first day.
  for (const pact of cfg.pacts) {
    if (!c.parties[pact.a] || !c.parties[pact.b] || inPact(c, pact.a, pact.b)) continue;
    const prop = draftPact(world, c, pact.a, pact.b, pact.mode, lastElection(world));
    if (prop.give.length + prop.get.length > 0) signPact(world, c, pact.a, pact.b, prop);
  }
  syncOpinion(c);
  return c;
}

const point = (world: World, c: Campaign, week: number): TrendPoint => {
  const o = truth(world, c);
  return { week, share: sharesOf(o), seats: [...o.tally] };
};

/** Runs a contest from the first day of the campaign to the government taking office. */
export function simulate(world: World, cfg: SimConfig): SimResult {
  const c = buildCampaign(world, cfg, 'watch');
  const trend: TrendPoint[] = [point(world, c, 0)];
  while (c.phase === 'campaign') {
    autoPlayWeek(world, c);
    endWeek(world, c);
    trend.push(point(world, c, c.week - (c.phase === 'campaign' ? 1 : 0)));
  }
  const result = electionResult(world, c)!;
  closeNight(world, c);
  for (let day = 0; day < 40 && c.phase === 'formation'; day++) endDay(world, c);

  const before = lastElection(world);
  const flips: Flip[] = [];
  const byState: Record<RegionId, number[]> = Object.fromEntries(world.states.map((st) => [st, zeros(N_PARTIES)]));
  let three = 0, one = 0;
  result.seats.forEach((o, i) => {
    const seat = world.seats[i];
    byState[seat.state][o.winner]++;
    if (o.margin < 0.03) three++;
    if (o.margin < 0.01) one++;
    const was = before.seats[i].winner;
    if (was !== o.winner) flips.push({ seat: seat.id, name: seat.name, state: seat.state, from: was, to: o.winner, margin: o.margin });
  });
  flips.sort((a, b) => a.margin - b.margin);

  const out = c.formation?.outcome ?? null;
  const government: Government | null = out && c.formation
    ? {
      pm: out.pm, partners: [...out.partners], seats: out.seats, minority: out.minority, stability: out.stability, trust: out.trust,
      day: out.day, claimants: [...c.formation.claimants],
      posts: Object.fromEntries(out.partners.map((p) => [p, out.deals[p]?.posts ?? 0])),
    }
    : null;

  const total = result.votes.reduce((a, b) => a + b, 0) || 1;
  return {
    seed: cfg.seed,
    weeks: c.totalWeeks,
    seats: [...result.tally],
    before: [...before.tally],
    share: result.votes.map((v) => v / total),
    shareBefore: sharesOf(before),
    turnout: result.turnout,
    need: majorityLine(world),
    totalSeats: world.seats.length,
    byState,
    flips,
    close: { three, one },
    pactSeats: Object.values(c.standDowns).filter((s) => s.some((v) => v >= 0 && v < 1000)).length,
    trend,
    government,
    absent: PARTY_IDS.map((_, p) => p).filter((p) => !c.parties[p] && result.tally[p] === 0 && before.tally[p] === 0),
  };
}

// ---------- many runs ----------

export interface Spread {
  runs: number;
  /** [party]: seats, mean and the range that nine runs in ten fall inside. */
  seats: { mean: number; low: number; high: number }[];
  share: number[];
  /** [party]: how often the party won a majority of the seats on its own. */
  majority: number[];
  /** [party]: how often the party headed the government. */
  pm: number[];
  /** [party]: how often the party was in government at all. */
  govern: number[];
  /** How often nobody won a majority at the polls. */
  hung: number;
  /** [party]: for each number of seats in tens, how many runs. A histogram for the biggest parties. */
  histogram: Record<number, number[]>;
  binWidth: number;
  /** Seats in the House, and the seats a majority takes. */
  total: number;
  need: number;
}

/** Sums up a set of runs. */
export function spreadOf(results: SimResult[], parties: number[]): Spread {
  const n = results.length || 1;
  const quant = (xs: number[], q: number) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.max(0, Math.round(q * (s.length - 1))))] ?? 0; };
  const seats = PARTY_IDS.map((_, p) => {
    const xs = results.map((r) => r.seats[p]);
    return { mean: xs.reduce((a, b) => a + b, 0) / n, low: quant(xs, 0.05), high: quant(xs, 0.95) };
  });
  const need = results[0]?.need ?? 112;
  const total = results[0]?.totalSeats ?? 222;
  const binWidth = Math.max(1, Math.round(total / 40));
  const bins = Math.ceil((total + 1) / binWidth);
  const histogram: Record<number, number[]> = {};
  for (const p of parties) {
    const h = new Array<number>(bins).fill(0);
    for (const r of results) h[Math.min(bins - 1, Math.floor(r.seats[p] / binWidth))]++;
    histogram[p] = h;
  }
  const frac = (f: (r: SimResult, p: number) => boolean) => PARTY_IDS.map((_, p) => results.filter((r) => f(r, p)).length / n);
  return {
    runs: results.length,
    seats,
    share: PARTY_IDS.map((_, p) => results.reduce((a, r) => a + r.share[p], 0) / n),
    majority: frac((r, p) => r.seats[p] >= need),
    pm: frac((r, p) => r.government?.pm === p),
    govern: frac((r, p) => !!r.government && (r.government.pm === p || r.government.partners.includes(p))),
    hung: results.filter((r) => Math.max(...r.seats.filter((_, p) => PARTY_IDS[p] !== 'oth')) < r.need).length / n,
    histogram,
    binWidth,
    total,
    need,
  };
}

export { BLOC_IDS, ISSUE_IDS };

// ---------- what has been changed ----------

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const differing = (a: readonly unknown[], b: readonly unknown[]) => a.filter((v, i) => !same(v, b[i])).length;

/** How many things on one party's sheet differ from the contest as it opens. */
export function partyChanges(cfg: SimConfig, base: SimConfig, p: number): number {
  const a = cfg.parties[p], b = base.parties[p];
  return differing(a.stances, b.stances) + (same([...a.manifesto].sort(), [...b.manifesto].sort()) ? 0 : 1) +
    differing(a.leader, b.leader) + differing(a.staff, b.staff) +
    (['credibility', 'profile', 'funds', 'days', 'unity', 'machinery'] as const).filter((k) => a[k] !== b[k]).length;
}

/** How many things differ from the contest as it opens, by the part of the set-up they belong to. */
export function changeCounts(cfg: SimConfig, base: SimConfig): { setup: number; conditions: number; parties: number; coalition: number; total: number } {
  const conditions =
    differing(cfg.mood, base.mood) + cfg.blocSwing.reduce((a, row, b) => a + differing(row, base.blocSwing[b]), 0) +
    Object.keys(cfg.stateSwing).reduce((a, st) => a + differing(cfg.stateSwing[st] ?? [], base.stateSwing[st] ?? []), 0) +
    differing(cfg.turnoutBloc, base.turnoutBloc) + differing(cfg.turnoutParty, base.turnoutParty) + differing(cfg.lateSwing, base.lateSwing) +
    differing(cfg.salience, base.salience) + (['growth', 'inflation', 'jobless', 'debt'] as const).filter((k) => cfg.economy[k] !== base.economy[k]).length +
    (cfg.volatility !== base.volatility ? 1 : 0) + (cfg.surprise !== base.surprise ? 1 : 0);
  const parties = cfg.parties.reduce((a, _, p) => a + partyChanges(cfg, base, p), 0);
  const coalition =
    (cfg.government.pm === base.government.pm ? 0 : 1) + (same([...cfg.government.partners].sort(), [...base.government.partners].sort()) ? 0 : 1) +
    cfg.relations.reduce((a, row, i) => a + row.filter((v, j) => j > i && v !== base.relations[i][j]).length, 0) +
    cfg.pacts.length + (cfg.freePacts !== base.freePacts ? 1 : 0);
  const setup = (cfg.weeks !== base.weeks ? 1 : 0) + (cfg.difficulty !== base.difficulty ? 1 : 0) + (cfg.focus !== base.focus ? 1 : 0);
  return { setup, conditions, parties, coalition, total: setup + conditions + parties + coalition };
}

// ---------- how a platform will go down ----------

const fakeCareer = (cfg: SimConfig) => ({ salience: cfg.salience }) as Career;

/**
 * What a party's positions are worth to it among all voters, in points of support, against where it stood at the last
 * election, and counting how far voters believe its word. The game applies the same sum group by group.
 */
export function platformEffect(world: World, cfg: SimConfig, p: number): number {
  const k = fakeCareer(cfg);
  const was = nationalAppeal(world, k, startStances()[p]);
  const now = nationalAppeal(world, k, cfg.parties[p].stances);
  return ((now - was) * (0.5 + cfg.parties[p].credibility / 200)) / POINT;
}

/** What taking one position is worth to the party among all voters, in points, against where it stands on that issue by default. */
export function stanceWorth(world: World, cfg: SimConfig, p: number, issue: number, to: number): number {
  const k = fakeCareer(cfg);
  const was = startStances()[p];
  const row = [...cfg.parties[p].stances];
  row[issue] = to;
  const rest = row.map((v, i) => (i === issue ? was[i] : v));
  return ((nationalAppeal(world, k, row) - nationalAppeal(world, k, rest)) * (0.5 + cfg.parties[p].credibility / 200)) / POINT;
}

/** Whether a promise sits with the party's positions: promising what you argue against convinces few. */
export function pledgeFits(cfg: SimConfig, p: number, id: PledgeId): boolean {
  const needs = PLEDGES[id].needs;
  if (!needs) return true;
  const stance = cfg.parties[p].stances[ISSUE_IDS.indexOf(needs[0])];
  return needs[1] > 0 ? stance >= 1 : stance <= -1;
}

/** What a manifesto costs the treasury, in the game's rough units, and how much the country can bear. */
export const manifestoBill = (ids: readonly PledgeId[]): { cost: number; room: number } => ({ cost: manifestoCost([...ids]), room: FISCAL_ROOM });
