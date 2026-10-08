import { useMemo, useState } from 'react';
import { majorityLine } from '../sim/election';
import { scaled } from '../sim/campaign/actions';
import { BY_EFFORT, holderOf, ROUNDS, STATE_EFFORT } from '../sim/campaign/contests';
import { COST, pactPreview } from '../sim/campaign/diplomacy';
import { AGENDA, type AgendaChoice } from '../sim/campaign/agenda';
import { CHIEF_NAMES, FACTION_IDS, POLL_ANSWERS, backing, deputyOf, pollOdds, type FactionId } from '../sim/campaign/factions';
import type { StateId } from '../sim/types';
import { canChoose, EVENTS, gambleChance, ULTIMATUM_MONEY, type Choice, type Effect } from '../sim/campaign/events';
import { bluffChance } from '../sim/campaign/plots';
import { billDef, confidenceCount, deficit, looseness, standstill, whipCount } from '../sim/campaign/govern';
import { billName } from './GovernmentTab';
import type { Scene } from '../sim/campaign/types';
import { useStore } from '../state/store';
import type { StringKey } from '../i18n/strings';
import { lastOutcome, leaderName, partyName, partyShort, regionLabel, seatName, useFog, useFormat, useT, useWorld } from './hooks';
import { StateFight } from './StateFight';
import { Portrait } from './Portrait';
import { Chamber } from './Chamber';
import { divisionSeating } from './seating';

/**
 * A scene that needs the player's answer: a call from another leader or an
 * audience at the Palace. Shown over the game, oldest first, until answered.
 */
export function SceneModal() {
  const scene = useStore((s) => s.game?.campaign.inbox[0]);
  const hidden = useStore((s) => s.hiddenScene);
  const open = useStore((s) => s.sceneOpen);
  const phase = useStore((s) => s.game?.campaign.phase);
  // In a campaign or a term a decision waits in the inbox until it is opened. In the talks and on the night after,
  // the decisions are the business of the screen, and come up by themselves.
  const inbox = phase === 'campaign' || phase === 'term';
  return scene && (!inbox || open) && scene.id !== hidden ? <SceneCard key={scene.id} scene={scene} /> : null;
}

function SceneCard({ scene }: { scene: Scene }) {
  const t = useT();
  const fog = useFog();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const answerScene = useStore((s) => s.answerScene);
  const playStates = useStore((s) => s.playStates);
  // Which states of a round of state polls the player has ticked to fight in person.
  const [fight, setFight] = useState<string[]>([]);
  const setTab = useStore((s) => s.setTab);
  const hideScene = useStore((s) => s.hideScene);
  const me = campaign.player;
  const from = scene.from;
  const answer = (choice: number) => (scene.event === 'statePolls' && fight.length > 0 ? void playStates(scene.id, choice, fight) : answerScene(scene.id, choice));
  const kind = world.rules.kind === 'state' ? 'state' : 'general';

  const preview = useMemo(
    () => (scene.kind === 'pactOffer' && from !== null ? pactPreview(world, campaign, me, from, { give: scene.give ?? [], get: scene.get ?? [] }) : null),
    [scene, world, campaign, me, from],
  );

  // What a choice will plainly do, so the player is choosing and not guessing. What is left to chance is flagged as such.
  const describe = (e: Effect): string | null => {
    const sign = (n: number, label: string) => `${label} ${n > 0 ? '+' : '−'}${Math.abs(n)}`;
    const arrow = (n: number, label: string) => `${n > 0 ? '▲' : '▼'} ${label}`;
    switch (e.t) {
      case 'funds': return `${e.n > 0 ? '+' : '−'}${f.rm(scaled(world, Math.abs(e.n)))}`;
      case 'dividend': return `${e.pct > 0 ? '+' : '−'}${f.rm(Math.abs(Math.round((campaign.career?.assets ?? 0) * e.pct)))}`;
      case 'assets': return arrow(e.pct, t('hint.assets'));
      case 'unity': return sign(e.n, t('hint.unity'));
      case 'cred': return sign(e.n, t('hint.cred'));
      case 'stability': return sign(e.n, t('hint.stability'));
      case 'trust': return sign(e.n, t('hint.trust'));
      case 'fiscal': return arrow(e.n, t('hint.fiscal'));
      case 'economy': return e.growth ? arrow(e.growth, t('house.growth')) : e.inflation ? arrow(e.inflation, t('house.inflation')) : null;
      case 'machinery': return arrow(e.n, t('hint.branches'));
      case 'donors': return arrow(e.n, t('hint.donors'));
      case 'state': return arrow(e.n, t('hint.state'));
      case 'relation': return arrow(e.n, t('hint.relations'));
      case 'rival': return arrow(e.n, t('hint.rival'));
      case 'mood': return arrow(e.n, e.blocs === 'all' ? t('hint.support') : e.blocs.map((b) => t(`bloc.${b}`)).join(', '));
      case 'falls': return t('hint.falls');
      default: return null;
    }
  };
  const list = (effects: Effect[]) => effects.map(describe).filter(Boolean).join(' · ');
  const hintFor = (choice: Choice): string => {
    const sure = list(choice.effects);
    if (!choice.gamble) return sure || t('hint.nothing');
    const pct = f.pct(gambleChance(campaign, choice.gamble.chance), 0);
    const win = list(choice.gamble.win) || t('hint.nothing'), lose = list(choice.gamble.lose) || t('hint.nothing');
    return [sure, fog ? t('hint.gamble.fog', { win, lose }) : t('hint.gamble', { pct, win, lose })].filter(Boolean).join(' · ');
  };

  let title = '', body: React.ReactNode = null, options: { label: string; choice: number; primary?: boolean; disabled?: boolean; hint?: string; after?(): void }[] = [];
  if (scene.kind === 'pactOffer' && from !== null) {
    title = t('scene.pact.title', { leader: leaderName(t, from) });
    body = (
      <>
        <p>{t('scene.pact.body', { party: partyName(t, from), give: scene.give?.length ?? 0, get: scene.get?.length ?? 0 })}</p>
        {preview && (
          <p className="muted small">
            {t('scene.pact.preview', { me: partyShort(t, me), a0: preview.a[0], a1: preview.a[1], party: partyShort(t, from), b0: preview.b[0], b1: preview.b[1] })}
          </p>
        )}
      </>
    );
    options = [
      { label: t('scene.pact.accept'), choice: 0, primary: true },
      { label: t('scene.pact.talk'), choice: 2, after: () => setTab('deals') },
      { label: t('scene.pact.decline'), choice: 1 },
    ];
  } else if (scene.kind === 'poach' && from !== null && scene.seat) {
    const price = scaled(world, COST.keepMoney);
    const pc = campaign.parties[me]!;
    title = t('scene.poach.title');
    body = <p>{t('scene.poach.body', { seat: seatName(world, scene.seat), party: partyName(t, from) })}</p>;
    options = [
      { label: t('scene.poach.pay', { rm: f.rm(price) }), choice: 0, primary: true, disabled: pc.funds < price },
      { label: fog ? t('scene.poach.appeal.fog') : t('scene.poach.appeal', { pct: f.pct((pc.unity / 100) * 0.9, 0) }), choice: 1 },
      { label: t('scene.poach.letGo'), choice: 2 },
    ];
  } else if (scene.kind === 'event' && scene.event && EVENTS[scene.event]) {
    const id = scene.event;
    title = t(`event.${id}.title` as StringKey);
    const k = campaign.career!;
    // A by-election is fought in a particular seat; a round of state polls in particular states.
    const vacant = id === 'byElection' && scene.seat ? world.seatIndex.get(scene.seat) : undefined;
    const voting = id === 'statePolls' && k.rounds < ROUNDS.length ? ROUNDS[k.rounds].states.filter((st) => world.states.includes(st)) : [];
    body = (
      <>
        <p>{t(`event.${id}.body` as StringKey)}</p>
        {vacant !== undefined && (
          <p className="note">{t('scene.by.seat', { seat: world.seats[vacant].name, party: partyName(t, holderOf(world, campaign, scene.seat!)), pct: (lastOutcome(world).seats[vacant].margin * 100).toFixed(1) })}</p>
        )}
        {id === 'ultimatum' && from !== null && <p className="note">{t('scene.ultimatum.from', { leader: leaderName(t, from), party: partyName(t, from) })}</p>}
        {voting.length > 0 && k.realStates && <StateFight states={voting} selected={fight} onChange={setFight} />}
        {voting.length > 0 && (
          <p className="note">{t('scene.states.list', { states: voting.map((st) => t('scene.states.holds', { state: regionLabel(t, world, st), party: k.states[st] === undefined ? '–' : partyShort(t, k.states[st]) })).join(' · ') })}</p>
        )}
      </>
    );
    // Budget day and the confidence vote are worked out from the state of things rather than from fixed effects.
    const special: Record<string, string[]> = {
      budget: [
        t('hint.budget', { pct: deficit(k, k.budget).toFixed(1), tone: t(looseness(k, k.budget) >= 2 ? 'hint.budget.loose' : looseness(k, k.budget) <= -2 ? 'hint.budget.tight' : 'hint.budget.steady') }),
        t('hint.budget', { pct: deficit(k, standstill()).toFixed(1), tone: t('hint.budget.steady') }),
      ],
      byElection: BY_EFFORT.map((e, i) => t(`hint.by.${i}` as StringKey, { rm: f.rm(scaled(world, e.money)) })),
      statePolls: STATE_EFFORT.map((e, i) => t(`hint.states.${i}` as StringKey, { rm: f.rm(scaled(world, e.money)) })),
      ultimatum: from === null ? [] : [
        t('hint.ultimatum.0', { rm: f.rm(scaled(world, ULTIMATUM_MONEY)) }),
        t('hint.ultimatum.1'),
        fog ? t('hint.ultimatum.2.fog') : t('hint.ultimatum.2', { pct: f.pct(bluffChance(campaign, from), 0) }),
      ],
      motion: [
        t('hint.motion', { n: confidenceCount(world, campaign), need: majorityLine(world) }),
        `${t('hint.stability')} +8 · ▲ ${t('hint.fiscal')} · ${t('hint.motion', { n: confidenceCount(world, campaign, () => 0.08), need: majorityLine(world) })}`,
      ],
    };
    options = EVENTS[id].choices.map((choice, i) => {
      const hint = special[id]?.[i] ?? hintFor(choice);
      // What the party cannot pay for is shown, so the player sees what money would have bought, but cannot be chosen.
      const broke = !canChoose(world, campaign, id, i);
      return { label: t(`event.${id}.o${i}` as StringKey), choice: i, disabled: broke, hint: broke ? `${hint} · ${t('reason.funds')}` : hint };
    });
  } else if ((scene.kind === 'vote' || scene.kind === 'houseVote') && scene.bill && billDef(scene.bill)) {
    const id = scene.bill;
    const mine = scene.kind === 'vote';
    const proposer = mine ? me : from!;
    const count = (terms: Parameters<typeof whipCount>[4] = {}) => {
      const w = whipCount(world, campaign, id, proposer, terms);
      return t('house.whip', { yes: w.yes, no: w.no, wavering: w.wavering });
    };
    title = t(mine ? 'scene.vote.title' : 'scene.houseVote.title', { bill: billName(t, id), party: from === null ? '' : partyName(t, from) });
    body = (
      <>
        <p>{t(mine ? 'scene.vote.body' : 'scene.houseVote.body', { bill: billName(t, id), need: majorityLine(world) })}</p>
        <p className="muted small">{t('chamber.whips')}</p>
        <Chamber
          stagger blocs={divisionSeating(world, campaign, whipCount(world, campaign, id, proposer))} need={majorityLine(world)}
          sides={{ left: t('chamber.gov'), right: t('chamber.opp'), middle: t('chamber.cross') }}
        />
      </>
    );
    options = mine
      ? [
          { label: t('scene.vote.o0'), choice: 0, hint: count() },
          { label: t('scene.vote.o1'), choice: 1, hint: `▲ ${t('hint.fiscal')} · ${count({ sweetened: true })}` },
          { label: t('scene.vote.o2'), choice: 2, hint: `${count({ confidence: true })} · ${t('scene.vote.o2.risk')}` },
          { label: t('scene.vote.o3'), choice: 3, hint: `${t('hint.cred')} −2` },
        ]
      : [
          { label: t('scene.houseVote.o0'), choice: 0, hint: count({ forced: { [me]: 'yes' } }) },
          { label: t('scene.houseVote.o1'), choice: 1, hint: count({ forced: { [me]: 'no' } }) },
          { label: t('scene.houseVote.o2'), choice: 2, hint: count({ forced: { [me]: 'abstain' } }) },
        ];
  } else if (scene.kind === 'agenda' && scene.event && AGENDA[scene.event as StateId]) {
    const st = scene.event as StateId;
    title = t(`agenda.${st}.title` as StringKey);
    body = (
      <>
        <p>{t(`agenda.${st}.body` as StringKey)}</p>
        {campaign.phase === 'term' && (campaign.career?.agendaAnswers?.length ?? 0) > 0 && <p className="note">{t('agenda.again')}</p>}
      </>
    );
    // What an answer does, plainly: who it pleases, who it costs, and what it costs the party.
    const hint = (choice: AgendaChoice): string => {
      const lifts = Object.entries(choice.lift) as [string, number][];
      const up = lifts.filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([b]) => t(`bloc.${b}` as StringKey));
      const down = lifts.filter(([, v]) => v < 0).map(([b]) => t(`bloc.${b}` as StringKey));
      const parts = [
        up.length ? `▲ ${up.join(', ')}` : '', down.length ? `▼ ${down.join(', ')}` : '',
        choice.funds ? `${choice.funds > 0 ? '+' : '−'}${f.rm(scaled(world, Math.abs(choice.funds)))}` : '',
        choice.unity ? `${t('hint.unity')} ${choice.unity > 0 ? '+' : '−'}${Math.abs(choice.unity)}` : '',
      ].filter(Boolean);
      return parts.length ? parts.join(' · ') : t('hint.agenda.silence');
    };
    options = AGENDA[st]!.choices.map((choice, i) => ({
      label: t(`agenda.${st}.o${i}` as StringKey), choice: i, hint: hint(choice),
      disabled: !!choice.funds && choice.funds < 0 && campaign.parties[me]!.funds < scaled(world, Math.abs(choice.funds)),
    }));
  } else if (scene.kind === 'partyPoll') {
    const isDeputy = scene.event === 'deputy';
    const who = scene.event as FactionId;
    title = t('partyPoll.title');
    body = isDeputy
      ? <p>{t('partyPoll.deputy', { name: CHIEF_NAMES[deputyOf(campaign).name], faction: t(`faction.${FACTION_IDS[deputyOf(campaign).faction]}` as StringKey), pct: backing(campaign) })}</p>
      : <p>{t('partyPoll.body', { faction: t(`faction.${who}` as StringKey), pct: backing(campaign) })}</p>;
    options = POLL_ANSWERS.map((a, i) => ({
      label: t(`partyPoll.o${i}` as StringKey), choice: i,
      hint: [a.money ? `−${f.rm(scaled(world, a.money))}` : '', i === 1 ? t('partyPoll.o1.cost') : '', fog ? '' : t('partyPoll.odds', { pct: f.pct(pollOdds(campaign, i, isDeputy), 0) })].filter(Boolean).join(' · '),
      disabled: a.money > 0 && campaign.parties[me]!.funds < scaled(world, a.money),
    }));
  } else if (scene.kind === 'redraw') {
    title = t('redraw.title');
    body = <p>{t('redraw.body')}</p>;
    options = [
      { label: t('redraw.o0'), choice: 0, hint: t('redraw.o0.hint') },
      { label: t('redraw.o1'), choice: 1, hint: `${t('hint.trust')} −6 · ${t('hint.cred')} −3 · ${t('redraw.o1.hint')}` },
    ];
  } else if (scene.kind === 'summons') {
    title = t('scene.palace.title');
    body = <p>{t(`scene.summons.body.${kind}`, { n: majorityLine(world), days: campaign.formation?.deadline ?? 0 })}</p>;
    options = [{ label: t('scene.palace.ack'), choice: 0, primary: true }];
  } else if (scene.kind === 'unityAdvice') {
    title = t('scene.palace.title');
    body = <p>{t('scene.unity.body')}</p>;
    options = [
      { label: t('scene.unity.explore'), choice: 0, primary: true },
      { label: t('scene.unity.decline'), choice: 1 },
    ];
  }

  // Matters of the term: they can be set aside while the player looks around, but time waits for an answer.
  const desk = scene.kind === 'event' || scene.kind === 'vote' || scene.kind === 'houseVote' || scene.kind === 'agenda' || scene.kind === 'partyPoll' || scene.kind === 'redraw';
  return (
    <div className="overlay">
      <div className="dialog panel" role="dialog" aria-modal="true" aria-label={title}>
        <div className="dialog-head">
          {scene.kind === 'event' || scene.kind === 'agenda' || scene.kind === 'partyPoll' || scene.kind === 'redraw' ? <Portrait emblem="desk" size={46} /> : desk ? <Portrait emblem="house" size={46} />
            : from === null ? <Portrait emblem="palace" size={46} /> : <Portrait leader={from} size={46} />}
          <div className="grow">
            <p className={from === null && !desk ? 'dialog-from palace' : 'dialog-from'}>
              {scene.kind === 'event' ? t('scene.from.desk') : scene.kind === 'agenda' ? t('scene.agenda.from') : desk ? t('scene.from.house') : from === null ? t('scene.from.palace') : t('scene.from.phone')}
            </p>
            <h2>{title}</h2>
          </div>
        </div>
        {body}
        {desk ? (
          <ul className="choices">
            {options.map((o) => (
              <li key={o.choice}>
                <button className="choice" disabled={o.disabled} onClick={() => answer(o.choice)}>
                  <span className="action-title">{o.label}</span>
                  <span className="action-meta">{o.hint}</span>
                </button>
              </li>
            ))}
            <li><button className="link" onClick={() => hideScene(scene.id)}>{t('scene.later')}</button></li>
          </ul>
        ) : (
          <div className="button-row">
            {options.map((o) => (
              <button key={o.choice} className={o.primary ? 'btn primary' : 'btn'} disabled={o.disabled} onClick={() => { answer(o.choice); o.after?.(); }}>
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
