import { Rng } from '../rng';
import type { Campaign, Career } from './types';

// The House is not a row of party labels. It has a Speaker, who is someone, and whose sympathies are not always where they should
// be; and it has backbenchers, who do not always do as the whips say, and say so loudest when their party is not at peace.

/** Invented names for Speakers. Proper nouns; the same in every language. */
export const SPEAKER_NAMES = [
  'Tan Sri Abdul Rahman Hashim', 'Dato’ Seri Lee Kok Wai', 'Datuk Mary Anak Jimbun', 'Tan Sri Rajendran Nair', 'Puan Sri Zaleha Omar', 'Datuk Awang Haji Salleh',
];

export interface Speaker { name: number; lean: number }

/** How far the Speaker’s sympathies tip the wavering and a tied House, and the share of backbenchers who rebel when their party is not at peace. */
export const CHAMBER = { tip: 0.06, rebel: 0.3, calm: 55, committee: 0.08 };

/** The Speaker of this parliament, chosen the first time they are looked at: someone, with a lean towards the government, away from it, or neither. */
export function speakerOf(c: Campaign): Speaker {
  const k = c.career!;
  if (!k.speaker) {
    const rng = new Rng(((c.seed ^ 0x5bea) + k.term * 4099) >>> 0);
    k.speaker = { name: rng.int(SPEAKER_NAMES.length), lean: [-0.5, 0, 0.5][rng.int(3)] };
  }
  return k.speaker;
}

/** The Speaker’s sympathies, as a word, from -1 to 1: against the government, fair, for it. */
export const leanWord = (lean: number): 'against' | 'fair' | 'for' => (lean < -0.2 ? 'against' : lean > 0.2 ? 'for' : 'fair');

/** The share of a party’s members who will not vote as they are told, from nothing in a party at peace to 30% in one in uproar. */
export const rebelShare = (unity: number): number => Math.min(CHAMBER.rebel, Math.max(0, (CHAMBER.calm - unity) / 100));

export const speakerTip = (c: Campaign): number => (c.career ? speakerOf(c).lean * CHAMBER.tip : 0);
export type { Career };
