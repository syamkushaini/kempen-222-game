import type { EventText } from './events';

// A state’s own customs, three stories in chapters, and two that are modelled on the country’s great political stories, in English
// and Bahasa Malaysia. Every person, company and fund in them is invented. A result written as a pair is for a gamble: what is
// reported if it comes off, then if it does not.

export const STORY_EVENTS_2_EN: Record<string, EventText> = {
  adatSuccession: {
    title: 'The chiefs choose',
    body: 'The chiefs of the old adat are to choose a successor, as they have for centuries, and the state’s politics has come to the door. One of your own people has been put forward by a faction of the chiefs; another candidate has a bigger following in the villages. The chiefs have not asked for your opinion.',
    options: ['Respect the choice of the chiefs, whatever it is', 'Quietly back your own man with the chiefs', 'Say it is a matter for the adat and not for politics'],
    results: [
      'The chiefs chose, and it was not your man. The villages noticed who did not interfere.',
      ['Your man was chosen. Nobody could say how it came about, and everybody tried.', 'Your man was not chosen, and everyone knew you had tried. The villages do not forget interference with the adat.'],
      'A correct answer, and a quiet one. The towns approved; the villages shrugged.',
    ],
  },
  weekendChange: {
    title: 'Which day of rest',
    body: 'The state’s weekly holiday has been Friday and Saturday for years. The chambers of commerce say it costs them a day of trading with the rest of the country; the religious councils say it is a matter of the way the week is lived. Both want a ruling before the new year.',
    options: ['Keep the holiday as it is', 'Move it to follow the rest of the country', 'Leave it to each district to decide'],
    results: [
      'Nothing changed. Tradition is pleased, and the traders say what they say every year.',
      'The change is made. The traders thank you, and the old people are not pleased.',
      'Every district decided differently. The state now has three weekends, and everyone is a little confused.',
    ],
  },
  nativeLand: {
    title: 'Land of the natives',
    body: 'A native community has gone to court to claim customary land that was given to a plantation company in the state’s name decades ago. The community has the records of its elders and the company has a title deed. The cameras have been to the village.',
    options: ['Recognise the native claim, and compensate the company', 'Propose a settlement: part of the land to each', 'Back the title deed, and let the courts settle it'],
    results: [
      'The village celebrated for a week. The company’s lawyers have gone quiet, which is a cost of its own.',
      'Neither side was happy, which, said a lawyer, is how you know a settlement is fair.',
      'The title deed stood. The village does not think it is the end of the matter.',
    ],
  },
  longhouseRoad: {
    title: 'A road through the longhouse',
    body: 'The new road to the interior will pass through the land of a longhouse community: two alignments, one through their farmland, one round it at three times the cost. The headman has written to the state and the road contractor has written to everyone else.',
    options: ['Take the longer route and pay for it', 'Take the short route and pay the community compensation', 'Hold a meeting at the longhouse and decide there'],
    results: [
      'The longhouse invited you to dinner. The road will be late and dear and loved.',
      'The road was cheap and fast. The compensation was accepted, with the sort of silence that is not consent.',
      ['The meeting chose a third route nobody had drawn. It was cheap, and everyone was pleased.', 'The meeting ended in an argument, and was reported as one.'],
    ],
  },
  processionRoute: {
    title: 'The procession and the main road',
    body: 'A great annual procession of one of the state’s communities wants to take its old route along the main road. The traffic police want a new one; the neighbours along the road, of other faiths, are divided, and say so, politely, in the letters column.',
    options: ['Approve the old route, with marshals and a timetable', 'Move it to a route the police prefer', 'Convene the community leaders of every faith and let them agree'],
    results: [
      'It went off peacefully. The neighbours brought water and sweets for the marchers, and the papers used the photograph.',
      'The new route was safer and no one’s first choice. The organisers said it was a loss, in their own gentle way.',
      'It took three meetings and a lot of tea. The agreement was held up as an example by the same papers that reported the quarrel.',
    ],
  },
  rulerRemarks: {
    title: 'Words from the palace',
    body: 'The state’s ruler has spoken, at a public function, about a matter that is the government’s to decide. He did not name the government. Everyone present understood. The newspapers are asking whether the Menteri Besar will answer.',
    options: ['Welcome the remarks, and say the government will consider them', 'Ask quietly for an audience and give the answer there', 'Say that the government is answerable to the voters'],
    results: [
      'The remarks were welcomed. The villages liked the respect shown; the cities noted the deference.',
      'The audience took an hour. Nothing was said afterwards, which is the correct outcome.',
      'It was true, and it was said in public. Some thought it brave, and the palace did not.',
    ],
  },

  portBid: {
    title: 'The port’s new owner',
    body: 'The government has put the national port out for a long lease. Two bidders remain: a foreign operator with the best price, and a consortium led by a friend of the party’s treasurer, with a worse one. The treasurer says it is only a coincidence, and has put it in writing.',
    options: ['Award it to the consortium', 'Award it to the better bid', 'Postpone the decision to the new year'],
    results: [
      'The consortium won. The lease is long, and so is the list of those who will ask why.',
      'The foreign operator won, to a chorus of speeches about the port being sold to strangers. The speeches were mostly from the consortium.',
      'The decision was postponed. So were the loading cranes, according to the unions.',
    ],
  },
  portProtest: {
    title: 'The port workers walk out',
    body: 'The port’s workers fear for their jobs under the new lease and have walked out. Ships are queuing in the roads outside, and the cost of every day is read out on the evening news.',
    options: ['Guarantee the jobs in the lease', 'Order them back to work', 'Mediate, and put in some public money'],
    results: [
      'The guarantee costs the operator something, and the lease something. The strike was over by morning.',
      'They went back, in their own time. The government will be reminded of the order.',
      'It cost a little and settled most of it. The rest was settled by the passage of time.',
    ],
  },
  portAudit: {
    title: 'The auditors look at the lease',
    body: 'The auditor-general has examined the port lease and found irregularities, the sort that could be explained or concealed. The report is on your desk, and a copy is in a journalist’s.',
    options: ['Publish it, and act on what it finds', 'Dispute the findings and ask for a second audit'],
    results: [
      'Publishing it hurt for a week and helped for a year. The treasurer resigned “to spend time on his boat”.',
      ['The second audit found nothing. The first was leaked a week later in any case.', 'The second audit found more. The first had already been leaked.'],
    ],
  },

  youthFund: {
    title: 'Where the youth fund went',
    body: 'A reporter has found that a youth development fund, set up with great fanfare, has paid most of its grants to the sons and nieces of the party’s own officials. The fund’s head says the grants were “within the rules”. The rules, it turns out, were written by the fund’s head.',
    options: ['Ask the auditors to look at it, and say so', 'Defend the fund and attack the reporter', 'Say nothing, and let the story run its course'],
    results: [
      'It was your own fund, and you called the auditors in. Few politicians do, and the young noticed.',
      'The attack on the reporter was the story for three days. The young do not like being told their fund was fine.',
      'It ran for a week, and then something else did. The fund’s head quietly kept his job.',
    ],
  },
  youthFundProbe: {
    title: 'The inquiry into the fund',
    body: 'The auditors have reported. The grants to relatives were real and the rules were bent, but not quite broken. The fund’s head wants to resign quietly; two of your own officials, who benefited, want the report buried.',
    options: ['Publish it, and remove everyone named in it', 'Accept the fund head’s resignation and bury the rest', 'Repay the money from the party’s own funds'],
    results: [
      'It cost you four officials and a fortnight. It was the right thing to do, and the young know it.',
      'The fund head went. The rest stayed, and the report was “under consideration”, which is where reports go.',
      'You paid, and said so. The party’s purse will take a while to recover, and its name a little less.',
    ],
  },
  youthFundVerdict: {
    title: 'The young decide',
    body: 'The youth wing of your own party has held its annual meeting. The matter of the fund is the only item anyone wants to discuss. The young want to know whether the party is the kind that does what it says.',
    options: ['Take the questions, and answer all of them', 'Limit the discussion to the future of the fund'],
    results: [
      'It was a long evening, and no one went home thinking you had hidden anything. The young left in good voice.',
      'The young were told what to discuss. They discussed the other thing anyway, loudly, in the car park.',
    ],
  },

  riverFactory: {
    title: 'The smell by the river',
    body: 'The villages on the river have complained of a smell, and of fish with sores. The factory upstream says it is within its permit. The permit was issued by your own department, to a company that has built a good deal in the state.',
    options: ['Send inspectors, and publish their report', 'Defend the factory: it employs two thousand people', 'Say it is being looked into'],
    results: [
      'The inspectors came, and the villagers watched them take samples. For once nobody had to ask who the inspectors worked for.',
      'The factory’s workers were grateful. The villages were not, and said so to the foreign press.',
      'It is being looked into. It has been looked into for some time.',
    ],
  },
  fishKill: {
    title: 'A river of dead fish',
    body: 'Overnight the river turned. Thousands of fish are floating on the surface, the villagers have been told not to draw water, and the factory’s chimney is, as the television pointed out, working at full tilt.',
    options: ['Shut the factory until the cause is known, and pay for clean water', 'Order a cleanup, and keep the factory open', 'Wait for the laboratory results'],
    results: [
      'The factory closed for a fortnight and the water was brought in tankers. The workers were paid anyway, which cost a good deal.',
      'The cleanup was swift and visible. So was the smell, which came back.',
      ['The laboratory cleared the factory of this, and the villages did not believe it.', 'The laboratory found the factory’s effluent in the water, and a week had been lost.'],
    ],
  },
  riverCourt: {
    title: 'The river in court',
    body: 'The villages have taken the factory to court, and the state with it, for permitting what it permitted. The judge is known to be careful. Your officials say you will not be blamed, which is what officials say.',
    options: ['Support the villagers’ claim, and tighten the permit', 'Support the factory’s defence'],
    results: [
      'The court found for the villagers. The factory has been told to clean up, and the state to count its permits.',
      'The court found for the factory, narrowly. The villages remember who stood where.',
    ],
  },

  sovereignFund: {
    title: 'The missing billions',
    body: 'An overseas newspaper has published a story that a state investment fund borrowed heavily, lost much of it in deals abroad, and cannot say where the rest went. The sum is larger than the national health budget. The fund’s chairman says it is all misunderstood.',
    options: ['Call for an independent inquiry', 'Defend the fund, and the chairman', 'Say it is a matter for the fund’s own board'],
    results: [
      'The inquiry was called. Nobody could say they had not asked.',
      'The defence did not last the week. Neither did the confidence of the people who made it.',
      'The board met, and the story did not go away. Boards seldom do.',
    ],
  },
  fundProbe: {
    title: 'The auditors and the fund',
    body: 'The inquiry has gone through the fund’s books. The auditors have found accounts they cannot follow and transfers to companies that appear to have no employees. Several of the fund’s directors are old friends of the political class, and have been calling.',
    options: ['Publish the findings in full', 'Delay: the full report would cause “unnecessary panic”', 'Seek foreign help in tracing the money'],
    results: [
      'Publishing it hurt for a week and was the only thing that could have been done. The directors have stopped calling.',
      'Delay is a decision. Everyone said so, including your own people.',
      'It will take a long time, and a lot of money, and some of it may come back.',
    ],
  },
  fundTrial: {
    title: 'The fund’s directors in court',
    body: 'Four directors of the fund are in the dock, and a fifth is abroad. The prosecution has papers, and the defence has patience. The country has watched this for a year, and the public gallery is full each day.',
    options: ['Let the prosecution run its course without interference', 'Intervene to see that the case does not damage the country’s name'],
    results: [
      'The court found against the directors. The country said that it had been a long time coming.',
      'Intervening was understood for what it was. The directors went free, and a good deal of public trust with them.',
    ],
  },

  hotelMeeting: {
    title: 'A late dinner at the hotel',
    body: 'A dozen members of the House were seen leaving a hotel in a hurry last night. Some were yours, some your partners’. One was heard to say it was just a dinner. A senior man of the opposition has been seen at the same hotel at the same hour, smiling.',
    options: ['Call the members in, one at a time, and make them an offer', 'Say you trust them, and that you have nothing to hide', 'Ask a loyal member to find out what was said'],
    results: [
      'The offers were accepted, as offers are, and the cost fell on the treasury and on your name.',
      'It was a brave thing to say, and a hopeful one. It will be tested.',
      ['The loyal member found out. It was a dinner, with some talk.', 'The loyal member found out and the opposition found out that he was asked, which was worse.'],
    ],
  },
  hotelAftermath: {
    title: 'The morning after',
    body: 'The count is closer than anyone will say. Three members have sent a letter to the Palace, and four have sent a letter to you. The papers have the dinner menu, the room numbers and the names. The Palace is expected to say something by noon.',
    options: ['Face the House and ask for a vote', 'Offer the three posts in the cabinet', 'Ask the Palace for time'],
    results: [
      'The House is full by two. You are seen to be a man with a plan. The vote was close.',
      'The posts were taken. The cabinet is larger now, and so is the bill for it.',
      'The Palace gave you the time. The members used it to count again, and it went the other way.',
    ],
  },
};

export const STORY_EVENTS_2_MS: Record<string, EventText> = {
  adatSuccession: {
    title: 'Para pembesar memilih',
    body: 'Para pembesar adat lama akan memilih pengganti, seperti yang mereka lakukan beratus tahun, dan politik negeri sudah sampai ke pintu. Salah seorang daripada orang anda telah dicalonkan oleh satu puak pembesar; calon lain mempunyai pengikut lebih ramai di kampung. Para pembesar tidak meminta pendapat anda.',
    options: ['Hormati pilihan para pembesar, apa pun ia', 'Sokong orang anda secara senyap kepada para pembesar', 'Katakan ia urusan adat dan bukan politik'],
    results: [
      'Para pembesar memilih, dan bukan orang anda. Kampung perasan siapa yang tidak campur tangan.',
      ['Orang anda dipilih. Tiada siapa dapat menerangkan bagaimana, dan semua cuba.', 'Orang anda tidak dipilih, dan semua tahu anda telah mencuba. Kampung tidak lupa campur tangan terhadap adat.'],
      'Jawapan yang betul, dan senyap. Bandar setuju; kampung angkat bahu.',
    ],
  },
  weekendChange: {
    title: 'Hari rehat yang mana',
    body: 'Cuti mingguan negeri telah menjadi hari Jumaat dan Sabtu sejak bertahun-tahun. Dewan perniagaan berkata ia menyebabkan mereka kehilangan sehari berniaga dengan seluruh negara; majlis agama berkata ia soal cara minggu dijalani. Kedua-duanya mahu keputusan sebelum tahun baharu.',
    options: ['Kekalkan cuti seperti sedia ada', 'Alihkan untuk mengikuti seluruh negara', 'Serahkan kepada setiap daerah untuk memutuskan'],
    results: [
      'Tiada apa berubah. Tradisi gembira, dan peniaga berkata apa yang mereka kata setiap tahun.',
      'Perubahan dibuat. Peniaga berterima kasih, dan orang tua tidak gembira.',
      'Setiap daerah memutuskan lain-lain. Negeri kini ada tiga hujung minggu, dan semua orang sedikit keliru.',
    ],
  },
  nativeLand: {
    title: 'Tanah anak negeri',
    body: 'Satu komuniti anak negeri telah ke mahkamah menuntut tanah adat yang diberi kepada sebuah syarikat ladang atas nama negeri berpuluh tahun lalu. Komuniti itu ada rekod orang tuanya dan syarikat ada surat hak milik. Kamera sudah ke kampung itu.',
    options: ['Iktiraf tuntutan anak negeri, dan beri pampasan kepada syarikat', 'Cadangkan penyelesaian: sebahagian tanah kepada setiap pihak', 'Sokong surat hak milik, dan biar mahkamah memutuskan'],
    results: [
      'Kampung itu meraikan seminggu. Peguam syarikat senyap, yang satu kos tersendiri.',
      'Kedua-dua pihak tidak gembira, yang, kata seorang peguam, tandanya penyelesaian itu adil.',
      'Surat hak milik kekal. Kampung tidak fikir ini akhir cerita.',
    ],
  },
  longhouseRoad: {
    title: 'Jalan melalui rumah panjang',
    body: 'Jalan baharu ke pedalaman akan melalui tanah sebuah komuniti rumah panjang: dua susunan, satu melalui ladang mereka, satu mengelilinginya dengan kos tiga kali ganda. Ketua kampung telah menulis kepada negeri dan kontraktor jalan telah menulis kepada semua orang lain.',
    options: ['Ambil laluan lebih panjang dan bayar', 'Ambil laluan pendek dan bayar pampasan kepada komuniti', 'Adakan mesyuarat di rumah panjang dan putuskan di sana'],
    results: [
      'Rumah panjang menjemput anda makan malam. Jalan akan lewat dan mahal dan disayangi.',
      'Jalan murah dan cepat. Pampasan diterima, dengan sejenis kesenyapan yang bukan persetujuan.',
      ['Mesyuarat memilih laluan ketiga yang tiada siapa lukis. Ia murah, dan semua gembira.', 'Mesyuarat berakhir dengan pertengkaran, dan dilaporkan begitu.'],
    ],
  },
  processionRoute: {
    title: 'Perarakan dan jalan utama',
    body: 'Satu perarakan tahunan besar salah satu komuniti negeri mahu mengambil laluan lamanya di jalan utama. Polis trafik mahu yang baharu; jiran di sepanjang jalan, yang berlainan agama, berbelah bahagi, dan berkata begitu, dengan sopan, dalam ruangan surat.',
    options: ['Luluskan laluan lama, dengan pengawal dan jadual', 'Alihkan ke laluan yang polis lebih suka', 'Panggil pemimpin komuniti setiap agama dan biar mereka bersetuju'],
    results: [
      'Ia berjalan aman. Jiran membawa air dan manisan untuk peserta, dan akhbar menggunakan gambar itu.',
      'Laluan baharu lebih selamat dan bukan pilihan pertama sesiapa. Penganjur berkata ia kerugian, dengan cara lembut mereka.',
      'Ia mengambil tiga mesyuarat dan banyak teh. Persetujuan itu dijadikan contoh oleh akhbar yang sama yang melaporkan pertelingkahan.',
    ],
  },
  rulerRemarks: {
    title: 'Titah dari istana',
    body: 'Raja negeri telah bertitah, pada satu majlis awam, tentang perkara yang kerajaan perlu memutuskan. Baginda tidak menamakan kerajaan. Semua yang hadir faham. Akhbar bertanya sama ada Menteri Besar akan menjawab.',
    options: ['Alu-alukan titah itu, dan katakan kerajaan akan mempertimbangkannya', 'Mohon menghadap secara senyap dan beri jawapan di sana', 'Katakan kerajaan bertanggungjawab kepada pengundi'],
    results: [
      'Titah itu dialu-alukan. Kampung suka hormat yang ditunjukkan; bandar mencatat ketaatan.',
      'Menghadap mengambil sejam. Tiada apa dikatakan selepas itu, iaitu hasil yang betul.',
      'Ia benar, dan dikatakan di khalayak. Sebahagian menganggap ia berani, dan istana tidak.',
    ],
  },

  portBid: {
    title: 'Pemilik baharu pelabuhan',
    body: 'Kerajaan telah menawarkan pelabuhan negara untuk pajakan panjang. Dua penawar kekal: pengendali asing dengan harga terbaik, dan konsortium yang diketuai kawan bendahari parti, dengan harga lebih buruk. Bendahari berkata ia hanya kebetulan, dan telah menulisnya.',
    options: ['Anugerahkan kepada konsortium', 'Anugerahkan kepada tawaran yang lebih baik', 'Tangguhkan keputusan ke tahun baharu'],
    results: [
      'Konsortium menang. Pajakan panjang, begitu juga senarai orang yang akan bertanya mengapa.',
      'Pengendali asing menang, disambut ucapan tentang pelabuhan dijual kepada orang asing. Ucapan itu kebanyakannya daripada konsortium.',
      'Keputusan ditangguh. Begitu juga kren muatan, menurut kesatuan.',
    ],
  },
  portProtest: {
    title: 'Pekerja pelabuhan keluar',
    body: 'Pekerja pelabuhan takut kehilangan kerja di bawah pajakan baharu dan telah keluar. Kapal beratur di luar, dan kos setiap hari dibaca dalam berita malam.',
    options: ['Jamin pekerjaan dalam pajakan', 'Perintahkan mereka kembali bekerja', 'Jadi pengantara, dan masukkan sedikit wang awam'],
    results: [
      'Jaminan itu membebankan pengendali, dan pajakan. Mogok tamat menjelang pagi.',
      'Mereka kembali, pada masa sendiri. Kerajaan akan diingatkan tentang perintah itu.',
      'Ia memakan sedikit dan menyelesaikan kebanyakannya. Selebihnya diselesaikan oleh peredaran masa.',
    ],
  },
  portAudit: {
    title: 'Juruaudit memeriksa pajakan',
    body: 'Ketua audit negara telah memeriksa pajakan pelabuhan dan menemui ketidakteraturan, jenis yang boleh diterangkan atau disembunyikan. Laporan di meja anda, dan salinan di meja seorang wartawan.',
    options: ['Terbitkannya, dan bertindak mengikut dapatannya', 'Pertikaikan dapatan dan minta audit kedua'],
    results: [
      'Menerbitkannya menyakitkan seminggu dan membantu setahun. Bendahari meletak jawatan “untuk meluangkan masa di botnya”.',
      ['Audit kedua tidak menemui apa-apa. Yang pertama dibocorkan seminggu kemudian pun.', 'Audit kedua menemui lebih banyak. Yang pertama sudah dibocorkan.'],
    ],
  },

  youthFund: {
    title: 'Ke mana pergi dana belia',
    body: 'Seorang wartawan mendapati dana pembangunan belia, yang ditubuhkan dengan meriah, telah membayar kebanyakan gerannya kepada anak dan anak saudara pegawai parti sendiri. Ketua dana berkata geran itu “mengikut peraturan”. Peraturan itu, rupanya, ditulis oleh ketua dana.',
    options: ['Minta juruaudit memeriksanya, dan katakannya', 'Pertahankan dana dan serang wartawan', 'Jangan kata apa-apa, dan biar cerita itu berlalu'],
    results: [
      'Ia dana anda sendiri, dan anda memanggil juruaudit. Sedikit ahli politik berbuat begitu, dan anak muda perasan.',
      'Serangan terhadap wartawan menjadi cerita selama tiga hari. Anak muda tidak suka diberitahu dana mereka baik.',
      'Ia berlarutan seminggu, kemudian ada perkara lain. Ketua dana senyap-senyap kekal jawatannya.',
    ],
  },
  youthFundProbe: {
    title: 'Siasatan terhadap dana',
    body: 'Juruaudit telah melapor. Geran kepada saudara-mara itu benar dan peraturan dilenturkan, tetapi tidak sepenuhnya dilanggar. Ketua dana mahu meletak jawatan senyap; dua pegawai anda sendiri, yang mendapat manfaat, mahu laporan itu dikuburkan.',
    options: ['Terbitkannya, dan singkirkan semua yang dinamakan', 'Terima peletakan jawatan ketua dana dan kuburkan selebihnya', 'Bayar balik wang itu daripada dana parti sendiri'],
    results: [
      'Ia memakan empat pegawai dan dua minggu. Ia perkara betul untuk dilakukan, dan anak muda tahu.',
      'Ketua dana pergi. Yang lain kekal, dan laporan itu “sedang dipertimbangkan”, tempat laporan pergi.',
      'Anda membayar, dan mengatakannya. Dompet parti akan mengambil masa untuk pulih, dan namanya sedikit kurang.',
    ],
  },
  youthFundVerdict: {
    title: 'Anak muda memutuskan',
    body: 'Sayap pemuda parti anda sendiri telah mengadakan mesyuarat tahunannya. Soal dana itu satu-satunya perkara yang semua orang mahu bincangkan. Anak muda mahu tahu sama ada parti ini jenis yang membuat apa yang dikatakannya.',
    options: ['Ambil soalan, dan jawab semuanya', 'Hadkan perbincangan kepada masa depan dana'],
    results: [
      'Ia malam yang panjang, dan tiada siapa pulang menyangka anda menyembunyikan apa-apa. Anak muda keluar dengan suara baik.',
      'Anak muda diberitahu apa untuk dibincangkan. Mereka membincangkan perkara lain juga, dengan kuat, di tempat letak kereta.',
    ],
  },

  riverFactory: {
    title: 'Bau di tepi sungai',
    body: 'Kampung-kampung di tepi sungai mengadu tentang bau, dan tentang ikan berluka. Kilang di hulu berkata ia dalam had permitnya. Permit itu dikeluarkan oleh jabatan anda sendiri, kepada sebuah syarikat yang banyak membina di negeri ini.',
    options: ['Hantar pemeriksa, dan terbitkan laporan mereka', 'Pertahankan kilang: ia menggaji dua ribu orang', 'Katakan ia sedang disiasat'],
    results: [
      'Pemeriksa datang, dan penduduk kampung melihat mereka mengambil sampel. Untuk sekali tiada siapa perlu bertanya siapa majikan pemeriksa.',
      'Pekerja kilang bersyukur. Kampung tidak, dan berkata begitu kepada akhbar asing.',
      'Ia sedang disiasat. Ia sudah lama disiasat.',
    ],
  },
  fishKill: {
    title: 'Sungai ikan mati',
    body: 'Semalaman sungai itu bertukar. Beribu ikan terapung di permukaan, penduduk kampung diberitahu jangan mengambil air, dan serombong kilang, seperti ditunjuk televisyen, bekerja sepenuh tenaga.',
    options: ['Tutup kilang sehingga puncanya diketahui, dan bayar air bersih', 'Perintahkan pembersihan, dan biar kilang dibuka', 'Tunggu keputusan makmal'],
    results: [
      'Kilang ditutup dua minggu dan air dibawa dengan tangki. Pekerja tetap dibayar, yang memakan kos.',
      'Pembersihan pantas dan kelihatan. Begitu juga baunya, yang kembali.',
      ['Makmal membebaskan kilang kali ini, dan kampung tidak percaya.', 'Makmal menemui efluen kilang dalam air, dan seminggu hilang.'],
    ],
  },
  riverCourt: {
    title: 'Sungai di mahkamah',
    body: 'Kampung-kampung telah membawa kilang ke mahkamah, dan negeri bersamanya, kerana membenarkan apa yang dibenarkan. Hakimnya dikenali berhati-hati. Pegawai anda berkata anda tidak akan disalahkan, yang apa pegawai katakan.',
    options: ['Sokong tuntutan penduduk kampung, dan ketatkan permit', 'Sokong pembelaan kilang'],
    results: [
      'Mahkamah memihak penduduk kampung. Kilang disuruh membersihkan, dan negeri disuruh mengira permitnya.',
      'Mahkamah memihak kilang, tipis. Kampung ingat siapa berdiri di mana.',
    ],
  },

  sovereignFund: {
    title: 'Berbilion yang hilang',
    body: 'Sebuah akhbar luar negara menerbitkan cerita bahawa sebuah dana pelaburan negeri meminjam banyak, kehilangan banyak dalam perjanjian di luar negara, dan tidak dapat mengatakan ke mana perginya selebihnya. Jumlahnya lebih besar daripada belanjawan kesihatan negara. Pengerusi dana berkata semuanya disalah faham.',
    options: ['Seru siasatan bebas', 'Pertahankan dana, dan pengerusi', 'Katakan ia urusan lembaga dana sendiri'],
    results: [
      'Siasatan diseru. Tiada siapa boleh kata mereka tidak bertanya.',
      'Pertahanan itu tidak bertahan seminggu. Begitu juga keyakinan orang yang membuatnya.',
      'Lembaga bermesyuarat, dan cerita itu tidak hilang. Lembaga jarang berjaya.',
    ],
  },
  fundProbe: {
    title: 'Juruaudit dan dana itu',
    body: 'Siasatan telah melalui buku dana. Juruaudit menemui akaun yang tidak dapat diikuti dan pindahan kepada syarikat yang nampaknya tiada pekerja. Beberapa pengarah dana ialah kawan lama kelas politik, dan telah menelefon.',
    options: ['Terbitkan dapatan sepenuhnya', 'Tangguh: laporan penuh akan menyebabkan “panik yang tidak perlu”', 'Minta bantuan asing untuk menjejak wang itu'],
    results: [
      'Menerbitkannya menyakitkan seminggu dan satu-satunya yang boleh dilakukan. Pengarah berhenti menelefon.',
      'Tangguh ialah keputusan. Semua berkata begitu, termasuk orang anda sendiri.',
      'Ia akan mengambil masa panjang, dan banyak wang, dan sebahagian mungkin kembali.',
    ],
  },
  fundTrial: {
    title: 'Pengarah dana di mahkamah',
    body: 'Empat pengarah dana berada di kandang tertuduh, dan yang kelima di luar negara. Pendakwaan ada dokumen, dan pembelaan ada kesabaran. Negara telah menonton ini setahun, dan galeri awam penuh setiap hari.',
    options: ['Biar pendakwaan berjalan tanpa campur tangan', 'Campur tangan supaya kes tidak merosakkan nama negara'],
    results: [
      'Mahkamah memutuskan menentang pengarah. Negara berkata ia sudah lama dinantikan.',
      'Campur tangan difahami apa adanya. Pengarah bebas, dan banyak kepercayaan awam bersama mereka.',
    ],
  },

  hotelMeeting: {
    title: 'Makan malam lewat di hotel',
    body: 'Sedozen ahli Dewan dilihat meninggalkan sebuah hotel dengan tergesa-gesa malam tadi. Sebahagian orang anda, sebahagian rakan anda. Seorang didengar berkata ia hanya makan malam. Seorang kanan pembangkang dilihat di hotel yang sama pada jam yang sama, tersenyum.',
    options: ['Panggil ahli satu persatu, dan beri mereka tawaran', 'Katakan anda percaya mereka, dan anda tiada apa untuk disembunyikan', 'Minta seorang ahli setia mencari tahu apa yang dikatakan'],
    results: [
      'Tawaran diterima, seperti tawaran, dan kosnya jatuh pada perbendaharaan dan nama anda.',
      'Ia perkara berani untuk dikatakan, dan penuh harapan. Ia akan diuji.',
      ['Ahli setia mencari tahu. Ia makan malam, dengan sedikit perbualan.', 'Ahli setia mencari tahu dan pembangkang mengetahui bahawa dia diminta, yang lebih buruk.'],
    ],
  },
  hotelAftermath: {
    title: 'Pagi selepasnya',
    body: 'Kiraan lebih rapat daripada yang akan dikatakan sesiapa. Tiga ahli telah menghantar surat ke Istana, dan empat telah menghantar surat kepada anda. Akhbar ada menu makan malam, nombor bilik dan nama. Istana dijangka berkata sesuatu menjelang tengah hari.',
    options: ['Hadapi Dewan dan minta undi', 'Tawarkan tiga jawatan dalam kabinet', 'Minta masa daripada Istana'],
    results: [
      'Dewan penuh menjelang jam dua. Anda dilihat sebagai orang dengan rancangan. Undi itu rapat.',
      'Jawatan itu diambil. Kabinet kini lebih besar, begitu juga bilnya.',
      'Istana memberi masa. Ahli menggunakannya untuk mengira semula, dan ia berubah ke arah lain.',
    ],
  },
};
