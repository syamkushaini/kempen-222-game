import { useEffect, useState } from 'react';

// The managers' words come one letter at a time, as if typed, and the avatar talks while they do. This is the clock for both.

/** Milliseconds between letters, and the extra wait after a mark of punctuation. */
export const CHAR_MS = 24;
const PAUSE: Record<string, number> = { ',': 110, ';': 140, ':': 140, '—': 160, '.': 260, '!': 260, '?': 260 };

/** How long to wait after showing this letter before the next one. */
export const delayAfter = (ch: string): number => CHAR_MS + (PAUSE[ch] ?? 0);

/** Whether the words so far end on a mark of punctuation: the speaker draws breath, and the mouth closes. */
export const atPause = (shown: string): boolean => /[,.;:!?—]\s*$/.test(shown);

/** Whether the player asked for less movement: then the words appear at once and nothing talks. */
export const prefersCalm = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface Typing {
  /** The words so far. */
  shown: string;
  /** All of them have appeared. */
  done: boolean;
  /** The speaker is mid-sentence: the avatar's mouth moves. */
  talking: boolean;
  /** Shows the rest at once. */
  skip(): void;
}

/** The words `full` appearing one letter at a time, starting again whenever they change. */
export function useTypewriter(full: string): Typing {
  const [state, setState] = useState(() => ({ full, n: prefersCalm() ? full.length : 0 }));
  // New words start from the beginning, on the very render that brings them (no flash of the whole sentence).
  const n = state.full === full ? state.n : prefersCalm() ? full.length : 0;
  useEffect(() => {
    if (state.full !== full) { setState({ full, n: prefersCalm() ? full.length : 0 }); return; }
    if (state.n >= full.length) return;
    const timer = setTimeout(() => setState((s) => (s.full === full ? { full, n: s.n + 1 } : s)), delayAfter(full[state.n - 1] ?? ''));
    return () => clearTimeout(timer);
  }, [state, full]);
  const shown = full.slice(0, n);
  const done = n >= full.length;
  return { shown, done, talking: !done && !atPause(shown), skip: () => setState({ full, n: full.length }) };
}
