import type { CardData } from './shareCard';
import { stateNeeded } from '../data/world';
import { holderOf } from '../sim/campaign/contests';
import type { Campaign } from '../sim/campaign/types';
import { majorityLine, type World } from '../sim/election';
import type { StringKey } from '../i18n/strings';
import { leaderPortrait } from './faces';
import { paintedLeader } from './painted';
import { contestName, leaderName, partyColor, partyName, type Format, type T } from './hooks';

// The map the player is looking at, as a card: every seat the party holds in the party's colour, the rest left plain.

const WIDTH = 1200, HEIGHT = 630;
// The seats the party holds are bright on the card's own colour; the rest are a faint shadow of the map.

interface Shape { d: string }
interface MapData { width: number; height: number; seats: Record<string, Shape> }

/** The map of the contest: the state's own for a state, otherwise the country's. As MapView loads it. */
async function loadShapes(world: World): Promise<MapData> {
  const state = stateNeeded(world.id);
  const m = state ? await import(`../data/generated/map-dun-${state}.json`) : await import('../data/generated/map.json');
  return m.default as unknown as MapData;
}

/** A picture of the seats the party holds, drawn from the map's own outlines. Null if the map cannot be drawn here. */
export async function controlPicture(world: World, c: Campaign): Promise<string | null> {
  const map = await loadShapes(world);
  const me = c.player;
  const paths = world.seats.map((seat) => {
    const shape = map.seats[seat.id];
    if (!shape) return '';
    const mine = holderOf(world, c, seat.id) === me;
    return mine
      ? `<path d="${shape.d}" fill="#ffffff" stroke="#ffffff" stroke-width="0.4" />`
      : `<path d="${shape.d}" fill="#1b1b1b" fill-opacity="0.22" stroke="#ffffff" stroke-opacity="0.35" stroke-width="0.3" />`;
  }).join('');
  const scale = Math.min(WIDTH / map.width, HEIGHT / map.height);
  const x = (WIDTH - map.width * scale) / 2, y = (HEIGHT - map.height * scale) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}"><g transform="translate(${x} ${y}) scale(${scale})">${paths}</g></svg>`;
  return rasterise(svg);
}

/** The SVG as a PNG address, so that the card can draw it. */
function rasterise(svg: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = WIDTH; canvas.height = HEIGHT;
        canvas.getContext('2d')!.drawImage(img, 0, 0, WIDTH, HEIGHT);
        resolve(canvas.toDataURL('image/png'));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

/** How many seats the party holds now, out of the contest's. */
export function seatsHeld(world: World, c: Campaign): number {
  return world.seats.filter((s) => holderOf(world, c, s.id) === c.player).length;
}

/** The card for the map: the party's seats in its colour, with the figures beside them. */
export function mapCard(t: T, f: Format, world: World, c: Campaign, picture: string | null): CardData {
  const me = c.player;
  const held = seatsHeld(world, c);
  const majority = majorityLine(world);
  const face = { src: paintedLeader(me) ?? leaderPortrait(me) ?? '', caption: leaderName(t, me), sub: partyName(t, me) };
  return {
    accent: partyColor(me),
    kicker: contestName(t, world),
    headline: t('mapshare.headline' as StringKey, { party: partyName(t, me), n: held }),
    body: held >= majority ? t('mapshare.majority' as StringKey) : t('mapshare.short' as StringKey, { n: majority - held }),
    hero: { value: f.int(held), label: t('mapshare.seats' as StringKey) },
    stats: [
      { label: t('mapshare.of' as StringKey), value: f.int(world.seats.length) },
      { label: t('mapshare.majorityLine' as StringKey), value: f.int(majority) },
      { label: t('mapshare.share' as StringKey), value: f.pct(held / Math.max(1, world.seats.length)) },
    ],
    portrait: face,
    backdrop: picture ?? undefined,
    backdropColours: true,
    tagline: t('share.tagline'),
    fiction: t('share.fiction'),
  };
}
