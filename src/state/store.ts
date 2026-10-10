import { create } from 'zustand';
import { fightWorld, foundedWorld, getWorld, loadState, newPartyWorld, ownWorld, worldOf } from '../data/world';
import { translate, type Lang } from '../i18n/strings';
import { earned, type AchievementId } from '../sim/campaign/achievements';
import {
  answerEvent, dissolve, foundForContest, invest, nextTerm, resumeTerm, setOrders, skipAhead, startCareer, syncOpinion,
} from '../sim/campaign/career';
import {
  appoint, deliver, leaveGovernment, repeal, pullLever, reshuffle, setBudget, tableBill, tableMotion,
} from '../sim/campaign/govern';
import { choose, openSeat, standLeader, vetHopeful } from '../sim/campaign/candidates';
import { canChoose } from '../sim/campaign/events';
import { borrow } from '../sim/campaign/loan';
import { courtEndorser } from '../sim/campaign/endorsers';
import type { IdeologyId } from '../sim/campaign/leader';
import { retire } from '../sim/campaign/legacy';
import { hireTroopers, interview } from '../sim/campaign/media';
import { dismiss, hire, vet } from '../sim/campaign/staff';
import { abandonMission, acceptMission, declineMission, offerMain, seenMission, seenMissions } from '../sim/campaign/missions';
import { launchManifesto, setBrief, setStance, togglePledge } from '../sim/campaign/policy';
import {
  breakPact, courtDefector, type Stake, jointAttack, meetLeader, proposePact, resolveCampaignScene, seekUnderstanding,
  type PactProposal, type PactVerdict,
} from '../sim/campaign/diplomacy';
import {
  backRival, claimAgain, endDay, makeOffer, resolveFormationScene, soundOut, type OfferResult,
} from '../sim/campaign/formation';
import { closeNight, endWeek, newCampaign, playerAct, playerPoll, publishPublicPoll, setChief, setChiefFloor } from '../sim/campaign/turn';
import type {
  ActionId, ActionTarget, BackstoryId, Campaign, Challenge, ChiefLevel, Dial, Difficulty, EndorserId, LeverId, LineId, MeasureId, NewsItem, Offer, Orders,
  IssueId, OutletId, PledgeId, PollQuality, PollScope, PortfolioId, RoleId,
} from '../sim/campaign/types';
import { randomSeed } from '../sim/rng';
import type { World } from '../sim/election';
import type { RegionId, StateId } from '../sim/types';
import { newGame, startOf, type GameState, type StartOptions } from './game';
import type { Identity } from './identity';
import { cleanLayers, DEFAULT_LAYERS, type LayerId } from '../sim/campaign/layers';
import { fieldCheapest, fieldSeat, withdrawSeat } from '../sim/campaign/slate';
import { enterSeat, leaveSeat } from '../sim/campaign/entry';
import { usePower, type PowerId } from '../sim/campaign/statepowers';
import { writeLetter, type Tone } from '../sim/campaign/letters';
import { agreeEarly, dropEarly } from '../sim/campaign/earlypact';
import { formUnity } from '../sim/campaign/grand';
import { offerDeputy } from '../sim/campaign/plots';
import { aidSector, type SectorId } from '../sim/campaign/sectors';
import { openInquiry } from '../sim/campaign/committee';
import { dissolveAlliance, expel, foundAlliance, invite } from '../sim/campaign/alliance';
import { renewSupply, signSupply, type SupplyPrice } from '../sim/campaign/supply';
import { merge } from '../sim/campaign/merge';
import { nameShadow } from '../sim/campaign/shadow';
import { resolveAgenda } from '../sim/campaign/agenda';
import { forceByElection } from '../sim/campaign/contests';
import { callReferendum } from '../sim/campaign/courts';
import { setPatronage } from '../sim/campaign/patronage';
import { grantSafe, revokeSafe } from '../sim/campaign/safeseat';
import { discipline, doActivity, padRolls, rebrand, setAside, takeForeign, trade, type Discipline, type ActivityId, type FavourId, type HoldingId } from '../sim/campaign/party';
import { canFight, playRound, settleAside, stakeFor, startAside } from '../sim/campaign/aside';
import { award, hang, legacyEntry, ProfileStore, type Profile } from './profile';
import { AUTO_SLOT, browserStorage, SaveStore } from './saves';

/**
 * What the map shows: the last election, the player's own picture from polls,
 * or (developer mode only) how the country would really vote today.
 */
export type MapView = 'last' | 'estimate' | 'truth';
export type SidebarTab = 'desk' | 'orders' | 'house' | 'policy' | 'missions' | 'actions' | 'team' | 'party' | 'slate' | 'chiefs' | 'deals' | 'seats' | 'polls' | 'voters' | 'news' | 'saves';
export type Theme = 'system' | 'light' | 'dark';
export type Palette = 'standard' | 'accessible';
export type TextSize = 'normal' | 'large';

export interface Settings {
  lang: Lang;
  theme: Theme;
  /** Sound effects. */
  sound: boolean;
  /** The background tune, quiet. Like the effects it waits for the player's first click, as browsers insist. */
  music: boolean;
  /** Party colours that colour-blind players can tell apart. */
  palette: Palette;
  textSize: TextSize;
  /** How tightly the screens are packed. */
  density: 'comfortable' | 'compact';
  /** The "What now?" line above the map. */
  hints: boolean;
  /** The map is drawn in 3D, where the browser can. */
  map3d: boolean;
  /** Which extra things the map shows, ticked by the player. */
  layers: LayerId[];
}

const SETTINGS_KEY = 'k222.settings';
const storage = browserStorage();
export const saveStore = new SaveStore(storage);
const profileStore = new ProfileStore(storage);

/** Whether a player who has not chosen starts with the 3D map: on a laptop or desktop with a mouse, unless they have asked for less motion. */
function prefers3d(): boolean {
  if (typeof matchMedia !== 'function') return false;
  return matchMedia('(min-width: 981px) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function loadSettings(): Settings {
  const fallback: Settings = { lang: 'en', theme: 'system', sound: true, music: true, palette: 'standard', textSize: 'normal', density: 'comfortable', hints: true, map3d: prefers3d(), layers: DEFAULT_LAYERS };
  try {
    const raw = JSON.parse(storage?.getItem(SETTINGS_KEY) ?? 'null');
    if (!raw) return fallback;
    return {
      lang: raw.lang === 'ms' ? 'ms' : 'en',
      theme: raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : 'system',
      sound: raw.sound !== false,
      music: raw.music !== false,
      palette: raw.palette === 'accessible' ? 'accessible' : 'standard',
      textSize: raw.textSize === 'large' ? 'large' : 'normal',
      density: raw.density === 'compact' ? 'compact' : 'comfortable',
      hints: raw.hints !== false,
      map3d: typeof raw.map3d === 'boolean' ? raw.map3d : prefers3d(),
      layers: cleanLayers(raw.layers) ?? DEFAULT_LAYERS,
    };
  } catch {
    return fallback;
  }
}

/** Add ?dev to the address to see the hidden true state of the race. */
const DEV = typeof location !== 'undefined' && new URLSearchParams(location.search).has('dev');

interface Store {
  /** null while on the title screen. */
  game: GameState | null;
  settings: Settings;
  dev: boolean;
  view: MapView;
  tab: SidebarTab;
  selectedState: RegionId | null;
  selectedSeat: string | null;
  /** The outcome of the player's most recent action, shown above the action list. */
  lastReport: NewsItem | null;
  /** Puts away the message about the last action. It is still in the News tab. */
  clearReport(): void;
  /** The seat the last action worked on, and a counter that restarts its flash on the map. */
  flash: { seat: string | null; n: number };
  /** The seat an action being pointed at would land on, shown on the map before it is taken. */
  preview: string | null;
  setPreview(seat: string | null): void;
  /** The whole poll is open under the map: in 3D its columns stand on the regions. */
  pollOpen: boolean;
  setPollOpen(open: boolean): void;
  /** The answer to the player's latest pact proposal, and who gave it. */
  pactReply: { party: number; verdict: PactVerdict } | null;
  /** The answer to the player's latest offer in the talks after the election. */
  offerReply: { party: number; result: OfferResult } | null;
  /** Election night stays on screen after the count until the player moves on. */
  showNight: boolean;
  /** A scene the player has set aside to look around before answering. */
  hiddenScene: number[];
  /** The inbox is open: the decision at its head is on screen. A new decision opens it by itself (see Inbox in App.tsx); one set aside waits in a bar until the player opens it. */
  /** When the autosave last succeeded, or null if it has not or cannot. */
  autosavedAt: number | null;
  autosaveFailed: boolean;
  /** Achievements and finished careers: the player's, not any one game's. */
  profile: Profile;
  /** Achievements just earned, waiting to be shown. */
  toasts: AchievementId[];
  /** How many games have been loaded this session. Screens with a running count start it again when this changes. */
  loads: number;

  setSettings(patch: Partial<Settings>): void;
  dismissToast(id: AchievementId): void;
  setView(view: MapView): void;
  setTab(tab: SidebarTab): void;
  openScene(): void;
  selectState(state: RegionId | null): void;
  selectSeat(seatId: string | null, state?: RegionId): void;

  startCampaign(opts: {
    name: string; scenario: string; player: number; difficulty: Difficulty;
    /** A fixed seed, for a set challenge. Otherwise a fresh one is drawn. */
    seed?: number;
    /** A career that begins with a party the player founds from nothing, and the platform it stands on. */
    founded?: boolean;
    stances?: number[];
    backstory?: BackstoryId | null; ideology?: IdeologyId | null; identity?: Identity | null; challenge?: Partial<Challenge>; realStates?: boolean;
  }): void;
  /** Moves the adviser to the next step, or ends the tutorial after the last one. */
  advanceTutorial(steps: number): void;
  /** Moves the adviser straight to a later step, or ends the tutorial if that is past the last. */
  jumpTutorial(to: number, steps: number): void;
  dismissTutorial(): void;
  act(id: ActionId, target: ActionTarget): void;
  poll(scope: PollScope, target: string | null, quality: PollQuality): void;
  /** Puts a chief in charge of the regions given (level 0 takes them back). */
  setChiefs(states: RegionId[], level: ChiefLevel | 0): void;
  setChiefFloor(amount: number): void;
  endWeek(): void;
  /** Marks election night as watched, so reloading shows the final result. */
  finishNight(): void;
  /** Leaves election night for whatever comes after it. */
  leaveNight(): void;
  /** Goes back to look at election night once the government is settled. */
  viewNight(): void;

  meet(party: number): void;
  proposePact(party: number, proposal: PactProposal): void;
  clearPactReply(): void;
  breakPact(party: number): void;
  promise(party: number): void;
  jointAttack(ally: number, target: number): void;
  court(seat: string, stake?: Stake): void;
  answerScene(id: number, choice: number): void;

  offer(party: number, offer: Offer): void;
  soundOut(party: number): void;
  backRival(party: number): void;
  claimAgain(): void;
  endDay(): void;

  /** Career: changes the standing orders for the weeks between elections. */
  setOrders(patch: Partial<Orders>): void;
  invest(lots: number): void;
  /** The opposition names someone to shadow a portfolio. */
  shadow(portfolio: PortfolioId): void;
  /** Takes a small ally into the player's party. */
  merge(party: number): void;
  /** Opens a seat to the leader's choice of candidate, for half a day. */
  openSeat(seat: string): void;
  /** The leader stands in a seat themselves. */
  standLeader(seat: string): void;
  /** Suspends or dissolves a state's branches. */
  discipline(state: string, how: Discipline): void;
  /** Changes the party's name, flag and colours, at a price. */
  rebrand(identity: Identity): void;
  /** Sets money aside for the next campaign (positive lots), or takes it back at a price (negative). */
  chest(lots: number): void;
  foreign(favour: FavourId): void;
  padRolls(): void;
  usePower(id: PowerId): void;
  writeLetter(issue: IssueId, tone: Tone): void;
  agreeEarly(party: number): void;
  dropEarly(party: number): void;
  formUnity(): void;
  offerDeputy(party: number): void;
  inquiry(): void;
  foundAlliance(name: number, mark: number): void;
  inviteAlly(party: number): void;
  dissolveAlliance(): void;
  expel(party: number): void;
  renewSupply(party: number): void;
  setBrief(id: PledgeId, brief: boolean): void;
  referendum(id: PledgeId): void;
  patronage(level: number): void;
  grantSafe(seat: string, faction: number): void;
  revokeSafe(seat: string): void;
  forceByElection(seat: string): void;
  /** Asks a party to keep the government in office from outside the cabinet. */
  supply(party: number, price: SupplyPrice): void;
  /** The head of government repeals an Act. */
  repeal(id: PledgeId): void;
  /** Buys (positive lots) or sells (negative) one kind of party business. */
  trade(holding: HoldingId, lots: number): void;
  /** Does one of the things a party does between elections. */
  activity(id: ActivityId): void;
  /** Takes the loan a lender is offering against the party's coming income. */
  borrow(): void;
  /** Takes a mission on offer, turns it down, gives up one taken, or says the player has seen how the last ones ended. */
  acceptMission(id: number): void;
  declineMission(id: number): void;
  abandonMission(id: number): void;
  seenMissions(): void;
  seenMission(): void;
  setStance(issue: number, to: number): void;
  togglePledge(id: PledgeId): void;
  launchManifesto(): void;
  /** Runs up to this many weeks of the term, stopping when something needs a decision. */
  advance(weeks: number): void;
  dissolve(together?: boolean): void;
  aidSector(id: SectorId): void;
  /** After the election and the talks: on to the next parliament. */
  nextTerm(): void;
  /** After a change of government between elections: back to the term. */
  resumeTerm(): void;

  /** Sets a waiting scene aside (or brings it back with null) so the player can look around first. */
  hideScene(id: number): void;
  setBudget(patch: { line?: LineId; tax?: boolean; value: Dial } | { measure: MeasureId; on: boolean }): void;
  reshuffle(portfolio: PortfolioId): void;
  appoint(portfolio: PortfolioId, option: number): void;
  fieldSeat(seatId: string): void;
  withdrawSeat(seatId: string): void;
  fieldCheapest(limit: number): void;
  /** Puts a candidate in a seat the party has never stood in, or takes one back. */
  enterSeat(seatId: string): void;
  leaveSeat(seatId: string): void;
  /** Answers a round of state polls by fighting some of its states in person (see aside.ts). */
  playStates(sceneId: number, choice: number, states: string[]): Promise<void>;
  /** A state election fought in person is over: back to the career, or on to the next state of the round. */
  finishAside(): Promise<void>;
  tableBill(id: string): void;
  deliver(index: number): void;
  pullLever(id: LeverId): void;
  tableMotion(): void;
  leaveGovernment(): void;
  retire(): void;

  hire(role: RoleId, index: number): void;
  dismiss(role: RoleId): void;
  vetStaff(role: RoleId, index: number): void;
  chooseCandidate(seat: string, option: number): void;
  vetHopeful(seat: string, option: number): void;
  courtEndorser(id: EndorserId): void;
  interview(id: OutletId): void;
  hireTroopers(): void;
  renameGame(name: string): void;
  loadGame(state: GameState): void;
  quitToTitle(): void;
  /** Starts the open game again from the beginning: the same contest, party and settings, with the same name. */
  restart(): void;
  /** Leaves for the title screen with the full set-up of a new game showing. */
  newGameSetup(): void;
  /** Set by `newGameSetup` so the title screen opens on the set-up, and cleared once it has. */
  setupWanted: boolean;
  clearSetupWanted(): void;
  /** Whether the game menu is showing. */
  menuOpen: boolean;
  setMenuOpen(open: boolean): void;
}

const settings = loadSettings();

export const useStore = create<Store>((set, get) => {
  /** Applies a change to the campaign on a copy, so the UI sees a new object. */
  const mutate = (fn: (c: Campaign, g: GameState, world: World) => Partial<Store> | void) => {
    const current = get().game;
    const world = current && worldOf(current.campaign);
    if (!current || !world) return;
    const g = structuredClone(current);
    const extra = fn(g.campaign, g, world) ?? {};
    g.updatedAt = Date.now();
    // Decisions come up by themselves; only the ones the player has set aside wait as a bar, and a new one is never among them.
    const hidden = (extra.hiddenScene ?? get().hiddenScene).filter((id) => g.campaign.inbox.some((x) => x.id === id));
    set({ game: g, ...extra, hiddenScene: hidden });
  };

  return {
    game: null,
    settings,
    dev: DEV,
    view: 'last',
    tab: 'actions',
    selectedState: null,
    selectedSeat: null,
    lastReport: null,
    clearReport: () => set({ lastReport: null }),
    flash: { seat: null, n: 0 },
    preview: null,
    setPreview: (seat) => { if (get().preview !== seat) set({ preview: seat }); },
    pollOpen: false,
    setPollOpen: (pollOpen) => set({ pollOpen }),
    pactReply: null,
    offerReply: null,
    showNight: false,
    hiddenScene: [],
    autosavedAt: null,
    autosaveFailed: false,
    profile: profileStore.load(),
    toasts: [],
    loads: 0,

    setSettings: (patch) => {
      const next = { ...get().settings, ...patch };
      set({ settings: next });
      try { storage?.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch { /* settings are a convenience */ }
    },
    dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x !== id) })),
    setView: (view) => set({ view }),
    setTab: (tab) => set({ tab }),
    selectState: (state) => set({ selectedState: state, selectedSeat: null }),
    selectSeat: (seatId, state) => set((s) => ({ selectedSeat: seatId, selectedState: state ?? s.selectedState })),

    startCampaign: ({ name, scenario, player, difficulty, seed, founded = false, stances, backstory = null, ideology = null, identity = null, challenge, realStates = false }) => {
      // A founded party's first term is played in a country with its name already on every ballot.
      const base = getWorld(scenario);
      // A party the player has made their own may stand in any seat of a career, at a price; it needs a world in which it is on every ballot.
      const own = !!(base?.rules.career && identity && !founded);
      const world = founded ? (scenario === 'career' ? foundedWorld() : newPartyWorld(scenario)) : own ? ownWorld(scenario, player) ?? base : base;
      if (!world) return;
      const opts = { player, difficulty, seed: seed ?? randomSeed(), backstory, challenge };
      // Kept with the game so that it can be started again exactly as it was set up.
      const start: StartOptions = { scenario, player, difficulty, ...(seed !== undefined ? { seed } : {}), backstory, ideology, ...(founded ? { founded, stances } : {}), ...(realStates ? { realStates } : {}), ...(challenge ? { challenge } : {}) };
      // A platform of its own belongs to a party of the player's own making.
      const campaign = world.rules.career ? startCareer(world, { ...opts, ideology: identity ? ideology : null, founded, stances, realStates, own, held: own && base ? base.seats.filter((_, i) => base.baseline.contesting[i][player]).map((s) => s.id) : undefined }) : newCampaign(world, opts);
      if (founded && !world.rules.career) foundForContest(world, campaign, backstory);
      // A career opens with its first missions on offer (the game draws them once for each parliament).
      if (campaign.career) offerMain(world, campaign);
      // A set challenge is for someone who has played before: no adviser walking them through it.
      const tutorial = world.rules.kind === 'byelection' && !challenge?.goal;
      set({
        game: newGame(name.trim() || translate(get().settings.lang, 'saves.defaultName'), campaign, Date.now(), tutorial, identity, start),
        view: 'last', tab: campaign.phase === 'term' ? 'desk' : 'actions', selectedSeat: null, lastReport: null, pactReply: null, offerReply: null, showNight: false,
        // A general election opens on the leader's home state; smaller contests open on the whole map.
        selectedState: world.rules.kind === 'general' && campaign.phase === 'campaign' ? campaign.parties[player]!.location : null,
      });
    },
    advanceTutorial: (steps) => mutate((_c, g) => {
      if (!g.tutorial) return;
      g.tutorial = g.tutorial.step + 1 >= steps ? null : { step: g.tutorial.step + 1 };
    }),
    jumpTutorial: (to, steps) => mutate((_c, g) => {
      if (!g.tutorial || to <= g.tutorial.step) return;
      g.tutorial = to >= steps ? null : { step: to };
    }),
    dismissTutorial: () => mutate((_c, g) => { g.tutorial = null; }),
    act: (id, target) => mutate((c, _g, world) => {
      const report = playerAct(world, c, id, target);
      // What was worked on flashes on the map: the seat itself, or for an action on a state or the country, nothing.
      return report ? { lastReport: report, flash: target.seat ? { seat: target.seat, n: get().flash.n + 1 } : get().flash } : { lastReport: report };
    }),
    poll: (scope, target, quality) => mutate((c, _g, world) => {
      // Seeing the new numbers is the point, so switch the map to the player's picture.
      if (playerPoll(world, c, scope, target, quality) && scope !== 'national') return { view: 'estimate' };
    }),
    setChiefs: (states, level) => mutate((c, _g, world) => { for (const st of states) setChief(world, c, st, level); }),
    setChiefFloor: (amount) => mutate((c) => setChiefFloor(c, amount)),
    endWeek: () => mutate((c, _g, world) => {
      endWeek(world, c);
      return c.phase === 'campaign'
        ? { lastReport: null, pactReply: null, tab: 'news' }
        : { lastReport: null, pactReply: null, selectedSeat: null, selectedState: null, showNight: true };
    }),
    finishNight: () => mutate((c, _g, world) => closeNight(world, c)),
    leaveNight: () => set({ showNight: false, selectedSeat: null, selectedState: null }),
    viewNight: () => set({ showNight: true }),

    meet: (party) => mutate((c, _g, world) => ({ lastReport: meetLeader(world, c, party) })),
    proposePact: (party, proposal) => mutate((c, _g, world) => {
      const verdict = proposePact(world, c, party, proposal);
      return verdict ? { pactReply: { party, verdict } } : {};
    }),
    clearPactReply: () => set({ pactReply: null }),
    breakPact: (party) => mutate((c) => { breakPact(c, party); }),
    promise: (party) => mutate((c, _g, world) => ({ lastReport: seekUnderstanding(world, c, party) })),
    jointAttack: (ally, target) => mutate((c, _g, world) => ({ lastReport: jointAttack(world, c, ally, target) })),
    court: (seat, stake) => mutate((c, _g, world) => ({ lastReport: courtDefector(world, c, seat, stake) })),
    answerScene: (id, choice) => mutate((c, _g, world) => {
      const scene = c.inbox.find((x) => x.id === id);
      if (!scene) return;
      if (scene.kind === 'event' && scene.event && !canChoose(world, c, scene.event, choice)) return;
      c.inbox = c.inbox.filter((x) => x.id !== id);
      // The state's question, put again in the years of a state career.
      if (scene.kind === 'agenda' && c.phase === 'term') { resolveAgenda(world, c, scene, choice); return { hiddenScene: [] }; }
      if (scene.kind === 'event' || scene.kind === 'vote' || scene.kind === 'houseVote' || scene.kind === 'partyPoll' || scene.kind === 'redraw') {
        answerEvent(world, c, scene, choice);
        // The answer may have brought the government down: on to the talks.
        if (c.phase === 'formation') return { showNight: false, offerReply: null, hiddenScene: [] };
        // The inbox stays open while there is more in it, and closes itself when it is empty.
        return { hiddenScene: [] };
      }
      if (c.phase === 'campaign') resolveCampaignScene(world, c, scene, choice);
      else resolveFormationScene(c, scene, choice);
    }),

    offer: (party, offer) => mutate((c, _g, world) => {
      const result = makeOffer(world, c, party, offer);
      return result ? { offerReply: { party, result } } : {};
    }),
    soundOut: (party) => mutate((c) => { soundOut(c, party); }),
    backRival: (party) => mutate((c) => { backRival(c, party); return { offerReply: null }; }),
    claimAgain: () => mutate((c) => { claimAgain(c); }),
    endDay: () => mutate((c, _g, world) => { endDay(world, c); return { offerReply: null }; }),

    setOrders: (patch) => mutate((c, _g, world) => setOrders(world, c, patch)),
    repeal: (id) => mutate((c) => { repeal(c, id); }),
    supply: (party, price) => mutate((c, _g, world) => { signSupply(world, c, party, price); }),
    chest: (lots) => mutate((c, _g, world) => { setAside(world, c, lots); }),
    foreign: (favour) => mutate((c, _g, world) => { takeForeign(world, c, favour); }),
    patronage: (level) => mutate((c) => { setPatronage(c, level); }),
    setBrief: (id, brief) => mutate((c) => { if (setBrief(c, id, brief)) syncOpinion(c); }),
    referendum: (id) => mutate((c, _g, world) => { callReferendum(world, c, id); }),
    foundAlliance: (name, mark) => mutate((c, _g, world) => { foundAlliance(world, c, name, mark); }),
    inviteAlly: (party) => mutate((c, _g, world) => { invite(world, c, party); }),
    dissolveAlliance: () => mutate((c) => { dissolveAlliance(c); }),
    expel: (party) => mutate((c, _g, world) => { expel(world, c, party); }),
    renewSupply: (party) => mutate((c, _g, world) => { renewSupply(world, c, party); }),
    inquiry: () => mutate((c, _g, world) => { openInquiry(world, c); }),
    agreeEarly: (party) => mutate((c, _g, world) => { agreeEarly(world, c, party); }),
    dropEarly: (party) => mutate((c) => { dropEarly(c, party); }),
    formUnity: () => mutate((c, _g, world) => { formUnity(world, c); }),
    offerDeputy: (party) => mutate((c) => { offerDeputy(c, party); }),
    writeLetter: (issue, tone) => mutate((c) => { if (writeLetter(c, issue, tone)) syncOpinion(c); }),
    usePower: (id) => mutate((c, _g, world) => { usePower(world, c, id); }),
    padRolls: () => mutate((c, _g, world) => { padRolls(world, c); }),
    grantSafe: (seat, faction) => mutate((c, _g, world) => { grantSafe(world, c, seat, faction); }),
    revokeSafe: (seat) => mutate((c) => { revokeSafe(c, seat); }),
    forceByElection: (seat) => mutate((c, _g, world) => { forceByElection(world, c, seat); }),
    discipline: (state, how) => mutate((c, _g, world) => { discipline(world, c, state, how); }),
    rebrand: (identity) => mutate((c, g, world) => { if (rebrand(world, c)) g.identity = identity; }),
    openSeat: (seat) => mutate((c, _g, world) => { openSeat(world, c, seat); }),
    standLeader: (seat) => mutate((c, _g, world) => { standLeader(world, c, seat); }),
    merge: (party) => mutate((c, _g, world) => { merge(world, c, party); }),
    shadow: (portfolio) => mutate((c, _g, world) => { nameShadow(world, c, portfolio); }),
    invest: (lots) => mutate((c, _g, world) => { invest(world, c, lots); }),
    trade: (holding, lots) => mutate((c, _g, world) => { trade(world, c, holding, lots); }),
    activity: (id) => mutate((c, _g, world) => { doActivity(world, c, id); }),
    borrow: () => mutate((c, _g, world) => { borrow(world, c); }),
    acceptMission: (id) => mutate((c) => { acceptMission(c, id); }),
    declineMission: (id) => mutate((c) => { declineMission(c, id); }),
    abandonMission: (id) => mutate((c, _g, world) => { abandonMission(world, c, id); }),
    seenMissions: () => mutate((c) => { seenMissions(c); }),
    seenMission: () => mutate((c) => { seenMission(c); }),
    setStance: (issue, to) => mutate((c) => { if (setStance(c, issue, to)) syncOpinion(c); }),
    togglePledge: (id) => mutate((c) => { if (togglePledge(c, id)) syncOpinion(c); }),
    launchManifesto: () => mutate((c) => { if (launchManifesto(c)) syncOpinion(c); }),
    advance: (weeks) => mutate((c, _g, world) => {
      skipAhead(world, c, weeks);
      // Parliament was dissolved along the way: the campaign opens where the leader is.
      if (c.phase === 'campaign') return { tab: 'actions', lastReport: null, selectedSeat: null, selectedState: c.parties[c.player]!.location };
      if (c.phase === 'formation') return { showNight: false, offerReply: null };
    }),
    aidSector: (id) => mutate((c, _g, world) => { aidSector(world, c, id); }),
    dissolve: (together) => mutate((c, _g, world) => {
      if (dissolve(world, c, !!together)) return { tab: 'actions', lastReport: null, selectedSeat: null, selectedState: c.parties[c.player]!.location };
      // The Palace said no: the answer is shown, and the request can be made again after a while.
      if (c.career?.palaceNo === c.career?.week) return { lastReport: c.news[c.news.length - 1] ?? null };
    }),
    nextTerm: () => mutate((c, _g, world) => {
      if (!nextTerm(world, c)) return;
      // The new term is played on a map refitted to the result just declared.
      const next = worldOf(c);
      if (next) { publishPublicPoll(next, c); offerMain(next, c); }
      return { tab: 'desk', view: 'last', showNight: false, offerReply: null, pactReply: null, lastReport: null, selectedSeat: null, selectedState: null };
    }),
    resumeTerm: () => mutate((c) => {
      if (resumeTerm(c)) return { tab: 'desk', offerReply: null };
    }),

    hideScene: (id) => set((s) => ({ hiddenScene: [...s.hiddenScene, id] })),
    openScene: () => set({ hiddenScene: [] }),
    setBudget: (patch) => mutate((c) => { setBudget(c, patch); }),
    reshuffle: (portfolio) => mutate((c) => { reshuffle(c, portfolio); }),
    appoint: (portfolio, option) => mutate((c, _g, world) => { appoint(world, c, portfolio, option); }),
    fieldSeat: (seatId) => mutate((c, _g, world) => { fieldSeat(world, c, seatId); }),
    withdrawSeat: (seatId) => mutate((c, _g, world) => { withdrawSeat(world, c, seatId); }),
    fieldCheapest: (limit) => mutate((c, _g, world) => { fieldCheapest(world, c, limit); }),
    enterSeat: (seatId) => mutate((c, _g, world) => { enterSeat(world, c, seatId); }),
    leaveSeat: (seatId) => mutate((c, _g, world) => { leaveSeat(world, c, seatId); }),
    playStates: async (sceneId, choice, wanted) => {
      const before = get().game;
      if (!before || before.aside) return;
      // The states' results are fetched when they are first wanted.
      await Promise.all(wanted.map((st) => loadState(st as StateId)));
      const current = get().game;
      if (!current || current.aside || current.id !== before.id) return;
      const g = structuredClone(current);
      const c = g.campaign;
      const world = worldOf(c);
      const scene = c.inbox.find((x) => x.id === sceneId && x.kind === 'event' && x.event === 'statePolls');
      if (!world || !scene) return;
      const stakes: Record<string, number> = {};
      for (const st of wanted) { const sw = fightWorld(c, st); if (sw && canFight(sw, c)) stakes[st] = stakeFor(sw, c.player, !!c.career!.founded); }
      const states = playRound(world, c, choice, wanted.filter((st) => st in stakes), stakes);
      if (!states) return;
      c.inbox = c.inbox.filter((x) => x.id !== sceneId);
      const first = states[0] as StateId;
      g.aside = { parked: c, state: first, queue: states.slice(1) as StateId[] };
      g.campaign = startAside(c, fightWorld(c, first)!, first);
      g.updatedAt = Date.now();
      set({ game: g, view: 'last', tab: 'actions', selectedSeat: null, selectedState: null, lastReport: null, pactReply: null, offerReply: null, showNight: false, hiddenScene: [] });
    },
    finishAside: async () => {
      const before = get().game;
      if (!before?.aside || before.campaign.phase !== 'done') return;
      const next = before.aside.queue[0];
      if (next) await loadState(next);
      const current = get().game;
      if (!current?.aside || current.id !== before.id || current.campaign.phase !== 'done') return;
      const g = structuredClone(current);
      const aside = g.aside!;
      const stateWorld = worldOf(g.campaign);
      if (!stateWorld) return;
      settleAside(aside.parked, g.campaign, stateWorld, aside.state);
      if (aside.queue.length > 0) {
        const st = aside.queue[0];
        g.aside = { parked: aside.parked, state: st, queue: aside.queue.slice(1) };
        g.campaign = startAside(aside.parked, fightWorld(aside.parked, st)!, st);
      } else {
        g.campaign = aside.parked;
        delete g.aside;
      }
      g.updatedAt = Date.now();
      set({ game: g, view: 'last', tab: g.aside ? 'actions' : 'desk', selectedSeat: null, selectedState: null, lastReport: null, pactReply: null, offerReply: null, showNight: false, hiddenScene: [] });
    },
    tableBill: (id) => mutate((c) => { tableBill(c, id); }),
    deliver: (index) => mutate((c) => { if (deliver(c, index)) syncOpinion(c); }),
    pullLever: (id) => mutate((c, _g, world) => { if (pullLever(world, c, id)) syncOpinion(c); }),
    tableMotion: () => mutate((c, _g, world) => {
      tableMotion(world, c);
      if (c.phase === 'formation') return { showNight: false, offerReply: null };
    }),
    leaveGovernment: () => mutate((c, _g, world) => {
      leaveGovernment(world, c);
      if (c.phase === 'formation') return { showNight: false, offerReply: null };
    }),
    retire: () => mutate((c) => { retire(c); }),

    hire: (role, index) => mutate((c) => { hire(c, role, index); }),
    dismiss: (role) => mutate((c) => { dismiss(c, role); }),
    vetStaff: (role, index) => mutate((c, _g, world) => { vet(world, c, role, index); }),
    chooseCandidate: (seat, option) => mutate((c, _g, world) => { choose(world, c, seat, option); }),
    vetHopeful: (seat, option) => mutate((c, _g, world) => { vetHopeful(world, c, seat, option); }),
    courtEndorser: (id) => mutate((c, _g, world) => ({ lastReport: courtEndorser(world, c, id) })),
    interview: (id) => mutate((c) => ({ lastReport: interview(c, id) })),
    hireTroopers: () => mutate((c, _g, world) => ({ lastReport: hireTroopers(world, c) })),
    renameGame: (name) => mutate((_c, g) => { g.name = name.slice(0, 60); }),
    loadGame: (state) => set((s) => ({
      loads: s.loads + 1,
      game: state,
      view: 'last', tab: state.campaign.phase === 'term' ? 'desk' : 'actions', lastReport: null, pactReply: null, offerReply: null, selectedSeat: null,
      // A saved game reopens on the count only if it was still running, or if there is nothing after it.
      showNight: state.campaign.phase === 'night' || (state.campaign.phase === 'done' && !state.campaign.formation),
      selectedState: state.campaign.phase === 'campaign' && (state.campaign.scenario === 'general' || state.campaign.scenario === 'career')
        ? state.campaign.parties[state.campaign.player]!.location : null,
    })),
    quitToTitle: () => {
      // Save now: the delayed autosave would find the game already gone.
      const g = get().game;
      if (g) saveStore.save(AUTO_SLOT, g);
      set({ game: null, selectedSeat: null, selectedState: null, lastReport: null });
    },
    restart: () => {
      const g = get().game;
      if (!g) return;
      get().startCampaign({ ...startOf(g), name: g.name, identity: g.identity });
    },
    setupWanted: false,
    newGameSetup: () => { get().quitToTitle(); set({ setupWanted: true }); },
    clearSetupWanted: () => set({ setupWanted: false }),
    menuOpen: false,
    setMenuOpen: (menuOpen) => set({ menuOpen }),
  };
});

// Autosave shortly after any change to the game.
let timer: ReturnType<typeof setTimeout> | undefined;
useStore.subscribe((state, prev) => {
  if (state.game === prev.game || !state.game) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    const game = useStore.getState().game;
    if (!game) return;
    const ok = saveStore.save(AUTO_SLOT, game);
    useStore.setState(ok ? { autosavedAt: Date.now(), autosaveFailed: false } : { autosaveFailed: saveStore.available });
  }, 400);
});

// Whatever the game has just earned goes on the player's profile: achievements, and a finished career for the gallery.
useStore.subscribe((state, prev) => {
  const game = state.game;
  if (!game || game === prev.game) return;
  const world = worldOf(game.campaign);
  if (!world) return;
  const now = Date.now();
  const entry = legacyEntry(game, now);
  const hung = entry ? hang(state.profile, entry) : state.profile;
  const { profile, fresh } = award(hung, earned(world, game.campaign, hung.legacies.map((e) => e.legacy)), now);
  if (profile === state.profile) return;
  profileStore.save(profile);
  useStore.setState({ profile, toasts: [...state.toasts, ...fresh] });
});
