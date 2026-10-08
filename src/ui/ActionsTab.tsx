import { useEffect, useState, type ReactNode } from 'react';
import type { StringKey } from '../i18n/strings';
import { ACTIONS, PITCHED, actionCost, canDo, expectedPitchGain, expectedSeatGain, debateOdds, expectedYield, hasLocal, localPlace, spendingLimit } from '../sim/campaign/actions';
import { ISSUE_IDS, POSTURES, type IssueId, type Posture } from '../sim/campaign/types';
import { weatherIn } from '../sim/campaign/weather';
import { MEDIA_AIMED, resentfulOf, segmentShare, segmentsOf, type SegmentId } from '../sim/campaign/segments';
import { probeChance } from '../sim/campaign/spending';
import { suggestions, type Suggestion } from '../sim/campaign/suggest';
import type { ActionId, ActionTarget, Family } from '../sim/campaign/types';
import { BLOC_IDS, isMinor, type BlocId, type RegionId } from '../sim/types';
import { useStore } from '../state/store';
import { partyColor, partyShort, regionLabel, useFog, useFormat, useSpot, useT, useWorld, contestName } from './hooks';
import { Loan } from './Loan';
import { Brief } from './Brief';
import { Icon, type IconName } from './Icon';
import { NominationsPanel } from './Nominations';
import { EntriesPanel } from './Entries';

const FAMILIES: { family: Family; actions: ActionId[] }[] = [
  { family: 'ground', actions: ['ceramah', 'walkabout', 'megarally', 'townhall', 'charity', 'youth', 'festival', 'local'] },
  { family: 'machinery', actions: ['canvass', 'gotv', 'build', 'conference'] },
  { family: 'media', actions: ['tv', 'social', 'billboards', 'radio', 'debate', 'manifesto', 'attack', 'troops'] },
  { family: 'funds', actions: ['dinner', 'crowdfund', 'tycoon'] },
];

/** The picture that goes with each thing a party can do. Always beside its name, never instead of it. */
const ACTION_ICON: Record<ActionId, IconName> = {
  ceramah: 'megaphone', walkabout: 'walk', megarally: 'flag', canvass: 'home', gotv: 'ballot', build: 'tool',
  tv: 'tv', social: 'phone', billboards: 'board', attack: 'bolt', dinner: 'coins', crowdfund: 'heart', tycoon: 'crown',
  townhall: 'mic', charity: 'heart', youth: 'star', festival: 'star', conference: 'people', debate: 'chat', manifesto: 'doc', radio: 'mic', local: 'flag', troops: 'bolt',
};

const GROUPS_KEY = 'k222.groups';
type GroupKey = Family | 'suggested';
/** Every group starts closed, each with a one-line count on its header; the player opens what they want and the choice is remembered. */
const DEFAULT_OPEN: Record<GroupKey, boolean> = { suggested: false, ground: false, machinery: false, media: false, funds: false };

function loadOpen(): Record<GroupKey, boolean> {
  try {
    const raw = JSON.parse(localStorage.getItem(GROUPS_KEY) ?? 'null');
    if (raw && typeof raw === 'object') {
      const open = { ...DEFAULT_OPEN };
      for (const group of Object.keys(DEFAULT_OPEN) as GroupKey[]) if (typeof raw[group] === 'boolean') open[group] = raw[group];
      return open;
    }
  } catch { /* the groups start where they usually do */ }
  return DEFAULT_OPEN;
}

export function ActionsTab() {
  const t = useT();
  const f = useFormat();
  const spot = useSpot();
  const fog = useFog();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const selectedSeat = useStore((s) => s.selectedSeat);
  const selectedState = useStore((s) => s.selectedState);
  const act = useStore((s) => s.act);
  const selectSeat = useStore((s) => s.selectSeat);
  // While the adviser is walking the player through, every group stays open so nothing she names is hidden.
  const guided = useStore((s) => !!s.game?.tutorial);
  const [open, setOpen] = useState(loadOpen);
  const setGroup = (group: GroupKey, value: boolean) => {
    const next = { ...open, [group]: value };
    setOpen(next);
    try { localStorage.setItem(GROUPS_KEY, JSON.stringify(next)); } catch { /* the choice is only for this visit */ }
  };

  // The voter group a seat event is pitched to; a new seat starts with a pitch to everyone.
  const [segment, setSegment] = useState<SegmentId | null>(null);
  // A debate: the question to be answered, and the way of answering it.
  const hottest = campaign.career ? [...ISSUE_IDS].sort((a, b) => campaign.career!.salience[ISSUE_IDS.indexOf(b)] - campaign.career!.salience[ISSUE_IDS.indexOf(a)]).slice(0, 4) : [];
  const [debateTopic, setDebateTopic] = useState<IssueId | undefined>(undefined);
  const [debatePosture, setDebatePosture] = useState<Posture>('policy');
  // The voter group a television, radio or social media push is aimed at; nobody in particular to begin with.
  const [mediaSegment, setMediaSegment] = useState<BlocId | null>(null);
  useEffect(() => { setSegment(null); }, [selectedSeat]);

  const me = campaign.player;
  const pc = campaign.parties[me]!;
  const seat = selectedSeat ? world.seats[world.seatIndex.get(selectedSeat)!] : null;
  // State actions follow the map: the open state, else the selected seat's state, else where the leader is.
  const state: RegionId = selectedState ?? seat?.state ?? pc.location;
  const area = world.rules.kind === 'general' ? 'state' : 'area';
  const contesting = !!seat && PITCHED.some((id) => world.rules.actions.includes(id)) && canDo(world, campaign, me, 'walkabout', { seat: seat.id }).ok;
  // Attacks are aimed at the parties that matter nationally, not at a party of one seat.
  const rivals = campaign.parties.map((p, i) => (p && i !== me && !isMinor(i) ? i : -1)).filter((i) => i >= 0);

  /** Whether an action can be done now, or only waits for the player to pick a seat on the map. */
  const available = (id: ActionId) => {
    const targets: ActionTarget[] =
      ACTIONS[id].target === 'seat' ? [{ seat: seat?.id, ...(segment && PITCHED.includes(id) ? { segment } : {}) }]
      : ACTIONS[id].target === 'state' ? [{ state }]
      : ACTIONS[id].target === 'party' ? rivals.map((party) => ({ party }))
      : [{}];
    return targets.some((target) => { const check = canDo(world, campaign, me, id, target); return check.ok || check.reason === 'noTarget'; });
  };

  /** An action's name: a local event is named for the place it belongs to. */
  const nameOf = (id: ActionId, st?: RegionId) => (id === 'local' && hasLocal(world, st) ? t(`local.${localPlace(world, st)}` as StringKey) : t(`action.${id}` as StringKey));

  /** What an action is called when it is aimed at something. */
  const titleOf = (id: ActionId, target: ActionTarget) => {
    const name = nameOf(id, target.state);
    if (target.seat) return `${name} — ${world.seats[world.seatIndex.get(target.seat)!].name}`;
    if (target.state) return `${name} — ${regionLabel(t, world, target.state)}`;
    if (target.party !== undefined) return `${name} — ${partyShort(t, target.party)}`;
    return name;
  };

  /** The extra fact shown beside an action's cost: what a fundraiser should bring in, or how strong the machinery is. */
  const extraFor = (id: ActionId, target: ActionTarget): string | undefined => {
    if (id === 'dinner') return t('actions.expected', { rm: f.rm(expectedYield(world, campaign, me, 'dinner', target.state)) });
    if (id === 'crowdfund' || id === 'tycoon') return t('actions.expected', { rm: f.rm(expectedYield(world, campaign, me, id)) });
    if (ACTIONS[id].target === 'state' && ACTIONS[id].family === 'machinery') return t('actions.machinery', { n: pc.machinery[world.states.indexOf(target.state!)] });
    return undefined;
  };

  /** Why an action is being suggested. */
  const hintFor = (s: Suggestion): ReactNode => {
    switch (s.why) {
      case 'close': {
        const target = world.seats[world.seatIndex.get(s.target.seat!)!];
        return (
          <>
            {t('suggest.close', { seat: target.name })}{' '}
            <button className="link inline" onClick={() => selectSeat(target.id, target.state)}>{t('suggest.map')}</button>
          </>
        );
      }
      case 'state': {
        // An action aimed at a party or at nobody reaches the whole contest, not one state.
        const label = s.target.state ? regionLabel(t, world, s.target.state) : contestName(t, world);
        return s.close ? t('suggest.state', { n: s.close, state: label }) : t('suggest.stateAny', { state: label });
      }
      case 'attack': return t('suggest.attack', { party: partyShort(t, s.target.party!) });
      case 'gotv': return t('suggest.gotv');
      case 'funds': return t('suggest.funds');
      default: return t('suggest.national');
    }
  };

  // Not while the adviser is guiding: her steps name what to do.
  const ideas = guided ? [] : suggestions(world, campaign);

  const endWeek = useStore((s) => s.endWeek);
  const setPreview = useStore((s) => s.setPreview);
  /** Opens the fundraising group and brings it into view: the way out of a blocked action that costs too much. */
  const raiseMoney = () => {
    setGroup('funds', true);
    setTimeout(() => document.getElementById('family-funds')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  };

  const row = (id: ActionId, target: ActionTarget, key: string, title: string, extra?: string, hint?: ReactNode) => {
    const check = canDo(world, campaign, me, id, target);
    const cost = actionCost(world, campaign, me, id, target);
    const gain = target.seat ? expectedSeatGain(world, campaign, me, id, target.seat, target.segment) : null;
    const reason = check.ok ? null
      : check.reason === 'noTarget' ? t(`reason.noTarget.${ACTIONS[id].target === 'state' ? area : (ACTIONS[id].target as 'seat' | 'party')}`)
      : t(`reason.${check.reason}` as StringKey);
    return (
      <li
        key={key} className={`action action-card family-${ACTIONS[id].family}${check.ok ? '' : ' blocked'}`}
        // Pointing at an action that lands on a seat shows that seat on the map before anything is spent.
        onMouseEnter={() => setPreview(target.seat ?? null)} onMouseLeave={() => setPreview(null)}
        onFocus={() => setPreview(target.seat ?? null)} onBlur={() => setPreview(null)}
      >
        <span className="row-icon"><Icon name={ACTION_ICON[id]} size={20} /></span>
        <div className="grow">
          <span className="action-title">{title}</span>
          <span className="chips-line num">
            <span className="cost-chip">{f.days(cost.days)}</span>
            <span className="cost-chip">{cost.money > 0 ? f.rm(cost.money) : t('cost.free')}</span>
            {cost.travelDays > 0 && <span className="cost-chip">{t('cost.travel', { days: f.days(cost.travelDays) })}</span>}
            {extra && <span className="cost-chip">{extra}</span>}
            {gain !== null && gain > 0 && <span className="cost-chip gain" title={t('actions.gain.note')}>{t('actions.gain', { n: gain })}</span>}
          </span>
          {hint && <span className="action-hint">{hint}</span>}
          {reason && (
            <span className="action-reason">
              {reason}
              {/* a blocked action says what would unblock it, and offers it */}
              {!check.ok && check.reason === 'funds' && ACTIONS[id].family !== 'funds' && <> <button className="link inline" onClick={raiseMoney}>{t('actions.fix.funds')}</button></>}
              {!check.ok && check.reason === 'days' && <> <button className="link inline" onClick={() => endWeek()}>{t('actions.fix.days')}</button></>}
            </span>
          )}
        </div>
        <button className={`btn small primary${spot(`go-${id}`) ? ' spot' : ''}`} disabled={!check.ok} onClick={() => act(id, target)} aria-label={`${t('actions.go')}: ${title}`}>
          {t('actions.go')}
        </button>
      </li>
    );
  };

  const render = (id: ActionId) => {
    const name = nameOf(id, state);
    const stateName = regionLabel(t, world, state);
    switch (ACTIONS[id].target) {
      case 'seat': {
        const target: ActionTarget = { seat: seat?.id, ...(segment && PITCHED.includes(id) ? { segment } : {}) };
        const aimed = target.segment ? ` · ${t(`bloc.${target.segment}`)}` : '';
        return row(id, target, id, `${name} — ${seat ? seat.name : t('actions.noSeat')}${aimed}`);
      }
      case 'state': {
        const target: ActionTarget = { state, ...(mediaSegment && MEDIA_AIMED.includes(id as never) ? { segment: mediaSegment } : {}) };
        const aimed = target.segment ? ` · ${t(`bloc.${target.segment}`)}` : '';
        return row(id, target, id, `${name} — ${stateName}${aimed}`, extraFor(id, target));
      }
      case 'party':
        return rivals.map((r) => row(id, { party: r, ...(id === 'debate' ? { topic: debateTopic, posture: debatePosture } : {}) }, `${id}-${r}`, `${name} — ${partyShort(t, r)}`, id === 'debate' && campaign.career ? t('debate.odds', { pct: Math.round(debateOdds(world, campaign, me, r, debateTopic, debatePosture) * 100) }) : undefined));
      default: {
        const target: ActionTarget = mediaSegment && MEDIA_AIMED.includes(id as never) ? { segment: mediaSegment } : {};
        return row(id, target, id, target.segment ? `${name} · ${t(`bloc.${target.segment}`)}` : name, extraFor(id, target));
      }
    }
  };

  return (
    <section className="actions">
      <NominationsPanel />
      <EntriesPanel />
      <p className="target-line">
        <span className="muted">{t('actions.target')}:</span>{' '}
        <i className="dot" data-party={me} style={{ background: partyColor(me) }} />
        <strong>{seat && world.seats.length > 1 ? `${seat.name}, ` : ''}{regionLabel(t, world, state)}</strong>
        {pc.chiefs[state] && <span className="badge plain">{t('chiefs.badge', { level: t(`chiefs.level.${pc.chiefs[state]}`) })}</span>}
      </p>
      <p className={`muted small spend ${pc.spent > spendingLimit(world) ? 'over' : ''}`}>
        {t('spend.line', { spent: f.rm(pc.spent), limit: f.rm(spendingLimit(world)) })}
        {pc.fined ? ` ${t('spend.fined')}` : pc.spent > spendingLimit(world) ? ` ${fog ? t('spend.over.fog') : t('spend.over', { pct: f.pct(probeChance(world, campaign, me), 0) })}` : ''}
      </p>
      {seat && contesting && <PitchPicker seatId={seat.id} segment={segment} onPick={setSegment} />}
      {ideas.length > 0 && (
        <details className="action-family suggested" open={open.suggested} onToggle={(e) => setGroup('suggested', e.currentTarget.open)}>
          <summary>
            <h3>{t('suggest.title')}</h3>
            <span className="muted small">{t('suggest.count', { n: ideas.length })}</span>
          </summary>
          <p className="muted small action-desc">{t('suggest.note')}</p>
          <ul className="action-list">
            {ideas.map((s) => (
              <li key={`${s.id}-${JSON.stringify(s.target)}`} className="action-group">
                <ul>{row(s.id, s.target, `${s.id}-${JSON.stringify(s.target)}`, titleOf(s.id, s.target), extraFor(s.id, s.target), hintFor(s))}</ul>
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className={`muted small weather weather-${weatherIn(world, campaign, state)}`}>{t(`weather.${weatherIn(world, campaign, state)}` as StringKey, { state: regionLabel(t, world, state) })}</p>
      {FAMILIES.map(({ family, actions: all }) => {
        const actions = all.filter((id) => world.rules.actions.includes(id));
        if (actions.length === 0) return null;
        return (
          <details key={family} id={`family-${family}`} className="action-family" open={guided || open[family]} onToggle={(e) => { if (!guided) setGroup(family, e.currentTarget.open); }}>
            <summary>
              <h3>{t(`family.${family}`)}</h3>
              <span className="muted small">{t('actions.group', { n: actions.length, ready: actions.filter(available).length })}</span>
            </summary>
            <ul className="action-list">
              {family === 'media' && actions.some((id) => MEDIA_AIMED.includes(id as never)) && (
                <li className="action-group"><MediaAim segment={mediaSegment} onPick={setMediaSegment} /></li>
              )}
              {actions.map((id) => (
                <li key={id} className="action-group">
                  {id === 'debate' && hottest.length > 0 && (
                    <section className="pitch" aria-label={t('debate.prep')}>
                      <p className="muted small"><strong>{t('debate.prep')}</strong> — {t('debate.prep.note')}</p>
                      <div className="chips" role="group" aria-label={t('debate.topic')}>
                        <button className={debateTopic === undefined ? 'chip active' : 'chip'} aria-pressed={debateTopic === undefined} onClick={() => setDebateTopic(undefined)}>{t('debate.topic.any')}</button>
                        {hottest.map((i) => <button key={i} className={debateTopic === i ? 'chip active' : 'chip'} aria-pressed={debateTopic === i} onClick={() => setDebateTopic(i)}>{t(`issue.${i}`)}</button>)}
                      </div>
                      <div className="chips" role="group" aria-label={t('debate.posture')}>
                        {POSTURES.map((x) => <button key={x} className={debatePosture === x ? 'chip active' : 'chip'} aria-pressed={debatePosture === x} title={t(`debate.posture.${x}.desc` as StringKey)} onClick={() => setDebatePosture(x)}>{t(`debate.posture.${x}` as StringKey)}</button>)}
                      </div>
                    </section>
                  )}
                  <Brief className="muted small action-desc" jargon text={t(`action.${id}.desc${fog && id === 'attack' ? '.fog' : ''}` as StringKey)} />
                  <ul>{render(id)}</ul>
                </li>
              ))}
              {family === 'funds' && <li className="action-group"><Loan /></li>}
            </ul>
          </details>
        );
      })}
    </section>
  );
}


/** Television, radio and social media can be aimed at one group of voters: it hears them better, the groups unlike it hear them less. */
function MediaAim({ segment, onPick }: { segment: BlocId | null; onPick(b: BlocId | null): void }) {
  const t = useT();
  return (
    <section className="pitch" aria-label={t('media.aim.title')}>
      <p className="muted small"><strong>{t('media.aim.title')}</strong> — {t('media.aim.note')}</p>
      <div className="chips" role="group" aria-label={t('media.aim.title')}>
        <button className={segment === null ? 'chip active' : 'chip'} aria-pressed={segment === null} onClick={() => onPick(null)}>{t('pitch.all')}</button>
        {BLOC_IDS.map((b) => (
          <button key={b} className={segment === b ? 'chip active' : 'chip'} aria-pressed={segment === b} onClick={() => onPick(b)}>{t(`bloc.${b}`)}</button>
        ))}
      </div>
    </section>
  );
}

/**
 * A seat is several electorates at once, and a ceramah, walkabout or town hall can be pitched to one of them. The row
 * shows, for each group in the seat, how many of the voters it is and what a night aimed at it should add to the party's
 * share here, beside the same night pitched to everyone. The biggest group is not always the best aim: the others may not like it.
 */
function PitchPicker({ seatId, segment, onPick }: { seatId: string; segment: SegmentId | null; onPick(b: SegmentId | null): void }) {
  const t = useT();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const me = campaign.player;
  const seat = world.seats[world.seatIndex.get(seatId)!];
  const gain = (b: SegmentId | null) => expectedPitchGain(world, campaign, me, 'ceramah', seatId, b) ?? 0;
  const best = segmentsOf(seat);
  const gains = new Map<SegmentId | null, number>([[null, gain(null)], ...best.map((b) => [b, gain(b)] as [SegmentId, number])]);
  const top = [...gains.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const bad = segment ? resentfulOf(seat, segment) : [];
  const pts = (n: number) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(1)}`;
  return (
    <section className="pitch" aria-label={t('pitch.title')}>
      <p className="muted small"><strong>{t('pitch.title')}</strong> — {t('pitch.note')}</p>
      <div className="chips" role="group" aria-label={t('pitch.title')}>
        <button className={segment === null ? 'chip active' : 'chip'} aria-pressed={segment === null} onClick={() => onPick(null)}>
          {top === null && '★ '}{t('pitch.all')} <span className="num dim">{pts(gains.get(null)!)}</span>
        </button>
        {best.map((b) => (
          <button key={b} className={segment === b ? 'chip active' : 'chip'} aria-pressed={segment === b} onClick={() => onPick(b)}>
            {top === b && '★ '}{t(`bloc.${b}`)} <span className="num dim">{Math.round(segmentShare(seat, b) * 100)}% · {pts(gains.get(b)!)}</span>
          </button>
        ))}
      </div>
      {bad.length > 0 && <p className="muted small">{t('pitch.resent', { groups: bad.map((b) => t(`bloc.${b}`)).join(', ') })}</p>}
    </section>
  );
}
