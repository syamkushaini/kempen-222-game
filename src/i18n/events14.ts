import type { EventText } from './events';

// What lands on the desk of a party in opposition that does not lead it, in English and Bahasa Malaysia. Every person, company
// and body in them is invented. A result written as a pair is for a gamble: what is reported if it comes off, then if it does not.

export const OPP_EVENTS_EN: Record<string, EventText> = {
  leadFreeze: {
    title: 'Left out of the planning',
    body: 'The leader of the opposition has held a strategy meeting for the whole opposition, and your party was not told. You learned about it from the photograph, in which a row of men in identical shirts are looking at a whiteboard.',
    options: ['Complain in public about being left out', 'Say nothing, and join in quietly from the next meeting', 'Make your own plan, and invite them to it'],
    results: [
      'The complaint was heard. The leader’s office said it was an oversight, and put you on the list, and then on the bottom of it.',
      'You joined quietly, and were welcomed with a handshake, and a chair next to the door.',
      'Your own plan was a good one, and was noticed. The opposition has begun to wonder who is following whom.',
    ],
  },
  govtCourts: {
    title: 'The government’s offer for your district',
    body: 'The government has offered a very large road project to your district, a thing you have asked for, for years. The offer arrived the same week as a vote in which your support would be welcome. Neither side has mentioned the connection.',
    options: ['Accept the project, with the strings attached', 'Refuse it, and say the district is not for sale', 'Take it, and go on criticising the government as before'],
    results: [
      'The project was accepted, and the district was delighted. The opposition spoke to you in short sentences.',
      'You refused. The district was torn between pride and potholes, and the papers called it “a rare act”.',
      ['You took it and criticised, and the government let it be, to show that it was generous.', 'You took it and criticised, and the government said it had been betrayed, and the project was reviewed.'],
    ],
  },
  seatDealLead: {
    title: 'A seat-sharing proposal',
    body: 'The leader of the opposition has proposed that your party, which holds seats in several states, should give up a number of them to the larger party in return for a few others. The numbers have been worked out on a spreadsheet by someone who has never been to the seats.',
    options: ['Accept the proposal, and give up the seats', 'Hold out for the seats you hold', 'Propose a different swap, of seats that suit both parties better'],
    results: [
      'The seats were given up. The larger party was grateful, and your members in those seats were not.',
      'You held out. Your members were pleased, and the leader’s office said it was “disappointed”, which means irritated.',
      ['The swap was accepted, and was a good deal for both, and was shown on the same spreadsheet.', 'The swap was refused, and the larger party said it had been a “generous offer”.'],
    ],
  },
  swingVotes: {
    title: 'Your votes decide the vote',
    body: 'A bill in the House is going to be very close, and your party’s members, who are few, are going to decide it. Both sides have rung. One has offered a development fund. The other has offered a speech.',
    options: ['Sell your votes dear, to the highest bidder', 'Vote as your conscience and your voters say', 'Abstain, and say you are above it'],
    results: [
      'The votes were sold. The fund was a good one, and the bill passed, and your name was in the papers beside the word “price”.',
      'You voted as you thought best, and the vote was lost or won by a margin so tiny that both sides blamed you.',
      'You abstained. Both sides were annoyed, and the voters did not see what you stood for.',
    ],
  },
  speakingTime: {
    title: 'No time to speak',
    body: 'In the debate on the budget, the time for speeches has been shared out in proportion to the size of the party. Yours is small, and has been allotted four minutes, between two speeches of an hour each.',
    options: ['Raise a point of order, and ask for fair time', 'Accept it, and make the four minutes count', 'Take the speech to social media, where there is no clock'],
    results: [
      'The point of order was upheld, in part, and you were given seven minutes. They were used well.',
      'The four minutes were short and sharp, and the Speaker thanked you for being brief, which is not praise.',
      'The speech was posted, and viewed by a great many young people, and an old Member of Parliament said it was “not a speech”.',
    ],
  },
  constituencyClinic: {
    title: 'The clinic that closed',
    body: 'The only clinic in the district has closed for want of a doctor, and the government says that it will reopen “in due course”. Your office is full of people with fevers and questions.',
    options: ['Fund a mobile clinic from party funds', 'Press the government in public to reopen it', 'Hold a photo-op outside the closed doors'],
    results: [
      'The mobile clinic came, and a few hundred were treated in the first week. They remembered who sent it.',
      'The government promised a doctor by Christmas, and you made sure everybody heard it said.',
      'The photograph was a good one, and the district said it was “nice to be photographed outside a clinic that is closed”.',
    ],
  },
  ministryOffer: {
    title: 'A call from the Prime Minister’s office',
    body: 'The Prime Minister’s office has telephoned, with perfect politeness, to ask whether your party might be “open to a role in the government”. It would involve a ministry, and several departments, and a car with a flag. It would also involve a good deal of explaining to your voters.',
    options: ['Open talks, and see what is on offer', 'Decline at once, and say you are in opposition', 'Name a higher price, and see what the Prime Minister does'],
    results: [
      'The talks opened. It was widely thought you would join, and your voters began to ask what you were for.',
      'You declined. Your voters were relieved, and your members who had wanted a car were quietly disappointed.',
      ['The price was met, in part, and you had both a better deal and an opportunity to refuse it.', 'The price was refused, and the Prime Minister said that you had been “unrealistic”.'],
    ],
  },
  nicheCause: {
    title: 'The cause only you carry',
    body: 'Your party has been the only one to take up the cause of long-term care for the old, a matter that nobody else seems to find exciting. It has not been on a front page in a year, and a poll shows that three in ten voters think it is important.',
    options: ['Make it your campaign, and push it hard', 'Fold it into the opposition’s common agenda', 'Drop it for something that gets more attention'],
    results: [
      'The campaign took hold, slowly, and the older voters were grateful. It was not a front page, but it was a start.',
      'It was folded in. The leader’s office was gracious, and the cause was one of eleven on a list.',
      'You dropped it. The cause lived on, in somebody else’s speeches, and the credit was theirs.',
    ],
  },
  donorSmall: {
    title: 'A donor’s offer',
    body: 'A businessman you have never met has offered your party a large donation. He asks for nothing, which is, as every party treasurer knows, a very expensive price. He has a firm that builds things, and he has been seen near the minister of works.',
    options: ['Accept the money, and ask no questions', 'Accept half, and publish the name and the amount', 'Decline, and say why'],
    results: [
      'The money came, and spent itself quickly. A reporter found the businessman within a month.',
      'You accepted half, and published it, and the donor was embarrassed, and the voters were not.',
      'You declined. The treasurer sighed, the papers praised you, and the budget stayed lean.',
    ],
  },
  mergerInvite: {
    title: 'An invitation to merge',
    body: 'The leader of the opposition has proposed that your party and the larger one merge, “for the sake of a united alternative”. It would give you a share of the top posts and the end of your name, and the larger party would find it very convenient.',
    options: ['Open talks on a merger', 'Stay independent, and say so', 'Propose an electoral pact, in place of a merger'],
    results: [
      'The talks began, and a good half of your members said they would leave if they went well.',
      'You stayed independent. Your members were proud, and the larger party was cool.',
      ['The pact was agreed, and both parties kept their names and their seats.', 'The pact was refused, and the larger party said it was a merger or nothing.'],
    ],
  },
  defectionYours: {
    title: 'One of yours crosses over',
    body: 'One of your members of Parliament has told you that he is going to the government benches, “for the good of his district”. He has said it kindly, and he has said it in front of a camera, and he has taken the party’s office chair.',
    options: ['Expel him, and say so loudly', 'Try to talk him out of it', 'Let him go, and wish him well'],
    results: [
      'He was expelled. The party was seen as firm, and a seat was lost.',
      ['He stayed, and was grateful, and a little embarrassed, and was a better member for it.', 'He went anyway, and the talk had been seen, and the party looked weaker.'],
      'You let him go. He went, with a handshake, and the papers said it was “dignified”, which was nice, and not very useful.',
    ],
  },
  constituencyFlood: {
    title: 'Water in your district',
    body: 'The river has burst its banks in your district, and a hundred homes are under water. The government’s relief is, for now, a promise. The people are in a school, and your office is the nearest building with a telephone.',
    options: ['Pay for relief from the party’s own funds', 'Press the government in public for aid', 'Be photographed in the flood, in boots'],
    results: [
      'The party’s relief came first, and people said so, and the party’s funds were lower for it.',
      'You pressed for aid. It arrived a week later, with the minister’s name on the boxes.',
      'The photograph was a good one. The district noticed the boots, and the lack of anything else.',
    ],
  },
  localProtest: {
    title: 'A protest in your district',
    body: 'Residents of a village have begun to protest outside a quarry that is shaking their houses. They have posters, and a banner, and a very good drummer. Someone has told them that you are sympathetic.',
    options: ['Join the protest, and speak', 'Advise the protesters, and keep your distance', 'Stay neutral, and say it is for the authorities'],
    results: [
      'You joined, and the village loved it. The quarry company wrote a letter, and a magistrate looked up the law.',
      'You advised, and the protesters respected you for it, and the quarry stopped, for a week.',
      'You stayed neutral. The protesters, who had expected a friend, were polite and disappointed.',
    ],
  },
  shadowPortfolio: {
    title: 'An offer of a shadow portfolio',
    body: 'The leader of the opposition has offered one of your members the shadow portfolio for rural development, a post with a large title and no budget. It is flattering. It is also the leader’s way of making your party part of the leader’s team.',
    options: ['Accept the portfolio', 'Hold out for a bigger one', 'Decline, and keep your party’s own voice'],
    results: [
      'The portfolio was accepted, and your member made a fine speech in the House, and was thanked, and was one of many.',
      ['The leader offered a bigger one, and your party was a partner and not a guest.', 'The leader withdrew the offer, and gave the post to someone else, who was delighted.'],
      'You declined. Your members approved, and the leader’s office put a note in a file.',
    ],
  },
  mediaBlackout: {
    title: 'The silence of the press',
    body: 'Your party has been out of the news for a month. The editors say it is not their fault: there was a football match, a scandal and a very large fish. Your members want to know why nobody has asked them what they think.',
    options: ['Buy advertising, and be seen', 'Try a stunt that will go viral', 'Share a stage with the leader of the opposition, and share the coverage'],
    results: [
      'The advertisements ran, and were seen, and were not loved. The bill, however, was read.',
      ['The stunt went viral, and the party was talked about for the right reasons.', 'The stunt went viral for the wrong reasons, and the party was talked about for a week, in a tone it did not want.'],
      'The stage was shared. The leader’s speech was the one that was quoted, and your party’s name was on the banner.',
    ],
  },
  volunteerShortage: {
    title: 'No one to knock on doors',
    body: 'A by-election is coming, and your branch in the district has eleven volunteers, of whom six are over seventy, and two are the candidate’s relatives. A canvass of five thousand houses needs more.',
    options: ['Pay stipends to students and part-timers', 'Appeal for volunteers on social media', 'Cut the scope of the campaign, and fight only the best streets'],
    results: [
      'The stipends brought forty helpers, and a few of them, to everyone’s surprise, became members.',
      'The appeal brought a surprising number of young people, who knew how to use a phone and not how to use a doorbell.',
      'The scope was cut. The party fought the best streets well, and the rest not at all.',
    ],
  },
  borrowedLogo: {
    title: 'Whose logo on the ballot?',
    body: 'The leader of the opposition says that to stand a chance against the government, your candidates should contest under the larger party’s logo, in a few seats. It would help, and it would mean your name was off the ballot.',
    options: ['Accept the larger party’s logo in those seats', 'Keep your own logo, and fight under your own name', 'Propose a joint logo for the opposition as a whole'],
    results: [
      'The logo was accepted. The seats were easier to win, and your party, said an old member, “no longer existed on paper”.',
      'You kept your logo. Your members were proud, and the larger party was not, and a few seats were harder.',
      ['The joint logo was designed and well liked, and a common identity grew.', 'The joint logo was not agreed. The two parties began to argue about colours.'],
    ],
  },
  trappedVote: {
    title: 'A vote that traps you',
    body: 'The government has brought a bill that your members support in principle, and a clause that they cannot stand. Voting for it will help the government. Voting against it will look as though you oppose the bill’s purpose.',
    options: ['Vote for the bill, and say why', 'Vote against, and explain the clause', 'Stay away, and let the vote pass without you'],
    results: [
      'You voted for it. The government was grateful, your voters unsure, and your leader’s office told you what it thought.',
      'You voted against. The explanation was long, and people read only the headline, and that was fine.',
      'You stayed away. Everybody noticed, and nobody could say what you stood for.',
    ],
  },
  endorsement: {
    title: 'An endorsement from the elders',
    body: 'A group of respected village elders has said that they will endorse your party in the district, on a condition: that you visit every village in the district, and eat a meal in each. It is, they say, a matter of respect.',
    options: ['Accept, and visit them all', 'Accept, and ask for a smaller programme', 'Decline the endorsement, and keep your own plans'],
    results: [
      'You visited every village, and ate a great many meals. The endorsement was given, and the diet was not good.',
      'The programme was reduced, and the endorsement was kept, and the elders, who had been told of the diet, were kind.',
      'You declined. The elders were courteous about it, and the district drew its own conclusions.',
    ],
  },
  councilWin: {
    title: 'A win in the local council',
    body: 'Your party has won a surprise seat in a local council by-election, in a place where you have never done well. It is a small thing, and the papers have called it “an early sign”. Your members want to do something with it.',
    options: ['Build on it, with a team to run the council seat and a local drive', 'Show it off, as a sign of the mood', 'Be modest, and let it speak for itself'],
    results: [
      'The team was sent. The council seat was well run, and the district began to think of you differently.',
      'The win was shown off, and the papers carried it, and the mood did turn a little in your favour.',
      'You were modest. A few members felt you had let a good story go quiet.',
    ],
  },
};

export const OPP_EVENTS_MS: Record<string, EventText> = {
  leadFreeze: {
    title: 'Ditinggalkan dalam perancangan',
    body: 'Ketua pembangkang mengadakan mesyuarat strategi untuk seluruh pembangkang, dan parti anda tidak diberitahu. Anda tahu daripada gambar, di mana sebaris lelaki berbaju sama melihat papan putih.',
    options: ['Mengadu di khalayak kerana ditinggalkan', 'Diam, dan sertai secara senyap dari mesyuarat akan datang', 'Buat rancangan sendiri, dan jemput mereka'],
    results: [
      'Aduan itu didengar. Pejabat ketua berkata ia terlupa, dan meletakkan anda dalam senarai, kemudian di bahagian bawahnya.',
      'Anda menyertai secara senyap, dan disambut dengan jabat tangan, dan kerusi di sebelah pintu.',
      'Rancangan anda sendiri bagus, dan diperhatikan. Pembangkang mula tertanya-tanya siapa mengikut siapa.',
    ],
  },
  govtCourts: {
    title: 'Tawaran kerajaan untuk daerah anda',
    body: 'Kerajaan menawarkan projek jalan sangat besar ke daerah anda, sesuatu yang anda minta bertahun-tahun. Tawaran itu tiba pada minggu yang sama dengan undi yang sokongan anda dialu-alukan. Tiada pihak menyebut kaitannya.',
    options: ['Terima projek itu, dengan syarat yang melekat', 'Tolak, dan katakan daerah itu tidak dijual', 'Ambil, dan terus mengkritik kerajaan seperti biasa'],
    results: [
      'Projek diterima, dan daerah gembira. Pembangkang bercakap dengan anda dalam ayat pendek.',
      'Anda menolak. Daerah berbelah bahagi antara maruah dan lubang jalan, dan akhbar menyebutnya “tindakan yang jarang”.',
      ['Anda mengambil dan mengkritik, dan kerajaan membiarkannya, untuk menunjukkan ia bermurah hati.', 'Anda mengambil dan mengkritik, dan kerajaan berkata ia dikhianati, dan projek itu disemak semula.'],
    ],
  },
  seatDealLead: {
    title: 'Cadangan perkongsian kerusi',
    body: 'Ketua pembangkang mencadangkan parti anda, yang memegang kerusi di beberapa negeri, menyerahkan beberapa kerusi kepada parti yang lebih besar sebagai ganti beberapa yang lain. Angka dikira pada hamparan oleh seseorang yang tidak pernah ke kerusi itu.',
    options: ['Terima cadangan, dan serahkan kerusi', 'Bertahan untuk kerusi yang anda pegang', 'Cadangkan pertukaran lain, kerusi yang lebih sesuai kedua-dua parti'],
    results: [
      'Kerusi diserahkan. Parti yang lebih besar berterima kasih, dan ahli anda di kerusi itu tidak.',
      'Anda bertahan. Ahli anda gembira, dan pejabat ketua berkata ia “kecewa”, bermaksud geram.',
      ['Pertukaran diterima, dan perjanjian yang baik untuk kedua-duanya, dan ditunjukkan pada hamparan yang sama.', 'Pertukaran ditolak, dan parti yang lebih besar berkata ia “tawaran bermurah hati”.'],
    ],
  },
  swingVotes: {
    title: 'Undi anda menentukan undian',
    body: 'Rang undang-undang di Dewan akan sangat tipis, dan ahli parti anda, yang sedikit, akan menentukannya. Kedua-dua pihak telah menelefon. Satu menawarkan dana pembangunan. Satu lagi menawarkan ucapan.',
    options: ['Jual undi anda mahal, kepada penawar tertinggi', 'Mengundi mengikut hati nurani dan pengundi anda', 'Berkecuali, dan katakan anda di atas semua itu'],
    results: [
      'Undi dijual. Dana itu baik, dan rang diluluskan, dan nama anda dalam akhbar di sebelah perkataan “harga”.',
      'Anda mengundi mengikut yang terbaik, dan undian dimenangi atau kalah dengan margin sangat tipis sehingga kedua-dua pihak menyalahkan anda.',
      'Anda berkecuali. Kedua-dua pihak marah, dan pengundi tidak nampak apa yang anda perjuangkan.',
    ],
  },
  speakingTime: {
    title: 'Tiada masa bercakap',
    body: 'Dalam perbahasan belanjawan, masa untuk ucapan dibahagikan mengikut saiz parti. Parti anda kecil, dan diperuntukkan empat minit, antara dua ucapan sejam setiap satu.',
    options: ['Bangkitkan perkara tatatertib, dan minta masa adil', 'Terima, dan jadikan empat minit itu bermakna', 'Bawa ucapan ke media sosial, di mana tiada jam'],
    results: [
      'Perkara tatatertib diterima, sebahagian, dan anda diberi tujuh minit. Ia digunakan dengan baik.',
      'Empat minit itu singkat dan tajam, dan Speaker berterima kasih kerana ringkas, yang bukan pujian.',
      'Ucapan disiarkan, dan ditonton ramai anak muda, dan seorang ahli Parlimen tua berkata ia “bukan ucapan”.',
    ],
  },
  constituencyClinic: {
    title: 'Klinik yang ditutup',
    body: 'Satu-satunya klinik di daerah ditutup kerana kekurangan doktor, dan kerajaan berkata ia akan dibuka semula “pada masanya”. Pejabat anda penuh dengan orang yang demam dan bertanya.',
    options: ['Biayai klinik bergerak daripada dana parti', 'Desak kerajaan di khalayak membukanya semula', 'Adakan sesi bergambar di luar pintu yang tertutup'],
    results: [
      'Klinik bergerak datang, dan beberapa ratus dirawat dalam minggu pertama. Mereka ingat siapa yang menghantarnya.',
      'Kerajaan berjanji doktor menjelang Krismas, dan anda memastikan semua orang mendengarnya.',
      'Gambar itu bagus, dan daerah berkata “seronok difoto di luar klinik yang tutup”.',
    ],
  },
  ministryOffer: {
    title: 'Panggilan dari pejabat Perdana Menteri',
    body: 'Pejabat Perdana Menteri menelefon, dengan sopan sempurna, bertanya sama ada parti anda “terbuka untuk peranan dalam kerajaan”. Ia melibatkan kementerian, beberapa jabatan, dan kereta berbendera. Ia juga melibatkan banyak penjelasan kepada pengundi anda.',
    options: ['Buka rundingan, dan lihat apa yang ditawarkan', 'Tolak segera, dan katakan anda dalam pembangkang', 'Sebut harga lebih tinggi, dan lihat apa Perdana Menteri lakukan'],
    results: [
      'Rundingan dibuka. Ramai menyangka anda akan menyertai, dan pengundi anda mula bertanya untuk apa anda.',
      'Anda menolak. Pengundi anda lega, dan ahli anda yang mahukan kereta kecewa secara senyap.',
      ['Harga dipenuhi, sebahagian, dan anda mendapat perjanjian lebih baik dan peluang menolaknya.', 'Harga ditolak, dan Perdana Menteri berkata anda “tidak realistik”.'],
    ],
  },
  nicheCause: {
    title: 'Perjuangan yang hanya anda pikul',
    body: 'Parti anda satu-satunya yang mengangkat penjagaan jangka panjang untuk warga tua, perkara yang tiada orang lain nampak menarik. Ia tidak di muka depan setahun, dan tinjauan menunjukkan tiga daripada sepuluh pengundi menganggapnya penting.',
    options: ['Jadikan kempen anda, dan tekan kuat', 'Masukkan ke dalam agenda bersama pembangkang', 'Gugurkan untuk sesuatu yang lebih diperhatikan'],
    results: [
      'Kempen itu bertapak, perlahan-lahan, dan pengundi lebih tua berterima kasih. Ia bukan muka depan, tetapi permulaan.',
      'Ia dimasukkan. Pejabat ketua bermurah hati, dan perjuangan itu salah satu daripada sebelas dalam senarai.',
      'Anda menggugurkannya. Perjuangan itu hidup dalam ucapan orang lain, dan kreditnya milik mereka.',
    ],
  },
  donorSmall: {
    title: 'Tawaran penderma',
    body: 'Seorang ahli perniagaan yang tidak pernah anda temui menawarkan derma besar kepada parti anda. Dia tidak meminta apa-apa, yang, seperti diketahui setiap bendahari parti, harga yang sangat mahal. Dia ada firma yang membina sesuatu, dan dilihat berhampiran menteri kerja raya.',
    options: ['Terima wang, dan jangan bertanya', 'Terima separuh, dan siarkan nama dan jumlahnya', 'Tolak, dan nyatakan sebabnya'],
    results: [
      'Wang datang, dan habis cepat. Seorang wartawan menemui ahli perniagaan itu dalam sebulan.',
      'Anda menerima separuh, dan menyiarkannya, dan penderma malu, dan pengundi tidak.',
      'Anda menolak. Bendahari mengeluh, akhbar memuji anda, dan belanjawan kekal ketat.',
    ],
  },
  mergerInvite: {
    title: 'Jemputan untuk bergabung',
    body: 'Ketua pembangkang mencadangkan parti anda dan yang lebih besar bergabung, “demi alternatif bersatu”. Ia akan memberi anda bahagian jawatan teratas dan pengakhiran nama anda, dan parti yang lebih besar akan mendapatinya sangat mudah.',
    options: ['Buka rundingan penggabungan', 'Kekal bebas, dan katakan demikian', 'Cadangkan pakatan pilihan raya sebagai ganti penggabungan'],
    results: [
      'Rundingan bermula, dan separuh daripada ahli anda berkata mereka akan keluar jika ia berjalan baik.',
      'Anda kekal bebas. Ahli anda bangga, dan parti yang lebih besar dingin.',
      ['Pakatan dipersetujui, dan kedua-dua parti mengekalkan nama dan kerusi.', 'Pakatan ditolak, dan parti yang lebih besar berkata penggabungan atau tiada.'],
    ],
  },
  defectionYours: {
    title: 'Seorang daripada anda menyeberang',
    body: 'Salah seorang ahli Parlimen anda memberitahu dia akan ke bangku kerajaan, “demi kebaikan daerahnya”. Dia berkata dengan baik, dan di depan kamera, dan dia mengambil kerusi pejabat parti.',
    options: ['Pecat dia, dan katakan dengan lantang', 'Cuba memujuknya', 'Biarkan dia pergi, dan doakan yang baik'],
    results: [
      'Dia dipecat. Parti dilihat tegas, dan satu kerusi hilang.',
      ['Dia kekal, dan berterima kasih, dan agak malu, dan menjadi ahli lebih baik kerananya.', 'Dia pergi juga, dan pujukan itu dilihat, dan parti kelihatan lebih lemah.'],
      'Anda membiarkannya pergi. Dia pergi, dengan jabat tangan, dan akhbar berkata ia “bermaruah”, yang menyenangkan dan tidak begitu berguna.',
    ],
  },
  constituencyFlood: {
    title: 'Air di daerah anda',
    body: 'Sungai melimpah di daerah anda, dan seratus rumah tenggelam. Bantuan kerajaan, buat masa ini, janji. Penduduk berada di sekolah, dan pejabat anda ialah bangunan terdekat dengan telefon.',
    options: ['Biayai bantuan daripada dana parti sendiri', 'Desak kerajaan di khalayak untuk bantuan', 'Difoto dalam banjir, berkasut but'],
    results: [
      'Bantuan parti sampai dahulu, dan orang berkata demikian, dan dana parti lebih rendah kerananya.',
      'Anda mendesak bantuan. Ia tiba seminggu kemudian, dengan nama menteri pada kotak.',
      'Gambar itu bagus. Daerah perasan but itu, dan ketiadaan apa-apa lagi.',
    ],
  },
  localProtest: {
    title: 'Bantahan di daerah anda',
    body: 'Penduduk sebuah kampung mula membantah di luar kuari yang menggegarkan rumah mereka. Mereka ada poster, sepanduk dan pemukul gendang yang sangat baik. Seseorang memberitahu mereka anda bersimpati.',
    options: ['Sertai bantahan, dan bercakap', 'Nasihati pembantah, dan kekal berjarak', 'Kekal neutral, dan katakan ia urusan pihak berkuasa'],
    results: [
      'Anda menyertai, dan kampung menyukainya. Syarikat kuari menulis surat, dan seorang majistret menyemak undang-undang.',
      'Anda menasihati, dan pembantah menghormati anda kerananya, dan kuari berhenti, seminggu.',
      'Anda kekal neutral. Pembantah, yang menjangka seorang kawan, sopan dan kecewa.',
    ],
  },
  shadowPortfolio: {
    title: 'Tawaran portfolio bayangan',
    body: 'Ketua pembangkang menawarkan salah seorang ahli anda portfolio bayangan pembangunan luar bandar, jawatan dengan gelaran besar dan tiada belanjawan. Ia mengangkat. Ia juga cara ketua menjadikan parti anda sebahagian pasukan ketua.',
    options: ['Terima portfolio itu', 'Bertahan untuk yang lebih besar', 'Tolak, dan kekalkan suara parti anda sendiri'],
    results: [
      'Portfolio diterima, dan ahli anda berucap baik di Dewan, dan diucapkan terima kasih, dan salah seorang daripada ramai.',
      ['Ketua menawarkan yang lebih besar, dan parti anda rakan dan bukan tetamu.', 'Ketua menarik balik tawaran, dan memberi jawatan itu kepada orang lain, yang sangat gembira.'],
      'Anda menolak. Ahli anda bersetuju, dan pejabat ketua meletakkan nota dalam fail.',
    ],
  },
  mediaBlackout: {
    title: 'Kesenyapan akhbar',
    body: 'Parti anda tidak dalam berita sebulan. Editor berkata bukan salah mereka: ada perlawanan bola sepak, skandal dan seekor ikan yang sangat besar. Ahli anda mahu tahu mengapa tiada siapa bertanya pendapat mereka.',
    options: ['Beli iklan, dan dilihat', 'Cuba aksi yang akan tular', 'Kongsi pentas dengan ketua pembangkang, dan kongsi liputan'],
    results: [
      'Iklan tersiar, dan dilihat, dan tidak disukai. Bilnya, bagaimanapun, dibaca.',
      ['Aksi itu tular, dan parti dibincang atas sebab yang betul.', 'Aksi itu tular atas sebab yang salah, dan parti dibincang seminggu, dengan nada yang tidak dimahukan.'],
      'Pentas dikongsi. Ucapan ketua yang dipetik, dan nama parti anda di sepanduk.',
    ],
  },
  volunteerShortage: {
    title: 'Tiada orang untuk mengetuk pintu',
    body: 'Pilihan raya kecil menjelang, dan cawangan anda di daerah itu ada sebelas sukarelawan, enam daripadanya berumur tujuh puluh lebih, dan dua saudara calon. Tinjauan lima ribu rumah memerlukan lebih ramai.',
    options: ['Bayar elaun kepada pelajar dan pekerja sambilan', 'Rayu sukarelawan di media sosial', 'Kecilkan skop kempen, dan bertanding hanya di jalan terbaik'],
    results: [
      'Elaun membawa empat puluh pembantu, dan beberapa daripadanya, mengejutkan semua orang, menjadi ahli.',
      'Rayuan membawa bilangan mengejutkan anak muda, yang tahu menggunakan telefon dan tidak tahu menggunakan loceng pintu.',
      'Skop dikurangkan. Parti berjuang di jalan terbaik dengan baik, dan selebihnya tidak langsung.',
    ],
  },
  borrowedLogo: {
    title: 'Logo siapa pada kertas undi?',
    body: 'Ketua pembangkang berkata untuk berpeluang menentang kerajaan, calon anda perlu bertanding di bawah logo parti yang lebih besar, di beberapa kerusi. Ia akan membantu, dan bermakna nama anda tiada pada kertas undi.',
    options: ['Terima logo parti yang lebih besar di kerusi itu', 'Kekalkan logo anda, dan bertanding atas nama sendiri', 'Cadangkan logo bersama untuk pembangkang keseluruhannya'],
    results: [
      'Logo diterima. Kerusi lebih mudah dimenangi, dan parti anda, kata seorang ahli lama, “tidak lagi wujud di atas kertas”.',
      'Anda mengekalkan logo. Ahli anda bangga, dan parti yang lebih besar tidak, dan beberapa kerusi lebih sukar.',
      ['Logo bersama direka dan disukai, dan identiti bersama tumbuh.', 'Logo bersama tidak dipersetujui. Kedua-dua parti mula berbalah tentang warna.'],
    ],
  },
  trappedVote: {
    title: 'Undi yang memerangkap anda',
    body: 'Kerajaan membawa rang undang-undang yang ahli anda sokong secara prinsip, dan fasal yang mereka tidak tahan. Mengundi menyokongnya akan membantu kerajaan. Mengundi menentang akan nampak seperti anda menentang tujuan rang itu.',
    options: ['Mengundi untuk rang itu, dan katakan sebabnya', 'Mengundi menentang, dan terangkan fasal itu', 'Jauhkan diri, dan biar undi lalu tanpa anda'],
    results: [
      'Anda mengundi menyokongnya. Kerajaan berterima kasih, pengundi anda tidak pasti, dan pejabat ketua anda memberitahu apa yang difikirkannya.',
      'Anda mengundi menentang. Penjelasan itu panjang, dan orang hanya membaca tajuk, dan itu tidak mengapa.',
      'Anda menjauhkan diri. Semua orang perasan, dan tiada siapa dapat mengatakan apa yang anda perjuangkan.',
    ],
  },
  endorsement: {
    title: 'Sokongan para sesepuh',
    body: 'Sekumpulan sesepuh kampung yang dihormati berkata mereka akan menyokong parti anda di daerah itu, dengan syarat: anda melawat setiap kampung di daerah itu, dan makan sehidang di setiap satu. Ia, kata mereka, soal hormat.',
    options: ['Terima, dan lawat semuanya', 'Terima, dan minta program yang lebih kecil', 'Tolak sokongan itu, dan kekalkan rancangan anda sendiri'],
    results: [
      'Anda melawat setiap kampung, dan makan banyak hidangan. Sokongan diberi, dan diet tidak baik.',
      'Program dikurangkan, dan sokongan dikekalkan, dan para sesepuh, yang diberitahu tentang diet itu, bermurah hati.',
      'Anda menolak. Para sesepuh berbudi bahasa tentangnya, dan daerah membuat kesimpulan sendiri.',
    ],
  },
  councilWin: {
    title: 'Kemenangan di majlis tempatan',
    body: 'Parti anda memenangi kerusi mengejut dalam pilihan raya kecil majlis tempatan, di tempat anda tidak pernah berjaya. Ia perkara kecil, dan akhbar menyebutnya “tanda awal”. Ahli anda mahu berbuat sesuatu dengannya.',
    options: ['Membina atasnya, dengan pasukan untuk kerusi majlis dan gerakan tempatan', 'Tunjukkan, sebagai tanda arus', 'Merendah diri, dan biar ia bercakap sendiri'],
    results: [
      'Pasukan dihantar. Kerusi majlis ditadbir dengan baik, dan daerah mula memikirkan anda secara berbeza.',
      'Kemenangan itu ditunjukkan, dan akhbar memaparkannya, dan arus memang berpihak sedikit kepada anda.',
      'Anda merendah diri. Beberapa ahli merasa anda membiarkan cerita baik menjadi senyap.',
    ],
  },
};
