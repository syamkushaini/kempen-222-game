import { useState } from 'react';
import type { StringKey } from '../i18n/strings';
import type { SidebarTab } from '../state/store';
import { useStore } from '../state/store';
import { inGov } from '../sim/campaign/office';
import { GRAFT_LEVELS, graftOf } from '../sim/campaign/graft';
import { START_NATION } from '../sim/campaign/nation';
import { START_DEFENCE, defenceShown } from '../sim/campaign/defence';
import { START_PESTEL } from '../sim/campaign/pestel';
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
  group: 'party' | 'gov' | 'eco' | 'nation' | 'pestel' | 'defence';
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
  const [all, setAll] = useState(false);
  const k = campaign.career;
  const me = campaign.parties[campaign.player];
  if (!k || !me || k.ending) return null;
  const governing = campaign.phase === 'term' && inGov(campaign, campaign.player);
  const e = k.economy;
  const nation = k.nation ?? START_NATION;
  const tiles: Tile[] = [
    { group: 'party' as const, id: 'unity', label: t('hint.unity'), text: String(Math.round(me.unity)), bar: me.unity, good: me.unity, delta: me.unity, tab: 'party' },
    { group: 'party' as const, id: 'credibility', label: t('hint.cred'), text: String(Math.round(k.credibility)), bar: k.credibility, good: k.credibility, delta: k.credibility, tab: 'policy' },
    // The corruption meter shows once there is anything on it, and says plainly what it will do (see GraftCard).
    ...(graftOf(campaign) > 0 ? [{ group: 'party' as const, id: 'graft', label: t('metrics.graft'), text: String(Math.round(graftOf(campaign))), bar: graftOf(campaign), good: 100 - graftOf(campaign), delta: graftOf(campaign), tab: 'party' as const }] : []),
    ...(governing ? [
      { group: 'gov' as const, id: 'stability', label: t('hint.stability'), text: String(Math.round(k.government.stability)), bar: k.government.stability, good: k.government.stability, delta: k.government.stability, tab: 'orders' as const },
      { group: 'gov' as const, id: 'trust', label: t('hint.trust'), text: String(Math.round(k.government.trust)), bar: k.government.trust, good: k.government.trust, delta: k.government.trust, tab: 'orders' as const },
    ] : []),
    ...(campaign.phase === 'term' && hasPublicMoney(campaign) ? [{
      group: 'gov' as const, id: 'treasury', label: t('metrics.treasury'), text: f.rm(treasuryOf(campaign)), bar: treasuryCap(world, campaign) > 0 ? (treasuryOf(campaign) / treasuryCap(world, campaign)) * 100 : 0,
      good: treasuryCap(world, campaign) > 0 ? Math.min(100, (treasuryOf(campaign) / treasuryCap(world, campaign)) * 100 + 20) : 50, tab: 'economy' as const,
    }] : []),
    { group: 'eco' as const, id: 'debt', label: t('house.debt'), text: `${e.debt.toFixed(0)}%`, bar: (e.debt / 120) * 100, good: 100 - Math.max(0, Math.min(100, ((e.debt - 40) / 60) * 100)), tab: 'economy' },
    { group: 'eco' as const, id: 'growth', label: t('house.growth'), text: `${e.growth.toFixed(1)}%`, good: Math.max(0, Math.min(100, 50 + (e.growth - 4) * 20)), tab: 'economy' },
    { group: 'eco' as const, id: 'inflation', label: t('house.inflation'), text: `${e.inflation.toFixed(1)}%`, good: Math.max(0, Math.min(100, 50 - (e.inflation - 2.5) * 20)), tab: 'economy' },
    { group: 'eco' as const, id: 'jobless', label: t('house.jobless'), text: `${e.jobless.toFixed(1)}%`, good: Math.max(0, Math.min(100, 50 - (e.jobless - 3.5) * 20)), tab: 'economy' },
    ...(campaign.phase === 'term' ? [
      { group: 'nation' as const, id: 'health', label: t('nation.health'), text: String(Math.round(nation.health)), bar: nation.health, good: nation.health, delta: nation.health, tab: 'meters' as const },
      { group: 'nation' as const, id: 'education', label: t('nation.education'), text: String(Math.round(nation.education)), bar: nation.education, good: nation.education, delta: nation.education, tab: 'meters' as const },
      { group: 'nation' as const, id: 'standing', label: t('nation.standing'), text: String(Math.round(nation.standing)), bar: nation.standing, good: nation.standing, delta: nation.standing, tab: 'meters' as const },
    ] : []),
    // How people hold together, the country's technology, its environment and the rule of law; and, for a federal prime minister, the armed forces.
    ...(campaign.phase === 'term' ? (['cohesion', 'tech', 'environment', 'law'] as const).map((key) => {
      const v = (k.pestel ?? START_PESTEL)[key];
      return { group: 'pestel' as const, id: key, label: key === 'cohesion' ? t('metrics.cohesion') : t(`pestel.${key}`), text: String(Math.round(v)), bar: v, good: v, delta: v, tab: 'meters' as const };
    }) : []),
    ...(campaign.phase === 'term' && defenceShown(campaign) ? (['readiness', 'influence'] as const).map((key) => {
      const v = (k.defence ?? START_DEFENCE)[key];
      // The armed forces having a great say is the one figure where more is worse.
      return { group: 'defence' as const, id: key, label: t(`pestel.${key}`), text: String(Math.round(v)), bar: v, good: key === 'influence' ? 100 - v : v, delta: v, tab: 'meters' as const };
    }) : []),
  ];
  // Six figures decide how a game goes and stay in view; a figure in danger comes up beside them by itself, and the rest are one press away.
  const HEAD = ['unity', 'credibility', 'stability', 'trust', 'treasury', 'debt'];
  const FILL = ['growth', 'inflation', 'jobless', 'health'];
  const headline = HEAD.map((id) => tiles.find((x) => x.id === id)).filter((x): x is Tile => !!x);
  for (const id of FILL) { if (headline.length >= 6) break; const x = tiles.find((y) => y.id === id); if (x) headline.push(x); }
  const shown = new Set(headline.map((x) => x.id));
  const danger = tiles.filter((x) => !shown.has(x.id) && x.good !== undefined && (x.good <= 30 || (x.id === 'graft' && graftOf(campaign) >= GRAFT_LEVELS[2]))).slice(0, 3);
  const up = new Set(danger.map((x) => x.id));
  const rest = tiles.filter((x) => !shown.has(x.id) && !up.has(x.id));
  const groups = (['party', 'gov', 'eco', 'nation', 'pestel', 'defence'] as const).map((g) => ({ g, items: rest.filter((x) => x.group === g) })).filter((x) => x.items.length > 0);
  // Colour is kept for what needs it: a figure in the middle stays plain, and one that is doing well or badly shows it.
  const tone = (good: number | undefined) => (good === undefined ? undefined : good >= 62 ? colour(good) : good <= 38 ? colour(good) : undefined);
  const chip = (x: Tile, alert = false) => (
    <button key={x.id} type="button" className={`metric${alert ? ' alert' : ''}`} data-metric={x.id} title={t('metrics.open', { name: x.label })} onClick={() => setTab(x.tab)}>
      <span className="metric-label">{x.label}</span>
      <strong className="num metric-value" style={{ color: tone(x.good) }}>{x.text}{x.delta !== undefined && <Delta value={x.delta} />}</strong>
      {(x.bar ?? x.good) !== undefined && <span className="metric-bar" aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(100, (x.bar ?? x.good)!))}%`, background: tone(x.good) }} /></span>}
    </button>
  );
  return (
    <section className="metrics-strip" aria-label={t('metrics.title')}>
      <div className="metrics-headline">
        {headline.map((x) => chip(x))}
        {danger.map((x) => chip(x, true))}
        {groups.length > 0 && (
          <button type="button" className="metrics-more" aria-expanded={all} onClick={() => setAll(!all)}>
            {t(all ? 'metrics.fewer' : 'metrics.all', { n: rest.length })} <span aria-hidden="true">{all ? '▴' : '▾'}</span>
          </button>
        )}
      </div>
      {all && (
        <div className="metrics-detail">
          {groups.map(({ g, items }) => (
            <div key={g} className="metric-group" role="group" aria-label={t(`metrics.group.${g}` as StringKey)}>
              <span className="metric-group-name">{t(`metrics.group.${g}` as StringKey)}</span>
              <div className="metric-row" style={{ ['--n' as string]: items.length }}>{items.map((x) => chip(x))}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
