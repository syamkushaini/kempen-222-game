import type { StringKey } from '../i18n/strings';
import { DEMANDS } from '../sim/campaign/cast';
import { seatOf } from '../sim/campaign/events';
import {
  agenda, canMotion, canPull, confidenceCount, deficit, economicMood, MAX_BILLS, MINISTER_NAMES, needsBill, prepWeeks, whipCount,
} from '../sim/campaign/govern';
import { scaled } from '../sim/campaign/actions';
import { TRAIT_EFFECT } from '../sim/campaign/govern';
import { LEVER_IDS, LINE_IDS, MEASURE_IDS, type Dial } from '../sim/campaign/types';
import { MAX_MEASURES } from '../sim/campaign/office';
import { SUPPLY_CASH, canSupply } from '../sim/campaign/supply';
import { houseTally } from '../sim/campaign/contests';
import { majorityLine } from '../sim/election';
import { useStore } from '../state/store';
import { ConfirmButton } from './SavesTab';
import { partyColor, partyName, partyShort, useFog, useFormat, useT, useWorld, type T } from './hooks';
import { NationCard } from './NationCard';
import { Portrait } from './Portrait';
import { Chamber } from './Chamber';
import { houseSeating } from './seating';

const DIALS: Dial[] = [-1, 0, 1];

/** A bill's name: the promise or the concession it carries out. */
export function billName(t: T, id: string): string {
  const [kind, name] = id.split(':');
  return t(`${kind === 'pledge' ? 'pledge' : 'demand'}.${name}` as StringKey);
}

function DialSwitch(props: { value: Dial; label: string; tax?: boolean; onChange(value: Dial): void }) {
  const t = useT();
  return (
    <div className="segmented small" role="group" aria-label={props.label}>
      {DIALS.map((d) => (
        <button key={d} className={props.value === d ? 'active' : ''} aria-pressed={props.value === d} onClick={() => props.onChange(d)}>
          {t(`dial.${d === -1 ? 'cut' : d === 0 ? 'hold' : props.tax ? 'raise' : 'boost'}`)}
        </button>
      ))}
    </div>
  );
}

/**
 * The business of government and of the House: the economy, the budget, the
 * cabinet, bills and promises, what partners are owed, and votes of
 * confidence. What can be done here depends on where the player sits.
 */
export function GovernmentTab() {
  const t = useT();
  const f = useFormat();
  const fog = useFog();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const setBudget = useStore((s) => s.setBudget);
  const reshuffle = useStore((s) => s.reshuffle);
  const appoint = useStore((s) => s.appoint);
  const tableBill = useStore((s) => s.tableBill);
  const deliver = useStore((s) => s.deliver);
  const pullLever = useStore((s) => s.pullLever);
  const tableMotion = useStore((s) => s.tableMotion);
  const leaveGovernment = useStore((s) => s.leaveGovernment);
  const retire = useStore((s) => s.retire);

  const k = campaign.career!;
  const me = campaign.player;
  const seat = seatOf(campaign);
  const pm = seat === 'pm';
  const e = k.economy;
  const feel = economicMood(e);
  const need = majorityLine(world);
  const weekOfYear = ((k.week - 1) % 52) + 1;
  const toBudget = weekOfYear <= 40 ? 40 - weekOfYear : 92 - weekOfYear;
  const available = pm ? agenda(campaign) : [];
  const r = k.record;

  return (
    <section className="orders house">
      <div className="panel-head">
        <h2>{t(`house.title.${seat}`)}</h2>
        <span className="muted">{t('orders.term', { n: k.term })}</span>
      </div>
      <Chamber blocs={houseSeating(world, campaign)} need={need} sides={{ left: t('chamber.gov'), right: t('chamber.opp'), middle: t('chamber.cross') }} />

      <h3>{t('house.economy')}</h3>
      <dl className="facts orders-facts">
        <div><dt>{t('house.growth')}</dt><dd className="num">{e.growth.toFixed(1)}%</dd></div>
        <div><dt>{t('house.inflation')}</dt><dd className="num">{e.inflation.toFixed(1)}%</dd></div>
        <div><dt>{t('house.jobless')}</dt><dd className="num">{e.jobless.toFixed(1)}%</dd></div>
        <div><dt>{t('house.debt')}</dt><dd className={`num ${e.debt > 75 ? 'neg' : ''}`}>{e.debt.toFixed(0)}%</dd></div>
      </dl>
      <p className="muted small">{t(feel > 0.5 ? 'house.feel.good' : feel < -0.5 ? 'house.feel.bad' : 'house.feel.flat')} {t('house.deficit', { pct: deficit(k).toFixed(1) })}</p>

      <NationCard />

      {pm && (
        <>
          <h3>{t('house.budget')}</h3>
          <p className="muted small action-desc">{t('house.budget.desc', { n: toBudget })}</p>
          <ul>
            {LINE_IDS.map((id) => (
              <li key={id} className="action">
                <div className="grow">
                  <span className="action-title">{t(`line.${id}`)}</span>
                  <span className="action-meta">{t(`line.${id}.desc`)}</span>
                </div>
                <DialSwitch label={t(`line.${id}`)} value={k.budget.lines[id]} onChange={(value) => setBudget({ line: id, value })} />
              </li>
            ))}
            <li className="action measures">
              <div className="grow">
                <span className="action-title">{t('measures.title')}</span>
                <span className="action-meta">{t('measures.desc', { n: MAX_MEASURES })}</span>
                <div className="chips" role="group" aria-label={t('measures.title')}>
                  {MEASURE_IDS.map((m) => {
                    const on = k.budget.measures?.includes(m) ?? false;
                    return (
                      <button key={m} className={on ? 'chip active' : 'chip'} aria-pressed={on} disabled={!on && (k.budget.measures?.length ?? 0) >= MAX_MEASURES} title={t(`measure.${m}.desc`)} onClick={() => setBudget({ measure: m, on: !on })}>
                        {t(`measure.${m}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </li>
            <li className="action">
              <div className="grow">
                <span className="action-title">{t('line.tax')}</span>
                <span className="action-meta">{t('line.tax.desc')}</span>
              </div>
              <DialSwitch tax label={t('line.tax')} value={k.budget.tax} onChange={(value) => setBudget({ tax: true, value })} />
            </li>
          </ul>
          <p className="note">{t('house.budget.plan', { pct: deficit(k, k.budget).toFixed(1), now: deficit(k).toFixed(1) })}</p>
        </>
      )}

      {pm && <SupplyDeals />}

      {(k.appointments?.length ?? 0) > 0 && (
        <section className="appointments" aria-label={t('appoint.title')}>
          <h3>{t('appoint.title')} <span className="count-badge">{k.appointments!.length}</span></h3>
          <p className="muted small action-desc">{t('appoint.desc')}</p>
          {k.appointments!.map((a) => (
            <div key={a.portfolio} className="appoint-post">
              <strong className="action-title">{t(`portfolio.${a.portfolio}`)}</strong>
              <ul>
                {a.options.map((o, i) => (
                  <li key={o.name} className="candidate">
                    <Portrait minister={o.name} party={me} size={40} />
                    <div className="grow">
                      <span className="action-title">{MINISTER_NAMES[o.name]} <span className="badge plain">{t(`trait.${o.trait}` as StringKey)}</span></span>
                      <span className="action-meta"><span aria-label={t('house.skill', { n: o.skill })}>{'★'.repeat(o.skill)}{'☆'.repeat(5 - o.skill)}</span></span>
                      <span className="cand-good small"><b>+ {t('appoint.gain')}:</b> {t(`trait.${o.trait}.good` as StringKey, { rm: f.rm(scaled(world, TRAIT_EFFECT.fixer.funds)) })}</span>
                      <span className="cand-bad small"><b>− {t('appoint.risk')}:</b> {t(`trait.${o.trait}.bad` as StringKey)}</span>
                    </div>
                    <button className="btn small" onClick={() => appoint(a.portfolio, i)}>{t('appoint.button')}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      <h3>{t('house.cabinet')}</h3>
      <ul>
        {k.cabinet.map((m) => (
          <li key={m.portfolio} className="action">
            <Portrait minister={m.name} party={m.party} size={36} />
            <div className="grow">
              <span className="action-title">{t(`portfolio.${m.portfolio}`)}</span>
              <span className="action-meta">{MINISTER_NAMES[m.name]} · {partyShort(t, m.party)} · <span aria-label={t('house.skill', { n: m.skill })}>{'★'.repeat(m.skill)}{'☆'.repeat(5 - m.skill)}</span>{m.acting && <> · <span className="badge plain">{t('appoint.acting')}</span></>}{m.trait && <> · <span className="badge plain">{t(`trait.${m.trait}` as StringKey)}</span></>}</span>
            </div>
            {pm && <ConfirmButton label={t('house.reshuffle')} confirmLabel={t(m.party === me ? 'house.reshuffle.own' : 'house.reshuffle.theirs')} onConfirm={() => reshuffle(m.portfolio)} />}
          </li>
        ))}
      </ul>
      {pm && <p className="muted small">{t('house.cabinet.note')}</p>}

      {pm && (
        <>
          <h3>{t('house.promises')}</h3>
          <p className="muted small action-desc">{t('house.promises.desc', { n: MAX_BILLS })}</p>
          <ul>
            {k.promises.map((id) => {
              const bill = `pledge:${id}`;
              const state = k.delivery[id];
              const inHouse = k.bills.find((b) => b.id === bill);
              const whip = whipCount(world, campaign, bill, me);
              return (
                <li key={id} className="action">
                  <div className="grow">
                    <span className="action-title">{t(`pledge.${id}`)}</span>
                    <span className="action-meta num">
                      {state ? t(`house.bill.${state}`) : inHouse ? t('house.bill.inHouse', { n: Math.max(0, inHouse.weeks) }) : t('house.whip', { yes: whip.yes, no: whip.no, wavering: whip.wavering })}
                    </span>
                  </div>
                  {!state && !inHouse && (
                    <button className="btn small" disabled={!available.includes(bill) || k.bills.length >= MAX_BILLS} onClick={() => tableBill(bill)}>
                      {t('house.table', { n: prepWeeks(k, bill) })}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {k.promises.length === 0 && <p className="muted small">{t('house.promises.none')}</p>}

          <h3>{t('house.owed')}</h3>
          {k.obligations.length === 0 && <p className="muted small">{t('house.owed.none')}</p>}
          <ul>
            {k.obligations.map((o, i) => {
              const bill = `demand:${o.demand}`;
              const inHouse = k.bills.find((b) => b.id === bill);
              const def = DEMANDS[o.demand];
              return (
                <li key={i} className="action">
                  <span className="dot" data-party={o.party} style={{ background: partyColor(o.party) }} />
                  <div className="grow">
                    <span className="action-title">{t(`demand.${o.demand}`)}</span>
                    <span className="action-meta num">
                      {partyShort(t, o.party)} · {o.done ? t('house.owed.done') : inHouse ? t('house.bill.inHouse', { n: Math.max(0, inHouse.weeks) })
                        : k.week > o.due - 52 && k.week <= o.due ? t('house.owed.due', { n: o.due - k.week }) : t('house.owed.later', { n: Math.max(0, o.due - k.week) })}
                    </span>
                    {!o.done && !inHouse && (
                      <span className="action-meta">
                        {needsBill(o.demand) ? t('house.owed.bill') : def.treasury ? t('form.cost.treasury') : def.trust > 0 ? t('house.owed.shady') : t('house.owed.free')}
                      </span>
                    )}
                  </div>
                  {!o.done && !inHouse && (
                    <button className="btn small" disabled={needsBill(o.demand) && k.bills.length >= MAX_BILLS} onClick={() => deliver(i)}>{t('house.deliver')}</button>
                  )}
                </li>
              );
            })}
          </ul>

          <h3>{t('house.levers')}</h3>
          <p className="muted small action-desc">{t('house.levers.desc')}</p>
          <ul>
            {LEVER_IDS.map((id) => (
              <li key={id} className="action">
                <div className="grow">
                  <span className="action-title">{t(`lever.${id}`)}</span>
                  <span className="action-meta">{t(`lever.${id}.desc${fog && id === 'agency' ? '.fog' : ''}` as StringKey)}</span>
                </div>
                <ConfirmButton label={t('house.lever.pull')} confirmLabel={t('house.lever.confirm')} disabled={!canPull(campaign, id)} onConfirm={() => pullLever(id)} />
              </li>
            ))}
          </ul>
        </>
      )}

      {!pm && (
        <>
          <h3>{t('house.parliament')}</h3>
          <p className="muted small action-desc">
            {t('house.confidence', { party: partyName(t, k.government.pm), n: confidenceCount(world, campaign), need })}
          </p>
          <ul>
            {seat === 'opp' ? (
              <li className="action">
                <div className="grow">
                  <span className="action-title">{t('house.motion')}</span>
                  <span className="action-meta">{t('house.motion.desc')}</span>
                </div>
                <ConfirmButton label={t('house.motion.table')} confirmLabel={t('house.motion.confirm')} disabled={!canMotion(campaign)} onConfirm={tableMotion} />
              </li>
            ) : (
              <li className="action">
                <div className="grow">
                  <span className="action-title">{t('house.leave')}</span>
                  <span className="action-meta">{t('house.leave.desc')}</span>
                </div>
                <ConfirmButton label={t('house.leave.go')} confirmLabel={t('house.leave.confirm')} disabled={campaign.inbox.length > 0} onConfirm={leaveGovernment} danger />
              </li>
            )}
          </ul>
        </>
      )}

      <h3>{t('house.career')}</h3>
      <dl className="facts orders-facts">
        <div><dt>{t('house.record.pm')}</dt><dd className="num">{(r.weeksPm / 52).toFixed(1)}</dd></div>
        <div><dt>{t('house.record.elections')}</dt><dd className="num">{r.elections}</dd></div>
        <div><dt>{t('house.record.kept')}</dt><dd className="num">{r.kept.length}</dd></div>
        <div><dt>{t('house.record.broken')}</dt><dd className="num">{r.broken}</dd></div>
      </dl>
      <div className="button-row">
        <ConfirmButton className="btn" label={t('house.retire')} confirmLabel={t('house.retire.confirm')} disabled={campaign.inbox.length > 0} onConfirm={retire} danger />
      </div>
    </section>
  );
}


/** Parties outside the cabinet that can be asked to keep the government in office, and the deals already made. */
function SupplyDeals() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const supply = useStore((s) => s.supply);
  const k = campaign.career!;
  const seats = houseTally(world, campaign);
  const parties = seats.map((n, p) => ({ n, p })).filter(({ n, p }) => n > 0 && !k.government.partners.includes(p) && p !== k.government.pm && p !== campaign.player && !!campaign.parties[p]);
  const rows = parties.map(({ n, p }) => ({ n, p, cash: canSupply(world, campaign, p, 'cash'), policy: canSupply(world, campaign, p, 'policy') }));
  const deals = k.supply ?? [];
  const why = (r: ReturnType<typeof canSupply>) => (r.ok ? null : r.reason === 'none' || r.reason === 'phase' || r.reason === 'already' ? null : t(`supply.reason.${r.reason}` as StringKey));
  return (
    <>
      <h3>{t('supply.title')}</h3>
      <p className="muted small action-desc">{t('supply.desc')}</p>
      {deals.length > 0 && (
        <ul>
          {deals.map((d) => (
            <li className="action" key={d.party}>
              <div className="grow">
                <span className="action-title">{partyName(t, d.party)}</span>
                <span className="action-meta num">{t('supply.until', { week: d.until })}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ul>
        {rows.filter((r) => r.cash.ok || r.policy.ok || why(r.cash) || why(r.policy)).map((r) => (
          <li className="action" key={r.p}>
            <div className="grow">
              <span className="action-title">{partyName(t, r.p)} <span className="muted small num">· {r.n}</span></span>
              {!r.cash.ok && !r.policy.ok && <span className="action-reason">{why(r.cash) ?? why(r.policy)}</span>}
            </div>
            <div className="button-row tight">
              <button className="btn small" disabled={!r.cash.ok} onClick={() => supply(r.p, 'cash')}>{t('supply.cash', { rm: f.rm(scaled(world, SUPPLY_CASH)) })}</button>
              <button className="btn small" disabled={!r.policy.ok} onClick={() => supply(r.p, 'policy')}>{t('supply.policy')}</button>
            </div>
          </li>
        ))}
      </ul>
      {rows.every((r) => !r.cash.ok && !r.policy.ok && !why(r.cash) && !why(r.policy)) && deals.length === 0 && <p className="muted small">{t('supply.none')}</p>}
    </>
  );
}
