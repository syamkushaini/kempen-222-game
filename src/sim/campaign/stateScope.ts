import { PARTY_IDS, type PartyId } from '../types';
import type { Campaign, PledgeId } from './types';

// In a career in one state, a promise must be something a state government can do. Petrol prices, the minimum wage, hospitals and the
// like are the federal government's: nobody in an assembly can table them, promise them or be held to them. The list follows the State
// List and the Concurrent List of the Federal Constitution (land, water, state roads, local government, welfare, housing, the state's
// own laws and bodies), and for Sabah and Sarawak the Ninth and Tenth Schedules, which give them more (see DESIGN.md).

/** What every state's assembly can promise. */
export const STATE_POWERS: readonly PledgeId[] = [
  'cashAid', 'graftCommission', 'termLimit', 'transitPass', 'partyHopBan', 'infoAct', 'schoolMeals', 'villageRoads', 'smeLoans', 'seniorPension',
  // Housing is a shared matter; local councils and their elections are the State List's.
  'homes', 'localVote',
];

/** What only Sabah and Sarawak can promise: a state sales tax and royalties on their oil (the Tenth Schedule) and the share of federal revenue that MA63 sets aside for them. */
const BORNEO_POWERS: readonly PledgeId[] = ['oilRoyalty', 'borneoFund', 'taxCut'];
/** Sarawak alone owns its power grid. */
const SARAWAK_POWERS: readonly PledgeId[] = ['greenGrid'];

/** What a party falls back on when too little of its usual programme is a state's to give. */
const STATE_FILL: Partial<Record<PartyId, PledgeId[]>> = {
  bp: ['villageRoads'], pt: ['seniorPension', 'villageRoads'], gbk: ['villageRoads', 'smeLoans'], gbs: ['villageRoads', 'smeLoans'], legasi: ['villageRoads', 'smeLoans'],
};

export const isStateCareer = (c: Campaign): boolean => c.scenario.startsWith('career:');

/** What the state of a career in one state can promise. */
export function powersOf(c: Campaign): readonly PledgeId[] {
  const state = c.scenario.slice('career:'.length);
  return [...STATE_POWERS, ...(state === 'sabah' || state === 'sarawak' ? BORNEO_POWERS : []), ...(state === 'sarawak' ? SARAWAK_POWERS : [])];
}

/** Whether a promise can be made and kept in this game: anything at all in a national game, only a state's powers in a state career. */
export const withinPowers = (c: Campaign, id: PledgeId): boolean => !isStateCareer(c) || powersOf(c).includes(id);

/** A manifesto cut down to what a state can do, with the party's fallbacks added where little is left. Unchanged in a national game. */
export function forPowers(c: Campaign, party: number, manifesto: readonly PledgeId[]): PledgeId[] {
  if (!isStateCareer(c)) return [...manifesto];
  const out = manifesto.filter((id) => withinPowers(c, id));
  for (const id of STATE_FILL[PARTY_IDS[party]] ?? []) if (out.length < 2 && !out.includes(id)) out.push(id);
  return out;
}
