import type { World } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import type { RegionId } from '../types';
import { shiftUnity } from './diplomacy';
import { pushNews, ref } from './news';
import type { Campaign, ChiefPerson } from './types';

// The player's chiefs are people. Each has a name, a skill that decides how
// much their rallies draw, and a loyalty that the leader keeps by turning up
// in their region and loses by staying away. A chief left to cool may be
// talked round by a rival and take the branches with them, and a few have
// something in their past that a campaign can bring out. Rivals' chiefs stay
// nameless: only the player has to keep theirs.

/** Invented names for chiefs and the deputies who step up after them. Proper nouns; the same in every language. */
export const CHIEF_NAMES = [
  'Haji Roslan Bakar', 'Datin Noraini Latif', 'Lim Teck Hong', 'Datuk Azman Yusof', 'Che Zainab Ismail', 'Ustaz Fauzi Daud',
  'Tengku Shahrul Idris', 'Kamala Devi Pillai', 'Zulkifli Hamid', 'Syed Farid Alwi', 'Rohani Mat Zin', 'Tan Kok Leong',
  'Datuk Mazlan Othman', 'Awang Bakri Tuah', 'Juliana Gundohing', 'Stephen Anak Rentap', 'Hasnah Abu Samah', 'Ravi Chandran Nair',
  'Wan Rosdi Wan Musa', 'Ng Siew Ling', 'Datuk Ibrahim Salleh', 'Faizah Kamarudin', 'Amirul Hakimi', 'Chong Wei Jian',
  'Salmah Jusoh', 'Mohd Nazri Pawi', 'Anthony Lajim', 'Dayang Rokiah', 'Kalaivani Suppiah', 'Hafiz Zainal',
  'Normah Sidek', 'Badrul Hisham Aziz',
];

export const LOYALTY = { restless: 30, mayGo: 20 };
/** Weekly chance that a chief's hidden past comes out in the glare of a campaign. */
const EXPOSURE = 0.06;
/** What a chief who crosses over takes from the party's branches in the region. */
const BRANCHES_LOST = 15;

/** A stable number from a region's name, so the same game always meets the same chiefs. */
const hash = (s: string) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };

function fresh(world: World, c: Campaign, st: RegionId, generation: number): ChiefPerson {
  const rng = new Rng((c.seed ^ hash(st) ^ (generation * 0x9e3779b1)) >>> 0);
  // Names go round the regions in order, starting somewhere different in each game, so no two chiefs share one.
  const name = (Math.max(0, world.states.indexOf(st)) + (c.seed >>> 0) + generation * world.states.length) % CHIEF_NAMES.length;
  // A deputy who steps up is steadier than whoever left, and less able.
  if (generation > 0) return { name, skill: 2, loyalty: 60, skeleton: false, generation };
  return { name, skill: 2 + rng.int(4), loyalty: 50 + rng.int(31), skeleton: rng.next() < 0.2, generation };
}

/** The party's chief in a region: the same person every time, made up when first asked for. */
export function chiefOf(world: World, c: Campaign, st: RegionId): ChiefPerson {
  const all = (c.team.chiefs ??= {});
  return (all[st] ??= fresh(world, c, st, 0));
}

/** The same person, for showing: nothing is written down, so it can be asked while drawing the screen. */
export const chiefView = (world: World, c: Campaign, st: RegionId): ChiefPerson => c.team.chiefs?.[st] ?? fresh(world, c, st, 0);

/** What a chief's skill does to the crowd at the rallies they run: a fifth either way of an ordinary chief's. */
export function chiefHand(world: World, c: Campaign, p: number, st: RegionId | null | undefined): number {
  if (p !== c.player || !st) return 1;
  return 1 + 0.1 * (chiefView(world, c, st).skill - 3);
}

export type ChiefMood = 'loyal' | 'cooling' | 'restless';
export const chiefMood = (person: ChiefPerson): ChiefMood => (person.loyalty < LOYALTY.restless ? 'restless' : person.loyalty < 50 ? 'cooling' : 'loyal');

/** The chief is gone: the region has nobody in charge until the leader appoints the deputy who steps up. */
function replace(world: World, c: Campaign, st: RegionId): void {
  const pc = c.parties[c.player]!;
  const was = chiefOf(world, c, st);
  delete pc.chiefs[st];
  c.team.chiefs![st] = fresh(world, c, st, was.generation + 1);
}

/**
 * The chiefs' week, for those the player has put in charge. A chief whose region the leader visited warms to them;
 * one left alone cools, faster in a party that is coming apart. A restless chief says so once, and below that may
 * cross to whoever is strongest there. A past that was hidden may come out.
 */
export function chiefsWeek(world: World, c: Campaign, rng: Rng): void {
  const pc = c.parties[c.player];
  if (!pc || c.phase !== 'campaign' || world.states.length <= 1) return;
  const visited = new Set(pc.visits.map((id) => world.seats[world.seatIndex.get(id)!]?.state));
  visited.add(pc.location);
  for (const st of Object.keys(pc.chiefs) as RegionId[]) {
    const person = chiefOf(world, c, st);
    const vars = { name: CHIEF_NAMES[person.name], state: ref.state(st) };
    const was = person.loyalty;
    person.loyalty = clamp(was + (visited.has(st) ? 4 : -2) + (pc.chiefs[st] === 3 ? 1 : 0) - (pc.unity < 40 ? 3 : 0), 0, 100);

    if (person.skeleton && rng.next() < EXPOSURE) {
      replace(world, c, st);
      shiftUnity(c, c.player, -1);
      const rows = (c.dyn.support.state[st] ??= Array.from({ length: c.dyn.support.nat.length }, () => new Array<number>(c.parties.length).fill(0)));
      for (const row of rows) row[c.player] -= 0.03;
      pushNews(c, { party: c.player, key: 'news.chief.exposed', vars, tone: 'bad' });
      continue;
    }
    if (person.loyalty < LOYALTY.mayGo && rng.next() < (LOYALTY.mayGo + 10 - person.loyalty) / 100) {
      // They go to whoever else is strongest on the ground there, and take people with them.
      const i = world.states.indexOf(st);
      const to = c.parties.map((q, p) => ({ p, m: q && p !== c.player ? q.machinery[i] : -1 })).sort((a, b) => b.m - a.m)[0];
      replace(world, c, st);
      pc.machinery[i] = Math.max(pc.machinery[i] > 0 ? 10 : 0, pc.machinery[i] - BRANCHES_LOST);
      if (to && to.m >= 0) c.parties[to.p]!.machinery[i] = Math.min(100, to.m + BRANCHES_LOST / 2);
      shiftUnity(c, c.player, -2);
      pushNews(c, { party: c.player, key: 'news.chief.defected', vars: { ...vars, party: to && to.m >= 0 ? ref.party(to.p) : ref.party(c.player) }, tone: 'bad' });
      continue;
    }
    if (was >= LOYALTY.restless && person.loyalty < LOYALTY.restless) pushNews(c, { party: c.player, key: 'news.chief.restless', vars, tone: 'bad' });
  }
}
