import { useEffect } from 'react';
import type { StringKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { isThreeWay } from '../data/world';
import { lastOutcome, useSpot, useT, useWorld } from './hooks';
import { Portrait } from './Portrait';
import { Jargon } from './Term';
import { STEPS } from './tutorial';

/** The campaign manager who talks the player through their first contest. */
export function Adviser() {
  const t = useT();
  const world = useWorld();
  const tutorial = useStore((s) => s.game?.tutorial);
  const campaign = useStore((s) => s.game!.campaign);
  const selectedSeat = useStore((s) => s.selectedSeat);
  const tab = useStore((s) => s.tab);
  const advance = useStore((s) => s.advanceTutorial);
  const dismiss = useStore((s) => s.dismissTutorial);
  const spot = useSpot();

  const step = tutorial ? STEPS[tutorial.step] : undefined;
  const ctx = { campaign, selectedSeat, tab };
  const finished = step?.done?.(ctx) ?? false;
  useEffect(() => { if (finished) advance(STEPS.length); }, [finished, advance]);

  if (!tutorial || !step) return null;
  // Pointing at "Next" needs no help finding it; anything else may be off the screen.
  const pointsAway = step.spots(ctx).some((name) => name !== 'next');
  const show = () => document.querySelector('.spot')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  // The seat may be one the player's party already holds.
  const held = lastOutcome(world).seats[0].winner === campaign.player;
  // The usual welcome speaks of a close three-way fight; not every seat the player may pick was one.
  const close = isThreeWay(world.seats[0].last.votes);
  const text = step.id === 'welcome' ? `adviser.welcome${close ? '' : 'Any'}${held ? 'Held' : ''}` : `adviser.${step.id}`;
  return (
    <section className="panel adviser" aria-live="polite">
      <Portrait adviser size={46} />
      <div className="grow">
        <p className="adviser-name">{t('adviser.name')} <span className="muted">· {t('adviser.role')} · {tutorial.step + 1}/{STEPS.length}</span></p>
        <p className="adviser-text"><Jargon>{t(text as StringKey)}</Jargon></p>
        <div className="button-row tight">
          {!step.done && <button className={`btn small primary${spot('next') ? ' spot' : ''}`} onClick={() => advance(STEPS.length)}>{t('adviser.next')}</button>}
          {pointsAway && <button className="btn small" onClick={show}>{t('adviser.show')}</button>}
          <button className="btn small" onClick={dismiss}>{t('adviser.skip')}</button>
        </div>
      </div>
    </section>
  );
}
