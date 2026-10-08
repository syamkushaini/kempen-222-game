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
    title: 'Skim siapa ini?',
    body: 'Perdana Menteri melancarkan skim popular, dengan reben, sepanduk dan ucapan yang tidak menyebut ia bermula sebagai cadangan parti anda. Menteri anda merangkanya, pegawai anda mengiranya kosnya, dan nama anda ada dalam nota kaki.',
    options: ['Katakan demikian di khalayak', 'Kongsi kredit dengan mesra, dan biar Perdana Menteri mengetuai', 'Diam, dan harap pengundi membaca nota kaki'],
    results: [
      'Akhbar menyiarkan cerita itu bertajuk “Rakan tuntut skim”. Pejabat Perdana Menteri menyebutnya “salah faham” dengan nada yang bukan begitu.',
      'Kredit dikongsi dalam sidang media bersama. Perdana Menteri bermurah hati, dan mencatatnya.',
      'Pengundi tidak membaca nota kaki. Skim itu menjadi milik Perdana Menteri, dan parti anda mendapati dirinya mengucapkan tahniah kepadanya.',
    ],
  },
  postsForMine: {
    title: 'Jawatan untuk orang anda',
    body: 'Perdana Menteri menawarkan parti anda jawatan timbalan menteri dan duta, yang ahli anda fikir pulangan yang kecil bagi dua puluh kerusi. Seorang ahli kanan didengar berkata tawaran itu “murah hati, untuk seekor tikus”.',
    options: ['Terima apa yang ditawarkan, dan ucap terima kasih', 'Bertahan untuk kementerian penuh', 'Ugut untuk keluar daripada kerajaan'],
    results: [
      'Jawatan diterima. Ahli anda merungut dan kemudian mula mengisinya, yang tindakan bijak.',
      ['Anda bertahan dan kementerian itu datang, selepas jeda yang terasa seperti dua minggu.', 'Anda bertahan, dan Perdana Menteri berkata tawaran itu ditarik balik.'],
      'Ugutan itu didengar, dan diambil serius. Ia membuat kerajaan gementar, Perdana Menteri tidak mesra dan ahli anda, mengejutkan mereka, bangga.',
    ],
  },
  outvoted: {
    title: 'Kalah dalam kabinet',
    body: 'Menteri anda berhujah panjang menentang satu langkah, dan kalah, sebelas lawan dua. Keputusan itu diumumkan sebagai keputusan bersama. Ahli parti anda menunggu sama ada anda akan memilikinya.',
    options: ['Terima tanggungjawab bersama, dan pertahankannya', 'Katakan di khalayak menteri anda tidak bersetuju', 'Minta menteri anda berundur sebagai bantahan'],
    results: [
      'Anda mempertahankannya. Perdana Menteri berterima kasih, dan ahli anda mengalami minggu yang buruk.',
      'Ketidaksetujuan itu dilaporkan, dan menjadi cerita hari itu. Perdana Menteri berkata ia “tanda sihat”, yang bukan pujian.',
      'Menteri itu meletakkan jawatan, dengan surat yang ringkas dan jelas. Kerajaan goyah, dan parti anda dipanggil berprinsip dan menyusahkan dalam satu ayat.',
    ],
  },
  unpopularBill: {
    title: 'Rang undang-undang yang tidak disukai pengundi anda',
    body: 'Kerajaan akan membawa rang undang-undang ke Dewan yang akan dibenci pengundi anda: caj baharu yang paling terkena di daerah tempat parti anda kuat. Pejabat Perdana Menteri menelefon bertanya berapa ramai ahli anda akan mengundinya.',
    options: ['Arahkan ahli anda mengundi menyokongnya', 'Benarkan undi bebas', 'Mengundi menentang, dan biar kerajaan mengira kosnya'],
    results: [
      'Ahli anda mengundi ya, dengan wajah orang yang makan cili yang sangat besar.',
      'Undi itu bebas, ahli anda mengundi sesuka hati, dan Perdana Menteri tidak begitu gembira dan tidak berada dalam kedudukan untuk berkata demikian.',
      'Anda mengundi menentang, dan kerajaan meluluskan rang itu tanpa anda, yang dilakukannya dengan seronok.',
    ],
  },
  crossoverOffer: {
    title: 'Tawaran dari seberang',
    body: 'Seseorang yang rapat dengan ketua pembangkang memberitahu anda, semasa makan tengah hari yang panjang, bahawa pembangkang akan menawarkan parti anda peranan utama dalam pakatan baharu jika anda keluar daripada kerajaan. Tiada apa-apa ditulis, dan tiada apa-apa ditolak.',
    options: ['Tolak, dan katakan demikian di khalayak', 'Buka rundingan rahsia untuk melihat apa yang ditawarkan', 'Beritahu Perdana Menteri segera'],
    results: [
      'Penolakan itu lantang dan jelas. Perdana Menteri berterima kasih, dan pembangkang berkata ia tidak membuat tawaran.',
      ['Rundingan menghasilkan tawaran yang sangat baik, yang anda simpan dalam poket untuk kemudian.', 'Rundingan bocor, dan Perdana Menteri meminta penjelasan dengan suara yang tidak perlu ditinggikan.'],
      'Perdana Menteri berterima kasih, dan pembangkang sangat marah, dan tidak menyebut makan tengah hari itu lagi.',
    ],
  },
  partnerMinisterRow: {
    title: 'Menteri anda dalam berita',
    body: 'Salah seorang menteri parti anda difoto di majlis yang tidak sepatutnya dia hadiri, dalam kereta yang bukan kereta rasmi. Pejabat Perdana Menteri tidak berkata apa-apa, yang merupakan mesej tersendiri.',
    options: ['Pertahankan menteri, dan serang jurugambar', 'Minta menteri itu mengetepikan diri', 'Pindahkan menteri ke jawatan lain, secara senyap'],
    results: [
      'Pembelaan anda lantang, dan cerita itu bertahan tiga hari lebih lama kerananya. Perdana Menteri tidak begitu gembira.',
      'Menteri itu mengetepikan diri, dan parti anda disebut serius. Menteri itu belum memaafkan anda.',
      'Pemindahan dibuat, dan akhbar menyebutnya “rombakan” dan tiada siapa tertipu, atau kisah.',
    ],
  },
  allocationFight: {
    title: 'Peruntukan pembangunan',
    body: 'Peruntukan baharu untuk jalan, klinik dan sekolah diumumkan, dan daerah parti anda diberi jauh lebih sedikit daripada daerah parti Perdana Menteri. Penjelasannya, dalam nota kaki, ialah “sebab teknikal”.',
    options: ['Tuntut keadilan di khalayak', 'Terima, dan diam', 'Runding perjanjian senyap untuk daerah anda, di tepi'],
    results: [
      'Tuntutan itu didengar semua orang. Parti Perdana Menteri berkata ia akan menyiasat, bunyi janji untuk melupakan.',
      'Anda menerima, dan ahli anda sendiri mula tertanya-tanya apa gunanya perkongsian itu.',
      'Perjanjian dibuat di bilik belakang. Daerah anda mendapat sedikit lebih baik, dan bilik itu kemudian diceritakan kepada akhbar.',
    ],
  },
  posterLogo: {
    title: 'Logo siapa dahulu',
    body: 'Poster bersama untuk pencapaian kerajaan direka, dan susunan logo parti menjadi, selama dua minggu, perkara paling serius dalam gabungan. Logo anda diletakkan di bawah, dengan saiz lebih kecil.',
    options: ['Berkeras untuk susunan dan saiz yang adil', 'Terima, dan jaga keamanan', 'Cadangkan susunan bergilir pada setiap poster'],
    results: [
      'Susunan diubah, dengan gaya sangat bermurah hati, dan ahli anda gembira tidak terkira.',
      'Poster dipasang. Logo anda di bawah, dan ahli anda telah mengukurnya.',
      'Giliran itu diterima. Ada empat puluh poster, dan semua orang mengira bilangan yang mereka berada dahulu.',
    ],
  },
  mergerOffer: {
    title: 'Tawaran bergabung',
    body: 'Parti Perdana Menteri mencadangkan, dengan kata-kata paling mesra, kedua-dua parti bergabung, “demi kestabilan”. Ia akan menawarkan jawatan baik. Ia juga, seperti ditunjukkan seorang peguam dalam parti anda, menawarkan pengakhiran parti anda.',
    options: ['Buka rundingan penggabungan', 'Tolak, dengan sopan dan muktamad', 'Cadangkan persekutuan dua parti, yang mengekalkan nama anda'],
    results: [
      'Rundingan bermula. Ahli anda tidak suka perkataan “penggabungan”, dan ahli yang suka bukan yang berpengaruh.',
      'Penolakan itu sopan dan muktamad. Parti Perdana Menteri menerimanya dengan baik, dan mencatatnya.',
      ['Persekutuan disambut, dan kedua-dua pihak mendapatinya berguna.', 'Persekutuan itu dilihat sebagai penggabungan berkot, dan ditolak.'],
    ],
  },
  trailingInCoalition: {
    title: 'Tenggelam bersama kapal',
    body: 'Tinjauan menunjukkan sokongan parti anda jatuh lebih cepat daripada kerajaan. Ahli anda berkata ia dipersalahkan atas keputusan yang bukan dibuatnya, dan pengundi tidak dapat membezakan rakan daripada parti Perdana Menteri, kecuali dengan logo di sudut.',
    options: ['Jauhkan sedikit parti anda daripada kerajaan', 'Kekal setia, dan minta pengundi bersabar', 'Pilih isu yang akan anda berbeza, dan nyatakannya'],
    results: [
      'Jarak itu diletakkan. Kerajaan tidak gembira, dan pengundi anda, buat kali pertama, dapat membezakan anda.',
      'Kesetiaan dikekalkan, begitu juga angka tinjauan, dan ahli anda mula membaca perkataan “kesetiaan” dengan lebih teliti.',
      'Isu dipilih dengan teliti. Gabungan merungut dan bertahan, dan pengundi anda mendapat sesuatu untuk ditunjuk.',
    ],
  },
  budgetShare: {
    title: 'Bahagian belanjawan',
    body: 'Belanjawan untuk kementerian parti anda akan dipotong sepersepuluh, untuk membayar apa yang parti Perdana Menteri sebut “keutamaan bersama”. Menteri anda menghasilkan jadual untuk menunjukkan potongan itu tidak dikongsi, dan memasukkannya ke poket sendiri, kerana tiada orang lain mahu membacanya.',
    options: ['Lawan potongan itu dalam kabinet', 'Terima, demi semangat perkongsian', 'Tukarkan dengan janji untuk belanjawan tahun depan'],
    results: [
      'Pertarungan dimenangi sebahagian, dan kalah sebahagian, dan panjang. Ahli anda melihat anda berjuang, begitu juga Perdana Menteri.',
      'Potongan diterima. Pegawai kementerian mula mencari cara untuk menghilangkannya.',
      ['Janji ditepati, dan kementerian dipulihkan setahun kemudian.', 'Janji dilupakan, seperti janji tentang belanjawan tahun depan.'],
    ],
  },
  coalitionSummit: {
    title: 'Sidang kemuncak gabungan',
    body: 'Rakan dijemput ke sidang kemuncak di sebuah hotel, untuk menunjukkan perpaduan. Ia seperti biasa: meja panjang, komunike pendek dan gambar kumpulan di mana semua orang berdiri di sebelah orang yang paling tidak mereka sukai.',
    options: ['Hadir, dan tunjukkan barisan bersatu', 'Hadir, dan luahkan rungutan di meja', 'Hantar timbalan'],
    results: [
      'Gambar diambil, dan komunike berkata gabungan “lebih kukuh daripada sebelumnya”, yang selalu dikatakannya.',
      'Rungutan diluahkan. Sidang kemuncak lewat sejam, dan komunike berkata gabungan “berterus terang”.',
      'Timbalan anda hadir. Perdana Menteri perasan siapa dalam gambar, dan siapa tidak.',
    ],
  },
  stateSeatSwap: {
    title: 'Kerusi dalam pilihan raya negeri',
    body: 'Pilihan raya negeri tidak lama lagi, dan parti Perdana Menteri mahu bertanding lebih banyak kerusi di negeri yang parti anda sentiasa memegang beberapa. Ia menawarkan anda kerusi lain di tempat lain. Ahli anda di negeri itu sudah menyatakan pendapat tentang kerusi lain di tempat lain.',
    options: ['Serahkan kerusi yang diminta', 'Tawar-menawar untuk pertukaran adil', 'Tolak, dan bertanding semua kerusi anda'],
    results: [
      'Kerusi diserahkan. Parti Perdana Menteri bermurah hati, dan ahli anda di negeri itu menulis kepada akhbar.',
      ['Pertukaran itu adil, dan kedua-dua pihak berpuas hati secara senyap.', 'Tawar-menawar gagal, dan parti Perdana Menteri berkata ia “kecewa”.'],
      'Anda bertanding semuanya. Parti Perdana Menteri sangat marah, dan ahli anda di negeri itu sangat gembira, itulah tujuannya.',
    ],
  },
  leverageFile: {
    title: 'Fail tentang parti Perdana Menteri',
    body: 'Seorang ahli parti anda meletakkan fail di tangan anda tentang seorang menteri parti Perdana Menteri: beberapa invois, beberapa e-mel dan gambar dengan kek yang sangat besar. Ia bukan perkara undang-undang, tetapi ia tidak akan kelihatan baik di muka depan.',
    options: ['Bawa kepada Perdana Menteri secara peribadi', 'Bocorkan, dan biar perkara itu berjalan', 'Simpan, dan diam'],
    results: [
      'Perdana Menteri berterima kasih, dan menteri itu dipindahkan. Tiada apa dikatakan di khalayak, dan banyak yang difahami secara peribadi.',
      ['Cerita itu tersiar, menteri jatuh, dan parti anda diucapkan terima kasih oleh pengundi, yang sentiasa suka cerita.', 'Cerita itu tersiar, dan dijejak kepada anda, dan Perdana Menteri mula bercakap dengan anda dalam orang ketiga.'],
      'Anda menyimpannya. Ia dalam laci, dan laci itu ada kunci, dan kunci itu ada orang tahu.',
    ],
  },
  honoursList: {
    title: 'Senarai darjah kebesaran',
    body: 'Senarai darjah kebesaran sedang disediakan, dan pejabat Perdana Menteri menjemput setiap rakan menghantar nama. Ahli anda ada banyak nama, dan bilangan yang mengejutkan ialah ahli.',
    options: ['Hantar nama anda', 'Enggan menghantar mana-mana, atas prinsip', 'Balas orang anda dengan cara lain, secara senyap'],
    results: [
      'Nama dihantar. Sebelas diterima, dan ahli anda gembira, dan pengundi tidak diberitahu.',
      'Anda enggan. Akhbar menyebutnya berprinsip, dan ahli menyebutnya perkara lain.',
      'Balasan itu senyap, dan tiada siapa diberitahu, yang dalam parti sama dengan tiada siapa diucapkan terima kasih.',
    ],
  },
  restlessMembers: {
    title: 'Ahli yang mahu keluar',
    body: 'Sekumpulan ahli anda berkata parti sudah terlalu lama dalam kerajaan dan mempunyai terlalu sedikit untuk ditunjukkan. Mereka mula mengadakan mesyuarat sendiri, dan meminta, dalam nota, “perbualan tentang masa depan”.',
    options: ['Tahan mereka dengan janji jawatan dan projek', 'Biarkan sebahagian pergi, dan kekalkan yang tinggal', 'Adakan retret parti, dan bincangkannya'],
    results: [
      'Janji itu bertahan seketika, itulah kegunaannya.',
      'Beberapa orang pergi, dengan banyak kata-kata, dan parti lebih kecil dan lebih senyap, yang bagi sesetengah orang melegakan.',
      'Retret itu panjang, dan berakhir dengan dokumen, dan jamuan, yang bahagian terbaik.',
    ],
  },
};
