// Text for the skins and accent colours that achievements give, in English and Bahasa Malaysia.
// Kept apart from strings.ts for size; merged into the same lookup table.

export const LOOK_EN = {
  'look.title': 'Look',
  'look.skin': 'Surface',
  'look.accent': 'Accent colour',
  'look.hint': 'Surfaces and colours are earned with achievements. Nothing else about the game changes.',
  'look.themeSet': 'Set by the surface you are wearing.',
  'look.locked': 'Win “{ach}” to wear {name}.',
  'look.reward': 'Unlocks: {name}',
  'skin.standard': 'Standard',
  'skin.paper': 'Paper',
  'skin.midnight': 'Midnight',
  'accent.party': 'Party colour',
  'accent.lavender': 'Lavender',
  'accent.batik': 'Batik blue',
  'accent.kopi': 'Kopi O',
  'accent.senja': 'Dusk orange',
  'accent.rimba': 'Rainforest green',
  'accent.orkid': 'Orchid',
  'accent.songket': 'Songket gold',
  'accent.saga': 'Saga red',
} as const;

export const LOOK_MS: Record<keyof typeof LOOK_EN, string> = {
  'look.title': 'Rupa',
  'look.skin': 'Permukaan',
  'look.accent': 'Warna aksen',
  'look.hint': 'Permukaan dan warna diperoleh melalui pencapaian. Tiada perkara lain dalam permainan yang berubah.',
  'look.themeSet': 'Ditetapkan oleh permukaan yang anda pakai.',
  'look.locked': 'Raih “{ach}” untuk memakai {name}.',
  'look.reward': 'Membuka: {name}',
  'skin.standard': 'Biasa',
  'skin.paper': 'Kertas',
  'skin.midnight': 'Tengah Malam',
  'accent.party': 'Warna parti',
  'accent.lavender': 'Lavender',
  'accent.batik': 'Biru batik',
  'accent.kopi': 'Kopi O',
  'accent.senja': 'Jingga senja',
  'accent.rimba': 'Hijau rimba',
  'accent.orkid': 'Orkid',
  'accent.songket': 'Emas songket',
  'accent.saga': 'Merah saga',
};

export type LookKey = keyof typeof LOOK_EN;
