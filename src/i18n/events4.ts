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
    options: ['Pay for a temporary crossing from party funds', 'Make it a national scandal', 'Promise them a proper bridge, in good time'],
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
    body: 'Seorang akauntan muda di sebuah syarikat berkaitan kerajaan negeri meminta berjumpa anda, dan membawa sebuah fail kotak. Dokumen itu menunjukkan wang mengalir ke tempat yang tidak sepatutnya. Kebanyakannya kepada kawan-kawan pesaing anda. Sebahagiannya, katanya berhati-hati, kepada orang yang rapat dengan anda.',
    options: ['Bawa dokumen itu kepada akhbar', 'Serahkan secara senyap kepada agensi pencegah rasuah', 'Ucap terima kasih, dan suruh dia pulang'],
    results: [
      'Dokumen itu sampai kepada tiga pengarang menjelang pagi. Parti anda sendiri ingin tahu nama siapa di dalamnya.',
      'Agensi itu memberi anda resit dan secawan teh. Mereka akan menghubungi anda.',
      'Dia pulang bersama fail kotaknya. Dia tidak kelihatan seperti orang yang akan berhenti di situ.',
    ],
  },
  papersStory: {
    title: 'Dokumen itu tersiar',
    body: 'Cerita itu sudah dua minggu tersiar, walau bagaimana ia terbongkar. Ia menamakan dua orang kuat pesaing anda, dan seorang ketua bahagian anda sendiri, yang sudah tiga puluh tahun bersama parti dan tidak pernah gagal memenangi kerusinya.',
    options: ['Gantung tugasnya sehingga perkara ini selesai', 'Pertahankan dia di khalayak', 'Katakan ini urusan mahkamah, dan berharap'],
    results: [
      'Dia berundur dengan tenang, bahagiannya tidak. Tetapi orang yang sudah berhenti mendengar anda mula mendengar semula.',
      'Anda berdiri di sisinya pada sidang akhbar. Gambar itu akan digunakan bertahun-tahun.',
      ['Ia memang urusan mahkamah, dan mahkamah itu perlahan. Cerita itu berlalu.', 'Tiada siapa percaya ini urusan mahkamah. Mereka percaya anda bersembunyi.'],
    ],
  },
  papersBook: {
    title: 'Si akauntan menulis buku',
    body: 'Akauntan itu kehilangan kerja, seperti biasa. Kini dia menulis buku tentangnya, dan mahu anda hadir pada majlis pelancarannya. Ketua-ketua bahagian anda mahu anda berada di mana-mana selain di situ. Pilihan ketiga dicadangkan, oleh seseorang yang tidak menyebut namanya.',
    options: ['Hadir ke majlis pelancaran', 'Bayar penerbit supaya menangguhkannya hingga selepas pilihan raya', 'Suruh orang siasat apa lagi yang dia tahu'],
    results: [
      'Anda hadir, berdiri di belakang, dan tetap dirakam. Orang muda perasan.',
      'Buku itu ditangguhkan. Cerita tentang sebab ia ditangguhkan, tidak.',
      ['Dia tahu banyak lagi, tentang orang lain. Semuanya kini dalam fail anda.', 'Dia tahu anda akan menghantar orang. Dia merakam perbualan itu.'],
    ],
  },

  bridge: {
    title: 'Jambatan hanyut',
    body: 'Satu-satunya jambatan ke empat buah kampung hanyut dalam banjir malam tadi. Kanak-kanak menyeberang ke sekolah dengan sampan, dan klinik terletak di seberang yang salah. Semua bersetuju sesuatu mesti dilakukan. Tiada siapa menyebut oleh siapa.',
    options: ['Biayai lintasan sementara dengan wang parti', 'Jadikannya skandal nasional', 'Janjikan jambatan yang sempurna, pada waktunya'],
    results: [
      'Jambatan besi pejalan kaki siap dalam sembilan hari, dengan bendera parti anda di kedua-dua hujung.',
      'Ia menjadi berita utama seminggu. Pihak yang bertanggungjawab belum memaafkan anda.',
      'Mereka pernah dijanjikan jambatan sebelum ini. Yang ini mereka catat.',
    ],
  },
  bridgeContract: {
    title: 'Siapa membina jambatan',
    body: 'Kontrak jambatan baharu sudah dianugerahkan. Syarikat yang menang milik abang ipar seorang ketua bahagian anda, dan harganya dua kali ganda anggaran jurutera. Dia mahu anda tahu parti tidak akan dilupakan.',
    options: ['Dedahkan, orang sendiri atau bukan', 'Diam sahaja', 'Ambil bahagian parti'],
    results: [
      'Kontrak dibatalkan dan ditender semula. Ketua bahagian anda tidak lagi menjawab panggilan.',
      'Anda diam. Jambatan akan dibina, dengan harga dua kali ganda.',
      'Parti tidak dilupakan. Di kampung itu, perkara ini pun tidak akan dilupakan.',
    ],
  },
  bridgeOpening: {
    title: 'Reben',
    body: 'Jambatan itu siap, lewat lapan bulan, dan jambatannya elok. Akan ada majlis perasmian, dengan reben, khemah dan seekor kambing. Tok penghulu diberitahu orang penting akan datang, dan bertanya, dengan sopan, siapa.',
    options: ['Potong reben itu sendiri', 'Biar tok penghulu memotongnya, dan berdiri di belakangnya', 'Hantar ucapan maaf'],
    results: [
      ['Mereka bersorak. Orang lebih ingat siapa yang datang daripada siapa yang membayar.', 'Seseorang di belakang bertanya, dengan lantang, berapa kos jambatan itu. Klipnya tersebar di mana-mana.'],
      'Dia memotongnya dengan parangnya sendiri, dan menyebut nama anda. Itulah gambar yang betul.',
      'Jambatan dirasmikan tanpa anda. Lalu lintasnya sama sahaja.',
    ],
  },

  riceShort: {
    title: 'Beras tiada di rak',
    body: 'Beras putih tempatan lesap dari kedai. Yang import ada, sepertiga lebih mahal. Pengilang menyalahkan cuaca, pemborong menyalahkan pengilang, dan barisan di luar pasar raya menyalahkan anda.',
    options: ['Keluarkan stok penimbal negara', 'Serbu gudang, bersama kamera', 'Cadangkan rakyat cuba ubi kayu'],
    results: [
      'Stok penimbal sampai ke rak menjelang Jumaat. Stok penimbal juga semakin susut.',
      ['Empat puluh tan ditemui di sebalik dinding palsu. Berita malam itu memang menarik.', 'Gudang-gudang itu kosong, dan kamera merakam itu juga.'],
      'Kenyataan ubi kayu itu sudah dijadikan lagu. Ia sangat popular.',
    ],
  },
  ricePrice: {
    title: 'Harga beras',
    body: 'Pengilang berkata mereka tidak mampu menjual pada harga kawalan dan terus beroperasi. Petani berkata mereka tidak merasa bezanya sama ada naik atau turun. Menteri-menteri anda ada tiga pendapat antara dua orang.',
    options: ['Naikkan harga kawalan', 'Bayar subsidi kepada pengilang', 'Kekalkan harga, biar mereka merungut'],
    results: [
      'Beras kembali, dan lebih mahal. Bandar marah; sawah padi tidak.',
      'Pengilang dibayar dan harga kekal. Perbendaharaan menghantar nota.',
      'Harga kekal. Begitu juga kekurangan, di daerah yang menanamnya.',
    ],
  },
  riceInquiry: {
    title: 'Siasatan melaporkan',
    body: 'Siasatan tentang kekurangan beras sudah melaporkan. Ia mendapati satu kartel lima pemborong yang bersepakat sesama mereka berapa negara akan membayar untuk beras. Dua daripadanya sudah bertahun-tahun bermurah hati kepada parti anda.',
    options: ['Dakwa kelima-limanya', 'Denda mereka secara senyap, dan terima permohonan maaf', 'Simpan laporan itu'],
    results: [
      'Kelima-limanya didakwa. Majlis makan malam parti akan lebih sunyi tahun ini, dan rakyat perasan sebabnya.',
      'Mereka didenda, dan mereka berterima kasih, dengan cara biasa.',
      'Laporan itu di atas rak. Salinannya tidak.',
    ],
  },
};
