import type { StringKey } from '../i18n/strings';
import { STRONG_AT, WEAK_AT, wellness } from '../sim/campaign/doctrines';
import { FORECAST_WEEKS, forecast } from '../sim/campaign/forecast';
import { STANCE_IDS, stanceAvailable, type StanceId } from '../sim/campaign/stances';
import type { Career } from '../sim/campaign/types';
import { useT } from './hooks';

const SIZE = 280, C = SIZE / 2, R = 92;

/** A meter on the radar: how well it is doing, where 100 is as good as it gets (for the armed forces' say, the other way about). */
const good = (id: StanceId, v: number): number => (id === 'influence' ? 100 - v : v);

/**
 * The shape of the country: one point for each meter, further out is better. The solid shape is now; the dashed one is where the sliders take it
 * in a year. Rings mark the weak and strong lines. A point is a button that goes to its slider.
 */
export function MeterRadar({ k, scenario }: { k: Career; scenario: string }) {
  const t = useT();
  const ids = STANCE_IDS.filter((id) => stanceAvailable(scenario, id));
  const n = ids.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const at = (i: number, value: number): [number, number] => [C + Math.cos(angle(i)) * R * (value / 100), C + Math.sin(angle(i)) * R * (value / 100)];
  const shape = (values: number[]) => values.map((v, i) => at(i, Math.max(2, Math.min(100, v))).map((x) => x.toFixed(1)).join(',')).join(' ');
  const now = ids.map((id) => wellness(k, id));
  const later = ids.map((id) => good(id, forecast(k, id)[FORECAST_WEEKS]));
  const ring = (value: number) => ids.map((_, i) => at(i, value).map((x) => x.toFixed(1)).join(',')).join(' ');
  return (
    <figure className="radar">
      <figcaption><strong>{t('radar.title')}</strong><p className="muted small">{t('radar.desc')}</p></figcaption>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${t('radar.title')}: ${ids.map((id, i) => `${t(`radar.${id}` as StringKey)} ${Math.round(now[i])}`).join(', ')}`}>
        {[100, STRONG_AT, WEAK_AT].map((v) => <polygon key={v} className={`radar-ring ring-${v}`} points={ring(v)} />)}
        {ids.map((id, i) => { const [x, y] = at(i, 100); return <line key={id} className="radar-axis" x1={C} y1={C} x2={x} y2={y} />; })}
        <polygon className="radar-later" points={shape(later)} />
        <polygon className="radar-now" points={shape(now)} />
        {ids.map((id, i) => {
          const [px, py] = at(i, Math.max(2, now[i]));
          const [lx, ly] = [C + Math.cos(angle(i)) * (R + 22), C + Math.sin(angle(i)) * (R + 22)];
          const anchor = Math.abs(Math.cos(angle(i))) < 0.2 ? 'middle' : Math.cos(angle(i)) > 0 ? 'start' : 'end';
          return (
            <g key={id} className="radar-point" tabIndex={0} role="button" aria-label={`${t(`radar.${id}` as StringKey)} ${Math.round(now[i])}`}
              onClick={() => document.getElementById(`stance-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById(`stance-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>
              <circle cx={px} cy={py} r={5} className={now[i] >= STRONG_AT ? 'dot-good' : now[i] <= WEAK_AT ? 'dot-bad' : 'dot'} />
              <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle" className="radar-label">{t(`radar.${id}` as StringKey)}</text>
              <text x={lx} y={ly + 13} textAnchor={anchor} dominantBaseline="middle" className="radar-value">{Math.round(now[i])}</text>
            </g>
          );
        })}
      </svg>
      <div className="radar-key small muted"><span className="key-now" />{t('radar.now')} <span className="key-later" />{t('radar.year')}</div>
    </figure>
  );
}

/** The next year of one meter at the slider's setting and at the middle. */
export function Sparkline({ k, id, notch }: { k: Career; id: StanceId; notch: -2 | -1 | 0 | 1 | 2 }) {
  const t = useT();
  const here = forecast(k, id, notch), mid = forecast(k, id, 0);
  const all = [...here, ...mid];
  const [lo, hi] = [Math.min(...all) - 2, Math.max(...all) + 2];
  const W = 240, H = 44;
  const path = (line: number[]) => line.map((v, i) => `${i === 0 ? 'M' : 'L'}${((i / FORECAST_WEEKS) * W).toFixed(1)},${(H - ((v - lo) / (hi - lo)) * H).toFixed(1)}`).join(' ');
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${t('forecast.line')}: ${t('forecast.end', { at: Math.round(here.at(-1)!), mid: Math.round(mid.at(-1)!) })}`}>
      <path d={path(mid)} className="spark-mid" />
      <path d={path(here)} className="spark-here" />
    </svg>
  );
}
