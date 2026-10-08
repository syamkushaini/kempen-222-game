import { lazy, Suspense, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { StringKey } from '../i18n/strings';
import { WHATIF_IDS } from '../sim/campaign/whatif';
import { PARTIES, STANDARD_COLORS } from '../data/parties';
import { byElectionId, fairSeats, getWorld, HOME_PARTIES, loadState, SCENARIOS, STATE_SCENARIOS, STATE_SEATS } from '../data/world';
import type { ContestKind } from '../sim/campaign/rules';
import { playable, standingPact, startingFunds } from '../sim/campaign/turn';
import type { BackstoryId, Difficulty } from '../sim/campaign/types';
import { startStances } from '../sim/campaign/policy';
import { FOUNDING_SLOT } from '../sim/campaign/founding';
import { inContention, outlook, par } from '../sim/campaign/outlook';
import { PARTY_IDS, type FieldedId, type StateId } from '../sim/types';
import { AUTO_SLOT } from '../state/saves';
import { DEFAULT_EMBLEMS, makeIdentity, PARTY_COLORS } from '../state/identity';
import { saveStore, useStore } from '../state/store';
import { LEADERS } from '../sim/campaign/cast';
import { lastOutcome, useFormat, useT } from './hooks';
import { ChallengeList } from './Challenges';
import { Credits } from './Credits';
import { FeedbackLink } from './FeedbackLink';
import { ACHIEVEMENT_IDS } from '../sim/campaign/achievements';
import { FitText } from './FitText';
import { HonoursDialog } from './Honours';
import { HowToPlay } from './HowToPlay';
import { Logo } from './Logo';
import { Icon, type IconName } from './Icon';
import { canDraw3D } from './map3d';
import { Portrait } from './Portrait';
import { saveLine, SaveSlots } from './SavesTab';
import { PlatformEditor } from './Platform';
import { SeatPicker } from './SeatPicker';
import { LeaderPicker, PartyCreator, type Draft } from './Setup';
import { Jargon } from './Term';

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];
/** What can be started from the title screen: the single contests, and a career. */
type Mode = ContestKind | 'career';
const KINDS: Mode[] = ['byelection', 'state', 'general', 'hung', 'career'];
/** Where each national party sits as a career opens. */
const CAREER_SEAT = { ps: 'pm', bp: 'gov', pt: 'opp' } as const;
/** The parties a player can lead: the three national ones, and in Sabah and Sarawak the parties of the state. */
type Playable = 'ps' | 'bp' | 'pt' | 'gbk' | 'gbs' | 'legasi';

const MODE_KEY = 'k222.title';

/** A seat for a by-election that the party has a fair chance in, other than the one just shown. */
const drawSeat = (party: number, not?: string) => {
  const pool = fairSeats(party).filter((id) => id !== not);
  return pool[Math.floor(Math.random() * pool.length)];
};

/** One choice of a radio group, as a card. Not a <button>, because a word in its text that explains itself is a button of its own. */
function RadioCard({ checked, className, style, onSelect, children }: { checked: boolean; className: string; style?: CSSProperties; onSelect: () => void; children: ReactNode }) {
  return (
    <div
      role="radio" aria-checked={checked} tabIndex={0} className={checked ? `${className} active` : className} style={style}
      // A press on the word inside is for the word, not the card.
      onClick={(e) => { if (!(e.target as Element).closest('button')) onSelect(); }}
      onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(); } }}
    >
      {children}
    </div>
  );
}

// The country behind the menu, and the 3D library with it, are fetched after the menu is on screen.
const MenuScene = lazy(() => import('./MenuScene'));

const STEPS = ['steps.contest', 'steps.who', 'steps.rules'] as const;

/** What the title screen is showing: the main menu, the ways to play, one of the two set-ups, the saved games or the challenges. */
type Screen = 'menu' | 'home' | 'quick' | 'custom' | 'load' | 'challenges';

/** One line of the main menu: an icon in its own colour, a name that fits its box, and a word on what is behind it. */
function MenuItem({ icon, tone, title, hint, primary, onClick }: { icon: IconName; tone: string; title: string; hint: string; primary?: boolean; onClick(): void }) {
  return (
    <li>
      <button className={`menu-item tone-${tone}${primary ? ' primary' : ''}`} onClick={onClick}>
        <span className="menu-icon"><Icon name={icon} size={primary ? 26 : 22} /></span>
        <span className="menu-text">
          <FitText className="menu-title">{title}</FitText>
          <span className="menu-hint">{hint}</span>
        </span>
        <span className="menu-go" aria-hidden="true"><Icon name="chevron" size={18} /></span>
      </button>
    </li>
  );
}

export function Title() {
  const t = useT();
  const f = useFormat();
  const startCampaign = useStore((s) => s.startCampaign);
  const loadGame = useStore((s) => s.loadGame);
  const [kind, setKind] = useState<Mode>('byelection');
  const [state, setState] = useState<StateId>('perak');
  const [seat, setSeat] = useState(() => drawSeat(0));
  const [chosen, setChosen] = useState<number | null>(null);
  // The tutorial defaults to gentle rivals; the player can still change it.
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [name, setName] = useState('');
  const [auto] = useState(() => saveStore.meta(AUTO_SLOT));
  const [saved] = useState(() => saveStore.list().filter(Boolean).length);
  const [backstory, setBackstory] = useState<BackstoryId | null>(null);
  const [own, setOwn] = useState(false);
  // A party of one's own can take over one of the big three or be founded from nothing. A hung parliament's votes are already in, so it cannot be founded there.
  const [founded, setFounded] = useState(false);
  // A state election can be one contest, or the first of a career in that state.
  const [stateCareer, setStateCareer] = useState(false);
  // A country career may fight its state elections in person when they fall due, instead of leaving them to the game.
  const [realStates, setRealStates] = useState(false);
  const [stances, setStances] = useState<number[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [fog, setFog] = useState(false);
  // The set-up goes a step at a time: the contest, then who leads and how, then the rules.
  const [step, setStep] = useState(0);
  const [noisy, setNoisy] = useState(false);
  const [whatIf, setWhatIf] = useState('');
  // The screen opens on a choice of how to play; the one chosen last time is marked. "New game" from the menu lands straight on the set-up.
  const setupWanted = useStore((s) => s.setupWanted);
  const clearSetupWanted = useStore((s) => s.clearSetupWanted);
  const [mode, setMode] = useState<Screen>(() => (setupWanted ? 'custom' : 'menu'));
  const [honours, setHonours] = useState(false);
  const [howTo, setHowTo] = useState(false);
  const profile = useStore((s) => s.profile);
  const want3d = useStore((s) => s.settings.map3d);
  // The country turns behind the menu on a laptop that can draw it, for a player who has not asked for less.
  const [backdrop] = useState(() => want3d && canDraw3D() && typeof matchMedia === 'function' && matchMedia('(min-width: 981px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [lastMode] = useState<'quick' | 'custom' | null>(() => { try { const v = localStorage.getItem(MODE_KEY); return v === 'custom' || v === 'quick' ? v : null; } catch { return null; } });
  useEffect(() => { if (setupWanted) clearSetupWanted(); }, [setupWanted, clearSetupWanted]);
  const custom = mode === 'custom';
  const earnedCount = ACHIEVEMENT_IDS.filter((id) => profile.achievements[id] !== undefined).length;
  const pick = (value: Screen) => {
    setMode(value);
    setStep(0);
    if (value === 'quick') setKind('byelection');
    if (value === 'quick' || value === 'custom') { try { localStorage.setItem(MODE_KEY, value); } catch { /* the choice is only for this visit */ } }
  };

  // A state's results are fetched when it is first chosen, and the choice takes effect once they are here.
  const pickState = (st: StateId) => void loadState(st).then(() => setState(st));
  const pickKind = (k: Mode) => (k === 'state' ? void loadState(state).then(() => setKind(k)) : setKind(k));

  const scenario = kind === 'state' ? `${stateCareer ? 'career' : 'state'}:${state}` : kind === 'byelection' ? byElectionId(seat) : SCENARIOS.find((s) => s.id === kind)!.id;
  const world = getWorld(scenario)!;
  const parties = playable(world);
  const player = chosen !== null && parties.includes(chosen) ? chosen : parties[0];
  const level = difficulty ?? (kind === 'byelection' ? 'easy' : 'normal');
  const inCareer = kind === 'career' || (kind === 'state' && stateCareer);
  const founding = own && founded && kind !== 'hung' && !(kind === 'state' && stateCareer);
  const playerId = (founding ? FOUNDING_SLOT : PARTY_IDS[player]) as FieldedId;
  const newPlatform = startStances()[PARTY_IDS.indexOf(FOUNDING_SLOT)];
  // The creator starts from the party being taken over, and follows it until the player types something of their own.
  const base: Draft = {
    name: founding ? t('platform.founded.name') : PARTIES[playerId].name, short: founding ? t('platform.founded.short') : PARTIES[playerId].short,
    // A party of its own needs one of the colours the creator offers; the small party it is built on has a colour that is not among them.
    color: founding ? PARTY_COLORS[6] : STANDARD_COLORS[playerId], emblem: DEFAULT_EMBLEMS[playerId], leader: founding ? t('platform.founded.leader') : LEADERS[playerId], look: 0, ideology: null,
  };
  const shown = draft ?? base;
  const identity = own ? makeIdentity(shown) : null;
  const last = lastOutcome(world);
  // Where the last election was fought by allies, each of them stands in only part of the seats until the pact ends.
  const pact = standingPact(world);
  const standsIn = (p: number) => world.seats.filter((s, i) => world.baseline.contesting[i][p] && (pact.standDowns[s.id]?.[p] ?? -1) < 0).length;
  const allyOf = (p: number) => { const x = pact.pacts.find((q) => q.a === p || q.b === p); return x ? (x.a === p ? x.b : x.a) : -1; };
  const lastShare = (p: number) => last.votes[p] / last.votes.reduce((a, b) => a + b, 0);
  const standing = outlook(world, player);

  return (
    <main className={mode === 'menu' ? 'title menu-stage' : 'title menu-stage sub'}>
      {backdrop && <Suspense fallback={null}><MenuScene /></Suspense>}
      {honours && <HonoursDialog onClose={() => setHonours(false)} />}
      {howTo && <HowToPlay onClose={() => setHowTo(false)} />}
      {mode === 'menu' ? (
        <nav className="main-menu" aria-label={t('menu.label')}>
          <div className="menu-brand">
            <Logo size={84} lively />
            <div>
              <p className="menu-name">Kempen <b>222</b></p>
              <p className="menu-tag">{t('app.tagline')}</p>
            </div>
          </div>
          <p className="title-intro">{t('title.intro')}</p>
          <ul className="menu-list">
            {auto && (
              <MenuItem
                primary icon="play" tone="go" title={t('title.continue')} hint={`${auto.name} · ${saveLine(t, auto)}`}
                onClick={() => { const g = saveStore.load(AUTO_SLOT); if (g) loadGame(g); }}
              />
            )}
            <MenuItem primary={!auto} icon="plus" tone="new" title={t('menu.new')} hint={t('menu.new.hint')} onClick={() => pick('home')} />
            <MenuItem icon="folder" tone="load" title={t('menu.load')} hint={t('menu.load.hint', { n: saved })} onClick={() => pick('load')} />
            <MenuItem icon="target" tone="dare" title={t('challenges.title')} hint={t('menu.challenges.hint')} onClick={() => pick('challenges')} />
            <MenuItem icon="book" tone="learn" title={t('howto.title')} hint={t('howto.hint')} onClick={() => setHowTo(true)} />
            <MenuItem icon="trophy" tone="won" title={t('menu.honours')} hint={t('menu.honours.hint', { n: earnedCount, total: ACHIEVEMENT_IDS.length })} onClick={() => setHonours(true)} />
          </ul>
          <p className="muted small">{t('title.fiction')}</p>
          <div className="menu-foot"><Credits /><FeedbackLink /></div>
        </nav>
      ) : (
      <section className="panel title-main">
        {(mode === 'home' || mode === 'load' || mode === 'challenges') && (
          <p><button className="link back-link" onClick={() => pick('menu')}><Icon name="back" size={14} /> {t('menu.back')}</button></p>
        )}
        {mode === 'load' ? (
          <>
            <h2>{t('title.load')}</h2>
            <SaveSlots />
          </>
        ) : mode === 'challenges' ? <ChallengeList /> : null}

        {mode === 'load' || mode === 'challenges' ? null : mode === 'home' ? (
          <div className="modes">
            <h2>{t('title.modes')}</h2>
            <div className="party-cards three">
              <button className="party-card plain mode-card tone-go" onClick={() => pick('quick')}>
                <span className="mode-icon"><Icon name="book" size={22} /></span>
                <strong><FitText>{t('title.mode.quick')}</FitText></strong>
                <span className="small">{t('title.mode.quick.desc')}</span>
                {!auto && lastMode === null && <span className="badge leaning start-here">{t('title.startHere')}</span>}
                {lastMode === 'quick' && <span className="badge plain">{t('title.mode.last')}</span>}
              </button>
              <button className="party-card plain mode-card tone-new" onClick={() => pick('custom')}>
                <span className="mode-icon"><Icon name="ballot" size={22} /></span>
                <strong><FitText>{t('title.mode.custom')}</FitText></strong>
                <span className="small">{t('title.mode.custom.desc')}</span>
                {lastMode === 'custom' && <span className="badge plain">{t('title.mode.last')}</span>}
              </button>
              <button className="party-card plain mode-card tone-won" onClick={() => { pick('custom'); pickKind('career'); setStep(1); }}>
                <span className="mode-icon"><Icon name="crown" size={22} /></span>
                <strong><FitText>{t('title.mode.career')}</FitText></strong>
                <span className="small">{t('title.mode.career.desc')}</span>
              </button>
            </div>
          </div>
        ) : custom ? (
          <>
            <p><button className="link" onClick={() => pick('home')}>← {t('title.modes.back')}</button></p>
          <ol className="steps" aria-label={t('steps.label')}>
            {STEPS.map((key, i) => (
              <li key={key} className={i === step ? 'now' : i < step ? 'done' : ''} aria-current={i === step ? 'step' : undefined}>
                <button type="button" className="link" disabled={i === step} onClick={() => setStep(i)}>{i + 1}. {t(key)}</button>
              </li>
            ))}
          </ol>
          {step === 0 && <>
          <h3>{t('title.contest')}</h3>
          <div className="party-cards four" role="radiogroup" aria-label={t('title.contest')}>
            {KINDS.map((k) => (
              <RadioCard key={k} checked={kind === k} className="party-card plain" onSelect={() => pickKind(k)}>
                <strong>{t(`scenario.${k}`)}</strong>
                <span className="small"><Jargon>{t(`scenario.${k}.blurb`)}</Jargon></span>
                {k === 'byelection' && <span className="badge leaning start-here">{t('title.startHere')}</span>}
              </RadioCard>
            ))}
          </div>
          {kind === 'state' && (
            <div className="chips state-pick" role="radiogroup" aria-label={t('scenario.state')}>
              {STATE_SCENARIOS.map((st) => (
                <button key={st} role="radio" aria-checked={state === st} className={state === st ? 'chip active' : 'chip'} onClick={() => pickState(st)}>
                  {t(`state.${st}`)} <span className="num">· {t('state.seats', { n: STATE_SEATS[st] ?? 0 })}</span>
                </button>
              ))}
            </div>
          )}

          {kind === 'state' && (
            <>
              <span className="field-label">{t('title.stateMode')}</span>
              <div className="party-cards" role="radiogroup" aria-label={t('title.stateMode')}>
                {[false, true].map((v) => (
                  <RadioCard key={String(v)} checked={stateCareer === v} className="party-card plain" onSelect={() => { setStateCareer(v); setDraft(null); if (v) setFounded(false); }}>
                    <strong>{t(v ? 'title.stateMode.career' : 'title.stateMode.single')}</strong>
                    <span className="small">{t(v ? 'title.stateMode.career.desc' : 'title.stateMode.single.desc')}</span>
                  </RadioCard>
                ))}
              </div>
            </>
          )}

          {kind === 'byelection' && (
            <SeatPicker value={seat} onChange={setSeat} onRandom={() => setSeat(drawSeat(player, seat))} />
          )}

          </>}

          {step === 1 && <>
          {kind !== 'hung' && !(kind === 'state' && stateCareer) && (
            <div className="founding" role="radiogroup" aria-label={t('platform.how')}>
              <h3>{t('platform.how')}</h3>
              {[false, true].map((v) => (
                <button key={String(v)} role="radio" aria-checked={founding === v} className={founding === v ? 'party-card plain active' : 'party-card plain'} onClick={() => { setFounded(v); setDraft(null); if (v) setOwn(true); }}>
                  <strong>{t(v ? 'platform.new' : 'platform.takeover')}</strong>
                  <span className="small">{t(v ? (kind === 'career' ? 'platform.new.desc' : 'platform.new.desc.single') : 'platform.takeover.desc')}</span>
                </button>
              ))}
            </div>
          )}
          {!founding && <>
          <h3>{t('title.party')}</h3>
          <div className="party-cards" role="radiogroup" aria-label={t('title.party')}>
            {parties.map((p) => {
              const id = PARTY_IDS[p] as Playable;
              return (
                <RadioCard key={id} checked={player === p} className="party-card" style={{ borderTopColor: PARTIES[id].color }} onSelect={() => { setChosen(p); setDraft(null); }}>
                  <span className="card-head">
                    <Portrait leader={p} size={60} />
                    <span className="grow">
                      <strong>{PARTIES[id].name}</strong>
                      <span className="muted small">{t('title.leader', { name: LEADERS[id] })}</span>
                    </span>
                  </span>
                  <span className="small"><Jargon>{t(`party.${id}.blurb`)}</Jargon></span>
                  <span className="muted small">
                    {kind === 'byelection' ? t('title.lastShare', { pct: f.pct(lastShare(p)) }) : t('title.heldSeats', { n: last.tally[p] })}
                    {' · '}{t('title.funds', { rm: f.rm(startingFunds(world, p) * (inCareer ? 0.4 : 1)) })}
                  </span>
                  {allyOf(p) >= 0 && <span className="muted small">{t('title.stands', { party: PARTIES[PARTY_IDS[allyOf(p)]].short, n: standsIn(p), total: world.seats.length })}</span>}
                  {outlook(world, p) && <span className="badge plain">{t(`outlook.${outlook(world, p)!}`)}</span>}
                  {kind === 'career' && id in CAREER_SEAT && <span className="badge plain">{t(`orders.seat.${CAREER_SEAT[id as keyof typeof CAREER_SEAT]}`)}</span>}
                </RadioCard>
              );
            })}
          </div>

          </>}

          <h3>{t('leader.pick')}</h3>
          <LeaderPicker value={backstory} party={founding ? -1 : player} onChange={setBackstory} />
          {!founding && (
            <label className="check">
              <input type="checkbox" checked={own} onChange={(e) => setOwn(e.target.checked)} />
              <span>{t('creator.toggle')}</span>
            </label>
          )}
          {own && <PartyCreator draft={shown} career={inCareer && !founding} slate={inCareer} onChange={(patch) => setDraft((d) => ({ ...(d ?? base), ...patch }))} />}
          {founding && kind === 'career' && <PlatformEditor stances={stances ?? newPlatform} base={newPlatform} onChange={setStances} />}
          </>}

          {step === 2 && <>
          <h3>{t('title.difficulty')}</h3>
          <div className="segmented" role="group" aria-label={t('title.difficulty')}>
            {DIFFICULTIES.map((d) => (
              <button key={d} className={level === d ? 'active' : ''} aria-pressed={level === d} onClick={() => setDifficulty(d)}>
                {t(`difficulty.${d}`)}
              </button>
            ))}
          </div>
          <p className="muted small">{t(`difficulty.${level}.hint`)}</p>

          <h3>{t('challenge.title')}</h3>
          <label className="check">
            <input type="checkbox" checked={fog} onChange={(e) => setFog(e.target.checked)} />
            <span>{t('challenge.fog')}</span>
          </label>
          <p className="muted small">{t('challenge.fog.desc')}</p>
          <label className="check">
            <input type="checkbox" checked={noisy} onChange={(e) => setNoisy(e.target.checked)} />
            <span>{t('challenge.noisy')}</span>
          </label>
          <p className="muted small">{t('challenge.noisy.desc')}</p>
          {kind === 'general' && (
            <label className="field">
              <span>{t('whatif.title')}</span>
              <select value={whatIf} onChange={(e) => setWhatIf(e.target.value)}>
                <option value="">{t('whatif.none')}</option>
                {WHATIF_IDS.map((id) => <option key={id} value={id}>{t(`whatif.${id}` as StringKey)}</option>)}
              </select>
              <span className="muted small">{whatIf ? t(`whatif.${whatIf}.desc` as StringKey) : t('whatif.desc')}</span>
            </label>
          )}
          {kind === 'career' && !founding && (
            <>
              <label className="check">
                <input type="checkbox" checked={realStates} onChange={(e) => setRealStates(e.target.checked)} />
                <span>{t('challenge.realStates')}</span>
              </label>
              <p className="muted small">{t('challenge.realStates.desc')}</p>
            </>
          )}

          <label className="field">
            <span>{t('saves.name')}</span>
            <input type="text" value={name} maxLength={60} placeholder={t('saves.defaultName')} onChange={(e) => setName(e.target.value)} />
          </label>
          </>}

          <div className="button-row">
            {step > 0 && <button className="btn" onClick={() => setStep(step - 1)}>‹ {t('steps.back')}</button>}
            {step < STEPS.length - 1
              ? <button className="btn primary" onClick={() => setStep(step + 1)}>{t('steps.next')} ▸</button>
              : <button className={auto ? 'btn' : 'btn primary'} disabled={own && !identity} onClick={() => startCampaign({ name, scenario, player: founding ? PARTY_IDS.indexOf(FOUNDING_SLOT) : player, difficulty: level, backstory, ideology: founding ? null : shown.ideology, identity, challenge: { fog, noisy, ...(kind === 'general' && whatIf ? { whatIf } : {}) }, founded: founding, realStates: kind === 'career' && !founding && realStates, stances: founding && kind === 'career' ? (stances ?? newPlatform) : undefined })}>{t('title.start')} ▸</button>
            }
          </div>
          </>
        ) : (
          <div className="quick">
            <p><button className="link" onClick={() => pick('home')}>← {t('title.modes.back')}</button></p>
            <h2>{t('quick.title')}</h2>
            <p>{t('quick.body', { adviser: t('adviser.name') })}</p>
            <h3>{t('quick.party')}</h3>
            <div className="quick-parties" role="radiogroup" aria-label={t('quick.party')}>
              {parties.map((p) => {
                const id = PARTY_IDS[p] as Playable;
                return (
                  <button key={id} role="radio" aria-checked={player === p} className={player === p ? 'chip active' : 'chip'} onClick={() => { setChosen(p); setDraft(null); if (!inContention(world.seats[0].last.votes, p)) setSeat(drawSeat(p, seat)); }}>
                    <i className="dot" data-party={PARTY_IDS.indexOf(id)} style={{ background: PARTIES[id].color }} />{PARTIES[id].name}
                  </button>
                );
              })}
            </div>
            {/* the parties of Sabah and Sarawak get the same guided start, in a seat on their own ground */}
            <p className="muted small quick-home">
              {t('quick.home')}{' '}
              {HOME_PARTIES.map((p) => (
                <button key={p} className={player === p ? 'chip active' : 'chip'} aria-pressed={player === p} onClick={() => { setSeat(drawSeat(p, seat)); setChosen(p); setDraft(null); }}>
                  <i className="dot" data-party={p} style={{ background: PARTIES[PARTY_IDS[p] as Playable].color }} />{PARTIES[PARTY_IDS[p] as Playable].short}
                </button>
              ))}
            </p>
            <SeatPicker value={seat} onChange={setSeat} onRandom={() => setSeat(drawSeat(player, seat))} />
            {standing && <p className="muted small"><span className="badge plain">{t(`outlook.${standing}`)}</span> {t(`outlook.goal.${standing}`, { pct: f.pct(par(world, player) ?? 0, 0) })}</p>}
            <div className="button-row">
              {/* a returning player's one call to action is Continue */}
              <button className={auto ? 'btn' : 'btn primary'} onClick={() => startCampaign({ name: '', scenario, player, difficulty: 'easy' })}>{t('quick.start')} ▸</button>
              <button className="btn" onClick={() => pick('custom')}>{t('quick.customise')}</button>
            </div>
            <p className="muted small">{t('quick.later')}</p>
          </div>
        )}
      </section>
      )}
    </main>
  );
}
