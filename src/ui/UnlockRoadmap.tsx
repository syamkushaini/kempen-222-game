import type { StringKey } from '../i18n/strings';
import { STEPS, emptyJourney, journeyLevel, journeyStep, nextUnlock, unlockStages } from '../sim/campaign/journey';
import { stepGoal, stepTitle } from './JourneyResult';
import { useStore } from '../state/store';
import { useT } from './hooks';

/** What the career campaign opens, and at which level. Compact: one line on the next stage to open. Full: every stage, shut or open. */
export function UnlockRoadmap({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const journey = useStore((s) => s.profile.journey);
  const level = journeyLevel(journey);
  const done = journeyStep(journey ?? emptyJourney());
  const names = (modes: readonly string[]) => modes.map((m) => t(`unlock.mode.${m}` as StringKey)).join(', ');
  if (compact) {
    const next = nextUnlock(level);
    return <p className="muted small unlock-next" role="note">{next ? t('unlock.next', { level: next.level, modes: names(next.modes), now: level }) : t('unlock.all')}</p>;
  }
  return (
    <section className="unlock-roadmap" aria-label={t('unlock.title')}>
      <h3>{t('unlock.title')}</h3>
      <p className="muted small">{t('unlock.chapter')}</p>
      {[...new Set(STEPS.map((s) => s.chapter))].map((ch) => (
        <div key={ch}>
          <h4>{t(`chapter.${ch}` as StringKey)}</h4>
          <ol className="unlock-list chapter-list">
            {STEPS.map((s, i) => ({ s, i })).filter(({ s }) => s.chapter === ch).map(({ s, i }) => (
              <li key={s.id} className={done > i ? 'open' : 'shut'}>
                <span aria-hidden="true">{done > i ? '✓' : i === done ? '▸' : '·'}</span>
                <span className="num">{t('unlock.level', { n: i + 2 })}</span>
                <span><strong>{stepTitle(t, i)}</strong> <span className="muted small">{stepGoal(t, i)}</span></span>
              </li>
            ))}
          </ol>
        </div>
      ))}
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
