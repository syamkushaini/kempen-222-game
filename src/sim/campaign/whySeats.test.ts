import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { whyOf, type Analysis } from './analysis';
import { pushNews } from './news';

const world = getWorld('career')!;
const PS = PARTY_IDS.indexOf('ps');
const lost = { seats: 40, before: 81 } as Analysis;
const game = () => startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });

describe('why a party that governed lost seats', () => {
  it('names what counts at the ballot box, from how the party stood', () => {
    const c = game(), k = c.career!;
    k.govRun = 3;
    k.credibility = 40;
    c.parties[PS]!.unity = 35;
    k.economy.growth = 0.5; k.economy.inflation = 6; k.economy.jobless = 7;
    pushNews(c, { party: PS, key: 'news.gov.reckoning', vars: { kept: 1, total: 6 }, tone: 'bad' });
    const keys = whyOf(c, lost).map((x) => x.key);
    expect(keys).toEqual(expect.arrayContaining(['analysis.why.tired', 'analysis.why.broken', 'analysis.why.cred', 'analysis.why.unity', 'analysis.why.economy', 'analysis.why.idle']));
    const broken = whyOf(c, lost).find((x) => x.key === 'analysis.why.broken')!;
    expect(broken.vars).toEqual({ kept: 1, total: 6, broken: 5 });
  });

  it('says that public trust and a steady government are not counted, so that nobody looks there', () => {
    const c = game(), k = c.career!;
    k.government.trust = 85; k.government.stability = 80;
    const notCounted = whyOf(c, lost).find((x) => x.key === 'analysis.why.notCounted');
    expect(notCounted).toBeDefined();
    expect(notCounted!.vars).toEqual({ trust: 85, stability: 80 });
  });

  it('says nothing when no seats were lost, or when there is no career', () => {
    const c = game();
    expect(whyOf(c, { seats: 90, before: 81 } as Analysis)).toEqual([]);
    c.career = null;
    expect(whyOf(c, lost)).toEqual([]);
  });

  it('does not blame what was fine', () => {
    const c = game(), k = c.career!;
    k.govRun = 1; k.credibility = 80; c.parties[PS]!.unity = 80;
    k.economy.growth = 5; k.economy.inflation = 2; k.economy.jobless = 3;
    for (let i = 0; i < 6; i++) c.ledger.push({} as never);
    const keys = whyOf(c, lost).map((x) => x.key);
    for (const k2 of ['analysis.why.tired', 'analysis.why.cred', 'analysis.why.unity', 'analysis.why.economy', 'analysis.why.idle']) expect(keys).not.toContain(k2);
  });
});
