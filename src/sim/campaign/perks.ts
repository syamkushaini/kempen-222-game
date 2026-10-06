import { PARTY_IDS } from '../types';
import { LEADER_STATS } from './cast';
import { ROLE_IDS, STAT_IDS, type BackstoryId, type Campaign, type Leader, type RoleId, type StatId } from './types';

// What the leaders and the player's team change about the rules. Kept free of
// imports that reach back into the simulation, so that any part of it can ask.

/** An ordinary leader: three at everything. What the player leads with unless they choose a past. */
export const neutralLeader = (): Leader => ({ backstory: null, stats: STAT_IDS.map(() => 3) });

/**
 * What each past makes of a leader. Every set of numbers adds up to twelve,
 * the same as an ordinary leader's, so a backstory is a trade and not a gift.
 * In the order charisma, organisation, cunning, integrity.
 */
export const BACKSTORIES: Record<BackstoryId, number[]> = {
  // Thirty years of branch meetings. Knows every division chief by name.
  organiser: [2, 5, 3, 2],
  // An economist who came home from a bank abroad. Right about most things, and bad at saying so.
  technocrat: [2, 3, 2, 5],
  // The student leader who never stopped making speeches.
  firebrand: [5, 2, 2, 3],
  // Made a fortune before entering politics, and is not asked how.
  tycoon: [3, 3, 4, 2],
  // Never held the microphone; always held the numbers.
  fixer: [2, 3, 5, 2],
  // A lawyer who went to prison for it once.
  activist: [4, 2, 1, 5],
};

/** What the leader a party already has is good at: ordinary, for a party with no leader in the cast. */
export const partyLeaderStats = (p: number): number[] => [...(LEADER_STATS[PARTY_IDS[p] as keyof typeof LEADER_STATS] ?? STAT_IDS.map(() => 3))];

/** The player's leader: someone with a past of the player's choosing, or the leader the party already has. */
export const makeLeader = (backstory: BackstoryId | null, party?: number): Leader =>
  backstory ? { backstory, stats: [...BACKSTORIES[backstory]] } : party === undefined ? neutralLeader() : { backstory: null, stats: partyLeaderStats(party) };

/** How good the leader of a party is at something: the player's own leader, or the rival party's as the cast gives them. */
export function stat(c: Campaign, p: number, id: StatId): number {
  const i = STAT_IDS.indexOf(id);
  return p === c.player ? c.team.leader.stats[i] ?? 3 : LEADER_STATS[PARTY_IDS[p] as keyof typeof LEADER_STATS]?.[i] ?? 3;
}

/** What a stat does to the things it touches: 8% either way for each point from ordinary. */
export const edge = (c: Campaign, p: number, id: StatId) => 1 + 0.08 * (stat(c, p, id) - 3);

/** How good the player's person in a job is: 0 with nobody in it, or in a week the team went unpaid. Rival parties make do without. */
export function skill(c: Campaign, p: number, id: RoleId): number {
  return p === c.player && !c.team.unpaid ? c.team.staff[ROLE_IDS.indexOf(id)]?.skill ?? 0 : 0;
}

/** Extra days in the leader's week from a campaign manager who keeps the diary. */
export const managerDays = (c: Campaign, p: number) => { const s = skill(c, p, 'manager'); return s >= 4 ? 1 : s >= 2 ? 0.5 : 0; };
/** What a strategist does to the cost of a poll, and to its error. */
export const pollDiscount = (c: Campaign) => 1 - 0.08 * skill(c, c.player, 'strategist');
export const pollPrecision = (c: Campaign) => 1 - 0.06 * skill(c, c.player, 'strategist');
/** What a media chief adds to anything said through a screen or a hoarding. */
export const mediaBoost = (c: Campaign, p: number) => 1 + 0.05 * skill(c, p, 'media');
/** How much less likely a message is to land badly with one. */
export const gaffeCut = (c: Campaign, p: number) => 0.015 * skill(c, p, 'media');
/** What a treasurer adds to money raised and money coming in. */
export const fundsBoost = (c: Campaign, p: number) => 1 + 0.06 * skill(c, p, 'treasurer');
export const incomeBoost = (c: Campaign, p: number) => 1 + 0.04 * skill(c, p, 'treasurer');
