import type { EventText } from './events';

// Eight stories of the trouble that comes with winning, for a government that is steady and rich. Every person and place is invented. See src/sim/campaign/eventListPower.ts.

export const POWER_EN: Record<string, EventText> = {
  powerPartnerPortfolios: {
    title: 'A partner who knows what it is worth',
    body: 'The leader of your smaller partner has noticed that the government is stable and that it needs him to be. He would like two more portfolios, and he would like them before the next budget. He says it politely, and the politeness is the threat.',
    options: ['Give him one portfolio and a good title', 'Refuse, and remind him who leads', 'Find money for his constituencies instead'],
    results: [
      'He takes the portfolio, thanks you warmly, and begins to plan for the next one. Your own party asks what it is for.',
      'He leaves without a word. The coalition holds, but his members begin to be seen at other people’s receptions.',
      'The money is found, and so is a new road in his seat. He calls it a partnership; your treasurer calls it something else.',
    ],
  },
  powerPartnerProject: {
    title: 'A project with a partner’s name on it',
    body: 'A partner wants a very large bridge in a very small constituency. The engineers say a ferry would do. The partner says the constituency has been waiting longer than the ferry has existed, and that its members do not do well on ferries.',
    options: ['Build the bridge', 'Say no and offer the ferry', 'Promise a study, and hope the study is slow'],
    results: [
      'The bridge is announced. It is a very good bridge, and a ribbon is cut by someone who is not you.',
      'The ferry is offered and declined. The partner’s members are seen looking at the bridge on a map, and at your majority.',
      ['The study buys time, and the partner is satisfied that it is a real study. Nobody mentions the ferry again.', 'The study is leaked as a delay. The partner calls it an insult, and his members are not smiling.'],
    ],
  },
  powerDeputyCamp: {
    title: 'The deputy’s friends',
    body: 'Your deputy has done nothing wrong, and a great many people have noticed. They gather for lunch on Thursdays and talk about the party’s future, which is a polite way of saying yours. The party is winning, and a party that is winning has time for this.',
    options: ['Give the deputy’s friends a visible role', 'Reshuffle, and put them where they cannot meet', 'Invite the whole camp to dinner and talk it through'],
    results: [
      'The camp is placated, and much better fed. Everyone else wonders whether lunch is now a way to get on.',
      'The reshuffle is neat, and everyone reads it correctly. The camp spreads out and starts having lunch by video.',
      ['The dinner is long, honest and strangely warm. By dessert the camp is yours again.', 'The dinner is long and honest, and it turns out the camp meant every word. Several chairs are not pushed back in.'],
    ],
  },
  powerBackbench: {
    title: 'Backbenchers who want their share',
    body: 'The treasury is full, and the backbenchers have read the same figures you have. They want constituency funds, and they are not asking for the hall to be repainted. One has brought a spreadsheet, which is a bad sign.',
    options: ['Open the funds, and take the credit', 'Refuse, and tell them the surplus belongs to the country', 'Give a little to everyone and a lot to nobody'],
    results: [
      'The funds are opened, the halls are repainted, and the credit is shared more widely than you meant.',
      'The speech is a good one and nobody claps. Several backbenchers are suddenly very interested in the opposition’s ideas on accountability.',
      'Everyone gets a little, and nobody is thrilled. It is, in its way, the most political thing you have done all year.',
    ],
  },
  powerContractor: {
    title: 'A very generous contractor',
    body: 'A contractor has been giving a great deal to a great many people close to the government, and a journalist has the receipts. None of it is illegal, strictly. All of it is the sort of thing that reads badly in a headline, and it will.',
    options: ['Order an independent inquiry and publish it', 'Deny it all, and say the journalist has an agenda', 'Settle the matter quietly and hope it ends'],
    results: [
      'The inquiry finds three people who should not have been so grateful. They resign, and the party winces, and the story ends.',
      ['The denial holds, mostly, and the journalist gets a lawyer’s letter and a new audience.', 'The denial falls apart on a Tuesday. By Wednesday it is the only story in the country.'],
      'The matter is settled. A few weeks later, so is the journalist’s story, quietly, and a few people ask why.',
    ],
  },
  powerWedding: {
    title: 'A very large wedding',
    body: 'The child of a senior minister is married in a ceremony that closes two roads and a hotel. The guest list reads like the cabinet’s family album, and the photographs have reached people who do not usually look at that kind of thing. Several of them are cross.',
    options: ['Say nothing, and let it pass', 'Condemn it, and call for modesty', 'Quietly ask the minister to make a donation, and say that he has'],
    results: [
      'It passes, slowly, and leaves a mark. The people who liked the party are a little less warm than before.',
      'The condemnation is popular and the minister is not. He is polite about it, in the way that people are who will remember.',
      'The donation is announced, along with the minister’s regret. People are cross, but less so, and some are kind.',
    ],
  },
  powerOppUnites: {
    title: 'The opposition agrees on something',
    body: 'After years of arguing, the opposition parties have found a single thing they can agree on: that they will not stand against each other in the seats that matter. It is not much of a platform, and it is a very good plan.',
    options: ['Court the smaller parties with something for their seats', 'Attack the pact as a marriage of convenience', 'Bet that they will quarrel again before the next election'],
    results: [
      'A few of the smaller parties are tempted, and a few of the larger ones take notice. The pact holds, a little thinner than it was.',
      'The attack lands, and so does the reply, which is that you are the convenience. The pact looks, for a week, like a cause.',
      ['They quarrel within a month, over a seat nobody had heard of. The pact is a footnote.', 'They do not quarrel. They hold a joint press conference, a very good one, and the polls begin to move.'],
    ],
  },
  powerComfort: {
    title: 'The polls say you cannot lose',
    body: 'The party’s own pollster says that you cannot lose the next election, and then, a minute later, that the people in your own camp now believe it. The branches are quieter than they were. A few of the volunteers have found other weekends.',
    options: ['Hold a rally and remind the party what winning takes', 'Tell the pollster not to share the numbers', 'Announce a bold new programme to keep everyone busy'],
    results: [
      'The rally is full and slightly sheepish. Everyone remembers what they came for, and the branches get busy again.',
      'The numbers stay private, and the confidence stays too. The pollster files a note for later, in case it is needed.',
      ['The programme gives the party something to do, and it is a good one. The branches are busy and the headlines are kind.', 'The programme is announced before it is ready. It is busy, certainly, and so is the opposition, in your direction.'],
    ],
  },
};

export const POWER_MS: Record<string, EventText> = {
  powerPartnerPortfolios: {
    title: 'Rakan yang tahu nilai dirinya',
    body: 'Pemimpin rakan kecil anda perasan kerajaan stabil dan kerajaan memerlukannya. Dia mahu dua lagi portfolio, dan mahu sebelum bajet seterusnya. Dia cakap dengan sopan, dan kesopanan itulah ugutannya.',
    options: ['Beri satu portfolio dan gelaran yang cantik', 'Tolak, dan ingatkan siapa yang memimpin', 'Cari wang untuk kawasannya sebagai ganti'],
    results: [
      'Dia ambil portfolio itu, berterima kasih dengan mesra, dan mula merancang untuk yang seterusnya. Parti anda sendiri bertanya apa gunanya.',
      'Dia pergi tanpa sepatah kata. Gabungan bertahan, tetapi ahli-ahlinya mula kelihatan di majlis orang lain.',
      'Wang ditemui, begitu juga jalan baharu di kawasannya. Dia panggil ia perkongsian; bendahari anda panggil ia benda lain.',
    ],
  },
  powerPartnerProject: {
    title: 'Projek yang ada nama rakan',
    body: 'Seorang rakan mahu jambatan yang sangat besar di kawasan yang sangat kecil. Jurutera kata feri pun cukup. Rakan itu kata kawasan itu menunggu lebih lama daripada feri itu wujud, dan ahli-ahlinya tak berapa sesuai dengan feri.',
    options: ['Bina jambatan itu', 'Kata tidak dan tawarkan feri', 'Janji kajian, dan harap kajian itu perlahan'],
    results: [
      'Jambatan diumumkan. Ia jambatan yang sangat bagus, dan riben dipotong oleh orang lain, bukan anda.',
      'Feri ditawarkan dan ditolak. Ahli-ahli rakan itu kelihatan menatap jambatan di atas peta, dan majoriti anda.',
      ['Kajian membeli masa, dan rakan itu puas hati ia kajian sebenar. Tiada siapa sebut feri lagi.', 'Kajian bocor sebagai penangguhan. Rakan itu panggil ia penghinaan, dan ahli-ahlinya tidak tersenyum.'],
    ],
  },
  powerDeputyCamp: {
    title: 'Kawan-kawan timbalan',
    body: 'Timbalan anda tak buat salah, dan ramai orang perasan. Mereka berkumpul makan tengah hari setiap Khamis dan bercakap tentang masa depan parti, cara sopan untuk kata masa depan anda. Parti sedang menang, dan parti yang menang ada masa untuk ini.',
    options: ['Beri kawan timbalan peranan yang kelihatan', 'Rombak kabinet, dan letak mereka di tempat yang tak boleh berjumpa', 'Jemput seluruh kumpulan makan malam dan berbincang'],
    results: [
      'Kumpulan itu reda, dan jauh lebih kenyang. Orang lain tertanya-tanya sama ada makan tengah hari kini jalan untuk maju.',
      'Rombakan kemas, dan semua orang membacanya dengan betul. Kumpulan itu berpecah dan mula makan tengah hari melalui video.',
      ['Makan malam panjang, jujur dan anehnya mesra. Menjelang pencuci mulut kumpulan itu kembali kepada anda.', 'Makan malam panjang dan jujur, dan ternyata kumpulan itu maksudkan setiap patah. Beberapa kerusi tak ditolak masuk semula.'],
    ],
  },
  powerBackbench: {
    title: 'Ahli belakang mahu bahagian mereka',
    body: 'Perbendaharaan penuh, dan ahli belakang telah membaca angka yang sama seperti anda. Mereka mahu dana kawasan, dan bukan sekadar untuk mengecat dewan. Seorang membawa hamparan, tanda yang tak baik.',
    options: ['Buka dana, dan ambil jasa', 'Tolak, dan kata lebihan itu milik negara', 'Beri sedikit kepada semua dan banyak kepada tiada siapa'],
    results: [
      'Dana dibuka, dewan dicat semula, dan jasa dikongsi lebih luas daripada yang anda maksudkan.',
      'Ucapan itu bagus dan tiada siapa bertepuk. Beberapa ahli belakang tiba-tiba sangat berminat dengan idea pembangkang tentang akauntabiliti.',
      'Semua dapat sedikit, dan tiada yang teruja. Dengan caranya, ia perkara paling politik yang anda buat tahun ini.',
    ],
  },
  powerContractor: {
    title: 'Kontraktor yang sangat pemurah',
    body: 'Seorang kontraktor telah memberi banyak kepada ramai orang yang dekat dengan kerajaan, dan seorang wartawan ada resitnya. Tiada satu pun haram, tepatnya. Semuanya jenis yang kedengaran buruk dalam tajuk berita, dan ia akan jadi begitu.',
    options: ['Arahkan siasatan bebas dan terbitkan', 'Nafikan semuanya, dan kata wartawan ada agenda', 'Selesaikan senyap-senyap dan harap ia berakhir'],
    results: [
      'Siasatan menemui tiga orang yang tak sepatutnya sebegitu berterima kasih. Mereka letak jawatan, parti mengerut, dan cerita itu tamat.',
      ['Penafian bertahan, kebanyakannya, dan wartawan itu dapat surat peguam dan khalayak baharu.', 'Penafian berantakan pada hari Selasa. Menjelang Rabu ia satu-satunya cerita di negara ini.'],
      'Perkara itu diselesaikan. Beberapa minggu kemudian, cerita wartawan itu pun, senyap-senyap, dan beberapa orang tertanya-tanya kenapa.',
    ],
  },
  powerWedding: {
    title: 'Majlis kahwin yang sangat besar',
    body: 'Anak seorang menteri kanan berkahwin dalam majlis yang menutup dua jalan dan sebuah hotel. Senarai tetamu seperti album keluarga kabinet, dan gambarnya sampai kepada orang yang biasanya tak melihat perkara begini. Ada yang marah.',
    options: ['Diam, dan biar ia berlalu', 'Kecam, dan seru supaya bersederhana', 'Minta menteri itu menderma senyap-senyap, dan katakan dia sudah'],
    results: [
      'Ia berlalu, perlahan, dan meninggalkan kesan. Orang yang suka parti ini kurang mesra sedikit daripada dulu.',
      'Kecaman itu popular dan menteri itu tidak. Dia sopan tentangnya, cara orang yang akan ingat.',
      'Derma diumumkan, bersama penyesalan menteri. Orang masih marah, tetapi kurang, dan ada yang berbaik hati.',
    ],
  },
  powerOppUnites: {
    title: 'Pembangkang bersetuju tentang sesuatu',
    body: 'Selepas bertahun-tahun bertengkar, parti pembangkang menemui satu perkara yang mereka sepakati: mereka tak akan bertanding sesama sendiri di kerusi yang penting. Ia bukan platform yang hebat, dan ia rancangan yang sangat bagus.',
    options: ['Pikat parti kecil dengan sesuatu untuk kerusi mereka', 'Serang pakatan itu sebagai perkahwinan segera', 'Bertaruh mereka akan bergaduh lagi sebelum pilihan raya'],
    results: [
      'Beberapa parti kecil tergoda, dan beberapa parti besar mengambil perhatian. Pakatan bertahan, sedikit lebih nipis.',
      'Serangan itu mengena, begitu juga jawapannya, bahawa andalah perkahwinan segera itu. Pakatan itu kelihatan, seminggu, seperti satu perjuangan.',
      ['Mereka bergaduh dalam sebulan, kerana kerusi yang tiada siapa pernah dengar. Pakatan itu nota kaki.', 'Mereka tak bergaduh. Mereka adakan sidang media bersama, yang sangat bagus, dan bacaan tinjauan mula bergerak.'],
    ],
  },
  powerComfort: {
    title: 'Tinjauan kata anda tak boleh kalah',
    body: 'Peninjau parti sendiri kata anda tak boleh kalah dalam pilihan raya seterusnya, dan seminit kemudian, bahawa orang dalam kem anda kini percaya begitu. Cawangan lebih sunyi daripada dulu. Beberapa sukarelawan telah menemui hujung minggu lain.',
    options: ['Adakan ceramah dan ingatkan parti apa yang kemenangan perlukan', 'Suruh peninjau jangan kongsi angka itu', 'Umumkan program berani baharu supaya semua orang sibuk'],
    results: [
      'Ceramah penuh dan sedikit malu-malu. Semua orang ingat kenapa mereka datang, dan cawangan sibuk semula.',
      'Angka kekal peribadi, dan keyakinan pun kekal. Peninjau memfailkan nota untuk kemudian, kalau-kalau diperlukan.',
      ['Program memberi parti sesuatu untuk dibuat, dan ia program yang bagus. Cawangan sibuk dan tajuk berita bersikap baik.', 'Program diumumkan sebelum siap. Ia sibuk, tentu sekali, dan begitu juga pembangkang, ke arah anda.'],
    ],
  },
};
