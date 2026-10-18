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
  'conduct.desc': 'Setiap minggu parti dinilai berdasarkan lima perkara. Kalau kelima-limanya baik, kredibiliti dan perpaduan masing-masing naik satu mata (nama baik, bukan sempurna). Dua atau kurang yang baik, kedua-duanya turun satu mata. Tiga atau empat, tiada perubahan.',
  'conduct.now.good': 'Minggu yang baik: kredibiliti +1, perpaduan +1.',
  'conduct.now.bad': 'Minggu yang tak elok: kredibiliti −1, perpaduan −1.',
  'conduct.now.flat': 'Minggu biasa-biasa: tiada perubahan.',
  'conduct.none': 'Minggu pertama penggal belum dinilai.',
  'conduct.manifesto': 'Pendirian ikut manifesto',
  'conduct.manifesto.fix': 'Ada pendirian yang dah menyimpang lebih daripada satu langkah dari manifesto. Betulkan balik di tab Dasar.',
  'conduct.voters': 'Pendirian yang pengundi mahu',
  'conduct.voters.fix': 'Kalau dikira keseluruhan, pengundi kurang suka pendirian anda. Tengok tab Dasar.',
  'conduct.orders': 'Tiada duit mudah atau sumber kerajaan',
  'conduct.orders.fix': 'Penderma atau sumber kerajaan dihidupkan di tab Arahan. Dua-duanya kurangkan kepercayaan dan kredibiliti.',
  'conduct.team': 'Pasukan dilantik dan digaji',
  'conduct.team.fix': 'Tiada sesiapa dilantik, atau pasukan tak digaji. Lantik di tab Pasukan dan pastikan gaji dibayar.',
  'conduct.funded': 'Arahan dibayar penuh',
  'conduct.funded.fix': 'Parti tak mampu bayar semua arahan minggu ni. Kurangkan arahan di tab Arahan, atau cari duit.',
  'news.conduct.good': 'Prestasi parti baik sejak sekian lama, dan orang nampak: kepercayaan mereka naik sedikit.',
  'news.conduct.bad': 'Prestasi parti lemah sejak sekian lama, dan orang nampak: kepercayaan mereka turun sedikit.',
};

export type ConductKey = keyof typeof CONDUCT_EN;
