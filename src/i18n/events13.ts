import type { EventText } from './events';

// What lands on the desk of the leader of the opposition (second part), in English and Bahasa Malaysia. Every person, company and
// body in them is invented. A result written as a pair is for a gamble: what is reported if it comes off, then if it does not.

export const LEAD_EVENTS_2_EN: Record<string, EventText> = {
  nationalMourning: {
    title: 'A national day of mourning',
    body: 'A tragedy has struck the country: a bus has gone off a mountain road with forty on board. The Prime Minister has declared a day of mourning and asked all parties to suspend their politics. The road, as it happens, was on your list of roads that the government had failed to fix.',
    options: ['Suspend all attacks, and join the mourning', 'Keep asking questions about the road, respectfully', 'Say that the dead deserve answers, and press the government now'],
    results: [
      'You went quiet, and the country noticed that you did. The government thanked you, and the families did too.',
      'You asked, and the question was heard as a question and not as an attack, which is hard to do.',
      'You pressed. Some of the families thanked you, the papers did not, and the Prime Minister said that there was a time and a place.',
    ],
  },
  whispersAgainstYou: {
    title: 'Whispers against you',
    body: 'A group of your senior members has been meeting over dinner, and three of them have been seen in the same car. Nobody has said anything. Everybody has noticed that nobody has said anything.',
    options: ['Confront them, in private, and put the question to them', 'Give the likeliest challenger a senior post', 'Call a vote of confidence, and settle it'],
    results: [
      'You confronted them. Some of them said it was all a misunderstanding, and one of them was quite red.',
      'The post was given. The challenger accepted it with a speech that was nearly sincere, and the whispers fell quiet.',
      ['The vote came, and you won it by a wide margin, and the whispers stopped.', 'The vote came, and the margin was too narrow for comfort, and the whispers did not.'],
    ],
  },
  creditRow: {
    title: 'Your idea, their announcement',
    body: 'Last month your party proposed a rebate for small farmers. This morning the government announced something very like it, and the Prime Minister described it as “the government’s own plan, long in preparation”.',
    options: ['Claim the credit, and show the dates', 'Welcome it warmly, and press for more', 'Accuse the government of copying, and leave it at that'],
    results: [
      'The dates were shown, and the papers carried them. The government said the dates were a coincidence.',
      'You welcomed it, and it was widely noted that you had. The farmers noted too, and said it was a start.',
      'The accusation was made, and answered with a smile and a statistic, and nothing else came of it.',
    ],
  },
  ethicsComplaint: {
    title: 'A complaint against you',
    body: 'A complaint has been lodged with the parliamentary ethics committee about an interest you did not declare: a share in a small family firm that sells, among other things, pencils to a government department. The amount is fourteen ringgit.',
    options: ['Cooperate fully, and declare everything', 'Counterattack, and say the government is playing politics', 'Delay, and hope it is overtaken by other news'],
    results: [
      'You declared everything, and the pencils were the story of the day. The public felt better about a leader who owned up to pencils.',
      'You attacked, and your members enjoyed it. The committee did not, and the press said you had made a fuss of fourteen ringgit.',
      ['The delay worked, and another scandal took the headlines, and the committee lost interest.', 'The delay did not work, and the complaint was back on page one, with a fresh and unflattering paragraph.'],
    ],
  },
  foreignInvite: {
    title: 'An invitation from abroad',
    body: 'A foreign government has invited the leader of the opposition to a visit and a meeting with a minister. It is a mark of respect. It is also the sort of trip that the Prime Minister will describe as “going abroad to complain about your own country”.',
    options: ['Go, and speak to the minister', 'Decline, and stay at home', 'Send the shadow foreign minister in your place'],
    results: [
      'You went, and were received warmly. The Prime Minister said you had gone abroad to complain. Your members said that you had gone abroad to be seen.',
      'You stayed at home, and your members were relieved, and the invitation was quietly taken back.',
      'The shadow minister went, did well, and returned with a shine. You took some of the shine, and the Prime Minister had nothing to say.',
    ],
  },
  budgetTip: {
    title: 'The budget in an envelope',
    body: 'A copy of the government’s budget, due to be tabled next week, has reached your desk in an envelope. It might be the real one. It might be a very good fake. The sender, as always, has not left a name.',
    options: ['Reveal what is in it, before the government does', 'Send it back, unread, with a note', 'Use it quietly, to prepare your reply'],
    results: [
      ['It was real. The government’s big day was spoilt, and the papers talked of nothing else.', 'It was not real, or not all of it, and you were left defending a fabrication in front of the nation.'],
      'You sent it back, and the Prime Minister’s office took note. The voters admired your honesty, and the government its luck.',
      'You used it. Your reply on budget day was suspiciously quick, and the government spent a week trying to find a leak that was not there.',
    ],
  },
  showcaseState: {
    title: 'Your state as a showcase',
    body: 'Your party’s state government is the best argument you have: it is, the voters say, the best-run in the country. The trouble is that it is also in the news for a failed hospital contract and a very unhappy rubbish collection.',
    options: ['Invest in a flagship project to show what you can do', 'Highlight the successes, and wait for the bad news to pass', 'Keep the failures out of the story, and out of the files'],
    results: [
      'The flagship was built, and it was a very good one, and the voters were told. It was expensive.',
      'The successes were highlighted, and the failures faded, and the opposition’s voters had something to be proud of.',
      'The failures were not covered up for long. A newspaper had the files by the end of the month.',
    ],
  },
  millionPetition: {
    title: 'A petition with a million names',
    body: 'A petition on the cost of living has gathered a million signatures, and a student group has brought the boxes to your office in a lorry. They have asked you to take it to Parliament. They have also asked for a photograph.',
    options: ['Present it in the House, and demand a debate', 'Take it to the Palace', 'Take the names, and keep them as a mailing list'],
    results: [
      'The petition was presented, and a debate was held, and you spoke well. The government spoke less well, and a little too long.',
      'The Palace received the petition with courtesy. It had little power to do anything with it, and everybody knew that.',
      'The mailing list was a great asset, and a few of the signatories said that they had not signed up to be sold anything.',
    ],
  },
  govtFumbles: {
    title: 'Prices, and the government',
    body: 'The cost of living has been rising for months, and the government has put out its third reassurance. Your shadow ministers are lined up with a number of ideas, ranging from the useful to the indignant.',
    options: ['Attack the government hard on prices', 'Offer a calm, costed plan of your own', 'Set up an expert panel to advise on prices'],
    results: [
      'The attack was strong, and the poorest voters felt that somebody was on their side. The government said you had no plan.',
      'The plan was calm and costed, and a number of economists praised it, and a number of voters did not read it.',
      'The panel was announced, and met, and produced a paper. It was a good paper, and it was the first anybody had read.',
    ],
  },
  wooPartner: {
    title: 'A partner you might woo',
    body: 'A smaller party in the government is not happy: it feels ignored and underpaid. Its leader has been seen near your office, in a hat. You could try to bring it over, though it would take more than a hat.',
    options: ['Open quiet talks about bringing them over', 'Make a public offer, and put the government on the spot', 'Leave them alone, and keep to your own side'],
    results: [
      ['The talks went well, and the partner began to look for the door, to the government’s alarm.', 'The talks leaked, and the partner denied it, and you were thought to have tried and failed.'],
      'The offer was public, and it rattled the government, but it also embarrassed the partner, who declined it for the sake of form.',
      'You left them alone, and your members said it was the right thing, and the partner, who had hoped to be asked, said nothing.',
    ],
  },
  resignCalls: {
    title: 'A minister who should go',
    body: 'A minister has said in public that the rules “were made for ordinary people”. A video of this has gone round, with captions. Your members would like him gone, and your press office has three versions of a statement.',
    options: ['Demand his resignation, loudly', 'Table a motion for his removal', 'Show restraint, and let the public decide'],
    results: [
      'You demanded it. He did not go, and your members felt that your demand was louder than it was effective.',
      ['The motion was carried, and the minister was out, and the government was the poorer.', 'The motion was lost, and the minister stayed on, and said “vindicated” rather too often.'],
      'You showed restraint, and the public liked it, and the story ran on its own, without you, and did him more harm than your statement would.',
    ],
  },
};

export const LEAD_EVENTS_2_MS: Record<string, EventText> = {
  nationalMourning: {
    title: 'Hari berkabung negara',
    body: 'Tragedi menimpa negara: sebuah bas terjatuh dari jalan gunung dengan empat puluh orang di dalamnya. Perdana Menteri mengisytiharkan hari berkabung dan meminta semua parti menangguhkan politik. Jalan itu, kebetulan, ada dalam senarai jalan yang kerajaan gagal membaiki.',
    options: ['Hentikan semua serangan, dan sertai berkabung', 'Terus bertanya tentang jalan itu, dengan hormat', 'Katakan yang telah meninggal berhak mendapat jawapan, dan desak kerajaan sekarang'],
    results: [
      'Anda senyap, dan negara perasan anda senyap. Kerajaan berterima kasih kepada anda, begitu juga keluarga.',
      'Anda bertanya, dan soalan itu didengar sebagai soalan dan bukan serangan, yang sukar dilakukan.',
      'Anda mendesak. Sebahagian keluarga berterima kasih, akhbar tidak, dan Perdana Menteri berkata ada masa dan tempat.',
    ],
  },
  whispersAgainstYou: {
    title: 'Bisikan menentang anda',
    body: 'Sekumpulan ahli kanan anda bertemu semasa makan malam, dan tiga daripada mereka dilihat dalam kereta yang sama. Tiada siapa berkata apa-apa. Semua orang perasan tiada siapa berkata apa-apa.',
    options: ['Hadapi mereka, secara peribadi, dan kemukakan soalan itu', 'Beri pencabar yang paling mungkin jawatan kanan', 'Adakan undi percaya, dan selesaikannya'],
    results: [
      'Anda menghadapi mereka. Sebahagian berkata semuanya salah faham, dan seorang agak merah.',
      'Jawatan itu diberikan. Pencabar menerimanya dengan ucapan yang hampir ikhlas, dan bisikan menjadi senyap.',
      ['Undi diadakan, dan anda menang dengan majoriti besar, dan bisikan berhenti.', 'Undi diadakan, dan majoriti terlalu tipis untuk selesa, dan bisikan tidak berhenti.'],
    ],
  },
  creditRow: {
    title: 'Idea anda, pengumuman mereka',
    body: 'Bulan lalu parti anda mencadangkan rebat untuk petani kecil. Pagi ini kerajaan mengumumkan sesuatu yang sangat serupa, dan Perdana Menteri menyifatkannya “rancangan kerajaan sendiri, lama disediakan”.',
    options: ['Tuntut kredit, dan tunjukkan tarikhnya', 'Alu-alukan dengan mesra, dan desak lebih lagi', 'Tuduh kerajaan meniru, dan berhenti di situ'],
    results: [
      'Tarikh ditunjukkan, dan akhbar memaparkannya. Kerajaan berkata tarikh itu kebetulan.',
      'Anda mengalu-alukannya, dan ramai perasan anda berbuat demikian. Petani juga perasan, dan berkata ia permulaan.',
      'Tuduhan dibuat, dan dijawab dengan senyuman dan statistik, dan tiada apa-apa lagi.',
    ],
  },
  ethicsComplaint: {
    title: 'Aduan terhadap anda',
    body: 'Aduan dikemukakan kepada jawatankuasa etika Parlimen tentang kepentingan yang tidak anda isytiharkan: saham dalam firma keluarga kecil yang menjual, antara lain, pensil kepada sebuah jabatan kerajaan. Jumlahnya empat belas ringgit.',
    options: ['Beri kerjasama penuh, dan isytiharkan segala-galanya', 'Serang balas, dan katakan kerajaan bermain politik', 'Lengahkan, dan harap ia dilangkaui berita lain'],
    results: [
      'Anda mengisytiharkan segala-galanya, dan pensil menjadi cerita hari itu. Orang awam berasa lebih baik tentang pemimpin yang mengakui pensil.',
      'Anda menyerang, dan ahli anda menyukainya. Jawatankuasa tidak, dan akhbar berkata anda membesarkan empat belas ringgit.',
      ['Kelengahan berjaya, dan skandal lain mengambil tajuk berita, dan jawatankuasa hilang minat.', 'Kelengahan tidak berjaya, dan aduan itu kembali ke muka satu, dengan perenggan baharu yang tidak menyenangkan.'],
    ],
  },
  foreignInvite: {
    title: 'Jemputan dari luar negara',
    body: 'Sebuah kerajaan asing menjemput ketua pembangkang melawat dan bertemu menteri. Ia tanda hormat. Ia juga jenis lawatan yang Perdana Menteri akan sifatkan sebagai “pergi ke luar negara untuk mengadu tentang negara sendiri”.',
    options: ['Pergi, dan bercakap dengan menteri', 'Tolak, dan kekal di rumah', 'Hantar menteri luar bayangan menggantikan anda'],
    results: [
      'Anda pergi, dan disambut mesra. Perdana Menteri berkata anda pergi mengadu. Ahli anda berkata anda pergi untuk dilihat.',
      'Anda kekal di rumah, dan ahli anda lega, dan jemputan ditarik balik secara senyap.',
      'Menteri bayangan pergi, berjaya, dan pulang bersinar. Anda mengambil sebahagian sinar itu, dan Perdana Menteri tiada apa untuk dikatakan.',
    ],
  },
  budgetTip: {
    title: 'Belanjawan dalam sampul',
    body: 'Salinan belanjawan kerajaan, yang akan dibentang minggu depan, sampai ke meja anda dalam sampul surat. Ia mungkin yang sebenar. Ia mungkin tiruan yang sangat bagus. Penghantarnya, seperti biasa, tidak meninggalkan nama.',
    options: ['Dedahkan apa di dalamnya, sebelum kerajaan', 'Hantar semula, tidak dibaca, dengan nota', 'Gunakan secara senyap, untuk menyediakan jawapan anda'],
    results: [
      ['Ia sebenar. Hari besar kerajaan rosak, dan akhbar bercakap tentang tiada yang lain.', 'Ia bukan sebenar, atau tidak semuanya, dan anda terpaksa membela rekaan di hadapan negara.'],
      'Anda menghantarnya semula, dan pejabat Perdana Menteri mencatat. Pengundi mengagumi kejujuran anda, dan kerajaan nasibnya.',
      'Anda menggunakannya. Jawapan anda pada hari belanjawan sangat cepat secara mencurigakan, dan kerajaan menghabiskan seminggu mencari kebocoran yang tiada.',
    ],
  },
  showcaseState: {
    title: 'Negeri anda sebagai contoh',
    body: 'Kerajaan negeri parti anda ialah hujah terbaik anda: ia, kata pengundi, yang paling baik ditadbir di negara ini. Masalahnya ia juga dalam berita kerana kontrak hospital yang gagal dan pungutan sampah yang sangat tidak menyenangkan.',
    options: ['Labur dalam projek utama untuk menunjukkan apa yang anda boleh', 'Tonjolkan kejayaan, dan tunggu berita buruk berlalu', 'Jauhkan kegagalan daripada cerita, dan daripada fail'],
    results: [
      'Projek utama dibina, dan ia sangat bagus, dan pengundi diberitahu. Ia mahal.',
      'Kejayaan ditonjolkan, dan kegagalan pudar, dan pengundi pembangkang ada sesuatu untuk dibanggakan.',
      'Kegagalan tidak ditutup lama. Sebuah akhbar mendapat fail itu menjelang hujung bulan.',
    ],
  },
  millionPetition: {
    title: 'Petisyen sejuta nama',
    body: 'Petisyen tentang kos sara hidup mengumpul sejuta tandatangan, dan kumpulan pelajar membawa kotak-kotaknya ke pejabat anda dengan lori. Mereka meminta anda membawanya ke Parlimen. Mereka juga meminta gambar.',
    options: ['Bentangkan di Dewan, dan tuntut perbahasan', 'Bawa ke Istana', 'Ambil nama, dan simpan sebagai senarai mel'],
    results: [
      'Petisyen dibentang, dan perbahasan diadakan, dan anda bercakap dengan baik. Kerajaan bercakap kurang baik, dan sedikit terlalu panjang.',
      'Istana menerima petisyen dengan adab. Ia kurang kuasa untuk berbuat apa-apa, dan semua orang tahu.',
      'Senarai mel itu aset besar, dan beberapa penandatangan berkata mereka tidak mendaftar untuk dijual apa-apa.',
    ],
  },
  govtFumbles: {
    title: 'Harga, dan kerajaan',
    body: 'Kos sara hidup naik berbulan-bulan, dan kerajaan mengeluarkan jaminan ketiganya. Menteri bayangan anda beratur dengan beberapa idea, daripada yang berguna kepada yang marah.',
    options: ['Serang kerajaan dengan keras tentang harga', 'Tawarkan rancangan anda sendiri yang tenang dan berkos', 'Tubuhkan panel pakar untuk menasihati tentang harga'],
    results: [
      'Serangan itu kuat, dan pengundi termiskin merasa ada yang memihak mereka. Kerajaan berkata anda tiada rancangan.',
      'Rancangan itu tenang dan berkos, dan beberapa ahli ekonomi memujinya, dan beberapa pengundi tidak membacanya.',
      'Panel diumumkan, bermesyuarat, dan menghasilkan kertas. Ia kertas yang baik, dan yang pertama dibaca sesiapa.',
    ],
  },
  wooPartner: {
    title: 'Rakan yang boleh dipikat',
    body: 'Sebuah parti kecil dalam kerajaan tidak puas hati: ia merasa diabaikan dan dibayar kurang. Ketuanya dilihat berhampiran pejabat anda, berkopiah. Anda boleh cuba membawanya, walaupun ia memerlukan lebih daripada kopiah.',
    options: ['Buka rundingan senyap untuk membawa mereka', 'Buat tawaran terbuka, dan letakkan kerajaan dalam kesukaran', 'Biarkan mereka, dan kekal pada pihak anda'],
    results: [
      ['Rundingan berjalan baik, dan rakan mula mencari pintu, menggusarkan kerajaan.', 'Rundingan bocor, dan rakan menafikannya, dan anda disangka cuba dan gagal.'],
      'Tawaran itu terbuka, dan ia menggegarkan kerajaan, tetapi juga memalukan rakan, yang menolaknya demi adat.',
      'Anda membiarkan mereka, dan ahli anda berkata itu betul, dan rakan, yang berharap ditanya, tidak berkata apa-apa.',
    ],
  },
  resignCalls: {
    title: 'Menteri yang patut pergi',
    body: 'Seorang menteri berkata di khalayak peraturan itu “dibuat untuk orang biasa”. Video ini tersebar, dengan kapsyen. Ahli anda mahu dia pergi, dan pejabat akhbar anda ada tiga versi kenyataan.',
    options: ['Tuntut peletakan jawatannya, dengan lantang', 'Bentangkan usul untuk menyingkirkannya', 'Tunjuk sikap menahan diri, dan biar orang awam memutuskan'],
    results: [
      'Anda menuntutnya. Dia tidak pergi, dan ahli anda merasa tuntutan anda lebih lantang daripada berkesan.',
      ['Usul diluluskan, dan menteri disingkirkan, dan kerajaan lebih miskin.', 'Usul dikalahkan, dan menteri kekal, dan berkata “terbukti” terlalu kerap.'],
      'Anda menahan diri, dan orang awam menyukainya, dan cerita itu berjalan sendiri, tanpa anda, dan merugikannya lebih daripada kenyataan anda.',
    ],
  },
};
