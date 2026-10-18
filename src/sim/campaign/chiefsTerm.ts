import type { World } from '../election';
import { clamp } from '../math';
import type { Rng } from '../rng';
import type { RegionId } from '../types';
import { scaled } from './actions';
import { BRANCHES_LOST, CHIEF_NAMES, chiefOf, LOYALTY, replace } from './chiefs';
import { hasChiefs } from './ai';
import { shiftUnity } from './diplomacy';
import { pushNews, ref } from './news';
import { inGov, isPm } from './office';
import type { Campaign } from './types';

// Between elections the party's state chiefs are still people. Each one's loyalty follows how the party is doing (its unity, whether it
// governs) and how it treats them; the loyal steady the party, the restless are a drag on unity and may cross
// to a rival. The leader can win a chief over, or send one to talk to the other side and bring back votes for a bill.

export const TERM_CHIEFS = {
  court: { cost: 60_000, gain: 15, rest: 8 },
  talk: { cost: 80_000, rest: 6, deal: 0.12, cap: 0.25, base: 0.3, perSkill: 0.1 },
  /** Weekly: how far loyalty is pulled to where it ought to be, how much it jitters, the drag a restless chief puts on unity, and the branches a loyal one builds. */
  pull: 0.03, jitter: 0.8, drag: 0.003, dragMax: 0.02, loyalAt: 65, steady: 0.003, neglect: { from: 20, per: 10, max: 12 },
  /** Weekly chances: a hidden past coming out, and a chief who has had enough walking. */
  exposed: 0.003, walks: 0.004,
};

const place = (st: RegionId, world: World) => world.states.indexOf(st);

/** The chiefs' week between elections. */
export function chiefsTermWeek(world: World, c: Campaign, rng: Rng): void {
  const k = c.career;
  const pc = c.parties[c.player];
  if (!k || !pc || !hasChiefs(world)) return;
  const hold = inGov(c, c.player) ? 6 : 0, lead = isPm(c) ? 4 : 0;
  let drag = 0;
  for (const st of world.states) {
    const person = chiefOf(world, c, st);
    const vars = { name: CHIEF_NAMES[person.name], state: ref.state(st) };
    // A chief nobody has bothered with for a while drifts away: the longer since the leader last won them over, the lower they settle.
    const since = k.week - (k.chiefWeeks?.[st] ?? 0);
    const neglect = clamp((since - TERM_CHIEFS.neglect.from) / TERM_CHIEFS.neglect.per, 0, TERM_CHIEFS.neglect.max);
    const aim = 52 + (pc.unity - 50) * 0.3 + hold + lead - (person.skeleton ? 5 : 0) - neglect;
    person.loyalty = clamp(person.loyalty + (aim - person.loyalty) * TERM_CHIEFS.pull + rng.normal(0, TERM_CHIEFS.jitter), 0, 100);
    if (person.skeleton && rng.next() < TERM_CHIEFS.exposed) {
      replace(world, c, st);
      (k.chiefWeeks ??= {})[st] = k.week;
      shiftUnity(c, c.player, -1);
      pushNews(c, { party: c.player, key: 'news.chief.exposed', vars, tone: 'bad' });
      continue;
    }
    if (person.loyalty < LOYALTY.mayGo && rng.next() < TERM_CHIEFS.walks) {
      const i = place(st, world);
      const to = c.parties.map((q, p) => ({ p, m: q && p !== c.player ? q.machinery[i] : -1 })).sort((a, b) => b.m - a.m)[0];
      replace(world, c, st);
      (k.chiefWeeks ??= {})[st] = k.week;
      pc.machinery[i] = Math.max(pc.machinery[i] > 0 ? 10 : 0, pc.machinery[i] - BRANCHES_LOST);
      if (to && to.m >= 0) c.parties[to.p]!.machinery[i] = Math.min(100, to.m + BRANCHES_LOST / 2);
      shiftUnity(c, c.player, -1);
      pushNews(c, { party: c.player, key: 'news.chief.defected', vars: { ...vars, party: ref.party(to && to.m >= 0 ? to.p : c.player) }, tone: 'bad' });
      continue;
    }
    if (person.loyalty < LOYALTY.restless) drag += TERM_CHIEFS.drag;
    else if (person.loyalty >= TERM_CHIEFS.loyalAt) drag -= TERM_CHIEFS.steady;
  }
  // Unity is whole numbers: a small drag (or steadying) builds up and is felt when it adds to one.
  pc.unityDrag = (pc.unityDrag ?? 0) + Math.min(drag, TERM_CHIEFS.dragMax);
  if (pc.unityDrag >= 1) { shiftUnity(c, c.player, -1); pc.unityDrag -= 1; }
  else if (pc.unityDrag <= -1) { shiftUnity(c, c.player, 1); pc.unityDrag += 1; }
}

export type ChiefRefusal = 'phase' | 'rest' | 'funds' | 'notGov';

const cost = (world: World, n: number) => scaled(world, n);

export function courtRefusal(world: World, c: Campaign, st: RegionId): ChiefRefusal | null {
  const k = c.career, pc = c.parties[c.player];
  if (!k || !pc || c.phase !== 'term') return 'phase';
  const at = k.chiefWeeks?.[st];
  if (at !== undefined && k.week - at < TERM_CHIEFS.court.rest) return 'rest';
  if (pc.funds < cost(world, TERM_CHIEFS.court.cost)) return 'funds';
  return null;
}

/** Wins a chief over: a meeting, a dinner, a promise. Costs party funds. */
export function courtChief(world: World, c: Campaign, st: RegionId): boolean {
  if (courtRefusal(world, c, st)) return false;
  const k = c.career!, pc = c.parties[c.player]!;
  const person = chiefOf(world, c, st);
  pc.funds -= cost(world, TERM_CHIEFS.court.cost);
  person.loyalty = clamp(person.loyalty + TERM_CHIEFS.court.gain, 0, 100);
  (k.chiefWeeks ??= {})[st] = k.week;
  return true;
}

export function talkRefusal(world: World, c: Campaign): ChiefRefusal | null {
  const k = c.career, pc = c.parties[c.player];
  if (!k || !pc || c.phase !== 'term') return 'phase';
  if (!isPm(c)) return 'notGov';
  if (k.chiefTalk !== undefined && k.week - k.chiefTalk < TERM_CHIEFS.talk.rest) return 'rest';
  if (pc.funds < cost(world, TERM_CHIEFS.talk.cost)) return 'funds';
  return null;
}

/** The chance a chief comes back with votes: an able, loyal chief is believed on the other side. */
export const talkOdds = (world: World, c: Campaign, st: RegionId): number => {
  const p = chiefOf(world, c, st);
  return clamp(TERM_CHIEFS.talk.base + TERM_CHIEFS.talk.perSkill * (p.skill - 3) + (p.loyalty - 50) / 400, 0.1, 0.85);
};

/** Sends a chief across the floor to win votes for the next bill. It may come off or it may be a rebuff in the papers. */
export function sendChief(world: World, c: Campaign, st: RegionId, rng: Rng): boolean {
  if (talkRefusal(world, c)) return false;
  const k = c.career!, pc = c.parties[c.player]!;
  const person = chiefOf(world, c, st);
  pc.funds -= cost(world, TERM_CHIEFS.talk.cost);
  k.chiefTalk = k.week;
  const vars = { name: CHIEF_NAMES[person.name], state: ref.state(st) };
  if (rng.next() < talkOdds(world, c, st)) {
    k.chiefDeal = Math.min(TERM_CHIEFS.talk.cap, (k.chiefDeal ?? 0) + TERM_CHIEFS.talk.deal);
    person.loyalty = clamp(person.loyalty + 3, 0, 100);
    pushNews(c, { party: c.player, key: 'news.chief.deal', vars, tone: 'good' });
  } else {
    person.loyalty = clamp(person.loyalty - 5, 0, 100);
    shiftUnity(c, c.player, -1);
    pushNews(c, { party: c.player, key: 'news.chief.rebuffed', vars, tone: 'bad' });
  }
  return true;
}
