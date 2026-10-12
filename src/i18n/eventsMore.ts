// The events that come round every year (the monsoon, the haze, prices, the Chief Secretary's note, the budget) used to be told the same way
// each time. These are other tellings of the same day: the decision, its choices and its results are unchanged. The first time an event comes
// the usual text is used; the second time the first of these, the third the second, and so on round.

export const MORE_EN: Record<string, string[]> = {
  monsoon: [
    'The river has risen over the bridge at the market town again. The boats are out, so are the photographers, and a minister is being fitted for rubber boots. The relief centres are the schools, and the schools are the ones that flooded last year.',
    'This year the rains came early and stayed. The warning sirens worked, which is news in itself, but the roads to three villages did not. Someone will have to decide who goes first, and the cameras will decide who is seen going.',
  ],
  haze: [
    'The air index has gone past the number where they stop calling it a number. Schools have shut, the hospitals are full of coughs, and the neighbours say they are doing everything they can, which is what they said last year.',
    'A grey afternoon at noon: the office lights are on and the mask sellers are doing well. The talks with the neighbours are scheduled for next month. The haze is scheduled for this week.',
  ],
  priceSurge: [
    'The price of rice has not moved, but the price of everything you eat with it has. The market is full of people reading labels, and the radio phone-in is full of people reading the government a bill.',
    'A trader on the news says the chilli is up a third, then holds up the chilli. It is a small chilli and a large third. By evening every household in the country has done the same sum.',
  ],
  ksuMemo: [
    'Another note from the Chief Secretary, this time with tabs. He is not against the government’s plans, he writes; he is only recording, for the file, which of them he told you about in March.',
    'The Chief Secretary asks for ten minutes. He brings a folder, sets it on the desk, and says he would be failing in his duty if he did not mention what is in it. He then mentions it, at length, carefully.',
  ],
  shadowBudget: [
    'The budget speech is a week away and the government has leaked the good parts. The press gallery wants to know what the opposition would do differently, and whether it can say it in one sentence.',
    'Budget week again. The opposition can promise everything, since it will not have to pay for any of it, or it can show its sums and risk being read. Both have been tried.',
  ],
  budgetAsk: [
    'The Finance Minister’s draft is going round the offices with a pencil. Every partner has a list, and every list has the same item at the top: their own constituencies.',
    'The budget will be tabled in a few weeks, and the last chance to be heard is now. A partner who asks for too much is called greedy; one who asks for too little is called absent.',
  ],
};

export const MORE_MS: Record<string, string[]> = {
  monsoon: [
    'Sungai naik melepasi jambatan di pekan pasar lagi. Bot sudah keluar, jurugambar pun sama, dan seorang menteri sedang disarungkan but getah. Pusat pemindahan ialah sekolah, dan sekolah itu yang banjir tahun lalu.',
    'Tahun ini hujan datang awal dan tidak mahu pergi. Siren amaran berfungsi, yang sendirinya berita, tetapi jalan ke tiga buah kampung tidak. Seseorang mesti memutuskan siapa dahulu, dan kamera akan memutuskan siapa yang kelihatan pergi.',
  ],
  haze: [
    'Indeks udara sudah melepasi angka yang tidak lagi disebut sebagai angka. Sekolah ditutup, hospital penuh dengan batuk, dan jiran berkata mereka sedang buat apa yang mampu, seperti yang mereka katakan tahun lalu.',
    'Petang yang kelabu pada waktu tengah hari: lampu pejabat dipasang dan penjual pelitup muka berniaga baik. Rundingan dengan jiran dijadualkan bulan depan. Jerebu dijadualkan minggu ini.',
  ],
  priceSurge: [
    'Harga beras tidak bergerak, tetapi harga semua yang dimakan bersamanya sudah naik. Pasar penuh dengan orang membaca label, dan sesi panggilan radio penuh dengan orang membaca bil kepada kerajaan.',
    'Seorang peniaga di televisyen berkata cili naik satu pertiga, lalu mengangkat cili itu. Cilinya kecil, kenaikannya besar. Menjelang petang setiap isi rumah di negara ini sudah membuat kira-kira yang sama.',
  ],
  ksuMemo: [
    'Satu lagi nota daripada Ketua Setiausaha, kali ini berpenanda. Dia tidak menentang rancangan kerajaan, tulisnya; dia hanya mencatat, untuk simpanan fail, yang mana dia sudah beritahu pada bulan Mac.',
    'Ketua Setiausaha meminta sepuluh minit. Dia membawa sebuah fail, meletakkannya di atas meja, dan berkata dia akan cuai pada tugas jika tidak menyebut isinya. Kemudian dia menyebutnya, panjang lebar, dengan berhati-hati.',
  ],
  shadowBudget: [
    'Ucapan bajet seminggu lagi dan kerajaan sudah membocorkan bahagian yang baik. Media mahu tahu apa yang pembangkang akan lakukan secara berbeza, dan sama ada ia boleh disebut dalam satu ayat.',
    'Minggu bajet lagi. Pembangkang boleh menjanjikan segala-galanya kerana tidak perlu membayarnya, atau menunjukkan kira-kiranya dan menanggung risiko dibaca. Kedua-duanya sudah pernah dicuba.',
  ],
  budgetAsk: [
    'Draf Menteri Kewangan beredar di pejabat-pejabat bersama sebatang pensel. Setiap rakan ada senarai, dan setiap senarai mempunyai perkara yang sama di atas sekali: kawasan mereka sendiri.',
    'Bajet akan dibentang dalam beberapa minggu, dan peluang terakhir untuk didengar ialah sekarang. Rakan yang meminta terlalu banyak dipanggil tamak; yang meminta terlalu sedikit dipanggil tiada.',
  ],
};

/** The flat keys the interface looks up: `event.<id>.body.1`, `.2`, and so on. */
export function flattenMore(more: Record<string, string[]>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [id, list] of Object.entries(more)) list.forEach((text, i) => { out[`event.${id}.body.${i + 1}`] = text; });
  return out;
}

/** Which telling of an event to show: the usual one the first time it has come, then each other one in turn. `times` counts this time. */
export function bodyVariant(id: string, times: number): number {
  const extras = MORE_EN[id]?.length ?? 0;
  return extras === 0 ? 0 : Math.max(0, times - 1) % (extras + 1);
}
