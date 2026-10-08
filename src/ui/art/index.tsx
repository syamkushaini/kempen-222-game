import { useEffect, useMemo, useState } from 'react';
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

/** What a decision's picture is called, in the folder of pictures an image model has drawn (see scripts/make-art.mjs). */
export const pictureId = (kind: string, event?: string): string => (kind === 'event' && event ? event : `kind-${kind}`);

const BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
let manifest: Promise<Record<string, string>> | null = null;
/** Which decisions have a drawn picture, from the manifest next to them. None if there is no manifest (the usual case). */
export function drawnPictures(): Promise<Record<string, string>> {
  manifest ??= fetch(`${BASE}scenes/manifest.json`)
    .then((r) => (r.ok ? r.json() : {}))
    .then((m) => (m && typeof m === 'object' && !Array.isArray(m) ? (m as Record<string, string>) : {}))
    .catch(() => ({}));
  return manifest;
}

/**
 * What is going on in a decision, drawn. The sketch the game draws itself is always there; where an image model has drawn a
 * picture of the decision, that fades in over it. Nothing for a kind of decision that has no picture.
 */
export function ScenePicture({ kind, event, seed }: { kind: string; event?: string; seed: number }) {
  const recipe = useMemo(() => artFor(kind, event), [kind, event]);
  const id = pictureId(kind, event);
  const [file, setFile] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let on = true;
    setShown(false);
    drawnPictures().then((m) => { if (on) setFile(typeof m[id] === 'string' && /^[\w.-]+$/.test(m[id]) ? m[id] : null); });
    return () => { on = false; };
  }, [id]);
  if (!recipe) return null;
  return (
    <figure className="scene-art" aria-hidden="true">
      <Scene recipe={recipe} seed={seed} />
      {file && <img className={`scene-photo${shown ? ' shown' : ''}`} src={`${BASE}scenes/${file}`} alt="" decoding="async" onLoad={() => setShown(true)} onError={() => setFile(null)} />}
    </figure>
  );
}
