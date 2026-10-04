import { clamp } from '../math';
import type { Campaign, EndingKind, LegacyId, PledgeId } from './types';

const REFORMS: PledgeId[] = ['graftCommission', 'termLimit', 'repealLaws'];

/**
 * How a career will be remembered, and a score out of 100. Judged on years in
 * office, promises kept and broken, elections fought, and what the leader did
 * to get there.
 */
export function legacyOf(c: Campaign): { legacy: LegacyId; score: number } {
  const k = c.career!;
  const r = k.record;
  const kept = r.kept.length;
  const legacy: LegacyId =
    r.weeksPm >= 500 && k.credibility >= 60 && kept >= 4 && kept >= 2 * r.broken ? 'statesman'
    : r.weeksPm >= 150 && r.kept.filter((id) => REFORMS.includes(id)).length >= 2 ? 'reformer'
    : r.weeksPm >= 150 && r.broken > kept ? 'promiser'
    : r.toppled >= 2 || (r.toppled >= 1 && r.victories === 0 && r.weeksPm > 0) ? 'plotter'
    : r.weeksPm >= 400 || (r.weeksPm >= 200 && r.falls >= 1) ? 'survivor'
    : r.weeksPm >= 100 ? 'premier'
    : r.weeksGov >= 250 ? 'kingmaker'
    : r.weeksGov < 100 && k.credibility >= 70 ? 'conscience'
    : r.bestSeats >= 85 ? 'nearly'
    : 'footnote';
  const score = clamp(Math.round(
    r.weeksPm / 20 + r.weeksGov / 40 + kept * 3 - r.broken * 3 + r.victories * 6 + r.bestSeats / 10 + k.credibility / 10 - r.falls * 4,
  ), 0, 100);
  return { legacy, score };
}

/** Ends the career: the player retires, is thrown out by their own party, or has no party left to lead. */
export function endCareer(c: Campaign, kind: EndingKind): void {
  const k = c.career;
  if (!k || k.ending) return;
  k.ending = { kind, ...legacyOf(c) };
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
