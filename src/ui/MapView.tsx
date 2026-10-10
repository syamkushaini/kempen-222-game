import { createPortal } from 'react-dom';
import { lazy, memo, Suspense, useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { stateNeeded } from '../data/world';
import { campaignMarks } from '../sim/campaign/marks';
import { FAMILY_COLORS, FAMILY_IDS, LAYER_IDS, LAYER_KIND, layerPins, MACHINERY_COLOR, machineryHeat, MARGINAL_COLOR, UNPOLLED_COLOR, type LayerId, type Pin } from '../sim/campaign/layers';
import type { Campaign } from '../sim/campaign/types';
import { lastElection } from '../sim/election';
import { latestNationalPoll } from '../sim/campaign/polls';
import type { Flip } from '../sim/campaign/night';
import type { World } from '../sim/election';
import { PinGlyph, PinKey } from './pins';
import type { RegionId, SeatClass } from '../sim/types';
import { useStore } from '../state/store';
import { canDraw3D, PATTERNS } from './map3d';
import { FIT, holdPoint, viewTransform, zoomBy, type View } from './mapGesture';
import { contestName, partyColor, partyShort, regionLabel, useFormat, useSpot, useT, useWorld, type SeatDisplay, useNarrow, useTablet } from './hooks';
import { Icon } from './Icon';
import { SeatSearch } from './SeatSearch';
import { Term } from './Term';
import { MapShareDialog } from './MapShareDialog';
import { controlPicture, mapCaption } from './mapShare';

// The 3D map and the library behind it are fetched only for a player who turns 3D on.
const MapScene3D = lazy(() => import('./MapScene3D'));

interface MapShape { d: string; bbox: [number, number, number, number] }
interface MapData {
  width: number;
  height: number;
  seats: Record<string, MapShape>;
  states: Record<string, MapShape>;
}

/** State assemblies have their own maps; everything else uses the national one. */
function loadMap(world: World): Promise<MapData> {
  // A state election, a career in a state (career:<state>), and an assembly seat's by-election (byelection:dun:<state>:<code>) all use the state's own map.
  const state = stateNeeded(world.id);
  const file = state
    ? import(`../data/generated/map-dun-${state}.json`)
    : import('../data/generated/map.json');
  return file.then((m) => m.default as unknown as MapData);
}

// The country is about three times wider than it is tall. A taller canvas
// leaves room to zoom into tall states without shrinking them.
const VIEW_HEIGHT = 470;
/** On a phone the map has a screen of its own, so it is drawn nearly square: a state fills more of it. */
const PHONE_SHAPE = 1.05;
const MAX_ZOOM = 40;
const CLASS_OPACITY: Record<SeatClass, number> = { safe: 1, leaning: 0.72, marginal: 0.46 };
const STALE_OPACITY = 0.22;
/** How large a mark is drawn, against the 12 units it is designed in: the same on screen at any zoom. */
const MARK_SIZE = 1.7;
const PIN_SIZE = 1.5;

/** Whether a layer has anything to show in this game. */
function layerUsable(id: LayerId, world: World, campaign: Campaign | undefined): boolean {
  if (id === 'mine' || id === 'machinery') return !!campaign && campaign.parties[campaign.player] !== null;
  if (id === 'pacts') return !!campaign && world.rules.diplomacy;
  // Only a party the player made has a choice of where to stand.
  if (id === 'fielded') return !!campaign?.career?.own;
  return true;
}

/** The little picture beside a layer's name: what it puts on the map. */
function LayerKey({ id, me, size = 16 }: { id: LayerId; me: number | null; size?: number }) {
  if (id === 'machinery') return <span className="layer-swatch" style={{ background: MACHINERY_COLOR, width: size, height: size }} aria-hidden="true" />;
  if (id === 'campaign') return <svg className="pin-key mark-key" width={size} height={size} style={{ width: size, height: size }} viewBox="-7 -7 14 14" aria-hidden="true"><path d="M-6 4.5L0 -5.5L6 4.5Z M-1.4 4.5L0 1.2L1.4 4.5Z" fillRule="evenodd" /></svg>;
  const kind = LAYER_KIND[id]!;
  const color = id === 'marginal' ? MARGINAL_COLOR : id === 'blocs' ? FAMILY_COLORS.middle : id === 'mine' || id === 'pacts' || id === 'fielded' ? (me !== null ? partyColor(me) : '#888') : '#94a3b8';
  return <PinKey kind={kind} color={color} size={size} />;
}

/** The key for each ticked layer, beside the key for the seats. */
function LayerLegend({ on, me }: { on: ReadonlySet<LayerId>; me: number | null }) {
  const t = useT();
  const mine = me !== null ? partyColor(me) : '#888';
  return (
    <>
      {on.has('marginal') && <span><PinKey kind="ring" color={MARGINAL_COLOR} size={14} />{t('legend.layer.marginal')}</span>}
      {on.has('flipped') && <span><PinKey kind="dot" color="#94a3b8" size={14} />{t('legend.layer.flipped')}</span>}
      {on.has('mine') && <span><PinKey kind="square" color={mine} size={14} />{t('legend.layer.mine')}</span>}
      {on.has('mine') && <span><PinKey kind="bullseye" color={mine} size={14} />{t('legend.layer.target')}</span>}
      {on.has('fielded') && <span><PinKey kind="flag" color={mine} size={14} />{t('legend.layer.fielded')}</span>}
      {on.has('unpolled') && <span><PinKey kind="diamond" color={UNPOLLED_COLOR} size={14} />{t('legend.layer.unpolled')}</span>}
      {on.has('pacts') && <span><PinKey kind="down" color={mine} size={14} />{t('legend.layer.aside')}</span>}
      {on.has('pacts') && <span><PinKey kind="up" color={mine} size={14} />{t('legend.layer.asideFor')}</span>}
      {on.has('machinery') && <span><span className="layer-swatch" style={{ background: MACHINERY_COLOR }} aria-hidden="true" />{t('legend.layer.machinery')}</span>}
      {on.has('blocs') && FAMILY_IDS.map((f) => <span key={f}><PinKey kind="hex" color={FAMILY_COLORS[f]} size={14} />{t(`family.${f}`)}</span>)}
    </>
  );
}

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

const PAT = 9;

function PatternDefs() {
  return (
    <defs>
      {PATTERNS.map(({ kind, ink }, i) => (
        <pattern key={i} id={`party-pat-${i}`} width={PAT} height={PAT} patternUnits="userSpaceOnUse" patternTransform={kind === 'diag' ? 'rotate(45)' : kind === 'back' ? 'rotate(-45)' : undefined}>
          {kind === 'dots' ? <circle cx={PAT / 2} cy={PAT / 2} r="1.3" fill={ink} fillOpacity="0.55" />
            : kind === 'vert' ? <rect x="0" y="0" width="2" height={PAT} fill={ink} fillOpacity="0.45" />
            : kind === 'horiz' ? <rect x="0" y="0" width={PAT} height="2" fill={ink} fillOpacity="0.45" />
            : kind === 'hatch' ? <><rect x="0" y="0" width="1.6" height={PAT} fill={ink} fillOpacity="0.4" /><rect x="0" y="0" width={PAT} height="1.6" fill={ink} fillOpacity="0.4" /></>
            : <rect x="0" y="0" width="2" height={PAT} fill={ink} fillOpacity="0.45" />}
        </pattern>
      ))}
    </defs>
  );
}

/** How a freshly declared seat is flagged: held by the same party, taken from another, or (for the player) won or lost. */
export type PulseKind = Flip;

export function MapView(props: {
  display: SeatDisplay[];
  /** Controls shown at the top right of the map panel. */
  toolbar?: ReactNode;
  /** Region to mark with the leader's pin. */
  marker?: RegionId | null;
  /** A seat that has just been declared: it flashes an outline, in a colour that says whether it changed hands. `n` restarts the flash. */
  pulse?: { id: string; kind: PulseKind; n: number } | null;
  /** On a phone, where the map has a screen to itself, draw it nearly square. Not for election night, where the tally shares the screen. */
  tall?: boolean;
}) {
  const { display } = props;
  const t = useT();
  const f = useFormat();
  const spot = useSpot();
  const world = useWorld();
  // A one-seat contest has nothing to zoom between; the map stays on the seat.
  const single = world.seats.length === 1;
  const selectedState = useStore((s) => s.selectedState);
  const [shared, setShared] = useState<{ picture: string; caption: string } | null>(null);
  const shareMap = () => {
    const c = useStore.getState().game?.campaign;
    if (!c) return;
    void controlPicture(world, c).then((picture) => { if (picture) setShared({ picture, caption: mapCaption(t, f, world, c) }); });
  };
  const accessible = useStore((s) => s.settings.palette === 'accessible');
  const want3d = useStore((s) => s.settings.map3d);
  const setSettings = useStore((s) => s.setSettings);
  const use3d = want3d && canDraw3D();
  const selectedSeat = useStore((s) => s.selectedSeat);
  const selectState = useStore((s) => s.selectState);
  const selectSeat = useStore((s) => s.selectSeat);
  const preview = useStore((s) => s.preview);

  const [map, setMap] = useState<MapData | null>(null);
  const narrow = useNarrow() && !useTablet();
  const viewH = props.tall && narrow && map ? Math.round(map.width * PHONE_SHAPE) : VIEW_HEIGHT;
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // The player's own zoom and pan, on top of the map's automatic framing of the open state.
  const [view, setView] = useState<View>(FIT);
  const touches = useRef(new Map<number, { x: number; y: number }>());
  const grip = useRef<{ start: View; a: [number, number]; spread: number } | null>(null);
  const dragged = useRef(false);
  useEffect(() => setView(FIT), [world, selectedState]);

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
    const W = map.width, H = viewH;
    const region = !single && selectedState ? map.states[selectedState]?.bbox : null;
    const box = region ?? home;
    const bw = Math.max(box[2] - box[0], 1e-6), bh = Math.max(box[3] - box[1], 1e-6);
    // A lone seat is shown with its surroundings for context.
    const pad = region ? 1.25 : single ? 3 : 1.04;
    const k = Math.min(W / (bw * pad), H / (bh * pad), MAX_ZOOM);
    const cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2;
    return { k, transform: `translate(${W / 2 - k * cx}px, ${H / 2 - k * cy}px) scale(${k})` };
  }, [map, home, single, selectedState, viewH]);

  // What the 3D camera frames: the open state, or the whole contest.
  const focusBox = useMemo((): [number, number, number, number] | null => {
    if (!map || !home) return null;
    const region = !single && selectedState ? map.states[selectedState]?.bbox : null;
    return (region ?? home) as [number, number, number, number];
  }, [map, home, single, selectedState]);
  const seatList = useMemo(() => world.seats.map((s) => ({ id: s.id, state: s.state })), [world]);
  // With the poll open, each region carries a column of the parties' shares there.
  const pollOpen = useStore((s) => s.pollOpen);
  const polls = useStore((s) => s.game?.campaign.polls);
  const columns = useMemo(() => {
    const regions = pollOpen && use3d && map && polls ? latestNationalPoll(polls)?.regions : null;
    if (!regions || !map) return null;
    return (Object.keys(regions) as (keyof typeof regions)[]).flatMap((r) => {
      const box = [Infinity, Infinity, -Infinity, -Infinity];
      for (const seat of world.seats) {
        const b = seat.region === r ? map.seats[seat.id]?.bbox : null;
        if (b) { box[0] = Math.min(box[0], b[0]); box[1] = Math.min(box[1], b[1]); box[2] = Math.max(box[2], b[2]); box[3] = Math.max(box[3], b[3]); }
      }
      if (!Number.isFinite(box[0])) return [];
      const parts = regions[r].map((share, p) => ({ share, color: partyColor(p) })).filter((x) => x.share > 0.02).sort((a, b) => b.share - a.share);
      return [{ x: (box[0] + box[2]) / 2, z: (box[1] + box[3]) / 2, parts }];
    });
  }, [pollOpen, use3d, map, polls, world]);
  const backdropIds = useMemo(() => backdrop.map(([id]) => id), [backdrop]);

  /** A pointer's place in the map's own units, whatever size the map is drawn at. */
  const inMap = (p: { x: number; y: number }): [number, number] => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box || !map || box.width === 0) return [0, 0];
    const s = map.width / box.width;
    return [(p.x - box.left) * s, (p.y - box.top) * s];
  };
  const fingers = () => [...touches.current.values()];

  const startGrip = () => {
    const f = fingers();
    if (f.length === 0) { grip.current = null; return; }
    const a = f.length === 2 ? inMap({ x: (f[0].x + f[1].x) / 2, y: (f[0].y + f[1].y) / 2 }) : inMap(f[0]);
    grip.current = { start: view, a, spread: f.length === 2 ? Math.hypot(f[0].x - f[1].x, f[0].y - f[1].y) : 0 };
  };
  const onPointerDown = (e: PointerEvent) => {
    touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragged.current = false;
    startGrip();
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!touches.current.has(e.pointerId) || !grip.current || !map) return;
    touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const f = fingers(), g = grip.current;
    if (f.length >= 2) {
      const spread = Math.hypot(f[0].x - f[1].x, f[0].y - f[1].y);
      const mid = inMap({ x: (f[0].x + f[1].x) / 2, y: (f[0].y + f[1].y) / 2 });
      setView(holdPoint(g.start, g.a, mid, g.start.k * (g.spread > 0 ? spread / g.spread : 1), map.width, viewH));
      dragged.current = true;
    } else if (g.start.k > 1) {
      // One finger only moves a map that has been zoomed; on the whole map it leaves the page free to scroll.
      const to = inMap(f[0]);
      if (!dragged.current && Math.hypot(to[0] - g.a[0], to[1] - g.a[1]) < 4) return;
      setView(holdPoint(g.start, g.a, to, g.start.k, map.width, viewH));
      dragged.current = true;
      if (!svgRef.current?.hasPointerCapture(e.pointerId)) svgRef.current?.setPointerCapture(e.pointerId);
    }
  };
  const onPointerEnd = (e: PointerEvent) => {
    touches.current.delete(e.pointerId);
    startGrip();
    // The click that follows a drag must not pick a seat.
    if (touches.current.size === 0) setTimeout(() => { dragged.current = false; }, 0);
  };
  const onWheel = (e: WheelEvent) => {
    // A plain scroll stays the page's; holding Ctrl or Cmd (or pinching a trackpad) zooms the map.
    if (!map || !(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    setView((v) => zoomBy(v, e.deltaY < 0 ? 1.2 : 1 / 1.2, map.width, viewH));
  };
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });
  const zoomButton = (factor: number) => map && setView((v) => zoomBy(v, factor, map.width, viewH));

  const seatFromEvent = (e: MouseEvent) => (e.target as Element).getAttribute?.('data-seat') ?? null;

  const pick = (id: string) => {
    const seat = world.seats[world.seatIndex.get(id)!];
    // First click zooms to the region; a click inside the open region picks the seat.
    if (single) selectSeat(id, seat.state);
    else if (seat.state !== selectedState) selectState(seat.state);
    else selectSeat(id);
  };
  const onClick = (e: MouseEvent) => {
    const id = seatFromEvent(e);
    if (id) pick(id);
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
  // Where the parties have been working: tents for a seat worked hard lately, flags for one still being worked.
  const campaign = useStore((s) => s.game?.campaign);
  // What the player has ticked to be shown on the map, and what that puts on it.
  const layers = useStore((s) => s.settings.layers);
  const on = useMemo(() => new Set<LayerId>(layers), [layers]);
  const toggleLayer = (id: LayerId) => setSettings({ layers: on.has(id) ? layers.filter((x) => x !== id) : [...layers, id] });
  const last = useMemo(() => lastElection(world).seats.map((o) => ({ winner: o.winner })), [world]);
  const pins = useMemo(() => (single ? [] : layerPins({ world, campaign, display, last }, on)), [world, campaign, display, last, on, single]);
  const heat = useMemo(() => (on.has('machinery') ? machineryHeat(world, campaign) : null), [on, world, campaign]);
  const marks = useMemo(() => (campaign && on.has('campaign') ? campaignMarks(campaign) : []), [campaign, on]);
  const pinColor = (p: Pin) => p.color ?? partyColor(p.party ?? 0);
  const pins3d = useMemo(() => pins.map((p) => ({ seat: p.seat, kind: p.kind, color: p.color ?? partyColor(p.party ?? 0), slot: p.slot, of: p.of })), [pins]);
  const marker = !map || !props.marker ? null : single ? map.seats[world.seats[0].id]?.bbox : map.states[props.marker]?.bbox;

  return (
    <div className="panel map-panel">
      <div className="map-top">
        {/* where the map is looking: the whole contest, or one state of it */}
        {single ? <strong className="map-place">{contestName(t, world)}</strong> : (
          <select className="state-select" aria-label={t('map.place')} value={selectedState ?? ''} onChange={(e) => selectState((e.target.value || null) as RegionId | null)}>
            <option value="">{contestName(t, world)}</option>
            {world.states.map((st) => <option key={st} value={st}>{regionLabel(t, world, st)}</option>)}
          </select>
        )}
        {!single && <SeatSearch />}
        <button className="btn small map-share" onClick={shareMap}>{t('mapshare.button')}</button>
        {shared && createPortal(<MapShareDialog picture={shared.picture} caption={shared.caption} onClose={() => setShared(null)} />, document.body)}
        {/* everything else about the map is one press away, so that the map has the room */}
        <details className="map-options">
          <summary className="btn small"><Icon name="sliders" size={16} /> {t('map.options')}</summary>
          <div className="map-options-panel">
            {props.toolbar && <div className="map-option"><span className="hud-label">{t('view.label')}</span>{props.toolbar}</div>}
            <div className="map-option">
              <span className="hud-label">{t('map.view')}</span>
              <div className="segmented small" role="group" aria-label={t('map.view')}>
                {([false, true] as const).map((v) => (
                  <button key={String(v)} className={use3d === v ? 'active' : ''} aria-pressed={use3d === v} disabled={v && !canDraw3D()} onClick={() => setSettings({ map3d: v })}>
                    {t(v ? 'map.view.3d' : 'map.view.flat')}
                  </button>
                ))}
              </div>
            </div>
            {!canDraw3D() && <p className="muted small">{t('map.3d.unsupported')}</p>}
            {use3d && <p className="muted small">{t('map.3d.hint')}</p>}
            {!single && (
              <>
                <span className="hud-label">{t('layers.title')}</span>
                <div className="layer-list" role="group" aria-label={t('layers.title')}>
                  {LAYER_IDS.map((id) => {
                    const usable = layerUsable(id, world, campaign);
                    return (
                      <label key={id} className={usable ? 'layer-row' : 'layer-row off'}>
                        <input type="checkbox" checked={on.has(id)} disabled={!usable} onChange={() => toggleLayer(id)} />
                        <LayerKey id={id} me={campaign?.player ?? null} />
                        <span className="grow"><strong>{t(`layer.${id}`)}</strong><span className="muted small">{usable ? t(`layer.${id}.desc`) : t('layers.unavailable')}</span></span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
            <span className="hud-label">{t('map.legend')}</span>
          <div className="legend">
            {[...seen].sort((a, b) => a - b).map((p) => (
              <span key={p}><i className="dot" data-party={p} style={{ background: partyColor(p) }} />{partyShort(t, p)}</span>
            ))}
            <span className="legend-gap" />
            {(['safe', 'leaning', 'marginal'] as const).map((c) => (
              <span key={c}><i className="swatch" style={{ opacity: CLASS_OPACITY[c] }} /><Term id={c}>{t(`legend.${c}`)}</Term></span>
            ))}
            {anyStale && <span><i className="swatch" style={{ opacity: STALE_OPACITY }} />{t('legend.unpolled')}</span>}
            {marks.some((m) => m.kind === 'tent') && <span><svg className="mark-key" viewBox="-7 -7 14 14" aria-hidden="true"><path d="M-6 4.5L0 -5.5L6 4.5Z" /></svg>{t('legend.tent')}</span>}
            {marks.some((m) => m.kind === 'flag') && <span><svg className="mark-key" viewBox="-7 -7 14 14" aria-hidden="true"><path d="M-2.6 -5.5H-1.4V5.5H-2.6Z M-1.4 -5.5L5 -3L-1.4 -0.5Z" /></svg>{t('legend.flag')}</span>}
            {anyUndeclared && <span><i className="swatch undeclared" />{t('legend.undeclared')}</span>}
            {!single && <LayerLegend on={on} me={campaign?.player ?? null} />}
          </div>
          </div>
        </details>
      </div>

      <div className={`map-frame${spot('map') ? ' spot' : ''}`} ref={frame}>
        {!map && <p className="muted map-loading">{t('app.loadingMap')}</p>}
        {use3d && map && focusBox && home && (
          <Suspense fallback={<p className="muted map-loading">{t('map.3d.loading')}</p>}>
            <MapScene3D
              shapes={map.seats} seats={seatList} backdrop={backdropIds} home={home as [number, number, number, number]} focus={focusBox}
              display={display} selectedSeat={preview ?? selectedSeat} selectedState={single ? null : selectedState} accessible={accessible}
              marks={marks} pins={pins3d} heat={heat} pin={marker as [number, number, number, number] | null} pulse={props.pulse ? { id: props.pulse.id, n: props.pulse.n } : null}
              columns={columns} label={contestName(t, world)} single={single} partyColor={partyColor} onPick={pick}
              onHover={(id, x, y) => setHover(id ? { id, x, y } : null)}
            />
          </Suspense>
        )}
        {!use3d && map && zoom && (
          <svg
            ref={svgRef} viewBox={`0 0 ${map.width} ${viewH}`} role="img" aria-label={contestName(t, world)} onMouseLeave={() => setHover(null)}
            className={view.k > 1 ? 'zoomed' : undefined} style={{ touchAction: view.k > 1 ? 'none' : 'pan-y' }}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd}
            onClickCapture={(e) => { if (dragged.current) e.stopPropagation(); }}
          >
            <g transform={viewTransform(view, map.width, viewH)}>
            <g className="map-zoom" style={{ transform: zoom.transform }} onClick={onClick} onMouseMove={onMove}>
              {accessible && <PatternDefs />}
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
              {heat && world.seats.map((seat) => (heat[seat.id] && map.seats[seat.id]
                ? <path key={`heat-${seat.id}`} d={map.seats[seat.id].d} fill={MACHINERY_COLOR} fillOpacity={0.06 + 0.4 * heat[seat.id]} className="seat-heat" pointerEvents="none" />
                : null))}
              {accessible && world.seats.map((seat, i) => {
                const d = display[i];
                if (!d || d.winner < 0 || d.stale || !map.seats[seat.id]) return null;
                return <path key={`pat-${seat.id}`} d={map.seats[seat.id].d} fill={`url(#party-pat-${d.winner % PATTERNS.length})`} className="seat-pattern" pointerEvents="none" />;
              })}
              {Object.entries(map.states).map(([id, shape]) => (
                <path key={id} d={shape.d} className="state-outline" />
              ))}
              {props.pulse && map.seats[props.pulse.id] && <path key={props.pulse.n} d={map.seats[props.pulse.id].d} className={`seat-pulse ${props.pulse.kind}`} />}
              {selectedSeat && map.seats[selectedSeat] && <path d={map.seats[selectedSeat].d} className="seat-highlight" />}
              {preview && preview !== selectedSeat && map.seats[preview] && <path d={map.seats[preview].d} className="seat-highlight preview" />}
              {marks.map((m) => {
                const shape = map.seats[m.seat];
                // Seen from far off only the tents show, or the map would be nothing but flags.
                if (!shape || (m.kind === 'flag' && !single && zoom.k * view.k < 2)) return null;
                const [x0, y0, x1, y1] = shape.bbox;
                return (
                  <g key={`${m.seat}:${m.party}`} className="map-mark" transform={`translate(${(x0 + x1) / 2} ${(y0 + y1) / 2}) scale(${MARK_SIZE / (zoom.k * view.k)})`}>
                    <g transform={`translate(${(m.slot - (m.of - 1) / 2) * 11} ${single ? -16 : 0})`} fill={partyColor(m.party)}>
                      {m.kind === 'tent'
                        ? <path d="M-6 4.5L0 -5.5L6 4.5Z M-1.4 4.5L0 1.2L1.4 4.5Z" fillRule="evenodd" />
                        : <><path d="M-2.6 -5.5H-1.4V5.5H-2.6Z" className="mark-pole" /><path d="M-1.4 -5.5L5 -3L-1.4 -0.5Z" /></>}
                    </g>
                  </g>
                );
              })}
              {pins.map((p) => {
                const shape = map.seats[p.seat];
                if (!shape) return null;
                const [x0, y0, x1, y1] = shape.bbox;
                return (
                  <g key={`${p.layer}:${p.seat}:${p.kind}`} className="map-pin" transform={`translate(${(x0 + x1) / 2} ${(y0 + y1) / 2}) scale(${PIN_SIZE / (zoom.k * view.k)})`}>
                    <g transform={`translate(${(p.slot - (p.of - 1) / 2) * 11} ${single ? 12 : 8})`}><PinGlyph kind={p.kind} color={pinColor(p)} /></g>
                  </g>
                );
              })}
              {marker && (
                <g className="leader-pin" transform={`translate(${(marker[0] + marker[2]) / 2} ${(marker[1] + marker[3]) / 2}) scale(${1 / (zoom.k * view.k)})`}>
                  <circle r="9" className="pin-halo" />
                  <circle r="4.5" className="pin-dot" />
                </g>
              )}
            </g>
            </g>
          </svg>
        )}
        {!use3d && map && zoom && (
          <div className="map-zoom-buttons" role="group" aria-label={t('map.zoom')}>
            <button className="btn small" onClick={() => zoomButton(1.6)} aria-label={t('map.zoomIn')} disabled={view.k >= 10}>+</button>
            <button className="btn small" onClick={() => zoomButton(1 / 1.6)} aria-label={t('map.zoomOut')} disabled={view.k <= 1}>−</button>
            {view.k > 1 && <button className="btn small" onClick={() => setView(FIT)} aria-label={t('map.zoomFit')}>⤢</button>}
          </div>
        )}
        {hover && hovered && hoveredSeat && (
          <div className="tooltip" style={{ left: hover.x, top: hover.y }}>
            <strong>{hoveredSeat.name}</strong>
            <span className="muted">{hoveredSeat.id} · {regionLabel(t, world, hoveredSeat.state)}</span>
            {hovered.winner >= 0 ? (
              <span>
                <i className="dot" data-party={hovered.winner} style={{ background: partyColor(hovered.winner) }} />
                {partyShort(t, hovered.winner)} · {t('map.margin', { pct: f.pct(hovered.margin) })}
              </span>
            ) : <span className="muted">{t('legend.undeclared')}</span>}
            {hovered.stale && <span className="muted">{t('map.fog')}</span>}
          </div>
        )}
      </div>
      {!single && layers.some((id) => id !== 'campaign') && (
        <div className="layer-chips" role="group" aria-label={t('layers.on')}>
          {layers.filter((id) => id !== 'campaign').map((id) => (
            <button key={id} className="chip" onClick={() => toggleLayer(id)} aria-label={t('layers.off', { name: t(`layer.${id}`) })}>
              <LayerKey id={id} me={campaign?.player ?? null} size={13} /> {t(`layer.${id}`)} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
