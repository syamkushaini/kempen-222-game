import { useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { scaled } from '../sim/campaign/actions';
import {
  beforeNomination, canCourt, STAKES, type Stake, canJointAttack, canMeet, canPromise, canTalk, COST, courtChance, inPact,
  nominationWeek, others, relation, type DiploRefusal,
} from '../sim/campaign/diplomacy';
import { useStore } from '../state/store';
import { LEADER_STATS } from '../sim/campaign/cast';
import { STAT_IDS } from '../sim/campaign/types';
import { PARTY_IDS } from '../sim/types';
import { Gauge } from './Gauge';
import { Pips } from './TeamTab';
import { ConfirmButton } from './SavesTab';
import { leaderName, partyShort, relationWord, useFog, useFormat, useT, useWorld } from './hooks';
import { Portrait } from './Portrait';
import { PactTalks } from './PactTalks';
import { Brief } from './Brief';
import { RelationMap } from './RelationMap';

type Check = { ok: true } | { ok: false; reason: DiploRefusal };

/** One thing the player can do with another leader: what it costs, why not, and the button. */
function Move(props: { title: string; meta: string; check: Check; onGo(): void; children?: React.ReactNode }) {
  const t = useT();
  return (
    <li className="action">
      <div className="grow">
        <span className="action-title">{props.title}</span>
        <span className="action-meta num">{props.meta}</span>
        {props.children}
        {!props.check.ok && props.check.reason !== 'none' && <span className="action-reason">{t(`deals.reason.${props.check.reason}` as StringKey)}</span>}
      </div>
      <button className="btn small primary" disabled={!props.check.ok} onClick={props.onGo} aria-label={`${t('actions.go')}: ${props.title}`}>{t('actions.go')}</button>
    </li>
  );
}

/** Dealings with the other party leaders during the campaign: tea, pacts, promises, joint attacks and defections. */
export function DiplomacyTab() {
  const t = useT();
  const fog = useFog();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const selectedSeat = useStore((s) => s.selectedSeat);
  const meet = useStore((s) => s.meet);
  const promise = useStore((s) => s.promise);
  const jointAttack = useStore((s) => s.jointAttack);
  const breakPact = useStore((s) => s.breakPact);
  const court = useStore((s) => s.court);
  const clearPactReply = useStore((s) => s.clearPactReply);

  const [open, setOpen] = useState<number | null>(null);
  const [talking, setTalking] = useState<number | null>(null);
  const [targets, setTargets] = useState<Record<number, number>>({});
  const [stake, setStake] = useState<Stake>(1);

  const me = campaign.player;
  const pc = campaign.parties[me]!;
  const leaders = others(campaign, me);
  const area = world.rules.kind === 'general' ? 'general' : 'state';

  if (talking !== null) return <PactTalks party={talking} onClose={() => { clearPactReply(); setTalking(null); }} />;

  const seat = selectedSeat ? world.seats[world.seatIndex.get(selectedSeat)!] : null;
  const courtCheck = canCourt(world, campaign, selectedSeat, stake);
  const holder = seat ? seat.last.votes.indexOf(Math.max(...seat.last.votes)) : -1;

  return (
    <section className="deals">
      <div className="panel-head">
        <h2>{t('deals.title')}</h2>
        <Gauge value={pc.unity} label={t('deals.unity')} />
      </div>
      <Brief text={t('deals.intro')} />
      <p className="note">
        {beforeNomination(campaign) ? t('deals.nomination', { n: nominationWeek(campaign) }) : t('deals.nominated')}
      </p>

      <RelationMap />

      <ul className="leader-list">
        {leaders.map((p) => {
          const rel = relation(campaign, me, p);
          const pact = inPact(campaign, me, p);
          const foes = leaders.filter((q) => q !== p);
          const target = targets[p] !== undefined && foes.includes(targets[p]) ? targets[p] : foes[0];
          const stoodAside = Object.values(campaign.standDowns).filter((s) => s[me] === p || s[p] === me).length;
          return (
            <li key={p} className={open === p ? 'leader open' : 'leader'}>
              <button className="leader-head" aria-expanded={open === p} onClick={() => setOpen(open === p ? null : p)}>
                <Portrait leader={p} size={52} />
                <span className="grow">
                  <span className="seat-name">{leaderName(t, p)}</span>
                  <span className="muted small">
                    {partyShort(t, p)}
                    {pact && ` · ${t('deals.tag.pact', { n: stoodAside })}`}
                    {campaign.understandings.includes(p) && ` · ${t('deals.tag.understanding')}`}
                  </span>
                </span>
                {/* how well a rival's party holds together: a divided one is where a defector can be found */}
                <Gauge value={campaign.parties[p]!.unity} label={t('term.unity')} />
                <span className={`badge rel-${relationWord(rel)}`}>{t(`relation.${relationWord(rel)}`)} {rel > 0 ? '+' : ''}{rel}</span>
              </button>
              {open === p && (
                <ul className="leader-moves">
                  {/* who you are dealing with: what they are good at, and how they take what you do to them */}
                  {PARTY_IDS[p] in LEADER_STATS && (
                    <li className="leader-about small">
                      <span className="muted">{t(`temper.${PARTY_IDS[p] as keyof typeof LEADER_STATS}`)}</span>
                      <span className="stat-grid">
                        {STAT_IDS.map((s, i) => { const n = LEADER_STATS[PARTY_IDS[p] as keyof typeof LEADER_STATS][i]; return <span key={s}><span className="muted">{t(`stat.${s}`)}</span> <Pips n={n} label={`${n} / 5`} /></span>; })}
                      </span>
                    </li>
                  )}
                  <Move title={t('deals.meet')} meta={f.days(COST.meet)} check={canMeet(world, campaign, p)} onGo={() => meet(p)}>
                    <span className="action-meta">{t('deals.meet.desc')}</span>
                  </Move>
                  {pact ? (
                    <li className="action">
                      <div className="grow">
                        <span className="action-title">{t('deals.pact.signed', { n: stoodAside })}</span>
                        <span className="action-meta">{t('deals.pact.signedDesc')}</span>
                      </div>
                      {beforeNomination(campaign) && <ConfirmButton label={t('deals.pact.break')} confirmLabel={t('deals.pact.breakConfirm')} onConfirm={() => breakPact(p)} danger />}
                    </li>
                  ) : (
                    <Move title={t('deals.pact')} meta={t('deals.pact.cost', { days: f.days(COST.talks) })} check={canTalk(world, campaign, p)} onGo={() => setTalking(p)}>
                      <span className="action-meta">{t(`deals.pact.desc.${area}`)}</span>
                    </Move>
                  )}
                  <Move title={t('deals.promise')} meta={f.days(COST.understanding)} check={canPromise(world, campaign, p)} onGo={() => promise(p)}>
                    <span className="action-meta">{t('deals.promise.desc')}</span>
                  </Move>
                  {foes.length > 0 && (
                    <Move
                      title={t('deals.joint')} meta={f.days(COST.joint)}
                      check={canJointAttack(world, campaign, p, target)} onGo={() => jointAttack(p, target)}
                    >
                      <label className="action-meta">
                        {t('deals.joint.target')}{' '}
                        <select value={target} onChange={(e) => setTargets({ ...targets, [p]: Number(e.target.value) })}>
                          {foes.map((q) => <option key={q} value={q}>{partyShort(t, q)}</option>)}
                        </select>
                      </label>
                    </Move>
                  )}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <h3>{t('deals.katak')}</h3>
      <p className="muted small action-desc">{t('deals.katak.desc')}</p>
      <ul>
        <Move
          title={seat && courtCheck.ok ? t('deals.court', { seat: seat.name, party: partyShort(t, holder) }) : t('deals.court.none')}
          meta={`${f.days(COST.court)} · ${f.rm(scaled(world, COST.courtMoney) * stake)}${seat && courtCheck.ok && !fog ? ` · ${t('deals.court.chance', { pct: f.pct(courtChance(world, campaign, seat.id, stake), 0) })}` : ''}`}
          check={courtCheck} onGo={() => court(selectedSeat!, stake)}
        />
        <li>
          <span className="muted small">{t('deals.court.offer')}</span>
          <div className="segmented small" role="group" aria-label={t('deals.court.offer')}>
            {STAKES.map((n) => (
              <button key={n} className={stake === n ? 'active' : ''} aria-pressed={stake === n} onClick={() => setStake(n)}>
                {f.rm(scaled(world, COST.courtMoney) * n)}
              </button>
            ))}
          </div>
          <p className="muted small">{t('deals.court.offer.note')}</p>
        </li>
      </ul>
    </section>
  );
}
