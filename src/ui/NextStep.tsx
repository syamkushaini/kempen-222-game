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
  const shown = useStore((s) => s.settings.hints);
  const setSettings = useStore((s) => s.setSettings);
  if (!step || !shown) return null;
  const me = campaign.parties[campaign.player]!;
  return (
    <p className={`next-step step-${step}`} role="status">
      <strong>{t('guide.label')}</strong>
      <span className="grow">{t(`guide.${step}` as StringKey, { days: f.days(me.days), funds: f.rm(me.funds) })}</span>
      <button className="link next-step-hide" title={t('guide.hide')} aria-label={t('guide.hide')} onClick={() => setSettings({ hints: false })}>×</button>
    </p>
  );
}
