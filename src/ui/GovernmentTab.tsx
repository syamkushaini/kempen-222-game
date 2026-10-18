import { useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { DEMANDS } from '../sim/campaign/cast';
import { seatOf } from '../sim/campaign/events';
import {
  agenda, canMotion, canPull, confidenceCount, deficit, economicMood, houseSits, MAX_BILLS, MINISTER_NAMES, needsBill, prepWeeks, weeksToSitting, whipCount,
} from '../sim/campaign/govern';
import { scaled } from '../sim/campaign/actions';
import { MONTH, commitmentWeekly, lineWeekly, measureWeekly, takingsWeekly } from '../sim/campaign/treasury';
import { EconomyBook } from './EconomyBook';
import { TreasuryCard } from './TreasuryCard';
import { EconomyCharts } from './EconomyCharts';
import { EconomyTools, MarketsPanel } from './EconomyTools';
import { Fold } from './Fold';
import { TRAIT_EFFECT } from '../sim/campaign/govern';
import { MeterTools } from './MeterTools';
import { defenceShown } from '../sim/campaign/defence';
import { LEVER_IDS, LINE_IDS, MEASURE_IDS, type Dial } from '../sim/campaign/types';
import { MAX_MEASURES } from '../sim/campaign/office';
import { SECTOR, SECTORS, SECTOR_IDS, canAid, sectorsOf } from '../sim/campaign/sectors';
import { leverStrain } from '../sim/campaign/govern';
import { Gauge } from './Gauge';
import { POWERS, POWER_IDS, canUse, inStateCareer, powerWait } from '../sim/campaign/statepowers';
import { SPEAKER_NAMES, leanWord, rebelShare, speakerOf } from '../sim/campaign/chamber';
import { GRAND, canUnite } from '../sim/campaign/grand';
import { ksuOf } from '../sim/campaign/ksu';
import { canOfferDeputy, isRival } from '../sim/campaign/plots';
import { COMMITTEE, canInquire, committeeWait, inquiryOdds } from '../sim/campaign/committee';
import { CHALLENGE, METHODS, canChallenge, challengeOdds, challengeWait, isAct, isBill, opposition, targets } from '../sim/campaign/challengePolicy';
import { canExpel } from '../sim/campaign/alliance';
import { SUPPLY_CASH, canRenew, canSupply, discontent } from '../sim/campaign/supply';
import { houseTally } from '../sim/campaign/contests';
import { SHADOW_COST, canShadow, shadowOf } from '../sim/campaign/shadow';
import { ministerName, portfoliosOf } from '../sim/campaign/office';
import type { PortfolioId } from '../sim/campaign/types';
import { majorityLine } from '../sim/election';
import { CROSS_MONEY, CROSS_STAKES, canCross, crossChance, crossCount, seatsHeldBy } from '../sim/campaign/crossing';
import { canClaim, claimChance } from '../sim/campaign/claims';
import { useStore } from '../state/store';
import { ConfirmButton } from './SavesTab';
import { partyColor, partyName, partyShort, useFog, useFormat, useT, useWorld, type T } from './hooks';
import { PestelCard } from './PestelCard';
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
export type GovernmentPart = 'house' | 'economy' | 'markets' | 'acts' | 'meters' | 'allies' | 'cabinet';

/**
 * What a government (or an opposition) deals with between elections, in six screens that each answer one question:
 * the economy's figures and the budget; the markets; the acts for the economy; the meters; the House; and who stands with the
 * government, and who is in the cabinet. Every screen is a part of this one component, so that they share what they need.
 */
export function GovernmentTab({ part = 'house' }: { part?: GovernmentPart }) {
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
  const crossFloor = useStore((s) => s.crossFloor);
  const claimPromise = useStore((s) => s.claimPromise);
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
        <h2>{part === 'house' ? t(`house.title.${seat}`) : t(`tab.${part}`)}</h2>
        <span className="muted">{t('orders.term', { n: k.term })}</span>
      </div>
      {part === 'house' && <Chamber blocs={houseSeating(world, campaign)} need={need} sides={{ left: t('chamber.gov'), right: t('chamber.opp'), middle: t('chamber.cross') }} />}

      {part === 'economy' && <>
      <h3>{t('house.economy')}</h3>
      <dl className="facts orders-facts">
        <div><dt>{t('house.growth')}</dt><dd className="num">{e.growth.toFixed(1)}%</dd></div>
        <div><dt>{t('house.inflation')}</dt><dd className="num">{e.inflation.toFixed(1)}%</dd></div>
        <div><dt>{t('house.jobless')}</dt><dd className="num">{e.jobless.toFixed(1)}%</dd></div>
        <div><dt>{t('house.debt')}</dt><dd className={`num ${e.debt > 75 ? 'neg' : ''}`}>{e.debt.toFixed(0)}%</dd></div>
      </dl>
      <p className="muted small">{t(feel > 0.5 ? 'house.feel.good' : feel < -0.5 ? 'house.feel.bad' : 'house.feel.flat')} {t('house.deficit', { pct: deficit(k).toFixed(1) })}</p>

      <TreasuryCard />
      <Fold title={t('fold.economy')}>
        <EconomyCharts />
        <EconomyBook />
      </Fold>
      </>}
      {part === 'meters' && <>
        <PestelCard />
        <MeterTools />
      </>}
      {part === 'acts' && <EconomyTools />}
      {part === 'markets' && <>
        <MarketsPanel />
        <Sectors />
      </>}

      {part === 'economy' && pm && (
        <>
          <h3>{t('house.budget')}</h3>
          <p className="muted small action-desc">{t('house.budget.desc', { n: toBudget })}</p>
          <ul>
            {LINE_IDS.filter((id) => id !== 'defence' || defenceShown(campaign)).map((id) => (
              <li key={id} className="action">
                <div className="grow">
                  <span className="action-title">{t(`line.${id}`)}</span>
                  <span className="action-meta">{t(`line.${id}.desc`)}</span>
                  <span className="action-meta num">{t('cost.line', { cut: f.rm(lineWeekly(world, id, -1) * MONTH), hold: f.rm(lineWeekly(world, id, 0) * MONTH), boost: f.rm(lineWeekly(world, id, 1) * MONTH) })}</span>
                </div>
                <DialSwitch label={t(`line.${id}`)} value={k.budget.lines[id] ?? 0} onChange={(value) => setBudget({ line: id, value })} />
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
                        {t(`measure.${m}`)} <span className="muted small">+{f.rm(measureWeekly(world, m) * MONTH)}{t('cost.perMonth')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </li>
            <li className="action">
              <div className="grow">
                <span className="action-title">{t('measures.commit')}</span>
                <span className="action-meta">{t('measures.commit.desc')}</span>
                <span className="action-meta num">{t('cost.commit.now', { rm: f.rm(commitmentWeekly(world, Math.max(0, k.fiscal)) * MONTH) })}</span>
              </div>
            </li>
            <li className="action">
              <div className="grow">
                <span className="action-title">{t('line.tax')}</span>
                <span className="action-meta">{t('line.tax.desc')}</span>
                <span className="action-meta num">{t('cost.tax', { cut: f.rm(takingsWeekly(world, campaign, -1) * MONTH), hold: f.rm(takingsWeekly(world, campaign, 0) * MONTH), raise: f.rm(takingsWeekly(world, campaign, 1) * MONTH) })}</span>
              </div>
              <DialSwitch tax label={t('line.tax')} value={k.budget.tax} onChange={(value) => setBudget({ tax: true, value })} />
            </li>
          </ul>
          <p className="note">{t('house.budget.plan', { pct: deficit(k, k.budget).toFixed(1), now: deficit(k).toFixed(1) })}</p>
        </>
      )}

      {part === 'house' && <HouseFigures />}
      {part === 'allies' && pm && inStateCareer(campaign) && <StatePowers />}
      {part === 'allies' && pm && <SupplyDeals />}
      {part === 'allies' && pm && <Unity />}
      {part === 'allies' && pm && k.government.partners.length > 0 && <PutOut />}
      {part === 'cabinet' && seat === 'opp' && <ShadowCabinet />}
      {part === 'house' && seat === 'opp' && <CommitteeInquiry />}
      {part === 'house' && seat === 'opp' && <PolicyChallenge />}

      {part === 'cabinet' && (k.appointments?.length ?? 0) > 0 && (
        <section className="appointments" aria-label={t('appoint.title')}>
          <h3>{t('appoint.title')} <span className="count-badge">{k.appointments!.length}</span></h3>
          <p className="muted small action-desc">{t('appoint.desc')}</p>
          {k.appointments!.map((a, n) => (
            <Fold key={a.portfolio} title={t(`portfolio.${a.portfolio}`)} open={n === 0}>
            <div className="appoint-post">
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
            </Fold>
          ))}
        </section>
      )}

      {part === 'cabinet' && <>
      <h3>{t('house.cabinet')}</h3>
      <ul>
        {k.cabinet.map((m) => (
          <li key={m.portfolio} className="action">
            <Portrait minister={m.name} party={m.party} size={36} />
            <div className="grow">
              <span className="action-title">{t(`portfolio.${m.portfolio}`)}</span>
              <span className="action-meta">{ministerName(m)} · {partyShort(t, m.party)} · <span aria-label={t('house.skill', { n: m.skill })}>{'★'.repeat(m.skill)}{'☆'.repeat(5 - m.skill)}</span>{m.acting && <> · <span className="badge plain">{t('appoint.acting')}</span></>}{m.trait && <> · <span className="badge plain">{t(`trait.${m.trait}` as StringKey)}</span></>}</span>
            </div>
            <RenameButton portfolio={m.portfolio} current={ministerName(m)} />
            {pm && <ConfirmButton label={t('house.reshuffle')} confirmLabel={t(m.party === me ? 'house.reshuffle.own' : 'house.reshuffle.theirs')} onConfirm={() => reshuffle(m.portfolio)} />}
          </li>
        ))}
      </ul>
      {pm && <p className="muted small">{t('house.cabinet.note')}</p>}
      </>}

      {part === 'house' && pm && (
        <>
          <h3>{t('house.promises')}</h3>
          <p className="muted small action-desc">{t('house.promises.desc', { n: MAX_BILLS })}</p>
          <p className="muted small">{houseSits(k.week) ? t('house.sitting.now') : t('house.sitting.next', { n: weeksToSitting(k.week) })} {(k.fatigue ?? 0) >= 0.5 && t('house.fatigue', { n: (k.fatigue ?? 0).toFixed(1) })}</p>
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

        </>
      )}

      {part === 'allies' && pm && (
        <>
          <h3>{t('house.levers')}</h3>
          <p className="muted small action-desc">{t('house.levers.desc')}</p>
          <ul>
            {LEVER_IDS.map((id) => (
              <li key={id} className="action">
                <div className="grow">
                  <span className="action-title">{t(`lever.${id}`)}</span>
                  <span className="action-meta">{t(`lever.${id}.desc${fog && id === 'agency' ? '.fog' : ''}` as StringKey)}</span>
                  {leverStrain(k, id) > 0 && <span className="action-reason">{t('house.lever.strain', { n: k.leverUses?.[id] ?? 0 })}</span>}
                </div>
                <ConfirmButton label={t('house.lever.pull')} confirmLabel={t('house.lever.confirm')} disabled={!canPull(campaign, id)} onConfirm={() => pullLever(id)} />
              </li>
            ))}
          </ul>
        </>
      )}

      {part === 'house' && !pm && (k.claims?.length ?? 0) > 0 && (
        <>
          <h3>{t('claims.title')}</h3>
          <p className="muted small action-desc">{t('claims.desc', { party: partyName(t, k.government.pm) })}</p>
          <ul>
            {k.claims!.map((o, i) => {
              const check = canClaim(campaign, i);
              return (
                <li key={i} className="action">
                  <span className="dot" data-party={o.party} style={{ background: partyColor(o.party) }} />
                  <div className="grow">
                    <span className="action-title">{t(`demand.${o.demand}`)}</span>
                    <span className="action-meta num">
                      {o.done ? t('claims.done') : k.week >= o.due ? t('claims.late', { n: k.week - o.due }) : t('claims.due', { n: o.due - k.week })}
                      {!o.done && <> · {t('claims.chance', { pct: Math.round(claimChance(campaign, o) * 100) })}</>}
                    </span>
                    {!o.done && !check.ok && check.reason === 'wait' && <span className="action-reason">{t('claims.wait', { n: check.weeks ?? 0 })}</span>}
                  </div>
                  {!o.done && <button className="btn small" disabled={!check.ok} onClick={() => claimPromise(i)}>{t('claims.press')}</button>}
                </li>
              );
            })}
          </ul>
          <p className="muted small">{t('claims.note')}</p>
        </>
      )}

      {part === 'house' && !pm && (
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
          {seat === 'opp' && (
            <>
              <h3>{t('cross.title')}</h3>
              <p className="muted small action-desc">{t('cross.desc')}</p>
              <ul>
                {[k.government.pm, ...k.government.partners].map((p) => (
                  <li key={p} className="action">
                    <span className="dot" data-party={p} style={{ background: partyColor(p) }} />
                    <div className="grow">
                      <span className="action-title">{partyName(t, p)}</span>
                      <span className="action-meta num">{t('cross.seats', { n: seatsHeldBy(world, campaign, p).length })}</span>
                      {(() => { const check = canCross(world, campaign, p, 1); return !check.ok && check.reason !== 'target' ? <span className="action-reason">{t(`cross.no.${check.reason}` as StringKey, { n: check.weeks ?? 0 })}</span> : null; })()}
                    </div>
                    <div className="button-row tight">
                      {CROSS_STAKES.map((stake) => (
                        <ConfirmButton key={stake} className="btn small" label={t('cross.try', { stake, n: crossCount(world, campaign, p, stake), pct: Math.round(crossChance(world, campaign, p, stake) * 100) })} confirmLabel={t('cross.confirm', { rm: f.rm(scaled(world, CROSS_MONEY) * stake) })} disabled={!canCross(world, campaign, p, stake).ok} onConfirm={() => crossFloor(p, stake)} danger />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
              <p className="muted small">{t('cross.note')}</p>
            </>
          )}
        </>
      )}

      {part === 'house' && <>
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
      </>}
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
  const renew = useStore((s) => s.renewSupply);
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
                {discontent(campaign, d.party) && <span className="action-reason">{t('supply.restless')}</span>}
              </div>
              <button className="btn small" disabled={!canRenew(world, campaign, d.party).ok} onClick={() => renew(d.party)}>{t('supply.renew')}</button>
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


/** What the state itself has to spend and to give away: the land, the forests, its own development money. */
function StatePowers() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const use = useStore((s) => s.usePower);
  return (
    <>
      <h3>{t('powers.title')}</h3>
      <p className="muted small action-desc">{t('powers.desc')}</p>
      <ul>
        {POWER_IDS.map((id) => {
          const check = canUse(world, campaign, id);
          return (
            <li className="action" key={id}>
              <div className="grow">
                <span className="action-title">{t(`power.${id}`)}</span>
                <span className="action-meta">{t(`power.${id}.desc`)} {POWERS[id].money > 0 ? `+${f.rm(scaled(world, POWERS[id].money))}` : `−${f.rm(scaled(world, -POWERS[id].money))}`}</span>
                {!check.ok && check.reason === 'wait' && <span className="action-reason">{t('powers.wait', { n: powerWait(campaign, id) })}</span>}
                {!check.ok && check.reason === 'funds' && <span className="action-reason">{t('reason.funds')}</span>}
              </div>
              <button className="btn small" disabled={!check.ok} onClick={() => use(id)}>{t('powers.use')}</button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** Who sits in the chair, who heads the civil service, and how the party’s own backbenchers feel. */
function HouseFigures() {
  const t = useT();
  const campaign = useStore((s) => s.game!.campaign);
  const k = campaign.career!;
  const sp = speakerOf(campaign);
  const mine = campaign.parties[campaign.player]!.unity;
  const head = k.government.pm === campaign.player && !k.limited ? ksuOf(campaign) : null;
  return (
    <>
      <h3>{t('chamber.title')}</h3>
      <ul>
        <li className="action">
          <div className="grow">
            <span className="action-title">{t('chamber.speaker', { name: SPEAKER_NAMES[sp.name] })}</span>
            <span className="action-meta">{t(`chamber.lean.${leanWord(sp.lean)}` as StringKey)}</span>
          </div>
        </li>
        <li className="action">
          <div className="grow">
            <span className="action-title">{t('chamber.backbench')}</span>
            <span className="action-meta num">{rebelShare(mine) > 0 ? t('chamber.rebels', { pct: Math.round(rebelShare(mine) * 100) }) : t('chamber.calm')}</span>
          </div>
        </li>
        {head && (
          <li className="action">
            <div className="grow">
              <span className="action-title">{t('ksu.title', { name: MINISTER_NAMES[head.name] })}</span>
              <span className="action-meta">{t(`ksu.outlook.${head.outlook}` as StringKey)} · {t('ksu.trust', { n: Math.round(head.trust) })}</span>
            </div>
          </li>
        )}
      </ul>
    </>
  );
}

/** A government of national unity, asked for when the government is falling. */
function Unity() {
  const t = useT();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const form = useStore((s) => s.formUnity);
  const k = campaign.career!;
  const check = canUnite(world, campaign);
  if (!k.grand && (!check.ok && (check.reason === 'calm' || check.reason === 'once'))) return null;
  return (
    <>
      <h3>{t('grand.title')}</h3>
      <p className="muted small action-desc">{t('grand.desc', { n: GRAND.weeks })}</p>
      {k.grand
        ? <p className="note">{t('grand.running', { n: Math.max(0, k.grand.until - k.week) })}</p>
        : (
          <div className="button-row tight">
            <ConfirmButton label={t('grand.form')} confirmLabel={t('grand.confirm')} disabled={!check.ok} onConfirm={() => form()} />
            {!check.ok && check.reason === 'none' && <span className="action-reason">{t('grand.none')}</span>}
          </div>
        )}
    </>
  );
}

/** The sectors of the economy: how each is doing, who lives by it, and, for the head of government, a hand to lend one. */
export function Sectors() {
  const t = useT();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const aid = useStore((s) => s.aidSector);
  const k = campaign.career!;
  const now = sectorsOf(k);
  return (
    <>
      <h3>{t('sectors.title')}</h3>
      <p className="muted small action-desc">{t('sectors.desc', { n: SECTOR.every })}</p>
      <ul>
        {SECTOR_IDS.map((id) => {
          const check = canAid(world, campaign, id);
          return (
            <li className="action" key={id}>
              <div className="grow">
                <span className="action-title">{t(`sector.${id}`)}</span>
                <span className="action-meta">{t('sectors.lives', { blocs: SECTORS[id].blocs.map((b) => t(`bloc.${b}` as StringKey)).join(', ') })}</span>
                <Gauge value={now[id]} label={t('sectors.level')} />
              </div>
              {check.ok && <button className="btn small" onClick={() => aid(id)}>{t('sectors.aid')}</button>}
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** The opposition may call the government before a select committee, and spend its dossier on it. */
function CommitteeInquiry() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const inquiry = useStore((s) => s.inquiry);
  const k = campaign.career!;
  const check = canInquire(world, campaign);
  return (
    <>
      <h3>{t('committee.title')}</h3>
      <p className="muted small action-desc">{t('committee.desc', { dossier: COMMITTEE.dossier, rm: f.rm(scaled(world, COMMITTEE.money)), n: COMMITTEE.every })}</p>
      <ul>
        <li className="action">
          <div className="grow">
            <span className="action-meta num">{t('committee.state', { dossier: Math.round(k.dossier), pct: Math.round(inquiryOdds(campaign) * 100) })}</span>
            {!check.ok && check.reason !== 'seat' && check.reason !== 'phase' && (
              <span className="action-reason">{t(`committee.no.${check.reason}` as StringKey, { n: committeeWait(campaign) })}</span>
            )}
          </div>
          <button className="btn small" disabled={!check.ok} onClick={() => inquiry()}>{t('committee.open')}</button>
        </li>
      </ul>
    </>
  );
}

/** The opposition may contest any policy of the government: in the House, in court, or before the public. */
function PolicyChallenge() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const challengePolicy = useStore((s) => s.challengePolicy);
  const k = campaign.career!;
  const list = targets(campaign);
  const wait = challengeWait(campaign);
  return (
    <>
      <h3>{t('contest.title')}</h3>
      <p className="muted small action-desc">{t('contest.desc', { n: CHALLENGE.every })}</p>
      {wait > 0 && <p className="muted small">{t('contest.wait', { n: wait })}</p>}
      {list.length === 0 && <p className="muted small">{t('contest.none')}</p>}
      <ul>
        {list.map((id) => {
          const done = k.challenged?.done.includes(id);
          const kind = isAct(campaign, id) ? 'act' : isBill(campaign, id) ? 'bill' : 'programme';
          return (
            <li className="action" key={id}>
              <div className="grow">
                <span className="action-title">{t(`pledge.${id}` as StringKey)}</span>
                <span className="action-meta">{t(`contest.kind.${kind}` as StringKey)} · {t(opposition(world, id) > 0 ? 'contest.unpopular' : 'contest.popular')}</span>
                {done && <span className="action-reason">{t('contest.done')}</span>}
              </div>
              {METHODS.map((m) => {
                const check = canChallenge(world, campaign, id, m);
                const odds = m === 'public' ? null : Math.round(challengeOdds(world, campaign, id, m) * 100);
                return (
                  <button
                    key={m} className="btn small" disabled={!check.ok}
                    title={t('contest.cost', { rm: f.rm(scaled(world, CHALLENGE.money[m])), dossier: CHALLENGE.dossier[m] })}
                    onClick={() => challengePolicy(id, m)}
                  >
                    {t(`contest.${m}` as StringKey)}{odds !== null && ` · ${odds}%`}
                  </button>
                );
              })}
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** The head of government may put a partner out of the cabinet: it leaves an enemy, and the others look to themselves. */
function PutOut() {
  const t = useT();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const expel = useStore((s) => s.expel);
  const offerDeputy = useStore((s) => s.offerDeputy);
  const k = campaign.career!;
  return (
    <>
      <h3>{t('expel.title')}</h3>
      <p className="muted small action-desc">{t('expel.desc')}</p>
      <ul>
        {k.government.partners.map((p) => {
          const check = canExpel(world, campaign, p);
          return (
            <li className="action" key={p}>
              <div className="grow">
                <span className="action-title">{partyName(t, p)}</span>
                {!check.ok && check.reason === 'majority' && <span className="action-reason">{t('expel.majority')}</span>}
              </div>
              {isRival(campaign, p, houseTally(world, campaign)) && <span className="badge marginal">{t('rival.badge')}</span>}
              <button className="btn small" disabled={!canOfferDeputy(campaign, p).ok} onClick={() => offerDeputy(p)}>{t('rival.deputy')}</button>
              <ConfirmButton label={t('expel.do')} confirmLabel={t('expel.confirm')} disabled={!check.ok} onConfirm={() => expel(p)} />
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** The opposition's cabinet in waiting: someone to shadow each post. */
/** A small control to give a minister a name of the player's own: the invented one stays if they leave it empty. */
function RenameButton({ portfolio, current, shadow = false }: { portfolio: PortfolioId; current: string; shadow?: boolean }) {
  const t = useT();
  const rename = useStore((s) => s.renameMinister);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(current);
  if (!open) return <button className="btn small" onClick={() => { setText(current); setOpen(true); }}>{t('house.rename')}</button>;
  return (
    <form className="rename-row" onSubmit={(e) => { e.preventDefault(); rename(portfolio, text, shadow); setOpen(false); }}>
      <input className="text-input" value={text} maxLength={24} autoFocus autoComplete="off" aria-label={t('house.rename')} placeholder={t('house.rename.hint')} onChange={(e) => setText(e.target.value)} />
      <button className="btn small primary" type="submit">{t('house.rename.ok')}</button>
    </form>
  );
}

function ShadowCabinet() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const shadow = useStore((s) => s.shadow);
  const named = shadowOf(campaign);
  const may = canShadow(world, campaign);
  return (
    <>
      <h3>{t('shadow.title')} <span className="muted small num">{Object.keys(named).length} / {portfoliosOf(campaign.scenario).length}</span></h3>
      <p className="muted small action-desc">{t('shadow.desc', { rm: f.rm(scaled(world, SHADOW_COST)) })}</p>
      <ul>
        {portfoliosOf(campaign.scenario).map((id) => {
          const who = named[id];
          return (
            <li className="action" key={id}>
              <div className="grow">
                <span className="action-title">{t(`portfolio.${id}`)}</span>
                <span className="action-meta">
                  {who ? <>{ministerName(who)} <span aria-label={t('house.skill', { n: who.skill })}>{'★'.repeat(who.skill)}{'☆'.repeat(5 - who.skill)}</span></> : t('shadow.empty')}
                </span>
              </div>
              {who && <RenameButton portfolio={id} current={ministerName(who)} shadow />}
              <button className="btn small" disabled={!may} onClick={() => shadow(id)}>{t(who ? 'shadow.replace' : 'shadow.name')}</button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
