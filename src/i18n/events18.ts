import type { EventText } from './events';

// The sequels to a decision about a minister under fire, in English and Bahasa Malaysia. A result written as a pair is for a gamble.

export const FOLLOW_EVENTS_EN: Record<string, EventText> = {
  ministerSacked: {
    title: 'The sacked minister speaks',
    body: 'The minister you dismissed has given an interview. They say they were a scapegoat, that others in the cabinet knew, and that they have a great deal to say. The papers have already cleared a page.',
    options: ['Let it lie', 'Offer them a quiet posting abroad', 'Answer them in public'],
    results: [
      'You said nothing and the story ran for a week on its own, which stung more than a reply would have.',
      'They accepted, and went quiet. The party noticed the price and so did the press.',
      ['Your answer was believed, and the interview did more good to you than to them.', 'Your answer was not believed, and the cabinet now looks as if it has something to hide.'],
    ],
  },
  ministerReview: {
    title: 'The questions about the minister return',
    body: 'You stood by the minister in front of the cameras. Now an audit has found more: the same contracts, and a second cousin. The press has the pictures from your press conference ready to run beside the new story.',
    options: ['Stand by them again', 'Drop them now, with thanks', 'Order an independent review'],
    results: [
      ['The new facts were thinner than the headlines, and your loyalty looked like judgement.', 'The new facts were as bad as the headlines. The minister has to go, and the loyalty was worth nothing.'],
      'The thanks were gracious and the departure overdue. Nobody was fooled, and nobody was surprised.',
      'The review is independent, which buys time and the appearance of seriousness. It also means you will not control the verdict.',
    ],
  },
  ministerVerdict: {
    title: 'The facts about the minister are in',
    body: 'You suspended the minister while the facts were found, and the inquiry has finished. The report is on your desk. It is neither a clean bill nor a damning one, and both the cabinet and the press are waiting to see which way you read it.',
    options: ['Reinstate them', 'Let them go', 'Move them to another portfolio'],
    results: [
      ['The report cleared them in the main, and you looked fair.', 'The report was less kind than it first seemed, and you looked as if you had not read it.'],
      'You let them go on the report’s findings, which made the decision look principled.',
      'A move sideways, and a quiet one. The press called it a demotion, and the minister called it a reshuffle.',
    ],
  },
};

export const FOLLOW_EVENTS_MS: Record<string, EventText> = {
  ministerSacked: {
    title: 'Menteri yang dipecat bersuara',
    body: 'Menteri yang anda pecat telah memberi temu bual. Mereka kata mereka dijadikan kambing hitam, bahawa orang lain dalam kabinet tahu, dan mereka ada banyak untuk diceritakan. Akhbar sudah mengosongkan satu muka surat.',
    options: ['Biarkan sahaja', 'Tawarkan jawatan senyap di luar negara', 'Jawab mereka di khalayak'],
    results: [
      'Anda tak kata apa-apa dan cerita itu berlarutan seminggu dengan sendirinya, yang lebih pedih daripada membalas.',
      'Mereka terima, dan senyap. Parti perasan harganya dan begitu juga akhbar.',
      ['Jawapan anda dipercayai, dan temu bual itu lebih menguntungkan anda daripada mereka.', 'Jawapan anda tidak dipercayai, dan kabinet kini kelihatan seperti ada sesuatu untuk disembunyikan.'],
    ],
  },
  ministerReview: {
    title: 'Persoalan tentang menteri itu kembali',
    body: 'Anda mempertahankan menteri itu di depan kamera. Kini satu audit menemui lebih banyak: kontrak yang sama, dan seorang sepupu kedua. Akhbar sudah sedia dengan gambar sidang akhbar anda untuk disiarkan bersebelahan berita baharu itu.',
    options: ['Pertahankan mereka lagi', 'Lepaskan mereka sekarang, dengan terima kasih', 'Arahkan semakan bebas'],
    results: [
      ['Fakta baharu lebih nipis daripada tajuk berita, dan kesetiaan anda kelihatan seperti pertimbangan.', 'Fakta baharu seburuk tajuk berita. Menteri itu terpaksa pergi, dan kesetiaan itu tak bernilai.'],
      'Terima kasih disampaikan dengan sopan dan perginya sudah lewat. Tiada siapa tertipu, dan tiada siapa terkejut.',
      'Semakan itu bebas, yang membeli masa dan rupa bersungguh-sungguh. Ia juga bermakna anda tak akan mengawal keputusannya.',
    ],
  },
  ministerVerdict: {
    title: 'Fakta tentang menteri itu telah diperoleh',
    body: 'Anda menggantung menteri itu semasa fakta dicari, dan siasatan telah selesai. Laporannya di atas meja anda. Ia bukan pengesahan bersih dan bukan juga kecaman, dan kabinet serta akhbar sama-sama menunggu bagaimana anda membacanya.',
    options: ['Pulihkan jawatan mereka', 'Lepaskan mereka', 'Alihkan mereka ke portfolio lain'],
    results: [
      ['Laporan itu membersihkan mereka secara umumnya, dan anda kelihatan adil.', 'Laporan itu kurang baik daripada yang disangka pada mulanya, dan anda kelihatan seperti tak membacanya.'],
      'Anda melepaskan mereka berdasarkan dapatan laporan, yang menjadikan keputusan itu kelihatan berprinsip.',
      'Satu langkah ke tepi, dan senyap. Akhbar menyebutnya penurunan pangkat, dan menteri itu menyebutnya rombakan.',
    ],
  },
};
