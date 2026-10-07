import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { useT } from './hooks';
import { HowToPlay } from './HowToPlay';
import { ConfirmButton, SavesPanel } from './SavesTab';

/**
 * The menu any game has: carry on, start this game again, save or load, set up a new game, or go back to the
 * main menu. Opened from the header, and by Escape.
 */
export function GameMenu() {
  const t = useT();
  const open = useStore((s) => s.menuOpen);
  const setOpen = useStore((s) => s.setMenuOpen);
  const restart = useStore((s) => s.restart);
  const newGameSetup = useStore((s) => s.newGameSetup);
  const quitToTitle = useStore((s) => s.quitToTitle);
  const [saves, setSaves] = useState(false);
  const [howTo, setHowTo] = useState(false);
  const game = useStore((s) => s.game?.id);
  // Loading another game from the saves here is a way out of the menu too.
  useEffect(() => { setOpen(false); }, [game, setOpen]);

  useEffect(() => {
    if (!open) { setSaves(false); return; }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  if (!open) return null;
  if (howTo) return <HowToPlay onClose={() => setHowTo(false)} />;
  const leave = (go: () => void) => () => { setOpen(false); go(); };
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="dialog panel game-menu" role="dialog" aria-modal="true" aria-label={t('menu.title')}>
        <h2>{t('menu.title')}</h2>
        <div className="menu-list">
          <button className="btn primary" autoFocus onClick={() => setOpen(false)}>{t('menu.resume')}</button>
          <ConfirmButton className="btn" label={t('menu.restart')} confirmLabel={t('menu.restart.confirm')} onConfirm={leave(restart)} />
          <button className="btn" aria-expanded={saves} onClick={() => setSaves(!saves)}>{t('menu.saves')} {saves ? '▴' : '▾'}</button>
          {saves && <SavesPanel embedded />}
          <button className="btn" onClick={() => setHowTo(true)}>{t('howto.title')}</button>
          <button className="btn" onClick={leave(newGameSetup)}>{t('menu.new')}</button>
          <button className="btn" onClick={leave(quitToTitle)}>{t('menu.main')}</button>
        </div>
        <p className="muted small">{t('menu.note')}</p>
      </div>
    </div>
  );
}

/** The header's way into the menu, shown whenever a game is open. */
export function MenuButton() {
  const t = useT();
  const playing = useStore((s) => !!s.game);
  const setOpen = useStore((s) => s.setMenuOpen);
  if (!playing) return null;
  return <button className="btn small menu-button" aria-haspopup="dialog" aria-label={t('menu.button')} onClick={() => setOpen(true)}><span aria-hidden="true">☰</span><span className="menu-word"> {t('menu.button')}</span></button>;
}
