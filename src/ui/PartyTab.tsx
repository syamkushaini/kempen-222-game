import { termIncome, termSpending } from '../sim/campaign/career';
import {
  ACTIVITY_IDS, ACTIVITIES, HOLDINGS, grassrootsLift, HOLDING_IDS, activityCost, activityWait, baseRolls, canDoActivity, holdingScale, holdingsOf, rollsOf, rollsTarget,
} from '../sim/campaign/party';
import { scaled } from '../sim/campaign/actions';
import { useStore } from '../state/store';
import { Gauge } from './Gauge';
import { Brief } from './Brief';
import { useFormat, useT, useWorld } from './hooks';

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

      <h3>{t('party.holdings')}</h3>
      <p className="muted small action-desc">{t('party.holdings.desc')}</p>
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
