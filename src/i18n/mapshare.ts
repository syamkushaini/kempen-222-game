// Text for the share button on the map and the card it makes, in English and Bahasa Malaysia.

export const MAPSHARE_EN = {
  'mapshare.button': 'Share map',
  'mapshare.headline': '{party} hold {n} seats',
  'mapshare.majority': 'A majority of the House is in reach.',
  'mapshare.short': 'Another {n} seats for a majority.',
  'mapshare.seats': 'Seats held',
  'mapshare.of': 'Seats in all',
  'mapshare.majorityLine': 'Majority line',
  'mapshare.share': 'Of the House',
} as const;

export const MAPSHARE_MS: Record<keyof typeof MAPSHARE_EN, string> = {
  'mapshare.button': 'Kongsi peta',
  'mapshare.headline': '{party} memegang {n} kerusi',
  'mapshare.majority': 'Majoriti dewan sudah dalam genggaman.',
  'mapshare.short': 'Lagi {n} kerusi untuk majoriti.',
  'mapshare.seats': 'Kerusi dipegang',
  'mapshare.of': 'Jumlah kerusi',
  'mapshare.majorityLine': 'Had majoriti',
  'mapshare.share': 'Daripada dewan',
};

export type MapShareKey = keyof typeof MAPSHARE_EN;
