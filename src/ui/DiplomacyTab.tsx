import { useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { scaled } from '../sim/campaign/actions';
import {
  beforeNomination, canCourt, canJointAttack, canMeet, canPromise, canTalk, COST, courtChance, inPact,
  nominationWeek, others, relation, type DiploRefusal,
} from '../sim/campaign/diplomacy';
import { useStore } from '../state/store';
import { ConfirmButton } from './SavesTab';
import { leaderName, partyShort, relationWord, useFormat, useT, useWorld } from './hooks';
import { Portrait } from './Portrait';
import { NewsLine } from './NewsTab';
import { PactTalks } from './PactTalks';

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
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const selectedSeat = useStore((s) => s.selectedSeat);
  const lastReport = useStore((s) => s.lastReport);
  const meet = useStore((s) => s.meet);
  const promise = useStore((s) => s.promise);
  const jointAttack = useStore((s) => s.jointAttack);
  const breakPact = useStore((s) => s.breakPact);
  const court = useStore((s) => s.court);
  const clearPactReply = useStore((s) => s.clearPactReply);

  const [open, setOpen] = useState<number | null>(null);
  const [talking, setTalking] = useState<number | null>(null);
  const [targets, setTargets] = useState<Record<number, number>>({});

  const me = campaign.player;
  const pc = campaign.parties[me]!;
  const leaders = others(campaign, me);
  const area = world.rules.kind === 'general' ? 'general' : 'state';

  if (talking !== null) return <PactTalks party={talking} onClose={() => { clearPactReply(); setTalking(null); }} />;

  const seat = selectedSeat ? world.seats[world.seatIndex.get(selectedSeat)!] : null;
  const courtCheck = canCourt(world, campaign, selectedSeat);
  const holder = seat ? seat.last.votes.indexOf(Math.max(...seat.last.votes)) : -1;

  return (
    <section className="deals">
      {lastReport && <ul className="report"><NewsLine item={lastReport} /></ul>}
      <div className="panel-head">
        <h2>{t('deals.title')}</h2>
        <span className="muted">{t('deals.unity', { n: pc.unity })}</span>
      </div>
      <p className="muted small">{t('deals.intro')}</p>
      <p className="note">
        {beforeNomination(campaign) ? t('deals.nomination', { n: nominationWeek(campaign) }) : t('deals.nominated')}
      </p>

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
                <Portrait leader={p} size={38} />
                <span className="grow">
                  <span className="seat-name">{leaderName(t, p)}</span>
                  <span className="muted small">
                    {partyShort(t, p)}
                    {pact && ` · ${t('deals.tag.pact', { n: stoodAside })}`}
                    {campaign.understandings.includes(p) && ` · ${t('deals.tag.understanding')}`}
                  </span>
                </span>
                <span className={`badge rel-${relationWord(rel)}`}>{t(`relation.${relationWord(rel)}`)} {rel > 0 ? '+' : ''}{rel}</span>
              </button>
              {open === p && (
                <ul className="leader-moves">
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
          meta={`${f.days(COST.court)} · ${f.rm(scaled(world, COST.courtMoney))}${seat && courtCheck.ok ? ` · ${t('deals.court.chance', { pct: f.pct(courtChance(world, campaign, seat.id), 0) })}` : ''}`}
          check={courtCheck} onGo={() => court(selectedSeat!)}
        />
      </ul>
    </section>
  );
}
