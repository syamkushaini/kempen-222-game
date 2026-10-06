import type { Verdict } from '../sim/campaign/night';

/**
 * How the card speaks. A big, clean win gets the proud word; a squeaker, a loss and everything in between gets the
 * game's own dry wit. The headline is a shout that is never mocking, whatever happened: a loss says "still standing".
 */
export type Tone = 'grand' | 'cheeky';

export interface Result {
  verdict: Verdict;
  seats: number;
  before: number;
  /** The seats in the contest, and how many make a majority. */
  total: number;
  majority: number;
  /** A by-election: the winner's lead over the runner-up, as a share of the vote. */
  margin: number;
}

export function toneOf(r: Result): Tone {
  switch (r.verdict) {
    case 'majority': return r.seats >= r.majority + 10 ? 'grand' : 'cheeky';
    case 'largest': return r.seats >= 0.4 * r.total ? 'grand' : 'cheeky';
    case 'gained': return (r.seats - r.before) / r.total >= 0.08 ? 'grand' : 'cheeky';
    case 'won': return r.margin >= 0.02 ? 'grand' : 'cheeky';
    default: return 'cheeky';
  }
}

/** The keys of the headline and of the line under it. */
export function voiceOf(r: Result): { shout: string; line: string; tone: Tone } {
  const tone = toneOf(r);
  return { shout: `card.shout.${r.verdict}`, line: `card.line.${r.verdict}.${tone}`, tone };
}
