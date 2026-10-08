import { describe, expect, it } from 'vitest';
import { getWorld, worldOf } from '../../data/world';
import { PARTY_IDS } from '../types';
import { answerEvent, nextTerm, resumeTerm, skipAhead, startCareer } from './career';
import { endDay } from './formation';
import { enact, resolveVote } from './govern';
import { PLEDGES, isEnacted, togglePledge, withoutLaws } from './policy';
import { closeNight, endWeek } from './turn';
import { PLEDGE_IDS, type Campaign, type PledgeId, type Scene } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const base = getWorld('career')!;
const vote = (bill: string): Scene => ({ id: 1, kind: 'vote', from: null, bill });

/** A career in which the player's government has put an Act through the House. Tries seeds until the vote carries. */
function withLaw(id: PledgeId): Campaign {
  // An amendment of the constitution needs two thirds of the House, which the starting government has not got: it is enacted outright here (the two-thirds rule is tested on its own).
  if (PLEDGES[id].amend) {
    const c = startCareer(base, { player: PS, difficulty: 'normal', seed: 1 });
    enact(c, `pledge:${id}`, PS, 0.9);
    c.career!.delivery[id] = 'kept';
    return c;
  }
  for (let seed = 1; seed < 40; seed++) {
    const c = startCareer(base, { player: PS, difficulty: 'normal', seed });
    resolveVote(base, c, vote(`pledge:${id}`), 0);
    if (c.career!.delivery[id] === 'kept') return c;
  }
  throw new Error('no seed carried the vote');
}

describe('the promises there are to make', () => {
  it('number more than they did, and every one has a name, a cost and somebody who likes it', () => {
    expect(PLEDGE_IDS.length).toBeGreaterThanOrEqual(24);
    for (const id of PLEDGE_IDS) {
      expect(PLEDGES[id], id).toBeDefined();
      expect(Object.values(PLEDGES[id].appeal).some((v) => v > 0), id).toBe(true);
    }
  });

  it('are Acts or programmes: an Act costs the treasury little and stays once passed', () => {
    const acts = PLEDGE_IDS.filter((id) => PLEDGES[id].law);
    expect(acts).toEqual(expect.arrayContaining(['termLimit', 'graftCommission', 'partyHopBan', 'infoAct', 'oilRoyalty']));
    for (const id of acts) expect(PLEDGES[id].cost, id).toBeLessThanOrEqual(2);
    for (const id of ['cashAid', 'fuelSubsidy', 'hospitals', 'homes'] as const) expect(PLEDGES[id].law, id).toBeUndefined();
  });
});

describe('an Act that has passed', () => {
  it('is written into the career, and comes out of every manifesto', () => {
    const c = withLaw('termLimit');
    const k = c.career!;
    expect(k.laws).toEqual(['termLimit']);
    expect(isEnacted(k, 'termLimit')).toBe(true);
    for (const m of k.manifesto) expect(m).not.toContain('termLimit');
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('cannot be promised again', () => {
    const c = withLaw('termLimit');
    expect(togglePledge(c, 'termLimit')).toBe(false);
    expect(c.career!.manifesto[PS]).not.toContain('termLimit');
    // Anything else still can be.
    expect(togglePledge(c, 'schoolMeals')).toBe(true);
  });

  it('is not left on the books by a programme: promising cash aid again is fine after it was paid', () => {
    const c = withLaw('termLimit');
    expect(withoutLaws(c.career!, ['termLimit', 'cashAid'])).toEqual(['cashAid']);
  });

  it('is still law in the next parliament, and nobody promises it there', () => {
    const c = withLaw('termLimit');
    // The voters carried it, so no court looks at it (the court is tested on its own).
    c.career!.mandated = ['termLimit'];
    for (let guard = 0; guard < 3000 && c.phase !== 'campaign'; guard++) {
      if (c.phase === 'term') { if (c.inbox.length) answerEvent(base, c, c.inbox.shift()!, 0); else skipAhead(base, c, 26); }
      else if (c.phase === 'formation') endDay(base, c);
      else if (c.phase === 'done') resumeTerm(c);
    }
    while (c.phase === 'campaign') endWeek(base, c);
    closeNight(base, c);
    for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(base, c);
    expect(nextTerm(base, c)).toBe(true);
    const k = c.career!;
    expect(k.term).toBe(2);
    expect(k.laws).toEqual(['termLimit']);
    for (const m of k.manifesto) expect(m).not.toContain('termLimit');
    expect(k.promises).not.toContain('termLimit');
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), worldOf(c)!)).toBe(true);
  }, 60_000);
});
