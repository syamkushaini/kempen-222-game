import { describe, expect, it } from 'vitest';
import { BYELECTION_SEAT, BYELECTION_SEATS, byElectionId, getWorld, world } from '../data/world';
import { nextTerm, skipAhead, startCareer, termWeek } from '../sim/campaign/career';
import { endDay, makeOffer } from '../sim/campaign/formation';
import { closeNight, endWeek, newCampaign } from '../sim/campaign/turn';
import { N_PARTIES } from '../sim/types';
import { newGame, parseSave, serializeSave, SAVE_VERSION } from './game';
import { exportFileName, SaveStore, type KeyValueStore } from './saves';

const game = (name: string, seed = 5, now = 1000) =>
  newGame(name, newCampaign(world, { player: 0, difficulty: 'normal', seed }), now);

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => { data.set(k, v); },
    removeItem: (k) => { data.delete(k); },
  };
}

describe('save format', () => {
  it('round-trips a game exactly, mid-campaign', () => {
    const g = game('Test', 12345, 1_700_000_000_000);
    endWeek(world, g.campaign);
    endWeek(world, g.campaign);
    expect(parseSave(serializeSave(g))).toEqual({ ok: true, state: g });
  });

  it('rejects text that is not a save', () => {
    expect(parseSave('hello')).toEqual({ ok: false, error: 'not-json' });
    expect(parseSave('[1,2]')).toEqual({ ok: false, error: 'not-a-save' });
    expect(parseSave('{"foo":1}')).toEqual({ ok: false, error: 'not-a-save' });
  });

  it('rejects saves from a newer version and from the foundation build', () => {
    expect(parseSave(JSON.stringify({ ...game('x'), version: SAVE_VERSION + 1 }))).toEqual({ ok: false, error: 'too-new' });
    expect(parseSave(JSON.stringify({ version: 1, id: 'a', name: 'old' }))).toEqual({ ok: false, error: 'outdated' });
  });

  it('upgrades a stage 2 save, which was always the general election', () => {
    const g = game('older') as any;
    const { scenario, ...campaign } = g.campaign;
    const { tutorial, ...rest } = g;
    const parsed = parseSave(JSON.stringify({ ...rest, version: 2, campaign }));
    expect(scenario).toBe('general');
    expect(tutorial).toBeNull();
    expect(parsed).toEqual({ ok: true, state: g });
  });

  it('upgrades a stage 3 save, which had no chiefs', () => {
    const g = game('before chiefs') as any;
    const parties = g.campaign.parties.map((p: any) => {
      if (!p) return p;
      const { chiefs, chiefFloor, ...rest } = p;
      return rest;
    });
    const parsed = parseSave(JSON.stringify({ ...g, version: 3, campaign: { ...g.campaign, parties } }));
    expect(parsed).toEqual({ ok: true, state: g });
  });

  it('turns away a save made when there were fewer parties, rather than loading it wrongly', () => {
    const g = game('before the small parties') as any;
    // What a save of the previous version looked like: seven entries wherever there is one per party.
    g.version = 8;
    g.campaign.parties = g.campaign.parties.slice(0, 7);
    g.campaign.relations = g.campaign.relations.slice(0, 7).map((row: number[]) => row.slice(0, 7));
    g.campaign.met = g.campaign.met.slice(0, 7);
    expect(parseSave(JSON.stringify(g))).toEqual({ ok: false, error: 'outdated' });
  });

  it('upgrades a save from before coalitions, with leaders on their starting terms', () => {
    const g = game('before coalitions') as any;
    const { relations, standDowns, pacts, understandings, met, katak, offered, inbox, nextScene, formation, ...campaign } = g.campaign;
    campaign.parties = campaign.parties.map((p: any) => {
      if (!p) return p;
      const { unity, ...rest } = p;
      return rest;
    });
    expect(relations).toHaveLength(N_PARTIES);
    expect([standDowns, pacts, understandings, katak, offered, inbox, formation]).toEqual([{}, [], [], [], [], [], null]);
    expect(met.length + nextScene).toBe(N_PARTIES + 1);
    expect(parseSave(JSON.stringify({ ...g, version: 4, campaign }))).toEqual({ ok: true, state: g });
  });

  it('round-trips the talks after an election, mid-negotiation', () => {
    const hung = getWorld('hung')!;
    const g = newGame('Talks', newCampaign(hung, { player: 0, difficulty: 'normal', seed: 3 }), 5);
    expect(g.campaign.phase).toBe('formation');
    makeOffer(hung, g.campaign, 3, { posts: 7, senior: 'dpm', demands: ['autonomy', 'oilRoyalty'], cash: 0 });
    endDay(hung, g.campaign);
    expect(parseSave(serializeSave(g))).toEqual({ ok: true, state: g });
    const broken = JSON.parse(serializeSave(g));
    broken.campaign.formation.pledge = [9];
    expect(parseSave(JSON.stringify(broken))).toEqual({ ok: false, error: 'damaged' });
  });

  it('upgrades a save from before careers', () => {
    const g = game('before careers') as any;
    const { career, ...campaign } = g.campaign;
    expect(career).toBeNull();
    expect(parseSave(JSON.stringify({ ...g, version: 5, campaign }))).toEqual({ ok: true, state: g });
  });

  it('round-trips a career, including one past its first election', () => {
    const base = getWorld('career')!;
    const g = newGame('Career', startCareer(base, { player: 2, difficulty: 'normal', seed: 4 }), 5);
    skipAhead(base, g.campaign, 30);
    expect(parseSave(serializeSave(g))).toEqual({ ok: true, state: g });
    // A career save cannot pass for a single contest.
    expect(parseSave(JSON.stringify({ ...g, campaign: { ...g.campaign, scenario: 'general' } }))).toEqual({ ok: false, error: 'damaged' });

    const c = g.campaign;
    c.inbox = [];
    c.career!.week = c.career!.length;
    termWeek(base, c);
    while (c.phase === 'campaign') endWeek(base, c);
    closeNight(base, c);
    for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(base, c);
    expect(nextTerm(base, c)).toBe(true);
    const parsed = parseSave(serializeSave(g));
    expect(parsed).toEqual({ ok: true, state: g });
    const broken = JSON.parse(serializeSave(g));
    broken.campaign.career.results.votes.pop();
    expect(parseSave(JSON.stringify(broken))).toEqual({ ok: false, error: 'damaged' });
  });

  it('upgrades a career from before the governing layer, and rejects a damaged one', () => {
    const base = getWorld('career')!;
    const office = ['economy', 'budget', 'tabled', 'fiscal', 'cabinet', 'bills', 'delivery', 'obligations', 'levers', 'motion', 'rivalBills', 'record', 'ending'];
    const older = (player: number) => {
      const g = JSON.parse(serializeSave(newGame('Old career', startCareer(base, { player, difficulty: 'normal', seed: 4 }), 5)));
      for (const key of office) delete g.campaign.career[key];
      return parseSave(JSON.stringify({ ...g, version: 6 }));
    };
    const pm = older(0), opp = older(2);
    if (!pm.ok || !opp.ok) throw new Error('upgrade failed');
    const k = pm.state.campaign.career!;
    expect(pm.state.version).toBe(SAVE_VERSION);
    expect(k.cabinet).toHaveLength(8);
    expect(k.tabled).toEqual({ lines: { aid: 0, health: 0, education: 0, rural: 0, civil: 0 }, tax: 0 });
    expect(k.obligations.map((o) => o.demand)).toEqual(['subsidies', 'autonomy', 'autonomy']);
    expect(k.record).toMatchObject({ elections: 0, weeksPm: 0, kept: [] });
    expect(k.ending).toBeNull();
    expect(opp.state.campaign.career!.obligations).toEqual([]);
    // The upgraded career plays on.
    skipAhead(base, pm.state.campaign, 5);
    expect(pm.state.campaign.career!.record.weeksPm).toBeGreaterThan(0);
    expect(parseSave(serializeSave(pm.state))).toEqual({ ok: true, state: pm.state });

    const g = newGame('Career', startCareer(base, { player: 0, difficulty: 'normal', seed: 4 }), 5);
    for (const damage of [
      (k: any) => { k.cabinet[0].portfolio = 'sport'; },
      (k: any) => { k.budget.lines.aid = 2; },
      (k: any) => { k.delivery.homes = 'maybe'; },
      (k: any) => { k.ending = { kind: 'bored', legacy: 'footnote', score: 1 }; },
      (k: any) => { delete k.record.falls; },
    ]) {
      const broken = JSON.parse(serializeSave(g));
      damage(broken.campaign.career);
      expect(parseSave(JSON.stringify(broken))).toEqual({ ok: false, error: 'damaged' });
    }
  });

  it('upgrades a career from before by-elections and state polls', () => {
    const base = getWorld('career')!;
    const g = JSON.parse(serializeSave(newGame('Old career', startCareer(base, { player: 2, difficulty: 'normal', seed: 4 }), 5)));
    for (const key of ['house', 'states', 'rounds']) delete g.campaign.career[key];
    delete g.campaign.team;
    delete g.identity;
    g.campaign.career.week = 140;
    for (const p of g.campaign.parties) if (p) { delete p.spent; delete p.fined; }
    const parsed = parseSave(JSON.stringify({ ...g, version: 7 }));
    if (!parsed.ok) throw new Error('upgrade failed');
    const k = parsed.state.campaign.career!;
    expect(k.house).toEqual({});
    expect(Object.keys(k.states).length).toBe(13);
    expect(k.rounds).toBe(2); // rounds already past are not held again
    expect(parsed.state.campaign.team.keySeats).toEqual([]);
    expect(parsed.state.identity).toBeNull();
    const broken = JSON.parse(serializeSave(parsed.state));
    broken.campaign.career.house['P.001'] = 99;
    expect(parseSave(JSON.stringify(broken))).toEqual({ ok: false, error: 'damaged' });
  });

  it('round-trips other scenarios and the tutorial marker', () => {
    const perak = getWorld('state:perak')!;
    const g = newGame('Perak', newCampaign(perak, { player: 0, difficulty: 'hard', seed: 8 }), 5);
    endWeek(perak, g.campaign);
    expect(parseSave(serializeSave(g))).toEqual({ ok: true, state: g });

    const by = getWorld('byelection')!;
    const t = newGame('Tutorial', newCampaign(by, { player: 0, difficulty: 'easy', seed: 8 }), 5, true);
    t.tutorial!.step = 3;
    expect(parseSave(serializeSave(t))).toEqual({ ok: true, state: t });

    // A by-election in a drawn seat saves and loads like the first one.
    const drawn = getWorld(byElectionId(BYELECTION_SEATS.find((id) => id !== BYELECTION_SEAT)!))!;
    const d = newGame('Drawn', newCampaign(drawn, { player: 0, difficulty: 'easy', seed: 8 }), 5, true);
    expect(d.campaign.scenario).toBe(drawn.id);
    expect(parseSave(serializeSave(d))).toEqual({ ok: true, state: d });
  });

  it('rejects a save whose scenario does not exist or does not match its contents', () => {
    const g = game('x') as any;
    g.campaign.scenario = 'state:atlantis';
    expect(parseSave(JSON.stringify(g))).toEqual({ ok: false, error: 'damaged' });
    const h = game('x') as any;
    h.campaign.scenario = 'state:perak';
    expect(parseSave(JSON.stringify(h))).toEqual({ ok: false, error: 'damaged' });
  });

  it('rejects damaged saves', () => {
    const g = game('x') as any;
    g.campaign.dyn.support.nat = [[1, 2, 3]];
    expect(parseSave(JSON.stringify(g))).toEqual({ ok: false, error: 'damaged' });
    const h = game('x') as any;
    h.campaign.parties[0].funds = 'lots';
    expect(parseSave(JSON.stringify(h))).toEqual({ ok: false, error: 'damaged' });
    const k = game('x') as any;
    delete k.campaign;
    expect(parseSave(JSON.stringify(k))).toEqual({ ok: false, error: 'damaged' });
  });
});

describe('save slots', () => {
  it('saves, lists, loads and deletes', () => {
    const store = new SaveStore(memoryStore());
    const g = game('Career one');
    expect(store.list()).toEqual([null, null, null, null, null]);
    expect(store.save('2', g)).toBe(true);
    expect(store.list()[1]).toEqual({ slot: '2', name: 'Career one', week: 1, totalWeeks: 8, scenario: 'general', player: 0, finished: false, talks: false, term: null, updatedAt: 1000 });
    expect(store.load('2')).toEqual(g);
    store.delete('2');
    expect(store.load('2')).toBeNull();
  });

  it('keeps the autosave separate from manual slots', () => {
    const store = new SaveStore(memoryStore());
    store.save('auto', game('auto game'));
    expect(store.list().every((m) => m === null)).toBe(true);
    expect(store.load('auto')?.name).toBe('auto game');
  });

  it('treats a corrupted slot as empty', () => {
    const kv = memoryStore();
    kv.data.set('k222.save.1', '{broken');
    expect(new SaveStore(kv).load('1')).toBeNull();
  });

  it('does not throw when storage is missing or full', () => {
    const none = new SaveStore(null);
    expect(none.available).toBe(false);
    expect(none.save('1', game('x'))).toBe(false);
    expect(none.load('1')).toBeNull();

    const full: KeyValueStore = {
      getItem: () => null,
      setItem: () => { throw new Error('QuotaExceededError'); },
      removeItem: () => {},
    };
    expect(new SaveStore(full).save('1', game('x'))).toBe(false);
  });

  it('keeps a full campaign well inside browser storage limits', () => {
    const g = game('big');
    while (g.campaign.phase === 'campaign') endWeek(world, g.campaign);
    expect(serializeSave(g).length).toBeLessThan(400_000);
  });

  it('builds a safe export file name', () => {
    const g = game('Parti Saya / 2026!');
    expect(exportFileName(g)).toBe('kempen222-parti-saya-2026-week1.json');
  });
});
