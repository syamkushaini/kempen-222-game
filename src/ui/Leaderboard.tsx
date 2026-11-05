import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PARTY_IDS, type PartyId } from '../sim/types';
import { journeyLevel } from '../sim/campaign/journey';
import { BOARD_SIZE, CONFIG, NAME_MAX, countsForBoard, lastName, nameOk, rememberName, cleanName, post, postedGames, rememberPosted, submissionOf, type Level } from '../state/leaderboard';
import { levelSubmission, playerId, postLevel, topLevels, type LevelRow } from '../state/journeyBoard';
import { legacyEntry } from '../state/profile';
import { useStore } from '../state/store';
import { useT } from './hooks';
import { Portrait } from './Portrait';
import { useBackClose } from './backClose';

/** Whether this build has a leaderboard at all: it has none until the maker gives it an address. */
export const hasLeaderboard = CONFIG !== null;

/** The Career Campaign board: each player's highest level, and the states they have taken. */
export function LeaderboardDialog({ onClose }: { onClose(): void; level?: Level }) {
  useBackClose(onClose);
  const t = useT();
  const journey = useStore((s) => s.profile.journey);
  const mine = journeyLevel(journey);
  const [rows, setRows] = useState<LevelRow[] | null | 'loading'>('loading');
  const [name, setName] = useState(() => lastName());
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'failed' | 'bad'>('idle');
  const load = useCallback(() => { setRows('loading'); void topLevels().then(setRows); }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const send = async () => {
    const sub = levelSubmission(playerId(), name, mine, journey?.governed.length ?? 0, __APP_VERSION__);
    if (!sub) { setState('bad'); return; }
    setState('busy');
    const result = await postLevel(sub);
    if (result === 'ok') { rememberName(sub.name); load(); }
    setState(result === 'ok' ? 'done' : 'failed');
  };

  return createPortal(
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog panel honours board" role="dialog" aria-modal="true" aria-label={t('lb.title')}>
        <div className="panel-head">
          <h2>{t('lb.title')}</h2>
          <button className="btn small" onClick={onClose}>{t('lb.close')}</button>
        </div>
        <p className="muted small">{t('lb.journey.note')}</p>
        <div className="post-row">
          <span className="num">{t('lb.journey.mine', { n: mine })}</span>
          <label className="field-label" htmlFor="level-name">{t('lb.post.name')}</label>
          <input id="level-name" className="text-input" value={name} maxLength={NAME_MAX} autoComplete="off" onChange={(e) => { setName(e.target.value); setState('idle'); }} />
          <button className="btn primary" disabled={state === 'busy'} onClick={() => void send()}>{state === 'busy' ? t('lb.post.busy') : t('lb.journey.post')}</button>
        </div>
        {state === 'bad' && <p className="note" role="alert">{t('lb.post.badname')}</p>}
        {state === 'failed' && <p className="note" role="alert">{t('lb.post.failed')}</p>}
        {state === 'done' && <p role="status">{t('lb.journey.posted')}</p>}
        {rows === 'loading' && <p className="muted" role="status">{t('lb.loading')}</p>}
        {rows === null && (
          <p role="alert">{t('lb.error')} <button className="btn small" onClick={load}>{t('lb.retry')}</button></p>
        )}
        {Array.isArray(rows) && rows.length === 0 && <p className="muted">{t('lb.empty')}</p>}
        {Array.isArray(rows) && rows.length > 0 && (
          <ol className="gallery board-list" aria-label={t('lb.title')}>
            {rows.slice(0, BOARD_SIZE).map((r, i) => (
              <li key={r.id} className="action">
                <span className="rank num" aria-label={t('lb.rank', { n: i + 1 })}>{i + 1}</span>
                <Portrait leader={Math.max(0, PARTY_IDS.indexOf(r.party as PartyId))} size={44} />
                <div className="grow">
                  <span className="action-title">{r.name}</span>
                  <span className="action-meta num">{t('lb.journey.row', { n: r.governed })}</span>
                </div>
                <span className="score num" aria-label={t('lb.journey.level', { n: r.level })}>{t('lb.journey.levelShort', { n: r.level })}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>,
    document.body,
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
  const hung = useStore((s) => s.profile.legacies.find((e) => e.game === game.id));
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
      {open && <LeaderboardDialog level={game.campaign.difficulty} onClose={() => setOpen(false)} />}
    </div>
  );
}
