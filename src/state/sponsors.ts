import { THANKS } from '../data/thanks';
import { call, CONFIG, headers, type Config, type Fetch } from './leaderboard';

// The top sponsors shown in "Buy me a coffee" are kept in a table of the same Supabase project as the leaderboard
// (supabase/sponsors.sql), so that they can be changed in the dashboard without publishing the game again. The game only reads
// it. Where the table cannot be reached, or is empty, the list built into the game is shown (src/data/thanks.ts).

const LONGEST = 80;
const MOST = 100;

/** The names in the table, in order, or null if it cannot be reached or says nothing usable. */
export async function fetchSponsors(cfg: Config | null = CONFIG, fetchFn: Fetch = fetch): Promise<string[] | null> {
  if (!cfg) return null;
  const res = await call(fetchFn, `${cfg.url}/rest/v1/sponsors?select=name&order=position.asc,id.asc&limit=${MOST}`, { headers: headers(cfg) });
  if (!res?.ok) return null;
  let body: unknown;
  try { body = await res.json(); } catch { return null; }
  if (!Array.isArray(body)) return null;
  const names = body
    .map((r) => (typeof r === 'object' && r !== null && typeof (r as { name?: unknown }).name === 'string' ? (r as { name: string }).name.replace(/\s+/g, ' ').trim() : ''))
    .filter((n) => n.length >= 1 && n.length <= LONGEST);
  return names.length > 0 ? names : null;
}

/** The names to show: the table's, or the game's own where the table has none to give. */
export async function sponsorNames(cfg: Config | null = CONFIG, fetchFn: Fetch = fetch): Promise<string[]> {
  return (await fetchSponsors(cfg, fetchFn)) ?? [...THANKS];
}
