import type { StringKey } from '../i18n/strings';
import { DUN_LEVELS, journeyLevel, nextUnlock, unlockStages } from '../sim/campaign/journey';
import { useStore } from '../state/store';
import { useT } from './hooks';

/** What the career campaign opens, and at which level. Compact: one line on the next stage to open. Full: every stage, shut or open. */
export function UnlockRoadmap({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const level = journeyLevel(useStore((s) => s.profile.journey));
  const names = (modes: readonly string[]) => modes.map((m) => t(`unlock.mode.${m}` as StringKey)).join(', ');
  if (compact) {
    const next = nextUnlock(level);
    return <p className="muted small unlock-next" role="note">{next ? t('unlock.next', { level: next.level, modes: names(next.modes), now: level }) : t('unlock.all')}</p>;
  }
  return (
    <section className="unlock-roadmap" aria-label={t('unlock.title')}>
      <h3>{t('unlock.title')}</h3>
      <p className="muted small">{t('unlock.how', { dun: DUN_LEVELS })}</p>
      <ul className="unlock-list">
        {unlockStages().map((s) => (
          <li key={s.level} className={level >= s.level ? 'open' : 'shut'}>
            <span aria-hidden="true">{level >= s.level ? '✓' : '🔒'}</span>
            <span className="num">{t('unlock.level', { n: s.level })}</span>
            <span>{names(s.modes)}</span>
          </li>
        ))}
      </ul>
      <p className="muted small">{t('unlock.you', { n: level })}</p>
    </section>
  );
}
