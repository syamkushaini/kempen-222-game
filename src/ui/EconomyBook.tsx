import { figuresOf, publicFinance, sectorShares } from '../sim/campaign/gdp';
import { SECTOR_IDS } from '../sim/campaign/sectors';
import { useStore } from '../state/store';
import { useFormat, useT, useWorld } from './hooks';

/** An arrow for a figure that has gone up or down since the last announcement. */
const trend = (now: number, before: number | undefined) => (before === undefined || now === before ? '' : now > before ? '▲' : '▼');
const tone = (now: number, before: number | undefined, goodWhenUp = true) =>
  before === undefined || now === before ? '' : (now > before) === goodWhenUp ? 'pos-text' : 'neg';

/** The economy's size in ringgit: output, each person's share, what is owed, where it comes from, and the yearly announcements. */
export function EconomyBook() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const k = useStore((s) => s.game!.campaign.career!);
  const now = figuresOf(world, k);
  const fin = publicFinance(world, k);
  const mix = sectorShares(world, k);
  const reports = (k.reports ?? []).slice(-5).reverse();
  return (
    <>
      <h4>{t('house.size')}</h4>
      <dl className="facts orders-facts">
        <div><dt>{t('house.gdp')}</dt><dd className="num">{f.rm(now.gdp)}</dd></div>
        <div><dt>{t('house.perCapita')}</dt><dd className="num">{f.rm(now.perCapita)}</dd></div>
        <div><dt>{t('house.population')}</dt><dd className="num">{(now.population / 1_000_000).toFixed(2)}m</dd></div>
        <div><dt>{t('house.owed')}</dt><dd className={`num ${k.economy.debt > 75 ? 'neg' : ''}`}>{f.rm(fin.debtRm)}</dd></div>
        <div><dt>{t('house.deficitRm')}</dt><dd className="num">{f.rm(fin.deficitRm)}</dd></div>
      </dl>
      <p className="muted small">{t('house.mix')}: {SECTOR_IDS.map((id) => `${t(`sector.${id}`)} ${Math.round(mix[id] * 100)}%`).join(' · ')}</p>
      <h4>{t('house.reports')}</h4>
      {reports.length === 0 ? <p className="muted small">{t('house.reports.none')}</p> : (
        <table className="ledger">
          <thead><tr><th>{t('house.reports.year')}</th><th>{t('house.gdp')}</th><th>{t('house.perCapita')}</th><th>{t('house.reports.growth')}</th><th>{t('house.owed')}</th></tr></thead>
          <tbody>
            {reports.map((r, i) => {
              const before = reports[i + 1];
              return (
                <tr key={r.year}>
                  <td>{r.year}</td>
                  <td className={tone(r.gdp, before?.gdp)}>{f.rm(r.gdp)} {trend(r.gdp, before?.gdp)}</td>
                  <td className={tone(r.perCapita, before?.perCapita)}>{f.rm(r.perCapita)} {trend(r.perCapita, before?.perCapita)}</td>
                  <td>{r.growth.toFixed(1)}%</td>
                  <td className={tone(r.debtRm, before?.debtRm, false)}>{f.rm(r.debtRm)} {trend(r.debtRm, before?.debtRm)} <span className="muted small">{r.debt.toFixed(0)}%</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
