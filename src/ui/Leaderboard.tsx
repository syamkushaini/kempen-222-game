import { useCallback, useEffect, useState } from 'react';
import { PARTIES } from '../data/parties';
import { PARTY_IDS, type PartyId } from '../sim/types';
import { BOARD_SIZE, CONFIG, NAME_MAX, countsForBoard, lastName, nameOk, cleanName, post, postedGames, rememberPosted, submissionOf, top, type Filter, type Row } from '../state/leaderboard';
import { legacyEntry } from '../state/profile';
import { useStore } from '../state/store';
import { useT } from './hooks';
import { Portrait } from './Portrait';
import type { StringKey } from '../i18n/strings';

/** Whether this build has a leaderboard at all: it has none until the maker gives it an address. */
export const hasLeaderboard = CONFIG !== null;

const FILTERS: Filter[] = ['all', 'federal', 'state'];

/** The best careers posted, with a choice of whole-country or state careers. */
export function LeaderboardDialog({ onClose }: { onClose(): void }) {
  const t = useT();
  const [filter, setFilter] = useState<Filter>('all');
  const [rows, setRows] = useState<Row[] | null | 'loading'>('loading');
  const load = useCallback((f: Filter) => { setRows('loading'); void top(f).then(setRows); }, []);
  useEffect(() => { load(filter); }, [filter, load]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog panel honours board" role="dialog" aria-modal="true" aria-label={t('lb.title')}>
        <div className="panel-head">
          <h2>{t('lb.title')}</h2>
          <button className="btn small" onClick={onClose}>{t('lb.close')}</button>
        </div>
        <div className="tabs" role="tablist" aria-label={t('lb.filter.label')}>
          {FILTERS.map((id) => (
            <button key={id} role="tab" aria-selected={filter === id} className={filter === id ? 'tab active' : 'tab'} onClick={() => setFilter(id)}>{t(`lb.filter.${id}` as StringKey)}</button>
          ))}
        </div>
        <p className="muted small">{t('lb.note')}</p>
        {rows === 'loading' && <p className="muted" role="status">{t('lb.loading')}</p>}
        {rows === null && (
          <p role="alert">{t('lb.error')} <button className="btn small" onClick={() => load(filter)}>{t('lb.retry')}</button></p>
        )}
        {Array.isArray(rows) && rows.length === 0 && <p className="muted">{t('lb.empty')}</p>}
        {Array.isArray(rows) && rows.length > 0 && (
          <ol className="gallery board-list" aria-label={t('lb.title')}>
            {rows.slice(0, BOARD_SIZE).map((r, i) => (
              <li key={r.id} className="action">
                <span className="rank num" aria-label={t('lb.rank', { n: i + 1 })}>{i + 1}</span>
                <Portrait leader={Math.max(0, PARTY_IDS.indexOf(r.party as PartyId))} size={44} />
                <div className="grow">
                  <span className="action-title">{r.name} <span className="muted small">· {t(`legacy.${r.legacy}` as StringKey)}</span></span>
                  <span className="action-meta num">{t('lb.line', { party: PARTIES[r.party as PartyId]?.name ?? r.party, years: r.years.toFixed(1), pm: r.years_pm.toFixed(1), won: r.victories, elections: r.elections })}</span>
                  <span className="action-meta">{r.mode === 'state' && r.state ? t(`state.${r.state}` as StringKey) : t('lb.mode.federal')} · {t(`difficulty.${r.difficulty}` as StringKey)}</span>
                </div>
                <span className="score num" aria-label={t('lb.row.score', { n: r.score })}>{r.score}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

/** On the end-of-career page: a name and a button to post the career, on the player's own say-so. */
export function PostCareer() {
  const t = useT();
  const game = useStore((s) => s.game!);
  const [name, setName] = useState(() => lastName() || cleanName(game.name).slice(0, NAME_MAX));
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'again' | 'failed'>(() => (postedGames().includes(game.id) ? 'again' : 'idle'));
  const [bad, setBad] = useState(false);
  const [open, setOpen] = useState(false);
  if (!hasLeaderboard) return null;
  const counts = countsForBoard(game.campaign.career!.record);
  const send = async () => {
    const entry = legacyEntry(game, Date.now());
    const sub = entry ? submissionOf(entry, game.campaign, name, __APP_VERSION__) : null;
    if (!sub || !nameOk(name)) { setBad(true); return; }
    setBad(false); setState('busy');
    const result = await post(sub);
    if (result !== 'failed') rememberPosted(game.id, sub.name);
    setState(result === 'ok' ? 'done' : result);
  };
  const posted = state === 'done' || state === 'again';
  return (
    <div className="post-career">
      <h3>{t('lb.post.title')}</h3>
      {!counts && <p className="muted small">{t('lb.post.tooShort')}</p>}
      {counts && !posted && (
        <>
          <p className="muted small">{t('lb.post.sends')}</p>
          <div className="post-row">
            <label className="field-label" htmlFor="board-name">{t('lb.post.name')}</label>
            <input id="board-name" className="text-input" value={name} maxLength={NAME_MAX} autoComplete="off" onChange={(e) => { setName(e.target.value); setBad(false); }} />
            <button className="btn primary" disabled={state === 'busy'} onClick={() => void send()}>{state === 'busy' ? t('lb.post.busy') : t('lb.post.button')}</button>
          </div>
          {bad && <p className="note" role="alert">{t('lb.post.badname')}</p>}
          {state === 'failed' && <p className="note" role="alert">{t('lb.post.failed')}</p>}
        </>
      )}
      {counts && posted && <p role="status">{t(state === 'done' ? 'lb.post.done' : 'lb.post.again')} <button className="link" onClick={() => setOpen(true)}>{t('lb.post.view')}</button></p>}
      {open && <LeaderboardDialog onClose={() => setOpen(false)} />}
    </div>
  );
}
