import type { World } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { scaled } from './actions';
import { governmentFalls } from './career';
import { houseTally } from './contests';
import { addScene, relation, shiftRelation, shiftUnity } from './diplomacy';
import { ULTIMATUM_MONEY } from './events';
import { pushNews, ref } from './news';
import type { Campaign, Scene } from './types';

// Partners in the player's government do not simply stay until the numbers
// fail. Each one that is cold-shouldered, kept waiting for what it was
// promised, or tied to a government that is shaky or disliked, drifts towards
// the door, and the player can watch it happen: first the papers notice, then
// the partner's leader comes with an ultimatum, and if nothing changes it walks.

/** A partner's progress towards walking out runs from 0 to 100. The papers notice at the first mark; the ultimatum comes at the second. */
export const PLOT = { murmur: 35, ultimatum: 65, walk: 100 };

/** A government steadier than this loses a partner to the door; one less steady loses it to the other side. */
export const CROSS_BELOW = 35;

/** Where a partner goes when it leaves a government that is falling apart: to the largest party outside it, whose leader takes it in. */
function crossesTo(world: World, c: Campaign, p: number): number {
  const g = c.career!.government;
  const seats = houseTally(world, c);
  return seats.map((n, q) => ({ n, q })).filter(({ n, q }) => n > 0 && q !== g.pm && q !== p && !g.partners.includes(q) && c.parties[q]).sort((a, b) => b.n - a.n)[0]?.q ?? -1;
}

/** How far the other partners step back when one of them goes to the leader with an ultimatum. */
const WAIT = 20;

export type PartnerMood = 'content' | 'restless' | 'plotting';

export const plotOf = (c: Campaign, p: number): number => c.career?.plots?.[p] ?? 0;
export const partnerMood = (c: Campaign, p: number): PartnerMood => {
  const n = plotOf(c, p);
  return n < PLOT.murmur ? 'content' : n < PLOT.ultimatum ? 'restless' : 'plotting';
};

function setPlot(c: Campaign, p: number, n: number): void {
  const k = c.career!;
  const plots = (k.plots ??= {});
  if (n <= 0) delete plots[p]; else plots[p] = clamp(n, 0, PLOT.walk);
  if (Object.keys(plots).length === 0) delete k.plots;
}

/** What pushes a partner towards the door this week: nothing, if it has no complaint. */
export function plotPressure(c: Campaign, p: number): number {
  const k = c.career!;
  const g = k.government;
  const overdue = k.obligations.filter((o) => o.party === p && !o.done && o.due < k.week).length;
  return (
    // Its own grievances count for most: the state of the government is everyone's, and would send them all at once.
    0.7 * clamp((10 - relation(c, g.pm, p)) / 60, 0, 1) + // cold-shouldered
    0.5 * Math.min(2, overdue) +                           // promises left to slide
    0.3 * clamp((50 - g.stability) / 40, 0, 1) +           // a government that looks like falling
    0.1 * clamp((40 - g.trust) / 40, 0, 1)                 // a government the public dislikes
  );
}

/** A week in the life of the player's government: each partner moves towards the door or back from it. */
export function plotsWeek(world: World, c: Campaign): void {
  const k = c.career;
  if (!k || c.phase !== 'term' || k.government.pm !== c.player || k.limited) { if (k?.plots) delete k.plots; return; }
  const g = k.government;
  for (const p of [...g.partners]) {
    if (!g.partners.includes(p)) continue;
    const was = plotOf(c, p);
    const pressure = plotPressure(c, p);
    const now = clamp(was + (pressure > 0 ? pressure : -0.5), 0, PLOT.walk);
    setPlot(c, p, now);
    if (was < PLOT.murmur && now >= PLOT.murmur) {
      pushNews(c, { party: p, key: 'news.plot.murmur', vars: { party: ref.party(p), leader: ref.leader(p) }, tone: 'bad' });
    } else if (was < PLOT.ultimatum && now >= PLOT.ultimatum) {
      addScene(c, { kind: 'event', from: p, event: 'ultimatum' });
      // A government that looks like falling is told, in so many words, where the partner will go if it does.
      if (g.stability < CROSS_BELOW) pushNews(c, { party: p, key: 'news.plot.warning', vars: { party: ref.party(p) }, tone: 'bad' });
      // The others wait to see what this one gets.
      for (const q of g.partners) if (q !== p) setPlot(c, q, plotOf(c, q) - WAIT);
    } else if (now >= PLOT.walk) {
      setPlot(c, p, 0);
      const to = g.stability < CROSS_BELOW ? crossesTo(world, c, p) : -1;
      if (to >= 0) {
        shiftRelation(c, p, to, 20);
        shiftRelation(c, c.player, p, -15);
        pushNews(c, { party: p, key: 'news.plot.crossed', vars: { party: ref.party(p), to: ref.party(to) }, tone: 'bad' });
      }
      governmentFalls(world, c, p);
      if (c.phase !== 'term') return;
    }
  }
  // Whoever has left, or been left, takes their plotting with them.
  for (const key of Object.keys(k.plots ?? {})) if (!g.partners.includes(Number(key))) setPlot(c, Number(key), 0);
}

/** The chance a partner told to do its worst backs down: better for a steady government and a leader it does not hate. */
export function bluffChance(c: Campaign, p: number): number {
  const g = c.career!.government;
  return clamp(0.2 + g.stability / 200 + (relation(c, g.pm, p) + 100) / 500, 0.15, 0.8);
}

/**
 * The player's answer to a partner's ultimatum: buy it off, give it what it wants, or call its bluff. A bluff that
 * is called sends the partner out of the government there and then.
 */
export function resolveUltimatum(world: World, c: Campaign, scene: Scene, choice: number): void {
  const k = c.career;
  const p = scene.from;
  if (!k || p === null || !k.government.partners.includes(p)) return;
  const me = c.player;
  const pc = c.parties[me]!;
  let key = `event.ultimatum.r${choice}`;
  let tone: 'good' | 'bad' | 'neutral' = 'neutral';
  if (choice === 0) {
    pc.funds -= Math.min(pc.funds, scaled(world, ULTIMATUM_MONEY));
    k.credibility = clamp(k.credibility - 1, 0, 100);
    shiftRelation(c, me, p, 8);
    setPlot(c, p, 0);
  } else if (choice === 1) {
    shiftUnity(c, me, -6);
    k.government.stability = clamp(k.government.stability + 4, 5, 95);
    shiftRelation(c, me, p, 10);
    setPlot(c, p, 0);
  } else {
    const rng = new Rng(c.rng);
    const backsDown = rng.next() < bluffChance(c, p);
    c.rng = rng.state;
    key += backsDown ? 'w' : 'l';
    tone = backsDown ? 'good' : 'bad';
    if (backsDown) {
      shiftRelation(c, me, p, -10);
      k.government.stability = clamp(k.government.stability + 2, 5, 95);
      setPlot(c, p, plotOf(c, p) - 25);
    } else {
      setPlot(c, p, 0);
      pushNews(c, { party: me, key, tone });
      governmentFalls(world, c, p);
      return;
    }
  }
  pushNews(c, { party: me, key, tone });
}
