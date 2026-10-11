import { scaled } from '../sim/campaign/actions';
import { publicAmount, realistic, type Effect } from '../sim/campaign/events';
import { MONTH, commitmentWeekly, hasPublicMoney } from '../sim/campaign/treasury';
import type { Campaign } from '../sim/campaign/types';
import type { World } from '../sim/election';
import type { StringKey } from '../i18n/strings';
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
    case 'fiscal': return `${arrow(e.n, t('hint.fiscal'))} (${e.n > 0 ? '+' : '−'}${f.rm(Math.abs(commitmentWeekly(world, e.n)) * MONTH)}${t('cost.perMonth')})`;
    case 'economy': {
      const parts = [e.growth ? sign(Math.round(e.growth * 10) / 10, t('house.growth')) : '', e.inflation ? sign(Math.round(e.inflation * 10) / 10, t('house.inflation')) : ''].filter(Boolean);
      return parts.length ? parts.join(' · ') : null;
    }
    case 'nation': {
      const parts = [e.health ? arrow(e.health, t('nation.health')) : '', e.education ? arrow(e.education, t('nation.education')) : '', e.standing ? arrow(e.standing, t('nation.standing')) : ''].filter(Boolean);
      return parts.length ? parts.join(' · ') : null;
    }
    case 'debt': return `${e.n > 0 ? '▲' : '▼'} ${t('house.debt')} ${e.n > 0 ? '+' : '−'}${Math.abs(e.n)} ${t('hint.debt.points')}`;
    case 'austerity': return t('hint.austerity');
    case 'bankrupt': return t('hint.bankrupt');
    case 'dossier': return arrow(e.n, t('hint.dossier'));
    case 'salience': return arrow(e.n, t('hint.salience', { issue: t(`issue.${e.issue}` as StringKey) }));
    case 'minister': return t(e.act === 'sack' ? 'hint.minister.sack' : 'hint.minister.keep');
    case 'ksu': return t(`hint.ksu.${e.act}` as StringKey);
    case 'adviser': return t(`hint.adviser.${e.act}` as StringKey);
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
