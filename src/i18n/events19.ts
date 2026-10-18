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
    body: 'Air paip di tiga daerah keluar warna perang dah dua minggu. Syarikat air negeri kata paip utama lagi tua daripada orang yang merungut, dan nak tukar kosnya lebih daripada yang negeri ada. Masjid edarkan botol air, lebih banyak daripada apa syarikat tu buat.',
    options: ['Bayar bahagian paling teruk daripada dana negeri sendiri', 'Minta duit daripada Persekutuan, depan orang ramai', 'Janji pelan berperingkat dan salahkan kontraktor lama'],
    results: [
      'Paip paling teruk digali dulu dan air jernih sebelum hujung bulan. Dana negeri menipis, dan kampung ingat siapa yang bayar.',
      ['Duit Persekutuan datang bersama gambar seorang menteri pegang sepana. Air jernih dan semua orang bersopan sekejap.', 'Permohonan difailkan, diakui dan dibiarkan. Air masih perang, dan sekarang seluruh negara tahu.'],
      'Pelan atas kertas lebih tahan air daripada paip. Ada yang reda, ada yang nakkan airnya.',
    ],
  },
  royaltyAccount: {
    title: 'Ke mana royalti pergi',
    body: 'Bahagian negeri daripada duit minyak dah bertahun dibayar kepada agensi di ibu negara yang belanjakan bagi pihak negeri. Pembangkang kata ia patut dibayar terus ke akaun negeri sendiri, dan ada petisyen. Agensi tu kata ia tengah buat budi kepada negeri, dan ada risalah.',
    options: ['Tuntut ia dibayar ke akaun negeri', 'Kekalkan agensi tu, dan minta suara dalam cara ia berbelanja', 'Bawa ke dewan, dan biar angka yang tentukan'],
    results: [
      'Tuntutan lantang dan popular, tapi ia merugikan anda di ibu negara, tempat pintu tertutup perlahan dan lama.',
      'Agensi setuju beri negeri satu kerusi dalam lembaganya. Kejayaan senyap, dan bunyinya macam menyerah kepada mereka yang nakkan pergaduhan.',
      ['Dewan undi bersama anda dan angka di pihak anda. Anda nampak macam orang yang baca akaun.', 'Dewan mengundi, angka diperdebatkan, dan mesyuarat kampung cuma dengar yang anda tak boleh buat keputusan.'],
    ],
  },
  zoneIncentives: {
    title: 'Zon di seberang tambak',
    body: 'Sebuah zon ekonomi khas akan ditandakan sepanjang sempadan dengan republik pulau, dan setiap syarikat yang ada peguam dah minta tanah dengan diskaun. Pelabur nakkan cuti cukai. Petani yang tanahnya dikehendaki nak tahu apa kaitan cuti dengan mereka.',
    options: ['Tawar cuti cukai dan bersihkan tanah', 'Simpan tanah terbaik dan pekerjaan pertama untuk penduduk tempatan', 'Perlahankan, dan minta angka sebelum tanah dibersihkan'],
    results: [
      'Kilang pertama dibuka dalam setahun, dan rumah kedai di tepi jalan penuh. Petani yang menjual tak semuanya ada dalam gambar.',
      'Pekerjaan jatuh kepada orang daerah sendiri, dan pelabur merungut tapi kekal. Negeri kehilangan sikit kelajuan yang dijanjikan.',
      'Angka akhirnya dikeluarkan, dan tak seteruk khabar angin atau sebaik risalah. Tak ada siapa suka menunggu.',
    ],
  },
  riverFines: {
    title: 'Kilang di tepi sungai',
    body: 'Sungai yang bekalkan bandar dah jadi warna secawan teh yang buruk. Puncanya sebuah kilang tanpa lesen, yang pemiliknya ada kawan di pejabat daerah. Undang-undang bagi denda yang pemilik boleh bayar dari duit kecil, dan orang dalam gambar tanya kenapa.',
    options: ['Rampas premis dan dakwa, siapa pun yang pemilik kenal', 'Denda, beri tarikh akhir untuk bersihkan, dan kekalkan pekerjaan', 'Minta dewan naikkan penalti, dan tengok siapa membantah'],
    results: [
      'Pintu pagar dirantai dalam seminggu. Bandar gembira, dan kilang kecil di daerah tu baca notis dua kali.',
      'Tarikh akhir dipatuhi, kebanyakannya. Pekerjaan selamat, dan penduduk bandar perasan dendanya kecil.',
      ['Dewan naikkan penalti dan pemilik antara yang pertama bayar. Nampak macam undang-undang yang ada tujuan.', 'Rang undang-undang dicairkan dalam jawatankuasa oleh orang yang berkepentingan pada sungai. Tajuk berita pasal kompromi tu.'],
    ],
  },
  digUp: {
    title: 'Jalan digali',
    body: 'Laluan transit aliran ringan yang baharu dah duduki jalan utama untuk tahun ketiga. Peniaga yang dulu ada pelanggan lalu-lalang sekarang ada papan hadang, dan sebahagian dah simpan stok dalam van. Kontraktor kata jadual tu tetap. Peniaga kata sewa mereka pun tetap.',
    options: ['Bayar kedai yang paling terkesan sejumlah bulanan sampai jalan dibuka semula', 'Desak kontraktor siapkan bahagian paling teruk dulu', 'Kata ia projek Persekutuan, dan minta mereka bersabar'],
    results: [
      'Cek dikeluarkan, dan peniaga tak setuju nak suka anda, tapi setuju untuk kekal. Dana negeri rasa.',
      'Bahagian paling teruk dibuka semula beberapa bulan lebih awal. Kontraktor merajuk, dan kedai terdekat penuh semula.',
      'Memang benar, dan bukan penghiburan. Sabar, anda dapati, bukan benda yang boleh dijadikan bayaran sewa.',
    ],
  },
  techValley: {
    title: 'Lembah dan hutan',
    body: 'Sebuah syarikat nakkan tapak luas dekat hutan lama untuk lembah kilang kereta elektrik, dan permohonan perancangan setebal sedepa. Anak muda daerah tu beratur untuk temu duga. Penilaian alam sekitar, yang lebih tebal, kata hutan tu satu-satunya penghalang antara tapak tu dengan banjir seterusnya.',
    options: ['Luluskan tapak tu, dengan syarat penilaian di nota kaki', 'Luluskan di tapak yang lebih kecil, dengan hutan dibiarkan', 'Minta penilaian kedua, dan beritahu daerah ia untuk kebaikan mereka'],
    results: [
      'Kren datang sebelum hujung tahun, pekerjaan pun sama. Hutan ada lebih sikit kawan daripada kilang kereta.',
      'Syarikat merungut dan bina yang lebih kecil daripada yang diinginkan. Hutan kekal, dan anak muda pekan ambil pekerjaan yang ada.',
      ['Penilaian kedua jumpa tapak yang lebih baik, dan daerah dapat kilang dan pokoknya. Nampak macam pandangan jauh.', 'Penilaian kedua ambil setahun, syarikat pergi ke negeri sebelah, dan anak muda daerah baca hal tu dalam akhbar.'],
    ],
  },
  padiGrants: {
    title: 'Geran yang tak sampai',
    body: 'Duit pengairan untuk sawah padi dijanjikan di ibu negara bulan Mac dan belum tiba. Petani dah menanam juga, dan pintu air berkarat. Mereka pandang kerajaan negeri, sebab itulah yang paling dekat.',
    options: ['Dahulukan duit daripada dana negeri, dan tuntut balik kemudian', 'Hantar delegasi ke kementerian, bersama petani dan kamera', 'Diam, dan tunggu ibu negara tunaikan janji'],
    results: [
      'Pintu air dibaiki tepat masa menanam. Dana negeri lebih ringan, dan petani dah putuskan anda kawan mereka.',
      'Delegasi ditunjuk ke bilik menunggu lepas tu ke seorang menteri. Duit dikeluarkan seminggu kemudian, dan kamera rakam semuanya.',
      'Anda jaga keamanan di ibu negara dan kehilangannya di sawah. Padi lewat, dan ingatan tu akan lebih lama.',
    ],
  },
  highlandFarms: {
    title: 'Cerun di atas jalan',
    body: 'Sebuah ladang dipotong ke lereng bukit di atas jalan utama tanpa permit, dan lepas seminggu hujan cerun tu mula bergerak. Pemiliknya ada keluarga dan tak ada tanah lain. Di jalan bawah ada bas setiap jam.',
    options: ['Perintah ladang dikosongkan dan cerun diselamatkan serta-merta', 'Biar petani kekal, dengan syarat, sampai hujan berhenti', 'Biayai tinjauan, dan putuskan lepas siap'],
    results: [
      'Ladang dikosongkan. Ada air mata dan petisyen, dan jalan kekal terbuka.',
      'Petani kekal, dan cerun bertahan sampai ia tak. Anda bernasib baik dengan hujan, atau tidak.',
      'Tinjauan dibuat dan hujan berhenti. Ladang tu ada dalam fail di mana-mana, dan soalan tu pun sama, senyap-senyap.',
    ],
  },
  appointedSeats: {
    title: 'Kerusi melalui pelantikan',
    body: 'Satu rang undang-undang di dewan akan benarkan negeri lantik tujuh ahli tambahan tanpa pilihan raya, daripada senarai yang disediakan parti. Penyokong panggil ia beri ruang kepada bakat. Penentang panggil ia beri ruang kepada kawan, dan dah bawa ke Mahkamah Tinggi.',
    options: ['Teruskan, dan bela rang tu depan orang ramai', 'Tarik balik rang tu, dan kata pengundi patut putuskan', 'Bawa kepada ahli sendiri dulu, dan tengok sama ada mereka sanggup tanggung'],
    results: [
      'Rang tu lulus. Ahli anda gembira dengan kerusi baharu. Pengundi tak suka kena beritahu apa itu bakat.',
      'Rang tu ditarik balik dengan kenyataan pasal pengundi. Ia rugikan sokongan mereka yang nakkan kerusi, dan beli sikit muhibah daripada yang tak.',
      ['Ahli anda setuju, dan rang tu lulus dalam undian tanpa jerit-jerit. Nampak macam keputusan, yang lebih daripada apa yang ada sebelum ni.', 'Ahli anda tak setuju, depan orang ramai, dengan mikrofon terpasang. Rang tu, dan sikit muhibah, hilang.'],
    ],
  },
  sittingOverdue: {
    title: 'Dewan belum bersidang',
    body: 'Perlembagaan kata dewan mesti bersidang dalam enam bulan selepas mesyuarat terakhirnya. Dah tujuh. Kerani tulis surat, pembangkang tulis yang lebih panjang, dan seorang peguam tulis kepada akhbar yang Dewan mungkin dah bubarkan dirinya sendiri, yang akan jadi kali pertama.',
    options: ['Panggil persidangan minggu ni, dan mohon maaf atas kelewatan', 'Kata Dewan teratur, dan suruh peguam bekerja', 'Minta nasihat Raja, dan nampak berbuat macam tu'],
    results: [
      'Persidangan dipanggil dan maaf ringkas. Pembangkang ada lebih sikit tempat untuk berdiri.',
      'Peguam menulis, dan mahkamah diminta. Soalan tu kekal terbuka dan urusan negeri perlahan. Anda tak diucap terima kasih atas hujah tu.',
      ['Nasihat Raja baik dan jelas, dan anda ikutnya. Nampak macam hormat kepada institusi lama.', 'Nasihat tu, bila diumumkan, bukan yang anda nakkan. Akhbar perasan anda dah bertanya.'],
    ],
  },
  borderStalls: {
    title: 'Pasar sempadan',
    body: 'Seratus gerai di pasar sempadan berniaga tanpa lesen, dan dah tiga puluh tahun. Majlis nak kira dan kenakan bayaran. Peniaga kata pasar tu satu-satunya sebab pekan tak kosong, dan wakil rakyat pekan tu, yang makan di situ, setuju.',
    options: ['Beri lesen dengan yuran rendah, dan bina gerai yang sempurna', 'Kuatkuasakan peraturan, dan pindahkan peniaga ke tapak baharu', 'Biar lebih lama sikit, dan suruh majlis menunggu'],
    results: [
      'Gerai dibina semula dalam setahun, dan pasar lebih bersih dan tak lebih teruk. Majlis dapat kiraannya, dan negeri bayar batanya.',
      'Tapak baharu kemas dan jauh dari jalan. Separuh peniaga datang. Yang lain tak, pelanggan mereka pun sama.',
      'Pasar berjalan macam biasa, pertelingkahan pun sama. Majlis catat bantahannya, secara bertulis, untuk kemudian.',
    ],
  },
  plantationPapers: {
    title: 'Dokumen di ladang',
    body: 'Pemeriksa dapati daftar di sedozen ladang tak sepadan dengan orang yang bekerja di situ. Ada majikan tak ada dokumen untuk pekerja mereka; ada pekerja tak ada dokumen untuk diri sendiri. Pengusaha ladang kata tuaian tak boleh menunggu. Kesatuan kata pekerja tak boleh disalahkan atas urusan kertas orang lain.',
    options: ['Periksa setiap estet, dan denda majikan yang tak daftarkan pekerjanya', 'Beri tempoh bertolak ansur untuk mendaftar, dengan tarikh tegas lepas tu', 'Serahkan kepada agensi Persekutuan, dan kata ia bukan hak negeri untuk putuskan'],
    results: [
      'Pemeriksaan teliti dan denda nyata. Pekerja didaftarkan, pengusaha ladang pahit, dan daftar tu tak pernah sejujur ni bertahun-tahun.',
      'Pengusaha ladang mendaftar bergegas sebelum tarikh tu dan merungut sepanjang jalan. Kesatuan panggil ia adil, yang bukan benda yang mereka cakap.',
      'Agensi ambil masa, dan masalah tu menunggu bersama mereka. Negeri tak disalahkan, tapi tak diucap terima kasih juga.',
    ],
  },
  carbonStorage: {
    title: 'Perjanjian karbon',
    body: 'Sebuah syarikat luar negara tawar nak beli hak simpan karbon di bawah tanah dalam medan gas lama, dan bayar negeri yuran bagi setiap tan. Duitnya besar. Kampung berhampiran medan tu tak ditanya, dan yuran akan bermula sebelum telaga ujian pertama.',
    options: ['Tandatangan, dengan sebahagian yuran untuk kampung berhampiran', 'Tegaskan kampung dirunding dulu, dan tandatangan kemudian', 'Letak syarikat negeri di depan, dan biar ia berunding'],
    results: [
      'Perjanjian ditandatangani dan kampung terima cek dan permohonan maaf. Duitnya nyata, rasa tak senang pun sama.',
      'Kampung dirunding, syarikat menunggu, dan syarat bertambah baik. Kelewatan tu rugikan negeri sebahagian duit awal.',
      ['Syarikat negeri berunding dengan tegas, dan yuran lebih tinggi daripada tawaran pertama. Nampak macam negeri yang tahu nilai sendiri.', 'Syarikat negeri buat tawar-menawar yang buruk, dan tawaran pertama nampak murah hati kemudian. Akhbar tak berlembut.'],
    ],
  },
  buildingCode: {
    title: 'Kod bangunan baharu',
    body: 'Lepas gegaran bulan lepas, yang tak pecahkan apa-apa tapi takutkan semua orang, dewan diminta ubah peraturan bangunan supaya menara baharu mesti tahan gegaran seterusnya. Pemaju kata ia tambah sepersepuluh pada setiap harga. Jurutera kata mereka nak ditanya sebelum yang seterusnya, bukan selepas.',
    options: ['Terima pakai kod yang ketat untuk setiap bangunan baharu', 'Terima pakai untuk bangunan tinggi dan sekolah dulu, selebihnya kemudian', 'Biar kod macam sedia ada, dan minta kajian'],
    results: [
      'Kod yang ketat diluluskan. Harga naik, jurutera gembira, dan pemaju tulis kepada akhbar.',
      'Kod berperingkat tu kompromi yang munasabah, dan kompromi yang munasabah ada sikit kawan. Bangunan paling terdedah diselamatkan dulu.',
      'Kajian ditugaskan dan gegaran, buat masa ni, tak kembali. Jurutera tak cakap apa-apa, dengan cara yang kedengaran.',
    ],
  },
  schoolClosures: {
    title: 'Jerebu dan sekolah',
    body: 'Indeks udara dalam julat tak sihat, dan peraturan Persekutuan kata sekolah boleh kekal buka sampai lagi teruk. Negeri boleh tetapkan peraturan sendiri. Ibu bapa telefon pejabat, separuh minta anda tutup sekolah, separuh lagi tanya siapa nak jaga anak kalau anda buat macam tu.',
    options: ['Tutup sekolah di daerah paling teruk hari ni', 'Tetapkan peraturan negeri yang jelas: tutup bila melebihi satu angka, dan umumkan', 'Ikut peraturan Persekutuan, dan perhatikan indeks'],
    results: [
      'Sekolah ditutup, dan ibu bapa yang nakkannya gembira, yang terpaksa cari pengasuh tak. Dana negeri bayar makanan.',
      'Peraturan diumumkan dan dipatuhi, satu perubahan. Dua-dua jenis ibu bapa boleh tunjuk pada angka tu.',
      ['Indeks turun esoknya dan tak ada siapa ingat kebimbangan tu. Peraturan tu betul, secara kebetulan, yang sama baik juga.', 'Indeks naik petang tu, dan gambar kanak-kanak bermasker ada di setiap muka surat. Nampak macam cuai.'],
    ],
  },
};
