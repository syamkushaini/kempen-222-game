import type { Campaign, Difficulty } from '../sim/campaign/types';
import { BOARD_SIZE, CONFIG, call, cleanName, headers, NAME_MIN, type Config, type Fetch } from './leaderboard';

// A board for each challenge: a result is posted, by the player's choice, against the challenge's key, and the best are
// read back. It talks to the same Supabase project as the career leaderboard (supabase/challenges.sql) with the same public
// key, and shows nothing where the game was built without one. What is sent is only what is in `ChallengeResult`.

/** What tells one challenge from another: the code of one a player made, or `set:<name>` for one of the game's own. */
export function challengeKey(c: Pick<Campaign, 'challenge'>): string | null {
  const ch = c.challenge;
  return ch?.code ?? (ch?.goal ? `set:${ch.goal}` : null);
}

export interface ChallengeResult {
  game: string;
  challenge: string;
  name: string;
  party: string;
  difficulty: Difficulty;
  seats: number;
  total_seats: number;
  vote_share: number;
  met: boolean | null;
  version: string;
}

/** A row as it is read back. */
export interface ChallengeRow extends Omit<ChallengeResult, 'game' | 'version'> { id: number; created_at: string }

const COLUMNS = 'id,created_at,name,party,difficulty,seats,total_seats,vote_share,met';

/** The result of a challenge to post, or null if the name will not do or the figures are not an election's. */
export function resultOf(
  game: string, c: Pick<Campaign, 'challenge' | 'difficulty'> & { party: string }, name: string, version: string,
  seats: number, total: number, share: number, met: boolean | null,
): ChallengeResult | null {
  const key = challengeKey(c);
  const clean = cleanName(name);
  if (!key || key.length < 4 || key.length > 80 || clean.length < NAME_MIN || !(total >= 1 && total <= 222) || !(seats >= 0 && seats <= total) || !(share >= 0 && share <= 1)) return null;
  return {
    game, challenge: key, name: clean, party: c.party, difficulty: c.difficulty, seats: Math.round(seats), total_seats: Math.round(total),
    vote_share: Math.round(share * 10_000) / 10_000, met, version: version.slice(0, 32),
  };
}

export type PostResult = 'ok' | 'again' | 'failed';

/** Posts a result. 'again' if this game is already on the board; 'failed' on any trouble, with nothing thrown. */
export async function postResult(r: ChallengeResult, cfg: Config | null = CONFIG, fetchFn: Fetch = fetch): Promise<PostResult> {
  if (!cfg) return 'failed';
  const res = await call(fetchFn, `${cfg.url}/rest/v1/challenge_scores`, {
    method: 'POST', headers: { ...headers(cfg), 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(r),
  });
  if (!res) return 'failed';
  if (res.status === 201 || res.status === 200 || res.status === 204) return 'ok';
  return res.status === 409 ? 'again' : 'failed';
}

const isRow = (x: unknown): x is ChallengeRow => {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as Record<string, unknown>;
  return typeof r.id === 'number' && typeof r.name === 'string' && typeof r.party === 'string' && [r.seats, r.total_seats, r.vote_share].every((n) => typeof n === 'number' || (typeof n === 'string' && Number.isFinite(Number(n))));
};

/** The best results of one challenge, best first: most seats, then the biggest share of the vote, then whoever posted first. null if the board cannot be reached. */
export async function topResults(challenge: string, cfg: Config | null = CONFIG, fetchFn: Fetch = fetch): Promise<ChallengeRow[] | null> {
  if (!cfg || challenge.length < 4 || challenge.length > 80) return null;
  const q = `select=${COLUMNS}&challenge=eq.${encodeURIComponent(challenge)}&order=seats.desc,vote_share.desc,created_at.asc&limit=${BOARD_SIZE}`;
  const res = await call(fetchFn, `${cfg.url}/rest/v1/challenge_scores?${q}`, { headers: headers(cfg) });
  if (!res?.ok) return null;
  let body: unknown;
  try { body = await res.json(); } catch { return null; }
  return Array.isArray(body) ? body.filter(isRow).map((r) => ({ ...r, seats: Number(r.seats), total_seats: Number(r.total_seats), vote_share: Number(r.vote_share) })) : null;
}
