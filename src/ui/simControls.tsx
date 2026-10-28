import type { ReactNode } from 'react';
import { PARTIES } from '../data/parties';
import { PARTY_IDS } from '../sim/types';
import { partyColor, partyShort, useT } from './hooks';

// The small controls the simulator is made of. Each shows where the setting stood when the contest opened, so that
// what has been changed can be seen at a glance, and can be put back with one press.

const sign = (v: number, digits = 1) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(digits).replace(/\.0+$/, '')}`;
export const signed = sign;

/** A slider with its value beside it, a tick where it began, and a button to put it back. */
export function Slider({ label, hint, value, def, min, max, step = 1, onChange, fmt, lo, hi, color }: {
  label: ReactNode; hint?: string; value: number; def: number; min: number; max: number; step?: number;
  onChange(v: number): void; fmt?: (v: number) => string; lo?: string; hi?: string; color?: string;
}) {
  const t = useT();
  const changed = value !== def;
  const show = fmt ?? ((v: number) => String(v));
  const at = (def - min) / (max - min);
  return (
    <div className={changed ? 'sim-slider changed' : 'sim-slider'}>
      <div className="sim-slider-head">
        <span className="sim-slider-label">{color && <i className="sim-dot" style={{ background: color }} aria-hidden="true" />}{label}</span>
        <output className="num sim-slider-value">{show(value)}</output>
        <button type="button" className="sim-reset" disabled={!changed} onClick={() => onChange(def)} aria-label={t('sim.reset.one', { n: show(def) })} title={t('sim.reset.one', { n: show(def) })}>↺</button>
      </div>
      <div className="sim-range">
        <input type="range" min={min} max={max} step={step} value={value} aria-label={typeof label === 'string' ? label : undefined} onChange={(e) => onChange(Number(e.target.value))} />
        <i className="sim-tick" style={{ left: `calc(${at * 100}% + ${(0.5 - at) * 16}px)` }} aria-hidden="true" />
      </div>
      {(lo || hi) && <div className="sim-ends small muted"><span>{lo}</span><span>{hi}</span></div>}
      {hint && <p className="small muted sim-hint">{hint}</p>}
    </div>
  );
}

/** A party picked from a row, each with its colour and a mark where its sheet has been changed. */
export function PartyChips({ parties, value, onChange, marks }: { parties: number[]; value: number; onChange(p: number): void; marks?: (p: number) => number }) {
  const t = useT();
  return (
    <div className="sim-chips" role="radiogroup" aria-label={t('sim.party')}>
      {parties.map((p) => {
        const n = marks?.(p) ?? 0;
        return (
          <button key={p} type="button" role="radio" aria-checked={value === p} className={value === p ? 'chip active' : 'chip'} onClick={() => onChange(p)} style={value === p ? { borderColor: partyColor(p) } : undefined}>
            <i className="sim-dot" style={{ background: partyColor(p) }} aria-hidden="true" />{PARTY_IDS[p] === 'oth' ? t('party.oth.short') : PARTIES[PARTY_IDS[p]].short}
            {n > 0 && <b className="sim-count" aria-label={t('sim.changes', { n })}>{n}</b>}
          </button>
        );
      })}
    </div>
  );
}

/**
 * A table of numbers to edit, one row for each thing and one column for each party. A cell is shaded by how far it
 * is from nothing, and marked where it differs from where it began.
 */
export function Matrix({ rows, cols, get, def, set, min, max, step = 0.5, label }: {
  rows: { id: string; label: string }[]; cols: number[];
  get(row: number, col: number): number; def(row: number, col: number): number; set(row: number, col: number, v: number): void;
  min: number; max: number; step?: number; label: string;
}) {
  const t = useT();
  return (
    <div className="sim-matrix-wrap" role="group" aria-label={label}>
      <table className="sim-matrix">
        <thead>
          <tr>
            <th scope="col" />
            {cols.map((p) => <th key={p} scope="col" title={PARTIES[PARTY_IDS[p]].name}><i className="sim-dot" style={{ background: partyColor(p) }} aria-hidden="true" />{partyShort(t, p)}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={row.id}>
              <th scope="row">{row.label}</th>
              {cols.map((p) => {
                const v = get(r, p), d = def(r, p);
                const heat = Math.min(1, Math.abs(v) / (max * 0.6));
                return (
                  <td key={p} className={v !== d ? 'changed' : undefined}>
                    <input
                      type="number" inputMode="decimal" className="sim-cell" min={min} max={max} step={step} value={v}
                      aria-label={`${row.label}, ${partyShort(t, p)}`}
                      style={v === 0 ? undefined : { background: `color-mix(in srgb, var(${v > 0 ? '--good' : '--bad'}) ${Math.round(heat * 38)}%, transparent)` }}
                      onChange={(e) => { const n = Number(e.target.value); if (Number.isFinite(n)) set(r, p, Math.max(min, Math.min(max, n))); }}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A heading that opens to its controls, with a count of what in it has been changed. */
export function Block({ title, note, changes = 0, open = false, children }: { title: string; note?: string; changes?: number; open?: boolean; children: ReactNode }) {
  const t = useT();
  return (
    <details className="sim-block" open={open}>
      <summary>
        <span>{title}</span>
        {changes > 0 && <b className="sim-count" aria-label={t('sim.changes', { n: changes })}>{changes}</b>}
      </summary>
      <div className="sim-block-body">
        {note && <p className="small muted">{note}</p>}
        {children}
      </div>
    </details>
  );
}
