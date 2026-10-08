import { useMemo } from 'react';
import { parse, Scene, type Recipe } from './kit';
import { EVENT_ART, SCENE_ART } from './recipes';

const cache = new Map<string, Recipe>();
const read = (text: string): Recipe => {
  let r = cache.get(text);
  if (!r) { r = parse(text); cache.set(text, r); }
  return r;
};

/** The picture for a decision: an event has its own, and every other kind of decision has one of its own kind. */
export function artFor(kind: string, event?: string): Recipe | null {
  const text = (kind === 'event' && event ? EVENT_ART[event] : undefined) ?? SCENE_ART[kind];
  return text ? read(text) : null;
}

/** What is going on in a decision, drawn. Nothing for a kind of decision that has no picture. */
export function ScenePicture({ kind, event, seed }: { kind: string; event?: string; seed: number }) {
  const recipe = useMemo(() => artFor(kind, event), [kind, event]);
  if (!recipe) return null;
  return <figure className="scene-art" aria-hidden="true"><Scene recipe={recipe} seed={seed} /></figure>;
}
