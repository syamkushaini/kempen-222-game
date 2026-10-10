import { lastElection, type World } from '../election';
import { zeros } from '../math';
import { Rng } from '../rng';
import { BLOC_IDS, N_PARTIES, type BlocId, type SeatKind } from '../types';
import { holdingScale } from './party';
import { contests, heldOf } from './actions';
import { shiftUnity } from './diplomacy';
import { pushNews, ref } from './news';
import { retireIncumbent } from './tenure';
import { payVet } from './staff';
import { chiefView } from './chiefs';
import { HOPEFUL_KINDS, type Campaign, type Hopeful, type HopefulKind, type KeySeat } from './types';
import type { RegionId } from '../types';

/** Invented names for would-be candidates. Proper nouns; the same in every language. */
export const HOPEFUL_NAMES = [
  'Zainal Abidin Hamzah', 'Nurul Izzati Rahim', 'Mohd Fadzli Ismail', 'Siti Hajar Yusof', 'Ahmad Faizal Noor', 'Rohana Jalil',
  'Khairul Anwar Saad', 'Norhayati Bakar', 'Lim Wei Jian', 'Tan Mei Ling', 'Ong Kah Seng', 'Chua Pei Shan',
  'Yap Chee Wai', 'Low Siew Fong', 'Kumar Subramaniam', 'Devi Ramasamy', 'Vijay Pillai', 'Kavitha Rajan',
  'Robert Ugak', 'Juliana Sinsua', 'Henry Luhat', 'Agnes Majalap', 'Awang Tengah Bujang', 'Dayang Norlia Sapawi',
];

export type Ethnic = 'malay' | 'chinese' | 'indian' | 'bumi';
export interface HopefulTraits { woman: boolean; young: boolean; ethnic: Ethnic }

/** Who the names are, in the order of HOPEFUL_NAMES. */
export const HOPEFUL_TRAITS: readonly HopefulTraits[] = [
  { woman: false, young: false, ethnic: 'malay' }, { woman: true, young: true, ethnic: 'malay' }, { woman: false, young: false, ethnic: 'malay' },
  { woman: true, young: false, ethnic: 'malay' }, { woman: false, young: false, ethnic: 'malay' }, { woman: true, young: false, ethnic: 'malay' },
  { woman: false, young: true, ethnic: 'malay' }, { woman: true, young: false, ethnic: 'malay' }, { woman: false, young: false, ethnic: 'chinese' },
  { woman: true, young: false, ethnic: 'chinese' }, { woman: false, young: false, ethnic: 'chinese' }, { woman: true, young: true, ethnic: 'chinese' },
  { woman: false, young: false, ethnic: 'chinese' }, { woman: true, young: false, ethnic: 'chinese' }, { woman: false, young: false, ethnic: 'indian' },
  { woman: true, young: false, ethnic: 'indian' }, { woman: false, young: true, ethnic: 'indian' }, { woman: true, young: false, ethnic: 'indian' },
  { woman: false, young: false, ethnic: 'bumi' }, { woman: true, young: true, ethnic: 'bumi' }, { woman: false, young: false, ethnic: 'bumi' },
  { woman: true, young: false, ethnic: 'bumi' }, { woman: false, young: false, ethnic: 'bumi' }, { woman: true, young: false, ethnic: 'bumi' },
];

/**
 * What a candidate's own background adds in a seat that suits it, in logit units: a woman where the seat is of the
 * salaried and the town, a young candidate where there are many first-time voters and gig workers, a candidate of the
 * minorities where the seat is a city's, and a Borneo native where the seat is of Borneo. A bonus only; nothing is taken away.
 */
export function diversityBonus(seat: { blocs: number[]; urbanity: number }, name: number): number {
  const t = HOPEFUL_TRAITS[name];
  if (!t) return 0;
  const share = (...ids: BlocId[]) => ids.reduce((a, id) => a + (seat.blocs[BLOC_IDS.indexOf(id)] ?? 0), 0);
  let bonus = 0;
  if (t.woman) bonus += 0.015 + 0.1 * Math.min(0.6, share('urban_lib', 'm40', 'civil', 'urban_b40'));
  if (t.young) bonus += 0.01 + 0.5 * Math.min(0.2, share('undi18') + 0.5 * share('gig'));
  if (t.ethnic === 'chinese' || t.ethnic === 'indian') bonus += 0.07 * seat.urbanity;
  if (t.ethnic === 'bumi') bonus += 0.1 * Math.min(0.8, share('borneo_native', 'borneo_urban'));
  return Math.round(bonus * 1000) / 1000;
}

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
const KEY_SEATS: Record<string, number> = { general: 12, state: 7, byelection: 1, hung: 0 };
const OPTIONS = 4;
/** The chance that one of a seat's hopefuls is a graduate (capable, with little to hide) even in a party with no college of its own. */
const GRADUATE_CHANCE = 0.4;
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
  const graduates = Math.max(GRADUATE_CHANCE, c.career ? holdingScale(world, c.career, 'college') : 0);
  return closest.map(({ id }) => {
    const kinds: HopefulKind[] = rng.shuffled(HOPEFUL_KINDS.filter((k) => k !== 'graduate')).slice(0, OPTIONS);
    // A party with a college of its own has more of its graduates on the list, the bigger the college; any party has some.
    if (rng.next() < Math.min(1, graduates)) kinds[kinds.length - 1] = 'graduate';
    const options: Hopeful[] = kinds.map((kind) => ({ kind, name: names.pop() ?? 0, skeleton: rng.next() < HOPEFULS[kind].risk, vetted: false }));
    return { seat: id, options, pick: null, blown: false };
  });
}

/** What a hopeful would add in this seat. */
export function liftIn(world: World, key: KeySeat, option: number): number {
  const seat = world.seats[world.seatIndex.get(key.seat)!];
  const h = key.options[option];
  return h ? HOPEFULS[h.kind].lift[seat.kind] + diversityBonus(seat, h.name) : 0;
}

/** Files nomination papers for a hopeful. It cannot be undone: the ballot is printed. */
export function choose(world: World, c: Campaign, seat: string, option: number): boolean {
  const key = c.team.keySeats.find((k) => k.seat === seat);
  const h = key?.options[option];
  if (!key || !h || key.pick !== null || !canChoose(c)) return false;
  key.pick = option;
  const me = c.player;
  // The party's own choice makes way for the leader's, and with it what the state chief's pick had brought. If the seat has a member of long standing, half their personal vote goes with them.
  if (c.team.defaults?.[seat]) {
    const at = world.seats[world.seatIndex.get(seat) ?? -1];
    if (at) (heldOf(c).support.seat[seat] ??= zeros(N_PARTIES))[me] -= DEFAULT_LIFT * pickQuality(world, c, at.state);
  }
  delete c.team.defaults?.[seat];
  retireIncumbent(c, seat);
  // A candidate is there for the whole campaign, so what they bring does not fade; it is theirs, and goes with them.
  (heldOf(c).support.seat[seat] ??= zeros(N_PARTIES))[me] += liftIn(world, key, option);
  (heldOf(c).turnout.seat[seat] ??= zeros(N_PARTIES))[me] += HOPEFULS[h.kind].turnout;
  shiftUnity(c, me, HOPEFULS[h.kind].unity);
  pushNews(c, { party: me, key: 'news.candidate.named', vars: { seat: ref.seat(seat), name: HOPEFUL_NAMES[h.name], kind: `@hopeful:${h.kind}` }, tone: 'neutral' });
  return true;
}

// ---------- every seat has a candidate ----------

/** The part of a hopeful's usual chance of a past that applies to the party's own choice in a seat the leader leaves alone. */
const DEFAULT_RISK = 0.15;
/** What it costs the leader's week to look at the hopefuls for a seat of their own choosing, in days. */
export const CHOOSE_DAYS = 0.5;

/** What a state chief's pick brings to a seat at best, in logit units (a good pick adds about a point of vote). */
export const DEFAULT_LIFT = 0.05;

/**
 * How well the party's choice in a seat is made, from 0 to 1: it is the state chief who makes it, and a capable chief with strong
 * branches knows who in the division is worth putting up. Half the chief's skill and half the party's branches in the state.
 */
export function pickQuality(world: World, c: Campaign, st: RegionId): number {
  const person = chiefView(world, c, st);
  const at = world.states.indexOf(st);
  const branches = at >= 0 ? c.parties[c.player]?.machinery[at] ?? 0 : 0;
  return Math.max(0, Math.min(1, 0.5 * ((person.skill - 1) / 4) + 0.5 * (branches / 100)));
}

/** A kind of hopeful drawn by weight, where a better pick leans to the capable and away from the risky. */
function drawKind(rng: Rng, q: number): HopefulKind {
  const weights: Record<HopefulKind, number> = { warlord: 1 - 0.5 * q, professional: 1 + 2 * q, celebrity: 1 - 0.6 * q, loyalist: 1 + q, graduate: 1.2 * q };
  const kinds = HOPEFUL_KINDS;
  const total = kinds.reduce((a, k) => a + weights[k], 0);
  let x = rng.next() * total;
  for (const k of kinds) { x -= weights[k]; if (x <= 0) return k; }
  return kinds[0];
}

/** The party's own choice of candidate in every seat it stands in that the leader has not been asked to choose for: made by the seat's state chief. */
export function makeDefaults(world: World, c: Campaign, rng: Rng): Record<string, Hopeful> {
  const me = c.player;
  const out: Record<string, Hopeful> = {};
  world.seats.forEach((seat, i) => {
    if (!contests(world, c, i, me) || c.team.keySeats.some((k) => k.seat === seat.id)) return;
    const q = pickQuality(world, c, seat.state);
    const kind = drawKind(rng, q);
    out[seat.id] = { kind, name: rng.int(HOPEFUL_NAMES.length), skeleton: rng.next() < HOPEFULS[kind].risk * DEFAULT_RISK * (1.4 - q), vetted: false };
  });
  return out;
}

/** What each state's chief has made of the party's own choices: how well they pick, and how many of the seats are in the hands of the capable. */
export interface ChiefPicks { state: RegionId; quality: number; seats: number; able: number; risky: number }
export function chiefPicks(world: World, c: Campaign): ChiefPicks[] {
  const by = new Map<RegionId, ChiefPicks>();
  for (const [seatId, h] of Object.entries(c.team.defaults ?? {})) {
    const seat = world.seats[world.seatIndex.get(seatId) ?? -1];
    if (!seat) continue;
    const row = by.get(seat.state) ?? { state: seat.state, quality: pickQuality(world, c, seat.state), seats: 0, able: 0, risky: 0 };
    row.seats++;
    if (h.kind === 'graduate' || h.kind === 'professional' || h.kind === 'loyalist') row.able++;
    if (h.skeleton) row.risky++;
    by.set(seat.state, row);
  }
  return [...by.values()].sort((a, b) => b.seats - a.seats);
}

/** The pick of the state's chief brings a little to the seat for the whole campaign, more from a better chief. Done once, as the campaign opens. */
export function applyDefaultLifts(world: World, c: Campaign): void {
  const me = c.player;
  for (const seatId of Object.keys(c.team.defaults ?? {})) {
    const seat = world.seats[world.seatIndex.get(seatId) ?? -1];
    if (!seat) continue;
    const lift = DEFAULT_LIFT * pickQuality(world, c, seat.state);
    if (lift > 0) (heldOf(c).support.seat[seatId] ??= zeros(N_PARTIES))[me] += lift;
  }
}

// ---------- the best candidate, chosen for the leader ----------

/** How much a hopeful is worth in a seat to the leader who must choose: what they add, less what a past may cost. A past looked into is known. */
export function hopefulScore(world: World, key: KeySeat, option: number): number {
  const h = key.options[option];
  if (!h) return -Infinity;
  const def = HOPEFULS[h.kind];
  const risk = h.vetted ? (h.skeleton ? 1 : 0) : def.risk;
  return liftIn(world, key, option) + 0.5 * def.turnout + 0.004 * def.unity - 0.12 * risk;
}

/** Chooses the best hopeful in every seat the leader has not yet chosen for. Returns how many were chosen. */
export function autoChoose(world: World, c: Campaign): number {
  if (!canChoose(c)) return 0;
  let n = 0;
  for (const key of c.team.keySeats) {
    if (key.pick !== null) continue;
    let best = 0;
    key.options.forEach((_, i) => { if (hopefulScore(world, key, i) > hopefulScore(world, key, best)) best = i; });
    if (choose(world, c, key.seat, best)) n++;
  }
  return n;
}

/** Whether the leader can look at the hopefuls for a seat, and choose: before nomination day, in a seat that has only the party's own choice, with half a day to spare. */
export function canOpen(world: World, c: Campaign, seat: string): boolean {
  const pc = c.parties[c.player];
  const i = world.seatIndex.get(seat);
  return !!pc && i !== undefined && canChoose(c) && !!c.team.defaults?.[seat] && contests(world, c, i, c.player) && pc.days >= CHOOSE_DAYS;
}

/** Opens a seat to the leader's choice: three hopefuls come forward, as they do in the seats that matter most. Costs half a day. */
export function openSeat(world: World, c: Campaign, seat: string): boolean {
  if (!canOpen(world, c, seat)) return false;
  const pc = c.parties[c.player]!;
  pc.days -= CHOOSE_DAYS;
  const rng = new Rng((c.seed ^ 0x0c4e1) + world.seatIndex.get(seat)! * 31 + (c.career?.term ?? 0));
  const graduates = Math.max(GRADUATE_CHANCE, c.career ? holdingScale(world, c.career, 'college') : 0);
  const kinds: HopefulKind[] = rng.shuffled(HOPEFUL_KINDS.filter((k) => k !== 'graduate')).slice(0, OPTIONS);
  if (rng.next() < Math.min(1, graduates)) kinds[kinds.length - 1] = 'graduate';
  const options: Hopeful[] = kinds.map((kind) => ({ kind, name: rng.int(HOPEFUL_NAMES.length), skeleton: rng.next() < HOPEFULS[kind].risk, vetted: false }));
  c.team.keySeats.push({ seat, options, pick: null, blown: false });
  return true;
}

// ---------- the leader stands too ----------

/** What a leader who stands in a seat adds there, before their own charm: a leader on the ballot is a draw. */
export const LEADER_LIFT = 0.08;
/** Charm adds this much more for each point above ordinary. */
export const LEADER_CHARM = 0.03;

/** Whether the leader can put themselves up in a seat: before nomination day, once, in a seat the party stands in. */
export function canStand(world: World, c: Campaign, seat: string): boolean {
  const i = world.seatIndex.get(seat);
  return i !== undefined && canChoose(c) && c.team.leaderSeat === undefined && contests(world, c, i, c.player);
}

/** The leader puts themselves up in a seat. If the party's candidate there was already chosen, they stand down for the leader. */
export function standLeader(world: World, c: Campaign, seat: string): boolean {
  if (!canStand(world, c, seat)) return false;
  c.team.leaderSeat = seat;
  const me = c.player;
  (heldOf(c).support.seat[seat] ??= zeros(N_PARTIES))[me] += LEADER_LIFT + LEADER_CHARM * (c.team.leader.stats[0] - 3);
  pushNews(c, { party: me, key: 'news.leader.stands', vars: { seat: ref.seat(seat) }, tone: 'neutral' });
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
  // The party's own choices have pasts too, and some come out; the leader hears of them together.
  const outed: string[] = [];
  for (const [seat, h] of Object.entries(c.team.defaults ?? {})) {
    if (!h.skeleton || h.blown || seat === c.team.leaderSeat || rng.next() >= EXPOSURE) continue;
    h.blown = true;
    (heldOf(c).support.seat[seat] ??= zeros(N_PARTIES))[me] -= SCANDAL_HIT;
    outed.push(seat);
  }
  if (outed.length) { shiftUnity(c, me, -Math.min(4, outed.length)); pushNews(c, { party: me, key: 'news.candidate.scandals', vars: { n: outed.length, seats: `@seats:${outed.join(',')}` }, tone: 'bad' }); }
  for (const key of c.team.keySeats) {
    if (key.pick === null || key.blown || !key.options[key.pick].skeleton || rng.next() >= EXPOSURE) continue;
    key.blown = true;
    (heldOf(c).support.seat[key.seat] ??= zeros(N_PARTIES))[me] -= SCANDAL_HIT;
    shiftUnity(c, me, -2);
    pushNews(c, { party: me, key: 'news.candidate.scandal', vars: { seat: ref.seat(key.seat), name: HOPEFUL_NAMES[key.options[key.pick].name] }, tone: 'bad' });
  }
}
