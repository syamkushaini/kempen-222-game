import { EVENTS } from './events';
import type { Scene } from './types';

/**
 * The choice a careful player would make for a scene on the desk, for the tests that play whole careers: the one that earns the most
 * credibility, unity, trust and stability (and costs the least of them), and never one that ends the career or brings the government
 * down. A scene that is not an event is answered with the choice it has been answered with before, the third.
 */
export function soundest(scene: Scene, otherwise = 2): number {
  const def = scene.kind === 'event' && scene.event ? EVENTS[scene.event] : undefined;
  if (!def) return otherwise;
  const worth = (i: number): number => {
    const ch = def.choices[i];
    const all = [...ch.effects, ...(ch.gamble ? [...ch.gamble.win, ...ch.gamble.lose.map((e) => ({ ...e, n: 0 }))] : [])];
    if (all.some((e) => e.t === 'end' || e.t === 'falls')) return -1000;
    return all.reduce((a, e) => a + (['cred', 'unity', 'trust', 'stability'].includes(e.t) ? (e as { n: number }).n : 0), 0);
  };
  return def.choices.reduce((best, _, i) => (worth(i) > worth(best) ? i : best), 0);
}
