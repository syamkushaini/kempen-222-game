import { majorityLine, type World } from '../election';
import { PARTY_IDS, type ElectionOutcome } from '../types';
import { scaled } from './actions';
import { electionResult } from './turn';
import type { Campaign, LegacyId } from './types';

/**
 * Things worth remembering a game for. Nothing is unlocked by them; they are
 * a record, kept with the player's profile rather than with any one save.
 */
export const ACHIEVEMENT_IDS = [
  // single contests
  'firstWin', 'photoFinish', 'stateWon', 'majority', 'landslide', 'sweep', 'ruthless', 'cleanHands',
  // dealings
  'pactMaker', 'katak', 'premier', 'partner', 'minority', 'bedfellows',
  // a career
  'fullTerm', 'mandate', 'secondMandate', 'outsider', 'promiseKeeper', 'hawk', 'toppler', 'survivor', 'decade',
  'machine', 'magnate', 'longArm',
  // endings
  'bowOut', 'statesman', 'knives', 'collector',
] as const;
export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

const PS = PARTY_IDS.indexOf('ps'), PT = PARTY_IDS.indexOf('pt');
/** A state has to be this big before winning all of it counts as a sweep. */
const SWEEP_SEATS = 8;
/** Different legacies to have earned before the collector's badge. */
export const COLLECTOR_LEGACIES = 5;

// Running an election again for every change to the game would be wasteful: the result is fixed once the votes are in.
let cached: { key: string; result: ElectionOutcome } | null = null;
function resultOf(world: World, c: Campaign): ElectionOutcome | null {
  // Not while the count is still on screen: an achievement should not announce the result early.
  if (!c.election || c.phase === 'night' || c.phase === 'campaign' || c.phase === 'term') return null;
  // Enough of the game to tell one finished election from another: the draw, and where opinion stood.
  const mood = [c.dyn.support.nat, c.drift.support.nat].flat(2).reduce((sum, v, i) => sum + v * (i + 1), 0);
  const key = `${world.id}:${c.seed}:${c.election.rng}:${c.player}:${mood}:${Object.keys(c.standDowns).length}`;
  if (cached?.key !== key) {
    const result = electionResult(world, c);
    if (!result) return null;
    cached = { key, result };
  }
  return cached.result;
}

/** Whether the player's party won every seat in some state big enough to matter. */
function swept(world: World, result: ElectionOutcome, me: number): boolean {
  const won = new Map<string, [number, number]>();
  result.seats.forEach((o, i) => {
    const row = won.get(world.seats[i].state) ?? [0, 0];
    row[0]++;
    if (o.winner === me) row[1]++;
    won.set(world.seats[i].state, row);
  });
  return [...won.values()].some(([all, mine]) => all >= SWEEP_SEATS && mine === all);
}

/**
 * Every achievement the game as it stands has earned. Judged from the state
 * alone, so it can be asked at any moment and gives the same answer after a
 * reload. `legacies` is what the player's gallery already holds.
 */
export function earned(world: World, c: Campaign, legacies: LegacyId[] = []): AchievementId[] {
  const out = new Set<AchievementId>();
  const me = c.player;
  const pc = c.parties[me];
  const kind = world.rules.kind;
  const k = c.career;

  const result = kind === 'hung' ? null : resultOf(world, c);
  if (result) {
    const seats = result.tally[me];
    const first = result.tally.every((n, p) => p === me || n < seats) && seats > 0;
    if (kind === 'byelection' && first) {
      out.add('firstWin');
      if (result.seats[0].margin < 0.02) out.add('photoFinish');
    }
    if (kind === 'state' && seats >= majorityLine(world)) out.add('stateWon');
    if (kind === 'general') {
      if (seats >= majorityLine(world)) out.add('majority');
      if (seats >= Math.ceil((world.seats.length * 2) / 3)) out.add('landslide');
      if (swept(world, result, me)) out.add('sweep');
    }
    if (first && c.difficulty === 'hard') out.add('ruthless');
    // No tycoon's cheque in the campaign, and in a career no leaning on donors or the state when the votes were cast.
    if (first && kind !== 'byelection' && pc?.tycoon === 0 && (!k || (k.orders.donors === 0 && k.orders.state === 0))) out.add('cleanHands');
  }

  const partners = new Set(c.pacts.filter((p) => p.a === me || p.b === me).map((p) => (p.a === me ? p.b : p.a)));
  if (partners.size >= 2) out.add('pactMaker');
  if (c.news.some((n) => n.party === me && n.key === 'news.court.won')) out.add('katak');

  // A government put together at the Palace, after an election or between two.
  const made = c.formation?.outcome;
  if (made && made.day > 0) {
    const inIt = made.pm === me || made.partners.includes(me);
    if (made.pm === me) out.add('premier');
    if (made.pm === me && made.minority) out.add('minority');
    if (made.partners.includes(me)) out.add('partner');
    const members = [made.pm, ...made.partners];
    if (inIt && members.includes(PS) && members.includes(PT)) out.add('bedfellows');
  }

  if (k && pc) {
    const r = k.record;
    const pm = k.government.pm === me;
    if (k.term >= 2) out.add('fullTerm');
    if (r.victories >= 1) out.add('mandate');
    if (r.victories >= 2) out.add('secondMandate');
    // The career opened with Pakatan Sinar at the head of the government.
    if (pm && me !== PS) out.add('outsider');
    if (pm && k.promises.length >= 4 && k.promises.every((id) => k.delivery[id] === 'kept')) out.add('promiseKeeper');
    if (pm && k.week >= 104 && k.economy.debt < 55) out.add('hawk');
    if (r.toppled >= 1) out.add('toppler');
    if (c.news.some((n) => n.key === 'news.motion.survived')) out.add('survivor');
    if (r.weeksPm >= 520) out.add('decade');
    if (pc.machinery.some((m) => m >= 90)) out.add('machine');
    if (k.assets >= scaled(world, 1_000_000)) out.add('magnate');
    if (pm && k.levers.every((week) => week > 0)) out.add('longArm');

    const end = k.ending;
    if (end) {
      if (end.kind === 'retired' && end.score >= 50) out.add('bowOut');
      if (end.legacy === 'statesman') out.add('statesman');
      if (end.kind === 'ousted') out.add('knives');
    }
    if (new Set([...legacies, ...(end ? [end.legacy] : [])]).size >= COLLECTOR_LEGACIES) out.add('collector');
  } else if (new Set(legacies).size >= COLLECTOR_LEGACIES) out.add('collector');

  return ACHIEVEMENT_IDS.filter((id) => out.has(id));
}
