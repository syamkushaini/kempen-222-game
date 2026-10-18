import type { EventText } from './events';

// A scandal at the cabinet table, other nations’ quarrels, and the year’s seasons, in English and Bahasa Malaysia.
// Other nations are never named. A result written as a pair is for a gamble: what is reported if it comes off, then if it does not.

export const SEASON_EVENTS_EN: Record<string, EventText> = {
  ministerScandal: {
    title: 'The minister and the press conference',
    body: 'A minister of your own party has been named in a story that will not go away: contracts, a cousin, and a house nobody can explain. The cameras are outside, and so is a crowd. You are expected to say something.',
    options: ['Sack the minister now', 'Stand by them in front of the cameras', 'Suspend them while the facts are found'],
    results: [
      'It is over by lunchtime. The post is yours to fill, and the party’s faith in its own judgement is a little bruised.',
      ['The cameras left unconvinced but unfed. Nobody could find anything new, and the story died.', 'More came out the next day, and the press conference was played back on every channel.'],
      'A stand-in holds the desk. It looks careful and it looks slow, and both are true.',
    ],
  },
  ksuMemo: {
    title: 'A memo from the head of the civil service',
    body: 'The Chief Secretary has sent a note marked personal. It runs to four pages and says, politely, that the government’s plans for the year are either not affordable, not legal, or not what the minister told the Cabinet. He has attached a version of his own.',
    options: ['Follow his advice', 'Overrule him, and say why', 'Ask the Palace for a new Chief Secretary'],
    results: [
      'The plans are trimmed to fit. The civil service remembers who listened.',
      'It goes ahead as the government wished. The Chief Secretary says he has noted it, which in his service is a threat.',
      'The Palace obliges, in its own time. The new one has no history with you, and none against.',
    ],
  },
  speakerRuling: {
    title: 'The Speaker rules',
    body: 'The Speaker has ruled a motion in order that the government says is not, and the House is in uproar. Members are on their feet, and the rule book is open in three places.',
    options: ['Accept the ruling, and move on', 'Challenge the ruling, and take the vote', 'Walk out in protest'],
    results: [
      'The House moves on. Nobody remembers who gave way, which is how it should be.',
      ['The challenge failed, and the Speaker was embarrassed. It is a good day for the government.', 'The House voted the ruling stood, and the government looked foolish.'],
      'The walkout made the evening news. It made nothing else.',
    ],
  },
  adviserUltimatum: {
    title: 'A word, please',
    body: 'One of your three advisers has asked for a quiet word, and has closed the door. They have said the same thing three times now, in three different ways, and the third time was in writing. They would like to know whether anyone is listening.',
    options: ['Listen, and do something about it', 'Thank them, and carry on', 'Let them go, and find someone who agrees with you'],
    results: [
      'They left the room looking ten years younger. It will be remembered.',
      'They said nothing, which is what they do before they say something. They will be back.',
      'A new face is at the table. The old one is not yet at anyone else’s, which is a mercy.',
    ],
  },
  courtCase: {
    title: 'A summons',
    body: 'The summons arrived at breakfast. It concerns something from before you were a leader, or something that the party has done since, and it has been carefully worded by someone who knows what the newspapers will print. The lawyers are in the hall. Your whole career is on the table.',
    options: ['Fight it, with the best lawyers money can find', 'Settle quietly, and pay', 'Step down, and take it as a private citizen'],
    results: [
      ['The court found for you. It was a long fortnight, and you will not forget who stood outside.', 'The court did not find for you. It is over, and so is the career.'],
      'It was settled before it was heard. The sum was large and the story was larger.',
      'You left by the side door and said little. The party said less.',
    ],
  },
  borderStandoff: {
    title: 'Boots at the border',
    body: 'A neighbour’s patrols have crossed a line on the map that neither of you has ever agreed on. A local commander has called it provocation, and the cameras are already at the post.',
    options: ['Send in the forces and say so, loudly', 'Quiet talks, through the people who know each other', 'Take it to the regional grouping'],
    results: [
      ['They withdrew. The heartland likes a government that does not blink.', 'They did not. The tension is a month old, and so is the bill.'],
      'It was settled over tea, which is how these things are meant to be settled and not how they are remembered.',
      'The grouping will mediate. It will take its time, and so will everyone else.',
    ],
  },
  sanctionsThreat: {
    title: 'Tariffs, or else',
    body: 'A great power has told your trade minister that a package of tariffs is coming unless your government drops a rule on foreign investors. The exporters are frightened, and the people who vote for rules are not.',
    options: ['Drop the rule', 'Hold firm and say so', 'Look for new markets, quietly'],
    results: [
      'The tariffs are shelved. The rule is gone, and the exporters thank you in private.',
      ['They blinked. Your standing abroad is the better for it.', 'They did not. The tariffs came on the first of the month, and the exporters have noticed who is to blame.'],
      'It will take two years and cost a good deal. The exporters call it prudent, and the opposition calls it flight.',
    ],
  },
  strandedAbroad: {
    title: 'Citizens stranded',
    body: 'A war has closed an airspace, and four thousand of your citizens, students, pilgrims and workers, are stuck on the wrong side. The families have found the phone numbers of every minister.',
    options: ['Charter flights, whatever they cost', 'Leave it to the embassies', 'Call for donations and volunteers'],
    results: [
      'They come home in a week, and are filmed kissing the tarmac. It was not cheap.',
      'The embassies did what they could. The families tell the cameras how much that was.',
      ['The money came in, and so did the volunteers. It was a good week to be a Malaysian.', 'It raised less than it cost the reputation. People ask why a government had to ask.'],
    ],
  },
  monsoon: {
    title: 'The monsoon comes again',
    body: 'The rains have come down on the east coast and the river towns again, as they do at the end of every year. The water is in the schools, and so is every camera. Whoever is in office is judged on the first week, and whoever is not is judged on whether they came.',
    options: ['Mobilise everything and everyone, now', 'Send the ministers and wait for the water to fall', 'Say it is the states’ business'],
    results: [
      'The boats were in the water before the rain stopped. The towns will remember who came.',
      ['The water fell, and the cameras left. The ministers were thanked for coming.', 'The water did not fall quickly. The ministers were photographed in dry boots.'],
      'It is true in the books, and it will not be forgiven on the day.',
    ],
  },
  haze: {
    title: 'The haze season',
    body: 'The sky is the colour of milk. The schools are closed, the airports are slow, and every mask in the country has doubled in price. The fires are across the water, but the lungs are here.',
    options: ['Close the schools, fund the clinics, seed the clouds', 'Take it up with the neighbours, firmly', 'Wait for the wind to change'],
    results: [
      'The air cleared in time for the exams, which is the thing parents will remember.',
      'The neighbours promised to do something. The wind changed first.',
      'The wind changed in the end. In between, a good many people got ill, and a good many did the sums.',
    ],
  },
  priceSurge: {
    title: 'Prices go up again',
    body: 'Cooking oil, chicken and eggs have all gone up in a month. The traders blame the weather and the importers blame the exchange rate, and the housewives blame the government, in public, with their shopping.',
    options: ['Cap the prices by order', 'Help the poorest with vouchers', 'Call for patience'],
    results: [
      'The shelves are cheaper, and in some shops emptier. Small traders are furious.',
      'The vouchers arrive. They are not enough, and they are counted.',
      'Patience is requested. It is not supplied.',
    ],
  },
};

export const SEASON_EVENTS_MS: Record<string, EventText> = {
  ministerScandal: {
    title: 'Menteri dan sidang akhbar',
    body: 'Seorang menteri daripada parti anda sendiri disebut dalam satu berita yang tak mahu reda: kontrak, seorang sepupu, dan sebuah rumah yang tak ada siapa boleh jelaskan. Kamera di luar, orang ramai pun sama. Anda dijangka cakap sesuatu.',
    options: ['Pecat menteri tu sekarang', 'Pertahankan dia depan kamera', 'Gantung dia sementara fakta dicari'],
    results: [
      'Selesai sebelum tengah hari. Jawatan tu anda yang kena isi, dan keyakinan parti terhadap pertimbangan sendiri sikit lebam.',
      ['Kamera pergi tak yakin tapi tak dapat apa-apa. Tak ada siapa jumpa benda baharu, dan berita tu mati.', 'Esoknya lebih banyak terbongkar, dan sidang akhbar tu diulang di setiap saluran.'],
      'Seorang pemangku pegang meja tu. Nampak berhati-hati dan nampak lambat, dan dua-dua betul.',
    ],
  },
  ksuMemo: {
    title: 'Memo daripada ketua perkhidmatan awam',
    body: 'Ketua Setiausaha Negara hantar nota bertanda peribadi. Empat halaman, dan ia kata, dengan sopan, rancangan kerajaan tahun ni sama ada tak mampu dibiayai, tak sah, atau bukan apa yang menteri cakap kepada Kabinet. Dia lampirkan versinya sendiri.',
    options: ['Ikut nasihatnya', 'Atasi dia, dan terangkan sebabnya', 'Minta Istana lantik Ketua Setiausaha baharu'],
    results: [
      'Rancangan dipotong untuk muat. Perkhidmatan awam ingat siapa yang dengar.',
      'Ia diteruskan macam kerajaan nak. Ketua Setiausaha kata dia dah catat, yang dalam perkhidmatannya maksudnya ugutan.',
      'Istana menurut, pada masanya sendiri. Yang baharu tak ada sejarah dengan anda, dan tak ada yang menentang.',
    ],
  },
  speakerRuling: {
    title: 'Speaker memutuskan',
    body: 'Speaker putuskan satu usul sebagai teratur, yang kerajaan kata tak, dan Dewan kecoh. Ahli berdiri, dan buku peraturan dibuka di tiga tempat.',
    options: ['Terima keputusan tu, dan teruskan', 'Cabar keputusan tu, dan ambil undi', 'Keluar sebagai bantahan'],
    results: [
      'Dewan teruskan. Tak ada siapa ingat siapa yang mengalah, macam sepatutnya.',
      ['Cabaran gagal, dan Speaker malu. Hari yang baik untuk kerajaan.', 'Dewan undi keputusan tu kekal, dan kerajaan nampak bodoh.'],
      'Walkout tu masuk berita malam. Tak masuk apa-apa yang lain.',
    ],
  },
  adviserUltimatum: {
    title: 'Sepatah kata, tolong',
    body: 'Seorang daripada tiga penasihat anda minta sepatah kata senyap, dan tutup pintu. Mereka dah cakap benda yang sama tiga kali, dengan tiga cara berbeza, dan kali ketiga secara bertulis. Mereka nak tahu ada orang dengar ke tak.',
    options: ['Dengar, dan buat sesuatu', 'Ucap terima kasih, dan teruskan', 'Lepaskan mereka, dan cari orang yang setuju dengan anda'],
    results: [
      'Mereka keluar bilik nampak sepuluh tahun lebih muda. Ia akan diingati.',
      'Mereka tak cakap apa-apa, itulah yang mereka buat sebelum cakap sesuatu. Mereka akan balik.',
      'Ada muka baharu di meja. Yang lama belum di meja orang lain, satu rahmat.',
    ],
  },
  courtCase: {
    title: 'Saman',
    body: 'Saman tiba masa sarapan. Ia pasal sesuatu sebelum anda jadi pemimpin, atau sesuatu yang parti dah buat sejak tu, dan ia dirangka teliti oleh orang yang tahu apa akhbar akan cetak. Peguam di dewan. Seluruh kerjaya anda atas meja.',
    options: ['Lawan, dengan peguam terbaik yang duit boleh dapat', 'Selesaikan senyap-senyap, dan bayar', 'Letak jawatan, dan hadapi sebagai rakyat biasa'],
    results: [
      ['Mahkamah memihak anda. Dua minggu yang panjang, dan anda tak akan lupa siapa yang berdiri di luar.', 'Mahkamah tak memihak anda. Dah selesai, kerjaya pun sama.'],
      'Ia diselesaikan sebelum dibicarakan. Jumlahnya besar dan ceritanya lebih besar.',
      'Anda keluar ikut pintu tepi dan cakap sikit. Parti cakap lagi sikit.',
    ],
  },
  borderStandoff: {
    title: 'Kasut tentera di sempadan',
    body: 'Rondaan jiran melintasi satu garisan pada peta yang dua-dua pihak tak pernah setuju. Seorang pegawai tempatan panggil ia provokasi, dan kamera dah ada di pos tu.',
    options: ['Hantar pasukan dan umumkan kuat-kuat', 'Rundingan senyap, melalui orang yang saling kenal', 'Bawa ke pertubuhan serantau'],
    results: [
      ['Mereka berundur. Orang kampung suka kerajaan yang tak kelip mata.', 'Mereka tak berundur. Ketegangan dah sebulan, bilnya pun sama.'],
      'Diselesaikan sambil minum teh, macam mana hal begini sepatutnya diselesaikan, bukan macam mana ia diingati.',
      'Pertubuhan tu akan jadi pengantara. Ia ambil masa, semua orang pun sama.',
    ],
  },
  sanctionsThreat: {
    title: 'Tarif, kalau tak…',
    body: 'Sebuah kuasa besar beritahu menteri perdagangan anda yang satu pakej tarif akan datang kecuali kerajaan anda gugurkan satu peraturan ke atas pelabur asing. Pengeksport takut, dan mereka yang undi untuk peraturan tu tak.',
    options: ['Gugurkan peraturan tu', 'Tetap pendirian dan umumkan', 'Cari pasaran baharu, senyap-senyap'],
    results: [
      'Tarif ditangguhkan. Peraturan tu hilang, dan pengeksport berterima kasih secara peribadi.',
      ['Mereka berkelip. Kedudukan anda di luar negara lebih baik kerananya.', 'Mereka tak. Tarif berkuat kuasa pada hari pertama bulan tu, dan pengeksport dah perasan siapa yang dipersalahkan.'],
      'Ia ambil dua tahun dan banyak kos. Pengeksport kata berhemat, pembangkang kata lari.',
    ],
  },
  strandedAbroad: {
    title: 'Rakyat terkandas',
    body: 'Satu peperangan tutup ruang udara, dan empat ribu rakyat anda, pelajar, jemaah dan pekerja, terkandas di sebelah yang salah. Keluarga mereka dah jumpa nombor telefon setiap menteri.',
    options: ['Pesawat sewa, berapa pun kosnya', 'Serahkan kepada kedutaan', 'Seru derma dan sukarelawan'],
    results: [
      'Mereka balik dalam seminggu, dan dirakam mencium landasan. Tak murah.',
      'Kedutaan buat apa yang boleh. Keluarga beritahu kamera betapa sikitnya tu.',
      ['Duit masuk, sukarelawan pun masuk. Minggu yang baik untuk jadi rakyat Malaysia.', 'Duit yang terkumpul kurang daripada kerosakan pada nama baik. Orang tanya kenapa kerajaan kena minta.'],
    ],
  },
  monsoon: {
    title: 'Monsun datang lagi',
    body: 'Hujan turun lebat di pantai timur dan bandar-bandar sungai lagi, macam setiap hujung tahun. Air dah masuk sekolah, kamera pula di mana-mana. Yang memerintah dinilai pada minggu pertama, yang tak memerintah dinilai sama ada mereka datang.',
    options: ['Gerakkan semua dan semua orang, sekarang', 'Hantar menteri dan tunggu air surut', 'Kata ni urusan negeri'],
    results: [
      'Bot dah dalam air sebelum hujan reda. Bandar-bandar tu akan ingat siapa yang datang.',
      ['Air surut, kamera pun pergi. Menteri diucap terima kasih sebab datang.', 'Air tak surut cepat. Menteri difoto dengan kasut yang kering.'],
      'Betul ikut buku, tapi tak akan dimaafkan pada hari kejadian.',
    ],
  },
  haze: {
    title: 'Musim jerebu',
    body: 'Langit warna susu. Sekolah ditutup, lapangan terbang perlahan, dan harga setiap pelitup muka di negara ni dah berganda. Api di seberang laut, tapi paru-paru kita di sini.',
    options: ['Tutup sekolah, biayai klinik, semai awan', 'Bangkitkan dengan jiran, dengan tegas', 'Tunggu angin bertukar'],
    results: [
      'Udara jernih tepat masa peperiksaan, itulah yang ibu bapa akan ingat.',
      'Jiran berjanji akan buat sesuatu. Angin bertukar dulu.',
      'Akhirnya angin bertukar. Di antaranya, ramai jatuh sakit, dan ramai mengira.',
    ],
  },
  priceSurge: {
    title: 'Harga naik lagi',
    body: 'Minyak masak, ayam dan telur semua naik dalam sebulan. Peniaga salahkan cuaca, pengimport salahkan kadar pertukaran, dan suri rumah salahkan kerajaan, depan orang ramai, bersama barang yang dibeli.',
    options: ['Tetapkan harga siling dengan perintah', 'Bantu yang termiskin dengan baucar', 'Minta bersabar'],
    results: [
      'Rak lebih murah, dan di sesetengah kedai lebih kosong. Peniaga kecil marah.',
      'Baucar tiba. Tak cukup, dan semua orang kira.',
      'Sabar diminta. Tak dibekalkan.',
    ],
  },
};
