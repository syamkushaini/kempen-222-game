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
    body: 'Seorang menteri parti anda sendiri disebut dalam satu berita yang tidak mahu reda: kontrak, seorang sepupu, dan sebuah rumah yang tiada siapa boleh jelaskan. Kamera di luar, begitu juga orang ramai. Anda dijangka berkata sesuatu.',
    options: ['Pecat menteri itu sekarang', 'Pertahankan mereka di depan kamera', 'Gantung mereka sementara fakta dicari'],
    results: [
      'Selesai sebelum tengah hari. Jawatan itu anda yang perlu isi, dan keyakinan parti terhadap pertimbangannya sendiri sedikit lebam.',
      ['Kamera pergi tanpa yakin tetapi tanpa makanan. Tiada siapa menemui apa-apa yang baharu, dan berita itu mati.', 'Lebih banyak terbongkar keesokan harinya, dan sidang akhbar itu diulang di setiap saluran.'],
      'Seorang pemangku memegang meja itu. Ia kelihatan berhati-hati dan kelihatan lambat, dan kedua-duanya benar.',
    ],
  },
  courtCase: {
    title: 'Saman',
    body: 'Saman tiba pada waktu sarapan. Ia tentang sesuatu sebelum anda menjadi pemimpin, atau sesuatu yang parti telah lakukan sejak itu, dan ia dirangka dengan teliti oleh seseorang yang tahu apa akan dicetak akhbar. Peguam di dewan. Seluruh kerjaya anda di atas meja.',
    options: ['Lawan, dengan peguam terbaik yang wang boleh dapat', 'Selesaikan secara senyap, dan bayar', 'Letak jawatan, dan terima sebagai rakyat biasa'],
    results: [
      ['Mahkamah memihak anda. Dua minggu yang panjang, dan anda tak akan lupa siapa yang berdiri di luar.', 'Mahkamah tidak memihak anda. Ia sudah selesai, begitu juga kerjaya.'],
      'Ia diselesaikan sebelum dibicarakan. Jumlahnya besar dan ceritanya lebih besar.',
      'Anda keluar melalui pintu tepi dan berkata sedikit. Parti berkata kurang.',
    ],
  },
  borderStandoff: {
    title: 'Kasut tentera di sempadan',
    body: 'Rondaan jiran telah melintasi garisan pada peta yang tidak pernah dipersetujui oleh kedua-dua pihak. Seorang pegawai tempatan menyebutnya provokasi, dan kamera sudah berada di pos itu.',
    options: ['Hantar pasukan dan katakannya dengan lantang', 'Rundingan senyap, melalui orang yang saling mengenali', 'Bawa ke pertubuhan serantau'],
    results: [
      ['Mereka berundur. Kawasan pedalaman suka kerajaan yang tidak berkelip.', 'Mereka tidak berundur. Ketegangan sudah sebulan umurnya, begitu juga bilnya.'],
      'Ia diselesaikan sambil minum teh, iaitu cara perkara begini sepatutnya diselesaikan dan bukan cara ia diingati.',
      'Pertubuhan itu akan menjadi pengantara. Ia akan mengambil masa, dan semua orang pun begitu.',
    ],
  },
  sanctionsThreat: {
    title: 'Tarif, atau lain-lain',
    body: 'Sebuah kuasa besar telah memberitahu menteri perdagangan anda bahawa satu pakej tarif akan datang melainkan kerajaan anda menggugurkan satu peraturan ke atas pelabur asing. Pengeksport takut, dan mereka yang mengundi untuk peraturan tidak.',
    options: ['Gugurkan peraturan itu', 'Tetap pendirian dan katakannya', 'Cari pasaran baharu, secara senyap'],
    results: [
      'Tarif itu ditangguhkan. Peraturan itu hilang, dan pengeksport berterima kasih secara peribadi.',
      ['Mereka berkelip. Kedudukan anda di luar negara lebih baik kerananya.', 'Mereka tidak. Tarif itu berkuat kuasa pada hari pertama bulan itu, dan pengeksport sudah perasan siapa yang dipersalahkan.'],
      'Ia akan mengambil dua tahun dan banyak kos. Pengeksport menyebutnya berhemat, dan pembangkang menyebutnya lari.',
    ],
  },
  strandedAbroad: {
    title: 'Rakyat terkandas',
    body: 'Satu peperangan telah menutup ruang udara, dan empat ribu rakyat anda, pelajar, jemaah dan pekerja, terkandas di sebelah yang salah. Keluarga mereka telah menjumpai nombor telefon setiap menteri.',
    options: ['Pesawat sewa, berapa pun kosnya', 'Serahkan kepada kedutaan', 'Seru derma dan sukarelawan'],
    results: [
      'Mereka pulang dalam seminggu, dan difilemkan mencium landasan. Ia tidak murah.',
      'Kedutaan melakukan apa yang boleh. Keluarga memberitahu kamera betapa sedikitnya itu.',
      ['Wang masuk, begitu juga sukarelawan. Ia minggu yang baik untuk menjadi rakyat Malaysia.', 'Ia mengumpul kurang daripada kerosakan nama. Orang bertanya mengapa kerajaan perlu meminta.'],
    ],
  },
  monsoon: {
    title: 'Monsun datang lagi',
    body: 'Hujan turun lebat di pantai timur dan bandar-bandar sungai lagi, seperti setiap hujung tahun. Air sudah masuk ke sekolah, dan kamera di mana-mana. Yang memerintah dinilai pada minggu pertama, dan yang tidak dinilai sama ada mereka datang.',
    options: ['Gerakkan semuanya dan semua orang, sekarang', 'Hantar menteri dan tunggu air surut', 'Katakan ia urusan negeri'],
    results: [
      'Bot sudah di dalam air sebelum hujan reda. Bandar-bandar itu akan ingat siapa yang datang.',
      ['Air surut, dan kamera pergi. Menteri diucapkan terima kasih kerana datang.', 'Air tidak surut cepat. Menteri difoto dengan kasut yang kering.'],
      'Ia benar menurut buku, dan tidak akan dimaafkan pada hari itu.',
    ],
  },
  haze: {
    title: 'Musim jerebu',
    body: 'Langit berwarna susu. Sekolah ditutup, lapangan terbang perlahan, dan setiap pelitup muka di negara ini harganya berganda. Api di seberang laut, tetapi paru-paru di sini.',
    options: ['Tutup sekolah, biayai klinik, semai awan', 'Bangkitkan dengan jiran, dengan tegas', 'Tunggu angin bertukar'],
    results: [
      'Udara jernih tepat pada masa peperiksaan, iaitu perkara yang akan diingati ibu bapa.',
      'Jiran berjanji akan berbuat sesuatu. Angin bertukar dahulu.',
      'Angin akhirnya bertukar. Di antaranya, ramai jatuh sakit, dan ramai mengira.',
    ],
  },
  priceSurge: {
    title: 'Harga naik lagi',
    body: 'Minyak masak, ayam dan telur semuanya naik dalam sebulan. Peniaga menyalahkan cuaca dan pengimport menyalahkan kadar pertukaran, dan suri rumah menyalahkan kerajaan, di khalayak ramai, bersama barang belian mereka.',
    options: ['Tetapkan harga siling dengan perintah', 'Bantu yang termiskin dengan baucar', 'Minta kesabaran'],
    results: [
      'Rak lebih murah, dan di sesetengah kedai lebih kosong. Peniaga kecil marah.',
      'Baucar tiba. Ia tidak mencukupi, dan ia dikira.',
      'Kesabaran diminta. Ia tidak dibekalkan.',
    ],
  },
};
