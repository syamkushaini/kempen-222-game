import { BLOC_LEAN, BLOC_TURNOUT } from './blocs';
import { logit, sigmoid, softmaxMasked, zeros } from './math';
import { N_BLOCS, N_PARTIES, type SeatData } from './types';

/**
 * Per-seat corrections fitted so that, with no campaign effects at all, the
 * bloc model reproduces the last election's turnout and vote shares in every
 * seat. Bloc definitions say how blocs differ; the baseline says how this seat
 * differs from the national pattern.
 */
export interface Baseline {
  /** [seat][party]: added to every bloc's lean in that seat (logit units). */
  supportBias: number[][];
  /** [seat]: added to every bloc's turnout logit in that seat. */
  turnoutBias: number[];
  /** [seat][party]: whether the party stood in the seat last time. */
  contesting: boolean[][];
}

const BLOC_TURNOUT_LOGIT = BLOC_TURNOUT.map(logit);

/** Finds the seat-wide shift that makes the blocs' combined turnout hit the target. */
function fitTurnoutBias(blocs: number[], target: number): number {
  let lo = -10, hi = 10;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    let t = 0;
    for (let b = 0; b < N_BLOCS; b++) t += blocs[b] * sigmoid(BLOC_TURNOUT_LOGIT[b] + mid);
    if (t < target) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Finds per-party shifts so the turnout-weighted mix of bloc preferences equals
 * the actual vote shares. Iterative proportional fitting in log space.
 */
function fitSupportBias(blocs: number[], turnoutBias: number, target: number[], mask: boolean[]): number[] {
  const bias = zeros(N_PARTIES);
  const weight = blocs.map((w, b) => w * sigmoid(BLOC_TURNOUT_LOGIT[b] + turnoutBias));
  const totalWeight = weight.reduce((a, b) => a + b, 0);
  const logits = zeros(N_PARTIES);
  const shares = zeros(N_PARTIES);
  const model = zeros(N_PARTIES);

  for (let iter = 0; iter < 2000; iter++) {
    model.fill(0);
    for (let b = 0; b < N_BLOCS; b++) {
      if (weight[b] === 0) continue;
      for (let p = 0; p < N_PARTIES; p++) logits[p] = BLOC_LEAN[b][p] + bias[p];
      softmaxMasked(logits, mask, shares);
      for (let p = 0; p < N_PARTIES; p++) model[p] += (weight[b] * shares[p]) / totalWeight;
    }
    let worst = 0;
    for (let p = 0; p < N_PARTIES; p++) {
      if (!mask[p]) continue;
      const step = Math.log(target[p] / model[p]);
      bias[p] += step;
      worst = Math.max(worst, Math.abs(step));
    }
    if (worst < 1e-10) break;
  }
  // Only differences between parties matter; centre for readability.
  const contesting = mask.filter(Boolean).length;
  const mean = bias.reduce((a, v, p) => a + (mask[p] ? v : 0), 0) / contesting;
  return bias.map((v, p) => (mask[p] ? v - mean : 0));
}

export function calibrate(seats: SeatData[]): Baseline {
  const supportBias: number[][] = [];
  const turnoutBias: number[] = [];
  const contesting: boolean[][] = [];

  for (const seat of seats) {
    const votes = seat.basis?.votes ?? seat.last.votes;
    const valid = votes.reduce((a, b) => a + b, 0);
    const mask = votes.map((v) => v > 0);
    const target = votes.map((v) => v / valid);
    const tb = fitTurnoutBias(seat.blocs, seat.basis?.turnout ?? seat.last.turnout);
    turnoutBias.push(tb);
    supportBias.push(fitSupportBias(seat.blocs, tb, target, mask));
    contesting.push(mask);
  }
  return { supportBias, turnoutBias, contesting };
}

export { BLOC_TURNOUT_LOGIT };
