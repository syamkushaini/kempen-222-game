import type { ReactNode } from 'react';
import type { StringKey } from '../i18n/strings';
import { LINE_MAX, LINE_MIN, LINE_STEP, type LineDial } from '../sim/campaign/lineDial';
import { signed } from './StopSlider';

type T = (key: StringKey, vars?: Record<string, string | number>) => string;

/** How a setting that moves an amount of money is read: the size of a step in per cent, and whether the bottom of the scale is called abolishing. */
export interface Scale { pctPerStep: number; abolishAt?: number; raiseKey: StringKey }
export const LINE_SCALE: Scale = { pctPerStep: LINE_STEP * 100, abolishAt: LINE_MIN, raiseKey: 'dial.boostBy' };

/** What a setting is called, what it takes off or puts on in ringgit and per cent, and what the whole comes to. */
export function lineReadout(t: T, rm: (n: number) => string, amountAt: (dial: number) => number, value: LineDial, scale: Scale = LINE_SCALE): { name: string; change: string; total: string } {
  const base = amountAt(0);
  const amount = amountAt(value);
  const pct = base > 0 ? (amount / base - 1) * 100 : 0;
  const steps = Math.round(Math.abs(value) * scale.pctPerStep);
  return {
    name: value === scale.abolishAt ? t('dial.abolish') : value < 0 ? t('dial.cutBy', { n: steps }) : value === 0 ? t('dial.hold') : t(scale.raiseKey, { n: steps }),
    change: value === 0 ? t('stop.noChange') : t(value < 0 ? 'stop.takes' : 'stop.adds', { rm: rm(Math.abs(amount - base)), pct: signed(pct, 0) }),
    total: t('stop.comesTo', { rm: rm(amount) }),
  };
}

/** A number of steps in words: "1 step", "3 steps". */
export const stepsText = (t: T, n: number): string => t(n === 1 ? 'dial.step.one' : 'dial.step.many', { n });

/**
 * A slider that moves in whole steps, with what the setting is and what it does written above it, and a step button at each end for a
 * thumb that cannot be exact. What is written above it is up to what the setting is; the slider is the same for all of them.
 */
export function StepSlider({ label, min, max, value, onChange, disabled = false, readout, scale, t }: {
  label: string; min: number; max: number; value: number; onChange(value: number): void; disabled?: boolean; readout: ReactNode; scale: [string, string, string]; t: T;
}) {
  const clampTo = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div className="line-slider" role="group" aria-label={label}>
      <p className="line-now" aria-live="polite">{readout}</p>
      <div className="line-row">
        <button type="button" className="step" aria-label={t('line.step.cut')} disabled={disabled || value <= min} onClick={() => onChange(clampTo(value - 1))}>−</button>
        <input
          type="range" min={min} max={max} step={1} value={value} disabled={disabled} aria-label={label}
          onChange={(e) => onChange(clampTo(Number(e.target.value)))}
        />
        <button type="button" className="step" aria-label={t('line.step.boost')} disabled={disabled || value >= max} onClick={() => onChange(clampTo(value + 1))}>+</button>
      </div>
      <div className="line-scale" aria-hidden="true">
        <span>{scale[0]}</span><span>{scale[1]}</span><span>{scale[2]}</span>
      </div>
    </div>
  );
}

/** The readout of a setting that moves money: its name, what it takes off or adds, and what it comes to. */
export function MoneyReadout({ now }: { now: { name: string; change: string; total: string } }) {
  return (
    <>
      <strong>{now.name}</strong>
      <span className="num"> · {now.change} · {now.total}</span>
    </>
  );
}

/** A slider for a line of the budget, from taking all of it away to doubling it in fifths. */
export function LineSlider({ label, value, onChange, t, rm, amountAt }: {
  label: string; value: LineDial; onChange(value: LineDial): void; t: T; rm: (n: number) => string; amountAt: (dial: number) => number;
}) {
  return (
    <StepSlider
      label={label} min={LINE_MIN} max={LINE_MAX} value={value} onChange={onChange} t={t}
      readout={<MoneyReadout now={lineReadout(t, rm, amountAt, value)} />}
      scale={[`${t('dial.abolish')} −100%`, t('dial.hold'), `+${LINE_MAX * LINE_STEP * 100}%`]}
    />
  );
}
