import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { ACTIONS, actionCost, blitzAreas, canDo, doAction, gotvWeeks } from './actions';
import { newCampaign } from './turn';
import { SWEEPS, type Campaign } from './types';

const PS = PARTY_IDS.indexOf('ps');
const state = getWorld('state:johor')!;
const make = (): Campaign => newCampaign(state, { player: PS, difficulty: 'normal', seed: 3 });

describe('sending every branch out at once in a state’s election', () => {
  it('is for a state’s election only, and takes two days for the whole state', () => {
    const c = make();
    expect(ACTIONS.blitz.days).toBe(2);
    expect(blitzAreas(state, c, PS).length).toBeGreaterThanOrEqual(2);
    expect(canDo(state, c, PS, 'blitz', {}).ok).toBe(true);
    const general = getWorld('general') ?? getWorld('career')!;
    expect(canDo(general, newCampaign(general, { player: PS, difficulty: 'normal', seed: 3 }), PS, 'blitz', {})).toMatchObject({ ok: false });
  });

  it('costs less than doing the same thing in each area, and a lot less of the leader’s time', () => {
    const c = make();
    const areas = blitzAreas(state, c, PS);
    const alone = areas.reduce((a, st) => a + actionCost(state, c, PS, 'billboards', { state: st }).money, 0);
    const together = actionCost(state, c, PS, 'blitz', { sweep: 'flags' });
    expect(together.money).toBeLessThan(alone);
    expect(together.days).toBe(2);
    expect(areas.length * ACTIONS.billboards.days).toBeGreaterThan(together.days);
  });

  it('does each of its four things in every area, once a week each, and gets out the vote only at the end', () => {
    for (const sweep of SWEEPS) {
      const c = make();
      c.week = sweep === 'turnout' ? c.totalWeeks : 2;
      const pc = c.parties[PS]!;
      pc.funds = 10_000_000; pc.days = 7;
      const before = JSON.stringify(sweep === 'branches' ? pc.machinery : [c.dyn.support.state, c.dyn.turnout.state]);
      expect(canDo(state, c, PS, 'blitz', { sweep }).ok, sweep).toBe(true);
      const report = doAction(state, c, PS, 'blitz', { sweep });
      expect(report.id).toBe('blitz');
      expect(JSON.stringify(sweep === 'branches' ? pc.machinery : [c.dyn.support.state, c.dyn.turnout.state]), sweep).not.toBe(before);
      expect(canDo(state, c, PS, 'blitz', { sweep })).toEqual({ ok: false, reason: 'usedThisWeek' });
      const other = SWEEPS.find((x) => x !== sweep && x !== 'turnout')!;
      expect(canDo(state, c, PS, 'blitz', { sweep: other }).ok, other).toBe(true);
    }
    const early = make();
    early.week = 1;
    expect(gotvWeeks(early)).toBeGreaterThan(0);
    expect(canDo(state, early, PS, 'blitz', { sweep: 'turnout' })).toEqual({ ok: false, reason: 'tooEarly' });
  });

  it('has words in both languages', () => {
    for (const lang of ['en', 'ms'] as const) {
      for (const key of ['action.blitz', 'action.blitz.desc', 'actions.blitz', 'sweep.title', 'sweep.note', 'reason.noTarget.none']) expect(STRINGS[lang][key as StringKey], `${lang} ${key}`).toBeTruthy();
      for (const sweep of SWEEPS) {
        expect(STRINGS[lang][`sweep.${sweep}` as StringKey], `${lang} ${sweep}`).toBeTruthy();
        expect(STRINGS[lang][`news.me.blitz.${sweep}` as StringKey], `${lang} news ${sweep}`).toBeTruthy();
      }
    }
  });
});
