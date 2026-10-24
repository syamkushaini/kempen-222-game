import type { StringKey } from '../i18n/strings';
import { GRAFT_LEVELS, PROSECUTABLE, graftLevel, graftOf, prosecutionChance } from '../sim/campaign/graft';
import { useStore } from '../state/store';
import { useGaugeColour } from './Gauge';
import { useT } from './hooks';

/**
 * The corruption meter: how bad it is, what that is doing to the party now, the chance of the dock if power were lost, and what raises and
 * lowers it. Nothing here is hidden: the numbers are the ones in graft.ts.
 */
export function GraftCard() {
  const t = useT();
  const campaign = useStore((s) => s.game?.campaign);
  const colour = useGaugeColour();
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
      <p className="small"><strong>{t('graft.raises')}.</strong> {t('graft.raises.list')}</p>
      <p className="small"><strong>{t('graft.lowers')}.</strong> {t('graft.lowers.list')}</p>
      {campaign.phase === 'campaign' && <p className="muted small">{t('graft.campaign')}</p>}
    </section>
  );
}
