import type { World } from '../election';
import { N_BLOCS } from '../types';
import { shiftUnity } from './diplomacy';
import { pushNews } from './news';
import { alignment, blocSizes } from './policy';
import type { Campaign } from './types';

// Every week of a term the leader's conduct is judged on five things, and the party's credibility and unity move by a point with it:
// all five sound and the week earns a point of each, two or fewer and it costs a point of each, and in between nothing changes.
// What is earned stops at a good name and not a perfect one (credibility and unity do not climb past CEILING this way), what is lost
// does not. It is the slow way back that credibility never had.

export const CHECK_IDS = ['manifesto', 'voters', 'orders', 'team', 'funded'] as const;
export type CheckId = (typeof CHECK_IDS)[number];
/** The stances may not have moved further than this from where the manifesto put them, on any issue. */
export const U_TURN = 1;
/** All five sound earns a point; this many or fewer costs one. A leader who has done nothing wrong but hired no one is not yet doing it right. */
export const GOOD = 5, BAD = 2;
/** What a week's conduct can build credibility and unity up to. */
export const CEILING = 85;

export interface Conduct { week: number; ok: boolean[]; delta: -1 | 0 | 1 }

/** The five checks of a week, in the order of `CHECK_IDS`. `paid` is the share of the week's planned spending the party could meet. */
export function checksOf(world: World, c: Campaign, paid: number): boolean[] {
  const k = c.career!, me = c.player;
  const now = k.stances[me], then = k.stances0[me];
  const sizes = blocSizes(world);
  let weighted = 0, total = 0;
  for (let b = 0; b < N_BLOCS; b++) { weighted += sizes[b] * alignment(now, b); total += sizes[b]; }
  return [
    // The platform is the manifesto's, not turned about.
    now.every((s, i) => Math.abs(s - then[i]) <= U_TURN),
    // The platform is what the voters, taken together, want more than they do not.
    total > 0 && weighted / total > 0,
    // No easy money from donors, no state resources taken for the party.
    k.orders.donors === 0 && k.orders.state === 0,
    // A team that is hired and paid.
    !c.team.unpaid && c.team.staff.some((s) => s !== null),
    // What the party's orders cost can be paid in full.
    paid >= 1,
  ];
}

/** Judges the week, moves credibility and unity, keeps what was found for the party tab, and says so in the news when it turns. */
export function conductWeek(world: World, c: Campaign, paid: number): void {
  const k = c.career;
  const pc = c.parties[c.player];
  if (!k || !pc || c.phase !== 'term') return;
  const ok = checksOf(world, c, paid);
  const passes = ok.filter(Boolean).length;
  const delta: -1 | 0 | 1 = passes >= GOOD ? 1 : passes <= BAD ? -1 : 0;
  if (delta === 1) {
    if (k.credibility < CEILING) k.credibility = Math.min(CEILING, k.credibility + 1);
    if (pc.unity < CEILING) shiftUnity(c, c.player, Math.min(1, CEILING - pc.unity));
  } else if (delta === -1) {
    k.credibility = Math.max(0, k.credibility - 1);
    shiftUnity(c, c.player, -1);
  }
  const before = k.conduct?.delta ?? 0;
  k.conduct = { week: k.week, ok, delta };
  if (delta !== before && delta !== 0) pushNews(c, { party: c.player, key: delta === 1 ? 'news.conduct.good' : 'news.conduct.bad', tone: delta === 1 ? 'good' : 'bad' });
}
