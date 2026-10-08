import type { World } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { addScene } from './diplomacy';
import { pushNews, ref } from './news';
import type { Campaign, Scene, SeatResults } from './types';

// Every few parliaments the boundaries are drawn again. The Election Commission does the drawing, and the government of
// the day has a say, whatever anyone says about that. Left alone the commission moves a few voters between neighbouring
// seats at random; asked, it moves them where they do the government's party most good: some of the safest seats' voters
// into the narrowest seats held by the other side. The price of asking is public trust and credibility, and the
// opposition remembers it.

/** The term after which boundaries are redrawn: every third parliament, starting with the fourth. */
export const REDRAW_EVERY = 3;
/** The week of a term in which the question is put, if the next term is one that is redrawn. */
export const REDRAW_WEEK = 200;

/** Whether the term now running is the one before a redraw. */
export const redrawNext = (c: Campaign) => !!c.career && c.career.term % REDRAW_EVERY === 0;

/** What a redraw touches: a share of the seats, paired off inside their own states. */
export const REDRAW_SHARE = 0.06;
/** How far two paired seats are mixed. */
export const MIX = { fair: [0.12, 0.25], pushed: [0.3, 0.3] } as const;

/** The party that heads the government, if the player is not in charge of what is asked. */
const headOf = (c: Campaign) => c.career!.government.pm;

/** Puts the question, in the week it falls due, once a term: to the player if they head the government, otherwise the government decides. */
export function redrawWeek(c: Campaign): void {
  const k = c.career;
  if (!k || c.phase !== 'term' || !redrawNext(c) || k.week < REDRAW_WEEK || k.flags.includes(`redraw${k.term}`) || c.inbox.length > 0) return;
  k.flags.push(`redraw${k.term}`);
  const pm = headOf(c);
  if (pm === c.player && !k.limited) { addScene(c, { kind: 'redraw', from: null }); return; }
  // Someone else's government: it asks the commission for what suits it about half the time.
  const rng = new Rng((c.rng ^ 0x7edea1) + k.week);
  c.rng = rng.state;
  const asked = rng.next() < 0.5;
  k.redraw = { by: asked ? pm : null };
  pushNews(c, { party: asked ? pm : null, key: asked ? 'news.redraw.rival' : 'news.redraw.fair', vars: { party: ref.party(pm) }, tone: asked ? 'bad' : 'neutral' });
}

/** The player's answer: leave it to the commission, or ask it for a map that suits the party. */
export function resolveRedraw(c: Campaign, _scene: Scene, choice: number): void {
  const k = c.career;
  if (!k) return;
  if (choice === 1) {
    k.redraw = { by: c.player };
    k.government.trust = clamp(k.government.trust - 6, 0, 100);
    k.credibility = clamp(k.credibility - 3, 0, 100);
    pushNews(c, { party: c.player, key: 'news.redraw.asked', vars: {}, tone: 'neutral' });
  } else {
    k.redraw = { by: null };
    pushNews(c, { party: c.player, key: 'news.redraw.left', vars: {}, tone: 'good' });
  }
}

/** Mixes seat `b` into seat `a` by `f`, keeping the total of `a`'s votes: a share of its voters is now drawn from `b`'s side of the line. */
function mixInto(votes: number[][], a: number, b: number, f: number): number[] {
  const totalA = votes[a].reduce((x, y) => x + y, 0);
  const totalB = votes[b].reduce((x, y) => x + y, 0) || 1;
  return votes[a].map((v, p) => Math.round(totalA * ((1 - f) * (v / (totalA || 1)) + f * (votes[b][p] / totalB))));
}

const winnerOf = (row: number[]) => row.indexOf(Math.max(...row));
const shareOf = (row: number[], p: number) => row[p] / (row.reduce((x, y) => x + y, 0) || 1);

/**
 * Draws the boundaries again, in the results the next term is fitted to. `by` is the party that asked for a map that
 * suits it, or null for the commission left alone. Returns the results as redrawn and how many seats changed hands.
 */
export function redraw(world: World, results: SeatResults, by: number | null, rng: Rng): { results: SeatResults; flipped: number } {
  const votes = results.votes.map((r) => [...r]);
  const n = world.seats.length;
  const pairs = Math.max(1, Math.round((n * REDRAW_SHARE) / 2));
  const used = new Set<number>();
  const done: [number, number, number][] = [];
  const free = (i: number) => !used.has(i);

  if (by === null) {
    // Left alone: neighbours in the same state, mixed a little, at random.
    for (const st of rng.shuffled(world.states)) {
      const seats = rng.shuffled(world.seatsByState[st]);
      for (let k = 0; k + 1 < seats.length && done.length < pairs; k += 2) {
        const [a, b] = [seats[k], seats[k + 1]];
        done.push([a, b, MIX.fair[0] + (MIX.fair[1] - MIX.fair[0]) * rng.next()]);
        used.add(a); used.add(b);
      }
      if (done.length >= pairs) break;
    }
  } else {
    // Asked: the favoured party's safest seats lend voters to the narrowest seats the other side holds.
    const margin = (i: number) => { const r = votes[i]; const w = winnerOf(r); const second = Math.max(...r.filter((_, p) => p !== w)); return (r[w] - second) / (r.reduce((x, y) => x + y, 0) || 1); };
    for (const st of world.states) {
      const mine = world.seatsByState[st].filter((i) => winnerOf(votes[i]) === by && margin(i) > 0.15).sort((x, y) => margin(y) - margin(x));
      const theirs = world.seatsByState[st].filter((i) => winnerOf(votes[i]) !== by && margin(i) < 0.12 && shareOf(votes[i], by) > 0.2).sort((x, y) => margin(x) - margin(y));
      for (let k = 0; k < Math.min(mine.length, theirs.length); k++) {
        if (done.length >= pairs) break;
        if (!free(mine[k]) || !free(theirs[k])) continue;
        done.push([theirs[k], mine[k], MIX.pushed[0]]);
        used.add(mine[k]); used.add(theirs[k]);
      }
    }
  }

  // The seats are mixed both ways, from the votes as they stood before any of the mixing.
  const before = votes.map((r) => [...r]);
  let flipped = 0;
  for (const [a, b, f] of done) {
    const snapshot = before;
    votes[a] = mixInto(snapshot, a, b, f);
    // The seat that lends voters takes a few of its neighbour's in return when the map is left to the commission; when it is asked for, it keeps its own.
    votes[b] = by === null ? mixInto(snapshot, b, a, f) : before[b];
  }
  for (let i = 0; i < n; i++) if (winnerOf(votes[i]) !== winnerOf(before[i])) flipped++;
  const basis = results.basis.map((b, i) => (b && used.has(i) ? null : b));
  return { results: { votes, turnout: [...results.turnout], basis }, flipped };
}

