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
import { expectedYield, MINOR_PURSE, spendingLimit } from './actions';
import { assessPact, draftPact, meetLeader, others } from './diplomacy';
import { newGame, parseSave, SAVE_VERSION } from '../../state/game';
import { Rng } from '../rng';
import { takePoll } from './polls';
import { campaigns, electionResult, endWeek, newCampaign, playable, truth, weeklyIncome } from './turn';
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

  it('campaign only where they hold a seat or took a real share, and cannot be played', () => {
    // The general election, a career and the talks after a hung result: each has them holding a seat.
    for (const id of ['general', 'career', 'hung'] as const) {
      const w = getWorld(id)!;
      for (const p of [GENBA, CAHAYA, SUARA]) expect(campaigns(w, p), `${id} ${PARTY_IDS[p]}`).toBe(true);
    }
    // A by-election and the state assemblies we have have none of their seats.
    for (const id of ['byelection', 'state:perak', 'state:pahang', 'state:perlis'] as const) {
      for (const p of [GENBA, CAHAYA, SUARA]) expect(campaigns(getWorld(id)!, p), `${id} ${PARTY_IDS[p]}`).toBe(false);
    }
    for (const id of ['general', 'career', 'byelection', 'state:perak'] as const) expect(playable(getWorld(id)!).some(isMinor)).toBe(false);
    const c = newCampaign(world, { player: PS, difficulty: 'normal', seed: 3 });
    for (const p of [GENBA, CAHAYA, SUARA]) expect(c.parties[p]).not.toBeNull();
    expect(c.parties[PARTY_IDS.indexOf('oth')]).toBeNull();
    const perak = newCampaign(getWorld('state:perak')!, { player: PS, difficulty: 'normal', seed: 3 });
    for (const p of [GENBA, CAHAYA, SUARA]) expect(perak.parties[p]).toBeNull();
  });
});

describe('small parties campaigning', () => {
  it('start with a shoestring and a short week, and raise money in proportion', () => {
    const c = newCampaign(world, { player: PS, difficulty: 'normal', seed: 3 });
    for (const p of [GENBA, CAHAYA, SUARA]) {
      expect(c.parties[p]!.funds, PARTY_IDS[p]).toBeLessThan(c.parties[GBS]!.funds);
      expect(c.parties[p]!.days, PARTY_IDS[p]).toBeLessThan(7);
      expect(expectedYield(world, c, p, 'crowdfund')).toBeCloseTo(expectedYield(world, c, PS, 'crowdfund') * MINOR_PURSE, 6);
      expect(weeklyIncome(world, p)).toBeLessThan(weeklyIncome(world, PS) * 0.6);
    }
  });

  it('play their weeks like the rivals, spend what they have, and never go into debt', () => {
    for (const seed of [1, 2, 3]) {
      const c = newCampaign(world, { player: PS, difficulty: 'normal', seed });
      const before = [GENBA, CAHAYA, SUARA].map((p) => c.parties[p]!.funds);
      while (c.phase === 'campaign') endWeek(world, c);
      [GENBA, CAHAYA, SUARA].forEach((p, i) => {
        const pc = c.parties[p]!;
        expect(Object.keys(pc.used).length, `${seed} ${PARTY_IDS[p]}`).toBeGreaterThan(0);
        expect(pc.spent, `${seed} ${PARTY_IDS[p]}`).toBeGreaterThan(0);
        expect(pc.funds).toBeGreaterThanOrEqual(0);
        expect(pc.spent).toBeLessThanOrEqual(spendingLimit(world));
        void before[i];
      });
      expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    }
  });

  it('run no national attacks, and their routine moves are not news', () => {
    for (const seed of [1, 2, 3]) {
      const c = newCampaign(world, { player: PS, difficulty: 'normal', seed });
      while (c.phase === 'campaign') endWeek(world, c);
      for (const p of [GENBA, CAHAYA, SUARA]) {
        expect(c.parties[p]!.used.attack, `${seed} ${PARTY_IDS[p]}`).toBeUndefined();
        const own = c.news.filter((n) => n.party === p && n.key.startsWith('news.rival.'));
        expect(own.every((n) => n.key === 'news.rival.viral' || n.key === 'news.rival.flop'), `${seed} ${PARTY_IDS[p]}`).toBe(true);
      }
      // Nobody is told a small party attacked them.
      expect(c.news.some((n) => n.key.startsWith('news.rival.attack') && [GENBA, CAHAYA, SUARA].includes(n.party ?? -1))).toBe(false);
    }
  });

  it('win about the seats they hold, give or take what the voters decide', () => {
    let genba = 0, cahaya = 0, suara = 0;
    // Forty elections: a party of one seat wins or loses it whole, so even twenty is too few to take an average from.
    const seeds = Array.from({ length: 40 }, (_, i) => i + 1);
    for (const seed of seeds) {
      const c = newCampaign(world, { player: PS, difficulty: 'normal', seed });
      while (c.phase === 'campaign') endWeek(world, c);
      const t = electionResult(world, c)!.tally;
      genba += t[GENBA]; cahaya += t[CAHAYA]; suara += t[SUARA];
    }
    for (const total of [genba, cahaya, suara]) {
      expect(total / seeds.length).toBeGreaterThan(0.3);
      expect(total / seeds.length).toBeLessThan(3);
    }
  }, 60_000);

  it('can be met, and can be offered a pact, like any other leader', () => {
    const c = newCampaign(world, { player: PS, difficulty: 'normal', seed: 3 });
    expect(others(c, PS)).toEqual(expect.arrayContaining([GENBA, CAHAYA, SUARA]));
    const meeting = meetLeader(world, c, GENBA);
    expect(meeting).not.toBeNull();
    const prop = draftPact(world, c, PS, GENBA, 'targeted', lastElection(world));
    expect(assessPact(world, c, PS, GENBA, prop).reply).toBeTruthy();
  });

  it('carry on from a game saved before they could campaign', () => {
    const c = newCampaign(world, { player: PS, difficulty: 'normal', seed: 3 });
    const g = newGame('Before', c, 5) as any;
    g.version = 9;
    for (const p of [GENBA, CAHAYA, SUARA]) g.campaign.parties[p] = null;
    const parsed = parseSave(JSON.stringify(g));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    for (const p of [GENBA, CAHAYA, SUARA]) expect(parsed.state.campaign.parties[p]).not.toBeNull();
    expect(parsed.state.version).toBe(SAVE_VERSION);
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
