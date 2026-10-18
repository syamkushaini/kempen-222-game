// Text for the skins and accent colours that achievements give, in English and Bahasa Malaysia.
// Kept apart from strings.ts for size; merged into the same lookup table.

export const LOOK_EN = {
  'look.title': 'Look',
  'look.skin': 'Surface',
  'look.accent': 'Accent colour',
  'look.hint': 'Surfaces and colours are earned with achievements. Nothing else about the game changes.',
  'look.themeSet': 'Set by the surface you are wearing. Choosing a different one puts the surface back to Standard.',
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
  'look.skin': 'Tema',
  'look.accent': 'Warna aksen',
  'look.hint': 'Tema dan warna diperoleh melalui pencapaian. Tiada apa-apa lain dalam game yang berubah.',
  'look.themeSet': 'Ditetapkan oleh tema yang anda pakai. Pilih yang lain untuk kembali ke Biasa.',
  'look.locked': 'Dapatkan “{ach}” untuk pakai {name}.',
  'look.reward': 'Dibuka: {name}',
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
