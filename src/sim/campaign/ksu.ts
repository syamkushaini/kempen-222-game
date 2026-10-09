import { Rng } from '../rng';
import { clamp } from '../math';
import { pushNews } from './news';
import { aides, freeName, isPm } from './office';
import type { Campaign, Career } from './types';

// The head of the civil service has views, and a career longer than the government’s. They draft the bills, advise on the
// budget and decide how quickly an instruction becomes a fact. Whether they are cautious, reforming or political shapes how
// fast things move; how much they trust the government decides whether they help, and whether the papers hear what was said in the room.

export const KSU_OUTLOOKS = ['reformist', 'cautious', 'political'] as const;
export type KsuOutlook = (typeof KSU_OUTLOOKS)[number];

export const KSU = {
  /** What a bill takes more or less to draft, in weeks, by outlook and what the bill is. */
  slow: 2, quick: 2, costly: 3,
  /** The weekly chance, below this trust, that something said in the room is in the papers by morning; what it costs. */
  leakBelow: 25, leakChance: 0.015, leakTrust: 4, leakCredibility: 2,
  /** What a political head of the service adds to the government’s steadiness each week. */
  steadies: 0.01,
  /** Trust moves: following their advice, overriding it, and putting a new head in. */
  follow: 6, override: -12, replaced: 50, replaceStability: -3,
};

/** Who heads the civil service, chosen the first time they are looked at. */
export function ksuOf(c: Campaign): NonNullable<Career['ksu']> {
  const k = c.career!;
  if (!k.ksu) {
    const rng = new Rng(((c.seed ^ 0x45b1) + k.term * 8191) >>> 0);
    k.ksu = { name: freeName(rng, new Set([...k.cabinet.map((m) => m.name), ...aides(k)])), outlook: KSU_OUTLOOKS[rng.int(KSU_OUTLOOKS.length)], trust: 50 };
  }
  return k.ksu;
}

/** How many weeks more or fewer a bill takes to draft under this head of the service: slow with costly bills if cautious, quick with reform if reforming. */
export function draftingShift(reform: boolean, cost: number, outlook: KsuOutlook): number {
  if (outlook === 'cautious') return cost >= KSU.costly ? KSU.slow : 0;
  if (outlook === 'reformist') return reform ? -KSU.quick : 0;
  return 0;
}

/** A week of the civil service: a head with no trust in the government talks, and a political one steadies it. */
export function ksuWeek(c: Campaign, rng: Rng): void {
  const k = c.career!;
  if (!isPm(c)) return;
  const h = ksuOf(c);
  if (h.outlook === 'political') k.government.stability = clamp(k.government.stability + KSU.steadies, 5, 95);
  if (h.trust < KSU.leakBelow && rng.next() < KSU.leakChance) {
    k.government.trust = clamp(k.government.trust - KSU.leakTrust, 0, 100);
    k.credibility = clamp(k.credibility - KSU.leakCredibility, 0, 100);
    pushNews(c, { party: c.player, key: 'news.ksu.leak', vars: {}, tone: 'bad' });
  }
}

/** Moves the head of the service’s trust in the government. */
export function shiftKsu(c: Campaign, n: number): void {
  const h = ksuOf(c);
  h.trust = clamp(h.trust + n, 0, 100);
}

/** A new head of the service: another outlook, and no history with the government. */
export function replaceKsu(c: Campaign): void {
  const k = c.career!;
  const old = ksuOf(c);
  const rng = new Rng(((c.seed ^ 0x77e3) + k.week * 131 + old.name) >>> 0);
  const outlooks = KSU_OUTLOOKS.filter((o) => o !== old.outlook);
  k.ksu = { name: freeName(rng, new Set([...k.cabinet.map((m) => m.name), ...aides(k)])), outlook: outlooks[rng.int(outlooks.length)], trust: KSU.replaced };
  k.government.stability = clamp(k.government.stability + KSU.replaceStability, 5, 95);
}
