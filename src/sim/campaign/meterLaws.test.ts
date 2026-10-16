import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { defenceTargets } from './defence';
import { FORCES_PROJECTS, PROJECTS, builtMeters } from './econPlansData';
import { canStartProject, startProject } from './econPlans';
import { playable } from './field';
import { PLEDGES } from './policy';
import { pestelTargets } from './pestel';
import { PLEDGE_IDS, type Campaign } from './types';
import { isValidCampaign } from './validate';

const world = getWorld('career')!;
const career = (): Campaign => { const c = startCareer(world, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 5 }); c.inbox = []; return c; };

describe('Acts for the meters', () => {
  it('are three Acts, costing the treasury little, each with a name in both languages and somebody who likes it', () => {
    for (const id of ['dataProtection', 'conflictOfInterest', 'defenceOversight'] as const) {
      expect(PLEDGE_IDS, id).toContain(id);
      expect(PLEDGES[id].law, id).toBe(true);
      expect(PLEDGES[id].cost, id).toBeLessThanOrEqual(2);
      expect(Object.values(PLEDGES[id].appeal).some((v) => v > 0), id).toBe(true);
      for (const lang of ['en', 'ms'] as const) expect(STRINGS[lang][`pledge.${id}` as StringKey], `${lang} ${id}`).toBeTruthy();
    }
  });

  it('hold their meters for good once they are law', () => {
    const k = career().career!;
    const [law, tech] = [pestelTargets(k).law, pestelTargets(k).tech];
    const influence = defenceTargets(k).influence;
    k.laws = ['conflictOfInterest'];
    expect(pestelTargets(k).law).toBeGreaterThan(law);
    k.laws = ['dataProtection'];
    expect(pestelTargets(k).tech).toBeGreaterThan(tech);
    expect(pestelTargets(k).law).toBeGreaterThan(law);
    k.laws = ['defenceOversight'];
    expect(defenceTargets(k).influence).toBeLessThan(influence);
  });
});

describe('programmes for the meters', () => {
  it('are six, with words in both languages, and two are a country’s only', () => {
    const mine = PROJECTS.filter((p) => p.meters || p.forces);
    expect(mine).toHaveLength(6);
    expect(FORCES_PROJECTS).toEqual(['forcesModernisation', 'defenceCollege']);
    for (const p of mine) for (const lang of ['en', 'ms'] as const) for (const suffix of ['', '.desc']) expect(STRINGS[lang][`project.${p.id}${suffix}` as StringKey], `${lang} ${p.id}`).toBeTruthy();
    expect(STRINGS.en['plan.projects.no.federal' as StringKey]).toBeTruthy();
    expect(STRINGS.ms['plan.projects.no.federal' as StringKey]).toBeTruthy();
  });

  it('push their meter once built, and not before', () => {
    const c = career();
    const k = c.career!;
    const before = pestelTargets(k).cohesion;
    expect(startProject(c, 'communityHalls')).toBe(true);
    expect(pestelTargets(k).cohesion).toBeLessThanOrEqual(before);
    k.projects = []; k.built = ['communityHalls'];
    expect(pestelTargets(k).cohesion).toBe(before + 4);
    k.built = ['nationalBroadband', 'greenTransition', 'courtsModernisation'];
    expect(builtMeters(k)).toMatchObject({ tech: 6, environment: 6, law: 5 });
    k.built = ['defenceCollege'];
    const base = defenceTargets({ ...k, built: [] }).influence;
    expect(defenceTargets(k).influence).toBeLessThan(base);
    k.built = ['forcesModernisation'];
    expect(defenceTargets(k).readiness).toBeGreaterThan(defenceTargets({ ...k, built: [] }).readiness);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });

  it('keep the armed forces to a country', () => {
    expect(canStartProject(career(), 'forcesModernisation')).toEqual({ ok: true });
    const w = getWorld('career:perak')!;
    const state = playable(w).map((player) => startCareer(w, { player, difficulty: 'normal', seed: 5 })).find((x) => x.career!.government.pm === x.player)!;
    state.inbox = [];
    for (const id of FORCES_PROJECTS) expect(canStartProject(state, id), id).toEqual({ ok: false, reason: 'federal' });
    expect(canStartProject(state, 'communityHalls')).toEqual({ ok: true });
  });
});
