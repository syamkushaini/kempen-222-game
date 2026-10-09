import { useId, type ReactNode } from 'react';
import { Backdrop, Foreground } from './backdrop';
import { chiefs, crowd, leader, pair, person, police, reporter, rider, ruler, student, worker, asker, type Drawing, type Tone } from './people';
import * as places from './places';
import * as props from './props';

// The pictures that go with a decision: flat scenes drawn from a small set of parts, so that every kind of thing that
// can happen has an image of what is going on. A scene is written as text, a sky and a ground and then what stands in it:
//   "storm|water: kampung@20, kampung@60*0.8, person@42, rain@50"
// where each part is `name@position` (0 to 100 across the picture) and may carry `*scale` (1 is life size).

export const W = 800, H = 450, GROUND = 312, FEET = 384;

export const SKIES = {
  day: ['#a9c7d4', '#efe6cd'], dusk: ['#9a8aa8', '#e8b98a'], night: ['#4a5878', '#8c8fa0'],
  storm: ['#7d8794', '#c3c2b4'], haze: ['#b9a98a', '#e6d7b0'], room: ['#cdbb98', '#cdbb98'], bright: ['#cfe0e6', '#f1ead6'],
} as const;
export const GROUNDS = {
  grass: '#8aa073', road: '#6c6a64', water: '#6f9bae', floor: '#9b8366', sand: '#d5c08f', none: 'transparent', tile: '#a8a496',
} as const;
export type Sky = keyof typeof SKIES;
export type Ground = keyof typeof GROUNDS;

export const PARTS: Record<string, Drawing> = {
  person, leader, pair, crowd, chiefs, police, worker, student, reporter, asker, rider, ruler,
  ...places, ...props,
  brokenBridge: places.brokenBridge,
};

export interface Item { part: string; x: number; s: number }

/** People are drawn larger than life size relative to a building so that they read at a glance; the wide parts are not scaled. */
const PEOPLE = new Set(['person', 'leader', 'pair', 'crowd', 'chiefs', 'police', 'worker', 'student', 'reporter', 'asker', 'rider', 'ruler']);
const WIDE = new Set(['rain', 'waves', 'road', 'rails', 'hills', 'haze', 'sludge', 'wallroom', 'cloud', 'sun', 'moon', 'bunting', 'lightning']);
const SIZE = (part: string) => (part === 'rider' ? 1.3 : PEOPLE.has(part) ? 1.62 : WIDE.has(part) ? 1 : 1.4);
export interface Recipe { sky: Sky; ground: Ground; items: Item[] }

const DEFAULT_GROUND: Record<Sky, Ground> = { day: 'grass', dusk: 'grass', night: 'grass', storm: 'grass', haze: 'sand', room: 'floor', bright: 'tile' };

/** Reads a scene written as text. Anything it does not know is left out and reported by `unknown`. */
export function parse(text: string): Recipe {
  const [head, rest = ''] = text.split(':');
  const [sky, ground] = head.trim().split('|') as [Sky, Ground | undefined];
  const items = rest.split(',').map((x) => x.trim()).filter(Boolean).map((raw): Item => {
    const [part, at = '50'] = raw.split('@');
    const [x, s = '1'] = at.split('*');
    return { part: part.trim(), x: Number(x), s: Number(s) * SIZE(part.trim()) };
  });
  return { sky, ground: ground ?? DEFAULT_GROUND[sky] ?? 'grass', items };
}

/** The parts of a scene written as text that this kit cannot draw, for the tests. */
export const unknown = (r: Recipe): string[] => r.items.filter((i) => !PARTS[i.part] || !Number.isFinite(i.x) || !Number.isFinite(i.s)).map((i) => i.part);

/** Parts that are weather, water or wash, not objects: they are not outlined in ink and cast no shadow. */
const SOFT = new Set(['rain', 'waves', 'haze', 'cloud', 'sun', 'moon', 'smoke', 'sludge', 'hills', 'lightning', 'bunting', 'fire']);
/** About how wide each kind of part stands on the ground, for the shadow it casts. */
const SHADOW = (part: string): number => (PEOPLE.has(part) ? (part === 'crowd' ? 96 : part === 'chiefs' || part === 'pair' ? 66 : 22) : 34);

const TENSE = new Set(['alarm', 'warning', 'chartDown', 'lock', 'fire', 'smoke', 'barrier', 'sludge', 'lightning', 'rain', 'brokenBridge', 'question', 'police']);
const GLAD = new Set(['trophy', 'handshake', 'chartUp', 'ribbon', 'bunting', 'cash', 'durian', 'ball', 'goal', 'sun']);
const BIG = new Set(['palace', 'parliament', 'court', 'hotel', 'shophouses', 'stage', 'longhouse', 'port', 'factory', 'school', 'hospital', 'kampung', 'market', 'bridge', 'brokenBridge', 'train', 'ship', 'squatters', 'goal']);
const TOWN = new Set(['tower', 'hotel', 'shophouses', 'car', 'truck', 'road', 'crane', 'court', 'parliament', 'hospital', 'factory', 'port']);

/** The temper of a scene, from what is in it: trouble, celebration, or neither. Its people's faces follow it. */
export function toneOf(r: Recipe): Tone {
  let tense = r.sky === 'storm' ? 1 : 0, glad = 0;
  for (const i of r.items) { if (TENSE.has(i.part)) tense++; if (GLAD.has(i.part)) glad++; }
  return tense > 0 && tense >= glad ? 'tense' : glad > 0 ? 'glad' : 'plain';
}

/**
 * People standing further back, looking on, where a scene has few people of its own: they give it life and depth. They keep
 * clear of what the scene itself has placed, and there are none on water.
 */
function onlookers(r: Recipe, seed: number): { x: number; s: number }[] {
  if (r.ground === 'water' || r.items.filter((i) => PEOPLE.has(i.part)).length > 2) return [];
  // A building takes more room than a person or a thing does.
  const taken = r.items.filter((i) => !WIDE.has(i.part)).map((i) => ({ x: i.x, room: BIG.has(i.part) ? 21 : PEOPLE.has(i.part) ? 10 : 13 }));
  const out: { x: number; s: number }[] = [];
  for (let k = 0; k < 9 && out.length < 3; k++) {
    const x = 8 + ((seed * 37 + k * 23) % 85);
    if (taken.some((t) => Math.abs(t.x - x) < t.room) || out.some((o) => Math.abs(o.x / W * 100 - x) < 8)) continue;
    out.push({ x: (x / 100) * W, s: 1.0 + ((seed + k) % 3) * 0.06 });
  }
  return out;
}

/** Where a part stands across the picture: where it was asked to, but a group of people is kept from running off the edge. */
const place = (item: Item): number => {
  const x = (item.x / 100) * W;
  if (!PEOPLE.has(item.part)) return x;
  const half = SHADOW(item.part) * item.s + 26;
  return Math.max(half, Math.min(W - half, x));
};

/** How far back a part stands, from how small it was asked to be: smaller is further, and so higher up the picture. */
const depth = (item: Item): number => (WIDE.has(item.part) ? 0 : Math.max(-38, Math.min(14, (1 - item.s / SIZE(item.part)) * -56)));

/**
 * One scene as an SVG, drawn as an editorial cartoon on cream paper: charcoal outlines that wobble and vary in weight, flat
 * washes laid over them like watercolour, cross-hatching and stippling where the tone is dark, and a deckled edge. `seed`
 * varies who is wearing what, so that two scenes with the same parts are not twins.
 */
export function Scene({ recipe, seed = 0, label }: { recipe: Recipe; seed?: number; label?: string }): ReactNode {
  const uid = `k${useId().replace(/:/g, '')}`;
  const [top, bottom] = SKIES[recipe.sky];
  const u = (name: string) => `url(#${uid}${name})`;
  const tone = toneOf(recipe);
  const names = new Set(recipe.items.map((i) => i.part));
  const town = [...names].some((n) => TOWN.has(n));
  // How many of the scene's first parts are its walls, hills and weather: what everything else stands in front of.
  const lead = recipe.items.findIndex((i) => !WIDE.has(i.part)) < 0 ? recipe.items.length : recipe.items.findIndex((i) => !WIDE.has(i.part));
  const watchers = onlookers(recipe, seed).map((o, k) => (
    <g key={`o${k}`} transform={`translate(${o.x} ${FEET - 30}) scale(${o.s})`} className="part" opacity="0.92">
      <ellipse className="soft" cx="5" cy="2" rx="20" ry="5" fill={u('hatch')} />
      {person({ i: seed * 3 + k * 7 + 5, uid, tone })}
    </g>
  ));
  return (
    <svg className="scene-svg ink" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" role={label ? 'img' : 'presentation'} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id={`${uid}sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient>
        <radialGradient id={`${uid}vig`} cx="0.5" cy="0.46" r="0.75"><stop offset="0.55" stopColor="#5a4630" stopOpacity="0" /><stop offset="1" stopColor="#5a4630" stopOpacity="0.42" /></radialGradient>
        <pattern id={`${uid}hatch`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(48)"><path d="M0 0 V7" stroke="#2a2623" strokeWidth="0.9" /></pattern>
        <pattern id={`${uid}cross`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-42)"><path d="M0 0 V6" stroke="#2a2623" strokeWidth="0.9" /></pattern>
        <pattern id={`${uid}stipple`} width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2.5" r="0.8" fill="#2a2623" /><circle cx="6.5" cy="5.5" r="0.7" fill="#2a2623" /><circle cx="4" cy="8" r="0.6" fill="#2a2623" /></pattern>
        <pattern id={`${uid}batik`} width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#8a5a3a" /><path d="M7 1 q4 3 0 6 q-4 -3 0 -6z M0 8 q4 3 0 6 M14 8 q-4 3 0 6" fill="#d8b36a" /><circle cx="7" cy="10.5" r="1.4" fill="#2a2623" fillOpacity="0.7" /></pattern>
        <filter id={`${uid}wob`} x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="2" seed="3" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d" /><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="1" seed="8" result="m" /><feDisplacementMap in="d" in2="m" scale="1.6" xChannelSelector="G" yChannelSelector="R" /></filter>
        <filter id={`${uid}grade`} colorInterpolationFilters="sRGB"><feColorMatrix type="saturate" values="0.78" /></filter>
        <filter id={`${uid}deckle`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="11" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="22" xChannelSelector="R" yChannelSelector="G" /></filter>
        <filter id={`${uid}grain`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="5" /><feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.17  0 0 0 0.55 -0.12" /></filter>
        <filter id={`${uid}bloom`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" seed="2" /><feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.42  0 0 0 0 0.26  0 0 0 1.1 -0.38" /></filter>
        {/* where the picture is dark, in three depths: the masks that let hatching, cross-hatching and stippling through */}
        <filter id={`${uid}d1`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -2 -2 -2 0 3.15" /></filter>
        <filter id={`${uid}d2`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -2.6 -2.6 -2.6 0 2.15" /></filter>
        <filter id={`${uid}d3`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -1.8 -1.8 -1.8 0 3.9" /></filter>
        <mask id={`${uid}paper`}><rect x="14" y="12" width={W - 28} height={H - 24} fill="#fff" filter={u('deckle')} /></mask>
        <mask id={`${uid}m1`}><g filter={u('d1')}><use href={`#${uid}art`} /></g></mask>
        <mask id={`${uid}m2`}><g filter={u('d2')}><use href={`#${uid}art`} /></g></mask>
        <mask id={`${uid}m3`}><g filter={u('d3')}><use href={`#${uid}art`} /></g></mask>
      </defs>
      <rect width={W} height={H} fill="#f1e6c8" />
      <rect width={W} height={H} filter={u('grain')} opacity="0.5" />
      <g mask={u('paper')}>
        <g filter={u('grade')}>
          <g id={`${uid}art`} filter={u('wob')}>
            <rect className="wash" width={W} height={H} fill={u('sky')} />
            {recipe.ground !== 'none' && <rect className="wash" y={GROUND} width={W} height={H - GROUND} fill={GROUNDS[recipe.ground]} />}
            {recipe.ground === 'road' && <rect className="wash" y={GROUND} width={W} height="8" fill="#2a2623" fillOpacity="0.35" />}
            <Backdrop sky={recipe.sky} ground={recipe.ground} town={town} hasHills={names.has('hills')} horizon={GROUND} feet={FEET} seed={seed} />
            {recipe.items.map((item, k) => {
              const Part = PARTS[item.part];
              if (!Part) return null;
              const soft = SOFT.has(item.part);
              return [
                // The lookers-on stand behind the scene's own people, but in front of its walls and its far hills.
                k === lead && watchers,
                <g key={k} transform={`translate(${place(item)} ${FEET + depth(item)}) scale(${item.s})`} className={soft ? 'part soft' : 'part'}>
                  {!soft && !WIDE.has(item.part) && <ellipse className="soft" cx="6" cy="2" rx={SHADOW(item.part)} ry="5.5" fill={u('hatch')} />}
                  {Part({ i: seed + k, uid, tone })}
                </g>,
              ];
            })}
            {lead >= recipe.items.length && watchers}
            <Foreground sky={recipe.sky} ground={recipe.ground} seed={seed} />
          </g>
          <rect className="soft" width={W} height={H} fill={u('hatch')} mask={u('m1')} />
          <rect className="soft" width={W} height={H} fill={u('cross')} mask={u('m2')} />
          <rect className="soft" width={W} height={H} fill={u('stipple')} mask={u('m3')} opacity="0.75" />
          <rect className="soft" width={W} height={H} filter={u('bloom')} opacity="0.35" style={{ mixBlendMode: 'multiply' }} />
          <rect className="soft" width={W} height={H} fill={u('vig')} style={{ mixBlendMode: 'multiply' }} />
        </g>
      </g>
    </svg>
  );
}
