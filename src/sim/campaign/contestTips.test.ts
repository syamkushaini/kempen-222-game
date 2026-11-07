import { describe, expect, it } from 'vitest';
import '../../data/allStates';
import { dunByElections, worldOf } from '../../data/world';
import { translate, type StringKey } from '../../i18n/strings';
import { useStore } from '../../state/store';
import { PARTY_IDS } from '../types';
import { spendingLimit } from './actions';
import { contestTip, TIPS_PER_LEVEL } from './contestTips';
import { FOUNDING_SLOT } from './founding';
import { STEPS, stepScenario } from './journey';

const store = () => useStore.getState();
const start = (i: number) => {
  store().quitToTitle();
  store().startCampaign({ name: 'T', scenario: stepScenario(i, dunByElections), player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'normal', backstory: null, seed: 3, founded: true, journey: true, following: 0.28 });
  useStore.setState((s) => ({ game: { ...s.game!, tutorial: null } }));
  const c = structuredClone(store().game!.campaign);
  return { c, world: worldOf(c)! };
};

describe('the campaign manager\'s tip of the week in a level', () => {
  it('gives one of the level\'s own tips, a different one each week', () => {
    const { c, world } = start(0);
    c.parties[c.player]!.funds = 1e9;
    const seen = new Set<string>();
    for (let w = 1; w <= TIPS_PER_LEVEL; w++) { c.week = w; c.totalWeeks = 10; seen.add(contestTip(world, c, STEPS[0])!.key); }
    expect([...seen].sort()).toEqual(['tip.firstSeat.1', 'tip.firstSeat.2', 'tip.firstSeat.3']);
  });
  it('asks for money when the chest is nearly empty, and for Get out the vote in the last week', () => {
    const { c, world } = start(1);
    c.parties[c.player]!.funds = 0;
    c.week = 1;
    expect(contestTip(world, c, STEPS[1])!.key).toBe('ctip.funds');
    c.week = c.totalWeeks;
    expect(contestTip(world, c, STEPS[1])!.key).toBe('ctip.gotv');
    c.parties[c.player]!.used = { 'gotv:x': 1 };
    expect(contestTip(world, c, STEPS[1])!.key).toMatch(/^tip\.stronghold\./);
  });
  it('warns about the budget of the shoestring level once most of it is spent', () => {
    const { c, world } = start(2);
    c.parties[c.player]!.funds = 1e9;
    c.parties[c.player]!.spent = 0.8 * (spendingLimit(world) / 2);
    expect(contestTip(world, c, STEPS[2])).toEqual({ key: 'ctip.budget', vars: { pct: 80 } });
    expect(contestTip(world, c, STEPS[0])!.key).not.toBe('ctip.budget');
  });
  it('says nothing once the campaign is over', () => {
    const { c, world } = start(0);
    c.phase = 'done';
    expect(contestTip(world, c, STEPS[0])).toBeNull();
  });
  it('only says what is written in both languages', () => {
    for (const key of ['ctip.budget', 'ctip.gotv', 'ctip.funds', 'ctip.later'])
      for (const lang of ['en', 'ms'] as const) expect(translate(lang, key as StringKey)).not.toBe(key);
  });
});
