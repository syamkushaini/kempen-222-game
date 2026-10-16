import type { StringKey } from '../i18n/strings';
import { defenceTargets } from '../sim/campaign/defence';
import { isPm } from '../sim/campaign/office';
import { pestelOf, pestelTargets } from '../sim/campaign/pestel';
import { NOTCHES, STANCES, STANCE_IDS, stanceAvailable, stanceCost, stanceOf, type Notch, type StanceId } from '../sim/campaign/stances';
import { ALLOCATION, MONTH, govMoney } from '../sim/campaign/treasury';
import type { Career } from '../sim/campaign/types';
import { useStore } from '../state/store';
import { START_DEFENCE } from '../sim/campaign/defence';
import { useFormat, useT, useWorld } from './hooks';

/** Where a meter is heading with a slider at a given notch, the rest as they are. */
function heading(k: Career, id: StanceId, notch: Notch): number {
  const probe: Career = { ...k, stance: { ...k.stance, [id]: notch } };
  return id === 'readiness' || id === 'influence' ? defenceTargets(probe)[id] : pestelTargets(probe)[id];
}
const nowOf = (k: Career, id: StanceId): number => (id === 'readiness' || id === 'influence' ? (k.defence ?? START_DEFENCE)[id] : pestelOf(k)[id]);

/**
 * Standing policy for the meters the budget does not reach, as sliders from easing off to pushing hard (see stances.ts). Each says where its
 * meter is heading at the setting, what that costs or saves a month, who it pleases and who it does not, and any price of its own.
 */
export function MeterSliders() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const set = useStore((s) => s.setMeterPolicy);
  if (!campaign.career || campaign.phase !== 'term' || !isPm(campaign)) return null;
  const k = campaign.career;
  const unit = govMoney(world, ALLOCATION.pm) * MONTH;
  return (
    <section className="meter-sliders" aria-label={t('stances.title')}>
      <h3>{t('stances.title')}</h3>
      <p className="muted small action-desc">{t('stances.desc')}</p>
      {STANCE_IDS.filter((id) => stanceAvailable(campaign.scenario, id)).map((id) => {
        const def = STANCES[id];
        const notch = stanceOf(k, id);
        const cost = stanceCost(k, id) * unit;
        const name = t(`stance.${id}` as StringKey);
        const who = (blocs: string[]) => blocs.map((b) => t(`bloc.${b}` as StringKey)).join(', ');
        // What easing off pleases is what pushing displeases, and the other way about.
        const pleased = notch >= 0 ? def.likes : def.dislikes, displeased = notch >= 0 ? def.dislikes : def.likes;
        const growth = (def.growth ?? 0) * notch;
        return (
          <div key={id} className="plan-card stance">
            <div className="result-label">
              <strong>{name}</strong>
              <span className="num muted">{t(`stances.notch.${notch}` as StringKey)}</span>
            </div>
            <p className="muted small">{t(`stance.${id}.desc` as StringKey)}</p>
            <input type="range" min={-2} max={2} step={1} value={notch} aria-label={name} aria-valuetext={t(`stances.notch.${notch}` as StringKey)}
              onChange={(e) => set(id, Number(e.target.value) as Notch)} list={`stance-ticks-${id}`} />
            <datalist id={`stance-ticks-${id}`}>{NOTCHES.map((n) => <option key={n} value={n} />)}</datalist>
            <div className="stance-poles small muted"><span>{t(`stance.${id}.lo` as StringKey)}</span><span>{t(`stance.${id}.hi` as StringKey)}</span></div>
            <p className="small num">
              {t('stances.forecast', { to: Math.round(heading(k, id, notch)), now: Math.round(nowOf(k, id)) })}
              {' · '}{cost < 0 ? t('stances.saves', { rm: f.rm(-cost) }) : t('stances.cost', { rm: f.rm(cost) })}
            </p>
            {notch !== 0 && <p className="small muted">{t('stances.pleases', { who: who(pleased) })} · {t('stances.displeases', { who: who(displeased) })}</p>}
            {notch !== 0 && growth !== 0 && <p className="small muted">{t('stances.price.growth', { sign: `${growth > 0 ? '+' : '−'}${Math.abs(growth).toFixed(2)}` })}</p>}
            {notch > 0 && def.stability && <p className="small muted">{t('stances.price.stability')}</p>}
            {notch > 0 && id === 'influence' && <p className="small muted">{t('stances.price.readiness')}</p>}
          </div>
        );
      })}
    </section>
  );
}
