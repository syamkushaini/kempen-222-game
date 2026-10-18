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
    body: 'Rakan gabungan perasan tiga kementerian terbaik dipegang parti anda sendiri, dan hantar nota sopan dengan senarai calon mereka. Notanya dua baris. Senarainya dua muka surat.',
    options: ['Bagi satu kementerian besar kepada rakan', 'Rombak penyokong setia anda sendiri dan jangan bagi rakan apa-apa yang baharu', 'Biar semua orang meneka beberapa minggu'],
    results: [
      'Rakan dapat kementerian tu dan bergambar masa angkat sumpah. Ahli parti anda sendiri perasan kementerian mana yang diberi.',
      'Kabinet berubah, dan tak ada siapa di luar parti anda terkejut yang tak ada apa pun berubah. Rakan mula mengira.',
      ['Penantian berlarutan, dan rakan putuskan satu kehormatan dibiarkan menunggu.', 'Penantian berlarutan, dan seorang rakan cakap, di koridor, ini “bukan gabungan yang sabar”.'],
    ],
  },
  giveawayBudget: {
    title: 'Pemberian menjelang pilihan raya',
    body: 'Pilihan raya dah tak jauh, dan penasihat anda datang dengan fail bertanda “Pemanis”. Dalamnya ada bantuan tunai untuk semua orang, pakej untuk golongan termiskin dan satu halaman bertajuk “Atau kita tak payah buat”. Mereka baca fail tu dua kali kuat-kuat.',
    options: ['Bantuan tunai untuk semua orang', 'Pakej untuk yang termiskin dan warga emas', 'Tahan diri, dan nyatakan sebabnya depan orang ramai'],
    results: [
      'Bantuan dibayar. Pengundi berterima kasih, ahli ekonomi tak, dan dua-dua cakap macam tu dalam rancangan televisyen yang sama.',
      'Pakej sampai kepada yang dimaksudkan, dan tak ada siapa mengadu kecuali bendahari parti anda sendiri.',
      'Anda tahan diri. Negara kata bertanggungjawab, calon anda sendiri guna perkataan lain.',
    ],
  },
  emergencyPowers: {
    title: 'Seruan kuasa darurat',
    body: 'Kemelesetan makin dalam, dan sekumpulan menteri anda sendiri minta kuasa darurat untuk meredah krisis, yang kata mereka Parlimen terlalu lambat nak tangani. Perlembagaan membenarkannya. Perlembagaan juga benarkan banyak benda yang tak ada siapa bangga.',
    options: ['Tolak, dan kata krisis ditangani di Dewan', 'Ambil kuasa terhad, enam bulan, dengan laporan', 'Ambil kuasa penuh, macam yang menteri minta'],
    results: [
      'Keputusan tu dikagumi peguam dan diabaikan pasaran, yang nakkan tindakan, bukan prinsip.',
      ['Kuasa terhad digunakan dengan berhati-hati, dan ekonomi stabil.', 'Kuasa terhad digunakan, dan dilanjutkan sebab dah biasa, dan peguam perasan.'],
      'Kuasa diambil. Ekonomi bergerak sikit, dan negara bergerak jauh lebih jauh daripada pihak anda.',
    ],
  },
  healthRumour: {
    title: 'Khabar angin pasal kesihatan anda',
    body: 'Khabar angin yang anda tak sihat dah berlegar seminggu, daripada mesej yang bermula dengan “sepupu saya kerja di hospital”. Pasaran gelisah, dan seorang menteri nampak berlatih ucapan penerimaan depan cermin.',
    options: ['Siarkan laporan perubatan penuh', 'Muncul depan orang ramai di setiap acara selama dua minggu', 'Berjenaka pasal benda ni, kuat dan selalu'],
    results: [
      'Laporan tu menyeluruh dan membosankan, dan khabar angin mati sebab bosan.',
      'Anda muncul di sembilan acara sehari dan nampak sihat, yang memenatkan, dan khabar angin hilang.',
      ['Jenaka tu diulang dengan setuju, dan sepupu tu terdedah sebagai sepupu.', 'Jenaka tu dianggap kejam, dan khabar angin kedua mula tumbuh atas yang pertama.'],
    ],
  },
  nationalAddress: {
    title: 'Sepatah kata kepada negara',
    body: 'Ekonomi perlahan dan berita penuh dengannya. Penasihat anda nak ucapan di televisyen, waktu petang, dengan bendera di belakang anda. Mereka tak sependapat apa yang patut anda cakap.',
    options: ['Tenangkan negara, dan minta bersabar', 'Umumkan pakej rangsangan', 'Kata ini ribut global dan tak ada siapa boleh elak'],
    results: [
      'Ucapan tenang, dan penonton pun tenang, walaupun ada yang kata mereka lebih suka ada pelan.',
      'Pakej diumumkan dengan angka, dan angka tu disemak dan didapati, sebahagian besarnya, benar.',
      'Hujah tu adil, tapi diterima sebagai alasan, nasib hujah adil yang dibuat oleh mereka yang berkuasa.',
    ],
  },
  stateVisit: {
    title: 'Lawatan negara',
    body: 'Pemimpin sebuah kuasa besar melawat, dan kementerian perdagangan ada perjanjian siap ditandatangani, dengan lawatan tu sebagai saatnya. Kementerian luar ada taklimat pasal rekod hak asasi pelawat tu yang lebih tebal daripada perjanjian.',
    options: ['Tandatangan perjanjian, dan simpan taklimat untuk kemudian', 'Bangkitkan kebimbangan hak asasi depan orang ramai, dan tetap tandatangan', 'Kekal pada upacara, dan jangan tandatangan apa-apa lagi'],
    results: [
      'Perjanjian ditandatangani, dengan jamuan, dan pengeksport gembira. Kumpulan hak asasi tulis surat panjang.',
      'Anda sebut dengan berhati-hati, dan pelawat kekal sopan. Akhbar panggil “berani”, kementerian perdagangan panggil “tak perlu”.',
      'Lawatan berlalu dalam kabus protokol. Akhirnya tak ada siapa boleh cakap apa yang dicapai.',
    ],
  },
  payReview: {
    title: 'Semakan gaji perkhidmatan awam',
    body: 'Semakan gaji perkhidmatan awam dah tiba, dan kesatuan perkhidmatan awam ada satu angka. Perbendaharaan ada angka lain. Jurang antara dua-duanya sebesar sebuah kementerian kecil, dan sejuta pengundi di seberangnya.',
    options: ['Beri kenaikan gaji sepenuhnya', 'Bekukan gaji setahun, dan nyatakan sebabnya', 'Berperingkat kenaikan tu selama tiga tahun'],
    results: [
      'Kenaikan diberi, perkhidmatan awam puji kerajaan, dan perbendaharaan hantar memorandum dengan beberapa garis bawah.',
      'Pembekuan diumumkan, dan jawapan kesatuan ialah perarakan dengan pancaragam.',
      ['Peringkat tu diterima, agak berat hati, dan bajet bertahan.', 'Peringkat tu ditolak, dan kesatuan bekerja perlahan, yang dalam perkhidmatan awam susah nak bezakan daripada biasa.'],
    ],
  },
  judicialPanel: {
    title: 'Hakim untuk dilantik',
    body: 'Tiga kerusi kanan di bangku kehakiman akan kosong, dan senarai mereka yang boleh isi dah tiba. Sesetengah nama ialah yang terbaik dalam profesion. Sesetengah diketahui kawan kepada kawan.',
    options: ['Serahkan pilihan kepada panel bebas', 'Pilih nama sendiri, dan percaya pertimbangan anda', 'Lanjutkan hakim sedia ada setahun lagi'],
    results: [
      'Panel pilih dengan baik, dan salah satu pilihannya putuskan menentang anda dalam bulan tu juga, yang, kata panel, membuktikan hujah.',
      ['Pilihan anda cekap, dan bangku berterima kasih secara senyap.', 'Pilihan anda dianggap kawan kepada kawan, dan peguam cakap macam tu, dalam kenyataan lebih satu muka surat.'],
      'Setahun diberi, dan masalah tu akan datang lagi, setahun lebih tua.',
    ],
  },
  seatTalks: {
    title: 'Kerusi untuk pilihan raya akan datang',
    body: 'Pilihan raya dah dekat, dan rakan nakkan lebih banyak kerusi daripada yang dimenangi kali lepas. Setiap seorang ada angka, dan angka tu berjumlah lebih daripada bilangan kerusi. Ketua perunding seorang rakan mula ayat dengan “dalam semua keadilan”.',
    options: ['Beri kerusi yang mereka minta', 'Kekalkan pendirian, dan kata pengundi yang putuskan', 'Tawar pertukaran: kurang kerusi di sini, bebas di sebuah negeri'],
    results: [
      'Rakan berpuas hati. Ketua bahagian anda sendiri mula tanya siapa parti kerajaan sebenar.',
      'Pendirian dikekalkan. Rakan kata ia “diambil maklum”, perkataan untuk dendam di hari-hari awal.',
      ['Pertukaran diterima, dan setiap pihak rasa ia untung, tanda sesuatu perjanjian.', 'Pertukaran diterima dan kemudian disalah baca, dan setiap pihak rasa ditipu.'],
    ],
  },
  inflationCommittee: {
    title: 'Jawatankuasa inflasi',
    body: 'Harga naik, dan kabinet tubuhkan jawatankuasa, macam biasa. Jawatankuasa tu ada tiga cadangan: had harga, subsidi gaji, atau janji serahkan kepada bank pusat. Ia minta Perdana Menteri pilih, supaya ia tak dipersalahkan.',
    options: ['Hadkan harga barang keperluan', 'Subsidikan gaji golongan bawah dan sederhana', 'Serahkan kepada bank pusat, dan umumkan'],
    results: [
      'Had harga bertahan beberapa minggu. Rak di beberapa kedai kemudian kosong, dan peniaga kata ia kebetulan, dengan nada yang bukan begitu.',
      'Subsidi dibayar, dan perbendaharaan mula tambah lajur dalam jadualnya.',
      'Bank pusat naikkan kadar, harga menyejuk, dan beberapa firma kecil tercungap-cungap.',
    ],
  },
  railStrike: {
    title: 'Pekerja keretapi',
    body: 'Pekerja keretapi undi untuk mogok, mulai Isnin, sebab tawaran gaji yang mereka panggil “penghinaan kepada landasan”. Itu lawak mereka sendiri. Kereta api akan berhenti, kesabaran penumpang pun sama.',
    options: ['Runding kenaikan gaji', 'Rujuk kepada timbang tara, dan minta bersabar', 'Isytihar keretapi perkhidmatan penting, dan haramkan mogok'],
    results: [
      'Kenaikan dipersetujui malam Ahad. Kereta api jalan hari Isnin, dan perbendaharaan tengah berfikir.',
      ['Penimbang tara jumpa kompromi, dan kedua-dua pihak tuntut ia sebagai kemenangan.', 'Penimbang tara lambat, mogok berlangsung juga, dan penumpang belajar sejauh mana mereka boleh berbasikal.'],
      'Larangan dikenakan. Pekerja balik kerja, dengan dendam, dan sebahagian besar negara rasa anda dah keterlaluan.',
    ],
  },
  mpAllowance: {
    title: 'Elaun ahli Parlimen',
    body: 'Elaun ahli Parlimen tak berubah sebelas tahun, dan jawatankuasa syorkan kenaikan yang, katanya, sederhana. Orang awam tak nampak macam tu. Ia tajuk berita yang menunggu Perdana Menteri lulus.',
    options: ['Luluskan kenaikan tu', 'Tolak, buat masa ni', 'Kaitkan dengan kenaikan gaji perkhidmatan awam, supaya ia ikut dan tak mendahului'],
    results: [
      'Kenaikan diluluskan. Ahli anda berterima kasih, dan pengundi, dengan cara paling sopan, tak.',
      'Kenaikan ditolak. Orang awam anggap keputusan baik, dan ahli anda sendiri sangat senyap sejak itu.',
      'Pautan dibuat. Tak memuaskan sesiapa, dan diserang dari dua-dua pihak, jadi anda boleh panggil ia adil.',
    ],
  },
};
