import { useEffect } from 'react';
import type { StringKey } from '../i18n/strings';
import type { Campaign } from '../sim/campaign/types';
import { useStore, type SidebarTab } from '../state/store';
import { lastOutcome, useT, useWorld } from './hooks';
import { Portrait } from './Portrait';

interface Context { campaign: Campaign; selectedSeat: string | null; tab: SidebarTab }

/**
 * The guided steps of the by-election. A step with `done` moves on by itself
 * once the player has done the thing; a step without one waits for "Next".
 * Progress is judged from the campaign itself, so it survives a reload.
 */
const did = (c: Campaign, prefix: string) => c.news.some((n) => n.party === c.player && n.key.startsWith(prefix));
const STEPS: { id: string; done?: (x: Context) => boolean }[] = [
  { id: 'welcome' },
  { id: 'seat', done: (x) => x.selectedSeat !== null },
  { id: 'ceramah', done: (x) => did(x.campaign, 'news.me.ceramah') },
  { id: 'poll', done: (x) => x.campaign.polls.some((p) => !p.public) },
  { id: 'canvass', done: (x) => did(x.campaign, 'news.me.canvass') },
  { id: 'funds', done: (x) => did(x.campaign, 'news.me.dinner') || did(x.campaign, 'news.me.crowdfund') },
  { id: 'endWeek', done: (x) => x.campaign.week >= 2 },
  { id: 'rivals' },
  { id: 'middle', done: (x) => x.campaign.week >= x.campaign.totalWeeks },
  { id: 'gotv', done: (x) => did(x.campaign, 'news.me.gotv') },
  { id: 'pollingDay', done: (x) => x.campaign.phase !== 'campaign' },
];

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

  const step = tutorial ? STEPS[tutorial.step] : undefined;
  const finished = step?.done?.({ campaign, selectedSeat, tab }) ?? false;
  useEffect(() => { if (finished) advance(STEPS.length); }, [finished, advance]);

  if (!tutorial || !step) return null;
  // The seat may be one the player's party already holds.
  const text = step.id === 'welcome' && lastOutcome(world).seats[0].winner === campaign.player ? 'adviser.welcomeHeld' : `adviser.${step.id}`;
  return (
    <section className="panel adviser" aria-live="polite">
      <Portrait adviser size={46} />
      <div className="grow">
        <p className="adviser-name">{t('adviser.name')} <span className="muted">· {t('adviser.role')} · {tutorial.step + 1}/{STEPS.length}</span></p>
        <p className="adviser-text">{t(text as StringKey)}</p>
        <div className="button-row tight">
          {!step.done && <button className="btn small primary" onClick={() => advance(STEPS.length)}>{t('adviser.next')}</button>}
          <button className="btn small" onClick={dismiss}>{t('adviser.skip')}</button>
        </div>
      </div>
    </section>
  );
}
