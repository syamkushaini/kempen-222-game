import { inPact, others, relation } from '../sim/campaign/diplomacy';
import { useStore } from '../state/store';
import { partyColor, partyShort, relationWord, useT } from './hooks';

const SIZE = 260, MID = SIZE / 2, RADIUS = 96;

/**
 * Who gets on with whom, as lines between the leaders. A line is solid and green where they are warm, dashed and red
 * where they are cold, and thick where there is a pact: the pattern says what the colour says. The player is in the middle.
 */
export function RelationMap() {
  const t = useT();
  const campaign = useStore((s) => s.game!.campaign);
  const me = campaign.player;
  const rivals = others(campaign, me);
  const nodes = [{ p: me, x: MID, y: MID }, ...rivals.map((p, i) => {
    const a = (i / rivals.length) * Math.PI * 2 - Math.PI / 2;
    return { p, x: MID + Math.cos(a) * RADIUS, y: MID + Math.sin(a) * RADIUS };
  })];
  const edges = nodes.flatMap((a, i) => nodes.slice(i + 1).map((b) => ({ a, b, rel: relation(campaign, a.p, b.p), pact: inPact(campaign, a.p, b.p) })))
    // The player's own ties always show; between the others only the strong ones, so the picture stays readable.
    .filter((e) => e.pact || Math.abs(e.rel) >= (e.a.p === me ? 15 : 35));
  return (
    <details className="relation-map">
      <summary>{t('deals.map')}</summary>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={t('deals.map')}>
        {edges.map(({ a, b, rel, pact }) => (
          <line
            key={`${a.p}-${b.p}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={rel >= 0 ? 'var(--good)' : 'var(--bad)'} strokeWidth={pact ? 4 : 1 + Math.min(2, Math.abs(rel) / 40)}
            strokeDasharray={rel < 0 ? '4 4' : undefined} opacity={0.85}
          >
            <title>{`${partyShort(t, a.p)} – ${partyShort(t, b.p)}: ${t(`relation.${relationWord(rel)}`)}${pact ? ` · ${t('deals.map.pact')}` : ''}`}</title>
          </line>
        ))}
        {nodes.map(({ p, x, y }) => (
          <g key={p}>
            <circle cx={x} cy={y} r={p === me ? 18 : 14} fill={partyColor(p)} stroke="var(--ink)" strokeWidth={p === me ? 2 : 0} />
            <text x={x} y={y + (p === me ? 32 : 28)} textAnchor="middle" fontSize="11" fill="var(--ink)">{partyShort(t, p)}</text>
          </g>
        ))}
      </svg>
      <p className="muted small">{t('deals.map.key')}</p>
    </details>
  );
}
