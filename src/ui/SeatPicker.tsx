import { useMemo, useState } from 'react';
import { vacancyOf, VACANCIES, type Vacancy } from '../data/world';
import { useT, type T } from './hooks';

/** Where a seat is, in words: its state, and for an assembly seat the parliamentary seat it sits in. */
export const placeOf = (t: T, v: Vacancy) => (v.within ? `${v.within}, ${t(`state.${v.state}`)}` : t(`state.${v.state}`));

/**
 * The seat a by-election is fought in: the one chosen, a button for a random close race, and a list of every
 * parliamentary and assembly seat to pick from, narrowed as the player types a name, a code or a state.
 */
export function SeatPicker({ value, onChange, onRandom }: { value: string; onChange(key: string): void; onRandom(): void }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const chosen = vacancyOf(value);

  const shown = useMemo(() => {
    const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return VACANCIES.filter((v) => {
      const text = `${v.name} ${v.code} ${t(`state.${v.state}`)} ${v.within ?? ''} ${v.kind === 'dun' ? 'dun' : 'parlimen parliament'}`.toLowerCase();
      return words.every((w) => text.includes(w));
    });
  }, [search, t]);
  const parliament = shown.filter((v) => v.kind === 'parliament');
  const assembly = shown.filter((v) => v.kind === 'dun');

  const row = (v: Vacancy) => (
    <li key={v.key}>
      <button role="option" aria-selected={v.key === value} className={v.key === value ? 'vacancy-row active' : 'vacancy-row'} onClick={() => { onChange(v.key); setOpen(false); setSearch(''); }}>
        <span className="grow">
          <strong>{v.name}</strong>
          <span className="muted small"> {v.code} · {placeOf(t, v)}</span>
        </span>
        {v.close && <span className="badge leaning">{t('vacancy.close')}</span>}
      </button>
    </li>
  );

  return (
    <div className="vacancy">
      <div className="seat-draw">
        <span>{chosen ? t('title.seat', { seat: chosen.name, state: placeOf(t, chosen) }) : ''}</span>
        <button className="btn small" aria-expanded={open} onClick={() => setOpen(!open)}>{t('vacancy.choose')} {open ? '▴' : '▾'}</button>
        <button className="btn small" onClick={onRandom}>{t('vacancy.random')}</button>
      </div>
      {open && (
        <div className="vacancy-panel">
          <input type="search" className="vacancy-search" autoFocus value={search} placeholder={t('vacancy.search')} aria-label={t('vacancy.search')} onChange={(e) => setSearch(e.target.value)} />
          <p className="muted small">{t('vacancy.count', { n: shown.length })}</p>
          <ul className="vacancy-list" role="listbox" aria-label={t('vacancy.choose')}>
            {shown.length === 0 && <li className="muted small">{t('vacancy.none')}</li>}
            {parliament.length > 0 && <li className="vacancy-head" role="presentation">{t('vacancy.parliament')}</li>}
            {parliament.map(row)}
            {assembly.length > 0 && <li className="vacancy-head" role="presentation">{t('vacancy.dun')}</li>}
            {assembly.map(row)}
          </ul>
        </div>
      )}
    </div>
  );
}
