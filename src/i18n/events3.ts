import type { EventText } from './events';

// The challenges of governing, in English and Bahasa Malaysia. Other nations are
// never named. A result written as a pair is for a gamble: what is reported if
// it comes off, then if it does not.

export const GOVERNING_EVENTS_EN: Record<string, EventText> = {
  wardsFull: {
    title: 'Beds in the corridors',
    body: 'The hospitals are full. Patients wait on trolleys in the corridors, and a nurse’s tearful video from the emergency ward has been watched four million times.',
    options: ['Fund an emergency wards-and-staff package', 'Tell the states to manage with what they have', 'Contract private hospitals to take the overflow'],
    results: [
      'New wards open within the quarter. The treasury is poorer, the corridors are emptier.',
      'The states say they were given the responsibility and not the money. They are right, and the press says so.',
      'The queues shorten. So does the patience of those who wanted a public hospital.',
    ],
  },
  outbreak: {
    title: 'A fever that spreads',
    body: 'An infectious disease has appeared in two states and is moving. The health ministry wants an answer by tonight, and every option costs something.',
    options: ['Close the borders and the schools', 'Targeted measures: test, trace, isolate', 'Wait for another week of figures'],
    results: [
      'It is contained. So, for a while, is the economy, and the neighbours remember the borders.',
      ['It works, and the ministry is praised for its calm.', 'It spreads faster than the tracers can follow, and the public blame you for being half-hearted.'],
      ['The figures settle, and nobody is the wiser.', 'The figures did not settle. A week lost is a month of regret.'],
    ],
  },
  examResults: {
    title: 'The results nobody wanted',
    body: 'This year’s national exam results are the worst in a decade. Parents are furious, teachers are blaming the syllabus, and the syllabus is blaming everyone.',
    options: ['Fund tuition and more teachers where results are weakest', 'Say it is the legacy of years of mismanagement', 'Quietly lower the pass mark'],
    results: [
      'It will take years to show, but the first schools report better attendance already.',
      'It is true in part, and nobody applauds a blame game.',
      'The pass rate rises overnight. Employers notice that the learning did not.',
    ],
  },
  campusProtest: {
    title: 'Students at the gates',
    body: 'Thousands of students have walked out over fees and loan repayments. They have a banner, a hashtag and, you notice, a very good press officer.',
    options: ['Offer a partial write-off of student loans', 'Meet them and hear them out', 'Wait for the semester to end'],
    results: [
      'The crowds go home pleased. The treasury does not.',
      ['They came expecting a lecture and got a listening ear. It buys real goodwill.', 'They did not believe you meant it, and the hall emptied before you finished.'],
      'The semester did end. The grievance did not.',
    ],
  },
  teacherStrike: {
    title: 'Teachers threaten to strike',
    body: 'The teachers’ union has set a deadline. Class sizes, pay and paperwork are all on the list, and the exam season is six weeks away.',
    options: ['Agree a pay and workload package', 'Negotiate, and bet that they blink first', 'Refuse: public servants must not strike'],
    results: [
      'The strike notice is withdrawn. The classrooms get a better year.',
      ['They blinked. The settlement costs less than they asked.', 'They did not. Some schools closed for ten days, and parents remember whom to blame.'],
      'The strike was avoided, and so was any goodwill. Good teachers have started to leave.',
    ],
  },
  ratingsWarning: {
    title: 'A warning from the rating agencies',
    body: 'Two international agencies have put the country’s credit on negative watch. Debt is high and growing, they say, and the markets are listening.',
    options: ['An austerity package: cuts across the board', 'New revenue: taxes on businesses and the comfortable', 'Dismiss the agencies as meddlers'],
    results: [
      'The agencies approve. The wards, schools and consumers feel it.',
      'The books improve, and every business lobby in the country is at your door.',
      ['The agencies back off, and you look bold.', 'The currency wobbled and the cost of borrowing rose. The agencies were not bluffing.'],
    ],
  },
  tradeDispute: {
    title: 'Tariffs on our exports',
    body: 'A major trading partner has announced tariffs on our main exports, citing “unfair practices” your officials can’t quite identify.',
    options: ['Retaliate with tariffs of our own', 'Negotiate quietly through the trade officials', 'Concede on their terms'],
    results: [
      'Prices rise at home and the farmers cheer. The partner says it is open to talks, in a month.',
      ['The tariffs are cut by half. The officials are quietly pleased.', 'The talks drag, and the exporters lose the season.'],
      'The tariffs are lifted. The papers call it a surrender, but the factories keep running.',
    ],
  },
  seaIncident: {
    title: 'Boats in our waters',
    body: 'Foreign patrol vessels have been loitering near our offshore platforms for a week, and the fishermen say they are being harassed. A navy admiral is on your phone.',
    options: ['Send the navy in a show of strength', 'Protest through diplomatic channels', 'Ask a regional mediator to look into it'],
    results: [
      ['The boats leave. The fishermen cheer.', 'A confrontation, a shouted exchange on live radio, and a diplomatic cable you would rather not read.'],
      'A strongly worded note, and a strongly worded reply. Nothing moves.',
      'The mediator will report in two months. In the meantime, the boats stay.',
    ],
  },
  mediationAward: {
    title: 'The mediator rules',
    body: 'The regional mediator has delivered a finding on the sea dispute. It gives each side something and neither side what it wanted.',
    options: ['Accept the ruling', 'Reject it'],
    results: [
      'Respected abroad, and resented by those who wanted a victory at home.',
      'The nationalists cheer. Our partners abroad do not.',
    ],
  },
  summitHost: {
    title: 'Our turn to host',
    body: 'It is your country’s turn to host the regional leaders’ summit. The foreign ministry is delighted. The finance ministry has seen the venue’s price.',
    options: ['Host it with full pomp', 'A modest summit, a modest bill', 'Pass the chair to someone else'],
    results: [
      'The cameras love it and the guests are charmed. The bill arrives a quarter later.',
      'Efficient, if unremarkable. Nobody complains.',
      'The chair passes. So, noticeably, does some of our standing.',
    ],
  },
  refugeeBoats: {
    title: 'Boats on the horizon',
    body: 'Boats carrying people fleeing trouble in a neighbouring country have reached our coast. There are children among them. There are also people with strong opinions on the shore.',
    options: ['Allow temporary shelter', 'Turn the boats back', 'Take the matter to the regional bloc'],
    results: [
      'It is humane, and noticed abroad. At home the heartland is not pleased.',
      'The coastline is quiet. The world’s newspapers are not.',
      ['The bloc agreed to share the burden, and you look statesmanlike.', 'The bloc held three meetings and agreed on a communiqué. The boats are still there.'],
    ],
  },
  investorDelegation: {
    title: 'A very large factory',
    body: 'A foreign manufacturer will build a large plant here, if it receives generous tax holidays. A neighbouring country has offered similar. The delegation is staying at a very nice hotel.',
    options: ['Offer the incentives', 'Insist on local hiring and technology transfer', 'Decline: our industries first'],
    results: [
      'The plant is announced. The treasury forgoes revenue, and thousands get jobs.',
      ['They agreed, to everyone’s surprise. Young workers get real training.', 'They went to the neighbour. The deal that fell through was the headline.'],
      'You kept your principles and your factories’ market share. The investors went elsewhere.',
    ],
  },
  twoPowers: {
    title: 'Two great powers, one invitation each',
    body: 'Two great powers have each invited you to join their economic and security arrangements. They watch each other and they are watching you.',
    options: ['Lean towards the first', 'Lean towards the second', 'Stay carefully neutral'],
    results: [
      'Contracts follow. So does the displeasure of the other, and the opposition says you sold our independence.',
      'Contracts follow, and the other side takes note. A grumbling opposition calls it a betrayal.',
      ['Neutral and respected: both sides call you a friend.', 'Neutral, and distrusted by both. A lonely position.'],
    ],
  },
  royaltiesRow: {
    title: 'The royalties row',
    body: 'Sabah and Sarawak are asking for a larger share of oil and gas revenue, citing the terms on which the federation was formed. Their leaders are in the corridor, and their patience is not.',
    options: ['Agree to the full share they ask', 'Offer a smaller increase now and review later', 'Refuse: the federal budget cannot bear it'],
    results: [
      'The Borneo leaders praise you. The peninsular treasury grumbles.',
      'A compromise nobody loves and everyone can live with.',
      'The Borneo leaders walk out. The press asks whether the federation is working.',
    ],
  },
  palaceConcern: {
    title: 'The ruler is uneasy',
    body: 'Word has reached you, through the usual channels, that the Palace is troubled by a recent government decision. Nobody has said so in public. Nobody needs to.',
    options: ['Seek an audience and listen', 'Carry on: the government was elected'],
    results: [
      'You left with a better understanding and nothing in writing. It was enough.',
      ['It passed unremarked and your position grew firmer.', 'The Palace’s displeasure became known, and the coalition wondered whether you had lost the room.'],
    ],
  },
  stateDefiance: {
    title: 'A state says no',
    body: 'A state government run by a rival party has refused to implement a federal directive. It cites its own powers, a lawyer and a lot of adjectives.',
    options: ['Use federal powers to compel it', 'Negotiate a compromise behind the scenes', 'Let it pass'],
    results: [
      'The directive is enforced. The state’s leaders are now very much your opponents.',
      'A quiet settlement. The state saves face, and you save the directive.',
      'The directive is quietly shelved, and others take notice that it can be done.',
    ],
  },
};

export const GOVERNING_EVENTS_MS: Record<string, EventText> = {
  wardsFull: {
    title: 'Katil di koridor',
    body: 'Hospital penuh. Pesakit menunggu atas troli di koridor, dan video seorang jururawat menangis di wad kecemasan sudah ditonton empat juta kali.',
    options: ['Biayai pakej wad dan kakitangan kecemasan', 'Suruh negeri uruskan dengan apa yang ada', 'Kontrakkan hospital swasta untuk menampung limpahan'],
    results: [
      'Wad baharu dibuka dalam suku tahun ini. Perbendaharaan lebih miskin, koridor lebih lengang.',
      'Negeri-negeri kata mereka diberi tanggungjawab tetapi bukan wang. Mereka betul, dan akhbar menyebutnya.',
      'Barisan memendek. Begitu juga kesabaran mereka yang mahu hospital awam.',
    ],
  },
  outbreak: {
    title: 'Demam yang merebak',
    body: 'Penyakit berjangkit muncul di dua negeri dan sedang bergerak. Kementerian kesihatan mahu jawapan malam ini, dan setiap pilihan ada harganya.',
    options: ['Tutup sempadan dan sekolah', 'Langkah bersasar: uji, jejak, asingkan', 'Tunggu angka seminggu lagi'],
    results: [
      'Ia terkawal. Ekonomi pun terkawal buat seketika, dan jiran ingat soal sempadan.',
      ['Ia berkesan, dan kementerian dipuji kerana tenang.', 'Ia merebak lebih laju daripada pengesan boleh ikut, dan orang ramai salahkan anda kerana separuh hati.'],
      ['Angka menjadi stabil, dan tiada siapa tahu apa-apa.', 'Angka tidak stabil. Seminggu yang hilang jadi sebulan kesal.'],
    ],
  },
  examResults: {
    title: 'Keputusan yang tiada siapa mahu',
    body: 'Keputusan peperiksaan kebangsaan tahun ini yang paling teruk dalam sedekad. Ibu bapa marah, guru salahkan sukatan, dan sukatan salahkan semua orang.',
    options: ['Biayai tuisyen dan lebih guru di tempat paling lemah', 'Kata ini warisan bertahun-tahun pengurusan buruk', 'Diam-diam turunkan markah lulus'],
    results: [
      'Ia akan ambil masa bertahun-tahun, tetapi sekolah pertama sudah melaporkan kehadiran lebih baik.',
      'Ada betulnya, dan tiada siapa bertepuk tangan untuk main salah-menyalahkan.',
      'Kadar lulus naik semalaman. Majikan perasan pembelajaran tidak naik.',
    ],
  },
  campusProtest: {
    title: 'Pelajar di pintu pagar',
    body: 'Ribuan pelajar berarak keluar kerana yuran dan bayaran balik pinjaman. Mereka ada sepanduk, hashtag dan, anda perasan, pegawai akhbar yang sangat bagus.',
    options: ['Tawarkan hapus kira sebahagian pinjaman pelajar', 'Jumpa mereka dan dengar', 'Tunggu semester tamat'],
    results: [
      'Orang ramai pulang gembira. Perbendaharaan tidak.',
      ['Mereka datang untuk dengar syarahan dan dapat telinga yang mendengar. Ia membina muhibah sebenar.', 'Mereka tak percaya anda ikhlas, dan dewan kosong sebelum anda habis cakap.'],
      'Semester memang tamat. Rungutan tidak.',
    ],
  },
  teacherStrike: {
    title: 'Guru ugut mogok',
    body: 'Kesatuan guru sudah menetapkan tarikh akhir. Saiz kelas, gaji dan kerja kertas semuanya dalam senarai, dan musim peperiksaan tinggal enam minggu.',
    options: ['Setuju pakej gaji dan beban kerja', 'Berunding, dan bertaruh mereka mengalah dulu', 'Tolak: penjawat awam tidak boleh mogok'],
    results: [
      'Notis mogok ditarik balik. Bilik darjah dapat tahun yang lebih baik.',
      ['Mereka mengalah. Penyelesaiannya lebih murah daripada yang mereka minta.', 'Mereka tidak mengalah. Beberapa sekolah tutup sepuluh hari, dan ibu bapa ingat siapa untuk disalahkan.'],
      'Mogok dielakkan, begitu juga muhibah. Guru yang baik mula berhijrah.',
    ],
  },
  ratingsWarning: {
    title: 'Amaran daripada agensi penarafan',
    body: 'Dua agensi antarabangsa meletakkan kredit negara dalam pemantauan negatif. Hutang tinggi dan meningkat, kata mereka, dan pasaran sedang mendengar.',
    options: ['Pakej penjimatan: potongan merata', 'Hasil baharu: cukai ke atas perniagaan dan yang berada', 'Tolak agensi sebagai penyibuk'],
    results: [
      'Agensi bersetuju. Wad, sekolah dan pengguna merasainya.',
      'Kewangan bertambah baik, dan setiap kumpulan pelobi perniagaan berada di pintu anda.',
      ['Agensi berundur, dan anda nampak berani.', 'Mata wang bergoyang dan kos pinjaman naik. Agensi itu tidak menggertak.'],
    ],
  },
  tradeDispute: {
    title: 'Tarif ke atas eksport kita',
    body: 'Sebuah rakan dagang besar mengumumkan tarif ke atas eksport utama kita, dengan alasan “amalan tidak adil” yang pegawai anda tidak dapat kenal pasti.',
    options: ['Balas dengan tarif kita sendiri', 'Berunding senyap melalui pegawai perdagangan', 'Akur dengan syarat mereka'],
    results: [
      'Harga naik di dalam negara dan petani bersorak. Rakan dagang kata terbuka untuk berunding, sebulan lagi.',
      ['Tarif dipotong separuh. Para pegawai senyap-senyap gembira.', 'Rundingan berlarutan, dan pengeksport kehilangan musim.'],
      'Tarif ditarik balik. Akhbar menyebutnya menyerah, tetapi kilang terus berjalan.',
    ],
  },
  seaIncident: {
    title: 'Bot di perairan kita',
    body: 'Kapal rondaan asing berlegar berhampiran pelantar luar pesisir kita seminggu, dan nelayan kata mereka diganggu. Seorang laksamana tentera laut di telefon anda.',
    options: ['Hantar tentera laut sebagai unjuk kekuatan', 'Bantah melalui saluran diplomatik', 'Minta pengantara serantau menyiasat'],
    results: [
      ['Bot-bot itu pergi. Nelayan bersorak.', 'Satu konfrontasi, pertukaran jerit di radio langsung, dan kabel diplomatik yang anda lebih rela tidak baca.'],
      'Nota bantahan keras, dan balasan keras. Tiada apa bergerak.',
      'Pengantara akan melapor dalam dua bulan. Sementara itu, bot-bot kekal.',
    ],
  },
  mediationAward: {
    title: 'Pengantara memutuskan',
    body: 'Pengantara serantau sudah menyampaikan keputusan tentang pertikaian laut. Ia beri setiap pihak sesuatu dan tiada pihak apa yang dimahukan.',
    options: ['Terima keputusan itu', 'Tolak'],
    results: [
      'Dihormati di luar negara, dan dibenci mereka yang mahu kemenangan di dalam negara.',
      'Para nasionalis bersorak. Rakan kita di luar negara tidak.',
    ],
  },
  summitHost: {
    title: 'Giliran kita menjadi tuan rumah',
    body: 'Giliran negara anda menjadi tuan rumah sidang kemuncak pemimpin serantau. Kementerian luar gembira. Kementerian kewangan sudah nampak harga tempatnya.',
    options: ['Anjurkan dengan penuh kemeriahan', 'Sidang sederhana, bil sederhana', 'Serahkan kerusi kepada orang lain'],
    results: [
      'Kamera suka dan tetamu terpikat. Bilnya sampai suku tahun kemudian.',
      'Cekap, walaupun biasa. Tiada siapa merungut.',
      'Kerusi bertukar tangan. Begitu juga, ketara, sebahagian kedudukan kita.',
    ],
  },
  refugeeBoats: {
    title: 'Bot di ufuk',
    body: 'Bot yang membawa orang yang melarikan diri daripada kekacauan di negara jiran sudah sampai ke pantai kita. Ada kanak-kanak dalamnya. Ada juga orang berpendirian kuat di pantai.',
    options: ['Benarkan perlindungan sementara', 'Halau bot-bot itu balik', 'Bawa perkara ini kepada blok serantau'],
    results: [
      'Ia berperikemanusiaan, dan dilihat di luar negara. Di dalam negara, orang kampung tidak senang.',
      'Pantai tenang. Akhbar dunia tidak.',
      ['Blok bersetuju berkongsi beban, dan anda nampak seperti negarawan.', 'Blok mengadakan tiga mesyuarat dan bersetuju dengan satu komunike. Bot-bot masih di situ.'],
    ],
  },
  investorDelegation: {
    title: 'Sebuah kilang yang sangat besar',
    body: 'Sebuah pengilang asing akan membina loji besar di sini, jika menerima cuti cukai yang murah hati. Sebuah negara jiran menawarkan yang serupa. Delegasi menginap di hotel yang sangat selesa.',
    options: ['Tawarkan insentif', 'Tegaskan pengambilan tempatan dan pemindahan teknologi', 'Tolak: industri kita dahulu'],
    results: [
      'Loji diumumkan. Perbendaharaan melepaskan hasil, dan ribuan dapat kerja.',
      ['Mereka bersetuju, di luar jangkaan semua orang. Pekerja muda dapat latihan sebenar.', 'Mereka pergi ke jiran. Perjanjian yang gagal itu jadi tajuk berita.'],
      'Anda kekalkan prinsip dan bahagian pasaran kilang anda. Pelabur pergi ke tempat lain.',
    ],
  },
  twoPowers: {
    title: 'Dua kuasa besar, satu jemputan setiap satu',
    body: 'Dua kuasa besar masing-masing menjemput anda menyertai susunan ekonomi dan keselamatan mereka. Mereka memerhati satu sama lain dan sedang memerhati anda.',
    options: ['Condong kepada yang pertama', 'Condong kepada yang kedua', 'Kekal neutral dengan berhati-hati'],
    results: [
      'Kontrak menyusul. Begitu juga rasa tidak puas hati pihak satu lagi, dan pembangkang kata anda jual kedaulatan kita.',
      'Kontrak menyusul, dan pihak satu lagi mencatatnya. Pembangkang yang merungut menyebutnya pengkhianatan.',
      ['Neutral dan dihormati: kedua-dua pihak memanggil anda kawan.', 'Neutral, dan tidak dipercayai kedua-duanya. Kedudukan yang sunyi.'],
    ],
  },
  royaltiesRow: {
    title: 'Pertikaian royalti',
    body: 'Sabah dan Sarawak meminta bahagian lebih besar hasil minyak dan gas, merujuk syarat pembentukan persekutuan. Pemimpin mereka di koridor, dan kesabaran mereka tidak.',
    options: ['Setuju bahagian penuh yang mereka minta', 'Tawar kenaikan lebih kecil sekarang dan semak kemudian', 'Tolak: belanjawan persekutuan tak mampu menanggungnya'],
    results: [
      'Pemimpin Borneo memuji anda. Perbendaharaan semenanjung merungut.',
      'Kompromi yang tiada siapa suka dan semua boleh terima.',
      'Pemimpin Borneo keluar dewan. Akhbar bertanya adakah persekutuan berfungsi.',
    ],
  },
  palaceConcern: {
    title: 'Tuanku tidak senang',
    body: 'Khabar sampai kepada anda, melalui saluran biasa, bahawa Istana risau tentang satu keputusan kerajaan baru-baru ini. Tiada siapa menyebutnya di khalayak. Tiada siapa perlu.',
    options: ['Mohon menghadap dan dengar', 'Teruskan: kerajaan ini dipilih rakyat'],
    results: [
      'Anda pulang dengan pemahaman lebih baik dan tiada apa bertulis. Ia mencukupi.',
      ['Ia berlalu tanpa disebut dan kedudukan anda bertambah kukuh.', 'Rasa tidak senang Istana jadi pengetahuan umum, dan gabungan tertanya-tanya sama ada anda sudah hilang tempat.'],
    ],
  },
  stateDefiance: {
    title: 'Sebuah negeri berkata tidak',
    body: 'Sebuah kerajaan negeri yang dipimpin parti lawan enggan melaksanakan arahan persekutuan. Ia memetik kuasanya sendiri, seorang peguam dan banyak kata sifat.',
    options: ['Guna kuasa persekutuan untuk memaksa', 'Berunding kompromi di belakang tabir', 'Biarkan berlalu'],
    results: [
      'Arahan dikuatkuasakan. Pemimpin negeri itu kini benar-benar lawan anda.',
      'Penyelesaian senyap. Negeri itu jaga air muka, dan anda selamatkan arahan.',
      'Arahan diketepikan senyap-senyap, dan orang lain perasan ia boleh dilakukan.',
    ],
  },
};
