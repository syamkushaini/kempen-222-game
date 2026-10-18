import type { EventText } from './events';

// What lands on the desk of a partner in a government it does not lead, in English and Bahasa Malaysia. Every person, company
// and body in them is invented. A result written as a pair is for a gamble: what is reported if it comes off, then if it does not.

export const PARTNER_EVENTS_EN: Record<string, EventText> = {
  juniorCredit: {
    title: 'Whose scheme is it?',
    body: 'The Prime Minister has launched a popular scheme, with a ribbon, a banner and a speech that did not mention that it began as a proposal from your party. Your ministers drafted it, your officials cost it, and your name is in the footnotes.',
    options: ['Say so in public', 'Share the credit warmly, and let the Prime Minister lead', 'Say nothing, and hope the voters read footnotes'],
    results: [
      'The papers ran the story under “Partner claims scheme”. The Prime Minister’s office called it “a misunderstanding” in a tone that was not.',
      'The credit was shared at a joint press conference. The Prime Minister was gracious, and noted it.',
      'The voters did not read the footnotes. The scheme became the Prime Minister’s, and your party found itself congratulating it.',
    ],
  },
  postsForMine: {
    title: 'A post for your people',
    body: 'The Prime Minister has offered your party a deputy ministry and an ambassadorship, which your members think is a poor return on twenty seats. A senior member has been heard to say that the offer was “generous, for a mouse”.',
    options: ['Accept what is offered, and say thank you', 'Hold out for a full ministry', 'Threaten to leave the government'],
    results: [
      'The posts were accepted. Your members grumbled and then started to fill them, which was the sensible thing.',
      ['You held out and the ministry came, after a pause that felt like a fortnight.', 'You held out, and the Prime Minister said that the offer was withdrawn.'],
      'The threat was heard, and taken seriously. It made the government nervous, the Prime Minister unfriendly and your members, to their surprise, proud.',
    ],
  },
  outvoted: {
    title: 'Outvoted in cabinet',
    body: 'Your minister argued at length against a measure, and lost, eleven to two. The decision has been announced as a collective one. Your party’s members are waiting to see whether you will own it.',
    options: ['Accept collective responsibility, and defend it', 'Say publicly that your minister dissented', 'Have your minister step down in protest'],
    results: [
      'You defended it. The Prime Minister was grateful, and your members had a poor week.',
      'The dissent was reported, and became the story of the day. The Prime Minister said that it was “a healthy sign”, which was not a compliment.',
      'The minister resigned, with a letter that was short and clear. The government wobbled, and your party was called principled and troublesome in the same sentence.',
    ],
  },
  unpopularBill: {
    title: 'A bill your voters dislike',
    body: 'The government will bring a bill to the House that your voters will hate: a new charge that falls hardest on the districts where your party is strong. The Prime Minister’s office has phoned to ask how many of your members will vote for it.',
    options: ['Whip your members to vote for it', 'Allow a free vote', 'Vote against, and let the government count the cost'],
    results: [
      'Your members voted yes, with the faces of people eating a very large chilli.',
      'The vote was free, your members voted as they liked, and the Prime Minister was not best pleased and not best placed to say so.',
      'You voted against, and the government carried the bill without you, which it did with relish.',
    ],
  },
  crossoverOffer: {
    title: 'An offer from the other side',
    body: 'Someone close to the leader of the opposition has told you, over a long lunch, that the opposition would offer your party the leading role in a new alliance if you left the government. Nothing was written down, and nothing was refused.',
    options: ['Decline, and say so publicly', 'Open secret talks to see what is on offer', 'Tell the Prime Minister at once'],
    results: [
      'The refusal was loud and clear. The Prime Minister was grateful, and the opposition said it had not made an offer.',
      ['The talks produced a very good offer, which you kept in your pocket for later.', 'The talks leaked, and the Prime Minister asked for an explanation in a voice that did not need to be raised.'],
      'The Prime Minister was grateful, and the opposition was very annoyed, and did not mention the lunch again.',
    ],
  },
  partnerMinisterRow: {
    title: 'Your minister in the headlines',
    body: 'One of your party’s ministers has been photographed at an event that he should not have gone to, in a car that is not a ministerial one. The Prime Minister’s office has not said anything, which is a message of its own.',
    options: ['Defend the minister, and attack the photographer', 'Ask the minister to step aside', 'Move the minister to another post, quietly'],
    results: [
      'Your defence was loud, and the story lasted three days longer for it. The Prime Minister was not delighted.',
      'The minister stepped aside, and your party was spoken of as serious. The minister has not forgiven you.',
      'The move was made, and the papers called it “a reshuffle” and nobody was fooled, or minded.',
    ],
  },
  allocationFight: {
    title: 'The development allocations',
    body: 'The new allocations for roads, clinics and schools have been announced, and your party’s districts have been given a good deal less than the Prime Minister’s party’s. The explanation, in a footnote, is “technical reasons”.',
    options: ['Demand fairness in public', 'Accept it, and say nothing', 'Negotiate a quiet deal for your districts, on the side'],
    results: [
      'The demand was heard by everybody. The Prime Minister’s party said it would look into it, which is how a promise to forget sounds.',
      'You accepted, and your own members have started to wonder what the partnership is for.',
      'The deal was done in a back room. Your districts did a little better, and the room was later described to a newspaper.',
    ],
  },
  posterLogo: {
    title: 'Whose logo goes first',
    body: 'A joint poster for the government’s achievements has been designed, and the order in which the parties’ logos appear has become, for two weeks, the most serious subject in the coalition. Your logo has been put at the bottom, in a smaller size.',
    options: ['Insist on a fair order and a fair size', 'Accept it, and keep the peace', 'Suggest rotating the order on each poster'],
    results: [
      'The order was changed, with an air of great generosity, and your members were pleased out of all proportion.',
      'The poster went up. Your logo was at the bottom, and your members have measured it.',
      'The rotation was accepted. There were forty posters, and everybody counted the number in which they came first.',
    ],
  },
  mergerOffer: {
    title: 'An offer to merge',
    body: 'The Prime Minister’s party has suggested, in the warmest terms, that your two parties merge, “for the sake of stability”. It would offer you good posts. It would also, as a lawyer in your party points out, offer you the end of your party.',
    options: ['Open talks on a merger', 'Refuse, politely and finally', 'Propose a federation of two parties, which would keep your name'],
    results: [
      'The talks began. Your members did not like the word “merger”, and your members who did were not the ones who counted.',
      'The refusal was polite and final. The Prime Minister’s party took it with grace, and noted it.',
      ['The federation was welcomed, and both sides found it useful.', 'The federation was seen through as a merger in a coat, and was refused.'],
    ],
  },
  trailingInCoalition: {
    title: 'Sinking with the ship',
    body: 'The polls show your party’s support falling faster than the government’s. Your members say that it is being blamed for decisions it did not make, and that voters cannot tell the partners from the Prime Minister’s party, except by the logo in the corner.',
    options: ['Put some distance between your party and the government', 'Stay loyal, and ask the voters to be patient', 'Pick the issues you will stand apart on, and say which'],
    results: [
      'The distance was put. The government was unhappy, and your voters, for once, could tell you apart.',
      'Loyalty was kept, and so was the polling number, and your members have started to read the word “loyalty” more carefully.',
      'The issues were chosen with care. The coalition grumbled and held, and your voters found something to point at.',
    ],
  },
  budgetShare: {
    title: 'The share of the budget',
    body: 'The budget for your party’s ministries is to be cut by a tenth, to pay for what the Prime Minister’s party calls “shared priorities”. Your minister has produced a table to show that the cut is not shared, and has put it in the minister’s own pocket, since nobody else would read it.',
    options: ['Fight the cut in cabinet', 'Accept it, in the spirit of the partnership', 'Trade it for a promise on next year’s budget'],
    results: [
      'The fight was won in part, and lost in part, and was long. Your members saw you fight, and the Prime Minister did too.',
      'The cut was accepted. The ministry’s officials have started to look for a way to make the cut disappear.',
      ['The promise was kept, and the ministry was made whole a year later.', 'The promise was forgotten, as promises about next year’s budgets are.'],
    ],
  },
  coalitionSummit: {
    title: 'The coalition summit',
    body: 'The partners are invited to a summit at a hotel, to show unity. It will be the usual: a long table, a short communiqué and a group photograph in which everybody stands next to the person they like least.',
    options: ['Attend, and show a united front', 'Attend, and air your grievances at the table', 'Send a deputy'],
    results: [
      'The photograph was taken, and the communiqué said that the coalition was “stronger than ever”, which it always does.',
      'The grievances were aired. The summit ran an hour late, and the communiqué said the coalition was “frank”.',
      'Your deputy attended. The Prime Minister noticed who was in the photograph, and who was not.',
    ],
  },
  stateSeatSwap: {
    title: 'Seats in a state election',
    body: 'A state election is on the way, and the Prime Minister’s party wants to contest more seats in a state where your party has always held a few. It offers you the choice of other seats elsewhere. Your members in the state have said what they think of other seats elsewhere.',
    options: ['Give up the seats it asks for', 'Bargain for a fair swap', 'Refuse, and contest all your seats'],
    results: [
      'The seats were given up. The Prime Minister’s party was gracious, and your members in the state wrote to the newspaper.',
      ['The swap was fair, and both sides were quietly pleased.', 'The bargaining failed, and the Prime Minister’s party said it had been “disappointed”.'],
      'You contested all of them. The Prime Minister’s party was very annoyed, and your members in the state were very pleased, which was the point.',
    ],
  },
  leverageFile: {
    title: 'A file about the Prime Minister’s party',
    body: 'A member of your party has put in your hands a file about a minister of the Prime Minister’s party: some invoices, a few emails and a photograph with a very large cake. It is not a matter of law, as such, but it would not look good on the front page.',
    options: ['Take it to the Prime Minister in private', 'Leak it, and let the matter take its course', 'Keep it, and say nothing'],
    results: [
      'The Prime Minister was grateful, and the minister was moved. Nothing was said in public, and a great deal was understood in private.',
      ['The story ran, the minister fell, and your party was thanked by the voters, who always like a story.', 'The story ran, and it was traced back to you, and the Prime Minister has started to speak to you in the third person.'],
      'You kept it. It is in a drawer, and the drawer has a lock, and the lock has a key that people know about.',
    ],
  },
  honoursList: {
    title: 'The honours list',
    body: 'The honours list is being drawn up, and the Prime Minister’s office has invited each partner to submit names. Your members have a great many names, and a surprising number of them are members.',
    options: ['Submit your names', 'Decline to submit any, on principle', 'Reward your people in other ways, quietly'],
    results: [
      'The names went in. Eleven were accepted, and your members were pleased, and the voters were not told.',
      'You declined. The papers called it principled, and the members called it something else.',
      'The rewards were quiet, and nobody was told, which in a party is the same as nobody being thanked.',
    ],
  },
  restlessMembers: {
    title: 'Members who want out',
    body: 'A group of your members says that the party has spent too long in government and has too little to show for it. They have started to hold their own meetings, and have asked, in a note, for “a conversation about the future”.',
    options: ['Hold them with promises of posts and projects', 'Let some of them go, and keep those who stay', 'Call a party retreat, and talk it out'],
    results: [
      'The promises held for a while, which was what they were for.',
      'A few left, with a great many words, and the party was smaller and quieter, which was, to some, a relief.',
      'The retreat was long, and it ended with a document, and a dinner, which was the best part.',
    ],
  },
};

export const PARTNER_EVENTS_MS: Record<string, EventText> = {
  juniorCredit: {
    title: 'Skim siapa ni?',
    body: 'Perdana Menteri lancarkan skim popular, dengan reben, sepanduk dan ucapan yang tak sebut pun ia bermula sebagai cadangan parti anda. Menteri anda yang rangka, pegawai anda yang kira kosnya, dan nama anda ada dalam nota kaki.',
    options: ['Cakap terus depan orang ramai', 'Kongsi kredit dengan mesra, dan biar Perdana Menteri mengetuai', 'Diam, dan harap pengundi baca nota kaki'],
    results: [
      'Akhbar siarkan cerita tu bertajuk “Rakan tuntut skim”. Pejabat Perdana Menteri panggil ia “salah faham” dengan nada yang bukan begitu.',
      'Kredit dikongsi dalam sidang media bersama. Perdana Menteri nampak bermurah hati, tapi dia tetap ingat.',
      'Pengundi tak baca nota kaki. Skim tu jadi milik Perdana Menteri, dan parti anda tengok-tengok dah ucap tahniah kepadanya.',
    ],
  },
  postsForMine: {
    title: 'Jawatan untuk orang anda',
    body: 'Perdana Menteri tawar parti anda jawatan timbalan menteri dan duta, yang ahli anda rasa pulangan kecil untuk dua puluh kerusi. Seorang ahli kanan kedengaran kata tawaran tu “murah hati, untuk seekor tikus”.',
    options: ['Terima apa yang ditawar, dan ucap terima kasih', 'Bertahan untuk kementerian penuh', 'Ugut nak keluar daripada kerajaan'],
    results: [
      'Jawatan diterima. Ahli anda merungut dulu, lepas tu mula isi jawatan tu, yang memang bijak.',
      ['Anda bertahan dan kementerian tu datang, selepas jeda yang rasa macam dua minggu.', 'Anda bertahan, dan Perdana Menteri kata tawaran tu ditarik balik.'],
      'Ugutan tu didengar, dan diambil serius. Ia buat kerajaan gementar, Perdana Menteri tak mesra dan ahli anda, tak sangka, bangga.',
    ],
  },
  outvoted: {
    title: 'Kalah dalam kabinet',
    body: 'Menteri anda berhujah panjang menentang satu langkah, dan kalah, sebelas lawan dua. Keputusan diumumkan sebagai keputusan bersama. Ahli parti anda tunggu sama ada anda nak terima.',
    options: ['Terima tanggungjawab bersama, dan pertahankannya', 'Kata depan orang ramai menteri anda tak setuju', 'Minta menteri anda berundur sebagai bantahan'],
    results: [
      'Anda pertahankannya. Perdana Menteri berterima kasih, dan ahli anda ada minggu yang teruk.',
      'Ketidaksetujuan tu dilaporkan, dan jadi cerita hari tu. Perdana Menteri kata ia “tanda sihat”, yang bukan pujian.',
      'Menteri tu letak jawatan, dengan surat yang ringkas dan jelas. Kerajaan goyah, dan parti anda dipanggil berprinsip dan menyusahkan dalam satu ayat.',
    ],
  },
  unpopularBill: {
    title: 'Rang undang-undang yang pengundi anda tak suka',
    body: 'Kerajaan akan bawa rang undang-undang ke Dewan yang pengundi anda akan benci: caj baharu yang paling kena di daerah tempat parti anda kuat. Pejabat Perdana Menteri telefon tanya berapa ramai ahli anda akan undi.',
    options: ['Arahkan ahli anda undi menyokong', 'Benarkan undi bebas', 'Undi menentang, dan biar kerajaan kira kosnya'],
    results: [
      'Ahli anda undi ya, dengan muka orang makan cili yang sangat besar.',
      'Undi bebas, ahli anda undi ikut suka, dan Perdana Menteri tak berapa gembira dan tak berada dalam kedudukan nak cakap.',
      'Anda undi menentang, dan kerajaan lulus rang tu tanpa anda, dengan seronok.',
    ],
  },
  crossoverOffer: {
    title: 'Tawaran dari seberang',
    body: 'Seseorang yang rapat dengan ketua pembangkang beritahu anda, masa makan tengah hari yang panjang, yang pembangkang akan tawar parti anda peranan utama dalam pakatan baharu kalau anda keluar daripada kerajaan. Tak ada apa ditulis, dan tak ada apa ditolak.',
    options: ['Tolak, dan umumkan', 'Buka rundingan rahsia untuk tengok apa yang ditawar', 'Beritahu Perdana Menteri segera'],
    results: [
      'Penolakan lantang dan jelas. Perdana Menteri berterima kasih, dan pembangkang kata ia tak pernah buat tawaran.',
      ['Rundingan hasilkan tawaran yang sangat baik, yang anda simpan dalam poket untuk kemudian.', 'Rundingan bocor, dan Perdana Menteri minta penjelasan dengan suara yang tak perlu ditinggikan.'],
      'Perdana Menteri berterima kasih, dan pembangkang sangat marah, dan tak sebut makan tengah hari tu lagi.',
    ],
  },
  partnerMinisterRow: {
    title: 'Menteri anda dalam berita',
    body: 'Salah seorang menteri parti anda kena foto di majlis yang tak sepatutnya dia hadir, dalam kereta yang bukan kereta rasmi. Pejabat Perdana Menteri tak cakap apa-apa, yang itu sendiri satu mesej.',
    options: ['Pertahankan menteri, dan serang jurugambar', 'Minta menteri tu ketepikan diri', 'Pindahkan menteri ke jawatan lain, senyap-senyap'],
    results: [
      'Pembelaan anda lantang, dan cerita tu bertahan tiga hari lebih lama sebabnya. Perdana Menteri tak berapa gembira.',
      'Menteri tu ketepikan diri, dan parti anda disebut serius. Menteri tu belum maafkan anda.',
      'Pemindahan dibuat, dan akhbar panggil ia “rombakan” dan tak ada siapa tertipu, atau kisah.',
    ],
  },
  allocationFight: {
    title: 'Peruntukan pembangunan',
    body: 'Peruntukan baharu untuk jalan, klinik dan sekolah diumumkan, dan daerah parti anda dapat jauh lebih sikit daripada daerah parti Perdana Menteri. Penjelasannya, dalam nota kaki, ialah “sebab teknikal”.',
    options: ['Tuntut keadilan depan orang ramai', 'Terima, dan diam', 'Runding perjanjian senyap untuk daerah anda, di tepi'],
    results: [
      'Tuntutan tu didengar semua orang. Parti Perdana Menteri kata ia akan siasat, bunyi macam janji untuk lupakan.',
      'Anda terima, dan ahli anda sendiri mula tertanya-tanya apa gunanya perkongsian ni.',
      'Perjanjian dibuat di bilik belakang. Daerah anda dapat sikit lebih baik, dan bilik tu kemudian diceritakan kepada akhbar.',
    ],
  },
  posterLogo: {
    title: 'Logo siapa dulu',
    body: 'Poster bersama untuk pencapaian kerajaan direka, dan susunan logo parti jadi, selama dua minggu, perkara paling serius dalam gabungan. Logo anda diletak di bawah, dengan saiz lebih kecil.',
    options: ['Berkeras untuk susunan dan saiz yang adil', 'Terima, dan jaga keamanan', 'Cadangkan susunan bergilir pada setiap poster'],
    results: [
      'Susunan diubah, dengan gaya sangat bermurah hati, dan ahli anda gembira tak terkira.',
      'Poster dipasang. Logo anda di bawah, dan ahli anda dah ukur.',
      'Giliran tu diterima. Ada empat puluh poster, dan semua orang kira berapa yang mereka berada dulu.',
    ],
  },
  mergerOffer: {
    title: 'Tawaran bergabung',
    body: 'Parti Perdana Menteri cadangkan, dengan kata-kata paling mesra, supaya dua parti bergabung, “demi kestabilan”. Ia akan tawar jawatan baik. Ia juga, macam yang ditunjukkan seorang peguam dalam parti anda, tawar pengakhiran parti anda.',
    options: ['Buka rundingan penggabungan', 'Tolak, dengan sopan dan muktamad', 'Cadangkan persekutuan dua parti, yang kekalkan nama anda'],
    results: [
      'Rundingan bermula. Ahli anda tak suka perkataan “penggabungan”, dan ahli yang suka bukan yang berpengaruh.',
      'Penolakan sopan dan muktamad. Parti Perdana Menteri terima dengan baik, dan catat.',
      ['Persekutuan disambut, dan dua-dua pihak dapati ia berguna.', 'Persekutuan tu dilihat sebagai penggabungan berkot, dan ditolak.'],
    ],
  },
  trailingInCoalition: {
    title: 'Tenggelam bersama kapal',
    body: 'Tinjauan tunjuk sokongan parti anda jatuh lebih cepat daripada kerajaan. Ahli anda kata ia dipersalahkan atas keputusan yang bukan ia buat, dan pengundi tak boleh bezakan rakan daripada parti Perdana Menteri, kecuali dengan logo di sudut.',
    options: ['Jauhkan sikit parti anda daripada kerajaan', 'Kekal setia, dan minta pengundi bersabar', 'Pilih isu yang anda nak berbeza, dan nyatakannya'],
    results: [
      'Jarak diletakkan. Kerajaan tak gembira, dan pengundi anda, buat pertama kali, boleh bezakan anda.',
      'Kesetiaan dikekalkan, angka tinjauan pun sama, dan ahli anda mula baca perkataan “kesetiaan” dengan lebih teliti.',
      'Isu dipilih dengan teliti. Gabungan merungut dan bertahan, dan pengundi anda dapat sesuatu untuk ditunjuk.',
    ],
  },
  budgetShare: {
    title: 'Bahagian bajet',
    body: 'Bajet untuk kementerian parti anda akan dipotong sepersepuluh, untuk bayar apa yang parti Perdana Menteri panggil “keutamaan bersama”. Menteri anda hasilkan jadual untuk tunjuk potongan tu tak dikongsi, dan simpan dalam poket sendiri, sebab tak ada orang lain nak baca.',
    options: ['Lawan potongan tu dalam kabinet', 'Terima, demi semangat perkongsian', 'Tukar dengan janji untuk bajet tahun depan'],
    results: [
      'Pertarungan dimenangi sebahagian, kalah sebahagian, dan panjang. Ahli anda tengok anda berjuang, Perdana Menteri pun sama.',
      'Potongan diterima. Pegawai kementerian mula cari cara nak buat ia hilang.',
      ['Janji ditepati, dan kementerian dipulihkan setahun kemudian.', 'Janji dilupakan, macam janji pasal bajet tahun depan selalunya.'],
    ],
  },
  coalitionSummit: {
    title: 'Sidang kemuncak gabungan',
    body: 'Rakan dijemput ke sidang kemuncak di sebuah hotel, untuk tunjuk perpaduan. Macam biasa: meja panjang, komunike pendek dan gambar kumpulan di mana semua orang berdiri sebelah orang yang paling mereka tak suka.',
    options: ['Hadir, dan tunjukkan barisan bersatu', 'Hadir, dan luahkan rungutan di meja', 'Hantar timbalan'],
    results: [
      'Gambar diambil, dan komunike kata gabungan “lebih kukuh daripada sebelumnya”, macam biasa.',
      'Rungutan diluahkan. Sidang kemuncak lewat sejam, dan komunike kata gabungan “berterus terang”.',
      'Timbalan anda hadir. Perdana Menteri perasan siapa dalam gambar, dan siapa tak.',
    ],
  },
  stateSeatSwap: {
    title: 'Kerusi dalam pilihan raya negeri',
    body: 'Pilihan raya negeri tak lama lagi, dan parti Perdana Menteri nak bertanding lebih banyak kerusi di negeri yang parti anda sentiasa pegang beberapa. Ia tawar kerusi lain di tempat lain. Ahli anda di negeri tu dah cakap apa mereka fikir pasal kerusi lain di tempat lain.',
    options: ['Serahkan kerusi yang diminta', 'Tawar-menawar untuk pertukaran adil', 'Tolak, dan bertanding semua kerusi anda'],
    results: [
      'Kerusi diserahkan. Parti Perdana Menteri bermurah hati, dan ahli anda di negeri tu tulis kepada akhbar.',
      ['Pertukaran adil, dan dua-dua pihak berpuas hati secara senyap.', 'Tawar-menawar gagal, dan parti Perdana Menteri kata ia “kecewa”.'],
      'Anda bertanding semuanya. Parti Perdana Menteri sangat marah, dan ahli anda di negeri tu sangat gembira, itulah tujuannya.',
    ],
  },
  leverageFile: {
    title: 'Fail tentang parti Perdana Menteri',
    body: 'Seorang ahli parti anda letak fail di tangan anda tentang seorang menteri parti Perdana Menteri: beberapa invois, beberapa e-mel dan gambar dengan kek yang sangat besar. Bukan perkara undang-undang, tapi tak akan nampak elok di muka depan.',
    options: ['Bawa kepada Perdana Menteri secara peribadi', 'Bocorkan, dan biar perkara tu berjalan', 'Simpan, dan diam'],
    results: [
      'Perdana Menteri berterima kasih, dan menteri tu dipindahkan. Tak ada apa dikatakan depan orang ramai, dan banyak yang difahami secara peribadi.',
      ['Cerita tersiar, menteri jatuh, dan parti anda diucap terima kasih oleh pengundi, yang sentiasa suka cerita.', 'Cerita tersiar, dan dijejak kepada anda, dan Perdana Menteri mula bercakap dengan anda dalam orang ketiga.'],
      'Anda simpan. Dalam laci, dan laci tu ada kunci, dan kunci tu ada orang tahu.',
    ],
  },
  honoursList: {
    title: 'Senarai darjah kebesaran',
    body: 'Senarai darjah kebesaran sedang disediakan, dan pejabat Perdana Menteri jemput setiap rakan hantar nama. Ahli anda ada banyak nama, dan bilangan yang mengejutkan ialah ahli.',
    options: ['Hantar nama anda', 'Enggan hantar mana-mana, atas prinsip', 'Balas orang anda dengan cara lain, senyap-senyap'],
    results: [
      'Nama dihantar. Sebelas diterima, ahli anda gembira, dan pengundi tak diberitahu.',
      'Anda enggan. Akhbar panggil berprinsip, ahli panggil perkara lain.',
      'Balasan tu senyap, dan tak ada siapa diberitahu, yang dalam parti sama dengan tak ada siapa diucap terima kasih.',
    ],
  },
  restlessMembers: {
    title: 'Ahli yang nak keluar',
    body: 'Sekumpulan ahli anda kata parti dah terlalu lama dalam kerajaan dan ada terlalu sikit untuk ditunjuk. Mereka mula adakan mesyuarat sendiri, dan minta, dalam nota, “perbualan tentang masa depan”.',
    options: ['Tahan mereka dengan janji jawatan dan projek', 'Biar sebahagian pergi, dan kekalkan yang tinggal', 'Adakan retret parti, dan bincangkannya'],
    results: [
      'Janji tu bertahan seketika, itulah gunanya.',
      'Beberapa orang pergi, dengan banyak kata-kata, dan parti lebih kecil dan lebih senyap, yang bagi sesetengah orang melegakan.',
      'Retret panjang, dan berakhir dengan dokumen, dan jamuan, yang bahagian terbaik.',
    ],
  },
};
