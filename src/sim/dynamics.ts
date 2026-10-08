import { zeros, zeros2 } from './math';
import { N_BLOCS, N_PARTIES, type Dynamics } from './types';

/** No campaign effects: the model reproduces the last election. */
export function emptyDynamics(): Dynamics {
  return {
    support: { nat: zeros2(N_BLOCS, N_PARTIES), state: {}, seat: {} },
    turnout: { nat: zeros(N_BLOCS), party: zeros(N_PARTIES), state: {}, seat: {} },
    lateSwing: zeros(N_PARTIES),
  };
}

const isNumArray = (x: unknown, len: number): x is number[] =>
  Array.isArray(x) && x.length === len && x.every((v) => typeof v === 'number' && Number.isFinite(v));

const isMatrix = (x: unknown): x is number[][] =>
  Array.isArray(x) && x.length === N_BLOCS && x.every((row) => isNumArray(row, N_PARTIES));

const isRecordOf = (x: unknown, check: (v: unknown) => boolean): boolean =>
  typeof x === 'object' && x !== null && !Array.isArray(x) && Object.values(x).every(check);

/** Structural check used when loading a save that may be damaged or hand-edited. */
export function isValidDynamics(d: unknown): d is Dynamics {
  if (typeof d !== 'object' || d === null) return false;
  const x = d as Record<string, any>;
  return (
    typeof x.support === 'object' && x.support !== null &&
    isMatrix(x.support.nat) &&
    isRecordOf(x.support.state, isMatrix) &&
    isRecordOf(x.support.seat, (v) => isNumArray(v, N_PARTIES)) &&
    (x.support.seatBloc === undefined || isRecordOf(x.support.seatBloc, isMatrix)) &&
    typeof x.turnout === 'object' && x.turnout !== null &&
    isNumArray(x.turnout.nat, N_BLOCS) &&
    isNumArray(x.turnout.party, N_PARTIES) &&
    isRecordOf(x.turnout.state, (v) => isNumArray(v, N_PARTIES)) &&
    isRecordOf(x.turnout.seat, (v) => isNumArray(v, N_PARTIES)) &&
    isNumArray(x.lateSwing, N_PARTIES)
  );
}

const addVec = (a: number[] | undefined, b: number[] | undefined): number[] =>
  a && b ? a.map((v, i) => v + b[i]) : [...(a ?? b)!];

const addMatrix = (a: number[][] | undefined, b: number[][] | undefined): number[][] =>
  a && b ? a.map((row, i) => addVec(row, b[i])) : (a ?? b)!.map((row) => [...row]);

function mergeRecords<T>(a: Record<string, T | undefined>, b: Record<string, T | undefined>, add: (x: T | undefined, y: T | undefined) => T): Record<string, T> {
  const out: Record<string, T> = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) out[k] = add(a[k], b[k]);
  return out;
}

/** The sum of two sets of effects, as a new object. */
export function combineDynamics(a: Dynamics, b: Dynamics): Dynamics {
  return {
    support: {
      nat: addMatrix(a.support.nat, b.support.nat),
      state: mergeRecords(a.support.state, b.support.state, addMatrix),
      seat: mergeRecords(a.support.seat, b.support.seat, addVec),
      ...(a.support.seatBloc || b.support.seatBloc ? { seatBloc: mergeRecords(a.support.seatBloc ?? {}, b.support.seatBloc ?? {}, addMatrix) } : {}),
    },
    turnout: {
      nat: addVec(a.turnout.nat, b.turnout.nat),
      party: addVec(a.turnout.party, b.turnout.party),
      state: mergeRecords(a.turnout.state, b.turnout.state, addVec),
      seat: mergeRecords(a.turnout.seat, b.turnout.seat, addVec),
    },
    lateSwing: addVec(a.lateSwing, b.lateSwing),
  };
}
