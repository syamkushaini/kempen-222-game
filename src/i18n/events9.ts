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
    body: 'Sebuah syarikat minyak masak menawarkan membayar setiap papan iklan anda di negeri ini, sebagai ganti logonya, di sudut, pada saiz yang munasabah. Sudutnya besar. Saiz yang munasabah itu tidak.',
    options: ['Terima, dan kekalkan logo kecil', 'Tolak, dan bayar sendiri', 'Runding lebih keras untuk logo lebih kecil dan cek lebih besar'],
    results: [
      'Papan iklan dipasang, dengan sebotol minyak masak di sudut yang lebih besar daripada muka anda.',
      'Papan iklan lebih sedikit, dan tiada siapa dapat mengatakan parti anda dibeli minyak sayuran.',
      ['Syarikat itu bersetuju, dan logo mengecil menjadi setitik. Hanya parti saingan yang menyedarinya.', 'Syarikat itu pergi, dan memberitahu akhbar ia “dipandang remeh”.'],
    ],
  },
  womensQuota: {
    title: 'Sayap wanita mahu kuota',
    body: 'Sayap wanita menulis kepada ketua, dengan sopan, meminta sepertiga calon dalam pilihan raya akan datang ialah wanita. Ia melampirkan senarai empat puluh nama, setiap seorang sudah mengetuk lebih banyak pintu daripada lelaki yang akan digantikan.',
    options: ['Setuju dengan sepertiga', 'Setuju dengan “sebanyak mungkin”', 'Berterima kasih, dan katakan masanya belum sesuai'],
    results: [
      'Kuota dipersetujui. Tiga ketua bahagian tidak bercakap dengan anda; empat puluh wanita berkempen.',
      '“Sebanyak mungkin” rupa-rupanya sebelas orang. Sayap itu kata ia permulaan dan menyimpan senarai itu.',
      'Masanya belum sesuai, dan sayap itu berkata ia belum sesuai dalam parti selama tiga puluh tahun.',
    ],
  },
  memberApp: {
    title: 'Aplikasi keahlian',
    body: 'Parti masih menerima ahli baharu dengan borang kertas, mesin fotokopi dan seorang kerani bernama Hasnah. Seorang sukarelawan yang bekerja di firma perisian berkata keseluruhan proses boleh ada di telefon bulan depan, jika parti mempercayainya dengan pangkalan data.',
    options: ['Bina aplikasi dengan betul', 'Beli yang sedia ada', 'Biarkan seperti sedia ada: Hasnah sangat bagus'],
    results: [
      'Aplikasi itu beroperasi. Ia mendaftar sebelas ribu ahli dalam sebulan, dan Hasnah menyelianya, dengan sedikit dengusan.',
      ['Aplikasi sedia ada itu berfungsi, mengejutkan semua orang sedikit.', 'Aplikasi sedia ada itu rupa-rupanya berkongsi senarai parti dengan pengiklan.'],
      'Hasnah berterima kasih, dan sukarelawan itu pergi untuk membina satu untuk parti lain.',
    ],
  },
  hallFire: {
    title: 'Dewan parti terbakar',
    body: 'Pada waktu malam dewan parti lama terbakar, mungkin akibat pendawaian, yang berada dalam senarai kerja sejak sebelum pilihan raya lepas. Bendera hilang. Gambar para pengasas kebanyakannya hilang. Bomba berkata ia “satu rahmat” kerana ia hari Selasa.',
    options: ['Adakan kutipan ahli untuk membinanya semula', 'Tuntut insurans dan sewa dewan', 'Rayu penderma, dan namakan dewan baharu bersempena yang terbesar'],
    results: [
      'Ahli membawa batu bata, jubin dan banyak teh. Dewan baharu dibuka dalam beberapa bulan, dan ia milik mereka.',
      'Insurans membayar sebahagian. Parti menyewa dewan di atas sebuah bank, dan ia agak sejuk.',
      ['Penderma bermurah hati, dan dewan dinamakan sempena seorang yang tidak pernah menziarahinya.', 'Penderma tidak menelefon semula, dan dewan itu tidak dinamakan sempena sesiapa untuk masa yang lama.'],
    ],
  },
  cabinetLeak: {
    title: 'Kebocoran dari kabinet',
    body: 'Minit mesyuarat kabinet, termasuk kata-kata beberapa menteri tentang satu sama lain, berada di tangan sebuah akhbar. Terdapat sebelas versi bagaimana ia berlaku, dan sembilan orang yang pasti ia orang lain.',
    options: ['Adakan siasatan dan cari pembocor', 'Siarkan minit penuh sendiri', 'Diam, dan biarkan akhbar menyiarkan'],
    results: [
      'Siasatan menemui seorang pembantu muda, yang berkata dia diarah. Kini tiada siapa mempercayai sesiapa.',
      'Minit disiarkan. Ia kurang menarik daripada kebocoran, dan kerajaan diucapkan terima kasih atas kejujurannya dan diusik atas kata sifatnya.',
      'Akhbar menyiarkan, dan kabinet membacanya semasa sarapan dengan penuh perhatian.',
    ],
  },
  extraHoliday: {
    title: 'Satu lagi cuti',
    body: 'Sebuah kesatuan penjawat awam meminta satu lagi cuti umum, diambil pada hari Jumaat sebelum hujung minggu panjang. Pemilik kedai berkata mereka akan kehilangan hasil sehari. Semua orang lain berkata mereka akan mendapat sehari.',
    options: ['Isytiharkan cuti itu', 'Tolaknya', 'Alihkan cuti sedia ada ke hari Jumaat sebagai ganti'],
    results: [
      'Cuti diisytiharkan, dan pantai penuh. Pemilik kedai menyimpan senarai.',
      'Kedai kekal dibuka, dan penjawat awam kekal merungut di meja mereka.',
      'Pertukaran itu dianggap “munasabah” oleh pengulas, dan dianggap “agak membosankan” oleh semua orang lain.',
    ],
  },
  airMiles: {
    title: 'Batu udara',
    body: 'Analisis tuntutan perjalanan menteri menunjukkan dia berada di luar negara seratus empat puluh hari tahun lalu, di tempat yang, kata seorang pembantu, “tidak banyak untuk dilihat”. Keluarganya hadir pada beberapa lawatan. Gambarnya di pantai.',
    options: ['Siarkan jadual perjalanan dan kurangkan lawatan', 'Pertahankan sebagai misi perdagangan', 'Pindahkan menteri secara senyap ke jawatan lain'],
    results: [
      'Jadual disiarkan, dan lawatan dikurangkan. Menteri tidak akan memaafkan anda, dan akhbar akan.',
      ['Rupa-rupanya salah satu lawatan memang menghasilkan kontrak, dan menteri menunjukkannya di televisyen.', 'Rupa-rupanya “misi perdagangan” itu ialah majlis perkahwinan.'],
      'Menteri dipindahkan. Akhbar menulis jawatan itu “permulaan baharu”, yang tiada dalam kenyataan akhbar.',
    ],
  },
  houseWalkout: {
    title: 'Keluar dewan',
    body: 'Speaker memutuskan usul pembangkang tidak boleh dibahaskan. Kerusi pembangkang berbisik tentang keluar dewan sebagai bantahan. Kerusi kerajaan, dengan sedikit keseronokan, berkata mereka akan kesal melihat mereka pergi.',
    options: ['Sertai keluar dewan', 'Kekal, dan bahaskan apa yang boleh', 'Kekal di kerusi anda, dan jangan berkata apa-apa'],
    results: [
      'Ahli anda keluar, dengan bermaruah. Kamera merakam maruah itu, dan dewan kosong, mengikut turutan itu.',
      'Anda kekal dan menyatakan pendirian. Dewan hampir kosong, dan Hansard tidak.',
      'Anda kekal di kerusi. Beberapa ahli anda sendiri memandang anda seolah-olah anda terlepas sesuatu.',
    ],
  },
  sharpQuestion: {
    title: 'Waktu soalan',
    body: 'Nama anda tertera untuk soalan lisan pertama kepada Perdana Menteri, dan dewan akan penuh, dan galeri akhbar akan penuh. Anda ada empat puluh lima saat, satu dokumen siasatan dan idea tentang apa hendak dibuat dengannya.',
    options: ['Gunakan dokumen siasatan untuk bertanya soalan yang tidak dapat mereka jawab', 'Tanya soalan bijak dan dapatkan ketawa', 'Tanya tentang lubang di jalan di daerah anda sendiri'],
    results: [
      'Soalan itu tajam. Jawapan Perdana Menteri ialah ucapan tentang perkara lain, dan dokumen siasatan kini dalam rekod awam.',
      'Soalan itu bijak, ketawanya murah hati, dan jawapannya ketawa yang lebih panjang.',
      'Lubang itu ditampal dalam seminggu, dan galeri akhbar bertanya bertahun-tahun apa soalan sebenarnya.',
    ],
  },
  partyAnniversary: {
    title: 'Ulang tahun',
    body: 'Parti berusia lima puluh tahun bulan ini. Jawatankuasa mencadangkan jamuan untuk dua ribu orang, setem peringatan, dan sebuah lagu. Tiada siapa bertanya sama ada sesiapa mahukan lagu itu.',
    options: ['Adakan jamuan', 'Adakan jalan amal, dengan setem yang sama', 'Biarkan ulang tahun berlalu dengan kenyataan ringkas'],
    results: [
      'Jamuan itu panjang, bising dan kemenangan bagi katering. Dua ribu ahli pulang merasakan mereka sebahagian daripada sesuatu.',
      'Jalan amal itu mengumpul wang untuk klinik, dan setem itu dikagumi seorang pengumpul di negeri lain.',
      'Kenyataan itu ringkas. Para sesepuh parti berkata lagu itu agak bagus.',
    ],
  },
  consultants: {
    title: 'Laporan perunding',
    body: 'Sebuah firma perunding asing dibayar sejumlah besar untuk menulis laporan tentang cara memperbaiki perkhidmatan awam. Laporan itu tiba, tiga ratus muka surat, dan menyatakan beberapa perkara yang perkhidmatan awam sudah katakan dua puluh tahun, dalam fon yang lebih baik.',
    options: ['Terima pakai cadangan laporan itu', 'Buat apa yang munasabah dan abaikan selebihnya', 'Failkan, dan minta perkhidmatan awam menyediakan sendiri'],
    results: [
      'Cadangan diterima pakai. Beberapa berjaya, beberapa digugurkan secara senyap, dan fon itu dikekalkan.',
      'Bahagian yang munasabah dilakukan, dan beberapa bahagian yang kurang munasabah dilakukan secara tidak sengaja.',
      'Perkhidmatan awam menghasilkan laporan sendiri dalam seminggu, dan ia tiga puluh muka surat lebih pendek dan sama betul.',
    ],
  },
  schoolMeals: {
    title: 'Makanan untuk kanak-kanak',
    body: 'Seorang guru di sebuah sekolah daerah menulis catatan pendek dan menyentuh hati tentang kanak-kanak yang tiba tanpa sarapan dan tertidur menjelang pukul sepuluh. Sebuah badan amal menawarkan menampung separuh skim makanan jika kerajaan menampung selebihnya.',
    options: ['Biayai makanan percuma untuk semua sekolah', 'Biayai makanan untuk sekolah termiskin sahaja', 'Jalankan perintis di tiga daerah dahulu'],
    results: [
      'Skim makanan bermula, dan guru melaporkan kanak-kanak bersemangat, bising dan sedikit lebih tinggi.',
      'Sekolah termiskin dilayani, dan beberapa sekolah yang sedikit melepasi garisan bertanya, dengan munasabah, di mana garisannya.',
      ['Perintis berjalan dengan cantik, dan angka diterbitkan dengan megah.', 'Perintis dijalankan dengan buruk, dan pembangkang menyiarkan gambar makan tengah hari itu.'],
    ],
  },
  trafficJam: {
    title: 'Kesesakan',
    body: 'Kajian menunjukkan purata pengguna jalan raya di ibu negara menghabiskan dua jam setengah sehari dalam kereta, dan kesesakan di lebuh raya utama kini lebih panjang daripada lebuh raya itu. Kajian itu ditugaskan, dan penugasnya tersangkut dalam kesesakan.',
    options: ['Perkenalkan caj kesesakan', 'Tambah bas di jalan raya dan biayainya', 'Janjikan jejantas'],
    results: [
      'Caj diperkenalkan. Yang memandu merungut, dan yang menaiki bas merungut sedikit kurang.',
      'Bas dibeli, dan penuh, dan jalan tidak lebih lapang, walaupun bas itu ceria.',
      ['Jejantas siap tepat pada masanya, yang tidak pernah berlaku sebelum ini.', 'Jejantas tidak dibina, begitu juga yang sebelumnya.'],
    ],
  },
  goldMedal: {
    title: 'Pingat emas',
    body: 'Seorang atlet muda dari sebuah kampung berhampiran pantai memenangi pingat emas pertama negara dalam sukannya di sebuah sukan besar. Dalam temu bual dia berterima kasih kepada ibunya, jurulatihnya dan seorang lelaki di kedai yang meminjamkannya basikal. Dia belum menyebut anda.',
    options: ['Beri sambutan pahlawan', 'Jauhkan diri, dan biarkan keluarga memilikinya', 'Tubuhkan dana atlet muda atas namanya'],
    results: [
      'Sambutan itu ialah orang ramai, iring-iringan dan pancaragam. Dia berbudi bahasa, dan kelihatan sedikit letih.',
      'Anda menjauhkan diri. Atlet itu berterima kasih kepada ramai orang, dan nama anda tiada antaranya, yang, anda diberitahu, memang tujuannya.',
      'Dana diumumkan. Ibu atlet itu menggunting reben, dan difoto dalam cahaya terbaik.',
    ],
  },
  scamCalls: {
    title: 'Panggilan penipuan',
    body: 'Seorang nenek kehilangan simpanan seumur hidup akibat panggilan telefon daripada seseorang yang mengaku pegawai bank. Dia seorang daripada beribu-ribu. Panggilan dibuat dari luar negara, wang melalui empat negara, dan polis berkata mereka amat mahukan kerjasama.',
    options: ['Tubuhkan pasukan petugas bersama bank', 'Salahkan bank, dengan lantang', 'Jalankan kempen kesedaran di semua saluran'],
    results: [
      'Pasukan petugas membekukan akaun dalam beberapa jam, dan memulangkan sebahagian simpanan. Para nenek menulis kepada anda.',
      'Bank berkata ia tidak melakukan apa-apa yang salah, begitu juga penipu.',
      'Kempen berjalan, dan beberapa orang diselamatkan oleh jingle yang mereka kata mereka benci.',
    ],
  },
  tuitionCentres: {
    title: 'Pusat tuisyen',
    body: 'Ibu bapa membayar lebih untuk tuisyen malam daripada untuk sekolah itu sendiri. Pusat-pusat itu tidak berlesen, tidak diperiksa dan, menurut seorang guru, “melakukan apa yang sekolah dahulu lakukan”. Sekumpulan ibu bapa menulis kepada setiap ahli politik di daerah.',
    options: ['Kawal selia yuran dan pusat itu', 'Biarkan pasaran menyelesaikannya', 'Biayai tuisyen dalam talian percuma untuk setiap kanak-kanak'],
    results: [
      'Yuran dihadkan, dan pemilik pusat menulis kepada akhbar dengan angka yang semuanya, anehnya, memihak kepada mereka.',
      'Pasaran menyelesaikannya dengan menaikkan yuran, dan ibu bapa menulis lagi.',
      'Pelajaran dalam talian ditonton setengah juta kanak-kanak. Suku daripadanya menonton pada pukul dua pagi.',
    ],
  },
  strayCats: {
    title: 'Kucing terbiar',
    body: 'Sebuah majlis di bandar besar memutuskan menangani kucing terbiarnya, yang banyak, dan sudah menyediakan perintah dan menempah sebuah van. Sekumpulan kanak-kanak melukis poster. Poster itu tular. Van itu menjadi simbol.',
    options: ['Biayai program pemandulan dan pengangkatan', 'Sokong perintah majlis', 'Keluarkan kenyataan prihatin, dan serahkan kepada majlis'],
    results: [
      'Program bermula. Kucing, sebagai kucing, tidak menunjukkan terima kasih, tetapi kawan manusia mereka menunjukkannya.',
      'Perintah dilaksanakan, secara senyap. Poster ditanggalkan dengan tangan, dan kanak-kanak tidak lupa siapa yang menandatangani.',
      'Kenyataan itu dibaca orang yang mahukan tindakan, dan didapati kurang.',
    ],
  },
  visaFree: {
    title: 'Visa untuk pelawat',
    body: 'Lembaga pelancongan berkata pengecualian visa untuk pelawat dari sebuah jiran yang sangat besar akan membawa sejuta pelancong setahun. Kementerian dalam negeri berkata sejuta pelawat ialah sejuta orang yang tiada siapa pernah temui. Persatuan hotel sudah menempah tuala tambahan.',
    options: ['Kecualikan visa untuk mereka semua', 'Cuba percubaan setahun dahulu', 'Kekalkan peraturan seperti sedia ada'],
    results: [
      'Visa dikecualikan, kapal terbang penuh, dan hotel memerlukan lebih banyak tuala daripada yang ditempah.',
      'Percubaan itu kejayaan sederhana, dan kejayaan sederhana sukar dikritik.',
      'Peraturan kekal. Persatuan hotel sangat sopan tentangnya, seperti orang yang menyimpan senarai.',
    ],
  },
  foreignCampus: {
    title: 'Kampus asing',
    body: 'Sebuah universiti asing yang terkenal menawarkan membuka kampus di ibu negara, dengan pensyarah dan ijazahnya sendiri. Universiti kita berkata mereka akan ditinggalkan dengan pelajar yang tidak berjaya masuk. Pelajar berkata mereka mahukan pilihan.',
    options: ['Alu-alukan, seperti yang ditawarkan', 'Alu-alukan, dengan kuota pelajar tempatan dan dana biasiswa', 'Tolak, dan labur dalam universiti kita sendiri'],
    results: [
      'Kampus dibuka, dan bendera asing dinaikkan di sebelah bendera kita. Naib canselor tempatan menjadi agak senyap.',
      'Kampus menerima kuota, dan beberapa pelajar biasiswa yang tidak akan ke mana-mana kini berada di situ.',
      'Universiti kita gembira, dan pelajar diberitahu masa depan yang lebih baik sedang disediakan untuk mereka, pada suatu masa.',
    ],
  },
  carbonRule: {
    title: 'Peraturan karbon',
    body: 'Sekumpulan rakan dagang tidak lama lagi akan mengenakan cukai di sempadan mereka ke atas barangan yang dihasilkan dengan jejak karbon tinggi. Pengeksport kita akan membayar melainkan mereka mengubah cara pengeluaran. Pengeksport berkata mereka perlukan masa. Rakan dagang berkata mereka sudah diberitahu begitu sebelum ini.',
    options: ['Patuhi awal, dan bantu pengeksport membayarnya', 'Runding pengecualian untuk pengeksport kita', 'Abaikan, dan lihat siapa yang berkelip dahulu'],
    results: [
      'Pengeksport mematuhi, dengan geran, dan rakan dagang menyebutnya “contoh yang baik”. Beberapa kilang tetap ditutup.',
      ['Rakan dagang bersetuju menangguh, dan pengeksport mempunyai masa untuk berubah.', 'Rakan dagang berkata tidak, dan mengingatkan kita bahawa mereka sudah berkata begitu sebelum ini.'],
      'Tiada siapa berkelip. Cukai itu dikenakan pada hari pertama, dan pengeksport menghantar bil kepada anda.',
    ],
  },
};
