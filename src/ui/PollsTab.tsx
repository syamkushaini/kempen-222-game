import { playerPollCost } from '../sim/campaign/turn';
import type { Poll, PollQuality, PollScope } from '../sim/campaign/types';
import type { Region, RegionId } from '../sim/types';
import { useStore } from '../state/store';
import { partyColor, partyShort, regionLabel, seatName, useFormat, useIntel, useSpot, useT, useWorld, lastOutcome } from './hooks';
import { Brief } from './Brief';
import { useState } from 'react';
import { Icon } from './Icon';

const REGIONS: Region[] = ['peninsular', 'sabah', 'sarawak'];

export function PollsTab() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const kind = world.rules.kind;
  const scopes = world.rules.pollScopes;
  const campaign = useStore((s) => s.game!.campaign);
  const selectedSeat = useStore((s) => s.selectedSeat);
  const selectedState = useStore((s) => s.selectedState);
  const poll = useStore((s) => s.poll);
  const selectState = useStore((s) => s.selectState);
  const selectSeat = useStore((s) => s.selectSeat);
  const setView = useStore((s) => s.setView);
  const spot = useSpot();
  const intel = useIntel();
  // The poll just paid for, shown at the head of the tab until it is closed: nobody should have to hunt for what they bought.
  const [fresh, setFresh] = useState<number | null>(null);
  // The suggestion of where to poll can be put away for the week.
  const [quiet, setQuiet] = useState<number | null>(null);

  const pc = campaign.parties[campaign.player]!;
  const state: RegionId = selectedState ?? pc.location;
  // In a one-seat contest the seat is always the target.
  const seatTarget = world.seats.length === 1 ? world.seats[0].id : selectedSeat;

  const buy = (scope: PollScope, target: string | null, quality: PollQuality) => {
    const cost = playerPollCost(world, campaign, scope, target, quality);
    return (
      <button
        className={`btn small${scope === 'seat' && spot('poll-seat') ? ' spot' : ''}`} disabled={cost > pc.funds}
        onClick={() => {
          const before = campaign.polls.length;
          poll(scope, target, quality);
          const now = useStore.getState().game!.campaign.polls;
          if (now.length > before) setFresh(now[now.length - 1].id);
        }}
      >
        {t(`polls.${quality}`)} <span className="muted num">{f.rm(cost)}</span>
      </button>
    );
  };
  const what = (p: Poll) =>
    p.scope === 'national' ? t(`polls.whole.${kind}`)
    : p.scope === 'state' ? regionLabel(t, world, p.target!)
    : seatName(world, p.target!);
  const open = (p: Poll) => {
    if (p.scope === 'state') { selectState(p.target); setView('estimate'); }
    if (p.scope === 'seat') { selectSeat(p.target, world.seats[world.seatIndex.get(p.target!)!].state); setView('estimate'); }
  };

  // Where a poll would teach the most: the closest seat, by the last election, that no poll of the player's has looked at in the last month.
  const last = lastOutcome(world).seats;
  const worth = scopes.includes('seat') && world.seats.length > 1
    ? last
      .map((o, i) => ({ i, margin: o.margin ?? 1 }))
      .filter((r) => { const known = intel.get(world.seats[r.i].id); return !known || campaign.week - known.week > 4; })
      .sort((a, b) => a.margin - b.margin)[0]
    : undefined;
  const national = [...campaign.polls].reverse().find((p) => p.scope === 'national');

  // What the poll just bought says, in one small card: the shares, or for a state how many seats each party leads in.
  const got = fresh === null ? null : campaign.polls.find((p) => p.id === fresh) ?? null;
  const gotRows = (() => {
    if (!got) return [];
    const shares = got.scope === 'national' ? got.national : got.scope === 'seat' ? got.seats?.[got.target!] : null;
    if (shares) return shares.map((v, p) => ({ p, v, text: f.pct(v, 0) })).filter((r) => r.v > 0.02).sort((a, b) => b.v - a.v).slice(0, 5);
    const led = new Map<number, number>();
    for (const row of Object.values(got.seats ?? {})) { const p = row.indexOf(Math.max(...row)); led.set(p, (led.get(p) ?? 0) + 1); }
    return [...led].map(([p, v]) => ({ p, v, text: t('polls.result.seats', { n: v }) })).sort((a, b) => b.v - a.v);
  })();
  const gotTop = Math.max(1e-9, ...gotRows.map((r) => r.v));

  return (
    <section className="polls">
      {got && (
        <div className="poll-result" role="status">
          <div className="panel-head">
            <h3>{t('polls.result', { what: what(got) })}</h3>
            <button className="close-x" aria-label={t('toast.dismiss')} onClick={() => setFresh(null)}><Icon name="close" size={18} /></button>
          </div>
          <ul className="poll-bars">
            {gotRows.map((r) => (
              <li key={r.p} className={r.p === campaign.player ? 'mine' : ''}>
                <span className="poll-name">{partyShort(t, r.p)}</span>
                <div className="bar"><span data-party={r.p} style={{ width: `${(r.v / gotTop) * 100}%`, background: partyColor(r.p) }} /></div>
                <strong className="num">{r.text}</strong>
              </li>
            ))}
          </ul>
          <p className="muted small">{t('standing.moe', { n: Math.round(got.moe * 100) })}</p>
        </div>
      )}
      <Brief text={t('polls.intro')} />
      {worth && quiet !== campaign.week && (
        <p className="note poll-advice">
          <span className="grow">
            {t('polls.advice', { seat: world.seats[worth.i].name, margin: f.pct(worth.margin) })}{' '}
            <button className="link" onClick={() => selectSeat(world.seats[worth.i].id, world.seats[worth.i].state)}>{t('polls.advice.pick')}</button>
          </span>
          <button className="close-x" aria-label={t('toast.dismiss')} onClick={() => setQuiet(campaign.week)}><Icon name="close" size={16} /></button>
        </p>
      )}

      <ul className="action-list">
        {scopes.includes('national') && (
          <li className="action poll-row">
            <div className="grow"><span className="action-title">{t(`polls.whole.${kind}`)}</span></div>
            {buy('national', null, 'quick')}{buy('national', null, 'full')}
          </li>
        )}
        {scopes.includes('state') && (
          <li className="action poll-row">
            <div className="grow">
              <span className="action-title">{t(kind === 'general' ? 'polls.state' : 'polls.area')} — {regionLabel(t, world, state)}</span>
              <span className="action-meta">{t('polls.stateHint')}</span>
            </div>
            {buy('state', state, 'quick')}{buy('state', state, 'full')}
          </li>
        )}
        {scopes.includes('seat') && (
          <li className="action poll-row">
            <div className="grow">
              <span className="action-title">{t('polls.seat')} — {seatTarget ? seatName(world, seatTarget) : t('actions.noSeat')}</span>
              {!seatTarget && <span className="action-reason">{t('reason.noTarget.seat')}</span>}
            </div>
            {seatTarget && <>{buy('seat', seatTarget, 'quick')}{buy('seat', seatTarget, 'full')}</>}
          </li>
        )}
      </ul>

      {national?.regions && (
        <>
          <h3>{t(`polls.whole.${kind}`)} · {t('news.week', { n: national.week })}</h3>
          <table className="bloc-table">
            <tbody>
              {REGIONS.map((r) => {
                const shares = national.regions![r];
                return (
                  <tr key={r}>
                    <th scope="row">{t(`polls.region.${r}`)}</th>
                    <td>
                      <div className="stack tall" title={shares.map((s, p) => (s > 0.01 ? `${partyShort(t, p)} ${f.pct(s, 0)}` : '')).filter(Boolean).join(' · ')}>
                        {shares.map((s, p) => (s > 0 ? <span key={p} data-party={p} style={{ width: `${s * 100}%`, background: partyColor(p) }} /> : null))}
                      </div>
                      <span className="muted small">
                        {shares.map((s, p) => ({ s, p })).filter((x) => x.s > 0.03).sort((a, b) => b.s - a.s).slice(0, 4).map((x) => `${partyShort(t, x.p)} ${f.pct(x.s, 0)}`).join(' · ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      <h3>{t('polls.history')}</h3>
      <ul className="seat-list">
        {[...campaign.polls].reverse().map((p) => (
          <li key={p.id}>
            <button className="seat-row" onClick={() => open(p)} disabled={p.scope === 'national'}>
              <span className="grow">{t('polls.entry', { n: p.week, what: what(p), moe: Math.round(p.moe * 100) })}</span>
              <span className="badge plain">{t(p.public ? 'polls.public' : 'polls.yours')}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
