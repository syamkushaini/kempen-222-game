import { PARTIES } from '../data/parties';
import { PARTY_IDS, type PartyId } from '../sim/types';

/**
 * Portraits of the game's invented people, drawn as flat vector busts in one
 * style from a handful of features. They are not based on anyone: the
 * features are assigned by hand or by number, not copied from a face.
 */
export interface Look {
  /** Skin tone, lightest to darkest. */
  skin: 0 | 1 | 2 | 3;
  hair: 'short' | 'side' | 'swept' | 'thin' | 'bun' | 'bob' | 'long';
  hairColor: 'black' | 'brown' | 'grey' | 'white';
  headwear?: 'songkok' | 'scarf';
  glasses?: boolean;
  facial?: 'moustache' | 'beard';
  wear: 'suit' | 'baju' | 'blouse';
}

const SKIN = ['#f1cda8', '#e2b088', '#c98d62', '#9c6644'];
const SHADE = ['#dcb089', '#c99468', '#ac7248', '#7f4f33'];
const HAIR = { black: '#22201f', brown: '#4a3526', grey: '#8e8e92', white: '#e3e1dc' };
const INK = '#1f1f26';
const JACKET = '#2b3140';

const HAIR_BACK: Partial<Record<Look['hair'], string>> = {
  bob: 'M18 34C16 14 26 11 32 11C38 11 48 14 46 34C46 38 44 41 42 41L22 41C20 41 18 38 18 34Z',
  long: 'M17 47C14 14 26 10.5 32 10.5C38 10.5 50 14 47 47Z',
  bun: 'M19.5 30C18 14 26 12 32 12C38 12 46 14 44.5 30Z',
};
const HAIR_FRONT: Record<Look['hair'], string> = {
  short: 'M20.5 27C19 15 27 12.5 32 12.5C37 12.5 45 15 43.5 27C42 21 39 19 32 19C25 19 22 21 20.5 27Z',
  side: 'M20.5 28C18.5 14 28 12 33 12.5C40 13 45 17 43.5 28C42.5 22 40 19.5 36 19C30 21 24 20 20.5 28Z',
  swept: 'M20.5 27C18 12 28 10 34 10.5C41 11 46 16 43.5 27C42 21 38 17.5 30 18C25 18.5 22 21 20.5 27Z',
  thin: 'M20.5 29C19.5 24 20.5 20.5 23 19.5C22.3 22.5 22 26 21.6 29ZM43.5 29C44.5 24 43.5 20.5 41 19.5C41.7 22.5 42 26 42.4 29Z',
  bun: 'M20.5 26C21 17 27 15.5 32 15.5C37 15.5 43 17 43.5 26C40 20.5 36 19 32 19C28 19 24 20.5 20.5 26Z',
  bob: 'M20.5 27C21 17 27 15.5 32 15.5C37 15.5 43 17 43.5 27C40 21 37 19.5 33 20C28 20.5 24 22 20.5 27Z',
  long: 'M20.5 27C20.5 17 27 15 33 15.5C38 16 43 18 43.5 27C41 21.5 37 19.5 31 20C26 20.5 23 22 20.5 27Z',
};

/** A bust in a circle, as SVG markup. `accent` colours the background and the tie, scarf or dress. */
export function portraitSvg(look: Look, accent: string): string {
  const skin = SKIN[look.skin], shade = SHADE[look.skin], hair = HAIR[look.hairColor];
  const scarf = look.headwear === 'scarf';
  const parts: string[] = [
    '<circle cx="32" cy="32" r="32" fill="#e8e3d8"/>',
    `<circle cx="32" cy="32" r="32" fill="${accent}" opacity="0.26"/>`,
  ];
  if (!scarf && HAIR_BACK[look.hair]) parts.push(`<path d="${HAIR_BACK[look.hair]}" fill="${hair}"/>`);
  if (look.hair === 'bun' && !scarf) parts.push(`<circle cx="32" cy="10.5" r="4.6" fill="${hair}"/>`);

  // Shoulders and what is worn on them.
  const body = look.wear === 'suit' ? JACKET : accent;
  parts.push(`<path d="M7 66C7 51 20 46 32 46C44 46 57 51 57 66Z" fill="${body}"/>`);
  parts.push(`<rect x="28" y="38" width="8" height="10" rx="3" fill="${shade}"/>`);
  if (look.wear === 'suit') {
    parts.push('<path d="M25.5 46.5L32 56L38.5 46.5Z" fill="#f5f2ea"/>');
    parts.push(`<path d="M30.8 49.5L33.2 49.5L34.2 58L32 61.5L29.8 58Z" fill="${accent}"/>`);
    parts.push('<path d="M25.5 46.5L32 56L27 60L22.5 49Z" fill="#232836"/><path d="M38.5 46.5L32 56L37 60L41.5 49Z" fill="#232836"/>');
  } else if (look.wear === 'baju') {
    parts.push('<path d="M26.5 46.5Q32 51 37.5 46.5" stroke="#00000033" stroke-width="2.4" fill="none" stroke-linecap="round"/>');
    parts.push('<circle cx="32" cy="53" r="1" fill="#f5f2ea"/><circle cx="32" cy="58" r="1" fill="#f5f2ea"/>');
  } else if (!scarf) {
    parts.push(`<path d="M26.5 46.5Q32 53 37.5 46.5Z" fill="${shade}"/>`);
  }

  if (scarf) {
    parts.push(`<path d="M15 31C15 13.5 49 13.5 49 31C49 43 45 51 32 53C19 51 15 43 15 31Z" fill="${accent}"/>`);
    parts.push('<path d="M15 31C15 13.5 49 13.5 49 31C49 43 45 51 32 53C19 51 15 43 15 31Z" fill="#00000022"/>');
    parts.push(`<ellipse cx="32" cy="30" rx="9.6" ry="11.6" fill="${skin}"/>`);
    parts.push(`<path d="M19 45Q32 56 45 45L47 53Q32 60 17 53Z" fill="${accent}"/>`);
  } else {
    parts.push(`<circle cx="20.6" cy="30" r="2.6" fill="${shade}"/><circle cx="43.4" cy="30" r="2.6" fill="${shade}"/>`);
    parts.push(`<ellipse cx="32" cy="29" rx="11.5" ry="13.5" fill="${skin}"/>`);
    if (look.facial === 'beard') parts.push(`<path d="M21 32C21.5 43.5 28 45 32 45C36 45 42.5 43.5 43 32C41.5 38.5 37 39.5 32 39.5C27 39.5 22.5 38.5 21 32Z" fill="${hair}"/>`);
    parts.push(`<path d="${HAIR_FRONT[look.hair]}" fill="${hair}"/>`);
    if (look.headwear === 'songkok') parts.push('<path d="M20.3 22L21.6 11.5Q32 8.5 42.4 11.5L43.7 22Q32 18.6 20.3 22Z" fill="#17171c"/>');
  }

  const y = scarf ? 1 : 0;
  const brow = look.hairColor === 'white' || look.hairColor === 'grey' ? '#6d6d72' : HAIR[look.hairColor];
  parts.push(`<path d="M24.6 ${25.4 + y}q2.4-1.4 4.8 0M34.6 ${25.4 + y}q2.4-1.4 4.8 0" stroke="${brow}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`);
  parts.push(`<circle cx="27" cy="${29 + y}" r="1.25" fill="${INK}"/><circle cx="37" cy="${29 + y}" r="1.25" fill="${INK}"/>`);
  if (look.glasses) {
    parts.push(`<rect x="22.9" y="${25.9 + y}" width="8" height="6.3" rx="2.4" fill="#ffffff22" stroke="#2a2a33" stroke-width="1"/><rect x="33.1" y="${25.9 + y}" width="8" height="6.3" rx="2.4" fill="#ffffff22" stroke="#2a2a33" stroke-width="1"/>`);
    parts.push(`<path d="M30.9 ${28.6 + y}h2.2" stroke="#2a2a33" stroke-width="1"/>`);
  }
  parts.push(`<path d="M32 ${30.5 + y}q-1.5 3.6 0.2 4.4" stroke="${shade}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`);
  if (look.facial && !scarf) parts.push(`<path d="M27.2 36.6q4.8-2.6 9.6 0q-4.8 1.3-9.6 0Z" fill="${hair}"/>`);
  parts.push(`<path d="M28.6 ${38 + y}q3.4 2 6.8 0" stroke="#8a4a42" stroke-width="1.2" fill="none" stroke-linecap="round"/>`);

  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><clipPath id="c"><circle cx="32" cy="32" r="32"/></clipPath></defs>'
    + `<g clip-path="url(#c)">${parts.join('')}</g></svg>`;
}

// ---------- who looks like what ----------

type Real = Exclude<PartyId, 'oth'>;

/**
 * The six party leaders. The player takes the place of their own party's
 * leader. Features were chosen to differ from any real leader a party might
 * bring to mind.
 */
export const LEADER_LOOKS: Record<Real, Look> = {
  ps:     { skin: 1, hair: 'side', hairColor: 'black', wear: 'suit' },
  bp:     { skin: 2, hair: 'swept', hairColor: 'grey', glasses: true, wear: 'suit' },
  pt:     { skin: 2, hair: 'short', hairColor: 'black', headwear: 'songkok', facial: 'moustache', wear: 'baju' },
  gbk:    { skin: 1, hair: 'thin', hairColor: 'grey', facial: 'moustache', wear: 'suit' },
  gbs:    { skin: 2, hair: 'short', hairColor: 'black', facial: 'beard', wear: 'suit' },
  legasi: { skin: 1, hair: 'swept', hairColor: 'black', glasses: true, wear: 'baju' },
};

/** Ready-made portraits a new leader can choose from. */
export const PLAYER_LOOKS: Look[] = [
  { skin: 1, hair: 'short', hairColor: 'black', wear: 'suit' },
  { skin: 2, hair: 'side', hairColor: 'grey', glasses: true, wear: 'suit' },
  { skin: 2, hair: 'short', hairColor: 'black', headwear: 'songkok', wear: 'baju' },
  { skin: 3, hair: 'swept', hairColor: 'black', facial: 'moustache', wear: 'suit' },
  { skin: 1, hair: 'bob', hairColor: 'black', wear: 'blouse' },
  { skin: 2, hair: 'bob', hairColor: 'black', headwear: 'scarf', wear: 'blouse' },
  { skin: 0, hair: 'bun', hairColor: 'black', glasses: true, wear: 'blouse' },
  { skin: 3, hair: 'long', hairColor: 'black', wear: 'blouse' },
];

const override: Partial<Record<PartyId, Look>> = {};
/** Gives a party's leader a different face (the player's own leader), or with null gives the usual one back. */
export function setLeaderLook(id: PartyId, look: Look | null): void {
  if (look) override[id] = look; else delete override[id];
}

/** Kak Ros, the campaign manager who talks the player through the by-election. */
export const ADVISER_LOOK: Look = { skin: 1, hair: 'bob', hairColor: 'black', headwear: 'scarf', glasses: true, wear: 'blouse' };

/** Ministers, in the order of their names in the simulation. */
const m = (skin: Look['skin'], hair: Look['hair'], hairColor: Look['hairColor'], wear: Look['wear'], extra: Partial<Look> = {}): Look =>
  ({ skin, hair, hairColor, wear, ...extra });
export const MINISTER_LOOKS: Look[] = [
  m(2, 'short', 'black', 'suit', { headwear: 'songkok' }),            // Azlan Mokhtar
  m(1, 'bob', 'black', 'blouse', { headwear: 'scarf' }),              // Noraini Hashim
  m(2, 'thin', 'grey', 'baju', { glasses: true, facial: 'moustache' }), // Zulkifli Daud
  m(1, 'bob', 'black', 'blouse', { headwear: 'scarf', glasses: true }), // Suraya Latiff
  m(2, 'side', 'black', 'suit', { facial: 'beard' }),                 // Kamarul Bahrin
  m(2, 'bob', 'grey', 'blouse', { headwear: 'scarf' }),               // Rosnah Yahya
  m(0, 'side', 'black', 'suit', { glasses: true }),                   // Lee Chee Keong
  m(0, 'bob', 'black', 'blouse'),                                     // Wong Siew Lan
  m(0, 'swept', 'grey', 'suit'),                                      // Tan Boon Hock
  m(0, 'bun', 'black', 'blouse', { glasses: true }),                  // Chong Mei Yin
  m(3, 'short', 'black', 'suit', { facial: 'moustache' }),            // Ravi Chandran
  m(3, 'long', 'black', 'blouse'),                                    // Shanti Devan
  m(3, 'thin', 'grey', 'suit', { glasses: true, facial: 'moustache' }), // Gopal Krishnan
  m(3, 'bun', 'black', 'blouse'),                                     // Anita Selvam
  m(1, 'short', 'black', 'suit'),                                     // Jimmy Laing
  m(1, 'long', 'brown', 'blouse'),                                    // Patricia Unggang
  m(2, 'swept', 'black', 'suit', { glasses: true }),                  // Douglas Nyipa
  m(1, 'bun', 'brown', 'blouse'),                                     // Felicia Jainal
  m(2, 'short', 'grey', 'suit', { facial: 'moustache' }),             // Maxwell Gimbang
  m(1, 'bob', 'brown', 'blouse', { glasses: true }),                  // Rosalind Sipin
];

const cache = new Map<string, string>();
const uri = (key: string, svg: () => string) => {
  let hit = cache.get(key);
  if (!hit) { hit = `data:image/svg+xml,${encodeURIComponent(svg())}`; cache.set(key, hit); }
  return hit;
};

const colorOf = (party: number) => PARTIES[PARTY_IDS[party]].color;

/** A party leader's portrait as an image address, or null for the pooled independents. */
export function leaderPortrait(party: number): string | null {
  const id = PARTY_IDS[party];
  if (id === 'oth') return null;
  const look = override[id] ?? LEADER_LOOKS[id];
  return uri(`leader:${id}:${PARTIES[id].color}:${JSON.stringify(look)}`, () => portraitSvg(look, PARTIES[id].color));
}

export function ministerPortrait(name: number, party: number): string {
  const look = MINISTER_LOOKS[name % MINISTER_LOOKS.length];
  return uri(`minister:${name}:${colorOf(party)}`, () => portraitSvg(look, colorOf(party)));
}

export const adviserPortrait = () => uri('adviser', () => portraitSvg(ADVISER_LOOK, '#b7791f'));

/** Where a matter comes from when it is not a person: the Palace, the House, or the leader's own desk. */
export type Emblem = 'palace' | 'house' | 'desk';
const EMBLEMS: Record<Emblem, { bg: string; art: string }> = {
  // A gateway under a dome. The Palace is shown as a place, never as a person.
  palace: {
    bg: '#b7791f',
    art: '<path d="M32 13c7 0 11 5 11 10H21c0-5 4-10 11-10Z"/><rect x="31" y="8" width="2" height="6" rx="1"/>'
      + '<rect x="17" y="24" width="30" height="4" rx="1"/><path d="M19 30h6v17h-6zM39 30h6v17h-6zM27 47V37a5 5 0 0 1 10 0v10Z"/><rect x="14" y="48" width="36" height="4" rx="1"/>',
  },
  // A chamber with a row of pillars.
  house: {
    bg: '#3d4a63',
    art: '<path d="M32 12L50 23H14Z"/><path d="M17 26h5v20h-5zM25.5 26h5v20h-5zM33.5 26h5v20h-5zM42 26h5v20h-5z"/><rect x="13" y="47" width="38" height="5" rx="1"/>',
  },
  // A sheet of paper with lines of writing.
  desk: {
    bg: '#6b7280',
    art: '<path d="M20 12h17l8 8v32H20Z"/><path d="M37 12v8h8Z" fill="#00000033"/><path d="M25 28h14M25 34h14M25 40h9" stroke="#6b7280" stroke-width="2.4" stroke-linecap="round"/>',
  },
};

export function emblemSvg(kind: Emblem): string {
  const e = EMBLEMS[kind];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="${e.bg}"/><g fill="#fbf7ee">${e.art}</g></svg>`;
}
export const emblem = (kind: Emblem) => uri(`emblem:${kind}`, () => emblemSvg(kind));
