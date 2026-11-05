import { createContext } from 'react';

// The clock and the little maths every scene part uses, kept apart from the parts so that the parts can load models without importing each other in a circle.

/** The scene's clock: normally the time since it began; a gallery or a test may hold it still at one moment (`freeze`). */
export interface StageTime { freeze: number | null }
export const Offset = createContext<StageTime>({ freeze: null });
/** The time in seconds into the scene. */
export const now = (elapsed: number, o: StageTime): number => o.freeze ?? elapsed;

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
/** A smooth rise from 0 at `a` to 1 at `b`. */
export const ease = (t: number, a: number, b: number) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };
/** A rise and fall: 0 before `a`, 1 between `b` and `c`, 0 after `d`. */
export const span = (t: number, a: number, b: number, c: number, d: number) => ease(t, a, b) * (1 - ease(t, c, d));
/** A number from 0 to 1 that depends only on the seed. */
export const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export type ArmPose = 'down' | 'wave' | 'up' | 'point' | 'clap';
