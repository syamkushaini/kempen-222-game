import { clamp } from '../math';
import type { Campaign, EndingKind, LegacyId, PledgeId } from './types';

const REFORMS: PledgeId[] = ['graftCommission', 'termLimit', 'repealLaws'];
/** Acts that remake how the country is governed: if they are still on the books when the career ends, they count as reform whether or not they were promised. */
export const REFORM_LAWS: readonly PledgeId[] = ['graftCommission', 'termLimit', 'repealLaws', 'partyHopBan', 'fixedTerm', 'infoAct', 'localVote'];
/** What each Act still standing is worth to the score. */
export const LAW_SCORE = 2;
/** The Dewan Rakyat, which the seat thresholds below were set for: a state's assembly is measured as the same share of its own seats. */
const FEDERAL_SEATS = 222;
/** How many seats the House the career is fought in has: the campaign keeps a line for every one of them. */
const houseSize = (c: Campaign): number => Object.keys(c.drift.support.seat).length || FEDERAL_SEATS;

/**
 * How a career will be remembered, and a score out of 100. Judged on years in
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
  const score = clamp(Math.round(
    r.weeksPm / 20 + r.weeksGov / 40 + kept * 3 - r.broken * 3 + r.victories * 6 + best / 10 + k.credibility / 10 - r.falls * 4 + laws * LAW_SCORE,
  ), 0, 100);
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
