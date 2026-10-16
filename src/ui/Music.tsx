import { useEffect, useRef, useState } from 'react';
import { useT } from './hooks';

const KEY = 'k222.music';
const VOLUME = 0.35;
const TRACKS = ['theme.mp3', 'cold-island.mp3'].map((f) => `${import.meta.env.BASE_URL}music/${f}`);

const read = (): boolean => {
  try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; }
};

/**
 * The background music: two tracks played in turn, round and round, a button to silence it, and the choice remembered. Browsers refuse sound
 * before the player has touched the page, so it starts on the first tap or key press rather than at load.
 */
export function Music() {
  const t = useT();
  const audio = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(read);

  useEffect(() => {
    const a = new Audio(TRACKS[0]);
    let i = 0;
    a.volume = VOLUME;
    a.preload = 'auto';
    a.onended = () => { i = (i + 1) % TRACKS.length; a.src = TRACKS[i]; void a.play().catch(() => undefined); };
    audio.current = a;
    return () => { a.onended = null; a.pause(); audio.current = null; };
  }, []);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    if (!on) { a.pause(); return; }
    const play = () => { void a.play().catch(() => undefined); };
    play();
    // Autoplay was refused: try again at the first gesture.
    const events = ['pointerdown', 'keydown'] as const;
    const retry = () => { if (a.paused) play(); for (const e of events) window.removeEventListener(e, retry); };
    for (const e of events) window.addEventListener(e, retry);
    return () => { for (const e of events) window.removeEventListener(e, retry); };
  }, [on]);

  // Sound stops while the page is hidden, and returns with it.
  useEffect(() => {
    const onVisible = () => {
      const a = audio.current;
      if (!a) return;
      if (document.hidden) a.pause();
      else if (on) void a.play().catch(() => undefined);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [on]);

  const toggle = () => {
    const next = !on;
    setOn(next);
    try { localStorage.setItem(KEY, next ? 'on' : 'off'); } catch { /* the choice just is not kept */ }
  };

  const label = t(on ? 'music.off' : 'music.on');
  return (
    <button
      type="button"
      className="music-toggle"
      aria-label={label}
      aria-pressed={on}
      title={label}
      onClick={toggle}
      style={{
        position: 'fixed', right: 12, bottom: 12, zIndex: 50, width: 40, height: 40, borderRadius: '50%',
        display: 'grid', placeItems: 'center', padding: 0, cursor: 'pointer',
        border: '1px solid var(--border, rgba(128,128,128,.4))', background: 'var(--surface, rgba(0,0,0,.6))', color: 'var(--text, currentColor)',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H2v6h4l5 4z" />
        {on ? <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /> : <path d="m16 9 6 6m0-6-6 6" />}
      </svg>
    </button>
  );
}
