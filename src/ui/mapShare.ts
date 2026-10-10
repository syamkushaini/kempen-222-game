import { stateNeeded } from '../data/world';
import { holderOf } from '../sim/campaign/contests';
import type { Campaign } from '../sim/campaign/types';
import { majorityLine, type World } from '../sim/election';
import type { StringKey } from '../i18n/strings';
import { contestName, partyColor, partyName, type Format, type T } from './hooks';

// The map the player is looking at, as a picture and nothing else: every seat the party holds in the party's colour, the rest left
// plain. No figures, no words.

const WIDTH = 1600;
const MARGIN = 0.05;
const PAPER = '#f5f3ec';
const NEUTRAL = '#d7d2c4';

interface Shape { d: string }
interface MapData { width: number; height: number; seats: Record<string, Shape> }

/** The map of the contest: the state's own for a state, otherwise the country's. As MapView loads it. */
async function loadShapes(world: World): Promise<MapData> {
  const state = stateNeeded(world.id);
  const m = state ? await import(`../data/generated/map-dun-${state}.json`) : await import('../data/generated/map.json');
  return m.default as unknown as MapData;
}

/** The map as a PNG address: the party's seats in its colour on paper, shaped to the map and nothing more. Null if it cannot be drawn here. */
export async function controlPicture(world: World, c: Campaign): Promise<string | null> {
  const map = await loadShapes(world);
  const colour = partyColor(c.player);
  const paths = world.seats.map((seat) => {
    const shape = map.seats[seat.id];
    if (!shape) return '';
    const mine = holderOf(world, c, seat.id) === c.player;
    return `<path d="${shape.d}" fill="${mine ? colour : NEUTRAL}" stroke="${PAPER}" stroke-width="0.4" />`;
  }).join('');
  const pad = map.width * MARGIN;
  const w = map.width + pad * 2, h = map.height + pad * 2;
  const height = Math.round((WIDTH * h) / w);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${PAPER}"/><g transform="translate(${pad} ${pad})">${paths}</g></svg>`;
  return rasterise(svg, WIDTH, height);
}

/** The SVG as a PNG address, so that it can be saved and shared. */
function rasterise(svg: string, width: number, height: number): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

/** How many seats the party holds now. */
export function seatsHeld(world: World, c: Campaign): number {
  return world.seats.filter((s) => holderOf(world, c, s.id) === c.player).length;
}

/** The words that go with the picture, for whoever wants to say how many seats there are: the party, the seats, how far from a majority. */
export function mapCaption(t: T, f: Format, world: World, c: Campaign): string {
  const held = seatsHeld(world, c);
  const majority = majorityLine(world);
  const note = held >= majority ? t('mapshare.majority' as StringKey) : t('mapshare.short' as StringKey, { n: f.int(majority - held) });
  return `${t('mapshare.caption' as StringKey, { party: partyName(t, c.player), n: f.int(held), total: f.int(world.seats.length), contest: contestName(t, world) })} ${note} ${t('mapshare.tag' as StringKey)}`;
}
