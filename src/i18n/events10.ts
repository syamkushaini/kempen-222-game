import type { EventText } from './events';

// What lands on the desk of someone who leads the government, in English and Bahasa Malaysia. Every person, company and body in
// them is invented. A result written as a pair is for a gamble: what is reported if it comes off, then if it does not.

export const PM_EVENTS_EN: Record<string, EventText> = {
  cabinetReshuffle: {
    title: 'The reshuffle',
    body: 'The coalition partners have noticed that three of the best ministries are held by your own party, and have sent a polite note with a list of their own candidates. The note is two lines long. The list is two pages.',
    options: ['Give a partner one of the big ministries', 'Reshuffle your own loyalists and give the partners nothing new', 'Keep everyone guessing for a few weeks'],
    results: [
      'The partner got the ministry and a photograph of the swearing-in. Your own party noticed which ministry it was.',
      'The cabinet changed, and nobody outside your party was surprised that nothing had. The partners have started to count.',
      ['The waiting went on, and the partners decided it was an honour to be kept waiting.', 'The waiting went on, and a partner said, in a corridor, that it was “not a patient coalition”.'],
    ],
  },
  giveawayBudget: {
    title: 'The giveaway',
    body: 'The election is not far off, and your advisers have come with a folder marked “Sweeteners”. It holds a cash handout for everyone, a package for the poorest and a page headed “Or you could just not”. They have read the folder aloud twice.',
    options: ['A cash handout for everyone', 'A package for the poorest and the elderly', 'Hold back, and say why in public'],
    results: [
      'The handout was paid. The voters were grateful, and the economists were not, and both said so on the same television programme.',
      'The package reached those it was meant for, and nobody complained except the party’s own treasurer.',
      'You held back. The country called it responsible, and your own candidates called it a different word.',
    ],
  },
  emergencyPowers: {
    title: 'The call for emergency powers',
    body: 'The slump is deep, and a group of your own ministers have asked for emergency powers to ride out the crisis, which they say Parliament is too slow to manage. The constitution allows it. The constitution also allows many things that nobody has been proud of.',
    options: ['Refuse, and say the crisis will be met in the House', 'Take limited powers, for six months, with a report', 'Take the full powers, as the ministers ask'],
    results: [
      'The decision was admired by lawyers and ignored by markets, which wanted action and not principles.',
      ['The limited powers were used carefully, and the economy steadied.', 'The limited powers were used, and extended by habit, and the lawyers noticed.'],
      'The powers were taken. The economy moved a little, and the country moved a great deal further from your side.',
    ],
  },
  healthRumour: {
    title: 'The rumour about your health',
    body: 'A rumour that you are unwell has been running for a week, from a message that began with “my cousin works at the hospital”. The market has been twitchy, and a minister has been seen practising an acceptance speech in the mirror.',
    options: ['Publish a full medical report', 'Appear in public at every event for a fortnight', 'Joke about it, loudly and often'],
    results: [
      'The report was thorough and dull, and the rumour died of boredom.',
      'You appeared at nine events a day and looked well, which was tiring, and the rumour went away.',
      ['The joke was repeated approvingly, and the cousin was unmasked as a cousin.', 'The joke was thought callous, and a second rumour began to grow on the first.'],
    ],
  },
  nationalAddress: {
    title: 'A word to the nation',
    body: 'The economy is slowing and the news is full of it. Your advisers want an address on television, in the evening, with the flag behind you. They disagree about what you should say.',
    options: ['Reassure the country, and ask for patience', 'Announce a stimulus package', 'Say it is a global storm and that nobody could have steered round it'],
    results: [
      'The address was calm, and viewers were calmed, though some said they would have preferred a plan.',
      'The package was announced with figures, and the figures were checked and found to be, in large part, true.',
      'The point was fair, and it was received as an excuse, which is the fate of fair points made by those in office.',
    ],
  },
  stateVisit: {
    title: 'The state visit',
    body: 'A great power’s leader is visiting, and the trade ministry has a deal ready to sign, with the visit as its moment. The foreign ministry has a briefing about the visitor’s record on rights that is thicker than the deal.',
    options: ['Sign the deal, and keep the briefing for later', 'Raise the rights concerns in public, and sign anyway', 'Keep to ceremony, and sign nothing yet'],
    results: [
      'The deal was signed, with a banquet, and the exporters were delighted. The rights groups wrote a long letter.',
      'You said it with care, and the visitor stayed polite. The papers called it “brave” and the trade ministry called it “unnecessary”.',
      'The visit passed in a haze of protocol. No one could say what, in the end, had been achieved.',
    ],
  },
  payReview: {
    title: 'The civil service pay review',
    body: 'The civil service pay review is due, and the public service union has a figure. The treasury has another. The gap between them is the size of a small ministry, and there are a million voters on the other side of it.',
    options: ['Grant the pay rise in full', 'Freeze pay for a year, and say why', 'Phase the rise over three years'],
    results: [
      'The rise was granted, the civil service sang the praises of the government, and the treasury sent a memorandum with several underlinings.',
      'The freeze was announced, and the union’s reply was a march with brass band.',
      ['The phasing was accepted, a little grudgingly, and the budget survived.', 'The phasing was rejected, and the union went slow, which in a civil service is hard to tell from usual.'],
    ],
  },
  judicialPanel: {
    title: 'Judges to appoint',
    body: 'Three senior seats on the bench are about to be vacant, and the list of those who might fill them has arrived. Some of the names are the very best the profession has. Some are known to be friends of friends.',
    options: ['Hand the choice to an independent panel', 'Choose the names yourself, and trust your judgement', 'Extend the present judges for another year'],
    results: [
      'The panel chose well, and one of its choices ruled against you within the month, which, said the panel, proved the point.',
      ['Your choices were able, and the bench was quietly grateful.', 'Your choices were thought to be friends of friends, and the bar said so, in a statement of more than one page.'],
      'The year was granted, and the problem will arrive again, a year older.',
    ],
  },
  seatTalks: {
    title: 'The seats for the next election',
    body: 'The election is on the way, and the partners want more seats than they won last time. Each of them has a figure, and the figures add up to more than there are seats. A partner’s chief negotiator has started a sentence with “in all fairness”.',
    options: ['Concede the seats they ask for', 'Hold the line, and tell the partners that the voters decide', 'Offer them an exchange: fewer seats here, a free hand in a state'],
    results: [
      'The partners were satisfied. Your own division chiefs have started to ask who the real party of government is.',
      'The line was held. The partners said it was “noted”, which is the word for a grudge in the early days.',
      ['The exchange was accepted, and each side thought it had done well, which is the sign of a deal.', 'The exchange was accepted and then misread, and each side thought it had been cheated.'],
    ],
  },
  inflationCommittee: {
    title: 'The inflation committee',
    body: 'Prices are climbing, and the cabinet has formed a committee, as it does. The committee has three proposals: a price cap, a wage subsidy, or a promise to leave it to the central bank. It has asked the Prime Minister to choose, so that it can be blamed for none.',
    options: ['Cap the prices of essentials', 'Subsidise wages for the lower and middle income', 'Leave it to the central bank, and say so'],
    results: [
      'The cap held for a few weeks. The shelves in some shops were then empty, and the traders said it was a coincidence, in a tone that was not.',
      'The subsidy was paid, and the treasury has started adding a column to its tables.',
      'The central bank raised rates, prices cooled, and a number of small firms were left a little breathless.',
    ],
  },
  railStrike: {
    title: 'The railway workers',
    body: 'The railway workers have voted to strike, from Monday, over a pay offer they call “an insult to the sleepers”. The pun was theirs. The trains will stop, and so will the commuters’ patience.',
    options: ['Negotiate a raise', 'Refer it to arbitration, and ask for patience', 'Declare the railways an essential service, and ban the strike'],
    results: [
      'The raise was agreed on Sunday night. The trains ran on Monday, and the treasury is thinking.',
      ['The arbitrator found for a compromise, and both sides claimed it as a victory.', 'The arbitrator was slow, the strike went ahead anyway, and commuters learned how far they could cycle.'],
      'The ban was made. The workers went back, resentfully, and a large part of the country thought you had gone too far.',
    ],
  },
  mpAllowance: {
    title: 'The MPs’ allowance',
    body: 'The allowances for MPs have not changed in eleven years, and a committee has recommended a rise that is, it says, modest. The public has not seen it that way. It is a headline waiting for a Prime Minister to approve it.',
    options: ['Approve the rise', 'Refuse it, for now', 'Link it to the civil service pay rise, so it follows and does not lead'],
    results: [
      'The rise was approved. Your members were grateful, and the voters, in the nicest possible way, were not.',
      'The rise was refused. The public thought it a fine decision, and your own members have been remarkably quiet since.',
      'The link was made. It satisfied no one, and was attacked from both sides, so that you were able to call it fair.',
    ],
  },
};

export const PM_EVENTS_MS: Record<string, EventText> = {
  cabinetReshuffle: {
    title: 'Rombakan kabinet',
    body: 'Rakan gabungan perasan tiga kementerian terbaik dipegang parti anda sendiri, dan menghantar nota sopan dengan senarai calon mereka. Nota itu dua baris. Senarainya dua muka surat.',
    options: ['Beri satu kementerian besar kepada rakan', 'Rombak penyokong setia anda sendiri dan jangan beri rakan apa-apa yang baharu', 'Biarkan semua orang meneka beberapa minggu'],
    results: [
      'Rakan mendapat kementerian itu dan gambar upacara mengangkat sumpah. Parti anda sendiri perasan kementerian yang mana.',
      'Kabinet berubah, dan tiada siapa di luar parti anda terkejut tiada apa yang berubah. Rakan mula mengira.',
      ['Penantian berlarutan, dan rakan memutuskan satu kehormatan dibiarkan menunggu.', 'Penantian berlarutan, dan seorang rakan berkata, di koridor, ia “bukan gabungan yang sabar”.'],
    ],
  },
  giveawayBudget: {
    title: 'Pemberian menjelang pilihan raya',
    body: 'Pilihan raya tidak jauh lagi, dan penasihat anda datang dengan fail bertanda “Pemanis”. Ia mengandungi bantuan tunai untuk semua orang, pakej untuk golongan termiskin dan satu halaman bertajuk “Atau kita tak buat sahaja”. Mereka membaca fail itu dua kali dengan lantang.',
    options: ['Bantuan tunai untuk semua orang', 'Pakej untuk yang termiskin dan warga emas', 'Menahan diri, dan nyatakan sebabnya di khalayak'],
    results: [
      'Bantuan itu dibayar. Pengundi berterima kasih, dan ahli ekonomi tidak, dan kedua-duanya berkata begitu dalam rancangan televisyen yang sama.',
      'Pakej itu sampai kepada yang dimaksudkan, dan tiada siapa mengadu kecuali bendahari parti anda sendiri.',
      'Anda menahan diri. Negara menyebutnya bertanggungjawab, dan calon anda sendiri menyebutnya perkataan lain.',
    ],
  },
  emergencyPowers: {
    title: 'Seruan kuasa darurat',
    body: 'Kemelesetan semakin dalam, dan sekumpulan menteri anda sendiri meminta kuasa darurat untuk meredah krisis, yang kata mereka Parlimen terlalu lambat menanganinya. Perlembagaan membenarkannya. Perlembagaan juga membenarkan banyak perkara yang tiada siapa bangga.',
    options: ['Tolak, dan katakan krisis ditangani di Dewan', 'Ambil kuasa terhad, enam bulan, dengan laporan', 'Ambil kuasa penuh, seperti yang diminta menteri'],
    results: [
      'Keputusan itu dikagumi peguam dan diabaikan pasaran, yang mahukan tindakan dan bukan prinsip.',
      ['Kuasa terhad digunakan dengan berhati-hati, dan ekonomi stabil.', 'Kuasa terhad digunakan, dan dilanjutkan kerana kebiasaan, dan peguam perasan.'],
      'Kuasa itu diambil. Ekonomi bergerak sedikit, dan negara bergerak jauh lebih jauh daripada pihak anda.',
    ],
  },
  healthRumour: {
    title: 'Khabar angin tentang kesihatan anda',
    body: 'Khabar angin bahawa anda tidak sihat telah berlegar seminggu, daripada mesej yang bermula dengan “sepupu saya kerja di hospital”. Pasaran gelisah, dan seorang menteri dilihat berlatih ucapan penerimaan di cermin.',
    options: ['Siarkan laporan perubatan penuh', 'Muncul di khalayak di setiap acara selama dua minggu', 'Berjenaka tentangnya, dengan lantang dan selalu'],
    results: [
      'Laporan itu menyeluruh dan membosankan, dan khabar angin itu mati kerana bosan.',
      'Anda muncul di sembilan acara sehari dan kelihatan sihat, yang memenatkan, dan khabar angin hilang.',
      ['Jenaka itu diulang dengan setuju, dan sepupu itu didedahkan sebagai sepupu.', 'Jenaka itu dianggap kejam, dan khabar angin kedua mula tumbuh di atas yang pertama.'],
    ],
  },
  nationalAddress: {
    title: 'Sepatah kata kepada negara',
    body: 'Ekonomi perlahan dan berita penuh dengannya. Penasihat anda mahukan ucapan di televisyen, pada waktu petang, dengan bendera di belakang anda. Mereka tidak sependapat tentang apa yang patut anda katakan.',
    options: ['Menenangkan negara, dan minta kesabaran', 'Umumkan pakej rangsangan', 'Katakan ia ribut global dan tiada siapa dapat mengelaknya'],
    results: [
      'Ucapan itu tenang, dan penonton tenang, walaupun ada yang berkata mereka lebih suka ada rancangan.',
      'Pakej diumumkan dengan angka, dan angka itu disemak dan didapati, sebahagian besarnya, benar.',
      'Hujah itu adil, dan diterima sebagai alasan, nasib hujah adil yang dibuat oleh mereka yang berkuasa.',
    ],
  },
  stateVisit: {
    title: 'Lawatan negara',
    body: 'Pemimpin sebuah kuasa besar melawat, dan kementerian perdagangan ada perjanjian siap ditandatangani, dengan lawatan itu sebagai saatnya. Kementerian luar ada taklimat tentang rekod hak asasi pelawat itu yang lebih tebal daripada perjanjian.',
    options: ['Tandatangani perjanjian, dan simpan taklimat untuk kemudian', 'Bangkitkan kebimbangan hak asasi di khalayak, dan tetap tandatangan', 'Kekal pada upacara, dan jangan tandatangan apa-apa lagi'],
    results: [
      'Perjanjian ditandatangani, dengan jamuan, dan pengeksport gembira. Kumpulan hak asasi menulis surat panjang.',
      'Anda menyatakannya dengan berhati-hati, dan pelawat kekal sopan. Akhbar menyebutnya “berani” dan kementerian perdagangan menyebutnya “tidak perlu”.',
      'Lawatan berlalu dalam kabus protokol. Tiada siapa dapat mengatakan apa yang dicapai akhirnya.',
    ],
  },
  payReview: {
    title: 'Semakan gaji perkhidmatan awam',
    body: 'Semakan gaji perkhidmatan awam sudah tiba, dan kesatuan perkhidmatan awam ada angka. Perbendaharaan ada yang lain. Jurang antara keduanya sebesar sebuah kementerian kecil, dan sejuta pengundi berada di seberangnya.',
    options: ['Beri kenaikan gaji sepenuhnya', 'Bekukan gaji setahun, dan nyatakan sebabnya', 'Berperingkat kenaikan itu selama tiga tahun'],
    results: [
      'Kenaikan diberi, perkhidmatan awam memuji kerajaan, dan perbendaharaan menghantar memorandum dengan beberapa garis bawah.',
      'Pembekuan diumumkan, dan jawapan kesatuan ialah perarakan dengan pancaragam.',
      ['Pengperingkatan diterima, agak berat hati, dan belanjawan bertahan.', 'Pengperingkatan ditolak, dan kesatuan bekerja perlahan, yang dalam perkhidmatan awam sukar dibezakan daripada biasa.'],
    ],
  },
  judicialPanel: {
    title: 'Hakim untuk dilantik',
    body: 'Tiga kerusi kanan di bangku kehakiman akan kosong, dan senarai mereka yang boleh mengisinya sudah tiba. Sesetengah nama ialah yang terbaik dalam profesion. Sesetengah diketahui kawan kepada kawan.',
    options: ['Serahkan pilihan kepada panel bebas', 'Pilih nama sendiri, dan percaya pada pertimbangan anda', 'Lanjutkan hakim sedia ada setahun lagi'],
    results: [
      'Panel memilih dengan baik, dan salah satu pilihannya memutuskan menentang anda dalam bulan itu, yang, kata panel, membuktikan hujah.',
      ['Pilihan anda cekap, dan bangku itu berterima kasih secara senyap.', 'Pilihan anda dianggap kawan kepada kawan, dan peguam berkata demikian, dalam kenyataan lebih satu muka surat.'],
      'Setahun diberi, dan masalah itu akan tiba lagi, setahun lebih tua.',
    ],
  },
  seatTalks: {
    title: 'Kerusi untuk pilihan raya akan datang',
    body: 'Pilihan raya sudah dekat, dan rakan mahukan lebih banyak kerusi daripada yang dimenangi kali lalu. Setiap seorang ada angka, dan angka itu berjumlah lebih daripada bilangan kerusi. Ketua perunding seorang rakan memulakan ayat dengan “dalam semua keadilan”.',
    options: ['Beri kerusi yang mereka minta', 'Kekalkan pendirian, dan katakan pengundi yang memutuskan', 'Tawarkan pertukaran: kurang kerusi di sini, kebebasan di sebuah negeri'],
    results: [
      'Rakan berpuas hati. Ketua bahagian anda sendiri mula bertanya siapa parti kerajaan sebenar.',
      'Pendirian dikekalkan. Rakan berkata ia “diambil maklum”, perkataan bagi dendam pada hari-hari awal.',
      ['Pertukaran diterima, dan setiap pihak merasa ia berjaya, tanda sesuatu perjanjian.', 'Pertukaran diterima dan kemudian disalah baca, dan setiap pihak merasa ditipu.'],
    ],
  },
  inflationCommittee: {
    title: 'Jawatankuasa inflasi',
    body: 'Harga naik, dan kabinet menubuhkan jawatankuasa, seperti biasa. Jawatankuasa itu ada tiga cadangan: had harga, subsidi gaji, atau janji menyerahkannya kepada bank pusat. Ia meminta Perdana Menteri memilih, supaya ia tidak dipersalahkan.',
    options: ['Hadkan harga barang keperluan', 'Subsidikan gaji golongan bawah dan sederhana', 'Serahkan kepada bank pusat, dan katakan demikian'],
    results: [
      'Had harga bertahan beberapa minggu. Rak di beberapa kedai kemudian kosong, dan peniaga berkata ia kebetulan, dengan nada yang bukan begitu.',
      'Subsidi dibayar, dan perbendaharaan mula menambah lajur dalam jadualnya.',
      'Bank pusat menaikkan kadar, harga menyejuk, dan beberapa firma kecil tercungap-cungap.',
    ],
  },
  railStrike: {
    title: 'Pekerja keretapi',
    body: 'Pekerja keretapi mengundi untuk mogok, mulai Isnin, kerana tawaran gaji yang mereka sebut “penghinaan kepada landasan”. Mainan kata itu mereka punya. Kereta api akan berhenti, begitu juga kesabaran penumpang.',
    options: ['Runding kenaikan gaji', 'Rujuk kepada timbang tara, dan minta kesabaran', 'Isytiharkan keretapi perkhidmatan penting, dan haramkan mogok'],
    results: [
      'Kenaikan dipersetujui malam Ahad. Kereta api berjalan pada hari Isnin, dan perbendaharaan berfikir.',
      ['Penimbang tara menemui kompromi, dan kedua-dua pihak menuntutnya sebagai kemenangan.', 'Penimbang tara lambat, mogok berlangsung juga, dan penumpang belajar sejauh mana mereka boleh berbasikal.'],
      'Larangan dikenakan. Pekerja kembali bekerja, dengan dendam, dan sebahagian besar negara fikir anda sudah keterlaluan.',
    ],
  },
  mpAllowance: {
    title: 'Elaun ahli Parlimen',
    body: 'Elaun ahli Parlimen tidak berubah sebelas tahun, dan jawatankuasa mengesyorkan kenaikan yang, katanya, sederhana. Orang awam tidak melihatnya begitu. Ia tajuk berita yang menunggu Perdana Menteri meluluskannya.',
    options: ['Luluskan kenaikan itu', 'Tolak, buat masa ini', 'Kaitkan dengan kenaikan gaji perkhidmatan awam, supaya ia mengikut dan tidak mendahului'],
    results: [
      'Kenaikan diluluskan. Ahli anda berterima kasih, dan pengundi, dengan cara paling sopan, tidak.',
      'Kenaikan ditolak. Orang awam menganggapnya keputusan baik, dan ahli anda sendiri sangat senyap sejak itu.',
      'Pautan dibuat. Ia tidak memuaskan sesiapa, dan diserang dari kedua-dua pihak, supaya anda dapat menyebutnya adil.',
    ],
  },
};
