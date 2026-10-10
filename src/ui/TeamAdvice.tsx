import type { StringKey } from '../i18n/strings';
import { scaled } from '../sim/campaign/actions';
import { managerDays, pollDiscount, pollPrecision, skill } from '../sim/campaign/perks';
import { adviceFor, canFollow, weeksToWait } from '../sim/campaign/advice';
import { STAFF_NAMES } from '../sim/campaign/staff';
import { ROLE_IDS } from '../sim/campaign/types';
import { useStore } from '../state/store';
import { describeEffect } from './effectText';
import { useFormat, useT, useWorld } from './hooks';
import { Pips } from './TeamTab';

/** What the people hired give the leader, in figures: the days, the discounts and the lifts that the game applies. Nothing if the team has not been paid. */
export function TeamEffects() {
  const t = useT();
  const campaign = useStore((s) => s.game!.campaign);
  const me = campaign.player;
  const hired = ROLE_IDS.filter((_, r) => campaign.team.staff[r]);
  const pct = (x: number) => Math.round(x * 100);
  const line = (role: (typeof ROLE_IDS)[number]): string => {
    const s = skill(campaign, me, role);
    switch (role) {
      case 'manager': return t('teamfx.manager', { days: managerDays(campaign, me), pct: pct(0.08 * s) });
      case 'strategist': return t('teamfx.strategist', { cost: pct(1 - pollDiscount(campaign)), err: pct(1 - pollPrecision(campaign)), dos: pct(0.1 * s) });
      case 'media': return t('teamfx.media', { pct: pct(0.1 * s), gaffe: Math.round(2.5 * s * 10) / 10 });
      case 'treasurer': return t('teamfx.treasurer', { pct: pct(0.1 * s), inc: pct(0.07 * s) });
    }
  };
  return (
    <section className="teamfx" aria-label={t('teamfx.title')}>
      <h3>{t('teamfx.title')}</h3>
      {hired.length === 0 ? <p className="muted small">{t('teamfx.none')}</p> : (
        <>
          {campaign.team.unpaid && <p className="note bad">{t('teamfx.unpaid')}</p>}
          <ul className="teamfx-list">
            {hired.map((role) => <li key={role}><strong>{t(`role.${role}`)}</strong><span className="muted small">{line(role)}</span></li>)}
          </ul>
        </>
      )}
    </section>
  );
}

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
