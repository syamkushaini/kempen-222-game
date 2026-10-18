import type { EventText } from './events';

// Four decisions that come to a party of any size, in English and Bahasa Malaysia. Every person and company in them is invented.
// A result written as a pair is for a gamble: what is reported if it comes off, then if it does not.

export const DESK_EVENTS_EN: Record<string, EventText> = {
  donorStrings: {
    title: 'The Donor With Strings Attached',
    body: 'A wealthy supporter offers RM100,000 for your campaign. He is charming about it, and he does not say what he wants in return. He does not need to: he expects favourable treatment if you win.',
    options: ['Reject the money', 'Accept privately', 'Accept only with full disclosure'],
    results: [
      'You turned down the cheque, and the story of it got round. The party treasurer sighed, and the voters, who are rarely offered a clean hand, noticed.',
      ['You took the money quietly, and nobody found out. The treasurer filed it under “friends”, and tried not to think about winning.', 'You took the money quietly, and somebody found out. The story ran for a week, with a photograph of the dinner.'],
      ['You took the money and published the donor’s name and the sum. The accounts looked unusually transparent, and the papers had nothing to add.', 'You asked him to be named, and the donor withdrew the offer by the next morning, with a very polite message.'],
    ],
  },
  missingVolunteers: {
    title: 'The Missing Volunteers',
    body: 'On the busiest campaign day, half your volunteers fail to show up. The leaflets are in boxes, the hall is booked, and the people who were to carry them are, according to the group chat, “in traffic”.',
    options: ['Pay temporary campaign workers', 'Ask the existing volunteers to work longer', 'Cut back the campaign activities for the day'],
    results: [
      'The temporary workers came, were paid, and delivered. It was not cheap, and it was done by evening.',
      ['The ones who came stayed on, and the day was saved. They were tired, and they said so cheerfully.', 'The ones who came stayed on, and some of them went home angry. The group chat went quiet in the way it does.'],
      'You cut the day down to what the people present could do. The branches were calm, and the opposing party’s posters had the street to themselves.',
    ],
  },
  manifestoMistake: {
    title: 'The Manifesto Mistake',
    body: 'A journalist has discovered that one of the major promises in your manifesto rests on an unrealistic financial assumption. The sum does not add up, and she has done the sum twice. She has called for your comment.',
    options: ['Admit the mistake', 'Quietly edit the manifesto', 'Blame the policy team'],
    results: [
      'You said it plainly, and corrected the figure in public. The story lasted a day, and the word “honest” was used about you, which is a word that lasts longer.',
      ['You edited the page quietly, and nobody noticed. The journalist had moved on to a fire.', 'You edited the page quietly, and the journalist had saved the old one. The story became the editing.'],
      'You said the policy team had got it wrong, and the policy team read it in the paper. The mistake was corrected; the team was not consoled.',
    ],
  },
  manaPeruntukan: {
    title: '“Mana Peruntukan?”',
    body: 'Residents ask why their area has not received funding for drainage, roads and community facilities. They ask in front of a camera. Your team suggests blaming the current government, and has already drafted the sentence.',
    options: ['Explain the funding process', 'Promise to secure funding after winning', 'Blame the incumbent'],
    results: [
      'You explained who decides, and when, and how a request goes up. It was not a short answer, and some of them nodded.',
      ['You promised, and they believed you, which is the dangerous part. The district will remember the date.', 'You promised, and a man at the back said he had heard it before. So had the camera.'],
      ['You blamed the incumbent, and the residents liked hearing it. It was true enough for one evening.', 'You blamed the incumbent, and the incumbent’s man was in the crowd with a list of what had been spent. It was a long list.'],
    ],
  },
};

export const DESK_EVENTS_MS: Record<string, EventText> = {
  donorStrings: {
    title: 'Penderma Yang Ada Syarat',
    body: 'Seorang penyokong kaya tawar RM100,000 untuk kempen anda. Dia mesra pasal benda tu, dan tak sebut apa dia nak sebagai balasan. Tak perlu pun: dia mengharapkan layanan istimewa kalau anda menang.',
    options: ['Tolak duit tu', 'Terima diam-diam', 'Terima hanya dengan pendedahan penuh'],
    results: [
      'Anda tolak cek tu, dan ceritanya tersebar. Bendahari parti mengeluh, dan pengundi, yang jarang disua tangan yang bersih, perasan.',
      ['Anda terima duit tu senyap-senyap, dan tak ada siapa tahu. Bendahari failkan di bawah “kawan-kawan”, dan cuba tak fikir pasal menang.', 'Anda terima duit tu senyap-senyap, dan ada orang tahu. Ceritanya berlarutan seminggu, dengan gambar makan malam tu.'],
      ['Anda terima duit tu dan siarkan nama penderma serta jumlahnya. Akaun nampak luar biasa telus, dan akhbar tak ada apa nak tambah.', 'Anda minta dia dinamakan, dan penderma tarik balik tawarannya pagi esoknya, dengan mesej yang sangat sopan.'],
    ],
  },
  missingVolunteers: {
    title: 'Sukarelawan Yang Tak Datang',
    body: 'Pada hari kempen yang paling sibuk, separuh sukarelawan anda tak muncul. Risalah ada dalam kotak, dewan dah ditempah, dan orang yang sepatutnya angkat semua tu, ikut group chat, “tersangkut dalam trafik”.',
    options: ['Bayar pekerja kempen sementara', 'Minta sukarelawan sedia ada kerja lebih lama', 'Kurangkan aktiviti kempen hari tu'],
    results: [
      'Pekerja sementara datang, dibayar, dan siapkan kerja. Tak murah, dan siap menjelang petang.',
      ['Yang datang terus bertahan, dan hari tu terselamat. Mereka penat, dan cakap sambil ketawa.', 'Yang datang terus bertahan, dan sebahagian balik dengan marah. Group chat jadi senyap macam biasa.'],
      'Anda buat setakat yang orang yang hadir mampu. Cawangan lebih tenang, tapi poster parti lawan penuhi jalan tu.',
    ],
  },
  manifestoMistake: {
    title: 'Silap Dalam Manifesto',
    body: 'Seorang wartawan jumpa salah satu janji utama dalam manifesto anda bergantung pada andaian kewangan yang tak realistik. Kiraannya tak jadi, dan dia dah kira dua kali. Dia dah telefon minta komen anda.',
    options: ['Akui kesilapan tu', 'Edit manifesto senyap-senyap', 'Salahkan pasukan dasar'],
    results: [
      'Anda cakap terus terang, dan betulkan angka tu depan orang ramai. Ceritanya sehari saja, dan perkataan “jujur” dipakai pasal anda, perkataan yang bertahan lebih lama.',
      ['Anda edit halaman tu senyap-senyap, dan tak ada siapa perasan. Wartawan tu dah beralih kepada kebakaran.', 'Anda edit halaman tu senyap-senyap, dan wartawan tu dah simpan yang lama. Cerita tu bertukar jadi pasal suntingan tu sendiri.'],
      'Anda kata pasukan dasar tersilap, dan pasukan dasar baca dalam akhbar. Kesilapan dibetulkan; pasukan tu tak terpujuk.',
    ],
  },
  manaPeruntukan: {
    title: '“Mana Peruntukan?”',
    body: 'Penduduk tanya kenapa kawasan mereka belum dapat peruntukan untuk longkang, jalan dan kemudahan komuniti. Mereka tanya depan kamera. Pasukan anda cadangkan salahkan kerajaan sekarang, dan dah siap tulis ayatnya.',
    options: ['Terangkan proses peruntukan', 'Janji dapatkan peruntukan lepas menang', 'Salahkan penyandang'],
    results: [
      'Anda terangkan siapa yang putuskan, bila, dan macam mana permohonan dihantar ke atas. Jawapan tak pendek, dan sebahagian mereka mengangguk.',
      ['Anda berjanji, dan mereka percaya, itulah bahagian yang bahaya. Daerah tu akan ingat tarikhnya.', 'Anda berjanji, dan seorang lelaki di belakang kata dia pernah dengar. Kamera pun sama.'],
      ['Anda salahkan penyandang, dan penduduk suka dengar. Cukup benar untuk satu malam.', 'Anda salahkan penyandang, dan orang penyandang ada dalam orang ramai dengan senarai perbelanjaan. Senarai tu panjang.'],
    ],
  },
};
