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
    title: 'Seekor kucing menguasai kementerian',
    body: 'Seekor kucing terbiar masuk ke bangunan kerajaan dan tertidur di kerusi menteri. Gambar oleh seorang kakitangan telah dikongsi sejuta kali. Semua orang dalam talian bertanya apa kerajaan nak buat dengan kucing itu.',
    options: ['Angkat kucing itu secara rasmi, dengan kenyataan akhbar', 'Siarkan satu baris yang baik dan biarkan', 'Diam sahaja'],
    results: [
      ['Kucing itu ada gelaran dan kelab peminat. Netizen terpikat.', 'Kenyataan akhbar itu keterlaluan, dan kucing itu dapat lebih banyak suka daripada anda.'],
      'Satu baris yang pendek dan baik; netizen bersetuju dan beralih.',
      'Tiada apa dikatakan. Kucing itu meneruskan hidupnya tanpa anda.',
    ],
  },
  viralDurian: {
    title: 'Leteran penjual durian gemparkan internet',
    body: 'Video seorang penjual durian menerangkan harga raja buah kepada pelanggan yang tak mahu bayar tersebar di mana-mana. Lucu, kasar, dan tiada siapa pasti di pihak mana nak berdiri.',
    options: ['Hadir di gerainya, depan kamera', 'Kongsi dengan gurauan tentang harga', 'Biarkan sahaja'],
    results: [
      ['Anda beli dua biji dan bayar harga yang diminta. Video itu menjadi.', 'Anda menawar depan kamera dan kalah, dengan cara yang tak akan dilupakan.'],
      'Gurauan itu mengena, sedikit.',
      'Anda bukan sebahagian daripadanya, dan tiada yang perasan.',
    ],
  },
  viralFootball: {
    title: 'Pasukan kebangsaan kalah dengan penalti saat akhir',
    body: 'Seluruh negara menonton, dan seluruh negara ada pendapat tentang pengadil, jurulatih dan penendang. Suapan jadi satu ratapan.',
    options: ['Melawat bilik persalinan dan berkata yang betul', 'Siarkan ucapan terima kasih kepada pemain', 'Jangan campur'],
    results: [
      ['Anda berkata yang betul, dan klipnya dikongsi oleh orang yang tak pernah mengundi anda.', 'Klip itu tak baik. Kata-katanya tersasul.'],
      'Mesra dan senyap; orang suka.',
      'Anda diam, sama seperti pemain.',
    ],
  },
  viralKopitiam: {
    title: 'Papan tanda pakcik kopitiam jadi meme',
    body: 'Tuan punya kopitiam memasang papan tanda tentang harga secawan kopi, dan papan itu difoto, diterjemah dan dijadikan seratus gurauan. Seorang wartawan mahu pandangan anda.',
    options: ['Pergi minum kopi di situ, dengan kamera', 'Kongsi gurauan tentang papan tanda itu', 'Enggan mengulas'],
    results: [
      ['Kopinya sedap, pakcik berbudi bahasa, dan gambarnya di mana-mana.', 'Pakcik itu kasar kepada anda depan kamera. Gambarnya juga di mana-mana.'],
      'Gurauan kecil, kelebihan kecil.',
      'Papan tanda itu kekal perkara paling bijak dalam cerita ini.',
    ],
  },
  viralConcert: {
    title: 'Tiket konsert besar habis dalam seminit',
    body: 'Konsert penyanyi terkenal habis dijual dalam enam puluh saat, dan anak muda marah dengan bot, penjual tiket haram dan platform. Seseorang bertanya apa kerajaan nak buat.',
    options: ['Umum tindakan keras terhadap penjual tiket haram dan bot', 'Kata anda faham, dan akan menyiasat', 'Serahkan kepada pasaran'],
    results: [
      ['Tindakan keras ke atas penjual tiket haram ialah janji yang mudah disukai dan mudah ditepati.', 'Ia dilihat sebagai helah, dan helah untuk konsert pula.'],
      'Memahami membawa sedikit jauh dalam talian.',
      'Pasaran buat apa yang ia buat. Anak muda ingat siapa yang diam.',
    ],
  },
  viralStudent: {
    title: 'Projek sains budak sekolah menang hadiah di luar negara',
    body: 'Seorang remaja dari pekan kecil menang hadiah di pameran antarabangsa dengan projek daripada bahan buangan. Seluruh negara mahu bangga dengannya, dan anda bukan seorang sahaja yang perasan.',
    options: ['Jemput dia dan gurunya untuk bergambar', 'Hantar nota tahniah', 'Diam sahaja'],
    results: [
      ['Gambar yang baik dengan budak yang baik. Guru itu dapat kredit yang sepatutnya juga.', 'Budak itu tak selesa, gambar nampak dirancang, dan suapan berkata demikian.'],
      'Nota itu baik dan percuma.',
      'Sekolahnya bangga. Orang lain tak dengar apa-apa daripada anda.',
    ],
  },
  viralRaya: {
    title: 'Iklan perayaan buat semua orang menangis',
    body: 'Iklan pendek untuk perayaan yang akan datang, tentang seorang bapa yang memandu pulang merentas negara, telah ditonton empat puluh juta kali. Orang bertanya sama ada anda sudah tengok, dan apa pendapat anda.',
    options: ['Kata anda menangis, dan betul-betul', 'Kongsi dengan satu baris tentang keluarga', 'Tiada pandangan'],
    results: [
      ['Orang suka pemimpin yang mengaku menangis. Ia dipercayai.', 'Bunyinya seperti dilatih, dan balasan berkata begitu.'],
      'Satu baris yang baik dan senyap.',
      'Bukan semua orang ada pandangan tentang iklan.',
    ],
  },
  viralPothole: {
    title: 'Lubang jalan dinamakan sempena menteri',
    body: 'Seseorang melukis wajah menteri di sekeliling lubang pada jalan sibuk, dan ia difoto dari setiap sudut. Tak jelas menteri siapa, dan setiap pihak memutuskan ia milik pihak lain.',
    options: ['Baiki jalan itu sebelum pagi, dan beritahu', 'Kongsi gambar itu dan ketawakan diri sendiri', 'Pura-pura tak nampak'],
    results: [
      ['Jalan dibaiki dan gambar dikongsi. Kemenangan yang jarang bagi sebuah lubang.', 'Pembaikan itu didapati hanya tampalan. Tampalan itu jadi meme seterusnya.'],
      'Mentertawakan diri sendiri berkesan lebih baik daripada kebanyakan perkara dalam talian.',
      'Lubang itu menjadi tarikan pelancong.',
    ],
  },
};
