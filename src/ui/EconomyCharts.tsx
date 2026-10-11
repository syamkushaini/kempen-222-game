import { useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { SECTOR_IDS } from '../sim/campaign/sectors';
import { TREND_EVERY } from '../sim/campaign/trend';
import { MONTH, govBooks } from '../sim/campaign/treasury';
import { useStore } from '../state/store';
import { useFormat, useT, useWorld } from './hooks';

/** A line over time with its range marked, the level the figure aims for as a dashed line, and a dot on where it is now. */
function Line({ values, aim, goodUp, label, unit }: { values: number[]; aim?: number; goodUp: boolean | null; label: string; unit: string }) {
  const w = 220, h = 64, pad = 4;
  const lo = Math.min(...values, ...(aim !== undefined ? [aim] : [])), hi = Math.max(...values, ...(aim !== undefined ? [aim] : []));
  const span = Math.max(hi - lo, 0.5);
  const y = (v: number) => h - pad - ((v - lo) / span) * (h - 2 * pad);
  const x = (i: number) => (values.length < 2 ? w / 2 : (i / (values.length - 1)) * (w - 2 * pad) + pad);
  const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const now = values.at(-1)!, start = values[0], by = now - start;
  const better = goodUp === null || Math.abs(by) < 0.05 ? null : (by > 0) === goodUp;
  return (
    <figure className="econ-chart">
      <figcaption>
        <span className="muted">{label}</span>
        <strong className="num">{now.toFixed(1)}{unit}</strong>
        {Math.abs(by) >= 0.05 && <span className={`small ${better === null ? 'muted' : better ? 'pos-text' : 'neg'}`}>{by > 0 ? '▲' : '▼'} {Math.abs(by).toFixed(1)}</span>}
      </figcaption>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${label}: ${now.toFixed(1)}${unit}`}>
        {aim !== undefined && <line x1={pad} x2={w - pad} y1={y(aim)} y2={y(aim)} className="aim" />}
        <polyline points={pts} fill="none" className="econ-line" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(values.length - 1)} cy={y(now)} r="3" className="econ-dot" />
      </svg>
      <span className="muted small range">{lo.toFixed(1)}–{hi.toFixed(1)}{unit}</span>
    </figure>
  );
}

/**
 * How the economy has gone, month by month: growth, prices, jobs, the debt, the treasury and each sector, each against the level it
 * aims for; and, for the head of government, where this month's money comes from and goes. The figures are kept a month at a time.
 */
export function EconomyCharts() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const [span, setSpan] = useState<'year' | 'all'>('year');
  const k = campaign.career;
  const kept = k?.trend ?? [];
  if (!k) return null;
  const shown = span === 'year' ? kept.slice(-(52 / TREND_EVERY)) : kept;
  const books = govBooks(world, campaign);
  const flowName = (id: string) => t((SECTOR_IDS.includes(id as never) ? `sector.${id}` : `books.${id}`) as StringKey);
  const biggest = books ? Math.max(...books.income.map((x) => x.amount), ...books.spend.map((x) => x.amount)) : 1;
  return (
    <section className="economy-charts" aria-label={t('charts.title')}>
      <div className="charts-head">
        <h4>{t('charts.title')}</h4>
        <div className="segmented small" role="group" aria-label={t('charts.span')}>
          <button type="button" className={span === 'year' ? 'active' : ''} aria-pressed={span === 'year'} onClick={() => setSpan('year')}>{t('charts.year')}</button>
          <button type="button" className={span === 'all' ? 'active' : ''} aria-pressed={span === 'all'} onClick={() => setSpan('all')}>{t('charts.all')}</button>
        </div>
      </div>
      {shown.length < 2 ? <p className="muted small">{t('charts.none')}</p> : (
        <>
          <div className="chart-grid">
            <Line values={shown.map((p) => p.growth)} aim={4} goodUp label={t('house.growth')} unit="%" />
            <Line values={shown.map((p) => p.inflation)} aim={2.5} goodUp={false} label={t('house.inflation')} unit="%" />
            <Line values={shown.map((p) => p.jobless)} aim={3.5} goodUp={false} label={t('house.jobless')} unit="%" />
            <Line values={shown.map((p) => p.debt)} aim={70} goodUp={false} label={t('house.debt')} unit="%" />
            <Line values={shown.map((p) => p.treasury)} goodUp label={t('charts.treasury')} unit="%" />
          </div>
          <h5>{t('charts.sectors')}</h5>
          <div className="chart-grid sectors">
            {SECTOR_IDS.map((id, i) => <Line key={id} values={shown.map((p) => p.sectors[i] ?? 50)} aim={50} goodUp label={t(`sector.${id}`)} unit="" />)}
          </div>
        </>
      )}
      {books && (
        <>
          <h5>{t('charts.flow')}</h5>
          <ul className="flow-bars">
            {books.income.map((x) => <FlowRow key={x.id} name={flowName(x.id)} amount={x.amount * MONTH} share={x.amount / biggest} money={f.rm(x.amount * MONTH)} tone="in" />)}
            {books.spend.map((x) => <FlowRow key={x.id} name={flowName(x.id)} amount={x.amount * MONTH} share={x.amount / biggest} money={f.rm(x.amount * MONTH)} tone="out" />)}
          </ul>
        </>
      )}
    </section>
  );
}

function FlowRow({ name, share, money, tone }: { name: string; amount: number; share: number; money: string; tone: 'in' | 'out' }) {
  return (
    <li className={`flow ${tone}`}>
      <span className="flow-name">{tone === 'in' ? '＋' : '−'} {name}</span>
      <span className="flow-bar" aria-hidden="true"><span style={{ width: `${Math.max(2, Math.round(share * 100))}%` }} /></span>
      <span className="num small">{money}</span>
    </li>
  );
}
