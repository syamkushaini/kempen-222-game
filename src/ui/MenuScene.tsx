import { useEffect, useRef, useState } from 'react';
import { world } from '../data/world';
import { lastElection } from '../sim/election';
import { partyColor } from './hooks';
import { MapScene3D, type MapShape } from './scene3d';

type Box = [number, number, number, number];

/**
 * What stands behind the main menu: the country in 3D, in the colours of the last election, turning slowly from side to
 * side. It is a picture, not a control: nothing in it can be pressed. Fetched after the menu is on screen, and faded in.
 */
export default function MenuScene() {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let scene: MapScene3D | null = null, alive = true;
    void import('../data/generated/map.json').then((m) => {
      if (!alive || !host.current) return;
      const map = m.default as unknown as { seats: Record<string, MapShape> };
      const box = [Infinity, Infinity, -Infinity, -Infinity] as Box;
      for (const seat of world.seats) {
        const b = map.seats[seat.id]?.bbox;
        if (!b) continue;
        box[0] = Math.min(box[0], b[0]); box[1] = Math.min(box[1], b[1]); box[2] = Math.max(box[2], b[2]); box[3] = Math.max(box[3], b[3]);
      }
      scene = new MapScene3D(host.current, {
        seats: world.seats.map((s) => ({ id: s.id, state: s.state })), shapes: map.seats, backdrop: [],
        size: Math.max(box[2] - box[0], box[3] - box[1]), home: box, lift: 1.6, calm: false, partyColor,
        onPick: () => {}, onHover: () => {},
      });
      scene.setFocus(box);
      scene.setDisplay(lastElection(world).seats.map((o) => ({ winner: o.winner, margin: o.margin, stale: false })));
      scene.sway();
      setReady(true);
    });
    return () => { alive = false; scene?.dispose(); };
  }, []);

  return <div ref={host} className={ready ? 'menu-scene ready' : 'menu-scene'} aria-hidden="true" />;
}
