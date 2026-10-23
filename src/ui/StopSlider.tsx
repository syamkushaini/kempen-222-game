/** One place a slider can stop: what it is called, and what the player gets there (a figure, and a line on what it means). */
export interface Stop<V extends string | number> { value: V; label: string; detail?: string; note?: string }

/**
 * A slider that stops in a few places, with what each stop does written under it, so that the player sees what they are giving up or
 * gaining before they move it, and not only after. The stops can be tapped as well as dragged to.
 */
export function StopSlider<V extends string | number>({ label, stops, value, onChange, disabled = false }: {
  label: string; stops: Stop<V>[]; value: V; onChange(value: V): void; disabled?: boolean;
}) {
  const at = Math.max(0, stops.findIndex((s) => s.value === value));
  const now = stops[at];
  return (
    <div className="stop-slider" role="group" aria-label={label}>
      <input
        type="range" min={0} max={stops.length - 1} step={1} value={at} disabled={disabled}
        aria-label={label} aria-valuetext={[now.label, now.detail, now.note].filter(Boolean).join(', ')}
        onChange={(e) => onChange(stops[Number(e.target.value)].value)}
      />
      <ol className="stop-list" style={{ gridTemplateColumns: `repeat(${stops.length}, 1fr)` }}>
        {stops.map((s, i) => (
          <li key={String(s.value)} className={i === at ? 'on' : ''}>
            <button type="button" disabled={disabled} aria-pressed={i === at} onClick={() => onChange(s.value)}>
              <strong>{s.label}</strong>
              {s.detail && <span className="num">{s.detail}</span>}
              {s.note && <small>{s.note}</small>}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** A change written with its sign, one decimal: +0.3, −0.6, and a plain 0.0 for none. */
export const signed = (n: number, digits = 1): string => (Math.abs(n) < 0.5 * 10 ** -digits ? (0).toFixed(digits) : `${n > 0 ? '+' : '−'}${Math.abs(n).toFixed(digits)}`);
