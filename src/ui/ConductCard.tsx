import type { StringKey } from '../i18n/strings';
import { CHECK_IDS } from '../sim/campaign/conduct';
import { useStore } from '../state/store';
import { useT } from './hooks';

/** The week's conduct, check by check: what held, what did not, and what to do about it. */
export function ConductCard() {
  const t = useT();
  const conduct = useStore((s) => s.game?.campaign.career?.conduct);
  return (
    <section className="conduct" aria-label={t('conduct.title')}>
      <h3>{t('conduct.title')}</h3>
      <p className="muted small action-desc">{t('conduct.desc')}</p>
      {!conduct ? <p className="muted small">{t('conduct.none')}</p> : (
        <>
          <p className={conduct.delta > 0 ? 'note pos-text' : conduct.delta < 0 ? 'note neg' : 'note'}>
            {t(conduct.delta > 0 ? 'conduct.now.good' : conduct.delta < 0 ? 'conduct.now.bad' : 'conduct.now.flat')}
          </p>
          <ul className="conduct-list">
            {CHECK_IDS.map((id, i) => (
              <li key={id} className={conduct.ok[i] ? 'ok' : 'no'}>
                <span aria-hidden="true">{conduct.ok[i] ? '✓' : '✗'}</span>
                <span>
                  {t(`conduct.${id}` as StringKey)}
                  {!conduct.ok[i] && <span className="action-meta">{t(`conduct.${id}.fix` as StringKey)}</span>}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
