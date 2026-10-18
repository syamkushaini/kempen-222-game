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
    body: 'Dua orang kini mengaku menteri besar negeri yang sama. Speaker telah memutuskan satu hala, pihak sebelah berjalan keluar, dan semua orang bertanya sama ada dewan akan dibubarkan. Tuanku telah dimaklumkan, dan negara menunggu, dengan hormat, jawapannya.',
    options: ['Minta perkara diselesaikan mengikut undang-undang, apa pun kosnya', 'Katakan pihak anda ada bilangan, dan buktikan di dewan', 'Jangan campur dan biar parti bertelagah'],
    results: [
      'Parti dilihat meletakkan undang-undang mengatasi kepentingannya. Negeri tidak lebih tenang kerananya.',
      ['Pihak anda memegang bilangan dan dewan berkata demikian.', 'Bilangan tidak bertahan, dan dewan berkata demikian juga.'],
      'Anda tidak terlibat, dan tiada yang berterima kasih kerana itu.',
    ],
  },
  constCourt: {
    title: 'Mahkamah diminta memutuskan',
    body: 'Soalan itu telah dibawa ke mahkamah tertinggi, dan peguam memenuhi koridor. Segala yang dikatakan tentang kes itu di luar mahkamah dilaporkan, dan para hakim menyedarinya.',
    options: ['Katakan anda akan menerima apa sahaja keputusan mahkamah', 'Rayu keputusan pertama dan berkempen untuknya', 'Himpun penyokong di luar mahkamah'],
    results: [
      'Penghormatan kepada mahkamah dicatat oleh semua orang.',
      'Rayuan membeli masa, dan kelewatan itu tidak dilupakan.',
      'Orang ramai lantang dan hakim tidak terkesan. Begitu juga yang berkecuali.',
    ],
  },
  constSettled: {
    title: 'Krisis diselesaikan',
    body: 'Mahkamah telah memutuskan, keputusan Tuanku diterima dengan hormat, dan negeri ini mempunyai menteri besar yang diterima semua pihak, ada yang lebih gembira daripada yang lain. Ia akan ditulis bertahun-tahun lamanya.',
    options: ['Alu-alukan keputusan dan seru perpaduan', 'Alu-alukan dan ingatkan semua bagaimana ia bermula', 'Katakan keputusan itu satu kesilapan'],
    results: [
      'Menyeru perpaduan pada saat penyelesaian adalah anggun, dan ia membantu.',
      'Peringatan itu benar dan tidak sepenuhnya dialu-alukan. Parti kekal bersatu.',
      'Pemimpin yang menyerang keputusan selepas kejadian tidak pernah dilupakan.',
    ],
  },
};
