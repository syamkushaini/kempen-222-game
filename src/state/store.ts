import { create } from 'zustand';
import { fightWorld, foundedWorld, getWorld, loadScenario, loadState, newPartyWorld, nextContest, ownWorld, worldOf } from '../data/world';
import { encodeChallenge, type ChallengeSpec } from '../sim/campaign/challengeCode';
import { translate, type Lang } from '../i18n/strings';
import { earned, type AchievementId } from '../sim/campaign/achievements';
import {
  answerEvent, dissolve, foundForContest, invest, nextTerm, resumeTerm, setOrders, skipAhead, startCareer, syncOpinion,
} from '../sim/campaign/career';
import {
  appoint, cancelProgramme, deliver, leaveGovernment, repeal, pullLever, reshuffle, setBudget, tableBill, tableMotion,
} from '../sim/campaign/govern';
import { choose, openSeat, standLeader, vetHopeful } from '../sim/campaign/candidates';
import { canChoose } from '../sim/campaign/events';
import { borrow } from '../sim/campaign/loan';
import { courtEndorser } from '../sim/campaign/endorsers';
import type { IdeologyId } from '../sim/campaign/leader';
import { retire } from '../sim/campaign/legacy';
import { renameMinister } from '../sim/campaign/office';
import { switchParty } from '../sim/campaign/switching';
import { makeMove as makeMoveOf, type MoveId } from '../sim/campaign/moves';
import { courtChief as courtChiefOf, sendChief as sendChiefOf } from '../sim/campaign/chiefsTerm';
import { hireTroopers, interview } from '../sim/campaign/media';
import { cleanUp } from '../sim/campaign/graft';
import { crossTheFloor, type CrossStake } from '../sim/campaign/crossing';
import { claim } from '../sim/campaign/claims';
import { dismiss, hire, vet } from '../sim/campaign/staff';
import { abandonMission, acceptMission, declineMission, offerMain, seenMission, seenMissions } from '../sim/campaign/missions';
import { launchManifesto, setBrief, setStance, togglePledge } from '../sim/campaign/policy';
import {
  breakPact, courtDefector, type Stake, jointAttack, meetLeader, proposePact, resolveCampaignScene, seekUnderstanding,
  type PactProposal, type PactVerdict,
} from '../sim/campaign/diplomacy';
import {
  backRival, claimAgain, endDay, makeOffer, requestTerms, resolveFormationScene, soundOut, type Ask, type AskReply, type OfferResult,
} from '../sim/campaign/formation';
import { carriedFollowing, voteShares } from '../sim/campaign/founding';
import { recordAsideResults } from '../sim/campaign/results';
import { summarise } from '../sim/campaign/night';
import { buildCampaign, type SimConfig } from '../sim/campaign/simulate';
import { closeNight, electionResult, endWeek, newCampaign, playOut, playerAct, playerPoll, publishPublicPoll, setChief, setChiefFloor } from '../sim/campaign/turn';
import type {
  ActionId, ActionTarget, BackstoryId, Campaign, Challenge, ChiefLevel, Difficulty, EndorserId, LeverId, LineId, MeasureId, NewsItem, Offer, Orders,
  IssueId, OutletId, PledgeId, PollQuality, PollScope, PortfolioId, RoleId, SeatResults, Stronghold,
} from '../sim/campaign/types';
import { Rng, randomSeed } from '../sim/rng';
import type { LineDial } from '../sim/campaign/lineDial';
import type { World } from '../sim/election';
import { PARTY_IDS, type RegionId, type StateId } from '../sim/types';
import { PARTIES } from '../data/parties';
import { showAlliance, type AllianceLook } from './allianceLook';
import { newGame, startOf, type GameState, type StartOptions } from './game';
import type { Identity } from './identity';
import { cleanLayers, DEFAULT_LAYERS, type LayerId } from '../sim/campaign/layers';
import { AUTO_SLATE, fieldBest, fieldCheapest, fieldSeat, nominationsOpen, withdrawSeat } from '../sim/campaign/slate';
import { autoChoose, openAndChooseAll } from '../sim/campaign/candidates';
import { enterSeat, leaveSeat } from '../sim/campaign/entry';
import { usePower, type PowerId } from '../sim/campaign/statepowers';
import { writeLetter, type Tone } from '../sim/campaign/letters';
import { agreeEarly, dropEarly } from '../sim/campaign/earlypact';
import { formUnity } from '../sim/campaign/grand';
import { offerDeputy } from '../sim/campaign/plots';
import { aidSector, type SectorId } from '../sim/campaign/sectors';
import { openInquiry } from '../sim/campaign/committee';
import { challenge, type Method } from '../sim/campaign/challengePolicy';
import { dissolveAlliance, expel, foundAlliance, invite, setAllianceLook as setAlliance } from '../sim/campaign/alliance';
import { renewSupply, signSupply, type SupplyPrice } from '../sim/campaign/supply';
import { merge } from '../sim/campaign/merge';
import { nameShadow } from '../sim/campaign/shadow';
import { resolveAgenda } from '../sim/campaign/agenda';
import { forceByElection } from '../sim/campaign/contests';
import { callReferendum } from '../sim/campaign/courts';
import { setPatronage } from '../sim/campaign/patronage';
import { grantSafe, revokeSafe } from '../sim/campaign/safeseat';
import { discipline, doActivity, padRolls, rebrand, setAside, takeForeign, trade, type Discipline, type ActivityId, type FavourId, type HoldingId } from '../sim/campaign/party';
import { followAdvice } from '../sim/campaign/advice';
import { repayDebt } from '../sim/campaign/treasury';
import { setRepayShare as setRepay, setTax as setTaxDial, startProject as beginProject, stopProject as endProject, type TaxId } from '../sim/campaign/econPlans';
import { adoptDoctrine as adoptMeterDoctrine } from '../sim/campaign/doctrines';
import { setStance as setMeterStance, type StanceId } from '../sim/campaign/stances';
import { setRate as setPolicyRate, useTool as useEconTool } from '../sim/campaign/econTools';
import { canFight, playRound, settleAside, stakeFor, startAside } from '../sim/campaign/aside';
import { notePlay } from './streak';
import { clearedHeat } from '../sim/campaign/heat';
import { keepSaves } from './persist';
import { award, awardLegacyPoints, hang, legacyEntry, noteAchieved, ProfileStore, recordHeat, recordPoints, unlock, type Profile } from './profile';
import { forgetParty, keepParty, PartyBook, type SavedParty } from './partyBook';
import { pointsOf } from '../sim/campaign/scoring';
import { finishedChallenge } from '../sim/campaign/challengePoints';
import { isAccent, isSkin, type AccentId, type SkinId } from '../ui/cosmetics';
import { AUTO_SLOT, browserStorage, SaveStore } from './saves';
import { attachCloud } from './cloudSync';

/**
 * What the map shows: the last election, the player's own picture from polls,
 * or (developer mode only) how the country would really vote today.
 */
export type MapView = 'last' | 'estimate' | 'truth';
export type SidebarTab = 'desk' | 'economy' | 'markets' | 'acts' | 'meters' | 'allies' | 'cabinet' | 'orders' | 'funds' | 'reshape' | 'house' | 'policy' | 'missions' | 'actions' | 'team' | 'party' | 'slate' | 'chiefs' | 'deals' | 'seats' | 'polls' | 'voters' | 'news' | 'saves';
export type Theme = 'system' | 'light' | 'dark';
export type Palette = 'standard' | 'accessible';
export type TextSize = 'normal' | 'large';

/** A notification shown in the notification center. */
export interface NotificationItem {
  id: string;
  week: number;
  title: string;
  body: string;
  tone: 'good' | 'bad' | 'neutral';
  read: boolean;
}

export interface Settings {
  lang: Lang;
  theme: Theme;
  /** Sound effects. */
  sound: boolean;
  /** The background tune, quiet. Like the effects it waits for the player's first click, as browsers insist. */
  music: boolean;
  /** Party colours that colour-blind players can tell apart. */
  palette: Palette;
  /** The surface the screens are drawn on, and the colour of the buttons: earned by achievements (see cosmetics.ts). */
  skin: SkinId;
  accent: AccentId;
  textSize: TextSize;
  /** How tightly the screens are packed. */
  density: 'comfortable' | 'compact';
  /** The "What now?" line above the map. */
  hints: boolean;
  /** The map is drawn in 3D, where the browser can. */
  map3d: boolean;
  /** Which extra things the map shows, ticked by the player. */
  layers: LayerId[];
  /** High contrast mode for accessibility. */
  highContrast: 'off' | 'on';
  /** Anonymous counting of how the game is played (see analytics.ts): on unless the player turns it off. */
  analytics: boolean;
}

const SETTINGS_KEY = 'k222.settings';
const storage = browserStorage();
export const saveStore = new SaveStore(storage);
// A player who has signed in has every save followed to the cloud (nothing happens without a cloud address, or without a sign-in).
attachCloud(saveStore);
const profileStore = new ProfileStore(storage);
const partyBook = new PartyBook(storage);

/** Whether a player who has not chosen starts with the 3D map: on a laptop or desktop with a mouse, unless they have asked for less motion. */
function prefers3d(): boolean {
  if (typeof matchMedia !== 'function') return false;
  return matchMedia('(min-width: 981px) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function loadSettings(): Settings {
  const fallback: Settings = { lang: 'en', theme: 'system', sound: true, music: true, palette: 'standard', skin: 'standard', accent: 'party', textSize: 'normal', density: 'comfortable', hints: true, map3d: prefers3d(), layers: DEFAULT_LAYERS, highContrast: 'off', analytics: true };
  try {
    const raw = JSON.parse(storage?.getItem(SETTINGS_KEY) ?? 'null');
    if (!raw) return fallback;
    return {
      lang: raw.lang === 'ms' ? 'ms' : 'en',
      theme: raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : 'system',
      sound: raw.sound !== false,
      music: raw.music !== false,
      palette: raw.palette === 'accessible' ? 'accessible' : 'standard',
      skin: isSkin(raw.skin) ? raw.skin : 'standard',
      accent: isAccent(raw.accent) ? raw.accent : 'party',
      textSize: raw.textSize === 'large' ? 'large' : 'normal',
      density: raw.density === 'compact' ? 'compact' : 'comfortable',
      hints: raw.hints !== false,
      map3d: typeof raw.map3d === 'boolean' ? raw.map3d : prefers3d(),
      layers: cleanLayers(raw.layers) ?? DEFAULT_LAYERS,
      highContrast: (raw.highContrast === 'on' || raw.highContrast === 'off') ? raw.highContrast : 'off',
      analytics: raw.analytics !== false,
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
  /** Where the player was looking (the whole country, or a state) before a seat was opened: closing the seat goes back to it. Absent when no seat is open. */
  seatReturn?: RegionId | null;
  selectedSeat: string | null;
  /** Counts every seat picked, so that picking the seat already chosen opens its card again after it was closed. */
  seatPicks: number;
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
  /** The last answer to a request for better terms. */
  askReply: { party: number; ask: Ask; reply: AskReply } | null;
  /** Election night stays on screen after the count until the player moves on. */
  showNight: boolean;
  /** A scene the player has set aside to look around before answering. */
  hiddenScene: number[];
  /** What a decision just made brought into the news, shown once as a popup. */
  decisionNews: NewsItem[] | null;
  /** Recent notifications shown in the notification center. */
  notifications: NotificationItem[];
  /** Adds a notification to the center. */
  addNotification(item: NotificationItem): void;
  /** Removes a notification by id. */
  dismissNotification(id: string): void;
  /** Clears all notifications. */
  clearNotifications(): void;
  /** When the autosave last succeeded, or null if it has not or cannot. */
  autosavedAt: number | null;
  autosaveFailed: boolean;
  /** Achievements and finished careers: the player's, not any one game's. */
  profile: Profile;
  /** Parties the player has made, to be used again in a new game. */
  savedParties: SavedParty[];
  /** Takes a saved party off the list. */
  forgetSavedParty(at: number): void;
  /** Achievements just earned, waiting to be shown. */
  toasts: AchievementId[];
  /** How many games have been loaded this session. Screens with a running count start it again when this changes. */
  loads: number;

  setSettings(patch: Partial<Settings>): void;
  dismissToast(id: AchievementId): void;
  /** Spends Legacy Points to unlock an archetype or perk, once. True if it is unlocked already or just was; false only if it can't be afforded. */
  unlockWithPoints(id: string, cost: number): boolean;
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
    /** Weeks of campaign, where a challenge made by a player does not want the contest's usual. */
    weeks?: number;
    /** Where a career's founded party begins: a seat's id, or 'random' (or nothing) to leave it to luck. */
    seat?: string;
    /** A new party carried on from an earlier contest: the following it begins with. */
    following?: number;
    /** Where that party was strongest, and what it won there. */
    stronghold?: Stronghold;
    /** A state election played again: what every party won in the one before, which this one is fitted to (see `Campaign.carried`). */
    carried?: SeatResults;
  }): void;
  /** Plays the same state election again from the result just declared: every seat and every party's votes as they ended. Can go on without end. */
  carryOn(): void;
  /** Carries the party the player founded on from a finished by-election or state election to the next contest up (see `nextContest`). */
  climb(): Promise<void>;
  /** A challenge sent as a link, waiting for the player to say whether to play it. */
  pendingChallenge: ChallengeSpec | null;
  setPendingChallenge(spec: ChallengeSpec | null): void;
  /** Starts a challenge made by a player or taken from a link: the same contest, party, seed and rules every time. */
  startChallenge(spec: ChallengeSpec): void;
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
  /** Hands the weeks still to come to the team, and goes to polling day. */
  finishWithTeam(): void;
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
  /** The player has read the chapters that closed (see storyline.ts). */
  seeStory(): void;
  backRival(party: number): void;
  askTerms(party: number, ask: Ask): void;
  claimAgain(): void;
  endDay(): void;

  /** Career: changes the standing orders for the weeks between elections. */
  setOrders(patch: Partial<Orders>): void;
  invest(lots: number): void;
  /** The opposition names someone to shadow a portfolio. */
  shadow(portfolio: PortfolioId): void;
  /** The player gives a minister, or a shadow minister, a name of their own. */
  renameMinister(portfolio: PortfolioId, name: string, shadow?: boolean): void;
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
  /** The opposition challenges a policy of the government: in the House, in court, or before the public. */
  challengePolicy(id: PledgeId, method: Method): void;
  foundAlliance(name: number, mark: number, title?: string, color?: string): void;
  setAllianceLook(title: string | undefined, color: string | undefined): void;
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
  /** The head of government cancels a programme and takes its cost off the standing commitments. */
  cancelProgramme(id: PledgeId): void;
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
  setBudget(patch: { line?: LineId; tax?: boolean; value: LineDial } | { measure: MeasureId; on: boolean }): void;
  reshuffle(portfolio: PortfolioId): void;
  appoint(portfolio: PortfolioId, option: number): void;
  fieldSeat(seatId: string): void;
  withdrawSeat(seatId: string): void;
  fieldCheapest(limit: number): void;
  /** Fills the party's candidates for it: the seats it is likeliest to win (for a party of the player's own making, within what it can spend), and the best hopeful in each seat the leader chooses for. */
  autoFill(): void;
  /** Opens every seat the leader has days for and chooses the best candidate in each. */
  autoFillAll(): void;
  /** Puts a candidate in a seat the party has never stood in, or takes one back. */
  enterSeat(seatId: string): void;
  leaveSeat(seatId: string): void;
  /** Answers a round of state polls by fighting some of its states in person (see aside.ts). */
  playStates(sceneId: number, choice: number, states: string[]): Promise<void>;
  /** A state election fought in person is over: back to the career, or on to the next state of the round. */
  finishAside(): Promise<void>;
  tableBill(id: string): void;
  deliver(index: number): void;
  /** The player, a partner in the government, presses the head of government for a promise (see claims.ts). */
  claimPromise(index: number): void;
  pullLever(id: LeverId): void;
  tableMotion(): void;
  /** The player, in opposition, tries to bring members of a governing party across the floor (see crossing.ts). */
  crossFloor(party: number, stake: CrossStake): void;
  leaveGovernment(): void;
  retire(): void;
  /** An ousted leader joins another party and the career goes on. */
  switchParty(to: number): void;

  hire(role: RoleId, index: number): void;
  dismiss(role: RoleId): void;
  vetStaff(role: RoleId, index: number): void;
  /** The leader follows a hired person's suggestion (see advice.ts). */
  followAdvice(role: RoleId): void;
  closeDecisionNews(): void;
  /** The head of government uses an economic tool. */
  useTool(id: string): void;
  setRate(value: number): void;
  setMeterPolicy(id: StanceId, notch: number): void;
  adoptDoctrine(id: string): void;
  setTax(id: TaxId, value: number): void;
  setRepayShare(share: number): void;
  startProject(id: string): void;
  stopProject(id: string): void;
  repayDebt(amount: number): void;
  chooseCandidate(seat: string, option: number): void;
  vetHopeful(seat: string, option: number): void;
  courtEndorser(id: EndorserId): void;
  interview(id: OutletId): void;
  hireTroopers(): void;
  /** Pays for an audit and publishes the party's books: the corruption meter falls. */
  cleanUp(): void;
  courtChief(state: RegionId): void;
  makeMove(id: MoveId): void;
  sendChief(state: RegionId): void;
  renameGame(name: string): void;
  loadGame(state: GameState): void;
  quitToTitle(): void;
  /** Starts the open game again from the beginning: the same contest, party and settings, with the same name. */
  restart(): void;
  /** Leaves for the title screen with the full set-up of a new game showing. */
  newGameSetup(): void;
  /** Starts a sandbox game: the simulator's settings, played by the player as the party in focus. */
  startSandbox(cfg: SimConfig): void;
  /** Changes anything at all about a sandbox game, and puts opinion together again from the parts. */
  sandboxEdit(fn: (c: Campaign, world: World) => void): void;
  /** Takes back the last thing done in a sandbox game, an action or a change of settings alike. */
  sandboxUndo(): void;
  /** Games a sandbox player can go back to, the latest last. Never saved. */
  undoStack: GameState[];
  /** The simulator is open in place of the title screen (see Simulator.tsx). */
  simulating: boolean;
  setSimulating(on: boolean): void;
  /** Set by `newGameSetup` so the title screen opens on the set-up, and cleared once it has. */
  setupWanted: boolean;
  clearSetupWanted(): void;
  /** Whether the game menu is showing. */
  menuOpen: boolean;
  setMenuOpen(open: boolean): void;
}

const settings = loadSettings();
/** How many steps back a sandbox game can go. */
const UNDO = 40;

/** The colour and name the map gives an alliance's members, taken from the game: the player's own party's colour if none was chosen. */
export const allianceLookOf = (game: GameState | null): AllianceLook | null => {
  const a = game?.campaign.career?.alliance;
  if (!game || !a) return null;
  return { members: a.members, color: a.color ?? PARTIES[PARTY_IDS[game.campaign.player]].color, title: a.title ?? null, name: a.name };
};

export const useStore = create<Store>((set, get) => {
  /** Applies a change to the campaign on a copy, so the UI sees a new object. */
  const mutate = (fn: (c: Campaign, g: GameState, world: World) => Partial<Store> | void) => {
    const current = get().game;
    const world = current && worldOf(current.campaign);
    if (!current || !world) return;
    const g = structuredClone(current);
    const extra = fn(g.campaign, g, world) ?? {};
    g.updatedAt = Date.now();
    // A sandbox game can be taken back a step at a time.
    if (current.campaign.sim?.sandbox) extra.undoStack = [...get().undoStack, current].slice(-UNDO);
    // Decisions come up by themselves; only the ones the player has set aside wait as a bar, and a new one is never among them.
    const hidden = (extra.hiddenScene ?? get().hiddenScene).filter((id) => g.campaign.inbox.some((x) => x.id === id));
    set({ game: g, ...extra, hiddenScene: hidden });
  };
  /** Keeps a party the player has made, so that a later game can use it again. */
  const keepSaved = (identity: Identity) => {
    const next = keepParty(get().savedParties, identity, Date.now());
    if (next === get().savedParties) return;
    set({ savedParties: next });
    partyBook.save(next);
  };

  return {
    game: null,
    settings,
    dev: DEV,
    view: 'last',
    tab: 'actions',
    selectedState: null,
    selectedSeat: null,
    seatPicks: 0,
    lastReport: null,
    clearReport: () => set({ lastReport: null }),
    flash: { seat: null, n: 0 },
    preview: null,
    setPreview: (seat) => { if (get().preview !== seat) set({ preview: seat }); },
    pollOpen: false,
    setPollOpen: (pollOpen) => set({ pollOpen }),
    pactReply: null,
    offerReply: null,
    askReply: null,
    showNight: false,
    hiddenScene: [],
    decisionNews: null,
    autosavedAt: null,
    autosaveFailed: false,
    profile: profileStore.load(),
    savedParties: partyBook.load(),
    forgetSavedParty: (at) => {
      const next = forgetParty(get().savedParties, at);
      set({ savedParties: next });
      partyBook.save(next);
    },
    toasts: [],
    notifications: [],
    addNotification: (item) => set((s) => ({ notifications: [item, ...s.notifications].slice(0, 50) })),
    dismissNotification: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
    clearNotifications: () => set({ notifications: [] }),
    loads: 0,

    setSettings: (patch) => {
      const next = { ...get().settings, ...patch };
      set({ settings: next });
      try { storage?.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch { /* settings are a convenience */ }
    },
    dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x !== id) })),
    unlockWithPoints: (id, cost) => {
      const { profile, ok } = unlock(get().profile, id, cost);
      if (ok) { set({ profile }); profileStore.save(profile); }
      return ok;
    },
    setView: (view) => set({ view }),
    setTab: (tab) => set({ tab }),
    selectState: (state) => set({ selectedState: state, selectedSeat: null, seatReturn: undefined }),
    selectSeat: (seatId, state) => set((s) => {
      // Closing a seat goes back to where it was opened from: the list of the whole country, or of the state that was being looked at.
      if (seatId === null) return { selectedSeat: null, ...(s.seatReturn !== undefined ? { selectedState: s.seatReturn } : {}), seatReturn: undefined };
      // The first seat opened remembers where the player was looking; going from seat to seat keeps that.
      return { selectedSeat: seatId, seatPicks: s.seatPicks + 1, selectedState: state ?? s.selectedState, seatReturn: s.selectedSeat === null ? s.selectedState : s.seatReturn };
    }),

    startCampaign: ({ name, scenario, player, difficulty, seed, founded = false, stances, backstory = null, ideology = null, identity = null, challenge, realStates = false, weeks, seat, following, stronghold, carried }) => {
      // A founded party's first term is played in a country with its name already on every ballot.
      const base = getWorld(scenario);
      // A party the player has made their own may stand in any seat of a career, at a price; it needs a world in which it is on every ballot.
      const own = !!(base?.rules.career && identity && !founded);
      const drawn = seed ?? randomSeed();
      // A party founded from nothing begins in one seat: the one chosen, or one drawn by the game's seed.
      const home = founded && base?.rules.career ? (seat && seat !== 'random' && base.seatIndex.has(seat) ? seat : base.seats[new Rng(drawn).int(base.seats.length)].id) : undefined;
      const refit = !founded && !base?.rules.career && scenario.startsWith('state:') && carried ? worldOf({ scenario, career: null, carried }) : null;
      const world = refit ?? (founded ? (base?.rules.career ? foundedWorld(scenario, home) : newPartyWorld(scenario, following, stronghold)) : own ? ownWorld(scenario, player) ?? base : base);
      if (!world) return;
      if (identity) keepSaved(identity);
      const opts = { player, difficulty, seed: drawn, backstory, challenge, ...(weeks !== undefined ? { totalWeeks: weeks } : {}) };
      // Kept with the game so that it can be started again exactly as it was set up.
      const start: StartOptions = { scenario, player, difficulty, ...(seed !== undefined ? { seed } : {}), backstory, ideology, ...(founded ? { founded, stances, ...(home ? { seat: home } : {}), ...(following ? { following } : {}), ...(stronghold ? { stronghold } : {}) } : {}), ...(refit && carried ? { carried } : {}), ...(realStates ? { realStates } : {}), ...(challenge ? { challenge } : {}), ...(weeks !== undefined ? { weeks } : {}) };
      // A platform of its own belongs to a party of the player's own making.
      const campaign = world.rules.career ? startCareer(world, { ...opts, ideology: identity ? ideology : null, founded, stances, realStates, own, ...(home ? { foundedSeat: home } : {}), held: own && base ? base.seats.filter((_, i) => base.baseline.contesting[i][player]).map((s) => s.id) : undefined }) : newCampaign(world, opts);
      if (founded && !world.rules.career) { foundForContest(world, campaign, backstory); if (following) campaign.following = following; if (stronghold) campaign.stronghold = stronghold; }
      if (refit && carried) campaign.carried = structuredClone(carried);
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
    pendingChallenge: null,
    setPendingChallenge: (pendingChallenge) => set({ pendingChallenge }),
    startChallenge: (spec) => {
      const lang = get().settings.lang;
      void loadScenario(spec.scenario).then(() => {
        set({ pendingChallenge: null });
        get().startCampaign({
          name: translate(lang, 'challenge.made.name'), scenario: spec.scenario, player: PARTY_IDS.indexOf(spec.party), difficulty: spec.difficulty, seed: spec.seed,
          challenge: { fog: spec.fog, noisy: spec.noisy, ...(spec.lean ? { lean: true } : {}), code: encodeChallenge(spec) }, ...(spec.weeks !== undefined ? { weeks: spec.weeks } : {}),
        });
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
    finishWithTeam: () => mutate((c, _g, world) => {
      playOut(world, c);
      return { lastReport: null, pactReply: null, selectedSeat: null, selectedState: null, showNight: true };
    }),
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
        const seen = c.news.length;
        answerEvent(world, c, scene, choice);
        const fresh = c.news.slice(seen);
        // The answer may have brought the government down: on to the talks.
        if (c.phase === 'formation') return { showNight: false, offerReply: null, hiddenScene: [], decisionNews: null };
        // The inbox stays open while there is more in it, and closes itself when it is empty.
        return { hiddenScene: [], decisionNews: c.phase === 'term' && fresh.length ? fresh : null };
      }
      if (c.phase === 'campaign') resolveCampaignScene(world, c, scene, choice);
      else resolveFormationScene(c, scene, choice);
    }),

    offer: (party, offer) => mutate((c, _g, world) => {
      const result = makeOffer(world, c, party, offer);
      return result ? { offerReply: { party, result } } : {};
    }),
    soundOut: (party) => mutate((c) => { soundOut(c, party); }),
    seeStory: () => mutate((c) => { if (c.career?.story && c.career.story.seen < c.career.story.log.length) c.career.story.seen++; }),
    askTerms: (party, ask) => mutate((c, _g, world) => {
      const reply = requestTerms(world, c, party, ask);
      return { askReply: reply ? { party, ask, reply } : null };
    }),
    backRival: (party) => mutate((c) => { backRival(c, party); return { offerReply: null }; }),
    claimAgain: () => mutate((c) => { claimAgain(c); }),
    endDay: () => mutate((c, _g, world) => { endDay(world, c); return { offerReply: null }; }),

    setOrders: (patch) => mutate((c, _g, world) => setOrders(world, c, patch)),
    repeal: (id) => mutate((c) => { repeal(c, id); }),
    cancelProgramme: (id) => mutate((c) => { cancelProgramme(c, id); }),
    supply: (party, price) => mutate((c, _g, world) => { signSupply(world, c, party, price); }),
    chest: (lots) => mutate((c, _g, world) => { setAside(world, c, lots); }),
    foreign: (favour) => mutate((c, _g, world) => { takeForeign(world, c, favour); }),
    patronage: (level) => mutate((c) => { setPatronage(c, level); }),
    setBrief: (id, brief) => mutate((c) => { if (setBrief(c, id, brief)) syncOpinion(c); }),
    referendum: (id) => mutate((c, _g, world) => { callReferendum(world, c, id); }),
    foundAlliance: (name, mark, title, color) => mutate((c, _g, world) => { foundAlliance(world, c, name, mark, title, color); }),
    setAllianceLook: (title, color) => mutate((c) => { setAlliance(c, title, color); }),
    inviteAlly: (party) => mutate((c, _g, world) => { invite(world, c, party); }),
    dissolveAlliance: () => mutate((c) => { dissolveAlliance(c); }),
    expel: (party) => mutate((c, _g, world) => { expel(world, c, party); }),
    renewSupply: (party) => mutate((c, _g, world) => { renewSupply(world, c, party); }),
    inquiry: () => mutate((c, _g, world) => { openInquiry(world, c); }),
    challengePolicy: (id, method) => mutate((c, _g, world) => { challenge(world, c, id, method); }),
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
    rebrand: (identity) => mutate((c, g, world) => { if (rebrand(world, c)) { g.identity = identity; keepSaved(identity); } }),
    openSeat: (seat) => mutate((c, _g, world) => { openSeat(world, c, seat); }),
    standLeader: (seat) => mutate((c, _g, world) => { standLeader(world, c, seat); }),
    merge: (party) => mutate((c, _g, world) => { merge(world, c, party); }),
    shadow: (portfolio) => mutate((c, _g, world) => { nameShadow(world, c, portfolio); }),
    renameMinister: (portfolio, name, shadow = false) => mutate((c) => { renameMinister(c, portfolio, name, shadow); }),
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

    repayDebt: (amount) => mutate((c, _g, world) => { repayDebt(world, c, amount); }),
    useTool: (id) => mutate((c, _g, world) => { useEconTool(world, c, id); }),
    setTax: (id, value) => mutate((c) => { setTaxDial(c, id, value); }),
    setRepayShare: (share) => mutate((c) => { setRepay(c, share); }),
    startProject: (id) => mutate((c) => { beginProject(c, id); }),
    stopProject: (id) => mutate((c) => { endProject(c, id); }),
    setRate: (value) => mutate((c) => { setPolicyRate(c, value); }),
    setMeterPolicy: (id, notch) => mutate((c) => { setMeterStance(c, id, notch); }),
    adoptDoctrine: (id) => mutate((c) => { adoptMeterDoctrine(c, id); }),
    closeDecisionNews: () => set({ decisionNews: null }),
    hideScene: (id) => set((s) => ({ hiddenScene: [...s.hiddenScene, id] })),
    openScene: () => set({ hiddenScene: [] }),
    setBudget: (patch) => mutate((c) => { setBudget(c, patch); }),
    reshuffle: (portfolio) => mutate((c) => { reshuffle(c, portfolio); }),
    appoint: (portfolio, option) => mutate((c, _g, world) => { appoint(world, c, portfolio, option); }),
    fieldSeat: (seatId) => mutate((c, _g, world) => { fieldSeat(world, c, seatId); }),
    withdrawSeat: (seatId) => mutate((c, _g, world) => { withdrawSeat(world, c, seatId); }),
    fieldCheapest: (limit) => mutate((c, _g, world) => { fieldCheapest(world, c, limit); }),
    autoFill: () => mutate((c, _g, world) => {
      if (nominationsOpen(c)) fieldBest(world, c, Math.round((c.parties[c.player]?.funds ?? 0) * AUTO_SLATE));
      autoChoose(world, c);
    }),
    autoFillAll: () => mutate((c, _g, world) => { openAndChooseAll(world, c); }),
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
      g.campaign = startAside(c, fightWorld(c, first)!, first, world);
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
        g.campaign = startAside(aside.parked, fightWorld(aside.parked, st)!, st, worldOf(aside.parked) ?? undefined);
      } else {
        g.campaign = aside.parked;
        delete g.aside;
      }
      g.updatedAt = Date.now();
      set({ game: g, view: 'last', tab: g.aside ? 'actions' : 'desk', selectedSeat: null, selectedState: null, lastReport: null, pactReply: null, offerReply: null, showNight: false, hiddenScene: [] });
    },
    tableBill: (id) => mutate((c) => { tableBill(c, id); }),
    deliver: (index) => mutate((c) => { if (deliver(c, index)) syncOpinion(c); }),
    claimPromise: (index) => mutate((c) => { if (claim(c, index)) syncOpinion(c); }),
    pullLever: (id) => mutate((c, _g, world) => { if (pullLever(world, c, id)) syncOpinion(c); }),
    tableMotion: () => mutate((c, _g, world) => {
      tableMotion(world, c);
      if (c.phase === 'formation') return { showNight: false, offerReply: null };
    }),
    crossFloor: (party, stake) => mutate((c, _g, world) => {
      if (crossTheFloor(world, c, party, stake)) syncOpinion(c);
      if (c.phase === 'formation') return { showNight: false, offerReply: null };
    }),
    leaveGovernment: () => mutate((c, _g, world) => {
      leaveGovernment(world, c);
      if (c.phase === 'formation') return { showNight: false, offerReply: null };
    }),
    retire: () => mutate((c) => { retire(c); }),
    switchParty: (to) => mutate((c, _g, world) => { switchParty(world, c, to); }),

    hire: (role, index) => mutate((c) => { hire(c, role, index); }),
    dismiss: (role) => mutate((c) => { dismiss(c, role); }),
    vetStaff: (role, index) => mutate((c, _g, world) => { vet(world, c, role, index); }),
    followAdvice: (role) => mutate((c, _g, world) => { followAdvice(world, c, role); }),
    chooseCandidate: (seat, option) => mutate((c, _g, world) => { choose(world, c, seat, option); }),
    vetHopeful: (seat, option) => mutate((c, _g, world) => { vetHopeful(world, c, seat, option); }),
    courtEndorser: (id) => mutate((c, _g, world) => ({ lastReport: courtEndorser(world, c, id) })),
    interview: (id) => mutate((c) => ({ lastReport: interview(c, id) })),
    makeMove: (id) => mutate((c, _g, world) => { makeMoveOf(world, c, id); }),
    courtChief: (st) => mutate((c, _g, world) => { courtChiefOf(world, c, st); }),
    sendChief: (st) => mutate((c, _g, world) => { sendChiefOf(world, c, st, new Rng((c.rng ^ 0x5e0d) + (c.career?.week ?? 0))); }),
    cleanUp: () => mutate((c, _g, world) => { cleanUp(world, c); }),
    hireTroopers: () => mutate((c, _g, world) => ({ lastReport: hireTroopers(world, c) })),
    renameGame: (name) => mutate((_c, g) => { g.name = name.slice(0, 60); }),
    loadGame: (state) => set((s) => ({
      loads: s.loads + 1,
      undoStack: [],
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
      set({ game: null, selectedSeat: null, selectedState: null, lastReport: null, simulating: false, undoStack: [] });
    },
    restart: () => {
      const g = get().game;
      if (!g) return;
      get().startCampaign({ ...startOf(g), name: g.name, identity: g.identity });
    },
    climb: async () => {
      const g = get().game;
      const c = g?.campaign;
      if (!g || !c || g.aside || c.phase !== 'done' || !c.newParty || c.career) return;
      const world = worldOf(c);
      const result = world && electionResult(world, c);
      const next = world && nextContest(c.scenario, world);
      if (!world || !result || !next) return;
      const share = summarise(world, c, result).voteShare;
      await loadScenario(next);
      // The party carries on only if this is still the game that was open when the button was pressed.
      if (get().game?.id !== g.id) return;
      get().startCampaign({
        name: g.name, scenario: next, player: c.player, difficulty: c.difficulty, backstory: c.team.leader.backstory ?? null, ideology: null,
        identity: g.identity, founded: true, following: carriedFollowing(share),
        // Where the party won its vote is where it is strongest in the next contest: the seat it fought, or the state.
        ...(share > 0 ? { stronghold: { place: c.scenario.startsWith('state:') ? c.scenario.slice(6) : world.seats[0].id, share, ...(world.seats.length === 1 ? { shares: voteShares(result.votes) } : {}) } } : {}),
        ...(c.challenge ? { challenge: { fog: c.challenge.fog, noisy: c.challenge.noisy } } : {}),
      });
    },
    carryOn: () => {
      const g = get().game;
      const c = g?.campaign;
      // A plain state election, over, and not a set challenge (its scores are for the same contest for everyone).
      if (!g || !c || g.aside || c.phase !== 'done' || c.career || c.newParty || c.challenge || !c.scenario.startsWith('state:')) return;
      const world = worldOf(c);
      const kept = world && recordAsideResults(world, c);
      if (!kept) return;
      get().startCampaign({ ...startOf(g), name: g.name, identity: g.identity, carried: kept });
    },
    undoStack: [],
    startSandbox: (cfg) => {
      const world = getWorld(cfg.scenario);
      if (!world) return;
      const campaign = buildCampaign(world, cfg, 'play');
      offerMain(world, campaign);
      set({
        game: newGame(translate(get().settings.lang, 'sandbox.name'), campaign, Date.now(), false, null),
        undoStack: [], simulating: false,
        view: 'last', tab: 'actions', selectedSeat: null, lastReport: null, pactReply: null, offerReply: null, showNight: false,
        selectedState: world.rules.kind === 'general' ? campaign.parties[cfg.focus]!.location : null,
      });
    },
    sandboxEdit: (fn) => mutate((c, _g, world) => {
      if (!c.sim?.sandbox) return;
      fn(c, world);
      syncOpinion(c);
    }),
    sandboxUndo: () => {
      const stack = get().undoStack;
      const back = stack[stack.length - 1];
      if (!back) return;
      set({ game: back, undoStack: stack.slice(0, -1), lastReport: null, pactReply: null, offerReply: null, hiddenScene: [] });
    },
    simulating: false,
    setSimulating: (on) => set({ simulating: on }),
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
    // The first save is the moment there is something worth keeping: ask the browser not to clear it.
    if (ok) void keepSaves();
    useStore.setState(ok ? { autosavedAt: Date.now(), autosaveFailed: false } : { autosaveFailed: saveStore.available });
  }, 400);
});

// Whatever the game has just earned goes on the player's profile: achievements, and a finished career for the gallery.
useStore.subscribe((state, prev) => {
  const game = state.game;
  if (!game || game === prev.game) return;
  if (game.campaign.sim?.sandbox) return;
  const world = worldOf(game.campaign);
  if (!world) return;
  const now = Date.now();
  // What this game has earned so far, and so what its career is worth: the score counts the achievements of this career alone.
  const ids = earned(world, game.campaign, state.profile.legacies.map((e) => e.legacy));
  const counted = noteAchieved(state.profile, game.id, ids);
  const entry = legacyEntry(game, now, pointsOf(counted.achievedIn?.[game.id] ?? ids));
  // A finished career also banks Political Legacy Points toward the next one's archetypes and perks (see archetypes.ts), the first time it is hung.
  const firstHang = !!entry && !counted.legacies.some((e) => e.game === entry.game);
  const beforeHang = entry && firstHang ? awardLegacyPoints(counted, entry) : counted;
  const hung = entry ? hang(beforeHang, entry) : beforeHang;
  const { profile: awarded, fresh } = award(hung, ids, now);
  // A challenge finished leaves its points, at their best.
  const done = finishedChallenge(world, game.campaign);
  const points = done ? recordPoints(awarded, done.key, done.points) : awarded;
  // A contest won on a rung of the heat ladder opens the next rung.
  const rung = clearedHeat(world, game.campaign);
  const scored = rung ? recordHeat(points, rung) : points;
  // Any play today counts toward the streak.
  const streak = notePlay(scored.streak, now);
  const profile = streak === scored.streak ? scored : { ...scored, streak };
  if (profile === state.profile) return;
  profileStore.save(profile);
  useStore.setState({ profile, toasts: [...state.toasts, ...fresh] });
});

// Everything that draws a party in colour asks for it by index; the alliance's one colour and name are handed over here, ahead of the screens.
useStore.subscribe((state, prev) => {
  if (state.game?.campaign !== prev.game?.campaign || state.game?.id !== prev.game?.id) showAlliance(allianceLookOf(state.game));
});
