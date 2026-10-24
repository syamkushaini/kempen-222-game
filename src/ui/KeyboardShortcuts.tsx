import { useEffect, useState } from 'react';
import { useT } from './hooks';
import { Kbd } from './Kbd';
import { DialogFocus } from './dialog';

/** Keyboard shortcut overlay: press ? to show all shortcuts, press ? or Esc to close. */
export function KeyboardShortcuts() {
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (open && e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <DialogFocus open={open} onClose={() => setOpen(false)} className="panel keyboard-overlay" role="dialog" aria-modal="true" aria-label={t('shortcuts.title')}>
      <div className="panel-head">
        <h2>{t('shortcuts.title')}</h2>
        <button className="btn small" onClick={() => setOpen(false)}>{t('dialog.close')}</button>
      </div>
      <div className="shortcut-grid">
        <div className="shortcut-group">
          <h4>{t('shortcuts.navigation')}</h4>
          <div className="shortcut-row"><Kbd shortcut="Space" /><span>{t('shortcuts.endWeek')}</span></div>
          <div className="shortcut-row"><Kbd shortcut="1–7" /><span>{t('shortcuts.groups')}</span></div>
          <div className="shortcut-row"><Kbd shortcut="Esc" /><span>{t('shortcuts.close')}</span></div>
        </div>
        <div className="shortcut-group">
          <h4>{t('shortcuts.map')}</h4>
          <div className="shortcut-row"><Kbd shortcut="← ↑ → ↓" /><span>{t('shortcuts.mapNav')}</span></div>
          <div className="shortcut-row"><Kbd shortcut="Enter" /><span>{t('shortcuts.selectSeat')}</span></div>
        </div>
        <div className="shortcut-group">
          <h4>{t('shortcuts.campaign')}</h4>
          <div className="shortcut-row"><Kbd shortcut="1–9" /><span>{t('shortcuts.suggestedAction')}</span></div>
        </div>
      </div>
      <div className="button-row">
        <button className="btn primary" onClick={() => setOpen(false)}>{t('dialog.gotIt')} <Kbd shortcut="Esc" /></button>
      </div>
    </DialogFocus>
  );
}
