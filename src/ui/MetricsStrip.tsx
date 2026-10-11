import type { SidebarTab } from '../state/store';
import { useStore } from '../state/store';
import { inGov } from '../sim/campaign/office';
import { START_NATION } from '../sim/campaign/nation';
import { hasPublicMoney, treasuryCap, treasuryOf } from '../sim/campaign/treasury';
import { Delta } from './Delta';
import { useGaugeColour } from './Gauge';
import { useFormat, useT, useWorld } from './hooks';

interface Tile {
  id: string;
  label: string;
  /** The text shown, and the share of the bar that is full (0 to 100), where there is a bar. */
  text: string;
  bar?: number;
  /** How good the figure is, from 0 (bad) to 100 (good), for the colour. */
  good?: number;
  /** Whole points to show a change in, where it changes in whole points. */
  delta?: number;
  tab: SidebarTab;
}

/**
 * The figures that say how the game is going, all in one place at the top: the party's standing (unity, credibility), the
 * government's (stability, public trust, the treasury), the economy and the state of the nation. Each shows its colour and a
 * change when it moves, and opens the tab where it can be mended.
 */
export function MetricsStrip() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const setTab = useStore((s) => s.setTab);
  const colour = useGaugeColour();
  const k = campaign.career;
  const me = campaign.parties[campaign.player];
  if (!k || !me || k.ending) return null;
  const governing = campaign.phase === 'term' && inGov(campaign, campaign.player);
  const e = k.economy;
  const nation = k.nation ?? START_NATION;
  const tiles: Tile[] = [
    { id: 'unity', label: t('hint.unity'), text: String(Math.round(me.unity)), bar: me.unity, good: me.unity, delta: me.unity, tab: 'party' },
    { id: 'credibility', label: t('hint.cred'), text: String(Math.round(k.credibility)), bar: k.credibility, good: k.credibility, delta: k.credibility, tab: 'policy' },
    ...(governing ? [
      { id: 'stability', label: t('hint.stability'), text: String(Math.round(k.government.stability)), bar: k.government.stability, good: k.government.stability, delta: k.government.stability, tab: 'orders' as const },
      { id: 'trust', label: t('hint.trust'), text: String(Math.round(k.government.trust)), bar: k.government.trust, good: k.government.trust, delta: k.government.trust, tab: 'orders' as const },
    ] : []),
    ...(campaign.phase === 'term' && hasPublicMoney(campaign) ? [{
      id: 'treasury', label: t('metrics.treasury'), text: f.rm(treasuryOf(campaign)), bar: treasuryCap(world, campaign) > 0 ? (treasuryOf(campaign) / treasuryCap(world, campaign)) * 100 : 0,
      good: treasuryCap(world, campaign) > 0 ? Math.min(100, (treasuryOf(campaign) / treasuryCap(world, campaign)) * 100 + 20) : 50, tab: 'house' as const,
    }] : []),
    { id: 'debt', label: t('house.debt'), text: `${e.debt.toFixed(0)}%`, bar: (e.debt / 120) * 100, good: 100 - Math.max(0, Math.min(100, ((e.debt - 40) / 60) * 100)), tab: 'house' },
    { id: 'growth', label: t('house.growth'), text: `${e.growth.toFixed(1)}%`, good: Math.max(0, Math.min(100, 50 + (e.growth - 4) * 20)), tab: 'house' },
    { id: 'inflation', label: t('house.inflation'), text: `${e.inflation.toFixed(1)}%`, good: Math.max(0, Math.min(100, 50 - (e.inflation - 2.5) * 20)), tab: 'house' },
    { id: 'jobless', label: t('house.jobless'), text: `${e.jobless.toFixed(1)}%`, good: Math.max(0, Math.min(100, 50 - (e.jobless - 3.5) * 20)), tab: 'house' },
    ...(campaign.phase === 'term' ? [
      { id: 'health', label: t('nation.health'), text: String(Math.round(nation.health)), bar: nation.health, good: nation.health, delta: nation.health, tab: 'house' as const },
      { id: 'education', label: t('nation.education'), text: String(Math.round(nation.education)), bar: nation.education, good: nation.education, delta: nation.education, tab: 'house' as const },
      { id: 'standing', label: t('nation.standing'), text: String(Math.round(nation.standing)), bar: nation.standing, good: nation.standing, delta: nation.standing, tab: 'house' as const },
    ] : []),
  ];
  return (
    <section className="metrics-strip" aria-label={t('metrics.title')}>
      {tiles.map((x) => (
        <button key={x.id} type="button" className="metric" data-metric={x.id} title={t('metrics.open', { name: x.label })} onClick={() => setTab(x.tab)}>
          <span className="metric-label">{x.label}</span>
          <strong className="num metric-value" style={x.good !== undefined ? { color: colour(x.good) } : undefined}>{x.text}{x.delta !== undefined && <Delta value={x.delta} />}</strong>
          {x.bar !== undefined && <span className="metric-bar" aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(100, x.bar))}%`, background: x.good !== undefined ? colour(x.good) : undefined }} /></span>}
        </button>
      ))}
    </section>
  );
}
