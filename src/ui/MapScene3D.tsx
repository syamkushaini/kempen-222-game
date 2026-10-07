import { useEffect, useMemo, useRef } from 'react';
import type { Mark } from '../sim/campaign/marks';
import { useStore } from '../state/store';
import { useT } from './hooks';
import { offerPicture } from './map3d';
import { MapScene3D as Scene, type ColumnSpec, type MapShape, type PinSpec, type SceneSeat, type SeatLook } from './scene3d';

type Box = [number, number, number, number];

export interface MapScene3DProps {
  shapes: Record<string, MapShape>;
  seats: SceneSeat[];
  backdrop: string[];
  home: Box;
  focus: Box;
  display: SeatLook[];
  selectedSeat: string | null;
  selectedState: string | null;
  accessible: boolean;
  marks: Mark[];
  /** The marks the ticked map layers put on seats, and the tint the player's branches give them. */
  pins: PinSpec[];
  heat: Record<string, number> | null;
  pin: Box | null;
  pulse: { id: string; n: number } | null;
  /** Support by region as columns standing on the map, while the poll is open. */
  columns: ColumnSpec[] | null;
  label: string;
  single: boolean;
  partyColor: (party: number) => string;
  onPick(id: string): void;
  onHover(id: string | null, x: number, y: number): void;
}

/** The 3D map: a canvas that draws what the game's own state says, and hands taps and hovers back to it. Fetched only when 3D is on. */
export default function MapScene3DView(props: MapScene3DProps) {
  const t = useT();
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<Scene | null>(null);
  const calm = useMemo(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const theme = useStore((s) => s.settings.theme);
  // Taps and hovers go to whoever is current, without rebuilding the scene.
  const latest = useRef(props);
  latest.current = props;

  // The scene is built again only for a different contest or map: everything else is told to it as it changes.
  const seatsKey = props.seats.map((s) => s.id).join();
  useEffect(() => {
    if (!host.current) return;
    const p = latest.current;
    const size = Math.max(p.focus[2] - p.focus[0], p.focus[3] - p.focus[1], 1e-6);
    const s = new Scene(host.current, {
      seats: p.seats, shapes: p.shapes, backdrop: p.backdrop, size, home: p.home, calm, lift: p.single ? 4 : 1,
      partyColor: (party) => latest.current.partyColor(party),
      onPick: (id) => latest.current.onPick(id),
      onHover: (id, x, y) => latest.current.onHover(id, x, y),
    });
    scene.current = s;
    s.setAccessible(p.accessible);
    s.setFocus(p.focus);
    s.setSelection(p.selectedSeat, p.selectedState);
    s.setDisplay(p.display);
    s.setMarks(p.marks, p.pin);
    s.setPins(p.pins);
    s.setHeat(p.heat);
    if (p.columns) s.setColumns(p.columns);
    const withdraw = offerPicture(() => s.snapshot());
    return () => { withdraw(); s.dispose(); scene.current = null; };
  }, [props.shapes, seatsKey, calm, props.single]);

  useEffect(() => { scene.current?.setAccessible(props.accessible); }, [props.accessible]);
  useEffect(() => { scene.current?.setFocus(props.focus); }, [props.focus]);
  useEffect(() => { scene.current?.setSelection(props.selectedSeat, props.selectedState); }, [props.selectedSeat, props.selectedState, theme]);
  useEffect(() => { scene.current?.setDisplay(props.display); }, [props.display]);
  useEffect(() => { scene.current?.setMarks(props.marks, props.pin); }, [props.marks, props.pin]);
  useEffect(() => { scene.current?.setPins(props.pins); }, [props.pins]);
  useEffect(() => { scene.current?.setHeat(props.heat); }, [props.heat]);
  useEffect(() => { scene.current?.setColumns(props.columns); }, [props.columns]);
  useEffect(() => { if (props.pulse) scene.current?.pulse(props.pulse.id); }, [props.pulse?.n]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div ref={host} className="map3d" role="img" aria-label={props.label} />
      <div className="map-zoom-buttons" role="group" aria-label={t('map.zoom')}>
        <button className="btn small" onClick={() => scene.current?.zoomBy(1.6)} aria-label={t('map.zoomIn')}>+</button>
        <button className="btn small" onClick={() => scene.current?.zoomBy(1 / 1.6)} aria-label={t('map.zoomOut')}>−</button>
        <button className="btn small" onClick={() => scene.current?.reset()} aria-label={t('map.zoomFit')}>⤢</button>
      </div>
    </>
  );
}
