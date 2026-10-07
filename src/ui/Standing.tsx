import { useState } from 'react';
import { latestNationalPoll } from '../sim/campaign/polls';
import type { Campaign } from '../sim/campaign/types';
import { lastOutcome, partyColor, partyName, partyShort, useFormat, useT, useWorld } from './hooks';
import { Icon } from './Icon';
import { SeatBar } from './Tally';

/** The player's share poll by poll, as a small line: whether the campaign is working, at a glance. */
export function Sparkline({ values, colour }: { values: number[]; colour: string }) {
  if (values.length < 2) return null;
  const lo = Math.min(...values), hi = Math.max(...values);
  const span = Math.max(hi - lo, 0.02);
  const w = 64, h = 20;
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * w).toFixed(1)},${(h - 2 - ((v - lo) / span) * (h - 4)).toFixed(1)}`);
  const last = pts.at(-1)!.split(',');
  return (
    <svg className="sparkline" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline points={pts.join(' ')} fill="none" stroke={colour} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="2.4" fill={colour} />
    </svg>
  );
}

/**
 * What the player knows about the race, as one line under the map: their share, how far ahead or behind, the way it has
 * moved, and the seats they hold. A press opens the whole poll.
 */
export function Standing({ campaign }: { campaign: Campaign }) {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const [open, setOpen] = useState(false);
  const kind = world.rules.kind;
  const me = campaign.player;
  const poll = latestNationalPoll(campaign.polls);
  const shares = poll?.national ?? [];
  const order = shares.map((s, p) => ({ s, p })).filter((x) => x.s > 0.005).sort((a, b) => b.s - a.s);
  const top = order[0]?.s ?? 1;
  const mine = shares[me] ?? 0;
  const rival = order.find((x) => x.p !== me);
  const gap = rival ? Math.round((mine - rival.s) * 100) : 0;
  const trend = campaign.polls.filter((p) => p.scope === 'national' && p.national).map((p) => p.national![me] ?? 0);

  return (
    <section className={open ? 'panel standing open' : 'panel standing'}>
      <button className="poll-strip" aria-expanded={open} title={t('standing.open')} onClick={() => setOpen((v) => !v)}>
        <i className="dot" data-party={me} style={{ background: partyColor(me) }} />
        {poll ? (
          <>
            <strong className="num strip-share">{f.pct(mine, 0)}</strong>
            <span className={`strip-gap ${order[0]?.p === me ? 'pos-text' : ''}`}>
              {!rival ? t('standing.alone') : order[0].p === me ? t('standing.ahead', { n: gap, party: partyShort(t, rival.p) }) : t('standing.behind', { n: Math.round((top - mine) * 100), party: partyShort(t, order[0].p) })}
            </span>
            <Sparkline values={trend} colour={partyColor(me)} />
          </>
        ) : <span className="muted grow">{t('standing.none')}</span>}
        <span className="grow" />
        {kind !== 'byelection' && <span className="muted small num">{t('standing.held', { n: lastOutcome(world).tally[me] })}</span>}
        <span className="strip-go" aria-hidden="true"><Icon name="chevron" size={16} /></span>
      </button>
      {open && (
        <div className="standing-full">
          <div className="panel-head">
            <h2>{t(`standing.poll.${kind}`)}</h2>
            {poll && <span className="muted">{t(poll.public ? 'standing.public' : 'standing.private', { n: poll.week })}</span>}
          </div>
          <ul className="poll-bars">
            {order.map(({ s, p }) => (
              <li key={p} className={p === me ? 'mine' : ''}>
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
        </div>
      )}
    </section>
  );
}
