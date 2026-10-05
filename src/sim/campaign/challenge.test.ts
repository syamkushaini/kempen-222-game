import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { Rng } from '../rng';
import { newGame, parseSave, serializeSave } from '../../state/game';
import { startCareer } from './career';
import { NOISY, takePoll } from './polls';
import { autoPlayWeek, endWeek, newCampaign, truth } from './turn';
import type { Campaign, Challenge } from './types';
import { isValidCampaign } from './validate';

const general = getWorld('general')!;
const start = (challenge?: Partial<Challenge>): Campaign => newCampaign(general, { player: 0, difficulty: 'normal', seed: 5, challenge });

describe('challenge settings', () => {
  it('are recorded only when chosen', () => {
    expect(start().challenge).toBeUndefined();
    expect(start({ fog: false, noisy: false }).challenge).toBeUndefined();
    expect(start({ fog: true }).challenge).toEqual({ fog: true, noisy: false });
    expect(start({ noisy: true }).challenge).toEqual({ fog: false, noisy: true });
  });

  it('do not change how the rivals play or how the race starts', () => {
    const plain = start(), hard = start({ fog: true, noisy: true });
    expect(hard.difficulty).toBe(plain.difficulty);
    expect(hard.drift).toEqual(plain.drift);
    expect(hard.parties).toEqual(plain.parties);
  });

  it('double the error of a poll, and the margin of error it states', () => {
    const plain = start(), noisy = start({ noisy: true });
    const real = truth(general, plain);
    const seat = general.seats[100].id;
    const shares = real.seats[100].votes.map((v) => v / real.seats[100].valid);
    const rms = (c: Campaign) => {
      let sum = 0, n = 0, moe = 0;
      for (let i = 1; i <= 300; i++) {
        const poll = takePoll(general, c, real, new Rng(i), 'seat', seat, 'quick', false);
        moe = poll.moe;
        poll.seats![seat].forEach((s, p) => { if (shares[p] > 0.05) { sum += (s - shares[p]) ** 2; n++; } });
      }
      return { error: Math.sqrt(sum / n), moe };
    };
    const a = rms(plain), b = rms(noisy);
    expect(b.moe).toBeCloseTo(a.moe * NOISY, 10);
    expect(b.error / a.error).toBeGreaterThan(1.7);
    expect(b.error / a.error).toBeLessThan(2.3);
  });

  it('make the public polls noisier too, from the very first one', () => {
    const plain = start(), noisy = start({ noisy: true });
    expect(noisy.polls[0].public).toBe(true);
    expect(noisy.polls[0].moe).toBeCloseTo(plain.polls[0].moe * NOISY, 10);
  });

  it('survive a save and a load, in a campaign and in a career', () => {
    const c = start({ fog: true, noisy: true });
    for (let w = 0; w < 2; w++) { autoPlayWeek(general, c); endWeek(general, c); }
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), general)).toBe(true);
    const g = newGame('Hard', c, 5);
    expect(parseSave(serializeSave(g))).toEqual({ ok: true, state: g });

    const career = getWorld('career')!;
    const k = startCareer(career, { player: 0, difficulty: 'normal', seed: 5, challenge: { fog: true } });
    expect(k.challenge).toEqual({ fog: true, noisy: false });
    const h = newGame('Career', k, 5);
    expect(parseSave(serializeSave(h))).toEqual({ ok: true, state: h });
  });

  it('are refused in a save when they are malformed', () => {
    const c = JSON.parse(JSON.stringify(start({ fog: true })));
    c.challenge = { fog: 'yes', noisy: false };
    expect(isValidCampaign(c, general)).toBe(false);
    c.challenge = 'hard';
    expect(isValidCampaign(c, general)).toBe(false);
  });
});
