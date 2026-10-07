import { useEffect, useRef, useState } from 'react';
import type { NewsItem } from '../sim/campaign/types';
import { useStore } from '../state/store';
import { useFormat, useT } from './hooks';
import { NewsLine } from './NewsTab';
import { RecapCard } from './RecapCard';

/** How many headlines the recap carries. The rest are in the News tab. */
const HEADLINES = 3;
const weight = (n: NewsItem, me: number) => (n.tone === 'bad' ? 3 : n.tone === 'good' ? 2 : 1) + (n.party === me ? 1 : 0);

/**
 * What happened in the week just ended, in a few lines, with one button to carry on: three headlines, how the player's
 * share of the poll moved, and the days left unused. It appears once when a week ends in a campaign, never while the adviser is
 * guiding and never over a decision that is waiting.
 */
export function WeekRecap() {
  const t = useT();
  const f = useFormat();
  const campaign = useStore((s) => s.game!.campaign);
  const gameId = useStore((s) => s.game!.id);
  const guided = useStore((s) => !!s.game!.tutorial);
  const seen = useRef({ id: gameId, week: campaign.week });
  const [week, setWeek] = useState<number | null>(null);

  useEffect(() => {
    const was = seen.current;
    seen.current = { id: gameId, week: campaign.week };
    if (was.id === gameId && campaign.phase === 'campaign' && campaign.week === was.week + 1 && !guided) setWeek(was.week);
    else if (was.id !== gameId || campaign.phase !== 'campaign') setWeek(null);
  }, [campaign.week, campaign.phase, gameId, guided]);

  useEffect(() => {
    if (week === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); setWeek(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [week]);

  if (week === null || campaign.inbox.length > 0) return null;
  const me = campaign.player;
  const headlines = campaign.news.filter((n) => n.week === week).sort((a, b) => weight(b, me) - weight(a, me)).slice(0, HEADLINES);
  const polls = campaign.polls.filter((p) => p.scope === 'national' && p.national);
  const nowShare = polls.at(-1)?.national![me], before = polls.at(-2)?.national![me];
  const moved = nowShare !== undefined && before !== undefined ? Math.round((nowShare - before) * 100) : null;
  const recap = campaign.recap?.week === week ? campaign.recap : null;

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setWeek(null); }}>
      <div className="dialog panel week-recap" role="dialog" aria-modal="true" aria-label={t('recap.title', { week })}>
        <h2>{t('recap.title', { week })}</h2>
        {headlines.length > 0 ? <ul className="report">{headlines.map((n, i) => <NewsLine key={i} item={n} />)}</ul> : <p className="muted">{t('recap.quiet')}</p>}
        <div className="recap-figures">
          {nowShare !== undefined && (
            <div>
              <span className="hud-label">{t('recap.share')}</span>
              <strong className="num recap-big">{f.pct(nowShare, 0)}</strong>
              {moved !== null && moved !== 0 && <span className={moved > 0 ? 'delta up still' : 'delta down still'}>{moved > 0 ? '▲ +' : '▼ −'}{Math.abs(moved)}</span>}
              {moved === 0 && <span className="muted small"> {t('recap.same')}</span>}
            </div>
          )}
          {recap && (
            <div>
              <span className="hud-label">{t('recap.spent')}</span>
              <strong className="num recap-big">{f.rm(recap.spent)}</strong>
              {recap.daysLeft >= 1 && <span className="muted small"> · {t('recap.unused', { days: f.days(recap.daysLeft) })}</span>}
            </div>
          )}
        </div>
        {/* where the days went and where the rivals were, for whoever wants it */}
        {recap && <details className="recap-more"><summary>{t('recap.more.rivals')}</summary><RecapCard /></details>}
        <div className="button-row">
          <button className="btn primary" autoFocus onClick={() => setWeek(null)}>{t('recap.go', { week: campaign.week })} ▸</button>
        </div>
      </div>
    </div>
  );
}
