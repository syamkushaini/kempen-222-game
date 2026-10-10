import type { StringKey } from '../i18n/strings';
import { candidateDeadline, canChoose, HOPEFUL_NAMES, HOPEFUL_TRAITS, liftIn } from '../sim/campaign/candidates';
import { canCourtEndorser, courtChance, courtCost, ENDORSERS, hasEndorsers, holder } from '../sim/campaign/endorsers';
import { scaled } from '../sim/campaign/actions';
import { canVet, STAFF_NAMES, vetCost, wages } from '../sim/campaign/staff';
import { ENDORSER_IDS, ROLE_IDS, STAT_IDS } from '../sim/campaign/types';
import type { BlocId } from '../sim/types';
import { useStore } from '../state/store';
import { leaderName, partyName, partyShort, seatName, useFog, useFormat, useT, useWorld, type T } from './hooks';
import { PartyMark } from './identity';
import { Portrait } from './Portrait';
import { ConfirmButton } from './SavesTab';
import { Gauge } from './Gauge';
import { Term } from './Term';
import { TeamAdvice } from './TeamAdvice';

/** Five pips, some of them filled. */
export function Pips({ n, label }: { n: number; label: string }) {
  return <span className="pips" role="img" aria-label={label}>{'●'.repeat(n)}<span className="muted">{'○'.repeat(Math.max(0, 5 - n))}</span></span>;
}

const pastWord = (t: T, who: { vetted: boolean; skeleton: boolean }) =>
  t(!who.vetted ? 'team.unvetted' : who.skeleton ? 'team.vetted.dirty' : 'team.vetted.clean');
const blocList = (t: T, blocs: string[]) => blocs.map((b) => t(`bloc.${b as BlocId}`)).join(', ');

/** The people around the leader: who they are, who works for them, who stands for them, and who speaks up for them. */
export function TeamTab() {
  const t = useT();
  const fog = useFog();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const hire = useStore((s) => s.hire);
  const dismiss = useStore((s) => s.dismiss);
  const vetStaff = useStore((s) => s.vetStaff);
  const chooseCandidate = useStore((s) => s.chooseCandidate);
  const vetHopeful = useStore((s) => s.vetHopeful);
  const court = useStore((s) => s.courtEndorser);

  const me = campaign.player;
  const team = campaign.team;
  const inCampaign = campaign.phase === 'campaign';
  const vet = vetCost(world, campaign);
  const vetLabel = vet.days > 0 ? f.days(vet.days) : f.rm(vet.money);
  const mayVet = canVet(world, campaign);
  const choosing = canChoose(campaign);
  const story = team.leader.backstory;

  return (
    <section className="orders team">

      <div className="leader-card">
        <Portrait leader={me} size={64} />
        <div className="grow">
          <span className="action-title">{leaderName(t, me)}</span>
          <span className="action-meta"><PartyMark party={me} size={16} /> {partyName(t, me)} · {t(story ? `backstory.${story}` : 'backstory.none')}</span>
          <span className="action-meta">{t(story ? `backstory.${story}.desc` : 'leader.ordinary')}</span>
        </div>
      </div>
      {/* how well the party holds together: between elections this is the place to watch it */}
      <Gauge value={campaign.parties[me]!.unity} label={<Term id="unity">{t('term.unity')}</Term>} />
      <dl className="facts orders-facts stats">
        {STAT_IDS.map((id, i) => (
          <div key={id} title={t(`stat.${id}.desc`)}>
            <dt>{t(`stat.${id}`)}</dt>
            <dd><Pips n={team.leader.stats[i]} label={`${team.leader.stats[i]} / 5`} /></dd>
          </div>
        ))}
      </dl>

      <TeamAdvice />

      <h3>{t('team.staff')}</h3>
      <p className="muted small action-desc">{t('team.staff.desc', { cost: vetLabel })} {t('team.staff.rivals')}</p>
      {ROLE_IDS.map((role, r) => {
        const held = team.staff[r];
        return (
          <div key={role} className="role">
            <p className="role-head">
              <strong>{t(`role.${role}`)}</strong>
              <span className="muted small"> · {t(`role.${role}.does`)}</span>
            </p>
            <ul>
              {team.pool[r].map((who, i) => {
                const inPost = held?.name === who.name;
                return (
                  <li key={who.name} className={inPost ? 'action chosen' : 'action'}>
                    <div className="grow">
                      <span className="action-title">{STAFF_NAMES[who.name]} <Pips n={who.skill} label={t('team.skill', { n: who.skill })} /></span>
                      <span className="action-meta num">
                        {t('team.wage', { rm: f.rm(scaled(world, 4_000 * who.skill) * (campaign.phase === 'term' ? 0.25 : 1)) })} · <span className={who.vetted && who.skeleton ? 'neg' : ''}>{pastWord(t, who)}</span>
                        {inPost && <> · <strong>{t('team.inPost')}</strong></>}
                      </span>
                    </div>
                    <div className="row-buttons">
                      {inPost
                        ? <ConfirmButton label={t('team.dismiss')} confirmLabel={t('saves.confirm')} onConfirm={() => dismiss(role)} />
                        : <button className="btn small primary" onClick={() => hire(role, i)} aria-label={`${t('team.hire')}: ${STAFF_NAMES[who.name]}`}>{t('team.hire')}</button>}
                      {!who.vetted && <button className="btn small" disabled={!mayVet} onClick={() => vetStaff(role, i)} aria-label={`${t('team.vet')}: ${STAFF_NAMES[who.name]}`}>{t('team.vet')}</button>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {wages(world, campaign) > 0 && <p className="note">{t('team.wages', { rm: f.rm(wages(world, campaign)) })}</p>}
      {campaign.team.unpaid && <p className="note bad">{t('team.unpaid')}</p>}

      {inCampaign && (
        <>
          <h3>{t('team.candidates')}</h3>
          <p className="muted small action-desc">
            {team.keySeats.length === 0 ? t('team.candidates.none') : choosing ? t('team.candidates.desc', { n: candidateDeadline(campaign) }) : t('team.candidates.closed')}
          </p>
          {team.keySeats.map((key) => (
            <div key={key.seat} className="role">
              <p className="role-head"><strong>{seatName(world, key.seat)}</strong>{key.blown && <span className="badge marginal"> {t('team.blown')}</span>}</p>
              <ul>
                {key.options.map((h, i) => {
                  const lift = liftIn(world, key, i);
                  const level = lift >= 0.1 ? 3 : lift >= 0.06 ? 2 : 1;
                  const picked = key.pick === i;
                  return (
                    <li key={i} className={picked ? 'action chosen' : 'action'}>
                      <div className="grow">
                        <span className="action-title">{HOPEFUL_NAMES[h.name]} <span className="muted small">· {t(`hopeful.${h.kind}`)}</span></span>
                        <span className="action-meta">{t(`hopeful.${h.kind}.desc`)}</span>
                        <span className="action-meta">{[HOPEFUL_TRAITS[h.name].woman ? t('trait.woman') : '', HOPEFUL_TRAITS[h.name].young ? t('trait.young') : '', t(`trait.${HOPEFUL_TRAITS[h.name].ethnic}`)].filter(Boolean).join(' · ')}</span>
                        <span className="action-meta num">
                          {t(`team.lift.${level}`)} · <span className={h.vetted && h.skeleton ? 'neg' : ''}>{pastWord(t, h)}</span>
                          {key.pick !== null && <> · <strong>{t(picked ? 'team.chosen' : 'team.passed')}</strong></>}
                        </span>
                      </div>
                      {key.pick === null && choosing && (
                        <div className="row-buttons">
                          <ConfirmButton label={t('team.choose')} name={`${t('team.choose')}: ${HOPEFUL_NAMES[h.name]}`} confirmLabel={t('saves.confirm')} onConfirm={() => chooseCandidate(key.seat, i)} />
                          {!h.vetted && <button className="btn small" disabled={!mayVet} onClick={() => vetHopeful(key.seat, i)} aria-label={`${t('team.vet')}: ${HOPEFUL_NAMES[h.name]}`}>{t('team.vet')}</button>}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </>
      )}

      {inCampaign && hasEndorsers(world) && (
        <>
          <h3>{t('team.endorsers')}</h3>
          <p className="muted small action-desc">{t('team.endorsers.desc')}</p>
          <ul>
            {ENDORSER_IDS.map((id) => {
              const def = ENDORSERS[id];
              const has = holder(campaign, id);
              const check = canCourtEndorser(world, campaign, id);
              const cost = courtCost(world, id);
              const likes = Object.entries(def.lift).filter(([, v]) => v > 0).map(([b]) => b);
              const dislikes = Object.entries(def.lift).filter(([, v]) => v < 0).map(([b]) => b);
              return (
                <li key={id} className={has === me ? 'action chosen' : 'action'}>
                  <div className="grow">
                    <span className="action-title">{t(`endorser.${id}`)}</span>
                    <span className="action-meta">{t(`endorser.${id}.desc`)}</span>
                    <span className="action-meta">
                      {t('team.moves', { blocs: blocList(t, likes) })}{dislikes.length > 0 && <> · {t('team.putsOff', { blocs: blocList(t, dislikes) })}</>}
                    </span>
                    <span className="action-meta num">
                      <strong>{has === null ? t('team.endorser.free') : has === me ? t('team.endorser.yours') : t('team.endorser.theirs', { party: partyShort(t, has) })}</strong>
                      {has === null && <> · {f.days(cost.days)}{cost.money > 0 && <> · {f.rm(cost.money)}</>} {!fog && <> · {t('team.court.chance', { pct: f.pct(courtChance(campaign, id), 0) })}</>}</>}
                    </span>
                    {has === null && !check.ok && check.reason !== 'taken' && <span className="action-reason">{t(`reason.${check.reason}` as StringKey)}</span>}
                  </div>
                  {has === null && (
                    <button className="btn small primary" disabled={!check.ok} onClick={() => court(id)} aria-label={`${t('team.court')}: ${t(`endorser.${id}`)}`}>{t('team.court')}</button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
