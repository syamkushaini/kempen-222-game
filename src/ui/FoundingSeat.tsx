import { useState } from 'react';
import type { World } from '../sim/election';
import { regionLabel, useT } from './hooks';

/** Where a party founded from nothing begins: left to luck (a different seat each game), or the seat the player picks, by state and then by name. */
export function FoundingSeat({ world, value, onChange }: { world: World; value: string; onChange(seat: string): void }) {
  const t = useT();
  const states = [...new Set(world.seats.map((s) => s.state))];
  const [state, setState] = useState<string>(world.seats[world.seatIndex.get(value) ?? 0]?.state ?? states[0]);
  const seats = world.seats.filter((s) => s.state === state);
  const chosen = value !== 'random';
  return (
    <div className="founding-seat">
      <span className="field-label">{t('foundseat.title')}</span>
      <p className="muted small">{t('foundseat.desc')}</p>
      <div className="segmented small" role="radiogroup" aria-label={t('foundseat.title')}>
        <button type="button" role="radio" aria-checked={!chosen} className={!chosen ? 'active' : ''} onClick={() => onChange('random')}>{t('foundseat.random')}</button>
        <button type="button" role="radio" aria-checked={chosen} className={chosen ? 'active' : ''} onClick={() => onChange(seats[0]?.id ?? 'random')}>{t('foundseat.choose')}</button>
      </div>
      {chosen && (
        <div className="founding-pick">
          <select aria-label={t('foundseat.state')} value={state} onChange={(e) => { setState(e.target.value); const first = world.seats.find((s) => s.state === e.target.value); if (first) onChange(first.id); }}>
            {states.map((st) => <option key={st} value={st}>{regionLabel(t, world, st)}</option>)}
          </select>
          <select aria-label={t('foundseat.seat')} value={value} onChange={(e) => onChange(e.target.value)}>
            {seats.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
