import { nextContest } from '../data/world';
import type { StringKey } from '../i18n/strings';
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
  const carryOn = useStore((s) => s.carryOn);
  // A plain state election played again starts from the result it ended with, as often as the player likes.
  const again = useStore((s) => { const c = s.game?.campaign; return !!c && !s.game?.aside && !c.career && !c.newParty && !c.challenge && c.phase === 'done' && c.scenario.startsWith('state:'); });
  // A new party that has finished a by-election or a state election can carry on to the next contest up.
  const next = useStore((s) => { const c = s.game?.campaign; return c && c.newParty && !c.career && !s.game?.aside && c.phase === 'done' ? nextContest(c.scenario, world) : null; });
  if (aside) {
    const next = aside.queue[0];
    return <button className="btn primary" onClick={() => void finishAside()}>{next ? t('fight.next', { state: regionLabel(t, world, next) }) : t('fight.back')} ▸</button>;
  }
  if (next) {
    return (
      <>
        <button className="btn primary" onClick={() => void climb()}>{next === 'general' ? t('climb.general') : t('climb.state', { state: t(`state.${next.slice(6)}` as StringKey) })} ▸</button>
        <button className="btn" onClick={quitToTitle}>{t('summary.again')}</button>
        {restart && <button className="btn" onClick={doRestart}>{t('summary.restart')}</button>}
      </>
    );
  }
  return (
    <>
      <button className="btn primary" onClick={quitToTitle}>{t('summary.again')} ▸</button>
      {restart && <button className="btn" onClick={again ? carryOn : doRestart}>{t('summary.restart')}</button>}
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
