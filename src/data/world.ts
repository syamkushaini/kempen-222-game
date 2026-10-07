import seatFile from './generated/seats.json';
import { seatsAfter } from '../sim/campaign/career';
import { FOUNDED, FOUNDING_SEED_SHARE, FOUNDING_SLOT, NEW_PARTY_SHARE } from '../sim/campaign/founding';
import { inContention } from '../sim/campaign/outlook';
import { BYELECTION_RULES, CAREER_RULES, GENERAL_RULES, HUNG_RULES, STATE_RULES, type ContestKind } from '../sim/campaign/rules';
import type { Campaign, SeatResults } from '../sim/campaign/types';
import { createWorld, type SeatFile, type World } from '../sim/election';
import { PARTY_IDS, type StateId } from '../sim/types';

/** The general election: all 222 parliamentary seats, fitted to the last result. */
export const world = createWorld(seatFile as SeatFile, GENERAL_RULES, 'general');

/**
 * States whose assembly election can be played, north to south and then across the sea: all thirteen. Perlis,
 * Perak and Pahang voted with the 2022 general election. Six voted in August 2023, when two of the national
 * parties were allies and stood aside for each other in every seat. Melaka (2021) and Johor (2022) were
 * three-way fights. Sarawak (2021) and Sabah (2020) are led by their own parties, which can be played there;
 * Sabah was fought by two allies who never stood against each other.
 */
export const STATE_SCENARIOS: StateId[] = [
  'perlis', 'kedah', 'penang', 'perak', 'kelantan', 'terengganu', 'pahang', 'selangor', 'nsembilan', 'melaka', 'johor', 'sabah', 'sarawak',
];
/** How many seats each state's assembly has: known without loading the state's results. */
export const STATE_SEATS: Partial<Record<StateId, number>> = {
  perlis: 15, kedah: 36, penang: 40, perak: 59, kelantan: 45, terengganu: 32, pahang: 42, selangor: 56, nsembilan: 36, melaka: 28, johor: 56, sabah: 73, sarawak: 82,
};

// A state's results are fetched when the state is first wanted, so that the page does not carry all thirteen from the
// start. Everything else here stays synchronous: a state is loaded before anything asks for its world.
const DUN_FILES: Partial<Record<StateId, SeatFile>> = {};

/** Makes a state's results available. Called by the loader below, and directly by the tests, which have every file to hand. */
export function registerState(st: StateId, file: SeatFile): void {
  if (DUN_FILES[st]) return;
  DUN_FILES[st] = file;
  listVacancies();
}

export const stateLoaded = (st: StateId) => !!DUN_FILES[st];

/** Fetches a state's results, once. Resolves at once for a state already here, and for anything that is not a state. */
export async function loadState(st: StateId): Promise<void> {
  if (DUN_FILES[st] || !STATE_SCENARIOS.includes(st)) return;
  const file = (await import(`./generated/dun-${st}.json`)) as { default: SeatFile };
  registerState(st, file.default);
}

/** Fetches every state's results: the list of seats for a by-election needs them all. */
export const loadStates = (): Promise<unknown> => Promise.all(STATE_SCENARIOS.map(loadState));

/** The state whose results a scenario is played on, if any: a state election, or a by-election in an assembly seat. */
export function stateNeeded(scenario: string): StateId | null {
  const st = scenario.startsWith('state:') ? scenario.slice(6) : scenario.startsWith('byelection:dun:') ? scenario.split(':')[2] : null;
  return st && STATE_SCENARIOS.includes(st as StateId) ? (st as StateId) : null;
}

/** Fetches whatever a scenario needs before its world can be built. */
export async function loadScenario(scenario: string): Promise<void> {
  const st = stateNeeded(scenario);
  if (st) await loadState(st);
}

/** The seat of the scenario id 'byelection' on its own: Hulu Selangor, a three-way marginal with a mixed electorate. Older saves are in it. */
export const BYELECTION_SEAT = 'P.094';

const NATIONAL = ['ps', 'bp', 'pt'].map((id) => PARTY_IDS.indexOf(id as (typeof PARTY_IDS)[number]));
/** A by-election is a close race between the three national parties: each took a fifth of the vote, and the top two were within 12 points. */
const THREE_WAY = { third: 0.2, gap: 0.12 };

export function isThreeWay(votes: readonly number[]): boolean {
  const total = votes.reduce((a, b) => a + b, 0);
  const [first, second, third] = NATIONAL.map((p) => votes[p] / total).sort((a, b) => b - a);
  return third >= THREE_WAY.third && first - second <= THREE_WAY.gap;
}

/** The seats a by-election can be drawn in. Hulu Selangor is one of them. */
export const BYELECTION_SEATS: string[] = (seatFile as SeatFile).seats.filter((s) => isThreeWay(s.last.votes)).map((s) => s.id);

/**
 * The seats to draw from for a party: those where it led last time or was within reach of the lead. A draw from the
 * whole list handed the player a seat they could not win about four times in ten.
 */
export function fairSeats(p: number): string[] {
  // A party of Sabah or Sarawak is drawn a seat on its own ground: there it need not be a three-way fight to be a fair one.
  const home = HOME_REGION[PARTY_IDS[p]];
  const fair = (seatFile as SeatFile).seats
    .filter((s) => (home ? s.region === home : isThreeWay(s.last.votes)) && inContention(s.last.votes, p))
    .map((s) => s.id);
  return fair.length > 0 ? fair : BYELECTION_SEATS;
}

/** The parties of Sabah and Sarawak that can be led in a by-election on their own ground, and where that is. */
const HOME_REGION: Partial<Record<(typeof PARTY_IDS)[number], string>> = { gbk: 'sarawak', gbs: 'sabah', legasi: 'sabah' };
export const HOME_PARTIES = (Object.keys(HOME_REGION) as (typeof PARTY_IDS)[number][]).map((id) => PARTY_IDS.indexOf(id));

/** The scenario id of a by-election in a given seat (a parliamentary seat's code, or `dun:<state>:<code>` for an assembly seat). */
export const byElectionId = (seat: string) => `byelection:${seat}`;

/** A seat in which a by-election can be fought. */
export interface Vacancy {
  /** What goes after `byelection:` in the scenario id. */
  key: string;
  name: string;
  /** The seat's official code. */
  code: string;
  kind: 'parliament' | 'dun';
  /** The state it is in. */
  state: StateId;
  /** For an assembly seat, the parliamentary seat it sits within. */
  within: string | null;
  /** A close three-way race, which makes for the best fight. */
  close: boolean;
}

/**
 * Every parliamentary seat, and every assembly seat of the states loaded so far, in the order a list should show them.
 * The same array is refilled as states arrive, so whoever holds it sees them.
 */
export const VACANCIES: Vacancy[] = [];
function listVacancies(): void {
  VACANCIES.length = 0;
  VACANCIES.push(
    ...(seatFile as SeatFile).seats.map((s): Vacancy => ({ key: s.id, name: s.name, code: s.id, kind: 'parliament', state: s.state as StateId, within: null, close: isThreeWay(s.last.votes) })),
    ...STATE_SCENARIOS.flatMap((st) => (DUN_FILES[st]?.seats ?? []).map((s): Vacancy => ({
      key: `dun:${st}:${s.id}`, name: s.name, code: s.id, kind: 'dun', state: st, within: DUN_FILES[st]!.regions?.[s.state] ?? null, close: isThreeWay(s.basis?.votes ?? s.last.votes),
    }))),
  );
}
listVacancies();
export const vacancyOf = (key: string) => VACANCIES.find((v) => v.key === key) ?? null;

export interface ScenarioInfo {
  id: string;
  kind: ContestKind;
  /** A career rather than a single contest. */
  career?: boolean;
  /** The state played in, for a state election. */
  state?: StateId;
}

export const SCENARIOS: ScenarioInfo[] = [
  { id: 'byelection', kind: 'byelection' },
  ...STATE_SCENARIOS.map((state) => ({ id: `state:${state}`, kind: 'state' as const, state })),
  { id: 'general', kind: 'general' },
  { id: 'hung', kind: 'hung' },
  { id: 'career', kind: 'general', career: true },
];

const cache = new Map<string, World>([['general', world]]);

/** The results and rules a scenario is built from, or null if the id is unknown or its results have not been fetched. */
function blueprint(id: string): { file: SeatFile; rules: typeof GENERAL_RULES } | null {
  if (id === 'general') return { file: seatFile as SeatFile, rules: GENERAL_RULES };
  if (id === 'hung') return { file: seatFile as SeatFile, rules: HUNG_RULES };
  if (id === 'career') return { file: seatFile as SeatFile, rules: CAREER_RULES };
  if (id.startsWith('byelection:dun:')) {
    // An assembly seat: the same single contest, fought on that state's own map and results.
    const [, , st, code] = id.split(':');
    const file = DUN_FILES[st as StateId];
    const seat = file?.seats.find((s) => s.id === code);
    return file && seat ? { file: { ...file, seats: [seat] }, rules: BYELECTION_RULES } : null;
  }
  if (id === 'byelection' || id.startsWith('byelection:')) {
    const wanted = id === 'byelection' ? BYELECTION_SEAT : id.slice('byelection:'.length);
    const seat = (seatFile as SeatFile).seats.find((s) => s.id === wanted);
    return seat ? { file: { ...(seatFile as SeatFile), seats: [seat] }, rules: BYELECTION_RULES } : null;
  }
  if (id.startsWith('state:')) {
    const file = DUN_FILES[id.slice(6) as StateId];
    return file ? { file, rules: STATE_RULES } : null;
  }
  return null;
}

/** The world for a scenario id, built on first use. Null if the id is unknown. */
export function getWorld(id: string): World | null {
  const cached = cache.get(id);
  if (cached) return cached;
  const plan = blueprint(id);
  const built = plan ? createWorld(plan.file, plan.rules, id) : null;
  if (built) cache.set(id, built);
  return built;
}

/** Whether a contest can be fought by a party the player founded: any single contest, but not a hung parliament, whose votes are already in. */
export const canFound = (kind: ContestKind) => kind === 'byelection' || kind === 'state' || kind === 'general';

/**
 * The world for a contest fought by a brand-new party: the same seats and results, with the new party on every ballot
 * and given the following a new party arrives with. It keeps the contest's own id, so maps and saves read it as the same contest.
 */
export function newPartyWorld(id: string): World | null {
  const key = `new:${id}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const plan = blueprint(id);
  const kind = plan?.rules.kind;
  if (!plan || plan.rules.career || !kind || !canFound(kind)) return null;
  const share = NEW_PARTY_SHARE[kind as keyof typeof NEW_PARTY_SHARE];
  const p = PARTY_IDS.indexOf(FOUNDING_SLOT);
  const seed = (votes: number[]) => {
    const total = votes.reduce((a, b) => a + b, 0);
    const out = [...votes];
    out[p] = Math.max(out[p], Math.round(total * share));
    return out;
  };
  const seats = plan.file.seats.map((s) => ({
    ...s,
    last: { ...s.last, votes: seed(s.last.votes) },
    ...(s.basis ? { basis: { ...s.basis, votes: seed(s.basis.votes) } } : {}),
  }));
  const built = createWorld({ ...plan.file, seats }, plan.rules, id);
  cache.set(key, built);
  return built;
}

export const scenarioInfo = (id: string) => SCENARIOS.find((s) => s.id === id) ?? null;

// A career's world changes at every election: the model is refitted to the
// result just declared. Worlds are kept by a fingerprint of that result, so a
// reloaded or replayed game always gets the world that matches its own history.
const careerWorlds = new Map<number, World>();
const KEPT = 3;

function fingerprint(results: SeatResults): number {
  let h = 0x811c9dc5;
  for (const row of results.votes) for (const v of row) h = Math.imul(h ^ v, 0x01000193) >>> 0;
  for (const b of results.basis) if (b) for (const v of b.votes) h = Math.imul(h ^ v, 0x01000193) >>> 0;
  return h;
}

/**
 * The world a founded party's first term is played in: the country as it was, with the new party already
 * on the ballot in every seat with a few votes. Without them it could never win a seat it did not already hold.
 */
export function foundedWorld(): World {
  const hit = cache.get(FOUNDED);
  if (hit) return hit;
  const p = PARTY_IDS.indexOf(FOUNDING_SLOT);
  const seed = (votes: number[]) => {
    const total = votes.reduce((a, b) => a + b, 0);
    const out = [...votes];
    out[p] = Math.max(out[p], Math.round(total * FOUNDING_SEED_SHARE));
    return out;
  };
  const seats = (seatFile as SeatFile).seats.map((s) => ({
    ...s,
    last: { ...s.last, votes: seed(s.last.votes) },
    ...(s.basis ? { basis: { ...s.basis, votes: seed(s.basis.votes) } } : {}),
  }));
  const built = createWorld({ ...(seatFile as SeatFile), seats }, CAREER_RULES, 'career');
  cache.set(FOUNDED, built);
  return built;
}

/** The world a game is played in: its scenario's world, or for a career past its first election, one built from that election. */
export function worldOf(campaign: Pick<Campaign, 'scenario' | 'career'> & { newParty?: boolean }): World | null {
  const results = campaign.career?.results;
  if (!results) return campaign.career?.founded ? foundedWorld() : campaign.newParty ? newPartyWorld(campaign.scenario) ?? getWorld(campaign.scenario) : getWorld(campaign.scenario);
  const key = fingerprint(results);
  let built = careerWorlds.get(key);
  if (!built) {
    const file = seatFile as SeatFile;
    built = createWorld({ ...file, seats: seatsAfter(file.seats, results) }, CAREER_RULES, 'career');
    if (careerWorlds.size >= KEPT) careerWorlds.delete(careerWorlds.keys().next().value!);
    careerWorlds.set(key, built);
  }
  return built;
}
