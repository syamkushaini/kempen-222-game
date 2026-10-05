import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { byElectionId, getWorld, STATE_SCENARIOS, VACANCIES, world as general } from '../../data/world';
import { emptyDynamics } from '../dynamics';
import { lastElection, majorityLine, projectElection } from '../election';
import { transferRate } from '../transfer';
import { PARTY_IDS } from '../types';
import { breakPact, inPact } from './diplomacy';
import { atHome } from './field';
import { endDay } from './formation';
import { autoPlayWeek, closeNight, electionResult, endWeek, newCampaign, playable, standingPact, startingFunds } from './turn';
import { isValidCampaign } from './validate';

// Melaka (2021), Johor (2022), Sarawak (2021) and Sabah (2020): the four states
// whose assemblies were elected apart from the rest, each from its own result file.

const P = (id: (typeof PARTY_IDS)[number]) => PARTY_IDS.indexOf(id);
const ids = (ps: number[]) => ps.map((p) => PARTY_IDS[p]);
const world = (st: string) => getWorld(`state:${st}`)!;
const LAST = ['melaka', 'johor', 'sarawak', 'sabah'] as const;
// Seats won, as declared.
const REAL: Record<(typeof LAST)[number], Partial<Record<(typeof PARTY_IDS)[number], number>>> = {
  melaka: { bp: 21, ps: 5, pt: 2 },
  johor: { bp: 40, ps: 12, pt: 3, genba: 1 },
  sarawak: { gbk: 76, cahaya: 4, ps: 2 },
  sabah: { gbs: 24, legasi: 23, bp: 14, ps: 9, oth: 3 },
};

describe('the last four states', () => {
  it('make all thirteen playable, and show each result as it was declared', () => {
    expect(STATE_SCENARIOS).toHaveLength(13);
    expect(new Set(STATE_SCENARIOS).size).toBe(13);
    for (const st of LAST) {
      const w = world(st);
      const tally = lastElection(w).tally;
      expect(Object.fromEntries(PARTY_IDS.map((id, p) => [id, tally[p]]).filter(([, n]) => n !== 0)), st).toEqual(REAL[st]);
      expect(majorityLine(w)).toBe(Math.floor(w.seats.length / 2) + 1);
      // A state's seats are grouped by the parliamentary seat they sit in, and every one of them has a map.
      for (const seat of w.seats) expect(w.states).toContain(seat.state);
    }
    expect([world('melaka'), world('johor'), world('sarawak'), world('sabah')].map((w) => w.seats.length)).toEqual([28, 56, 82, 73]);
  });

  it('are fitted so that the model gives back the declared winner', () => {
    for (const st of LAST) {
      const w = world(st);
      const real = lastElection(w);
      const model = projectElection(w, emptyDynamics(), standingPact(w).standDowns);
      let same = 0, error = 0, n = 0;
      real.seats.forEach((o, i) => {
        if (o.winner === model.seats[i].winner) same++;
        o.votes.forEach((v, p) => { if (v > 0) { error += Math.abs(v / o.valid - model.seats[i].votes[p] / model.seats[i].valid); n++; } });
      });
      // Three were plain contests and fit exactly; Sabah is refitted through its pact, and one knife-edge seat falls the other way.
      expect(w.seats.length - same, st).toBeLessThanOrEqual(st === 'sabah' ? 1 : 0);
      expect(error / n, st).toBeLessThan(0.005);
    }
  });

  it('let the parties of Sabah and Sarawak be led on their own ground, ahead of the national ones', () => {
    expect(ids(playable(world('melaka')))).toEqual(['ps', 'bp', 'pt']);
    expect(ids(playable(world('johor')))).toEqual(['ps', 'bp', 'pt']);
    expect(ids(playable(world('sarawak')))).toEqual(['gbk', 'ps']);
    expect(ids(playable(world('sabah')))).toEqual(['gbs', 'legasi', 'ps', 'bp']);
    // Nowhere else: not in a general election, and not in another state.
    expect(ids(playable(general))).toEqual(['ps', 'bp', 'pt']);
    for (const p of [P('gbk'), P('gbs'), P('legasi')]) {
      expect(atHome(general, p)).toBe(false);
      expect(atHome(world('johor'), p)).toBe(false);
    }
    expect(atHome(world('sarawak'), P('gbk'))).toBe(true);
    expect(atHome(world('sarawak'), P('gbs'))).toBe(false);
  });

  it('give a party on its home ground a fuller chest than it brings to a general election, scaled to the contest', () => {
    const gbk = P('gbk');
    expect(startingFunds(general, gbk)).toBe(700_000);
    expect(startingFunds(world('sarawak'), gbk)).toBe(700_000 * 3 * world('sarawak').rules.econ);
    expect(startingFunds(world('sarawak'), gbk)).toBeGreaterThan(startingFunds(world('sarawak'), P('ps')));
    // The national parties bring what they bring to any state.
    expect(startingFunds(world('sarawak'), P('ps'))).toBe(startingFunds(world('johor'), P('ps')));
    // The small home party gets the same lift, but cannot be led.
    expect(startingFunds(world('sarawak'), P('cahaya'))).toBe(80_000 * 3 * world('sarawak').rules.econ);
    expect(atHome(world('sarawak'), P('cahaya'))).toBe(true);
  });

  it('open Sabah as it was fought: two allies, one of them in each seat, on terms the player can end', () => {
    const w = world('sabah');
    const [ps, legasi] = [P('ps'), P('legasi')];
    const { standDowns, pacts } = standingPact(w);
    expect(pacts).toEqual([{ a: ps, b: legasi, week: 0 }]);
    expect(Object.keys(standDowns)).toHaveLength(w.seats.length);
    for (const seat of w.seats) {
      const stood = standDowns[seat.id];
      expect((stood[ps] === legasi) !== (stood[legasi] === ps), seat.id).toBe(true);
      expect(seat.last.votes[stood[ps] === legasi ? ps : legasi]).toBe(0);
      expect(seat.basis!.votes[ps]).toBeGreaterThan(0);
      expect(seat.basis!.votes[legasi]).toBeGreaterThan(0);
    }
    // The other three were open contests.
    for (const st of ['melaka', 'johor', 'sarawak']) expect(standingPact(world(st))).toEqual({ standDowns: {}, pacts: [] });

    const c = newCampaign(w, { player: legasi, difficulty: 'normal', seed: 3 });
    expect(inPact(c, ps, legasi)).toBe(true);
    expect(c.news.map((n) => n.key)).toContain('news.pact.standing.mine');
    const standsIn = (p: number) => w.seats.filter((s, i) => w.baseline.contesting[i][p] && (c.standDowns[s.id]?.[p] ?? -1) < 0).length;
    expect([standsIn(legasi), standsIn(ps)]).toEqual([46, 27]);
    expect(breakPact(c, ps)).toBe(true);
    expect([standsIn(legasi), standsIn(ps)]).toEqual([73, 73]);
  });

  it('rebuilt Sabah with the same voter-transfer rates the game applies to a pact', () => {
    const script = readFileSync(new URL('../../../scripts/build-data.mjs', import.meta.url), 'utf8');
    for (const [from, to] of [['ps', 'legasi'], ['legasi', 'ps']] as const) {
      const found = new RegExp(`'${from}>${to}': \\{ to: ([\\d.]+), home: ([\\d.]+) \\}`).exec(script)!;
      expect({ to: Number(found[1]), home: Number(found[2]) }).toEqual(transferRate(P(from), P(to)));
    }
  });

  it('play through as every party on offer, to a full assembly and a government', () => {
    for (const st of LAST) {
      const w = world(st);
      for (const player of playable(w)) {
        const c = newCampaign(w, { player, difficulty: 'normal', seed: 11 });
        expect(c.parties[player], `${st} ${PARTY_IDS[player]}`).not.toBeNull();
        while (c.phase === 'campaign') { autoPlayWeek(w, c); endWeek(w, c); }
        expect(electionResult(w, c)!.tally.reduce((a, b) => a + b, 0)).toBe(w.seats.length);
        closeNight(w, c);
        for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(w, c);
        expect(c.phase, `${st} ${PARTY_IDS[player]}`).not.toBe('formation');
        expect(isValidCampaign(JSON.parse(JSON.stringify(c)), w), `${st} ${PARTY_IDS[player]}`).toBe(true);
      }
    }
  }, 120_000);

  it('offer a party to lead in every by-election, the home party among them wherever it stands', () => {
    for (const v of VACANCIES) {
      const w = getWorld(byElectionId(v.key))!;
      const offered = playable(w);
      expect(offered.length, v.key).toBeGreaterThan(0);
      for (const p of offered) expect(w.baseline.contesting[0][p], `${v.key} ${PARTY_IDS[p]}`).toBe(true);
      if (v.state === 'sarawak') expect(ids(offered)[0], v.key).toBe('gbk');
      if (!['sabah', 'sarawak', 'labuan'].includes(v.state)) expect(offered.every((p) => p < 3), v.key).toBe(true);
    }
    const one = getWorld(byElectionId(VACANCIES.find((v) => v.kind === 'dun' && v.state === 'sarawak')!.key))!;
    const c = newCampaign(one, { player: P('gbk'), difficulty: 'easy', seed: 4 });
    while (c.phase === 'campaign') { autoPlayWeek(one, c); endWeek(one, c); }
    expect(electionResult(one, c)!.seats).toHaveLength(1);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), one)).toBe(true);
  }, 120_000);
});
