import { byElectionId } from '../../data/world';
import type { Summary } from './night';

// Fixed contests with a goal. The seed is fixed, so everyone who plays one
// faces the same hidden swing and can compare how they did. The goals were set
// by playing each contest with the game's own autoplayer, which does a sound
// but unimaginative job: each goal asks for about what it manages, or a little
// more, where an idle player falls well short. They were set again (6 Oct 2026)
// when the rival leaders were given stats of their own: any change to the rules
// reshuffles what a fixed seed produces, so the seeds were chosen afresh; and again
// when the rivals were given the player's newer actions and teams of their own,
// and when the player's chiefs became people of differing ability, and (9 Oct 2026) when a turnout drive was made to
// fade like every other effect of a campaign.

export type Goal =
  | { kind: 'win' }
  | { kind: 'seats'; atLeast: number }
  /** A net gain over the seats the party held going in. */
  | { kind: 'gain'; atLeast: number };

export interface ChallengeDef {
  id: string;
  scenario: string;
  party: 'ps' | 'bp' | 'pt';
  seed: number;
  /** The same hidden-odds and noisy-polls switches the title screen offers. */
  fog?: boolean;
  noisy?: boolean;
  goal: Goal;
}

export const CHALLENGES: ChallengeDef[] = [
  { id: 'underdog', scenario: byElectionId('P.061'), party: 'bp', seed: 3, goal: { kind: 'win' } },
  { id: 'blind', scenario: byElectionId('P.057'), party: 'pt', seed: 5, fog: true, noisy: true, goal: { kind: 'win' } },
  { id: 'perlis', scenario: 'state:perlis', party: 'ps', seed: 2, goal: { kind: 'seats', atLeast: 2 } },
  { id: 'perak', scenario: 'state:perak', party: 'ps', seed: 3, goal: { kind: 'seats', atLeast: 30 } },
  { id: 'pahang', scenario: 'state:pahang', party: 'bp', seed: 3, goal: { kind: 'seats', atLeast: 22 } },
  // BP holds 30 and, against rivals who use every tool, loses a good many if it sits still (14 here): to hold 28 is the comeback.
  { id: 'comeback', scenario: 'general', party: 'bp', seed: 14, goal: { kind: 'seats', atLeast: 28 } },
];

export const challengeById = (id: string | undefined): ChallengeDef | undefined => CHALLENGES.find((c) => c.id === id);

/** Whether the night's result meets the goal, and by how much. */
export function goalResult(goal: Goal, summary: Pick<Summary, 'seats' | 'before'>): { met: boolean; got: number; need: number } {
  const got = goal.kind === 'gain' ? summary.seats - summary.before : summary.seats;
  const need = goal.kind === 'win' ? 1 : goal.atLeast;
  return { met: got >= need, got, need };
}
