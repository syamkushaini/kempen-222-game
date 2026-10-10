import type { StringKey } from '../i18n/strings';
import { scaled } from '../sim/campaign/actions';
import { adviceFor, canFollow, weeksToWait } from '../sim/campaign/advice';
import { STAFF_NAMES } from '../sim/campaign/staff';
import { ROLE_IDS } from '../sim/campaign/types';
import { useStore } from '../state/store';
import { describeEffect } from './effectText';
import { useFormat, useT, useWorld } from './hooks';
import { Pips } from './TeamTab';

/** What each person the leader has hired suggests: in their own field, what needs mending, what following it does and costs. */
export function TeamAdvice() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const follow = useStore((s) => s.followAdvice);
  if (!campaign.career) return null;
  const hired = ROLE_IDS.filter((_, r) => campaign.team.staff[r]);
  return (
    <section className="advice" aria-label={t('advice.title')}>
      <h3>{t('advice.title')}</h3>
      <p className="muted small action-desc">{t('advice.desc')}</p>
      {hired.length === 0 ? <p className="muted small">{t('advice.nobody')}</p> : (
        <ul className="advice-list">
          {hired.map((role) => {
            const who = campaign.team.staff[ROLE_IDS.indexOf(role)]!;
            const advice = adviceFor(world, campaign, role);
            const check = canFollow(world, campaign, role);
            const wait = weeksToWait(campaign, role);
            const cost = advice && advice.cost > 0 ? t('advice.cost', { rm: f.rm(scaled(world, advice.cost)) }) : t('advice.free');
            const effects = advice?.effects.map((e) => describeEffect(t, f, world, campaign, e)).filter(Boolean).join(' · ');
            return (
              <li key={role} className="action">
                <div className="grow">
                  <span className="action-title">{STAFF_NAMES[who.name]} <Pips n={who.skill} label={t('team.skill', { n: who.skill })} /> <span className="muted small">· {t(`role.${role}`)}</span></span>
                  {advice ? (
                    <>
                      <span className="action-meta">{t(`advice.${advice.id}` as StringKey)}</span>
                      <span className="action-meta num">{effects} · {cost}</span>
                    </>
                  ) : <span className="action-meta muted">{t('advice.none')}</span>}
                  {!check.ok && advice && <span className="action-reason">{check.reason === 'wait' ? t('advice.wait', { n: wait }) : t(`advice.${check.reason}` as StringKey)}</span>}
                </div>
                {advice && <button className="btn small primary" disabled={!check.ok} onClick={() => follow(role)}>{t('advice.follow')}</button>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
