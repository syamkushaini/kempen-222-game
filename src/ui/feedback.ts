import type { Campaign } from '../sim/campaign/types';
import { useStore } from '../state/store';
import { sound, type Sfx } from './audio';

/**
 * Works out which sound, if any, a change to the game deserves. One at most:
 * the most important thing that happened. Loading or starting a game is silent.
 */
export function soundFor(a: Campaign, b: Campaign, report: { tone?: string; raised?: boolean } | null): Sfx | null {
  const ended = b.career?.ending;
  if (ended && !a.career?.ending) return ended.kind === 'retired' ? 'fanfare' : 'bad';
  const known = new Set(a.inbox.map((s) => s.id));
  if (b.inbox.some((s) => !known.has(s.id))) return 'ring';
  if (b.formation?.outcome && !a.formation?.outcome) return 'gavel';
  if (b.phase === 'formation' && a.phase === 'term') return 'gavel';
  const fresh = b.news.slice(a.news.length);
  if (fresh.some((n) => n.key === 'news.gov.passed' || n.key === 'news.house.passed' || n.key === 'news.house.defeated')) return 'gavel';
  if (fresh.some((n) => n.key === 'news.gov.defeated')) return 'bad';
  if (report) return report.raised ? 'coin' : report.tone === 'good' ? 'good' : report.tone === 'bad' ? 'bad' : 'tick';
  if (b.week !== a.week || b.career?.week !== a.career?.week || b.phase !== a.phase || b.formation?.day !== a.formation?.day) return 'tick';
  return null;
}

const FUNDRAISERS = ['news.me.dinner', 'news.me.crowdfund', 'news.me.tycoon'];

/** Connects the game to the sound: settings, clicks, and what happens in the game. Returns a function that undoes it. */
export function installFeedback(): () => void {
  const apply = () => { const s = useStore.getState().settings; sound.configure({ sfx: s.sound, music: s.music }); };
  apply();

  const unlock = () => sound.unlock();
  const onClick = (e: MouseEvent) => {
    const target = e.target instanceof Element ? e.target.closest('button, [role="tab"], [role="radio"], select') : null;
    if (target && !(target as HTMLButtonElement).disabled) sound.play('click');
  };
  const onVisible = () => sound.setVisible(document.visibilityState === 'visible');
  document.addEventListener('pointerdown', unlock, true);
  document.addEventListener('keydown', unlock, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('visibilitychange', onVisible);

  const stop = useStore.subscribe((state, prev) => {
    if (state.settings !== prev.settings) {
      apply();
      // A setting only changes because the player clicked something, so sound may start now.
      sound.unlock();
    }
    if (state.toasts.length > prev.toasts.length) return sound.play('badge');
    const a = prev.game, b = state.game;
    if (!a || !b || a === b || a.id !== b.id) return;
    const told = state.lastReport !== prev.lastReport && state.lastReport;
    const report = told ? { tone: told.tone, raised: FUNDRAISERS.some((k) => told.key.startsWith(k)) && told.tone !== 'bad' } : null;
    const sfx = soundFor(a.campaign, b.campaign, report);
    if (sfx) sound.play(sfx);
  });

  return () => {
    stop();
    document.removeEventListener('pointerdown', unlock, true);
    document.removeEventListener('keydown', unlock, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('visibilitychange', onVisible);
  };
}
