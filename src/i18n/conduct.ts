// Text for the weekly judgement of the leader's conduct, in English and Bahasa Malaysia.

export const CONDUCT_EN = {
  'conduct.title': 'This week’s conduct',
  'conduct.desc': 'Each week the party is judged on five things. All five sound earns a point of credibility and unity (up to a good name, not a perfect one); two or fewer costs a point of each. Three or four changes nothing.',
  'conduct.now.good': 'A good week: +1 credibility, +1 unity.',
  'conduct.now.bad': 'A poor week: −1 credibility, −1 unity.',
  'conduct.now.flat': 'A middling week: nothing changes.',
  'conduct.none': 'The first week of a term has not been judged yet.',
  'conduct.manifesto': 'Stances kept to the manifesto',
  'conduct.manifesto.fix': 'A stance has moved more than a step from the manifesto. Move it back in the Policy tab.',
  'conduct.voters': 'Stances voters want',
  'conduct.voters.fix': 'Taken together, voters want your stances less than they do not. Look at the Policy tab.',
  'conduct.orders': 'No easy money or state resources',
  'conduct.orders.fix': 'Donors or state resources are on in Orders. Both cost trust and credibility.',
  'conduct.team': 'A team hired and paid',
  'conduct.team.fix': 'Nobody is hired, or the team went unpaid. Hire in the Team tab and keep wages paid.',
  'conduct.funded': 'Orders paid in full',
  'conduct.funded.fix': 'The party could not pay for all its orders this week. Lower them in Orders, or raise money.',
  'news.conduct.good': 'The party’s conduct has been sound for a while, and it shows: people trust it a little more.',
  'news.conduct.bad': 'The party’s conduct has been poor for a while, and it shows: people trust it a little less.',
} as const;

export const CONDUCT_MS: Record<keyof typeof CONDUCT_EN, string> = {
  'conduct.title': 'Prestasi parti minggu ini',
  'conduct.desc': 'Setiap minggu, parti dinilai berdasarkan lima perkara. Jika semuanya berjalan lancar, kredibiliti dan perpaduan masing-masing meningkat satu mata. Jika hanya dua perkara atau kurang berjalan lancar, kedua-duanya akan menurun satu mata bagi setiap kelemahan. Jika tiga atau empat perkara berjalan lancar, tiada perubahan.',
  'conduct.now.good': 'Prestasi baik minggu ini: kredibiliti +1, perpaduan +1.',
  'conduct.now.bad': 'Prestasi kurang baik minggu ini: kredibiliti −1, perpaduan −1.',
  'conduct.now.flat': 'Prestasi biasa minggu ini: tiada perubahan.',
  'conduct.none': 'Minggu pertama penggal belum dinilai.',
  'conduct.manifesto': 'Pendirian selaras dengan manifesto',
  'conduct.manifesto.fix': 'Salah satu pendirian parti sudah terlalu jauh berbeza daripada manifesto. Semak semula di bahagian Dasar.',
  'conduct.voters': 'Pendirian yang dikehendaki pengundi',
  'conduct.voters.fix': 'Secara keseluruhan, pendirian parti kurang mendapat sokongan pengundi. Semak bahagian Dasar.',
  'conduct.orders': 'Tidak bergantung pada sumbangan meragukan atau sumber kerajaan',
  'conduct.orders.fix': 'Arahan parti masih menggunakan sumbangan meragukan atau sumber kerajaan. Kedua-duanya boleh menjejaskan kepercayaan rakyat dan kredibiliti parti.',
  'conduct.team': 'Pasukan dilantik dan gaji dibayar',
  'conduct.team.fix': 'Anda belum melantik ahli pasukan atau gaji mereka belum dibayar. Pergi ke bahagian Pasukan untuk membuat pelantikan dan pastikan gaji mencukupi.',
  'conduct.funded': 'Semua arahan dibiayai sepenuhnya',
  'conduct.funded.fix': 'Parti tak mempunyai dana yang cukup untuk menjalankan semua arahan minggu ini. Kurangkan arahan atau cari sumber dana tambahan.',
  'news.conduct.good': 'Prestasi parti konsisten sejak kebelakangan ini. Kepercayaan rakyat terhadap parti mula meningkat.',
  'news.conduct.bad': 'Prestasi parti kurang memuaskan sejak kebelakangan ini. Kepercayaan rakyat terhadap parti mula merosot.',
};

export type ConductKey = keyof typeof CONDUCT_EN;
