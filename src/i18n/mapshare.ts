// Text for the share button on the map and the picture it makes, in English and Bahasa Malaysia.

export const MAPSHARE_EN = {
  'mapshare.button': 'Share map',
  'mapshare.title': 'The map as it stands',
  'mapshare.hint': 'The seats your party holds, in your party’s colour. A picture you can save or share, with no figures on it.',
  'mapshare.alt': 'A map of the seats the party holds, in the party’s colour',
  'mapshare.caption': '{party} hold {n} of the {total} seats in {contest}.',
  'mapshare.majority': 'That is a majority.',
  'mapshare.short': '{n} more for a majority.',
  'mapshare.tag': '#Kempen222 https://syamkushaini.github.io/kempen-222-game/',
  'mapshare.text': 'What to say with it',
  'mapshare.copy': 'Copy text',
  'mapshare.copied': 'Copied',
} as const;

export const MAPSHARE_MS: Record<keyof typeof MAPSHARE_EN, string> = {
  'mapshare.button': 'Kongsi peta',
  'mapshare.title': 'Peta setakat ini',
  'mapshare.hint': 'Kerusi yang dipegang parti anda, dalam warna parti anda. Gambar yang boleh disimpan atau dikongsi, tanpa sebarang angka.',
  'mapshare.alt': 'Peta kerusi yang dipegang parti, dalam warna parti',
  'mapshare.caption': '{party} memegang {n} daripada {total} kerusi di {contest}.',
  'mapshare.majority': 'Itu majoriti.',
  'mapshare.short': 'Lagi {n} untuk majoriti.',
  'mapshare.tag': '#Kempen222 https://syamkushaini.github.io/kempen-222-game/',
  'mapshare.text': 'Apa nak tulis bersamanya',
  'mapshare.copy': 'Salin teks',
  'mapshare.copied': 'Disalin',
};

export type MapShareKey = keyof typeof MAPSHARE_EN;
