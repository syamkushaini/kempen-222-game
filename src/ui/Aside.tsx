import { dunByElections, nextContest, vacancyOf } from '../data/world';
import { DUN_LEVELS, STEPS, emptyJourney, journeyStep, nextStep } from '../sim/campaign/journey';
import { stepTitle } from './JourneyResult';
import type { StringKey } from '../i18n/strings';
import { countClick } from '../state/playWatch';
import { useStore } from '../state/store';
import { regionLabel, useT, useWorld } from './hooks';

/**
 * The button at the end of a contest. In a state election the player is fighting as part of a career it takes the player on:
 * to the next state of the round, or back to the career. Anywhere else it is the usual "play again", and "restart" beside it.
 */
export function AgainButtons({ restart = false }: { restart?: boolean }) {
  const t = useT();
  const world = useWorld();
  const aside = useStore((s) => s.game?.aside);
  const quitToTitle = useStore((s) => s.quitToTitle);
  const doRestart = useStore((s) => s.restart);
  const finishAside = useStore((s) => s.finishAside);
  const climb = useStore((s) => s.climb);
  const reshape = useStore((s) => s.reshapeParty);
  const carryOn = useStore((s) => s.carryOn);
  // A plain state election played again starts from the result it ended with, as often as the player likes.
  const again = useStore((s) => { const c = s.game?.campaign; return !!c && !s.game?.aside && !c.career && !c.newParty && !c.challenge && c.phase === 'done' && c.scenario.startsWith('state:'); });
  // A new party that has finished a by-election or a state election can carry on to the next contest up.
  const next = useStore((s) => { const c = s.game?.campaign; return c && c.newParty && !c.career && !s.game?.aside && c.phase === 'done' ? (s.game?.start?.journey ? nextStep(s.profile.journey ?? emptyJourney(), c.scenario, dunByElections) : nextStep(s.profile.journey ?? emptyJourney(), c.scenario, dunByElections) ?? nextContest(c.scenario, world)) : null; });
  const inJourney = useStore((s) => !!s.game?.start?.journey && !s.game.campaign.career);
  const journey = useStore((s) => s.profile.journey);
  if (aside) {
    const next = aside.queue[0];
    return <button className="btn primary" onClick={() => void finishAside()}>{next ? t('fight.next', { state: regionLabel(t, world, next) }) : t('fight.back')} ▸</button>;
  }
  // In the Career Campaign the next contest is the next level: it goes by the level's name.
  const label = (to: string): string => {
    if (inJourney) { const k = journeyStep(journey ?? emptyJourney()); if (k < STEPS.length) return t('journey.next.step', { title: stepTitle(t, k) }); }
    if (to === 'general') return t('climb.general');
    if (to.startsWith('byelection:')) return t('journey.nextDun', { seat: vacancyOf(to.slice('byelection:'.length))?.name ?? '', n: (journey?.dunWon ?? 0) + 1, total: DUN_LEVELS });
    return t('climb.state', { state: t(`state.${to.slice(6)}` as StringKey) });
  };
  if (next) {
    return (
      <>
        <button className="btn primary" onClick={() => { countClick('again', 'climb'); void climb(); }}>{label(next)} ▸</button>
        <button className="btn" onClick={() => { countClick('again', 'new'); quitToTitle(); }}>{t('summary.again')}</button>
        {restart && <button className="btn" onClick={() => { countClick('again', 'restart'); doRestart(); }}>{t('summary.restart')}</button>}
      </>
    );
  }
  if (inJourney) {
    return (
      <>
        <button className="btn primary" onClick={() => { countClick('again', 'restart'); doRestart(); }}>{t('jr.retry')} ▸</button>
        <button className="btn" onClick={() => { countClick('again', 'reshape'); reshape(); }}>{t('jr.reshape')} ▸</button>
        <button className="btn" onClick={() => { countClick('again', 'new'); quitToTitle(); }}>{t('jr.menu')}</button>
      </>
    );
  }
  return (
    <>
      <button className="btn primary" onClick={() => { countClick('again', 'new'); quitToTitle(); }}>{t('summary.again')} ▸</button>
      {restart && <button className="btn" onClick={() => { countClick('again', again ? 'carry' : 'restart'); if (again) carryOn(); else doRestart(); }}>{t('summary.restart')}</button>}
    </>
  );
}

/** A line above the game while a state election is fought inside a career: where the player is, and what comes after. */
export function AsideBanner() {
  const t = useT();
  const aside = useStore((s) => s.game?.aside);
  const world = useWorld();
  if (!aside) return null;
  return (
    <p className="aside-banner" role="note">
      {t(aside.queue.length > 0 ? 'fight.banner.more' : 'fight.banner', { state: regionLabel(t, world, aside.state), n: aside.queue.length })}
    </p>
  );
}
