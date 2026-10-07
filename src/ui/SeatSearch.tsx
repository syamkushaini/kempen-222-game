import { useId, useMemo, useState } from 'react';
import { useStore } from '../state/store';
import { useT, useWorld } from './hooks';

/** Finds a seat by its name or its code and takes the map there: quicker than hunting for one of 222 by eye. */
export function SeatSearch() {
  const t = useT();
  const world = useWorld();
  const selectSeat = useStore((s) => s.selectSeat);
  const list = useId();
  const [text, setText] = useState('');
  const index = useMemo(() => {
    const byKey = new Map<string, number>();
    world.seats.forEach((s, i) => { byKey.set(s.name.toLowerCase(), i); byKey.set(s.id.toLowerCase(), i); byKey.set(`${s.name} (${s.id})`.toLowerCase(), i); });
    return byKey;
  }, [world]);
  const go = (value: string) => {
    const i = index.get(value.trim().toLowerCase());
    if (i === undefined) return false;
    selectSeat(world.seats[i].id, world.seats[i].state);
    setText('');
    return true;
  };
  return (
    <form className="seat-search" role="search" onSubmit={(e) => { e.preventDefault(); go(text); }}>
      <input
        type="search" list={list} value={text} placeholder={t('map.search')} aria-label={t('map.search')}
        // Picking from the list fills the whole name in at once, which is as good as pressing Enter.
        onChange={(e) => { if (!go(e.target.value)) setText(e.target.value); }}
      />
      <datalist id={list}>{world.seats.map((s) => <option key={s.id} value={`${s.name} (${s.id})`} />)}</datalist>
    </form>
  );
}
