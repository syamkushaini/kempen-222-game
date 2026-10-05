import seatFile from './generated/seats.json';
import dunJohor from './generated/dun-johor.json';
import dunKedah from './generated/dun-kedah.json';
import dunKelantan from './generated/dun-kelantan.json';
import dunMelaka from './generated/dun-melaka.json';
import dunNsembilan from './generated/dun-nsembilan.json';
import dunPahang from './generated/dun-pahang.json';
import dunPenang from './generated/dun-penang.json';
import dunPerak from './generated/dun-perak.json';
import dunPerlis from './generated/dun-perlis.json';
import dunSabah from './generated/dun-sabah.json';
import dunSarawak from './generated/dun-sarawak.json';
import dunSelangor from './generated/dun-selangor.json';
import dunTerengganu from './generated/dun-terengganu.json';
import { seatsAfter } from '../sim/campaign/career';
import { FOUNDED, FOUNDING_SEED_SHARE, FOUNDING_SLOT } from '../sim/campaign/founding';
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
const DUN_FILES: Partial<Record<StateId, SeatFile>> = {
  perlis: dunPerlis as SeatFile,
  kedah: dunKedah as SeatFile,
  penang: dunPenang as SeatFile,
  perak: dunPerak as SeatFile,
  kelantan: dunKelantan as SeatFile,
  terengganu: dunTerengganu as SeatFile,
  pahang: dunPahang as SeatFile,
  selangor: dunSelangor as SeatFile,
  nsembilan: dunNsembilan as SeatFile,
  melaka: dunMelaka as SeatFile,
  johor: dunJohor as SeatFile,
  sabah: dunSabah as SeatFile,
  sarawak: dunSarawak as SeatFile,
};

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

/** Every parliamentary seat, and every assembly seat of the thirteen states, in the order a list should show them. */
export const VACANCIES: Vacancy[] = [
  ...(seatFile as SeatFile).seats.map((s): Vacancy => ({ key: s.id, name: s.name, code: s.id, kind: 'parliament', state: s.state as StateId, within: null, close: isThreeWay(s.last.votes) })),
  ...STATE_SCENARIOS.flatMap((st) => (DUN_FILES[st]!.seats).map((s): Vacancy => ({
    key: `dun:${st}:${s.id}`, name: s.name, code: s.id, kind: 'dun', state: st, within: DUN_FILES[st]!.regions?.[s.state] ?? null, close: isThreeWay(s.basis?.votes ?? s.last.votes),
  }))),
];
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

/** The world for a scenario id, built on first use. Null if the id is unknown. */
export function getWorld(id: string): World | null {
  const cached = cache.get(id);
  if (cached) return cached;
  let built: World | null = null;
  if (id === 'hung') built = createWorld(seatFile as SeatFile, HUNG_RULES, id);
  else if (id === 'career') built = createWorld(seatFile as SeatFile, CAREER_RULES, id);
  else if (id.startsWith('byelection:dun:')) {
    // An assembly seat: the same single contest, fought on that state's own map and results.
    const [, , st, code] = id.split(':');
    const file = DUN_FILES[st as StateId];
    const seat = file?.seats.find((s) => s.id === code);
    if (file && seat) built = createWorld({ ...file, seats: [seat] }, BYELECTION_RULES, id);
  } else if (id === 'byelection' || id.startsWith('byelection:')) {
    const wanted = id === 'byelection' ? BYELECTION_SEAT : id.slice('byelection:'.length);
    const seat = (seatFile as SeatFile).seats.find((s) => s.id === wanted);
    if (seat) built = createWorld({ ...(seatFile as SeatFile), seats: [seat] }, BYELECTION_RULES, id);
  } else if (id.startsWith('state:')) {
    const file = DUN_FILES[id.slice(6) as StateId];
    if (file) built = createWorld(file, STATE_RULES, id);
  }
  if (built) cache.set(id, built);
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
export function worldOf(campaign: Pick<Campaign, 'scenario' | 'career'>): World | null {
  const results = campaign.career?.results;
  if (!results) return campaign.career?.founded ? foundedWorld() : getWorld(campaign.scenario);
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
