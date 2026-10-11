import type { EventText } from './events';

// Booms and busts that give notice, in English and Bahasa Malaysia: the warning, then the day itself.

export const SHOCK_EVENTS_EN: Record<string, EventText> = {
  boomWarn: {
    title: 'The central bank sees a windfall coming',
    body: 'Commodity prices are climbing faster than anyone planned for. The central bank expects revenue to jump in about two months, and every ministry is already drawing up a wish list.',
    options: ['Have the finance ministry plan for it', 'Tell the voters they will share in it', 'Say nothing until it arrives'],
    results: [
      'The planning was quiet and sensible, and the ministries were told no, early.',
      'The voters liked the promise. The finance ministry did not like being asked to keep it.',
      'Nothing was said, and everyone assumed the worst or the best, as it suited them.',
    ],
  },
  boom: {
    title: 'The windfall arrives',
    body: 'The revenue has come in, more than the budget counted on. Everybody has a view on what to do with it, and it will not be there next year.',
    options: ['Bank it in the treasury', 'Pay down the national debt', 'Spend it on the people', 'Cut taxes for a year'],
    results: [
      'The treasury is fuller, and a government with money in hand is believed.',
      'The debt eased, and the agencies noticed.',
      'The hospitals, schools and shops felt it. The books will feel it next year.',
      'The shopkeepers and the middle class cheered. The deficit did not.',
    ],
  },
  stormWarn: {
    title: 'The central bank warns of a storm',
    body: 'A downturn abroad is heading this way: orders are falling, and the bank expects it to reach the factories in about two months. It is a warning, not a forecast, and what you do now decides how hard it lands.',
    options: ['Build a buffer now', 'Carry on as planned', 'Line up a credit line with friends abroad'],
    results: [
      'Spending was held back, and nobody thanked you for it, yet.',
      'Spending went on. The storm was on its way regardless.',
      'The credit line was agreed quietly, at a price in favours.',
    ],
  },
  dip: {
    title: 'The slowdown, softer than feared',
    body: 'The shock has arrived and, because the government saw it coming, it is not the worst case. Factories are cutting shifts, not closing. There is a decision to make about how much to cushion it.',
    options: ['Cushion it with a stimulus', 'Hold the line on spending'],
    results: [
      'The stimulus softened the blow and added to the commitments.',
      'You held the line. Jobs were lost, but the books held.',
    ],
  },
  crash: {
    title: 'The crash',
    body: 'The shock has arrived and nobody was ready. Export orders have collapsed, a lender has frozen credit, and every bank in the country is on the telephone to the finance minister.',
    options: ['A large stimulus, borrowed', 'Austerity: cut and hold', 'Rescue the banks'],
    results: [
      'The stimulus kept factories open and the debt climbed.',
      'The cuts were deep and the economy slowed more. The books were kept honest.',
      'The banks were saved. Voters will remember who was saved.',
    ],
  },
};

export const SHOCK_EVENTS_MS: Record<string, EventText> = {
  boomWarn: {
    title: 'Bank pusat nampak durian runtuh akan tiba',
    body: 'Harga komoditi naik lebih laju daripada yang dirancang. Bank pusat jangka hasil melonjak dalam masa dua bulan, dan setiap kementerian dah mula menyenaraikan permintaan.',
    options: ['Suruh kementerian kewangan merancang', 'Beritahu rakyat mereka akan dapat bahagian', 'Diam dulu sampai ia tiba'],
    results: [
      'Perancangan dibuat secara senyap dan waras, dan kementerian lain dah awal-awal dijawab tak.',
      'Rakyat suka janji tu. Kementerian kewangan tak suka disuruh menunaikannya.',
      'Tiada apa dikatakan, dan semua orang membayangkan yang terbaik atau terburuk mengikut selera.',
    ],
  },
  boom: {
    title: 'Durian runtuh dah sampai',
    body: 'Hasil dah masuk, lebih daripada yang dikira dalam bajet. Semua orang ada pandangan nak buat apa dengannya, dan ia takkan ada tahun depan.',
    options: ['Simpan dalam perbendaharaan', 'Bayar hutang negara', 'Belanja untuk rakyat', 'Kurangkan cukai setahun'],
    results: [
      'Perbendaharaan lebih penuh, dan kerajaan yang ada duit di tangan lebih dipercayai.',
      'Hutang berkurang, dan agensi penarafan perasan.',
      'Hospital, sekolah dan kedai merasainya. Bajet akan merasainya tahun depan.',
      'Peniaga dan kelas menengah bersorak. Defisit tidak.',
    ],
  },
  stormWarn: {
    title: 'Bank pusat beri amaran ribut',
    body: 'Kelembapan di luar negara sedang menuju ke sini: tempahan jatuh, dan bank jangka ia sampai ke kilang dalam masa dua bulan. Ini amaran, bukan ramalan, dan apa yang anda buat sekarang menentukan betapa kuat ia melanda.',
    options: ['Bina simpanan penampan sekarang', 'Teruskan seperti dirancang', 'Dapatkan kemudahan kredit daripada kawan di luar negara'],
    results: [
      'Perbelanjaan ditahan, dan belum ada yang berterima kasih.',
      'Perbelanjaan diteruskan. Ribut tetap dalam perjalanan.',
      'Kemudahan kredit dipersetujui secara senyap, dengan harga budi.',
    ],
  },
  dip: {
    title: 'Kelembapan, lebih ringan daripada dijangka',
    body: 'Kejutan dah tiba dan, kerana kerajaan nampak ia datang, ia bukan kes paling teruk. Kilang kurangkan syif, bukan tutup. Ada keputusan untuk dibuat tentang berapa banyak nak dilindungi.',
    options: ['Lindungi dengan rangsangan', 'Tahan perbelanjaan'],
    results: [
      'Rangsangan melembutkan hentaman dan menambah komitmen.',
      'Anda berpegang pada garis. Ada kerja hilang, tapi bajet bertahan.',
    ],
  },
  crash: {
    title: 'Kejatuhan',
    body: 'Kejutan dah tiba dan tiada siapa bersedia. Tempahan eksport runtuh, seorang pemberi pinjaman membekukan kredit, dan setiap bank dalam negara menelefon menteri kewangan.',
    options: ['Rangsangan besar, dengan pinjaman', 'Penjimatan: potong dan tahan', 'Selamatkan bank'],
    results: [
      'Rangsangan mengekalkan kilang beroperasi dan hutang menaik.',
      'Pemotongan dalam dan ekonomi perlahan lagi. Akaun dikekalkan jujur.',
      'Bank diselamatkan. Pengundi akan ingat siapa yang diselamatkan.',
    ],
  },
};
