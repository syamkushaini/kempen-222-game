import { useEffect } from 'react';
import { useT } from './hooks';

/** A way to say thank you: the maker's Touch 'n Go QR, opened from the main menu. */
export function SupportDialog({ onClose }: { onClose(): void }) {
  const t = useT();
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
      </div>
    </div>
  );
}
