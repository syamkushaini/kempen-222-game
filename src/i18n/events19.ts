import type { EventText } from './events';

// A story for each state that had none of its own, and two that any state meets (a building code, the haze and the schools), in English and
// Bahasa Malaysia. Every company and person is invented. A result written as a pair is for a gamble.

export const STATE_STORIES_EN: Record<string, EventText> = {
  waterMains: {
    title: 'The brown tap',
    body: 'Water from the taps in three districts has come out brown for a fortnight. The state water company says the mains are older than the people complaining about them, and that replacing them will cost more than the state has. The mosques are handing out bottles, which is more than the company is doing.',
    options: ['Pay for the worst stretches from the state’s own purse', 'Ask the federal government for the money, in public', 'Promise a phased plan and blame the old contractor'],
    results: [
      'The worst pipes were dug up first and the taps ran clear by the end of the month. The purse is thinner, and the villages remember who paid.',
      ['The federal money came with a photograph of a minister holding a spanner. The taps ran clear and everyone was briefly polite.', 'The request was filed, acknowledged and left. The taps are still brown, and now the whole country knows it.'],
      'A plan on paper holds water better than the pipes do. Some were soothed, and some wanted the water.',
    ],
  },
  royaltyAccount: {
    title: 'Where the royalty goes',
    body: 'The state’s share of the oil money has been paid, for years, to an agency in the capital that spends it on the state’s behalf. The opposition says it should be paid straight into the state’s own account, and has a petition. The agency says it is doing the state a favour, and has a brochure.',
    options: ['Demand it be paid to the state’s account', 'Keep the agency, and ask only for a say in how it spends', 'Put it to the assembly, and let the numbers decide'],
    results: [
      'The demand was loud and popular, and it cost you in the capital, where the doors close slowly and for a long time.',
      'The agency agreed to a seat for the state on its board. It was a quiet success, and it sounded like a surrender to those who wanted a fight.',
      ['The assembly voted with you and the figures were on your side. You came out of it looking like the one who had read the accounts.', 'The assembly voted, the figures were argued over, and the village meetings heard only that you could not make up your mind.'],
    ],
  },
  zoneIncentives: {
    title: 'The zone across the causeway',
    body: 'A special economic zone is to be marked out along the border with the island republic, and every company with a lawyer has asked for land at a discount. The investors want tax holidays. The farmers whose land is wanted want to know what a holiday has to do with them.',
    options: ['Offer the tax holidays and clear the land', 'Reserve the best land and the first jobs for locals', 'Slow down, and ask for the figures before any land is cleared'],
    results: [
      'The first factories opened in a year, and the shophouses along the road filled. The farmers who sold are not all in the pictures.',
      'The jobs went to the district’s own, and the investors grumbled and stayed. It cost the state some of the speed it had promised.',
      'The figures were produced eventually, and were not as bad as the rumours or as good as the brochure. Nobody enjoyed waiting.',
    ],
  },
  riverFines: {
    title: 'The factory on the river',
    body: 'The river that supplies the city has gone the colour of a bad cup of tea. The cause is a factory with no licence, whose owner has friends at the district office. The law lets you fine it a sum that the owner could pay from petty cash, and the people in the pictures are asking why.',
    options: ['Seize the premises and prosecute, whoever the owner knows', 'Fine it, give a deadline to clean up, and keep the jobs', 'Ask the assembly to raise the penalties, and see who objects'],
    results: [
      'The gates were chained within the week. The city was pleased, and the district’s small factories read the notice twice.',
      'The deadline was kept, mostly. The jobs were saved, and the city’s residents noticed that the fine had been small.',
      ['The assembly raised the penalties and the owner was among the first to pay. It looked like a law with a purpose.', 'The bill was watered down in committee by people with a stake in the river. The headline was about the compromise.'],
    ],
  },
  digUp: {
    title: 'The road is dug up',
    body: 'The new light rail line has taken the main road for the third year. The shopkeepers who used to have passing trade now have a hoarding, and some have put their stock in the back of vans. The contractor says the schedule is fixed. The shopkeepers say so is their rent.',
    options: ['Pay the worst-hit shops a monthly sum until the road reopens', 'Press the contractor to finish the worst stretch first', 'Say it is a federal project, and ask them to be patient'],
    results: [
      'The cheques went out, and the shopkeepers did not agree to like you, but they agreed to stay. The purse felt it.',
      'The worst stretch reopened a few months early. The contractor sulked, and the shops nearest it filled up again.',
      'It was true, and it was no consolation. Patience, you discovered, is not a thing a person can pay rent with.',
    ],
  },
  techValley: {
    title: 'The valley and the forest',
    body: 'A company wants a vast site near the old forest for a valley of factories making electric cars, and the planning application is a metre thick. Young people from the district have queued for the interviews. The environmental assessment, which is thicker, says the forest is the only thing between the site and the next flood.',
    options: ['Approve the site, with the assessment’s conditions in a footnote', 'Approve it on a smaller site, with the forest left alone', 'Ask for a second assessment, and tell the district it is for them'],
    results: [
      'The cranes came before the end of the year, and so did the jobs. The forest has fewer friends than the car factory does.',
      'The company grumbled and built a smaller thing than it wanted. The forest stayed, and the town’s young people took the jobs there were.',
      ['The second assessment found a better site, and the district got its factory and its trees. It looked like foresight.', 'The second assessment took a year, the company went to the next state, and the district’s young people read that in the paper.'],
    ],
  },
  padiGrants: {
    title: 'The grant that did not come',
    body: 'The irrigation money for the padi fields was promised in the capital in March and has not arrived. The farmers have planted anyway, and the canal gates are rusted. They are looking at the state government, because it is the nearest one.',
    options: ['Advance the money from the state’s purse, and claim it back later', 'Send a delegation to the ministry, with the farmers and the cameras', 'Say nothing, and wait for the capital to keep its word'],
    results: [
      'The gates were mended in time for the planting. The purse is lighter, and the farmers have decided you are their friend.',
      'The delegation was shown to a waiting room and then to a minister. The money was released a week later, and the cameras had the whole of it.',
      'You kept the peace in the capital and lost it in the fields. The padi was late, and the memory of that will be longer.',
    ],
  },
  highlandFarms: {
    title: 'The slope above the road',
    body: 'A farm has been cut into the hillside above the main road without a permit, and after a week of rain the slope has begun to move. The owner has a family and no other land. The road below has a bus on it every hour.',
    options: ['Order the farm cleared and the slope secured at once', 'Let the farmers stay, on terms, until the rains stop', 'Fund a survey, and decide when it is done'],
    results: [
      'The farm was cleared. There were tears and a petition, and the road stayed open.',
      'The farmers stayed, and the slope held until it did not. You were fortunate in the rain, or you were not.',
      'The survey was done and the rains stopped. The farm is in a file somewhere, and so, quietly, is the question.',
    ],
  },
  appointedSeats: {
    title: 'Seats by appointment',
    body: 'A bill before the assembly would let the state appoint seven additional members without an election, from lists drawn up by the parties. Supporters call it making room for talent. Opponents call it making room for friends, and have taken it to the High Court.',
    options: ['Press on, and make the case for it in public', 'Withdraw the bill, and say the voters should decide', 'Put it to your own members first, and see whether they will carry it'],
    results: [
      'The bill passed. Your members were pleased with the new seats. The voters did not enjoy being told what talent was.',
      'The bill was withdrawn with a statement about the voters. It cost you the support of those who wanted the seats, and bought some goodwill with those who did not.',
      ['Your members agreed, and the bill went through on a vote with no shouting. It looked like a decision, which is more than it had.', 'Your members did not agree, in public, with microphones on. The bill, and some goodwill, were lost.'],
    ],
  },
  sittingOverdue: {
    title: 'The assembly has not met',
    body: 'The constitution says the assembly must sit within six months of its last meeting. It has been seven. The clerk has written a letter, the opposition has written a longer one, and a lawyer has written to the newspapers to say the House may already have dissolved itself, which would be a first.',
    options: ['Call the sitting this week, and apologise for the delay', 'Say the House is in order, and put the lawyers to work', 'Ask the ruler for advice, and be seen to be doing so'],
    results: [
      'The sitting was called and the apology was brief. The opposition had fewer places to stand.',
      'The lawyers wrote, and the courts were asked. The question stayed open and the state’s business slowed. You were not thanked for the argument.',
      ['The ruler’s advice was kind and clear, and you followed it. It looked like respect for an old institution.', 'The advice, when published, was not the advice you had wanted. The papers noticed that you had asked.'],
    ],
  },
  borderStalls: {
    title: 'The border market',
    body: 'A hundred stalls at the border market trade without licences, and have done for thirty years. The council wants to count them and charge them. The traders say the market is the only reason the town has not emptied, and the town’s members, who eat there, agree.',
    options: ['Give them licences at a low fee, and build proper stalls', 'Enforce the rules, and move the traders to a new site', 'Leave it a little longer, and tell the council to wait'],
    results: [
      'The stalls were rebuilt in a year, and the market was cleaner and no worse. The council had its count, and the state paid for the bricks.',
      'The new site was tidy and a long walk from the road. Half the traders came. The others did not, and neither did their customers.',
      'The market carried on as it always had, and so did the quarrel. The council noted its objection, in writing, for later.',
    ],
  },
  plantationPapers: {
    title: 'Papers on the plantations',
    body: 'Inspectors have found that the registers on a dozen plantations do not match the people working on them. Some employers have no papers for their workers; some workers have no papers for themselves. The planters say the harvest cannot wait. The unions say the workers cannot be blamed for the paperwork of others.',
    options: ['Inspect every estate, and fine employers who do not register their workers', 'Give a grace period to register, with a hard date after it', 'Leave it to the federal agencies, and say it is not the state’s to decide'],
    results: [
      'The inspections were thorough and the fines were real. The workers were registered, the planters were bitter, and the register has not been so honest for years.',
      'The planters registered in a rush before the date and complained all the way. The unions called it fair, which is not a thing they say.',
      'The agencies took their time, and the problem waited with them. The state was not blamed, but it was not thanked either.',
    ],
  },
  carbonStorage: {
    title: 'The carbon deal',
    body: 'A company from abroad has offered to buy the right to store carbon underground in the old gas fields, and to pay the state a fee for every tonne. The money is large. The villages near the fields were not asked, and the fees would start before the first test well.',
    options: ['Sign, with a share of the fees for the villages nearby', 'Insist the villages are consulted first, and sign later', 'Put the state’s own company in front, and let it negotiate'],
    results: [
      'The deal was signed and the villages received a cheque and an apology. The money was real, and so was the unease.',
      'The villages were consulted, the company waited, and the terms improved. The delay cost the state some of the early money.',
      ['The state company drove a hard bargain, and the fees were higher than the first offer. It looked like a state that knew its own worth.', 'The state company made a poor bargain, and the first offer looked generous in hindsight. The newspapers were not kind.'],
    ],
  },
  buildingCode: {
    title: 'The new building code',
    body: 'After the tremor last month, which broke nothing but frightened everyone, the assembly has been asked to change the building rules so that new towers must withstand the next one. The developers say it will add a tenth to every price. The engineers say they would like to be asked before the next one, and not after.',
    options: ['Adopt the strict code for every new building', 'Adopt it for tall buildings and schools first, the rest later', 'Leave the code as it is, and ask for a study'],
    results: [
      'The strict code was passed. Prices rose, the engineers were pleased, and the developers wrote to the papers.',
      'The phased code was a sensible compromise, and a sensible compromise has few friends. The most vulnerable buildings were made safe first.',
      'The study was commissioned and the tremors, for now, did not return. The engineers said nothing, in a way that was heard.',
    ],
  },
  schoolClosures: {
    title: 'The haze and the schools',
    body: 'The air index is in the unhealthy range, and the federal rule says the schools may stay open until it is worse. The state may set its own rule. The parents are calling the office, half of them to ask you to close the schools, and half to ask who will mind the children if you do.',
    options: ['Close the schools in the worst districts today', 'Set a clear state rule: close above a number, and publish it', 'Keep to the federal rule, and watch the index'],
    results: [
      'The schools closed, and the parents who wanted that were glad, and the ones who had to find a childminder were not. The purse paid for the meals.',
      'The rule was published and obeyed, which made a change. Both kinds of parent could point to the number.',
      ['The index fell the next day and nobody remembered the worry. The rule had been right, by luck, which is as good as any.', 'The index rose that evening, and the pictures of children in masks were on every page. It looked like neglect.'],
    ],
  },
};

export const STATE_STORIES_MS: Record<string, EventText> = {
  waterMains: {
    title: 'Paip berwarna perang',
    body: 'Air paip di tiga daerah keluar berwarna perang sudah dua minggu. Syarikat air negeri berkata paip utama lebih tua daripada orang yang merungut, dan menggantinya akan menelan lebih daripada yang negeri ada. Masjid mengedarkan botol, yang lebih banyak daripada syarikat itu lakukan.',
    options: ['Bayar bahagian paling teruk daripada dana negeri sendiri', 'Minta wang daripada Persekutuan, secara terbuka', 'Janjikan pelan berperingkat dan salahkan kontraktor lama'],
    results: [
      'Paip yang paling teruk digali dahulu dan air jernih sebelum hujung bulan. Dana negeri menipis, dan kampung ingat siapa yang membayar.',
      ['Wang Persekutuan datang bersama gambar seorang menteri memegang sepana. Air jernih dan semua orang bersopan seketika.', 'Permohonan difailkan, diakui dan ditinggalkan. Air masih perang, dan kini seluruh negara tahu.'],
      'Pelan di atas kertas lebih tahan air daripada paip. Sebahagian reda, dan sebahagian mahukan airnya.',
    ],
  },
  royaltyAccount: {
    title: 'Ke mana royalti pergi',
    body: 'Bahagian negeri daripada wang minyak sudah bertahun dibayar kepada agensi di ibu negara yang membelanjakannya bagi pihak negeri. Pembangkang berkata ia patut dibayar terus ke akaun negeri sendiri, dan mempunyai petisyen. Agensi itu berkata ia sedang membuat budi kepada negeri, dan mempunyai risalah.',
    options: ['Tuntut ia dibayar ke akaun negeri', 'Kekalkan agensi itu, dan minta suara dalam cara ia berbelanja', 'Bawa ke dewan, dan biar angka yang menentukan'],
    results: [
      'Tuntutan itu lantang dan popular, dan ia merugikan anda di ibu negara, tempat pintu tertutup perlahan dan lama.',
      'Agensi bersetuju memberi negeri satu kerusi dalam lembaganya. Ia kejayaan senyap, dan bunyinya seperti penyerahan kepada mereka yang mahukan pergaduhan.',
      ['Dewan mengundi bersama anda dan angka di pihak anda. Anda kelihatan sebagai orang yang membaca akaun.', 'Dewan mengundi, angka diperdebatkan, dan mesyuarat kampung hanya mendengar bahawa anda tidak dapat membuat keputusan.'],
    ],
  },
  zoneIncentives: {
    title: 'Zon di seberang tambak',
    body: 'Sebuah zon ekonomi khas akan ditandakan di sepanjang sempadan dengan republik pulau, dan setiap syarikat yang mempunyai peguam sudah meminta tanah dengan diskaun. Pelabur mahukan cuti cukai. Petani yang tanahnya dikehendaki mahu tahu apa kaitan cuti dengan mereka.',
    options: ['Tawarkan cuti cukai dan bersihkan tanah', 'Simpan tanah terbaik dan pekerjaan pertama untuk penduduk tempatan', 'Perlahankan, dan minta angka sebelum sebarang tanah dibersihkan'],
    results: [
      'Kilang pertama dibuka dalam setahun, dan rumah kedai di tepi jalan penuh. Petani yang menjual tidak semuanya ada dalam gambar.',
      'Pekerjaan jatuh kepada orang daerah itu sendiri, dan pelabur merungut tetapi kekal. Negeri kehilangan sedikit kelajuan yang dijanjikan.',
      'Angka akhirnya dikeluarkan, dan tidak seburuk khabar angin atau sebaik risalah. Tiada siapa suka menunggu.',
    ],
  },
  riverFines: {
    title: 'Kilang di tepi sungai',
    body: 'Sungai yang membekalkan bandar sudah berwarna secawan teh yang buruk. Puncanya sebuah kilang tanpa lesen, yang pemiliknya mempunyai kawan di pejabat daerah. Undang-undang membenarkan denda yang boleh dibayar pemilik dari wang kecil, dan orang dalam gambar bertanya mengapa.',
    options: ['Rampas premis dan dakwa, siapa pun yang pemilik kenal', 'Denda, beri tarikh akhir untuk membersihkan, dan kekalkan pekerjaan', 'Minta dewan menaikkan penalti, dan lihat siapa membantah'],
    results: [
      'Pintu pagar dirantai dalam seminggu. Bandar gembira, dan kilang kecil di daerah itu membaca notis dua kali.',
      'Tarikh akhir dipatuhi, kebanyakannya. Pekerjaan selamat, dan penduduk bandar perasan dendanya kecil.',
      ['Dewan menaikkan penalti dan pemilik antara yang pertama membayar. Ia kelihatan seperti undang-undang yang ada tujuan.', 'Rang undang-undang dicairkan dalam jawatankuasa oleh orang yang berkepentingan pada sungai. Tajuk berita tentang kompromi itu.'],
    ],
  },
  digUp: {
    title: 'Jalan digali',
    body: 'Laluan transit aliran ringan yang baharu sudah menduduki jalan utama untuk tahun ketiga. Peniaga yang dahulu ada pelanggan lalu-lalang kini ada papan hadang, dan sebahagian sudah menyimpan stok di belakang van. Kontraktor berkata jadual itu tetap. Peniaga berkata begitu juga sewa mereka.',
    options: ['Bayar kedai yang paling terkesan sejumlah bulanan sehingga jalan dibuka semula', 'Desak kontraktor menyiapkan bahagian paling teruk dahulu', 'Katakan ia projek Persekutuan, dan minta mereka bersabar'],
    results: [
      'Cek dikeluarkan, dan peniaga tidak bersetuju menyukai anda, tetapi mereka bersetuju kekal. Dana negeri merasainya.',
      'Bahagian paling teruk dibuka semula beberapa bulan lebih awal. Kontraktor merajuk, dan kedai terdekat penuh semula.',
      'Ia benar, dan ia bukan penghiburan. Sabar, anda dapati, bukan sesuatu yang boleh dijadikan bayaran sewa.',
    ],
  },
  techValley: {
    title: 'Lembah dan hutan',
    body: 'Sebuah syarikat mahukan tapak luas berhampiran hutan lama untuk lembah kilang kereta elektrik, dan permohonan perancangan setebal sedepa. Anak muda daerah itu beratur untuk temu duga. Penilaian alam sekitar, yang lebih tebal, berkata hutan itulah satu-satunya penghalang antara tapak itu dengan banjir seterusnya.',
    options: ['Luluskan tapak itu, dengan syarat penilaian di nota kaki', 'Luluskan di tapak yang lebih kecil, dengan hutan dibiarkan', 'Minta penilaian kedua, dan beritahu daerah ia untuk kebaikan mereka'],
    results: [
      'Kren datang sebelum hujung tahun, begitu juga pekerjaan. Hutan mempunyai lebih sedikit kawan daripada kilang kereta.',
      'Syarikat merungut dan membina yang lebih kecil daripada yang diingininya. Hutan kekal, dan anak muda pekan mengambil pekerjaan yang ada.',
      ['Penilaian kedua menemui tapak yang lebih baik, dan daerah mendapat kilang serta pokoknya. Ia kelihatan seperti pandangan jauh.', 'Penilaian kedua mengambil setahun, syarikat pergi ke negeri sebelah, dan anak muda daerah membaca itu dalam akhbar.'],
    ],
  },
  padiGrants: {
    title: 'Geran yang tidak sampai',
    body: 'Wang pengairan untuk sawah padi dijanjikan di ibu negara pada bulan Mac dan belum tiba. Petani sudah menanam juga, dan pintu air berkarat. Mereka memandang kerajaan negeri, kerana itulah yang paling dekat.',
    options: ['Dahulukan wang daripada dana negeri, dan tuntut semula kemudian', 'Hantar delegasi ke kementerian, bersama petani dan kamera', 'Diam, dan tunggu ibu negara menepati janji'],
    results: [
      'Pintu air dibaiki tepat pada masa menanam. Dana negeri lebih ringan, dan petani sudah memutuskan anda kawan mereka.',
      'Delegasi ditunjukkan ke bilik menunggu kemudian ke seorang menteri. Wang dikeluarkan seminggu kemudian, dan kamera merakamkan semuanya.',
      'Anda menjaga keamanan di ibu negara dan kehilangannya di sawah. Padi lewat, dan ingatan itu akan lebih lama.',
    ],
  },
  highlandFarms: {
    title: 'Cerun di atas jalan',
    body: 'Sebuah ladang telah dipotong ke lereng bukit di atas jalan utama tanpa permit, dan selepas seminggu hujan cerun itu mula bergerak. Pemiliknya ada keluarga dan tiada tanah lain. Di jalan di bawah ada bas setiap jam.',
    options: ['Perintah ladang dikosongkan dan cerun diselamatkan serta-merta', 'Biarkan petani kekal, dengan syarat, sehingga hujan berhenti', 'Biayai tinjauan, dan putuskan selepas ia siap'],
    results: [
      'Ladang dikosongkan. Ada air mata dan petisyen, dan jalan kekal terbuka.',
      'Petani kekal, dan cerun bertahan sehingga ia tidak. Anda bernasib baik dengan hujan, atau tidak.',
      'Tinjauan dibuat dan hujan berhenti. Ladang itu ada dalam sebuah fail di mana-mana, dan begitu juga, senyap-senyap, soalan itu.',
    ],
  },
  appointedSeats: {
    title: 'Kerusi melalui pelantikan',
    body: 'Satu rang undang-undang di dewan akan membenarkan negeri melantik tujuh ahli tambahan tanpa pilihan raya, daripada senarai yang disediakan parti. Penyokong menyebutnya memberi ruang kepada bakat. Penentang menyebutnya memberi ruang kepada kawan, dan sudah membawanya ke Mahkamah Tinggi.',
    options: ['Teruskan, dan bela rang itu di khalayak', 'Tarik balik rang itu, dan katakan pengundi patut memutuskan', 'Bawa kepada ahli sendiri dahulu, dan lihat sama ada mereka akan menanggungnya'],
    results: [
      'Rang itu diluluskan. Ahli anda gembira dengan kerusi baharu. Pengundi tidak suka diberitahu apa itu bakat.',
      'Rang itu ditarik balik dengan kenyataan tentang pengundi. Ia merugikan sokongan mereka yang mahukan kerusi, dan membeli sedikit muhibah daripada yang tidak.',
      ['Ahli anda bersetuju, dan rang itu lulus dalam undian tanpa jeritan. Ia kelihatan seperti keputusan, yang lebih daripada yang ada sebelumnya.', 'Ahli anda tidak bersetuju, di khalayak, dengan mikrofon terpasang. Rang itu, dan sedikit muhibah, hilang.'],
    ],
  },
  sittingOverdue: {
    title: 'Dewan belum bersidang',
    body: 'Perlembagaan berkata dewan mesti bersidang dalam enam bulan selepas mesyuarat terakhirnya. Sudah tujuh. Kerani menulis surat, pembangkang menulis yang lebih panjang, dan seorang peguam menulis kepada akhbar bahawa Dewan mungkin sudah membubarkan dirinya, yang akan menjadi kali pertama.',
    options: ['Panggil persidangan minggu ini, dan mohon maaf atas kelewatan', 'Katakan Dewan teratur, dan suruh peguam bekerja', 'Minta nasihat Raja, dan kelihatan berbuat demikian'],
    results: [
      'Persidangan dipanggil dan permohonan maaf ringkas. Pembangkang mempunyai lebih sedikit tempat untuk berdiri.',
      'Peguam menulis, dan mahkamah diminta. Soalan itu kekal terbuka dan urusan negeri perlahan. Anda tidak diucapkan terima kasih atas hujah itu.',
      ['Nasihat Raja baik dan jelas, dan anda mengikutinya. Ia kelihatan seperti hormat kepada institusi lama.', 'Nasihat itu, bila diumumkan, bukan yang anda mahukan. Akhbar perasan anda sudah bertanya.'],
    ],
  },
  borderStalls: {
    title: 'Pasar sempadan',
    body: 'Seratus gerai di pasar sempadan berniaga tanpa lesen, dan sudah tiga puluh tahun. Majlis mahu mengira dan mengenakan bayaran. Peniaga berkata pasar itulah satu-satunya sebab pekan tidak kosong, dan ahli pekan itu, yang makan di situ, bersetuju.',
    options: ['Beri lesen dengan yuran rendah, dan bina gerai yang sempurna', 'Kuatkuasakan peraturan, dan pindahkan peniaga ke tapak baharu', 'Biarkan lebih lama sedikit, dan suruh majlis menunggu'],
    results: [
      'Gerai dibina semula dalam setahun, dan pasar lebih bersih dan tidak lebih buruk. Majlis mendapat kiraannya, dan negeri membayar batanya.',
      'Tapak baharu kemas dan jauh dari jalan. Separuh peniaga datang. Yang lain tidak, begitu juga pelanggan mereka.',
      'Pasar berjalan seperti biasa, begitu juga pertelingkahan itu. Majlis mencatat bantahannya, secara bertulis, untuk kemudian.',
    ],
  },
  plantationPapers: {
    title: 'Dokumen di ladang',
    body: 'Pemeriksa mendapati daftar di sedozen ladang tidak sepadan dengan orang yang bekerja di situ. Sesetengah majikan tiada dokumen untuk pekerja mereka; sesetengah pekerja tiada dokumen untuk diri sendiri. Pengusaha ladang berkata tuaian tidak boleh menunggu. Kesatuan berkata pekerja tidak boleh disalahkan atas urusan kertas orang lain.',
    options: ['Periksa setiap estet, dan denda majikan yang tidak mendaftar pekerjanya', 'Beri tempoh bertolak ansur untuk mendaftar, dengan tarikh tegas selepas itu', 'Serahkan kepada agensi Persekutuan, dan katakan ia bukan hak negeri untuk memutuskan'],
    results: [
      'Pemeriksaan teliti dan denda nyata. Pekerja didaftarkan, pengusaha ladang pahit, dan daftar itu tidak pernah sejujur ini selama bertahun-tahun.',
      'Pengusaha ladang mendaftar bergegas sebelum tarikh itu dan merungut sepanjang jalan. Kesatuan menyebutnya adil, yang bukan perkara yang mereka katakan.',
      'Agensi mengambil masa, dan masalah itu menunggu bersama mereka. Negeri tidak disalahkan, tetapi tidak juga diucapkan terima kasih.',
    ],
  },
  carbonStorage: {
    title: 'Perjanjian karbon',
    body: 'Sebuah syarikat luar negara menawarkan untuk membeli hak menyimpan karbon di bawah tanah dalam medan gas lama, dan membayar negeri yuran bagi setiap tan. Wangnya besar. Kampung berhampiran medan itu tidak ditanya, dan yuran akan bermula sebelum telaga ujian pertama.',
    options: ['Tandatangani, dengan sebahagian yuran untuk kampung berhampiran', 'Tegaskan kampung dirunding dahulu, dan tandatangani kemudian', 'Letakkan syarikat negeri di hadapan, dan biar ia berunding'],
    results: [
      'Perjanjian ditandatangani dan kampung menerima cek dan permohonan maaf. Wangnya nyata, begitu juga rasa tidak senang itu.',
      'Kampung dirunding, syarikat menunggu, dan syarat bertambah baik. Kelewatan itu merugikan negeri sebahagian wang awal.',
      ['Syarikat negeri berunding dengan tegas, dan yuran lebih tinggi daripada tawaran pertama. Ia kelihatan seperti negeri yang tahu nilainya sendiri.', 'Syarikat negeri membuat tawar-menawar yang buruk, dan tawaran pertama kelihatan murah hati kemudian. Akhbar tidak berlembut.'],
    ],
  },
  buildingCode: {
    title: 'Kod bangunan baharu',
    body: 'Selepas gegaran bulan lalu, yang tidak memecahkan apa-apa tetapi menakutkan semua orang, dewan diminta mengubah peraturan bangunan supaya menara baharu mesti tahan gegaran seterusnya. Pemaju berkata ia menambah sepersepuluh kepada setiap harga. Jurutera berkata mereka mahu ditanya sebelum yang seterusnya, bukan selepas.',
    options: ['Terima pakai kod yang ketat untuk setiap bangunan baharu', 'Terima pakai untuk bangunan tinggi dan sekolah dahulu, selebihnya kemudian', 'Biarkan kod seperti sedia ada, dan minta kajian'],
    results: [
      'Kod yang ketat diluluskan. Harga naik, jurutera gembira, dan pemaju menulis kepada akhbar.',
      'Kod berperingkat itu kompromi yang munasabah, dan kompromi yang munasabah mempunyai sedikit kawan. Bangunan paling terdedah diselamatkan dahulu.',
      'Kajian ditugaskan dan gegaran, buat masa ini, tidak kembali. Jurutera tidak berkata apa-apa, dengan cara yang didengari.',
    ],
  },
  schoolClosures: {
    title: 'Jerebu dan sekolah',
    body: 'Indeks udara berada dalam julat tidak sihat, dan peraturan Persekutuan berkata sekolah boleh kekal buka sehingga lebih teruk. Negeri boleh menetapkan peraturannya sendiri. Ibu bapa menelefon pejabat, separuh meminta anda menutup sekolah, dan separuh bertanya siapa yang akan menjaga anak jika anda berbuat begitu.',
    options: ['Tutup sekolah di daerah paling teruk hari ini', 'Tetapkan peraturan negeri yang jelas: tutup melebihi satu angka, dan umumkan', 'Ikut peraturan Persekutuan, dan perhatikan indeks'],
    results: [
      'Sekolah ditutup, dan ibu bapa yang mahukannya gembira, dan yang terpaksa mencari pengasuh tidak. Dana negeri membayar makanan.',
      'Peraturan diumumkan dan dipatuhi, yang suatu perubahan. Kedua-dua jenis ibu bapa boleh menunjuk kepada angka itu.',
      ['Indeks turun keesokan harinya dan tiada siapa ingat kebimbangan itu. Peraturan itu betul, secara kebetulan, yang sama baiknya.', 'Indeks naik petang itu, dan gambar kanak-kanak bermasker ada di setiap muka surat. Ia kelihatan seperti kecuaian.'],
    ],
  },
};
