import { headingFor, steeringFacts } from '../sim/campaign/economyFacts';
import { useStore } from '../state/store';
import { useT } from './hooks';
import { Fold } from './Fold';

/** Why a country's economy is hard to steer, in the numbers it runs on, and where it is heading now. */
export function EconomyReality() {
  const t = useT();
  const k = useStore((s) => s.game!.campaign.career!);
  const facts = steeringFacts();
  const { now, to } = headingFor(k);
  const gap = to - now;
  return (
    <Fold title={t('econ.hard.title')} open>
      <ul className="hard-list">
        <li>{t('econ.hard.slow', { pull: facts.pull, half: facts.half, most: facts.most })}</li>
        <li>{t('econ.hard.world', { shock: facts.shockYears, min: facts.shockMin, max: facts.shockMax, fade: facts.fade })}</li>
        <li>{t('econ.hard.small', { best: facts.best.toFixed(1), wait: facts.wait })}</li>
      </ul>
      <p className="small">
        {Math.abs(gap) < 0.3
          ? t('econ.hard.steady', { now: now.toFixed(1) })
          : t(gap > 0 ? 'econ.hard.rising' : 'econ.hard.falling', { now: now.toFixed(1), to: to.toFixed(1), half: facts.half })}
      </p>
    </Fold>
  );
}
