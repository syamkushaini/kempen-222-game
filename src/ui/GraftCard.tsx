import type { StringKey } from '../i18n/strings';
import { CLEANUP, GRAFT_LEVELS, canCleanUp, PROSECUTABLE, graftLevel, graftOf, prosecutionChance } from '../sim/campaign/graft';
import { useStore } from '../state/store';
import { useGaugeColour } from './Gauge';
import { useFormat, useT, useWorld } from './hooks';
import { scaled } from '../sim/campaign/actions';

/**
 * The corruption meter: how bad it is, what that is doing to the party now, the chance of the dock if power were lost, and what raises and
 * lowers it. Nothing here is hidden: the numbers are the ones in graft.ts.
 */
export function GraftCard() {
  const t = useT();
  const campaign = useStore((s) => s.game?.campaign);
  const colour = useGaugeColour();
  const f = useFormat();
  const world = useWorld();
  const cleanUp = useStore((s) => s.cleanUp);
  if (!campaign) return null;
  const g = graftOf(campaign);
  const level = graftLevel(g);
  const pct = (fall: 'lost' | 'partner') => Math.round(prosecutionChance(g, fall) * 100);
  const risky = level >= PROSECUTABLE;
  const governing = campaign.phase === 'term' && !!campaign.career && (campaign.career.government.pm === campaign.player || campaign.career.government.partners.includes(campaign.player));
  return (
    <section className={`conduct graft graft-${level}`} aria-label={t('graft.title')}>
      <h3>{t('graft.title')}</h3>
      <p className="muted small action-desc">{t('graft.desc')}</p>
      <div className="gauge">
        <span className="muted">{t('graft.now', { n: Math.round(g), level: t(`graft.level.${level}` as StringKey) })}</span>
        <div className="bar gauge-bar" aria-hidden="true"><span style={{ width: `${Math.round(g)}%`, background: colour(100 - g) }} /></div>
      </div>
      <p className={level >= 2 ? 'note neg' : 'note'}>{t(`graft.effect.${level}` as StringKey)}</p>
      <p className={risky ? 'note neg' : 'muted small'} role={risky ? 'alert' : undefined}>
        {risky ? t(governing ? 'graft.risk.won' : 'graft.risk.lost', { pct: pct('lost') }) : t('graft.risk.none')}
        {risky && governing && ` ${t('graft.risk.partner', { pct: pct('partner') })}`}
      </p>
      {risky && <p className="muted small">{t('graft.risk.end')}</p>}
      <dl className="facts">
        {GRAFT_LEVELS.map((from, i) => (
          <div key={from} className={i === level ? 'now' : ''}><dt>{from}+</dt><dd>{t(`graft.level.${i}` as StringKey)}</dd></div>
        ))}
      </dl>
      {(() => {
        const can = canCleanUp(world, campaign);
        return (
          <div className="button-row">
            <button type="button" className="btn" disabled={!can.ok} onClick={cleanUp}>{t('graft.audit', { rm: f.rm(scaled(world, CLEANUP.money)), n: CLEANUP.graft, unity: CLEANUP.unity })}</button>
            {!can.ok && can.reason !== 'phase' && <span className="muted small">{t(`graft.audit.${can.reason}` as StringKey, { weeks: can.weeks ?? 0 })}</span>}
          </div>
        );
      })()}
      <p className="muted small">{t('graft.audit.desc', { days: CLEANUP.gapWeeks })}</p>
      <p className="small"><strong>{t('graft.raises')}.</strong> {t('graft.raises.list')}</p>
      <p className="small"><strong>{t('graft.lowers')}.</strong> {t('graft.lowers.list')}</p>
      {campaign.phase === 'campaign' && <p className="muted small">{t('graft.campaign')}</p>}
    </section>
  );
}
