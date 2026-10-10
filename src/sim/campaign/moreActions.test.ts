import { describe, expect, it } from 'vitest';
import { getWorld, world as general } from '../../data/world';
import { translate } from '../../i18n/strings';
import { BLOC_IDS, PARTY_IDS } from '../types';
import { ACTIONS, canDo, doAction, spendingLimit, truth } from './actions';
import { endWeek, newCampaign, playerAct } from './turn';
import { ACTION_IDS, type ActionId, type Campaign } from './types';

const PS = PARTY_IDS.indexOf('ps'), BP = PARTY_IDS.indexOf('bp');
const NEW: ActionId[] = ['townhall', 'charity', 'youth', 'festival', 'conference', 'debate', 'manifesto', 'radio'];
const bloc = (id: (typeof BLOC_IDS)[number]) => BLOC_IDS.indexOf(id);
const game = (seed = 3): Campaign => newCampaign(general, { player: PS, difficulty: 'normal', seed });
/** Gives the player room to try anything. */
const rich = (c: Campaign) => { c.parties[PS]!.funds = 50_000_000; c.parties[PS]!.days = 100; return c; };
const urban = general.seats.find((s) => s.kind === 'urban' && general.baseline.contesting[general.seatIndex.get(s.id)!][PS])!;
const rural = general.seats.find((s) => s.kind === 'rural' && general.baseline.contesting[general.seatIndex.get(s.id)!][PS])!;
const state = (id: string) => general.seats[general.seatIndex.get(id)!].state;
/** The mean of a measure over many campaigns that differ only in luck. */
const mean = (n: number, f: (seed: number) => number) => Array.from({ length: n }, (_, i) => f(i + 1)).reduce((a, b) => a + b, 0) / n;

describe('the added actions', () => {
  it('are all defined, priced, and available in the contests that suit them', () => {
    for (const id of NEW) {
      expect(ACTION_IDS).toContain(id);
      expect(ACTIONS[id].days).toBeGreaterThan(0);
      expect(general.rules.actions).toContain(id);
    }
    const by = getWorld('byelection')!;
    expect(by.rules.actions).toEqual(expect.arrayContaining(['townhall', 'charity', 'festival', 'conference']));
    expect(by.rules.actions).not.toContain('debate');
    // A by-election has a manifesto too, about one thing.
    expect(by.rules.actions).toContain('manifesto');
  });

  it('are explained and reported in both languages', () => {
    const keys = NEW.flatMap((id) => [`action.${id}`, `action.${id}.desc`]).concat([
      'news.me.townhall.ok', 'news.me.townhall.flop', 'news.me.charity.ok', 'news.me.charity.backfire', 'news.me.youth', 'news.me.festival.great', 'news.me.festival.viral', 'news.me.festival.flop',
      'news.me.conference', 'news.me.debate.won', 'news.me.debate.lost', 'news.me.manifesto.ok', 'news.me.manifesto.weak', 'news.me.radio',
    ]);
    for (const key of keys) for (const lang of ['en', 'ms'] as const) expect(translate(lang, key as never), `${lang} ${key}`).not.toBe(key);
  });

  it('can each be taken by the player, cost what they should, and are recorded', () => {
    const c = rich(game());
    const tries: [ActionId, object][] = [
      ['townhall', { seat: urban.id }], ['charity', { state: state(rural.id) }], ['youth', { state: state(urban.id) }], ['festival', { state: state(rural.id) }],
      ['conference', {}], ['debate', { party: BP }], ['manifesto', {}], ['radio', { state: state(rural.id) }],
    ];
    for (const [id, target] of tries) {
      const before = c.ledger.length;
      expect(canDo(general, c, PS, id, target).ok, id).toBe(true);
      expect(playerAct(general, c, id, target), id).not.toBeNull();
      expect(c.ledger.length, id).toBe(before + 1);
    }
  });
});

// These play hundreds of campaigns that differ only in luck, which takes a while when other tests run alongside.
describe('what each one is good and bad at', { timeout: 60_000 }, () => {
  it('a town hall wins a city seat more than a village seat, and sometimes goes wrong', () => {
    const gain = (seat: string) => mean(60, (seed) => { const c = rich(game(seed)); doAction(general, c, PS, 'townhall', { seat }); return c.dyn.support.seat[seat][PS]; });
    expect(gain(urban.id)).toBeGreaterThan(gain(rural.id) * 1.4);
    let flops = 0;
    for (let seed = 1; seed <= 200; seed++) {
      const c = rich(game(seed));
      if (doAction(general, c, PS, 'townhall', { seat: urban.id }).quality === 'flop') flops++;
    }
    expect(flops / 200).toBeGreaterThan(0.1);
    expect(flops / 200).toBeLessThan(0.3);
  });

  it('aid reaches poor households and villages, helps turnout, and sometimes is called vote-buying more when over the limit', () => {
    const st = state(rural.id);
    const share = (b: string) => mean(40, (seed) => { const c = rich(game(seed)); doAction(general, c, PS, 'charity', { state: st }); return c.dyn.support.state[st][bloc(b as never)][PS]; });
    expect(share('urban_b40')).toBeGreaterThan(share('urban_lib') * 5);
    const scandals = (over: boolean) => {
      let n = 0;
      for (let seed = 1; seed <= 200; seed++) {
        const c = rich(game(seed));
        if (over) c.parties[PS]!.spent = spendingLimit(general) + 1;
        if (doAction(general, c, PS, 'charity', { state: st }).quality === 'backfire') n++;
      }
      return n / 200;
    };
    const normal = scandals(false), over = scandals(true);
    expect(normal).toBeGreaterThan(0.07);
    expect(normal).toBeLessThan(0.25);
    expect(over).toBeGreaterThan(normal + 0.1);
  });

  it('a youth drive wins the young and brings them out, for everyone', () => {
    const st = state(urban.id);
    const c = rich(game());
    const b18 = bloc('undi18');
    const before = c.dyn.turnout.nat[b18];
    doAction(general, c, PS, 'youth', { state: st });
    expect(c.dyn.turnout.nat[b18]).toBeGreaterThan(before);
    expect(c.dyn.support.state[st][b18][PS]).toBeGreaterThan(c.dyn.support.state[st][bloc('heartland')][PS] * 10);
  });

  it('a carnival is a gamble: about half the time it takes off at two or three times what it once did and lifts unity, and otherwise the money is spent for nothing', () => {
    let lifted = 0, flops = 0, big = 0;
    const base = (() => { const c = rich(game(1)); const before = c.parties[PS]!.funds; playerAct(general, c, 'festival', { state: state(rural.id) }); return before - c.parties[PS]!.funds; })();
    expect(base).toBeGreaterThan(0);
    for (let seed = 1; seed <= 60; seed++) {
      const c = rich(game(seed));
      c.parties[PS]!.unity = 50;
      const funds = c.parties[PS]!.funds;
      playerAct(general, c, 'festival', { state: state(rural.id) });
      const rows = c.dyn.support.state[state(rural.id)];
      const gain = rows ? Math.max(...rows.map((row) => row[PS])) : 0;
      // The money is spent whether or not it comes off.
      expect(c.parties[PS]!.funds).toBeLessThan(funds);
      if (gain > 0) { lifted++; expect(c.parties[PS]!.unity).toBe(52); if (gain > 0.085) big++; } else { flops++; expect(c.parties[PS]!.unity).toBe(50); }
    }
    expect(lifted).toBeGreaterThan(18);
    expect(flops).toBeGreaterThan(18);
    expect(big).toBeGreaterThan(0);
    expect(big).toBeLessThan(lifted / 2);
  });

  it('a conference lifts unity far more than a carnival but wins no votes', () => {
    const c = rich(game());
    c.parties[PS]!.unity = 50;
    const nat = JSON.stringify(c.dyn.support.nat);
    const seat = JSON.stringify(c.dyn.support.state);
    playerAct(general, c, 'conference', {});
    expect(c.parties[PS]!.unity).toBe(58);
    expect(JSON.stringify(c.dyn.support.nat)).toBe(nat);
    expect(JSON.stringify(c.dyn.support.state)).toBe(seat);
    c.parties[PS]!.unity = 98;
    c.parties[PS]!.used = {};
    playerAct(general, c, 'conference', {});
    expect(c.parties[PS]!.unity).toBeLessThanOrEqual(100);
  });

  it('a debate is won or lost, hurts the loser, and is worth less the second time', () => {
    const outcomes = new Set<string>();
    let win = 0, lose = 0;
    for (let seed = 1; seed <= 120; seed++) {
      const c = rich(game(seed));
      const r = doAction(general, c, PS, 'debate', { party: BP });
      outcomes.add(r.quality);
      const gap = c.dyn.support.nat.reduce((a, row) => a + row[PS], 0);
      if (r.quality === 'great') { win++; expect(gap).toBeGreaterThan(0); expect(c.dyn.support.nat.reduce((a, row) => a + row[BP], 0)).toBeLessThan(0); }
      else { lose++; expect(gap).toBeLessThan(0); }
    }
    expect([...outcomes].sort()).toEqual(['great', 'weak']);
    expect(win).toBeGreaterThan(20);
    expect(lose).toBeGreaterThan(20);
    // The average gain from a won debate, given how many have already been held.
    const wins = (repeats: number) => {
      const gains: number[] = [];
      for (let seed = 1; seed <= 150; seed++) {
        const c = rich(game(seed));
        c.parties[PS]!.plays = { debate: repeats };
        if (doAction(general, c, PS, 'debate', { party: BP }).quality === 'great') gains.push(c.dyn.support.nat.reduce((a, row) => a + row[PS], 0));
      }
      return gains.reduce((a, b) => a + b, 0) / gains.length;
    };
    expect(wins(3)).toBeLessThan(wins(0) * 0.5);
  });

  it('the manifesto can be launched once, and a divided party launches it badly', () => {
    const c = rich(game());
    expect(playerAct(general, c, 'manifesto', {})).not.toBeNull();
    endWeek(general, c);
    c.parties[PS]!.days = 100; c.parties[PS]!.funds = 50_000_000;
    expect(canDo(general, c, PS, 'manifesto', {})).toEqual({ ok: false, reason: 'once' });
    const total = (unity: number) => { const d = rich(game(5)); d.parties[PS]!.unity = unity; doAction(general, d, PS, 'manifesto', {}); return d.dyn.support.nat.reduce((a, row) => a + row[PS], 0); };
    expect(total(30)).toBeLessThan(total(80) * 0.6);
  });

  it('radio reaches the villages and the pensioners, and barely the cities', () => {
    const st = state(rural.id);
    const c = rich(game());
    doAction(general, c, PS, 'radio', { state: st });
    const row = (b: string) => c.dyn.support.state[st][bloc(b as never)][PS];
    expect(row('heartland')).toBeGreaterThan(row('urban_lib') * 5);
    expect(row('seniors')).toBeGreaterThan(row('undi18') * 5);
  });

  it('do not break a campaign: the game’s own autoplayer and an idle player still finish', () => {
    const c = game(7);
    while (c.phase === 'campaign') endWeek(general, c);
    expect(truth(general, c).tally.reduce((a, b) => a + b, 0)).toBe(general.seats.length);
  });
});
