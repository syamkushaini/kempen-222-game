import { latestNationalPoll } from '../sim/campaign/polls';
import type { Campaign } from '../sim/campaign/types';
import { lastOutcome, partyColor, partyName, useFormat, useT, useWorld } from './hooks';
import { SeatBar } from './Tally';

/** What the player knows about the national race: the latest poll, and the seats held going in. */
export function Standing({ campaign }: { campaign: Campaign }) {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const kind = world.rules.kind;
  const poll = latestNationalPoll(campaign.polls);
  const shares = poll?.national ?? [];
  const order = shares.map((s, p) => ({ s, p })).filter((x) => x.s > 0.005).sort((a, b) => b.s - a.s);
  const top = order[0]?.s ?? 1;

  return (
    <section className="panel standing">
      <div className="panel-head">
        <h2>{t(`standing.poll.${kind}`)}</h2>
        {poll && <span className="muted">{t(poll.public ? 'standing.public' : 'standing.private', { n: poll.week })}</span>}
      </div>
      <ul className="poll-bars">
        {order.map(({ s, p }) => (
          <li key={p} className={p === campaign.player ? 'mine' : ''}>
            <span className="poll-name">{partyName(t, p)}</span>
            <div className="bar"><span data-party={p} style={{ width: `${(s / top) * 100}%`, background: partyColor(p) }} /></div>
            <strong className="num">{f.pct(s, 0)}</strong>
          </li>
        ))}
      </ul>
      {poll && <p className="muted small">{t('standing.moe', { n: Math.round(poll.moe * 100) })}</p>}
      {kind !== 'byelection' && (
        <>
          <h3>{t('standing.last')}</h3>
          <SeatBar tally={lastOutcome(world).tally} thin />
        </>
      )}
    </section>
  );
}
