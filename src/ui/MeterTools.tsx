import type { StringKey } from '../i18n/strings';
import { TOOLS, canUseTool } from '../sim/campaign/econTools';
import { isFederal } from '../sim/campaign/defence';
import { DEFENCE_GOALS, METER_GOALS } from '../sim/campaign/meterTools';
import { isPm } from '../sim/campaign/office';
import { pestelScores } from '../sim/campaign/pestel';
import { useStore } from '../state/store';
import { MeterSliders } from './MeterSliders';
import { describeEffect } from './effectText';
import { useFormat, useT, useWorld } from './hooks';

/**
 * What the head of government can do about the meters the budget does not reach: three acts for each (cheap and quiet, costly and strong,
 * risky), shown with what they do and cost before they are used, and the weeks they must rest after. The armed forces' two are a country's only.
 */
export function MeterTools() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const use = useStore((s) => s.useTool);
  if (!campaign.career || campaign.phase !== 'term' || !isPm(campaign)) return null;
  const scores = pestelScores(campaign.career);
  const federal = isFederal(campaign.scenario);
  const effectsOf = (id: string) => TOOLS.find((x) => x.id === id)!.effects.map((e) => describeEffect(t, f, world, campaign, e)).filter(Boolean).join(' · ');
  return (
    <section className="econ-tools meter-tools" aria-label={t('meters.tools.title')}>
      <MeterSliders />
      <details className="meter-acts">
      <summary><strong>{t('stances.acts')}</strong> · {t('meters.tools.title')}</summary>
      <p className="muted small action-desc">{t('meters.tools.desc')}</p>
      {METER_GOALS.filter((goal) => federal || !DEFENCE_GOALS.includes(goal)).map((goal) => (
        <div key={goal} className="tool-group">
          <h4>{t(`tools.goal.${goal}` as StringKey)} <span className="num muted small">{Math.round(scores[goal])}</span></h4>
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
      </details>
    </section>
  );
}
