import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS, STATE_IDS } from '../types';
import { AGENDA, agendaOf, stateOf } from './agenda';
import { resolveCampaignScene } from './diplomacy';
import { playable } from './field';
import { endWeek, newCampaign } from './turn';
import { isValidCampaign } from './validate';

const withAgenda = STATE_IDS.filter((st) => AGENDA[st]);

describe('the question each state is asked', () => {
  it('belongs to the thirteen states that elect an assembly, and not to the federal territories', () => {
    expect(withAgenda).toHaveLength(13);
    for (const st of ['kl', 'putrajaya', 'labuan'] as const) expect(AGENDA[st]).toBeNull();
  });

  it('has a title, a body, three answers and what comes of each, in both languages', () => {
    for (const st of withAgenda) for (const lang of ['en', 'ms'] as const) {
      const keys = [`agenda.${st}.intro`, `agenda.${st}.title`, `agenda.${st}.body`, ...[0, 1, 2].flatMap((i) => [`agenda.${st}.o${i}`, `agenda.${st}.o${i}.news`])];
      for (const k of keys) expect(STRINGS[lang][k as StringKey], `${lang} ${k}`).toBeTruthy();
    }
  });

  it('gives every answer something to please and something to cost, except staying out of it', () => {
    for (const st of withAgenda) {
      const [a, b, silence] = AGENDA[st]!.choices;
      for (const choice of [a, b]) {
        const lifts = Object.values(choice.lift);
        expect(lifts.some((v) => v > 0), st).toBe(true);
        // each answer leaves someone out: a group that is worse off, or money or unity spent
        expect(lifts.some((v) => v < 0) || (choice.funds ?? 0) !== 0 || (choice.unity ?? 0) !== 0, st).toBe(true);
      }
      expect(silence.lift).toEqual({});
      expect(silence.funds).toBeUndefined();
    }
  });
});

describe('a state election', () => {
  const johor = getWorld('state:johor')!;
  const ps = PARTY_IDS.indexOf('ps');

  it('knows which state it is, and opens by saying what the state is arguing about', () => {
    expect(stateOf(johor)).toBe('johor');
    expect(agendaOf(johor)).toBe(AGENDA.johor);
    expect(stateOf(getWorld('general')!)).toBeNull();
    expect(stateOf(getWorld('byelection')!)).toBeNull();
    const c = newCampaign(johor, { player: ps, difficulty: 'normal', seed: 2 });
    expect(c.news.some((n) => n.key === 'agenda.johor.intro')).toBe(true);
  });

  it('puts the question on the leader’s desk after the first week, once', () => {
    const c = newCampaign(johor, { player: ps, difficulty: 'normal', seed: 2 });
    expect(c.inbox.some((s) => s.kind === 'agenda')).toBe(false);
    endWeek(johor, c);
    const asked = c.inbox.filter((s) => s.kind === 'agenda');
    expect(asked).toHaveLength(1);
    expect(asked[0].event).toBe('johor');
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), johor)).toBe(true);
    endWeek(johor, c);
    expect(c.inbox.filter((s) => s.kind === 'agenda')).toHaveLength(0);
  });

  it('moves the voters the answer was aimed at, for the rest of the campaign', () => {
    const c = newCampaign(johor, { player: ps, difficulty: 'normal', seed: 2 });
    endWeek(johor, c);
    const scene = c.inbox.find((s) => s.kind === 'agenda')!;
    const before = c.drift.support.nat.map((row) => row[ps]);
    c.inbox = c.inbox.filter((s) => s !== scene);
    c.parties[ps]!.funds = 1_000_000;
    resolveCampaignScene(johor, c, scene, 0);
    const after = c.drift.support.nat.map((row) => row[ps]);
    expect(after.some((v, i) => v > before[i])).toBe(true);
    expect(after.some((v, i) => v < before[i])).toBe(true);
    expect(c.agenda).toBe('answered:0');
  });

  it('leaves an unanswered question to silence when the week ends', () => {
    const c = newCampaign(johor, { player: ps, difficulty: 'normal', seed: 2 });
    endWeek(johor, c);
    const before = JSON.stringify(c.drift.support.nat);
    endWeek(johor, c);
    expect(JSON.stringify(c.drift.support.nat)).toBe(before);
    expect(c.agenda).toBe('answered:2');
  });

  it('is asked in every one of the thirteen states, whoever is led', () => {
    for (const st of withAgenda) {
      const w = getWorld(`state:${st}`)!;
      const p = playable(w)[0];
      const c = newCampaign(w, { player: p, difficulty: 'normal', seed: 1 });
      endWeek(w, c);
      expect(c.inbox.some((s) => s.kind === 'agenda' && s.event === st), st).toBe(true);
    }
  });
});
