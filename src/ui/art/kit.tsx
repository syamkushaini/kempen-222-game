import { useId, type ReactNode } from 'react';
import { chiefs, crowd, leader, pair, person, police, reporter, rider, ruler, student, worker, asker, type Drawing } from './people';
import * as places from './places';
import * as props from './props';

// The pictures that go with a decision: flat scenes drawn from a small set of parts, so that every kind of thing that
// can happen has an image of what is going on. A scene is written as text, a sky and a ground and then what stands in it:
//   "storm|water: kampung@20, kampung@60*0.8, person@42, rain@50"
// where each part is `name@position` (0 to 100 across the picture) and may carry `*scale` (1 is life size).

export const W = 800, H = 360, GROUND = 270, FEET = 296;

export const SKIES = {
  day: ['#7fc4ee', '#e6f6ff'], dusk: ['#5b4b9a', '#ffb27a'], night: ['#0f1b3d', '#33498a'],
  storm: ['#3d4757', '#8795a8'], haze: ['#a99877', '#e6d8b8'], room: ['#26324a', '#3b4a68'], bright: ['#9ad0f0', '#f4fbff'],
} as const;
export const GROUNDS = {
  grass: '#6fb36f', road: '#5b606a', water: '#3b7ea1', floor: '#7b6451', sand: '#d9c28f', none: 'transparent', tile: '#8a8f9a',
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
const SIZE = (part: string) => (PEOPLE.has(part) ? 1.4 : WIDE.has(part) ? 1 : 1.15);
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

/** One scene as an SVG. `seed` varies who is wearing what, so that two scenes with the same parts are not twins. */
export function Scene({ recipe, seed = 0, label }: { recipe: Recipe; seed?: number; label?: string }): ReactNode {
  const [top, bottom] = SKIES[recipe.sky];
  const id = `sky${useId().replace(/:/g, '')}`;
  return (
    <svg className="scene-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" role={label ? 'img' : 'presentation'} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient></defs>
      <rect width={W} height={H} fill={`url(#${id})`} />
      {recipe.ground !== 'none' && <rect y={GROUND} width={W} height={H - GROUND} fill={GROUNDS[recipe.ground]} />}
      {recipe.ground === 'road' && <rect y={GROUND} width={W} height="6" fill="#00000026" />}
      {recipe.ground === 'grass' && <rect y={GROUND} width={W} height="8" fill="#ffffff22" />}
      {recipe.items.map((item, k) => {
        const Part = PARTS[item.part];
        return Part ? <g key={k} transform={`translate(${(item.x / 100) * W} ${FEET}) scale(${item.s})`}>{Part({ i: seed + k })}</g> : null;
      })}
    </svg>
  );
}
