import { useState } from 'react';
import { PARTIES } from '../data/parties';
import { BYELECTION_SEATS, byElectionId, getWorld, SCENARIOS, STATE_SCENARIOS } from '../data/world';
import type { ContestKind } from '../sim/campaign/rules';
import { playable, startingFunds } from '../sim/campaign/turn';
import type { BackstoryId, Difficulty } from '../sim/campaign/types';
import { PARTY_IDS, type StateId } from '../sim/types';
import { AUTO_SLOT } from '../state/saves';
import { DEFAULT_EMBLEMS, makeIdentity } from '../state/identity';
import { saveStore, useStore } from '../state/store';
import { LEADERS } from '../sim/campaign/cast';
import { lastOutcome, useFormat, useT } from './hooks';
import { Credits } from './Credits';
import { HonoursEntry } from './Honours';
import { Portrait } from './Portrait';
import { saveLine, SaveSlots } from './SavesTab';
import { LeaderPicker, PartyCreator, type Draft } from './Setup';

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];
/** What can be started from the title screen: the single contests, and a career. */
type Mode = ContestKind | 'career';
const KINDS: Mode[] = ['byelection', 'state', 'general', 'hung', 'career'];
/** Where each national party sits as a career opens. */
const CAREER_SEAT = { ps: 'pm', bp: 'gov', pt: 'opp' } as const;

const MODE_KEY = 'k222.title';

/** A seat for a by-election, other than the one just shown. */
const drawSeat = (not?: string) => {
  const pool = BYELECTION_SEATS.filter((id) => id !== not);
  return pool[Math.floor(Math.random() * pool.length)];
};

export function Title() {
  const t = useT();
  const f = useFormat();
  const startCampaign = useStore((s) => s.startCampaign);
  const loadGame = useStore((s) => s.loadGame);
  const [kind, setKind] = useState<Mode>('byelection');
  const [state, setState] = useState<StateId>(STATE_SCENARIOS[0]);
  const [seat, setSeat] = useState(() => drawSeat());
  const [chosen, setChosen] = useState<number | null>(null);
  // The tutorial defaults to gentle rivals; the player can still change it.
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [name, setName] = useState('');
  const [auto] = useState(() => saveStore.meta(AUTO_SLOT));
  const [backstory, setBackstory] = useState<BackstoryId | null>(null);
  const [own, setOwn] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  // A first visit gets the quick start; anyone who has chosen to customise lands there again.
  const [custom, setCustom] = useState(() => { try { return localStorage.getItem(MODE_KEY) === 'custom'; } catch { return false; } });
  const pick = (value: boolean) => {
    setCustom(value);
    if (!value) setKind('byelection');
    try { localStorage.setItem(MODE_KEY, value ? 'custom' : 'quick'); } catch { /* the choice is only for this visit */ }
  };

  const scenario = kind === 'state' ? `state:${state}` : kind === 'byelection' ? byElectionId(seat) : SCENARIOS.find((s) => s.id === kind)!.id;
  const world = getWorld(scenario)!;
  const parties = playable(world);
  const player = chosen !== null && parties.includes(chosen) ? chosen : parties[0];
  const level = difficulty ?? (kind === 'byelection' ? 'easy' : 'normal');
  const playerId = PARTY_IDS[player] as 'ps' | 'bp' | 'pt';
  // The creator starts from the party being taken over, and follows it until the player types something of their own.
  const base: Draft = { name: PARTIES[playerId].name, short: PARTIES[playerId].short, color: PARTIES[playerId].color, emblem: DEFAULT_EMBLEMS[playerId], leader: LEADERS[playerId], look: 0, ideology: null };
  const shown = draft ?? base;
  const identity = own ? makeIdentity(shown) : null;
  const last = lastOutcome(world);
  const lastShare = (p: number) => last.votes[p] / last.votes.reduce((a, b) => a + b, 0);

  return (
    <main className="title">
      <section className="panel title-main">
        <p className="title-intro">{t('title.intro')}</p>
        <p className="muted small">{t('title.fiction')}</p>

        {auto && (
          <button className="btn primary continue" onClick={() => { const g = saveStore.load(AUTO_SLOT); if (g) loadGame(g); }}>
            {t('title.continue')}: {auto.name}
            <span className="small"> · {saveLine(t, auto)}</span>
          </button>
        )}

        {custom ? (
          <>
            <p><button className="link" onClick={() => pick(false)}>← {t('quick.back')}</button></p>
          <h3>{t('title.contest')}</h3>
          <div className="party-cards four" role="radiogroup" aria-label={t('title.contest')}>
            {KINDS.map((k) => (
              <button key={k} role="radio" aria-checked={kind === k} className={kind === k ? 'party-card plain active' : 'party-card plain'} onClick={() => setKind(k)}>
                <strong>{t(`scenario.${k}`)}</strong>
                <span className="small">{t(`scenario.${k}.blurb`)}</span>
                {k === 'byelection' && <span className="badge leaning start-here">{t('title.startHere')}</span>}
              </button>
            ))}
          </div>
          {kind === 'state' && (
            <div className="chips state-pick" role="radiogroup" aria-label={t('scenario.state')}>
              {STATE_SCENARIOS.map((st) => (
                <button key={st} role="radio" aria-checked={state === st} className={state === st ? 'chip active' : 'chip'} onClick={() => setState(st)}>
                  {t(`state.${st}`)} <span className="num">· {t('state.seats', { n: getWorld(`state:${st}`)!.seats.length })}</span>
                </button>
              ))}
            </div>
          )}

          {kind === 'byelection' && (
            <div className="seat-draw">
              <span>{t('title.seat', { seat: world.seats[0].name, state: t(`state.${world.seats[0].state as StateId}`) })}</span>
              <button className="btn small" onClick={() => setSeat(drawSeat(seat))}>{t('title.seat.another')}</button>
            </div>
          )}

          <h3>{t('title.party')}</h3>
          <div className="party-cards" role="radiogroup" aria-label={t('title.party')}>
            {parties.map((p) => {
              const id = PARTY_IDS[p] as 'ps' | 'bp' | 'pt';
              return (
                <button key={id} role="radio" aria-checked={player === p} className={player === p ? 'party-card active' : 'party-card'} style={{ borderTopColor: PARTIES[id].color }} onClick={() => { setChosen(p); setDraft(null); }}>
                  <span className="card-head">
                    <Portrait leader={p} size={44} />
                    <span className="grow">
                      <strong>{PARTIES[id].name}</strong>
                      <span className="muted small">{t('title.leader', { name: LEADERS[id] })}</span>
                    </span>
                  </span>
                  <span className="small">{t(`party.${id}.blurb`)}</span>
                  <span className="muted small">
                    {kind === 'byelection' ? t('title.lastShare', { pct: f.pct(lastShare(p)) }) : t('title.heldSeats', { n: last.tally[p] })}
                    {' · '}{t('title.funds', { rm: f.rm(startingFunds(world, p) * (kind === 'career' ? 0.4 : 1)) })}
                  </span>
                  {kind === 'career' && <span className="badge plain">{t(`orders.seat.${CAREER_SEAT[id]}`)}</span>}
                </button>
              );
            })}
          </div>

          <h3>{t('leader.pick')}</h3>
          <LeaderPicker value={backstory} onChange={setBackstory} />
          <label className="check">
            <input type="checkbox" checked={own} onChange={(e) => setOwn(e.target.checked)} />
            <span>{t('creator.toggle')}</span>
          </label>
          {own && <PartyCreator draft={shown} career={kind === 'career'} onChange={(patch) => setDraft((d) => ({ ...(d ?? base), ...patch }))} />}

          <h3>{t('title.difficulty')}</h3>
          <div className="segmented" role="group" aria-label={t('title.difficulty')}>
            {DIFFICULTIES.map((d) => (
              <button key={d} className={level === d ? 'active' : ''} aria-pressed={level === d} onClick={() => setDifficulty(d)}>
                {t(`difficulty.${d}`)}
              </button>
            ))}
          </div>
          <p className="muted small">{t(`difficulty.${level}.hint`)}</p>

          <label className="field">
            <span>{t('saves.name')}</span>
            <input type="text" value={name} maxLength={60} placeholder={t('saves.defaultName')} onChange={(e) => setName(e.target.value)} />
          </label>
          <button className={auto ? 'btn' : 'btn primary'} disabled={own && !identity} onClick={() => startCampaign({ name, scenario, player, difficulty: level, backstory, ideology: shown.ideology, identity })}>{t('title.start')} ▸</button>
          </>
        ) : (
          <div className="quick">
            <h2>{t('quick.title')}</h2>
            <p>{t('quick.body', { adviser: t('adviser.name') })}</p>
            <h3>{t('quick.party')}</h3>
            <div className="quick-parties" role="radiogroup" aria-label={t('quick.party')}>
              {parties.map((p) => {
                const id = PARTY_IDS[p] as 'ps' | 'bp' | 'pt';
                return (
                  <button key={id} role="radio" aria-checked={player === p} className={player === p ? 'chip active' : 'chip'} onClick={() => { setChosen(p); setDraft(null); }}>
                    <i className="dot" style={{ background: PARTIES[id].color }} />{PARTIES[id].name}
                  </button>
                );
              })}
            </div>
            <div className="seat-draw">
              <span>{t('title.seat', { seat: world.seats[0].name, state: t(`state.${world.seats[0].state as StateId}`) })}</span>
              <button className="btn small" onClick={() => setSeat(drawSeat(seat))}>{t('title.seat.another')}</button>
            </div>
            <div className="button-row">
              {/* a returning player's one call to action is Continue */}
              <button className={auto ? 'btn' : 'btn primary'} onClick={() => startCampaign({ name: '', scenario, player, difficulty: 'easy' })}>{t('quick.start')} ▸</button>
              <button className="btn" onClick={() => pick(true)}>{t('quick.customise')}</button>
            </div>
            <p className="muted small">{t('quick.later')}</p>
          </div>
        )}
      </section>

      <section className="panel title-side">
        <h3>{t('title.load')}</h3>
        <SaveSlots />
        <HonoursEntry />
        <Credits />
      </section>
    </main>
  );
}
