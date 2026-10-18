import type { EventText } from './events';

// Eight stories of Sarawak, in English and Bahasa Malaysia. Every place and person is invented. A result written as a pair is for a gamble: the win, then the loss.

export const SARAWAK_STORIES_EN: Record<string, EventText> = {
  sarawakGridHandshake: {
    title: 'The Borneo Grid Handshake',
    body: 'The Premier of Sarawak is in your waiting room with a one-page MoU and a thermos of kopi O. He wants a federal letter of comfort so SEGrid Sarawak can sell 300MW of spare hydro to Nusantara via a 275kV line through Entikong. Treasury says any guarantee counts as federal contingent liability. Jakarta wants a yes before Friday.',
    options: ['Sign the federal comfort letter', 'Push a private consortium without guarantee', 'Kick it to the MA63 technical committee'],
    results: [
      'You sign. KL takes the risk, Kuching takes the photo. Treasury books RM700m contingent, partners love you, reformists in your party call you a chequebook.',
      ['Private banks blink and sign anyway. You look market-savvy and save fiscal space.', 'No bank touches it without Putrajaya. Sarawak press calls it “Putrajaya plays hard to get”, and stability wobbles.'],
      'You buy time with a committee. Your party whips are relieved, but Kuching longhouses read it as another Putrajaya delay tactic.',
    ],
  },
  borneoLanternPact: {
    title: 'The Lantern Bargain',
    body: 'Your Sarawak partner party wants RM80k federal match for Pesta Tanglung Sungai Ruan — 2,000 recycled lanterns, 15 kampung bands, and a floating stage that almost sank last year. They say it proves “federal respects Borneo culture”. Your youth wing says it is a glorified photo-op while their hostel roof leaks. PM’s office says no extra culture budget unless you trade something.',
    options: ['Pay the match from party funds, take the stage', 'Divert to federal Cultural Fund, no party cash', 'Gamble on personal pitch to PM for free airtime on RTM'],
    results: [
      'You pay. The lanterns float, the band plays off-key, Kuching likes you. Your own treasurer sends a passive-aggressive spreadsheet at 2am.',
      'You push it to the federal Cultural Fund. No party money burnt, urban liberals clap for process, but your partner sulks — “culture is politics too”.',
      ['PM gives you 10 minutes on RTM Sarawak primetime. Cheap win, longhouses see your face.', 'PM says RTM is not your TikTok. You lose face with both PM and your own bloc, and unity cracks.'],
    ],
  },
  longhouseLeakApology: {
    title: 'The Tuai Rumah Tape',
    body: 'A 47-second clip leaked from your strategy huddle: your deputy mocks a Tuai Rumah welcoming chant as “karaoke with extra steps”. It hits WhatsApp groups in Kapit and Miri by lunch. The Tuai Rumah of Rh. Janting, Nanga Semuh — 78 doors, 312 voters — wants a public apology at his ruai tomorrow. Your base in KL thinks apologizing is surrender.',
    options: ['Fly to Nanga Semuh and apologize at the ruai', 'Call the clip AI-doctored, attack the leaker', 'Do a quiet service tour, fix their solar micro-grid'],
    results: [
      'You sit on the mat, drink tuak to the brim, apologize in Iban. Longhouse elders nod. Your KL base whispers you are soft.',
      'You claim deepfake. Urban timeline cheers “don’t bend”, but longhouse aunties forward the original audio with timestamp. Trust dips.',
      ['You spend two days hauling batteries upriver and the micro-grid hums again. No speech, just light. Elders post your sweaty photo, cred jumps.', 'The grid trips again at night. Photo of you holding a dead inverter goes viral with “parachute politics”. You lose cred and RM30k logistics.'],
    ],
  },
  sarawakNativeMapChoice: {
    title: 'Who Draws the Line?',
    body: 'Jabatan Tanah dan Survei reports 14,000 NCR claims stuck because old tracing paper maps smell of mildew. Three kampungs in Ulu Tebaang say their durian groves are inside a new oil palm provisional lease. You control land — federal cannot touch this. The Land Code requires you to decide how native boundaries are surveyed before gazette.',
    options: ['Let JTS do it, proper chain and GPS', 'Fund community mappers with elders and drones', 'Give it to a Sarawak tech startup, MyTanaMap'],
    results: [
      'JTS surveyors march in with tripods. Precise, slow, legally bulletproof. NCR families say it feels like the state measuring their grandmothers’ graves.',
      'Elders walk with drones, naming every sungai. NCR folks cheer, cost is low, but your state secretary warns precedent — every kampung will want their own map team.',
      'Startup boys scan fast, produce a slick app with lime-green polygons. Urban voters love the UI, elders can’t open the file, your cred drops when the app crashes in court.',
    ],
  },
  sarawakPotholeBounty: {
    title: 'The Pothole Bounty',
    body: 'Jalan Datuk Tawi in Sibu Jaya has 23 potholes in 400 meters — enough to rattle dentures. State roads are state power, so you can hammer. Your intern builds JalanLubang.my: snap, geotag, RM5 bounty. The council says you are encouraging “trial by TikTok”. Your treasurer says bounties bleed funds fast.',
    options: ['Launch bounty, pay RM5 per verified pothole', 'Map quietly, give data to council privately', 'Live-shame one big pothole outside council HQ'],
    results: [
      'Photos flood in. 412 potholes in 72 hours, RM2,060 paid. Urban voters love you, you look competent, wallet thinner.',
      'You hand a neat Excel to the council engineer. He fixes six holes silently. Small businesses thank you, no headlines, but you look like their intern.',
      ['You park a plastic chair in the mother-pothole and go live. 80k views, council tarred it by 5pm. Hero day.', 'Council calls police for “illegal obstruction”. Stream gets 300 views, mostly your cousins. You look petty and lose cred.'],
    ],
  },
  sarawakTimberSalesTaxTweak: {
    title: 'The 5% That Floats the Budget',
    body: 'Sarawak’s State Sales Tax on timber, like Sabah’s, is Sarawak’s own power — 5% on logs at export point. Your finance guy says raising valuation base from “contract price” to “market price” adds RM180m a year. Timber towkays in Bintulu say they will divert logs to “domestic processing” loophole. MA63 council meets next month and your move will be read as “Sarawak flexing autonomy”.',
    options: ['Raise base to market price, full 5% capture', 'Keep base but earmark for NCR housing fund', 'Announce joint review with timber association'],
    results: [
      'You raise. Revenue jumps, KL Finance frowns — they wanted you to wait for MA63 joint formula. Towkays slow shipments, smallbiz grumbles.',
      'You keep rate but ring-fence for Rumah Mampu Milik Adat. Revenue down a bit, natives and urban voters clap, you buy goodwill for MA63 talks.',
      ['Joint review works — they agree to publish price benchmark. You get half the revenue plus trust bump.', 'Review leaks as “secret deal”. Press says you capitulated, smallbiz contractors say you sold them out, stability dips.'],
    ],
  },
  hydroVillageTrustFund: {
    title: 'The Resettlement Ledger',
    body: 'Baleh micro-hydro is done. 41 families from Nanga Antawau moved to a new longhouse with zinc still smelling hot. State power says you must decide compensation model. The federal Indigenous Trust template offers annuity, but Sarawak land law lets you create a perpetual State Trust. Contractors want final payment this Friday.',
    options: ['Create perpetual state trust from hydro revenue', 'One-off cash plus party-managed welfare van', 'Give land lots at new site only'],
    results: [
      'You create Tabung Amanah Antawau — 2% hydro revenue forever. Natives cheer, Treasury groans, and the file goes to audit in 8 weeks.',
      'You pay cash and deploy a welfare van with your party logo. Cheaper, cred up short-term, file also goes to audit.',
      'You give lots, no cash. Urban economists clap for fiscal prudence, natives say “we can’t eat granite”. No audit follow-up.',
    ],
  },
  hydroVillageTrustReturns: {
    title: 'The Audit Returns',
    body: 'Eight weeks later, the State Auditor finds Tabung Antawau’s first quarter statement: RM14,200 spent on “capacity building” — mostly a team-building retreat at a Damai resort. The Tuai Rumah is on the phone: “We thought it was for diesel for the generator.” Press has the invoice.',
    options: ['Publish full ledger, apologize', 'Top up fund quietly from state budget', 'Blame resort contractor, sue for breach'],
    results: [
      'You publish every sen. Trust drops a bit for mess, but cred recovers for honesty. Ruai says at least you didn’t hide.',
      'You top up RM90k quietly. Natives get diesel, unity cracks because your exco asks why their PBT budget is cut.',
      ['Contractor refunds half after legal letter. You look firm, trust jumps.', 'Contractor posts your signed approval for “retreat with cultural immersion”. Trust crashes and stability shakes.'],
    ],
  },
};

export const SARAWAK_STORIES_MS: Record<string, EventText> = {
  sarawakGridHandshake: {
    title: 'Surat Jaminan Grid Borneo',
    body: 'Premier Sarawak tunggu di bilik sebelah dengan MoU satu muka surat dan termos kopi O. Dia nak surat sokongan Persekutuan supaya SEGrid Sarawak boleh jual 300MW lebihan hidro ke Nusantara ikut line 275kV Entikong. Perbendaharaan kata jaminan tu hutang luar jangka Persekutuan. Pihak seberang nak jawapan sebelum Jumaat.',
    options: ['Tandatangan surat jaminan Persekutuan', 'Tolak jaminan, suruh konsortium swasta ambil risiko', 'Tolak ke Jawatankuasa Teknikal MA63'],
    results: [
      'Anda tandatangan. KL tanggung risiko, Kuching dapat gambar. Buku Perbendaharaan catat tanggungan RM700m, rakan gabungan suka, sayap reformis dalam parti kata anda jadi buku cek.',
      ['Bank swasta akhirnya tandatangan juga. Anda nampak bijak pasaran dan jimat ruang fiskal.', 'Tak ada bank berani tanpa Putrajaya. Akhbar Kuching tulis “Putrajaya jual mahal”, kestabilan goyang.'],
      'Anda beli masa dengan jawatankuasa. Whip parti lega, tapi rumah panjang di Sarawak baca ini sebagai taktik lengah Putrajaya lagi.',
    ],
  },
  borneoLanternPact: {
    title: 'Tawar-Menawar Pesta Tanglung',
    body: 'Parti rakan gabungan dari Sarawak nak padanan RM80k Persekutuan untuk Pesta Tanglung Sungai Ruan: 2,000 tanglung kitar semula, 15 kugiran kampung, pentas terapung yang hampir karam tahun lepas. Kata mereka ni bukti “Persekutuan hormat budaya Borneo”. Sayap pemuda anda kata ini pesta bergambar saja, bumbung asrama mereka masih bocor. Pejabat PM kata tak ada bajet budaya tambahan kecuali anda tukar sesuatu.',
    options: ['Bayar padanan dari tabung parti, naik pentas', 'Tolak ke Tabung Budaya Persekutuan, jangan guna duit parti', 'Cuba nasib menghadap PM minta slot RTM percuma'],
    results: [
      'Anda bayar. Tanglung terapung, kugiran sumbang, Kuching suka anda. Bendahari parti hantar spreadsheet pasif-agresif pukul 2 pagi.',
      'Anda tolak ke Tabung Budaya Persekutuan. Duit parti selamat, pengundi bandar tepuk tangan pasal proses, tapi rakan gabungan merajuk: “budaya pun politik juga”.',
      ['PM bagi 10 minit slot perdana RTM Sarawak. Menang murah, rumah panjang nampak muka anda.', 'PM kata RTM bukan TikTok anda. Hilang muka dengan PM dan dengan blok sendiri, perpaduan retak.'],
    ],
  },
  longhouseLeakApology: {
    title: 'Rakaman Tuai Rumah Bocor',
    body: 'Klip 47 saat bocor dari mesyuarat strategi anda: timbalan anda perli bacaan alu-aluan Tuai Rumah sebagai “karaoke tambah langkah”. Tengah hari dah masuk group WhatsApp Kapit dan Miri. Tuai Rumah Rh. Janting, Nanga Semuh, 78 pintu, 312 pengundi, nak permohonan maaf terbuka di ruai esok. Penyokong anda di KL rasa minta maaf tu macam kalah.',
    options: ['Terbang ke Nanga Semuh, minta maaf di ruai', 'Kata klip tu AI palsu, serang pembocor', 'Buat khidmat senyap, baiki mikro-grid solar rumah panjang'],
    results: [
      'Anda duduk di tikar, teguk tuak sampai habis, minta maaf dalam bahasa Iban. Orang tua angguk. Penyokong KL berbisik anda terlalu lembut.',
      'Anda kata deepfake. Timeline bandar sorak “jangan tunduk”, tapi makcik rumah panjang forward audio asal dengan cap masa. Kepercayaan jatuh.',
      ['Anda dua hari angkut bateri mudik, mikro-grid berdengung semula. Tak ada ucapan, cuma lampu menyala. Orang tua pos gambar anda berpeluh, kredibiliti naik.', 'Grid trip lagi malam tu. Gambar anda pegang inverter mati jadi viral dengan kapsyen “politik payung terjun”. Hilang kredibiliti dan RM30k logistik.'],
    ],
  },
  sarawakNativeMapChoice: {
    title: 'Siapa Lukis Sempadan?',
    body: 'Jabatan Tanah dan Survei lapor 14,000 tuntutan NCR tersangkut sebab peta kertas lama berbau kulat. Tiga kampung di Ulu Tebaang kata kebun durian mereka masuk dalam lesen ladang sawit sementara yang baru. Tanah kuasa negeri, Persekutuan tak boleh masuk campur. Kanun Tanah minta anda putuskan cara sempadan adat disukat sebelum warta.',
    options: ['Biar JTS sukat, rantai dan GPS rasmi', 'Biar komuniti sendiri petakan dengan orang tua dan dron', 'Beri pada syarikat teknologi Sarawak, MyTanaMap'],
    results: [
      'Juruukur JTS masuk dengan tripod. Tepat, lambat, kukuh di mahkamah. Keluarga NCR kata rasa macam kerajaan sukat kubur nenek mereka.',
      'Orang tua jalan bersama dron, sebut nama setiap sungai. Orang NCR sorak, kos rendah, tapi setiausaha kerajaan negeri bimbang duluan: semua kampung nak pasukan peta sendiri.',
      'Budak startup imbas laju, hasilkan app cantik dengan poligon hijau limau. Pengundi bandar suka UI, orang tua tak boleh buka fail, kredibiliti anda jatuh bila app hang di mahkamah.',
    ],
  },
  sarawakPotholeBounty: {
    title: 'Ganjaran Jalan Berlubang',
    body: 'Jalan Datuk Tawi di Sibu Jaya ada 23 lubang dalam 400 meter, cukup untuk gegar gigi palsu. Jalan negeri kuasa negeri, jadi anda boleh ketuk. Intern anda bina JalanLubang.my: snap, geotag, ganjaran RM5. Majlis kata anda galak “hukum ikut TikTok”. Bendahari kata ganjaran cepat habiskan duit.',
    options: ['Lancar ganjaran, bayar RM5 satu lubang sah', 'Petakan senyap, beri data pada majlis secara peribadi', 'Buat live, malukan satu lubang besar depan HQ majlis'],
    results: [
      'Gambar mencurah. 412 lubang dalam 72 jam, RM2,060 habis. Pengundi bandar suka anda, nampak cekap, poket nipis.',
      'Anda serah Excel kemas pada jurutera majlis. Dia tampal enam lubang senyap-senyap. Peniaga kecil terima kasih, tak ada tajuk akhbar, tapi anda nampak macam intern mereka.',
      ['Anda letak kerusi plastik dalam lubang gergasi dan live. 80k tontonan, majlis terus tar pukul 5 petang. Hari hero.', 'Majlis panggil polis sebab “halang lalu lintas”. Live dapat 300 tontonan, kebanyakan sepupu anda. Nampak kecil hati dan hilang kredibiliti.'],
    ],
  },
  sarawakTimberSalesTaxTweak: {
    title: '5% Yang Apungkan Bajet',
    body: 'Cukai Jualan Negeri Sarawak atas balak, macam di Sabah, memang kuasa negeri sendiri: 5% atas balak di pintu eksport. Orang kewangan anda kata tukar asas nilai dari “harga kontrak” ke “harga pasaran” tambah RM180m setahun. Tauke balak di Bintulu kata mereka akan lencongkan balak ikut lohong “pemprosesan domestik”. Majlis MA63 bermesyuarat bulan depan dan langkah anda akan dibaca sebagai “Sarawak tunjuk autonomi”.',
    options: ['Naikkan asas ke harga pasaran, kutip penuh 5%', 'Kekal asas tapi khususkan untuk tabung rumah adat', 'Umum semakan bersama persatuan balak'],
    results: [
      'Anda naikkan. Hasil melonjak, Kewangan KL muncung, mereka nak anda tunggu formula bersama MA63. Tauke perlahankan penghantaran, peniaga kecil merungut.',
      'Anda kekalkan kadar tapi ikat untuk Rumah Mampu Milik Adat. Hasil kurang sikit, orang asal dan orang bandar tepuk tangan, anda beli modal rundingan MA63.',
      ['Semakan bersama menjadi: mereka setuju siar penanda harga. Anda dapat separuh hasil, kepercayaan pun naik.', 'Draf bocor sebagai “rundingan senyap”. Akhbar kata anda tunduk, kontraktor kecil kata anda jual mereka, kestabilan jatuh.'],
    ],
  },
  hydroVillageTrustFund: {
    title: 'Lembaran Penempatan Semula',
    body: 'Hidro mikro Baleh dah siap. 41 keluarga dari Nanga Antawau berpindah ke rumah panjang baru, zink masih bau panas. Kuasa negeri kata anda kena putuskan model pampasan. Templat Amanah Persekutuan bagi anuiti, tapi undang-undang tanah Sarawak benarkan anda cipta Amanah Negeri yang kekal. Kontraktor nak bayaran muktamad Jumaat ni.',
    options: ['Cipta amanah negeri kekal daripada hasil hidro', 'Bagi tunai sekali gus, ditambah van kebajikan parti', 'Beri lot tanah di tapak baru saja'],
    results: [
      'Anda cipta Tabung Amanah Antawau: 2% hasil hidro selamanya. Orang asal sorak, Perbendaharaan mengeluh, fail masuk audit lapan minggu lagi.',
      'Anda bayar tunai dan hantar van kebajikan berlogo parti. Lebih murah, kredibiliti naik sekejap, fail tetap masuk audit.',
      'Anda beri lot saja, tak ada tunai. Ahli ekonomi bandar tepuk tangan sebab jimat, orang asal kata “granit tak boleh dimakan”. Tak ada susulan audit.',
    ],
  },
  hydroVillageTrustReturns: {
    title: 'Audit Datang Balik',
    body: 'Lapan minggu kemudian, Juruaudit Negeri jumpa penyata suku pertama Tabung Antawau: RM14,200 untuk “pembinaan kapasiti”, kebanyakannya retreat bina pasukan di resort Damai. Tuai Rumah telefon: “Kami ingat untuk diesel janakuasa.” Akhbar dah ada invois.',
    options: ['Siar lejar penuh, minta maaf', 'Top up senyap-senyap dari bajet negeri', 'Salahkan kontraktor resort, saman'],
    results: [
      'Anda siar setiap sen. Kepercayaan jatuh sikit sebab caca-marba, tapi kredibiliti pulih sebab jujur. Ruai kata sekurang-kurangnya anda tak sorok.',
      'Anda top up RM90k senyap-senyap. Orang asal dapat diesel, perpaduan retak sebab exco tanya kenapa bajet PBT mereka dipotong.',
      ['Kontraktor pulang separuh lepas surat peguam. Anda nampak tegas, kepercayaan naik.', 'Kontraktor pos kelulusan anda yang bertandatangan untuk “retreat dengan rendaman budaya”. Kepercayaan jatuh dan kestabilan goyang.'],
    ],
  },
};
