import { useMemo } from 'react';
import type { ElectionOutcome } from '../sim/types';
import type { Campaign } from '../sim/campaign/types';
import { review, type CloseCall, type StateSwing } from '../sim/campaign/review';
import { useStore } from '../state/store';
import { partyShort, regionLabel, seatName, useFormat, useT, useWorld } from './hooks';

const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}`;

/** After the count: the seats that turned on a few votes, where the party moved and how hard it worked there, and how the polls compared. */
export function Review({ campaign, result }: { campaign: Campaign; result: ElectionOutcome }) {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const selectSeat = useStore((s) => s.selectSeat);
  const data = useMemo(() => review(world, campaign, result), [world, result]); // eslint-disable-line react-hooks/exhaustive-deps

  const calls = (list: CloseCall[], key: 'review.won' | 'review.lost') => list.map((c) => (
    <li key={c.seat}>
      <button className="link inline" onClick={() => selectSeat(c.seat, world.seats[world.seatIndex.get(c.seat)!].state)}>{seatName(world, c.seat)}</button>
      {' '}<span className="muted">{t(key, { n: c.votes === 1 ? t('review.vote1') : t('review.votes', { n: f.int(c.votes) }), party: partyShort(t, c.rival) })}</span>
    </li>
  ));

  const change = (s: StateSwing) => s.seatsAfter - s.seatsBefore;
  const best = data.states.filter((s) => change(s) > 0).sort((a, b) => change(b) - change(a) || b.swing - a.swing)[0];
  const worst = data.states.filter((s) => change(s) < 0).sort((a, b) => change(a) - change(b) || a.swing - b.swing)[0];
  const shown = data.states.slice(0, 6);
  const points = (x: number) => t('review.points', { n: `${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.abs(x * 100).toFixed(1)}` });

  const empty = !data.closeWins.length && !data.closeLosses.length && !data.states.length && !data.lastPoll;
  if (empty) return null;
  return (
    <details className="review" open>
      <summary><h3>{t('review.title')}</h3></summary>

      {data.closeWins.length > 0 && <><h4>{t('review.closeWins')}</h4><ul className="review-list">{calls(data.closeWins, 'review.won')}</ul></>}
      {data.closeLosses.length > 0 && <><h4>{t('review.closeLosses')}</h4><ul className="review-list">{calls(data.closeLosses, 'review.lost')}</ul></>}

      {shown.length > 0 && (
        <>
          <h4>{t('review.states')}</h4>
          <table className="bloc-table review-table">
            <thead>
              <tr><th>{t('review.col.area')}</th><th className="num">{t('review.col.seats')}</th><th className="num">{t('review.col.vote')}</th><th className="num">{t('review.col.actions')}</th></tr>
            </thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s.state}>
                  <td>{regionLabel(t, world, s.state)}</td>
                  <td className="num">{s.seatsBefore} → {s.seatsAfter}</td>
                  <td className={`num ${s.swing >= 0 ? 'up' : 'down'}`}>{points(s.swing)}</td>
                  <td className="num">{s.actions}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {best && <p className="small">{t('review.best', { state: regionLabel(t, world, best.state), change: signed(change(best)), actions: best.actions })}</p>}
          {worst && <p className="small">{worst.actions === 0
            ? t('review.worstNone', { state: regionLabel(t, world, worst.state), change: signed(change(worst)) })
            : t('review.worst', { state: regionLabel(t, world, worst.state), change: signed(change(worst)), actions: worst.actions })}</p>}
        </>
      )}

      {data.lastPoll && (
        <p className="small">{t(data.lastPoll.ownPoll ? 'review.pollOwn' : 'review.pollPublic', { week: data.lastPoll.week, poll: f.pct(data.lastPoll.share), result: f.pct(data.finalShare) })}</p>
      )}
    </details>
  );
}
