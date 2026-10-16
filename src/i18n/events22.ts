import type { EventText } from './events';

// Fifteen decisions that move the PESTEL meters and the two defence meters, in English and Bahasa Malaysia. Every place, office and person
// is invented. A result written as a pair is for a gamble: the win, then the loss.

export const FORCES_AND_PESTEL_EN: Record<string, EventText> = {
  navyPatrolBoats: {
    title: 'Seven Boats, Two Engines',
    body: 'At the Teluk Merpati jetty, the coast patrol has seven boats and, between them, two working engines. The shipyard says the spares arrive next quarter, as they have said for four quarters running. Fishermen have started waving at the patrol from their own boats, kindly, as one waves at a relative who is trying.',
    options: ['Pay for a proper refit', 'Make do and rotate the engines', 'Promise the boats by monsoon, and hope'],
    results: [
      'Five boats are back on the water by the new season and the coast looks guarded. The refit fund is spent and other works wait their turn.',
      'The two engines go from boat to boat like a borrowed lawnmower. The savings are real; so is the gap in the patrol rota.',
      ['The promise is kept by a hair and a good deal of overtime. The jetty is quietly proud of itself.', 'The monsoon comes first. A smuggler’s trawler sails past a patrol that cannot follow, and the country hears about it from abroad.'],
    ],
  },
  forcesProcurementRow: {
    title: 'Forty Kitchens, Gold Taps',
    body: 'The armed forces want forty mobile field kitchens, priced at what forty small restaurants would cost, tasting menus included. Nobody in the ministry will say who wrote the specification, though it fits one supplier as a glove fits a hand. The forces’ council would take an audit as an insult. The newspapers would take it as news.',
    options: ['Order an audit of the whole tender', 'Approve it and keep the peace', 'Ask the minister to explain, quietly'],
    results: [
      'The audit finds padded lines and a supplier with a very good friend. The law is seen to apply to uniforms too, and the forces’ council does not forget who asked.',
      'The kitchens are bought, the council is pleased and the forces’ say in the next tender grows. A reporter notes the price per kitchen and keeps the note.',
      'The minister explains for an hour and nothing changes. Nobody is cross, and nobody is persuaded either.',
    ],
  },
  forcesHousingDemand: {
    title: 'A Respectful Letter on Gold-Edged Paper',
    body: 'The armed forces council has written to you, very respectfully, to ask for better housing allowances, a new training ground and a seat at every table where defence is mentioned. The copy to the newspapers arrived before the original. The letter ends: “We trust the government will see the wisdom of this.”',
    options: ['Grant the allowances and the ground', 'Refuse, politely and in public', 'Offer a phased deal over three budgets'],
    results: [
      'The allowances are paid and the camps are cheerful. The council now knows the letter works, and civil servants ask about their own allowances.',
      'You hold the line and the country sees who governs. The council takes it in silence, which is worse than shouting, and the Cabinet feels the chill.',
      ['The phased deal is accepted with a stiff nod. The council goes back to its camps for now.', 'The council reads “phased” as “refused.” A second letter is written, on thicker paper, and the coalition is nervous.'],
    ],
  },
  borderSensorsDown: {
    title: 'The Sensors Say Nothing',
    body: 'Half the border sensors have gone quiet. The ministry says it is a software fault; the garrison says it is a rat in a cable; the villagers say they have not seen a patrol since the last election. A neighbouring ministry has politely asked whether anything is wrong, in the tone of someone who knows.',
    options: ['Pay for an emergency repair', 'Borrow patrols from the district police', 'Announce a review and say no more'],
    results: [
      'The sensors hum again within a fortnight and the garrison finds the rat. The border looks watched, and the country’s neighbours stop asking.',
      'The district police cover the gaps for now. The heartland grumbles about empty police posts, and the sensors stay quiet.',
      'The review is announced and the gaps stay open. A neighbour’s paper writes that the country’s border is “a suggestion,” and the quote travels.',
    ],
  },
  nationalDayFlypast: {
    title: 'The Flypast Is Over Budget',
    body: 'The National Day committee wants a grander flypast this year: more aircraft, more smoke, a formation spelling the national motto if the pilots can remember the spelling. The ministry of finance has asked, mildly, whether a flypast is also a form of spending. The committee has asked, less mildly, whether the minister loves the country.',
    options: ['Hold the full spectacle', 'Keep the parade modest and dignified', 'Give half the money to the flood fund'],
    results: [
      'The sky is full of colour and the whole country looks up together. The forces enjoy the attention a little more than is good for them.',
      'A smaller parade, a cheaper cake and a speech people can follow. It does the job without anyone feeling shown off to.',
      'The flood fund gets its money and the committee gets a smaller sky. Most people shrug; the forces’ band plays on regardless.',
    ],
  },
  troopsFloodRescue: {
    title: 'The Boats Are Green This Time',
    body: 'The rains have cut three villages off, and the civil defence boats are all in the wrong district. The army has boats, engines and a very keen young captain. The sensible choice is obvious; the question is what the army expects in return once it has been thanked on camera.',
    options: ['Send the army in at once', 'Use civil defence and volunteers only', 'Share the rescue and watch the rains'],
    results: [
      'The villages are reached by dusk. The country salutes the uniforms, and the forces notice how much it likes them.',
      'It takes longer, but the civil defence gets its due and the army stays in barracks. The heartland remembers the delay.',
      ['Soldiers, civil defence and volunteers pull together and everyone gets home. A rare week without a quarrel.', 'The two services argue over whose boat is whose while the water rises. The rescue succeeds in the end, and the argument is on every phone.'],
    ],
  },
  forcesWhitePaper: {
    title: 'A Question in the House, in Camouflage',
    body: 'The defence budget has grown for three years and nobody outside the ministry can say what it bought. You hold the floor on the question. You can ask for a proper defence white paper, call the spending a waste or let the matter pass, which in this House counts as manners.',
    options: ['Demand a published white paper', 'Call the spending a waste, loudly', 'Say nothing and be seen to be serious'],
    results: [
      'The government agrees to a paper, and the forces’ council finds the question impolite. Civil society likes the sound of a number being explained.',
      'The line lands with the middle classes, and the government calls you careless with the country’s safety. Both of those are true enough to quote.',
      'Your silence is noted as dignity by some and as absence by others. The party is relieved, and nobody writes about you.',
    ],
  },
  schoolWifiGap: {
    title: 'Fourteen Bars at the Principal’s Door',
    body: 'A survey shows that the wifi works beautifully at the principal’s door and nowhere else on the school grounds. Lessons are going online for the rainy weeks and a third of the pupils cannot join. The vendor’s report says coverage is “excellent,” measured in the car park.',
    options: ['Fund fibre to every classroom', 'Pilot a telco partnership', 'Send printed lessons home'],
    results: [
      'The classrooms are lit up before the exams, and teachers stop reading from their phones. The works fund is lighter for it.',
      'The telco’s signal improves, along with its marketing to the pupils. Coverage is better and the contract terms stay in a drawer.',
      'Printed lessons reach every home, including those without a phone. The young see it as the government giving up on the future.',
    ],
  },
  peatFireSeason: {
    title: 'The Ground Is Smoking',
    body: 'The peat is dry and the first ground fires have started on the edge of the plantation belt. The district officer asks for water bombers; the plantation association asks for patience; the haze asks for nobody. In a week the schools will start closing.',
    options: ['Fund fire patrols and drain control', 'Tighten the land permits now', 'Wait for the rains'],
    results: [
      'Patrols and canals keep the fires small, and the haze stays a rumour. The cost is real and the farmers are grateful.',
      'The permits tighten and the fires slow; so does the goodwill of the estates. The land office is, for once, busy with the right things.',
      ['The rains come early and the ground drinks. You are quietly lucky, and nobody reminds you.', 'The rains are late. The haze reaches the capital, schools close and a neighbour sends a very polite note.'],
    ],
  },
  rooftopRow: {
    title: 'One Roof, Two Associations',
    body: 'Two residents’ associations in the same block of flats both claim the rooftop for their gatherings. One wants a weekend market, the other a quiet garden, and the lift now carries notices in two colours. A child has asked why grown-ups need a lawyer for a roof.',
    options: ['Hold a mediated residents’ forum', 'Let the residents vote on it', 'Stay out and let them settle it'],
    results: [
      'The forum is long and the biscuits run out, but the two associations leave sharing a rota. The block, for once, says hello in the lift.',
      'The vote settles it and the losers grumble, but the grumbling is now about the vote, not about each other. The block is quieter.',
      'The notices multiply and the lift becomes a battleground. The block starts saying good morning to the lawyers instead.',
    ],
  },
  bodyCameraRollout: {
    title: 'The Camera That Was Always Off',
    body: 'The home ministry has promised body cameras for the police, and the first batch arrived with a feature everyone admires: an off switch. Rights groups want independent review of the footage; the police want a quiet life; the public wants to know why the cameras are always off when it matters.',
    options: ['Roll out fully with independent review', 'Pilot in two districts first', 'Keep the footage inside the force'],
    results: [
      'Cameras on and footage open to a panel. A few officers grumble; most citizens notice that the law has started to look at itself.',
      'The two pilot districts report well and the rest wait. It is a start, and it keeps the police and the rights groups both a little cross.',
      'The footage stays private and the cameras stay in the cupboard. The rights groups will remember, and the law looks less like a rule.',
    ],
  },
  ministryDataLeak: {
    title: 'A Spreadsheet Walks Out of the Ministry',
    body: 'A spreadsheet of forty thousand citizens’ details, including addresses and a column marked “notes,” has turned up on a forum selling for the price of a good lunch. The ministry’s first statement says there is “no evidence of a breach.” Its second says the evidence is being studied.',
    options: ['Disclose, fix it and pay for the clean-up', 'Patch it quietly and say nothing', 'Blame the vendor and rebid the contract'],
    results: [
      'The ministry owns up, the systems are rebuilt and an independent check is promised. People are annoyed, then reassured, which is the right order.',
      'The patch holds and the secret does not. A reporter finds the forum post, and the ministry’s silence becomes the story.',
      'The vendor is named and dropped, and the rebid takes a year. The data is safer eventually; the ministry has simply moved the blame.',
    ],
  },
  riverCleanupPledge: {
    title: 'The River Has Been Promised Before',
    body: 'The river that runs past three towns has been promised a clean-up in every election since your parents were young. A school group has just brought a bottle of its water to the press conference, and it is the colour of teh tarik. The cameras are waiting.',
    options: ['Fund clean-up crews now', 'Name and fine the polluters', 'Announce the pledge and defer the fund'],
    results: [
      'The crews begin in a week and the first fish return by the next planting. Farmers and fishermen finally see a result on the water.',
      'The list of polluters is published and the fines are real. The river improves, and the small factories along it find their voice.',
      'The pledge is made again. The press conference is warm and the water is the same colour, and everyone notices.',
    ],
  },
  courtBacklog: {
    title: 'Hearing Date: Next Decade',
    body: 'A small trader has been given a hearing date eleven years from now for a contract dispute that began last Tuesday. The courts have too few clerks and too many files, and the files have begun to use the corridor as a second archive. The Bar Council has sent a polite and rather long letter.',
    options: ['Hire clerks and clear the queue', 'Pilot night sittings', 'Try diverting disputes to mediation'],
    results: [
      'The clerks arrive and the corridor is emptied. Small traders can finally expect an answer within their working lifetimes.',
      'Night sittings clear the oldest cases and tire the judges. The Bar Council approves, and the judges write about it in the corridors.',
      ['Mediation settles most of the small disputes within weeks, and the courts breathe again. The Bar Council hosts a dinner.', 'Mediation is slow to start and the parties don’t trust it. The backlog grows by a third while the pilot is studied.'],
    ],
  },
  heatwaveSchools: {
    title: 'Thirty-Eight Degrees and a Maths Test',
    body: 'A heatwave has put the school fields at thirty-eight degrees, and a regional maths test is scheduled for the hottest hour. Parents have started sending children with frozen water bottles and notes. A headmaster has asked, in writing, whether he may shift the hours or whether the test is more important than the child.',
    options: ['Shift hours and fund shaded fields', 'Keep the schedule', 'Let volunteers run cooling stations'],
    results: [
      'Hours move, the fields get shade and the test is held in the cool morning. Parents are grateful and the children, briefly, are smiling.',
      'The test goes ahead in the heat. Several children faint, the photographs travel, and the minister explains “exam integrity.”',
      'Volunteers set up water and fans at the school gates, and the communities around them come together. It is warm, and the fields stay hot.',
    ],
  },
};

export const FORCES_AND_PESTEL_MS: Record<string, EventText> = {
  navyPatrolBoats: {
    title: 'Tujuh Bot, Dua Enjin',
    body: 'Di jeti Teluk Merpati, peronda pantai ada tujuh bot dan, sesama mereka, dua enjin yang berfungsi. Limbungan kata alat ganti tiba suku tahun depan, seperti yang dikatakan empat suku berturut-turut. Nelayan mula melambai kepada peronda dari bot sendiri, dengan baik hati, seperti melambai kepada saudara yang sedang berusaha.',
    options: ['Biayai baik pulih yang sempurna', 'Guna sedia ada dan pusing-pusing enjin', 'Janji bot siap sebelum monsun, sambil berharap'],
    results: [
      'Lima bot kembali ke laut sebelum musim baharu dan pantai kelihatan dikawal. Dana baik pulih habis dan kerja lain terpaksa menunggu.',
      'Dua enjin itu berpindah dari bot ke bot seperti mesin rumput pinjaman. Penjimatannya nyata; begitu juga kekosongan dalam jadual rondaan.',
      ['Janji itu tertunai dengan tipis dan banyak kerja lebih masa. Jeti itu diam-diam berbangga.', 'Monsun tiba dahulu. Pukat penyeludup melintasi peronda yang tidak mampu mengejar, dan negara mengetahuinya daripada negara jiran.'],
    ],
  },
  forcesProcurementRow: {
    title: 'Empat Puluh Dapur, Pili Emas',
    body: 'Angkatan tentera mahu empat puluh dapur medan bergerak, berharga seperti empat puluh restoran kecil lengkap dengan menu pencicipan. Tiada siapa di kementerian mahu mengaku siapa menulis spesifikasinya, walaupun ia muat pada satu pembekal seperti sarung tangan. Majlis angkatan akan menganggap audit sebagai penghinaan. Akhbar akan menganggapnya berita.',
    options: ['Perintah audit seluruh tender', 'Luluskan dan jaga keamanan', 'Minta menteri jelaskan, secara senyap'],
    results: [
      'Audit menemui barisan yang digembungkan dan pembekal yang punya sahabat baik. Undang-undang dilihat terpakai pada pakaian seragam juga, dan majlis angkatan tidak lupa siapa yang meminta.',
      'Dapur dibeli, majlis gembira dan pengaruh angkatan dalam tender akan datang bertambah. Seorang wartawan mencatat harga sedapur dan menyimpan catatan itu.',
      'Menteri menjelaskan sejam dan tiada apa berubah. Tiada siapa marah, dan tiada siapa yakin juga.',
    ],
  },
  forcesHousingDemand: {
    title: 'Surat Penuh Hormat di Atas Kertas Bertepi Emas',
    body: 'Majlis angkatan tentera telah menulis kepada anda, dengan penuh hormat, memohon elaun perumahan yang lebih baik, padang latihan baharu dan kerusi di setiap meja yang menyebut pertahanan. Salinan untuk akhbar tiba sebelum surat asal. Surat itu ditutup: “Kami yakin kerajaan akan melihat hikmahnya.”',
    options: ['Beri elaun dan padang itu', 'Tolak, dengan sopan dan terbuka', 'Tawarkan perjanjian berperingkat tiga bajet'],
    results: [
      'Elaun dibayar dan kem ceria. Majlis kini tahu surat itu berkesan, dan penjawat awam bertanya tentang elaun mereka sendiri.',
      'Anda berpegang teguh dan negara nampak siapa yang memerintah. Majlis menerimanya dalam diam, yang lebih buruk daripada menjerit, dan Kabinet merasakan dingin.',
      ['Perjanjian berperingkat diterima dengan anggukan kaku. Majlis kembali ke kem buat masa ini.', 'Majlis membaca “berperingkat” sebagai “ditolak.” Surat kedua ditulis, di atas kertas lebih tebal, dan gabungan gelisah.'],
    ],
  },
  borderSensorsDown: {
    title: 'Pengesan Tidak Berkata Apa-apa',
    body: 'Separuh pengesan sempadan telah senyap. Kementerian kata ia kerosakan perisian; kem kata ada tikus dalam kabel; penduduk kampung kata mereka tidak nampak rondaan sejak pilihan raya lalu. Kementerian negara jiran bertanya dengan sopan sama ada ada apa-apa yang tidak kena, dengan nada orang yang sudah tahu.',
    options: ['Biayai pembaikan kecemasan', 'Pinjam rondaan daripada polis daerah', 'Umum semakan dan jangan kata apa-apa lagi'],
    results: [
      'Pengesan berdengung semula dalam dua minggu dan kem menjumpai tikus itu. Sempadan kelihatan diawasi, dan jiran berhenti bertanya.',
      'Polis daerah menampung ruang kosong buat masa ini. Kawasan pedalaman merungut tentang pondok polis yang kosong, dan pengesan terus senyap.',
      'Semakan diumumkan dan ruang kekal terbuka. Akhbar jiran menulis sempadan negara ini “sekadar cadangan,” dan petikan itu tersebar.',
    ],
  },
  nationalDayFlypast: {
    title: 'Tayangan Udara Melebihi Bajet',
    body: 'Jawatankuasa Hari Kebangsaan mahu tayangan udara yang lebih gah tahun ini: lebih banyak pesawat, lebih banyak asap, formasi yang mengeja moto negara jika juruterbang ingat ejaannya. Kementerian kewangan bertanya, dengan lembut, sama ada tayangan udara juga satu bentuk perbelanjaan. Jawatankuasa bertanya, kurang lembut, sama ada menteri cintakan negara.',
    options: ['Adakan pertunjukan penuh', 'Kekalkan perarakan sederhana dan bermaruah', 'Beri separuh wang kepada dana banjir'],
    results: [
      'Langit penuh warna dan seluruh negara mendongak bersama. Angkatan menikmati perhatian itu sedikit lebih daripada yang baik untuk mereka.',
      'Perarakan lebih kecil, kek lebih murah dan ucapan yang boleh diikuti. Ia menjadi tanpa sesiapa rasa dipamerkan.',
      'Dana banjir mendapat wangnya dan jawatankuasa mendapat langit yang lebih kecil. Kebanyakan orang mengangkat bahu; pancaragam angkatan terus bermain.',
    ],
  },
  troopsFloodRescue: {
    title: 'Kali Ini Botnya Berwarna Hijau',
    body: 'Hujan telah memutuskan tiga kampung, dan semua bot pertahanan awam berada di daerah yang salah. Tentera mempunyai bot, enjin dan seorang kapten muda yang sangat bersemangat. Pilihan yang waras jelas; persoalannya apa yang tentera harapkan sebagai balasan selepas diucap terima kasih di hadapan kamera.',
    options: ['Hantar tentera segera', 'Guna pertahanan awam dan sukarelawan sahaja', 'Kongsi penyelamatan dan perhatikan hujan'],
    results: [
      'Kampung-kampung dicapai sebelum senja. Negara memberi tabik kepada pakaian seragam itu, dan angkatan sedar betapa mereka disayangi.',
      'Ia lebih lama, tetapi pertahanan awam mendapat pengiktirafan dan tentera kekal di berek. Kawasan pedalaman mengingati kelewatan itu.',
      ['Askar, pertahanan awam dan sukarelawan bekerjasama dan semua pulang. Seminggu yang jarang tanpa perbalahan.', 'Dua perkhidmatan berbalah tentang bot siapa sambil air naik. Penyelamatan akhirnya berjaya, dan perbalahan itu ada di setiap telefon.'],
    ],
  },
  forcesWhitePaper: {
    title: 'Soalan di Dewan, Berpakaian Kamuflaj',
    body: 'Bajet pertahanan telah meningkat tiga tahun dan tiada siapa di luar kementerian dapat menyatakan apa yang dibelinya. Anda memegang lantai dewan tentang soalan itu. Anda boleh meminta kertas putih pertahanan yang sewajarnya, menggelar perbelanjaan itu pembaziran atau membiarkannya berlalu, yang dalam Dewan ini dikira berbudi bahasa.',
    options: ['Tuntut kertas putih yang diterbitkan', 'Gelar perbelanjaan itu pembaziran, dengan lantang', 'Diam dan nampak bersungguh-sungguh'],
    results: [
      'Kerajaan bersetuju dengan sebuah kertas, dan majlis angkatan mendapati soalan itu kurang sopan. Masyarakat sivil suka mendengar satu angka dijelaskan.',
      'Ayat itu mengena kelas pertengahan, dan kerajaan menggelar anda cuai dengan keselamatan negara. Kedua-duanya cukup benar untuk dipetik.',
      'Diam anda dicatat sebagai maruah oleh sesetengah dan sebagai ketiadaan oleh yang lain. Parti lega, dan tiada siapa menulis tentang anda.',
    ],
  },
  schoolWifiGap: {
    title: 'Empat Belas Bar di Pintu Pengetua',
    body: 'Tinjauan menunjukkan wifi berfungsi dengan indah di pintu pengetua dan tidak di tempat lain di kawasan sekolah. Pelajaran beralih dalam talian untuk minggu hujan dan sepertiga murid tidak dapat menyertai. Laporan vendor kata liputan “cemerlang,” diukur di tempat letak kereta.',
    options: ['Biayai gentian ke setiap bilik darjah', 'Cuba perkongsian dengan telko', 'Hantar pelajaran bercetak ke rumah'],
    results: [
      'Bilik darjah menyala sebelum peperiksaan, dan guru berhenti membaca dari telefon. Dana kerja lebih ringan kerananya.',
      'Isyarat telko bertambah baik, begitu juga pemasarannya kepada murid. Liputan lebih baik dan syarat kontrak kekal dalam laci.',
      'Pelajaran bercetak sampai ke setiap rumah, termasuk yang tiada telefon. Golongan muda melihatnya sebagai kerajaan mengalah terhadap masa depan.',
    ],
  },
  peatFireSeason: {
    title: 'Tanah Sedang Berasap',
    body: 'Gambut kering dan kebakaran tanah pertama bermula di pinggir jalur ladang. Pegawai daerah meminta pesawat pembom air; persatuan ladang meminta kesabaran; jerebu tidak meminta sesiapa. Seminggu lagi sekolah mula ditutup.',
    options: ['Biayai peronda api dan kawalan parit', 'Ketatkan permit tanah sekarang', 'Tunggu hujan'],
    results: [
      'Peronda dan terusan mengekalkan api kecil, dan jerebu kekal khabar angin. Kosnya nyata dan petani bersyukur.',
      'Permit diketatkan dan api perlahan; begitu juga muhibah estet. Pejabat tanah, buat sekali ini, sibuk dengan perkara yang betul.',
      ['Hujan datang awal dan tanah minum. Anda bertuah secara senyap, dan tiada siapa mengingatkan anda.', 'Hujan lewat. Jerebu sampai ke ibu negara, sekolah tutup dan sebuah negara jiran menghantar nota yang sangat sopan.'],
    ],
  },
  rooftopRow: {
    title: 'Satu Bumbung, Dua Persatuan',
    body: 'Dua persatuan penduduk dalam blok rumah pangsa yang sama menuntut bumbung untuk perhimpunan mereka. Satu mahu pasar hujung minggu, satu lagi taman yang tenang, dan lif kini membawa notis dua warna. Seorang kanak-kanak bertanya mengapa orang dewasa perlukan peguam untuk sebuah bumbung.',
    options: ['Adakan forum penduduk dengan pengantara', 'Biar penduduk mengundi', 'Jangan campur tangan dan biar mereka selesaikan'],
    results: [
      'Forum panjang dan biskut habis, tetapi dua persatuan keluar berkongsi jadual. Blok itu, buat sekali ini, bertegur sapa dalam lif.',
      'Undian menyelesaikannya dan pihak yang kalah merungut, tetapi rungutan itu kini tentang undian, bukan tentang satu sama lain. Blok lebih senyap.',
      'Notis bertambah dan lif menjadi medan pertempuran. Blok mula mengucap selamat pagi kepada para peguam.',
    ],
  },
  bodyCameraRollout: {
    title: 'Kamera yang Sentiasa Dimatikan',
    body: 'Kementerian dalam negeri berjanji kamera badan untuk polis, dan kumpulan pertama tiba dengan ciri yang semua kagumi: suis mati. Kumpulan hak asasi mahu semakan bebas rakaman; polis mahu hidup tenang; orang ramai mahu tahu mengapa kamera sentiasa mati bila ia penting.',
    options: ['Lancarkan sepenuhnya dengan semakan bebas', 'Cuba di dua daerah dahulu', 'Simpan rakaman dalam pasukan'],
    results: [
      'Kamera dihidupkan dan rakaman dibuka kepada panel. Beberapa pegawai merungut; kebanyakan rakyat perasan undang-undang mula memandang dirinya sendiri.',
      'Dua daerah ujian melapor baik dan yang lain menunggu. Ia permulaan, dan ia membuat polis dan kumpulan hak asasi sedikit marah.',
      'Rakaman kekal rahsia dan kamera kekal dalam almari. Kumpulan hak asasi akan mengingatinya, dan undang-undang kurang kelihatan seperti peraturan.',
    ],
  },
  ministryDataLeak: {
    title: 'Hamparan Berjalan Keluar dari Kementerian',
    body: 'Hamparan butiran empat puluh ribu warganegara, termasuk alamat dan lajur bertanda “nota,” muncul di forum dijual pada harga makan tengah hari yang baik. Kenyataan pertama kementerian kata “tiada bukti pelanggaran.” Kenyataan kedua kata bukti sedang dikaji.',
    options: ['Dedahkan, baiki dan bayar pembersihan', 'Tampal senyap-senyap dan jangan kata apa-apa', 'Salahkan vendor dan tender semula'],
    results: [
      'Kementerian mengaku, sistem dibina semula dan semakan bebas dijanjikan. Orang ramai marah, kemudian lega, yang merupakan urutan yang betul.',
      'Tampalan bertahan dan rahsia tidak. Seorang wartawan menemui siaran forum itu, dan kebisuan kementerian menjadi berita.',
      'Vendor dinamakan dan digugurkan, dan tender semula mengambil setahun. Data akhirnya lebih selamat; kementerian sekadar memindahkan kesalahan.',
    ],
  },
  riverCleanupPledge: {
    title: 'Sungai Itu Pernah Dijanjikan Dahulu',
    body: 'Sungai yang mengalir melalui tiga bandar telah dijanjikan pembersihan dalam setiap pilihan raya sejak ibu bapa anda muda. Sekumpulan murid baru membawa sebotol airnya ke sidang akhbar, dan warnanya seperti teh tarik. Kamera sedang menunggu.',
    options: ['Biayai kru pembersihan sekarang', 'Namakan dan denda pencemar', 'Umumkan ikrar dan tangguhkan dana'],
    results: [
      'Kru bermula dalam seminggu dan ikan pertama kembali sebelum musim tanam. Petani dan nelayan akhirnya melihat hasil pada air.',
      'Senarai pencemar diterbitkan dan denda itu nyata. Sungai bertambah baik, dan kilang kecil di sepanjangnya menemui suara mereka.',
      'Ikrar dibuat lagi. Sidang akhbar hangat dan air masih warna yang sama, dan semua orang perasan.',
    ],
  },
  courtBacklog: {
    title: 'Tarikh Perbicaraan: Dekad Depan',
    body: 'Seorang peniaga kecil diberi tarikh perbicaraan sebelas tahun lagi untuk pertikaian kontrak yang bermula Selasa lalu. Mahkamah kekurangan kerani dan terlalu banyak fail, dan fail-fail itu mula menggunakan koridor sebagai arkib kedua. Majlis Peguam menghantar surat yang sopan dan agak panjang.',
    options: ['Ambil kerani dan kosongkan barisan', 'Cuba persidangan malam', 'Cuba alihkan pertikaian kepada pengantaraan'],
    results: [
      'Kerani tiba dan koridor dikosongkan. Peniaga kecil akhirnya boleh mengharapkan jawapan dalam hayat bekerja mereka.',
      'Persidangan malam melangsaikan kes tertua dan memenatkan hakim. Majlis Peguam bersetuju, dan hakim menulis tentangnya di koridor.',
      ['Pengantaraan menyelesaikan kebanyakan pertikaian kecil dalam beberapa minggu, dan mahkamah bernafas semula. Majlis Peguam mengadakan majlis makan malam.', 'Pengantaraan lambat bermula dan pihak-pihak tidak mempercayainya. Tunggakan bertambah sepertiga sementara projek perintis dikaji.'],
    ],
  },
  heatwaveSchools: {
    title: 'Tiga Puluh Lapan Darjah dan Ujian Matematik',
    body: 'Gelombang haba menjadikan padang sekolah tiga puluh lapan darjah, dan ujian matematik serantau dijadualkan pada jam yang paling panas. Ibu bapa mula menghantar anak dengan botol air beku dan nota. Seorang guru besar bertanya, secara bertulis, sama ada beliau boleh menukar waktu atau ujian lebih penting daripada anak.',
    options: ['Tukar waktu dan biayai padang berteduh', 'Kekalkan jadual', 'Biar sukarelawan jalankan pusat penyejukan'],
    results: [
      'Waktu berubah, padang mendapat teduhan dan ujian diadakan pada pagi yang sejuk. Ibu bapa bersyukur dan kanak-kanak, seketika, tersenyum.',
      'Ujian diteruskan dalam panas. Beberapa kanak-kanak pengsan, gambar tersebar, dan menteri menjelaskan “integriti peperiksaan.”',
      'Sukarelawan menyediakan air dan kipas di pintu pagar sekolah, dan masyarakat sekitar bersatu. Ia hangat, dan padang kekal panas.',
    ],
  },
};
