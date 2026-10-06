import { useMemo } from 'react';
import { GROUP_NOISE, latestNationalPoll } from '../sim/campaign/polls';
import { BLOC_IDS } from '../sim/types';
import type { Campaign } from '../sim/campaign/types';
import { lastOutcome, partyColor, partyName, useFormat, useT, useWorld } from './hooks';
import { useGaugeColour } from './Gauge';
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
  const colour = useGaugeColour();
  // The player's standing with each voter group, as the same poll read it: the groups that are a real part of this electorate, largest first.
  const weights = useMemo(() => {
    const w = BLOC_IDS.map(() => 0);
    let all = 0;
    for (const seat of world.seats) { seat.blocs.forEach((share, i) => { w[i] += share * seat.electorate; }); all += seat.electorate; }
    return w.map((x) => (all > 0 ? x / all : 0));
  }, [world]);
  const groups = (poll?.groups ?? [])
    .map((share, bloc) => ({ share, bloc, weight: weights[bloc] }))
    .filter((g): g is { share: number; bloc: number; weight: number } => g.share !== null && g.weight >= 0.02)
    .sort((a, b) => b.weight - a.weight);

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
            <div className="bar"><span style={{ width: `${(s / top) * 100}%`, background: partyColor(p) }} /></div>
            <strong className="num">{f.pct(s, 0)}</strong>
          </li>
        ))}
      </ul>
      {poll && <p className="muted small">{t('standing.moe', { n: Math.round(poll.moe * 100) })}</p>}
      {poll && groups.length > 0 && (
        <>
          <h3>{t('standing.groups')}</h3>
          <ul className="poll-bars group-bars">
            {groups.map(({ bloc, share }) => (
              <li key={bloc}>
                <span className="poll-name">{t(`bloc.${BLOC_IDS[bloc]}`)}</span>
                {/* half a group's votes is as good as it gets with three parties in the field, so the colour is full green there */}
                <div className="bar"><span style={{ width: `${share * 100}%`, background: colour(share * 200) }} /></div>
                <strong className="num">{f.pct(share, 0)}</strong>
              </li>
            ))}
          </ul>
          <p className="muted small">{t('standing.groups.note', { n: Math.round(poll.moe * GROUP_NOISE * 100) })}</p>
        </>
      )}
      {kind !== 'byelection' && (
        <>
          <h3>{t('standing.last')}</h3>
          <SeatBar tally={lastOutcome(world).tally} thin />
        </>
      )}
    </section>
  );
}
