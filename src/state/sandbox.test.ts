import { beforeEach, describe, expect, it } from 'vitest';
import { getWorld } from '../data/world';
import { defaultSimConfig } from '../sim/campaign/simulate';
import { stat } from '../sim/campaign/perks';
import { isValidCampaign } from '../sim/campaign/validate';
import { PARTY_IDS } from '../sim/types';
import { parseSave, serializeSave } from './game';
import { useStore } from './store';

const PT = PARTY_IDS.indexOf('pt'), PS = PARTY_IDS.indexOf('ps');
const world = getWorld('career')!;
const store = () => useStore.getState();

describe('the sandbox', () => {
  beforeEach(() => { store().quitToTitle(); });

  const start = () => {
    const cfg = defaultSimConfig(world, PT);
    cfg.parties[PT].leader = [5, 1, 1, 5];
    cfg.parties[PT].funds = 9_000_000;
    cfg.mood[PT] = 4;
    cfg.parties[PT].stances[0] = -2;
    store().startSandbox(cfg);
    return store().game!.campaign;
  };

  it('starts a game the player plays as the party in focus, with the settings given', () => {
    const c = start();
    expect(c.player).toBe(PT);
    expect(c.phase).toBe('campaign');
    expect(c.sim?.sandbox).toBe(true);
    expect(c.sim?.auto).toBeUndefined();
    expect(c.team.leader.stats).toEqual([5, 1, 1, 5]);
    expect(stat(c, PT, 'charisma')).toBe(5);
    expect(c.parties[PT]!.funds).toBe(9_000_000);
    expect(c.career!.stances[PT][0]).toBe(-2);
    expect(store().simulating).toBe(false);
  });

  it('lets the player play the week and end it like any game', () => {
    start();
    store().act('canvass', { state: 'kelantan' });
    store().endWeek();
    expect(store().game!.campaign.week).toBe(2);
  });

  it('changes anything for any party, and Undo takes it back, move or change alike', () => {
    start();
    const before = structuredClone(store().game!.campaign.career!.mood[0][PS]);
    store().sandboxEdit((c) => { c.parties[PS]!.funds = 123; c.career!.mood[0][PS] += 0.5; c.sim!.leaders = []; c.sim!.leaders![PS] = [1, 1, 1, 1]; });
    const c = store().game!.campaign;
    expect(c.parties[PS]!.funds).toBe(123);
    expect(c.career!.mood[0][PS]).toBeCloseTo(before + 0.5, 9);
    expect(stat(c, PS, 'charisma')).toBe(1);
    store().act('canvass', { state: 'kelantan' });
    expect(store().undoStack.length).toBe(2);
    store().sandboxUndo();
    expect(store().game!.campaign.parties[PS]!.funds).toBe(123);
    store().sandboxUndo();
    expect(store().game!.campaign.parties[PS]!.funds).not.toBe(123);
    expect(store().undoStack.length).toBe(0);
  });

  it('earns no achievements and survives a save', () => {
    start();
    const achieved = Object.keys(store().profile.achievements).length;
    while (store().game!.campaign.phase === 'campaign') store().endWeek();
    expect(Object.keys(store().profile.achievements).length).toBe(achieved);
    const g = store().game!;
    const back = parseSave(serializeSave(g));
    expect(back.ok).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(g.campaign)), world)).toBe(true);
    if (back.ok) expect(back.state.campaign.sim?.sandbox).toBe(true);
  });

  it('leaves a played game alone: no sandbox hooks, and no undo', () => {
    store().startCampaign({ name: 'x', scenario: 'state:perak', player: PS, difficulty: 'normal' });
    expect(store().game!.campaign.sim).toBeUndefined();
    store().endWeek();
    expect(store().undoStack).toEqual([]);
  });
});
