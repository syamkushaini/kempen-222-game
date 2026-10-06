import { useMemo } from 'react';
import { GROUP_NOISE, latestNationalPoll } from '../sim/campaign/polls';
import { BLOC_IDS } from '../sim/types';
import { useStore } from '../state/store';
import { useGaugeColour } from './Gauge';
import { useFormat, useT, useWorld } from './hooks';
import { EmptyState } from './EmptyState';

/** Where the party stands with each voter group, as the latest national poll read it, the groups with the most voters first. */
export function VotersTab() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const colour = useGaugeColour();
  const poll = latestNationalPoll(campaign.polls);
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

  if (!poll || groups.length === 0) return <EmptyState art="ballot" title={t('voters.empty')} text={t('voters.empty.text')} />;
  return (
    <section className="voters">
      <div className="panel-head">
        <h2>{t('standing.groups')}</h2>
        <span className="muted">{t(poll.public ? 'standing.public' : 'standing.private', { n: poll.week })}</span>
      </div>
      <ul className="poll-bars group-bars">
        {groups.map(({ bloc, share, weight }) => (
          <li key={bloc}>
            <span className="poll-name">{t(`bloc.${BLOC_IDS[bloc]}`)} <span className="muted small">{f.pct(weight, 0)}</span></span>
            {/* half a group's votes is as good as it gets with three parties in the field, so the colour is full green there */}
            <div className="bar"><span style={{ width: `${share * 100}%`, background: colour(share * 200) }} /></div>
            <strong className="num">{f.pct(share, 0)}</strong>
          </li>
        ))}
      </ul>
      <p className="muted small">{t('voters.note', { n: Math.round(poll.moe * GROUP_NOISE * 100) })}</p>
    </section>
  );
}
