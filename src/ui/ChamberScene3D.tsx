import { useEffect, useMemo, useRef } from 'react';
import type { ChamberView } from './Chamber';
import { Chamber3D } from './chamber3d';

/** The 3D chamber: a canvas that draws the seating it is given. Fetched only where 3D is on. */
export default function ChamberScene3D(props: ChamberView & { partyColor: (party: number) => string }) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<Chamber3D | null>(null);
  const calm = useMemo(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const latest = useRef(props);
  latest.current = props;

  useEffect(() => {
    if (!host.current) return;
    const s = new Chamber3D(host.current, {
      calm, partyColor: (p) => latest.current.partyColor(p), onHot: (p) => latest.current.onHot(p),
    });
    scene.current = s;
    s.set(latest.current.places, latest.current.members, latest.current.line);
    return () => { s.dispose(); scene.current = null; };
  }, [calm]);

  useEffect(() => { scene.current?.set(props.places, props.members, props.line); }, [props.places, props.members, props.line]);
  useEffect(() => { scene.current?.setHot(props.hot); }, [props.hot]);

  return <div ref={host} className="chamber3d" role="img" aria-label={props.label} />;
}
