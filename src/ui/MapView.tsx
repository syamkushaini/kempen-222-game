import { memo, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import type { World } from '../sim/election';
import type { RegionId, SeatClass } from '../sim/types';
import { useStore } from '../state/store';
import { contestName, partyColor, partyShort, regionLabel, useFormat, useT, useWorld, type SeatDisplay } from './hooks';

interface MapShape { d: string; bbox: [number, number, number, number] }
interface MapData {
  width: number;
  height: number;
  seats: Record<string, MapShape>;
  states: Record<string, MapShape>;
}

/** State assemblies have their own maps; everything else uses the national one. */
function loadMap(world: World): Promise<MapData> {
  const file = world.id.startsWith('state:')
    ? import(`../data/generated/map-dun-${world.id.slice(6)}.json`)
    : import('../data/generated/map.json');
  return file.then((m) => m.default as unknown as MapData);
}

// The country is about three times wider than it is tall. A taller canvas
// leaves room to zoom into tall states without shrinking them.
const VIEW_HEIGHT = 470;
const MAX_ZOOM = 40;
const CLASS_OPACITY: Record<SeatClass, number> = { safe: 1, leaning: 0.72, marginal: 0.46 };
const STALE_OPACITY = 0.22;

const SeatPath = memo(function SeatPath(props: {
  id: string; d: string; fill: string | undefined; opacity: number; dim: boolean; selected: boolean;
}) {
  return (
    <path
      data-seat={props.id}
      d={props.d}
      fill={props.fill}
      fillOpacity={props.opacity}
      className={`seat${props.fill ? '' : ' undeclared'}${props.dim ? ' dim' : ''}${props.selected ? ' selected' : ''}`}
    />
  );
});

export function MapView(props: {
  display: SeatDisplay[];
  /** Controls shown at the top right of the map panel. */
  toolbar?: ReactNode;
  /** Region to mark with the leader's pin. */
  marker?: RegionId | null;
}) {
  const { display } = props;
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  // A one-seat contest has nothing to zoom between; the map stays on the seat.
  const single = world.seats.length === 1;
  const selectedState = useStore((s) => s.selectedState);
  const selectedSeat = useStore((s) => s.selectedSeat);
  const selectState = useStore((s) => s.selectState);
  const selectSeat = useStore((s) => s.selectSeat);

  const [map, setMap] = useState<MapData | null>(null);
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    setMap(null);
    loadMap(world).then((m) => { if (alive) setMap(m); });
    return () => { alive = false; };
  }, [world]);

  // The area the contest covers: the union of its seats.
  const home = useMemo(() => {
    if (!map) return null;
    const box = [Infinity, Infinity, -Infinity, -Infinity];
    for (const seat of world.seats) {
      const b = map.seats[seat.id]?.bbox;
      if (!b) return null; // the map for the previous contest is still loaded
      box[0] = Math.min(box[0], b[0]); box[1] = Math.min(box[1], b[1]);
      box[2] = Math.max(box[2], b[2]); box[3] = Math.max(box[3], b[3]);
    }
    return box;
  }, [map, world]);
  const backdrop = useMemo(
    () => (map && single ? Object.entries(map.seats).filter(([id]) => !world.seatIndex.has(id)) : []),
    [map, single, world],
  );

  const zoom = useMemo(() => {
    if (!map || !home) return null;
    const W = map.width, H = VIEW_HEIGHT;
    const region = !single && selectedState ? map.states[selectedState]?.bbox : null;
    const box = region ?? home;
    const bw = Math.max(box[2] - box[0], 1e-6), bh = Math.max(box[3] - box[1], 1e-6);
    // A lone seat is shown with its surroundings for context.
    const pad = region ? 1.25 : single ? 3 : 1.04;
    const k = Math.min(W / (bw * pad), H / (bh * pad), MAX_ZOOM);
    const cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2;
    return { k, transform: `translate(${W / 2 - k * cx}px, ${H / 2 - k * cy}px) scale(${k})` };
  }, [map, home, single, selectedState]);

  const seatFromEvent = (e: MouseEvent) => (e.target as Element).getAttribute?.('data-seat') ?? null;

  const onClick = (e: MouseEvent) => {
    const id = seatFromEvent(e);
    if (!id) return;
    const seat = world.seats[world.seatIndex.get(id)!];
    // First click zooms to the region; a click inside the open region picks the seat.
    if (single) selectSeat(id, seat.state);
    else if (seat.state !== selectedState) selectState(seat.state);
    else selectSeat(id);
  };

  const onMove = (e: MouseEvent) => {
    const id = seatFromEvent(e);
    const rect = frame.current?.getBoundingClientRect();
    if (!id || !rect) { if (hover) setHover(null); return; }
    setHover({ id, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const hoveredIndex = hover ? world.seatIndex.get(hover.id)! : -1;
  const hovered = hoveredIndex >= 0 ? display[hoveredIndex] : null;
  const hoveredSeat = hoveredIndex >= 0 ? world.seats[hoveredIndex] : null;

  const seen = new Set<number>();
  let anyStale = false, anyUndeclared = false;
  for (const d of display) {
    if (d.winner < 0) anyUndeclared = true; else seen.add(d.winner);
    if (d.stale) anyStale = true;
  }
  const marker = !map || !props.marker ? null : single ? map.seats[world.seats[0].id]?.bbox : map.states[props.marker]?.bbox;

  return (
    <div className="panel map-panel">
      <div className="map-top">
        <nav className="crumbs" aria-label="Map location">
          <button className="crumb" onClick={() => selectState(null)} disabled={single || !selectedState}>{contestName(t, world)}</button>
          {!single && selectedState && <><span aria-hidden="true">›</span><span className="crumb here">{regionLabel(t, world, selectedState)}</span></>}
        </nav>
        {props.toolbar}
      </div>

      {!single && (
        <div className="chips">
          {world.states.map((st) => (
            <button key={st} className={st === selectedState ? 'chip active' : 'chip'} aria-pressed={st === selectedState} onClick={() => selectState(st === selectedState ? null : st)}>
              {regionLabel(t, world, st)}
            </button>
          ))}
        </div>
      )}

      <div className="map-frame" ref={frame}>
        {!map && <p className="muted map-loading">{t('app.loadingMap')}</p>}
        {map && zoom && (
          <svg viewBox={`0 0 ${map.width} ${VIEW_HEIGHT}`} role="img" aria-label={contestName(t, world)} onMouseLeave={() => setHover(null)}>
            <g className="map-zoom" style={{ transform: zoom.transform }} onClick={onClick} onMouseMove={onMove}>
              {backdrop.map(([id, shape]) => <path key={id} d={shape.d} className="seat-backdrop" />)}
              {world.seats.map((seat, i) => {
                const d = display[i];
                // While switching contests, the map or the display can briefly belong to the previous one.
                if (!d || !map.seats[seat.id]) return null;
                return (
                  <SeatPath
                    key={seat.id}
                    id={seat.id}
                    d={map.seats[seat.id].d}
                    fill={d.winner < 0 ? undefined : partyColor(d.winner)}
                    opacity={d.winner < 0 ? 1 : d.stale ? STALE_OPACITY : CLASS_OPACITY[d.cls]}
                    dim={!single && selectedState !== null && seat.state !== selectedState}
                    selected={seat.id === selectedSeat}
                  />
                );
              })}
              {Object.entries(map.states).map(([id, shape]) => (
                <path key={id} d={shape.d} className="state-outline" />
              ))}
              {selectedSeat && map.seats[selectedSeat] && <path d={map.seats[selectedSeat].d} className="seat-highlight" />}
              {marker && (
                <g className="leader-pin" transform={`translate(${(marker[0] + marker[2]) / 2} ${(marker[1] + marker[3]) / 2}) scale(${1 / zoom.k})`}>
                  <circle r="9" className="pin-halo" />
                  <circle r="4.5" className="pin-dot" />
                </g>
              )}
            </g>
          </svg>
        )}
        {hover && hovered && hoveredSeat && (
          <div className="tooltip" style={{ left: hover.x, top: hover.y }}>
            <strong>{hoveredSeat.name}</strong>
            <span className="muted">{hoveredSeat.id} · {regionLabel(t, world, hoveredSeat.state)}</span>
            {hovered.winner >= 0 ? (
              <span>
                <i className="dot" style={{ background: partyColor(hovered.winner) }} />
                {partyShort(t, hovered.winner)} · {t('map.margin', { pct: f.pct(hovered.margin) })}
              </span>
            ) : <span className="muted">{t('legend.undeclared')}</span>}
            {hovered.stale && <span className="muted">{t('map.fog')}</span>}
          </div>
        )}
      </div>

      <div className="legend">
        {[...seen].sort((a, b) => a - b).map((p) => (
          <span key={p}><i className="dot" style={{ background: partyColor(p) }} />{partyShort(t, p)}</span>
        ))}
        <span className="legend-gap" />
        {(['safe', 'leaning', 'marginal'] as const).map((c) => (
          <span key={c}><i className="swatch" style={{ opacity: CLASS_OPACITY[c] }} />{t(`legend.${c}`)}</span>
        ))}
        {anyStale && <span><i className="swatch" style={{ opacity: STALE_OPACITY }} />{t('legend.unpolled')}</span>}
        {anyUndeclared && <span><i className="swatch undeclared" />{t('legend.undeclared')}</span>}
      </div>
    </div>
  );
}
