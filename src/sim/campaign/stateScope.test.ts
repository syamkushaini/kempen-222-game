import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { agenda } from './govern';
import { startCareer, skipAhead } from './career';
import { playable } from './field';
import { togglePledge } from './policy';
import { powersOf, withinPowers } from './stateScope';
import type { Campaign } from './types';

const stateWorld = getWorld('career:johor')!;
const nationalWorld = getWorld('career')!;
const state = (seed = 3): Campaign => startCareer(stateWorld, { player: playable(stateWorld)[0], difficulty: 'normal', seed });

describe('what a state government can promise', () => {
  it('leaves every party with only promises a state can keep', () => {
    const c = state();
    for (const m of c.career!.manifesto) for (const id of m) expect(powersOf(c)).toContain(id);
  });

  it('refuses a federal promise in a state career and takes a state one', () => {
    const c = state();
    c.career!.manifesto[c.player] = [];
    expect(togglePledge(c, 'fuelSubsidy')).toBe(false);
    expect(togglePledge(c, 'minWage')).toBe(false);
    expect(togglePledge(c, 'villageRoads')).toBe(true);
  });

  it('puts no federal promise on the state agenda, even one left in an old save', () => {
    const c = state();
    c.career!.promises = ['fuelSubsidy', 'villageRoads'];
    c.career!.delivery = {};
    const ids = agenda(c).filter((b) => b.startsWith('pledge:'));
    expect(ids).not.toContain('pledge:fuelSubsidy');
    expect(ids).toContain('pledge:villageRoads');
  });

  it('never has a rival government table a federal matter', () => {
    const c = state(7);
    const k = c.career!;
    k.government.pm = (c.player + 1) % PARTY_IDS.length;
    k.government.partners = [];
    k.manifesto[k.government.pm] = ['fuelSubsidy', 'hospitals', 'seniorPension'];
    k.rivalBills = 0;
    const bills: string[] = [];
    for (let i = 0; i < 40 && c.phase === 'term'; i++) {
      skipAhead(stateWorld, c, 52);
      for (const s of c.inbox) if (s.kind === 'houseVote' && s.bill) bills.push(s.bill);
      c.inbox = [];
    }
    expect(bills).toContain('pledge:seniorPension');
    expect(bills).not.toContain('pledge:fuelSubsidy');
    expect(bills).not.toContain('pledge:hospitals');
  });

  it('gives Sabah and Sarawak the powers the Constitution gives them, and Sarawak its grid', () => {
    const at = (name: string) => { const w = getWorld(`career:${name}`)!; return startCareer(w, { player: playable(w)[0], difficulty: 'normal', seed: 3 }); };
    const johor = at('johor'), sabah = at('sabah'), sarawak = at('sarawak');
    for (const id of ['oilRoyalty', 'borneoFund', 'taxCut'] as const) {
      expect(withinPowers(johor, id)).toBe(false);
      expect(withinPowers(sabah, id)).toBe(true);
      expect(withinPowers(sarawak, id)).toBe(true);
    }
    expect(withinPowers(sabah, 'greenGrid')).toBe(false);
    expect(withinPowers(sarawak, 'greenGrid')).toBe(true);
    for (const c of [johor, sabah, sarawak]) { expect(withinPowers(c, 'homes')).toBe(true); expect(withinPowers(c, 'localVote')).toBe(true); expect(withinPowers(c, 'minWage')).toBe(false); }
  });

  it('leaves a national game as it was', () => {
    const c = startCareer(nationalWorld, { player: playable(nationalWorld)[0], difficulty: 'normal', seed: 3 });
    expect(withinPowers(c, 'fuelSubsidy')).toBe(true);
    expect(c.career!.manifesto.flat()).toContain('fuelSubsidy');
  });
});
