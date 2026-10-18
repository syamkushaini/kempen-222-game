// Text for the button that fills the candidates for the leader, and for what the state chiefs' picks show, in English and Bahasa Malaysia.

export const AUTOFILL_EN = {
  'autofill.button': 'Auto-fill the best candidates',
  'autofill.hint': 'Chooses the best hopeful in every seat you have not chosen for yet and, for a party of your own, adds the seats you are likeliest to win, with up to {pct}% of your money. You can still change it until nomination day.',
  'autofill.none': 'Nothing left to fill.',
  'picks.title': 'Who the state chiefs have picked',
  'picks.desc': 'In every seat you do not choose for, the state’s chief picks the candidate. A capable chief with strong branches in the state picks better people, and they bring a little to the seat.',
  'picks.row': '{chief}',
  'picks.quality': 'How well they pick',
  'picks.count': '{able} of {seats} seats with a capable pick · {risky} with something in their past',
} as const;

export const AUTOFILL_MS: Record<keyof typeof AUTOFILL_EN, string> = {
  'autofill.button': 'Isi calon terbaik automatik',
  'autofill.hint': 'Pilih calon terbaik di setiap kerusi yang belum anda pilih dan, untuk parti buatan sendiri, tambah kerusi yang paling berpeluang menang, dengan sehingga {pct}% daripada duit anda. Anda masih boleh ubah sehingga hari penamaan calon.',
  'autofill.none': 'Tak ada lagi yang perlu diisi.',
  'picks.title': 'Calon pilihan ketua negeri',
  'picks.desc': 'Di kerusi yang anda tak pilih sendiri, ketua negeri yang pilih calon. Ketua yang cekap dengan cawangan kuat pilih orang yang lebih baik, dan mereka bawa sedikit undi ke kerusi itu.',
  'picks.row': '{chief}',
  'picks.quality': 'Mutu pilihan',
  'picks.count': '{able} daripada {seats} kerusi dapat calon yang cekap · {risky} ada latar belakang bermasalah',
};

export type AutofillKey = keyof typeof AUTOFILL_EN;
