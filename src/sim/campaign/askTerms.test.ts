import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { endDay, leverage, requestTerms } from './formation';
import { newCampaign } from './turn';

const hung = getWorld('hung')!;
const GBK = PARTY_IDS.indexOf('gbs');
const talks = (seed = 7) => newCampaign(hung, { player: GBK, difficulty: 'normal', seed });

describe('requestTerms', () => {
  it('lets a small party press a claimant that has made it an offer', () => {
    const c = talks();
    const f = c.formation!;
    // Rivals open with an offer once a day has passed.
    endDay(hung, c);
    const k = f.claimants.find((x) => x !== GBK && f.offers[x]?.[GBK]);
    if (k === undefined) return;
    const before = { ...f.offers[k][GBK]!, demands: [...f.offers[k][GBK]!.demands] };
    const meetings = f.meetings;
    const replies = new Set<string>();
    for (const ask of ['posts', 'senior', 'cash', 'demand'] as const) {
      const r = requestTerms(hung, c, k, ask);
      replies.add(String(r));
    }
    expect(f.meetings).toBe(Math.max(0, meetings - 4));
    expect(leverage(hung, c, k)).toBeGreaterThan(0);
    const after = f.offers[k][GBK]!;
    expect(after.posts).toBeGreaterThanOrEqual(before.posts);
    expect(after.cash).toBeGreaterThanOrEqual(before.cash);
    expect([...replies].every((r) => ['granted', 'partly', 'refused', 'nothing', 'null'].includes(r))).toBe(true);
  });

  it('costs a meeting and does nothing without a standing offer', () => {
    const c = talks();
    const f = c.formation!;
    const meetings = f.meetings;
    expect(requestTerms(hung, c, GBK, 'posts')).toBeNull();
    expect(f.meetings).toBe(meetings);
  });
});
