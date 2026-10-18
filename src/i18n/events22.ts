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
    body: 'Di jeti Teluk Merpati, peronda pantai ada tujuh bot dan, sesama mereka, dua enjin yang berfungsi. Limbungan kata alat ganti tiba suku tahun depan, macam yang dah dikata empat suku berturut-turut. Nelayan mula melambai kepada peronda dari bot sendiri, dengan baik hati, macam melambai kepada saudara yang tengah cuba.',
    options: ['Biayai baik pulih yang sempurna', 'Guna yang ada dan pusing-pusing enjin', 'Janji bot siap sebelum monsun, sambil berharap'],
    results: [
      'Lima bot balik ke laut sebelum musim baharu dan pantai nampak dikawal. Dana baik pulih habis dan kerja lain kena menunggu.',
      'Dua enjin tu berpindah dari bot ke bot macam mesin rumput pinjaman. Penjimatannya nyata; kekosongan dalam jadual rondaan pun sama.',
      ['Janji tertunai dengan tipis dan banyak kerja lebih masa. Jeti tu diam-diam berbangga.', 'Monsun tiba dulu. Pukat penyeludup melintasi peronda yang tak mampu mengejar, dan negara tahu hal tu daripada negara jiran.'],
    ],
  },
  forcesProcurementRow: {
    title: 'Empat Puluh Dapur, Pili Emas',
    body: 'Angkatan tentera nak empat puluh dapur medan bergerak, berharga macam empat puluh restoran kecil siap dengan menu pencicipan. Tak ada siapa di kementerian nak mengaku siapa tulis spesifikasinya, walaupun ia muat pada satu pembekal macam sarung tangan. Majlis angkatan akan anggap audit sebagai penghinaan. Akhbar akan anggap ia berita.',
    options: ['Perintah audit seluruh tender', 'Luluskan dan jaga keamanan', 'Minta menteri jelaskan, senyap-senyap'],
    results: [
      'Audit jumpa barisan yang digembungkan dan pembekal yang ada sahabat baik. Undang-undang nampak terpakai pada pakaian seragam juga, dan majlis angkatan tak lupa siapa yang minta.',
      'Dapur dibeli, majlis gembira dan pengaruh angkatan dalam tender akan datang bertambah. Seorang wartawan catat harga sedapur dan simpan catatan tu.',
      'Menteri jelaskan sejam dan tak ada apa berubah. Tak ada siapa marah, dan tak ada siapa yakin juga.',
    ],
  },
  forcesHousingDemand: {
    title: 'Surat Penuh Hormat di Atas Kertas Bertepi Emas',
    body: 'Majlis angkatan tentera tulis kepada anda, dengan penuh hormat, minta elaun perumahan yang lebih baik, padang latihan baharu dan kerusi di setiap meja yang sebut pertahanan. Salinan untuk akhbar tiba sebelum surat asal. Surat tu ditutup: “Kami yakin kerajaan akan nampak hikmahnya.”',
    options: ['Beri elaun dan padang tu', 'Tolak, dengan sopan dan terbuka', 'Tawar perjanjian berperingkat tiga bajet'],
    results: [
      'Elaun dibayar dan kem ceria. Majlis sekarang tahu surat tu berkesan, dan penjawat awam tanya pasal elaun mereka sendiri.',
      'Anda berpegang teguh dan negara nampak siapa yang memerintah. Majlis terima dalam diam, yang lebih teruk daripada menjerit, dan Kabinet rasa dingin.',
      ['Perjanjian berperingkat diterima dengan anggukan kaku. Majlis balik ke kem buat masa ni.', 'Majlis baca “berperingkat” sebagai “ditolak.” Surat kedua ditulis, atas kertas lebih tebal, dan gabungan gelisah.'],
    ],
  },
  borderSensorsDown: {
    title: 'Pengesan Tak Berkata Apa-apa',
    body: 'Separuh pengesan sempadan dah senyap. Kementerian kata kerosakan perisian; kem kata ada tikus dalam kabel; penduduk kampung kata mereka tak nampak rondaan sejak pilihan raya lepas. Kementerian negara jiran tanya dengan sopan sama ada ada apa-apa yang tak kena, dengan nada orang yang dah tahu.',
    options: ['Biayai pembaikan kecemasan', 'Pinjam rondaan daripada polis daerah', 'Umum semakan dan jangan cakap apa-apa lagi'],
    results: [
      'Pengesan berdengung semula dalam dua minggu dan kem jumpa tikus tu. Sempadan nampak diawasi, dan jiran berhenti bertanya.',
      'Polis daerah tampung ruang kosong buat masa ni. Orang kampung merungut pasal pondok polis yang kosong, dan pengesan terus senyap.',
      'Semakan diumumkan dan ruang kekal terbuka. Akhbar jiran tulis sempadan negara ni “sekadar cadangan,” dan petikan tu tersebar.',
    ],
  },
  nationalDayFlypast: {
    title: 'Tayangan Udara Melebihi Bajet',
    body: 'Jawatankuasa Hari Kebangsaan nak tayangan udara yang lebih gah tahun ni: lebih banyak pesawat, lebih banyak asap, formasi yang eja moto negara kalau juruterbang ingat ejaannya. Kementerian kewangan tanya, dengan lembut, sama ada tayangan udara pun satu bentuk perbelanjaan. Jawatankuasa tanya, kurang lembut, sama ada menteri tu cintakan negara.',
    options: ['Adakan pertunjukan penuh', 'Kekalkan perarakan sederhana dan bermaruah', 'Beri separuh duit kepada dana banjir'],
    results: [
      'Langit penuh warna dan seluruh negara mendongak bersama. Angkatan menikmati perhatian tu sikit lebih daripada yang elok untuk mereka.',
      'Perarakan lebih kecil, kek lebih murah dan ucapan yang boleh diikuti. Ia menjadi tanpa sesiapa rasa dipamerkan.',
      'Dana banjir dapat duitnya dan jawatankuasa dapat langit yang lebih kecil. Kebanyakan orang angkat bahu; pancaragam angkatan terus main.',
    ],
  },
  troopsFloodRescue: {
    title: 'Kali Ni Botnya Hijau',
    body: 'Hujan putuskan tiga kampung, dan semua bot pertahanan awam berada di daerah yang salah. Tentera ada bot, enjin dan seorang kapten muda yang sangat bersemangat. Pilihan yang waras dah jelas; soalnya apa tentera harapkan sebagai balasan lepas diucap terima kasih depan kamera.',
    options: ['Hantar tentera segera', 'Guna pertahanan awam dan sukarelawan saja', 'Kongsi penyelamatan dan perhatikan hujan'],
    results: [
      'Kampung-kampung dicapai sebelum senja. Negara tabik pada pakaian seragam tu, dan angkatan sedar betapa mereka disayangi.',
      'Lebih lama, tapi pertahanan awam dapat pengiktirafan dan tentera kekal di berek. Orang kampung ingat kelewatan tu.',
      ['Askar, pertahanan awam dan sukarelawan bekerjasama dan semua selamat balik. Seminggu yang jarang tanpa pertengkaran.', 'Dua perkhidmatan bertengkar pasal bot siapa sambil air naik. Penyelamatan akhirnya berjaya, dan pertengkaran tu ada di setiap telefon.'],
    ],
  },
  forcesWhitePaper: {
    title: 'Soalan di Dewan, Berpakaian Kamuflaj',
    body: 'Bajet pertahanan dah meningkat tiga tahun dan tak ada siapa di luar kementerian boleh cakap apa yang dibelinya. Anda pegang lantai Dewan pasal soalan tu. Anda boleh minta kertas putih pertahanan yang sewajarnya, gelar perbelanjaan tu pembaziran atau biar ia berlalu, yang dalam Dewan ni dikira berbudi bahasa.',
    options: ['Tuntut kertas putih yang diterbitkan', 'Gelar perbelanjaan tu pembaziran, dengan lantang', 'Diam dan nampak bersungguh-sungguh'],
    results: [
      'Kerajaan setuju dengan sebuah kertas, dan majlis angkatan rasa soalan tu kurang sopan. Masyarakat sivil suka dengar satu angka dijelaskan.',
      'Ayat tu mengena kelas pertengahan, dan kerajaan gelar anda cuai dengan keselamatan negara. Dua-dua cukup benar untuk dipetik.',
      'Diam anda dicatat sebagai maruah oleh sesetengah orang dan sebagai ketiadaan oleh yang lain. Parti lega, dan tak ada siapa tulis pasal anda.',
    ],
  },
  schoolWifiGap: {
    title: 'Empat Belas Bar di Pintu Pengetua',
    body: 'Tinjauan tunjuk wifi berfungsi dengan cantik di pintu pengetua dan tak ada di tempat lain di kawasan sekolah. Pelajaran beralih dalam talian untuk minggu hujan dan sepertiga murid tak dapat sertai. Laporan vendor kata liputan “cemerlang,” diukur di tempat letak kereta.',
    options: ['Biayai gentian ke setiap bilik darjah', 'Cuba perkongsian dengan telko', 'Hantar pelajaran bercetak ke rumah'],
    results: [
      'Bilik darjah menyala sebelum peperiksaan, dan guru berhenti baca dari telefon. Dana kerja lebih ringan kerananya.',
      'Isyarat telko bertambah baik, pemasarannya kepada murid pun sama. Liputan lebih baik dan syarat kontrak kekal dalam laci.',
      'Pelajaran bercetak sampai ke setiap rumah, termasuk yang tak ada telefon. Golongan muda nampak ia macam kerajaan mengalah terhadap masa depan.',
    ],
  },
  peatFireSeason: {
    title: 'Tanah Sedang Berasap',
    body: 'Gambut kering dan kebakaran tanah pertama bermula di pinggir jalur ladang. Pegawai daerah minta pesawat pembom air; persatuan ladang minta bersabar; jerebu tak minta sesiapa pun. Seminggu lagi sekolah mula ditutup.',
    options: ['Biayai peronda api dan kawalan parit', 'Ketatkan permit tanah sekarang', 'Tunggu hujan'],
    results: [
      'Peronda dan terusan pastikan api kecil, dan jerebu kekal khabar angin. Kosnya nyata dan petani bersyukur.',
      'Permit diketatkan dan api perlahan; muhibah estet pun sama. Pejabat tanah, buat sekali ni, sibuk dengan perkara yang betul.',
      ['Hujan datang awal dan tanah minum. Anda bertuah senyap-senyap, dan tak ada siapa ingatkan anda.', 'Hujan lewat. Jerebu sampai ke ibu negara, sekolah tutup dan sebuah negara jiran hantar nota yang sangat sopan.'],
    ],
  },
  rooftopRow: {
    title: 'Satu Bumbung, Dua Persatuan',
    body: 'Dua persatuan penduduk dalam blok rumah pangsa yang sama tuntut bumbung untuk perhimpunan mereka. Satu nak pasar hujung minggu, satu lagi nak taman yang tenang, dan lif sekarang bawa notis dua warna. Seorang budak tanya kenapa orang dewasa perlukan peguam untuk sebuah bumbung.',
    options: ['Adakan forum penduduk dengan pengantara', 'Biar penduduk mengundi', 'Jangan campur tangan dan biar mereka selesaikan'],
    results: [
      'Forum panjang dan biskut habis, tapi dua persatuan keluar berkongsi jadual. Blok tu, buat sekali ni, bertegur sapa dalam lif.',
      'Undian selesaikan dan pihak yang kalah merungut, tapi rungutan tu sekarang pasal undian, bukan pasal satu sama lain. Blok lebih senyap.',
      'Notis bertambah dan lif jadi medan pertempuran. Blok mula ucap selamat pagi kepada para peguam.',
    ],
  },
  bodyCameraRollout: {
    title: 'Kamera yang Sentiasa Dimatikan',
    body: 'Kementerian dalam negeri janji kamera badan untuk polis, dan kumpulan pertama tiba dengan ciri yang semua kagumi: suis mati. Kumpulan hak asasi nak semakan bebas rakaman; polis nak hidup tenang; orang ramai nak tahu kenapa kamera sentiasa mati bila ia penting.',
    options: ['Lancarkan sepenuhnya dengan semakan bebas', 'Cuba di dua daerah dulu', 'Simpan rakaman dalam pasukan'],
    results: [
      'Kamera dihidupkan dan rakaman dibuka kepada panel. Beberapa pegawai merungut; kebanyakan rakyat perasan undang-undang mula pandang dirinya sendiri.',
      'Dua daerah ujian melapor baik dan yang lain menunggu. Permulaan, dan ia buat polis dan kumpulan hak asasi sikit marah.',
      'Rakaman kekal rahsia dan kamera kekal dalam almari. Kumpulan hak asasi akan ingat, dan undang-undang kurang nampak macam peraturan.',
    ],
  },
  ministryDataLeak: {
    title: 'Spreadsheet Berjalan Keluar dari Kementerian',
    body: 'Spreadsheet butiran empat puluh ribu warganegara, termasuk alamat dan lajur bertanda “nota,” muncul di forum dijual pada harga makan tengah hari yang elok. Kenyataan pertama kementerian kata “tiada bukti pelanggaran.” Kenyataan kedua kata bukti sedang dikaji.',
    options: ['Dedahkan, baiki dan bayar pembersihan', 'Tampal senyap-senyap dan jangan cakap apa-apa', 'Salahkan vendor dan tender semula'],
    results: [
      'Kementerian mengaku, sistem dibina semula dan semakan bebas dijanjikan. Orang ramai marah, lepas tu lega, urutan yang betul.',
      'Tampalan bertahan dan rahsia tak. Seorang wartawan jumpa siaran forum tu, dan kebisuan kementerian jadi berita.',
      'Vendor dinamakan dan digugurkan, dan tender semula ambil setahun. Data akhirnya lebih selamat; kementerian sekadar pindahkan kesalahan.',
    ],
  },
  riverCleanupPledge: {
    title: 'Sungai Tu Pernah Dijanjikan Dulu',
    body: 'Sungai yang mengalir melalui tiga bandar dah dijanjikan pembersihan dalam setiap pilihan raya sejak ibu bapa anda muda. Sekumpulan murid baru bawa sebotol airnya ke sidang akhbar, dan warnanya macam teh tarik. Kamera tengah menunggu.',
    options: ['Biayai kru pembersihan sekarang', 'Namakan dan denda pencemar', 'Umum ikrar dan tangguhkan dana'],
    results: [
      'Kru bermula dalam seminggu dan ikan pertama balik sebelum musim tanam. Petani dan nelayan akhirnya nampak hasil pada air.',
      'Senarai pencemar diterbitkan dan denda tu nyata. Sungai bertambah baik, dan kilang kecil di sepanjangnya jumpa suara mereka.',
      'Ikrar dibuat lagi. Sidang akhbar hangat dan air masih warna yang sama, dan semua orang perasan.',
    ],
  },
  courtBacklog: {
    title: 'Tarikh Perbicaraan: Dekad Depan',
    body: 'Seorang peniaga kecil diberi tarikh perbicaraan sebelas tahun lagi untuk pertikaian kontrak yang bermula Selasa lepas. Mahkamah kekurangan kerani dan terlalu banyak fail, dan fail-fail tu mula guna koridor sebagai arkib kedua. Majlis Peguam hantar surat yang sopan dan agak panjang.',
    options: ['Ambil kerani dan kosongkan barisan', 'Cuba persidangan malam', 'Cuba alihkan pertikaian kepada pengantaraan'],
    results: [
      'Kerani tiba dan koridor dikosongkan. Peniaga kecil akhirnya boleh berharap dapat jawapan dalam hayat bekerja mereka.',
      'Persidangan malam langsaikan kes tertua dan penatkan hakim. Majlis Peguam setuju, dan hakim tulis pasal tu di koridor.',
      ['Pengantaraan selesaikan kebanyakan pertikaian kecil dalam beberapa minggu, dan mahkamah bernafas semula. Majlis Peguam adakan majlis makan malam.', 'Pengantaraan lambat bermula dan pihak-pihak tak percayakannya. Tunggakan bertambah sepertiga sementara projek perintis dikaji.'],
    ],
  },
  heatwaveSchools: {
    title: 'Tiga Puluh Lapan Darjah dan Ujian Matematik',
    body: 'Gelombang haba jadikan padang sekolah tiga puluh lapan darjah, dan ujian matematik serantau dijadualkan pada jam yang paling panas. Ibu bapa mula hantar anak dengan botol air beku dan nota. Seorang guru besar tanya, secara bertulis, sama ada dia boleh tukar waktu atau ujian lebih penting daripada anak.',
    options: ['Tukar waktu dan biayai padang berteduh', 'Kekalkan jadual', 'Biar sukarelawan jalankan pusat penyejukan'],
    results: [
      'Waktu berubah, padang dapat teduhan dan ujian diadakan pada pagi yang sejuk. Ibu bapa bersyukur dan budak-budak, sekejap, tersenyum.',
      'Ujian diteruskan dalam panas. Beberapa budak pengsan, gambar tersebar, dan menteri jelaskan “integriti peperiksaan.”',
      'Sukarelawan sediakan air dan kipas di pintu pagar sekolah, dan masyarakat sekitar bersatu. Hangat, dan padang kekal panas.',
    ],
  },
};
