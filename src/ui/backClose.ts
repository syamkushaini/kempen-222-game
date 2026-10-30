import { useEffect, useRef } from 'react';

/** The part of the browser's history that the Back stack uses, so that it can be tried without a browser. */
export interface HistoryLike {
  pushState(state: unknown, title: string): void;
  back(): void;
  readonly state: unknown;
}

/**
 * Makes the Back button (an Android swipe, a browser's arrow) close the sheet or dialog on top, instead of leaving the game.
 * Each open sheet puts one entry on the history; Back takes the newest off and closes the sheet it belonged to. A sheet closed
 * some other way (its own button, Escape) takes its entry off again, so that Back does not have a dead press to spend.
 */
export function createBackStack(history: HistoryLike) {
  interface Entry { id: number; close(): void; popped: boolean; pushed: boolean }
  const open: Entry[] = [];
  let seq = 0;
  // Taking an entry off by hand fires a popstate of its own; that one is not the player pressing Back.
  let ignore = 0;

  return {
    /** Registers an open sheet. Returns what to call when it closes. */
    push(close: () => void): () => void {
      const entry: Entry = { id: ++seq, close, popped: false, pushed: false };
      open.push(entry);
      // Put on the history a moment later, so that a sheet that is opened and shut again at once (React's development double
      // mount does this) leaves nothing behind.
      const timer = setTimeout(() => { entry.pushed = true; history.pushState({ k222: entry.id }, ''); }, 0);
      return () => {
        clearTimeout(timer);
        const at = open.indexOf(entry);
        if (at >= 0) open.splice(at, 1);
        const state = history.state as { k222?: number } | null;
        if (entry.pushed && !entry.popped && state?.k222 === entry.id) { ignore++; history.back(); }
      };
    },
    /** The browser went back: close the newest sheet that is still open. */
    popped(): void {
      if (ignore > 0) { ignore--; return; }
      const top = [...open].reverse().find((e) => !e.popped);
      if (!top) return;
      top.popped = true;
      top.close();
    },
    get depth() { return open.length; },
  };
}

let shared: ReturnType<typeof createBackStack> | null = null;
function stack() {
  if (!shared) {
    shared = createBackStack(window.history);
    window.addEventListener('popstate', () => shared!.popped());
  }
  return shared;
}

/** While `enabled` (by default, as long as the component is mounted), the Back button calls `onClose`. */
export function useBackClose(onClose: () => void, enabled = true): void {
  const latest = useRef(onClose);
  latest.current = onClose;
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    return stack().push(() => latest.current());
  }, [enabled]);
}
