import { useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { actionCost, canDo, scaled } from '../sim/campaign/actions';
import { CHALLENGE } from '../sim/campaign/challengePolicy';
import { COMMITTEE, OPP_METHODS, SHADOW_POSTS, canChallengeHere, canShadowHere, challengeChance, namedCount } from '../sim/campaign/opposition';
import { ministerName } from '../sim/campaign/office';
import { SHADOW_COST } from '../sim/campaign/shadow';
import { now } from '../sim/campaign/news';
import type { ActionId } from '../sim/campaign/types';
import { PARTY_IDS } from '../sim/types';
import { useStore } from '../state/store';
import { partyName, useFormat, useT, useWorld } from './hooks';
import { Icon, type IconName } from './Icon';
import { NewsLine } from './NewsTab';

/** What an opposition does in a week of the years between elections: the work that mends and keeps a party, and nothing of a campaign's. */
const ROUTINE: { id: ActionId; icon: IconName }[] = [
  { id: 'regroup', icon: 'people' }, { id: 'listen', icon: 'walk' }, { id: 'scrutiny', icon: 'chat' },
  { id: 'conference', icon: 'people' }, { id: 'social', icon: 'phone' }, { id: 'crowdfund', icon: 'heart' },
];

/**
 * The desk of a party in opposition, for the years before it stands again: how the party is, what it can do this week, and what the week brought.
 * It replaces the campaign screen (no map, no seats, no rallies) until the election campaign begins.
 */
export function OppositionDesk() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const act = useStore((s) => s.act);
  const clearStage = useStore((s) => s.clearStage);
  const shadow = useStore((s) => s.oppShadow);
  const committee = useStore((s) => s.oppCommittee);
  const challenge = useStore((s) => s.oppChallenge);
  const opp = campaign.opposition;
  const me = campaign.parties[campaign.player]!;
  const rivals = PARTY_IDS.map((_, i) => i).filter((i) => i !== campaign.player && campaign.parties[i]);
  const [rival, setRival] = useState<number>(rivals[0] ?? 0);
  const year = Math.floor((campaign.week - 1) / 52) + 1;
  const left = (campaign.rebuild ?? 0) - campaign.week + 1;
  const latest = campaign.news.filter((n) => n.week >= now(campaign) - 1).slice(-8).reverse();
  const branches = me.machinery.reduce((a, b) => a + b, 0);

  const row = (id: ActionId, icon: IconName) => {
    const target = id === 'scrutiny' ? { party: rival } : {};
    const check = canDo(world, campaign, campaign.player, id, target);
    const cost = actionCost(world, campaign, campaign.player, id, target);
    const why = check.ok ? null : check.reason === 'usedThisWeek' ? t('opp.done') : check.reason === 'funds' ? t('opp.nofunds') : check.reason === 'days' ? t('opp.nodays') : null;
    return (
      <li key={id} className="desk-card">
        <span className="row-icon"><Icon name={icon} size={20} /></span>
        <div className="grow">
          <span className="action-title">{t(`action.${id}` as StringKey)}</span>
          <span className="muted small action-desc">{t(`action.${id}.desc` as StringKey)}</span>
          <span className="action-meta">{cost.days} {t('opp.days')} · {cost.money > 0 ? f.rm(cost.money) : t('opp.free')}{why ? ` · ${why}` : ''}</span>
          {id === 'scrutiny' && (
            <label className="field">
              <span className="muted small">{t('opp.rival')}</span>
              <select value={rival} onChange={(e) => setRival(Number(e.target.value))}>
                {rivals.map((i) => <option key={i} value={i}>{partyName(t, i)}</option>)}
              </select>
            </label>
          )}
        </div>
        <button className="btn small" disabled={!check.ok} onClick={() => { act(id, target); clearStage(); }}>{t('opp.do')}</button>
      </li>
    );
  };

  return (
    <section className="desk opposition-desk">
      <header className="panel-head">
        <h2>{t('opp.title', { y: year })}</h2>
      </header>
      <p className="note">{t('opp.note', { left: Math.max(0, left), y: Math.floor(Math.max(0, left) / 52) })}</p>
      <dl className="facts">
        <div><dt>{t('hud.funds')}</dt><dd>{f.rm(me.funds)}</dd></div>
        <div><dt>{t('hud.days')}</dt><dd>{me.days}</dd></div>
        <div><dt>{t('opp.unity')}</dt><dd>{Math.round(me.unity)}%</dd></div>
        <div><dt>{t('opp.branches')}</dt><dd>{Math.round(branches)}</dd></div>
      </dl>
      <h3>{t('opp.week')}</h3>
      <ul className="desk-list">{ROUTINE.map((r) => row(r.id, r.icon))}</ul>
      {opp && (
        <>
          <p className="note">{t('opp.govt', { party: partyName(t, opp.govt), cred: Math.round(opp.credibility), dossier: Math.round(opp.dossier) })}</p>
          <ul className="desk-list">
            <li className="desk-card">
              <span className="row-icon"><Icon name="doc" size={20} /></span>
              <div className="grow">
                <span className="action-title">{t('opp.committee')}</span>
                <span className="muted small action-desc">{t('opp.committee.desc', { n: COMMITTEE.dossier })}</span>
                <span className="action-meta">{COMMITTEE.days} {t('opp.days')} · {t('opp.free')}{opp.used.includes('committee') ? ` · ${t('opp.done')}` : ''}</span>
              </div>
              <button className="btn small" disabled={opp.used.includes('committee') || me.days < COMMITTEE.days} onClick={() => committee()}>{t('opp.do')}</button>
            </li>
          </ul>
          <h3>{t('opp.challenge.title')}</h3>
          <p className="muted small action-desc">{t('opp.challenge.desc', { weeks: CHALLENGE.every })}</p>
          <ul className="desk-list">
            {opp.policies.map((id) => (
              <li className="desk-card" key={id}>
                <div className="grow">
                  <span className="action-title">{t(`pledge.${id}` as StringKey)}</span>
                  {opp.challenged.includes(id) && <span className="action-meta">{t('opp.challenged')}</span>}
                </div>
                {OPP_METHODS.map((m) => {
                  const check = canChallengeHere(world, campaign, id, m);
                  const why = check.ok ? '' : t(`opp.why.${check.reason}` as StringKey);
                  return (
                    <button key={m} className="btn small" disabled={!check.ok} title={why} onClick={() => challenge(id, m)}>
                      {t(`opp.method.${m}` as StringKey)} · {Math.round(challengeChance(world, campaign, id, m) * 100)}%
                    </button>
                  );
                })}
              </li>
            ))}
          </ul>
          <h3>{t('shadow.title')} <span className="muted small num">{namedCount(opp)} / {SHADOW_POSTS.length}</span></h3>
          <p className="muted small action-desc">{t('shadow.desc', { rm: f.rm(scaled(world, SHADOW_COST)) })}</p>
          <ul className="desk-list">
            {SHADOW_POSTS.map((post) => {
              const who = opp.shadow[post];
              return (
                <li className="desk-card" key={post}>
                  <div className="grow">
                    <span className="action-title">{t(`portfolio.${post}` as StringKey)}</span>
                    <span className="action-meta">{who ? <>{ministerName(who)} <span aria-label={t('house.skill', { n: who.skill })}>{'★'.repeat(who.skill)}{'☆'.repeat(5 - who.skill)}</span></> : t('shadow.empty')}</span>
                  </div>
                  <button className="btn small" disabled={!canShadowHere(world, campaign)} onClick={() => shadow(post)}>{t(who ? 'shadow.replace' : 'shadow.name')}</button>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <h3>{t('opp.news')}</h3>
      <ul className="news-list">
        {latest.length === 0 ? <li className="muted small">{t('opp.quiet')}</li> : latest.map((n, i) => <NewsLine key={i} item={n} />)}
      </ul>
    </section>
  );
}
