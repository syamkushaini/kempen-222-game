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
    body: 'Tanah tebing sungai milik kerajaan negeri berhampiran Kampung Teluk Rumbia sudah jadi pasar hujung minggu tidak rasmi. Peniaga pasang lampu dan sediakan tong sampah sendiri, sementara pemaju mengemukakan cadangan pajakan cantik dengan model kafe yang entah ke mana tandasnya. Pihak berkuasa tempatan mahu keputusan sebelum pasar dibuka hujung minggu ini.',
    options: ['Keluarkan permit sementara kepada peniaga', 'Pajakkan tapak kepada pemaju', 'Buka tender awam yang kompetitif'],
    results: [
      'Peniaga dapat kepastian dan pasar terus meriah, tetapi kos penguatkuasaan serta kebersihan ditanggung kerajaan negeri. Belanjawan negeri terasa kesannya.',
      'Cadangan pelaburan nampak kemas dalam risalah dan melegakan pemilik hartanah, tetapi peniaga sedia ada kehilangan tapak. Sokongan B40 bandar merosot.',
      'Proses lebih telus dan berpotensi menaikkan hasil pajakan, tetapi kelewatan membuat peniaga berang dan menambah kos pentadbiran.',
    ],
  },
  hillSlopeAudit: {
    title: 'Bukit Bergerak, Fail Tak Bergerak',
    body: 'Penduduk Taman Bukit Serai menghantar video rekahan yang semakin panjang di jalan lereng bukit selepas berlaku gelongsoran kecil. Pemaju mendakwa kawasan itu sudah diserahkan bertahun-tahun lalu; fail pihak berkuasa tempatan pula ada tiga borang pemeriksaan tetapi tiada pihak yang jelas bertanggungjawab menyelenggara. Jurutera mahu masuk memeriksa sebelum hujan lebat seterusnya, dan semua pihak berharap bil dihantar kepada orang lain.',
    options: ['Biayai pemeriksaan bebas segera', 'Arah pemaju membaiki dahulu', 'Tutup jalan dan siasat pemilikan tanggungjawab'],
    results: [
      'Penduduk mendapat penilaian risiko lebih cepat dan pegawai mempunyai rekod yang boleh dipertahankan, tetapi dana kecemasan berkurang sebelum punca dipastikan.',
      'Kerajaan negeri menjaga peruntukan dan memuaskan penduduk yang mahu pihak bertanggungjawab dikenakan tindakan, tetapi pemaju mungkin mencabar arahan lalu melambatkan pembaikan.',
      'Keselamatan diutamakan dan pertikaian tanggungjawab direkodkan, tetapi pengguna jalan serta peniaga sekitar menanggung lencongan dan rungutan.',
    ],
  },
  marketStallLottery: {
    title: 'Cabutan Bertuah Tapak Niaga',
    body: 'Pasar berbumbung baharu di Pekan Lalang ada 48 tapak tetapi menerima 173 permohonan. Senarai tulisan tangan lama mengandungi nama berulang, satu tapak dikhaskan untuk orang yang cuma dikenali sebagai \'pak cik yang pandai wiring\', dan pejabat seorang ahli majlis asyik menelefon. Hari pembukaan tinggal sepuluh hari.',
    options: ['Buat cabutan terbuka dengan saksi', 'Nilai permohonan ikut kriteria yang diumumkan', 'Tangguhkan pembukaan untuk semak semua fail'],
    results: [
      'Prosesnya telus dan murah, tetapi peniaga berpengalaman mungkin kalah nasib lalu membuat bising. Kredibiliti meningkat, namun sokongan peniaga kecil berpecah.',
      'Peniaga berpengalaman dan yang lengkap dokumen mendapat kelebihan, tetapi masa pegawai serta kos semakan meningkat; pemohon mempertikaikan markah.',
      'Kerajaan negeri mengelakkan agihan tergesa-gesa dan menjaga keadilan, tetapi peniaga kehilangan pendapatan seminggu atau lebih dan pembukaan pasar jadi bahan sindiran.',
    ],
  },
  heritageShopfronts: {
    title: 'Warna Warisan, Harga Moden',
    body: 'Pemilik kedai di sepanjang Jalan Kendi membantah cadangan zon warisan yang mewajibkan papan tanda, awning dan unit penyaman udara ditukar. Kumpulan pemuliharaan mahu fasad rumah kedai lama dikekalkan; peniaga pula kata pelanggan takkan jumpa kedai jika semua papan tanda warna beige yang sama. Jawatankuasa warisan negeri perlu menetapkan peraturan sebelum musim pengubahsuaian bermula.',
    options: ['Beri geran padanan untuk ubah suai yang patuh', 'Kuatkuasakan garis panduan fasad dengan segera', 'Benarkan reka bentuk fleksibel dengan semakan tempatan'],
    results: [
      'Penyokong warisan melihat perubahan ketara dan pemilik mendapat bantuan, tetapi dana geran menelan belanja dan perniagaan besar lebih mudah menyediakan wang padanan.',
      'Kumpulan pemuliharaan menyokong pendirian tegas dan penguatkuasaan lebih mudah, tetapi peniaga kecil menanggung kos awal lalu mungkin mengurangkan pekerja atau menangguhkan pembaikan.',
      'Peniaga mendapat ruang menyesuaikan kedai dan kawasan itu kurang nampak dibuat-buat, tetapi keputusan tidak seragam mengecewakan penyokong warisan serta memerlukan lebih ramai pegawai majlis.',
    ],
  },
  strayAnimalContract: {
    title: 'Pusat Jagaan, Anjing Tak Kelihatan',
    body: 'Penduduk berhampiran pusat tahanan haiwan yang dicadangkan di Taman Purnama mendapati papan tanda kontraktor sudah dipasang sebelum sesi penerangan awam. Kontraktor kata tapak itu hanya untuk penempatan sementara; penduduk bimbang tentang bunyi, kebersihan dan sama ada tender ditulis khas untuk satu syarikat. Kelulusan guna tanah boleh disemak semula, tetapi majlis perlukan keputusan minggu ini.',
    options: ['Adakan pendengaran awam dan tangguh kelulusan', 'Teruskan dengan syarat operasi lebih ketat', 'Pindahkan pusat ke tapak yang kurang berpenghuni'],
    results: [
      'Penduduk rasa suara mereka didengar dan tender boleh diteliti, tetapi kumpulan kebajikan haiwan perlu menunggu lebih lama dan semakan menggunakan masa pegawai.',
      'Perkhidmatan boleh bermula lebih cepat dan kontraktor tertakluk pada syarat yang boleh diukur, tetapi penduduk masih curiga dan pemantauan menambah kos berulang.',
      'Penduduk sekitar berasa lega dan pertikaian reda, tetapi tapak baharu lebih mahal dan penduduk kawasan lain pula mungkin membantah.',
    ],
  },
  drainageReserve: {
    title: 'Taman Kejiranan atau Longkang Besar?',
    body: 'Persatuan penduduk Desa Melur mengumpul 600 tandatangan membantah cadangan menukar rizab hijau sempit menjadi laluan saliran utama. Jurutera kata laluan itu boleh mengurangkan banjir setempat; ibu bapa pula menunjukkan satu-satunya taman permainan redup yang boleh dicapai dengan berjalan kaki. Kerajaan negeri ada masa terhad untuk menguruskan tanah itu sebelum lot bersebelahan bertukar pemilik.',
    options: ['Bina laluan saliran penuh', 'Reka semula dengan taman hijau yang lebih kecil', 'Ambil tanah berhampiran untuk laluan alternatif lebih luas'],
    results: [
      'Perancangan risiko banjir mendapat pilihan kejuruteraan paling menyeluruh, tetapi taman permainan hilang dan penduduk rasa diketepikan. Projek menggunakan peruntukan besar.',
      'Kejiranan masih mempunyai ruang hijau dan jurutera mendapat sebahagian kapasiti saliran, tetapi reka bentuk semula memerlukan kos dan manfaat saliran lebih kecil.',
      'Taman dikekalkan dan laluan boleh dibuat lebih luas, tetapi pengambilan tanah mahal serta pemilik terjejas mempertikaikan penilaian.',
    ],
  },
  waterMeterDispute: {
    title: 'Meter Dua Kali, Bil Sekali Lagi',
    body: 'Meter digital baharu operator air negeri merekodkan penggunaan luar biasa tinggi di 1,200 unit Pangsapuri Seri Angsana. Operator menyalahkan paip dalaman yang lama; penduduk pula menunjukkan bil yang berganda dalam satu malam dan hamparan data dengan bacaan yang sama. Kerajaan negeri boleh mengarahkan audit terhadap obligasi perkhidmatan konsesi, tetapi bil itu takkan hilang hanya dengan kenyataan media.',
    options: ['Arah audit meter oleh pihak bebas', 'Wajibkan semakan sementara bagi bil yang dipertikaikan', 'Sokong operator sehingga bukti teknikal diperoleh'],
    results: [
      'Penduduk mendapat saluran bebas untuk mencabar bacaan dan keyakinan meningkat, tetapi audit menelan belanja serta mungkin mengambil masa beberapa minggu.',
      'Isi rumah yang mempunyai pertikaian jelas mendapat kepastian, tetapi proses satu demi satu lambat dan operator tidak senang dengan urusan tambahan.',
      'Kerajaan negeri mengelakkan campur tangan terburu-buru dan meyakinkan pelabur, tetapi penduduk melihat kerajaan memihak kepada operator lalu kepercayaan merosot.',
    ],
  },
  quarryRoute: {
    title: 'Jalan Pintas Lori Batu',
    body: 'Lori dari kuari rekaan Batu Layar mula menggunakan jalan kampung yang tidak direka untuk muatan berat. Pihak kuari kata laluan yang diluluskan menambah 18 kilometer dan menjejaskan kontrak mereka; penduduk menunjukkan pembetung rosak dan gerai buah bersalut debu. Kerajaan negeri boleh menetapkan syarat jalan tempatan serta akses tanah, tetapi apa pun keputusan akan membuat pihak yang membawa hamparan kira-kira naik angin.',
    options: ['Larangkan lori berat melalui jalan kampung', 'Benarkan laluan pada waktu tertentu dengan bon penyelenggaraan', 'Naik taraf jalan dan kutip fi untuk pulihkan kos'],
    results: [
      'Penduduk dan peniaga kecil mendapat kelegaan segera, tetapi kos pengangkutan kuari meningkat dan syif pekerja tempatan mungkin dikurangkan.',
      'Kuari masih mempunyai laluan yang boleh digunakan dan kerajaan mendapat jaminan wang pembaikan, tetapi penduduk perlu menerima trafik berjadual serta penguatkuasaan memerlukan pegawai.',
      'Jalan bertambah baik dan kos jangka panjang boleh dipulihkan, tetapi belanja awal besar dan syarikat kuari mempertikaikan struktur fi.',
    ],
  },
  coastalMangrove: {
    title: 'Paya Bakau Bukan Baucar Tebus Ganti',
    body: 'Sebuah syarikat logistik rekaan mencadangkan gudang tepi sungai di tanah kerajaan negeri dan menawarkan pembiayaan penanaman bakau di lokasi lain. Syarikat itu menjanjikan 240 pekerjaan; keluarga nelayan bertanya mengapa pokok ganti ditanam 30 kilometer dari muara yang mereka gunakan. Keputusan tanah perlu dibuat sebelum mesyuarat lembaga pelabur, dan ilustrasi projek itu memaparkan lebih banyak kaca daripada bakau.',
    options: ['Lulus dengan bon pemulihan yang dipantau', 'Tolak tapak dan lindungi zon penampan bakau', 'Luluskan gudang dengan keluasan lebih kecil'],
    results: [
      'Pelabur nampak jalan untuk meneruskan projek dan kerajaan boleh menguatkuasakan sasaran pemulihan, tetapi pemantauan memerlukan belanja dan pertukaran manfaat ekologi terus dipertikaikan.',
      'Komuniti nelayan serta penyokong pemuliharaan mendapat perlindungan, tetapi peluang kerja dan hasil pajakan mungkin berpindah ke tempat lain lalu kerajaan dikritik kerana kehilangan pelaburan.',
      'Sebahagian peluang kerja dan hasil pajakan masih boleh diperoleh dengan gangguan tanah yang lebih kecil, tetapi reka bentuk semula melambatkan projek dan tiada pihak mendapat semua yang dimahukan.',
    ],
  },
  localPlanGamble: {
    title: 'Pelan Induk Setebal Batu Bata',
    body: 'Pejabat perancangan negeri menyediakan peta guna tanah baharu untuk Bandar Cempaka, tetapi pameran awam hanya menarik 11 pengunjung dan seorang datang untuk mengecas telefon. Perunding pengangkutan mendakwa peta itu membuka kawasan perumahan dan memendekkan perjalanan; kumpulan kampung memberi amaran beberapa laluan pejalan kaki serta dusun kecil akan hilang di bawah garisan baharu. Jemaah kerajaan negeri mahu keputusan sebelum proses pewartaan yang dijadualkan.',
    options: ['Wartakan pelan sekarang dan semak kemudian', 'Buat rundingan bersasar walaupun tarikh mungkin terlepas', 'Uji pelan di satu koridor pembangunan dahulu'],
    results: [
      ['Pemaju dan perancang infrastruktur mendapat kepastian dan pelan itu bertahan: kredibiliti serta jangkaan pertumbuhan meningkat, walaupun penduduk terjejas masih rasa keputusan dibuat tanpa mereka.', 'Pemaju dan perancang infrastruktur mendapat kepastian pada mulanya, tetapi penduduk terjejas rasa keputusan dibuat tanpa mereka, pelan perlu direka semula dengan kos tinggi dan kepercayaan merosot.'],
      'Penduduk mendapat peluang kedua untuk membentuk peta dan kerajaan nampak responsif, tetapi jadual pewartaan tergelincir lalu pemaju merungut tentang ketidakpastian.',
      'Kerajaan belajar melalui pelaksanaan kecil dan mengehadkan risiko, tetapi projek rintis menambah kos perancangan dan daerah lain menuduh kerajaan pilih kasih.',
    ],
  },
  leaseholdHomes: {
    title: 'Rumah Mampu Milik, Syarat Mampu Faham',
    body: 'Sebidang tanah kerajaan negeri di Taman Nuri ditawarkan kepada konsortium yang menjanjikan 900 rumah pada harga terkawal. Cadangan itu merangkumi pajakan jangka panjang, syarikat penyelenggaraan yang berkait dengan konsortium dan klausa semakan caj perkhidmatan setiap tahun. Pembeli rumah pertama tertarik dengan harga yang diiklankan; penduduk pangsapuri berdekatan pula mahu tahu siapa akan mengawal syarat kecil-kecil itu. Jawatankuasa tanah perlu membuat syor sebelum tawaran tamat.',
    options: ['Terima tawaran dengan had harga dan caj', 'Runding semula untuk rumah lebih sedikit tetapi perlindungan lebih kuat', 'Buka tender baharu dengan syarat pendedahan lebih ketat'],
    results: [
      'Lebih banyak rumah boleh bergerak ke peringkat pembinaan dan pembeli menyambut kepastian itu, tetapi kerajaan menerima kontrak rumit serta perlu membiayai pemantauan.',
      'Pembeli mendapat perlindungan lebih kukuh dan tanggungjawab penyelenggaraan lebih jelas, tetapi jumlah rumah berkurang dan konsortium mungkin menarik diri.',
      'Persaingan dan pendedahan maklumat menguatkan kedudukan kerajaan, tetapi proses melambatkan pembinaan dan pemohon yang kecewa akan meminta penjelasan daripada kerajaan.',
    ],
  },
};
