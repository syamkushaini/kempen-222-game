import type { ReactNode } from 'react';
import { useStore } from '../state/store';

/**
 * A figure from 0 to 100 as a bar whose colour runs from red when low to green when full. The number stays beside it,
 * and the colour-blind palette runs from orange to blue, so the colour is never the only signal. With a `label`, it is
 * a line of its own for the head of a tab; without one, it sits under a label in the header.
 */
/** The colour for a figure from 0 to 100. Red to green goes by way of amber; orange to blue goes straight, so it never passes through a red or a green. */
export function useGaugeColour(): (value: number) => string {
  const accessible = useStore((s) => s.settings.palette === 'accessible');
  return (value) => {
    const n = Math.max(0, Math.min(100, Math.round(value)));
    return accessible ? `color-mix(in oklab, #0072b2 ${n}%, #d55e00)` : `color-mix(in oklch, var(--good) ${n}%, var(--bad))`;
  };
}

export function Gauge({ value, label }: { value: number; label?: ReactNode }) {
  const n = Math.max(0, Math.min(100, Math.round(value)));
  const colour = useGaugeColour()(n);
  return (
    <div className="gauge">
      {label && <span className="muted">{label}</span>}
      <div className="bar gauge-bar" aria-hidden="true"><span style={{ width: `${n}%`, background: colour }} /></div>
      <strong className={label ? 'num' : 'num hud-value'}>{n}</strong>
    </div>
  );
}
