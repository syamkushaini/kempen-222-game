import type { StringKey } from '../i18n/strings';
import { dearToLose, missionsOf, penaltyOf, progressOf, rewardOf } from '../sim/campaign/missions';
import type { Campaign, Mission, MissionRecord } from '../sim/campaign/types';
import { useStore } from '../state/store';
import { describeEffect } from './effectText';
import { seatName, useFormat, useT, useWorld, type Format, type T } from './hooks';
import { Icon } from './Icon';
import { EmptyState } from './EmptyState';
import { ConfirmButton } from './SavesTab';
import { missionGoal, missionWhy, recordAsk } from './missionText';
import type { World } from '../sim/election';
import { useGaugeColour } from './Gauge';

const SEATS_SHOWN = 8;

function useEffectsText() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  return (effects: Parameters<typeof describeEffect>[4][]) => effects.map((e) => describeEffect(t, f, world, campaign, e)).filter(Boolean).join(' · ');
}

/** The seats a mission names, each one a button that picks it on the map. */
function SeatChips({ world, ids }: { world: World; ids: string[] }) {
  const t = useT();
  const select = useStore((s) => s.selectSeat);
  const state = (id: string) => world.seats[world.seatIndex.get(id)!]?.state;
  return (
    <p className="mission-seats">
      {ids.slice(0, SEATS_SHOWN).map((id) => (
        <button key={id} className="chip" title={t('mission.seats.show')} onClick={() => select(id, state(id))}>{seatName(world, id)}</button>
      ))}
      {ids.length > SEATS_SHOWN && <span className="muted small">{t('news.more', { n: ids.length - SEATS_SHOWN })}</span>}
    </p>
  );
}

function Terms({ m, effects }: { m: Mission; effects: ReturnType<typeof useEffectsText> }) {
  const t = useT();
  return (
    <dl className="mission-terms">
      <div><dt>{t('mission.reward')}</dt><dd>{effects(rewardOf(m))}</dd></div>
      <div><dt>{t('mission.risk')} <span className={dearToLose(m.kind) ? 'badge marginal' : 'badge'}>{t(dearToLose(m.kind) ? 'mission.risk.big' : 'mission.risk.small')}</span></dt><dd>{effects(penaltyOf(m))}</dd></div>
    </dl>
  );
}

function Offer({ m, world, effects }: { m: Mission; world: World; effects: ReturnType<typeof useEffectsText> }) {
  const t = useT();
  const f = useFormat();
  const accept = useStore((s) => s.acceptMission);
  const decline = useStore((s) => s.declineMission);
  return (
    <li className="action mission">
      <div className="grow">
        <span className="action-title">{t(`mission.kind.${m.kind}` as StringKey)}</span>
        <span className="action-meta">{missionGoal(t, f, m)}</span>
        <span className="action-meta muted">{missionWhy(t, m)}</span>
        {m.seats && <SeatChips world={world} ids={m.seats} />}
        <Terms m={m} effects={effects} />
        <div className="mission-buttons">
          <button className="btn primary small" onClick={() => accept(m.id)}>{t('mission.take')}</button>
          <button className="btn small" onClick={() => decline(m.id)}>{t('mission.decline')}</button>
        </div>
      </div>
    </li>
  );
}

function Running({ m, campaign, world, effects }: { m: Mission; campaign: Campaign; world: World; effects: ReturnType<typeof useEffectsText> }) {
  const t = useT();
  const f = useFormat();
  const abandon = useStore((s) => s.abandonMission);
  const colour = useGaugeColour();
  const { have, need } = progressOf(world, campaign, m);
  const pct = need > 0 ? Math.max(0, Math.min(100, Math.round((100 * have) / need))) : 100;
  const left = m.weeks !== undefined ? t('mission.left.weeks', { n: m.weeks }) : t('mission.left.elections', { n: m.elections ?? 1 });
  const figure = m.kind === 'funds' ? `${f.rm(have)} / ${f.rm(need)}` : t('mission.progress', { have, need });
  return (
    <li className="action mission">
      <div className="grow">
        <span className="action-title">{t(`mission.kind.${m.kind}` as StringKey)} <span className="muted small">· {left}</span></span>
        <span className="action-meta">{missionGoal(t, f, m, '')}</span>
        <div className="gauge">
          <div className="bar gauge-bar mission-bar" role="img" aria-label={figure}><span style={{ width: `${pct}%`, background: colour(pct) }} /></div>
          <strong className="num">{figure}</strong>
        </div>
        {m.seats && <SeatChips world={world} ids={m.seats} />}
        <Terms m={m} effects={effects} />
        <div className="mission-buttons">
          <ConfirmButton label={t('mission.giveUp')} confirmLabel={t('mission.giveUp.confirm')} onConfirm={() => abandon(m.id)} danger />
        </div>
      </div>
    </li>
  );
}

function Record({ r, t, f }: { r: MissionRecord; t: T; f: Format }) {
  return (
    <li className="action">
      <div className="grow">
        <span className="action-title">{t(`mission.kind.${r.kind}` as StringKey)}</span>
        <span className="action-meta">{missionGoal(t, f, recordAsk(r), '')}</span>
      </div>
      <span className={r.won ? 'badge' : 'badge marginal'}>{t(r.won ? 'mission.won.short' : 'mission.lost.short')}</span>
    </li>
  );
}

/** The missions the leader can take on, the ones under way, and how the last ones ended. */
export function MissionsTab() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const effects = useEffectsText();
  const m = missionsOf(campaign);
  const record = [...m.done].reverse().slice(0, 8);
  return (
    <section className="orders missions">
      <p className="muted small">{t('mission.intro')}</p>
      <h3>{t('mission.running')}</h3>
      {m.active.length === 0 ? <p className="muted small">{t('mission.none.running')}</p> : (
        <ul className="seat-list">{m.active.map((x) => <Running key={x.id} m={x} campaign={campaign} world={world} effects={effects} />)}</ul>
      )}
      <h3>{t('mission.offers')}</h3>
      {m.offers.length === 0 ? <EmptyState art="compass" title={t('mission.none.offers')} /> : (
        <ul className="seat-list">{m.offers.map((x) => <Offer key={x.id} m={x} world={world} effects={effects} />)}</ul>
      )}
      {record.length > 0 && (
        <>
          <h3>{t('mission.record')}</h3>
          <ul className="seat-list">{record.map((r, i) => <Record key={i} r={r} t={t} f={f} />)}</ul>
        </>
      )}
    </section>
  );
}

/** How a mission ended, as a card: shown once the player is free to look at it, one at a time. */
export function MissionCard() {
  const t = useT();
  const f = useFormat();
  const campaign = useStore((s) => s.game!.campaign);
  const seen = useStore((s) => s.seenMission);
  const effects = useEffectsText();
  const r = campaign.career?.missions?.unseen[0];
  if (!r || campaign.phase !== 'term' || campaign.inbox.length > 0) return null;
  const ask = recordAsk(r);
  const terms = r.won ? rewardOf(r) : penaltyOf(r);
  const title = t(r.won ? 'mission.won' : 'mission.lost');
  return (
    <div className="overlay">
      <div className="dialog panel mission-card" role="dialog" aria-modal="true" aria-label={title}>
        <div className={r.won ? 'verdict won' : 'verdict lost'}><Icon name={r.won ? 'trophy' : 'close'} size={28} /></div>
        <h2>{title}</h2>
        <p className="action-title">{t(`mission.kind.${r.kind}` as StringKey)}</p>
        <p>{missionGoal(t, f, ask, '')}</p>
        <p className="muted">{t(r.won ? 'mission.card.reward' : 'mission.card.risk')}: {effects(terms)}</p>
        <button className="btn primary" autoFocus onClick={() => seen()}>{t('mission.card.close')}</button>
      </div>
    </div>
  );
}
