import { useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { remindersOf } from '../sim/campaign/reminders';
import { useStore, type SidebarTab } from '../state/store';
import { useT, useWorld } from './hooks';

/** How many are shown before the rest are folded away behind "more". */
const SHOWN = 2;

/**
 * Things worth a look now: the budget nearing its day, a post to fill, candidates still to choose, money running out. Each says what
 * and where, opens the tab that deals with it, and can be put away until next week.
 */
export function ReminderStrip() {
  const t = useT();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const setTab = useStore((s) => s.setTab);
  const [away, setAway] = useState<string[]>([]);
  const [all, setAll] = useState(false);
  const stamp = `${campaign.phase}:${campaign.career?.week ?? campaign.week}`;
  const live = remindersOf(world, campaign).filter((r) => !away.includes(`${stamp}:${r.id}`));
  if (live.length === 0) return null;
  const shown = all ? live : live.slice(0, SHOWN);
  return (
    <section className="reminders" aria-label={t('remind.title')} aria-live="polite">
      <ul>
        {shown.map((r) => (
          <li key={r.id} className={`reminder ${r.level}`}>
            <span className="reminder-text">{t(`remind.${r.id}` as StringKey, r.vars)}</span>
            <button type="button" className="btn small" onClick={() => setTab(r.tab as SidebarTab)}>{t('remind.go')}</button>
            <button type="button" className="reminder-x" aria-label={t('remind.dismiss')} title={t('remind.dismiss')} onClick={() => setAway([...away, `${stamp}:${r.id}`])}>×</button>
          </li>
        ))}
      </ul>
      {live.length > SHOWN && <button type="button" className="reminder-more" onClick={() => setAll(!all)}>{all ? t('remind.less') : t('remind.more', { n: live.length - SHOWN })}</button>}
    </section>
  );
}
