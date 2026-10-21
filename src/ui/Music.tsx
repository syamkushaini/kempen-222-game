import { useEffect, useRef } from 'react';
import { useStore } from '../state/store';

const KEY = 'k222.music';
const VOLUME = 0.35;
const TRACKS = ['theme.mp3', 'cold-island.mp3'].map((f) => `${import.meta.env.BASE_URL}music/${f}`);

// The choice made with the button that used to float over the page was kept here. It moves to the Music switch in the settings, once.
const moveOldChoice = (): void => {
  try {
    if (localStorage.getItem(KEY) === 'off') useStore.getState().setSettings({ music: false });
    localStorage.removeItem(KEY);
  } catch { /* nothing was kept, or it cannot be read */ }
};

/**
 * The background music: two tracks played in turn, round and round, silenced with the Music switch in the settings. Browsers refuse sound
 * before the player has touched the page, so it starts on the first tap or key press rather than at load.
 */
export function Music() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const on = useStore((s) => s.settings.music);

  useEffect(moveOldChoice, []);

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

  return null;
}
