import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { defenceOf } from './defence';
import { TOOLS, canUseTool, toolCost, useTool } from './econTools';
import type { Effect } from './events';
import { playable } from './field';
import { DEFENCE_GOALS, METER_GOALS, METER_TOOLS } from './meterTools';
import { pestelOf } from './pestel';
import { isValidCampaign } from './validate';
import type { Campaign } from './types';

const world = getWorld('career')!;
const career = (player = PARTY_IDS.indexOf('ps')): Campaign => { const c = startCareer(world, { player, difficulty: 'normal', seed: 5 }); c.inbox = []; c.career!.treasury = 10_000_000_000; return c; };
const BOUND: Partial<Record<Effect['t'], number>> = { mood: 0.06, cred: 3, stability: 3, trust: 4 };
const METER_OF: Record<string, (c: Campaign) => number> = {
  cohesion: (c) => pestelOf(c.career!).cohesion, tech: (c) => pestelOf(c.career!).tech, environment: (c) => pestelOf(c.career!).environment,
  law: (c) => pestelOf(c.career!).law, readiness: (c) => defenceOf(c.career!).readiness, influence: (c) => defenceOf(c.career!).influence,
};

describe('acts for the meters beyond the budget', () => {
  it('are three for each of the six, with the words for each in both languages', () => {
    expect(METER_TOOLS).toHaveLength(18);
    for (const goal of METER_GOALS) expect(METER_TOOLS.filter((x) => x.goal === goal), goal).toHaveLength(3);
    for (const lang of ['en', 'ms'] as const) {
      for (const goal of METER_GOALS) expect(STRINGS[lang][`tools.goal.${goal}` as StringKey], `${lang} ${goal}`).toBeTruthy();
      for (const x of METER_TOOLS) for (const suffix of ['', '.desc']) expect(STRINGS[lang][`tool.${x.id}${suffix}` as StringKey], `${lang} ${x.id}${suffix}`).toBeTruthy();
      for (const key of ['meters.tools.title', 'meters.tools.desc', 'tools.no.federal']) expect(STRINGS[lang][key as StringKey], `${lang} ${key}`).toBeTruthy();
    }
    expect(new Set(TOOLS.map((x) => x.id)).size).toBe(TOOLS.length);
  });

  it('keep each consequence within the sizes of the rest of the game, and each pays or costs something', () => {
    for (const tool of METER_TOOLS) {
      for (const e of tool.effects) {
        const limit = BOUND[e.t];
        if (limit !== undefined && 'n' in e) expect(Math.abs(e.n), `${tool.id} ${e.t}`).toBeLessThanOrEqual(limit);
        if (e.t === 'pestel') for (const v of [e.cohesion, e.tech, e.environment, e.law]) expect(Math.abs(v ?? 0), tool.id).toBeLessThanOrEqual(8);
        if (e.t === 'defence') for (const v of [e.readiness, e.influence]) expect(Math.abs(v ?? 0), tool.id).toBeLessThanOrEqual(8);
      }
      // A cheap, quiet act asks for money or for credit; the risky one for something else.
      expect(tool.effects.length, tool.id).toBeGreaterThanOrEqual(2);
      expect(tool.wait, tool.id).toBeGreaterThanOrEqual(26);
    }
  });

  it('each move the meter they are for, in the right direction', () => {
    for (const tool of METER_TOOLS) {
      const c = career();
      const meter = METER_OF[tool.goal];
      const before = meter(c);
      expect(useTool(world, c, tool.id), tool.id).toBe(true);
      if (tool.goal === 'influence') expect(meter(c), tool.id).toBeLessThan(before);
      else expect(meter(c), tool.id).toBeGreaterThan(before);
      expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world), tool.id).toBe(true);
    }
  });

  it('must rest, and can be refused for money, for not governing, and, for the armed forces, in a state', () => {
    const c = career();
    expect(useTool(world, c, 'sharedFacilities')).toBe(true);
    expect(canUseTool(world, c, 'sharedFacilities')).toMatchObject({ ok: false, reason: 'wait' });
    expect(useTool(world, c, 'sharedFacilities')).toBe(false);
    c.career!.treasury = 0;
    expect(toolCost(world, c, 'greenFund')).toBeGreaterThan(0);
    expect(canUseTool(world, c, 'greenFund')).toMatchObject({ ok: false, reason: 'money' });
    expect(canUseTool(world, c, 'permitFreeze').ok).toBe(true);
    expect(canUseTool(world, career(PARTY_IDS.indexOf('pt')), 'dialogueWeek')).toMatchObject({ ok: false, reason: 'notPm' });
    const w = getWorld('career:perak')!;
    // A party that heads the state's government.
    const state = playable(w).map((player) => startCareer(w, { player, difficulty: 'normal', seed: 5 })).find((x) => x.career!.government.pm === x.player)!;
    expect(state).toBeDefined();
    state.inbox = []; state.career!.treasury = 10_000_000_000;
    for (const tool of METER_TOOLS) {
      const ok = canUseTool(w, state, tool.id);
      if (DEFENCE_GOALS.includes(tool.goal)) expect(ok, tool.id).toMatchObject({ ok: false, reason: 'federal' });
      else expect(ok, tool.id).toEqual({ ok: true });
    }
    expect(useTool(w, state, 'jointExercises')).toBe(false);
    expect(state.career!.defence).toBeUndefined();
  });
});
