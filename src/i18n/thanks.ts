// Text for the list of top sponsors in the Buy me a coffee dialog, in English and Bahasa Malaysia. No amounts are shown.

export const THANKS_EN = {
  'support.thanks.title': 'Top sponsors',
  'support.thanks.note': 'Thanks for sponsoring my coffee when developing this game.',
  'support.thanks.body': 'Your contribution is greatly appreciated.',
} as const;

export const THANKS_MS: Record<keyof typeof THANKS_EN, string> = {
  'support.thanks.title': 'Penaja teratas',
  'support.thanks.note': 'Terima kasih kerana menaja kopi saya semasa membangunkan permainan ini.',
  'support.thanks.body': 'Sumbangan anda amat dihargai.',
};

export type ThanksKey = keyof typeof THANKS_EN;
