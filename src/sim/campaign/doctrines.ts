import { clamp } from '../math';
import { START_DEFENCE, isFederal } from './defence';
import { nationOf } from './nation';
import { pushNews } from './news';
import { isPm } from './office';
import { START_PESTEL } from './pestel';
import { STANCE_IDS, setStance, stanceAvailable, stanceOf, type Notch, type StanceId } from './stances';
import type { Campaign, Career } from './types';

// Three things that give the sliders a story. Doctrines: a name for a way of governing, set in one click, and a title for holding it for a year.
// Tipping points: a meter crossing into the strong or the weak is a moment of its own, once. The annual report: each year, grades for the country,
// how it compares with invented peers, and whether it is getting better or worse.

// ---------- doctrines ----------

export interface Doctrine { id: string; notches: Partial<Record<StanceId, Notch>>; /** Needs the armed forces' sliders, which are a country's only. */ federal?: true }
export const DOCTRINES: Doctrine[] = [
  { id: 'greenReformer', notches: { environment: 2, law: 1, tech: 1, readiness: -1 } },
  { id: 'techTiger', notches: { tech: 2, law: 1, environment: -1 } },
  { id: 'unityFirst', notches: { cohesion: 2, law: 1, readiness: 1 } },
  { id: 'cleanGovernment', notches: { law: 2, tech: 1, influence: 1 } },
  { id: 'securityFirst', notches: { readiness: 2, influence: 1, tech: 1 }, federal: true },
];
/** How long a doctrine must be held for the title. */
export const TITLE_WEEKS = 52;

/** Whether a doctrine can be adopted where the career is. */
export const doctrineAvailable = (scenario: string, d: Doctrine): boolean => !d.federal || isFederal(scenario);

/** Sets every slider to a doctrine's: what it does not name goes back to the middle. */
export function adoptDoctrine(c: Campaign, id: string): boolean {
  const k = c.career;
  const d = DOCTRINES.find((x) => x.id === id);
  if (!k || !d || c.phase !== 'term' || !isPm(c) || !doctrineAvailable(c.scenario, d)) return false;
  // Back to the middle first, so the capital is free; the doctrine's own cost is within the least a leader has.
  for (const sid of STANCE_IDS) setStance(c, sid, 0);
  for (const sid of STANCE_IDS) if (d.notches[sid] !== undefined) setStance(c, sid, d.notches[sid]!);
  k.doctrine = { id, since: k.week };
  return true;
}

/** The doctrine the sliders stand at exactly now, if any. */
export function doctrineHeld(c: Campaign): Doctrine | undefined {
  const k = c.career!;
  return DOCTRINES.find((d) => doctrineAvailable(c.scenario, d) && STANCE_IDS.every((id) => !stanceAvailable(c.scenario, id) || stanceOf(k, id) === (d.notches[id] ?? 0)));
}

/** One week: a doctrine held for a year earns its title, and a little credit with it. */
function doctrineWeek(c: Campaign): void {
  const k = c.career!;
  const held = doctrineHeld(c);
  if (!held) { delete k.doctrine; return; }
  if (k.doctrine?.id !== held.id) { k.doctrine = { id: held.id, since: k.week }; return; }
  if (k.week - k.doctrine.since >= TITLE_WEEKS && !k.titles?.includes(held.id)) {
    (k.titles ??= []).push(held.id);
    k.credibility = clamp(k.credibility + 2, 0, 100);
    pushNews(c, { party: c.player, key: 'news.title', vars: { title: `@doctrine:${held.id}` }, tone: 'good' });
  }
}

// ---------- tipping points ----------

export const METERS = ['cohesion', 'tech', 'environment', 'law', 'readiness', 'influence'] as const;
export type Meter = (typeof METERS)[number];
export const STRONG_AT = 70, WEAK_AT = 30;
const valueOf = (k: Career, m: Meter): number => (m === 'readiness' || m === 'influence' ? (k.defence ?? START_DEFENCE)[m] : (k.pestel ?? START_PESTEL)[m]);
/** How well a meter is doing, 0 to 100: the armed forces having a great say is the one where more is worse. */
export const wellness = (k: Career, m: Meter): number => (m === 'influence' ? 100 - valueOf(k, m) : valueOf(k, m));
const available = (c: Campaign, m: Meter): boolean => (m === 'readiness' || m === 'influence' ? isFederal(c.scenario) : true);

/** The first time a meter is doing well, or badly, is a moment: it is in the news once, and a little is gained or lost. */
function milestoneWeek(c: Campaign): void {
  const k = c.career!;
  for (const m of METERS) {
    if (!available(c, m)) continue;
    const good = wellness(k, m);
    const kind = good >= STRONG_AT ? 'good' : good <= WEAK_AT ? 'bad' : null;
    if (!kind || k.milestones?.includes(`${m}:${kind}`)) continue;
    (k.milestones ??= []).push(`${m}:${kind}`);
    if (kind === 'good') k.credibility = clamp(k.credibility + 2, 0, 100);
    else { k.credibility = clamp(k.credibility - 1, 0, 100); k.government.stability = clamp(k.government.stability - 2, 5, 95); }
    pushNews(c, { party: c.player, key: `news.milestone.${m}.${kind}`, tone: kind });
  }
}

// ---------- the annual report ----------

export interface Report { term: number; year: number; scores: Record<string, number>; overall: number; rank: number }
export const REPORT_KEEP = 6;
export const GRADES = ['A', 'B', 'C', 'D', 'F'] as const;
export type Grade = (typeof GRADES)[number];
export const gradeOf = (score: number): Grade => (score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F');

/** What is graded: the meters of the game, the nation's three figures, as scores from 0 to 100 where more is better. */
export function reportScores(c: Campaign): Record<string, number> {
  const k = c.career!;
  const n = nationOf(k);
  const scores: Record<string, number> = {};
  for (const m of METERS) if (available(c, m)) scores[m] = wellness(k, m);
  scores.health = n.health; scores.education = n.education; scores.standing = n.standing;
  return scores;
}
const mean = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);

/** Invented peers the country is ranked against: where each started, and which way it was going. */
export const PEERS = [
  { id: 'tanjungRaya', base: 48, trend: 1.5 }, { id: 'lembahCahaya', base: 55, trend: 0.5 }, { id: 'pulauMutiaraTimur', base: 62, trend: 0 },
  { id: 'seriBayu', base: 67, trend: -0.5 }, { id: 'kotaEmbun', base: 72, trend: -1 },
] as const;
/** A peer's overall score in a year of a term: its start and trend, and a steady wobble of its own that is the same every time. */
export function peerScore(id: string, base: number, trend: number, term: number, year: number): number {
  let h = 2166136261;
  for (const ch of `${id}:${term}:${year}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const wobble = (((h >>> 0) % 1000) / 1000 - 0.5) * 8;
  return clamp(base + trend * ((term - 1) * 5 + year) + wobble, 20, 95);
}
/** Where an overall score ranks among the peers, 1 being the best. */
export const rankAmong = (overall: number, term: number, year: number): number => 1 + PEERS.filter((p) => peerScore(p.id, p.base, p.trend, term, year) > overall).length;

/** The end of each year of the term: the country is graded, ranked against its peers, and it is in the news. */
function reportWeek(c: Campaign): void {
  const k = c.career!;
  if (k.week <= 0 || k.week % 52 !== 0) return;
  const year = k.week / 52;
  const scores = reportScores(c);
  const overall = mean(Object.values(scores));
  const rank = rankAmong(overall, k.term, year);
  const cards = (k.scorecards ??= []);
  if (cards.some((r) => r.term === k.term && r.year === year)) return;
  cards.push({ term: k.term, year, scores, overall, rank });
  while (cards.length > REPORT_KEEP) cards.shift();
  pushNews(c, { party: c.player, key: 'news.report', vars: { grade: gradeOf(overall), rank, of: PEERS.length + 1, year }, tone: rank <= 2 ? 'good' : rank >= 5 ? 'bad' : 'neutral' });
}

/** Everything a week of the term adds to the story of the sliders. */
export function storyWeek(c: Campaign): void {
  if (!isPm(c)) return;
  doctrineWeek(c);
  milestoneWeek(c);
  reportWeek(c);
}
