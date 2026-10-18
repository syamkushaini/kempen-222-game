import type { EventText } from './events';

// The constitutional crisis, in English and Bahasa Malaysia (see eventListCrisis.ts). The Palace is a place that answers are awaited from, with respect.

export const CRISIS_EVENTS_EN: Record<string, EventText> = {
  constCrisis: {
    title: 'A state assembly is deadlocked',
    body: 'Two men now say they are chief minister of the same state. The Speaker has ruled one way, the other side has walked out, and everyone wants to know whether the assembly will be dissolved. The ruler has been told, and the nation is waiting, politely, for the answer.',
    options: ['Call for the matter to be settled by the book, whatever it costs', 'Say your side has the numbers, and prove it in the House', 'Stay out of it and let the parties fight'],
    results: [
      'The party was seen to put the law above its own interest. The state was no calmer for it.',
      ['Your side held the numbers and the House said so.', 'The numbers did not hold, and the House said so too.'],
      'You were not part of it, and nobody thanked you for that.',
    ],
  },
  constCourt: {
    title: 'The courts are asked',
    body: 'The question has gone to the highest court, and the lawyers have filled the corridors. Everything said about the case outside the courtroom is being reported, and the judges have noticed.',
    options: ['Say you will accept whatever the court decides', 'Appeal the first ruling and campaign for it', 'Rally your supporters outside the court'],
    results: [
      'Respect for the court was noted, by everyone.',
      'The appeal bought time, and the delay was not forgotten.',
      'The crowd was loud and the judges were not moved. Neither were the neutrals.',
    ],
  },
  constSettled: {
    title: 'The crisis is settled',
    body: 'The court has ruled, the ruler’s decision has been received with respect, and the state has a chief minister whom everyone accepts, some more happily than others. It will be written about for years.',
    options: ['Welcome the ruling and call for unity', 'Welcome it and remind everyone how it began', 'Say the ruling was a mistake'],
    results: [
      'Calling for unity in the hour of settlement was graceful, and it helped.',
      'The reminder was true and not entirely welcome. The party held together.',
      'A leader who attacks the ruling after the fact is never forgotten.',
    ],
  },
};

export const CRISIS_EVENTS_MS: Record<string, EventText> = {
  constCrisis: {
    title: 'Dewan undangan negeri buntu',
    body: 'Dua orang sekarang mengaku Menteri Besar negeri yang sama. Speaker dah putuskan satu hala, pihak sebelah keluar dewan, dan semua orang tanya sama ada dewan akan dibubarkan. Tuanku telah dimaklumkan, dan negara menunggu, dengan hormat, jawapannya.',
    options: ['Minta perkara diselesaikan ikut undang-undang, apa pun kosnya', 'Kata pihak anda ada bilangan, dan buktikan di dewan', 'Jangan campur dan biar parti bertelagah'],
    results: [
      'Parti dilihat letak undang-undang mengatasi kepentingannya. Negeri tak jadi lebih tenang pun.',
      ['Pihak anda pegang bilangan dan dewan kata macam tu.', 'Bilangan tak bertahan, dan dewan kata macam tu juga.'],
      'Anda tak terlibat, dan tak ada siapa ucap terima kasih sebab tu.',
    ],
  },
  constCourt: {
    title: 'Mahkamah diminta putuskan',
    body: 'Soalan tu dah dibawa ke mahkamah tertinggi, dan peguam penuhkan koridor. Segala yang dicakap pasal kes tu di luar mahkamah dilaporkan, dan para hakim perasan.',
    options: ['Kata anda akan terima apa sahaja keputusan mahkamah', 'Rayu keputusan pertama dan berkempen untuknya', 'Himpun penyokong di luar mahkamah'],
    results: [
      'Penghormatan kepada mahkamah dicatat oleh semua orang.',
      'Rayuan beli masa, dan kelewatan tu tak dilupakan.',
      'Orang ramai lantang dan hakim tak terkesan. Yang berkecuali pun sama.',
    ],
  },
  constSettled: {
    title: 'Krisis selesai',
    body: 'Mahkamah dah putuskan, keputusan Tuanku diterima dengan hormat, dan negeri ni ada Menteri Besar yang diterima semua pihak, ada yang lebih gembira daripada yang lain. Ia akan ditulis bertahun-tahun lamanya.',
    options: ['Alu-alukan keputusan dan seru perpaduan', 'Alu-alukan dan ingatkan semua macam mana ia bermula', 'Kata keputusan tu satu kesilapan'],
    results: [
      'Menyeru perpaduan pada saat penyelesaian itu anggun, dan ia membantu.',
      'Peringatan tu benar dan tak sepenuhnya dialu-alukan. Parti kekal bersatu.',
      'Pemimpin yang serang keputusan selepas kejadian tak pernah dilupakan.',
    ],
  },
};
