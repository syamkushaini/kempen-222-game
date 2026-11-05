import type { StringKey } from '../i18n/strings';
import { dunByElections, vacancyOf } from '../data/world';
import { DUN_LEVELS, MODE_UNLOCKS, emptyJourney, journeyLevel, nextStep, scenarioState, type ModeId } from '../sim/campaign/journey';
import { useStore } from '../state/store';
import { PostLevel } from './Leaderboard';
import { useT } from './hooks';

/** The place the journey has reached, in a few words: the state and how many of its three DUN seats are won, or what comes next. */
export function useJourneyPlace(): string {
  const t = useT();
  const j = useStore((s) => s.profile.journey) ?? emptyJourney();
  const state = (id: string) => t(`state.${id}` as StringKey);
  if (j.state && j.dunWon < DUN_LEVELS) return t('jr.badge.dun', { state: state(j.state), won: j.dunWon, total: DUN_LEVELS });
  if (j.state) return t('jr.badge.state', { state: state(j.state) });
  if (j.governed.length > 0) return t('jr.badge.governed', { n: j.governed.length });
  return t('jr.badge.dun', { state: state('selangor'), won: 0, total: DUN_LEVELS });
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

/** After a contest of the Career Campaign: whether the level rose, where the player stands, what is next and what has opened. */
export function JourneyResult() {
  const t = useT();
  const c = useStore((s) => s.game?.campaign);
  const j = useStore((s) => s.profile.journey) ?? emptyJourney();
  if (!c || !c.newParty || c.career || c.challenge) return null;
  const level = journeyLevel(j);
  const st = scenarioState(c.scenario);
  const isState = c.scenario.startsWith('state:');
  // A state is taken only once the talks are over, so nothing is said about it before.
  if (isState && c.phase !== 'done') return null;
  const counted = j.fought.includes(c.scenario) || (isState && !!st && j.governed.includes(st));
  const next = nextStep(j, c.scenario, dunByElections);
  const nextText = !next ? null
    : next === 'general' ? t('career.next.general')
    : next.startsWith('state:') ? t('career.next.state', { state: t(`state.${next.slice(6)}` as StringKey) })
    : t('career.next.dun', { seat: vacancyOf(next.slice('byelection:'.length))?.name ?? '' });
  const opened = (Object.keys(MODE_UNLOCKS) as ModeId[]).filter((m) => MODE_UNLOCKS[m] === level);
  if (!counted) {
    return (
      <div className="journey-result same" role="status">
        <strong>{t('jr.same', { n: level })}</strong>
        <span className="muted small">{t(isState ? 'jr.same.state' : 'jr.same.dun')}</span>
      </div>
    );
  }
  return (
    <div className="journey-result up" role="status">
      <strong>{t(isState ? 'jr.stateTaken' : 'jr.up', { n: level, state: st ? t(`state.${st}` as StringKey) : '' })}</strong>
      {!isState && j.state && <span className="small">{t('jr.dun', { state: t(`state.${j.state}` as StringKey), won: j.dunWon, total: DUN_LEVELS })}</span>}
      {nextText && <span className="small">{t('jr.next', { next: nextText })}</span>}
      {opened.length > 0 && <span className="small unlocked">🔓 {t('jr.unlocked', { modes: opened.map((m) => t(`unlock.mode.${m}` as StringKey)).join(', ') })}</span>}
      {/* the level rose: the player may put it on the Career Campaign board straight away */}
      <PostLevel compact />
    </div>
  );
}
