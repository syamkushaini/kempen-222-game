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
  if (aside) {
    const next = aside.queue[0];
    return <button className="btn primary" onClick={() => void finishAside()}>{next ? t('fight.next', { state: regionLabel(t, world, next) }) : t('fight.back')} ▸</button>;
  }
  return (
    <>
      <button className="btn primary" onClick={quitToTitle}>{t('summary.again')} ▸</button>
      {restart && <button className="btn" onClick={doRestart}>{t('summary.restart')}</button>}
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
