import { describe, expect, it } from 'vitest';
import { getWorld, world } from '../../data/world';
import { PARTIES } from '../../data/parties';
import { emptyDynamics } from '../dynamics';
import { lastElection, projectElection } from '../election';
import { isMinor, MINOR_IDS, N_PARTIES, PARTY_IDS } from '../types';
import { answerEvent, resumeTerm, skipAhead, startCareer } from './career';
import { LEADERS } from './cast';
import { endDay, makeOffer, blocs, pledged } from './formation';
import { houseTally } from './contests';
import { openTalks, whipCount } from './govern';
import { Rng } from '../rng';
import { takePoll } from './polls';
import { campaigns, newCampaign, playable, truth } from './turn';
import type { Campaign, Offer } from './types';
import { isValidCampaign } from './validate';

const idx = (id: (typeof PARTY_IDS)[number]) => PARTY_IDS.indexOf(id);
const [PS, BP, PT, GBK, GBS, LEGASI] = [0, 1, 2, 3, 4, 5];
const [GENBA, CAHAYA, SUARA] = [idx('genba'), idx('cahaya'), idx('suara')];
const hung = getWorld('hung')!;
const base = getWorld('career')!;
const offer = (o: Partial<Offer>): Offer => ({ posts: 0, senior: null, demands: [], cash: 0, ...o });
const seatNamed = (name: string) => world.seats.findIndex((s) => s.name.toLowerCase() === name.toLowerCase());

describe('the small parties in the data', () => {
  it('hold the seats the real small parties won, and the pool keeps the independents', () => {
    const tally = lastElection(world).tally;
    expect(tally[GENBA]).toBe(1);
    expect(tally[CAHAYA]).toBe(1);
    expect(tally[SUARA]).toBe(1);
    expect(tally[idx('oth')]).toBe(2);
    const winner = (name: string) => lastElection(world).seats[seatNamed(name)].winner;
    expect(winner('Muar')).toBe(GENBA);
    expect(winner('Julau')).toBe(CAHAYA);
    expect(winner('Kota Marudu')).toBe(SUARA);
  });

  it('keep the vote shares they really took, and total the seat as before', () => {
    const muar = lastElection(world).seats[seatNamed('Muar')];
    expect(muar.votes[GENBA] / muar.valid).toBeGreaterThan(0.36);
    expect(muar.votes[GENBA] / muar.valid).toBeLessThan(0.39);
    // Every seat still adds up, and a small party only stands where it did.
    let standing = 0;
    for (const s of lastElection(world).seats) {
      expect(s.votes).toHaveLength(N_PARTIES);
      expect(s.votes.reduce((a, b) => a + b, 0)).toBe(s.valid);
      if (s.votes[CAHAYA] > 0) expect(world.seats[world.seatIndex.get(s.seatId)!].region).toBe('sarawak');
      if (s.votes[SUARA] > 0) expect(world.seats[world.seatIndex.get(s.seatId)!].region).toBe('sabah');
      standing += s.votes[GENBA] > 0 ? 1 : 0;
    }
    expect(standing).toBe(6);
  });

  it('are kept to their own region in the state assembly data', () => {
    for (const id of ['state:perak', 'state:pahang', 'state:perlis']) {
      const w = getWorld(id)!;
      for (const s of lastElection(w).seats) {
        expect(s.votes[CAHAYA], `${id} ${s.seatId}`).toBe(0);
        expect(s.votes[SUARA], `${id} ${s.seatId}`).toBe(0);
      }
    }
  });

  it('are held by the vote model with no campaign at all, as they were won', () => {
    const projected = projectElection(world, emptyDynamics());
    for (const name of ['Muar', 'Julau', 'Kota Marudu']) {
      const i = seatNamed(name);
      expect(projected.seats[i].winner, name).toBe(lastElection(world).seats[i].winner);
    }
    expect(projected.tally).toEqual(lastElection(world).tally);
  });
});

describe('what small parties are', () => {
  it('have a name, a colour and a leader of their own, none like a real party', () => {
    for (const id of MINOR_IDS) {
      expect(PARTIES[id].name.length, id).toBeGreaterThan(5);
      expect(PARTIES[id].short, id).toBe(id.toUpperCase());
      expect(LEADERS[id], id).toBeTruthy();
    }
    expect(new Set(PARTY_IDS.map((id) => PARTIES[id].color)).size).toBe(PARTY_IDS.length);
    expect(new Set(Object.values(LEADERS)).size).toBe(Object.keys(LEADERS).length);
  });

  it('run no campaign in any contest, and cannot be played', () => {
    for (const id of ['general', 'career', 'byelection', 'state:perak'] as const) {
      const w = getWorld(id)!;
      for (const p of [GENBA, CAHAYA, SUARA]) expect(campaigns(w, p), `${id} ${PARTY_IDS[p]}`).toBe(false);
      expect(playable(w).some(isMinor)).toBe(false);
    }
    const c = newCampaign(world, { player: PS, difficulty: 'normal', seed: 3 });
    for (const p of [GENBA, CAHAYA, SUARA]) expect(c.parties[p]).toBeNull();
  });
});

describe('in the polls', () => {
  it('read as the tiny parties they are, not a couple of points high', () => {
    const c = newCampaign(world, { player: PS, difficulty: 'normal', seed: 3 });
    const real = truth(world, c);
    const total = real.votes.reduce((a, b) => a + b, 0);
    expect(real.votes[GENBA] / total).toBeLessThan(0.015);
    let worst = 0, sum = 0;
    for (let i = 1; i <= 200; i++) {
      const poll = takePoll(world, c, real, new Rng(i), 'national', null, 'quick', false);
      worst = Math.max(worst, poll.national![GENBA]);
      sum += poll.national![GENBA];
    }
    expect(worst).toBeLessThan(0.03);
    expect(sum / 200).toBeLessThan(0.015);
  });
});

describe('in the talks to form a government', () => {
  const talks = (): Campaign => newCampaign(hung, { player: PS, difficulty: 'normal', seed: 7 });

  it('sit as parties with a seat each, none of them trying to lead', () => {
    const c = talks();
    const f = c.formation!;
    for (const p of [GENBA, CAHAYA, SUARA]) expect(f.seats[p]).toBe(1);
    expect(blocs(f)).toEqual(expect.arrayContaining([GENBA, CAHAYA, SUARA]));
    expect(f.claimants).not.toContain(GENBA);
  });

  it('can be signed, and count towards a majority, for what they came to Parliament for', () => {
    const c = talks();
    const f = c.formation!;
    const before = pledged(f, PS);
    const r = makeOffer(hung, c, GENBA, offer({ posts: 1, demands: ['reformAgenda'], cash: 20_000 }))!;
    expect(r.signed).toBe(1);
    expect(f.pledge[GENBA]).toBe(PS);
    expect(pledged(f, PS)).toBe(before + 1);
    // They will not take what they do not want: a pause on reform is the opposite of their reason for being there.
    const c2 = talks();
    expect(makeOffer(hung, c2, GENBA, offer({ posts: 0, demands: ['reformPause'] }))!.signed).toBe(0);
  });

  it('are courted and bought like the other parties when rivals form the government', () => {
    for (const player of [PS, BP, PT]) for (const seed of [7, 8, 9]) {
      const c = newCampaign(hung, { player, difficulty: 'normal', seed });
      for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(hung, c);
      expect(c.phase).toBe('done');
      expect(isValidCampaign(JSON.parse(JSON.stringify(c)), hung)).toBe(true);
    }
  });
});

describe('in government', () => {
  /** The player's party leads, with every other party but the big opposition behind it, small ones included. */
  function coalition(): Campaign {
    const c = startCareer(base, { player: PS, difficulty: 'normal', seed: 5 });
    openTalks(base, c);
    const f = c.formation!;
    for (const p of [BP, GBK, GBS, LEGASI, GENBA, CAHAYA, SUARA]) {
      f.pledge[p] = PS;
      f.offers[PS][p] = offer({ posts: 1, demands: p === GENBA ? ['reformAgenda'] : p === CAHAYA ? ['autonomy'] : p === SUARA ? ['devFunds'] : [] });
    }
    endDay(base, c);
    expect(resumeTerm(c)).toBe(true);
    return c;
  }

  it('can be partners, with a seat in the House, a place in the cabinet and promises owed', () => {
    const c = coalition();
    const k = c.career!;
    expect(k.government.pm).toBe(PS);
    for (const p of [GENBA, CAHAYA, SUARA]) expect(k.government.partners).toContain(p);
    expect(houseTally(base, c)[GENBA]).toBe(1);
    expect(k.obligations.map((o) => o.party)).toEqual(expect.arrayContaining([GENBA, CAHAYA, SUARA]));
    expect(k.cabinet.length).toBeGreaterThan(0);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('vote on bills with a position of their own', () => {
    const c = coalition();
    const whip = whipCount(base, c, 'pledge:graftCommission', PS);
    expect(whip.votes[GENBA]).toBe('yes');
    expect(whip.yes + whip.no + whip.wavering).toBe(houseTally(base, c).reduce((a, b) => a + b, 0));
  });

  it('see a whole term through, and the next election, without trouble', () => {
    const c = coalition();
    for (let guard = 0; guard < 3000 && c.phase !== 'campaign'; guard++) {
      if (c.phase === 'term') { if (c.inbox.length) answerEvent(base, c, c.inbox.shift()!, 0); else skipAhead(base, c, 26); }
      else if (c.phase === 'formation') endDay(base, c);
      else if (c.phase === 'done') resumeTerm(c);
    }
    expect(c.phase).toBe('campaign');
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });
});
