import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PARTIES } from '../data/parties';
import { PARTY_IDS, type PartyId } from '../sim/types';
import { journeyLevel } from '../sim/campaign/journey';
import { BOARD_SIZE, CONFIG, LEVELS, NAME_MAX, countsForBoard, lastName, nameOk, rememberName, cleanName, post, postedGames, rememberPosted, submissionOf, top, type Filter, type Level, type Row } from '../state/leaderboard';
import { levelSubmission, playerId, postLevel, topLevels, type LevelRow } from '../state/journeyBoard';
import { loadJourneyParty } from '../state/journeyParty';
import { legacyEntry } from '../state/profile';
import { useStore } from '../state/store';
import type { StringKey } from '../i18n/strings';
import { useT } from './hooks';
import { PartyMark } from './identity';
import { Portrait } from './Portrait';
import { useBackClose } from './backClose';

/** Whether this build has a leaderboard at all: it has none until the maker gives it an address. */
export const hasLeaderboard = CONFIG !== null;

/** The two boards: the Career Campaign ranks levels, the other modes rank the score of a finished career. */
export type BoardTab = 'journey' | 'careers';
const TABS: BoardTab[] = ['journey', 'careers'];
const FILTERS: Filter[] = ['all', 'federal', 'state'];

/** The leaderboards, one tab for each way of playing. */
export function LeaderboardDialog({ onClose, tab: first = 'journey', level = 'normal' }: { onClose(): void; tab?: BoardTab; level?: Level }) {
  useBackClose(onClose);
  const t = useT();
  const [tab, setTab] = useState<BoardTab>(first);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return createPortal(
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog panel honours board" role="dialog" aria-modal="true" aria-label={t('lb.title')}>
        <div className="panel-head">
          <h2>{t('lb.title')}</h2>
          <button className="btn small" onClick={onClose}>{t('lb.close')}</button>
        </div>
        <div className="tabs" role="tablist" aria-label={t('lb.tab.label')}>
          {TABS.map((id) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'tab active' : 'tab'} onClick={() => setTab(id)}>{t(`lb.tab.${id}` as StringKey)}</button>
          ))}
        </div>
        {tab === 'journey' ? <JourneyBoard /> : <CareerBoard first={level} />}
      </div>
    </div>,
    document.body,
  );
}

/** A note, an error with a retry, or nothing, for a board that is loading, unreachable or empty. */
function BoardState({ rows, retry }: { rows: unknown[] | null | 'loading'; retry(): void }) {
  const t = useT();
  if (rows === 'loading') return <p className="muted" role="status">{t('lb.loading')}</p>;
  if (rows === null) return <p role="alert">{t('lb.error')} <button className="btn small" onClick={retry}>{t('lb.retry')}</button></p>;
  if (rows.length === 0) return <p className="muted">{t('lb.empty')}</p>;
  return null;
}

/**
 * The form that posts the player's Career Campaign level: on the board itself, and after a contest that raised it. `onPosted` lets the
 * board read itself again. It needs the party the player made; until there is one it says so instead.
 */
export function PostLevel({ onPosted, compact = false }: { onPosted?(): void; compact?: boolean }) {
  const t = useT();
  const journey = useStore((s) => s.profile.journey);
  const mine = journeyLevel(journey);
  const [party] = useState(() => loadJourneyParty());
  const [name, setName] = useState(() => lastName() || cleanName(party?.name ?? ''));
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'failed' | 'bad'>('idle');
  if (!hasLeaderboard) return null;
  if (!party?.identity) return <p className="muted small">{t('lb.journey.noParty')}</p>;
  const send = async () => {
    const sub = levelSubmission(playerId(), name, party.identity, mine, journey?.governed.length ?? 0, __APP_VERSION__);
    if (!sub) { setState('bad'); return; }
    setState('busy');
    const result = await postLevel(sub);
    if (result === 'ok') { rememberName(sub.name); onPosted?.(); }
    setState(result === 'ok' ? 'done' : 'failed');
  };
  return (
    <div className={compact ? 'post-level compact' : 'post-level'}>
      {!compact && <p className="muted small">{t('lb.journey.sends')}</p>}
      <div className="post-row">
        <span className="num">{t('lb.journey.mine', { n: mine })}</span>
        <label className="field-label" htmlFor={compact ? 'level-name-result' : 'level-name'}>{t('lb.post.name')}</label>
        <input id={compact ? 'level-name-result' : 'level-name'} className="text-input" value={name} maxLength={NAME_MAX} autoComplete="off" onChange={(e) => { setName(e.target.value); setState('idle'); }} />
        <button className="btn primary" disabled={state === 'busy'} onClick={() => void send()}>{state === 'busy' ? t('lb.post.busy') : t('lb.journey.post')}</button>
      </div>
      {state === 'bad' && <p className="note" role="alert">{t('lb.journey.bad')}</p>}
      {state === 'failed' && <p className="note" role="alert">{t('lb.post.failed')}</p>}
      {state === 'done' && <p role="status">{t('lb.journey.posted')}</p>}
    </div>
  );
}

/** The Career Campaign board: each player's highest level, the states they have taken, and the party they made. */
function JourneyBoard() {
  const t = useT();
  const [rows, setRows] = useState<LevelRow[] | null | 'loading'>('loading');
  const load = useCallback(() => { setRows('loading'); void topLevels().then(setRows); }, []);
  useEffect(() => { load(); }, [load]);
  return (
    <>
      <p className="muted small">{t('lb.journey.note')}</p>
      <PostLevel onPosted={load} />
      <BoardState rows={rows} retry={load} />
      {Array.isArray(rows) && rows.length > 0 && (
        <ol className="gallery board-list" aria-label={t('lb.tab.journey')}>
          {rows.slice(0, BOARD_SIZE).map((r, i) => (
            <li key={r.id} className="action">
              <span className="rank num" aria-label={t('lb.rank', { n: i + 1 })}>{i + 1}</span>
              <PartyMark emblem={r.emblem} color={r.party_color} size={40} />
              <div className="grow">
                <span className="action-title">{r.name} <span className="muted small">· {r.party_short}</span></span>
                <span className="action-meta">{r.party_name}</span>
                <span className="action-meta num">{t('lb.journey.row', { n: r.governed })}</span>
              </div>
              <span className="score num" aria-label={t('lb.journey.level', { n: r.level })}>{t('lb.journey.levelShort', { n: r.level })}</span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

/** The other modes' board: the best finished careers at one level of difficulty, for the whole country or for a state. */
function CareerBoard({ first }: { first: Level }) {
  const t = useT();
  const [level, setLevel] = useState<Level>(first);
  const [filter, setFilter] = useState<Filter>('all');
  const [rows, setRows] = useState<Row[] | null | 'loading'>('loading');
  const load = useCallback((l: Level, f: Filter) => { setRows('loading'); void top(l, f).then(setRows); }, []);
  useEffect(() => { load(level, filter); }, [level, filter, load]);
  return (
    <>
      <div className="segmented small" role="group" aria-label={t('lb.level.label')}>
        {LEVELS.map((id) => (
          <button key={id} aria-pressed={level === id} className={level === id ? 'active' : ''} onClick={() => setLevel(id)}>{t(`difficulty.${id}` as StringKey)}</button>
        ))}
      </div>
      <div className="segmented small" role="group" aria-label={t('lb.filter.label')}>
        {FILTERS.map((id) => (
          <button key={id} aria-pressed={filter === id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{t(`lb.filter.${id}` as StringKey)}</button>
        ))}
      </div>
      <p className="muted small">{t(`difficulty.${level}.hint` as StringKey)} {t('lb.note')}</p>
      <BoardState rows={rows} retry={() => load(level, filter)} />
      {Array.isArray(rows) && rows.length > 0 && (
        <ol className="gallery board-list" aria-label={t('lb.tab.careers')}>
          {rows.slice(0, BOARD_SIZE).map((r, i) => (
            <li key={r.id} className="action">
              <span className="rank num" aria-label={t('lb.rank', { n: i + 1 })}>{i + 1}</span>
              <Portrait leader={Math.max(0, PARTY_IDS.indexOf(r.party as PartyId))} size={44} />
              <div className="grow">
                <span className="action-title">{r.name} <span className="muted small">· {t(`legacy.${r.legacy}` as StringKey)}</span></span>
                <span className="action-meta num">{t('lb.line', { party: PARTIES[r.party as PartyId]?.name ?? r.party, years: r.years.toFixed(1), pm: r.years_pm.toFixed(1), won: r.victories, elections: r.elections })}</span>
                <span className="action-meta">{r.mode === 'state' && r.state ? t(`state.${r.state}` as StringKey) : t('lb.mode.federal')}</span>
              </div>
              <span className="score num" aria-label={t('lb.row.score', { n: r.score })}>{r.score}</span>
            </li>
          ))}
        </ol>
      )}
    </>
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
  const hung = useStore((s) => s.profile.legacies.find((e) => e.game === game.id));
  if (!hasLeaderboard) return null;
  const counts = countsForBoard(game.campaign.career!.record);
  const send = async () => {
    // The entry in the gallery has the score with what this career's achievements brought; the game's own ending does not yet.
    const entry = hung ?? legacyEntry(game, Date.now());
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
      {open && <LeaderboardDialog tab="careers" level={game.campaign.difficulty} onClose={() => setOpen(false)} />}
    </div>
  );
}
