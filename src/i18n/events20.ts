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
    body: 'Di hujung Kampung Parit Lalang, parit sawah berakhir pada tembok konkrit yang kemas, betul-betul di tempat air patut mengalir. Pesawah kata musim menanam seterusnya tinggal enam minggu; pejabat daerah pula kata skop tender dah lengkap dari segi teknikal. Kerajaan negeri kena pilih sama ada nak betulkan reka bentuk, siasat dokumen, atau biar penduduk cari jalan sendiri.',
    options: ['Biayai reka bentuk semula segera', 'Audit jejak tender', 'Beri geran kecil kepada kampung'],
    results: [
      'Parit dapat saluran keluar yang betul sebelum musim menanam, tapi rizab negeri susut dan kerja kampung lain terpaksa menunggu.',
      'Dokumen disemak dan kontraktor mula berhati-hati. Pesawah marah sebab lambat, tapi penyokong ketelusan puas hati.',
      'Penduduk bina laluan air sementara sendiri. Kos rendah, tapi kerajaan nampak macam serahkan urusan parit kepada gotong-royong.',
    ],
  },
  kedahMarketStalls: {
    title: 'Bumbung Pasar dan Tiga Baldi',
    body: 'Di Pasar Seri Bayu, bumbung bocor tepat atas tiga gerai sayur, sementara jawatankuasa pasar dah bertahun-tahun kutip bayaran pembaikan guna tulisan tangan. Peniaga nak masalah ni selesai sebelum cuti sekolah bawa lebih ramai pelanggan. Kerajaan negeri boleh baiki bumbung, rasmikan kutipan, atau benarkan peniaga urus dana pembaikan yang berhad.',
    options: ['Ganti bumbung melalui unit kerja negeri', 'Terbitkan kadar sewa dan fi gerai', 'Benarkan peniaga urus dana pembaikan terhad'],
    results: [
      'Bumbung tak bocor lagi dan pelanggan senang, tapi kosnya tolak naik taraf kecil di pasar lain ke belakang.',
      'Kadar bayaran jadi jelas dan jawatankuasa hilang kuasa tak rasmi; peniaga yang selesa dengan cara lama membantah.',
      'Pembaikan bermula cepat dengan kurang birokrasi, tapi peniaga tanggung kerja pentadbiran dan mungkin bergaduh pasal resit.',
    ],
  },
  kedahHillQuarryAccess: {
    title: 'Jalan Pintas Lori Kuari',
    body: 'Laluan lori ke kuari bukit (rekaan) dah jadi jalan pintas tak rasmi ke dua kampung, tinggalkan bahu jalan retak dan habuk depan kedai. Pengusaha kata jalan tu bukan direka untuk muatan berat; penduduk pula dakwa akses tu diluluskan kerajaan negeri. Kena buat keputusan sebelum lesen disemak semula.',
    options: ['Hadkan lori berat pada waktu tertentu', 'Wajibkan pengusaha naik taraf jalan', 'Kekalkan laluan dan pantau kerosakan'],
    results: [
      'Malam kampung lebih tenang, tapi kos operasi kuari naik dan pengusaha beri amaran peluang kerja tempatan mungkin berkurang.',
      'Pengusaha tanggung kos jalan lebih kukuh, tapi kerja kuari perlahan masa pembinaan dan kedai sekitar kehilangan sebahagian pelanggan.',
      'Lori terus bergerak dan kos dapat dielak buat masa ni, tapi setiap rekahan baharu akan jadi gambar yang dihantar ke pejabat kerajaan.',
    ],
  },
  kedahVillageLease: {
    title: 'Permit Sementara, Dapur Kekal',
    body: 'Penduduk Taman Paya Murni bina dapur tambahan dan bengkel kecil atas tanah negeri dengan permit sementara yang tak seragam. Ada permit tamat dalam 90 hari, dan peta ukur pula tunjuk satu lorong akses awam merentasi penempatan tu. Kerajaan negeri boleh susun semula status tanah, kosongkan lorong, atau semak setiap kes satu demi satu.',
    options: ['Tawar pajakan boleh diperbaharui bersyarat', 'Kosongkan lorong akses awam dulu', 'Semak setiap lot secara individu'],
    results: [
      'Keluarga dapat kepastian dan negeri terima fi berkala, tapi syarat ketat kecewakan mereka yang mengharapkan hak milik kekal.',
      'Akses awam dan laluan kecemasan dipulihkan, tapi beberapa keluarga kena roboh tambahan rumah lepas tu salahkan kerajaan.',
      'Kes rumit diberi perhatian lebih adil, tapi proses lambat dan penduduk terus tak pasti lepas permit tamat.',
    ],
  },
  kedahFloodRetentionLand: {
    title: 'Kolam di Sebalik Lalang',
    body: 'Seorang pemaju nak tambak tanah rendah dekat Sungai Keladi untuk deretan kedai pejabat baharu. Pejabat tanah sahkan permohonan lengkap, tapi penduduk tunjuk kolam takungan lama yang sekarang tersembunyi di bawah lalang dan papan tanda reput. Kerajaan negeri ada sepuluh hari untuk lulus, tolak, atau minta pelan baharu.',
    options: ['Luluskan dengan sumbangan saliran lebih besar', 'Tolak permohonan', 'Minta pelan baharu dengan kepadatan lebih rendah'],
    results: [
      'Projek diteruskan dan dana saliran bertambah, tapi penduduk sekitar anggap kerajaan jual risiko ikut meter padu.',
      'Kolam takungan dikekalkan dan penduduk lega, tapi negeri hilang hasil berkaitan tanah yang dijangka dan pemaju ugut nak tarik diri.',
      'Sebahagian kawasan takungan dilindungi, tapi pemaju kurangkan lot kedai dan merungut pasal kos reka bentuk semula.',
    ],
  },
  kedahForestTrail: {
    title: 'Denai Hutan Tanpa Lesen',
    body: 'Sekumpulan komuniti tanda laluan berjalan kaki dalam hutan simpan negeri, siap dengan anak panah bercat tangan dan pondok jual air kelapa. Pegawai perhutanan kata laluan tu lintasi zon sensitif; pemandu tempatan pula kata tiga perniagaan kampung hidup semula sebabnya. Kerajaan negeri kena putuskan sebelum acara hujung minggu tarik ratusan pengunjung.',
    options: ['Tutup laluan sementara tunggu penilaian', 'Wujudkan laluan komuniti berlesen', 'Jalankan percubaan hujung minggu dengan pemantauan'],
    results: [
      'Hutan simpan dilindungi daripada kunjungan serta-merta, tapi pemandu hilang pendapatan dan tuduh kerajaan kunci hutan macam stor.',
      'Pemandu dapat laluan sah dengan peraturan pemuliharaan, tapi fi dan had pengunjung buat sebahagian sukarelawan tarik diri.',
      ['Jumlah pengunjung terkawal dan laluan berpeluang dapat lesen, tapi kos renjer dan pembersihan naik.', 'Laluan sesak, sampah sampai ke anak sungai dan kerajaan tanggung kos pembersihan sementara kumpulan pemuliharaan desak tutup.'],
    ],
  },
  kedahLocalParking: {
    title: 'App Parkir Tak Kenal Jalan',
    body: 'Di Bandar Nira, app parkir majlis boleh terima bayaran tapi gagal kenal separuh nama jalan, termasuk jalan depan pejabatnya sendiri. Peniaga nak parkir singkat percuma; penduduk nakkan permit; majlis pula perlukan hasil tetap untuk garisan jalan dan longkang. Projek rintis tamat hujung bulan ni.',
    options: ['Kekalkan app dan subsidi parkir singkat', 'Ganti app dengan sistem permit dan meter', 'Hentikan parkir berbayar selama tiga bulan'],
    results: [
      'Pelanggan boleh singgah dengan kos rendah dan app dapat satu lagi peluang kemas kini, tapi majlis bayar pembaikan sistem dan hilang sebahagian hasil parkir.',
      'Peraturan lebih jelas dan penguatkuasaan bertambah baik, tapi pengunjung dan peniaga tak suka urusan permit dan caj baharu.',
      'Orang ramai lega sekejap, tapi kerja mengecat jalan ditangguh dan bajet operasi majlis berlubang.',
    ],
  },
  kedahVillageHall: {
    title: 'Dewan dengan Satu Kipas',
    body: 'Dewan serbaguna Kampung Teluk Rawa cuma ada satu kipas yang berfungsi, langsir pentas berbau hapak dan buku tempahan dengan tiga jenis tulisan. Kumpulan belia nak akses waktu malam, penganjur kenduri nak keutamaan hujung minggu, jawatankuasa kampung pula nak terus pegang kunci. Geran negeri cuma mampu tampung satu model pengurusan suku tahun ni.',
    options: ['Biayai pengendali tempahan profesional', 'Serahkan pengurusan kepada jawatankuasa kampung dengan geran', 'Tetapkan waktu mingguan untuk kumpulan belia'],
    results: [
      'Tempahan lebih teratur dan penyelenggaraan direkod, tapi fi naik sampai acara kecil rasa terlalu mahal.',
      'Pengurusan kekal di tangan penduduk dan jawatankuasa gembira, tapi perebutan tarikh popular berterusan di sebalik langsir lama.',
      'Belia dapat ruang tetap, tapi beberapa tempahan hujung minggu terpaksa diketepikan dan penganjur kenduri mula minta pengecualian.',
    ],
  },
  kedahWaterCatchment: {
    title: 'Bangsal di Kawasan Tadahan',
    body: 'Kawasan tadahan air kampung atas tanah negeri terhalang sebahagiannya oleh laluan lama dan deretan bangsal tanpa kebenaran. Kosongkan semua memang mudahkan penyelenggaraan, tapi beberapa keluarga simpan peralatan di situ dan koperasi tempatan guna laluan tu untuk angkut hasil. Kerajaan negeri ada masa yang suntuk sebelum pemeriksaan tahunan tadahan air.',
    options: ['Kosongkan bangsal dan laluan', 'Pindahkan bangsal dan sahkan laluan secara rasmi', 'Tangguh pengosongan dan buat pemeriksaan bersama'],
    results: [
      'Akses penyelenggaraan bertambah baik serta-merta, tapi keluarga hilang ruang simpanan dan koperasi terpaksa ikut laluan lebih jauh.',
      'Tadahan air lebih terlindung tanpa pengusiran terus, tapi kos pemindahan ditanggung kerajaan dan syarat guna laluan jadi lebih ketat.',
      'Penduduk diberi ruang bersuara dan pemeriksaan hasilkan bukti lebih baik, tapi halangan masih ada dan kumpulan pemuliharaan persoal kelewatan.',
    ],
  },
  kedahPublicJetty: {
    title: 'Jeti untuk Nelayan dan Pengunjung',
    body: 'Di Kuala Suri, jeti awam kecil yang digunakan nelayan dan pengunjung hujung minggu ada papan longgar dan tak ada pemisahan jelas antara kawasan memunggah hasil dan laluan orang berjalan. Pemeriksaan keselamatan dijadualkan dalam tiga minggu. Kerajaan negeri boleh tutup untuk bina semula, baiki bahagian paling bahaya, atau serahkan pengurusan harian kepada koperasi tempatan dengan syarat ketat.',
    options: ['Tutup jeti untuk dibina semula sepenuhnya', 'Baiki bahagian berbahaya dan buka sebahagian', 'Lantik koperasi urus akses'],
    results: [
      'Jeti yang siap nanti lebih selamat dan teratur, tapi nelayan hilang akses masa kerja dan pendapatan pelancongan merosot satu musim.',
      'Kebanyakan pengguna masih boleh masuk dan bahaya utama dihapuskan, tapi pembaikan tampal-sulam mungkin tak tahan satu lagi musim sibuk.',
      'Pengguna tempatan dapat kuasa mengurus dan kerajaan jimat tenaga, tapi koperasi kena kuatkuasakan peraturan terhadap jiran sendiri dan pengunjung berbayar.',
    ],
  },
};
