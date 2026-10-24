import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { emptyDynamics } from '../dynamics';
import { projectElection } from '../election';
import { STANDS } from '../transfer';
import { PARTY_IDS } from '../types';
import { BNPAS, WHATIF_IDS, STATE_WHATIF_IDS, whatIfsFor } from './whatif';
import { endWeek, electionResult, newCampaign } from './turn';
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
});
