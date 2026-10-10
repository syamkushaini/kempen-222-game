import { scaled } from '../sim/campaign/actions';
import { publicAmount, realistic, type Effect } from '../sim/campaign/events';
import { hasPublicMoney } from '../sim/campaign/treasury';
import type { Campaign } from '../sim/campaign/types';
import type { World } from '../sim/election';
import type { Format, T } from './hooks';

/**
 * What an effect will plainly do, as a few words: the figures are the ones that will be applied (the level of difficulty
 * makes a loss larger or smaller, and a gain too). Null for an effect with nothing to say.
 */
export function describeEffect(t: T, f: Format, world: World, campaign: Campaign, e: Effect): string | null {
  const real = (n: number) => Math.round(realistic(campaign, n) * 10) / 10;
  const sign = (n: number, label: string) => `${label} ${n > 0 ? '+' : '−'}${Math.abs(n)}`;
  const arrow = (n: number, label: string) => `${n > 0 ? '▲' : '▼'} ${label}`;
  switch (e.t) {
    case 'funds': return `${e.n > 0 ? '+' : '−'}${f.rm(scaled(world, Math.abs(realistic(campaign, e.n))))}`;
    // The public's money: the treasury's, in the government's amounts, where the party governs; the party's own, as written, where it does not.
    case 'public': return hasPublicMoney(campaign) ? `${t('hint.treasury')} ${e.n > 0 ? '+' : '−'}${f.rm(Math.abs(publicAmount(world, campaign, e.n)))}` : `${e.n > 0 ? '+' : '−'}${f.rm(scaled(world, Math.abs(realistic(campaign, e.n))))}`;
    case 'dividend': return `${e.pct > 0 ? '+' : '−'}${f.rm(Math.abs(Math.round((campaign.career?.assets ?? 0) * e.pct)))}`;
    case 'assets': return arrow(e.pct, t('hint.assets'));
    // Unity is kept in whole points.
    case 'unity': return sign(Math.round(realistic(campaign, e.n)) || Math.sign(e.n), t('hint.unity'));
    case 'cred': return sign(real(e.n), t('hint.cred'));
    case 'stability': return sign(real(e.n), t('hint.stability'));
    case 'trust': return sign(real(e.n), t('hint.trust'));
    case 'fiscal': return arrow(e.n, t('hint.fiscal'));
    case 'economy': return e.growth ? arrow(e.growth, t('house.growth')) : e.inflation ? arrow(e.inflation, t('house.inflation')) : null;
    case 'machinery': return arrow(e.n, t('hint.branches'));
    case 'donors': return arrow(e.n, t('hint.donors'));
    case 'state': return arrow(e.n, t('hint.state'));
    case 'relation': return arrow(e.n, t('hint.relations'));
    case 'rival': return arrow(e.n, t('hint.rival'));
    case 'mood': return arrow(e.n, e.blocs === 'all' ? t('hint.support') : e.blocs.map((b) => t(`bloc.${b}`)).join(', '));
    case 'falls': return t('hint.falls');
    default: return null;
  }
}
