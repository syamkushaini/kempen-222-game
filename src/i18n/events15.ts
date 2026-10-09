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
    title: 'Penderma Yang Ada Syaratnya',
    body: 'Seorang penyokong yang kaya menawarkan RM100,000 untuk kempen anda. Dia mesra tentangnya, dan tidak menyebut apa yang dia mahu sebagai balasan. Dia tidak perlu: dia mengharapkan layanan istimewa jika anda menang.',
    options: ['Tolak wang itu', 'Terima secara diam-diam', 'Terima hanya dengan pendedahan penuh'],
    results: [
      'Anda menolak cek itu, dan ceritanya tersebar. Bendahari parti mengeluh, dan para pengundi, yang jarang ditawarkan tangan yang bersih, perasan.',
      ['Anda menerima wang itu secara senyap, dan tiada siapa yang tahu. Bendahari memfailkannya di bawah “kawan-kawan”, dan cuba tidak memikirkan tentang menang.', 'Anda menerima wang itu secara senyap, dan ada yang tahu. Ceritanya berlarutan seminggu, dengan gambar makan malam itu.'],
      ['Anda menerima wang itu dan menyiarkan nama penderma serta jumlahnya. Akaun kelihatan luar biasa telus, dan akhbar tiada apa untuk ditambah.', 'Anda meminta dia dinamakan, dan penderma menarik balik tawarannya pagi esoknya, dengan mesej yang sangat sopan.'],
    ],
  },
  missingVolunteers: {
    title: 'Sukarelawan Yang Tidak Hadir',
    body: 'Pada hari kempen yang paling sibuk, separuh sukarelawan anda tidak muncul. Risalah ada dalam kotak, dewan sudah ditempah, dan orang yang sepatutnya membawanya, menurut kumpulan WhatsApp, “terperangkap dalam trafik”.',
    options: ['Bayar pekerja kempen sementara', 'Minta sukarelawan sedia ada bekerja lebih lama', 'Kurangkan aktiviti kempen hari itu'],
    results: [
      'Pekerja sementara datang, dibayar, dan menyiapkan kerja. Ia tidak murah, dan siap menjelang petang.',
      ['Yang hadir terus bertahan, dan hari itu terselamat. Mereka penat, dan mengatakannya dengan ceria.', 'Yang hadir terus bertahan, dan sebahagian pulang dengan marah. Kumpulan WhatsApp menjadi senyap seperti biasa.'],
      'Anda mengecilkan hari itu setakat yang mampu dibuat oleh orang yang hadir. Cawangan tenang, dan poster parti lawan memiliki jalan itu sendirian.',
    ],
  },
  manifestoMistake: {
    title: 'Kesilapan Dalam Manifesto',
    body: 'Seorang wartawan mendapati salah satu janji utama dalam manifesto anda bergantung pada andaian kewangan yang tidak realistik. Angkanya tidak tepat, dan dia sudah mengira dua kali. Dia telah menelefon untuk meminta komen anda.',
    options: ['Akui kesilapan itu', 'Edit manifesto secara senyap', 'Salahkan pasukan dasar'],
    results: [
      'Anda mengatakannya dengan jelas, dan membetulkan angka itu di khalayak ramai. Ceritanya bertahan sehari, dan perkataan “jujur” digunakan tentang anda, iaitu perkataan yang bertahan lebih lama.',
      ['Anda mengedit halaman itu secara senyap, dan tiada siapa perasan. Wartawan itu sudah beralih kepada kejadian kebakaran.', 'Anda mengedit halaman itu secara senyap, dan wartawan itu telah menyimpan yang lama. Ceritanya bertukar menjadi penyuntingan itu sendiri.'],
      'Anda berkata pasukan dasar tersilap, dan pasukan dasar membacanya dalam akhbar. Kesilapan dibetulkan; pasukan itu tidak terpujuk.',
    ],
  },
  manaPeruntukan: {
    title: '“Mana Peruntukan?”',
    body: 'Penduduk bertanya mengapa kawasan mereka belum menerima peruntukan untuk longkang, jalan dan kemudahan komuniti. Mereka bertanya di hadapan kamera. Pasukan anda mencadangkan menyalahkan kerajaan sekarang, dan sudah menyediakan ayatnya.',
    options: ['Terangkan proses peruntukan', 'Janji mendapatkan peruntukan selepas menang', 'Salahkan penyandang'],
    results: [
      'Anda menerangkan siapa yang memutuskan, bila, dan bagaimana sesuatu permohonan dihantar ke atas. Jawapannya tidak pendek, dan sebahagian mereka mengangguk.',
      ['Anda berjanji, dan mereka percaya, iaitu bahagian yang berbahaya. Daerah itu akan mengingati tarikhnya.', 'Anda berjanji, dan seorang lelaki di belakang berkata dia pernah mendengarnya. Kamera pun begitu.'],
      ['Anda menyalahkan penyandang, dan penduduk suka mendengarnya. Ia cukup benar untuk satu malam.', 'Anda menyalahkan penyandang, dan orang penyandang ada dalam orang ramai dengan senarai perbelanjaan. Senarai itu panjang.'],
    ],
  },
};
