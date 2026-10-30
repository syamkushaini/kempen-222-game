import { useId, useMemo, useRef, useState } from 'react';
import { useStore } from '../state/store';
import { lastOutcome, partyColor, regionLabel, useT, useWorld } from './hooks';

const SHOWN = 30;

/**
 * Finds a seat by its name, code or state and takes the map there. The matches are a list under the box, with big rows to tap:
 * on a phone, picking one of 222 seats from the map by eye is not possible, and the browser's own suggestion list is too small.
 */
export function SeatSearch() {
  const t = useT();
  const world = useWorld();
  const selectSeat = useStore((s) => s.selectSeat);
  const list = useId();
  const box = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const held = useMemo(() => lastOutcome(world), [world]);

  const matches = useMemo(() => {
    const q = text.trim().toLowerCase();
    const rows = world.seats.map((s, i) => ({ s, i, state: regionLabel(t, world, s.state) }));
    if (!q) return rows.sort((a, b) => a.s.name.localeCompare(b.s.name));
    const rank = (r: { s: { name: string; id: string }; state: string }) => {
      const name = r.s.name.toLowerCase(), id = r.s.id.toLowerCase();
      return name.startsWith(q) || id.startsWith(q) ? 0 : name.includes(q) ? 1 : r.state.toLowerCase().includes(q) ? 2 : 3;
    };
    return rows.map((r) => ({ r, k: rank(r) })).filter((x) => x.k < 3).sort((a, b) => a.k - b.k || a.r.s.name.localeCompare(b.r.s.name)).map((x) => x.r);
  }, [world, text, t]);

  const pick = (i: number) => {
    const s = world.seats[i];
    selectSeat(s.id, s.state);
    setText('');
    setOpen(false);
    box.current?.blur();
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(Math.min(matches.length, SHOWN) - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (matches[active]) pick(matches[active].i); }
    else if (e.key === 'Escape') { setOpen(false); }
  };
  const shown = matches.slice(0, SHOWN);

  return (
    <form className="seat-search" role="search" onSubmit={(e) => e.preventDefault()}>
      <input
        ref={box} type="search" role="combobox" aria-expanded={open} aria-controls={list} aria-autocomplete="list"
        aria-activedescendant={open && shown[active] ? `${list}-${shown[active].i}` : undefined}
        value={text} placeholder={t('map.search')} aria-label={t('map.search')} autoComplete="off" enterKeyHint="go"
        onFocus={() => setOpen(true)}
        // A tap on a row happens before the box loses focus is settled, so the list closes a moment after.
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => { setText(e.target.value); setActive(0); setOpen(true); }}
        onKeyDown={onKey}
      />
      {open && (
        <ul id={list} className="seat-results" role="listbox" aria-label={t('map.search')}>
          {shown.length === 0 && <li className="muted small seat-results-note">{t('map.search.none')}</li>}
          {shown.map((r, n) => (
            <li key={r.s.id} id={`${list}-${r.i}`} role="option" aria-selected={n === active}>
              <button type="button" className={n === active ? 'active' : ''} onPointerDown={(e) => e.preventDefault()} onClick={() => pick(r.i)}>
                <i className="dot" style={{ background: partyColor(held.seats[r.i].winner) }} aria-hidden="true" />
                <span className="seat-results-name">{r.s.name}</span>
                <span className="muted small">{r.s.id} · {r.state}</span>
              </button>
            </li>
          ))}
          {matches.length > SHOWN && <li className="muted small seat-results-note">{t('map.search.more', { n: matches.length - SHOWN })}</li>}
        </ul>
      )}
    </form>
  );
}
