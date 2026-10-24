import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { emptyDynamics } from '../dynamics';
import { projectElection } from '../election';
import { STANDS } from '../transfer';
import { N_BLOCS, PARTY_IDS } from '../types';
import { BNPAS, WHATIF, WHATIF_IDS, STATE_WHATIF_IDS, perpaduan, whatIfsFor } from './whatif';
import { backRival, claimAgain, playerClaims, playerRole, startFormation } from './formation';
import { breakPact } from './diplomacy';
import { endWeek, electionResult, newCampaign } from './turn';
import { endDay as endDayFor } from './formation';
import { isValidCampaign } from './validate';

const BIG = PARTY_IDS.indexOf(BNPAS.big), SMALL = PARTY_IDS.indexOf(BNPAS.partner), PH = PARTY_IDS.indexOf('ps');
const melaka = getWorld('state:melaka')!;
const start = (player: number, whatIf?: string, world = melaka, seed = 4) => newCampaign(world, { player, difficulty: 'normal', seed, ...(whatIf ? { challenge: { fog: false, noisy: false, whatIf } } : {}) });

describe('Melaka with its two biggest sides standing together', () => {
  it('is offered for Melaka and nowhere else, beside the general election\'s own four', () => {
    expect(whatIfsFor('state:melaka')).toEqual(STATE_WHATIF_IDS);
    expect(whatIfsFor('general')).toEqual(WHATIF_IDS);
    expect(whatIfsFor('state:perak')).toEqual([]);
    expect(whatIfsFor('byelection')).toEqual([]);
  });

  it('opens with one side standing in each seat, and the smaller side in seven of the 28', () => {
    const c = start(PH, 'bnpas');
    const rows = Object.entries(c.standDowns);
    expect(rows).toHaveLength(melaka.seats.length);
    let small = 0;
    for (const [, row] of rows) {
      const aside = row.map((v, p) => (v !== STANDS ? p : -1)).filter((p) => p >= 0);
      expect(aside).toHaveLength(1);
      if (aside[0] === BIG) { expect(row[BIG]).toBe(SMALL); small++; } else { expect(aside[0]).toBe(SMALL); expect(row[SMALL]).toBe(BIG); }
    }
    expect(small).toBe(BNPAS.small);
    expect(c.pacts).toHaveLength(1);
    expect(c.relations[BIG][SMALL]).toBeGreaterThanOrEqual(30);
    expect(c.challenge?.whatIf).toBe('bnpas');
  });

  it('gives the smaller side the seats where it got its biggest shares, and no ballot paper to the side that stands aside', () => {
    const c = start(PH, 'bnpas');
    const share = (i: number) => melaka.seats[i].last.votes[SMALL] / melaka.seats[i].last.votes.reduce((a, b) => a + b, 0);
    const mine = melaka.seats.map((s, i) => ({ s, i })).filter(({ s }) => c.standDowns[s.id][BIG] === SMALL).map(({ i }) => share(i));
    const rest = melaka.seats.map((s, i) => ({ s, i })).filter(({ s }) => c.standDowns[s.id][SMALL] === BIG).map(({ i }) => share(i));
    expect(Math.min(...mine)).toBeGreaterThanOrEqual(Math.max(...rest));
    const o = projectElection(melaka, emptyDynamics(), c.standDowns);
    o.seats.forEach((seat, i) => {
      const stoodDown = c.standDowns[melaka.seats[i].id].findIndex((v) => v !== STANDS);
      expect(seat.votes[stoodDown], melaka.seats[i].id).toBe(0);
    });
  });

  it('says so on the first day, to the player in the pact and to everyone else', () => {
    for (const [player, key] of [[BIG, 'news.pact.together.mine'], [SMALL, 'news.pact.together.mine'], [PH, 'news.pact.together']] as const) {
      const c = start(player, 'bnpas');
      expect(c.news.some((n) => n.key === key), `${PARTY_IDS[player]}`).toBe(true);
    }
  });

  it('puts the player in the larger side in 21 seats and the smaller in 7', () => {
    const stands = (player: number) => { const c = start(player, 'bnpas'); return melaka.seats.filter((s) => c.standDowns[s.id][player] === STANDS).length; };
    expect(stands(BIG)).toBe(melaka.seats.length - BNPAS.small);
    expect(stands(SMALL)).toBe(BNPAS.small);
    expect(stands(PH)).toBe(melaka.seats.length);
  });

  it('changes nothing without it, in Melaka or in any other state', () => {
    expect(Object.keys(start(PH).standDowns)).toHaveLength(0);
    const perak = getWorld('state:perak')!;
    const c = start(PH, 'bnpas', perak);
    expect(Object.keys(c.standDowns)).toHaveLength(Object.keys(start(PH, undefined, perak).standDowns).length);
    expect(c.challenge?.whatIf).toBeUndefined();
  });

  it('plays through to a result, and a game saved on the way loads again', () => {
    const c = start(BIG, 'bnpas', melaka, 7);
    for (let i = 0; i < 3; i++) endWeek(melaka, c);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), melaka)).toBe(true);
    while (c.phase === 'campaign') endWeek(melaka, c);
    const r = electionResult(melaka, c)!;
    expect(r.seats).toHaveLength(melaka.seats.length);
    // the side that stood aside won no seat where it did not stand
    r.seats.forEach((seat, i) => { const sd = c.standDowns[melaka.seats[i].id]; if (sd[SMALL] === BIG) expect(seat.winner).not.toBe(SMALL); if (sd[BIG] === SMALL) expect(seat.winner).not.toBe(BIG); });
  });

  it('is the player\'s to keep or to end before nomination day: ending it puts every seat back to a contest, and costs the other leader\'s goodwill', () => {
    for (const player of [BIG, SMALL]) {
      const other = player === BIG ? SMALL : BIG;
      const c = start(player, 'bnpas');
      const before = c.relations[player][other];
      expect(breakPact(c, other)).toBe(true);
      expect(c.pacts).toHaveLength(0);
      expect(Object.keys(c.standDowns)).toHaveLength(0);
      expect(c.relations[player][other]).toBeLessThan(before);
      const o = projectElection(melaka, emptyDynamics(), c.standDowns);
      expect(o.seats.every((seat) => seat.votes[BIG] > 0 && seat.votes[SMALL] > 0)).toBe(true);
    }
  });

  it('is not the third side\'s to end: it is a pact between the other two', () => {
    const c = start(PH, 'bnpas');
    expect(breakPact(c, BIG)).toBe(false);
    expect(breakPact(c, SMALL)).toBe(false);
    expect(c.pacts).toHaveLength(1);
  });
});

describe('Perpaduan Bangsa: who leads the government', () => {
  const OTH = PARTY_IDS.indexOf('oth');
  const tally = (bp: number, pt: number, ps: number) => { const t = new Array<number>(PARTY_IDS.length).fill(0); t[BIG] = bp; t[SMALL] = pt; t[PH] = ps; t[OTH] = 28 - bp - pt - ps; return t; };
  const talks = (player: number, t: number[]) => { const c = start(player, 'bnpas'); startFormation(melaka, c, t); return c; };

  it('is on while the pact stands, in the "what if" only', () => {
    expect(perpaduan(start(PH, 'bnpas'))).toEqual({ head: BIG, partner: SMALL });
    expect(perpaduan(start(PH))).toBeNull();
    const c = start(SMALL, 'bnpas');
    breakPact(c, BIG);
    expect(perpaduan(c)).toBeNull();
  });

  it('gives the top post to the larger side when the alliance wins the House, and settles it at once', () => {
    for (const player of [BIG, SMALL, PH]) {
      const c = talks(player, tally(12, 7, 9));
      expect(c.formation!.outcome?.pm, PARTY_IDS[player]).toBe(BIG);
      expect(c.formation!.outcome?.partners).toContain(SMALL);
    }
  });

  it('keeps the post with the larger side even if the smaller wins more seats, and never lets the smaller side claim it', () => {
    const c = talks(SMALL, tally(5, 7, 5));
    const f = c.formation!;
    expect(f.claimants).not.toContain(SMALL);
    expect(f.claimants).toContain(BIG);
    expect(playerClaims(c)).toBe(false);
    expect(f.pledge[SMALL]).toBe(BIG);
    expect(claimAgain(c)).toBe(false);
    expect(backRival(c, PH)).toBe(false);
  });

  it('is the player\'s deputy post and exco share when the player is the smaller side, and the player stays a partner', () => {
    const c = talks(SMALL, tally(12, 7, 9));
    const o = c.formation!.outcome!;
    expect(playerRole(c, o)).toBe('partner');
    expect(c.formation!.offers[BIG][SMALL]?.senior).toBe('deputy');
    expect(c.formation!.offers[BIG][SMALL]!.posts).toBeGreaterThanOrEqual(1);
  });

  it('does not bind the smaller side once the pact is ended', () => {
    const c = start(SMALL, 'bnpas');
    breakPact(c, BIG);
    startFormation(melaka, c, tally(5, 7, 5));
    expect(c.formation!.claimants).toContain(SMALL);
  });

  it('keeps the smaller side with the alliance in the talks, even when the third side bids', () => {
    const c = talks(PH, tally(7, 6, 12));
    const f = c.formation!;
    expect(f.pledge[SMALL]).toBe(BIG);
    for (let i = 0; i < 4 && !f.outcome; i++) endDayFor(melaka, c);
    expect(f.pledge[SMALL]).toBe(BIG);
  });

  it('lifts both sides against the third side\'s player, and nobody else', () => {
    const base = start(PH).drift.support.nat, lifted = start(PH, 'bnpas').drift.support.nat;
    for (let b = 0; b < N_BLOCS; b++) {
      expect(lifted[b][BIG] - base[b][BIG]).toBeCloseTo(WHATIF.perpaduanLift, 10);
      expect(lifted[b][SMALL] - base[b][SMALL]).toBeCloseTo(WHATIF.perpaduanLift, 10);
      expect(lifted[b][PH]).toBe(base[b][PH]);
    }
    const mine = start(SMALL, 'bnpas').drift.support.nat, plain = start(SMALL).drift.support.nat;
    for (let b = 0; b < N_BLOCS; b++) expect(mine[b][BIG]).toBe(plain[b][BIG]);
  });
});
