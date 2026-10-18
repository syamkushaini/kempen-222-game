import type { EventText } from './events';

// The last twenty of the forty newest events, in English and Bahasa Malaysia. Every person, company and body in them is
// invented. A result written as a pair is for a gamble: what is reported if it comes off, then if it does not.

export const NEW_EVENTS_2_EN: Record<string, EventText> = {
  billboardSponsor: {
    title: 'The billboard sponsor',
    body: 'A company that makes cooking oil offers to pay for every one of your billboards in the state, in return for its logo, in a corner, at a reasonable size. The corner is large. The reasonable size is not.',
    options: ['Accept, and keep the logo small', 'Refuse, and pay for your own', 'Negotiate harder for a smaller logo and a bigger cheque'],
    results: [
      'The billboards went up, with a bottle of cooking oil in the corner that was larger than your face.',
      'The billboards were fewer, and nobody could say your party was bought by a vegetable oil.',
      ['The company agreed, and the logo shrank to a dot. It was spotted only by the rival party.', 'The company walked, and told the papers it had been “taken for granted”.'],
    ],
  },
  womensQuota: {
    title: 'The women’s wing wants a quota',
    body: 'The women’s wing has written to the leader, politely, asking for a third of the candidates in the next election to be women. It has attached a list of forty names, each of whom has already knocked on more doors than the men they would replace.',
    options: ['Agree to a third', 'Agree to “as many as possible”', 'Thank them, and say the time is not right'],
    results: [
      'The quota was agreed. Three division chiefs are not speaking to you; forty women are canvassing.',
      '“As many as possible” turned out to be eleven. The wing said it was a start and kept the list.',
      'The time was not right, and the wing said that it had not been right in the party for thirty years.',
    ],
  },
  memberApp: {
    title: 'The membership app',
    body: 'The party still takes new members with a paper form, a photocopier and a clerk named Hasnah. A volunteer who works for a software firm says the whole process could be on a phone by next month, if the party would trust her with the database.',
    options: ['Build the app properly', 'Buy one off the shelf', 'Leave it as it is: Hasnah is very good'],
    results: [
      'The app went live. It signed up eleven thousand members in a month, and Hasnah supervises it, with a certain sniff.',
      ['The off-the-shelf app worked, to everyone’s mild surprise.', 'The off-the-shelf app turned out to share the party’s list with an advertiser.'],
      'Hasnah was grateful, and the volunteer left to build one for the other party.',
    ],
  },
  hallFire: {
    title: 'The party hall burns',
    body: 'In the night the old party hall caught fire, probably from the wiring, which had been on the list of things to do since before the last election. The flags are gone. The photographs of the founders are mostly gone. The fire brigade says it was “a mercy” that it was a Tuesday.',
    options: ['Hold a members’ drive to rebuild it', 'Claim the insurance and rent a hall', 'Appeal to the donors, and name the new hall for the biggest'],
    results: [
      'Members brought bricks, tiles and rather a lot of tea. The new hall opened in a few months, and it belongs to them.',
      'The insurance paid out in part. The party rents a hall above a bank, and it is rather cold.',
      ['The donors were generous, and the hall was named after a man who had never visited it.', 'The donors did not call back, and the hall was named after nobody for a long time.'],
    ],
  },
  cabinetLeak: {
    title: 'The leak from the cabinet',
    body: 'The minutes of a cabinet meeting, including the words of several ministers about each other, are in the hands of a newspaper. There are eleven different accounts of how, and nine people who are certain it was somebody else.',
    options: ['Hold an inquiry and find the leaker', 'Publish the full minutes yourself', 'Say nothing, and let the newspaper print'],
    results: [
      'The inquiry found a junior aide, who said he had been told to. Nobody now believes anybody.',
      'The minutes were published. They were less exciting than the leak, and the government was thanked for its honesty and teased for its adjectives.',
      'The newspaper printed, and the cabinet read it over breakfast with great attention.',
    ],
  },
  extraHoliday: {
    title: 'One more holiday',
    body: 'A union of civil servants has asked for another public holiday, to be taken on the Friday that falls before a long weekend. Shopkeepers say they would lose a day’s takings. Everyone else says they would gain a day.',
    options: ['Declare the holiday', 'Refuse it', 'Move an existing holiday to a Friday instead'],
    results: [
      'The holiday was declared, and the beaches were full. The shopkeepers kept a list.',
      'The shops stayed open, and the civil servants stayed grumpy at their desks.',
      'The swap was found “sensible” by commentators, and found “a bit dull” by everybody else.',
    ],
  },
  airMiles: {
    title: 'The air miles',
    body: 'An analysis of the minister’s travel claims shows he spent a hundred and forty days abroad last year, in places where, an aide admits, “there was not very much to see”. His family was present for a number of the trips. The photographs are on a beach.',
    options: ['Publish the itinerary and cut the trips', 'Defend them as trade missions', 'Quietly move the minister to another post'],
    results: [
      'The itinerary was published, and the trips were cut. The minister will not forgive you, and the papers will.',
      ['It turned out that one of the trips had indeed produced a contract, and the minister held it up on television.', 'It turned out that the “trade mission” was a wedding.'],
      'The minister moved. The papers wrote that the post had been “a new start”, which was not in the press release.',
    ],
  },
  houseWalkout: {
    title: 'A walkout in the House',
    body: 'The Speaker has ruled that the opposition’s motion cannot be debated. The opposition benches are muttering about walking out in protest. The government benches, with some pleasure, are saying that they would be sorry to see them go.',
    options: ['Join the walkout', 'Stay, and debate what you can', 'Keep your seat, and say nothing'],
    results: [
      'Your members walked out, with dignity. The cameras covered the dignity, and the empty chamber, in that order.',
      'You stayed and made the point. The chamber was nearly empty, and the Hansard was not.',
      'You kept your seat. A few of your own members looked at you as though you had missed something.',
    ],
  },
  sharpQuestion: {
    title: 'Question time',
    body: 'Your name is down for the first oral question to the Prime Minister, and the House will be full, and the press gallery will be full. You have forty-five seconds, a dossier and an idea about what to do with them.',
    options: ['Use the dossier to ask the question they cannot answer', 'Ask a clever question and get a laugh', 'Ask about a pothole in your own district'],
    results: [
      'The question was sharp. The Prime Minister’s answer was a speech about something else, and the dossier is now in the public record.',
      'The question was clever, the laugh was generous, and the answer was a longer laugh.',
      'The pothole was filled within a week, and the press gallery has been asking for years what the real question was.',
    ],
  },
  partyAnniversary: {
    title: 'The anniversary',
    body: 'The party is fifty years old this month. The committee has proposed a banquet for two thousand, a commemorative stamp, and a song. Nobody has asked whether anyone wants the song.',
    options: ['Hold the banquet', 'Hold a charity walk, with the same stamp', 'Let the anniversary pass with a short statement'],
    results: [
      'The banquet was long, loud and a triumph for the catering. Two thousand members left feeling that they belonged to something.',
      'The walk raised money for a clinic, and the stamp was admired by a collector in another state.',
      'The statement was short. The party’s elders have said that the song would have been quite good.',
    ],
  },
  consultants: {
    title: 'The consultants’ report',
    body: 'A firm of foreign consultants was paid a very large sum to write a report on how to improve public services. The report has arrived, in three hundred pages, and says several things that the civil service has been saying for twenty years, in a better font.',
    options: ['Adopt the report’s recommendations', 'Do what is sensible and ignore the rest', 'File it, and ask the civil service for its own'],
    results: [
      'The recommendations were adopted. A few worked, a few were quietly dropped, and the font was kept.',
      'The sensible bits were done, and a few of the less sensible bits were done by accident.',
      'The civil service produced its own report in a week, and it was thirty pages shorter and just as correct.',
    ],
  },
  schoolMeals: {
    title: 'Meals for the children',
    body: 'A teacher in a district school has written a short and moving account of children who arrive without breakfast and fall asleep by ten. A charity has offered to cover half of a meals scheme if the government will cover the rest.',
    options: ['Fund free meals for all schools', 'Fund meals for the poorest schools only', 'Run a pilot in three districts first'],
    results: [
      'The meals scheme began, and the teachers reported that the children were awake, noisy and a little taller.',
      'The poorest schools were served, and a few schools just over the line asked, reasonably, where the line was.',
      ['The pilot worked beautifully, and the figures were published with a flourish.', 'The pilot was run badly, and the opposition printed the photographs of the lunch.'],
    ],
  },
  trafficJam: {
    title: 'The jam',
    body: 'A study has shown that the average commuter in the capital spends two and a half hours a day in a car, and that the jam on the main highway is now longer than the highway. The study was commissioned, and the commissioner was stuck in the jam.',
    options: ['Introduce a congestion charge', 'Put more buses on the road and pay for them', 'Promise a flyover'],
    results: [
      'The charge was introduced. Those who drive grumbled, and those who take the bus grumbled slightly less.',
      'The buses were bought, and filled up, and the roads were no clearer, though the buses were cheerful.',
      ['The flyover was built on time, which has never happened before.', 'The flyover was not built, and neither was the one before it.'],
    ],
  },
  goldMedal: {
    title: 'The gold medal',
    body: 'A young athlete from a village near the coast has won the country’s first gold medal in her sport at a major games. She has said, in an interview, that she thanks her mother, her coach and a man at a kedai who lent her a bicycle. She has not mentioned you, as yet.',
    options: ['Give her a hero’s welcome', 'Stay well away, and let the family have it', 'Set up a fund for young athletes in her name'],
    results: [
      'The welcome was a crowd, a convoy and a brass band. She was gracious about it, and looked a little tired.',
      'You stayed away. The athlete thanked a lot of people, and your name was not among them, which, you were told, was the point.',
      'The fund was announced. The athlete’s mother cut the ribbon, and was photographed in the nicest possible light.',
    ],
  },
  scamCalls: {
    title: 'The scam calls',
    body: 'A grandmother has lost her life’s savings to a phone call from someone claiming to be a bank officer. She is one of thousands. The calls are made from abroad, the money goes through four countries, and the police say they would love some cooperation.',
    options: ['Set up a task force with the banks', 'Blame the banks, loudly', 'Run an awareness campaign on every channel'],
    results: [
      'The task force froze accounts within hours, and returned a number of the savings. Grandmothers wrote to you.',
      'The banks said that they had done nothing wrong, and so did the scammers.',
      'The campaign ran, and a few people were saved by a jingle that they said they hated.',
    ],
  },
  tuitionCentres: {
    title: 'The tuition centres',
    body: 'Parents are paying more for evening tuition than for the school itself. The centres are unlicensed, uninspected and, according to one teacher, “doing what the school used to”. A group of parents has written to every politician in the district.',
    options: ['Regulate the fees and the centres', 'Leave the market to settle it', 'Fund free online tuition for every child'],
    results: [
      'The fees were capped, and the owners of the centres wrote to the papers with figures that were all, strangely, in their favour.',
      'The market settled it by raising fees, and the parents wrote again.',
      'The online lessons were watched by half a million children. A quarter of them watched at two in the morning.',
    ],
  },
  strayCats: {
    title: 'The strays',
    body: 'A council in a big town has decided to deal with its stray cats, of which there are many, and has an order drafted and a van reserved. A group of children have drawn posters. The posters have gone viral. The van has become a symbol.',
    options: ['Fund a neutering and adoption programme', 'Back the council’s order', 'Issue a statement of concern, and leave it to the council'],
    results: [
      'The programme began. The cats, being cats, showed no gratitude, but their human friends did.',
      'The order was carried out, quietly. The posters were taken down by hand, and the children did not forget who had signed.',
      'The statement was read by people who wanted action, and found wanting.',
    ],
  },
  visaFree: {
    title: 'Visas for visitors',
    body: 'The tourism board says that waiving visas for visitors from a very large neighbour would bring in a million tourists a year. The home ministry says that a million visitors are a million people nobody has met. The hotel association has already ordered extra towels.',
    options: ['Waive the visas for all of them', 'Try a year-long trial first', 'Keep the rules as they are'],
    results: [
      'The visas were waived, the planes were full, and the hotels needed more towels than they had ordered.',
      'The trial was a modest success, and a modest success is hard to criticise.',
      'The rules stayed. The hotel association has been very polite about it, in the manner of people keeping a list.',
    ],
  },
  foreignCampus: {
    title: 'A foreign campus',
    body: 'A famous foreign university has offered to open a campus in the capital, with its own lecturers and its own degrees. Our own universities say they would be left with the students who could not get in. The students say they would like a choice.',
    options: ['Welcome it, as it is offered', 'Welcome it, with a quota of local students and a scholarship fund', 'Refuse, and invest in our own universities instead'],
    results: [
      'The campus opened, and the foreign flag went up beside ours. The local vice-chancellors went rather quiet.',
      'The campus accepted the quota, and a number of scholarship students who would never have gone anywhere are now at it.',
      'Our universities were pleased, and the students were told that a better future was being prepared for them, at some point.',
    ],
  },
  carbonRule: {
    title: 'The carbon rule',
    body: 'A group of trading partners will soon charge a tax at their borders on any goods made with a high carbon footprint. Our exporters will pay unless they change how they produce. The exporters say they need time. The partners say they have been told that before.',
    options: ['Comply early, and help exporters pay for it', 'Negotiate an exemption for our exporters', 'Ignore it, and see who blinks'],
    results: [
      'The exporters complied, with grants, and the partners called it “a good example”. A few of the factories closed all the same.',
      ['The partners agreed to a delay, and exporters had time to change.', 'The partners said no, and reminded us that they had said it before.'],
      'Nobody blinked. The tax applied on the first day, and the exporters sent you the bill.',
    ],
  },
};

export const NEW_EVENTS_2_MS: Record<string, EventText> = {
  billboardSponsor: {
    title: 'Penaja papan iklan',
    body: 'Sebuah syarikat minyak masak tawar bayar setiap papan iklan anda di negeri ni, sebagai ganti logonya, di sudut, pada saiz yang munasabah. Sudutnya besar. Saiz munasabah tu tak.',
    options: ['Terima, dan kekalkan logo kecil', 'Tolak, dan bayar sendiri', 'Runding lebih keras untuk logo lebih kecil dan cek lebih besar'],
    results: [
      'Papan iklan dipasang, dengan sebotol minyak masak di sudut yang lebih besar daripada muka anda.',
      'Papan iklan lebih sikit, tapi tak ada siapa boleh kata parti anda dibeli minyak sayuran.',
      ['Syarikat setuju, dan logo mengecil jadi setitik. Hanya parti saingan yang perasan.', 'Syarikat tu pergi, dan beritahu akhbar ia “dipandang remeh”.'],
    ],
  },
  womensQuota: {
    title: 'Sayap wanita nak kuota',
    body: 'Sayap wanita tulis kepada ketua, dengan sopan, minta sepertiga calon dalam pilihan raya akan datang ialah wanita. Ia lampirkan senarai empat puluh nama, setiap seorang dah ketuk lebih banyak pintu daripada lelaki yang akan digantikan.',
    options: ['Setuju sepertiga', 'Setuju “sebanyak mungkin”', 'Ucap terima kasih, dan kata masanya belum sesuai'],
    results: [
      'Kuota dipersetujui. Tiga ketua bahagian tak bercakap dengan anda; empat puluh wanita turun berkempen.',
      '“Sebanyak mungkin” rupa-rupanya sebelas orang. Sayap tu kata ia permulaan dan simpan senarai tu.',
      'Masanya belum sesuai, dan sayap tu kata dalam parti ni memang tak pernah sesuai selama tiga puluh tahun.',
    ],
  },
  memberApp: {
    title: 'App keahlian',
    body: 'Parti masih terima ahli baharu dengan borang kertas, mesin fotokopi dan seorang kerani bernama Hasnah. Seorang sukarelawan yang kerja di firma perisian kata seluruh proses boleh ada dalam telefon bulan depan, kalau parti percayakan dia dengan pangkalan data.',
    options: ['Bina app dengan betul', 'Beli yang sedia ada', 'Biar macam sedia ada: Hasnah sangat bagus'],
    results: [
      'App tu mula beroperasi dan daftarkan 11,000 ahli dalam sebulan. Hasnah selia semuanya sambil sesekali mengeluh.',
      ['App sedia ada tu berfungsi, mengejutkan semua orang sikit.', 'App sedia ada tu rupa-rupanya kongsi senarai parti dengan pengiklan.'],
      'Hasnah berterima kasih, dan sukarelawan tu pergi bina satu untuk parti lain.',
    ],
  },
  hallFire: {
    title: 'Dewan parti terbakar',
    body: 'Malam tadi dewan parti lama terbakar, mungkin sebab pendawaian, yang dalam senarai kerja sejak sebelum pilihan raya lepas. Bendera hilang. Gambar para pengasas kebanyakannya hilang. Bomba kata ia “satu rahmat” sebab hari Selasa.',
    options: ['Adakan kutipan ahli untuk bina semula', 'Tuntut insurans dan sewa dewan', 'Rayu penderma, dan namakan dewan baharu sempena yang terbesar'],
    results: [
      'Ahli bawa batu bata, jubin dan banyak teh. Dewan baharu dibuka dalam beberapa bulan, dan ia milik mereka.',
      'Insurans bayar sebahagian. Parti sewa dewan atas sebuah bank, dan agak sejuk.',
      ['Penderma bermurah hati, dan dewan dinamakan sempena seorang yang tak pernah jejak ke situ.', 'Penderma tak telefon balik, dan dewan tak dinamakan sempena sesiapa untuk masa yang lama.'],
    ],
  },
  cabinetLeak: {
    title: 'Kebocoran dari kabinet',
    body: 'Minit mesyuarat kabinet, termasuk kata-kata beberapa menteri pasal satu sama lain, dah ada di tangan sebuah akhbar. Ada sebelas versi macam mana ia berlaku, dan sembilan orang yang pasti ia orang lain.',
    options: ['Adakan siasatan dan cari pembocor', 'Siarkan sendiri minit penuh', 'Diam, dan biar akhbar siarkan'],
    results: [
      'Siasatan jumpa seorang pembantu muda, yang kata dia diarah. Sekarang tak ada siapa percayakan sesiapa.',
      'Minit disiarkan. Kurang menarik daripada kebocoran, dan kerajaan diucap terima kasih atas kejujurannya dan diusik atas kata sifatnya.',
      'Akhbar siarkan, dan kabinet baca masa sarapan dengan penuh perhatian.',
    ],
  },
  extraHoliday: {
    title: 'Satu lagi cuti',
    body: 'Sebuah kesatuan penjawat awam minta satu lagi cuti umum, diambil hari Jumaat sebelum hujung minggu panjang. Pemilik kedai kata mereka akan hilang hasil sehari. Semua orang lain kata mereka akan dapat sehari.',
    options: ['Isytiharkan cuti tu', 'Tolak cuti tu', 'Alihkan cuti sedia ada ke hari Jumaat sebagai ganti'],
    results: [
      'Cuti diisytiharkan, dan pantai penuh. Pemilik kedai simpan senarai.',
      'Kedai kekal buka, dan penjawat awam kekal bermasam muka di meja mereka.',
      'Pertukaran tu dianggap “munasabah” oleh pengulas, dan “agak membosankan” oleh semua orang lain.',
    ],
  },
  airMiles: {
    title: 'Air miles',
    body: 'Analisis tuntutan perjalanan menteri tunjuk dia berada di luar negara seratus empat puluh hari tahun lepas, di tempat yang, kata seorang pembantu, “tak banyak untuk dilihat”. Keluarganya ikut dalam beberapa lawatan. Gambarnya di pantai.',
    options: ['Siarkan jadual perjalanan dan kurangkan lawatan', 'Pertahankan sebagai misi perdagangan', 'Pindahkan menteri senyap-senyap ke jawatan lain'],
    results: [
      'Jadual disiarkan, dan lawatan dikurangkan. Menteri tak akan maafkan anda, akhbar akan.',
      ['Rupa-rupanya salah satu lawatan memang hasilkan kontrak, dan menteri tunjuk di televisyen.', 'Rupa-rupanya “misi perdagangan” tu majlis perkahwinan.'],
      'Menteri dipindahkan. Akhbar tulis jawatan tu “permulaan baharu”, yang tak ada dalam kenyataan akhbar.',
    ],
  },
  houseWalkout: {
    title: 'Walkout di Dewan',
    body: 'Speaker putuskan usul pembangkang tak boleh dibahaskan. Bangku pembangkang berbisik nak walkout sebagai bantahan. Bangku kerajaan, dengan sedikit keseronokan, kata mereka akan kesal tengok mereka pergi.',
    options: ['Sertai walkout', 'Kekal, dan bahaskan apa yang boleh', 'Kekal di kerusi, dan jangan cakap apa-apa'],
    results: [
      'Ahli anda keluar, dengan bermaruah. Kamera rakam maruah tu, dan dewan kosong, ikut turutan tu.',
      'Anda kekal dan nyatakan pendirian. Dewan hampir kosong, tapi Hansard tak.',
      'Anda kekal di kerusi. Beberapa ahli anda sendiri pandang anda macam anda terlepas sesuatu.',
    ],
  },
  sharpQuestion: {
    title: 'Waktu soalan',
    body: 'Nama anda tertera untuk soalan lisan pertama kepada Perdana Menteri, dan dewan akan penuh, galeri akhbar pun akan penuh. Anda ada empat puluh lima saat, satu dokumen siasatan dan satu idea apa nak buat dengannya.',
    options: ['Guna dokumen siasatan untuk tanya soalan yang mereka tak boleh jawab', 'Tanya soalan bijak dan dapatkan gelak', 'Tanya pasal lubang di jalan daerah anda sendiri'],
    results: [
      'Soalan tajam. Jawapan Perdana Menteri ialah ucapan pasal perkara lain, dan dokumen siasatan tu kini dalam rekod awam.',
      'Soalan bijak, gelaknya murah hati, dan jawapannya gelak yang lebih panjang.',
      'Lubang tu ditampal dalam seminggu, dan galeri akhbar bertahun-tahun tanya apa soalan sebenarnya.',
    ],
  },
  partyAnniversary: {
    title: 'Ulang tahun',
    body: 'Parti berusia lima puluh tahun bulan ni. Jawatankuasa cadangkan jamuan untuk dua ribu orang, setem peringatan, dan sebuah lagu. Tak ada siapa tanya sama ada ada orang nakkan lagu tu.',
    options: ['Adakan jamuan', 'Adakan jalan amal, dengan setem yang sama', 'Biar ulang tahun berlalu dengan kenyataan ringkas'],
    results: [
      'Jamuan panjang, bising dan kemenangan bagi katering. Dua ribu ahli balik dengan rasa mereka sebahagian daripada sesuatu.',
      'Jalan amal kumpul duit untuk klinik, dan setem tu dikagumi seorang pengumpul di negeri lain.',
      'Kenyataan ringkas. Orang tua parti kata lagu tu sebenarnya agak bagus.',
    ],
  },
  consultants: {
    title: 'Laporan perunding',
    body: 'Sebuah firma perunding asing dibayar sejumlah besar untuk tulis laporan cara baiki perkhidmatan awam. Laporan tu dah sampai, tiga ratus muka surat, dan sebut beberapa benda yang perkhidmatan awam dah cakap dua puluh tahun, dalam fon yang lebih cantik.',
    options: ['Terima pakai cadangan laporan tu', 'Buat apa yang munasabah dan abaikan selebihnya', 'Failkan, dan minta perkhidmatan awam sediakan sendiri'],
    results: [
      'Cadangan diterima pakai. Beberapa berjaya, beberapa digugurkan senyap-senyap, dan fon tu dikekalkan.',
      'Bahagian yang munasabah dibuat, dan beberapa bahagian yang kurang munasabah terbuat tanpa sengaja.',
      'Perkhidmatan awam siapkan laporan sendiri dalam seminggu, tiga puluh muka surat lebih pendek dan sama betul.',
    ],
  },
  schoolMeals: {
    title: 'Makanan untuk kanak-kanak',
    body: 'Seorang guru di sebuah sekolah daerah tulis catatan pendek dan menyentuh hati pasal budak-budak yang datang tanpa sarapan dan tertidur menjelang pukul sepuluh. Sebuah badan amal tawar tampung separuh skim makanan kalau kerajaan tampung selebihnya.',
    options: ['Biayai makanan percuma untuk semua sekolah', 'Biayai makanan untuk sekolah termiskin saja', 'Jalankan perintis di tiga daerah dulu'],
    results: [
      'Skim makanan bermula, dan guru lapor budak-budak bersemangat, bising dan sikit lebih tinggi.',
      'Sekolah termiskin dilayan, dan beberapa sekolah yang sikit melepasi garisan tanya, dengan munasabah, mana garisannya.',
      ['Perintis berjalan dengan cantik, dan angka diterbitkan dengan megah.', 'Perintis dijalankan dengan teruk, dan pembangkang siarkan gambar makan tengah hari tu.'],
    ],
  },
  trafficJam: {
    title: 'Kesesakan',
    body: 'Satu kajian tunjuk purata pengguna jalan raya di ibu negara habiskan dua jam setengah sehari dalam kereta, dan kesesakan di lebuh raya utama kini lebih panjang daripada lebuh raya tu sendiri. Kajian tu ditugaskan, dan penugasnya tersangkut dalam kesesakan.',
    options: ['Perkenalkan caj kesesakan', 'Tambah bas di jalan raya dan biayainya', 'Janjikan jejantas'],
    results: [
      'Caj diperkenalkan. Yang memandu merungut, yang naik bas merungut sikit kurang.',
      'Bas dibeli, dan penuh, dan jalan tak lebih lapang, walaupun bas tu ceria.',
      ['Jejantas siap tepat masa, yang tak pernah berlaku sebelum ni.', 'Jejantas tak dibina, yang sebelumnya pun sama.'],
    ],
  },
  goldMedal: {
    title: 'Pingat emas',
    body: 'Seorang atlet muda dari sebuah kampung dekat pantai menang pingat emas pertama negara dalam sukannya di sukan besar. Dalam temu bual dia berterima kasih kepada ibunya, jurulatihnya dan seorang lelaki di kedai yang pinjamkan dia basikal. Dia belum sebut anda.',
    options: ['Beri sambutan pahlawan', 'Jauhkan diri, dan biar keluarga yang punya', 'Tubuhkan dana atlet muda atas namanya'],
    results: [
      'Sambutan tu orang ramai, iring-iringan dan pancaragam. Dia berbudi bahasa, dan nampak sikit penat.',
      'Anda jauhkan diri. Atlet tu berterima kasih kepada ramai orang, dan nama anda tak ada antaranya, yang, anda diberitahu, memang tujuannya.',
      'Dana diumumkan. Ibu atlet tu gunting reben, dan difoto dalam cahaya yang paling cantik.',
    ],
  },
  scamCalls: {
    title: 'Panggilan penipuan',
    body: 'Seorang nenek hilang simpanan seumur hidup sebab panggilan telefon daripada orang yang mengaku pegawai bank. Dia seorang daripada beribu-ribu. Panggilan dibuat dari luar negara, duit melalui empat negara, dan polis kata mereka sangat mahukan kerjasama.',
    options: ['Tubuhkan pasukan petugas bersama bank', 'Salahkan bank, kuat-kuat', 'Jalankan kempen kesedaran di semua saluran'],
    results: [
      'Pasukan petugas bekukan akaun dalam beberapa jam, dan pulangkan sebahagian simpanan. Para nenek tulis surat kepada anda.',
      'Bank kata ia tak buat salah apa-apa, penipu pun sama.',
      'Kempen berjalan, dan beberapa orang terselamat sebab jingle yang mereka kata mereka benci.',
    ],
  },
  tuitionCentres: {
    title: 'Pusat tuisyen',
    body: 'Ibu bapa bayar lebih untuk tuisyen malam daripada untuk sekolah itu sendiri. Pusat-pusat tu tak berlesen, tak diperiksa dan, menurut seorang guru, “buat apa yang sekolah dulu buat”. Sekumpulan ibu bapa tulis kepada setiap ahli politik di daerah.',
    options: ['Kawal selia yuran dan pusat tu', 'Biar pasaran selesaikan', 'Biayai tuisyen dalam talian percuma untuk setiap kanak-kanak'],
    results: [
      'Yuran dihadkan, dan pemilik pusat tulis kepada akhbar dengan angka yang semuanya, peliknya, memihak kepada mereka.',
      'Pasaran selesaikan dengan naikkan yuran, dan ibu bapa tulis lagi.',
      'Pelajaran dalam talian ditonton setengah juta kanak-kanak. Suku daripadanya tonton pukul dua pagi.',
    ],
  },
  strayCats: {
    title: 'Kucing terbiar',
    body: 'Sebuah majlis di bandar besar putuskan nak uruskan kucing terbiarnya, yang banyak, dan dah siapkan perintah dan tempah sebuah van. Sekumpulan budak lukis poster. Poster tu viral. Van tu jadi simbol.',
    options: ['Biayai program pemandulan dan pengangkatan', 'Sokong perintah majlis', 'Keluarkan kenyataan prihatin, dan serahkan kepada majlis'],
    results: [
      'Program bermula. Kucing, sebagai kucing, tak tunjuk terima kasih, tapi kawan manusia mereka tunjuk.',
      'Perintah dilaksanakan, senyap-senyap. Poster ditanggalkan dengan tangan, dan budak-budak tak lupa siapa yang tandatangan.',
      'Kenyataan tu dibaca orang yang nakkan tindakan, dan didapati kurang.',
    ],
  },
  visaFree: {
    title: 'Visa untuk pelawat',
    body: 'Lembaga pelancongan kata pengecualian visa untuk pelawat dari sebuah jiran yang sangat besar akan bawa sejuta pelancong setahun. Kementerian dalam negeri kata sejuta pelawat ialah sejuta orang yang tak ada siapa pernah jumpa. Persatuan hotel dah tempah tuala tambahan.',
    options: ['Kecualikan visa untuk mereka semua', 'Cuba percubaan setahun dulu', 'Kekalkan peraturan macam sedia ada'],
    results: [
      'Visa dikecualikan, kapal terbang penuh, dan hotel perlukan lebih banyak tuala daripada yang ditempah.',
      'Percubaan tu kejayaan sederhana, dan kejayaan sederhana susah nak dikritik.',
      'Peraturan kekal. Persatuan hotel sangat sopan pasal tu, macam orang yang simpan senarai.',
    ],
  },
  foreignCampus: {
    title: 'Kampus asing',
    body: 'Sebuah universiti asing yang terkenal tawar buka kampus di ibu negara, dengan pensyarah dan ijazah sendiri. Universiti kita kata mereka akan ditinggalkan dengan pelajar yang tak berjaya masuk. Pelajar kata mereka nakkan pilihan.',
    options: ['Alu-alukan, macam yang ditawarkan', 'Alu-alukan, dengan kuota pelajar tempatan dan dana biasiswa', 'Tolak, dan labur dalam universiti kita sendiri'],
    results: [
      'Kampus dibuka, dan bendera asing dinaikkan di sebelah bendera kita. Naib canselor tempatan jadi agak senyap.',
      'Kampus terima kuota, dan beberapa pelajar biasiswa yang takkan ke mana-mana kini berada di situ.',
      'Universiti kita gembira, dan pelajar diberitahu masa depan yang lebih baik sedang disediakan untuk mereka, pada suatu masa nanti.',
    ],
  },
  carbonRule: {
    title: 'Peraturan karbon',
    body: 'Sekumpulan rakan dagang tak lama lagi akan kenakan cukai di sempadan mereka ke atas barangan yang dihasilkan dengan jejak karbon tinggi. Pengeksport kita akan bayar kecuali kalau mereka ubah cara pengeluaran. Pengeksport kata mereka perlukan masa. Rakan dagang kata mereka dah dengar cakap macam tu sebelum ni.',
    options: ['Patuhi awal, dan bantu pengeksport bayarnya', 'Runding pengecualian untuk pengeksport kita', 'Abaikan, dan tengok siapa kelip dulu'],
    results: [
      'Pengeksport patuh, dengan geran, dan rakan dagang panggilnya “contoh yang baik”. Beberapa kilang tetap ditutup.',
      ['Rakan dagang setuju tangguh, dan pengeksport ada masa untuk berubah.', 'Rakan dagang kata tak, dan ingatkan kita yang mereka dah kata macam tu sebelum ni.'],
      'Tak ada siapa kelip. Cukai dikenakan hari pertama, dan pengeksport hantar bil kepada anda.',
    ],
  },
};
