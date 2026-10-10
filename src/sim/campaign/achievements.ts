import { majorityLine, type World } from '../election';
import { PARTY_IDS, type ElectionOutcome } from '../types';
import { scaled, spendingLimit } from './actions';
import { challengeById, goalResult } from './challenges';
import { statesHeld } from './contests';
import { summarise } from './night';
import { weekOfCode } from './weekly';
import { electionResult } from './turn';
import type { Campaign, LegacyId } from './types';

/**
 * Things worth remembering a game for. Nothing is unlocked by them; they are
 * a record, kept with the player's profile rather than with any one save.
 */
export const ACHIEVEMENT_GROUPS = {
  // what a night can bring
  wins: ['firstWin', 'photoFinish', 'stateWon', 'majority', 'landslide', 'sweep', 'ruthless', 'cleanHands'],
  // winning in a way of your own
  style: ['shoestring', 'blindfolded', 'brokeVictor', 'challenger', 'weekly'],
  // firsts: what no party in the game has done before
  history: ['borneoTop', 'hungRule', 'fromNothing', 'wideReach', 'newGround'],
  // the game's sense of humour: what a joke the country is
  satire: ['pollsWrong', 'exactMajority', 'absurd'],
  // pacts, coalitions, mergers
  together: ['pactMaker', 'katak', 'partner', 'bedfellows', 'premier', 'minority', 'bigTent', 'rainbow', 'merged', 'unityGov', 'alliance'],
  // errands taken on and finished
  missions: ['firstMission', 'fullHouse', 'tenMissions', 'hardMission', 'finalMission'],
  // a career, and how it ends
  career: [
    'fullTerm', 'mandate', 'secondMandate', 'outsider', 'promiseKeeper', 'hawk', 'toppler', 'survivor', 'decade', 'machine', 'magnate', 'longArm',
    'bowOut', 'statesman', 'knives', 'collector',
  ],
} as const;
export type AchievementGroup = keyof typeof ACHIEVEMENT_GROUPS;
export type AchievementId = (typeof ACHIEVEMENT_GROUPS)[AchievementGroup][number];
export const ACHIEVEMENT_IDS: readonly AchievementId[] = Object.values(ACHIEVEMENT_GROUPS).flat();
/** The events that are the country laughing at itself: three of them in one career earn "Lawak Politik". */
export const ABSURD_EVENTS = ['durianFeast', 'nasiLemakPrice', 'danceTrend', 'memeWar', 'footballFinal', 'tongueSlip', 'deepfake', 'goldMedal'] as const;
export const ABSURD_NEEDED = 3;
/** The Borneo parties: heading the government as one of them is a first. */
const BORNEO = ['gbk', 'gbs', 'legasi'].map((id) => PARTY_IDS.indexOf(id as (typeof PARTY_IDS)[number]));
/** States governed at once before the party is called a wide reach. */
export const WIDE_REACH = 5;
/** How much of the spending limit a winning campaign may use and still be called a shoestring. */
export const SHOESTRING = 0.25;

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
    // The challenge of the week, played to its count.
    if (c.challenge?.code && weekOfCode(c.challenge.code) !== null) out.add('weekly');
    // No tycoon's cheque in the campaign, and in a career no leaning on donors or the state when the votes were cast.
    if (first && kind !== 'byelection' && pc?.tycoon === 0 && (!k || (k.orders.donors === 0 && k.orders.state === 0))) out.add('cleanHands');

    // Winning in a way of your own.
    if (first && kind !== 'byelection' && pc) {
      if (pc.spent <= SHOESTRING * spendingLimit(world)) out.add('shoestring');
      if (!c.polls.some((p) => !p.public)) out.add('blindfolded');
      if (pc.funds < scaled(world, 10_000)) out.add('brokeVictor');
      // The last public poll had somebody ahead of the party, and the votes did not agree.
      const last = [...c.polls].reverse().find((p) => p.public && p.national);
      if (last?.national && last.national.some((v, p) => p !== me && v > last.national![me])) out.add('pollsWrong');
    }
    const def = challengeById(c.challenge?.goal);
    if (def && goalResult(def.goal, summarise(world, c, result)).met) out.add('challenger');
    // Exactly the seats to govern: one fewer and it is a hung parliament.
    if ((kind === 'general' || kind === 'state') && seats === majorityLine(world)) out.add('exactMajority');
    // A seat won where the party had never stood.
    if (c.entered && Object.keys(c.entered).some((id) => result.seats[world.seatIndex.get(id) ?? -1]?.winner === me)) out.add('newGround');
  }

  const partners = new Set(c.pacts.filter((p) => p.a === me || p.b === me).map((p) => (p.a === me ? p.b : p.a)));
  if (partners.size >= 2) out.add('pactMaker');
  if (partners.size >= 3) out.add('bigTent');
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
    // Five parties round one cabinet table.
    if (inIt && members.length >= 5) out.add('rainbow');
    // Firsts: a party of Sabah or Sarawak at the head of the country, and a government made from a hung parliament.
    if (made.pm === me && BORNEO.includes(me) && kind !== 'state') out.add('borneoTop');
    if (made.pm === me && kind === 'hung') out.add('hungRule');
  }

  if (k && pc) {
    const r = k.record;
    const pm = k.government.pm === me;
    if (k.term >= 2) out.add('fullTerm');
    if (r.victories >= 1) out.add('mandate');
    if (r.victories >= 2) out.add('secondMandate');
    // The career opened with Pakatan Sinar at the head of the government.
    if (pm && me !== PS && world.rules.kind !== 'state') out.add('outsider');
    if (pm && k.promises.length >= 4 && k.promises.every((id) => k.delivery[id] === 'kept')) out.add('promiseKeeper');
    if (pm && k.week >= 104 && k.economy.debt < 55) out.add('hawk');
    if (r.toppled >= 1) out.add('toppler');
    if (c.news.some((n) => n.key === 'news.motion.survived')) out.add('survivor');
    if (r.weeksPm >= 520) out.add('decade');
    if (k.founded && pm) out.add('fromNothing');
    // A party that starts a career in several states governs them from the first day: it counts once a year has passed.
    if (statesHeld(c, me) >= WIDE_REACH && (k.week >= 52 || k.term >= 2)) out.add('wideReach');
    if ((k.merged?.length ?? 0) >= 1) out.add('merged');
    if (k.grand) out.add('unityGov');
    if ((k.alliance?.members.length ?? 0) >= 3) out.add('alliance');
    const seen = new Set([...(k.seen ?? []), ...k.fired]);
    if (ABSURD_EVENTS.filter((e) => seen.has(e)).length >= ABSURD_NEEDED) out.add('absurd');
    const ms = k.missions;
    if (ms) {
      const won = ms.done.filter((x) => x.won).length;
      if (won >= 1) out.add('firstMission');
      if (won >= 10) out.add('tenMissions');
      if (['seize', 'hold', 'bloc', 'majority'].every((kind) => ms.firsts?.includes(kind as never))) out.add('fullHouse');
      if (ms.hard) out.add('hardMission');
    }
    // A party at home in its own state starts a state career with branches that strong: it counts once a year has passed.
    if (pc.machinery.some((m) => m >= 90) && (world.rules.kind !== 'state' || k.week >= 52 || k.term >= 2)) out.add('machine');
    if (k.assets >= scaled(world, 1_000_000)) out.add('magnate');
    if (pm && k.levers.every((week) => week > 0)) out.add('longArm');
    if (k.missions?.free) out.add('finalMission');

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
