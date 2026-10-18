import type { EventText } from './events';

// The first twenty of the forty newest events, in English and Bahasa Malaysia. Every person, company and body in them is
// invented. A result written as a pair is for a gamble: what is reported if it comes off, then if it does not.

export const NEW_EVENTS_EN: Record<string, EventText> = {
  nasiLemakPrice: {
    title: 'The price of breakfast',
    body: 'A photograph of a packet of nasi lemak with a single egg and a price that has gone up again is the most shared picture in the country. The comments are not about the egg. Everyone is looking at you.',
    options: ['Launch a breakfast price watch and pay for the stalls to join it', 'Eat one on camera and tell people it is excellent value', 'Say prices are set by the market and no one should be surprised'],
    results: [
      'The stalls put up your sticker and held their prices for a month. The aunties said it was the first sensible scheme in years.',
      ['The photograph of you eating, with sambal on your chin, was shared for the right reasons.', 'It turned out the packet was a gift from a supplier. The photograph was shared for the wrong reasons.'],
      'You were correct, and the video of you being correct has been seen by everyone who does not want to hear it.',
    ],
  },
  cooperativeBank: {
    title: 'The cooperative’s rescue',
    body: 'A farmers’ cooperative bank, which has held the savings of half a district since before independence, cannot meet its withdrawals. Its chairman is on the phone, and so is every smallholder who has ever trusted a signboard.',
    options: ['Bail it out with public money', 'Let it fail, and say the law is the law', 'Arrange a rescue by a bigger bank, and hope the terms hold'],
    results: [
      'The cooperative was saved, and the farmers sent you durian. The treasury sent you a memo.',
      'The cooperative closed. The law was observed, and the district will remember who observed it.',
      ['The bigger bank took it over on fair terms, and the savings were safe.', 'The bigger bank found “irregularities” and changed the terms. The smallholders learned what a term sheet is.'],
    ],
  },
  gigInsurance: {
    title: 'Insurance for the riders',
    body: 'A rider was hurt on the road delivering a plate of fried rice, and his employer’s app said he was “not on shift”. The video has two million views. A union that did not exist last month has a petition and a spokesperson.',
    options: ['Fund an accident scheme for all riders', 'Make the platforms pay for it, by law', 'Say it is a matter between the rider and the app'],
    results: [
      'The scheme paid out within a fortnight. The riders put your party’s sticker next to the delivery box.',
      'The platforms threatened to leave and raised their fees instead. The riders are insured. The restaurants are annoyed.',
      'You were quoted, accurately, and you were not thanked.',
    ],
  },
  nightMarket: {
    title: 'The night market',
    body: 'The council wants to move the old night market off the main road so that the traffic can flow. The stallholders say the market is the traffic. The residents’ association says it cannot sleep, and has sent a petition that is longer than the stallholders’.',
    options: ['Stand with the stallholders', 'Move the market, and pay for the new site', 'Say it is for the council to decide'],
    results: [
      'The market stayed. The traders are loyal, and the residents are not.',
      'The new site opened with a ribbon, and a few of the old stalls never came. The residents slept; the traders mumbled.',
      ['The council chose well, and you were thanked for leaving them to it.', 'The council chose badly, and the traders asked why you had left them to it.'],
    ],
  },
  electricityTariff: {
    title: 'The electricity tariff',
    body: 'The utility says it can no longer carry the cost of fuel. It wants a higher tariff for industry, which it says homes will not feel, and which every factory owner says homes will feel at the till.',
    options: ['Raise it for big users only', 'Absorb the rise with a subsidy', 'Delay the decision, and hope the price of fuel falls'],
    results: [
      'Industry paid, and grumbled, and passed some of it on. The utility is happy.',
      'Homes were spared, and the books were not. The treasury has asked you to remember this.',
      ['The fuel price fell by itself and the issue went away.', 'The fuel price rose, the utility ran short, and the lights flickered on live television.'],
    ],
  },
  cropGlut: {
    title: 'A glut',
    body: 'It was a bumper season, and the farmers are being punished for it: so much fruit and so many vegetables that the wholesalers are paying less than it costs to pick them. A lorry of unsold produce has been tipped outside the district office.',
    options: ['Buy the surplus and give it away', 'Find a foreign market, quickly', 'Say prices rise and fall, and so does everything'],
    results: [
      'The surplus fed a lot of people, and the lorries stopped arriving at the district office.',
      ['A buyer was found, and the produce left on a ship with your party’s name on the manifest.', 'The buyer withdrew, and the produce is now very ripe.'],
      'A philosophical answer, and the farmers did not feel philosophical.',
    ],
  },
  lakeResort: {
    title: 'The lake resort',
    body: 'A developer wants to build a resort on the shore of the hill lake, with a hundred rooms, a golf course and a helipad. The state would gain jobs and a good deal of money. The lake would gain a helipad.',
    options: ['Approve it, with conditions', 'Refuse it, and protect the shore', 'Hold a public hearing and be guided by it'],
    results: [
      'The resort was approved. The conditions are in a document that nobody has read.',
      'The developer left. The lake did not notice, and the town did.',
      ['The hearing was calm and informed, and the decision was widely accepted.', 'The hearing was a shouting match, and nobody accepted anything.'],
    ],
  },
  trawlers: {
    title: 'The fishermen and the trawlers',
    body: 'Large trawlers have been working close to the shore at night, and the small boats come back with half a catch. The fishermen’s association wants the zones enforced. The trawler owners have friends.',
    options: ['Enforce the zones, and send the patrol boats', 'Licence the big boats, for a fee', 'Set up a fund to compensate the small boats'],
    results: [
      'The patrol boats went out, and the small boats came back with full nets and loud opinions of you.',
      'The fee was paid in full, the small boats were not, and the association’s chairman has stopped answering your calls.',
      'The fund was welcomed. The catch did not improve, but the fishermen noticed you had asked.',
    ],
  },
  heritageHouse: {
    title: 'The heritage house',
    body: 'The new road will pass through the garden of an old house that was built before the war, and that is on nobody’s list of heritage. A group of students and retired teachers has chained itself to the gate with some dignity.',
    options: ['Gazette the house, and bend the road', 'Let the road go through', 'Try to move the house, stone by stone'],
    results: [
      'The house was saved, the road bends, and the students took the chains off with relief.',
      'The road was built on time. The house is now a petrol station, and the retired teachers are writing letters.',
      ['The house was moved, and now stands in a park, looking a little surprised.', 'The house cracked in the move. The students have kept the pieces.'],
    ],
  },
  stateBanquet: {
    title: 'The banquet bill',
    body: 'The bill for a state dinner has leaked: sixty-eight dishes, two imported chefs and a sculpture of the state capital in ice. The dinner was for forty guests, one of whom was a minister who left early.',
    options: ['Admit it, and send the cost to the flood fund', 'Defend it as promotion for the state', 'Blame the protocol office'],
    results: [
      'The cheque went to the flood fund the next morning, and the ice sculpture became a story people tell fondly.',
      ['It was explained as an investment, and by luck an investor did turn up.', 'It was explained as an investment, and nobody believed it, least of all the ice sculpture.'],
      'The head of protocol is looking for a new job, and your own staff are looking at you.',
    ],
  },
  hawkerLicence: {
    title: 'Hawkers and the new rule',
    body: 'A new rule says every hawker must hold a licence, with a photograph, a health certificate and three stamps from three offices. The offices do not open at the same time. The hawkers have pointed this out with a march.',
    options: ['Declare an amnesty and look again at the rule', 'Enforce it, and tell the town it is for hygiene', 'Make a cheap digital licence, one form and one office'],
    results: [
      'The amnesty was welcomed. The health officers have asked, politely, who will do the inspecting.',
      'The inspectors went round with clipboards. The food got a little cleaner and the hawkers a lot angrier.',
      'The app crashed on the first day, then worked. Half the hawkers now have a licence and a QR code.',
    ],
  },
  ferryStops: {
    title: 'The ferry stops',
    body: 'The only ferry between the islands and the mainland has stopped running, because the operator says the fares do not cover the diesel. Schoolchildren are stuck, and the market has come to a halt. The headman has sent a polite and rather long letter.',
    options: ['Subsidise the service', 'Hand it to a private operator at a higher fare', 'Promise a bridge, and hope the election is a long way off'],
    results: [
      'The ferry ran again by Monday, and the children got to school.',
      'The new operator charges more, and the islands noticed the difference in their wallets.',
      ['The promise was believed, for now, and the ferry was running again.', 'The promise was not believed, and the ferry still does not run.'],
    ],
  },
  fakeNewsLaw: {
    title: 'The false-news bill',
    body: 'A rumour about a bank that does not exist emptied three shops of rice in an afternoon. The cabinet wants a law against false news with a jail term and a ban on anonymous accounts. The lawyers want to know who decides what is false.',
    options: ['Pass it as it stands', 'Pass it with a court, and a limit on who can complain', 'Shelve it, and ask the platforms to behave'],
    results: [
      'The law passed. The rumours stopped, and so did a good deal else, and the young have been noticing.',
      'The court was created, and the bill was widely called “workable”. It was not widely called “brave”.',
      'The platforms agreed to behave. They are keeping an eye on how long that lasts.',
    ],
  },
  memeWar: {
    title: 'The meme',
    body: 'A picture of you with the wrong expression and a caption you did not write has spread to every group chat in the country. It is quite a good picture. A bad person has made it worse.',
    options: ['Share it yourself, with a better caption', 'Have it taken down, and send a notice', 'Say nothing, and let it find its level'],
    results: [
      ['Your own caption was better than theirs, and the young said so, loudly.', 'Your caption was called “try-hard” by people who then shared it forty thousand times.'],
      'The notice was received, and then posted. It was called the best joke of the week.',
      'It ran for a few days and then a cat did something, and the country moved on.',
    ],
  },
  whatsappLeak: {
    title: 'The chat group',
    body: 'Screenshots of the party’s own committee group chat have been leaked, including some opinions of the leader that were meant for the group, and an extraordinary number of emojis. The group has seventy-one members, any of whom could have sent them.',
    options: ['Find the leaker and remove them', 'Laugh it off, and say the party is a family', 'Close the group, and meet in person only'],
    results: [
      'The leaker was found, and was a person nobody had suspected, which made it worse.',
      ['Laughing it off worked. The leader’s own jokes in the chat were, said the papers, “surprisingly good”.', 'It did not work. The family has some members who are not speaking to each other.'],
      'The group was closed. Meetings are now long, in person, and with no emojis.',
    ],
  },
  tongueSlip: {
    title: 'A slip of the tongue',
    body: 'In a live speech you called a district by the wrong name, then used a word that is not a word, then tried to correct it with a proverb you got wrong. A clip of the three together has been set to music.',
    options: ['Apologise, and laugh at yourself', 'Make a joke of it, and use the clip yourself', 'Insist that you meant exactly that'],
    results: [
      'The apology was accepted, with a few remarks, as a matter of form.',
      ['The joke landed. The clip, with your own commentary, was the most shared thing of the week.', 'The joke did not land. It was explained by a commentator, and an explained joke is a dead one.'],
      'Your supporters respected your stubbornness, and the dictionary has issued a statement.',
    ],
  },
  newsPortal: {
    title: 'The new portal',
    body: 'A small independent news portal, run from a shophouse by six people and an elderly cat, offers you an interview. It has a loyal readership and very little money. It has also asked, separately, whether you would like to advertise.',
    options: ['Give them the interview, for nothing', 'Pay for a series of friendly features', 'Politely refuse both'],
    results: [
      'The interview was long and frank, and it was read by exactly the people who read long and frank interviews.',
      'The features ran. Someone noticed the word “sponsored” in small print, and everyone noticed the small print.',
      'The portal wrote, with some warmth, that it understood. It wrote the rest of its piece without you.',
    ],
  },
  twoBranches: {
    title: 'Two branches, one hall',
    body: 'Two branches of the party in the same town have been using the same hall for years, on alternate Thursdays. A dispute over who gets the good chairs has turned into a dispute over who is the real branch.',
    options: ['Merge the two branches', 'Pay for a second hall', 'Appoint a committee to look into the chairs'],
    results: [
      'The branches were merged, and the chairs are now a joint responsibility. Both chairmen have resigned from the committee, which was the point.',
      'The second hall has a better roof and the same chairs. The branches are speaking, from a distance.',
      'The committee will report in due course. It has not yet agreed on the question.',
    ],
  },
  youngTalent: {
    title: 'The young engineer',
    body: 'A twenty-eight-year-old engineer, whose video explaining the flood barrier has been watched by a million people, would like to stand for the party. The division chief has been in the party for forty years and has a nephew who would like the seat.',
    options: ['Give her a safe seat', 'Tell her to earn it like everyone else', 'Put her in a marginal seat with a good mentor'],
    results: [
      'She was given the seat, and the nephew’s father has not spoken to you since.',
      'She went to a rival party, which was delighted, and publicised the fact.',
      ['She won over the marginal seat and the division chief’s respect, in that order.', 'She was beaten by an old hand in a bad year, and the nephew’s father said that he had said so.'],
    ],
  },
  veteranMp: {
    title: 'The veteran who will not go',
    body: 'A member of Parliament, eighty-one years old and beloved, has said he will stand again, and that he will do so on a wheelchair if necessary. He is in the habit of calling the party leader “young man”.',
    options: ['Honour him with an advisory post', 'Ask him, gently, to step aside', 'Let him stand'],
    results: [
      'He accepted the post, and was seen at three funerals and two weddings in the first week. The party is fond of him, and the seat is available.',
      'He stepped aside, with a speech of forty minutes. The party applauded, and a few members cried.',
      'He stood again, and was elected again, and the party’s young took it as a sign of what it thought of them.',
    ],
  },
};

export const NEW_EVENTS_MS: Record<string, EventText> = {
  nasiLemakPrice: {
    title: 'Harga sarapan',
    body: 'Gambar sebungkus nasi lemak dengan sebiji telur dan harga yang naik lagi jadi gambar paling banyak dikongsi di negara ni. Komen-komen bukan pasal telur. Semua orang pandang anda.',
    options: ['Lancarkan pemantauan harga sarapan dan biayai gerai yang sertai', 'Makan sebungkus depan kamera dan kata ia berbaloi', 'Kata harga ditentukan pasaran dan tak ada siapa patut terkejut'],
    results: [
      'Gerai-gerai tampal pelekat anda dan tahan harga sebulan. Makcik-makcik kata itulah skim pertama yang waras dalam beberapa tahun.',
      ['Gambar anda makan, dengan sambal di dagu, dikongsi atas sebab yang betul.', 'Rupa-rupanya bungkusan tu hadiah pembekal. Gambar tu dikongsi atas sebab yang salah.'],
      'Anda betul, dan video anda yang betul tu ditonton semua orang yang tak nak dengar.',
    ],
  },
  cooperativeBank: {
    title: 'Penyelamatan koperasi',
    body: 'Sebuah bank koperasi petani, yang simpan duit separuh daerah sejak sebelum merdeka, tak boleh tampung pengeluaran. Pengerusinya di telefon, dan setiap pekebun kecil yang pernah percayakan papan tanda pun sama.',
    options: ['Selamatkan dengan duit awam', 'Biar ia gagal, dan kata undang-undang tetap undang-undang', 'Atur penyelamatan oleh bank yang lebih besar, dan harap syaratnya kekal'],
    results: [
      'Koperasi diselamatkan, dan petani hantar durian pada anda. Perbendaharaan hantar memo.',
      'Koperasi ditutup. Undang-undang dipatuhi, dan daerah tu akan ingat siapa yang patuh.',
      ['Bank yang lebih besar ambil alih dengan syarat adil, dan simpanan selamat.', 'Bank yang lebih besar jumpa “ketidakteraturan” dan ubah syarat. Para pekebun kecil belajar apa itu term sheet.'],
    ],
  },
  gigInsurance: {
    title: 'Insurans untuk rider',
    body: 'Seorang rider cedera di jalan raya masa hantar sepinggan nasi goreng, dan app majikannya kata dia “tak bertugas”. Videonya ditonton dua juta kali. Sebuah kesatuan yang belum wujud bulan lepas sekarang dah ada petisyen dan jurucakap.',
    options: ['Biayai skim kemalangan untuk semua rider', 'Wajibkan platform bayar, melalui undang-undang', 'Kata ini urusan antara rider dan app'],
    results: [
      'Skim tu bayar dalam masa dua minggu. Rider tampal pelekat parti anda di sebelah kotak penghantaran.',
      'Platform ugut nak keluar, tapi sebaliknya naikkan yuran. Rider kini dilindungi insurans, tapi restoran tak puas hati.',
      'Kenyataan anda dipetik dengan tepat, tapi tak ada siapa ucap terima kasih.',
    ],
  },
  nightMarket: {
    title: 'Pasar malam',
    body: 'Majlis nak pindahkan pasar malam lama dari jalan utama supaya lalu lintas lancar. Peniaga kata pasar tu lah lalu lintasnya. Persatuan penduduk kata mereka tak boleh tidur, dan hantar petisyen yang lebih panjang daripada petisyen peniaga.',
    options: ['Berdiri bersama peniaga', 'Pindahkan pasar, dan bayar tapak baharu', 'Kata majlis yang tentukan'],
    results: [
      'Pasar kekal. Peniaga setia, penduduk tak.',
      'Tapak baharu dirasmikan dengan reben, dan beberapa gerai lama tak pernah datang. Penduduk tidur; peniaga membebel.',
      ['Majlis pilih dengan baik, dan anda diucap terima kasih sebab serahkan pada mereka.', 'Majlis pilih dengan teruk, dan peniaga tanya kenapa anda serahkan pada mereka.'],
    ],
  },
  electricityTariff: {
    title: 'Tarif elektrik',
    body: 'Syarikat utiliti kata ia tak mampu lagi tanggung kos bahan api. Ia nak tarif lebih tinggi untuk industri, yang katanya rumah tak akan rasa, dan yang menurut setiap pemilik kilang, rumah tetap akan rasa di kaunter bayaran.',
    options: ['Naikkan untuk pengguna besar saja', 'Tanggung kenaikan dengan subsidi', 'Tangguhkan keputusan, dan harap harga bahan api turun'],
    results: [
      'Industri bayar, membebel, dan serahkan sebahagiannya pada pembeli. Syarikat utiliti gembira.',
      'Rumah terselamat, akaun tak. Perbendaharaan minta anda ingat hal ni.',
      ['Harga bahan api turun sendiri dan isu tu hilang.', 'Harga bahan api naik, utiliti kekurangan, dan lampu berkelip di televisyen langsung.'],
    ],
  },
  cropGlut: {
    title: 'Lambakan hasil',
    body: 'Musim tuaian melimpah, dan petani pula yang dihukum: begitu banyak buah dan sayur sampai pemborong bayar kurang daripada kos memetik. Sebuah lori hasil tak terjual dicurah depan pejabat daerah.',
    options: ['Beli lebihan dan agihkan percuma', 'Cari pasaran luar negara cepat-cepat', 'Kata harga naik dan turun, semua benda pun sama'],
    results: [
      'Lebihan tu beri makan ramai orang, dan lori berhenti datang ke pejabat daerah.',
      ['Pembeli jumpa, dan hasil tu berlepas dengan kapal yang manifesnya tertera nama parti anda.', 'Pembeli tarik diri, dan hasil tu sekarang dah sangat masak.'],
      'Jawapan yang falsafah, dan petani tak rasa falsafah pun.',
    ],
  },
  lakeResort: {
    title: 'Resort tasik',
    body: 'Seorang pemaju nak bina resort di tebing tasik bukit, dengan seratus bilik, padang golf dan landasan helikopter. Negeri akan dapat kerja dan banyak duit. Tasik akan dapat landasan helikopter.',
    options: ['Luluskan, dengan syarat', 'Tolak, dan lindungi tebing', 'Adakan pendengaran awam dan ikut hasilnya'],
    results: [
      'Resort diluluskan. Syaratnya ada dalam dokumen yang tak ada siapa baca.',
      'Pemaju pergi. Tasik tak perasan, pekan perasan.',
      ['Pendengaran tu tenang dan berinformasi, dan keputusannya diterima ramai.', 'Pendengaran tu jadi berlawan jerit, dan tak ada siapa terima apa-apa.'],
    ],
  },
  trawlers: {
    title: 'Nelayan dan pukat tunda',
    body: 'Pukat tunda besar kerja dekat pantai waktu malam, dan bot kecil balik dengan separuh tangkapan. Persatuan nelayan nak zon dikuatkuasakan. Pemilik pukat tunda ada kawan.',
    options: ['Kuatkuasakan zon, dan hantar bot peronda', 'Lesenkan bot besar, dengan bayaran', 'Tubuhkan dana untuk beri pampasan kepada bot kecil'],
    results: [
      'Bot peronda keluar, dan bot kecil balik dengan jaring penuh dan pendapat lantang pasal anda.',
      'Bayaran dijelaskan sepenuhnya, bot kecil tak, dan pengerusi persatuan dah berhenti jawab panggilan anda.',
      'Dana tu disambut baik. Tangkapan tak bertambah, tapi nelayan perasan anda ada tanya.',
    ],
  },
  heritageHouse: {
    title: 'Rumah warisan',
    body: 'Jalan baharu akan lalu taman sebuah rumah lama yang dibina sebelum perang, dan yang tak ada dalam senarai warisan sesiapa. Sekumpulan pelajar dan guru bersara dah rantai diri di pintu pagar dengan penuh maruah.',
    options: ['Warta rumah tu, dan bengkokkan jalan', 'Biar jalan lalu situ', 'Cuba pindahkan rumah tu, batu demi batu'],
    results: [
      'Rumah diselamatkan, jalan membengkok, dan pelajar buka rantai dengan lega.',
      'Jalan siap tepat masa. Rumah tu sekarang stesen minyak, dan guru-guru bersara tengah tulis surat.',
      ['Rumah dipindahkan, dan sekarang berdiri di taman, nampak agak terkejut.', 'Rumah tu retak masa dipindahkan. Pelajar simpan kepingannya.'],
    ],
  },
  stateBanquet: {
    title: 'Bil jamuan',
    body: 'Bil jamuan negeri bocor: enam puluh lapan hidangan, dua tukang masak import dan arca ibu negeri daripada ais. Jamuan tu untuk empat puluh tetamu, seorang daripadanya menteri yang balik awal.',
    options: ['Akui, dan hantar kosnya ke dana banjir', 'Pertahankan sebagai promosi negeri', 'Salahkan pejabat protokol'],
    results: [
      'Cek dihantar ke dana banjir esok paginya, dan arca ais jadi cerita yang disebut dengan penuh kasih.',
      ['Ia dijelaskan sebagai pelaburan, dan kebetulan seorang pelabur memang muncul.', 'Ia dijelaskan sebagai pelaburan, dan tak ada siapa percaya, apatah lagi arca ais tu.'],
      'Ketua protokol tengah cari kerja baharu, dan kakitangan anda sendiri pandang anda.',
    ],
  },
  hawkerLicence: {
    title: 'Penjaja dan peraturan baharu',
    body: 'Peraturan baharu wajibkan setiap penjaja pegang lesen, dengan gambar, sijil kesihatan dan tiga cop daripada tiga pejabat. Pejabat-pejabat tu tak buka waktu yang sama. Penjaja tunjukkan hal ni dengan berarak.',
    options: ['Isytihar pengampunan dan tinjau semula peraturan tu', 'Kuatkuasakan, dan kata ia demi kebersihan', 'Buat lesen digital yang murah, satu borang dan satu pejabat'],
    results: [
      'Pengampunan disambut baik. Pegawai kesihatan tanya, dengan sopan, siapa yang nak periksa.',
      'Pemeriksa berkeliling bawa clipboard. Makanan jadi sikit lebih bersih dan penjaja jauh lebih marah.',
      'App ranap hari pertama, lepas tu berfungsi. Separuh penjaja sekarang ada lesen dan kod QR.',
    ],
  },
  ferryStops: {
    title: 'Feri berhenti',
    body: 'Satu-satunya feri antara pulau dan tanah besar berhenti beroperasi, sebab pengendalinya kata tambang tak cukup tampung diesel. Murid sekolah tersangkut, dan pasar terhenti. Ketua kampung hantar surat yang sopan dan agak panjang.',
    options: ['Subsidikan perkhidmatan tu', 'Serahkan kepada pengendali swasta dengan tambang lebih tinggi', 'Janji jambatan, dan harap pilihan raya masih jauh'],
    results: [
      'Feri jalan semula hari Isnin, dan budak-budak sampai ke sekolah.',
      'Pengendali baharu caj lebih mahal, dan penduduk pulau rasa bezanya dalam dompet.',
      ['Janji tu dipercayai, buat masa ni, dan feri jalan semula.', 'Janji tu tak dipercayai, dan feri masih tak jalan.'],
    ],
  },
  fakeNewsLaw: {
    title: 'Rang undang-undang berita palsu',
    body: 'Khabar angin pasal sebuah bank yang tak wujud kosongkan tiga kedai daripada beras dalam satu petang. Kabinet nak undang-undang menentang berita palsu dengan hukuman penjara dan larangan akaun tanpa nama. Peguam nak tahu siapa yang tentukan apa yang palsu.',
    options: ['Lulus macam sedia ada', 'Lulus dengan mahkamah, dan had siapa yang boleh mengadu', 'Gantung, dan minta platform berkelakuan baik'],
    results: [
      'Undang-undang diluluskan. Khabar angin berhenti, banyak benda lain pun sama, dan golongan muda perasan.',
      'Mahkamah ditubuhkan, dan rang tu dikatakan “boleh dilaksanakan”. Tak dikatakan “berani”.',
      'Platform setuju berkelakuan baik. Mereka tengah perhati berapa lama tu bertahan.',
    ],
  },
  memeWar: {
    title: 'Meme',
    body: 'Gambar anda dengan riak wajah yang salah dan kapsyen yang bukan anda tulis dah tersebar ke setiap group chat di negara ni. Gambar tu sebenarnya agak okey. Seorang yang jahat dah burukkannya.',
    options: ['Kongsi sendiri, dengan kapsyen yang lebih baik', 'Minta ia diturunkan, dan hantar notis', 'Diam saja, biar ia cari tahapnya'],
    results: [
      ['Kapsyen anda lebih bagus daripada mereka, dan golongan muda cakap macam tu dengan lantang.', 'Kapsyen anda dikatakan “try-hard” oleh orang yang kemudian kongsi empat puluh ribu kali.'],
      'Notis tu diterima, lepas tu disiarkan. Ia dipanggil jenaka terbaik minggu tu.',
      'Ia tersebar beberapa hari, lepas tu seekor kucing buat sesuatu, dan negara beralih.',
    ],
  },
  whatsappLeak: {
    title: 'Group chat',
    body: 'Tangkapan skrin group chat jawatankuasa parti sendiri dah bocor, termasuk beberapa pendapat pasal ketua yang sepatutnya untuk group saja, dan jumlah emoji yang luar biasa. Group tu ada tujuh puluh satu ahli, mana-mana satu boleh hantar.',
    options: ['Cari pembocor dan keluarkan', 'Gelak saja, dan kata parti ni keluarga', 'Tutup group, dan jumpa bersemuka saja'],
    results: [
      'Pembocor jumpa, dan seorang yang tak ada siapa syak, yang buat lagi teruk.',
      ['Gelak berkesan. Jenaka ketua sendiri dalam chat tu, kata akhbar, “mengejutkan, bagus”.', 'Tak berkesan. Keluarga tu ada ahli yang tak bercakap sesama sendiri.'],
      'Group ditutup. Mesyuarat sekarang panjang, bersemuka, dan tanpa emoji.',
    ],
  },
  tongueSlip: {
    title: 'Terlepas cakap',
    body: 'Dalam ucapan langsung anda sebut nama sebuah daerah dengan salah, lepas tu guna perkataan yang bukan perkataan, lepas tu cuba betulkan dengan peribahasa yang anda salah. Klip ketiga-tiganya digabungkan dah dijadikan lagu.',
    options: ['Minta maaf, dan gelakkan diri sendiri', 'Jadikan jenaka, dan guna klip tu sendiri', 'Berkeras itulah yang anda maksudkan'],
    results: [
      'Maaf diterima, dengan beberapa ulasan, sekadar adat.',
      ['Jenaka tu menjadi. Klip tu, dengan ulasan anda sendiri, paling banyak dikongsi minggu tu.', 'Jenaka tu tak menjadi. Ia dijelaskan oleh pengulas, dan jenaka yang dijelaskan ialah jenaka yang mati.'],
      'Penyokong hormati kedegilan anda, dan kamus keluarkan kenyataan.',
    ],
  },
  newsPortal: {
    title: 'Portal baharu',
    body: 'Portal berita bebas yang kecil, dijalankan dari sebuah rumah kedai oleh enam orang dan seekor kucing tua, tawarkan temu bual. Ia ada pembaca setia dan sangat sikit duit. Ia juga tanya, secara berasingan, sama ada anda nak beriklan.',
    options: ['Beri temu bual, percuma', 'Bayar untuk siri rencana mesra', 'Tolak kedua-duanya dengan sopan'],
    results: [
      'Temu bual tu panjang dan terus terang, dan dibaca oleh tepat orang yang memang baca temu bual panjang dan terus terang.',
      'Rencana tersiar. Ada yang perasan perkataan “ditaja” dalam tulisan kecil, dan semua orang perasan tulisan kecil tu.',
      'Portal tu tulis, dengan agak mesra, yang ia faham. Ia tulis selebihnya tanpa anda.',
    ],
  },
  twoBranches: {
    title: 'Dua cawangan, satu dewan',
    body: 'Dua cawangan parti di pekan yang sama dah guna dewan yang sama bertahun-tahun, hari Khamis berselang. Pertikaian siapa dapat kerusi yang elok dah jadi pertikaian siapa cawangan sebenar.',
    options: ['Gabungkan dua cawangan', 'Bayar untuk dewan kedua', 'Lantik jawatankuasa untuk siasat kerusi tu'],
    results: [
      'Cawangan digabungkan, dan kerusi sekarang tanggungjawab bersama. Dua-dua pengerusi letak jawatan daripada jawatankuasa, itulah tujuannya.',
      'Dewan kedua ada bumbung yang lebih elok dan kerusi yang sama. Cawangan bercakap, dari jauh.',
      'Jawatankuasa akan melapor pada masanya. Ia belum setuju pun pasal soalannya.',
    ],
  },
  youngTalent: {
    title: 'Jurutera muda',
    body: 'Seorang jurutera umur dua puluh lapan tahun, yang videonya terangkan benteng banjir ditonton sejuta orang, nak bertanding bersama parti. Ketua bahagian dah empat puluh tahun dalam parti dan ada anak saudara yang nakkan kerusi tu.',
    options: ['Beri dia kerusi selamat', 'Suruh dia usaha dapatkannya macam orang lain', 'Letak dia di kerusi marginal dengan mentor yang bagus'],
    results: [
      'Dia diberi kerusi tu, dan ayah anak saudara tu tak bercakap dengan anda sejak itu.',
      'Dia sertai parti saingan, yang sangat gembira, dan umumkan hal tu.',
      ['Dia menang kerusi marginal dan dapat hormat ketua bahagian, ikut turutan tu.', 'Dia ditewaskan oleh orang lama pada tahun yang teruk, dan ayah anak saudara tu kata dia dah cakap.'],
    ],
  },
  veteranMp: {
    title: 'Veteran yang tak mahu pergi',
    body: 'Seorang ahli Parlimen, umur lapan puluh satu tahun dan disayangi, kata dia akan bertanding lagi, dan akan buat macam tu atas kerusi roda kalau perlu. Dia biasa panggil ketua parti “anak muda”.',
    options: ['Hormatinya dengan jawatan penasihat', 'Minta dia, dengan lembut, beri laluan', 'Biar dia bertanding'],
    results: [
      'Dia terima jawatan tu, dan nampak di tiga majlis pengebumian dan dua kenduri minggu pertama. Parti sayangkan dia, dan kerusi tu terbuka.',
      'Dia beri laluan, dengan ucapan empat puluh minit. Parti bertepuk, dan beberapa ahli menangis.',
      'Dia bertanding lagi, dan dipilih lagi, dan golongan muda parti anggap itu tanda apa yang difikirkan tentang mereka.',
    ],
  },
};
