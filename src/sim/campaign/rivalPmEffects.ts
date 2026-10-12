import { clamp } from '../math';
import type { Effect } from './events';
import { shiftNation } from './nation';
import { lift } from './office';
import type { Campaign } from './types';

/**
 * What an act on the economy does when it is the head of government's and not the player's. The country feels it (growth, prices, the debt,
 * the nation, the government's steadiness) and the voters answer the head of government's party; the player's own purse, credibility and
 * commitments are not touched, and the public money is borrowed (a hundred thousand is a fifth of a point of debt).
 */
export function applyRivalEffects(c: Campaign, effects: Effect[]): void {
  const k = c.career!;
  const e = k.economy;
  for (const x of effects) {
    switch (x.t) {
      case 'economy': e.growth += x.growth ?? 0; e.inflation += x.inflation ?? 0; break;
      case 'debt': e.debt = clamp(e.debt + x.n, 30, 120); break;
      case 'public': e.debt = clamp(e.debt - x.n / 500_000, 30, 120); break;
      case 'stability': k.government.stability = clamp(k.government.stability + x.n, 5, 95); break;
      case 'mood': lift(k, k.government.pm, x.blocs, x.n); break;
      case 'nation': shiftNation(k, x); break;
      default: break;
    }
  }
}
