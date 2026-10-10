import { useEffect } from 'react';
import { useStore } from '../state/store';
import { useT } from './hooks';
import { NewsLine } from './NewsTab';

/** What a decision brought into the news this week, shown once after it is made. It waits while another decision is on the desk. */
export function DecisionResult() {
  const t = useT();
  const items = useStore((s) => s.decisionNews);
  const pending = useStore((s) => s.game?.campaign.inbox.length ?? 0);
  const close = useStore((s) => s.closeDecisionNews);
  const open = !!items && items.length > 0 && pending === 0;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); close(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);
  if (!open) return null;
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="dialog panel week-recap" role="dialog" aria-modal="true" aria-label={t('desk.news')}>
        <h2>{t('desk.news')}</h2>
        <ul className="report">{items.map((n, i) => <NewsLine key={i} item={n} />)}</ul>
        <div className="button-row">
          <button className="btn primary" autoFocus onClick={close}>{t('decision.ok')} ▸</button>
        </div>
      </div>
    </div>
  );
}
