import { describe, expect, it } from 'vitest';
import { getWorld, worldOf } from '../../data/world';
import { PARTY_IDS } from '../types';
import { nextTerm, startCareer, termWeek, TERM_WEEKS } from './career';
import { endDay } from './formation';
import { closeNight, endWeek } from './turn';
import { isValidCampaign } from './validate';
import { canStartProject } from './econPlans';
import { canUseTool } from './econTools';
import type { Campaign } from './types';

const base = getWorld('career')!;
const PS = PARTY_IDS.indexOf('ps');

/** Plays a career through an election and into its next parliament. */
function throughElection(c: Campaign): void {
  c.career!.week = TERM_WEEKS;
  termWeek(base, c);
  while (c.phase === 'campaign') endWeek(base, c);
  closeNight(base, c);
  for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(base, c);
  expect(nextTerm(base, c)).toBe(true);
}

describe('what a government has set running with the economy goes into the next parliament', () => {
  it('keeps the national projects built and under way, the taxes, the rate, the debt plan and the acts used', () => {
    const c = startCareer(base, { player: PS, difficulty: 'normal', seed: 5 });
    const k = c.career!;
    k.built = ['foodSecurity', 'railPorts'];
    k.projects = [{ id: 'energyGrid', left: 30 }];
    k.taxMix = { sales: 1, income: 0, corporate: -1, luxury: 0 };
    k.repayShare = 0.3;
    k.rate = 1;
    k.toolsUsed = { sellAssets: TERM_WEEKS - 5 };
    k.eventWeeks = { monsoon: TERM_WEEKS - 10 };
    throughElection(c);
    const n = c.career!;
    // Whoever won, the question is what a head of government finds: make it the player.
    n.government.pm = PS; n.government.partners = []; delete n.limited;
    expect(n.week).toBe(1);
    expect(n.built).toEqual(['foodSecurity', 'railPorts']);
    expect(n.projects?.map((p) => p.id)).toEqual(['energyGrid']);
    expect(n.projects![0].left).toBeLessThanOrEqual(30);
    expect(n.taxMix).toEqual({ sales: 1, income: 0, corporate: -1, luxury: 0 });
    expect(n.repayShare).toBe(0.3);
    expect(n.rate).toBe(1);
    // What is built is not built again, and the one under way is still under way.
    expect(canStartProject(c, 'foodSecurity')).toEqual({ ok: false, reason: 'built' });
    expect(canStartProject(c, 'energyGrid')).toEqual({ ok: false, reason: 'running' });
    // The weeks of the old parliament are moved back, so that an act used late in it is still resting early in the next.
    expect(n.toolsUsed!.sellAssets).toBeLessThan(0);
    expect(canUseTool(worldOf(c)!, c, 'sellAssets')).toMatchObject({ ok: false, reason: 'wait' });
    expect(n.eventWeeks!.monsoon).toBeLessThan(0);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), worldOf(c)!)).toBe(true);
  });

  it('carries nothing that was not there', () => {
    const c = startCareer(base, { player: PS, difficulty: 'normal', seed: 5 });
    throughElection(c);
    for (const key of ['built', 'projects', 'taxMix', 'repayShare', 'rate', 'toolsUsed'] as const) expect(c.career![key], key).toBeUndefined();
  });
});
