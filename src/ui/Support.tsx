import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { THANKS } from '../data/thanks';
import { sponsorNames } from '../state/sponsors';
import type { StringKey } from '../i18n/strings';
import { useT } from './hooks';
import { Icon } from './Icon';

/** A way to say thank you: the maker's Touch 'n Go QR, opened from the main menu. */
export function SupportDialog({ onClose }: { onClose(): void }) {
  const t = useT();
  // The list built into the game is shown at once; the table in Supabase, where there is one, replaces it when it arrives.
  const [names, setNames] = useState<readonly string[]>(THANKS);
  useEffect(() => {
    let live = true;
    void sponsorNames().then((list) => { if (live) setNames(list); });
    return () => { live = false; };
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog panel support" role="dialog" aria-modal="true" aria-label={t('support.title')}>
        <div className="panel-head">
          <h2>☕️ {t('support.title')}</h2>
          <button className="btn small" onClick={onClose}>{t('support.close')}</button>
        </div>
        <p>{t('support.body')}</p>
        <img className="support-qr" src={`${import.meta.env.BASE_URL}support-qr.jpg`} alt={t('support.alt')} width={400} height={566} />
        <p className="muted small">{t('support.scan')}</p>
        <section className="thanks" aria-labelledby="thanks-title">
          <h3 id="thanks-title">{t('support.thanks.title' as StringKey)}</h3>
          <p className="muted small">{t('support.thanks.note' as StringKey)} {t('support.thanks.body' as StringKey)}</p>
          <ol className="thanks-list">
            {names.map((name, i) => <li key={`${i}-${name}`}>{name}</li>)}
          </ol>
        </section>
      </div>
    </div>
  );
}

/** The way to say thank you, as a small cup in the corner of the title screen: in sight at once, and quiet. */
export function SupportButton() {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="icon-btn support-button" title={t('menu.support')} aria-label={t('menu.support')} aria-haspopup="dialog" onClick={() => setOpen(true)}><Icon name="coffee" size={20} /></button>
      {/* The header clips what is inside it, so the dialog is hung from the page itself. */}
      {open && createPortal(<SupportDialog onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}
