import { useMemo, useState } from 'react';
import { nominationsOpen as openFor } from '../sim/campaign/slate';
import { beforeNomination, nominationWeek } from '../sim/campaign/diplomacy';
import { canField, fieldedSeats, isOwn, nominationCost, openSeats, slateSpent } from '../sim/campaign/slate';
import { STANDS } from '../sim/transfer';
import { useStore } from '../state/store';
import { Icon } from './Icon';
import { regionLabel, useFormat, useT, useWorld } from './hooks';

/** How many of the cheapest seats the quick button adds. */
const QUICK = 10;

/** What the nominations stand at, for the panel and the list: how many seats, what they cost, and whether they are still open. */
function useSlate() {
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  return useMemo(() => {
    const fielded = new Set(fieldedSeats(world, campaign));
    const costs = world.seats.map((_, i) => nominationCost(world, i));
    return { world, campaign, fielded, costs, open: openFor(campaign) };
  }, [world, campaign]);
}

/** On the campaign tab: where the party has candidates, and the way to add more while nominations are open. */
export function NominationsPanel() {
  const t = useT();
  const f = useFormat();
  const { world, campaign, fielded, costs, open } = useSlate();
  const fieldCheapest = useStore((s) => s.fieldCheapest);
  const [list, setList] = useState(false);
  if (!isOwn(campaign) || campaign.phase !== 'campaign') return null;
  const funds = campaign.parties[campaign.player]!.funds;
  const left = openSeats(world, campaign);
  const affordable = left.filter((i) => costs[i] <= funds).length;
  const added = Object.keys(campaign.career?.slate?.added ?? {}).length;
  return (
    <section className="nominations" aria-label={t('nom.title')}>
      <div className="panel-head">
        <h3>{t('nom.title')}</h3>
        <span className="muted small">{t('nom.funds', { rm: f.rm(funds) })}</span>
      </div>
      <p className={fielded.size === 0 ? 'nom-count none' : 'nom-count'}>{t('nom.count', { n: fielded.size, total: world.seats.length })}</p>
      <p className="muted small">
        {open
          ? t('nom.open', { week: nominationWeek(campaign), min: f.rm(Math.min(...costs)), max: f.rm(Math.max(...costs)) })
          : t('nom.closed')}
        {open && fielded.size === 0 && <> {t('nom.none')}</>}
        {added > 0 && <> {t('nom.added', { n: added, rm: f.rm(slateSpent(campaign)) })}</>}
      </p>
      <div className="button-row">
        <button className="btn small primary" onClick={() => setList(true)}>{t('nom.choose')}</button>
        {open && <button className="btn small" disabled={affordable === 0} onClick={() => fieldCheapest(QUICK)}>{t('nom.cheapest', { n: Math.min(QUICK, affordable || QUICK) })}</button>}
        {open && <button className="btn small" disabled={affordable === 0} onClick={() => fieldCheapest(world.seats.length)}>{t('nom.afford', { n: affordable })}</button>}
      </div>
      {list && <SlateDialog onClose={() => setList(false)} />}
    </section>
  );
}

type Filter = 'all' | 'in' | 'out' | 'afford';

/** Every seat, with whether the party has a candidate there and what one would cost. */
export function SlateDialog({ onClose }: { onClose(): void }) {
  const t = useT();
  const f = useFormat();
  const { world, campaign, fielded, costs, open } = useSlate();
  const fieldSeat = useStore((s) => s.fieldSeat);
  const withdrawSeat = useStore((s) => s.withdrawSeat);
  const selectSeat = useStore((s) => s.selectSeat);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [byCost, setByCost] = useState(false);
  const me = campaign.player;
  const funds = campaign.parties[me]!.funds;
  const added = campaign.career?.slate?.added ?? {};

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = world.seats.map((seat, i) => ({ seat, i }));
    const shown = all.filter(({ seat, i }) => {
      if (q && !seat.name.toLowerCase().includes(q) && !seat.id.toLowerCase().includes(q)) return false;
      if (filter === 'in') return fielded.has(i);
      if (filter === 'out') return !fielded.has(i);
      if (filter === 'afford') return !fielded.has(i) && costs[i] <= funds && canField(world, campaign, i);
      return true;
    });
    return byCost ? shown.sort((a, b) => costs[a.i] - costs[b.i] || a.i - b.i) : shown;
  }, [world, campaign, fielded, costs, funds, query, filter, byCost]);

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog panel slate-dialog" role="dialog" aria-modal="true" aria-label={t('nom.dialog.title')}>
        <div className="dialog-head">
          <h2>{t('nom.dialog.title')}</h2>
          <button className="close-x" aria-label={t('toast.dismiss')} onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <p className="muted small">{t('nom.count', { n: fielded.size, total: world.seats.length })} · {t('nom.funds', { rm: f.rm(funds) })}</p>
        <label className="field">
          <span>{t('nom.search')}</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="chips" role="group" aria-label={t('nom.filter')}>
          {(['all', 'in', 'out', 'afford'] as Filter[]).map((k) => (
            <button key={k} className={filter === k ? 'chip active' : 'chip'} aria-pressed={filter === k} onClick={() => setFilter(k)}>{t(`nom.filter.${k}`)}</button>
          ))}
          <button className={byCost ? 'chip active' : 'chip'} aria-pressed={byCost} onClick={() => setByCost(!byCost)}>{t('nom.sort.cost')}</button>
        </div>
        <ul className="slate-list">
          {rows.map(({ seat, i }) => {
            const has = fielded.has(i);
            const pact = (campaign.standDowns[seat.id]?.[me] ?? STANDS) >= 0;
            const mine = seat.id in added;
            const cost = costs[i];
            return (
              <li key={seat.id} className={has ? 'slate-row in' : 'slate-row'}>
                <div className="grow">
                  <span className="action-title">{seat.name}</span>
                  <span className="action-meta">{regionLabel(t, world, seat.state)} · {has ? t('nom.status.in') : pact ? t('nom.status.pact') : t('nom.status.out')}{!has && !pact && <> · {f.rm(cost)}</>}</span>
                </div>
                <button className="link small" onClick={() => { selectSeat(seat.id, seat.state); onClose(); }}>{t('nom.map')}</button>
                {open && !has && !pact && <button className="btn small" disabled={cost > funds} onClick={() => fieldSeat(seat.id)}>{t('nom.field')}</button>}
                {open && has && mine && <button className="btn small" onClick={() => withdrawSeat(seat.id)}>{t('nom.withdraw')}</button>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** On a seat's card: whether the party has a candidate there, and the price of one if it has not and nominations are open. */
export function SeatNomination({ seatId }: { seatId: string }) {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const fieldSeat = useStore((s) => s.fieldSeat);
  const withdrawSeat = useStore((s) => s.withdrawSeat);
  if (!isOwn(campaign) || campaign.phase !== 'campaign') return null;
  const i = world.seatIndex.get(seatId)!;
  const me = campaign.player;
  const funds = campaign.parties[me]!.funds;
  const has = (campaign.standDowns[seatId]?.[me] ?? STANDS) === STANDS && world.baseline.contesting[i][me];
  const cost = nominationCost(world, i);
  const open = openFor(campaign) && beforeNomination(campaign);
  const mine = seatId in (campaign.career?.slate?.added ?? {});
  return (
    <p className="seat-nomination small">
      <strong>{has ? t('nom.status.in') : t('nom.status.out')}</strong>
      {open && !has && canField(world, campaign, i) && <> <button className="btn small" disabled={cost > funds} onClick={() => fieldSeat(seatId)}>{t('nom.seat.field', { rm: f.rm(cost) })}</button></>}
      {open && has && mine && <> <button className="btn small" onClick={() => withdrawSeat(seatId)}>{t('nom.withdraw')}</button></>}
    </p>
  );
}
