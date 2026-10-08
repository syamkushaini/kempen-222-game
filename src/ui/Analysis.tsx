import { useEffect, useMemo } from 'react';
import type { StringKey } from '../i18n/strings';
import { analyse, type Analysis as Data, type Insight, type PartyLine } from '../sim/campaign/analysis';
import type { Summary } from '../sim/campaign/turn';
import type { Campaign } from '../sim/campaign/types';
import { majorityLine } from '../sim/election';
import { BLOC_IDS, type ElectionOutcome } from '../sim/types';
import { Chamber } from './Chamber';
import type { Bloc } from './hemicycle';
import { leaderName, partyColor, partyName, partyShort, regionLabel, renderNews, seatName, useFormat, useT, useWorld } from './hooks';
import { Portrait } from './Portrait';

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');
const pts = (x: number) => { const r = Math.round(x * 1000) / 10; return `${r > 0 ? '+' : r < 0 ? '−' : ''}${Math.abs(r).toFixed(1)}`; };
const GOOD = new Set(['majority', 'largest', 'gained', 'won', 'creditable']);

/** A row of two bars on one scale: what a figure was and what it is. */
function Pair({ before, after, max, colour }: { before: number; after: number; max: number; colour: string }) {
  const w = (x: number) => `${Math.max(0, Math.min(100, (x / (max || 1)) * 100))}%`;
  return (
    <span className="pair" aria-hidden="true">
      <span className="pair-bar was"><i style={{ width: w(before) }} /></span>
      <span className="pair-bar now"><i style={{ width: w(after), background: colour }} /></span>
    </span>
  );
}

function Tile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'good' | 'bad' }) {
  return (
    <div className={`tile${tone ? ` ${tone}` : ''}`}>
      <span className="tile-label">{label}</span>
      <strong className="tile-value num">{value}</strong>
      {sub && <span className="tile-sub muted small num">{sub}</span>}
    </div>
  );
}

/** The seats before and after as two stacked bars: what was held, what was lost on the way, what was gained. */
function Flow({ a }: { a: Data }) {
  const t = useT();
  const max = Math.max(a.total, 1);
  const w = (n: number) => `${(n / max) * 100}%`;
  const line = `${(a.majority / max) * 100}%`;
  return (
    <div className="flow" role="img" aria-label={t('analysis.flow.alt', { before: a.before, held: a.held, gained: a.gained, lost: a.lost, now: a.seats })}>
      <div className="flow-row">
        <span className="flow-label">{t('analysis.flow.before')}</span>
        <span className="flow-track">
          <i className="held" style={{ width: w(a.held) }} /><i className="lost" style={{ width: w(a.lost) }} />
          <b className="line" style={{ left: line }} />
        </span>
        <span className="num flow-n">{a.before}</span>
      </div>
      <div className="flow-row">
        <span className="flow-label">{t('analysis.flow.now')}</span>
        <span className="flow-track">
          <i className="held" style={{ width: w(a.held) }} /><i className="gained" style={{ width: w(a.gained) }} />
          <b className="line" style={{ left: line }} />
        </span>
        <span className="num flow-n">{a.seats}</span>
      </div>
      <p className="flow-key small muted">
        <span><i className="held" />{t('analysis.flow.held')} {a.held}</span>
        <span><i className="gained" />{t('analysis.flow.gained')} {a.gained}</span>
        <span><i className="lost" />{t('analysis.flow.lost')} {a.lost}</span>
        <span><b className="line" />{t('analysis.flow.line', { n: a.majority })}</span>
      </p>
    </div>
  );
}

function Parties({ a, me }: { a: Data; me: number }) {
  const t = useT();
  const f = useFormat();
  const top = Math.max(...a.parties.map((l) => Math.max(l.share, l.shareBefore)), 0.01);
  const row = (l: PartyLine) => (
    <li key={l.party} className={l.party === me ? 'mine' : ''}>
      <span className="party-name"><i className="dot" style={{ background: partyColor(l.party) }} />{partyShort(t, l.party)}</span>
      <Pair before={l.shareBefore} after={l.share} max={top} colour={partyColor(l.party)} />
      <span className="num party-seats">{l.seats} <small className={l.seats > l.before ? 'up' : l.seats < l.before ? 'down' : 'muted'}>{signed(l.seats - l.before)}</small></span>
      <span className="num party-share">{f.pct(l.share)} <small className={l.share > l.shareBefore ? 'up' : l.share < l.shareBefore ? 'down' : 'muted'}>{pts(l.share - l.shareBefore)}</small></span>
    </li>
  );
  return (
    <section>
      <h3>{t('analysis.parties')}</h3>
      <p className="muted small">{t('analysis.parties.note')}</p>
      <ul className="party-lines">{a.parties.map(row)}</ul>
    </section>
  );
}

/** Where the player's party moved, state by state: a bar either side of zero for the seats, and a dot for each action aimed there. */
function States({ a }: { a: Data }) {
  const t = useT();
  const world = useWorld();
  const rows = [...a.states].sort((x, y) => (y.seatsAfter - y.seatsBefore) - (x.seatsAfter - x.seatsBefore) || y.swing - x.swing);
  const reach = Math.max(1, ...rows.map((s) => Math.abs(s.seatsAfter - s.seatsBefore)));
  if (rows.length === 0) return null;
  return (
    <section>
      <h3>{t('analysis.states')}</h3>
      <p className="muted small">{t('analysis.states.note')}</p>
      <ul className="state-bars">
        {rows.map((s) => {
          const d = s.seatsAfter - s.seatsBefore;
          return (
            <li key={s.state}>
              <span className="state-name">{regionLabel(t, world, s.state)}</span>
              <span className="diverge" aria-hidden="true">
                <i className={d < 0 ? 'down' : 'up'} style={{ width: `${(Math.abs(d) / reach) * 50}%`, [d < 0 ? 'right' : 'left']: '50%' }} />
              </span>
              <span className="num state-d">{s.seatsBefore} → {s.seatsAfter} <small className={d > 0 ? 'up' : d < 0 ? 'down' : 'muted'}>{signed(d)}</small></span>
              <span className="num muted small state-swing">{pts(s.swing)}</span>
              <span className="dots" aria-label={t('review.col.actions') + ': ' + s.actions}>{'●'.repeat(Math.min(s.actions, 8))}{s.actions > 8 ? '+' : ''}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Blocs({ a, colour }: { a: Data; colour: string }) {
  const t = useT();
  const f = useFormat();
  if (a.blocs.length === 0) return null;
  const top = Math.max(...a.blocs.map((b) => Math.max(b.before, b.after)), 0.05);
  return (
    <section>
      <h3>{t('analysis.blocs')}</h3>
      <p className="muted small">{t('review.blocs.note')}</p>
      <ul className="party-lines blocs">
        {a.blocs.map((b) => (
          <li key={b.bloc}>
            <span className="party-name">{t(`bloc.${BLOC_IDS[b.bloc]}` as StringKey)}</span>
            <Pair before={b.before} after={b.after} max={top} colour={colour} />
            <span className="num party-share">{f.pct(b.after, 0)} <small className={b.after >= b.before ? 'up' : 'down'}>{pts(b.after - b.before)}</small></span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** A number line from 0 to the largest figure: the party's poll against what the count gave. */
function PollGauge({ a }: { a: Data }) {
  const t = useT();
  const f = useFormat();
  if (!a.poll) return null;
  const max = Math.max(a.poll.share, a.share, 0.3) * 1.15;
  return (
    <div className="gauge" role="img" aria-label={t(a.poll.ownPoll ? 'review.pollOwn' : 'review.pollPublic', { week: a.poll.week, poll: f.pct(a.poll.share), result: f.pct(a.share) })}>
      <span className="gauge-track">
        <i className="mark poll" style={{ left: `${(a.poll.share / max) * 100}%` }}><em>{t('analysis.poll')} {f.pct(a.poll.share)}</em></i>
        <i className="mark count" style={{ left: `${(a.share / max) * 100}%` }}><em>{t('analysis.count')} {f.pct(a.share)}</em></i>
      </span>
    </div>
  );
}

function Says({ list }: { list: Insight[] }) {
  const t = useT();
  const world = useWorld();
  if (list.length === 0) return null;
  const words = (i: Insight) => t(i.key as StringKey, {
    ...i.vars,
    ...(i.state ? { state: regionLabel(t, world, i.state) } : {}),
    ...(i.bloc !== undefined ? { bloc: t(`bloc.${BLOC_IDS[i.bloc]}` as StringKey) } : {}),
    ...(i.party !== undefined ? { party: partyShort(t, i.party) } : {}),
  });
  return (
    <section>
      <h3>{t('analysis.says')}</h3>
      <ul className="says">{list.map((i) => <li key={i.key} className={i.tone}>{words(i)}</li>)}</ul>
    </section>
  );
}

/**
 * The whole of an election laid out as a page of charts: the verdict, the chamber, the seats that moved, every party, each
 * state, each group of voters, the polls against the count, and what the player's own work came to. Read from the result.
 */
export function Analysis({ campaign, summary, result, onClose }: { campaign: Campaign; summary: Summary; result: ElectionOutcome; onClose(): void }) {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const me = campaign.player;
  const a = useMemo(() => analyse(world, campaign, result), [world, campaign, result]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const blocs = useMemo((): Bloc[] => {
    const rest = result.tally.map((n, p) => ({ n, p })).filter((x) => x.p !== me && x.n > 0).sort((x, y) => y.n - x.n);
    return [{ party: me, seats: result.tally[me], side: 'left' as const }, ...rest.map((x) => ({ party: x.p, seats: x.n, side: 'right' as const }))].filter((b) => b.seats > 0);
  }, [result, me]);
  const good = GOOD.has(summary.verdict);
  const seatChange = a.seats - a.before;
  const calls = (list: Data['closeWins'], key: 'review.won' | 'review.lost') => list.map((c) => (
    <li key={c.seat}>{seatName(world, c.seat)} <span className="muted">{t(key, { n: c.votes === 1 ? t('review.vote1') : t('review.votes', { n: f.int(c.votes) }), party: partyShort(t, c.rival) })}</span></li>
  ));
  const move = (d: Data['work']['best'][number], i: number) => (
    <li key={i} className={d.seats > 0 || d.share > 0 ? 'up' : 'down'}>
      {renderNews(t, f, world, d.news)} <span className="num muted">{t('review.moves.effect', { seats: signed(d.seats), vote: t('review.points', { n: pts(d.share) }) })}</span>
    </li>
  );

  return (
    <div className="overlay analysis" role="dialog" aria-modal="true" aria-label={t('analysis.title')}>
      <article className="analysis-page">
        <header className={`analysis-head ${good ? 'good' : 'bad'}`}>
          <Portrait leader={me} size={72} />
          <div className="grow">
            <p className="muted small">{t('analysis.title')} · {leaderName(t, me)} · {partyName(t, me)}</p>
            <h2>{t(`summary.verdict.${summary.verdict}`)}</h2>
          </div>
          <button className="btn" autoFocus onClick={onClose}>{t('analysis.close')} ▸</button>
        </header>

        <div className="tiles">
          <Tile label={t('analysis.tile.seats')} value={`${a.seats}`} sub={`${t('analysis.of', { total: a.total })} · ${signed(seatChange)}`} tone={seatChange > 0 ? 'good' : seatChange < 0 ? 'bad' : undefined} />
          <Tile label={t('analysis.tile.share')} value={f.pct(a.share)} sub={`${pts(a.share - a.shareBefore)} ${t('analysis.pts')}`} tone={a.share > a.shareBefore ? 'good' : a.share < a.shareBefore ? 'bad' : undefined} />
          <Tile label={t('analysis.tile.gained')} value={`${a.gained}`} tone={a.gained > 0 ? 'good' : undefined} />
          <Tile label={t('analysis.tile.lost')} value={`${a.lost}`} tone={a.lost > 0 ? 'bad' : undefined} />
        </div>

        {a.total > 1 && (
          <section className="analysis-chamber">
            <Chamber blocs={blocs} need={majorityLine(world)} sides={{ left: partyName(t, me), right: t('chamber.rest'), middle: '' }} />
          </section>
        )}

        <Says list={a.insights} />
        {a.total > 1 && <section><h3>{t('analysis.flow')}</h3><Flow a={a} /></section>}
        <Parties a={a} me={me} />
        <States a={a} />
        <Blocs a={a} colour={partyColor(me)} />

        {(a.closeWins.length > 0 || a.closeLosses.length > 0) && (
          <section>
            <h3>{t('analysis.closeCalls')}</h3>
            <div className="two">
              {a.closeLosses.length > 0 && <div><h4>{t('review.closeLosses')}</h4><ul className="review-list">{calls(a.closeLosses, 'review.lost')}</ul></div>}
              {a.closeWins.length > 0 && <div><h4>{t('review.closeWins')}</h4><ul className="review-list">{calls(a.closeWins, 'review.won')}</ul></div>}
            </div>
          </section>
        )}

        <section>
          <h3>{t('analysis.work')}</h3>
          <div className="tiles small">
            <Tile label={t('analysis.work.actions')} value={`${a.work.actions}`} />
            <Tile label={t('analysis.work.polls')} value={`${a.work.polls}`} />
            <Tile label={t('analysis.work.funds')} value={f.rm(a.work.funds)} />
          </div>
          <PollGauge a={a} />
          {a.work.best.length > 0 && <><h4>{t('review.moves')}</h4><ul className="review-list moves">{a.work.best.map(move)}</ul></>}
          {a.work.worst.length > 0 && <><h4>{t('review.moves.worst')}</h4><ul className="review-list moves">{a.work.worst.map(move)}</ul></>}
          {a.work.decisions > 0 && <p className="muted small">{t('review.moves.note', { total: a.work.decisions })}</p>}
        </section>

        <div className="button-row"><button className="btn primary" onClick={onClose}>{t('analysis.close')} ▸</button></div>
      </article>
    </div>
  );
}
