import type { EventText } from './events';

// Ten stories of the Kedah state government, in English and Bahasa Malaysia. Every place and person is invented. A result written as a pair is for a gamble.

export const KEDAH_STORIES_EN: Record<string, EventText> = {
  kedahPaddyDrainage: {
    title: 'The Parit That Ends at a Wall',
    body: 'At the edge of Kampung Parit Lalang, a drainage channel ends in a neat concrete wall, installed exactly where the water needs to go. Farmers say the next planting window is six weeks away; the district office says the tender scope is technically complete. The state must decide whether to fix the design, investigate the paperwork, or let the village improvise.',
    options: ['Fund an emergency redesign', 'Audit the tender trail', 'Give the village a small grant'],
    results: [
      'The channel gets a proper outlet before planting, but the state reserve takes a hit and other rural works wait.',
      'The paperwork is reviewed and contractors get nervous; the delay irritates farmers, while procurement hawks approve.',
      'Residents build temporary channels themselves. The cost stays low, but the state looks like it has outsourced drainage to gotong-royong.',
    ],
  },
  kedahMarketStalls: {
    title: 'A Roof, Three Buckets',
    body: 'At Pasar Seri Bayu, the awning leaks onto three vegetable stalls, while the market committee has been collecting handwritten repair fees for years. Traders want a fix before the school holidays bring more customers. The council can rebuild the roof, formalise the fees, or let traders manage a capped repair fund.',
    options: ['Replace the roof through the state works unit', 'Publish and standardise stall fees', 'Let traders run a capped repair fund'],
    results: [
      'The leaks stop and shoppers are pleased, but the bill crowds out smaller market upgrades elsewhere.',
      'Fees become predictable and the committee loses its informal discretion; traders who liked the old system complain.',
      'Repairs start quickly with less bureaucracy, but traders carry the admin burden and disputes over receipts may follow.',
    ],
  },
  kedahHillQuarryAccess: {
    title: 'The Quarry Road Shortcut',
    body: 'A lorry route serving a fictional hillside quarry has become the unofficial shortcut to two villages, leaving cracked shoulders and dust on shopfronts. The operator says the road was never designed for heavy loads; villagers say the state approved the access. A decision is needed before the next licence review.',
    options: ['Restrict heavy lorries to set hours', 'Require the operator to upgrade the road', 'Keep access open and monitor damage'],
    results: [
      'Villagers get quieter nights, but quarry shifts become costlier and the operator warns of fewer local jobs.',
      'The operator pays for a stronger road, though extraction slows during works and nearby businesses lose some trade.',
      'Traffic keeps moving and costs are avoided for now, but every new crack becomes a photograph sent to the state office.',
    ],
  },
  kedahVillageLease: {
    title: 'Temporary Permits, Permanent Kitchens',
    body: 'Residents of Taman Paya Murni have built kitchens and small workshops on state land under a patchwork of old temporary permits. Some permits expire in 90 days, and a survey map places a public access lane through the middle of the settlement. The state can regularise the occupation, clear the lane, or launch a case-by-case review.',
    options: ['Offer renewable leases with conditions', 'Clear the public access lane first', 'Review every lot individually'],
    results: [
      'Families gain certainty and the state gains regular fees, but strict conditions upset those expecting permanent ownership.',
      'Access is restored on paper and for emergency vehicles, but several families must dismantle extensions and blame the state.',
      'Complex cases get fairer attention, but the process is slow and residents face uncertainty past the permit deadline.',
    ],
  },
  kedahFloodRetentionLand: {
    title: 'A Pond Under the Lalang',
    body: 'A developer wants to fill a low-lying parcel near Sungai Keladi for a new shop-office strip. The land office says the application is complete, but residents point to an old retention pond hidden under lalang and discarded signboards. The state has ten days to decide whether to approve, reject, or demand a revised layout.',
    options: ['Approve with a larger drainage contribution', 'Reject the application', 'Demand a lower-density revised layout'],
    results: [
      'The project proceeds and the drainage fund grows, but neighbours see the decision as selling risk by the cubic metre.',
      'The pond remains open and residents cheer, but the state loses expected land-related revenue and the developer threatens to withdraw.',
      'A compromise protects part of the retention area, though the developer cuts planned shop lots and complains about redesign costs.',
    ],
  },
  kedahForestTrail: {
    title: 'The Unlicensed Forest Trail',
    body: 'A community group has marked a walking trail through a state forest reserve, complete with hand-painted arrows and a kiosk selling coconut water. Forestry officers say the route crosses a sensitive zone; local guides say the trail has revived three village businesses. The state must decide before a weekend event brings hundreds of visitors.',
    options: ['Close the route pending an assessment', 'Create a licensed community trail', 'Run a monitored pilot weekend'],
    results: [
      'The reserve is protected from immediate foot traffic, but guides lose income and accuse the state of treating a forest like a locked storeroom.',
      'Guides gain a legal route and conservation rules, but fees and limits make some volunteers walk away.',
      ['Visitor numbers stay manageable and the trail earns a licence pathway, but rangers and cleanup crews cost extra.', 'The trail is overwhelmed, litter reaches the stream, and the state pays for cleanup while conservation groups demand a closure.'],
    ],
  },
  kedahLocalParking: {
    title: 'The Parking App That Knows No Streets',
    body: 'In Bandar Nira, the council\'s parking app accepts payment but cannot recognise half the street names, including the street where its own office stands. Shopkeepers want free short-stay parking; residents want permits; the council needs predictable revenue for road markings and drains. A pilot scheme expires at the end of the month.',
    options: ['Keep the app and subsidise short stays', 'Replace the app with a permit-and-meter system', 'Suspend paid parking for three months'],
    results: [
      'Shoppers get cheaper visits and the app survives another update, but the council pays for software fixes and loses some parking income.',
      'Residents get clearer rules and enforcement improves, but visitors and traders dislike the paperwork and new charges.',
      'The public enjoys a temporary reprieve, while the council delays road-marking work and faces a hole in its operating budget.',
    ],
  },
  kedahVillageHall: {
    title: 'One Fan for the Whole Hall',
    body: 'The multipurpose hall in Kampung Teluk Rawa has one working fan, a stage curtain that smells of damp, and a booking diary with three different handwriting systems. Youth groups want evening access, wedding organisers want priority weekends, and the village committee wants control over the keys. The state grant can support only one operating model this quarter.',
    options: ['Fund a professional booking operator', 'Give the village committee control and a grant', 'Reserve fixed weekly hours for youth groups'],
    results: [
      'Bookings become orderly and maintenance gets logged, but fees rise and small events feel priced out.',
      'Local control is preserved and the committee is pleased, but disputes over prime dates continue behind the same old curtain.',
      'Young groups gain reliable space at the expense of some weekend bookings, and wedding organisers start lobbying for exceptions.',
    ],
  },
  kedahWaterCatchment: {
    title: 'The Sheds at the Catchment',
    body: 'A village water catchment on state land is partly blocked by an old access track and a row of unauthorised sheds. Clearing everything would improve maintenance access, but several families store tools there and a local cooperative uses the track to move produce. The state has a narrow window before the annual catchment inspection.',
    options: ['Clear the sheds and access track', 'Relocate the sheds and formalise access', 'Delay clearance and run a joint inspection'],
    results: [
      'Maintenance access improves immediately, but families lose storage space and the cooperative faces a costly detour.',
      'The catchment gets protection without an outright eviction, but relocation costs public money and access rules become more restrictive.',
      'Residents get a say and the inspection produces better evidence, but the blockage remains and conservation groups question the delay.',
    ],
  },
  kedahPublicJetty: {
    title: 'A Jetty with Two Jobs',
    body: 'At Kuala Suri, a small public jetty used by fishers and weekend visitors has loose planks and no clear division between loading space and leisure access. A safety inspection is due in three weeks. The state can close it for a full rebuild, repair the most dangerous sections, or hand day-to-day management to a local cooperative under strict conditions.',
    options: ['Close the jetty for a full rebuild', 'Repair hazards and keep it partly open', 'Contract the cooperative to manage access'],
    results: [
      'The finished jetty should be safer and better organised, but fishers lose access during works and tourism income falls for a season.',
      'Most users keep access and the worst hazards are removed, but the patchwork repair may not survive another heavy season.',
      'Local users gain control and the state saves management effort, but the cooperative must enforce rules on neighbours and paying visitors.',
    ],
  },
};

export const KEDAH_STORIES_MS: Record<string, EventText> = {
  kedahPaddyDrainage: {
    title: 'Parit Buntu di Hujung Sawah',
    body: 'Di hujung Kampung Parit Lalang, parit sawah berakhir pada tembok konkrit yang kemas, tepat di tempat air sepatutnya mengalir. Pesawah kata musim penanaman seterusnya tinggal enam minggu; pejabat daerah pula mengesahkan skop tender sudah lengkap dari segi teknikal. Kerajaan negeri perlu memilih sama ada membetulkan reka bentuk, menyiasat dokumen, atau membiarkan penduduk mencari jalan sendiri.',
    options: ['Biayai reka bentuk semula segera', 'Audit jejak tender', 'Beri geran kecil kepada kampung'],
    results: [
      'Saliran dibetulkan sebelum musim menanam, tetapi rizab negeri susut dan kerja kampung lain terpaksa menunggu.',
      'Dokumen disemak dan kontraktor mula berhati-hati. Pesawah marah kerana lambat, namun penyokong ketelusan berpuas hati.',
      'Penduduk bina laluan air sementara. Kos rendah, tetapi kerajaan nampak seperti menyerahkan urusan saliran kepada gotong-royong.',
    ],
  },
  kedahMarketStalls: {
    title: 'Bumbung Pasar dan Tiga Baldi',
    body: 'Di Pasar Seri Bayu, bumbung bocor tepat atas tiga gerai sayur, sementara jawatankuasa pasar sudah bertahun-tahun mengutip bayaran pembaikan secara tulisan tangan. Peniaga mahu masalah selesai sebelum cuti sekolah membawa lebih ramai pelanggan. Kerajaan negeri boleh membaiki bumbung, merasmikan kutipan, atau membenarkan peniaga mengurus dana pembaikan yang dihadkan.',
    options: ['Ganti bumbung melalui unit kerja negeri', 'Terbitkan kadar sewa dan fi gerai', 'Benarkan peniaga urus dana pembaikan terhad'],
    results: [
      'Bumbung tidak lagi bocor dan pelanggan senang, tetapi kosnya menolak naik taraf kecil di pasar lain ke belakang.',
      'Kadar bayaran jadi jelas dan jawatankuasa hilang kuasa tidak rasmi; peniaga yang selesa dengan cara lama membantah.',
      'Pembaikan bermula cepat dengan kurang birokrasi, tetapi peniaga menanggung kerja pentadbiran dan mungkin bergaduh soal resit.',
    ],
  },
  kedahHillQuarryAccess: {
    title: 'Jalan Pintas Lori Kuari',
    body: 'Laluan lori ke kuari bukit rekaan kini menjadi jalan pintas tidak rasmi ke dua kampung, meninggalkan bahu jalan retak dan habuk di depan kedai. Pengusaha kata jalan itu bukan direka untuk muatan berat; penduduk pula mendakwa akses tersebut diluluskan kerajaan negeri. Keputusan perlu dibuat sebelum lesen disemak semula.',
    options: ['Hadkan lori berat pada waktu tertentu', 'Wajibkan pengusaha naik taraf jalan', 'Kekalkan laluan dan pantau kerosakan'],
    results: [
      'Malam kampung lebih tenang, tetapi kos operasi kuari meningkat dan pengusaha memberi amaran peluang kerja tempatan mungkin berkurang.',
      'Pengusaha menanggung kos jalan lebih kukuh, namun kerja kuari perlahan semasa pembinaan dan kedai sekitar kehilangan sebahagian pelanggan.',
      'Lori terus bergerak dan kos segera dapat dielakkan, tetapi setiap rekahan baharu akan menjadi gambar yang dihantar ke pejabat kerajaan.',
    ],
  },
  kedahVillageLease: {
    title: 'Permit Sementara, Dapur Kekal',
    body: 'Penduduk Taman Paya Murni membina dapur tambahan dan bengkel kecil di atas tanah negeri dengan permit sementara yang tidak seragam. Ada permit tamat dalam 90 hari, manakala peta ukur menunjukkan satu lorong akses awam merentasi penempatan itu. Kerajaan negeri boleh menyusun semula status tanah, mengosongkan lorong, atau menyemak setiap kes satu demi satu.',
    options: ['Tawar pajakan boleh diperbaharui bersyarat', 'Kosongkan lorong akses awam dahulu', 'Semak setiap lot secara individu'],
    results: [
      'Keluarga mendapat kepastian dan negeri menerima fi berkala, tetapi syarat ketat mengecewakan mereka yang mengharapkan hak milik kekal.',
      'Akses awam dan laluan kecemasan dipulihkan, tetapi beberapa keluarga perlu merobohkan tambahan rumah lalu menyalahkan kerajaan.',
      'Kes rumit diberi perhatian lebih adil, namun proses lambat dan penduduk terus tidak pasti selepas permit tamat.',
    ],
  },
  kedahFloodRetentionLand: {
    title: 'Kolam di Sebalik Lalang',
    body: 'Sebuah pemaju mahu menambak tanah rendah berhampiran Sungai Keladi untuk deretan kedai pejabat baharu. Pejabat tanah mengesahkan permohonan lengkap, tetapi penduduk menunjukkan kolam takungan lama yang kini terlindung oleh lalang dan papan tanda reput. Kerajaan negeri ada sepuluh hari untuk meluluskan, menolak, atau meminta pelan baharu.',
    options: ['Luluskan dengan sumbangan saliran lebih besar', 'Tolak permohonan', 'Minta pelan baharu dengan kepadatan lebih rendah'],
    results: [
      'Projek diteruskan dan dana saliran bertambah, tetapi penduduk sekitar menganggap kerajaan menjual risiko mengikut meter padu.',
      'Kolam takungan dikekalkan dan penduduk lega, namun negeri kehilangan hasil berkaitan tanah yang dijangka dan pemaju mengancam menarik diri.',
      'Sebahagian kawasan takungan dilindungi, tetapi pemaju mengurangkan lot kedai dan merungut tentang kos reka bentuk semula.',
    ],
  },
  kedahForestTrail: {
    title: 'Denai Hutan Tanpa Lesen',
    body: 'Sebuah kumpulan komuniti menanda laluan berjalan kaki dalam hutan simpan negeri, lengkap dengan anak panah bercat tangan dan pondok jual air kelapa. Pegawai perhutanan berkata laluan itu melintasi zon sensitif; pemandu tempatan pula mendakwa tiga perniagaan kampung kembali hidup kerananya. Kerajaan negeri perlu membuat keputusan sebelum acara hujung minggu menarik ratusan pengunjung.',
    options: ['Tutup laluan sementara menunggu penilaian', 'Wujudkan laluan komuniti berlesen', 'Jalankan percubaan hujung minggu dengan pemantauan'],
    results: [
      'Hutan simpan dilindungi daripada kunjungan segera, tetapi pemandu kehilangan pendapatan dan menuduh kerajaan mengunci hutan seperti stor.',
      'Pemandu mendapat laluan sah dengan peraturan pemuliharaan, tetapi fi dan had pengunjung menyebabkan sebahagian sukarelawan menarik diri.',
      ['Jumlah pengunjung terkawal dan laluan berpeluang mendapat lesen, tetapi kos renjer serta pembersihan meningkat.', 'Laluan sesak, sampah sampai ke anak sungai dan kerajaan menanggung kos pembersihan sementara kumpulan pemuliharaan mendesak penutupan.'],
    ],
  },
  kedahLocalParking: {
    title: 'Aplikasi Parkir Tak Kenal Jalan',
    body: 'Di Bandar Nira, aplikasi parkir majlis menerima bayaran tetapi gagal mengenali separuh nama jalan, termasuk jalan di depan pejabatnya sendiri. Peniaga mahu parkir singkat percuma; penduduk mahukan permit; majlis pula perlukan hasil tetap untuk garisan jalan dan longkang. Projek rintis tamat hujung bulan ini.',
    options: ['Kekalkan aplikasi dan subsidi parkir singkat', 'Ganti aplikasi dengan sistem permit dan meter', 'Hentikan parkir berbayar selama tiga bulan'],
    results: [
      'Pelanggan boleh singgah dengan kos rendah dan aplikasi diberi satu lagi peluang kemas kini, tetapi majlis membayar pembaikan sistem serta kehilangan sebahagian hasil parkir.',
      'Peraturan lebih jelas dan penguatkuasaan bertambah baik, tetapi pengunjung serta peniaga tidak suka urusan permit dan caj baharu.',
      'Orang ramai lega buat sementara, namun kerja mengecat jalan ditangguhkan dan bajet operasi majlis berlubang.',
    ],
  },
  kedahVillageHall: {
    title: 'Dewan dengan Satu Kipas',
    body: 'Dewan serbaguna Kampung Teluk Rawa cuma ada satu kipas yang berfungsi, langsir pentas berbau hapak dan buku tempahan dengan tiga jenis tulisan. Kumpulan belia mahu akses waktu malam, penganjur kenduri mahu keutamaan hujung minggu, manakala jawatankuasa kampung mahu terus memegang kunci. Geran negeri hanya mampu menampung satu model pengurusan bagi suku tahun ini.',
    options: ['Biayai pengendali tempahan profesional', 'Serahkan pengurusan kepada jawatankuasa kampung dengan geran', 'Tetapkan waktu mingguan untuk kumpulan belia'],
    results: [
      'Tempahan lebih teratur dan penyelenggaraan direkodkan, tetapi fi meningkat hingga acara kecil terasa terlalu mahal.',
      'Pengurusan kekal di tangan penduduk dan jawatankuasa gembira, namun perebutan tarikh popular berterusan di sebalik langsir lama.',
      'Belia mendapat ruang tetap, tetapi beberapa tempahan hujung minggu terpaksa diketepikan dan penganjur kenduri mula meminta pengecualian.',
    ],
  },
  kedahWaterCatchment: {
    title: 'Bangsal di Kawasan Tadahan',
    body: 'Kawasan tadahan air kampung di atas tanah negeri terhalang sebahagiannya oleh laluan lama dan deretan bangsal tanpa kebenaran. Membersihkan semuanya memudahkan penyelenggaraan, tetapi beberapa keluarga menyimpan peralatan di situ dan koperasi tempatan menggunakan laluan untuk mengangkut hasil. Kerajaan negeri hanya ada sedikit masa sebelum pemeriksaan tahunan tadahan air.',
    options: ['Kosongkan bangsal dan laluan', 'Pindahkan bangsal dan sahkan laluan secara rasmi', 'Tangguhkan pengosongan dan buat pemeriksaan bersama'],
    results: [
      'Akses penyelenggaraan bertambah baik serta-merta, tetapi keluarga kehilangan ruang simpanan dan koperasi terpaksa menggunakan laluan lebih jauh.',
      'Tadahan air lebih terlindung tanpa pengusiran terus, tetapi kos pemindahan ditanggung kerajaan dan syarat penggunaan laluan menjadi lebih ketat.',
      'Penduduk diberi ruang bersuara dan pemeriksaan menghasilkan bukti lebih baik, namun halangan masih ada dan kumpulan pemuliharaan mempersoalkan kelewatan.',
    ],
  },
  kedahPublicJetty: {
    title: 'Jeti untuk Nelayan dan Pengunjung',
    body: 'Di Kuala Suri, jeti awam kecil yang digunakan nelayan dan pengunjung hujung minggu mempunyai papan longgar serta tiada pemisahan jelas antara kawasan memunggah hasil dan laluan orang berjalan. Pemeriksaan keselamatan dijadualkan dalam tiga minggu. Kerajaan negeri boleh menutupnya untuk pembinaan semula, membaiki bahagian paling berbahaya, atau menyerahkan pengurusan harian kepada koperasi tempatan dengan syarat ketat.',
    options: ['Tutup jeti untuk dibina semula sepenuhnya', 'Baiki bahagian berbahaya dan buka sebahagian', 'Lantik koperasi mengurus akses'],
    results: [
      'Jeti yang siap nanti lebih selamat dan teratur, tetapi nelayan kehilangan akses semasa kerja dan pendapatan pelancongan merosot satu musim.',
      'Kebanyakan pengguna masih boleh masuk dan bahaya utama dihapuskan, tetapi pembaikan tampal-sulam mungkin tidak tahan satu lagi musim sibuk.',
      'Pengguna tempatan mendapat kuasa mengurus dan kerajaan menjimatkan tenaga, tetapi koperasi perlu menguatkuasakan peraturan terhadap jiran sendiri serta pengunjung berbayar.',
    ],
  },
};
