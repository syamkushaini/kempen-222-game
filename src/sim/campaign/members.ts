import type { World } from '../election';
import { clamp } from '../math';
import type { Rng } from '../rng';
import { BLOC_IDS, PARTY_IDS, type BlocId, type PartyId } from '../types';
import { inGovernment } from './career';
import { holderOf } from './contests';
import { shiftUnity } from './diplomacy';
import type { Effect } from './events';
import { pushNews } from './news';
import type { Campaign } from './types';

// The larger parties are coalitions, and a coalition has members. Each of the
// player's holds a share of its seats and answers to its own voters: please
// those voters and the member is content; slight them and it sulks; leave it
// sulking and it walks out of the coalition between elections and takes its
// MPs with it until the country next votes. The largest member is the core of
// the party and cannot leave it: left to sulk, it turns on the leader. Party unity is still the measure
// of the whole; the members are where it comes from. Rivals' members are not
// followed, and a party that is a single party has none.

export interface Member {
  /** An invented name: a proper noun, the same in every language. */
  name: string;
  /** The voters it answers to. */
  cares: BlocId[];
  /** Its share of the coalition's seats. */
  share: number;
}

export const MEMBERS: Partial<Record<PartyId, Member[]>> = {
  ps: [
    { name: 'Parti Reformasi Rakyat', cares: ['urban_b40', 'gig', 'undi18'], share: 0.45 },
    { name: 'Parti Suara Kota', cares: ['urban_lib', 'm40', 'smallbiz'], share: 0.35 },
    { name: 'Parti Amanah Desa', cares: ['heartland', 'civil'], share: 0.2 },
  ],
  bp: [
    { name: 'Parti Pusaka Melayu', cares: ['heartland', 'felda', 'civil'], share: 0.6 },
    { name: 'Persatuan Peniaga Bersatu', cares: ['smallbiz', 'm40'], share: 0.25 },
    { name: 'Kongres Pekerja Ladang', cares: ['agri', 'seniors'], share: 0.15 },
  ],
  pt: [
    { name: 'Parti Teguh Islam', cares: ['heartland', 'seniors'], share: 0.5 },
    { name: 'Parti Peribumi Teguh', cares: ['felda', 'agri', 'civil'], share: 0.4 },
    { name: 'Gerakan Anak Muda Teguh', cares: ['undi18', 'gig'], share: 0.1 },
  ],
  gbk: [
    { name: 'Parti Pesaka Kenyalang', cares: ['borneo_native', 'civil'], share: 0.55 },
    { name: 'Parti Rakyat Bandar Sarawak', cares: ['borneo_urban', 'smallbiz'], share: 0.25 },
    { name: 'Parti Hulu Bersatu', cares: ['borneo_native', 'agri'], share: 0.2 },
  ],
  gbs: [
    { name: 'Parti Bayu Rakyat', cares: ['borneo_native', 'civil'], share: 0.5 },
    { name: 'Parti Bersatu Pedalaman', cares: ['borneo_native', 'agri'], share: 0.3 },
    { name: 'Parti Maju Sabah', cares: ['borneo_urban', 'smallbiz'], share: 0.2 },
  ],
};

/** Where a member's mood starts and drifts back to; below the first mark it is restless, below the second it may go. */
export const MEMBER = { start: 60, restless: 35, mayGo: 20 };
/** A member that has left the coalition, until the next election. */
const GONE = -1;

export type MemberMood = 'content' | 'restless' | 'mutinous' | 'gone';
export const moodWord = (n: number): MemberMood => (n === GONE ? 'gone' : n < MEMBER.mayGo ? 'mutinous' : n < MEMBER.restless ? 'restless' : 'content');

/** The members of the player's party, or nothing for a single party or one the player founded. */
export function membersOf(c: Campaign): Member[] | null {
  if (!c.career || c.career.founded) return null;
  return MEMBERS[PARTY_IDS[c.player]] ?? null;
}

/** Each member's mood, in order: as it stands, or as it starts. */
export function memberMoods(c: Campaign): number[] | null {
  const members = membersOf(c);
  return members ? c.career!.members ?? members.map(() => MEMBER.start) : null;
}

function moods(c: Campaign, members: Member[]): number[] {
  return (c.career!.members ??= members.map(() => MEMBER.start));
}

/** How the party stands with a member's own voters: the swing among them since the election, averaged. */
export function votersOf(c: Campaign, m: Member): number {
  const k = c.career!;
  return m.cares.reduce((a, b) => a + (k.mood[BLOC_IDS.indexOf(b)]?.[c.player] ?? 0), 0) / m.cares.length;
}

/** Where a member's mood is heading: 60 with its voters where they were at the election, restless once they are 10 points down, ready to go at 16. */
export const memberTarget = (c: Campaign, m: Member): number => clamp(MEMBER.start + 250 * votersOf(c, m), 0, 100);

/**
 * What the members make, at once, of a decision that shakes the party: a row that costs unity is felt by all of them.
 * What a decision does to a member's own voters reaches it more slowly, week by week, through those voters.
 */
export function membersFeel(c: Campaign, effects: Effect[]): void {
  const members = membersOf(c);
  if (!members || c.phase !== 'term') return;
  const shaken = effects.reduce((a, e) => a + (e.t === 'unity' ? e.n * 0.6 : 0), 0);
  if (!shaken) return;
  const now = moods(c, members);
  now.forEach((n, i) => { if (n !== GONE) now[i] = clamp(n + shaken, 0, 100); });
}

/**
 * The members' week between elections: each moves a twentieth of the way towards where its own voters stand with the
 * party, a member that has turned restless says so, and one left mutinous may walk out with its MPs, who then sit
 * apart until the next election.
 */
export function membersWeek(world: World, c: Campaign, rng: Rng): void {
  const members = membersOf(c);
  const k = c.career;
  if (!members || !k || c.phase !== 'term') return;
  const now = moods(c, members);
  const me = c.player;
  members.forEach((m, i) => {
    const was = now[i];
    if (was === GONE) return;
    // The largest member is the party's core: it cannot walk out of itself. Left mutinous, it turns on the leader instead.
    if (i === 0 && was < MEMBER.mayGo) shiftUnity(c, me, -1);
    // A walk-out is weighed before the week's cooling, on the mood the member has been left in.
    if (i > 0 && was < MEMBER.mayGo && rng.next() < (MEMBER.mayGo + 5 - was) / 250) {
      const mine = world.seats.filter((s) => holderOf(world, c, s.id) === me);
      const reach = (blocs: number[]) => m.cares.reduce((a, b) => a + (blocs[BLOC_IDS.indexOf(b)] ?? 0), 0);
      const going = [...mine].sort((a, b) => reach(b.blocs) - reach(a.blocs)).slice(0, Math.max(1, Math.round(mine.length * m.share)));
      const oth = PARTY_IDS.indexOf('oth');
      for (const seat of going) k.house[seat.id] = oth;
      if (inGovernment(c, me)) {
        k.government.seats -= going.length;
        k.government.stability = clamp(k.government.stability - 6, 5, 95);
      }
      shiftUnity(c, me, -8);
      now[i] = GONE;
      pushNews(c, { party: me, key: 'news.member.left', vars: { member: m.name, n: going.length }, tone: 'bad' });
      return;
    }
    now[i] = clamp(was + (memberTarget(c, m) - was) * 0.05, 0, 100);
    if (was >= MEMBER.restless && now[i] < MEMBER.restless) pushNews(c, { party: me, key: 'news.member.restless', vars: { member: m.name }, tone: 'bad' });
  });
}
