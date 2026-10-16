import type { Campaign, EndingKind, LegacyId, PledgeId } from './types';

const REFORMS: PledgeId[] = ['graftCommission', 'termLimit', 'repealLaws'];
/** Acts that remake how the country is governed: if they are still on the books when the career ends, they count as reform whether or not they were promised. */
export const REFORM_LAWS: readonly PledgeId[] = ['graftCommission', 'termLimit', 'repealLaws', 'partyHopBan', 'fixedTerm', 'infoAct', 'localVote'];
/** What each Act still standing is worth to the score. */
export const LAW_SCORE = 5;
/** The Dewan Rakyat, which the seat thresholds below were set for: a state's assembly is measured as the same share of its own seats. */
const FEDERAL_SEATS = 222;
/** How many seats the House the career is fought in has: the campaign keeps a line for every one of them. */
const houseSize = (c: Campaign): number => Object.keys(c.drift.support.seat).length || FEDERAL_SEATS;

/** What each way of being remembered adds to the score, once. */
export const LEGACY_BONUS: Record<LegacyId, number> = {
  statesman: 100, reformer: 60, survivor: 40, premier: 30, kingmaker: 30, conscience: 30, nearly: 10, plotter: 0, promiser: 0, footnote: 0,
};
/** The points a career earns, with no ceiling: what it did, not how it compares to a perfect one. */
export const SCORE = {
  /** A point for each this many weeks as head of government, and as a partner in it. */
  pmWeeks: 10, govWeeks: 25,
  /** Each election fought, and each won at the head of the government. */
  election: 10, win: 40,
  /** A point for each this many seats at the best result (as it would read in the Dewan Rakyat). */
  seatsPer: 5,
  /** Each promise kept (and broken), each Act still law, each government fallen, each one brought down, and the leader's word at the end (÷). */
  kept: 5, broken: 5, law: LAW_SCORE, fall: 8, toppled: 5, credibility: 5,
  /** Each mission won, by how hard it was. */
  mission: { 1: 10, 2: 20, 3: 30 } as Record<1 | 2 | 3, number>,
};

/** What the career itself came to, before what the legacy adds. */
export function performanceOf(c: Campaign, best: number): number {
  const k = c.career!;
  const r = k.record;
  const missions = (k.missions?.done ?? []).filter((m) => m.won).reduce((a, m) => a + SCORE.mission[m.tier], 0);
  return r.weeksPm / SCORE.pmWeeks + r.weeksGov / SCORE.govWeeks + r.elections * SCORE.election + r.victories * SCORE.win + best / SCORE.seatsPer +
    r.kept.length * SCORE.kept - r.broken * SCORE.broken + (k.laws?.length ?? 0) * SCORE.law - r.falls * SCORE.fall + r.toppled * SCORE.toppled +
    k.credibility / SCORE.credibility + missions;
}

/**
 * How a career will be remembered, and its score (not capped). Judged on years in
 * office, promises kept and broken, elections fought, and what the leader did
 * to get there.
 */
export function legacyOf(c: Campaign): { legacy: LegacyId; score: number; laws: number } {
  const k = c.career!;
  const r = k.record;
  const kept = r.kept.length;
  // What was passed and is still law outlasts what was merely won: a repealed or struck-down Act is not counted.
  const laws = k.laws?.length ?? 0;
  const reforms = (k.laws ?? []).filter((id) => REFORM_LAWS.includes(id)).length;
  // The best result as it would read in the Dewan Rakyat: 20 of a state's 56 seats is as good as 79 of the country's 222.
  const best = (r.bestSeats / houseSize(c)) * FEDERAL_SEATS;
  const legacy: LegacyId =
    r.weeksPm >= 500 && k.credibility >= 60 && (kept >= 4 || kept + laws >= 5) && kept >= 2 * r.broken ? 'statesman'
    : r.weeksPm >= 150 && (r.kept.filter((id) => REFORMS.includes(id)).length >= 2 || reforms >= 2) ? 'reformer'
    : r.weeksPm >= 150 && r.broken > kept ? 'promiser'
    : r.toppled >= 2 || (r.toppled >= 1 && r.victories === 0 && r.weeksPm > 0) ? 'plotter'
    : r.weeksPm >= 400 || (r.weeksPm >= 200 && r.falls >= 1) ? 'survivor'
    : r.weeksPm >= 100 ? 'premier'
    : r.weeksGov >= 250 ? 'kingmaker'
    : r.weeksGov < 100 && k.credibility >= 70 ? 'conscience'
    : best >= 85 ? 'nearly'
    : 'footnote';
  const score = Math.max(0, Math.round(performanceOf(c, best) + LEGACY_BONUS[legacy]));
  return { legacy, score, laws };
}

/**
 * How long the career has run, in weeks: every week of every term the leader has sat through, and every campaign fought.
 * Terms are not all of a length (a parliament may be dissolved early, and a state's campaign is shorter than the country's),
 * so the weeks are counted, not worked out from the number of parliaments.
 */
export function careerWeeks(c: Campaign): number {
  const k = c.career;
  if (!k) return 0;
  const r = k.record;
  // A campaign under way counts as far as it has got; one just fought, and not yet on the record, counts whole.
  const fighting = c.phase === 'campaign' || c.phase === 'night';
  const fought = (c.phase === 'formation' || c.phase === 'done') && !k.midterm && !!c.election;
  const now = fighting ? Math.min(c.week, c.totalWeeks) : fought ? c.totalWeeks : 0;
  return r.weeksPm + r.weeksGov + r.weeksOpp + r.elections * c.totalWeeks + now;
}
export const careerYears = (c: Campaign): number => careerWeeks(c) / 52;

/** Ends the career: the player retires, is thrown out by their own party, or has no party left to lead. */
export function endCareer(c: Campaign, kind: EndingKind): void {
  const k = c.career;
  if (!k || k.ending) return;
  const { laws, ...rest } = legacyOf(c);
  k.ending = { kind, ...rest, ...(laws > 0 ? { laws } : {}) };
  c.inbox = [];
}

/** The player chooses to go. Possible at any quiet moment between elections. */
export function retire(c: Campaign): boolean {
  if (!c.career || c.career.ending || c.phase !== 'term') return false;
  endCareer(c, 'retired');
  return true;
}

/** A party that has stopped holding together removes its leader. */
export const OUSTED_BELOW = 12;
