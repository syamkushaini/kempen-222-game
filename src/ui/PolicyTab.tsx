import { useState } from 'react';
import {
  FISCAL_ROOM, fits, ISSUE_GROUPS, manifestoCost, MAX_PLEDGES, PLEDGES, stanceCost, stanceReaction,
} from '../sim/campaign/policy';
import { ISSUE_IDS, PLEDGE_IDS, type PledgeId } from '../sim/campaign/types';
import type { BlocId } from '../sim/types';
import { useStore } from '../state/store';
import { Gauge } from './Gauge';
import { ConfirmButton } from './SavesTab';
import { partyColor, partyShort, useT } from './hooks';

const POSITIONS = [-2, -1, 0, 1, 2];

/** Where the party stands on each issue, where its rivals stand, and what it will promise at the next election. */
export function PolicyTab() {
  const t = useT();
  const campaign = useStore((s) => s.game!.campaign);
  const setStance = useStore((s) => s.setStance);
  const togglePledge = useStore((s) => s.togglePledge);
  const launchManifesto = useStore((s) => s.launchManifesto);
  // A move the player is thinking about: which issue, and where to.
  const [draft, setDraft] = useState<{ issue: number; to: number } | null>(null);

  const k = campaign.career!;
  const me = campaign.player;
  const rivals = campaign.parties.map((pc, p) => (pc && p !== me ? p : -1)).filter((p) => p >= 0);
  const mine = k.manifesto[me];
  const cost = manifestoCost(mine);
  const blocNames = (ids: BlocId[]) => ids.map((b) => t(`bloc.${b}`)).join(', ');

  return (
    <section className="policy">
      <div className="panel-head">
        <h2>{t('policy.title')}</h2>
        <Gauge value={k.credibility} label={t('policy.credibility')} />
      </div>
      <p className="muted small">{t('policy.intro')}</p>

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
                    {POSITIONS.map((pos) => (
                      <button
                        key={pos}
                        className={`pos${pos === here ? ' here' : ''}${pos === moving ? ' moving' : ''}`}
                        aria-pressed={pos === here}
                        aria-label={t('policy.position', { n: pos + 3 })}
                        onClick={() => setDraft(pos === here ? null : { issue: i, to: pos })}
                      >
                        {rivals.filter((p) => k.stances[p][i] === pos).map((p) => (
                          <i key={p} className="dot" title={partyShort(t, p)} style={{ background: partyColor(p) }} />
                        ))}
                      </button>
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
        {rivals.map((p) => <span key={p} className="legend-party"><i className="dot" style={{ background: partyColor(p) }} />{partyShort(t, p)}</span>)}
      </p>

      <h3>{t('manifesto.title')}</h3>
      <p className="muted small action-desc">{t(k.launched ? 'manifesto.launched' : 'manifesto.intro')}</p>
      <dl className="facts orders-facts">
        <div><dt>{t('manifesto.count')}</dt><dd className="num">{mine.length} / {MAX_PLEDGES}</dd></div>
        <div><dt>{t('manifesto.cost')}</dt><dd className={`num ${cost > FISCAL_ROOM ? 'neg' : ''}`}>{cost} / {FISCAL_ROOM}</dd></div>
      </dl>
      {cost > FISCAL_ROOM && <p className="note bad">{t('manifesto.over')}</p>}
      <ul className="demands">
        {PLEDGE_IDS.map((id: PledgeId) => {
          const def = PLEDGES[id];
          const on = mine.includes(id);
          const likes = (Object.entries(def.appeal) as [BlocId, number][]).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([b]) => b);
          const hates = (Object.entries(def.appeal) as [BlocId, number][]).filter(([, v]) => v < 0).map(([b]) => b);
          return (
            <li key={id}>
              <label>
                <input type="checkbox" checked={on} disabled={k.launched || (!on && mine.length >= MAX_PLEDGES)} onChange={() => togglePledge(id)} />
                <span className="grow">
                  <span className="action-title">{t(`pledge.${id}`)}</span>
                  <span className="action-meta">{t('manifesto.line', { cost: def.cost, blocs: blocNames(likes) })}</span>
                  {hates.length > 0 && <span className="action-meta">{t('policy.dislikes', { blocs: blocNames(hates) })}</span>}
                  {!fits(k, me, id) && <span className="action-reason">{t('manifesto.misfit', { issue: t(`issue.${def.needs![0]}`) })}</span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {!k.launched && (
        <div className="button-row">
          <ConfirmButton className="btn" label={t('manifesto.launch')} confirmLabel={t('manifesto.launch.confirm')} onConfirm={launchManifesto} />
        </div>
      )}
    </section>
  );
}
