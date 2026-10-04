import { BLOC_TURNOUT_LOGIT, type Baseline } from './baseline';
import { BLOC_EARLY, BLOC_LEAN, BLOC_UNDECIDED } from './blocs';
import { sigmoid, softmaxMasked, zeros } from './math';
import { redistribute } from './transfer';
import {
  N_BLOCS, N_PARTIES,
  type BlocProjection, type Dynamics, type SeatClass, type SeatData, type SeatOutcome,
} from './types';

/** One-off disturbances applied to a single seat on top of the dynamics. */
export interface SeatShock {
  /** [party]: support shift in logit units. */
  support?: number[];
  /** Turnout shift for everyone in the seat, in logit units. */
  turnout?: number;
  /**
   * Polling-day turnout shift (weather, transport). Unlike `turnout`, it does
   * not reach voters who already voted early or by post.
   */
  pollingDay?: number;
}

export const MARGINAL_BELOW = 0.05;
export const LEANING_BELOW = 0.15;

export function classify(margin: number): SeatClass {
  return margin < MARGINAL_BELOW ? 'marginal' : margin < LEANING_BELOW ? 'leaning' : 'safe';
}

/**
 * Projects how one seat would vote if the election were held now.
 *
 * For each bloc: preferences are a softmax over the contesting parties of
 * (bloc lean + seat baseline + campaign effects). A bloc's undecided share
 * splits by the same preferences plus the late swing. Each party's supporters
 * then turn out at a rate set by the bloc, the seat and how motivated that
 * party's supporters are.
 *
 * `stood` lists parties that stand aside in this seat under a pact ([party]:
 * the partner they stand aside for, or -1). Their support moves on before
 * anyone votes.
 */
export function projectSeat(
  seat: SeatData,
  seatIndex: number,
  base: Baseline,
  dyn: Dynamics,
  shock?: SeatShock,
  stood?: number[],
): SeatOutcome {
  const mask = base.contesting[seatIndex];
  const standing = stood ? mask.map((m, p) => m && stood[p] < 0) : mask;
  const bias = base.supportBias[seatIndex];
  const turnoutBias = base.turnoutBias[seatIndex];
  const stateSupport = dyn.support.state[seat.state];
  const seatSupport = dyn.support.seat[seat.id];
  const stateTurnout = dyn.turnout.state[seat.state];
  const seatTurnout = dyn.turnout.seat[seat.id];
  const hasLate = dyn.lateSwing.some((v) => v !== 0);
  const pollingDay = shock?.pollingDay ?? 0;

  const logits = zeros(N_PARTIES);
  const decided = zeros(N_PARTIES);
  const late = zeros(N_PARTIES);
  const ballots = zeros(N_PARTIES);
  const blocs: BlocProjection[] = [];
  let undecided = 0;

  for (let b = 0; b < N_BLOCS; b++) {
    const voters = seat.electorate * seat.blocs[b];
    if (voters === 0) {
      blocs.push({ voters: 0, turnout: 0, shares: zeros(N_PARTIES) });
      continue;
    }
    undecided += seat.blocs[b] * BLOC_UNDECIDED[b];

    for (let p = 0; p < N_PARTIES; p++) {
      logits[p] =
        BLOC_LEAN[b][p] + bias[p] + dyn.support.nat[b][p] +
        (stateSupport ? stateSupport[b][p] : 0) +
        (seatSupport ? seatSupport[p] : 0) +
        (shock?.support ? shock.support[p] : 0);
    }
    softmaxMasked(logits, mask, decided);
    if (stood) redistribute(decided, stood);
    if (hasLate) {
      for (let p = 0; p < N_PARTIES; p++) logits[p] += dyn.lateSwing[p];
      softmaxMasked(logits, mask, late);
      if (stood) redistribute(late, stood);
    }

    const u = BLOC_UNDECIDED[b];
    const early = BLOC_EARLY[b];
    const blocBallots = zeros(N_PARTIES);
    let blocTotal = 0;
    for (let p = 0; p < N_PARTIES; p++) {
      if (!standing[p]) continue;
      const support = hasLate ? (1 - u) * decided[p] + u * late[p] : decided[p];
      const t =
        BLOC_TURNOUT_LOGIT[b] + turnoutBias + dyn.turnout.nat[b] + dyn.turnout.party[p] +
        (stateTurnout ? stateTurnout[p] : 0) +
        (seatTurnout ? seatTurnout[p] : 0) +
        (shock?.turnout ?? 0);
      const turnout = pollingDay === 0
        ? sigmoid(t)
        : early * sigmoid(t) + (1 - early) * sigmoid(t + pollingDay);
      blocBallots[p] = voters * support * turnout;
      blocTotal += blocBallots[p];
      ballots[p] += blocBallots[p];
    }
    blocs.push({
      voters,
      turnout: blocTotal / voters,
      shares: blocBallots.map((v) => (blocTotal > 0 ? v / blocTotal : 0)),
    });
  }

  const issued = ballots.reduce((a, v) => a + v, 0);
  const votes = ballots.map((v) => Math.round(v * seat.last.validRate));
  const valid = votes.reduce((a, v) => a + v, 0);

  let winner = 0, runnerUp = -1;
  for (let p = 1; p < N_PARTIES; p++) if (votes[p] > votes[winner]) winner = p;
  for (let p = 0; p < N_PARTIES; p++) {
    if (p === winner || !standing[p]) continue;
    if (runnerUp === -1 || votes[p] > votes[runnerUp]) runnerUp = p;
  }
  const margin = valid > 0 ? (votes[winner] - (runnerUp === -1 ? 0 : votes[runnerUp])) / valid : 0;

  return {
    seatId: seat.id,
    votes,
    valid,
    turnout: issued / seat.electorate,
    winner,
    runnerUp,
    margin,
    cls: classify(margin),
    undecided,
    blocs,
  };
}
