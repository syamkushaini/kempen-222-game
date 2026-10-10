import { useEffect, useState } from 'react';
import { PARTIES } from '../data/parties';
import type { StringKey } from '../i18n/strings';
import { rewardOf } from './cosmetics';
import { ACHIEVEMENT_GROUPS, ACHIEVEMENT_IDS, type AchievementGroup, type AchievementId } from '../sim/campaign/achievements';
import { PARTY_IDS } from '../sim/types';
import { useStore } from '../state/store';
import { useFormat, useT } from './hooks';
import { Portrait } from './Portrait';
import { NewsLine } from './NewsTab';
import { Icon } from './Icon';

const TOAST_MS = 5000;

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

export function HonoursDialog({ onClose }: { onClose(): void }) {
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
            {(Object.keys(ACHIEVEMENT_GROUPS) as AchievementGroup[]).map((group) => {
              const ids = ACHIEVEMENT_GROUPS[group] as readonly AchievementId[];
              return (
                <section key={group} className="badge-group" aria-label={t(`ach.group.${group}` as StringKey)}>
                  <h3>{t(`ach.group.${group}` as StringKey)} <span className="muted small num">{ids.filter((id) => have(id) !== undefined).length}/{ids.length}</span></h3>
                  <ul className="badges">
                    {ids.map((id) => {
                      const at = have(id);
                      return (
                        <li key={id} className={at !== undefined ? 'badge-card earned' : 'badge-card'}>
                          <span className="medal" aria-hidden="true">{at !== undefined ? '★' : '☆'}</span>
                          <div className="grow">
                            <span className="action-title">{t(`ach.${id}` as StringKey)}</span>
                            <span className="action-meta">{t(`ach.${id}.desc` as StringKey)}</span>
                            {rewardOf(id).length > 0 && <span className="action-meta reward">🎨 {t('look.reward', { name: rewardOf(id).map((r) => t(`${r.kind}.${r.id}` as StringKey)).join(', ') })}</span>}
                            <span className="action-meta num">{at !== undefined ? t('honours.earned', { date: f.dateTime(at) }) : t('honours.notYet')}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
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

/** How long a message stays before it goes by itself. It can always be closed sooner. */
const REPORT_MS = 6000;

/**
 * What the last action did, as a message over whatever tab the player is on. It closes with its × or a tap, and goes by
 * itself after a few seconds: nothing about an action stays on the screen for good. The News tab keeps the record.
 */
function ActionToast() {
  const t = useT();
  const report = useStore((s) => s.lastReport);
  const clear = useStore((s) => s.clearReport);
  useEffect(() => {
    if (!report) return;
    const id = setTimeout(clear, REPORT_MS);
    return () => clearTimeout(id);
  }, [report, clear]);
  if (!report) return null;
  return (
    <div className="action-toast panel" role="status" aria-live="polite" key={report.week + report.key + String(report.vars?.rm ?? '')} onClick={clear}>
      <ul className="report"><NewsLine item={report} /></ul>
      <button className="close-x" aria-label={t('toast.dismiss')} onClick={(e) => { e.stopPropagation(); clear(); }}><Icon name="close" size={18} /></button>
    </div>
  );
}

export function ActionToasts() { return <ActionToast />; }

export function Toasts() {
  const t = useT();
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  // On the result screen what was earned is listed under the verdict, so it is not announced over the verdict as well.
  const onResult = useStore((s) => { const c = s.game?.campaign; return !!c && (c.phase === 'night' || ((c.phase === 'formation' || c.phase === 'done') && (s.showNight || !c.formation))); });
  useEffect(() => { if (onResult) toasts.forEach((id) => dismiss(id)); }, [onResult, toasts, dismiss]);
  const first = onResult ? undefined : toasts[0];

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
        {toasts.length > 1 && <span className="muted small num toast-count">1/{toasts.length}</span>}
        <button className="close-x" onClick={() => dismiss(first)} aria-label={t('toast.dismiss')}><Icon name="close" size={18} /></button>
      </div>
    </div>
  );
}
