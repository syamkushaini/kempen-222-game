import { lastElection, type World } from '../election';
import { zeros } from '../math';
import { Rng } from '../rng';
import { N_PARTIES, type SeatKind } from '../types';
import { holdingScale } from './party';
import { contests } from './actions';
import { shiftUnity } from './diplomacy';
import { pushNews, ref } from './news';
import { payVet } from './staff';
import { HOPEFUL_KINDS, type Campaign, type Hopeful, type HopefulKind, type KeySeat } from './types';

/** Invented names for would-be candidates. Proper nouns; the same in every language. */
export const HOPEFUL_NAMES = [
  'Zainal Abidin Hamzah', 'Nurul Izzati Rahim', 'Mohd Fadzli Ismail', 'Siti Hajar Yusof', 'Ahmad Faizal Noor', 'Rohana Jalil',
  'Khairul Anwar Saad', 'Norhayati Bakar', 'Lim Wei Jian', 'Tan Mei Ling', 'Ong Kah Seng', 'Chua Pei Shan',
  'Yap Chee Wai', 'Low Siew Fong', 'Kumar Subramaniam', 'Devi Ramasamy', 'Vijay Pillai', 'Kavitha Rajan',
  'Robert Ugak', 'Juliana Sinsua', 'Henry Luhat', 'Agnes Majalap', 'Awang Tengah Bujang', 'Dayang Norlia Sapawi',
];

export interface HopefulDef {
  /** What they add to the party's vote in the seat, by the kind of seat, in logit units. */
  lift: Record<SeatKind, number>;
  /** What they add to the party's turnout there. */
  turnout: number;
  /** How likely there is something in their past. */
  risk: number;
  /** What choosing them does to party unity. */
  unity: number;
}

export const HOPEFULS: Record<HopefulKind, HopefulDef> = {
  // The division chief: knows every village head, and owes most of them.
  warlord: { lift: { rural: 0.12, semi: 0.09, urban: 0.03 }, turnout: 0.04, risk: 0.45, unity: 1 },
  // A doctor, a lawyer, an engineer: respectable, and new to all this.
  professional: { lift: { rural: 0.03, semi: 0.07, urban: 0.11 }, turnout: 0, risk: 0.12, unity: 0 },
  // Famous for something else. Draws a crowd; the branch has never met them.
  celebrity: { lift: { rural: 0.07, semi: 0.07, urban: 0.07 }, turnout: 0.06, risk: 0.3, unity: -2 },
  // Trained at the party's own college: capable, vetted by years of study and by the party, and with little to hide.
  graduate: { lift: { rural: 0.07, semi: 0.09, urban: 0.09 }, turnout: 0.01, risk: 0.02, unity: 1 },
  // Has waited their turn for fifteen years and offended nobody.
  loyalist: { lift: { rural: 0.03, semi: 0.03, urban: 0.03 }, turnout: 0, risk: 0.04, unity: 1 },
};

/** How many seats the leader picks a candidate for personally. The rest are filled by the party in the usual way. */
const KEY_SEATS: Record<string, number> = { general: 8, state: 5, byelection: 1, hung: 0 };
const OPTIONS = 3;
/** Weekly chance that a candidate's past comes out once they are on the ballot. */
const EXPOSURE = 0.18;
const SCANDAL_HIT = 0.2;

/** Nomination day for candidates: the last week in which the leader can still choose. */
export const candidateDeadline = (c: Campaign) => Math.max(1, c.totalWeeks - 3);
export const canChoose = (c: Campaign) => c.phase === 'campaign' && c.week <= candidateDeadline(c);

/**
 * Picks out the seats where the candidate could decide it: the closest ones
 * the player's party is fighting. Each gets three people who want the
 * nomination.
 */
export function makeKeySeats(world: World, c: Campaign, rng: Rng): KeySeat[] {
  const me = c.player;
  const last = lastElection(world);
  const want = KEY_SEATS[world.rules.kind] ?? 0;
  const closest = world.seats
    .map((s, i) => {
      const o = last.seats[i];
      const best = Math.max(...o.votes.filter((_, p) => p !== me));
      return { id: s.id, i, gap: Math.abs(o.votes[me] - best) / Math.max(1, o.valid) };
    })
    .filter(({ i }) => contests(world, c, i, me))
    .sort((a, b) => a.gap - b.gap)
    .slice(0, want);
  const names = rng.shuffled(HOPEFUL_NAMES.map((_, n) => n));
  const graduates = c.career ? holdingScale(world, c.career, 'college') : 0;
  return closest.map(({ id }) => {
    const kinds: HopefulKind[] = rng.shuffled(HOPEFUL_KINDS.filter((k) => k !== 'graduate')).slice(0, OPTIONS);
    // A party with a college of its own has its graduates on the list, more of them the bigger the college.
    if (graduates > 0 && rng.next() < Math.min(1, graduates)) kinds[kinds.length - 1] = 'graduate';
    const options: Hopeful[] = kinds.map((kind) => ({ kind, name: names.pop() ?? 0, skeleton: rng.next() < HOPEFULS[kind].risk, vetted: false }));
    return { seat: id, options, pick: null, blown: false };
  });
}

/** What a hopeful would add in this seat. */
export function liftIn(world: World, key: KeySeat, option: number): number {
  const seat = world.seats[world.seatIndex.get(key.seat)!];
  const h = key.options[option];
  return h ? HOPEFULS[h.kind].lift[seat.kind] : 0;
}

/** Files nomination papers for a hopeful. It cannot be undone: the ballot is printed. */
export function choose(world: World, c: Campaign, seat: string, option: number): boolean {
  const key = c.team.keySeats.find((k) => k.seat === seat);
  const h = key?.options[option];
  if (!key || !h || key.pick !== null || !canChoose(c)) return false;
  key.pick = option;
  const me = c.player;
  // A candidate is there for the whole campaign, so what they bring does not fade.
  (c.drift.support.seat[seat] ??= zeros(N_PARTIES))[me] += liftIn(world, key, option);
  (c.drift.turnout.seat[seat] ??= zeros(N_PARTIES))[me] += HOPEFULS[h.kind].turnout;
  shiftUnity(c, me, HOPEFULS[h.kind].unity);
  pushNews(c, { party: me, key: 'news.candidate.named', vars: { seat: ref.seat(seat), name: HOPEFUL_NAMES[h.name], kind: `@hopeful:${h.kind}` }, tone: 'neutral' });
  return true;
}

/** Looks into a hopeful's past. Costs what vetting anyone costs. */
export function vetHopeful(world: World, c: Campaign, seat: string, option: number): boolean {
  const key = c.team.keySeats.find((k) => k.seat === seat);
  const h = key?.options[option];
  if (!h || h.vetted || !payVet(world, c)) return false;
  h.vetted = true;
  return true;
}

/** A week on the ballot: any candidate with a past may be found out, and the seat with them. */
export function candidatesWeek(c: Campaign, rng: Rng): void {
  const me = c.player;
  for (const key of c.team.keySeats) {
    if (key.pick === null || key.blown || !key.options[key.pick].skeleton || rng.next() >= EXPOSURE) continue;
    key.blown = true;
    (c.drift.support.seat[key.seat] ??= zeros(N_PARTIES))[me] -= SCANDAL_HIT;
    shiftUnity(c, me, -2);
    pushNews(c, { party: me, key: 'news.candidate.scandal', vars: { seat: ref.seat(key.seat), name: HOPEFUL_NAMES[key.options[key.pick].name] }, tone: 'bad' });
  }
}
