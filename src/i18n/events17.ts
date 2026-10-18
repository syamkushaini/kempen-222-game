import type { EventText } from './events';

// Booms and busts that give notice, in English and Bahasa Malaysia: the warning, then the day itself.

export const SHOCK_EVENTS_EN: Record<string, EventText> = {
  marketWindfall: {
    title: 'The markets hand the country a windfall',
    body: 'Palm oil, gas and chips are all fetching more than anyone budgeted for, and the ringgit has firmed. The central bank says the surge may not last. Every ministry, every state and every cousin has a use for the money.',
    options: ['Bank it in the treasury', 'Pay down the national debt', 'Spend it on the people', 'Share it with the farmers and the gig workers'],
    results: [
      'A fuller treasury is a calmer one, and a government with money in hand is believed.',
      'The debt eased, and the agencies noticed.',
      'The hospitals, schools and shops felt it. The books will feel it next year.',
      'Those who work with their hands felt remembered. The finance ministry felt raided.',
    ],
  },
  blackSwan: {
    title: 'A black swan lands on the ringgit',
    body: 'A bank has failed abroad and nobody saw it coming. Money is leaving the region, the ringgit is sliding and the sector indices have dropped by a fifth in a week. The central bank is on the phone, and so are the shopkeepers.',
    options: ['A stimulus package and a guarantee for deposits', 'Hold the line and let the market find its floor', 'Ask friends abroad for a credit line, and take their terms'],
    results: [
      'Money was spent, deposits were safe, and the worst did not come. The bill will.',
      'The pain was real and short. Some voters called it discipline; most called it your doing.',
      'The lines were opened and the panic stopped. Whatever was promised in the room was not in the press release.',
    ],
  },
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
  marketWindfall: {
    title: 'Pasaran bagi negara durian runtuh',
    body: 'Minyak sawit, gas dan cip semuanya laku lebih mahal daripada yang dibajetkan, dan ringgit mengukuh. Bank pusat kata lonjakan ni mungkin tak lama. Setiap kementerian, setiap negeri dan setiap sepupu ada kegunaan untuk duit tu.',
    options: ['Simpan dalam perbendaharaan', 'Bayar hutang negara', 'Belanja untuk rakyat', 'Kongsi dengan petani dan pekerja gig'],
    results: [
      'Perbendaharaan yang penuh lebih tenang, dan kerajaan yang ada duit di tangan lebih dipercayai.',
      'Hutang berkurang, dan agensi perasan.',
      'Hospital, sekolah dan kedai merasainya. Bajet akan merasainya tahun depan.',
      'Mereka yang kerja dengan tangan rasa diingati. Kementerian kewangan rasa dirompak.',
    ],
  },
  blackSwan: {
    title: 'Angsa hitam hentam ringgit',
    body: 'Sebuah bank gagal di luar negara dan tak ada siapa jangka. Duit keluar dari rantau ni, ringgit menjunam dan indeks sektor jatuh seperlima dalam seminggu. Bank pusat telefon, peniaga kedai pun sama.',
    options: ['Pakej rangsangan dan jaminan simpanan', 'Tegas dan biar pasaran cari dasarnya', 'Minta talian kredit daripada kawan luar negara, dan terima syaratnya'],
    results: [
      'Duit dibelanjakan, simpanan selamat, dan yang paling buruk tak berlaku. Bilnya akan tiba.',
      'Sakitnya nyata dan pendek. Ada pengundi panggil disiplin; kebanyakan panggil salah anda.',
      'Talian dibuka dan panik berhenti. Apa yang dijanjikan dalam bilik tu tak ada dalam kenyataan akhbar.',
    ],
  },
  boomWarn: {
    title: 'Bank pusat nampak durian runtuh akan tiba',
    body: 'Harga komoditi naik lebih laju daripada yang dirancang. Bank pusat jangka hasil melonjak dalam masa dua bulan, dan setiap kementerian dah mula senaraikan permintaan.',
    options: ['Suruh kementerian kewangan merancang', 'Beritahu rakyat mereka akan dapat bahagian', 'Diam dulu sampai ia tiba'],
    results: [
      'Perancangan dibuat senyap-senyap dan waras, dan kementerian lain dah awal-awal dijawab tak.',
      'Rakyat suka janji tu. Kementerian kewangan tak suka disuruh tunaikannya.',
      'Tak ada apa dikatakan, dan semua orang bayangkan yang terbaik atau terburuk ikut selera.',
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
      'Peniaga dan kelas menengah bersorak. Defisit tak.',
    ],
  },
  stormWarn: {
    title: 'Bank pusat beri amaran ribut',
    body: 'Kelembapan di luar negara sedang menuju ke sini: tempahan jatuh, dan bank jangka ia sampai ke kilang dalam masa dua bulan. Ini amaran, bukan ramalan, dan apa yang anda buat sekarang menentukan betapa kuat ia melanda.',
    options: ['Bina simpanan penampan sekarang', 'Teruskan macam dirancang', 'Dapatkan kemudahan kredit daripada kawan di luar negara'],
    results: [
      'Perbelanjaan ditahan, dan belum ada yang berterima kasih.',
      'Perbelanjaan diteruskan. Ribut tetap dalam perjalanan.',
      'Kemudahan kredit dipersetujui senyap-senyap, dengan harga budi.',
    ],
  },
  dip: {
    title: 'Kelembapan, lebih ringan daripada dijangka',
    body: 'Kejutan dah tiba dan, sebab kerajaan nampak ia datang, ia bukan kes paling teruk. Kilang kurangkan syif, bukan tutup. Ada keputusan nak dibuat pasal berapa banyak nak dilindungi.',
    options: ['Lindungi dengan rangsangan', 'Tahan perbelanjaan'],
    results: [
      'Rangsangan lembutkan hentaman dan tambah komitmen.',
      'Anda berpegang pada garis. Ada kerja hilang, tapi bajet bertahan.',
    ],
  },
  crash: {
    title: 'Kejatuhan',
    body: 'Kejutan dah tiba dan tak ada siapa bersedia. Tempahan eksport runtuh, seorang pemberi pinjaman bekukan kredit, dan setiap bank dalam negara telefon menteri kewangan.',
    options: ['Rangsangan besar, dengan pinjaman', 'Penjimatan: potong dan tahan', 'Selamatkan bank'],
    results: [
      'Rangsangan kekalkan kilang beroperasi dan hutang menaik.',
      'Pemotongan dalam dan ekonomi perlahan lagi. Akaun dikekalkan jujur.',
      'Bank diselamatkan. Pengundi akan ingat siapa yang diselamatkan.',
    ],
  },
};
