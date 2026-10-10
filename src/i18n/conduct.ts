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
  'conduct.title': 'Kelakuan minggu ini',
  'conduct.desc': 'Setiap minggu parti dinilai pada lima perkara. Kelima-limanya baik menambah satu mata kredibiliti dan perpaduan (sehingga nama yang baik, bukan sempurna); dua atau kurang menolak satu mata bagi setiap satu. Tiga atau empat tiada perubahan.',
  'conduct.now.good': 'Minggu yang baik: +1 kredibiliti, +1 perpaduan.',
  'conduct.now.bad': 'Minggu yang buruk: −1 kredibiliti, −1 perpaduan.',
  'conduct.now.flat': 'Minggu sederhana: tiada perubahan.',
  'conduct.none': 'Minggu pertama penggal belum dinilai.',
  'conduct.manifesto': 'Pendirian setia pada manifesto',
  'conduct.manifesto.fix': 'Satu pendirian telah beralih lebih daripada satu langkah daripada manifesto. Kembalikannya di tab Dasar.',
  'conduct.voters': 'Pendirian yang pengundi mahu',
  'conduct.voters.fix': 'Secara keseluruhan, pengundi kurang mahukan pendirian anda. Lihat tab Dasar.',
  'conduct.orders': 'Tiada wang mudah atau sumber negeri',
  'conduct.orders.fix': 'Penderma atau sumber negeri dihidupkan dalam Arahan. Kedua-duanya merugikan kepercayaan dan kredibiliti.',
  'conduct.team': 'Pasukan diambil dan dibayar',
  'conduct.team.fix': 'Tiada sesiapa diambil, atau pasukan tak dibayar. Ambil di tab Pasukan dan pastikan gaji dibayar.',
  'conduct.funded': 'Arahan dibayar penuh',
  'conduct.funded.fix': 'Parti tak dapat membayar semua arahannya minggu ini. Kurangkan dalam Arahan, atau cari wang.',
  'news.conduct.good': 'Kelakuan parti baik sejak sekian lama, dan ia kelihatan: orang lebih mempercayainya sedikit.',
  'news.conduct.bad': 'Kelakuan parti buruk sejak sekian lama, dan ia kelihatan: orang kurang mempercayainya sedikit.',
};

export type ConductKey = keyof typeof CONDUCT_EN;
