import { useMemo, useState } from 'react';
import { canEnter, enteredSeats, entriesOpen, entryCost, newSeats } from '../sim/campaign/entry';
import { nominationWeek } from '../sim/campaign/diplomacy';
import { isOwn } from '../sim/campaign/slate';
import { useStore } from '../state/store';
import { Icon } from './Icon';
import { regionLabel, useFormat, useT, useWorld } from './hooks';

/**
 * Where the player's party has never stood: on the campaign tab, a line saying so and the way to put candidates there.
 * A party the player made has its own slate (see Nominations.tsx); every other party uses this.
 */
export function EntriesPanel() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const [open, setOpen] = useState(false);
  if (isOwn(campaign) || !entriesOpen(world, campaign)) return null;
  const strange = newSeats(world, campaign);
  const entered = enteredSeats(campaign);
  // Nothing to show for a party that already stands everywhere.
  if (strange.length === 0 && entered.length === 0) return null;
  const funds = campaign.parties[campaign.player]!.funds;
  return (
    <section className="nominations" aria-label={t('entry.title')}>
      <div className="panel-head">
        <h3>{t('entry.title')}</h3>
        <span className="muted small">{t('nom.funds', { rm: f.rm(funds) })}</span>
      </div>
      <p className="muted small">
        {t('entry.note', { week: nominationWeek(campaign), n: strange.length })}
        {entered.length > 0 && <> {t('entry.added', { n: entered.length })}</>}
      </p>
      <div className="button-row">
        <button className="btn small" onClick={() => setOpen(true)}>{t('entry.choose')}</button>
      </div>
      {open && <EntryDialog onClose={() => setOpen(false)} />}
    </section>
  );
}

type Filter = 'all' | 'mine' | 'afford';

/** Every seat the party has never stood in, with what a candidate there would cost. */
export function EntryDialog({ onClose }: { onClose(): void }) {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const enterSeat = useStore((s) => s.enterSeat);
  const leaveSeat = useStore((s) => s.leaveSeat);
  const selectSeat = useStore((s) => s.selectSeat);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const me = campaign.player;
  const funds = campaign.parties[me]!.funds;
  const entered = campaign.entered ?? {};

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const ids = new Set([...newSeats(world, campaign), ...enteredSeats(campaign).map((id) => world.seatIndex.get(id)!)]);
    return [...ids].sort((a, b) => a - b).map((i) => ({ i, seat: world.seats[i] })).filter(({ i, seat }) => {
      if (q && !seat.name.toLowerCase().includes(q) && !seat.id.toLowerCase().includes(q)) return false;
      if (filter === 'mine') return seat.id in entered;
      if (filter === 'afford') return !(seat.id in entered) && entryCost(world, i) <= funds;
      return true;
    });
  }, [world, campaign, entered, funds, query, filter]);

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog panel slate-dialog" role="dialog" aria-modal="true" aria-label={t('entry.dialog.title')}>
        <div className="dialog-head">
          <h2>{t('entry.dialog.title')}</h2>
          <button className="close-x" aria-label={t('toast.dismiss')} onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <p className="muted small">{t('entry.dialog.note')} · {t('nom.funds', { rm: f.rm(funds) })}</p>
        <label className="field">
          <span>{t('nom.search')}</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="chips" role="group" aria-label={t('nom.filter')}>
          {(['all', 'mine', 'afford'] as Filter[]).map((k) => (
            <button key={k} className={filter === k ? 'chip active' : 'chip'} aria-pressed={filter === k} onClick={() => setFilter(k)}>{t(`entry.filter.${k}`)}</button>
          ))}
        </div>
        <ul className="slate-list">
          {rows.map(({ i, seat }) => {
            const mine = seat.id in entered;
            const cost = entryCost(world, i);
            return (
              <li key={seat.id} className={mine ? 'slate-row in' : 'slate-row'}>
                <div className="grow">
                  <span className="action-title">{seat.name}</span>
                  <span className="action-meta">{regionLabel(t, world, seat.state)} · {mine ? t('entry.status.in') : f.rm(cost)}</span>
                </div>
                <button className="link small" onClick={() => { selectSeat(seat.id, seat.state); onClose(); }}>{t('nom.map')}</button>
                {!mine && <button className="btn small" disabled={!canEnter(world, campaign, seat.id)} onClick={() => enterSeat(seat.id)}>{t('entry.stand')}</button>}
                {mine && <button className="btn small" onClick={() => leaveSeat(seat.id)}>{t('nom.withdraw')}</button>}
              </li>
            );
          })}
          {rows.length === 0 && <li className="muted small">{t('entry.none')}</li>}
        </ul>
      </div>
    </div>
  );
}

/** On a seat's card: a party that has never stood here can, until nomination day, for a price. */
export function SeatEntry({ seatId }: { seatId: string }) {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const enterSeat = useStore((s) => s.enterSeat);
  const leaveSeat = useStore((s) => s.leaveSeat);
  if (isOwn(campaign) || !entriesOpen(world, campaign)) return null;
  const i = world.seatIndex.get(seatId)!;
  const mine = seatId in (campaign.entered ?? {});
  if (world.baseline.contesting[i][campaign.player] && !mine) return null;
  return (
    <p className="seat-nomination small">
      <strong>{mine ? t('entry.status.in') : t('entry.status.out')}</strong>
      {!mine && <> <button className="btn small" disabled={!canEnter(world, campaign, seatId)} onClick={() => enterSeat(seatId)}>{t('entry.seat.stand', { rm: f.rm(entryCost(world, i)) })}</button></>}
      {mine && <> <button className="btn small" onClick={() => leaveSeat(seatId)}>{t('nom.withdraw')}</button></>}
    </p>
  );
}
