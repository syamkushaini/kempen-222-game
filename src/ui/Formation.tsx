import { lazy, Suspense, useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { scaled } from '../sim/campaign/actions';
import { DEMANDS, SENIOR_COST, WANTS, clashWith, demandUnityCost } from '../sim/campaign/cast';
import { relation } from '../sim/campaign/diplomacy';
import {
  blocs, cashRef, demandsBarred, demandsOpen, emptyOffer, fairPosts, MEETINGS, mood, offerProblem, leadsOpposition, playerClaims, playerRole, pledged,
  postsKept, postsLeft, seniorsFree, stabilityBand, stillRunning, unityBill,
} from '../sim/campaign/formation';
import { OUSTED_BELOW } from '../sim/campaign/legacy';
import { FORMATION_WEEK } from '../sim/campaign/news';
import type { Campaign, DemandId, Formation, Offer, SeniorId } from '../sim/campaign/types';
import { electionResult } from '../sim/campaign/turn';
import { lastElection, majorityLine, type World } from '../sim/election';
import { PARTY_IDS } from '../sim/types';
import { useStore } from '../state/store';
import { ConfirmButton, GamePanel } from './SavesTab';
import { leaderName, partyColor, partyName, partyShort, relationWord, useFormat, useT, useWorld, type Format, type T } from './hooks';
import { AgainButtons } from './Aside';
import { Chamber } from './Chamber';
import { Portrait } from './Portrait';
import { houseSeating, talksSeating, talksFocus } from './seating';
import { canDraw3D } from './map3d';

// The physics engine and the scene that uses it are fetched only if a government falls.
const GovernmentFalls = lazy(() => import('./GovernmentFalls'));

/** Whether this fall has been shown already: once per game and week, so going back to the talks does not replay it. */
function fallSeen(key: string): boolean {
  try { return sessionStorage.getItem('k222.fall') === key; } catch { return true; }
}
function markFall(key: string) {
  try { sessionStorage.setItem('k222.fall', key); } catch { /* it will simply not show */ }
}
import { NewsLine } from './NewsTab';

const OTH = PARTY_IDS.indexOf('oth');
/** State governments are led by a Menteri Besar; the federal one by the Prime Minister. */
const headKind = (world: World) => (world.rules.kind === 'state' ? 'state' : 'general');

/** A change in a meter as a whole number with its sign. */
const signed = (n: number) => { const r = Math.round(n); return r > 0 ? `+${r}` : r < 0 ? `−${-r}` : '0'; };

/** Keeps an under-the-table offer inside the party's purse, rounding to a lot. */
const clampCash = (n: number, funds: number, step: number) => Math.max(0, Math.min(funds, Math.round(n / step) * step));

function describeOffer(t: T, f: Format, offer: Offer): string {
  const parts = [t(offer.posts === 1 ? 'form.offer.post' : 'form.offer.posts', { n: offer.posts })];
  if (offer.senior) parts.push(t(`senior.${offer.senior}`));
  for (const d of offer.demands) parts.push(t(`demand.${d}`));
  if (offer.cash > 0) parts.push(t('form.offer.cash', { rm: f.rm(offer.cash) }));
  return parts.join(' · ');
}

/** The talks as a chamber: those signed for one bid on the left, for its main rival on the right, the rest between. One line for each bid beneath. */
function ClaimBars({ f, me }: { f: Formation; me: number }) {
  const t = useT();
  const world = useWorld();
  const need = majorityLine(world);
  const shown = f.outcome ? [f.outcome.pm] : [...f.claimants].sort((a, b) => pledged(f, b) - pledged(f, a));
  const { focus, rival } = talksFocus(f, me);
  const sides = {
    left: f.outcome ? t('chamber.gov') : focus === me ? t('chamber.yours') : t('chamber.theirs', { name: partyShort(t, focus) }),
    right: f.outcome || rival === null ? t('chamber.opp') : t('chamber.theirs', { name: partyShort(t, rival) }),
    middle: t('chamber.free'),
  };
  return (
    <>
      <Chamber blocs={talksSeating(f, me)} need={need} sides={sides} />
      <ul className="claims">
        {shown.map((k) => (
          <li key={k} className={k === me ? 'mine' : ''}>
            <div className="result-label">
              <span><i className="dot" data-party={k} style={{ background: partyColor(k) }} />{leaderName(t, k)}{k === me && ` (${t('form.you')})`} · {partyShort(t, k)}</span>
              <strong className={`num ${pledged(f, k) >= need ? 'pos-text' : ''}`}>{pledged(f, k)}</strong>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Where a party stands in the talks, in a few words. */
function standing(t: T, c: Campaign, p: number): string {
  const f = c.formation!;
  if (p === OTH) {
    const mine = f.indep.filter((i) => i.pledge === c.player).length;
    const others = f.indep.filter((i) => i.pledge !== null && i.pledge !== c.player).length;
    return t('form.indep', { mine, others, free: f.indep.length - mine - others });
  }
  const to = f.pledge[p];
  if (to === p) return t('form.status.running');
  if (to === null) return t('form.status.free');
  return to === c.player ? t('form.status.yours') : t('form.status.signed', { party: partyShort(t, to) });
}

function OfferPanel({ bloc }: { bloc: number }) {
  const t = useT();
  const fmt = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const reply = useStore((s) => (s.offerReply?.party === bloc ? s.offerReply.result : null));
  const makeOffer = useStore((s) => s.offer);
  const soundOut = useStore((s) => s.soundOut);

  const f = campaign.formation!;
  const me = campaign.player;
  const id = PARTY_IDS[bloc];
  const [draft, setDraft] = useState<Offer>(() => f.offers[me][bloc] ?? emptyOffer());
  // What is being typed in the cash box; it is only rounded to a lot once typing stops, so "50000" can be typed through "5".
  const [typed, setTyped] = useState<string | null>(null);

  const known = f.known[bloc];
  const wants = WANTS[id];
  const left = Math.max(0, postsLeft(world, f, me, bloc));
  const seniors = seniorsFree(world, f, me, bloc);
  const open = demandsOpen(world, f, me, bloc);
  const barred = demandsBarred(world, f, me, bloc);
  const step = scaled(world, 25_000);
  const funds = campaign.parties[me]!.funds;
  const problem = offerProblem(world, campaign, bloc, draft);
  const running = bloc !== OTH && stillRunning(f, bloc, me);
  const feeling = known ? mood(world, campaign, bloc, draft) : null;
  const claims = playerClaims(campaign);
  const cabinet = world.rules.formation!.cabinet;
  const bill = unityBill(world, campaign, bloc, draft);
  // The party removes its leader at this level when a crisis is answered, and at half of it in any week.
  const ousted = campaign.career && bill.left <= OUSTED_BELOW ? (bill.left <= OUSTED_BELOW / 2 ? OUSTED_BELOW / 2 : OUSTED_BELOW) : null;

  const toggle = (d: DemandId) => setDraft({ ...draft, demands: draft.demands.includes(d) ? draft.demands.filter((x) => x !== d) : [...draft.demands, d] });
  const costOf = (d: DemandId) => {
    const def = DEMANDS[d], unity = demandUnityCost(me, d);
    return [
      unity > 0 && t('form.cost.unity', { n: unity }),
      def.trust > 0 && t('form.cost.trust', { n: def.trust }),
      def.treasury && t('form.cost.treasury'),
    ].filter(Boolean).join(' · ');
  };
  /** Why a concession cannot be added to this offer, in words, or nothing if it can. */
  const blockOf = (d: DemandId) => {
    const clash = clashWith(d, draft.demands);
    return barred[d] ? t('form.conflict.deal', { demand: t(`demand.${barred[d]}`) })
      : clash ? t('form.conflict.offer', { demand: t(`demand.${clash}`) })
      : open.includes(d) ? null : t('form.problem.demand');
  };
  // What is in the offer stays listed even when it can no longer be given, so that it can be taken out.
  const offerable = (Object.keys(DEMANDS) as DemandId[]).filter((d) => open.includes(d) || barred[d] || draft.demands.includes(d));
  // Once sounded out, only what they care about is worth listing, dearest wish first.
  const listed = known
    ? offerable.filter((d) => (wants.demands[d] ?? 0) > 0 || draft.demands.includes(d)).sort((a, b) => (wants.demands[b] ?? 0) - (wants.demands[a] ?? 0))
    : offerable;

  return (
    <section className="panel offer t-offer">
      <div className="panel-head with-face">
        <Portrait leader={bloc} size={48} />
        <h2 className="grow">{leaderName(t, bloc)}</h2>
        <span className="muted">{partyShort(t, bloc)} · {t(f.seats[bloc] === 1 ? 'state.seat1' : 'state.seats', { n: f.seats[bloc] })}</span>
      </div>
      <p className="muted small">{standing(t, campaign, bloc)}{bloc !== OTH && ` · ${t(`relation.${relationWord(relation(campaign, me, bloc))}`)}`}</p>
      {running && <p className="note">{t('form.running')}</p>}

      {!known && (
        <div className="action">
          <div className="grow">
            <span className="action-title">{t('form.soundOut')}</span>
            <span className="action-meta">{t('form.soundOut.desc')}</span>
          </div>
          <button className="btn small" disabled={f.meetings < 1} onClick={() => soundOut(bloc)}>{t('form.meeting1')}</button>
        </div>
      )}

      <h3>{t('form.posts')}</h3>
      <div className="stepper">
        <button className="btn small" disabled={draft.posts <= 0} onClick={() => setDraft({ ...draft, posts: draft.posts - 1 })} aria-label={t('form.less')}>−</button>
        <strong className="num">{draft.posts}</strong>
        <button className="btn small" disabled={draft.posts >= left} onClick={() => setDraft({ ...draft, posts: draft.posts + 1 })} aria-label={t('form.more')}>+</button>
        <span className="muted small">{t('form.posts.fair', { n: Math.max(1, Math.round(fairPosts(world, f, bloc))), kept: postsKept(world, f, me, bloc, draft.posts), total: cabinet })}</span>
      </div>

      {world.rules.formation!.seniors.length > 0 && (
        <label className="field">
          <span>{t('form.senior')}</span>
          <select value={draft.senior ?? ''} onChange={(e) => setDraft({ ...draft, senior: (e.target.value || null) as SeniorId | null })}>
            <option value="">{t('form.senior.none')}</option>
            {seniors.map((s) => <option key={s} value={s}>{t(`senior.${s}`)}{known && wants.senior === s ? ` ★` : ''}</option>)}
          </select>
        </label>
      )}
      {draft.senior && <span className="action-reason">{t('form.cost.unity', { n: SENIOR_COST[draft.senior] })}</span>}

      <h3>{t('form.demands')}</h3>
      <ul className="demands">
        {listed.map((d) => {
          const w = wants.demands[d] ?? 0;
          const on = draft.demands.includes(d), block = blockOf(d);
          return (
            <li key={d} className={block && !on ? 'blocked' : ''}>
              <label>
                <input type="checkbox" checked={on} disabled={!on && block !== null} onChange={() => toggle(d)} />
                <span className="grow">
                  <span className="action-title">{t(`demand.${d}`)}{known && w >= 0.25 ? ' ★' : known && w > 0 ? ' ☆' : ''}</span>
                  <span className="action-meta">{t(`demand.${d}.desc`)}</span>
                  {block
                    ? <span className="action-reason">{block}</span>
                    : costOf(d) && <span className="action-reason">{costOf(d)}</span>}
                  {!block && DEMANDS[d].trust < 0 && <span className="action-gain">{t('form.gain.trust', { n: -DEMANDS[d].trust })}</span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="muted small">{known ? t('form.stars') : t('form.demands.unknown')}</p>

      <h3>{t('form.cash')}</h3>
      <div className="stepper">
        <button className="btn small" disabled={draft.cash <= 0} onClick={() => setDraft({ ...draft, cash: Math.max(0, draft.cash - step) })} aria-label={t('form.less')}>−</button>
        <input
          className="num"
          type="number"
          min={0}
          max={funds}
          step={step}
          value={typed ?? draft.cash}
          onChange={(e) => setTyped(e.target.value)}
          onBlur={() => {
            if (typed !== null) setDraft({ ...draft, cash: clampCash(Number(typed) || 0, funds, step) });
            setTyped(null);
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          aria-label={t('form.cash')}
        />
        <button className="btn small" disabled={draft.cash + step > funds} onClick={() => setDraft({ ...draft, cash: draft.cash + step })} aria-label={t('form.more')}>+</button>
        <span className="muted small">
          {t('form.cash.note', { rm: fmt.rm(funds) })}
          {known && wants.cash >= 0.15 && ` ${t('form.cash.hint', { rm: fmt.rm(cashRef(world, f, bloc)) })}`}
          {known && wants.cash < 0.15 && ` ${t('form.cash.cold')}`}
        </span>
      </div>

      <h3>{t('form.unity')}</h3>
      <dl className="facts unity-bill">
        <div><dt>{t('form.unity.offer')}</dt><dd className="num">{signed(-bill.offer)}</dd></div>
        <div><dt>{t('form.unity.total')}</dt><dd className="num">{signed(-bill.total)}</dd></div>
        <div className={ousted ? 'danger' : ''}><dt>{t('form.unity.left')}</dt><dd className="num">{Math.round(campaign.parties[me]!.unity)} → {bill.left}</dd></div>
      </dl>
      <p className="muted small">{t('form.unity.note')}</p>
      {ousted && <p className="note bad" role="alert">{t(ousted < OUSTED_BELOW ? 'form.unity.oustNow' : 'form.unity.oust', { left: bill.left, limit: ousted })}</p>}

      {feeling && feeling !== 'ambition' && <p className={`note ${feeling === 'accept' ? 'good' : feeling === 'refuse' ? 'bad' : ''}`}>{t(`form.mood.${feeling}`)}</p>}
      {reply && (
        <p className={`note ${reply.signed > 0 ? 'good' : 'bad'}`}>
          <strong>{leaderName(t, bloc)}:</strong>{' '}
          {bloc === OTH ? t('form.reply.indep', { n: reply.signed, total: f.indep.length })
            : reply.reply === 'accept' || reply.reply === 'refuse' ? t(`voice.${id}.${reply.reply}` as StringKey)
            : t(`form.reply.${reply.reply}`)}
        </p>
      )}
      <div className="button-row">
        <button className="btn primary" disabled={!claims || f.meetings < 1 || problem !== null} onClick={() => makeOffer(bloc, draft)}>
          {t('form.makeOffer')} ▸
        </button>
        <span className="muted small">
          {!claims ? t('form.notClaiming') : f.meetings < 1 ? t('form.noMeetings') : problem ? t(`form.problem.${problem}`) : t('form.meeting1')}
        </span>
      </div>
    </section>
  );
}

function OutcomePanel() {
  const t = useT();
  const fmt = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const quitToTitle = useStore((s) => s.quitToTitle);
  const viewNight = useStore((s) => s.viewNight);
  const nextTerm = useStore((s) => s.nextTerm);
  const resumeTerm = useStore((s) => s.resumeTerm);
  const career = campaign.career;
  const f = campaign.formation!, o = f.outcome!;
  const role = playerRole(campaign, o);
  // In opposition, "lead" is for the largest party outside the government; any other is simply in opposition.
  const sentence = role === 'opposition' && !leadsOpposition(campaign, o, (electionResult(world, campaign) ?? lastElection(world)).tally) ? 'oppositionBack' : role;
  const band = stabilityBand(o.stability);
  const head = t(`form.head.${headKind(world)}`);
  return (
    <section className="panel summary t-parties">
      <h2>{t('form.outcome.title')}</h2>
      <p className={`verdict ${role === 'pm' ? 'majority' : role === 'opposition' ? 'lost' : ''}`}>{t(`form.outcome.${sentence}`, { head })}</p>
      <p>
        {t(o.minority ? 'form.outcome.minority' : o.day === 0 ? 'form.outcome.outright' : 'form.outcome.line', {
          party: partyName(t, o.pm), n: o.seats, need: majorityLine(world),
        })}
      </p>
      <dl className="facts">
        <div><dt>{t('form.fact.seats')}</dt><dd className="num">{o.seats}</dd></div>
        <div><dt>{t('form.fact.partners')}</dt><dd className="num">{o.partners.length}</dd></div>
        <div><dt>{t('form.fact.stability')}</dt><dd className="num">{o.stability}</dd></div>
        <div><dt>{t('form.fact.trust')}</dt><dd className="num">{o.trust}</dd></div>
      </dl>
      <p className={`note ${band === 'solid' ? 'good' : band === 'doomed' || band === 'shaky' ? 'bad' : ''}`}>{t(`form.band.${band}`)}</p>
      {o.deals.some(Boolean) && (
        <>
          <h3>{t('form.outcome.deals')}</h3>
          <ul className="deal-list">
            {o.deals.map((d, p) => d && (
              <li key={p}><i className="dot" data-party={p} style={{ background: partyColor(p) }} /><strong>{partyName(t, p)}</strong> <span className="muted">{describeOffer(t, fmt, d)}</span></li>
            ))}
          </ul>
          <p className="muted small">{t(career ? 'form.outcome.career' : 'form.outcome.later')}</p>
        </>
      )}
      <div className="button-row">
        {career
          ? <button className="btn primary" onClick={career.midterm ? resumeTerm : nextTerm}>{t(career.midterm ? 'career.resume' : 'career.next')} ▸</button>
          : <AgainButtons />}
        {world.rules.kind !== 'hung' && !career?.midterm && <button className="btn" onClick={viewNight}>{t('form.viewNight')}</button>}
        {career && <button className="btn" onClick={quitToTitle}>{t('hud.quit')}</button>}
      </div>
    </section>
  );
}

/** The talks after an election that nobody won: who has the numbers, who wants what, and the Palace's deadline. */
export function FormationScreen() {
  const t = useT();
  const fmt = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const endDay = useStore((s) => s.endDay);
  const backRival = useStore((s) => s.backRival);
  const askTerms = useStore((s) => s.askTerms);
  const askReply = useStore((s) => s.askReply);
  const claimAgain = useStore((s) => s.claimAgain);
  const [selected, setSelected] = useState<number | null>(null);

  const f = campaign.formation!;
  const me = campaign.player;
  const need = majorityLine(world);
  const done = f.outcome !== null;
  const claims = playerClaims(campaign);
  const others = blocs(f).filter((p) => p !== me);
  const ready = claims && pledged(f, me) >= need;
  const offersToMe = f.claimants.filter((k) => k !== me && f.offers[k][me]);
  const days = [...new Set(campaign.news.filter((n) => n.week >= FORMATION_WEEK).map((n) => n.week))].sort((a, b) => b - a);
  const kind = headKind(world);
  // A government that has just lost the House: the benches come down once, where 3D is on and motion is welcome.
  const gameId = useStore((s) => s.game!.id);
  const want3d = useStore((s) => s.settings.map3d);
  const career = campaign.career;
  const fallKey = `${gameId}:${career?.term}:${career?.week}`;
  const calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [fallShown, setFallShown] = useState(() => fallSeen(fallKey));
  const falling = !!career?.midterm && !done && f.day === 1 && !fallShown && want3d && canDraw3D() && !calm;

  return (
    <main className="layout talks-layout">
      {falling && career && (
        <Suspense fallback={null}>
          <GovernmentFalls blocs={houseSeating(world, campaign)} party={career.government.pm} onDone={() => { markFall(fallKey); setFallShown(true); }} />
        </Suspense>
      )}
      <section className="map-column talks">
        <section className="panel t-bars">
          <div className="panel-head">
            <h2>{t(`form.title.${kind}`)}</h2>
            <span className="muted">{t('tally.majority', { n: need })}</span>
          </div>
          <ClaimBars f={f} me={me} />
        </section>

        {done ? <OutcomePanel /> : (
          <section className="panel t-parties">
            <div className="panel-head">
              <h2>{t('form.parties')}</h2>
              <span className="muted">{t('form.parties.hint')}</span>
            </div>
            <ul className="bloc-grid">
              {others.map((p) => (
                <li key={p}>
                  <button className={selected === p ? 'bloc-card active' : 'bloc-card'} style={{ borderTopColor: partyColor(p) }} aria-pressed={selected === p} onClick={() => setSelected(p)}>
                    <Portrait leader={p} size={40} />
                    <strong>{partyName(t, p)}</strong>
                    <span className="small">{p === OTH ? t('form.indep.blurb') : leaderName(t, p)}</span>
                    <span className="muted small">
                      {t(f.seats[p] === 1 ? 'state.seat1' : 'state.seats', { n: f.seats[p] })}
                      {p !== OTH && ` · ${t(`relation.${relationWord(relation(campaign, me, p))}`)}`}
                    </span>
                    <span className={`badge ${f.pledge[p] === me ? 'leaning' : 'plain'}`}>{standing(t, campaign, p)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="panel news t-log">
          <div className="panel-head"><h2>{t('form.log')}</h2></div>
          {days.length === 0 && <p className="muted">{t('form.log.empty')}</p>}
          {days.map((day) => (
            <div key={day}>
              <h3>{day === FORMATION_WEEK ? t('form.day0') : t('form.day', { n: day - FORMATION_WEEK })}</h3>
              <ul>{campaign.news.map((item, i) => (item.week === day ? <NewsLine key={i} item={item} /> : null)).reverse()}</ul>
            </div>
          ))}
        </section>
      </section>

      <aside className="sidebar">
        {!done && <>
          <section className="panel t-status">
            <div className="panel-head">
              <h2>{t('form.dayOf', { n: f.day, total: f.deadline })}</h2>
              <span className="muted">{t('form.meetings', { n: f.meetings, total: MEETINGS })}</span>
            </div>
            <p className="muted small">{t(f.unityAdvice ? 'form.palace.unity' : f.extended ? 'form.palace.extended' : 'form.palace.waiting', { n: need, days: Math.max(0, f.deadline - f.day) })}</p>
            {!claims && f.pledge[me] !== null && <p className="note">{t('form.backing', { party: partyName(t, f.pledge[me]!) })}</p>}
            {!claims && f.pledge[me] === null && (
              <p className="note">{t('form.youFree')} <button className="link inline" onClick={claimAgain}>{t('form.claimAgain')}</button></p>
            )}
            <div className="button-row">
              {ready || f.meetings === 0 || !claims
                ? <button className="btn primary" onClick={endDay}>{ready ? t('form.toPalace') : t('form.endDay')} ▸</button>
                : <ConfirmButton className="btn" label={`${t('form.endDay')} ▸`} confirmLabel={`${t('form.endDayConfirm')} ▸`} onConfirm={endDay} />}
            </div>
          </section>

          {offersToMe.length > 0 && (
            <section className="panel t-offers">
              <div className="panel-head"><h2>{t('form.offersToYou')}</h2></div>
              <ul>
                {offersToMe.map((k) => (
                  <li key={k} className="action">
                    <Portrait leader={k} size={38} />
                    <div className="grow">
                      <span className="action-title">{leaderName(t, k)} · {partyShort(t, k)}</span>
                      <span className="action-meta">{describeOffer(t, fmt, f.offers[k][me]!)}</span>
                    </div>
                    {f.pledge[me] !== k && <ConfirmButton label={t('form.back')} confirmLabel={t('form.backConfirm')} onConfirm={() => backRival(k)} />}
                    {f.outcome === undefined && (
                      <div className="ask-row" title={t('form.ask.title', { party: partyShort(t, k) })}>
                        <span className="muted small">{t('form.ask')}:</span>
                        {(['posts', 'senior', 'cash', 'demand'] as const).map((a) => (
                          <button key={a} type="button" className="btn small" disabled={f.meetings < 1} onClick={() => askTerms(k, a)}>{t(`form.ask.${a}`)}</button>
                        ))}
                        {askReply?.party === k && <span className="small">{t(`form.ask.${askReply.reply}`, { party: partyShort(t, k) })}</span>}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <p className="muted small">{t('form.offersToYou.note')}</p>
            </section>
          )}

          {selected !== null && f.seats[selected] > 0 ? <OfferPanel key={selected} bloc={selected} /> : <p className="muted small t-offer">{t('form.pick')}</p>}
        </>}
        <GamePanel />
      </aside>
    </main>
  );
}
