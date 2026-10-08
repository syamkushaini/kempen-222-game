import type { EventText } from './events';

// The federation, told in chapters, and the federal territories, in English and Bahasa Malaysia. Every person and
// place is the player's own country or invented. A result written as a pair is for a gamble: what is reported if it
// comes off, then if it does not.

export const FEDERATION_EVENTS_EN: Record<string, EventText> = {
  claimsTalks: {
    title: 'The claims of the Borneo states',
    body: 'The Borneo governments have written to you, again, about the terms on which they joined the federation: the share of oil, the control of land, the say in their own schools. This time they have asked for a date for talks, and a press conference to say so.',
    options: ['Open talks, and set a date', 'Refer it to a committee, and see', 'Say that the terms are settled'],
    results: [
      'The letter was answered the same week. It is a start, and everyone knows how long such starts take.',
      'A committee has been formed. It will meet in the new year, and so, probably, will the problem.',
      'The Borneo press called it the answer of a government that has not read the document. The Peninsula press did not call it anything.',
    ],
  },
  claimsStalled: {
    title: 'The talks stall',
    body: 'The talks have been going for ten weeks and the Borneo side has left the table once already. They want a transfer in writing before the next round, and the treasury wants to know what is being agreed in its name.',
    options: ['Offer a partial transfer now', 'Stall a little longer', 'Refer the dispute to the courts'],
    results: [
      'It is not what they asked for, and it is more than they expected. The talks resume.',
      ['The side that waits longest usually wins. This time it was you, and nobody minded.', 'They walked out for a second time, and made certain the cameras knew why.'],
      'The lawyers are delighted. The two sides are given a date, and a long time to wait for it.',
    ],
  },
  claimsVerdict: {
    title: 'The settlement',
    body: 'The talks, the court and the committee have all come to an end together, as these things do. There is a form of words, and it gives the Borneo governments most of what they asked for. The Cabinet is divided, and the cameras are in the lobby.',
    options: ['Accept it, and say so gracefully', 'Challenge it, and ask for a rehearing'],
    results: [
      'It is signed on a Saturday and framed on a Monday. The Borneo states say they were heard, and for a year they will say it kindly.',
      'The rehearing was granted, and the matter is open again. So, they say, is their patience.',
    ],
  },
  fedGrantCut: {
    title: 'The grant that did not come',
    body: 'The centre has not paid the state its yearly grant, and the letter explaining why is four lines long. The treasurer wants to know whether to cut roads or schools, and the opposition wants to know whether to be glad.',
    options: ['Protest in public and name the centre', 'Lobby quietly through the ministers who owe you', 'Cut the roads and say nothing'],
    results: [
      'The papers carry your press conference, and the centre carries a grudge. Both will be there at the next meeting.',
      'A minister agreed to look at it. He has been looking for some time.',
      'The roads are cut. Nobody blamed the centre, since nobody was told.',
    ],
  },
  fedTalks: {
    title: 'The grant, in committee',
    body: 'The centre has agreed to hear the state’s case, in a room with no windows, on a day of its choosing. You may bring a lawyer. You may also bring a friend.',
    options: ['Bring a legal claim and a good lawyer', 'Trade your party’s vote in the House for the grant', 'Walk away from the table'],
    results: [
      'The lawyer was good and the claim was sound, and neither is as quick as you would like.',
      'The grant will be paid, and the House will be told how you voted. Your own people would like a word.',
      'You walked away, and nobody ran after you.',
    ],
  },
  fedSettlement: {
    title: 'What the centre will pay',
    body: 'The centre has made an offer. It is less than the state is owed, and more than the state expected. The treasurer would take it, and the opposition, in the corridor, is hoping you will not.',
    options: ['Take the money, and sign', 'Hold out for the full sum'],
    results: [
      'The money arrives in a fortnight. The roads are mended, and the quarrel is filed.',
      ['They paid the lot, and added an apology. It will be quoted at you for years, in a pleasant way.', 'They did not. You are out of pocket, and the opposition has found its slogan.'],
    ],
  },
  cityHousing: {
    title: 'The city and its rents',
    body: 'Rents in the capital have gone up by a third in two years, and a family of six has been photographed living in a shipping container on a rooftop. The city hall says it is the ministry’s problem, and the ministry says the reverse.',
    options: ['Fund affordable housing in the city centre', 'Offer tax breaks to developers who build it', 'Call it a matter for the market'],
    results: [
      'The cranes arrive in the spring. The photograph of the family in the container is used for the groundbreaking.',
      'The developers build. Not much of it is affordable, and the young notice.',
      'The market spoke, and the city’s young voters went to look for a party that listens.',
    ],
  },
  flashFloods: {
    title: 'The city under water',
    body: 'Twenty minutes of rain and the main roads of the capital are rivers. Cars are on the pavements, and the drains, a councillor tells the cameras, were last cleaned in a previous reign.',
    options: ['Fund the drains and the pumps, now', 'Send the ministers in boots', 'Blame the council'],
    results: [
      'The pumps arrive within the week. The next storm will test them.',
      ['The ministers were photographed in boots and the water went down in the end. Fine.', 'The ministers were photographed in boots in water that did not go down.'],
      'Everyone knew whose drains they were. The council knows who said so.',
    ],
  },
  mayorRow: {
    title: 'The mayor and the minister',
    body: 'The mayor of the capital, who is appointed and not elected, has been publicly rebuked by a minister over a car park. The mayor has replied that he serves at the pleasure of the Palace and the people, in that order. The city is enjoying it.',
    options: ['Back the minister', 'Back the mayor', 'Stay out of it'],
    results: [
      'The mayor was quiet for a week. The city was not.',
      'The mayor sent a thank-you note. The minister, the party’s own, did not.',
      'Nobody said anything, which was quoted.',
    ],
  },
};

export const FEDERATION_EVENTS_MS: Record<string, EventText> = {
  claimsTalks: {
    title: 'Tuntutan negeri-negeri Borneo',
    body: 'Kerajaan-kerajaan Borneo telah menulis kepada anda, sekali lagi, tentang syarat mereka menyertai persekutuan: bahagian minyak, kawalan tanah, suara dalam sekolah mereka sendiri. Kali ini mereka minta tarikh rundingan, dan sidang akhbar untuk mengatakannya.',
    options: ['Buka rundingan, dan tetapkan tarikh', 'Rujuk kepada jawatankuasa, dan lihat', 'Katakan syarat-syaratnya sudah selesai'],
    results: [
      'Surat itu dijawab pada minggu yang sama. Ia permulaan, dan semua orang tahu betapa lamanya permulaan begini.',
      'Satu jawatankuasa telah ditubuhkan. Ia akan bersidang tahun depan, dan begitu juga, mungkin, masalah itu.',
      'Akhbar Borneo menyebutnya jawapan kerajaan yang belum membaca dokumen itu. Akhbar Semenanjung tidak menyebutnya apa-apa.',
    ],
  },
  claimsStalled: {
    title: 'Rundingan tersekat',
    body: 'Rundingan telah berjalan sepuluh minggu dan pihak Borneo sudah sekali meninggalkan meja. Mereka mahu pemindahan secara bertulis sebelum pusingan seterusnya, dan perbendaharaan mahu tahu apa yang dipersetujui atas namanya.',
    options: ['Tawarkan pemindahan separa sekarang', 'Berlengah sedikit lagi', 'Rujuk pertikaian kepada mahkamah'],
    results: [
      'Ia bukan apa yang mereka minta, dan lebih daripada yang mereka jangka. Rundingan bersambung.',
      ['Pihak yang menunggu paling lama biasanya menang. Kali ini anda, dan tiada siapa kisah.', 'Mereka keluar kali kedua, dan memastikan kamera tahu sebabnya.'],
      'Peguam gembira. Kedua-dua pihak diberi tarikh, dan masa yang lama untuk menunggunya.',
    ],
  },
  claimsVerdict: {
    title: 'Penyelesaian',
    body: 'Rundingan, mahkamah dan jawatankuasa semuanya berakhir serentak, seperti biasa. Ada rumusan perkataan, dan ia memberi kerajaan-kerajaan Borneo kebanyakan yang mereka minta. Kabinet berbelah bahagi, dan kamera di lobi.',
    options: ['Terimanya, dan katakannya dengan anggun', 'Cabarnya, dan minta pendengaran semula'],
    results: [
      'Ia ditandatangani pada hari Sabtu dan dibingkaikan pada hari Isnin. Negeri-negeri Borneo kata mereka didengar, dan setahun mereka akan mengatakannya dengan baik.',
      'Pendengaran semula dibenarkan, dan perkara itu terbuka semula. Begitu juga, kata mereka, kesabaran mereka.',
    ],
  },
  fedGrantCut: {
    title: 'Geran yang tidak datang',
    body: 'Pusat tidak membayar geran tahunan kepada negeri, dan surat yang menerangkan sebabnya empat baris panjang. Bendahari mahu tahu sama ada hendak potong jalan atau sekolah, dan pembangkang mahu tahu sama ada hendak bergembira.',
    options: ['Bantah di khalayak dan namakan pusat', 'Lobi secara senyap melalui menteri yang berhutang kepada anda', 'Potong jalan dan jangan kata apa-apa'],
    results: [
      'Akhbar menyiarkan sidang akhbar anda, dan pusat menyimpan dendam. Kedua-duanya akan ada pada mesyuarat seterusnya.',
      'Seorang menteri bersetuju melihatnya. Dia sudah lama melihatnya.',
      'Jalan dipotong. Tiada siapa menyalahkan pusat, kerana tiada siapa diberitahu.',
    ],
  },
  fedTalks: {
    title: 'Geran itu, di jawatankuasa',
    body: 'Pusat bersetuju mendengar kes negeri, di sebuah bilik tanpa tingkap, pada hari pilihannya. Anda boleh membawa peguam. Anda juga boleh membawa kawan.',
    options: ['Bawa tuntutan undang-undang dan peguam yang baik', 'Tukar undi parti anda dalam Dewan dengan geran itu', 'Tinggalkan meja'],
    results: [
      'Peguam itu baik dan tuntutannya kukuh, dan kedua-duanya tidak secepat yang anda mahu.',
      'Geran akan dibayar, dan Dewan akan diberitahu bagaimana anda mengundi. Orang anda sendiri mahu bercakap dengan anda.',
      'Anda berjalan pergi, dan tiada siapa mengejar.',
    ],
  },
  fedSettlement: {
    title: 'Apa yang pusat akan bayar',
    body: 'Pusat telah membuat tawaran. Ia kurang daripada yang negeri patut terima, dan lebih daripada yang dijangka. Bendahari akan mengambilnya, dan pembangkang, di koridor, berharap anda tidak.',
    options: ['Ambil wang itu, dan tandatangan', 'Bertahan untuk jumlah penuh'],
    results: [
      'Wang tiba dalam dua minggu. Jalan dibaiki, dan pertikaian itu difailkan.',
      ['Mereka membayar semuanya, dan menambah permohonan maaf. Ia akan disebut kepada anda bertahun-tahun, dengan cara yang menyenangkan.', 'Mereka tidak. Anda rugi, dan pembangkang telah menemui slogannya.'],
    ],
  },
  cityHousing: {
    title: 'Bandar dan sewanya',
    body: 'Sewa di ibu negara naik satu pertiga dalam dua tahun, dan satu keluarga enam orang telah difoto tinggal dalam kontena di atas bumbung. Dewan bandar raya kata ia masalah kementerian, dan kementerian kata sebaliknya.',
    options: ['Biayai perumahan mampu milik di pusat bandar', 'Tawarkan rebat cukai kepada pemaju yang membinanya', 'Katakan ia urusan pasaran'],
    results: [
      'Kren tiba pada musim bunga. Foto keluarga dalam kontena itu digunakan untuk pecah tanah.',
      'Pemaju membina. Tidak banyak yang mampu milik, dan yang muda perasan.',
      'Pasaran telah berkata, dan pengundi muda bandar pergi mencari parti yang mendengar.',
    ],
  },
  flashFloods: {
    title: 'Bandar di bawah air',
    body: 'Dua puluh minit hujan dan jalan utama ibu negara menjadi sungai. Kereta di atas kaki lima, dan longkang, kata seorang ahli majlis kepada kamera, kali terakhir dibersihkan pada zaman dahulu.',
    options: ['Biayai longkang dan pam, sekarang', 'Hantar menteri berkasut but', 'Salahkan majlis'],
    results: [
      'Pam tiba dalam seminggu. Ribut seterusnya akan menguji mereka.',
      ['Menteri difoto berkasut but dan air surut akhirnya. Baik.', 'Menteri difoto berkasut but dalam air yang tidak surut.'],
      'Semua orang tahu longkang siapa itu. Majlis tahu siapa yang berkata begitu.',
    ],
  },
  mayorRow: {
    title: 'Datuk Bandar dan menteri',
    body: 'Datuk Bandar ibu negara, yang dilantik dan bukan dipilih, ditegur terbuka oleh seorang menteri tentang sebuah tempat letak kereta. Datuk Bandar membalas bahawa dia berkhidmat atas perkenan Istana dan rakyat, mengikut susunan itu. Bandar ini menikmatinya.',
    options: ['Menyokong menteri', 'Menyokong Datuk Bandar', 'Jangan campur'],
    results: [
      'Datuk Bandar senyap seminggu. Bandar tidak.',
      'Datuk Bandar menghantar nota terima kasih. Menteri, orang parti sendiri, tidak.',
      'Tiada siapa berkata apa-apa, dan itu pun disebut.',
    ],
  },
};
