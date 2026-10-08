import { isValidDynamics } from '../dynamics';
import type { World } from '../election';
import { N_PARTIES } from '../types';
import { N_BLOCS } from '../types';
import {
  BACKSTORY_IDS, DEMAND_IDS, ENDORSER_IDS, FOCUS_IDS, HOPEFUL_KINDS, LEGACY_IDS, LEVER_IDS, LINE_IDS, N_ISSUES, OUTLET_IDS,
  MEASURE_IDS, MINISTER_TRAITS, PLEDGE_IDS, PORTFOLIO_IDS, ROLE_IDS, SENIOR_IDS, STAT_IDS,
  type Campaign, type PartyCampaign,
} from './types';

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const isUint32 = (x: unknown): x is number => isNum(x) && Number.isInteger(x) && x >= 0 && x <= 0xffffffff;
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isShares = (x: unknown) => Array.isArray(x) && x.length === N_PARTIES && x.every(isNum);

function isValidParty(x: unknown, world: World): x is PartyCampaign {
  if (!isObj(x)) return false;
  return (
    isNum(x.funds) && isNum(x.capacity) && isNum(x.days) &&
    world.states.includes(x.location as string) &&
    Array.isArray(x.machinery) && x.machinery.length === world.states.length && x.machinery.every(isNum) &&
    isObj(x.used) && Object.values(x.used).every(isNum) &&
    isObj(x.dinners) && Object.values(x.dinners).every(isNum) &&
    isNum(x.crowdfunds) &&
    (x.tycoon === 0 || x.tycoon === 1 || x.tycoon === 2) &&
    Array.isArray(x.visits) && x.visits.every((v) => typeof v === 'string') &&
    (x.plays === undefined || (isObj(x.plays) && Object.values(x.plays).every(isNum))) &&
    (x.loan === undefined || (isNum(x.loan) && x.loan > 0)) &&
    isObj(x.chiefs) && Object.entries(x.chiefs).every(([st, level]) => world.states.includes(st) && (level === 1 || level === 2 || level === 3)) &&
    isNum(x.chiefFloor) && x.chiefFloor >= 0 &&
    isNum(x.unity) && x.unity >= 0 && x.unity <= 100 &&
    isNum(x.spent) && x.spent >= 0 && typeof x.fined === 'boolean'
  );
}

function isValidPoll(x: unknown): boolean {
  if (!isObj(x)) return false;
  return (
    isNum(x.id) && isNum(x.week) && isNum(x.moe) &&
    (x.scope === 'national' || x.scope === 'state' || x.scope === 'seat') &&
    (x.target === null || typeof x.target === 'string') &&
    (x.quality === 'quick' || x.quality === 'full') &&
    typeof x.public === 'boolean' &&
    (x.national === undefined || isShares(x.national)) &&
    (x.regions === undefined || (isObj(x.regions) && Object.values(x.regions).every(isShares))) &&
    (x.seats === undefined || (isObj(x.seats) && Object.values(x.seats).every(isShares))) &&
    (x.groups === undefined || (Array.isArray(x.groups) && x.groups.length === N_BLOCS && x.groups.every((v) => v === null || (isNum(v) && v >= 0 && v <= 1))))
  );
}

function isValidDecision(x: unknown): boolean {
  return isObj(x) && isValidNews(x.news) && isNum(x.seats) && isNum(x.share);
}

function isValidRecap(x: unknown, world: World): boolean {
  const seats = (v: unknown) => Array.isArray(v) && v.every((id) => typeof id === 'string' && world.seatIndex.has(id));
  return (
    isObj(x) && isNum(x.week) && isNum(x.daysTotal) && isNum(x.daysLeft) && isNum(x.spent) && isNum(x.spentToDate) && seats(x.mine) &&
    isList(x.rivals, (r) => isObj(r) && isParty(r.party) && seats(r.seats)) &&
    isList(x.missed, (m) => isObj(m) && isParty(m.party) && typeof m.seat === 'string' && world.seatIndex.has(m.seat))
  );
}

function isValidNews(x: unknown): boolean {
  if (!isObj(x)) return false;
  return (
    isNum(x.week) && (x.party === null || isNum(x.party)) && typeof x.key === 'string' &&
    (x.tone === 'good' || x.tone === 'bad' || x.tone === 'neutral') &&
    (x.vars === undefined || (isObj(x.vars) && Object.values(x.vars).every((v) => typeof v === 'string' || isNum(v))))
  );
}

const isParty = (x: unknown): x is number => isNum(x) && Number.isInteger(x) && x >= 0 && x < N_PARTIES;
const isPartyOrNull = (x: unknown) => x === null || isParty(x);
const isList = (x: unknown, check: (v: unknown) => boolean, length?: number): x is unknown[] =>
  Array.isArray(x) && (length === undefined || x.length === length) && x.every(check);
const isSeatList = (x: unknown, world: World) => isList(x, (v) => typeof v === 'string' && world.seatIndex.has(v));

function isValidOffer(x: unknown): boolean {
  if (x === null) return true;
  if (!isObj(x)) return false;
  return (
    isNum(x.posts) && x.posts >= 0 && isNum(x.cash) && x.cash >= 0 &&
    (x.senior === null || (SENIOR_IDS as readonly unknown[]).includes(x.senior)) &&
    isList(x.demands, (d) => (DEMAND_IDS as readonly unknown[]).includes(d))
  );
}

function isValidScene(x: unknown, world: World): boolean {
  if (!isObj(x)) return false;
  return (
    isNum(x.id) && isPartyOrNull(x.from) &&
    (x.kind === 'pactOffer' || x.kind === 'poach' || x.kind === 'summons' || x.kind === 'unityAdvice' || x.kind === 'event' || x.kind === 'vote' || x.kind === 'houseVote' || x.kind === 'agenda' || x.kind === 'partyPoll' || x.kind === 'redraw') &&
    (x.event === undefined || typeof x.event === 'string') && (x.bill === undefined || typeof x.bill === 'string') &&
    (x.give === undefined || isSeatList(x.give, world)) && (x.ask === undefined || isSeatList(x.ask, world)) && (x.get === undefined || isSeatList(x.get, world)) &&
    (x.seat === undefined || (typeof x.seat === 'string' && world.seatIndex.has(x.seat)))
  );
}

function isValidOutcome(o: unknown): boolean {
  return (
    isObj(o) && isParty(o.pm) && isList(o.partners, isParty) && isNum(o.seats) &&
    typeof o.minority === 'boolean' && isNum(o.stability) && isNum(o.trust) && isNum(o.day) &&
    isList(o.deals, isValidOffer, N_PARTIES)
  );
}

const isLevel = (x: unknown) => x === 0 || x === 1 || x === 2 || x === 3;
const isPledge = (x: unknown) => (PLEDGE_IDS as readonly unknown[]).includes(x);
const isVotes = (x: unknown) => isList(x, (v) => isNum(v) && v >= 0, N_PARTIES);

const isDial = (x: unknown) => x === -1 || x === 0 || x === 1;
const isBudget = (x: unknown) => isObj(x) && isDial(x.tax) && (x.measures === undefined || (Array.isArray(x.measures) && x.measures.length <= 3 && x.measures.every((m) => (MEASURE_IDS as readonly unknown[]).includes(m)))) && isObj(x.lines) && LINE_IDS.every((id) => isDial((x.lines as Record<string, unknown>)[id]));

const isPerson = (x: unknown) => isObj(x) && isNum(x.name) && x.name >= 0 && typeof x.skeleton === 'boolean' && typeof x.vetted === 'boolean';
const isStaffer = (x: unknown) => isPerson(x) && isNum((x as Record<string, unknown>).skill);

/** The leader, their people, and the endorsers and press around the contest. */
function isValidTeam(x: unknown, world: World): boolean {
  if (!isObj(x)) return false;
  const l = x.leader;
  return (
    isObj(l) && (l.backstory === null || (BACKSTORY_IDS as readonly unknown[]).includes(l.backstory)) &&
    isList(l.stats, (v) => isNum(v) && v >= 1 && v <= 5, STAT_IDS.length) &&
    isList(x.staff, (s) => s === null || isStaffer(s), ROLE_IDS.length) &&
    isList(x.pool, (row) => isList(row, isStaffer), ROLE_IDS.length) &&
    isList(x.keySeats, (k) => isObj(k) && typeof k.seat === 'string' && world.seatIndex.has(k.seat) && typeof k.blown === 'boolean' &&
      isList(k.options, (h) => isPerson(h) && (HOPEFUL_KINDS as readonly unknown[]).includes((h as Record<string, unknown>).kind)) &&
      (k.pick === null || (isNum(k.pick) && Number.isInteger(k.pick) && k.pick >= 0 && k.pick < (k.options as unknown[]).length))) &&
    (x.defaults === undefined || (isObj(x.defaults) && Object.entries(x.defaults).every(([seat, h]) => world.seatIndex.has(seat) && isPerson(h) && (HOPEFUL_KINDS as readonly unknown[]).includes((h as Record<string, unknown>).kind)))) &&
    (x.leaderSeat === undefined || (typeof x.leaderSeat === 'string' && world.seatIndex.has(x.leaderSeat))) &&
    isList(x.endorsers, isPartyOrNull, ENDORSER_IDS.length) &&
    isList(x.media, (row) => isList(row, (v) => isNum(v) && v >= -2 && v <= 2, N_PARTIES), OUTLET_IDS.length) &&
    (x.troopers === 0 || x.troopers === 1 || x.troopers === 2) &&
    (x.unpaid === undefined || typeof x.unpaid === 'boolean') &&
    (x.chiefs === undefined || (isObj(x.chiefs) && Object.values(x.chiefs).every((p) => isObj(p) && isNum(p.name) && isNum(p.skill) && p.skill >= 1 && p.skill <= 5 && isNum(p.loyalty) && p.loyalty >= 0 && p.loyalty <= 100 && typeof p.skeleton === 'boolean' && isNum(p.generation))))
  );
}

/** The governing side of a career: the economy, the budget, the cabinet, the House, and the record. */
function isValidOffice(x: Record<string, unknown>): boolean {
  const e = x.economy, r = x.record, end = x.ending;
  return (
    isObj(e) && isNum(e.growth) && isNum(e.inflation) && isNum(e.jobless) && isNum(e.debt) &&
    isBudget(x.budget) && isBudget(x.tabled) && isNum(x.fiscal) &&
    isList(x.cabinet, (m) => isObj(m) && (PORTFOLIO_IDS as readonly unknown[]).includes(m.portfolio) && isParty(m.party) && isNum(m.name) && isNum(m.skill) && (m.trait === undefined || (MINISTER_TRAITS as readonly unknown[]).includes(m.trait)) && (m.acting === undefined || typeof m.acting === 'boolean') && (m.done === undefined || typeof m.done === 'boolean')) &&
    (x.appointments === undefined || isList(x.appointments, (a) => isObj(a) && (PORTFOLIO_IDS as readonly unknown[]).includes(a.portfolio) && isList(a.options, (o) => isObj(o) && isNum(o.name) && isNum(o.skill) && (MINISTER_TRAITS as readonly unknown[]).includes(o.trait)))) &&
    isList(x.bills, (b) => isObj(b) && typeof b.id === 'string' && isNum(b.weeks)) &&
    isObj(x.delivery) && Object.entries(x.delivery).every(([id, v]) => isPledge(id) && (v === 'kept' || v === 'failed')) &&
    isList(x.obligations, (o) => isObj(o) && isParty(o.party) && (DEMAND_IDS as readonly unknown[]).includes(o.demand) && isNum(o.due) && typeof o.done === 'boolean') &&
    isList(x.levers, isNum, LEVER_IDS.length) && isNum(x.motion) && isNum(x.rivalBills) &&
    isObj(x.house) && Object.values(x.house).every(isParty) && isObj(x.states) && Object.values(x.states).every(isParty) && isNum(x.rounds) &&
    isObj(r) && ['elections', 'victories', 'weeksPm', 'weeksGov', 'weeksOpp', 'broken', 'bestSeats', 'falls', 'toppled'].every((key) => isNum(r[key])) && isList(r.kept, isPledge) &&
    (end === null || (isObj(end) && (end.kind === 'retired' || end.kind === 'ousted' || end.kind === 'wipedOut') &&
      (LEGACY_IDS as readonly unknown[]).includes(end.legacy) && isNum(end.score)))
  );
}

function isValidCareer(x: unknown, world: World): boolean {
  if (x === null) return true;
  if (!isObj(x)) return false;
  const o = x.orders, r = x.results;
  const seats = world.seats.length;
  return (
    (x.founded === undefined || typeof x.founded === 'boolean') &&
    (x.nation === undefined || (isObj(x.nation) && isNum(x.nation.health) && isNum(x.nation.education) && isNum(x.nation.standing))) &&
    (x.members === undefined || (Array.isArray(x.members) && x.members.every((v) => isNum(v) && v >= -1 && v <= 100))) &&
    (x.plots === undefined || (isObj(x.plots) && Object.values(x.plots).every((v) => isNum(v) && v >= 0 && v <= 100))) &&
    isNum(x.term) && x.term >= 1 && isNum(x.week) && x.week >= 1 && isNum(x.length) && x.week <= x.length &&
    isValidOutcome(x.government) && typeof x.midterm === 'boolean' &&
    (r === null || (isObj(r) && isList(r.votes, isVotes, seats) && isList(r.turnout, isNum, seats) &&
      isList(r.basis, (b) => b === null || (isObj(b) && isVotes(b.votes) && isNum(b.turnout)), seats))) &&
    isObj(o) && (FOCUS_IDS as readonly unknown[]).includes(o.focus) && isPartyOrNull(o.courting) &&
    isObj(o.budget) && isLevel(o.budget.machinery) && isLevel(o.budget.media) && isLevel(o.budget.research) &&
    isList(o.focusStates, (st) => world.states.includes(st as string)) && isLevel(o.donors) && isLevel(o.state) &&
    isNum(x.assets) && x.assets >= 0 && (x.holdings === undefined || (isObj(x.holdings) && Object.values(x.holdings).every((v) => isNum(v) && v >= 0))) && (x.rolls === undefined || isNum(x.rolls)) && (x.drive === undefined || isNum(x.drive)) && (x.activity === undefined || (isObj(x.activity) && Object.values(x.activity).every(isNum))) && isNum(x.credibility) && isNum(x.dossier) &&
    isList(x.stances, (row) => isList(row, (v) => isNum(v) && v >= -2 && v <= 2, N_ISSUES), N_PARTIES) &&
    isList(x.stances0, (row) => isList(row, isNum, N_ISSUES), N_PARTIES) &&
    isList(x.turned, isNum, N_ISSUES) && isList(x.salience, isNum, N_ISSUES) &&
    isList(x.mood, (row) => isList(row, isNum, N_PARTIES), N_BLOCS) && isList(x.profile, isNum, N_PARTIES) &&
    isList(x.manifesto, (m) => isList(m, isPledge), N_PARTIES) && (x.laws === undefined || isList(x.laws, isPledge)) && (x.palaceNo === undefined || isNum(x.palaceNo)) && (x.redraw === undefined || (isObj(x.redraw) && (x.redraw.by === null || isParty(x.redraw.by)))) && (x.factions === undefined || (isObj(x.factions) && isList(x.factions.size, isNum, 3) && isList(x.factions.mood, isNum, 3) && isList(x.factions.wing, isNum, 3) && isList(x.factions.chief, isNum, 6) && (x.factions.deputy === undefined || (isObj(x.factions.deputy) && isNum(x.factions.deputy.name) && isNum(x.factions.deputy.faction) && x.factions.deputy.faction >= 0 && x.factions.deputy.faction < 3 && isNum(x.factions.deputy.ambition))))) && (x.shadow === undefined || (isObj(x.shadow) && Object.entries(x.shadow).every(([id, s]) => (PORTFOLIO_IDS as readonly string[]).includes(id) && isObj(s) && isNum(s.name) && isNum(s.skill) && s.skill >= 1 && s.skill <= 5))) && (x.trail === undefined || isNum(x.trail)) && (x.foreign === undefined || isNum(x.foreign)) && (x.padded === undefined || isNum(x.padded)) && (x.leverUses === undefined || (isObj(x.leverUses) && Object.values(x.leverUses).every(isNum))) && (x.sectors === undefined || (isObj(x.sectors) && Object.values(x.sectors).every(isNum))) && (x.sectorAid === undefined || (isObj(x.sectorAid) && Object.values(x.sectorAid).every(isNum))) && (x.together === undefined || typeof x.together === 'boolean') && (x.scandal === undefined || (PORTFOLIO_IDS as readonly string[]).includes(x.scandal as string)) && (x.committee === undefined || isNum(x.committee)) && (x.alliance === undefined || (isObj(x.alliance) && isNum(x.alliance.name) && isNum(x.alliance.mark) && isList(x.alliance.members, isParty))) && (x.brief === undefined || isList(x.brief, isPledge)) && (x.mandated === undefined || isList(x.mandated, isPledge)) && (x.shaky === undefined || isList(x.shaky, isPledge)) && (x.copied === undefined || (isObj(x.copied) && Object.entries(x.copied).every(([p, l]) => isParty(Number(p)) && isList(l, isPledge)))) && (x.tenure === undefined || (isObj(x.tenure) && Object.values(x.tenure).every((t) => Array.isArray(t) && t.length === 2 && isParty(t[0]) && isNum(t[1]) && t[1] >= 1))) && (x.patronage === undefined || x.patronage === 0 || x.patronage === 1 || x.patronage === 2) && (x.safe === undefined || (isObj(x.safe) && Object.values(x.safe).every((v) => isNum(v) && v >= 0 && v < 3))) && (x.forced === undefined || typeof x.forced === 'string') && (x.merged === undefined || isList(x.merged, isParty)) && (x.supply === undefined || isList(x.supply, (s) => isObj(s) && isParty(s.party) && isNum(s.until) && (s.price === 'cash' || s.price === 'policy'))) && (x.disciplined === undefined || (isObj(x.disciplined) && Object.values(x.disciplined).every(isNum))) && (x.fresh === undefined || (Array.isArray(x.fresh) && x.fresh.every((st) => typeof st === 'string'))) && (x.grass === undefined || isNum(x.grass)) && (x.govRun === undefined || isNum(x.govRun)) && (x.chest === undefined || (isNum(x.chest) && x.chest >= 0)) && (x.pmRun === undefined || isNum(x.pmRun)) && (x.limited === undefined || typeof x.limited === 'boolean') && (x.agendaAnswers === undefined || isList(x.agendaAnswers, (v) => isNum(v) && v >= 0 && v <= 2)) && typeof x.launched === 'boolean' && isList(x.promises, isPledge) &&
    isList(x.flags, (v) => typeof v === 'string') && isList(x.fired, (v) => typeof v === 'string') &&
    isList(x.queue, (q) => isObj(q) && typeof q.event === 'string' && isNum(q.week)) && isNum(x.quietUntil) &&
    isValidOffice(x)
  );
}

function isValidFormation(x: unknown): boolean {
  if (x === null) return true;
  if (!isObj(x)) return false;
  const o = x.outcome;
  return (
    isNum(x.day) && isNum(x.deadline) && typeof x.extended === 'boolean' && isNum(x.meetings) &&
    isList(x.seats, isNum, N_PARTIES) && isList(x.claimants, isParty) &&
    isList(x.pledge, isPartyOrNull, N_PARTIES) &&
    isList(x.indep, (i) => isObj(i) && isNum(i.bar) && isPartyOrNull(i.pledge)) &&
    isList(x.offers, (row) => isList(row, isValidOffer, N_PARTIES), N_PARTIES) &&
    isList(x.known, (v) => typeof v === 'boolean', N_PARTIES) &&
    typeof x.unityAdvice === 'boolean' &&
    (o === null || isValidOutcome(o))
  );
}

/**
 * Structural check for a campaign read from a save, which may be damaged or
 * hand-edited. `world` is the contest the save claims to belong to.
 */
export function isValidCampaign(x: unknown, world: World): x is Campaign {
  if (!isObj(x)) return false;
  const election = x.election;
  return (
    x.scenario === world.id && (x.newParty === undefined || typeof x.newParty === 'boolean') &&
    isNum(x.player) && Number.isInteger(x.player) && x.player >= 0 && x.player < N_PARTIES &&
    (x.difficulty === 'easy' || x.difficulty === 'normal' || x.difficulty === 'hard') &&
    (x.challenge === undefined || (isObj(x.challenge) && typeof x.challenge.fog === 'boolean' && typeof x.challenge.noisy === 'boolean' && (x.challenge.goal === undefined || typeof x.challenge.goal === 'string'))) &&
    isNum(x.totalWeeks) && isNum(x.week) && x.week >= 1 && x.week <= x.totalWeeks &&
    (x.phase === 'term' || x.phase === 'campaign' || x.phase === 'night' || x.phase === 'formation' || x.phase === 'done') &&
    isUint32(x.seed) && isUint32(x.rng) &&
    isValidDynamics(x.drift) && isValidDynamics(x.dyn) &&
    Array.isArray(x.parties) && x.parties.length === N_PARTIES &&
    x.parties.every((p) => p === null || isValidParty(p, world)) &&
    x.parties[x.player] !== null &&
    Array.isArray(x.polls) && x.polls.every(isValidPoll) &&
    Array.isArray(x.news) && x.news.every(isValidNews) &&
    Array.isArray(x.ledger) && x.ledger.every(isValidDecision) &&
    (x.recap === undefined || isValidRecap(x.recap, world)) &&
    (election === null || (isObj(election) && isUint32(election.rng))) &&
    (x.phase === 'campaign' || x.phase === 'term' || election !== null || (x.phase !== 'night' && x.career !== null)) &&
    isList(x.relations, (row) => isList(row, (v) => isNum(v) && v >= -100 && v <= 100, N_PARTIES), N_PARTIES) &&
    isObj(x.standDowns) && Object.entries(x.standDowns).every(([seat, stood]) =>
      world.seatIndex.has(seat) && isList(stood, (v) => v === -1 || v === -2 || v === -3 || isParty(v) || (typeof v === 'number' && v >= 1000 && isParty(v - 1000)), N_PARTIES)) &&
    isList(x.pacts, (p) => isObj(p) && isParty(p.a) && isParty(p.b) && isNum(p.week)) &&
    isList(x.understandings, isParty) && isList(x.met, isNum, N_PARTIES) &&
    (x.agenda === undefined || typeof x.agenda === 'string') &&
    (x.entered === undefined || (isObj(x.entered) && Object.entries(x.entered).every(([seat, cost]) => world.seatIndex.has(seat) && isNum(cost) && cost >= 0))) &&
    isSeatList(x.katak, world) && isList(x.offered, isParty) &&
    isList(x.inbox, (sc) => isValidScene(sc, world)) && isNum(x.nextScene) &&
    isValidFormation(x.formation) &&
    (x.phase !== 'formation' || x.formation !== null) &&
    isValidCareer(x.career, world) && (x.phase !== 'term' || x.career !== null) &&
    (x.career === null) === !world.rules.career &&
    isValidTeam(x.team, world)
  );
}
