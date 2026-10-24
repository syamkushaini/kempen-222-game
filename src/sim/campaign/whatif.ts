import type { World } from '../election';
import { lastElection } from '../election';
import { BLOC_IDS, N_BLOCS, N_PARTIES, PARTY_IDS } from '../types';
import { STANDS, type StandDowns } from '../transfer';
import type { Campaign } from './types';

// History, played again with one thing changed: the election as it was, with the economy sour, or the young turning out, or the
// leading party in disgrace, or the player’s party having had a better year. The map and the results are the real ones; the
// change is the player’s "what if".

export const WHATIF_IDS = ['turnout', 'recession', 'scandal', 'surge'] as const;
/** What a state's election can offer: Melaka, with its two biggest sides standing together as they said they would in 2026. */
export const STATE_WHATIF_IDS = ['bnpas'] as const;
export type WhatIfId = (typeof WHATIF_IDS)[number] | (typeof STATE_WHATIF_IDS)[number];
export const isWhatIf = (x: unknown): x is WhatIfId => (WHATIF_IDS as readonly unknown[]).includes(x) || (STATE_WHATIF_IDS as readonly unknown[]).includes(x);

/** The "what if"s a contest offers: the general election's four, or the one a state has. */
export const whatIfsFor = (scenario: string): readonly WhatIfId[] => (scenario === 'general' ? WHATIF_IDS : scenario === 'state:melaka' ? STATE_WHATIF_IDS : []);

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

/** In Melaka's "what if": the number of seats the smaller of the two sides stands in, and the two sides. The big side stands in the rest. */
export const BNPAS = { small: 7, big: 'bp', partner: 'pt' } as const;

/**
 * The seat-sharing of Melaka's 2026 election, as the two sides said it would be: one of them stands in 21 of the 28 seats and the other in
 * 7, and neither stands against the other. The game's own split gives the smaller side the seats where its voters were most (the real list
 * was not out when this was written): the seats where it won the biggest share of the votes at the last election.
 */
export function bnPasPact(world: World): { standDowns: StandDowns; pacts: { a: number; b: number; week: number }[] } {
  const big = PARTY_IDS.indexOf(BNPAS.big), small = PARTY_IDS.indexOf(BNPAS.partner);
  const share = (i: number) => { const v = world.seats[i].last.votes; return v[small] / Math.max(1, v.reduce((a, b) => a + b, 0)); };
  const smallSeats = new Set(world.seats.map((_, i) => i).sort((x, y) => share(y) - share(x) || x - y).slice(0, BNPAS.small).map((i) => world.seats[i].id));
  const standDowns: StandDowns = {};
  for (const seat of world.seats) {
    const row = new Array<number>(N_PARTIES).fill(STANDS);
    // Where the small side stands, the big one stands aside for it, and the other way round.
    if (smallSeats.has(seat.id)) row[big] = small; else row[small] = big;
    standDowns[seat.id] = row;
  }
  return { standDowns, pacts: [{ a: Math.min(big, small), b: Math.max(big, small), week: 0 }] };
}

/** Applies a "what if" to a campaign that has just been made. Does nothing for anything that is not one, or not one for this contest. */
export function applyWhatIf(world: World, c: Campaign, id: unknown): void {
  if (!isWhatIf(id)) return;
  // The pact itself is part of how the contest opens (see `newCampaign`); here it is only written down.
  if (id === 'bnpas') {
    if (world.id === 'state:melaka') c.challenge = { ...(c.challenge ?? { fog: false, noisy: false }), whatIf: id };
    return;
  }
  if (world.rules.kind !== 'general') return;
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
