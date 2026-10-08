import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { netizenKind } from '../../ui/netizens';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { ADVISE, ADVISER_IDS, advisersOf, advisersWeek, answerAdviser, concernOf } from './advisers';
import { startCareer } from './career';
import { ECHO, echoWeek, kindOf, queueEcho, scoreOf } from './echoes';
import { EVENTS, governsState, eligible, resolveEvent } from './events';
import { LETTER, TONE, TONES, canWrite, letterEffect, letterWait, writeLetter } from './letters';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';

const PS = PARTY_IDS.indexOf('ps');
const world = getWorld('career')!;
const career = (seed = 5): Campaign => {
  const c = startCareer(world, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  c.parties[PS]!.funds = scaled(world, 5_000_000);
  return c;
};

describe('a decision’s echo', () => {
  it('scores what an event did, and calls it good, bad or mixed', () => {
    expect(kindOf(scoreOf([{ t: 'cred', n: 4 }, { t: 'trust', n: 2 }]))).toBe('good');
    expect(kindOf(scoreOf([{ t: 'cred', n: -4 }, { t: 'stability', n: -2 }]))).toBe('bad');
    expect(kindOf(scoreOf([{ t: 'cred', n: 1 }, { t: 'cred', n: -1 }]))).toBe('mixed');
    expect(kindOf(scoreOf([{ t: 'end', kind: 'ousted' }]))).toBe('bad');
    expect(kindOf(scoreOf([{ t: 'mood', blocs: 'all', n: 0.02 }]))).toBe('good');
  });
  it('is queued when an event is answered and printed a month or two later, once', () => {
    const c = career();
    const k = c.career!;
    const scene = { id: 1, kind: 'event' as const, from: null, event: 'flood' };
    k.week = 20;
    resolveEvent(world, c, scene, 0);
    expect(k.echoes).toHaveLength(1);
    const e = k.echoes![0];
    expect(e.week).toBeGreaterThanOrEqual(20 + ECHO.min);
    expect(e.week).toBeLessThanOrEqual(20 + ECHO.max);
    k.week = e.week - 1;
    const before = c.news.length;
    echoWeek(c);
    expect(c.news.length).toBe(before);
    k.week = e.week;
    echoWeek(c);
    expect(c.news.at(-1)!.key).toBe(`news.echo.${e.kind}`);
    expect(k.echoes).toBeUndefined();
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
  it('is not queued for a by-election or for the budget, and draws netizens’ remarks', () => {
    const c = career();
    queueEcho(c, 'flood', [{ t: 'cred', n: 2 }]);
    expect(c.career!.echoes).toHaveLength(1);
    expect(netizenKind('news.echo.good')).toBe('echoGood');
    expect(netizenKind('news.echo.bad')).toBe('echoBad');
    expect(netizenKind('news.echo.mixed')).toBe('echoMixed');
    for (const key of ['news.echo.good', 'news.echo.bad', 'news.echo.mixed'] as StringKey[]) { expect(STRINGS.en[key]).toContain('{event}'); expect(STRINGS.ms[key]).toContain('{event}'); }
  });
});

describe('an open letter', () => {
  it('pleases the groups that care and agree, and displeases those that care and do not', () => {
    const c = career();
    const effect = letterEffect(c, 'wages', 'firm');
    expect(effect.some((v) => v > 0)).toBe(true);
    expect(effect.some((v) => v < 0)).toBe(true);
    // The rousing voice is louder than the warm one, in the same direction.
    const warm = letterEffect(c, 'wages', 'warm'), rousing = letterEffect(c, 'wages', 'rousing');
    effect.forEach((v, b) => { if (Math.abs(v) > 1e-9) { expect(Math.sign(warm[b])).toBe(Math.sign(rousing[b])); expect(Math.abs(rousing[b])).toBeGreaterThan(Math.abs(warm[b])); } });
    expect(TONE.rousing.power).toBeGreaterThan(TONE.warm.power);
  });
  it('is written once in a quarter, and warms the question and the party', () => {
    const c = career();
    const k = c.career!;
    const hot = k.salience[1];
    const mood = k.mood.map((r) => r[PS]);
    expect(canWrite(c, 'wages').ok).toBe(true);
    expect(writeLetter(c, 'wages', 'rousing')).toBe(true);
    expect(k.salience[1]).toBeCloseTo(Math.min(2, hot + TONE.rousing.salience), 9);
    expect(k.mood.map((r) => r[PS])).not.toEqual(mood);
    expect(canWrite(c, 'wages')).toEqual({ ok: false, reason: 'wait' });
    expect(letterWait(c)).toBe(LETTER.every);
    expect(writeLetter(c, 'taxes', 'warm')).toBe(false);
    k.week += LETTER.every;
    expect(writeLetter(c, 'taxes', 'warm')).toBe(true);
    expect(TONES).toHaveLength(3);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
  it('costs credibility to say what the party has never said', () => {
    const c = career();
    const k = c.career!;
    const cred = k.credibility;
    // The party’s line on this has moved two steps from where it began.
    k.stances[PS][1] = -2;
    writeLetter(c, 'wages', 'warm');
    expect(k.credibility).toBe(cred - 2);
  });
});

describe('the advisers', () => {
  it('are three named people, each with a worry that is true or none, and remember it quarter on quarter', () => {
    const c = career();
    const k = c.career!;
    const all = advisersOf(c);
    expect(Object.keys(all).sort()).toEqual([...ADVISER_IDS].sort());
    expect(new Set(Object.values(all).map((a) => a.name)).size).toBe(3);
    k.economy.debt = 90;
    expect(concernOf(c, 'treasurer')).toBe('debt');
    k.week = ADVISE.every;
    advisersWeek(c);
    expect(all.treasurer.count).toBe(1);
    expect(c.news.some((n) => n.key === 'news.adviser.debt' && n.vars?.n === 1)).toBe(true);
    k.week = ADVISE.every * 2;
    advisersWeek(c);
    expect(all.treasurer.count).toBe(2);
    // When the worry is gone they say so, and are the better disposed.
    k.economy.debt = 50;
    const cred = k.credibility;
    k.week = ADVISE.every * 3;
    advisersWeek(c);
    expect(all.treasurer.concern).toBeNull();
    expect(c.news.some((n) => n.key === 'news.adviser.thanks')).toBe(true);
    expect(k.credibility).toBeGreaterThanOrEqual(cred);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
  it('ask for a word after the third time, and the answer is remembered', () => {
    const c = career();
    const k = c.career!;
    k.economy.debt = 95;
    for (let q = 1; q <= ADVISE.ultimatum; q++) { k.week = ADVISE.every * q; c.inbox = []; advisersWeek(c); }
    expect(k.adviserPending).toBe('treasurer');
    expect(c.inbox.some((s) => s.event === 'adviserUltimatum')).toBe(true);
    const scene = c.inbox.find((s) => s.event === 'adviserUltimatum')!;
    const cred = k.credibility;
    resolveEvent(world, c, scene, 1);
    expect(k.credibility).toBe(cred + ADVISE.ignored);
    expect(k.adviserPending).toBeUndefined();
    expect(advisersOf(c).treasurer.count).toBe(1);
    // Letting one go gives a new face with no memory.
    const old = advisersOf(c).treasurer.name;
    k.adviserPending = 'treasurer';
    answerAdviser(c, 'dismiss');
    expect(advisersOf(c).treasurer.name).not.toBe(old);
    expect(advisersOf(c).treasurer.count).toBe(0);
  });
  it('have words in both languages', () => {
    for (const key of ['adviser.treasurer', 'adviser.strategist', 'adviser.conscience', 'news.adviser.debt', 'news.adviser.purse', 'news.adviser.unity', 'news.adviser.partners', 'news.adviser.promises', 'news.adviser.name', 'news.adviser.thanks', 'letter.title', 'letter.warm', 'letter.firm', 'letter.rousing', 'news.letter.warm', 'news.letter.firm', 'news.letter.rousing'] as StringKey[]) {
      expect(STRINGS.en[key], key).toBeTruthy();
      expect(STRINGS.ms[key], key).toBeTruthy();
    }
  });
});

describe('a state’s own customs', () => {
  const custom = { adatSuccession: 'nsembilan', weekendChange: 'kelantan', nativeLand: 'sabah', longhouseRoad: 'sarawak', processionRoute: 'penang', rulerRemarks: 'johor' } as const;
  it('are told only to a player who governs that state, or is in its career', () => {
    const c = career();
    c.career!.government.pm = PS;
    c.career!.fired = [];
    for (const [id, st] of Object.entries(custom)) {
      c.career!.states = {};
      expect(governsState(c, st), id).toBe(false);
      expect(eligible(c, id), id).toBe(false);
      c.career!.states = { [st]: PS };
      expect(governsState(c, st), id).toBe(true);
      expect(eligible(c, id), id).toBe(true);
    }
    c.career!.states = {};
    c.scenario = 'career:sabah';
    expect(eligible(c, 'nativeLand')).toBe(true);
    expect(eligible(c, 'adatSuccession')).toBe(false);
  });
});

describe('stories in chapters, and of the great stories of the country', () => {
  it('have each chapter after the first reachable only from the one before, and words for every option', () => {
    const chains = [['portBid', 'portProtest', 'portAudit'], ['youthFund', 'youthFundProbe', 'youthFundVerdict'], ['riverFactory', 'fishKill', 'riverCourt'], ['sovereignFund', 'fundProbe', 'fundTrial'], ['hotelMeeting', 'hotelAftermath']];
    for (const chain of chains) {
      chain.forEach((id, n) => {
        const def = EVENTS[id];
        expect(def, id).toBeDefined();
        for (const text of [EVENTS_EN[id], EVENTS_MS[id]]) {
          expect(text.options, id).toHaveLength(def.choices.length);
          expect(text.results, id).toHaveLength(def.choices.length);
          def.choices.forEach((ch, i) => expect(Array.isArray(text.results[i]), `${id} ${i}`).toBe(!!ch.gamble));
        }
        const next = def.choices.map((x) => x.then?.event).filter(Boolean);
        if (n < chain.length - 1) for (const e of next) expect(e, id).toBe(chain[n + 1]);
        else expect(next, id).toHaveLength(0);
        if (n > 0) expect(def.weight, id).toBe(0);
      });
    }
    for (const id of Object.keys(custom)) { expect(EVENTS_EN[id].title).toBeTruthy(); expect(EVENTS_MS[id].title).toBeTruthy(); }
  });
});
const custom = { adatSuccession: 1, weekendChange: 1, nativeLand: 1, longhouseRoad: 1, processionRoute: 1, rulerRemarks: 1 };
