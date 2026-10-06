import { useEffect, useState } from 'react';
import { PARTIES } from '../data/parties';
import type { StringKey } from '../i18n/strings';
import { ACHIEVEMENT_IDS, type AchievementId } from '../sim/campaign/achievements';
import { PARTY_IDS } from '../sim/types';
import { useStore } from '../state/store';
import { useFormat, useT } from './hooks';
import type { NewsItem } from '../sim/campaign/types';
import { Portrait } from './Portrait';
import { NewsLine } from './NewsTab';

const TOAST_MS = 7000;

/** The line on the title screen that opens the achievements and the gallery. */
export function HonoursEntry() {
  const t = useT();
  const profile = useStore((s) => s.profile);
  const [open, setOpen] = useState(false);
  const n = ACHIEVEMENT_IDS.filter((id) => profile.achievements[id] !== undefined).length;
  return (
    <>
      <h3>{t('honours.title')}</h3>
      <div className="honours-entry">
        <span className="muted small grow">{t('honours.summary', { n, total: ACHIEVEMENT_IDS.length, careers: profile.legacies.length })}</span>
        <button className="btn small" onClick={() => setOpen(true)}>{t('honours.open')}</button>
      </div>
      {open && <HonoursDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function HonoursDialog({ onClose }: { onClose(): void }) {
  const t = useT();
  const f = useFormat();
  const profile = useStore((s) => s.profile);
  const [tab, setTab] = useState<'achievements' | 'gallery'>('achievements');
  const have = (id: AchievementId) => profile.achievements[id];
  const n = ACHIEVEMENT_IDS.filter((id) => have(id) !== undefined).length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog panel honours" role="dialog" aria-modal="true" aria-label={t('honours.title')}>
        <div className="panel-head">
          <h2>{t('honours.title')}</h2>
          <button className="btn small" onClick={onClose}>{t('honours.close')}</button>
        </div>
        <div className="tabs" role="tablist">
          {(['achievements', 'gallery'] as const).map((id) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'tab active' : 'tab'} onClick={() => setTab(id)}>
              {t(`honours.tab.${id}`)}
            </button>
          ))}
        </div>

        {tab === 'achievements' && (
          <>
            <p className="muted small">{t('honours.count', { n, total: ACHIEVEMENT_IDS.length })} · {t('honours.note')}</p>
            <ul className="badges">
              {ACHIEVEMENT_IDS.map((id) => {
                const at = have(id);
                return (
                  <li key={id} className={at !== undefined ? 'badge-card earned' : 'badge-card'}>
                    <span className="medal" aria-hidden="true">{at !== undefined ? '★' : '☆'}</span>
                    <div className="grow">
                      <span className="action-title">{t(`ach.${id}` as StringKey)}</span>
                      <span className="action-meta">{t(`ach.${id}.desc` as StringKey)}</span>
                      <span className="action-meta num">{at !== undefined ? t('honours.earned', { date: f.dateTime(at) }) : t('honours.notYet')}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {tab === 'gallery' && (
          <>
            {profile.legacies.length === 0 && <p className="muted">{t('honours.gallery.empty')}</p>}
            <ul className="gallery">
              {profile.legacies.map((e) => (
                <li key={e.game} className="action">
                  <Portrait leader={PARTY_IDS.indexOf(e.party)} size={52} />
                  <div className="grow">
                    <span className="action-title">{t(`legacy.${e.legacy}`)} <span className="muted small">· {e.name}</span></span>
                    <span className="action-meta">{t(`ending.${e.kind}`)}</span>
                    <span className="action-meta num">{t('honours.gallery.line', { party: PARTIES[e.party].name, years: e.years.toFixed(1), pm: e.yearsPm.toFixed(1) })}</span>
                    <span className="action-meta num">{t('honours.gallery.record', { victories: e.victories, elections: e.elections, kept: e.kept, broken: e.broken })}</span>
                    <span className="action-meta num">{f.dateTime(e.at)}</span>
                  </div>
                  <span className="score num" aria-label={t('honours.gallery.score', { n: e.score })}>{e.score}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

/** Achievements just earned, announced in a corner of the screen. They go away by themselves. */
/** What the last action did, as a message that comes up for a few seconds, over whatever tab the player is on. */
function ActionToast() {
  const report = useStore((s) => s.lastReport);
  const [shown, setShown] = useState<NewsItem | null>(null);
  useEffect(() => {
    if (!report) return;
    setShown(report);
    const id = setTimeout(() => setShown(null), 4200);
    return () => clearTimeout(id);
  }, [report]);
  if (!shown) return null;
  return (
    <div className="action-toast panel" role="status" aria-live="polite" key={shown.week + shown.key + String(shown.vars?.rm ?? '')}>
      <ul className="report"><NewsLine item={shown} /></ul>
    </div>
  );
}

export function ActionToasts() { return <ActionToast />; }

export function Toasts() {
  const t = useT();
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  const first = toasts[0];

  // One at a time, each given its moment.
  useEffect(() => {
    if (!first) return;
    const id = setTimeout(() => dismiss(first), TOAST_MS);
    return () => clearTimeout(id);
  }, [first, dismiss]);

  if (!first) return null;
  return (
    <div className="toasts" role="status" aria-live="polite">
      <div key={first} className="toast panel">
        <span className="medal" aria-hidden="true">★</span>
        <div className="grow">
          <span className="dialog-from">{t('toast.achievement')}</span>
          <span className="action-title">{t(`ach.${first}` as StringKey)}</span>
          <span className="action-meta">{t(`ach.${first}.desc` as StringKey)}</span>
        </div>
        <button className="link" onClick={() => dismiss(first)} aria-label={t('toast.dismiss')}>✕</button>
      </div>
    </div>
  );
}
