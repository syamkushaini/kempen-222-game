import type { StringKey } from '../i18n/strings';
import { dunByElections } from '../data/world';
import { MODE_UNLOCKS, STEPS, emptyJourney, journeyLevel, journeyStep, nextStep, stateSeatsNeeded, stepScenario, type ModeId } from '../sim/campaign/journey';
import { spendingLimit } from '../sim/campaign/actions';
import { inGovernment } from '../sim/campaign/career';
import { useStore } from '../state/store';
import { PostLevel } from './Leaderboard';
import { useFormat, useT, useWorld } from './hooks';
import type { T } from './hooks';

/** Seats a party needs to be kingmaker in Selangor's state election (56 seats). */
const SELANGOR_SEATS = 56;

/** A level's name. */
export const stepTitle = (t: T, i: number): string => t(`step.${STEPS[i].id}` as StringKey);
/** What a level asks, in a sentence. */
export const stepGoal = (t: T, i: number): string => t(`step.${STEPS[i].id}.goal` as StringKey, { n: stateSeatsNeeded(SELANGOR_SEATS) });

/** The place the journey has reached, in a few words: the level to play next, or the chapter done. */
export function useJourneyPlace(): string {
  const t = useT();
  const k = journeyStep(useStore((s) => s.profile.journey) ?? emptyJourney());
  return k >= STEPS.length ? t('chapter.all') : t('jr.badge.step', { title: stepTitle(t, k) });
}

/** The level in the header while playing: where the player is on the Career Campaign. */
export function JourneyBadge() {
  const t = useT();
  const level = journeyLevel(useStore((s) => s.profile.journey));
  const place = useJourneyPlace();
  return (
    <span className="badge tier-badge journey-badge" title={t('jr.badge.title', { n: level })}>
      {t('jr.badge', { n: level })} <span className="num">· {place}</span>
    </span>
  );
}

/** While a Career Campaign contest is fought: the level, its name and what it asks, above the campaign. */
export function JourneyGoal() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const c = useStore((s) => s.game?.campaign);
  const journey = useStore((s) => s.game?.start?.journey);
  const j = useStore((s) => s.profile.journey) ?? emptyJourney();
  const restart = useStore((s) => s.restart);
  const canRetry = useStore((s) => !!s.game?.checkpoint);
  if (!c || !journey || (c.phase !== 'campaign' && c.phase !== 'term')) return null;
  const k = journeyStep(j);
  // In a term of government: the levels of it already cleared, as well as the one being played.
  const done = c.career ? STEPS.map((_, i) => i).filter((i) => i < k && stepScenario(i, dunByElections) === c.scenario) : [];
  const current = k < STEPS.length && stepScenario(k, dunByElections) === c.scenario;
  // A term level resumed from the menu: the state election is played again first, to get back into the government the term needs.
  if (!current && !c.career && k < STEPS.length && STEPS[k].contest === 'career' && c.scenario === `state:${stepScenario(k, dunByElections).slice(7)}`) {
    return (
      <p className="goal-line journey-goal" role="status">
        <strong>{t('jgoal.line', { n: k + 1, title: stepTitle(t, k) })}</strong>
        <span>{t('jgoal.setup')}</span>
      </p>
    );
  }
  if (!current && done.length === 0) return null;
  const shoestring = current && STEPS[k].goal === 'winShoestring';
  // A term level is lost once the party is out of the government it has to stay in: it is tried again from the start of the term.
  const out = current && !!c.career && (STEPS[k].goal === 'serveTerm' ? c.career.term === 1 : c.career.term >= 2 && c.phase === 'term') && !inGovernment(c, c.player);
  return (
    <p className="goal-line journey-goal" role="status">
      {done.map((i) => <span key={i} className="badge">{t('jr.step.done', { title: stepTitle(t, i) })}</span>)}
      {current && <strong>{t('jgoal.line', { n: k + 1, title: stepTitle(t, k) })}</strong>}
      {current && <span>{out ? t('jgoal.out') : stepGoal(t, k)}{shoestring ? ` (${f.rm(Math.round(spendingLimit(world) / 2))})` : ''}</span>}
      {out && canRetry && <button className="btn small" onClick={() => restart()}>{t('jgoal.retry')}</button>}
    </p>
  );
}

/** After a contest of the Career Campaign: which of its levels were cleared, what is next, and what has opened. */
export function JourneyResult() {
  const t = useT();
  const c = useStore((s) => s.game?.campaign);
  const j = useStore((s) => s.profile.journey) ?? emptyJourney();
  if (!c || !c.newParty || c.career || c.challenge) return null;
  // A place in the government is known only once the talks are over.
  if (c.scenario.startsWith('state:') && c.phase !== 'done') return null;
  const k = journeyStep(j);
  const here = STEPS.map((_, i) => i).filter((i) => stepScenario(i, dunByElections) === c.scenario);
  if (here.length === 0) return null;
  const cleared = here.filter((i) => i < k);
  const level = journeyLevel(j);
  const next = nextStep(j, c.scenario, dunByElections);
  const opened = (Object.keys(MODE_UNLOCKS) as ModeId[]).filter((m) => MODE_UNLOCKS[m] === level);
  const missed = here.filter((i) => i >= k).slice(0, 1);
  return (
    <div className={`journey-result ${cleared.length > 0 ? 'up' : 'same'}`} role="status">
      <strong>{cleared.length > 0 ? t('jr.up', { n: level }) : t('jr.same', { n: level })}</strong>
      {cleared.map((i) => <span key={i} className="small">{t('jr.step.done', { title: stepTitle(t, i) })}</span>)}
      {missed.map((i) => <span key={i} className="small">{t('jr.step.missed', { title: stepTitle(t, i), goal: stepGoal(t, i) })}</span>)}
      {next && <span className="small">{t('journey.next.step', { title: stepTitle(t, k) })}</span>}
      {k >= STEPS.length && cleared.length > 0 && <span className="small">{t('chapter.done')}</span>}
      {opened.length > 0 && cleared.length > 0 && <span className="small unlocked">🔓 {t('jr.unlocked', { modes: opened.map((m) => t(`unlock.mode.${m}` as StringKey)).join(', ') })}</span>}
      {cleared.length > 0 && <PostLevel compact />}
    </div>
  );
}
