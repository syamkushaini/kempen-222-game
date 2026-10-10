// Text for the thank-you list in the Buy me a coffee dialog, in English and Bahasa Malaysia.

export const THANKS_EN = {
  'support.thanks.title': 'Thank you to the people who helped build this game',
  'support.thanks.body': 'Their work, time and ideas are in every seat, every mission and every chart. Thank you for your contribution.',
} as const;

export const THANKS_MS: Record<keyof typeof THANKS_EN, string> = {
  'support.thanks.title': 'Terima kasih kepada semua yang membantu membina permainan ini',
  'support.thanks.body': 'Kerja, masa dan idea anda ada dalam setiap kerusi, setiap misi dan setiap carta. Terima kasih atas sumbangan anda.',
};

export type ThanksKey = keyof typeof THANKS_EN;
