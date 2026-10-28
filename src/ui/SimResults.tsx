import { useMemo } from 'react';
import { stabilityBand } from '../sim/campaign/formation';
import type { SimConfig, SimResult, Spread } from '../sim/campaign/simulate';
import type { World } from '../sim/election';
import { PARTY_IDS } from '../sim/types';
import { Chamber } from './Chamber';
import { partyColor, partyName, partyShort, regionLabel, useT } from './hooks';
import { signed } from './simControls';
import type { Bloc } from './hemicycle';

/** One finished run, kept so that it can be looked at again and compared. */
export interface RunRecord { id: number; n: number; cfg: SimConfig; result: SimResult }
/** Many runs of one set of settings, summed up. */
export interface SpreadRecord { id: number; n: number; cfg: SimConfig; spread: Spread; focus: number }
export type CompareTo = 'prev' | 'election' | number;

const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;
const OTH = PARTY_IDS.indexOf('oth');

/** A change, with a sign and a colour: green for more, red for less. */
function Delta({ v, digits = 0, suffix = '' }: { v: number; digits?: number; suffix?: string }) {
  const rounded = Number(v.toFixed(digits));
  if (rounded === 0) return <span className="sim-delta muted">±0{suffix}</span>;
  return <span className={rounded > 0 ? 'sim-delta good' : 'sim-delta bad'}>{signed(rounded, digits)}{suffix}</span>;
}

/** The parties worth showing: the ones that won seats or a share of the vote in this run, the largest first. */
function shownParties(r: SimResult, extra: SimResult | null): number[] {
  return PARTY_IDS.map((_, p) => p)
    .filter((p) => p !== OTH && (r.seats[p] > 0 || r.before[p] > 0 || r.share[p] > 0.01 || (extra?.seats[p] ?? 0) > 0))
    .sort((a, b) => r.seats[b] - r.seats[a] || r.share[b] - r.share[a]);
}

/** Seats and votes, party by party, with a line where the majority begins. */
function SeatsTable({ result, seats, share, parties, against, refLabel, majority }: {
  result: SimResult; seats: number[]; share: number[]; parties: number[]; against: { seats: number[]; share: number[] }; refLabel: string; majority: boolean;
}) {
  const t = useT();
  const most = Math.max(result.need, ...parties.map((p) => seats[p]));
  return (
    <table className="sim-seats">
      <caption className="sr-only">{t('sim.seats.title')}</caption>
      <thead>
        <tr><th scope="col">{t('sim.col.party')}</th><th scope="col" className="num">{t('sim.col.seats')}</th><th scope="col" className="num" title={refLabel}>Δ</th><th scope="col" className="num">{t('sim.col.votes')}</th><th scope="col" className="num" title={refLabel}>Δ</th></tr>
      </thead>
      <tbody>
        {parties.map((p) => (
          <tr key={p}>
            <th scope="row"><i className="sim-dot" style={{ background: partyColor(p) }} aria-hidden="true" />{partyShort(t, p)}</th>
            <td className="sim-seat-bar">
              <span className="sim-bar" style={{ width: `${(seats[p] / most) * 100}%`, background: partyColor(p) }} />
              <i className="sim-line" style={{ left: `${(result.need / most) * 100}%` }} aria-hidden="true" />
              <b className="num">{seats[p]}</b>
            </td>
            <td className="num"><Delta v={seats[p] - against.seats[p]} /></td>
            <td className="num">{pct(share[p])}</td>
            <td className="num"><Delta v={(share[p] - against.share[p]) * 100} digits={1} /></td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr><td colSpan={5} className="small muted">{majority ? t('sim.seats.foot', { need: result.need, total: result.totalSeats, ref: refLabel.toLowerCase() }) : t('sim.seats.footLive', { need: result.need, total: result.totalSeats })}</td></tr>
      </tfoot>
    </table>
  );
}

/** How each party's share of the vote moved week by week. */
function TrendChart({ result, head, parties }: { result: SimResult; head: number; parties: number[] }) {
  const t = useT();
  const W = 320, H = 140, L = 30, B = 18, T = 8, R = 8;
  const points = result.trend;
  const last = Math.min(head, points.length - 1);
  const all = points.flatMap((pt) => parties.map((p) => pt.share[p]));
  const ymax = Math.ceil((Math.max(0.1, ...all) + 0.01) * 20) / 20;
  const ymin = Math.max(0, Math.floor((Math.min(...all) - 0.01) * 20) / 20);
  const x = (i: number) => L + ((W - L - R) * i) / Math.max(1, points.length - 1);
  const y = (v: number) => T + (H - T - B) * (1 - (v - ymin) / Math.max(0.05, ymax - ymin));
  const ticks = [ymin, (ymin + ymax) / 2, ymax];
  return (
    <svg className="sim-trend" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t('sim.trend.label')}>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="sim-grid" />
          <text x={L - 4} y={y(v) + 3} textAnchor="end" className="sim-axis">{Math.round(v * 100)}%</text>
        </g>
      ))}
      {points.map((_pt, i) => (i % Math.max(1, Math.ceil(points.length / 9)) === 0 || i === points.length - 1) && (
        <text key={i} x={x(i)} y={H - 4} textAnchor="middle" className="sim-axis">{i === 0 ? t('sim.trend.start') : i}</text>
      ))}
      {parties.map((p) => (
        <polyline key={p} fill="none" stroke={partyColor(p)} strokeWidth={2} strokeLinejoin="round" points={points.slice(0, last + 1).map((pt, i) => `${x(i)},${y(pt.share[p])}`).join(' ')} />
      ))}
      <line x1={x(last)} x2={x(last)} y1={T} y2={H - B} className="sim-head" />
    </svg>
  );
}

/** The government that took office, and how firm it is. */
function GovernmentCard({ result }: { result: SimResult }) {
  const t = useT();
  const g = result.government;
  if (!g) return <p className="muted small">{t('sim.gov.none')}</p>;
  const band = stabilityBand(g.stability);
  return (
    <div className="sim-gov">
      <p className="sim-gov-line">
        <i className="sim-dot" style={{ background: partyColor(g.pm) }} aria-hidden="true" />
        <strong>{t(g.minority ? 'sim.gov.minority' : 'sim.gov.formed', { party: partyName(t, g.pm), seats: g.seats, need: result.need })}</strong>
      </p>
      {g.partners.length > 0 ? (
        <ul className="sim-partners">
          {g.partners.map((p) => (
            <li key={p}><i className="sim-dot" style={{ background: partyColor(p) }} aria-hidden="true" />{partyShort(t, p)} <span className="muted small">· {t('sim.gov.partner', { seats: result.seats[p], posts: g.posts[p] ?? 0 })}</span></li>
          ))}
        </ul>
      ) : <p className="small muted">{t('sim.gov.alone')}</p>}
      <div className="sim-meters">
        <div><span className="small muted">{t('sim.gov.stability')}</span><div className="sim-meter"><i style={{ width: `${g.stability}%` }} className={`band-${band}`} /></div><span className="small">{g.stability} · {t(`sim.band.${band}`)}</span></div>
        <div><span className="small muted">{t('sim.gov.trust')}</span><div className="sim-meter"><i style={{ width: `${g.trust}%` }} /></div><span className="small">{g.trust}</span></div>
      </div>
      <p className="small muted">{g.day === 0 ? t('sim.gov.outright') : t('sim.gov.talks', { n: g.day })}{g.claimants.length > 1 ? ` · ${t('sim.gov.claimants', { parties: g.claimants.map((p) => partyShort(t, p)).join(', ') })}` : ''}</p>
    </div>
  );
}

/** How each state or region voted, as a bar of its seats. */
function StatesTable({ world, result, parties }: { world: World; result: SimResult; parties: number[] }) {
  const t = useT();
  return (
    <ul className="sim-states">
      {world.states.map((st) => {
        const row = result.byState[st] ?? [];
        const total = row.reduce((a, b) => a + b, 0) || 1;
        const lead = parties.reduce((best, p) => ((row[p] ?? 0) > (row[best] ?? 0) ? p : best), parties[0]);
        const was = world.seatsByState[st].length;
        return (
          <li key={st}>
            <span className="sim-state-name">{regionLabel(t, world, st)} <span className="muted small">({was})</span></span>
            <span className="sim-state-bar" role="img" aria-label={parties.filter((p) => (row[p] ?? 0) > 0).map((p) => `${partyShort(t, p)} ${row[p]}`).join(', ')}>
              {PARTY_IDS.map((_, p) => ((row[p] ?? 0) > 0 ? <i key={p} style={{ width: `${(row[p] / total) * 100}%`, background: partyColor(p) }} title={`${partyShort(t, p)} ${row[p]}`} /> : null))}
            </span>
            <span className="sim-state-lead small"><i className="sim-dot" style={{ background: partyColor(lead) }} aria-hidden="true" />{row[lead] ?? 0}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** The seats that changed hands since the last election, the narrowest first. */
function Flips({ result }: { result: SimResult }) {
  const t = useT();
  const net = useMemo(() => {
    const out = new Map<string, number>();
    for (const f of result.flips) { out.set(PARTY_IDS[f.to], (out.get(PARTY_IDS[f.to]) ?? 0) + 1); }
    return out;
  }, [result]);
  if (result.flips.length === 0) return <p className="small muted">{t('sim.flips.none')}</p>;
  return (
    <>
      <p className="small muted">{t('sim.flips.count', { n: result.flips.length, close: result.close.three, one: result.close.one })}</p>
      <ul className="sim-flips">
        {result.flips.slice(0, 14).map((fl) => (
          <li key={fl.seat}>
            <span>{fl.name} <span className="muted small">{fl.seat}</span></span>
            <span className="sim-flip-parties"><i className="sim-dot" style={{ background: partyColor(fl.from) }} aria-hidden="true" />{partyShort(t, fl.from)} → <i className="sim-dot" style={{ background: partyColor(fl.to) }} aria-hidden="true" />{partyShort(t, fl.to)}</span>
            <span className="num small muted">{pct(fl.margin)}</span>
          </li>
        ))}
      </ul>
      {net.size === 0 && null}
    </>
  );
}

/** A run of the same settings many times over: what usually happens, and how much it varies. */
export function SpreadCard({ record, previous, parties }: { record: SpreadRecord; previous: SpreadRecord | null; parties: number[] }) {
  const t = useT();
  const s = record.spread;
  const order = [...parties].sort((a, b) => s.seats[b].mean - s.seats[a].mean).filter((p) => s.seats[p].mean >= 0.5 || (previous?.spread.seats[p].mean ?? 0) >= 0.5);
  const big = order.slice(0, 3);
  const bins = s.histogram[big[0]]?.length ?? 0;
  const peak = Math.max(1, ...big.flatMap((p) => s.histogram[p] ?? []));
  return (
    <section className="sim-spread">
      <h3>{t('sim.spread.title', { n: s.runs })}</h3>
      <p className="small muted">{t('sim.spread.note')}</p>
      <table className="sim-seats">
        <thead>
          <tr><th scope="col">{t('sim.col.party')}</th><th scope="col" className="num">{t('sim.spread.mean')}</th><th scope="col" className="num">{t('sim.spread.range')}</th><th scope="col" className="num">{t('sim.spread.majority')}</th><th scope="col" className="num">{t('sim.spread.pm')}</th><th scope="col" className="num">{t('sim.spread.gov')}</th></tr>
        </thead>
        <tbody>
          {order.map((p) => (
            <tr key={p}>
              <th scope="row"><i className="sim-dot" style={{ background: partyColor(p) }} aria-hidden="true" />{partyShort(t, p)}</th>
              <td className="num"><b>{s.seats[p].mean.toFixed(1)}</b> {previous && <Delta v={s.seats[p].mean - previous.spread.seats[p].mean} digits={1} />}</td>
              <td className="num muted">{s.seats[p].low}–{s.seats[p].high}</td>
              <td className="num">{pct(s.majority[p], 0)}</td>
              <td className="num">{pct(s.pm[p], 0)}</td>
              <td className="num">{pct(s.govern[p], 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="small">{t('sim.spread.hung', { pct: Math.round(s.hung * 100) })}</p>
      {bins > 0 && (
        <svg className="sim-hist" viewBox={`0 0 ${bins * 8} 50`} role="img" aria-label={t('sim.spread.hist')} preserveAspectRatio="none">
          {big.map((p) => (s.histogram[p] ?? []).map((n, i) => (n > 0 ? <rect key={`${p}-${i}`} x={i * 8 + 0.5} y={50 - (n / peak) * 46} width={7} height={(n / peak) * 46} fill={partyColor(p)} opacity={0.6} /> : null)))}
          <line x1={(s.need / s.binWidth) * 8} x2={(s.need / s.binWidth) * 8} y1={0} y2={50} className="sim-majority" />
          <line x1={0} x2={bins * 8} y1={49.5} y2={49.5} className="sim-grid" />
        </svg>
      )}
      <p className="small muted sim-hist-axis"><span>0</span><span>{t('sim.spread.axis', { n: s.total, need: s.need })}</span></p>
    </section>
  );
}

/** The results panel: the run being looked at, and the one it is compared with. */
export function SimResults({ world, runs, view, compareTo, onCompare, onView, onRestore, head, onSkip, spread, previousSpread, parties }: {
  world: World; runs: RunRecord[]; view: RunRecord | null; compareTo: CompareTo; onCompare(v: CompareTo): void; onView(id: number): void; onRestore(run: RunRecord): void;
  head: number; onSkip(): void; spread: SpreadRecord | null; previousSpread: SpreadRecord | null; parties: number[];
}) {
  const t = useT();
  if (!view && !spread) return <div className="sim-empty"><p className="muted">{t('sim.empty')}</p></div>;

  return (
    <div className="sim-results">
      {view && <RunView world={world} runs={runs} view={view} compareTo={compareTo} onCompare={onCompare} onView={onView} onRestore={onRestore} head={head} onSkip={onSkip} />}
      {spread && <SpreadCard record={spread} previous={previousSpread} parties={parties} />}
    </div>
  );
}

function RunView({ world, runs, view, compareTo, onCompare, onView, onRestore, head, onSkip }: {
  world: World; runs: RunRecord[]; view: RunRecord; compareTo: CompareTo; onCompare(v: CompareTo): void; onView(id: number): void; onRestore(run: RunRecord): void; head: number; onSkip(): void;
}) {
  const t = useT();
  const r = view.result;
  const playing = head < r.trend.length;
  const index = runs.findIndex((x) => x.id === view.id);
  const other: RunRecord | null = compareTo === 'election' ? null : typeof compareTo === 'number' ? runs.find((x) => x.id === compareTo) ?? null : runs[index - 1] ?? null;
  const against = other ? { seats: other.result.seats, share: other.result.share } : { seats: r.before, share: r.shareBefore };
  const refLabel = other ? t('sim.run', { n: other.n }) : t('sim.lastElection');
  const parties = useMemo(() => shownParties(r, other?.result ?? null), [r, other]);
  const now = playing ? r.trend[Math.min(head, r.trend.length - 1)] : null;
  const seats = now ? now.seats : r.seats;
  const share = now ? now.share : r.share;

  const top = parties.reduce((best, p) => (seats[p] > seats[best] ? p : best), parties[0]);
  const won = seats[top] >= r.need;
  const g = r.government;
  const blocs: Bloc[] = !playing && g
    ? PARTY_IDS.map((_, p): Bloc => ({ party: p, seats: r.seats[p], side: p === g.pm || g.partners.includes(p) ? 'left' : p === OTH ? 'middle' : 'right' })).filter((b) => b.seats > 0)
    : PARTY_IDS.map((_, p): Bloc => ({ party: p, seats: r.seats[p], side: p === top ? 'left' : p === OTH ? 'middle' : 'right' })).filter((b) => b.seats > 0);

  return (
    <section className="sim-run">
      <div className="sim-run-head">
        <h3>{t('sim.run', { n: view.n })} <span className="muted small">· {t('sim.seed')} {view.result.seed} · {t('sim.weeks.run', { n: r.weeks })}</span></h3>
        <label className="small sim-compare">
          <span className="muted">{t('sim.compare')}</span>
          <select value={String(compareTo)} onChange={(e) => onCompare(e.target.value === 'prev' || e.target.value === 'election' ? e.target.value : Number(e.target.value))}>
            <option value="prev">{t('sim.compare.prev')}</option>
            <option value="election">{t('sim.lastElection')}</option>
            {runs.filter((x) => x.id !== view.id).map((x) => <option key={x.id} value={x.id}>{t('sim.run', { n: x.n })}</option>)}
          </select>
        </label>
      </div>

      <p><button type="button" className="btn small" onClick={() => onRestore(view)}>{t('sim.restore')}</button></p>

      {playing ? (
        <div className="sim-playing" aria-live="polite">
          <p><strong>{head === 0 ? t('sim.playing.start') : t('sim.playing.week', { n: head, total: r.weeks })}</strong> <span className="muted small">{t('sim.playing.note')}</span></p>
          <button type="button" className="btn small" onClick={onSkip}>{t('sim.skip')}</button>
        </div>
      ) : (
        <p className="sim-verdict">
          <i className="sim-dot" style={{ background: partyColor(top) }} aria-hidden="true" />
          <strong>{won ? t('sim.verdict.majority', { party: partyName(t, top), seats: seats[top], need: r.need }) : t('sim.verdict.hung', { party: partyName(t, top), seats: seats[top], short: r.need - seats[top] })}</strong>
        </p>
      )}

      <SeatsTable result={r} seats={seats} share={share} parties={parties} against={against} refLabel={refLabel} majority={!playing} />
      <TrendChart result={r} head={head} parties={parties.slice(0, 4)} />

      {!playing && (
        <>
          <h4 className="sim-sub">{t('sim.gov.title')}</h4>
          <GovernmentCard result={r} />
          <Chamber blocs={blocs} need={r.need} sides={{ left: g ? t('chamber.gov') : partyShort(t, top), right: t('chamber.opp'), middle: t('chamber.rest') }} />
          <h4 className="sim-sub">{t('sim.states.title')}</h4>
          <StatesTable world={world} result={r} parties={parties} />
          <h4 className="sim-sub">{t('sim.flips.title')}</h4>
          <Flips result={r} />
          <dl className="sim-facts small">
            <div><dt>{t('sim.turnout.fact')}</dt><dd className="num">{pct(r.turnout)}</dd></div>
            <div><dt>{t('sim.pactSeats')}</dt><dd className="num">{r.pactSeats}</dd></div>
          </dl>
        </>
      )}

      {runs.length > 1 && (
        <details className="sim-history">
          <summary>{t('sim.history')}</summary>
          <ul>
            {[...runs].reverse().map((x) => {
              const lead = PARTY_IDS.map((_, p) => p).filter((p) => p !== OTH).sort((a, b) => x.result.seats[b] - x.result.seats[a]).slice(0, 3);
              return (
                <li key={x.id}>
                  <button type="button" className={x.id === view.id ? 'link active' : 'link'} onClick={() => onView(x.id)}>{t('sim.run', { n: x.n })}</button>
                  <span className="small muted">{lead.map((p) => `${partyShort(t, p)} ${x.result.seats[p]}`).join(' · ')}{x.result.government ? ` → ${partyShort(t, x.result.government.pm)}` : ''}</span>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </section>
  );
}
