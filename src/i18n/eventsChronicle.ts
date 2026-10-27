import type { EventText } from './events';

// Text for the Campaign Chronicle dilemmas (see sim/campaign/eventListChronicle.ts): two small choices that are not settled
// on the spot, but written down and catch up with the player later, win or lose.

export const CHRONICLE_EVENTS_EN: Record<string, EventText> = {
  envelopeOffer: {
    title: 'An envelope on the table',
    body: 'A developer’s man sits across from you with an envelope and a planning map. The project needs a rezoning, he says, and he understands these things take “encouragement”. He is not in a hurry; he can wait for your answer.',
    options: ['Take it, and see the rezoning through', 'Refuse, and say so to the room', 'Decline quietly, no scene'],
    results: [
      'The envelope went into your bag, and the rezoning went through without a hitch. Nobody is asking. Yet.',
      'You said no, in front of witnesses. The developer left unhappy; your own fundraisers looked uneasy.',
      'You said no, and nothing more was said. He put the envelope away.',
    ],
  },
  envelopeReturns: {
    title: 'A columnist has questions',
    body: 'Someone remembers the rezoning, and the developer’s name, and is asking in print why the paperwork moved so fast that year. Nobody has proof of an envelope. Yet.',
    options: ['Open the file and let it be audited', 'Call it old news and hope it passes'],
    results: [
      'The audit found nothing that could be pinned on you, but it cost the party its peace for a fortnight.',
      ['“Old news” was enough this time, and the story moved on.', 'It was not old news to everyone. The columnist kept digging.'],
    ],
  },
  subsidyPledge: {
    title: 'A promise on fuel prices',
    body: 'A reporter asks, on camera, whether fuel prices will rise this term. The honest answer is complicated. The popular one is a flat “no”.',
    options: ['Promise fuel prices stay frozen, whatever happens', 'Give the complicated, honest answer'],
    results: [
      'The crowd cheered. The Treasury made a note of what that would cost, eventually.',
      'It was not a rousing answer, but it was a true one, and some people noticed that too.',
    ],
  },
  subsidyPriceShock: {
    title: 'The bill for a frozen promise',
    body: 'Global oil prices have jumped, and the subsidy that keeps the pump price frozen is now eating a visible share of the budget. Economists are polite about it on the front page and less polite everywhere else.',
    options: ['Keep the promise and let the budget absorb it', 'Break the promise now, before it gets worse'],
    results: [
      'The pump price held. So, for now, did your word, at a cost the next budget will have to explain.',
      'The promise broke in public, exactly as remembered. It was cheaper this way, and it did not feel cheaper.',
    ],
  },
};

export const CHRONICLE_EVENTS_MS: Record<string, EventText> = {
  envelopeOffer: {
    title: 'Sampul di atas meja',
    body: 'Orang suruhan seorang pemaju duduk di hadapan anda dengan sampul surat dan pelan perancangan. Projek itu perlu penukaran zon, katanya, dan dia faham perkara begini perlukan “galakan”. Dia tak kesuntukan masa; dia boleh tunggu jawapan anda.',
    options: ['Terima, dan pastikan penukaran zon berjaya', 'Tolak, dan nyatakan di depan semua', 'Tolak senyap-senyap, tanpa heboh'],
    results: [
      'Sampul itu masuk dalam beg anda, dan penukaran zon berjalan lancar. Tiada siapa bertanya. Setakat ini.',
      'Anda kata tidak, di hadapan saksi. Pemaju itu pulang tak puas hati; jentera kutipan dana anda sendiri nampak tak selesa.',
      'Anda kata tidak, dan tiada apa-apa lagi disebut. Dia simpan semula sampul itu.',
    ],
  },
  envelopeReturns: {
    title: 'Seorang kolumnis ada soalan',
    body: 'Seseorang masih ingat penukaran zon itu, dan nama pemaju itu, dan bertanya dalam akhbar kenapa kertas kerja bergerak begitu laju tahun itu. Tiada siapa ada bukti ada sampul. Setakat ini.',
    options: ['Buka fail itu dan biar diaudit', 'Kata ia cerita lama dan harap ia berlalu'],
    results: [
      'Audit tidak menemui apa-apa yang boleh dikaitkan dengan anda, tapi ia mengorbankan ketenteraman parti selama dua minggu.',
      ['“Cerita lama” cukup kali ini, dan cerita itu berlalu.', 'Ia bukan cerita lama buat semua orang. Kolumnis itu terus menyiasat.'],
    ],
  },
  subsidyPledge: {
    title: 'Janji harga minyak',
    body: 'Seorang wartawan bertanya, di hadapan kamera, sama ada harga minyak akan naik penggal ini. Jawapan yang jujur agak rumit. Jawapan yang popular ialah “tidak” yang mudah.',
    options: ['Janji harga minyak kekal, apa pun berlaku', 'Beri jawapan jujur yang rumit'],
    results: [
      'Orang ramai bersorak. Perbendaharaan mencatat kosnya, kelak.',
      'Bukan jawapan yang menggemparkan, tapi ia benar, dan ada juga yang perasan itu.',
    ],
  },
  subsidyPriceShock: {
    title: 'Bil untuk janji yang dibekukan',
    body: 'Harga minyak dunia melambung, dan subsidi yang mengekalkan harga pam kini memakan sebahagian besar belanjawan. Ahli ekonomi bersopan tentangnya di muka hadapan dan kurang bersopan di tempat lain.',
    options: ['Kekalkan janji dan biar belanjawan menampungnya', 'Mungkir janji sekarang, sebelum ia lebih teruk'],
    results: [
      'Harga pam kekal. Begitu juga, buat masa ini, kata-kata anda, pada kos yang perlu dijelaskan belanjawan akan datang.',
      'Janji itu mungkir secara terbuka, tepat seperti yang diingati. Lebih murah caranya, dan ia tak rasa murah.',
    ],
  },
};
