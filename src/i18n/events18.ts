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
    body: 'Menteri yang anda pecat bagi temu bual. Dia kata dia dijadikan kambing hitam, orang lain dalam kabinet pun tahu, dan dia ada banyak benda nak cerita. Akhbar dah kosongkan satu muka surat.',
    options: ['Biarkan saja', 'Tawar jawatan senyap di luar negara', 'Jawab dia depan orang ramai'],
    results: [
      'Anda tak cakap apa-apa dan cerita tu berlarutan seminggu sendiri, yang lebih pedih daripada balas.',
      'Dia terima, dan senyap. Parti perasan harganya, akhbar pun sama.',
      ['Jawapan anda dipercayai, dan temu bual tu lebih menguntungkan anda daripada dia.', 'Jawapan anda tak dipercayai, dan kabinet sekarang nampak macam ada sesuatu nak disembunyikan.'],
    ],
  },
  ministerReview: {
    title: 'Soalan pasal menteri tu datang balik',
    body: 'Anda pertahankan menteri tu depan kamera. Sekarang satu audit jumpa lebih banyak: kontrak yang sama, dan seorang sepupu kedua. Akhbar dah sedia dengan gambar sidang akhbar anda untuk disiarkan sebelah berita baharu tu.',
    options: ['Pertahankan dia lagi', 'Lepaskan dia sekarang, dengan terima kasih', 'Arahkan semakan bebas'],
    results: [
      ['Fakta baharu lebih nipis daripada tajuk berita, dan kesetiaan anda nampak macam pertimbangan.', 'Fakta baharu seteruk tajuk berita. Menteri tu terpaksa pergi, dan kesetiaan tu tak bernilai.'],
      'Terima kasih disampaikan dengan sopan dan perginya dah lewat. Tak ada siapa tertipu, dan tak ada siapa terkejut.',
      'Semakan tu bebas, yang membeli masa dan rupa bersungguh-sungguh. Ia juga bermakna anda tak akan kawal keputusannya.',
    ],
  },
  ministerVerdict: {
    title: 'Fakta pasal menteri dah ada',
    body: 'Anda gantung menteri tu masa fakta dicari, dan siasatan dah selesai. Laporannya atas meja anda. Bukan bersih sepenuhnya, bukan juga kecaman, dan kabinet serta akhbar sama-sama tunggu macam mana anda baca.',
    options: ['Pulihkan jawatan dia', 'Lepaskan dia', 'Alihkan dia ke portfolio lain'],
    results: [
      ['Laporan tu bersihkan dia secara umumnya, dan anda nampak adil.', 'Laporan tu kurang baik daripada yang disangka mula-mula, dan anda nampak macam tak baca pun.'],
      'Anda lepaskan dia berdasarkan dapatan laporan, yang buat keputusan tu nampak berprinsip.',
      'Satu langkah ke tepi, dan senyap. Akhbar panggil penurunan pangkat, menteri tu panggil rombakan.',
    ],
  },
};
