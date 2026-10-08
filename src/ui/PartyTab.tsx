import { termIncome, termSpending } from '../sim/campaign/career';
import {
  ACTIVITY_IDS, ACTIVITIES, PADDING, canPad, padChance, paddedOf, FAVOUR_IDS, FOREIGN, canTakeForeign, exposureChance, inquiryChance, CHEST_BONUS, DISCIPLINE, DISCIPLINE_EVERY, REBRAND, canDiscipline, canRebrand, CHEST_PENALTY, HOLDINGS, fatigueOf, grassrootsLift, probeChance, HOLDING_IDS, activityCost, activityWait, baseRolls, canDoActivity, holdingScale, holdingsOf, rollsOf, rollsTarget,
} from '../sim/campaign/party';
import { scaled } from '../sim/campaign/actions';
import { EARLY, canAgreeEarly, earlyPacts } from '../sim/campaign/earlypact';
import { tieBetween } from '../sim/campaign/cast';
import { ALLIANCE, ALLIANCE_MARKS, ALLIANCE_NAMES, allianceBonus, canFound, canInvite } from '../sim/campaign/alliance';
import { CHIEF_NAMES, deputyChance, deputyOf, FACTION_IDS, WING_IDS, backing, challengeChance, factionsOf, PARTY_POLL_EVERY } from '../sim/campaign/factions';
import { useState } from 'react';
import { PARTIES } from '../data/parties';
import { PARTY_IDS } from '../sim/types';
import { LEADERS } from '../sim/campaign/cast';
import { DEFAULT_EMBLEMS, PARTY_COLORS, makeIdentity } from '../state/identity';
import { PartyCreator, type Draft } from './Setup';
import type { StringKey } from '../i18n/strings';
import { MERGER, canMerge } from '../sim/campaign/merge';
import { houseTally } from '../sim/campaign/contests';
import { useStore } from '../state/store';
import { Gauge } from './Gauge';
import { ConfirmButton } from './SavesTab';
import { Brief } from './Brief';
import { partyName, partyShort, regionLabel, useFormat, useT, useWorld } from './hooks';

const LOT = 100_000;

/**
 * The party as an organisation between campaigns: who belongs, what it owns, and what it does with its time and money
 * before an election is called. Everything here is done in the years between elections.
 */
export function PartyTab() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const trade = useStore((s) => s.trade);
  const activity = useStore((s) => s.activity);
  const chest = useStore((s) => s.chest);
  const foreign = useStore((s) => s.foreign);
  const agreeEarly = useStore((s) => s.agreeEarly);
  const dropEarly = useStore((s) => s.dropEarly);
  const foundAlliance = useStore((s) => s.foundAlliance);
  const inviteAlly = useStore((s) => s.inviteAlly);
  const dissolveAlliance = useStore((s) => s.dissolveAlliance);
  const [allianceName, setAllianceName] = useState(0);
  const [allianceMark, setAllianceMark] = useState(0);
  const padRolls = useStore((s) => s.padRolls);
  const discipline = useStore((s) => s.discipline);
  const merge = useStore((s) => s.merge);
  const [rebranding, setRebranding] = useState(false);
  const [pickedState, setPickedState] = useState<string | null>(null);
  const k = campaign.career;
  const pc = campaign.parties[campaign.player]!;
  if (!k) return <p className="muted">{t('party.none')}</p>;

  const term = campaign.phase === 'term';
  const income = termIncome(world, campaign);
  const spend = termSpending(world, campaign);
  const net = income.total - spend.total;
  const members = rollsOf(world, campaign);
  const target = rollsTarget(world, campaign);
  const ordinary = baseRolls(world, campaign);
  const held = holdingsOf(k);
  const lot = scaled(world, LOT);
  const branches = pc.machinery.filter((m) => m > 0);
  const avg = branches.length ? Math.round(branches.reduce((a, m) => a + m, 0) / branches.length) : 0;
  const trend = Math.abs(target - members) < ordinary * 0.01 ? 'steady' : target > members ? 'growing' : 'shrinking';

  return (
    <section className="party">
      <div className="panel-head">
        <h2>{t('party.title')}</h2>
        <span className="muted">{t('orders.term', { n: k.term })}</span>
      </div>
      <Brief text={t('party.intro')} />

      <dl className="facts orders-facts">
        <div><dt>{t('party.members')}</dt><dd className="num">{f.int(members)}</dd></div>
        <div><dt>{t('party.trend')}</dt><dd>{t(`party.trend.${trend}`)}</dd></div>
        <div><dt>{t('party.branches')}</dt><dd className="num">{avg}</dd></div>
        <div><dt>{t('hud.funds')}</dt><dd className="num">{f.rm(pc.funds)}</dd></div>
        <div><dt>{t('orders.in')}</dt><dd className="num">{f.rm(income.total)}</dd></div>
        <div><dt>{t('orders.net')}</dt><dd className={`num ${net < 0 ? 'neg' : ''}`}>{net < 0 ? '−' : '+'}{f.rm(Math.abs(net))}</dd></div>
      </dl>
      <div className="gauge-row">
        <Gauge value={pc.unity} label={t('hint.unity')} />
        <Gauge value={k.credibility} label={t('hint.cred')} />
      </div>
      <p className="muted small">{t('party.members.note', { ordinary: f.int(ordinary) })}</p>
      <p className="note">{t('party.grassroots', { pts: (Math.round(grassrootsLift(world, campaign) * 25 * 10) / 10).toFixed(1) })}</p>

      <h3>{t('party.factions')}</h3>
      <p className="muted small action-desc">{t('party.factions.desc', { n: PARTY_POLL_EVERY / 52, pct: backing(campaign), chance: f.pct(challengeChance(campaign), 0) })}</p>
      <p className="note">{t('party.deputy', { name: CHIEF_NAMES[deputyOf(campaign).name], faction: t(`faction.${FACTION_IDS[deputyOf(campaign).faction]}`), ambition: Math.round(deputyOf(campaign).ambition), chance: f.pct(deputyChance(campaign), 0) })}</p>
      <ul>
        {FACTION_IDS.map((id, i) => {
          const fx = factionsOf(campaign);
          return (
            <li className="action" key={id}>
              <div className="grow">
                <span className="action-title">{t(`faction.${id}`)} <span className="muted small">· {CHIEF_NAMES[fx.chief[i]]}</span></span>
                <span className="action-meta">{t(`faction.${id}.desc`)}</span>
                <span className="action-meta num">{t('party.faction.line', { size: Math.round(fx.size[i] * 100), mood: Math.round(fx.mood[i]) })}</span>
              </div>
              <Gauge value={fx.mood[i]} label={t('party.faction.mood')} />
            </li>
          );
        })}
        {WING_IDS.map((id, i) => {
          const fx = factionsOf(campaign);
          return (
            <li className="action" key={id}>
              <div className="grow">
                <span className="action-title">{t(`wing.${id}`)} <span className="muted small">· {CHIEF_NAMES[fx.chief[3 + i]]}</span></span>
                <span className="action-meta">{t(`wing.${id}.desc`)}</span>
              </div>
              <Gauge value={fx.wing[i]} label={t('party.faction.mood')} />
            </li>
          );
        })}
      </ul>

      <h3>{t('party.activities')}</h3>
      <p className="muted small action-desc">{t(term ? 'party.activities.desc' : 'party.activities.campaign')}</p>
      <ul>
        {ACTIVITY_IDS.map((id) => {
          const check = canDoActivity(world, campaign, id);
          const wait = activityWait(campaign, id);
          return (
            <li className="action" key={id}>
              <div className="grow">
                <span className="action-title">{t(`activity.${id}`)}</span>
                <span className="action-meta">{t(`activity.${id}.desc`)}</span>
                <span className="action-meta num">{f.rm(activityCost(world, id))} · {t('activity.every', { n: ACTIVITIES[id].every })}</span>
                {wait > 0 && <span className="action-reason">{t('activity.wait', { n: wait })}</span>}
                {!check.ok && check.reason === 'funds' && <span className="action-reason">{t('reason.funds')}</span>}
              </div>
              <button className="btn small primary" disabled={!check.ok} onClick={() => activity(id)}>{t('actions.go')}</button>
            </li>
          );
        })}
      </ul>

      <h3>{t('party.discipline')}</h3>
      <p className="muted small action-desc">{t('party.discipline.desc', { n: DISCIPLINE_EVERY })}</p>
      {(() => {
        const states = world.states.filter((st) => pc.machinery[world.states.indexOf(st)] > 0);
        const st = pickedState && states.includes(pickedState) ? pickedState : states[0];
        if (!st) return <p className="muted small">{t('party.discipline.none')}</p>;
        return (
          <div className="button-row">
            <select value={st} onChange={(e) => setPickedState(e.target.value)} aria-label={t('party.discipline')}>
              {states.map((x) => <option key={x} value={x}>{regionLabel(t, world, x)} · {Math.round(pc.machinery[world.states.indexOf(x)])}</option>)}
            </select>
            <ConfirmButton className="btn small" label={t('party.discipline.suspend', { n: DISCIPLINE.suspend.branches })} confirmLabel={t('party.discipline.confirm')} disabled={!term || !canDiscipline(world, campaign, st)} onConfirm={() => discipline(st, 'suspend')} />
            <ConfirmButton className="btn small" label={t('party.discipline.dissolve', { n: DISCIPLINE.dissolve.branches })} confirmLabel={t('party.discipline.confirm')} disabled={!term || !canDiscipline(world, campaign, st)} onConfirm={() => discipline(st, 'dissolve')} danger />
          </div>
        );
      })()}

      <h3>{t('party.merge')}</h3>
      <p className="muted small action-desc">{t('party.merge.desc', { n: Math.round(MERGER.size * 100), warm: MERGER.warmth })}</p>
      {(() => {
        const seats = houseTally(world, campaign);
        const rows = seats.map((n, p) => ({ n, p })).filter(({ n, p }) => n > 0 && p !== campaign.player && !!campaign.parties[p]);
        const mergedNow = k.merged ?? [];
        return (
          <>
            {mergedNow.length > 0 && <p className="note">{t('party.merge.done', { parties: mergedNow.map((p) => partyName(t, p)).join(', ') })}</p>}
            <ul>
              {rows.map(({ n, p }) => {
                const check = canMerge(world, campaign, p);
                if (!check.ok && (check.reason === 'none' || check.reason === 'already' || check.reason === 'phase')) return null;
                return (
                  <li className="action" key={p}>
                    <div className="grow">
                      <span className="action-title">{partyName(t, p)} <span className="muted small num">· {n}</span></span>
                      {!check.ok && <span className="action-reason">{t(`party.merge.reason.${check.reason}` as StringKey)}</span>}
                    </div>
                    <ConfirmButton className="btn small" label={t('party.merge.do')} confirmLabel={t('party.merge.confirm')} disabled={!term || !check.ok} onConfirm={() => merge(p)} danger />
                  </li>
                );
              })}
            </ul>
          </>
        );
      })()}

      <h3>{t('party.rebrand')}</h3>
      <p className="muted small action-desc">{t('party.rebrand.desc', { rm: f.rm(scaled(world, REBRAND.funds)), cred: REBRAND.credibility })}</p>
      <div className="button-row">
        <button className="btn small" disabled={!term || !canRebrand(world, campaign)} onClick={() => setRebranding(true)}>{t('party.rebrand.open')}</button>
      </div>
      {rebranding && <RebrandDialog onClose={() => setRebranding(false)} />}

      <h3>{t('party.chest')}</h3>
      <p className="muted small action-desc">{t('party.chest.desc', { bonus: Math.round(CHEST_BONUS * 100), penalty: Math.round(CHEST_PENALTY * 100) })}</p>
      <ul>
        <li className="action">
          <div className="grow">
            <span className="action-title">{t('party.chest.held', { rm: f.rm(k.chest ?? 0) })}</span>
          </div>
          <div className="button-row tight">
            <button className="btn small" disabled={!term || pc.funds < lot} onClick={() => chest(1)}>{t('party.chest.add', { rm: f.rm(lot) })}</button>
            <button className="btn small" disabled={!term || (k.chest ?? 0) < lot} onClick={() => chest(-1)}>{t('party.chest.take')}</button>
          </div>
        </li>
      </ul>
      {(k.govRun ?? 0) > 1 && <p className="note bad">{t('party.fatigue', { n: k.govRun!, pts: (Math.round(fatigueOf(k.govRun!) * 25 * 10) / 10).toFixed(1) })}</p>}

      <h3>{t('early.title')}</h3>
      <p className="muted small action-desc">{t('early.desc', { n: EARLY.max })}</p>
      <ul>
        {houseTally(world, campaign).map((n, p) => ({ n, p })).filter(({ n, p }) => n > 0 && p !== campaign.player && !!campaign.parties[p]).map(({ p }) => {
          const tie = tieBetween(campaign.player, p);
          const agreed = earlyPacts(campaign)[p];
          const check = canAgreeEarly(world, campaign, p);
          return (
            <li className="action" key={p}>
              <div className="grow">
                <span className="action-title">{partyName(t, p)}</span>
                {tie && <span className="action-meta">{t(`tie.${tie.kind}` as StringKey)}</span>}
                {agreed && <span className="action-meta num">{t('early.agreed', { n: agreed.give.length + agreed.get.length })}</span>}
                {!agreed && !check.ok && check.reason !== 'none' && check.reason !== 'phase' && <span className="action-reason">{t(`early.no.${check.reason}` as StringKey)}</span>}
              </div>
              {agreed
                ? <ConfirmButton label={t('early.drop')} confirmLabel={t('early.drop.confirm')} onConfirm={() => dropEarly(p)} />
                : <button className="btn small" disabled={!check.ok} onClick={() => agreeEarly(p)}>{t('early.agree')}</button>}
            </li>
          );
        })}
      </ul>

      <h3>{t('alliance.title')}</h3>
      <p className="muted small action-desc">{t('alliance.desc', { found: f.rm(scaled(world, ALLIANCE.found)), join: f.rm(scaled(world, ALLIANCE.join)), n: ALLIANCE.max })}</p>
      {!k.alliance ? (
        <ul>
          <li className="action">
            <div className="grow">
              <div className="chips" role="group" aria-label={t('alliance.name')}>
                {Array.from({ length: ALLIANCE_NAMES }, (_, n) => (
                  <button key={n} className={allianceName === n ? 'chip active' : 'chip'} aria-pressed={allianceName === n} onClick={() => setAllianceName(n)}>{t(`alliance.name.${n}` as StringKey)}</button>
                ))}
              </div>
              <div className="chips" role="group" aria-label={t('alliance.mark')}>
                {ALLIANCE_MARKS.map((m, n) => (
                  <button key={m} className={allianceMark === n ? 'chip active' : 'chip'} aria-pressed={allianceMark === n} aria-label={`${t('alliance.mark')} ${m}`} onClick={() => setAllianceMark(n)}>{m}</button>
                ))}
              </div>
            </div>
            <button className="btn small" disabled={!canFound(world, campaign, allianceName, allianceMark).ok} onClick={() => foundAlliance(allianceName, allianceMark)}>{t('alliance.found')}</button>
          </li>
        </ul>
      ) : (
        <ul>
          <li className="action">
            <div className="grow">
              <span className="action-title">{ALLIANCE_MARKS[k.alliance.mark]} {t(`alliance.name.${k.alliance.name}` as StringKey)}</span>
              <span className="action-meta">{k.alliance.members.map((p) => partyShort(t, p)).join(' · ')} — {t('alliance.lift', { pts: (allianceBonus(campaign, campaign.player) * 25).toFixed(1) })}</span>
            </div>
            <ConfirmButton label={t('alliance.dissolve')} confirmLabel={t('alliance.dissolve.confirm')} onConfirm={() => dissolveAlliance()} />
          </li>
          {houseTally(world, campaign).map((n, p) => ({ n, p })).filter(({ n, p }) => n > 0 && !k.alliance!.members.includes(p) && p !== campaign.player && !!campaign.parties[p]).map(({ p }) => {
            const check = canInvite(world, campaign, p);
            return (
              <li className="action" key={p}>
                <div className="grow">
                  <span className="action-title">{partyName(t, p)}</span>
                  {!check.ok && check.reason !== 'none' && check.reason !== 'phase' && <span className="action-reason">{t(`alliance.no.${check.reason}` as StringKey)}</span>}
                </div>
                <button className="btn small" disabled={!check.ok} onClick={() => inviteAlly(p)}>{t('alliance.invite')}</button>
              </li>
            );
          })}
        </ul>
      )}

      <h3>{t('party.pad')}</h3>
      <p className="muted small action-desc">{t('party.pad.desc', { pct: Math.round(PADDING.share * 100) })}</p>
      <ul>
        <li className="action">
          <div className="grow">
            {paddedOf(k) > 0 && <span className="action-meta">{t('party.pad.risk', { n: Math.round(paddedOf(k)).toLocaleString(), pct: (padChance(world, campaign) * 100).toFixed(1) })}</span>}
          </div>
          <div className="button-row tight">
            <button className="btn small" disabled={!canPad(campaign)} onClick={() => padRolls()}>{t('party.pad.do')}</button>
          </div>
        </li>
      </ul>

      <h3>{t('party.foreign')}</h3>
      <p className="muted small action-desc">{t('party.foreign.desc', { rm: f.rm(scaled(world, FOREIGN.sum)) })}</p>
      <ul>
        <li className="action">
          <div className="grow">
            <span className="action-meta">{t('party.foreign.risk', { pct: (exposureChance(k) * 100).toFixed(1), n: k.foreign ?? 0 })}</span>
            {(k.trail ?? 0) > 0 && <span className="action-meta">{t('party.trail', { pct: (inquiryChance(k) * 100).toFixed(1) })}</span>}
          </div>
          <div className="button-row tight">
            {FAVOUR_IDS.map((id) => (
              <button key={id} className="btn small" disabled={!canTakeForeign(campaign)} onClick={() => foreign(id)}>{t(`party.foreign.${id}`)}</button>
            ))}
          </div>
        </li>
      </ul>

      <h3>{t('party.holdings')}</h3>
      <p className="muted small action-desc">{t('party.holdings.desc')} {t('party.probe', { pct: (probeChance(world, k) * 100).toFixed(1) })}</p>
      <ul>
        {HOLDING_IDS.map((id) => {
          const value = held[id];
          const def = HOLDINGS[id];
          const weekly = Math.round(value * def.yield);
          return (
            <li className="action" key={id}>
              <div className="grow">
                <span className="action-title">{t(`holding.${id}`)}</span>
                <span className="action-meta">{t(`holding.${id}.desc`)}</span>
                <span className="action-meta num">
                  {t('party.holding.value', { value: f.rm(value), rm: `${weekly < 0 ? '−' : '+'}${f.rm(Math.abs(weekly))}` })}
                  {value > 0 && id !== 'property' && ` · ${t('party.holding.effect', { n: Math.round(holdingScale(world, k, id) * 100) })}`}
                </span>
              </div>
              <div className="button-row tight">
                <button className="btn small" disabled={!term || pc.funds < lot} onClick={() => trade(id, 1)}>{t('orders.buy', { rm: f.rm(lot) })}</button>
                <button className="btn small" disabled={!term || value < lot} onClick={() => trade(id, -1)}>{t('orders.sell')}</button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}


/** The party takes a new name, a new flag and new colours: what it says goes on the screens, and what it costs is paid when it is done. */
function RebrandDialog({ onClose }: { onClose(): void }) {
  const t = useT();
  const player = useStore((s) => s.game!.campaign.player);
  const current = useStore((s) => s.game!.identity);
  const rebrand = useStore((s) => s.rebrand);
  const id = PARTY_IDS[player] as keyof typeof DEFAULT_EMBLEMS;
  const start: Draft = current
    ? { ...current, ideology: null }
    : { name: PARTIES[id].name, short: PARTIES[id].short, color: PARTY_COLORS.includes(PARTIES[id].color) ? PARTIES[id].color : PARTY_COLORS[0], emblem: DEFAULT_EMBLEMS[id], leader: LEADERS[id], look: 0, ideology: null };
  const [draft, setDraft] = useState<Draft>(start);
  const identity = makeIdentity(draft);
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog panel" role="dialog" aria-modal="true" aria-label={t('party.rebrand')}>
        <div className="dialog-head"><h2>{t('party.rebrand')}</h2></div>
        <PartyCreator draft={draft} career={false} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
        <div className="button-row">
          <button className="btn primary" disabled={!identity} onClick={() => { if (identity) { rebrand(identity); onClose(); } }}>{t('party.rebrand.do')}</button>
          <button className="btn" onClick={onClose}>{t('party.rebrand.cancel')}</button>
        </div>
      </div>
    </div>
  );
}
