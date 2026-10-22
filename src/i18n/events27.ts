import type { EventText } from './events';

// Eight small stories for the first months of a party founded from nothing, in English and Bahasa Malaysia. Every place and person is invented. A result written as a pair is for a gamble: the win, then the loss.

export const OPENING_STORIES_EN: Record<string, EventText> = {
  startDonor: {
    title: 'A donor with a small favour',
    body: 'A hardware-shop owner who says he “believes in new blood” offers fifty thousand ringgit to the party. In the same breath he mentions that his nephew would make a fine candidate, and that the council has been slow with his signboard licence.',
    options: ['Thank him, take a small cheque, and ask for nothing', 'Take the full amount, and look at the nephew’s CV', 'Ask him to put the offer in writing, and see what he says'],
    results: [
      'He is a little hurt, and the cheque is small. But nobody can say afterwards that the party was bought for a signboard.',
      'The money arrives, and so does the nephew. A few members remark that the party is not yet a year old and already has a family firm.',
      ['He writes it down, and writes it honestly: no conditions. The money comes, and the party’s name is the better for it.', 'He declines to write anything down, and tells three friends why. The party’s name is the worse for it.'],
    ],
  },
  startViral: {
    title: 'A hawker’s video you did not make',
    body: 'A satay seller in your seat has filmed himself talking about “the new party with the funny name” while fanning the charcoal. It has been shared forty thousand times, mostly by people who do not live in the seat, and some of the comments are not kind.',
    options: ['Hire a small team to ride the wave with your own videos', 'Visit the stall, buy twenty sticks, and say nothing clever', 'Reply in the comments yourself, late at night, and hope'],
    results: [
      'The videos are slick, the young share them, and a few older members ask whether the party has gone over to marketing.',
      'A photograph of the leader eating satay beside the stall does the rounds. It is not a big story, and it is not a bad one.',
      ['The reply is witty, and it is quoted by people who had never heard of you.', 'The reply is typed at one in the morning, and it reads like it. It is quoted, too.'],
    ],
  },
  startCouncillor: {
    title: 'A councillor wants to join',
    body: 'A three-term councillor from one of the large parties, passed over for the third time, asks to join you and bring his two branches with him. He knows every drain in his ward. He also has a reputation, in some quarters, for knowing a little too much about who got the contracts.',
    options: ['Welcome him, with his branches and his reputation', 'Decline politely, and say the party is for newcomers', 'Offer him a place as a volunteer, on probation, and see'],
    results: [
      'Two branches come over, with their key-holders. Your new members applaud. Some of the rest begin to ask what the party is for.',
      'He leaves on good terms. The party keeps its clean slate, and the newcomers are proud of it.',
      'He accepts, with an expression that says he has been offered better. The branches stay where they are, and the party keeps its name.',
    ],
  },
  startShoplot: {
    title: 'A free shoplot, with a catch',
    body: 'A landlord offers a first-floor shoplot rent-free for six months as the party’s office. It is in a good street. It is also directly above a stall run by a supporter of the incumbent, and the lease asks that “political activity be conducted in a respectful manner”.',
    options: ['Accept, and open an office with a banner', 'Rent a cheaper place in a worse street, with no strings', 'Keep working from the leader’s living room for now'],
    results: [
      'The banner goes up, the office fills with volunteers, and the stall below sells a good deal of drinks to them.',
      'The place is cheap and dull. The party’s money is a little safer, and its friends are a little harder to find.',
      'The living room serves. The leader’s family is patient, and the volunteers learn to sit on the floor.',
    ],
  },
  startNamesake: {
    title: 'Another party with nearly your name',
    body: 'A second new party has registered with a name that differs from yours by one word. Its leader says it is a coincidence. A member of yours says that is not what the Registrar’s letter says, and that voters in the seat will not be able to tell the two apart on the ballot.',
    options: ['Propose a merger, and share a name, a purse and a quarrel', 'Hire a lawyer and complain to the Registrar', 'Print leaflets that say, “not that one”, and move on'],
    results: [
      'The two parties meet, shake hands, and begin to argue about who is the leader, in the same sentence.',
      'The lawyer is polite and costly. The Registrar is thorough and slow, but the other party’s name is, in time, changed.',
      ['The leaflets are funny, and the joke spreads further than the party does.', 'The leaflets are read as petty. Both parties are now a joke, and yours is the one that is holding the leaflet.'],
    ],
  },
  startStudents: {
    title: 'The students who want to run your page',
    body: 'Six university students offer to run the party’s social media for nothing, on one condition: that they decide what is posted. They are clever, they are funny, and one of them has already drafted a post about the leader that the leader has not seen.',
    options: ['Hand over the account, and read it afterwards', 'Accept, but with a member of the party to approve every post', 'Pay them a small stipend, and sign a short agreement'],
    results: [
      'The page grows quickly, and sometimes alarmingly. The young like it. A few older members have asked to see the leader’s posts before they are made.',
      'The page is safe and the students are bored, and one of them leaves with a comment about “a party run by uncles”.',
      'The stipend is small, the agreement is short, and the page is, for now, both funny and fit to be read.',
    ],
  },
  startPoll: {
    title: 'A cheap poll that says one per cent',
    body: 'A small polling firm offers the party a survey of your seat at a friendly price. It will almost certainly say you are on about one per cent. It would also tell you which streets, which age groups and which worries are your best, and the firm will keep it quiet if you ask.',
    options: ['Commission it, and publish the headline whatever it says', 'Commission it, and keep the whole thing private', 'Ask them to run it in the best street only, and see'],
    results: [
      'The number is poor. The party’s honesty is noticed, and a few people who had never thought about you say you were frank, and that this is unusual.',
      'The data is sound and no one else sees it. The party makes some good decisions with it, and some members grumble that nothing was shown.',
      ['The best street is better than anyone expected, and the party has a place to start.', 'The best street is not very good either. The party learns it more cheaply than it might have.'],
    ],
  },
  startTreasurer: {
    title: 'A retired treasurer, very particular',
    body: 'A retired civil servant, who audited a state agency for thirty years, offers to be the party’s treasurer. He wants receipts for every ringgit, no cash payments at all, and the books open to every member. He also says, kindly, that three of your present habits would not survive an audit.',
    options: ['Appoint him, and let the books be open', 'Thank him and keep the old way of doing things', 'Appoint him, but keep the volunteers’ small cash for petrol'],
    results: [
      'The books are open and the receipts are neat. The party has a little less cash on hand, and a good deal more to show anyone who asks.',
      'The old way is quicker and looser. The party carries on without a treasurer who would tell it no.',
      'The compromise works. The treasurer sighs once a month, and the volunteers’ petrol is paid.',
    ],
  },
};

export const OPENING_STORIES_MS: Record<string, EventText> = {
  startDonor: {
    title: 'Penderma dengan permintaan kecil',
    body: 'Seorang tauke kedai perkakasan yang kata dia “percaya pada darah baharu” tawarkan lima puluh ribu ringgit kepada parti. Dalam nafas yang sama dia sebut anak saudaranya sesuai jadi calon, dan majlis perbandaran lambat luluskan lesen papan tandanya.',
    options: ['Terima kasih, ambil cek kecil, dan tak minta apa-apa', 'Ambil semua, dan tengok resume anak saudaranya', 'Minta dia tulis tawaran itu hitam putih, dan lihat reaksinya'],
    results: [
      'Dia agak tersinggung, dan ceknya kecil. Tapi tak ada orang boleh kata parti ini dibeli dengan sekeping papan tanda.',
      'Wang masuk, anak saudara pun masuk. Ada ahli berbisik parti belum setahun jagung dah ada syarikat keluarga.',
      ['Dia tulis, dan tulis dengan jujur: tanpa syarat. Wang masuk, dan nama parti lebih harum.', 'Dia enggan tulis apa-apa, dan cerita kepada tiga kawan sebabnya. Nama parti lebih buruk.'],
    ],
  },
  startViral: {
    title: 'Video penjual yang bukan anda buat',
    body: 'Seorang penjual sate di kawasan anda merakam dirinya bercakap tentang “parti baru yang nama pelik tu” sambil mengipas bara. Sudah dikongsi empat puluh ribu kali, kebanyakannya oleh orang bukan penduduk kawasan, dan ada komen yang kurang baik.',
    options: ['Upah pasukan kecil untuk naik bersama gelombang dengan video sendiri', 'Singgah di gerai, beli dua puluh cucuk, dan jangan cakap apa yang bijak', 'Balas sendiri di ruang komen, lewat malam, dan harap-harap'],
    results: [
      'Video kemas, anak muda kongsi, dan beberapa ahli lama tanya sama ada parti dah jadi syarikat pemasaran.',
      'Gambar ketua makan sate di sebelah gerai tersebar. Bukan cerita besar, dan bukan cerita buruk.',
      ['Balasan itu lucu, dan dipetik oleh orang yang tak pernah dengar nama anda.', 'Balasan itu ditaip pukul satu pagi, dan bunyinya macam itu. Dipetik juga.'],
    ],
  },
  startCouncillor: {
    title: 'Seorang ahli majlis nak sertai',
    body: 'Seorang ahli majlis tiga penggal dari sebuah parti besar, yang dilangkau buat kali ketiga, minta sertai anda dengan membawa dua cawangannya. Dia tahu setiap longkang di wad. Dia juga ada nama, di sesetengah kalangan, sebagai orang yang tahu terlalu banyak tentang siapa dapat kontrak.',
    options: ['Alu-alukan, dengan cawangan dan namanya sekali', 'Tolak dengan baik, kata parti ini untuk orang baru', 'Tawar jadi sukarelawan, dalam percubaan, dan lihat nanti'],
    results: [
      'Dua cawangan datang bersama pemegang kuncinya. Ahli baru bertepuk. Yang lain mula tanya apa sebenarnya tujuan parti.',
      'Dia pergi dengan baik. Parti kekal bersih dan ahli baru bangga.',
      'Dia terima, dengan wajah orang yang pernah dapat tawaran lebih baik. Cawangan tak berganjak, dan parti kekal dengan namanya.',
    ],
  },
  startShoplot: {
    title: 'Lot kedai percuma, ada syaratnya',
    body: 'Seorang tuan tanah tawarkan lot kedai tingkat satu percuma enam bulan sebagai pejabat parti. Lokasinya baik. Tapi betul-betul di atas gerai milik penyokong penyandang, dan perjanjian sewa minta “kegiatan politik dijalankan dengan hormat”.',
    options: ['Terima, dan buka pejabat dengan sepanduk', 'Sewa tempat lebih murah di jalan kurang baik, tanpa syarat', 'Terus kerja dari ruang tamu ketua buat sementara'],
    results: [
      'Sepanduk naik, pejabat penuh sukarelawan, dan gerai di bawah jual banyak air kepada mereka.',
      'Tempatnya murah dan suram. Duit parti sedikit lebih selamat, kawan-kawan sedikit susah nak jumpa.',
      'Ruang tamu cukup. Keluarga ketua bersabar, dan sukarelawan belajar duduk atas lantai.',
    ],
  },
  startNamesake: {
    title: 'Parti lain dengan nama hampir sama',
    body: 'Sebuah lagi parti baharu berdaftar dengan nama yang beza satu perkataan saja daripada nama anda. Ketuanya kata ia kebetulan. Seorang ahli anda kata bukan itu yang tertulis dalam surat Pendaftar, dan pengundi tak akan dapat bezakan keduanya pada kertas undi.',
    options: ['Cadangkan penggabungan, dan kongsi nama, dana, dan pertelagahan', 'Upah peguam dan adukan kepada Pendaftar', 'Cetak risalah “bukan yang itu”, dan teruskan'],
    results: [
      'Dua parti berjumpa, berjabat tangan, dan mula bertengkar siapa ketua, dalam ayat yang sama.',
      'Peguam sopan dan mahal. Pendaftar teliti dan lambat, tapi akhirnya nama parti itu ditukar.',
      ['Risalahnya kelakar, dan jenakanya tersebar lebih jauh daripada parti.', 'Risalah dibaca sebagai kecil hati. Dua-dua parti jadi bahan jenaka, dan parti anda yang pegang risalah itu.'],
    ],
  },
  startStudents: {
    title: 'Pelajar yang nak uruskan laman anda',
    body: 'Enam pelajar universiti tawar uruskan media sosial parti percuma, dengan satu syarat: mereka yang tentukan apa yang disiarkan. Mereka bijak, kelakar, dan seorang sudah drafkan satu hantaran tentang ketua yang ketua belum nampak.',
    options: ['Serah akaun, dan baca selepas siar', 'Terima, tapi seorang ahli parti lulus setiap hantaran', 'Beri elaun kecil, dan tandatangani perjanjian ringkas'],
    results: [
      'Laman membesar cepat, dan kadang-kadang mengejutkan. Anak muda suka. Beberapa ahli lama minta tengok hantaran ketua sebelum dibuat.',
      'Laman selamat dan pelajar bosan, dan seorang keluar sambil kata “parti diuruskan pakcik-pakcik”.',
      'Elaun kecil, perjanjian ringkas, dan laman, buat masa ini, kelakar dan layak dibaca.',
    ],
  },
  startPoll: {
    title: 'Tinjauan murah yang kata satu peratus',
    body: 'Sebuah firma tinjauan kecil tawarkan tinjauan di kawasan anda dengan harga mesra. Hampir pasti ia akan kata anda dalam sekitar satu peratus. Ia juga akan beritahu jalan, golongan umur dan kebimbangan mana yang paling baik untuk anda, dan firma itu akan rahsiakan kalau diminta.',
    options: ['Tempah, dan siar tajuk utamanya apa pun hasilnya', 'Tempah, dan simpan semuanya secara peribadi', 'Minta jalankan di jalan terbaik saja, dan lihat'],
    results: [
      'Angkanya buruk. Kejujuran parti dilihat orang, dan beberapa yang tak pernah fikir tentang anda kata anda berterus terang, dan itu jarang.',
      'Datanya baik dan tiada orang lain nampak. Parti buat beberapa keputusan baik dengannya, dan sesetengah ahli merungut tak ada apa ditunjukkan.',
      ['Jalan terbaik lebih baik daripada jangkaan, dan parti ada tempat untuk mula.', 'Jalan terbaik pun tak berapa baik. Parti tahu lebih murah daripada yang mungkin.'],
    ],
  },
  startTreasurer: {
    title: 'Bendahari bersara, sangat cerewet',
    body: 'Seorang bekas penjawat awam yang mengaudit sebuah agensi negeri selama tiga puluh tahun tawarkan diri jadi bendahari parti. Dia mahu resit untuk setiap ringgit, tiada bayaran tunai langsung, dan buku terbuka kepada semua ahli. Dia juga kata, dengan baik, tiga tabiat anda sekarang tak akan lepas audit.',
    options: ['Lantik dia, dan buka buku', 'Terima kasih dan kekalkan cara lama', 'Lantik dia, tapi simpan wang tunai kecil sukarelawan untuk minyak'],
    results: [
      'Buku terbuka dan resit kemas. Parti ada sedikit kurang tunai, dan banyak lagi untuk ditunjuk kepada sesiapa yang tanya.',
      'Cara lama lebih cepat dan longgar. Parti terus tanpa bendahari yang berani kata tidak.',
      'Kompromi berjaya. Bendahari mengeluh sekali sebulan, dan minyak sukarelawan dibayar.',
    ],
  },
};
