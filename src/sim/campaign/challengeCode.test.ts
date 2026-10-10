import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { challengeLink, codeInAddress, decodeChallenge, encodeChallenge, LEAN, type ChallengeSpec } from './challengeCode';
import { playable } from './field';
import { incomeBoost } from './perks';
import { autoPlayWeek, electionResult, endWeek, newCampaign } from './turn';

const spec = (over: Partial<ChallengeSpec> = {}): ChallengeSpec => ({ scenario: 'state:perak', party: 'ps', seed: 48213, difficulty: 'hard', fog: true, noisy: true, lean: false, weeks: 5, ...over });

describe('a challenge code', () => {
  it('is read back as it was written, whatever the rules', () => {
    for (const s of [spec(), spec({ weeks: undefined, fog: false, noisy: false }), spec({ scenario: 'general', party: 'bp', seed: 0, difficulty: 'easy', lean: true }), spec({ scenario: 'byelection:P.061', party: 'pt', seed: 0xffffffff, difficulty: 'normal' }), spec({ scenario: 'hung' })]) {
      const code = encodeChallenge(s);
      expect(decodeChallenge(code)).toEqual(s);
      // And through a link.
      expect(codeInAddress(new URL(challengeLink(code, 'https://example.org/game/?x=1#old')).hash)).toBe(code);
    }
    expect(encodeChallenge(spec())).toBe('1~state:perak~ps~48213~h~fn~5');
  });

  it('is refused when it is not one this game wrote', () => {
    const good = encodeChallenge(spec());
    for (const bad of [
      '', 'rubbish', good + '~extra', good.replace('1~', '2~'), good.replace('state:perak', 'career:perak'), good.replace('state:perak', 'state:'), good.replace('~ps~', '~xx~'),
      good.replace('~ps~', '~oth~'), good.replace('48213', '-5'), good.replace('48213', '4294967296'), good.replace('~h~', '~x~'), good.replace('~fn~', '~nf~'),
      good.replace('~5', '~2'), good.replace('~5', '~13'), good.replace('~5', '~x'), good.replace('~5', ''), 'byelection:P.1', good.replace('state:perak', 'general; drop table'),
    ]) expect(decodeChallenge(bad), bad).toBeNull();
    expect(codeInAddress('')).toBeNull();
    expect(codeInAddress('#other=1')).toBeNull();
    expect(codeInAddress('#c=%E0%A4%A')).toBeNull();
  });
});

describe('a challenge as it is played', () => {
  const play = (s: ChallengeSpec, skilled = true) => {
    const world = getWorld(s.scenario)!;
    const c = newCampaign(world, { player: PARTY_IDS.indexOf(s.party), difficulty: s.difficulty, seed: s.seed, ...(s.weeks ? { totalWeeks: s.weeks } : {}), challenge: { fog: s.fog, noisy: s.noisy, lean: s.lean, code: encodeChallenge(s) } });
    while (c.phase === 'campaign') { if (skilled) autoPlayWeek(world, c); endWeek(world, c); }
    return { world, c, result: electionResult(world, c)! };
  };

  it('is the same election for everyone who plays the same code, and a different one for another seed', () => {
    const s = spec({ scenario: 'general', party: 'bp', fog: false, noisy: false });
    const a = play(s), b = play(s), other = play({ ...s, seed: 99 });
    expect(a.result.tally).toEqual(b.result.tally);
    expect(a.result.votes).toEqual(b.result.votes);
    expect(a.c.challenge?.code).toBe(encodeChallenge(s));
    expect(JSON.stringify(a.c.drift)).not.toBe(JSON.stringify(other.c.drift));
  });

  it('keeps its rules and length: hidden odds, noisy polls, a lean purse, fewer weeks', () => {
    const world = getWorld('state:perlis')!;
    const base = newCampaign(world, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 7 });
    const s = spec({ scenario: 'state:perlis', weeks: 4, lean: true, fog: true, noisy: true });
    const lean = newCampaign(world, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 7, totalWeeks: 4, challenge: { fog: s.fog, noisy: s.noisy, lean: true, code: encodeChallenge(s) } });
    expect(lean.totalWeeks).toBe(4);
    expect(lean.challenge).toMatchObject({ fog: true, noisy: true, lean: true });
    expect(lean.parties[lean.player]!.funds).toBe(Math.round(base.parties[base.player]!.funds * LEAN));
    // What comes in falls too, and only for the player.
    expect(incomeBoost(lean, lean.player)).toBeCloseTo(incomeBoost(base, base.player) * LEAN, 10);
    const rival = PARTY_IDS.indexOf('pt');
    expect(incomeBoost(lean, rival)).toBe(incomeBoost(base, rival));
    // A made challenge with no rules is still a challenge with a code.
    const plain = newCampaign(world, { player: 0, difficulty: 'normal', seed: 7, challenge: { fog: false, noisy: false, code: 'x' } });
    expect(plain.challenge).toEqual({ fog: false, noisy: false, code: 'x' });
  });

  it('is offered only with a party that can be led in that contest', () => {
    const perlis = getWorld('state:perlis')!;
    const parties = playable(perlis).map((p) => PARTY_IDS[p]);
    expect(parties.length).toBeGreaterThan(0);
    expect(parties).not.toContain('oth');
  });
});
