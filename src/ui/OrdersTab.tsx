import {
  ASSET_LOT, BUDGET, canDissolve, EARLIEST_DISSOLUTION, inGovernment, machineryTargets, termIncome, termSpending,
} from '../sim/campaign/career';
import { useState } from 'react';
import { contestsState, scaled } from '../sim/campaign/actions';
import { ROUNDS, STATE_GOVERNMENT_INCOME } from '../sim/campaign/contests';
import { others, relation } from '../sim/campaign/diplomacy';
import { seatOf } from '../sim/campaign/events';
import { memberMoods, membersOf, moodWord } from '../sim/campaign/members';
import { partnerMood } from '../sim/campaign/plots';
import { Gauge } from './Gauge';
import { Loan } from './Loan';
import { Jargon, Term } from './Term';
import { stabilityBand } from '../sim/campaign/formation';
import { FOCUS_IDS, type Level, type Orders } from '../sim/campaign/types';
import { useStore } from '../state/store';
import { ConfirmButton } from './SavesTab';
import { leaderName, partyColor, partyName, partyShort, regionLabel, relationWord, useFormat, useT, useWorld } from './hooks';
import { Brief } from './Brief';

const LEVELS: Level[] = [0, 1, 2, 3];

function LevelSwitch(props: { value: Level; label: string; onChange(level: Level): void; disabled?: boolean }) {
  const t = useT();
  return (
    <div className="segmented small" role="group" aria-label={props.label}>
      {LEVELS.map((level) => (
        <button key={level} className={props.value === level ? 'active' : ''} aria-pressed={props.value === level} disabled={props.disabled} onClick={() => props.onChange(level)}>
          {t(`level.${level}`)}
        </button>
      ))}
    </div>
  );
}

/**
 * Standing orders for the years between elections: what the leader does with
 * their time, where the party's money goes, and where it comes from. They run
 * every week until changed.
 */
export function OrdersTab() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const setOrders = useStore((s) => s.setOrders);
  const invest = useStore((s) => s.invest);
  const dissolve = useStore((s) => s.dissolve);
  const selectState = useStore((s) => s.selectState);

  const k = campaign.career!;
  const me = campaign.player;
  const pc = campaign.parties[me]!;
  const [lots, setLots] = useState(1);
  const o = k.orders;
  const g = k.government;
  const seat = seatOf(campaign);
  const income = termIncome(world, campaign);
  const spend = termSpending(world, campaign);
  const net = income.total - spend.total;
  const regions = world.states.filter((st) => contestsState(world, campaign, me, st));
  const targets = machineryTargets(world, campaign);
  const lot = scaled(world, ASSET_LOT);
  const leaders = others(campaign, me);
  const governing = inGovernment(campaign, me);
  const band = stabilityBand(g.stability);
  const members = membersOf(campaign), moods = memberMoods(campaign);

  const budgetRow = (key: keyof Orders['budget']) => (
    <li className="action" key={key}>
      <div className="grow">
        <span className="action-title">{t(`orders.budget.${key}`)}</span>
        <span className="action-meta">{t(`orders.budget.${key}.desc`)}</span>
        <span className="action-meta num">{o.budget[key] > 0 ? t('orders.perWeek', { rm: f.rm(scaled(world, BUDGET[key][o.budget[key]])) }) : t('cost.free')}</span>
      </div>
      <LevelSwitch label={t(`orders.budget.${key}`)} value={o.budget[key]} onChange={(level) => setOrders({ budget: { ...o.budget, [key]: level } })} />
    </li>
  );

  return (
    <section className="orders">
      <div className="panel-head">
        <h2><Term id="orders">{t('orders.title')}</Term></h2>
        <span className="muted">{t('orders.term', { n: k.term })}</span>
      </div>
      <Brief text={t('orders.intro')} />

      <h3>{t('orders.government')}</h3>
      <p>
        {t(g.partners.length ? 'orders.gov.line' : 'orders.gov.alone', {
          party: partyName(t, g.pm), partners: g.partners.map((p) => partyShort(t, p)).join(', '), n: g.seats,
        })}
      </p>
      <p className="muted small">{t(`orders.seat.${seat}`)} · {t(`orders.band.${band}`)}</p>
      {members && moods && (
        <p className="muted small" title={t('member.note')}>
          {t('member.title')}: {members.map((m, i) => `${m.name} ${t(`member.${moodWord(moods[i])}`)}`).join(' · ')}
        </p>
      )}
      {seat === 'pm' && g.partners.length > 0 && (
        <p className="muted small" title={t('partner.note')}>
          {t('partner.title')}: {g.partners.map((p) => `${partyShort(t, p)} ${t(`partner.${partnerMood(campaign, p)}`)}`).join(' · ')}
        </p>
      )}
      <div className="gauge-row">
        <Gauge value={g.stability} label={<Term id="stability">{t('hint.stability')}</Term>} />
        <Gauge value={g.trust} label={<Term id="trust">{t('hint.trust')}</Term>} />
      </div>
      <p className="note">
        {t('orders.due', { n: k.length - k.week + 1 })}{' '}
        {seat === 'pm' && (k.week >= EARLIEST_DISSOLUTION ? t('orders.dissolve.can') : t('orders.dissolve.wait', { n: EARLIEST_DISSOLUTION - k.week }))}
      </p>
      {seat === 'pm' && canDissolve(campaign) && (
        <div className="button-row tight">
          <ConfirmButton label={t('orders.dissolve')} confirmLabel={t('orders.dissolve.confirm')} onConfirm={dissolve} />
        </div>
      )}

      <h3>{t('orders.focus')}</h3>
      <ul className="focus-list">
        {FOCUS_IDS.map((id) => (
          <li key={id}>
            <label className={o.focus === id ? 'focus active' : 'focus'}>
              <input type="radio" name="focus" checked={o.focus === id} onChange={() => setOrders({ focus: id, courting: id === 'leaders' ? o.courting ?? leaders[0] ?? null : o.courting })} />
              <span className="grow">
                <span className="action-title">{t(`focus.${id}`)}</span>
                <span className="action-meta">{t(`focus.${id}.desc`)}</span>
                {id === 'leaders' && o.focus === 'leaders' && (
                  <select value={o.courting ?? ''} onChange={(e) => setOrders({ courting: Number(e.target.value) })} aria-label={t('focus.leaders')}>
                    {leaders.map((p) => (
                      <option key={p} value={p}>{leaderName(t, p)} · {t(`relation.${relationWord(relation(campaign, me, p))}`)}</option>
                    ))}
                  </select>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>

      <h3>{t('orders.budget')}</h3>
      <ul>{(['machinery', 'media', 'research'] as const).map(budgetRow)}</ul>
      <p className="muted small"><Jargon>{t('orders.dossier', { n: Math.round(k.dossier) })}</Jargon></p>

      <h3>{t('orders.states')}</h3>
      <p className="muted small action-desc">{t('orders.states.desc')}</p>
      <div className="chips">
        {regions.map((st) => {
          const on = o.focusStates.includes(st);
          return (
            <button
              key={st} className={on ? 'chip active' : 'chip'} aria-pressed={on}
              onClick={() => setOrders({ focusStates: on ? o.focusStates.filter((x) => x !== st) : [...o.focusStates, st] })}
            >
              {regionLabel(t, world, st)} <span className="num">{Math.round(pc.machinery[world.states.indexOf(st)])}</span>
            </button>
          );
        })}
      </div>
      <p className="muted small">
        {o.focusStates.length ? t('orders.states.chosen', { states: targets.map((st) => regionLabel(t, world, st)).join(', ') }) : t('orders.states.none')}
        {' '}<button className="link inline" onClick={() => selectState(o.focusStates[0] ?? null)}>{t('orders.states.show')}</button>
      </p>

      <h3>{t('orders.statesGov')}</h3>
      <p className="muted small action-desc">
        {t('orders.statesGov.desc', { a: ROUNDS[0].week, b: ROUNDS[1].week, c: ROUNDS[2].week, rm: f.rm(scaled(world, STATE_GOVERNMENT_INCOME)) })}{' '}
        {k.rounds < ROUNDS.length
          ? t('orders.statesGov.next', { n: Math.max(0, ROUNDS[k.rounds].week - k.week), states: ROUNDS[k.rounds].states.map((st) => regionLabel(t, world, st)).join(', ') })
          : t('orders.statesGov.done')}
      </p>
      <div className="state-chips">
        {Object.entries(k.states).map(([st, p]) => (
          <span key={st} className={p === me ? 'state-chip mine' : 'state-chip'}>
            <i className="dot" data-party={p} style={{ background: partyColor(p) }} />{regionLabel(t, world, st)} <span className="muted">· {partyShort(t, p)}</span>
          </span>
        ))}
      </div>
      {Object.keys(k.house).length > 0 && <p className="note">{t('orders.house.changed', { n: Object.keys(k.house).length })}</p>}

      <h3>{t('orders.money')}</h3>
      <ul>
        <li className="action">
          <div className="grow">
            <span className="action-title">{t('orders.source.members')}</span>
            <span className="action-meta">{t('orders.source.members.desc')}</span>
          </div>
          <strong className="num">{f.rm(income.members)}</strong>
        </li>
        <li className="action">
          <div className="grow">
            <span className="action-title">{t('orders.source.donors')}</span>
            <span className="action-meta">{t('orders.source.donors.desc')}</span>
            <span className="action-meta num">{t('orders.perWeek', { rm: f.rm(income.donors) })}</span>
          </div>
          <LevelSwitch label={t('orders.source.donors')} value={o.donors} onChange={(level) => setOrders({ donors: level })} />
        </li>
        <li className="action">
          <div className="grow">
            <span className="action-title">{t('orders.source.state')}</span>
            <span className="action-meta">{t(governing ? 'orders.source.state.desc' : 'orders.source.state.no')}</span>
            {governing && <span className="action-meta num">{t('orders.perWeek', { rm: f.rm(income.state) })}</span>}
          </div>
          <LevelSwitch label={t('orders.source.state')} value={o.state} disabled={!governing} onChange={(level) => setOrders({ state: level })} />
        </li>
        <li className="action">
          <div className="grow">
            <span className="action-title">{t('orders.source.assets')}</span>
            <span className="action-meta">{t('orders.source.assets.desc')}</span>
            <span className="action-meta num">{t('orders.assets', { value: f.rm(k.assets), rm: f.rm(income.assets) })}</span>
          </div>
          <div className="button-row tight">
            <button className="btn small" disabled={pc.funds < lot * lots} onClick={() => invest(lots)}>{t('orders.buy', { rm: f.rm(lot * lots) })}</button>
            <input
              className="num"
              type="number"
              min={1}
              step={1}
              value={lots}
              onChange={(e) => setLots(Math.max(1, Number(e.target.value) || 1))}
              aria-label={t('orders.lots')}
            />
            <button className="btn small" disabled={k.assets < lot * lots} onClick={() => invest(-lots)}>{t('orders.sell')}</button>
          </div>
        </li>
        <li><Loan /></li>
        {income.states > 0 && (
          <li className="action">
            <div className="grow">
              <span className="action-title">{t('orders.source.states')}</span>
              <span className="action-meta">{t('orders.source.states.desc')}</span>
            </div>
            <strong className="num">{f.rm(income.states)}</strong>
          </li>
        )}
      </ul>
      <dl className="facts orders-facts">
        <div><dt>{t('orders.in')}</dt><dd className="num">{f.rm(income.total)}</dd></div>
        <div><dt>{t('orders.out')}</dt><dd className="num">{f.rm(spend.total)}</dd></div>
        <div><dt>{t('orders.net')}</dt><dd className={`num ${net < 0 ? 'neg' : ''}`}>{net < 0 ? '−' : '+'}{f.rm(Math.abs(net))}</dd></div>
        <div><dt>{t('hud.funds')}</dt><dd className="num">{f.rm(pc.funds)}</dd></div>
      </dl>
    </section>
  );
}
