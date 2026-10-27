import type { BackstoryId } from './types';

// Permanent starting archetypes a player can buy with Legacy Points (see src/state/profile.ts
// for the points economy). Each wraps one of the game's own backstories in perks.ts with a
// name and a cost of its own, rather than widening BackstoryId itself.

export interface Archetype {
  id: string;
  label: string;
  backstory: BackstoryId;
  cost: number;
  /** The passive HQ perk this archetype starts with (see PERKS below). */
  perk: string;
}

export const ARCHETYPES: Archetype[] = [
  { id: 'technocratPlus', label: 'Technocrat', backstory: 'technocrat', cost: 20, perk: 'policyEdge' },
  { id: 'grassrootsJaguh', label: 'Grassroots Jaguh', backstory: 'organiser', cost: 20, perk: 'groundEdge' },
  { id: 'youthIcon', label: 'Youth Icon', backstory: 'firebrand', cost: 30, perk: 'socialEdge' },
  { id: 'partyWarlord', label: 'Party Warlord', backstory: 'fixer', cost: 40, perk: 'machineEdge' },
];

export const archetypeOf = (id: string): Archetype | undefined => ARCHETYPES.find((a) => a.id === id);

/** Archetypes a profile's unlocked list has already bought. */
export const unlockedArchetypes = (unlocked: readonly string[]): Archetype[] => ARCHETYPES.filter((a) => unlocked.includes(a.id));

/** Passive HQ perks unlocked archetypes can carry. A one-line description each; the numeric effect is applied where each perk's own system reads `src/state/profile.ts`'s `isUnlocked`. */
export const PERKS: Record<string, string> = {
  policyEdge: 'Policy papers land a little better in every seat.',
  groundEdge: 'Branch machinery builds a little faster.',
  socialEdge: 'Social media posts decay a little slower.',
  machineEdge: 'Starts with extra branch machinery in the home state.',
};
