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
    title: 'Tak diajak berbincang',
    body: 'Ketua pembangkang adakan mesyuarat strategi untuk seluruh pembangkang, dan parti anda tak diberitahu. Anda tahu daripada gambar, di mana sebaris lelaki berbaju sama tengok papan putih.',
    options: ['Mengadu depan orang ramai sebab ditinggalkan', 'Diam, dan sertai senyap-senyap dari mesyuarat akan datang', 'Buat pelan sendiri, dan jemput mereka'],
    results: [
      'Aduan didengar. Pejabat ketua kata ia terlupa, dan letak anda dalam senarai, lepas tu di bahagian bawahnya.',
      'Anda sertai senyap-senyap, dan disambut dengan jabat tangan, dan kerusi sebelah pintu.',
      'Pelan anda sendiri bagus, dan diperhatikan. Pembangkang mula tertanya-tanya siapa ikut siapa.',
    ],
  },
  govtCourts: {
    title: 'Tawaran kerajaan untuk daerah anda',
    body: 'Kerajaan tawar projek jalan yang sangat besar ke daerah anda, benda yang anda minta bertahun-tahun. Tawaran tu tiba minggu yang sama dengan undi yang sokongan anda amat dialu-alukan. Tak ada pihak yang sebut kaitannya.',
    options: ['Terima projek tu, dengan syarat yang melekat', 'Tolak, dan kata daerah ni bukan untuk dijual', 'Ambil, dan terus kritik kerajaan macam biasa'],
    results: [
      'Projek diterima, dan daerah gembira. Pembangkang bercakap dengan anda dalam ayat pendek.',
      'Anda tolak. Daerah berbelah bahagi antara maruah dan lubang jalan, dan akhbar panggil ia “tindakan yang jarang”.',
      ['Anda ambil dan kritik, dan kerajaan biarkan, untuk tunjuk yang ia bermurah hati.', 'Anda ambil dan kritik, dan kerajaan kata ia dikhianati, dan projek tu disemak semula.'],
    ],
  },
  seatDealLead: {
    title: 'Cadangan perkongsian kerusi',
    body: 'Ketua pembangkang cadangkan parti anda, yang pegang kerusi di beberapa negeri, serahkan beberapa kerusi kepada parti yang lebih besar sebagai ganti beberapa yang lain. Angka dikira atas spreadsheet oleh orang yang tak pernah pergi ke kerusi tu.',
    options: ['Terima cadangan, dan serahkan kerusi', 'Bertahan untuk kerusi yang anda pegang', 'Cadangkan pertukaran lain, kerusi yang lebih sesuai untuk dua-dua parti'],
    results: [
      'Kerusi diserahkan. Parti yang lebih besar berterima kasih, dan ahli anda di kerusi tu tak.',
      'Anda bertahan. Ahli anda gembira, dan pejabat ketua kata ia “kecewa”, maksudnya geram.',
      ['Pertukaran diterima, perjanjian yang baik untuk dua-dua, dan ditunjuk atas spreadsheet yang sama.', 'Pertukaran ditolak, dan parti yang lebih besar kata ia “tawaran bermurah hati”.'],
    ],
  },
  swingVotes: {
    title: 'Undi anda tentukan undian',
    body: 'Rang undang-undang di Dewan akan sangat tipis, dan ahli parti anda, yang sikit, akan menentukannya. Dua-dua pihak dah telefon. Satu tawar dana pembangunan. Satu lagi tawar ucapan.',
    options: ['Jual undi anda mahal, kepada penawar tertinggi', 'Mengundi ikut hati nurani dan pengundi anda', 'Berkecuali, dan kata anda atas semua tu'],
    results: [
      'Undi dijual. Dana tu baik, rang diluluskan, dan nama anda dalam akhbar sebelah perkataan “harga”.',
      'Anda undi ikut yang terbaik, dan undian menang atau kalah dengan margin sangat tipis sampai dua-dua pihak salahkan anda.',
      'Anda berkecuali. Dua-dua pihak marah, dan pengundi tak nampak apa yang anda perjuangkan.',
    ],
  },
  speakingTime: {
    title: 'Tak ada masa bercakap',
    body: 'Dalam perbahasan bajet, masa untuk ucapan dibahagi ikut saiz parti. Parti anda kecil, dan dapat empat minit, antara dua ucapan sejam setiap satu.',
    options: ['Bangkitkan perkara tatatertib, dan minta masa adil', 'Terima, dan buat empat minit tu bermakna', 'Bawa ucapan ke media sosial, di mana tak ada jam'],
    results: [
      'Perkara tatatertib diterima, sebahagian, dan anda diberi tujuh minit. Digunakan dengan baik.',
      'Empat minit tu singkat dan tajam, dan Speaker berterima kasih sebab ringkas, yang bukan pujian.',
      'Ucapan disiarkan, ditonton ramai anak muda, dan seorang ahli Parlimen tua kata ia “bukan ucapan”.',
    ],
  },
  constituencyClinic: {
    title: 'Klinik yang ditutup',
    body: 'Satu-satunya klinik di daerah ditutup sebab kekurangan doktor, dan kerajaan kata ia akan dibuka semula “pada masanya”. Pejabat anda penuh dengan orang yang demam dan bertanya.',
    options: ['Biayai klinik bergerak daripada dana parti', 'Desak kerajaan depan orang ramai supaya buka semula', 'Adakan sesi bergambar di luar pintu yang tertutup'],
    results: [
      'Klinik bergerak datang, dan beberapa ratus dirawat dalam minggu pertama. Mereka ingat siapa yang hantar.',
      'Kerajaan janji doktor menjelang Krismas, dan anda pastikan semua orang dengar.',
      'Gambar tu bagus, dan daerah kata “seronok kena foto di luar klinik yang tutup”.',
    ],
  },
  ministryOffer: {
    title: 'Panggilan dari pejabat Perdana Menteri',
    body: 'Pejabat Perdana Menteri telefon, dengan sopan sempurna, tanya sama ada parti anda “terbuka untuk peranan dalam kerajaan”. Ia melibatkan kementerian, beberapa jabatan, dan kereta berbendera. Ia juga melibatkan banyak penjelasan kepada pengundi anda.',
    options: ['Buka rundingan, dan tengok apa yang ditawar', 'Tolak serta-merta, dan kata anda dalam pembangkang', 'Sebut harga lebih tinggi, dan tengok apa Perdana Menteri buat'],
    results: [
      'Rundingan dibuka. Ramai sangka anda akan sertai, dan pengundi anda mula tanya untuk apa anda wujud.',
      'Anda tolak. Pengundi anda lega, dan ahli anda yang nakkan kereta kecewa senyap-senyap.',
      ['Harga dipenuhi, sebahagian, dan anda dapat perjanjian lebih baik dan peluang untuk menolaknya.', 'Harga ditolak, dan Perdana Menteri kata anda “tak realistik”.'],
    ],
  },
  nicheCause: {
    title: 'Perjuangan yang hanya anda pikul',
    body: 'Parti anda satu-satunya yang angkat penjagaan jangka panjang untuk warga tua, benda yang tak ada orang lain nampak menarik. Dah setahun tak masuk muka depan, dan tinjauan tunjuk tiga daripada sepuluh pengundi anggap ia penting.',
    options: ['Jadikan kempen anda, dan tekan kuat', 'Masukkan ke dalam agenda bersama pembangkang', 'Gugurkan untuk sesuatu yang lebih mendapat perhatian'],
    results: [
      'Kempen bertapak, perlahan-lahan, dan pengundi yang lebih tua berterima kasih. Bukan muka depan, tapi permulaan.',
      'Ia dimasukkan. Pejabat ketua bermurah hati, dan perjuangan tu salah satu daripada sebelas dalam senarai.',
      'Anda gugurkan. Perjuangan tu hidup dalam ucapan orang lain, dan kreditnya milik mereka.',
    ],
  },
  donorSmall: {
    title: 'Tawaran penderma',
    body: 'Seorang ahli perniagaan yang anda tak pernah jumpa tawar derma besar kepada parti anda. Dia tak minta apa-apa, yang, macam setiap bendahari parti tahu, harga yang sangat mahal. Dia ada firma yang bina benda, dan nampak dekat menteri kerja raya.',
    options: ['Terima duit, dan jangan tanya', 'Terima separuh, dan siarkan nama dan jumlahnya', 'Tolak, dan nyatakan sebabnya'],
    results: [
      'Duit datang, dan habis cepat. Seorang wartawan jumpa ahli perniagaan tu dalam sebulan.',
      'Anda terima separuh, dan siarkan, dan penderma malu, pengundi tak.',
      'Anda tolak. Bendahari mengeluh, akhbar puji anda, dan bajet kekal ketat.',
    ],
  },
  mergerInvite: {
    title: 'Jemputan untuk bergabung',
    body: 'Ketua pembangkang cadangkan parti anda dan yang lebih besar bergabung, “demi alternatif bersatu”. Anda akan dapat bahagian jawatan teratas dan nama anda berakhir, dan parti yang lebih besar akan rasa ia sangat mudah.',
    options: ['Buka rundingan penggabungan', 'Kekal bebas, dan umumkan', 'Cadangkan pakatan pilihan raya sebagai ganti penggabungan'],
    results: [
      'Rundingan bermula, dan separuh daripada ahli anda kata mereka akan keluar kalau ia berjalan baik.',
      'Anda kekal bebas. Ahli anda bangga, dan parti yang lebih besar dingin.',
      ['Pakatan dipersetujui, dan dua-dua parti kekalkan nama dan kerusi.', 'Pakatan ditolak, dan parti yang lebih besar kata penggabungan atau tak ada langsung.'],
    ],
  },
  defectionYours: {
    title: 'Seorang daripada anda melompat',
    body: 'Salah seorang ahli Parlimen anda beritahu dia akan ke bangku kerajaan, “demi kebaikan daerahnya”. Dia cakap dengan baik, depan kamera, dan dia ambil kerusi pejabat parti sekali.',
    options: ['Pecat dia, dan umumkan kuat-kuat', 'Cuba pujuk dia', 'Biar dia pergi, dan doakan yang baik'],
    results: [
      'Dia dipecat. Parti nampak tegas, dan satu kerusi hilang.',
      ['Dia kekal, dan berterima kasih, dan agak malu, dan jadi ahli yang lebih baik.', 'Dia pergi juga, dan pujukan tu dilihat orang, dan parti nampak lebih lemah.'],
      'Anda biar dia pergi. Dia pergi, dengan jabat tangan, dan akhbar kata ia “bermaruah”, yang menyenangkan tapi tak berapa berguna.',
    ],
  },
  constituencyFlood: {
    title: 'Air di daerah anda',
    body: 'Sungai melimpah di daerah anda, dan seratus rumah tenggelam. Bantuan kerajaan, buat masa ni, janji saja. Penduduk di sekolah, dan pejabat anda bangunan terdekat yang ada telefon.',
    options: ['Biayai bantuan daripada dana parti sendiri', 'Desak kerajaan depan orang ramai untuk bantuan', 'Kena foto dalam banjir, berkasut but'],
    results: [
      'Bantuan parti sampai dulu, orang cakap macam tu, dan dana parti jadi lebih rendah.',
      'Anda desak bantuan. Ia tiba seminggu kemudian, dengan nama menteri pada kotak.',
      'Gambar tu bagus. Daerah perasan kasut but tu, dan tak ada benda lain.',
    ],
  },
  localProtest: {
    title: 'Bantahan di daerah anda',
    body: 'Penduduk sebuah kampung mula membantah di luar kuari yang menggegarkan rumah mereka. Mereka ada poster, sepanduk dan pemukul gendang yang sangat hebat. Ada orang beritahu mereka anda bersimpati.',
    options: ['Sertai bantahan, dan bercakap', 'Nasihati pembantah, dan kekal berjarak', 'Kekal neutral, dan kata ini urusan pihak berkuasa'],
    results: [
      'Anda sertai, dan kampung suka. Syarikat kuari tulis surat, dan seorang majistret semak undang-undang.',
      'Anda nasihati, dan pembantah hormati anda sebab tu, dan kuari berhenti, seminggu.',
      'Anda kekal neutral. Pembantah, yang jangka seorang kawan, sopan tapi kecewa.',
    ],
  },
  shadowPortfolio: {
    title: 'Tawaran portfolio bayangan',
    body: 'Ketua pembangkang tawar salah seorang ahli anda portfolio bayangan pembangunan luar bandar, jawatan dengan gelaran besar dan tak ada bajet. Menyanjung. Ia juga cara ketua jadikan parti anda sebahagian pasukan ketua.',
    options: ['Terima portfolio tu', 'Bertahan untuk yang lebih besar', 'Tolak, dan kekalkan suara parti anda sendiri'],
    results: [
      'Portfolio diterima, ahli anda berucap baik di Dewan, diucap terima kasih, dan salah seorang daripada ramai.',
      ['Ketua tawar yang lebih besar, dan parti anda rakan, bukan tetamu.', 'Ketua tarik balik tawaran, dan beri jawatan tu kepada orang lain, yang sangat gembira.'],
      'Anda tolak. Ahli anda setuju, dan pejabat ketua letak nota dalam fail.',
    ],
  },
  mediaBlackout: {
    title: 'Akhbar senyap',
    body: 'Parti anda tak masuk berita sebulan. Editor kata bukan salah mereka: ada perlawanan bola sepak, skandal dan seekor ikan yang sangat besar. Ahli anda nak tahu kenapa tak ada siapa tanya pendapat mereka.',
    options: ['Beli iklan, dan nampak', 'Cuba aksi yang akan viral', 'Kongsi pentas dengan ketua pembangkang, dan kongsi liputan'],
    results: [
      'Iklan tersiar, dilihat, tapi tak disukai. Bilnya, bagaimanapun, dibaca.',
      ['Aksi tu viral, dan parti dibincang atas sebab yang betul.', 'Aksi tu viral atas sebab yang salah, dan parti dibincang seminggu, dengan nada yang tak dimahukan.'],
      'Pentas dikongsi. Ucapan ketua yang dipetik, dan nama parti anda di sepanduk.',
    ],
  },
  volunteerShortage: {
    title: 'Tak ada orang nak ketuk pintu',
    body: 'Pilihan raya kecil menjelang, dan cawangan anda di daerah tu ada sebelas sukarelawan, enam daripadanya berumur tujuh puluh lebih, dan dua saudara calon. Tinjauan lima ribu rumah perlukan lebih ramai.',
    options: ['Bayar elaun kepada pelajar dan pekerja sambilan', 'Rayu sukarelawan di media sosial', 'Kecilkan skop kempen, dan bertanding hanya di jalan terbaik'],
    results: [
      'Elaun bawa empat puluh pembantu, dan beberapa daripadanya, di luar jangkaan, jadi ahli.',
      'Rayuan bawa ramai anak muda yang mengejutkan, yang tahu guna telefon tapi tak tahu guna loceng pintu.',
      'Skop dikurangkan. Parti berjuang di jalan terbaik dengan baik, dan selebihnya langsung tak.',
    ],
  },
  borrowedLogo: {
    title: 'Logo siapa pada kertas undi?',
    body: 'Ketua pembangkang kata untuk ada peluang menentang kerajaan, calon anda patut bertanding di bawah logo parti yang lebih besar, di beberapa kerusi. Ia akan membantu, dan maksudnya nama anda tak ada pada kertas undi.',
    options: ['Terima logo parti yang lebih besar di kerusi tu', 'Kekalkan logo anda, dan bertanding atas nama sendiri', 'Cadangkan logo bersama untuk pembangkang keseluruhannya'],
    results: [
      'Logo diterima. Kerusi lebih mudah dimenangi, dan parti anda, kata seorang ahli lama, “dah tak wujud atas kertas”.',
      'Anda kekalkan logo. Ahli anda bangga, parti yang lebih besar tak, dan beberapa kerusi lebih susah.',
      ['Logo bersama direka dan disukai, dan identiti bersama tumbuh.', 'Logo bersama tak dipersetujui. Dua-dua parti mula berbalah pasal warna.'],
    ],
  },
  trappedVote: {
    title: 'Undi yang memerangkap anda',
    body: 'Kerajaan bawa rang undang-undang yang ahli anda sokong secara prinsip, dan satu fasal yang mereka tak tahan. Mengundi menyokong akan bantu kerajaan. Mengundi menentang akan nampak macam anda menentang tujuan rang tu.',
    options: ['Undi untuk rang tu, dan terangkan sebabnya', 'Undi menentang, dan terangkan fasal tu', 'Jauhkan diri, dan biar undi lalu tanpa anda'],
    results: [
      'Anda undi menyokong. Kerajaan berterima kasih, pengundi anda tak pasti, dan pejabat ketua anda beritahu apa yang difikirkannya.',
      'Anda undi menentang. Penjelasan panjang, orang baca tajuk saja, dan itu tak mengapa.',
      'Anda jauhkan diri. Semua orang perasan, dan tak ada siapa boleh cakap apa yang anda perjuangkan.',
    ],
  },
  endorsement: {
    title: 'Sokongan orang tua-tua',
    body: 'Sekumpulan orang tua-tua kampung yang dihormati kata mereka akan sokong parti anda di daerah tu, dengan satu syarat: anda lawat setiap kampung di daerah tu, dan makan sehidang di setiap satu. Ia, kata mereka, soal hormat.',
    options: ['Terima, dan lawat semuanya', 'Terima, dan minta program yang lebih kecil', 'Tolak sokongan tu, dan kekalkan rancangan sendiri'],
    results: [
      'Anda lawat setiap kampung, dan makan banyak hidangan. Sokongan diberi, tapi diet tak elok.',
      'Program dikurangkan, sokongan dikekalkan, dan orang tua-tua, yang dah diberitahu pasal diet, bermurah hati.',
      'Anda tolak. Orang tua-tua berbudi bahasa pasal tu, dan daerah buat kesimpulan sendiri.',
    ],
  },
  councilWin: {
    title: 'Menang di majlis tempatan',
    body: 'Parti anda menang kerusi mengejut dalam pilihan raya kecil majlis tempatan, di tempat yang anda tak pernah berjaya. Perkara kecil, dan akhbar panggil ia “tanda awal”. Ahli anda nak buat sesuatu dengannya.',
    options: ['Bina atasnya, dengan pasukan untuk kerusi majlis dan gerakan tempatan', 'Tunjukkan, sebagai tanda arus', 'Merendah diri, dan biar ia bercakap sendiri'],
    results: [
      'Pasukan dihantar. Kerusi majlis ditadbir dengan baik, dan daerah mula fikir tentang anda dengan cara lain.',
      'Kemenangan ditunjuk, akhbar paparkan, dan arus memang berpihak sikit kepada anda.',
      'Anda merendah diri. Beberapa ahli rasa anda biarkan cerita baik jadi senyap.',
    ],
  },
};
