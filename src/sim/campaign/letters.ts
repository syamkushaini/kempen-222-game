import { clamp } from '../math';
import { pushNews } from './news';
import { blocFeeling, foundingStance } from './policy';
import { ISSUE_IDS, type Campaign, type IssueId } from './types';
import { shiftUnity } from './diplomacy';

// A leader can say what they think, in their own words, in an open letter or a speech. What they say is a choice of two things:
// the question they write about, and the voice they write it in. The people who care about the question, and who stand where the
// party stands, are pleased; the people who care and do not are not. A letter that says what the party has never said costs.

export type Tone = 'warm' | 'firm' | 'rousing';
export const TONES: readonly Tone[] = ['warm', 'firm', 'rousing'];
export const TONE: Record<Tone, { power: number; unity: number; rival: number; salience: number }> = {
  // Reasonable, and heard by more people for it.
  warm: { power: 0.7, unity: 1, rival: 0, salience: 0 },
  // Plain, and noticed by the other side.
  firm: { power: 1, unity: 0, rival: -3, salience: 0.1 },
  // A speech that fills a hall and the next day’s papers; it also leaves the question hotter.
  rousing: { power: 1.3, unity: 0, rival: -3, salience: 0.25 },
};
/** What a letter does, per unit of feeling, how long must pass between letters, and what saying what the party has never said costs. */
export const LETTER = { scale: 0.025, every: 13, away: 2 };

export const letterWait = (c: Campaign): number => {
  const last = c.career?.letter;
  return last === undefined ? 0 : Math.max(0, last + LETTER.every - c.career!.week);
};

export type LetterRefusal = 'phase' | 'wait' | 'issue';
export function canWrite(c: Campaign, issue: IssueId): { ok: true } | { ok: false; reason: LetterRefusal } {
  const k = c.career;
  if (!k || (c.phase !== 'term' && c.phase !== 'campaign') || c.inbox.length > 0) return { ok: false, reason: 'phase' };
  if (!ISSUE_IDS.includes(issue)) return { ok: false, reason: 'issue' };
  if (letterWait(c) > 0) return { ok: false, reason: 'wait' };
  return { ok: true };
}

/** What a letter on this question in this voice would do for each group, in logit: positive where the party’s line is theirs, negative where it is not. */
export function letterEffect(c: Campaign, issue: IssueId, tone: Tone): number[] {
  const k = c.career!;
  const i = ISSUE_IDS.indexOf(issue);
  return blocFeeling(k, c.player, i).map((f) => f * TONE[tone].power * LETTER.scale);
}

/** Writes the letter. The groups that care hear it, the question gets hotter, and one that departs from the party’s own line costs credibility. */
export function writeLetter(c: Campaign, issue: IssueId, tone: Tone): boolean {
  if (!canWrite(c, issue).ok || !TONES.includes(tone)) return false;
  const k = c.career!;
  const i = ISSUE_IDS.indexOf(issue);
  const effect = letterEffect(c, issue, tone);
  effect.forEach((v, b) => { k.mood[b][c.player] += v; });
  k.salience[i] = clamp(k.salience[i] + TONE[tone].salience, 0.5, 2);
  shiftUnity(c, c.player, TONE[tone].unity);
  // The party’s own people notice when the leader says what the party has never said.
  const root = foundingStance(c.player, i);
  if (Math.abs(k.stances[c.player][i] - root) >= LETTER.away) k.credibility = clamp(k.credibility - 2, 0, 100);
  k.letter = k.week;
  pushNews(c, { party: c.player, key: `news.letter.${tone}`, vars: { issue: `@issue:${issue}` }, tone: 'neutral' });
  return true;
}
