import { useEffect, useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { isThreeWay } from '../data/world';
import { lastOutcome, useSpot, useT, useWorld } from './hooks';
import { Portrait } from './Portrait';
import { Jargon } from './Term';
import { atHome } from '../sim/campaign/turn';
import { STEPS, stepFor } from './tutorial';

/** The steps at which the adviser has something of its own to say to a party on its home ground. */
const HOME_LINES = new Set(['funds', 'rivals', 'middle']);

/** The campaign manager who talks the player through their first contest. */
export function Adviser() {
  const t = useT();
  const world = useWorld();
  const tutorial = useStore((s) => s.game?.tutorial);
  const campaign = useStore((s) => s.game!.campaign);
  const selectedSeat = useStore((s) => s.selectedSeat);
  const tab = useStore((s) => s.tab);
  const advance = useStore((s) => s.advanceTutorial);
  const jump = useStore((s) => s.jumpTutorial);
  const dismiss = useStore((s) => s.dismissTutorial);
  const spot = useSpot();

  const step = tutorial ? STEPS[tutorial.step] : undefined;
  const ctx = { campaign, selectedSeat, tab };
  // The guide goes to the step after the furthest one already done, so that doing things out of order (ending the
  // week without a poll) cannot leave it stuck on a step for the rest of the campaign.
  const target = tutorial && step ? stepFor(tutorial.step, ctx) : 0;
  useEffect(() => { if (tutorial && target > tutorial.step) jump(target, STEPS.length); }, [target, tutorial, jump]);
  // A game saved part-way through the longer tutorial of old may be on a step that no longer exists: it is over.
  const stray = !!tutorial && !step;
  useEffect(() => { if (stray) dismiss(); }, [stray, dismiss]);

  if (!tutorial || !step) return <Warning />;
  // Pointing at "Next" needs no help finding it; anything else may be off the screen.
  const pointsAway = step.spots(ctx).some((name) => name !== 'next');
  const show = () => document.querySelector('.spot')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  // The seat may be one the player's party already holds.
  const held = lastOutcome(world).seats[0].winner === campaign.player;
  // The usual welcome speaks of a close three-way fight; not every seat the player may pick was one.
  const close = isThreeWay(world.seats[0].last.votes);
  // A party of Sabah or Sarawak on its own ground is in a different fight, and is told so where it matters.
  const home = atHome(world, campaign.player);
  const text = home && step.id === 'welcome' ? `adviser.home.welcome${held ? 'Held' : ''}`
    : home && HOME_LINES.has(step.id) ? `adviser.home.${step.id}`
    : step.id === 'welcome' ? `adviser.welcome${close ? '' : 'Any'}${held ? 'Held' : ''}` : `adviser.${step.id}`;
  return (
    <section className="adviser adviser-strip" aria-live="polite">
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

/** A figure below this is in danger, and the adviser says so before it costs the player the term. */
const DANGER = 25;

/**
 * Once the tutorial is over, Kak Ros speaks up only when one of the career's four figures has fallen into danger:
 * what it is, and where to mend it. It can be put away for the week; a figure that is still low next week brings it back.
 */
function Warning() {
  const t = useT();
  const k = useStore((s) => s.game!.campaign.career);
  const me = useStore((s) => s.game!.campaign.parties[s.game!.campaign.player]);
  const setTab = useStore((s) => s.setTab);
  const [away, setAway] = useState<string | null>(null);
  if (!k || !me || k.ending) return null;
  const figures = [
    { id: 'unity', value: me.unity, tab: 'deals' as const },
    { id: 'credibility', value: k.credibility, tab: 'policy' as const },
    { id: 'stability', value: k.government.stability, tab: 'orders' as const },
    { id: 'trust', value: k.government.trust, tab: 'orders' as const },
  ].sort((a, b) => a.value - b.value);
  const worst = figures[0];
  if (worst.value >= DANGER) return null;
  const key = `${worst.id}|${k.term}|${k.week}`;
  if (away === key) return null;
  return (
    <section className="adviser adviser-strip danger" aria-live="polite">
      <Portrait adviser size={46} />
      <div className="grow">
        <p className="adviser-name">{t('adviser.name')} <span className="muted">· {t('adviser.role')}</span></p>
        <p className="adviser-text"><Jargon>{t(`adviser.danger.${worst.id}` as StringKey, { n: Math.round(worst.value) })}</Jargon></p>
        <div className="button-row tight">
          <button className="btn small primary" onClick={() => setTab(worst.tab)}>{t('adviser.danger.go')}</button>
          <button className="btn small" onClick={() => setAway(key)}>{t('adviser.danger.later')}</button>
        </div>
      </div>
    </section>
  );
}
