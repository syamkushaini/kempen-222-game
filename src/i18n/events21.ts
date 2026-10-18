import type { EventText } from './events';

// Eleven stories of the Selangor state government, in English and Bahasa Malaysia. Every place and person is invented. A result written as a pair is for a gamble.

export const SELANGOR_STORIES_EN: Record<string, EventText> = {
  riverfrontLease: {
    title: 'The Riverfront Has a Landlord',
    body: 'A strip of state-owned riverfront land beside Kampung Teluk Rumbia has become an unofficial weekend market. Traders have paid for their own lights and bins, while a developer offers a polished lease proposal with a model café that appears to have no toilets. The district council wants a decision before the next market day.',
    options: ['Issue short-term trader permits', 'Lease the site to the developer', 'Run a competitive public tender'],
    results: [
      'Traders gain certainty and the market stays lively, but enforcement and sanitation costs fall on the state. The budget takes a hit.',
      'The proposed investment looks tidy in the brochure and reassures property interests, but existing traders lose their spots. Urban B40 support softens.',
      'The process improves credibility and may raise lease income, but the delay annoys traders and costs administrative funds.',
    ],
  },
  hillSlopeAudit: {
    title: 'A Slope with a Paper Trail',
    body: 'Residents of Taman Bukit Serai send the state a video of cracks spreading across a hillside road after a small earth slip. The developer says the slope was handed over years ago; the local authority\'s file contains three inspection forms and no clear maintenance owner. Engineers want access before the next heavy rain, and everyone wants the bill sent elsewhere.',
    options: ['Fund an urgent independent inspection', 'Order the developer to repair first', 'Close the road and investigate ownership'],
    results: [
      'Residents get a faster risk assessment and civil servants gain a defensible record, but emergency funds shrink before the cause is settled.',
      'The state protects its budget and satisfies residents who want accountability, but the developer may challenge the order and delay repairs.',
      'Safety comes first and the ownership dispute is documented, but commuters and nearby businesses pay for the detour and the closure irritates them.',
    ],
  },
  marketStallLottery: {
    title: 'The Great Stall Allocation',
    body: 'The new covered market in Pekan Lalang has 48 stalls and 173 applicants. The old handwritten list has duplicate names, one stall reserved for a person described only as \'the uncle who knows the wiring\', and a councillor\'s office keeps calling. Opening day is ten days away.',
    options: ['Use a witnessed public ballot', 'Score applicants on published criteria', 'Extend the opening to verify every file'],
    results: [
      'The process is visible and cheap, but some experienced traders lose out to chance and complain loudly. Credibility rises while small-business support splits.',
      'Experienced and compliant traders benefit from a scoring system, but staff time and verification costs rise; applicants dispute the marks.',
      'The state avoids a rushed allocation and protects fairness, but traders lose a week or more of income and the opening becomes a political joke.',
    ],
  },
  heritageShopfronts: {
    title: 'Paint It Heritage Beige',
    body: 'Shop owners along Jalan Kendi say a proposed heritage zone will force them to replace signboards, awnings and air-conditioning units. Conservation groups want the old shophouse frontage protected; traders say customers cannot find their shops behind identical beige boards. The state heritage committee needs a rule before renovation season begins.',
    options: ['Offer matching grants for compliant renovations', 'Enforce strict frontage guidelines immediately', 'Allow a flexible design code with local review'],
    results: [
      'Heritage advocates get visible improvements and owners receive help, but the grant pot costs money and larger businesses can match funds more easily.',
      'Conservation groups applaud the clear line and enforcement is simple, but small traders face upfront costs and may cut jobs or delay repairs.',
      'Traders gain room to adapt and the zone feels less artificial, but inconsistent decisions anger preservation advocates and require more council staff.',
    ],
  },
  strayAnimalContract: {
    title: 'The Kennel with No Dogs',
    body: 'Residents near a proposed animal holding centre in Taman Purnama find a contractor\'s signboard installed before the public briefing. The contractor says the site is only for temporary holding; residents worry about noise, cleanliness and whether the tender was written for one company. The land-use approval can be reviewed, but the council needs a decision this week.',
    options: ['Hold a public hearing and pause approval', 'Proceed with stricter operating conditions', 'Move the facility to a less populated site'],
    results: [
      'Residents feel heard and the tender can be examined, but animal welfare groups wait longer and the review costs staff time.',
      'The service can start sooner and the contractor faces measurable rules, but residents remain sceptical and monitoring adds recurring cost.',
      'Nearby residents are relieved and the dispute cools, but a new site costs more and another neighbourhood may object in turn.',
    ],
  },
  drainageReserve: {
    title: 'A Park, a Drain, and 600 Signatures',
    body: 'A residents\' association in Desa Melur gathers 600 signatures against a proposal to turn a narrow green reserve into a major drainage corridor. Engineers say the corridor would reduce local flooding; parents point to the only shaded playground within walking distance. The state has a limited window to secure the land before adjacent lots change hands.',
    options: ['Build the full drainage corridor', 'Redesign it around a smaller green park', 'Acquire nearby land for a wider alternative'],
    results: [
      'Flood-risk planning gets the strongest engineering option, but the playground disappears and residents feel ignored. The project consumes a large allocation.',
      'The neighbourhood keeps some usable green space and engineers get partial capacity, but redesign work costs money and the drainage benefit is smaller.',
      'The park is protected and the corridor can be wider, but land acquisition is expensive and affected owners challenge the valuation.',
    ],
  },
  waterMeterDispute: {
    title: 'The Meter That Counts Twice',
    body: 'A state water concession\'s new digital meters report unusually high usage in 1,200 flats at Pangsapuri Seri Angsana. The operator blames old internal pipes; residents show bills that doubled overnight and a spreadsheet of identical readings. The state can require an audit of the concession\'s service obligations, but it cannot simply wish the invoices away.',
    options: ['Order an independent meter audit', 'Require temporary bill reviews for disputed cases', 'Back the operator pending technical evidence'],
    results: [
      'Residents gain an independent route to challenge readings and trust improves, but the audit costs money and may take weeks.',
      'Households with clear disputes get relief from uncertainty, but the case-by-case process is slow and the operator resents extra administration.',
      'The state avoids premature intervention and reassures investors, but residents see the government as siding with the concession and trust falls.',
    ],
  },
  quarryRoute: {
    title: 'The Quarry\'s Quiet Shortcut',
    body: 'Lorries serving the fictional Batu Layar quarry have begun using a village road that was never designed for heavy loads. The quarry says the approved route adds 18 kilometres and threatens its contract; residents show broken culverts and dust-covered fruit stalls. The state can set conditions on the local road and land access, but any option will anger someone who has a spreadsheet.',
    options: ['Ban heavy lorries from the village road', 'Allow timed access with a road-maintenance bond', 'Upgrade the road and recover costs through fees'],
    results: [
      'Residents and small traders get immediate relief, but quarry operators face higher transport costs and may cut local shifts.',
      'The quarry keeps a workable route and the state secures money for repairs, but residents must tolerate scheduled traffic and enforcement needs staff.',
      'The road improves and long-term costs can be recovered, but the upfront bill is large and quarry firms challenge the fee structure.',
    ],
  },
  coastalMangrove: {
    title: 'The Mangrove Offset Proposal',
    body: 'A fictional logistics company proposes a riverside warehouse on state land and offers to fund mangrove planting elsewhere. The company says the project will create 240 jobs; fishing families ask why the replacement trees are 30 kilometres from the estuary they use. The land decision is due before the investor\'s board meeting, and the glossy render shows more glass than mangroves.',
    options: ['Approve with a monitored restoration bond', 'Reject the site and protect the mangrove buffer', 'Approve a smaller warehouse footprint'],
    results: [
      'Investors see a path forward and the state can enforce restoration targets, but monitoring costs money and the ecological trade-off remains contested.',
      'Fishing communities and conservation advocates win protection, but the jobs and lease revenue move elsewhere and the state faces criticism for losing investment.',
      'Some jobs and lease income remain possible with less land disturbed, but redesign delays the project and neither side gets everything it wanted.',
    ],
  },
  localPlanGamble: {
    title: 'The Masterplan Nobody Read',
    body: 'The state planning office has prepared a new land-use map for Bandar Cempaka, but the public exhibition attracted 11 visitors and one of them came to charge a phone. A transport consultant claims the map will unlock housing sites and shorten commutes; village groups warn that several footpaths and small orchards vanish under the new lines. The cabinet wants a decision before the plan\'s scheduled gazette process.',
    options: ['Gazette the plan now and review later', 'Run a focused consultation and risk the deadline', 'Pilot the plan in one growth corridor'],
    results: [
      ['Developers and infrastructure planners gain certainty and the plan holds: credibility and growth expectations improve, though affected residents still feel steamrolled.', 'Developers and infrastructure planners gain certainty at first, but affected residents feel steamrolled, the plan needs a costly redesign and trust falls.'],
      'Residents get another chance to shape the map and the state looks responsive, but the gazette timetable slips and developers complain about uncertainty.',
      'The state learns from a smaller rollout and limits exposure, but the pilot costs extra planning funds and other districts accuse the government of playing favourites.',
    ],
  },
  leaseholdHomes: {
    title: 'Homes on a Lease, Questions on the Ground',
    body: 'A state land parcel in Taman Nuri is offered to a consortium promising 900 homes at controlled prices. The proposal includes a long lease, a maintenance company linked to the consortium, and a clause allowing service charges to be reviewed annually. First-time buyers like the headline price; residents in nearby flats ask who will police the fine print. The land committee needs a recommendation before the offer expires.',
    options: ['Accept the offer with price and fee caps', 'Renegotiate for fewer homes and stronger safeguards', 'Open a fresh tender with stricter disclosure'],
    results: [
      'More homes can move toward construction and buyers welcome the certainty, but the state accepts a complicated contract and must pay for monitoring.',
      'Buyers get stronger protections and clearer service obligations, but fewer homes are delivered and the consortium may walk away from the deal.',
      'Competition and disclosure improve the state\'s position, but the process delays construction and frustrated applicants may turn to the government for answers.',
    ],
  },
};

export const SELANGOR_STORIES_MS: Record<string, EventText> = {
  riverfrontLease: {
    title: 'Tepi Sungai, Tepi Perjanjian',
    body: 'Tanah tebing sungai milik kerajaan negeri dekat Kampung Teluk Rumbia dah jadi pasar hujung minggu tak rasmi. Peniaga pasang lampu dan sediakan tong sampah sendiri, sementara pemaju bawa cadangan pajakan yang cantik dengan model kafe yang entah ke mana tandasnya. Pihak berkuasa tempatan nak keputusan sebelum pasar dibuka hujung minggu ni.',
    options: ['Keluarkan permit sementara kepada peniaga', 'Pajakkan tapak kepada pemaju', 'Buka tender awam yang kompetitif'],
    results: [
      'Peniaga dapat kepastian dan pasar terus meriah, tapi kos penguatkuasaan dan kebersihan ditanggung kerajaan negeri. Belanjawan negeri rasa kesannya.',
      'Cadangan pelaburan nampak kemas dalam risalah dan melegakan pemilik hartanah, tapi peniaga sedia ada hilang tapak. Sokongan B40 bandar merosot.',
      'Proses lebih telus dan berpotensi naikkan hasil pajakan, tapi kelewatan buat peniaga berang dan tambah kos pentadbiran.',
    ],
  },
  hillSlopeAudit: {
    title: 'Bukit Bergerak, Fail Tak Bergerak',
    body: 'Penduduk Taman Bukit Serai hantar video rekahan yang makin panjang di jalan lereng bukit lepas berlaku gelongsoran kecil. Pemaju dakwa kawasan tu dah diserahkan bertahun-tahun lepas; fail pihak berkuasa tempatan pula ada tiga borang pemeriksaan tapi tak ada pihak yang jelas bertanggungjawab selenggara. Jurutera nak masuk periksa sebelum hujan lebat seterusnya, dan semua pihak berharap bil dihantar kepada orang lain.',
    options: ['Biayai pemeriksaan bebas segera', 'Arah pemaju baiki dulu', 'Tutup jalan dan siasat siapa yang bertanggungjawab'],
    results: [
      'Penduduk dapat penilaian risiko lebih cepat dan pegawai ada rekod yang boleh dipertahankan, tapi dana kecemasan berkurang sebelum punca dipastikan.',
      'Kerajaan negeri jaga peruntukan dan puaskan penduduk yang nakkan pihak bertanggungjawab dikenakan tindakan, tapi pemaju mungkin cabar arahan lepas tu lambatkan pembaikan.',
      'Keselamatan diutamakan dan pertikaian tanggungjawab direkodkan, tapi pengguna jalan dan peniaga sekitar tanggung lencongan dan merungut.',
    ],
  },
  marketStallLottery: {
    title: 'Cabutan Bertuah Tapak Niaga',
    body: 'Pasar berbumbung baharu di Pekan Lalang ada 48 tapak tapi terima 173 permohonan. Senarai tulisan tangan lama ada nama berulang, satu tapak dikhaskan untuk orang yang cuma dikenali sebagai \'pak cik yang pandai wiring\', dan pejabat seorang ahli majlis asyik telefon. Hari pembukaan tinggal sepuluh hari.',
    options: ['Buat cabutan terbuka dengan saksi', 'Nilai permohonan ikut kriteria yang diumumkan', 'Tangguhkan pembukaan untuk semak semua fail'],
    results: [
      'Prosesnya telus dan murah, tapi peniaga berpengalaman mungkin kalah nasib lepas tu buat bising. Kredibiliti naik, tapi sokongan peniaga kecil berpecah.',
      'Peniaga berpengalaman dan yang lengkap dokumen dapat kelebihan, tapi masa pegawai dan kos semakan naik; pemohon pertikai markah.',
      'Kerajaan negeri elak agihan tergesa-gesa dan jaga keadilan, tapi peniaga hilang pendapatan seminggu atau lebih dan pembukaan pasar jadi bahan sindiran.',
    ],
  },
  heritageShopfronts: {
    title: 'Warna Warisan, Harga Moden',
    body: 'Pemilik kedai di sepanjang Jalan Kendi bantah cadangan zon warisan yang wajibkan papan tanda, awning dan unit penyaman udara ditukar. Kumpulan pemuliharaan nak fasad rumah kedai lama dikekalkan; peniaga pula kata pelanggan takkan jumpa kedai kalau semua papan tanda warna beige yang sama. Jawatankuasa warisan negeri kena tetapkan peraturan sebelum musim ubah suai bermula.',
    options: ['Beri geran padanan untuk ubah suai yang patuh', 'Kuatkuasakan garis panduan fasad dengan segera', 'Benarkan reka bentuk fleksibel dengan semakan tempatan'],
    results: [
      'Penyokong warisan nampak perubahan ketara dan pemilik dapat bantuan, tapi dana geran makan belanja dan perniagaan besar lebih senang sediakan wang padanan.',
      'Kumpulan pemuliharaan sokong pendirian tegas dan penguatkuasaan lebih mudah, tapi peniaga kecil tanggung kos awal lepas tu mungkin kurangkan pekerja atau tangguh pembaikan.',
      'Peniaga dapat ruang menyesuaikan kedai dan kawasan tu kurang nampak dibuat-buat, tapi keputusan tak seragam kecewakan penyokong warisan dan perlukan lebih ramai pegawai majlis.',
    ],
  },
  strayAnimalContract: {
    title: 'Pusat Jagaan, Anjing Tak Kelihatan',
    body: 'Penduduk dekat pusat tahanan haiwan yang dicadangkan di Taman Purnama jumpa papan tanda kontraktor dah dipasang sebelum sesi penerangan awam. Kontraktor kata tapak tu cuma untuk penempatan sementara; penduduk bimbang pasal bunyi, kebersihan dan sama ada tender ditulis khas untuk satu syarikat. Kelulusan guna tanah boleh disemak semula, tapi majlis perlukan keputusan minggu ni.',
    options: ['Adakan pendengaran awam dan tangguh kelulusan', 'Teruskan dengan syarat operasi lebih ketat', 'Pindahkan pusat ke tapak yang kurang berpenghuni'],
    results: [
      'Penduduk rasa suara mereka didengar dan tender boleh diteliti, tapi kumpulan kebajikan haiwan kena tunggu lebih lama dan semakan guna masa pegawai.',
      'Perkhidmatan boleh bermula lebih cepat dan kontraktor tertakluk pada syarat yang boleh diukur, tapi penduduk masih curiga dan pemantauan tambah kos berulang.',
      'Penduduk sekitar lega dan pertikaian reda, tapi tapak baharu lebih mahal dan penduduk kawasan lain pula mungkin membantah.',
    ],
  },
  drainageReserve: {
    title: 'Taman Kejiranan atau Longkang Besar?',
    body: 'Persatuan penduduk Desa Melur kumpul 600 tandatangan membantah cadangan tukar rizab hijau yang sempit jadi laluan saliran utama. Jurutera kata laluan tu boleh kurangkan banjir setempat; ibu bapa pula tunjuk satu-satunya taman permainan redup yang boleh dicapai dengan berjalan kaki. Kerajaan negeri ada masa terhad untuk uruskan tanah tu sebelum lot sebelah bertukar pemilik.',
    options: ['Bina laluan saliran penuh', 'Reka semula dengan taman hijau yang lebih kecil', 'Ambil tanah berhampiran untuk laluan alternatif lebih luas'],
    results: [
      'Perancangan risiko banjir dapat pilihan kejuruteraan paling menyeluruh, tapi taman permainan hilang dan penduduk rasa diketepikan. Projek guna peruntukan besar.',
      'Kejiranan masih ada ruang hijau dan jurutera dapat sebahagian kapasiti saliran, tapi reka bentuk semula perlukan kos dan manfaat saliran lebih kecil.',
      'Taman dikekalkan dan laluan boleh dibuat lebih luas, tapi pengambilan tanah mahal dan pemilik terjejas pertikai penilaian.',
    ],
  },
  waterMeterDispute: {
    title: 'Meter Dua Kali, Bil Sekali Lagi',
    body: 'Meter digital baharu operator air negeri catat penggunaan luar biasa tinggi di 1,200 unit Pangsapuri Seri Angsana. Operator salahkan paip dalaman yang lama; penduduk pula tunjuk bil yang berganda dalam satu malam dan spreadsheet dengan bacaan yang sama. Kerajaan negeri boleh arahkan audit terhadap obligasi perkhidmatan konsesi, tapi bil tu takkan hilang hanya dengan kenyataan media.',
    options: ['Arah audit meter oleh pihak bebas', 'Wajibkan semakan sementara bagi bil yang dipertikaikan', 'Sokong operator sampai bukti teknikal diperoleh'],
    results: [
      'Penduduk dapat saluran bebas untuk cabar bacaan dan keyakinan meningkat, tapi audit makan belanja dan mungkin ambil masa beberapa minggu.',
      'Isi rumah yang ada pertikaian jelas dapat kepastian, tapi proses satu demi satu lambat dan operator tak senang dengan urusan tambahan.',
      'Kerajaan negeri elak campur tangan terburu-buru dan yakinkan pelabur, tapi penduduk nampak kerajaan memihak operator lepas tu kepercayaan merosot.',
    ],
  },
  quarryRoute: {
    title: 'Jalan Pintas Lori Batu',
    body: 'Lori dari kuari Batu Layar (rekaan) mula guna jalan kampung yang tak direka untuk muatan berat. Pihak kuari kata laluan yang diluluskan tambah 18 kilometer dan jejaskan kontrak mereka; penduduk tunjuk pembetung rosak dan gerai buah bersalut debu. Kerajaan negeri boleh tetapkan syarat jalan tempatan dan akses tanah, tapi apa pun keputusan akan buat pihak yang pegang spreadsheet naik angin.',
    options: ['Larang lori berat guna jalan kampung', 'Benarkan laluan pada waktu tertentu dengan bon penyelenggaraan', 'Naik taraf jalan dan kutip fi untuk pulihkan kos'],
    results: [
      'Penduduk dan peniaga kecil dapat kelegaan segera, tapi kos pengangkutan kuari naik dan syif pekerja tempatan mungkin dikurangkan.',
      'Kuari masih ada laluan yang boleh dipakai dan kerajaan dapat jaminan duit pembaikan, tapi penduduk kena terima trafik berjadual dan penguatkuasaan perlukan pegawai.',
      'Jalan bertambah baik dan kos jangka panjang boleh dipulihkan, tapi belanja awal besar dan syarikat kuari pertikai struktur fi.',
    ],
  },
  coastalMangrove: {
    title: 'Paya Bakau Bukan Baucar Tebus Ganti',
    body: 'Sebuah syarikat logistik rekaan cadangkan gudang tepi sungai di tanah kerajaan negeri dan tawar biayai penanaman bakau di tempat lain. Syarikat tu janji 240 pekerjaan; keluarga nelayan tanya kenapa pokok ganti ditanam 30 kilometer dari muara yang mereka guna. Keputusan tanah kena dibuat sebelum mesyuarat lembaga pelabur, dan ilustrasi projek tu lebih banyak kaca daripada bakau.',
    options: ['Lulus dengan bon pemulihan yang dipantau', 'Tolak tapak dan lindungi zon penampan bakau', 'Luluskan gudang dengan keluasan lebih kecil'],
    results: [
      'Pelabur nampak jalan untuk teruskan projek dan kerajaan boleh kuatkuasakan sasaran pemulihan, tapi pemantauan perlukan belanja dan pertukaran manfaat ekologi terus dipertikai.',
      'Komuniti nelayan dan penyokong pemuliharaan dapat perlindungan, tapi peluang kerja dan hasil pajakan mungkin berpindah ke tempat lain lepas tu kerajaan dikritik sebab hilang pelaburan.',
      'Sebahagian peluang kerja dan hasil pajakan masih boleh diperoleh dengan gangguan tanah yang lebih kecil, tapi reka bentuk semula lambatkan projek dan tak ada pihak dapat semua yang dimahukan.',
    ],
  },
  localPlanGamble: {
    title: 'Pelan Induk Setebal Batu Bata',
    body: 'Pejabat perancangan negeri sediakan peta guna tanah baharu untuk Bandar Cempaka, tapi pameran awam cuma tarik 11 pengunjung dan seorang datang sebab nak cas telefon. Perunding pengangkutan dakwa peta tu buka kawasan perumahan dan pendekkan perjalanan; kumpulan kampung beri amaran beberapa laluan pejalan kaki dan dusun kecil akan hilang di bawah garisan baharu. Exco nak keputusan sebelum proses pewartaan yang dijadualkan.',
    options: ['Wartakan pelan sekarang dan semak kemudian', 'Buat rundingan bersasar walaupun tarikh mungkin terlepas', 'Uji pelan di satu koridor pembangunan dulu'],
    results: [
      ['Pemaju dan perancang infrastruktur dapat kepastian dan pelan tu bertahan: kredibiliti dan jangkaan pertumbuhan meningkat, walaupun penduduk terjejas masih rasa keputusan dibuat tanpa mereka.', 'Pemaju dan perancang infrastruktur dapat kepastian pada mulanya, tapi penduduk terjejas rasa keputusan dibuat tanpa mereka, pelan kena reka semula dengan kos tinggi dan kepercayaan merosot.'],
      'Penduduk dapat peluang kedua untuk bentuk peta dan kerajaan nampak responsif, tapi jadual pewartaan tergelincir lepas tu pemaju merungut pasal ketidakpastian.',
      'Kerajaan belajar melalui pelaksanaan kecil dan hadkan risiko, tapi projek rintis tambah kos perancangan dan daerah lain tuduh kerajaan pilih kasih.',
    ],
  },
  leaseholdHomes: {
    title: 'Rumah Mampu Milik, Syarat Mampu Faham',
    body: 'Sebidang tanah kerajaan negeri di Taman Nuri ditawar kepada konsortium yang janji 900 rumah pada harga terkawal. Cadangan tu termasuk pajakan jangka panjang, syarikat penyelenggaraan yang berkait dengan konsortium dan klausa semakan caj perkhidmatan setiap tahun. Pembeli rumah pertama tertarik dengan harga yang diiklankan; penduduk pangsapuri berdekatan pula nak tahu siapa nak jaga syarat kecil-kecil tu. Jawatankuasa tanah kena buat syor sebelum tawaran tamat.',
    options: ['Terima tawaran dengan had harga dan caj', 'Runding semula untuk rumah lebih sikit tapi perlindungan lebih kuat', 'Buka tender baharu dengan syarat pendedahan lebih ketat'],
    results: [
      'Lebih banyak rumah boleh bergerak ke peringkat pembinaan dan pembeli sambut kepastian tu, tapi kerajaan terima kontrak rumit dan kena biayai pemantauan.',
      'Pembeli dapat perlindungan lebih kukuh dan tanggungjawab penyelenggaraan lebih jelas, tapi jumlah rumah berkurang dan konsortium mungkin tarik diri.',
      'Persaingan dan pendedahan maklumat kuatkan kedudukan kerajaan, tapi proses lambatkan pembinaan dan pemohon yang kecewa akan minta penjelasan daripada kerajaan.',
    ],
  },
};
