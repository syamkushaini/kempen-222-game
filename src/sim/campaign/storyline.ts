import { raise, seatOf } from './events';
import { BEAT_STYLES } from './eventListStory';
import { graftOf } from './graft';
import { pushNews, ref } from './news';
import type { ArcId, Campaign, Career, StoryState, StoryStyle } from './types';

// A career tells a story. Three are written: the country's, a state's, and the one of a party built from nothing. Each is a run of chapters; a
// chapter opens when its time has come (a term and week, sooner when things are going a certain way, and at the latest by a deadline), puts one
// decision on the desk, and closes when it is answered. What was answered decides how the chapter is told afterwards, which of two tellings the
// next one has, and how the story ends. Nothing here is random: the same career told twice reads the same, and what a player chose is what they read.
// Chapters are never skipped for a lack of anything to say; the decisions themselves are ordinary events (eventListStory.ts) with words in i18n/story.ts.

/** Weeks at least between one chapter closing and the next opening. */
export const GAP = 26;

/** A moment in a career: the parliament, then the week of it. */
export type Moment = readonly [term: number, week: number];
const abs = ([term, week]: Moment): number => term * 1000 + week;

export interface Chapter {
  id: string;
  /** Not before this. */
  from: Moment;
  /** Sooner than `from` it cannot be; after `by` it comes whatever `ready` says. */
  by: Moment;
  /** What brings it on early: trouble, or luck, or a turn of events. Nothing means the chapter waits for its time. */
  ready?(c: Campaign): boolean;
  /** The beats it may be told with, and which of them this career gets. */
  beats: string[];
  telling?(c: Campaign): number;
}

export interface Arc { id: ArcId; chapters: Chapter[] }

/** In government (leading it, or in it) or not: the question of a chapter that is told one way to the governors and another to the opposition. */
const governs = (c: Campaign): number => (seatOf(c) === 'opp' ? 1 : 0);
/** Whether the party has been shaken: the government is thin or shaky, or the party's own heart is not in it. */
const shaken = (c: Campaign): boolean => {
  const k = c.career!;
  return k.government.stability < 62 || k.government.minority || c.parties[c.player]!.unity < 62;
};
/** Whether there is something to answer for: the corruption meter has begun to move, or the leader's word has slipped. */
const exposed = (c: Campaign): boolean => graftOf(c) >= 12 || c.career!.credibility < 52;

export const ARCS: Record<ArcId, Arc> = {
  nat: { id: 'nat', chapters: [
    { id: 'nat1', from: [1, 10], by: [1, 10], beats: ['natInheritance'] },
    { id: 'nat2', from: [1, 40], by: [1, 90], ready: shaken, beats: ['natFirstCrack'] },
    { id: 'nat3', from: [1, 100], by: [1, 150], ready: exposed, beats: ['natPaperTrail'] },
    { id: 'nat4', from: [2, 12], by: [2, 12], beats: ['natAfterGov', 'natAfterOpp'], telling: governs },
    { id: 'nat5', from: [2, 110], by: [2, 190], ready: (c) => shaken(c) || exposed(c), beats: ['natLastPage'] },
  ] },
  state: { id: 'state', chapters: [
    { id: 'state1', from: [1, 10], by: [1, 10], beats: ['stateKeys'] },
    { id: 'state2', from: [1, 40], by: [1, 90], ready: shaken, beats: ['stateHandshake'] },
    { id: 'state3', from: [1, 100], by: [1, 150], ready: (c) => c.career!.economy.growth < 3 || exposed(c), beats: ['stateTrade'] },
    { id: 'state4', from: [2, 12], by: [2, 12], beats: ['stateAfterGov', 'stateAfterOpp'], telling: governs },
    { id: 'state5', from: [2, 110], by: [2, 190], ready: (c) => shaken(c) || exposed(c), beats: ['stateKeeper'] },
  ] },
  founded: { id: 'founded', chapters: [
    { id: 'founded1', from: [1, 6], by: [1, 6], beats: ['foundHall'] },
    { id: 'founded2', from: [1, 40], by: [1, 90], ready: (c) => c.parties[c.player]!.funds > 0 && c.career!.week >= 50, beats: ['foundOffer'] },
    { id: 'founded3', from: [1, 100], by: [1, 160], ready: (c) => c.parties[c.player]!.funds < 150_000, beats: ['foundCheque'] },
    // A new party that has won more than a corner of the House is courted; one that has not is lectured.
    { id: 'founded4', from: [2, 12], by: [2, 12], beats: ['foundBreakthrough', 'foundWall'], telling: (c) => (c.career!.record.bestSeats >= 3 ? 0 : 1) },
    { id: 'founded5', from: [2, 110], by: [2, 190], ready: exposed, beats: ['foundGovernment'] },
  ] },
};

/** The story a career tells: a party built from nothing, a state's, or the country's. */
export const arcFor = (c: Campaign): ArcId => (c.career?.founded ? 'founded' : c.scenario.startsWith('career:') ? 'state' : 'nat');

/** The year of the career a moment falls in, counting the first as 1. */
const yearOf = (k: Career): number => (k.term - 1) * 5 + Math.min(5, Math.ceil(k.week / 52));

/** Begins a story at the start of a career, or in a game saved before stories: chapters whose time has long gone are not played late. */
export function beginStory(c: Campaign): StoryState {
  const k = c.career!;
  const arc = arcFor(c);
  const now = abs([k.term, k.week]);
  const first = ARCS[arc].chapters.findIndex((ch) => abs(ch.by) >= now);
  const story: StoryState = { arc, ch: first < 0 ? ARCS[arc].chapters.length : first, since: GAP, seen: 0, log: [] };
  k.story = story;
  return story;
}

/** The chapter that is open, or null once the story is told. */
export function openChapter(k: Career): Chapter | null {
  const s = k.story;
  return s ? ARCS[s.arc].chapters[s.ch] ?? null : null;
}

/** The beat the open chapter is told with, in this career as it stands. */
export function beatOf(c: Campaign, ch: Chapter): string {
  return ch.beats[Math.min(ch.beats.length - 1, ch.telling?.(c) ?? 0)];
}

/** Whether the open chapter's time has come. */
export function chapterDue(c: Campaign, ch: Chapter, s: StoryState): boolean {
  const k = c.career!;
  const now = abs([k.term, k.week]);
  if (s.since < GAP || now < abs(ch.from)) return false;
  return now >= abs(ch.by) || (ch.ready ? ch.ready(c) : true);
}

/** The answer a beat was given, or null if it has not been. */
export function answerOf(k: Career, beat: string): number | null {
  for (let i = 0; i < 3; i++) if (k.flags.includes(`sb:${beat}:${i}`)) return i;
  return null;
}

/** How an answer reads. */
export const styleOf = (beat: string, pick: number): StoryStyle => BEAT_STYLES[beat]?.[pick] ?? 'steady';

/** How the career has gone about it so far: the way most of its answers read, the by-the-book way when they are tied. */
export function manner(s: StoryState): StoryStyle {
  const n: Record<StoryStyle, number> = { steady: 0, bold: 0, shady: 0 };
  for (const e of s.log) n[styleOf(e.beat, e.pick)]++;
  return n.shady > n.steady && n.shady >= n.bold ? 'shady' : n.bold > n.steady ? 'bold' : 'steady';
}

/** Closes the open chapter if its decision has been answered: the story is written up, the news says so, and the next chapter's wait begins. */
export function closeChapter(c: Campaign): boolean {
  const k = c.career;
  const s = k?.story;
  const ch = k && openChapter(k);
  if (!k || !s || !ch) return false;
  for (const beat of ch.beats) {
    const pick = answerOf(k, beat);
    if (pick === null) continue;
    s.log.push({ ch: s.ch, pick, beat, term: k.term, year: yearOf(k) });
    s.ch++;
    s.since = 0;
    const style = styleOf(beat, pick);
    const state = c.scenario.startsWith('career:') ? c.scenario.slice(7) : '';
    pushNews(c, { party: c.player, key: `story.${ch.id}.close.${style}`, vars: { state: state ? ref.state(state) : '' }, tone: style === 'shady' ? 'bad' : style === 'bold' ? 'neutral' : 'good' });
    // The story is over: the last chapter has a last word, which the career's end will read out.
    if (!openChapter(k)) pushNews(c, { party: c.player, key: `story.${s.arc}.told`, vars: {}, tone: 'neutral' });
    return true;
  }
  return false;
}

/** The week's turn of the story: close the chapter if it was answered, and put the next beat on the desk if its time has come and the desk is clear. */
export function storyWeek(c: Campaign): void {
  const k = c.career;
  if (!k || k.ending || c.phase !== 'term') return;
  const s = k.story ?? beginStory(c);
  const ch = openChapter(k);
  if (!ch) return;
  s.since++;
  if (closeChapter(c) || c.inbox.length > 0) return;
  const beat = beatOf(c, ch);
  // Raised once a parliament: one that was set aside, or lost to a dissolution, comes round again in the next.
  if (k.fired.includes(beat) || !chapterDue(c, ch, s)) return;
  raise(c, beat);
}

/** After a parliament ends, with the story still open: a line on the news about what is coming. */
export function cliffhanger(c: Campaign): void {
  const k = c.career;
  const ch = k && openChapter(k);
  if (!ch || !k.story || k.story.log.length === 0) return;
  pushNews(c, { party: null, key: `story.${ch.id}.hook`, vars: {}, tone: 'neutral' });
}

/** Chapters closed that the player has not yet been shown. */
export const unseen = (k: Career): number => (k.story ? k.story.log.length - k.story.seen : 0);

/** The player has read what is there. */
export function markSeen(k: Career): void {
  if (k.story) k.story.seen = k.story.log.length;
}

/** Whether a decision is a chapter of a story. */
export const isStoryBeat = (id: string): boolean => id in BEAT_STYLES;
