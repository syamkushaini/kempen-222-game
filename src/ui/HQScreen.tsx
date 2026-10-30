import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ARCHETYPES, PERKS } from '../sim/campaign/archetypes';
import { isUnlocked } from '../state/profile';
import { useStore } from '../state/store';
import { useT } from './hooks';
import { useBackClose } from './backClose';

/** The HQ upgrade tree: what Legacy Points (earned at the end of a finished career, see progression.ts) can buy before the next one starts. One simple spend screen, not a design of its own. */
export function HQDialog({ onClose }: { onClose(): void }) {
  useBackClose(onClose);
  const t = useT();
  const profile = useStore((s) => s.profile);
  const unlockWithPoints = useStore((s) => s.unlockWithPoints);
  const points = profile.legacyPoints ?? 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog panel honours" role="dialog" aria-modal="true" aria-label={t('hq.title')}>
        <div className="panel-head">
          <h2>{t('hq.title')}</h2>
          <button className="btn small" onClick={onClose}>{t('honours.close')}</button>
        </div>
        <p className="muted small">{t('hq.points', { n: points })} · {t('hq.note')}</p>
        <ul className="badges">
          {ARCHETYPES.map((a) => {
            const have = isUnlocked(profile, a.id);
            const afford = points >= a.cost;
            return (
              <li key={a.id} className={have ? 'badge-card earned' : 'badge-card'}>
                <span className="medal" aria-hidden="true">{have ? '★' : '☆'}</span>
                <div className="grow">
                  <span className="action-title">{a.label}</span>
                  <span className="action-meta">{PERKS[a.perk]}</span>
                </div>
                {have
                  ? <span className="badge">{t('hq.owned')}</span>
                  : <button className="btn small primary" disabled={!afford} onClick={() => unlockWithPoints(a.id, a.cost)}>{t('hq.unlock', { n: a.cost })}</button>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
