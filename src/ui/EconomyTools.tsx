import type { StringKey } from '../i18n/strings';
import { TOOLS, TOOL_GOALS, canUseTool, rateOf } from '../sim/campaign/econTools';
import { isPm } from '../sim/campaign/office';
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
  if (!campaign.career || campaign.phase !== 'term' || !isPm(campaign)) return null;
  const rate = rateOf(campaign);
  const effectsOf = (id: string) => TOOLS.find((x) => x.id === id)!.effects.map((e) => describeEffect(t, f, world, campaign, e)).filter(Boolean).join(' · ');
  return (
    <section className="econ-tools" aria-label={t('tools.title')}>
      <h3>{t('tools.title')}</h3>
      <p className="muted small action-desc">{t('tools.desc')}</p>
      <div className="rate-row">
        <div className="grow">
          <span className="action-title">{t('tools.rate')}</span>
          <span className="action-meta">{t(`tools.rate.${rate}` as StringKey)}</span>
        </div>
        <div className="segmented small" role="group" aria-label={t('tools.rate')}>
          {([-1, 0, 1] as const).map((d) => (
            <button key={d} type="button" className={rate === d ? 'active' : ''} aria-pressed={rate === d} onClick={() => setRate(d)}>{t(`tools.rate.btn.${d}` as StringKey)}</button>
          ))}
        </div>
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
