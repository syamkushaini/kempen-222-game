import { PARTY_IDS, type PartyId } from '../types';
import type { Campaign, Difficulty } from './types';

// A challenge you make yourself is a contest, a party, a seed and some rules, written as a short code that can be sent to
// a friend as a link: the same seed gives the same hidden swing, so everyone who plays it faces the same election and can
// compare how they did. The code is plain text (a link to it is `#c=<code>`); nothing in it is trusted until it is read back.

export interface ChallengeSpec {
  /** A contest that is a single election: the general election, a hung parliament, a state, or a by-election in a seat (`byelection:P.061`). */
  scenario: string;
  party: PartyId;
  seed: number;
  difficulty: Difficulty;
  /** The rules on top: hidden odds, polls that mislead, a lean purse (less money to begin with and less coming in). */
  fog: boolean;
  noisy: boolean;
  lean: boolean;
  /** Weeks of campaign, where the contest's usual number is not wanted. */
  weeks?: number;
}

export const CODE_VERSION = '1';
export const WEEKS_MIN = 3;
export const WEEKS_MAX = 12;
/** What a lean purse leaves of the party's money, at the start and as it comes in. */
export const LEAN = 0.6;

const LEVELS: Record<string, Difficulty> = { e: 'easy', n: 'normal', h: 'hard' };
const LETTER = { easy: 'e', normal: 'n', hard: 'h' } as const;
const SCENARIO = /^(general|hung|state:[a-z]{3,16}|byelection(:P\.\d{3})?)$/;

/** The code for a challenge: `1~state:perak~ps~48213~h~fn~8`. */
export function encodeChallenge(s: ChallengeSpec): string {
  const rules = `${s.fog ? 'f' : ''}${s.noisy ? 'n' : ''}${s.lean ? 'l' : ''}`;
  return [CODE_VERSION, s.scenario, s.party, s.seed, LETTER[s.difficulty], rules, s.weeks ?? ''].join('~');
}

/** What a code says, or null if it is not one this game wrote: a scenario that could not be played, a party that cannot be led, a seed or length out of range. */
export function decodeChallenge(code: string): ChallengeSpec | null {
  const [version, scenario, party, seed, level, rules, weeks, ...rest] = code.trim().split('~');
  if (version !== CODE_VERSION || rest.length > 0 || weeks === undefined) return null;
  if (!SCENARIO.test(scenario) || !PARTY_IDS.includes(party as PartyId) || party === 'oth') return null;
  if (!/^\d{1,10}$/.test(seed) || Number(seed) > 0xffffffff) return null;
  const difficulty = LEVELS[level];
  if (!difficulty || !/^f?n?l?$/.test(rules)) return null;
  const n = weeks === '' ? undefined : /^\d{1,2}$/.test(weeks) ? Number(weeks) : NaN;
  if (n !== undefined && !(n >= WEEKS_MIN && n <= WEEKS_MAX)) return null;
  return {
    scenario, party: party as PartyId, seed: Number(seed), difficulty,
    fog: rules.includes('f'), noisy: rules.includes('n'), lean: rules.includes('l'),
    ...(n !== undefined ? { weeks: n } : {}),
  };
}

/** What tells one challenge from another: the code of one a player made, or `set:<name>` for one of the game's own; null for a game that is no challenge. */
export function challengeKey(c: Pick<Campaign, 'challenge'>): string | null {
  const ch = c.challenge;
  return ch?.code ?? (ch?.goal ? `set:${ch.goal}` : null);
}

/** The link to a challenge on the page the game is served from. */
export const challengeLink = (code: string, base: string): string => `${base.replace(/#.*$/, '')}#c=${code}`;

/** The code in a page address (`#c=...`), or null. */
export function codeInAddress(hash: string): string | null {
  const m = /^#c=([^&]+)/.exec(hash);
  if (!m) return null;
  try { return decodeURIComponent(m[1]); } catch { return null; }
}
