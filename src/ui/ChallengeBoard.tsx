import { useCallback, useEffect, useState } from 'react';
import { PARTIES } from '../data/parties';
import type { StringKey } from '../i18n/strings';
import { challengeById, goalResult } from '../sim/campaign/challenges';
import { challengePoints } from '../sim/campaign/challengePoints';
import { weekEnded } from '../sim/campaign/weekly';
import type { Summary } from '../sim/campaign/night';
import { PARTY_IDS, type PartyId } from '../sim/types';
import { challengeKey, postResult, resultOf, topResults, type ChallengeRow } from '../state/challengeBoard';
import { CONFIG, lastName, nameOk, NAME_MAX, postedGames, rememberPosted } from '../state/leaderboard';
import { useStore } from '../state/store';
import { useFormat, useT, useWorld } from './hooks';
import { Portrait } from './Portrait';
import { totalPoints } from '../state/profile';

/** Whether this build has challenge boards at all: they need the same address and key as the career leaderboard. */
export const hasBoards = CONFIG !== null;

/** What a challenge is called on its board: a set challenge by its title, one a player made by its code. */
export function useChallengeName(key: string): string {
  const t = useT();
  return key.startsWith('set:') && challengeById(key.slice(4)) ? t(`challenges.c.${key.slice(4)}` as StringKey) : key;
}

/** The best results of one challenge. */
export function ChallengeBoardDialog({ challenge, onClose }: { challenge: string; onClose(): void }) {
  const t = useT();
  const f = useFormat();
  const name = useChallengeName(challenge);
  const [rows, setRows] = useState<ChallengeRow[] | null | 'loading'>('loading');
  const load = useCallback(() => { setRows('loading'); void topResults(challenge).then(setRows); }, [challenge]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog panel honours board" role="dialog" aria-modal="true" aria-label={t('challenge.board.title')}>
        <div className="panel-head">
          <h2>{t('challenge.board.title')}</h2>
          <button className="btn small" onClick={onClose}>{t('lb.close')}</button>
        </div>
        <p className="muted small">{t('challenge.board.of', { name })}</p>
        <p className="muted small">{t('challenge.board.note')}</p>
        {rows === 'loading' && <p className="muted" role="status">{t('lb.loading')}</p>}
        {rows === null && <p role="alert">{t('lb.error')} <button className="btn small" onClick={load}>{t('lb.retry')}</button></p>}
        {Array.isArray(rows) && rows.length === 0 && <p className="muted">{t('challenge.board.empty')}</p>}
        {Array.isArray(rows) && rows.length > 0 && (
          <ol className="gallery board-list" aria-label={t('challenge.board.title')}>
            {rows.map((r, i) => (
              <li key={r.id} className="action">
                <span className="rank num" aria-label={t('lb.rank', { n: i + 1 })}>{i + 1}</span>
                <Portrait leader={Math.max(0, PARTY_IDS.indexOf(r.party as PartyId))} size={44} />
                <div className="grow">
                  <span className="action-title">{r.name}</span>
                  <span className="action-meta num">{PARTIES[r.party as PartyId]?.name ?? r.party} · {t(`difficulty.${r.difficulty}` as StringKey)}</span>
                  <span className="action-meta num">{t('challenge.board.row', { seats: r.seats, total: r.total_seats, share: f.pct(r.vote_share, 1) })}{r.met ? ` · ${t('challenge.board.met')}` : ''}</span>
                </div>
                <span className="score num" aria-label={t('challenge.board.points', { n: r.points })}>{r.points}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

/** What a challenge came to in points, and the best it has brought this player: shown on its result, board or no board. */
export function PointsLine({ summary }: { summary: Pick<Summary, 'seats' | 'voteShare'> }) {
  const t = useT();
  const world = useWorld();
  const c = useStore((s) => s.game!.campaign);
  const held = useStore((s) => s.profile.challengePoints);
  const key = challengeKey(c);
  if (!key) return null;
  const points = challengePoints(world, c, summary.seats, summary.voteShare);
  const best = Math.max(points, held?.[key] ?? 0);
  return <p className="goal-result points" role="status">{t('challenge.points.line', { n: points })}{best > points ? ` · ${t('challenge.points.best', { n: best })}` : ''}</p>;
}

/** The player's challenge points in all, for the Challenges screen. */
export function ChallengeTotal() {
  const t = useT();
  const profile = useStore((s) => s.profile);
  const n = Object.keys(profile.challengePoints ?? {}).length;
  if (n === 0) return <p className="muted small">{t('challenge.points.none')}</p>;
  return <p className="muted small">{t('challenge.points.total', { n: totalPoints(profile), count: n })}</p>;
}

/** A button that opens the board of one challenge. */
export function BoardButton({ challenge, label }: { challenge: string; label?: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  if (!hasBoards) return null;
  return (
    <>
      <button className="btn small" onClick={() => setOpen(true)}>{label ?? t('challenge.board.open')}</button>
      {open && <ChallengeBoardDialog challenge={challenge} onClose={() => setOpen(false)} />}
    </>
  );
}

/** On the result of a challenge: a name and a button to post it to the challenge's board, on the player's own say-so. */
export function PostChallenge({ summary }: { summary: Pick<Summary, 'seats' | 'before' | 'voteShare'> }) {
  const t = useT();
  const world = useWorld();
  const game = useStore((s) => s.game!);
  // The name last used on a board; a challenge has no name of the player's own to start from.
  const [name, setName] = useState(() => lastName());
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'again' | 'failed'>(() => (postedGames().includes(game.id) ? 'again' : 'idle'));
  const [bad, setBad] = useState(false);
  const c = game.campaign;
  const key = challengeKey(c);
  if (!hasBoards || !key) return null;
  const def = challengeById(c.challenge?.goal);
  const send = async () => {
    const met = def ? goalResult(def.goal, summary).met : null;
    const points = challengePoints(world, c, summary.seats, summary.voteShare);
    const r = resultOf(game.id, { challenge: c.challenge, difficulty: c.difficulty, party: PARTY_IDS[c.player] }, name, __APP_VERSION__, summary.seats, world.seats.length, summary.voteShare, met, points);
    if (!r || !nameOk(name)) { setBad(true); return; }
    setBad(false); setState('busy');
    const result = await postResult(r);
    if (result !== 'failed') rememberPosted(game.id, r.name);
    setState(result === 'ok' ? 'done' : result);
  };
  const posted = state === 'done' || state === 'again';
  // A challenge of the week can be posted until its week is out; the board can be read for ever.
  const over = !posted && !!c.challenge?.code && weekEnded(c.challenge.code, Date.now());
  return (
    <div className="post-career">
      <h3>{t('challenge.post.title')}</h3>
      {over && <p className="note">{t('challenge.weekly.ended')}</p>}
      {!posted && !over && (
        <>
          <p className="muted small">{t('challenge.post.sends')}</p>
          <div className="post-row">
            <label className="field-label" htmlFor="challenge-name">{t('lb.post.name')}</label>
            <input id="challenge-name" className="text-input" value={name} maxLength={NAME_MAX} autoComplete="off" onChange={(e) => { setName(e.target.value); setBad(false); }} />
            <button className="btn primary" disabled={state === 'busy' || !nameOk(name)} onClick={() => void send()}>{state === 'busy' ? t('lb.post.busy') : t('lb.post.button')}</button>
          </div>
          {bad && <p className="note" role="alert">{t('lb.post.badname')}</p>}
          {state === 'failed' && <p className="note" role="alert">{t('lb.post.failed')}</p>}
        </>
      )}
      {posted && <p role="status">{t(state === 'done' ? 'lb.post.done' : 'challenge.post.again')}</p>}
      <BoardButton challenge={key} label={t('challenge.board.see')} />
    </div>
  );
}
