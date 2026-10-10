import { useState } from 'react';
import {
  BRIEF, FISCAL_ROOM, fits, isBrief, isEnacted, ISSUE_GROUPS, manifestoCost, MAX_PLEDGES, PLEDGES, stanceCost, stanceReaction,
} from '../sim/campaign/policy';
import { ISSUE_IDS, PLEDGE_IDS, type IssueId, type PledgeId } from '../sim/campaign/types';
import { LETTER, TONES, canWrite, letterWait } from '../sim/campaign/letters';
import { agenda, canRepeal } from '../sim/campaign/govern';
import { govMoney } from '../sim/campaign/treasury';
import { REFERENDUM, canReferendum, isContested, referendumOdds } from '../sim/campaign/courts';

import type { BlocId } from '../sim/types';
import type { StringKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { Gauge } from './Gauge';
import { ConfirmButton } from './SavesTab';
import { partyColor, partyShort, useFormat, useT, useWorld } from './hooks';
import { Brief } from './Brief';

const POSITIONS = [-2, -1, 0, 1, 2];

/** Where the party stands on each issue, where its rivals stand, and what it will promise at the next election. */
export function PolicyTab() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const setBrief = useStore((s) => s.setBrief);
  const writeLetter = useStore((s) => s.writeLetter);
  const [letterIssue, setLetterIssue] = useState<IssueId>('wages');
  const referendum = useStore((s) => s.referendum);
  const setStance = useStore((s) => s.setStance);
  const togglePledge = useStore((s) => s.togglePledge);
  const repeal = useStore((s) => s.repeal);
  const launchManifesto = useStore((s) => s.launchManifesto);
  // A move the player is thinking about: which issue, and where to.
  const [draft, setDraft] = useState<{ issue: number; to: number } | null>(null);

  const k = campaign.career!;
  const me = campaign.player;
  const rivals = campaign.parties.map((pc, p) => (pc && p !== me ? p : -1)).filter((p) => p >= 0);
  const mine = k.manifesto[me];
  const cost = manifestoCost(mine, k.brief);
  const blocNames = (ids: BlocId[]) => ids.map((b) => t(`bloc.${b}`)).join(', ');

  return (
    <section className="policy">
      <div className="panel-head">
        <h2>{t('policy.title')}</h2>
        <Gauge value={k.credibility} label={t('policy.credibility')} />
      </div>
      <Brief text={t('policy.intro')} />

      {ISSUE_GROUPS.map(({ group, issues }) => (
        <div key={group}>
          <h3>{t(`issueGroup.${group}`)}</h3>
          <ul className="issue-list">
            {issues.map((id) => {
              const i = ISSUE_IDS.indexOf(id);
              const here = k.stances[me][i];
              const moving = draft?.issue === i ? draft.to : null;
              const price = moving !== null ? stanceCost(campaign, i, moving) : null;
              const reaction = moving !== null ? stanceReaction(k, i, here, moving) : [];
              const hot = k.salience[i] > 1.15;
              return (
                <li key={id} className="issue">
                  <div className="issue-head">
                    <span className="action-title">{t(`issue.${id}`)}{hot && <span className="badge marginal"> {t('policy.hot')}</span>}</span>
                  </div>
                  <div className="issue-scale" role="group" aria-label={t(`issue.${id}`)}>
                    <span className="pole">{t(`issue.${id}.lo`)}</span>
                    <input
                      type="range" className="issue-slider" min={-2} max={2} step={1} value={moving ?? here}
                      aria-label={t(`issue.${id}`)} aria-valuetext={t('policy.position', { n: (moving ?? here) + 3 })}
                      onChange={(e) => { const pos = Number(e.target.value); setDraft(pos === here ? null : { issue: i, to: pos }); }}
                    />
                    {POSITIONS.map((pos) => (
                      <span key={pos} className={`pos${pos === here ? ' here' : ''}${pos === moving ? ' moving' : ''}`}>
                        {rivals.filter((p) => k.stances[p][i] === pos).map((p) => (
                          <i key={p} className="dot" title={partyShort(t, p)} data-party={p} style={{ background: partyColor(p) }} />
                        ))}
                      </span>
                    ))}
                    <span className="pole right">{t(`issue.${id}.hi`)}</span>
                  </div>
                  {price && moving !== null && (
                    <div className="note">
                      <p>
                        {t('policy.cost', { cred: price.credibility })}
                        {price.unity > 0 && ` ${t('policy.cost.unity', { n: price.unity })}`}
                      </p>
                      {reaction.some((r) => r.change > 0) && <p>{t('policy.likes', { blocs: blocNames(reaction.filter((r) => r.change > 0).slice(0, 4).map((r) => r.bloc)) })}</p>}
                      {reaction.some((r) => r.change < 0) && <p>{t('policy.dislikes', { blocs: blocNames(reaction.filter((r) => r.change < 0).reverse().slice(0, 4).map((r) => r.bloc)) })}</p>}
                      <div className="button-row tight">
                        <button className="btn small primary" onClick={() => { setStance(i, moving); setDraft(null); }}>{t('policy.move')}</button>
                        <button className="btn small" onClick={() => setDraft(null)}>{t('policy.cancel')}</button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <p className="muted small">
        {t('policy.legend')}{' '}
        {rivals.map((p) => <span key={p} className="legend-party"><i className="dot" data-party={p} style={{ background: partyColor(p) }} />{partyShort(t, p)}</span>)}
      </p>

      <h3>{t('letter.title')}</h3>
      <p className="muted small action-desc">{t('letter.desc', { n: LETTER.every })}</p>
      <div className="chips" role="group" aria-label={t('letter.issue')}>
        {ISSUE_IDS.map((id) => <button key={id} className={letterIssue === id ? 'chip active' : 'chip'} aria-pressed={letterIssue === id} onClick={() => setLetterIssue(id)}>{t(`issue.${id}`)}</button>)}
      </div>
      <div className="button-row tight">
        {TONES.map((tone) => (
          <button key={tone} className="btn small" disabled={!canWrite(campaign, letterIssue).ok} onClick={() => writeLetter(letterIssue, tone)}>{t(`letter.${tone}` as StringKey)}</button>
        ))}
      </div>
      {letterWait(campaign) > 0 && <p className="muted small">{t('letter.wait', { n: letterWait(campaign) })}</p>}

      <h3>{t('manifesto.title')}</h3>
      <Brief className="muted small action-desc" text={t(k.launched ? 'manifesto.launched' : 'manifesto.intro')} />
      <dl className="facts orders-facts">
        <div><dt>{t('manifesto.count')}</dt><dd className="num">{mine.length} / {MAX_PLEDGES}</dd></div>
        <div><dt>{t('manifesto.cost')}</dt><dd className={`num ${cost > FISCAL_ROOM ? 'neg' : ''}`}>{cost} / {FISCAL_ROOM}</dd></div>
      </dl>
      {cost > FISCAL_ROOM && <p className="note bad">{t('manifesto.over')}</p>}
      <ul className="demands">
        {PLEDGE_IDS.map((id: PledgeId) => {
          const def = PLEDGES[id];
          const on = mine.includes(id);
          const enacted = isEnacted(k, id);
          const likes = (Object.entries(def.appeal) as [BlocId, number][]).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([b]) => b);
          const hates = (Object.entries(def.appeal) as [BlocId, number][]).filter(([, v]) => v < 0).map(([b]) => b);
          return (
            <li key={id}>
              <label>
                <input type="checkbox" checked={on} disabled={k.launched || enacted || (!on && mine.length >= MAX_PLEDGES)} onChange={() => togglePledge(id)} />
                <span className="grow">
                  <span className="action-title">{t(`pledge.${id}`)}{def.law && <span className="badge plain" title={t('manifesto.lawNote')}>{t('manifesto.law')}</span>}{def.amend && <span className="badge plain" title={t('manifesto.amendNote')}>{t('manifesto.amend')}</span>}</span>
                  <span className="action-meta">{t('manifesto.line', { cost: def.cost, blocs: blocNames(likes) })}</span>
                  {hates.length > 0 && <span className="action-meta">{t('policy.dislikes', { blocs: blocNames(hates) })}</span>}
                  {enacted && <span className="action-meta">{t('manifesto.enacted')}</span>}
                  {Object.entries(k.copied ?? {}).some(([, l]) => l.includes(id)) && <span className="action-meta">{t('manifesto.copied', { parties: Object.entries(k.copied ?? {}).filter(([, l]) => l.includes(id)).map(([p]) => partyShort(t, Number(p))).join(', ') })}</span>}
                  {!enacted && !fits(k, me, id) && <span className="action-reason">{t('manifesto.misfit', { issue: t(`issue.${def.needs![0]}`) })}</span>}
                </span>
              </label>
              {on && !k.launched && !enacted && (
                <div className="button-row tight">
                  <button className={isBrief(k, id) ? 'chip' : 'chip active'} aria-pressed={!isBrief(k, id)} onClick={() => setBrief(id, false)}>{t('manifesto.full')}</button>
                  <button className={isBrief(k, id) ? 'chip active' : 'chip'} aria-pressed={isBrief(k, id)} onClick={() => setBrief(id, true)}>{t('manifesto.brief')}</button>
                </div>
              )}
              {on && k.launched && isBrief(k, id) && <span className="action-meta">{t('manifesto.briefNote')}</span>}
            </li>
          );
        })}
      </ul>
      {!k.launched && <p className="muted small">{t('manifesto.briefDesc', { pct: Math.round(BRIEF.share * 100) })}</p>}
      {campaign.phase === 'term' && agenda(campaign).some((b) => b.startsWith('pledge:') && isContested(b.slice(7) as PledgeId)) && (
        <>
          <h4>{t('referendum.title')}</h4>
          <p className="muted small action-desc">{t('referendum.desc', { rm: f.rm(govMoney(world, REFERENDUM.money)) })}</p>
          <ul className="plain-list">
            {agenda(campaign).filter((b) => b.startsWith('pledge:') && isContested(b.slice(7) as PledgeId)).map((b) => {
              const id = b.slice(7) as PledgeId;
              const check = canReferendum(world, campaign, id);
              return (
                <li key={id}>
                  {t(`pledge.${id}`)} <span className="muted small num">{t('referendum.odds', { pct: Math.round(referendumOdds(world, campaign, id) * 100) })}</span>{' '}
                  <ConfirmButton className="btn small" label={t('referendum.call')} confirmLabel={t('manifesto.repeal.confirm')} onConfirm={() => referendum(id)} />
                  {!check.ok && <span className="action-reason"> {t(`referendum.no.${check.reason}` as StringKey)}</span>}
                </li>
              );
            })}
          </ul>
        </>
      )}
      <h4>{t('manifesto.lawsTitle')}</h4>
      {(k.laws?.length ?? 0) === 0
        ? <p className="muted small">{t('manifesto.lawsNone')}</p>
        : <ul className="plain-list">{k.laws!.map((id) => (
          <li key={id}>{t(`pledge.${id}`)}{canRepeal(campaign, id) && <> <ConfirmButton className="btn small" label={t('manifesto.repeal')} confirmLabel={t('manifesto.repeal.confirm')} onConfirm={() => repeal(id)} /></>}</li>
        ))}</ul>}
      {!k.launched && (
        <div className="button-row">
          <ConfirmButton className="btn" label={t('manifesto.launch')} confirmLabel={t('manifesto.launch.confirm')} onConfirm={launchManifesto} />
        </div>
      )}
    </section>
  );
}
