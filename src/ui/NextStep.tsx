import { nextStep } from '../sim/campaign/guide';
import type { StringKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { useFormat, useT, useWorld } from './hooks';

/** One line, above everything else, saying what to do now. */
export function NextStep() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const step = nextStep(world, campaign);
  if (!step) return null;
  const me = campaign.parties[campaign.player]!;
  return (
    <p className={`next-step ${step}`} role="status">
      <strong>{t('guide.label')}</strong>
      <span>{t(`guide.${step}` as StringKey, { days: f.days(me.days), funds: f.rm(me.funds) })}</span>
    </p>
  );
}
