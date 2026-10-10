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
  'autofill.button': 'Isi calon terbaik secara automatik',
  'autofill.hint': 'Memilih calon terbaik di setiap kerusi yang belum anda pilih dan, bagi parti buatan sendiri, menambah kerusi yang paling berpeluang dimenangi, dengan sehingga {pct}% daripada wang anda. Anda masih boleh mengubahnya sehingga hari penamaan calon.',
  'autofill.none': 'Tiada apa lagi untuk diisi.',
  'picks.title': 'Siapa yang dipilih ketua negeri',
  'picks.desc': 'Di setiap kerusi yang anda tak pilih, ketua negeri memilih calon. Ketua yang cekap dengan cawangan yang kuat di negeri itu memilih orang yang lebih baik, dan mereka membawa sedikit kepada kerusi itu.',
  'picks.row': '{chief}',
  'picks.quality': 'Mutu pilihan',
  'picks.count': '{able} daripada {seats} kerusi dengan pilihan cekap · {risky} dengan sesuatu dalam latar mereka',
};

export type AutofillKey = keyof typeof AUTOFILL_EN;
