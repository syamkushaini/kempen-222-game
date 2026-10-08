import type { World } from '../election';
import { lastElection } from '../election';
import { BLOC_IDS, N_BLOCS } from '../types';
import type { Campaign } from './types';

// History, played again with one thing changed: the election as it was, with the economy sour, or the young turning out, or the
// leading party in disgrace, or the player’s party having had a better year. The map and the results are the real ones; the
// change is the player’s "what if".

export const WHATIF_IDS = ['turnout', 'recession', 'scandal', 'surge'] as const;
export type WhatIfId = (typeof WHATIF_IDS)[number];
export const isWhatIf = (x: unknown): x is WhatIfId => (WHATIF_IDS as readonly unknown[]).includes(x);

export const WHATIF = {
  /** How much more the young and gig workers turn out, in logit-like turnout units. */
  youthTurnout: 0.12,
  /** What a sour economy takes off the leading party everywhere, and a disgrace takes off it and its unity. */
  recession: 0.03, scandal: 0.04, scandalUnity: 10,
  /** What a better year gives the player’s party everywhere. */
  surge: 0.03,
};

/** The party that won the most seats last time: the one the country has in mind when it says "the government". */
export function leadingParty(world: World): number {
  const tally = lastElection(world).tally;
  return tally.indexOf(Math.max(...tally));
}

/** Applies a "what if" to a campaign that has just been made. Does nothing for anything that is not one. */
export function applyWhatIf(world: World, c: Campaign, id: unknown): void {
  if (!isWhatIf(id)) return;
  const lead = leadingParty(world);
  const nat = c.drift.support.nat;
  if (id === 'turnout') {
    for (const b of ['undi18', 'gig'] as const) c.drift.turnout.nat[BLOC_IDS.indexOf(b)] += WHATIF.youthTurnout;
  } else if (id === 'recession') {
    for (let b = 0; b < N_BLOCS; b++) nat[b][lead] -= WHATIF.recession;
  } else if (id === 'scandal') {
    for (let b = 0; b < N_BLOCS; b++) nat[b][lead] -= WHATIF.scandal;
    const pc = c.parties[lead];
    if (pc) pc.unity = Math.max(0, pc.unity - WHATIF.scandalUnity);
  } else {
    for (let b = 0; b < N_BLOCS; b++) nat[b][c.player] += WHATIF.surge;
  }
  c.challenge = { ...(c.challenge ?? { fog: false, noisy: false }), whatIf: id };
}
