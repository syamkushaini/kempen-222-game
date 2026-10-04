import type { World } from '../election';
import { clamp } from '../math';
import { PARTY_IDS } from '../types';
import { DEMANDS, clashWith, consistent } from './cast';
import type { Campaign, DemandId, Formation, Offer, SeniorId } from './types';

// What a head of government has left to give, and whether an offer can be kept.

const OTH = PARTY_IDS.indexOf('oth');
/** The share of the cabinet a head of government must keep for their own party. */
const KEEP = 0.35;

const rules = (world: World) => world.rules.formation!;

export const signedWith = (f: Formation, bloc: number, k: number) =>
  bloc === OTH ? f.indep.some((i) => i.pledge === k) : f.pledge[bloc] === k;

/** Deals a claimant has already struck: the offers accepted by parties signed up to it. */
export function struck(f: Formation, k: number, except: number): Offer[] {
  const out: Offer[] = [];
  f.pledge.forEach((to, p) => { if (to === k && p !== k && p !== except && p !== OTH && f.offers[k][p]) out.push(f.offers[k][p]!); });
  if (except !== OTH && f.offers[k][OTH] && f.indep.some((i) => i.pledge === k)) out.push(f.offers[k][OTH]!);
  return out;
}

export function postsLeft(world: World, f: Formation, k: number, except: number): number {
  const r = rules(world);
  return r.cabinet - Math.ceil(r.cabinet * KEEP) - struck(f, k, except).reduce((a, o) => a + o.posts, 0);
}

/** Posts the head of government's own party would be left with after an offer of `posts` to `bloc`. */
export function postsKept(world: World, f: Formation, k: number, bloc: number, posts: number): number {
  return rules(world).cabinet - struck(f, k, bloc).reduce((a, o) => a + o.posts, 0) - posts;
}

export function seniorsFree(world: World, f: Formation, k: number, except: number): SeniorId[] {
  const taken = struck(f, k, except).map((o) => o.senior);
  return rules(world).seniors.filter((s) => !taken.includes(s));
}

const onOffer = (world: World) => (Object.keys(DEMANDS) as DemandId[]).filter((d) => DEMANDS[d].kinds.includes(world.rules.kind));

/** Concessions a claimant can still promise a party: not given to another alone, and not contradicting one already promised. */
export function demandsOpen(world: World, f: Formation, k: number, except: number): DemandId[] {
  const taken = struck(f, k, except).flatMap((o) => o.demands);
  return onOffer(world).filter((d) => !(DEMANDS[d].exclusive && taken.includes(d)) && !clashWith(d, taken));
}

/** Concessions closed to a party because they contradict a promise to another partner: [concession] is that promise. */
export function demandsBarred(world: World, f: Formation, k: number, except: number): Partial<Record<DemandId, DemandId>> {
  const taken = struck(f, k, except).flatMap((o) => o.demands);
  const out: Partial<Record<DemandId, DemandId>> = {};
  for (const d of onOffer(world)) { const other = clashWith(d, taken); if (other) out[d] = other; }
  return out;
}

/** `conflict`: the offer contradicts itself. `conflictDeal`: it contradicts a promise to another partner. */
export type OfferProblem = 'posts' | 'senior' | 'conflict' | 'conflictDeal' | 'demand' | 'cash';

/** Checks that the player can actually deliver an offer. Money already handed to this party counts towards it. */
export function offerProblem(world: World, c: Campaign, bloc: number, offer: Offer): OfferProblem | null {
  const f = c.formation!;
  const me = c.player;
  if (offer.posts < 0 || !Number.isInteger(offer.posts) || offer.posts > postsLeft(world, f, me, bloc)) return 'posts';
  if (offer.senior && !seniorsFree(world, f, me, bloc).includes(offer.senior)) return 'senior';
  if (consistent(offer.demands).length < offer.demands.length) return 'conflict';
  const barred = demandsBarred(world, f, me, bloc);
  if (offer.demands.some((d) => barred[d])) return 'conflictDeal';
  const open = demandsOpen(world, f, me, bloc);
  if (offer.demands.some((d) => !open.includes(d))) return 'demand';
  const paid = signedWith(f, bloc, me) ? f.offers[me][bloc]?.cash ?? 0 : 0;
  if (offer.cash < 0 || offer.cash - paid > c.parties[me]!.funds) return 'cash';
  return null;
}

/**
 * An offer cut down to what its maker can still deliver. An offer left on the
 * table may promise a post or a concession that has since gone to someone
 * else, or that contradicts what someone else was promised; nobody signs for
 * that part.
 */
export function deliverable(world: World, f: Formation, k: number, bloc: number, offer: Offer): Offer {
  const seniors = seniorsFree(world, f, k, bloc);
  const open = demandsOpen(world, f, k, bloc);
  return {
    posts: clamp(offer.posts, 0, Math.max(0, postsLeft(world, f, k, bloc))),
    senior: offer.senior && seniors.includes(offer.senior) ? offer.senior : null,
    demands: consistent(offer.demands.filter((d) => open.includes(d))),
    cash: offer.cash,
  };
}
