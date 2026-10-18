import type { EventText } from './events';

// Things that go viral and have nothing to do with politics, in English and Bahasa Malaysia (see eventListViral.ts).

export const VIRAL_EVENTS_EN: Record<string, EventText> = {
  viralCat: {
    title: 'A cat takes over the ministry',
    body: 'A stray cat has wandered into a government building and fallen asleep on a minister’s chair. A staffer’s photo of it has been shared a million times. Everyone online is asking what the government plans to do about the cat.',
    options: ['Adopt the cat, officially, with a press release', 'Post one kind line and leave it', 'Say nothing'],
    results: [
      ['The cat has a title and a fan club. The netizens are charmed.', 'The press release was a step too far, and the cat got more likes than you did.'],
      'A short, kind line; the netizens approved and moved on.',
      'Nothing was said. The cat went on without you.',
    ],
  },
  viralDurian: {
    title: 'A durian seller’s rant breaks the internet',
    body: 'A durian seller’s video, in which he explains the price of the king of fruits to a customer who will not pay it, is everywhere. It is funny, it is rude, and nobody is sure whose side to be on.',
    options: ['Turn up at the stall, in front of the cameras', 'Share it with a joke about prices', 'Leave it alone'],
    results: [
      ['You bought two and paid the asking price. The video of that did very well.', 'You haggled on camera and lost, in a way the feed will not forget.'],
      'The joke landed, mildly.',
      'You were not part of it, and nobody noticed.',
    ],
  },
  viralFootball: {
    title: 'The national team loses on a last-minute penalty',
    body: 'The whole country watched, and the whole country has an opinion about the referee, the coach and the penalty taker. The feed is a single wail.',
    options: ['Visit the dressing room and say the right thing', 'Post a message of thanks to the players', 'Stay out of it'],
    results: [
      ['You said the right thing, and the clip of it was shared by people who never vote for you.', 'The clip was not kind. The words came out wrong.'],
      'Warm and quiet; people liked it.',
      'You said nothing, which is also what the players did.',
    ],
  },
  viralKopitiam: {
    title: 'A kopitiam uncle’s sign becomes a meme',
    body: 'The owner of a kopitiam has put up a sign about the price of a cup of coffee, and the sign has been photographed, translated, and made into a hundred jokes. A journalist wants your view.',
    options: ['Go and have coffee there, with cameras', 'Share a joke about the sign', 'Decline to comment'],
    results: [
      ['The coffee was good, the uncle was gracious, and the photo is everywhere.', 'The uncle was rude to you on camera. The photo is also everywhere.'],
      'A small joke, a small gain.',
      'The sign remains the cleverest thing in the story.',
    ],
  },
  viralConcert: {
    title: 'Tickets to a big concert sell out in a minute',
    body: 'A famous singer’s concert has sold out in sixty seconds, and the young are furious at the bots, the touts and the platform. Someone is asking what the government will do about ticket touts.',
    options: ['Announce a crackdown on touts and bots', 'Say you understand, and will look into it', 'Leave it to the market'],
    results: [
      ['A crackdown on touts is the kind of promise that is easy to like and easy to keep.', 'It was seen as a stunt, and a stunt for a concert at that.'],
      'Understanding goes a little way online.',
      'The market did what it does. The young noted who was silent.',
    ],
  },
  viralStudent: {
    title: 'A schoolboy’s science project wins a prize abroad',
    body: 'A teenager from a small town has won a prize at an international fair with a project built from rubbish. The whole country wants to be proud of him, and you are not the only one who has noticed.',
    options: ['Invite him and his teacher for a photograph', 'Send a note of congratulations', 'Say nothing'],
    results: [
      ['A good photograph with a good boy. The teacher got the credit he deserved, too.', 'The boy was uncomfortable, the photo looked staged, and the feed said so.'],
      'The note was kind and cost nothing.',
      'His school was proud. Nobody else heard from you.',
    ],
  },
  viralRaya: {
    title: 'A festival advertisement makes everyone cry',
    body: 'A short advertisement for the coming festival, about a father who drives home across the country, has been watched forty million times. People are asking if you have seen it, and what you thought.',
    options: ['Say you cried, and mean it', 'Share it with a line about family', 'Have no view'],
    results: [
      ['People like a leader who admits to crying. It was believed.', 'It sounded rehearsed, and the replies said so.'],
      'A decent, quiet line.',
      'Not everyone has a view on advertisements.',
    ],
  },
  viralPothole: {
    title: 'A pothole is named after a minister',
    body: 'Someone has painted a minister’s face around a pothole on a busy road, and it has been photographed from every angle. It is not clear whose minister it is, and every side has decided it is the other’s.',
    options: ['Have the road fixed by morning, and say so', 'Share the photo, and laugh at yourselves', 'Pretend not to see it'],
    results: [
      ['The road was fixed and the photo was shared. A rare victory for a pothole.', 'The fix was found out to be a patch. The patch became the next meme.'],
      'Laughing at yourself works better than most things online.',
      'The pothole became a tourist attraction.',
    ],
  },
};

export const VIRAL_EVENTS_MS: Record<string, EventText> = {
  viralCat: {
    title: 'Kucing kuasai kementerian',
    body: 'Seekor kucing terbiar masuk bangunan kerajaan dan tertidur atas kerusi menteri. Gambar yang diambil seorang kakitangan dah dikongsi sejuta kali. Semua orang dalam talian tanya apa kerajaan nak buat dengan kucing tu.',
    options: ['Angkat kucing tu secara rasmi, dengan kenyataan akhbar', 'Post satu ayat yang baik dan biarkan', 'Diam saja'],
    results: [
      ['Kucing tu ada gelaran dan fan club. Netizen terpikat.', 'Kenyataan akhbar tu keterlaluan, dan kucing tu dapat lebih banyak like daripada anda.'],
      'Satu ayat pendek dan baik; netizen setuju dan beralih.',
      'Tak ada apa dikatakan. Kucing tu terus hidup tanpa anda.',
    ],
  },
  viralDurian: {
    title: 'Leteran penjual durian gempar internet',
    body: 'Video seorang penjual durian terangkan harga raja buah kepada pelanggan yang tak nak bayar dah tersebar merata. Lucu, kasar, dan tak ada siapa pasti nak berpihak kepada siapa.',
    options: ['Datang ke gerainya, depan kamera', 'Kongsi dengan jenaka pasal harga', 'Biarkan saja'],
    results: [
      ['Anda beli dua biji dan bayar harga yang diminta. Videonya jadi.', 'Anda tawar-menawar depan kamera dan kalah, dengan cara yang feed tak akan lupa.'],
      'Jenaka tu mengena, sikit.',
      'Anda tak jadi sebahagian daripadanya, dan tak ada siapa perasan.',
    ],
  },
  viralFootball: {
    title: 'Pasukan kebangsaan kalah penalti saat akhir',
    body: 'Seluruh negara tengok, dan seluruh negara ada pendapat pasal pengadil, jurulatih dan penendang. Feed jadi satu ratapan.',
    options: ['Melawat bilik persalinan dan cakap benda yang betul', 'Post ucapan terima kasih kepada pemain', 'Jangan masuk campur'],
    results: [
      ['Anda cakap yang betul, dan klipnya dikongsi orang yang tak pernah undi anda.', 'Klip tu tak elok. Kata-katanya tersasul.'],
      'Mesra dan senyap; orang suka.',
      'Anda diam, sama macam pemain.',
    ],
  },
  viralKopitiam: {
    title: 'Papan tanda pakcik kopitiam jadi meme',
    body: 'Tauke kopitiam pasang papan tanda pasal harga secawan kopi, dan papan tu kena foto, kena terjemah dan dijadikan seratus jenaka. Seorang wartawan nak pandangan anda.',
    options: ['Pergi minum kopi di situ, dengan kamera', 'Kongsi jenaka pasal papan tanda tu', 'Enggan mengulas'],
    results: [
      ['Kopinya sedap, pakcik berbudi bahasa, dan gambarnya merata-rata.', 'Pakcik tu kasar dengan anda depan kamera. Gambarnya pun merata-rata.'],
      'Jenaka kecil, untung kecil.',
      'Papan tanda tu kekal benda paling bijak dalam cerita ni.',
    ],
  },
  viralConcert: {
    title: 'Tiket konsert besar habis dalam seminit',
    body: 'Konsert penyanyi terkenal habis dijual dalam enam puluh saat, dan anak muda marah dengan bot, scalper dan platform. Ada yang tanya apa kerajaan nak buat pasal scalper tiket.',
    options: ['Umum tindakan keras terhadap scalper dan bot', 'Kata anda faham, dan akan siasat', 'Serahkan kepada pasaran'],
    results: [
      ['Tindakan keras ke atas scalper ialah janji yang senang disukai dan senang ditepati.', 'Ia dilihat macam gimik, dan gimik untuk konsert pula.'],
      'Faham memang membawa sikit jauh dalam talian.',
      'Pasaran buat apa yang ia biasa buat. Anak muda ingat siapa yang diam.',
    ],
  },
  viralStudent: {
    title: 'Projek sains budak sekolah menang hadiah di luar negara',
    body: 'Seorang remaja dari pekan kecil menang hadiah di pameran antarabangsa dengan projek daripada barang buangan. Seluruh negara nak bangga dengannya, dan anda bukan seorang saja yang perasan.',
    options: ['Jemput dia dan gurunya bergambar', 'Hantar nota tahniah', 'Diam saja'],
    results: [
      ['Gambar yang elok dengan budak yang baik. Guru tu pun dapat kredit yang sepatutnya.', 'Budak tu tak selesa, gambar nampak diatur, dan feed cakap macam tu.'],
      'Nota tu baik dan percuma.',
      'Sekolahnya bangga. Orang lain tak dengar apa-apa pun daripada anda.',
    ],
  },
  viralRaya: {
    title: 'Iklan perayaan buat semua orang menangis',
    body: 'Iklan pendek untuk perayaan yang akan datang, pasal seorang bapa yang memandu pulang merentas negara, dah ditonton empat puluh juta kali. Orang tanya anda dah tengok ke belum, dan apa pendapat anda.',
    options: ['Kata anda menangis, dan memang betul', 'Kongsi dengan satu ayat pasal keluarga', 'Tak ada pendapat'],
    results: [
      ['Orang suka pemimpin yang mengaku menangis. Ia dipercayai.', 'Bunyi macam dah dilatih, dan komen pun cakap macam tu.'],
      'Satu ayat yang elok dan senyap.',
      'Bukan semua orang ada pendapat pasal iklan.',
    ],
  },
  viralPothole: {
    title: 'Lubang jalan dinamakan sempena menteri',
    body: 'Ada orang lukis muka menteri di sekeliling lubang pada jalan sibuk, dan ia kena foto dari setiap sudut. Tak jelas menteri siapa, dan setiap pihak putuskan ia milik pihak lain.',
    options: ['Baiki jalan tu sebelum pagi, dan umumkan', 'Kongsi gambar tu dan gelakkan diri sendiri', 'Pura-pura tak nampak'],
    results: [
      ['Jalan dibaiki dan gambar dikongsi. Kemenangan yang jarang bagi sebuah lubang.', 'Pembaikan tu rupa-rupanya tampalan saja. Tampalan tu jadi meme seterusnya.'],
      'Gelakkan diri sendiri lebih berkesan daripada kebanyakan benda dalam talian.',
      'Lubang tu jadi tarikan pelancong.',
    ],
  },
};
