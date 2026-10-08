import type { World } from '../election';
import { clamp } from '../math';
import { scaled } from './actions';
import { houseTally } from './contests';
import { relation, shiftRelation, shiftUnity } from './diplomacy';
import { pushNews, ref } from './news';
import { isPm, vacate } from './office';
import { supportedSeats } from './supply';
import { majorityLine } from '../election';
import type { Campaign } from './types';

// A coalition can be more than a list of parties: it can have a name and a mark, and stand before the voters as one
// thing. Its members lift each other a little. Joining costs a fee; leaving is a betrayal, and so is being put out.

export const ALLIANCE_NAMES = 6;
export const ALLIANCE_MARKS = ['★', '◆', '●', '▲', '✦', '■'] as const;
export const ALLIANCE = { found: 40_000, join: 30_000, max: 4, warmth: 30, lift: 0.006, cap: 0.02, leaveRelation: -20, leaveCredibility: 4, leaveUnity: 3, drift: 1 };

export const allianceOf = (c: Campaign) => c.career?.alliance;
export const inAlliance = (c: Campaign, p: number): boolean => allianceOf(c)?.members.includes(p) ?? false;

/** What belonging to an alliance adds to a party's standing with every group: a little for each other member, up to a cap. */
export const allianceBonus = (c: Campaign, p: number): number => {
  const a = allianceOf(c);
  return a && a.members.includes(p) ? Math.min(ALLIANCE.cap, ALLIANCE.lift * (a.members.length - 1)) : 0;
};

export type AllianceRefusal = 'phase' | 'exists' | 'none' | 'funds' | 'warmth' | 'full' | 'already' | 'name';

/** Founds an alliance of the player's party alone, with a name and a mark. */
export function canFound(world: World, c: Campaign, name: number, mark: number): { ok: true } | { ok: false; reason: AllianceRefusal } {
  const k = c.career;
  const pc = c.parties[c.player];
  if (!k || !pc || c.phase !== 'term' || c.inbox.length > 0) return { ok: false, reason: 'phase' };
  if (k.alliance) return { ok: false, reason: 'exists' };
  if (!Number.isInteger(name) || name < 0 || name >= ALLIANCE_NAMES || !Number.isInteger(mark) || mark < 0 || mark >= ALLIANCE_MARKS.length) return { ok: false, reason: 'name' };
  if (pc.funds < scaled(world, ALLIANCE.found)) return { ok: false, reason: 'funds' };
  return { ok: true };
}

export function foundAlliance(world: World, c: Campaign, name: number, mark: number): boolean {
  if (!canFound(world, c, name, mark).ok) return false;
  c.parties[c.player]!.funds -= scaled(world, ALLIANCE.found);
  c.career!.alliance = { name, mark, members: [c.player] };
  pushNews(c, { party: c.player, key: 'news.alliance.founded', vars: { name: `@alliance:${name}` }, tone: 'good' });
  return true;
}

export function canInvite(world: World, c: Campaign, p: number): { ok: true } | { ok: false; reason: AllianceRefusal } {
  const k = c.career;
  const pc = c.parties[c.player];
  const a = allianceOf(c);
  if (!k || !pc || !a || c.phase !== 'term' || c.inbox.length > 0) return { ok: false, reason: 'phase' };
  if (p === c.player || !c.parties[p] || (houseTally(world, c)[p] ?? 0) <= 0) return { ok: false, reason: 'none' };
  if (a.members.includes(p)) return { ok: false, reason: 'already' };
  if (a.members.length >= ALLIANCE.max) return { ok: false, reason: 'full' };
  if (relation(c, c.player, p) < ALLIANCE.warmth) return { ok: false, reason: 'warmth' };
  if (pc.funds < scaled(world, ALLIANCE.join)) return { ok: false, reason: 'funds' };
  return { ok: true };
}

/** Invites a party into the alliance: it pays a fee, and they are the closer for it. */
export function invite(world: World, c: Campaign, p: number): boolean {
  if (!canInvite(world, c, p).ok) return false;
  c.parties[c.player]!.funds -= scaled(world, ALLIANCE.join);
  allianceOf(c)!.members.push(p);
  shiftRelation(c, c.player, p, 8);
  pushNews(c, { party: p, key: 'news.alliance.joined', vars: { party: ref.party(p), name: `@alliance:${allianceOf(c)!.name}` }, tone: 'good' });
  return true;
}

/** A member goes: of its own accord, or put out. Whoever is left sees it. */
export function dropMember(c: Campaign, p: number): void {
  const k = c.career;
  const a = k?.alliance;
  if (!k || !a || !a.members.includes(p)) return;
  a.members = a.members.filter((m) => m !== p);
  if (a.members.length <= 1) delete k.alliance;
}

/** The player takes the alliance apart: its name is gone, its members wounded, and the party pays in credibility and unity. */
export function dissolveAlliance(c: Campaign): boolean {
  const k = c.career;
  const a = k?.alliance;
  if (!k || !a || c.phase !== 'term') return false;
  for (const p of a.members) if (p !== c.player) shiftRelation(c, c.player, p, ALLIANCE.leaveRelation);
  k.credibility = clamp(k.credibility - ALLIANCE.leaveCredibility, 0, 100);
  shiftUnity(c, c.player, -ALLIANCE.leaveUnity);
  pushNews(c, { party: c.player, key: 'news.alliance.dissolved', vars: { name: `@alliance:${a.name}` }, tone: 'bad' });
  delete k.alliance;
  return true;
}

/** A week of the alliance: members who get on grow closer, and one who has turned cold quits. */
export function allianceWeek(c: Campaign): void {
  const a = allianceOf(c);
  if (!a || c.career!.week % 8 !== 0) return;
  for (const p of [...a.members]) {
    if (p === c.player) continue;
    if (relation(c, c.player, p) < 0) {
      dropMember(c, p);
      shiftRelation(c, c.player, p, -10);
      c.career!.credibility = clamp(c.career!.credibility - 2, 0, 100);
      pushNews(c, { party: p, key: 'news.alliance.quit', vars: { party: ref.party(p) }, tone: 'bad' });
    } else shiftRelation(c, c.player, p, ALLIANCE.drift);
  }
}

// ---------- putting a partner out ----------

/** What putting a partner out costs: its goodwill, the others' unease, and some of the government's steadiness and the leader's name. */
export const EXPEL = { relation: -40, others: -8, stability: 6, credibility: 3 };

export type ExpelRefusal = 'phase' | 'none' | 'majority';

export function canExpel(world: World, c: Campaign, p: number): { ok: true } | { ok: false; reason: ExpelRefusal } {
  const k = c.career;
  if (!k || c.phase !== 'term' || c.inbox.length > 0 || !isPm(c)) return { ok: false, reason: 'phase' };
  const g = k.government;
  if (!g.partners.includes(p)) return { ok: false, reason: 'none' };
  const seats = houseTally(world, c);
  // The government must still command the House without them: with its own partners, or with those who keep it in office from outside.
  const left = supportedSeats(world, c) - (seats[p] ?? 0);
  if (left < majorityLine(world)) return { ok: false, reason: 'majority' };
  return { ok: true };
}

/** The head of government puts a partner out of the government. It leaves, an enemy, and the others look to themselves. */
export function expel(world: World, c: Campaign, p: number): boolean {
  if (!canExpel(world, c, p).ok) return false;
  const k = c.career!;
  const g = k.government;
  const seats = houseTally(world, c);
  g.partners = g.partners.filter((q) => q !== p);
  g.deals[p] = null;
  g.seats -= seats[p] ?? 0;
  g.stability = clamp(g.stability - EXPEL.stability, 5, 95);
  k.credibility = clamp(k.credibility - EXPEL.credibility, 0, 100);
  shiftRelation(c, c.player, p, EXPEL.relation);
  for (const q of g.partners) shiftRelation(c, c.player, q, EXPEL.others);
  vacate(c, p);
  k.obligations = k.obligations.filter((o) => o.party !== p);
  dropMember(c, p);
  pushNews(c, { party: p, key: 'news.expel', vars: { party: ref.party(p) }, tone: 'bad' });
  return true;
}
