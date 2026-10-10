import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { EVENT_ART } from '../../ui/art/recipes';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { startCareer } from './career';
import { oppositionLeader } from './contests';
import { eligible, EVENTS, resolveEvent, rollEvent, type Effect } from './events';
import { GOVERNING_SEATS } from './eventList9';
import { OPPOSITION_SEATS } from './eventList10';
import { COOL_WEEKS, forStanding, seatsOfEvent, standingOf, STANDINGS, topicOf, TOPICS, type Standing } from './standing';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';
import { Rng } from '../rng';

const [PS, BP, PT] = ['ps', 'bp', 'pt'].map((p) => PARTY_IDS.indexOf(p as never));
const world = getWorld('career')!;
const career = (player = PS, seed = 5): Campaign => {
  const c = startCareer(world, { player, difficulty: 'normal', seed });
  c.career!.obligations = [];
  c.parties[player]!.funds = scaled(world, 5_000_000);
  c.career!.oppLeader = oppositionLeader(world, c);
  return c;
};
/** Puts a career's player where the test wants them. */
function stand(at: Standing): Campaign {
  const governing = at === 'pm' || at === 'gov';
  // A partner in the government is BP under a PS government; everyone else is PS or PT, and the two others take the other seats.
  const c = career(at === 'pm' ? PS : at === 'gov' ? BP : PT);
  const g = c.career!.government;
  const other = c.player === PS ? BP : PS;
  g.pm = at === 'pm' ? c.player : at === 'gov' ? PS : other;
  g.partners = at === 'gov' ? [c.player] : [];
  c.career!.oppLeader = governing ? other : at === 'lead' ? c.player : other === g.pm ? (g.pm === PS ? BP : PS) : other;
  return c;
}
const own = { ...GOVERNING_SEATS, ...OPPOSITION_SEATS };
const BOUND: Partial<Record<Effect['t'], number>> = { mood: 0.06, unity: 5, funds: 100_000, cred: 3, stability: 3, trust: 4, machinery: 4, dossier: 8, fiscal: 1, rival: 0.012, relation: 5 };
const effectsOf = (id: string): Effect[] => EVENTS[id].choices.flatMap((c) => [...c.effects, ...(c.gamble ? [...c.gamble.win, ...c.gamble.lose] : [])]);

describe('four places to stand', () => {
  it('are told apart: leading the government, in it, leading the opposition, in opposition', () => {
    for (const at of STANDINGS) expect(standingOf(stand(at)), at).toBe(at);
    const c = career(PS);
    expect(c.career!.oppLeader).toBe(oppositionLeader(world, c));
    expect(c.career!.oppLeader).not.toBe(c.career!.government.pm);
    expect(c.career!.government.partners).not.toContain(c.career!.oppLeader);
  });

  it('give every place a long list of its own troubles', () => {
    for (const at of STANDINGS) {
      const ids = Object.keys(EVENTS).filter((id) => forStanding(id, EVENTS[id], at) && EVENTS[id].weight > 0 && !EVENTS[id].needs?.backstory);
      expect(ids.length, at).toBeGreaterThanOrEqual(95);
      // Not only the troubles of everybody: each place has plenty written for it alone.
      expect(ids.filter((id) => seatsOfEvent(id, EVENTS[id]).length === 1).length, at).toBeGreaterThanOrEqual(10);
    }
  });

  it('keep the government’s troubles from the opposition, and the opposition’s from the government', () => {
    for (const id of Object.keys(GOVERNING_SEATS)) for (const at of ['lead', 'opp'] as const) expect(forStanding(id, EVENTS[id], at), `${id} ${at}`).toBe(false);
    for (const id of Object.keys(OPPOSITION_SEATS)) for (const at of ['pm', 'gov'] as const) expect(forStanding(id, EVENTS[id], at), `${id} ${at}`).toBe(false);
    // What only a head of government can do is not put to a partner, and what only a leader of the opposition can is not put to the rest.
    for (const id of ['cabinetReshuffle', 'giveawayBudget', 'emergencyPowers', 'judicialPanel']) expect(forStanding(id, EVENTS[id], 'gov'), id).toBe(false);
    for (const id of ['censureMotion', 'bipartisanOffer', 'massRally', 'oppositionPact']) expect(forStanding(id, EVENTS[id], 'opp'), id).toBe(false);
    // The old events told in the government's voice no longer come to the opposition.
    for (const id of ['gigInsurance', 'trawlers', 'hawkerLicence', 'priceSurge', 'flashFloods']) expect(forStanding(id, EVENTS[id], 'opp'), id).toBe(false);
  });
});

describe('the seventy that were written for a place', () => {
  const ids = Object.keys(own);
  it('are seventy, with the words for every option and result in both languages', () => {
    expect(ids).toHaveLength(70);
    for (const id of ids) {
      const def = EVENTS[id];
      expect(def.seats, id).toBeTruthy();
      expect(def.choices, id).toHaveLength(3);
      for (const text of [EVENTS_EN[id], EVENTS_MS[id]]) {
        expect(text, id).toBeDefined();
        expect(text.body.length, id).toBeGreaterThan(60);
        expect(text.options, id).toHaveLength(3);
        expect(text.results, id).toHaveLength(3);
        def.choices.forEach((ch, i) => {
          expect(Array.isArray(text.results[i]), `${id} ${i}`).toBe(!!ch.gamble);
          expect(text.options[i].length, `${id} o${i}`).toBeGreaterThan(5);
          for (const r of [text.results[i]].flat()) expect(r.length, `${id} r${i}`).toBeGreaterThan(20);
        });
      }
      expect(EVENTS_MS[id].title, id).not.toBe(EVENTS_EN[id].title);
      expect(EVENT_ART[id], id).toBeTruthy();
    }
  });

  it('keep every consequence within the sizes the rest of the game uses, and ask only for what the place has', () => {
    for (const id of ids) {
      for (const e of effectsOf(id)) {
        const limit = BOUND[e.t];
        if (limit !== undefined && 'n' in e) expect(Math.abs(e.n), `${id} ${e.t}`).toBeLessThanOrEqual(limit);
      }
      const kinds = new Set(effectsOf(id).map((e) => e.t));
      // Only a government has public trust, commitments, an economy and a nation to look after.
      if (!seatsOfEvent(id, EVENTS[id]).some((s) => s === 'pm' || s === 'gov')) for (const k of ['trust', 'fiscal', 'economy', 'nation'] as const) expect(kinds.has(k), `${id} ${k}`).toBe(false);
      // Nobody is trapped: there is always a choice that costs nothing.
      expect(EVENTS[id].choices.some((c) => !c.effects.some((e) => e.t === 'funds' && e.n < 0)), id).toBe(true);
    }
  });

  it('come to a player standing where they were written for, and every choice can be taken without breaking the game', () => {
    for (const id of ids) {
      const def = EVENTS[id];
      for (const at of def.seats!) {
        const c = stand(at);
        const needs = def.needs;
        if (needs?.states) c.career!.states[world.states[0]] = c.player;
        if (needs?.partners && !c.career!.government.partners.length) c.career!.government.partners = [BP === c.player ? PT : BP];
        if (needs?.slump) c.career!.economy.growth = 1;
        if (needs?.hot) c.career!.economy.inflation = 5;
        if (needs?.unityBelow) c.parties[c.player]!.unity = 40;
        if (needs?.late) c.career!.week = Math.ceil(c.career!.length * 0.8);
        if (needs?.shaky) c.career!.government.stability = 30;
        expect(standingOf(c), `${id} ${at}`).toBe(at);
        expect(eligible(c, id), `${id} ${at}`).toBe(true);
        for (let choice = 0; choice < 3; choice++) {
          const copy = structuredClone(c);
          copy.rng = (choice + 3) * 7919;
          resolveEvent(world, copy, { id: 1, kind: 'event', from: null, event: id }, choice);
          expect(copy.news.at(-1)!.key, id).toMatch(new RegExp(`^event\\.${id}\\.r${choice}[wl]?$`));
          expect(isValidCampaign(JSON.parse(JSON.stringify(copy)), world), `${id} ${at} ${choice}`).toBe(true);
        }
      }
    }
  });
});

describe('the logic of when a trouble comes', () => {
  it('waits for the state of things it is about: a slump, rising prices, a restless party, the end of a term', () => {
    const c = stand('pm');
    c.career!.economy.growth = 4.2; c.career!.economy.inflation = 2.8; c.career!.week = 5;
    for (const id of ['emergencyPowers', 'nationalAddress', 'inflationCommittee', 'giveawayBudget']) expect(eligible(c, id), id).toBe(false);
    c.career!.economy.growth = 1; expect(eligible(c, 'emergencyPowers')).toBe(true);
    c.career!.economy.inflation = 5; expect(eligible(c, 'inflationCommittee')).toBe(true);
    c.career!.week = Math.ceil(c.career!.length * 0.8); expect(eligible(c, 'giveawayBudget')).toBe(true);
    const p = stand('gov');
    p.parties[p.player]!.unity = 80;
    expect(eligible(p, 'restlessMembers')).toBe(false);
    p.parties[p.player]!.unity = 40;
    expect(eligible(p, 'restlessMembers')).toBe(true);
    // The opposition only moves a censure motion against a government that is shaky.
    const l = stand('lead');
    l.career!.government.stability = 90;
    expect(eligible(l, 'censureMotion')).toBe(false);
    l.career!.government.stability = 40;
    expect(eligible(l, 'censureMotion')).toBe(true);
  });

  it('puts a kind of trouble off for a while after it has come, so that one kind does not make a game', () => {
    expect(topicOf('nasiLemakPrice', {})).toBe(topicOf('priceSurge', {}));
    expect(topicOf('flood', {})).not.toBe(topicOf('nasiLemakPrice', {}));
    expect(topicOf('somethingElse', {})).toBe('somethingElse');
    expect(topicOf('x', { topic: 'mine' })).toBe('mine');
    for (const id of Object.keys(TOPICS)) expect(EVENTS[id], id).toBeDefined();
    expect(new Set(Object.values(TOPICS)).size).toBeGreaterThanOrEqual(12);
    // Over many draws, while a topic cools, it comes up far less often than when it does not.
    const count = (cooling: boolean) => {
      let hits = 0;
      for (let seed = 1; seed <= 400; seed++) {
        const c = stand('pm');
        const k = c.career!;
        k.week = 60; k.quietUntil = 0; k.queue = []; k.fired = [];
        if (cooling) k.topicWeeks = { cost: k.week - 2 };
        const rng = new Rng(seed);
        const original = rng.next.bind(rng);
        // Force a draw every time, and see which kind it lands on.
        rng.next = (() => { let first = true; return () => (first ? ((first = false), 0) : original()); })();
        if (rollEvent(c, rng) && c.inbox.some((s) => s.kind === 'event' && s.event && TOPICS[s.event] === 'cost')) hits++;
      }
      return hits;
    };
    const [cold, hot] = [count(false), count(true)];
    expect(hot).toBeLessThan(cold);
    expect(COOL_WEEKS).toBeGreaterThan(10);
  }, 60_000); // eight hundred careers started: slow when the machine is busy
});
