import type { EventText } from './events';

// Seven surprises from the road between elections, in English and Bahasa Malaysia (see eventListTrail.ts). Invented places and people.

export const TRAIL_EVENTS_EN: Record<string, EventText> = {
  leakedVoiceNote: {
    title: 'The voice note nobody was meant to hear',
    body: 'A voice note from a late-night party group chat has leaked. In it a senior figure, tired and fed up, grumbles about a coalition partner and jokes about a by-election candidate. It is not a crime, but it is a very bad tone, and every news desk has a copy.',
    options: ['Play it straight: confirm it is real and apologise in person', 'Say it was taken out of context and move on', 'Say nothing and hope the week ends'],
    results: [
      ['The apology was blunt and human, and people respected it more than the grumble hurt.', 'The apology sounded rehearsed, and the clip kept going round.'],
      'The excuse is accepted by your own side, and by almost nobody else.',
      'Silence is read as agreement, and the netizens keep the clip alive for a few days.',
    ],
  },
  rainyRally: {
    title: 'A rally in the rain',
    body: 'The monsoon has come in hard on the evening of your biggest rally of the month. Half the crowd has already gone home, the stage lights are flickering, and the organisers are asking whether to call it off or press on.',
    options: ['Move it into a nearby hall at your own expense', 'Go on in the rain and talk to whoever stayed', 'Cancel and apologise to the crowd'],
    results: [
      'The hall is cosy and full, the speeches are good, and the bill is paid.',
      ['Soaked and smiling, you spoke to the faithful and the photos were the best of the year.', 'The microphone died and you shouted through the rain; the clip is not flattering.'],
      'Nobody gets wet, and nobody forgets that the party gave up at the first drizzle.',
    ],
  },
  rivalWalkout: {
    title: 'The rival who walked out of the debate',
    body: 'A rival leader has stormed out of a live television debate after a heated exchange, leaving an empty chair and an embarrassed moderator. The studio wants you to either fill the time or leave. The country is watching.',
    options: ['Stay and answer calmly, to the empty chair too', 'Seize the moment and attack the rival for running away', 'Walk out in sympathy with the moderator'],
    results: [
      'You looked steady and grown-up, and your people say it was your best night.',
      ['The attack landed and the clip was shared by everyone, even people who do not like you.', 'The attack overreached; people felt it was cheap and the moderator said so.'],
      'The walk-out looked like a copy, and the story went to the other side.',
    ],
  },
  youngVolunteers: {
    title: 'Young volunteers with a plan of their own',
    body: 'A group of first-time volunteers from the campus have set up their own phone-banking centre without asking anyone. They are energetic, a little chaotic, and have already contacted several thousand voters. The party office is unsure whether to adopt them or tell them to wait for training.',
    options: ['Adopt them, give them a room and a small budget', 'Let them carry on but ask them to follow the script', 'Tell them to wait for the official programme'],
    results: [
      'The centre hums, the young feel seen, and the older cadres learn some new tricks.',
      'The volunteers keep working and the office keeps control, though the energy cools a little.',
      'They feel dismissed, drift away, and tell their friends why.',
    ],
  },
  surveyFlash: {
    title: 'A flash survey with a very good number',
    body: 'A little-known research firm has published a flash survey putting your party well ahead in a key state. The sample is small and the firm cannot be checked, but the number is very good and the press wants a reaction within the hour.',
    options: ['Welcome it with a warning that it is only a snapshot', 'Cheer the number loudly on every channel', 'Ignore it and say nothing'],
    results: [
      'Your caution looked honest, which is rare, and the journalists noticed.',
      ['The mood lifted and the number was repeated everywhere for a week.', 'A rival exposed the firm’s thin method, and you looked foolish for boasting.'],
      'The survey fades and nobody remembers who ignored it.',
    ],
  },
  widowsPetition: {
    title: 'The petition at the surau door',
    body: 'A group of widows from a fictional kampung, left out of a welfare scheme on a technicality, have delivered a long handwritten petition to your constituency office. A local reporter is on the steps. Each case is small, but together they are a story.',
    options: ['Pay the shortfall from the party fund and press the ministry', 'Take the petition and promise to raise it in the house', 'Say the matter belongs with the ministry and not with you'],
    results: [
      'Families get help quickly, and the kampung remembers who stood at the door.',
      'The petition is read in the house and the promise is kept, though slowly.',
      'You are right on the technicality and wrong in the eyes of the kampung.',
    ],
  },
  midnightRoadshow: {
    title: 'A midnight roadshow in the market',
    body: 'Your advance team suggests a late-night walk through a big wet market just as the stalls open. It is the best moment to meet traders and early shoppers, and also the worst moment to be tired on camera. The leader is asked to decide.',
    options: ['Do it properly with a full team and refreshments', 'Do it with a small team and no script', 'Skip it and rest'],
    results: [
      'The stall holders love it and the party looks like it never sleeps.',
      ['The unplanned moments were the best part, and people shared them.', 'A slip of the tongue near the fish stall made the evening news for the wrong reason.'],
      'Rest helps your voice and nothing else.',
    ],
  },
};

export const TRAIL_EVENTS_MS: Record<string, EventText> = {
  leakedVoiceNote: {
    title: 'Nota suara yang tak sepatutnya didengar',
    body: 'Satu nota suara dari kumpulan sembang parti lewat malam telah bocor. Di dalamnya seorang tokoh kanan, penat dan bosan, merungut tentang rakan gabungan dan bergurau tentang calon pilihan raya kecil. Ia bukan jenayah, tapi nadanya sangat buruk, dan setiap meja berita ada salinannya.',
    options: ['Berterus terang: sahkan ia benar dan minta maaf secara peribadi', 'Kata ia diambil di luar konteks dan teruskan', 'Diam dan harap minggu ini cepat berlalu'],
    results: [
      ['Maaf itu terus terang dan manusiawi, dan orang lebih hormat daripada rasa terluka dengan rungutan itu.', 'Maaf itu bunyi seperti sudah dilatih, dan klip itu terus tersebar.'],
      'Alasan itu diterima oleh pihak sendiri dan hampir tiada orang lain.',
      'Senyap dibaca sebagai bersetuju, dan netizen hidupkan klip itu beberapa hari lagi.',
    ],
  },
  rainyRally: {
    title: 'Ceramah dalam hujan',
    body: 'Hujan monsun turun lebat pada malam ceramah terbesar bulan ini. Separuh hadirin sudah pulang, lampu pentas berkelip-kelip, dan penganjur bertanya sama ada mahu batalkan atau teruskan.',
    options: ['Pindahkan ke dewan berdekatan dengan belanja sendiri', 'Teruskan dalam hujan dan berbual dengan yang masih tinggal', 'Batalkan dan minta maaf kepada hadirin'],
    results: [
      'Dewan itu selesa dan penuh, ucapan bagus, dan bil dibayar.',
      ['Basah kuyup tapi tersenyum, awak bercakap dengan yang setia dan gambar itu yang terbaik tahun ini.', 'Mikrofon mati dan awak menjerit dalam hujan; klipnya tidak cantik.'],
      'Tiada siapa basah, dan tiada siapa lupa parti mengalah pada gerimis pertama.',
    ],
  },
  rivalWalkout: {
    title: 'Pesaing yang keluar dari debat',
    body: 'Seorang pemimpin pesaing keluar marah-marah dari debat televisyen langsung selepas pertengkaran sengit, meninggalkan kerusi kosong dan pengacara yang malu. Studio mahu awak sama ada isi masa atau pergi. Seluruh negara sedang menonton.',
    options: ['Kekal dan jawab dengan tenang, juga kepada kerusi kosong', 'Rebut peluang dan serang pesaing yang lari', 'Keluar sebagai simpati kepada pengacara'],
    results: [
      'Awak nampak tenang dan matang, dan orang awak kata itulah malam terbaik awak.',
      ['Serangan itu mengena dan klipnya dikongsi semua orang, termasuk yang tak suka awak.', 'Serangan itu keterlaluan; orang rasa ia murah dan pengacara berkata begitu.'],
      'Keluar itu nampak seperti meniru, dan cerita berpindah ke pihak lawan.',
    ],
  },
  youngVolunteers: {
    title: 'Sukarelawan muda dengan rancangan sendiri',
    body: 'Sekumpulan sukarelawan kali pertama dari kampus telah tubuhkan pusat panggilan telefon sendiri tanpa tanya sesiapa. Mereka bertenaga, agak kelam-kabut, dan sudah hubungi beberapa ribu pengundi. Pejabat parti tak pasti sama ada mahu ambil mereka atau suruh tunggu latihan.',
    options: ['Ambil mereka, beri bilik dan belanjawan kecil', 'Biar mereka teruskan tapi minta ikut skrip', 'Suruh tunggu program rasmi'],
    results: [
      'Pusat itu rancak, orang muda rasa dihargai, dan kader lama belajar cara baharu.',
      'Sukarelawan terus bekerja dan pejabat kekal kawalan, walaupun semangat sedikit sejuk.',
      'Mereka rasa diketepikan, beransur pergi, dan beritahu kawan-kawan sebabnya.',
    ],
  },
  surveyFlash: {
    title: 'Tinjauan kilat dengan angka yang sangat baik',
    body: 'Sebuah firma penyelidikan yang kurang dikenali menerbitkan tinjauan kilat yang meletakkan parti awak jauh ke hadapan di negeri penting. Sampelnya kecil dan firma itu tak dapat disahkan, tapi angkanya sangat baik dan akhbar mahukan reaksi dalam sejam.',
    options: ['Sambut baik dengan amaran ia hanya gambaran sekilas', 'Sorak angka itu kuat-kuat di setiap saluran', 'Abaikan dan diam'],
    results: [
      'Berhati-hati itu nampak jujur, yang jarang, dan wartawan perasan.',
      ['Semangat naik dan angka itu diulang di mana-mana seminggu.', 'Pesaing dedahkan kaedah firma yang cetek, dan awak nampak bodoh kerana bermegah.'],
      'Tinjauan itu pudar dan tiada siapa ingat siapa yang abaikannya.',
    ],
  },
  widowsPetition: {
    title: 'Petisyen di pintu surau',
    body: 'Sekumpulan janda dari sebuah kampung (rekaan), yang tercicir daripada skim kebajikan kerana teknikaliti, menghantar petisyen tulisan tangan yang panjang ke pejabat kawasan awak. Seorang wartawan tempatan berada di tangga. Setiap kes kecil, tapi bersama-sama ia satu cerita.',
    options: ['Bayar kekurangan dari dana parti dan desak kementerian', 'Ambil petisyen dan janji bawa ke dewan', 'Kata hal itu urusan kementerian, bukan awak'],
    results: [
      'Keluarga dapat bantuan cepat, dan kampung ingat siapa yang berdiri di pintu.',
      'Petisyen dibaca di dewan dan janji ditepati, walaupun perlahan.',
      'Awak betul dari segi teknikal dan salah pada pandangan kampung.',
    ],
  },
  midnightRoadshow: {
    title: 'Jelajah tengah malam di pasar',
    body: 'Pasukan awal awak mencadangkan berjalan lewat malam melalui pasar basah besar ketika gerai-gerai baru buka. Ia saat terbaik untuk bertemu peniaga dan pembeli awal, dan juga saat terburuk untuk nampak penat di depan kamera. Pemimpin diminta memutuskan.',
    options: ['Buat betul-betul dengan pasukan penuh dan jamuan', 'Buat dengan pasukan kecil tanpa skrip', 'Langkau dan berehat'],
    results: [
      'Peniaga suka dan parti nampak tak pernah tidur.',
      ['Detik tak dirancang jadi bahagian terbaik, dan orang kongsinya.', 'Terlepas cakap dekat gerai ikan masuk berita malam atas sebab yang salah.'],
      'Rehat membantu suara awak dan tiada apa-apa lagi.',
    ],
  },
};
