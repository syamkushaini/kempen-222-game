import type { StringKey } from '../i18n/strings';
import { LINE_MAX, LINE_MIN, LINE_STEP, type LineDial } from '../sim/campaign/lineDial';
import { signed } from './StopSlider';

type T = (key: StringKey, vars?: Record<string, string | number>) => string;

/** What a setting of a line of the budget is called, what it takes off or puts on, and what the line comes to. */
export function lineReadout(t: T, rm: (n: number) => string, amountAt: (dial: number) => number, value: LineDial): { name: string; change: string; total: string } {
  const base = amountAt(0);
  const amount = amountAt(value);
  const pct = base > 0 ? (amount / base - 1) * 100 : 0;
  const steps = Math.round(Math.abs(value) * LINE_STEP * 100);
  return {
    name: value === LINE_MIN ? t('dial.abolish') : value < 0 ? t('dial.cutBy', { n: steps }) : value === 0 ? t('dial.hold') : t('dial.boostBy', { n: steps }),
    change: value === 0 ? t('stop.noChange') : t(value < 0 ? 'stop.takes' : 'stop.adds', { rm: rm(Math.abs(amount - base)), pct: signed(pct, 0) }),
    total: t('stop.comesTo', { rm: rm(amount) }),
  };
}

/**
 * A slider for a line of the budget, from taking all of it away to doubling it in steps of a fifth, with what the setting does in
 * ringgit and per cent written above it. The buttons at its ends move it one step, for a thumb that cannot be exact.
 */
export function LineSlider({ label, value, onChange, t, rm, amountAt }: {
  label: string; value: LineDial; onChange(value: LineDial): void; t: T; rm: (n: number) => string; amountAt: (dial: number) => number;
}) {
  const now = lineReadout(t, rm, amountAt, value);
  const clampTo = (n: number) => Math.max(LINE_MIN, Math.min(LINE_MAX, n));
  return (
    <div className="line-slider" role="group" aria-label={label}>
      <p className="line-now" aria-live="polite">
        <strong>{now.name}</strong>
        {value !== 0 && <span className="num"> · {now.change}</span>}
        <span className="num"> · {now.total}</span>
        {value === 0 && <span className="muted small"> · {now.change}</span>}
      </p>
      <div className="line-row">
        <button type="button" className="step" aria-label={t('line.step.cut')} disabled={value <= LINE_MIN} onClick={() => onChange(clampTo(value - 1))}>−</button>
        <input
          type="range" min={LINE_MIN} max={LINE_MAX} step={1} value={value} aria-label={label}
          aria-valuetext={[now.name, now.change, now.total].join(', ')}
          onChange={(e) => onChange(clampTo(Number(e.target.value)))}
        />
        <button type="button" className="step" aria-label={t('line.step.boost')} disabled={value >= LINE_MAX} onClick={() => onChange(clampTo(value + 1))}>+</button>
      </div>
      <div className="line-scale" aria-hidden="true">
        <span>{t('dial.abolish')} −100%</span>
        <span>{t('dial.hold')}</span>
        <span>+{LINE_MAX * LINE_STEP * 100}%</span>
      </div>
    </div>
  );
}
