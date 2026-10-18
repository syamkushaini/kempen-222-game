import type { StringKey } from '../i18n/strings';
import { TOOLS, TOOL_GOALS, canUseTool, rateOf } from '../sim/campaign/econTools';
import { MAX_PROJECTS_AT_ONCE, PROJECTS, REPAY_MAX, TAX_IDS, TAX_MIX, canStartProject, taxMixOf } from '../sim/campaign/econPlans';
import { MONTH, debtEased, govBooks, govMoney } from '../sim/campaign/treasury';
import { ALLOCATION } from '../sim/campaign/treasury';
import { isPm } from '../sim/campaign/office';
import { isFederal } from '../sim/campaign/defence';
import { bankActs } from '../sim/campaign/markets';
import { STOCK_IDS } from '../sim/campaign/types';
import { FORCES_PROJECTS } from '../sim/campaign/econPlansData';
import { useStore } from '../state/store';
import { describeEffect } from './effectText';
import { useFormat, useT, useWorld } from './hooks';

/**
 * What the head of government can do about the economy besides the budget: a policy rate left to stand, and acts for the debt, for
 * prices, for growth and jobs and for the books, each with what it does and costs shown before it is used, and the weeks it must rest after.
 */
export function EconomyTools() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const use = useStore((s) => s.useTool);
  const setRate = useStore((s) => s.setRate);
  const setTax = useStore((s) => s.setTax);
  const setRepay = useStore((s) => s.setRepayShare);
  const start = useStore((s) => s.startProject);
  const stop = useStore((s) => s.stopProject);
  if (!campaign.career || campaign.phase !== 'term' || !isPm(campaign)) return null;
  const rate = rateOf(campaign);
  const banked = bankActs(campaign);
  const mk = campaign.career.markets;
  const books = govBooks(world, campaign);
  const yearly = books ? debtEased(world, campaign, (books.spend.find((x) => x.id === 'repay')?.amount ?? 0) * 52) : 0;
  const effectsOf = (id: string) => TOOLS.find((x) => x.id === id)!.effects.map((e) => describeEffect(t, f, world, campaign, e)).filter(Boolean).join(' · ');
  return (
    <section className="econ-tools" aria-label={t('tools.title')}>
      <h3>{t('tools.title')}</h3>
      <p className="muted small action-desc">{t('tools.desc')}</p>
      <div className="rate-row">
        <div className="grow">
          <span className="action-title">{t('tools.rate')}</span>
          <span className="action-meta">{t(`tools.rate.${rate}` as StringKey)}</span>
          {banked && <span className="action-meta">{t('bank.independent', { n: Math.max(0, (campaign.career.markets?.next ?? 0) - campaign.career.week) })}</span>}
        </div>
        <div className="segmented small" role="group" aria-label={t('tools.rate')}>
          {([-1, 0, 1] as const).map((d) => (
            <button key={d} type="button" className={rate === d ? 'active' : ''} aria-pressed={rate === d} disabled={banked} onClick={() => setRate(d)}>{t(`tools.rate.btn.${d}` as StringKey)}</button>
          ))}
        </div>
      </div>
      {banked && mk && (
        <div className="plan-card">
          <h4>{t('markets.title')}</h4>
          <p className="muted small">{t('markets.desc')}</p>
          <p className="small num">{t('markets.fx', { usd: mk.usd.toFixed(2), sgd: mk.sgd.toFixed(2) })}</p>
          <ul>
            {STOCK_IDS.map((s) => (
              <li key={s} className="action">
                <div className="grow">
                  <span className="action-title">{t(`stock.${s}` as StringKey)}</span>
                  <span className="action-meta num">{t('markets.index', { n: Math.round(mk.index[s]) })}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="plan-card">
        <h4>{t('plan.repay.title')}</h4>
        <p className="muted small">{t('plan.repay.desc')}</p>
        <label className="muted small" htmlFor="repay-share">{t('plan.repay.label', { pct: Math.round((campaign.career.repayShare ?? 0) * 100) })}</label>
        <input id="repay-share" type="range" min={0} max={REPAY_MAX * 100} step={5} value={Math.round((campaign.career.repayShare ?? 0) * 100)} onChange={(e) => setRepay(Number(e.target.value) / 100)} />
        <p className="small num">{t('plan.repay.forecast', { pts: yearly.toFixed(2) })}</p>
      </div>
      <div className="plan-card">
        <h4>{t('plan.tax.title')}</h4>
        <p className="muted small">{t('plan.tax.desc')}</p>
        <ul>
          {TAX_IDS.map((id) => (
            <li key={id} className="action">
              <div className="grow">
                <span className="action-title">{t(`plan.tax.${id}` as StringKey)}</span>
                <span className="action-meta num">{t('plan.tax.effect', { take: Math.round(TAX_MIX[id].takings * 100), prices: TAX_MIX[id].prices.toFixed(2), growth: TAX_MIX[id].growth.toFixed(2) })}</span>
                <span className="action-meta">{t(`plan.tax.${id}.who` as StringKey)}</span>
              </div>
              <div className="segmented small" role="group" aria-label={t(`plan.tax.${id}` as StringKey)}>
                {([-1, 0, 1] as const).map((d) => <button key={d} type="button" className={taxMixOf(campaign.career!)[id] === d ? 'active' : ''} aria-pressed={taxMixOf(campaign.career!)[id] === d} onClick={() => setTax(id, d)}>{t(d === -1 ? 'dial.cut' : d === 0 ? 'dial.hold' : 'dial.raise')}</button>)}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="plan-card">
        <h4>{t('plan.projects.title')}</h4>
        <p className="muted small">{t('plan.projects.desc', { n: MAX_PROJECTS_AT_ONCE })}</p>
        <ul>
          {PROJECTS.filter((p) => !FORCES_PROJECTS.includes(p.id) || isFederal(campaign.scenario)).map((p) => {
            const running = campaign.career!.projects?.find((x) => x.id === p.id);
            const built = campaign.career!.built?.includes(p.id);
            const check = canStartProject(campaign, p.id);
            return (
              <li key={p.id} className="action">
                <div className="grow">
                  <span className="action-title">{t(`project.${p.id}` as StringKey)}{built ? ` · ${t('plan.projects.built')}` : ''}</span>
                  <span className="action-meta">{t(`project.${p.id}.desc` as StringKey)}</span>
                  <span className="action-meta num">{t('plan.projects.cost', { rm: f.rm(govMoney(world, ALLOCATION.pm) * p.cost * MONTH), weeks: p.weeks })}</span>
                  {(p.meters || p.forces) && <span className="action-meta num">{[p.meters && describeEffect(t, f, world, campaign, { t: 'pestel', ...p.meters }), p.forces && describeEffect(t, f, world, campaign, { t: 'defence', ...p.forces })].filter(Boolean).join(' · ')}</span>}
                  {running && <div className="progress" role="img" aria-label={t('plan.projects.left', { n: running.left })}><span style={{ width: `${((p.weeks - running.left) / p.weeks) * 100}%` }} /></div>}
                  {running && <span className="action-meta">{t('plan.projects.left', { n: running.left })}</span>}
                  {!check.ok && !running && !built && check.reason !== 'none' && <span className="action-reason">{t(`plan.projects.no.${check.reason}` as StringKey)}</span>}
                </div>
                {running ? <button type="button" className="btn small" onClick={() => stop(p.id)}>{t('plan.projects.stop')}</button> : <button type="button" className="btn small" disabled={!check.ok} onClick={() => start(p.id)}>{t('plan.projects.start')}</button>}
              </li>
            );
          })}
        </ul>
      </div>
      {TOOL_GOALS.map((goal) => (
        <div key={goal} className="tool-group">
          <h4>{t(`tools.goal.${goal}` as StringKey)}</h4>
          <ul>
            {TOOLS.filter((x) => x.goal === goal).map((tool) => {
              const check = canUseTool(world, campaign, tool.id);
              return (
                <li key={tool.id} className="action">
                  <div className="grow">
                    <span className="action-title">{t(`tool.${tool.id}` as StringKey)}</span>
                    <span className="action-meta">{t(`tool.${tool.id}.desc` as StringKey)}</span>
                    <span className="action-meta num">{effectsOf(tool.id)}</span>
                    {!check.ok && check.reason !== 'none' && <span className="action-reason">{check.reason === 'wait' ? t('tools.no.wait', { n: check.weeks ?? 0 }) : t(`tools.no.${check.reason}` as StringKey)}</span>}
                  </div>
                  <button type="button" className="btn small" disabled={!check.ok} onClick={() => use(tool.id)}>{t('tools.use')}</button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
