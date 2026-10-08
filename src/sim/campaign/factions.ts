import type { World } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { BLOC_IDS, PARTY_IDS } from '../types';
import { scaled } from './actions';
import { shiftUnity, addScene } from './diplomacy';
import { endCareer } from './legacy';
import { pushNews } from './news';
import { alignment } from './policy';
import { ISSUE_IDS, type Campaign, type Career, type Scene } from './types';

// A party is not one will. Three factions hold the leader to account (the loyalists who owe them everything, the
// reformers who want the party to be what it says, the veterans who remember how it used to win), and three wings
// (youth, women, elders) say what the party sounds like to people who are not in it. Each has a mood towards the
// leader, which moves with what the leader does; and every three years the party meets, and the leader may be
// challenged for it. A leader who loses is out.

export const FACTION_IDS = ['loyalists', 'reformers', 'veterans'] as const;
export type FactionId = (typeof FACTION_IDS)[number];
export const WING_IDS = ['youth', 'women', 'elders'] as const;
export type WingId = (typeof WING_IDS)[number];

/** Points on the target its mood drifts towards, for each safe seat given to a faction's figure (see safeseat.ts). */
export const SAFE_TARGET = 4;

/** How the party's members divide among the factions, as shares of the roll, by party. */
const SIZES: Record<string, [number, number, number]> = {
  ps: [0.3, 0.45, 0.25],
  bp: [0.35, 0.2, 0.45],
  pt: [0.5, 0.15, 0.35],
};
const SIZES_OTHER: [number, number, number] = [0.45, 0.25, 0.3];

/** Invented names for the heads of factions and wings. Proper nouns; the same in every language. */
export const CHIEF_NAMES = [
  'Hajah Rosmah Idris', 'Dato’ Kamal Arifin', 'Tan Sri Zakaria Mohd', 'Puan Salmah Razak', 'Ir. Faizal Hamdan', 'Dr. Nurul Aini',
  'Dato’ Lim Boon Teck', 'Puan Rohani Samad', 'Tuan Haji Sulaiman', 'Cik Aminah Yusuf', 'Dr. Ravindran Pillai', 'Datuk Awang Jamil',
];

export interface Factions {
  /** [faction]: share of the roll. */
  size: number[];
  /** [faction]: how they feel about the leader, 0 to 100. */
  mood: number[];
  /** [wing]: how it feels about the leader, 0 to 100. */
  wing: number[];
  /** Index into CHIEF_NAMES for each of the six, factions first. */
  chief: number[];
}

/** The party's factions and wings, made the first time they are looked at. */
export function factionsOf(c: Campaign): Factions {
  const k = c.career!;
  if (!k.factions) {
    const sizes = SIZES[PARTY_IDS[c.player]] ?? SIZES_OTHER;
    const rng = new Rng((c.seed ^ 0xfac7) >>> 0);
    const names = rng.shuffled(CHIEF_NAMES.map((_, n) => n));
    k.factions = { size: [...sizes], mood: [62, 58, 56], wing: [58, 56, 60], chief: names.slice(0, 6) };
  }
  return k.factions;
}

/** Where a faction's or wing's mood is being pulled, from what the leader has done. */
function targets(c: Campaign): { faction: number[]; wing: number[] } {
  const k = c.career!;
  const pc = c.parties[c.player]!;
  const governing = k.government.pm === c.player || k.government.partners.includes(c.player);
  const align = (b: (typeof BLOC_IDS)[number]) => alignment(k.stances[c.player], BLOC_IDS.indexOf(b));
  const stance = (id: (typeof ISSUE_IDS)[number]) => k.stances[c.player][ISSUE_IDS.indexOf(id)];
  const trust = governing ? k.government.trust : 60;
  const gift = FACTION_IDS.map((_, i) => SAFE_TARGET * Object.values(k.safe ?? {}).filter((f) => f === i).length);
  return {
    faction: [
      // The loyalists back whoever holds the party together and holds office.
      clamp(35 + 0.45 * pc.unity + (governing ? 12 : 0), 0, 100),
      // The reformers want honesty and reform, and watch how much of both there is.
      clamp(10 + 0.45 * k.credibility + 0.25 * trust + 6 * (stance('reform') + stance('graft')) / 2, 0, 100),
      // The veterans want money, a party they recognise, and no nonsense about reform.
      clamp(48 + 8 * k.orders.donors + (k.assets > 0 ? 8 : 0) - 5 * stance('reform') + 0.12 * (pc.unity - 50), 0, 100),
    ].map((m, i) => clamp(m + gift[i], 0, 100)),
    wing: [
      clamp(50 + 28 * align('undi18') + 12 * align('gig'), 0, 100),
      clamp(50 + 26 * align('civil') + 16 * align('urban_b40'), 0, 100),
      clamp(50 + 28 * align('seniors') + 12 * align('heartland'), 0, 100),
    ],
  };
}

/** How the party's members, taken as a whole, feel about the leader: the factions count three parts in four, the wings one. */
export function backing(c: Campaign): number {
  const f = factionsOf(c);
  const total = f.size.reduce((a, b) => a + b, 0);
  const fac = f.size.reduce((a, s, i) => a + s * f.mood[i], 0) / total;
  const wing = f.wing.reduce((a, b) => a + b, 0) / f.wing.length;
  return Math.round(0.75 * fac + 0.25 * wing);
}

/** A week of the factions and wings drifting towards what the leader has earned. */
export function factionsWeek(c: Campaign): void {
  const f = factionsOf(c);
  const t = targets(c);
  f.mood = f.mood.map((m, i) => clamp(m + (t.faction[i] - m) * 0.02, 0, 100));
  f.wing = f.wing.map((m, i) => clamp(m + (t.wing[i] - m) * 0.02, 0, 100));
}

/** How often the party meets to choose its leader, in weeks of a term. */
export const PARTY_POLL_EVERY = 156;

/** The chance of a challenge at the party's election: nothing for a leader the party backs, and certain below 10. */
export const challengeChance = (c: Campaign) => clamp((60 - backing(c)) / 50, 0, 1);

/** The week of the term the party meets: held at most once in each term, three years in. */
export function partyPollWeek(c: Campaign): boolean {
  const k = c.career;
  return !!k && c.phase === 'term' && c.inbox.length === 0 && k.week >= PARTY_POLL_EVERY && !k.flags.includes(`partyPoll${k.term}`);
}

/** The party's election comes round. A leader the party backs is returned unopposed; otherwise there is a challenge to answer. */
export function partyPoll(c: Campaign, rng: Rng): void {
  const k = c.career!;
  k.flags.push(`partyPoll${k.term}`);
  if (rng.next() >= challengeChance(c)) {
    shiftUnity(c, c.player, 3);
    pushNews(c, { party: c.player, key: 'news.partyPoll.unopposed', vars: { pct: backing(c) }, tone: 'good' });
    return;
  }
  // The faction most set against the leader fields the challenger.
  const f = factionsOf(c);
  const worst = f.mood.indexOf(Math.min(...f.mood));
  addScene(c, { kind: 'partyPoll', from: null, event: FACTION_IDS[worst] });
}

/** What each answer to a challenge does to the leader's chances, in points of backing, and what it costs. */
export const POLL_ANSWERS = [
  { bonus: 8, money: 80_000 },
  { bonus: 5, money: 0 },
  { bonus: 0, money: 0 },
] as const;

/** The chance the leader is returned, given how the party feels and what they did about it. */
export function pollOdds(c: Campaign, choice: number): number {
  const a = POLL_ANSWERS[choice] ?? POLL_ANSWERS[2];
  return clamp(0.12 + 0.0085 * (backing(c) + a.bonus), 0.05, 0.97);
}

/** The leader answers a challenge at the party's election: delegates are courted, a deal is made, or the record stands. The party decides. */
export function resolvePartyPoll(world: World, c: Campaign, scene: Scene, choice: number): void {
  const k = c.career;
  const pc = c.parties[c.player];
  if (!k || !pc || !POLL_ANSWERS[choice]) return;
  const f = factionsOf(c);
  const challenger = FACTION_IDS.indexOf(scene.event as FactionId);
  const answer = POLL_ANSWERS[choice];
  const price = scaled(world, answer.money);
  if (price > pc.funds) choice = 2;
  else pc.funds -= price;
  const odds = pollOdds(c, choice);
  if (choice === 1 && challenger >= 0) {
    // A deal: the challenger's faction is brought in, and the rest do not like to see it.
    f.mood = f.mood.map((m, i) => clamp(i === challenger ? m + 15 : m - 3, 0, 100));
    k.credibility = clamp(k.credibility - 2, 0, 100);
  }
  const rng = new Rng((c.rng ^ 0xc4a1) + k.week);
  const won = rng.next() < odds;
  c.rng = rng.state;
  if (won) {
    shiftUnity(c, c.player, 5);
    if (challenger >= 0) f.mood[challenger] = clamp(f.mood[challenger] - 10, 0, 100);
    pushNews(c, { party: c.player, key: 'news.partyPoll.won', vars: { faction: `@faction:${FACTION_IDS[Math.max(0, challenger)]}` }, tone: 'good' });
  } else {
    pushNews(c, { party: c.player, key: 'news.partyPoll.lost', vars: {}, tone: 'bad' });
    endCareer(c, 'ousted');
  }
}

export type { Career };
