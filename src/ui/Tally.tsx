import { majorityLine } from '../sim/election';
import { partyColor, partyName, partyShort, useFormat, useT, useWorld } from './hooks';

/** The parliament bar on its own: seats per party against the majority line. */
export function SeatBar({ tally, thin }: { tally: number[]; thin?: boolean }) {
  const t = useT();
  const world = useWorld();
  const MAJORITY = majorityLine(world), TOTAL = world.seats.length;
  const order = tally.map((seats, p) => ({ p, seats })).filter((o) => o.seats > 0).sort((a, b) => b.seats - a.seats);
  return (
    <>
      <div className={thin ? 'seatbar thin' : 'seatbar'} role="img" aria-label={order.map((o) => `${partyShort(t, o.p)} ${o.seats}`).join(', ')}>
        {order.map((o) => (
          <span key={o.p} style={{ width: `${(o.seats / TOTAL) * 100}%`, background: partyColor(o.p) }} />
        ))}
        <i className="majority-mark" style={{ left: `${(MAJORITY / TOTAL) * 100}%` }} />
      </div>
      <div className="majority-label" style={{ paddingLeft: `${(MAJORITY / TOTAL) * 100}%` }}>
        <span>{t('tally.majority', { n: MAJORITY })}</span>
      </div>
    </>
  );
}

/** Seats and vote share per party, for a finished or in-progress count. */
export function Tally(props: { tally: number[]; votes: number[]; title: string; note?: string; highlight?: number }) {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const MAJORITY = majorityLine(world), kind = world.rules.kind;
  const order = props.tally.map((seats, p) => ({ p, seats })).sort((a, b) => b.seats - a.seats || props.votes[b.p] - props.votes[a.p]);
  const totalVotes = props.votes.reduce((a, b) => a + b, 0);
  const leader = order[0];
  // Leave out parties that are not in this contest at all.
  const shown = order.filter((o) => o.seats > 0 || props.votes[o.p] > 0);

  return (
    <section className="panel tally">
      <div className="panel-head">
        <h2>{props.title}</h2>
        {props.note && <span className="muted">{props.note}</span>}
      </div>
      <p className="headline">
        {leader.seats >= MAJORITY ? t('tally.hasMajority', { party: partyName(t, leader.p) }) : t(kind === 'state' ? 'tally.noMajority.state' : 'tally.noMajority')}
      </p>
      <SeatBar tally={props.tally} />
      <ul className="tally-list">
        {shown.map((o) => (
          <li key={o.p} className={o.p === props.highlight ? 'mine' : ''}>
            <span className="dot" style={{ background: partyColor(o.p) }} />
            <span className="grow">{partyName(t, o.p)}</span>
            <span className="muted num">{totalVotes > 0 ? f.pct(props.votes[o.p] / totalVotes) : '–'}</span>
            <strong className="num seats">{o.seats}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
