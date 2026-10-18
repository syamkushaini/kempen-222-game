import type { EventText } from './events';

// Stories told in chapters, in English and Bahasa Malaysia. Every person and
// company in them is invented. A result written as a pair is for a gamble: what
// is reported if it comes off, then if it does not.

export const STORY_EVENTS_EN: Record<string, EventText> = {
  papers: {
    title: 'The accountant’s papers',
    body: 'A junior accountant at a state-linked company has asked to see you, and brought a box file. The papers show money going where it should not. Most of it went to your rivals’ friends. Some of it, he says carefully, went to people close to you.',
    options: ['Take the papers to the press', 'Take them quietly to the anti-graft agency', 'Thank him, and send him away'],
    results: [
      'The papers are with three editors by morning. Your own party would like to know whose names are in them.',
      'The agency gave you a receipt and a cup of tea. It will be in touch.',
      'He left with his box file. He did not look like a man who would stop there.',
    ],
  },
  papersStory: {
    title: 'The papers run',
    body: 'The story has run for a fortnight, however it got out. It names two of your rivals’ men, and one of your own division chiefs, who has been with the party for thirty years and delivers his seat every time.',
    options: ['Suspend him until it is cleared up', 'Stand by him in public', 'Say it is a matter for the courts, and hope'],
    results: [
      'He went quietly, and his division did not. But people who had stopped listening to you have started again.',
      'You stood beside him at the press conference. The photograph will be used for years.',
      ['It was a matter for the courts, and the courts are slow. The story moved on.', 'Nobody believed it was a matter for the courts. They believed you were hiding.'],
    ],
  },
  papersBook: {
    title: 'The accountant writes a book',
    body: 'The accountant lost his job, as they do. Now he has written a book about it, and he would like you at the launch. Your division chiefs would like you anywhere else. A third option has been suggested, by someone who did not give his name.',
    options: ['Go to the launch', 'Pay the publisher to delay it until after the election', 'Have someone find out what else he knows'],
    results: [
      'You went, and stood at the back, and were photographed anyway. The young have noticed.',
      'The book is delayed. The story of why it was delayed is not.',
      ['He knew a good deal more, about other people. It is in your files now.', 'He knew you would send someone. He recorded the conversation.'],
    ],
  },

  bridge: {
    title: 'The bridge is gone',
    body: 'The only bridge to four kampung went in last night’s flood. Children are crossing to school by sampan, and the clinic is on the wrong side of the river. Everyone agrees something must be done. Nobody has said by whom.',
    options: ['Pay for a temporary crossing from public money', 'Make it a national scandal', 'Promise them a proper bridge, in good time'],
    results: [
      'A steel footbridge was up in nine days, with your party’s flag at both ends.',
      'It led the news for a week. The people responsible have not forgiven you for it.',
      'They have been promised bridges before. They wrote this one down.',
    ],
  },
  bridgeContract: {
    title: 'Who builds the bridge',
    body: 'The contract for the new bridge has been awarded. The winning company belongs to the brother-in-law of one of your division chiefs, and the price is twice the engineer’s estimate. He would like you to know the party will not be forgotten.',
    options: ['Expose it, your own man or not', 'Say nothing', 'Take the party’s share'],
    results: [
      'The contract was cancelled and tendered again. Your division chief has stopped returning calls.',
      'You said nothing. The bridge will be built, at twice the price.',
      'The party was not forgotten. Neither, in the kampung, will this be.',
    ],
  },
  bridgeOpening: {
    title: 'The ribbon',
    body: 'The bridge is finished, eight months late, and it is a good bridge. There will be an opening, with a ribbon, a tent and a goat. The village head has been told somebody important is coming, and has asked, politely, who.',
    options: ['Cut the ribbon yourself', 'Let the village head cut it, and stand behind him', 'Send your regrets'],
    results: [
      ['They cheered. People remember who came, more than who paid.', 'Somebody at the back asked, loudly, what the bridge had cost. The clip is everywhere.'],
      'He cut it with his own parang, and thanked you by name. It was the right picture.',
      'The bridge opened without you. It carries the same traffic.',
    ],
  },

  riceShort: {
    title: 'No rice on the shelves',
    body: 'Local white rice has vanished from the shops. The imported kind is there, at a third more. The millers blame the weather, the wholesalers blame the millers, and the queue outside the supermarket blames you.',
    options: ['Release the national stockpile', 'Raid the warehouses, with cameras', 'Suggest people try tapioca'],
    results: [
      'The stockpile is on the shelves by Friday. The stockpile is also smaller.',
      ['Forty tonnes were found behind a false wall. It made a fine evening news.', 'The warehouses were empty, and the cameras recorded that too.'],
      'The tapioca remark has been set to music. It is very popular.',
    ],
  },
  ricePrice: {
    title: 'The price of rice',
    body: 'The millers say they cannot sell at the controlled price and keep their doors open. The farmers say they see none of the difference either way. Your ministers have three opinions between two of them.',
    options: ['Raise the controlled price', 'Pay the millers a subsidy', 'Hold the price, and let them complain'],
    results: [
      'Rice is back, and dearer. The towns are angry; the padi fields are not.',
      'The millers are paid and the price holds. The Treasury has sent a note.',
      'The price held. So did the shortage, in the districts that grow the stuff.',
    ],
  },
  riceInquiry: {
    title: 'The inquiry reports',
    body: 'The inquiry into the shortage has reported. It finds a cartel of five wholesalers who agreed between them what the country would pay for rice. Two of the five have been generous to your party for years.',
    options: ['Prosecute all five', 'Fine them quietly, and take their apology', 'Shelve the report'],
    results: [
      'All five are charged. The party’s dinners will be quieter this year, and the public has noticed why.',
      'They were fined, and they were grateful, in the usual way.',
      'The report is on a shelf. Copies of it are not.',
    ],
  },
};

export const STORY_EVENTS_MS: Record<string, EventText> = {
  papers: {
    title: 'Dokumen si akauntan',
    body: 'Seorang akauntan muda di syarikat berkaitan kerajaan negeri minta jumpa anda, bawa sebuah fail kotak. Dokumen tu tunjuk duit mengalir ke tempat yang tak sepatutnya. Kebanyakannya ke kawan-kawan lawan anda. Sebahagiannya, katanya berhati-hati, ke orang yang rapat dengan anda.',
    options: ['Bawa dokumen tu kepada akhbar', 'Serahkan senyap-senyap kepada agensi pencegah rasuah', 'Ucap terima kasih, dan suruh dia balik'],
    results: [
      'Menjelang pagi, dokumen tu dah sampai kepada tiga editor. Parti anda sendiri nak tahu nama siapa dalamnya.',
      'Agensi bagi anda resit dan secawan teh. Mereka akan hubungi anda.',
      'Dia balik dengan fail kotaknya. Dia tak nampak macam orang yang akan berhenti di situ.',
    ],
  },
  papersStory: {
    title: 'Dokumen tu tersiar',
    body: 'Cerita tu dah dua minggu tersiar, tak kira macam mana ia terbongkar. Ia sebut nama dua orang kuat lawan anda, dan seorang ketua bahagian anda sendiri, yang dah tiga puluh tahun dengan parti dan tak pernah gagal menang kerusinya.',
    options: ['Gantung tugasnya sampai hal ni selesai', 'Pertahankan dia depan orang ramai', 'Kata ini urusan mahkamah, dan berharap'],
    results: [
      'Dia berundur dengan tenang, bahagiannya tak. Tapi orang yang dah berhenti dengar anda mula dengar semula.',
      'Anda berdiri di sisinya pada sidang akhbar. Gambar tu akan dipakai bertahun-tahun.',
      ['Memang urusan mahkamah, dan mahkamah lambat. Cerita tu berlalu.', 'Tak ada siapa percaya ini urusan mahkamah. Mereka percaya anda sembunyi.'],
    ],
  },
  papersBook: {
    title: 'Si akauntan tulis buku',
    body: 'Akauntan tu hilang kerja, macam biasa. Sekarang dia tulis buku pasal benda tu, dan nak anda datang majlis pelancarannya. Ketua-ketua bahagian anda nak anda berada di mana-mana kecuali di situ. Ada orang cadangkan pilihan ketiga, tapi dia tak sebut nama.',
    options: ['Hadir majlis pelancaran', 'Bayar penerbit supaya tangguh sampai lepas pilihan raya', 'Suruh orang siasat apa lagi yang dia tahu'],
    results: [
      'Anda datang, berdiri di belakang, dan tetap kena rakam. Orang muda perasan.',
      'Buku ditangguhkan. Cerita kenapa ia ditangguhkan, tak.',
      ['Dia tahu banyak lagi, pasal orang lain. Semuanya dah ada dalam fail anda.', 'Dia tahu anda akan hantar orang. Dia rakam perbualan tu.'],
    ],
  },

  bridge: {
    title: 'Jambatan hanyut',
    body: 'Satu-satunya jambatan ke empat buah kampung hanyut dalam banjir malam tadi. Budak-budak menyeberang ke sekolah naik sampan, dan klinik pula di seberang yang salah. Semua orang setuju kena buat sesuatu. Tak ada siapa sebut siapa yang kena buat.',
    options: ['Biayai lintasan sementara dengan duit awam', 'Jadikannya skandal nasional', 'Janji jambatan yang elok, nanti pada waktunya'],
    results: [
      'Jambatan besi pejalan kaki siap dalam sembilan hari, dengan bendera parti anda di kedua-dua hujung.',
      'Ia jadi berita utama seminggu. Pihak yang bertanggungjawab belum maafkan anda.',
      'Mereka pernah dijanjikan jambatan sebelum ni. Yang ni mereka catat.',
    ],
  },
  bridgeContract: {
    title: 'Siapa bina jambatan',
    body: 'Kontrak jambatan baharu dah dianugerahkan. Syarikat yang menang milik abang ipar seorang ketua bahagian anda, dan harganya dua kali ganda anggaran jurutera. Dia nak anda tahu parti tak akan dilupakan.',
    options: ['Dedahkan, orang sendiri atau bukan', 'Diam saja', 'Ambil bahagian parti'],
    results: [
      'Kontrak dibatalkan dan ditender semula. Ketua bahagian anda dah tak jawab panggilan.',
      'Anda diam. Jambatan akan dibina, dengan harga dua kali ganda.',
      'Parti tak dilupakan. Di kampung tu, hal ni pun tak akan dilupakan.',
    ],
  },
  bridgeOpening: {
    title: 'Reben',
    body: 'Jambatan siap, lewat lapan bulan, dan jambatannya memang elok. Akan ada majlis perasmian, dengan reben, khemah dan seekor kambing. Tok penghulu dah diberitahu ada orang penting nak datang, dan dia tanya, dengan sopan, siapa.',
    options: ['Potong reben sendiri', 'Biar tok penghulu potong, dan berdiri di belakangnya', 'Hantar ucapan maaf'],
    results: [
      ['Mereka bersorak. Orang lebih ingat siapa yang datang daripada siapa yang bayar.', 'Seseorang di belakang tanya kuat-kuat, berapa kos jambatan ni. Klipnya merata-rata.'],
      'Dia potong dengan parang sendiri, dan sebut nama anda. Itulah gambar yang betul.',
      'Jambatan dirasmikan tanpa anda. Lalu lintasnya sama saja.',
    ],
  },

  riceShort: {
    title: 'Beras tak ada di rak',
    body: 'Beras putih tempatan lesap dari kedai. Yang import ada, mahal sepertiga. Pengilang salahkan cuaca, pemborong salahkan pengilang, dan barisan di luar pasar raya salahkan anda.',
    options: ['Keluarkan stok penimbal negara', 'Serbu gudang, bawa kamera', 'Cadangkan rakyat cuba ubi kayu'],
    results: [
      'Stok penimbal sampai ke rak menjelang Jumaat. Stok penimbal pun makin susut.',
      ['Empat puluh tan jumpa di sebalik dinding palsu. Berita malam tu memang menarik.', 'Gudang-gudang tu kosong, dan kamera rakam benda tu juga.'],
      'Kenyataan ubi kayu tu dah dijadikan lagu. Sangat popular.',
    ],
  },
  ricePrice: {
    title: 'Harga beras',
    body: 'Pengilang kata mereka tak mampu jual pada harga kawalan dan terus buka kilang. Petani kata mereka tak rasa beza pun, naik atau turun. Menteri-menteri anda ada tiga pendapat antara dua orang.',
    options: ['Naikkan harga kawalan', 'Bayar subsidi kepada pengilang', 'Kekalkan harga, biar mereka merungut'],
    results: [
      'Beras balik, dan lebih mahal. Bandar marah; sawah padi tak.',
      'Pengilang dibayar dan harga kekal. Perbendaharaan hantar nota.',
      'Harga kekal. Kekurangan pun kekal, di daerah yang menanamnya.',
    ],
  },
  riceInquiry: {
    title: 'Siasatan melaporkan',
    body: 'Siasatan pasal kekurangan beras dah melaporkan. Ia jumpa kartel lima pemborong yang bersepakat sesama sendiri berapa negara patut bayar untuk beras. Dua daripadanya dah bertahun-tahun murah hati dengan parti anda.',
    options: ['Dakwa kelima-limanya', 'Denda mereka senyap-senyap, dan terima maaf mereka', 'Simpan laporan tu'],
    results: [
      'Kelima-limanya didakwa. Majlis makan malam parti akan lebih sunyi tahun ni, dan rakyat perasan sebabnya.',
      'Mereka didenda, dan mereka berterima kasih, dengan cara biasa.',
      'Laporan tu atas rak. Salinannya tak.',
    ],
  },
};
