import { scaled } from './actions';
import { lastElection, type World } from '../election';
import { PARTY_IDS, type StateId } from '../types';
import { applyStateResults, ROUNDS, resolveStatePolls, type StateResult } from './contests';
import { FOUNDING_FUNDS } from './founding';
import { playable, startingFunds } from './field';
import { endCareer, OUSTED_BELOW } from './legacy';
import { pushNews, ref } from './news';
import { neutralLeader } from './perks';
import { electionResult, newCampaign } from './turn';
import type { Campaign } from './types';

// A state election played in person, inside a career. When a round of state polls falls due, a player who chose it may fight
// any of its states as a campaign of its own, the same six weeks and the same talks as a state election played alone. The
// career waits, parked, while it is fought; the party puts in the state contest's purse, takes back what it did not spend, and
// whoever forms the state's government governs it, as if the model had decided it (see applyStateResults).

const OTH = PARTY_IDS.indexOf('oth');

/** The money a party puts into a state election it fights in person: what a party of its standing starts such a contest with, or for a party founded from nothing, what a new party starts with. */
export const stakeFor = (stateWorld: World, party: number, founded = false): number => (founded ? scaled(stateWorld, FOUNDING_FUNDS) : startingFunds(stateWorld, party));

/**
 * Whether the player's party can fight a state's election in person: it is a party that stands there, or one founded from nothing,
 * which stands wherever the state's world (with the new party on every ballot) is given to it.
 */
export function canFight(stateWorld: World, c: Campaign): boolean {
  if (!c.career?.realStates) return false;
  return c.career.founded ? stateWorld.rules.kind === 'state' : playable(stateWorld).includes(c.player);
}

/** The states of the round now due, if the player may fight them in person. */
export function roundStates(c: Campaign): StateId[] {
  const k = c.career;
  if (!k?.realStates || k.rounds >= ROUNDS.length) return [];
  return ROUNDS[k.rounds].states;
}

/**
 * The player answers a round of state polls by fighting some of its states in person. Each costs the state contest's purse, and
 * the party cannot enter more than it can pay for. The other states of the round are left to the model, with the effort chosen.
 * Returns the states to fight, in order, or null if this cannot be done.
 */
export function playRound(world: World, c: Campaign, choice: number, wanted: readonly string[], stakes: Readonly<Record<string, number>>): string[] | null {
  const k = c.career;
  const pc = c.parties[c.player];
  if (!k?.realStates || !pc || k.rounds >= ROUNDS.length) return null;
  const inRound = ROUNDS[k.rounds].states.filter((st) => world.states.includes(st));
  const states = [...new Set(wanted)].filter((st) => inRound.includes(st as StateId));
  if (states.length === 0 || states.some((st) => stakes[st] === undefined)) return null;
  const total = states.reduce((a, st) => a + stakes[st], 0);
  if (total > pc.funds) return null;
  pc.funds -= total;
  resolveStatePolls(world, c, choice, states);
  return states;
}

/** The campaign for a state election fought in person: a state election of its own, led by the same party and the same kind of leader. */
export function startAside(parent: Campaign, stateWorld: World, state: StateId): Campaign {
  let h = 0x811c9dc5;
  for (const ch of state) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
  const seed = ((parent.rng ^ h) >>> 0) || 1;
  const backstory = parent.team.leader.backstory ?? null;
  const nested = newCampaign(stateWorld, { player: parent.player, difficulty: parent.difficulty, seed, backstory });
  // A party founded from nothing fights as a new party does in any single contest: an ordinary leader unless the player chose a past, and a purse of its own.
  if (parent.career?.founded) {
    nested.newParty = true;
    if (!backstory) nested.team.leader = neutralLeader();
    nested.parties[parent.player]!.funds = stakeFor(stateWorld, parent.player, true);
  }
  return nested;
}

/** Who governs the state after the election: whoever formed its government, or if no one did, the largest party. */
export function stateWinner(stateWorld: World, nested: Campaign): number {
  const outcome = nested.formation?.outcome;
  if (outcome) return outcome.pm;
  const tally = (electionResult(stateWorld, nested) ?? lastElection(stateWorld)).tally;
  let best = 0;
  for (let p = 1; p < tally.length; p++) if (p !== OTH && tally[p] > tally[best]) best = p;
  return best;
}

/**
 * The state election is over: the party takes back the money it did not spend, the state's government is recorded as the
 * election decided it, and the career is told what happened. Done to the parked career.
 */
export function settleAside(parent: Campaign, nested: Campaign, stateWorld: World, state: StateId): StateResult {
  const k = parent.career!;
  const me = parent.player;
  const winner = stateWinner(stateWorld, nested);
  const held = electionResult(stateWorld, nested) ?? lastElection(stateWorld);
  const seats = held.tally[me] ?? 0;
  parent.parties[me]!.funds += Math.max(0, nested.parties[me]?.funds ?? 0);
  const result: StateResult = { state, winner, was: k.states[state], vote: { seats: [...held.tally], before: [...lastElection(stateWorld).tally], inPerson: true } };
  applyStateResults(parent, [result]);
  pushNews(parent, { party: me, key: 'news.states.fought', vars: { state: `@states:${state}`, seats, party: ref.party(winner) }, tone: winner === me ? 'good' : 'neutral' });
  // A leader whose party has lost faith in them is out, whatever the state election did.
  if (parent.parties[me]!.unity <= OUSTED_BELOW) endCareer(parent, 'ousted');
  return result;
}

/** How many seats the player's party won in the state election just fought, for the career's own record of it. */
export const seatsWon = (stateWorld: World, nested: Campaign): number => (electionResult(stateWorld, nested) ?? lastElection(stateWorld)).tally[nested.player] ?? 0;
