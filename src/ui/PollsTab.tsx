import { playerPollCost } from '../sim/campaign/turn';
import type { Poll, PollQuality, PollScope } from '../sim/campaign/types';
import type { Region, RegionId } from '../sim/types';
import { useStore } from '../state/store';
import { partyColor, partyShort, regionLabel, seatName, useFormat, useT, useWorld } from './hooks';

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

  const pc = campaign.parties[campaign.player]!;
  const state: RegionId = selectedState ?? pc.location;
  // In a one-seat contest the seat is always the target.
  const seatTarget = world.seats.length === 1 ? world.seats[0].id : selectedSeat;

  const buy = (scope: PollScope, target: string | null, quality: PollQuality) => {
    const cost = playerPollCost(world, campaign, scope, target, quality);
    return (
      <button className="btn small" disabled={cost > pc.funds} onClick={() => poll(scope, target, quality)}>
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

  const national = [...campaign.polls].reverse().find((p) => p.scope === 'national');

  return (
    <section className="polls">
      <p className="muted small">{t('polls.intro')}</p>

      <ul className="action-list">
        {scopes.includes('national') && (
          <li className="action">
            <div className="grow"><span className="action-title">{t(`polls.whole.${kind}`)}</span></div>
            {buy('national', null, 'quick')}{buy('national', null, 'full')}
          </li>
        )}
        {scopes.includes('state') && (
          <li className="action">
            <div className="grow">
              <span className="action-title">{t(kind === 'general' ? 'polls.state' : 'polls.area')} — {regionLabel(t, world, state)}</span>
              <span className="action-meta">{t('polls.stateHint')}</span>
            </div>
            {buy('state', state, 'quick')}{buy('state', state, 'full')}
          </li>
        )}
        {scopes.includes('seat') && (
          <li className="action">
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
                        {shares.map((s, p) => (s > 0 ? <span key={p} style={{ width: `${s * 100}%`, background: partyColor(p) }} /> : null))}
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
