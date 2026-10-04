import type { World } from '../election';
import { clamp } from '../math';
import { PARTY_IDS } from '../types';
import { shiftRelation } from './diplomacy';
import { ISSUE_IDS, type Campaign, type IssueId } from './types';

export { BACKSTORIES, edge, makeLeader, neutralLeader, stat } from './perks';


/**
 * What a past brings with it on the first day, beyond the leader's own
 * abilities. Called once, when the game begins.
 */
export function applyBackstory(c: Campaign): void {
  const me = c.player;
  const pc = c.parties[me];
  const story = c.team.leader.backstory;
  if (!pc || !story) return;
  const k = c.career;
  switch (story) {
    case 'organiser':
      pc.machinery = pc.machinery.map((m) => (m > 0 ? Math.min(100, m + 6) : 0));
      break;
    case 'technocrat':
      if (k) k.credibility = clamp(k.credibility + 10, 0, 100);
      break;
    case 'firebrand':
      pc.unity = clamp(pc.unity + 6, 0, 100);
      break;
    case 'tycoon':
      pc.funds = Math.round(pc.funds * 1.25);
      if (k) k.credibility = clamp(k.credibility - 5, 0, 100);
      break;
    case 'fixer':
      c.parties.forEach((other, p) => { if (other && p !== me) shiftRelation(c, me, p, 10); });
      break;
    case 'activist':
      if (k) k.credibility = clamp(k.credibility + 8, 0, 100);
      // The establishment has not forgotten who put it in the dock.
      shiftRelation(c, me, PARTY_IDS.indexOf('bp'), -8);
      break;
  }
}

// ---------- a party of one's own ----------

/** What a party founded by the player stands for. Each moves it a step on a few issues from where the old party stood. */
export const IDEOLOGY_IDS = ['reformist', 'populist', 'conservative', 'technocratic'] as const;
export type IdeologyId = (typeof IDEOLOGY_IDS)[number];

const SHIFTS: Record<IdeologyId, Partial<Record<IssueId, number>>> = {
  reformist: { graft: 1, reform: 1, liberties: 1 },
  populist: { subsidies: 1, wages: 1, studentDebt: 1 },
  conservative: { values: 1, rural: 1, liberties: -1 },
  technocratic: { subsidies: -1, taxes: -1, transport: 1 },
};

/**
 * Sets a new party's platform as a career opens: a step on a few issues from
 * where the party it grew out of stood. Voters respond as they would to any
 * change of position, but a new party is not accused of a U-turn.
 */
export function applyIdeology(_world: World, c: Campaign, ideology: IdeologyId): void {
  const k = c.career;
  if (!k) return;
  for (const [issue, step] of Object.entries(SHIFTS[ideology])) {
    const i = ISSUE_IDS.indexOf(issue as IssueId);
    k.stances[c.player][i] = clamp(k.stances[c.player][i] + step, -2, 2);
  }
}
