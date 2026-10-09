import type { World } from '../election';
import { BLOC_IDS, STATE_IDS, type BlocId, type StateId } from '../types';
import { heldOf, scaled } from './actions';
import { addScene, shiftUnity } from './diplomacy';
import { pushNews } from './news';
import type { Campaign, Scene } from './types';

// Every state fights its own election. Perlis frets about its padi and its border, Kelantan and Terengganu about their oil
// royalty, Selangor about water and traffic, Johor about the causeway and the cost of living across it, Sabah and Sarawak
// about the agreement that brought them into Malaysia. Each state has one question that comes up in the second week of
// its campaign and has to be answered with a position: three answers, each pleasing some voters and costing with others.

export interface AgendaChoice {
  /** What the answer does for the party among each kind of voter, for the rest of the campaign, in logit units. */
  lift: Partial<Record<BlocId, number>>;
  /** Extra turnout among the party's own supporters, in logit units. */
  turnout?: number;
  /** The party's money, in general-election terms (scaled to the contest). */
  funds?: number;
  unity?: number;
}

export interface AgendaEvent { choices: [AgendaChoice, AgendaChoice, AgendaChoice] }

/**
 * The third answer of every question is the same in kind: stay out of it. It costs nothing and does nothing, and it is
 * what an unanswered question comes to when the week ends.
 */
const SILENCE: AgendaChoice = { lift: {} };

export const AGENDA: Record<StateId, AgendaEvent | null> = {
  perlis: { choices: [
    { lift: { agri: 0.12, felda: 0.05, smallbiz: -0.04 }, funds: -60_000 },
    { lift: { heartland: 0.08, seniors: 0.05, urban_b40: -0.03 }, unity: 1 },
    SILENCE,
  ] },
  kedah: { choices: [
    { lift: { agri: 0.1, heartland: 0.06, civil: -0.03 }, funds: -80_000 },
    { lift: { m40: 0.07, urban_b40: 0.06, agri: -0.05 }, funds: -40_000 },
    SILENCE,
  ] },
  penang: { choices: [
    { lift: { urban_lib: 0.1, m40: 0.05, smallbiz: -0.05 }, unity: -1 },
    { lift: { smallbiz: 0.1, m40: 0.04, urban_lib: -0.08 }, funds: 60_000 },
    SILENCE,
  ] },
  perak: { choices: [
    { lift: { agri: 0.08, urban_lib: 0.05, heartland: -0.03 }, funds: -40_000 },
    { lift: { smallbiz: 0.07, heartland: 0.05, urban_lib: -0.06 }, funds: 70_000 },
    SILENCE,
  ] },
  kelantan: { choices: [
    { lift: { heartland: 0.1, felda: 0.05, agri: 0.06, urban_lib: -0.05 }, unity: 2 },
    { lift: { heartland: 0.09, seniors: 0.06, urban_lib: -0.1, undi18: -0.05 } },
    SILENCE,
  ] },
  terengganu: { choices: [
    { lift: { heartland: 0.1, agri: 0.07, civil: -0.02 }, unity: 1 },
    { lift: { undi18: 0.07, m40: 0.05, agri: 0.03 }, funds: -70_000 },
    SILENCE,
  ] },
  pahang: { choices: [
    { lift: { felda: 0.1, agri: 0.06, m40: -0.03 }, funds: -50_000 },
    { lift: { urban_lib: 0.07, m40: 0.05, smallbiz: -0.04 }, unity: -1 },
    SILENCE,
  ] },
  selangor: { choices: [
    { lift: { m40: 0.09, urban_b40: 0.07, smallbiz: 0.03 }, funds: -90_000 },
    { lift: { m40: 0.06, urban_lib: 0.06, civil: -0.04 }, unity: 2 },
    SILENCE,
  ] },
  kl: null,
  putrajaya: null,
  nsembilan: { choices: [
    { lift: { heartland: 0.09, felda: 0.05, seniors: 0.05, urban_lib: -0.03 } },
    { lift: { smallbiz: 0.08, m40: 0.06, gig: 0.04, heartland: -0.03 }, funds: 50_000 },
    SILENCE,
  ] },
  melaka: { choices: [
    { lift: { smallbiz: 0.1, gig: 0.05, urban_lib: -0.04 }, funds: 60_000 },
    { lift: { urban_lib: 0.07, m40: 0.05, smallbiz: -0.05 }, unity: 1 },
    SILENCE,
  ] },
  johor: { choices: [
    { lift: { m40: 0.08, smallbiz: 0.07, gig: 0.05, heartland: -0.03 }, funds: -60_000 },
    { lift: { gig: 0.09, urban_b40: 0.07, undi18: 0.05, smallbiz: -0.07 } },
    SILENCE,
  ] },
  labuan: null,
  sabah: { choices: [
    { lift: { borneo_native: 0.12, borneo_urban: 0.08, civil: -0.04 }, unity: 2 },
    { lift: { borneo_native: 0.08, heartland: 0.04, borneo_urban: -0.06 }, funds: -40_000 },
    SILENCE,
  ] },
  sarawak: { choices: [
    { lift: { borneo_native: 0.1, borneo_urban: 0.09, civil: -0.03 }, unity: 2 },
    { lift: { borneo_native: 0.12, agri: 0.04, borneo_urban: -0.05 }, funds: -50_000 },
    SILENCE,
  ] },
};

/** The state a contest is fought in, if it is the election of one state's assembly. */
export function stateOf(world: World): StateId | null {
  if (world.rules.kind !== 'state') return null;
  const last = world.id.split(':').pop() ?? '';
  return (STATE_IDS as string[]).includes(last) ? (last as StateId) : null;
}

/** The question of the state this contest is fought in, if it has one. */
export function agendaOf(world: World): AgendaEvent | null {
  const st = stateOf(world);
  return st ? AGENDA[st] : null;
}

/** The first day: what this state is arguing about, in the news. */
export function agendaIntro(world: World, c: Campaign): void {
  const st = stateOf(world);
  if (st && AGENDA[st]) pushNews(c, { party: null, key: `agenda.${st}.intro`, vars: {}, tone: 'neutral' });
}

/** The end of the first week: the state's question reaches the leader's desk. */
export function agendaWeek(world: World, c: Campaign): void {
  const st = stateOf(world);
  if (!st || !AGENDA[st] || c.week !== 1 || c.agenda) return;
  c.agenda = 'asked';
  addScene(c, { kind: 'agenda', from: null, event: st });
}

/** The weeks of a state career in which the state's question is put again, in each term. */
export const REASK_WEEKS = [80, 170];

/** In a state career the question comes back twice a term: it is put, and the leader is held to what they said before. */
export function agendaTerm(world: World, c: Campaign): void {
  const k = c.career;
  const st = stateOf(world);
  if (!k || !st || !AGENDA[st] || c.phase !== 'term' || c.inbox.length > 0) return;
  const n = REASK_WEEKS.findIndex((w) => k.week >= w && !k.flags.includes(`agenda${k.term}-${w}`));
  if (n < 0) return;
  k.flags.push(`agenda${k.term}-${REASK_WEEKS[n]}`);
  addScene(c, { kind: 'agenda', from: null, event: st });
}

/**
 * Answers the state's question: the leader takes a position, and the voters it was aimed at notice. In a campaign the
 * effect lasts to polling day; in the years of a career it moves opinion. Put again, a leader who says what they said
 * before is believed (and heard less, having said it); one who changes their answer is called a flip-flopper.
 */
export function resolveAgenda(world: World, c: Campaign, scene: Scene, choice: number): void {
  const st = scene.event as StateId | undefined;
  const event = st && (STATE_IDS as string[]).includes(st) ? AGENDA[st] : null;
  const answer = event?.choices[choice];
  if (!st || !answer) return;
  const me = c.player;
  const k = c.career;
  // In a career opinion is kept as mood and the campaign's drift is worked out from it; in a single contest it is the drift itself.
  const term = !!k;
  const waiting = c.phase === 'term';
  const before = (k?.agendaAnswers ?? []).filter((a) => a !== 2).at(-1);
  const repeat = term && before !== undefined && choice !== 2 && choice === before;
  const flip = term && before !== undefined && choice !== 2 && choice !== before;
  const weight = repeat ? 0.5 : 1;
  for (const [bloc, v] of Object.entries(answer.lift)) {
    const b = BLOC_IDS.indexOf(bloc as BlocId);
    const amount = v * weight * (waiting ? 0.5 : 1);
    if (term) k!.mood[b][me] += amount;
    if (!waiting) c.drift.support.nat[b][me] += amount;
  }
  if (term) {
    k!.agendaAnswers = [...(k!.agendaAnswers ?? []), choice];
    if (repeat) k!.credibility = Math.min(100, k!.credibility + 2);
    if (flip) k!.credibility = Math.max(0, k!.credibility - 4);
  }
  if (answer.turnout && !waiting) heldOf(c).turnout.party[me] += answer.turnout;
  const pc = c.parties[me];
  if (pc && answer.funds) pc.funds = Math.max(0, pc.funds + Math.sign(answer.funds) * scaled(world, Math.abs(answer.funds)));
  if (answer.unity) shiftUnity(c, me, answer.unity);
  if (!waiting) c.agenda = `answered:${choice}`;
  pushNews(c, { party: me, key: `agenda.${st}.o${choice}.news`, vars: {}, tone: flip ? 'bad' : choice === 2 ? 'neutral' : 'good' });
}
