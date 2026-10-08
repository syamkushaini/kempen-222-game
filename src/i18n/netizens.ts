// What people say online about the news. Each kind of story has a few
// reactions in each language; {party} is the party the story is about.
// The handles are invented.

export const HANDLES = [
  '@makcik_bawang', '@kopi_o_kosong', '@abg_rider', '@cikgu_pencen', '@budak_uni', '@teh_tarik_politik',
  '@anak_felda', '@m40_tersepit', '@sabahan_bah', '@orang_kuching', '@peniaga_pasar_malam', '@undi_pertama',
];

export const NETIZEN_KINDS = [
  'crowdGreat', 'crowdWeak', 'viral', 'flop', 'attack', 'backfire', 'tycoon', 'poll', 'pact', 'katak',
  'candidate', 'staff', 'endorser', 'fine', 'troopers', 'gaffe', 'budget', 'billPassed', 'billDefeated', 'motion',
  'walkout', 'dissolved', 'byElection', 'statePolls', 'downturn', 'echoGood', 'echoBad', 'echoMixed',
] as const;
export type NetizenKind = (typeof NETIZEN_KINDS)[number];

export const NETIZENS_EN: Record<NetizenKind, string[]> = {
  crowdGreat: ['Never seen the padang that full. Even the satay man ran out.', 'Say what you like about {party}, that was a crowd.', 'My uncle went for the free nasi lemak and came back a believer.'],
  crowdWeak: ['More plastic chairs than people at the {party} ceramah. I counted.', 'The speaker was good. Shame only the mosquitoes heard it.', '{party} rented a hall for 2,000. The 60 who came had plenty of legroom.'],
  viral: ['OK that {party} video is actually funny. Who let them be funny?', 'Third time this is on my feed today. Fine. I watched it.', 'My whole class is quoting {party} now. Send help.'],
  flop: ['{party} admin, please. Delete it. For all of us.', 'Whoever approved that {party} post needs a long holiday.', 'I have seen government forms with more charm than that post.'],
  attack: ['Popcorn ready. {party} came with receipts.', 'That one will leave a mark.', 'Politicians fighting each other instead of us. Nature is healing.'],
  backfire: ['{party} threw mud and slipped in it.', 'Imagine attacking someone and making people like them more.', 'That attack aged like santan left in the sun.'],
  tycoon: ['So that is who is paying for {party}’s billboards. Explains a lot.', 'RM900k? I cannot even get a loan for a Myvi.', 'Everyone shocked. Nobody surprised.'],
  poll: ['Polls again. Did anybody ask MY kampung?', 'Margin of error ±4. My confidence in polls ±40.', 'Every party says the poll is wrong until it says they are winning.'],
  pact: ['Enemies last week, best friends now. Politics is a drama with better catering.', 'So who do I vote for now? The logo I hate or the logo I hate less?', 'Seat deal done. The voters, as always, were not consulted.'],
  katak: ['Another frog. At this rate we need a pond, not a Parliament.', 'Jumped on principle, he says. The principle of what?', 'Voted for the party, got the hopper. Refund please.'],
  candidate: ['This is the candidate {party} chose? Did nobody search his name?', 'Skeletons in the cupboard. Should have checked the cupboard.', '{party} vetting team, where are you? Hello?'],
  staff: ['The {party} adviser resigned “to spend time with family”. The family is very surprised.', 'Hire in haste, resign on the front page.', 'Who is doing the background checks at {party}? A cat?'],
  endorser: ['An endorsement! My vote remains for sale to the highest nasi kandar.', 'If my favourite singer says so, who am I to argue.', 'Celebrities telling me how to vote. Can they also tell me how to pay rent?'],
  fine: ['{party} fined for overspending. Somebody tell them the rest of us overspend at the pasar malam for free.', 'There is a spending limit? In this economy?', 'The Election Commission woke up. Mark the calendar.'],
  troopers: ['I KNEW those accounts were fake. Nobody loves a politician that much.', 'Paid cybertroopers. And I have been arguing with them for free.', '“Organic support”, they said.'],
  gaffe: ['One sentence. That is all it takes. One sentence.', 'The interviewer did not even have to try.', 'Somebody take the microphone away from him. Gently.'],
  budget: ['Budget day. Let us see what they take with the other hand.', 'Good on paper. My wallet reads different paper.', 'Every year a “people’s budget”. Which people? Asking for the people.'],
  billPassed: ['A promise kept?? Check if it is raining frogs.', 'They actually passed it. I need to sit down.', 'Fine. Credit where due. Now do the other promises.'],
  billDefeated: ['Lost the vote in their own House. Embarrassing.', 'Partners voted against. Some coalition.', 'So the manifesto was a suggestion.'],
  motion: ['No-confidence motion. My confidence was never there to begin with.', 'Parliament doing maths again: who has the numbers?', 'Can we get a motion of no confidence in the price of chicken?'],
  walkout: ['A partner walked out. Government by WhatsApp group, and someone has left the group.', 'Coalition? More like a bus where everyone wants to drive.', 'Here we go again. Anyone have the hotel’s number?'],
  dissolved: ['Parliament dissolved! Time to remember where I registered to vote.', 'Election season. My relatives will stop speaking to each other again.', 'Flags everywhere by tomorrow. The poles have not recovered from last time.'],
  byElection: ['By-election! Suddenly our potholes are getting fixed.', 'One seat, forty ministers visiting. We should have by-elections every month.', 'New roads, new streetlights. Thank you, whoever resigned.'],
  statePolls: ['State polls. Different flags, same promises.', 'My state votes this month. The durian stall has more consistent pricing than these manifestos.', 'Whoever wins, please fix the water supply. That is the whole manifesto.'],
  downturn: ['Prices up, pay the same. Somebody explain “resilient economy” to my salary.', 'Economists say tighten belts. Mine is on the last hole.', 'Global downturn, they say. My downturn started years ago.'],
  echoGood: ['Funny how that decision looks better a month on.', 'Credit where it is due: that one worked.', 'Remember when everyone said it was a mistake?'],
  echoBad: ['A month later and it is still coming back to bite them.', 'They said it would be fine. It is not fine.', 'Who is going to say “I told you so” first?'],
  echoMixed: ['Some got what they wanted, some did not. Welcome to government.', 'Too early to say, too late to take back.', 'Ask me in a year.'],
};

export const NETIZENS_MS: Record<NetizenKind, string[]> = {
  crowdGreat: ['Tak pernah tengok padang sepenuh tu. Abang sate pun habis stok.', 'Cakaplah apa pun pasal {party}, ramai tu memang ramai.', 'Pak cik aku pergi sebab nasi lemak percuma, balik-balik dah jadi penyokong.'],
  crowdWeak: ['Kerusi plastik lagi banyak daripada orang kat ceramah {party}. Aku kira.', 'Ucapan sedap. Sayang nyamuk je yang dengar.', '{party} sewa dewan untuk 2,000 orang. Yang datang 60, selesa betul duduk.'],
  viral: ['OK video {party} tu memang lawak. Siapa bagi diorang jadi lawak ni?', 'Dah tiga kali lalu kat feed hari ni. Yelah. Aku tengok.', 'Satu kelas aku dok ulang ayat {party}. Tolong.'],
  flop: ['Admin {party}, tolonglah. Padam. Demi kita semua.', 'Siapa yang luluskan hantaran {party} tu patut cuti panjang.', 'Borang kerajaan pun lagi ada seri daripada hantaran tu.'],
  attack: ['Bertih jagung dah siap. {party} datang bawa resit.', 'Yang ni memang berbekas.', 'Ahli politik bergaduh sesama sendiri, bukan dengan kita. Alam semakin pulih.'],
  backfire: ['{party} baling lumpur, sendiri yang tergelincir.', 'Bayangkan serang orang, lepas tu orang makin suka dia.', 'Serangan tu basi macam santan tinggal tengah panas.'],
  tycoon: ['Oh tu rupanya yang bayar papan iklan {party}. Patutlah.', 'RM900k? Aku nak pinjam beli Myvi pun tak lepas.', 'Semua terkejut. Tak ada siapa hairan.'],
  poll: ['Tinjauan lagi. Ada sesiapa tanya kampung AKU?', 'Ralat ±4. Keyakinan aku pada tinjauan ±40.', 'Semua parti kata tinjauan salah, sampailah tinjauan kata dia menang.'],
  pact: ['Minggu lepas musuh, sekarang kawan baik. Politik ni drama, cuma katering lagi sedap.', 'Jadi aku nak undi siapa? Logo yang aku benci atau logo yang kurang benci?', 'Rundingan kerusi selesai. Pengundi, macam biasa, tak ditanya.'],
  katak: ['Katak lagi. Kalau macam ni kita perlukan kolam, bukan Parlimen.', 'Lompat atas dasar prinsip, katanya. Prinsip apa?', 'Undi parti, dapat pelompat. Nak tuntut balik boleh?'],
  candidate: ['Ini calon yang {party} pilih? Tak ada siapa cari nama dia dulu ke?', 'Bangkai gajah dalam almari. Patut periksa almari dulu.', 'Pasukan tapisan {party}, mana kamu? Helo?'],
  staff: ['Penasihat {party} letak jawatan “untuk luang masa dengan keluarga”. Keluarga pun terkejut.', 'Lantik tergesa-gesa, letak jawatan di muka depan.', 'Siapa buat semakan latar belakang kat {party}? Kucing?'],
  endorser: ['Sokongan tokoh! Undi aku masih terbuka kepada nasi kandar paling sedap.', 'Kalau penyanyi kegemaran aku dah cakap, siapalah aku nak bantah.', 'Selebriti ajar aku mengundi. Boleh ajar bayar sewa sekali?'],
  fine: ['{party} didenda sebab belanja lebih. Kita belanja lebih kat pasar malam tak ada siapa kisah pun.', 'Ada had perbelanjaan? Dalam ekonomi macam ni?', 'SPR dah bangun. Tandakan kalendar.'],
  troopers: ['AKU DAH AGAK akaun tu palsu. Mana ada orang sayang ahli politik sampai macam tu.', 'Laskar siber berbayar. Aku pulak bertekak dengan diorang percuma.', '“Sokongan organik”, katanya.'],
  gaffe: ['Satu ayat. Itu je yang perlu. Satu ayat.', 'Wartawan tu tak payah usaha pun.', 'Tolong ambil mikrofon tu daripada dia. Perlahan-lahan.'],
  budget: ['Hari belanjawan. Kita tengok apa yang diambil dengan tangan sebelah lagi.', 'Atas kertas cantik. Dompet aku baca kertas lain.', 'Tiap tahun “belanjawan rakyat”. Rakyat mana? Rakyat nak tahu.'],
  billPassed: ['Janji ditunaikan?? Tengok luar, hujan katak ke.', 'Betul-betul lulus. Aku kena duduk kejap.', 'Baiklah. Pujian yang patut. Sekarang janji yang lain pula.'],
  billDefeated: ['Kalah undi dalam Dewan sendiri. Malu.', 'Rakan gabungan undi bantah. Gabungan apa macam tu.', 'Rupanya manifesto tu cadangan je.'],
  motion: ['Usul tidak percaya. Kepercayaan aku memang dari awal tak ada.', 'Parlimen buat kira-kira lagi: siapa cukup bilangan?', 'Boleh usul tidak percaya terhadap harga ayam tak?'],
  walkout: ['Rakan gabungan keluar. Kerajaan macam kumpulan WhatsApp, ada yang dah “left group”.', 'Gabungan? Lebih kepada bas yang semua orang nak pandu.', 'Mula dah. Ada sesiapa simpan nombor hotel tu?'],
  dissolved: ['Parlimen bubar! Masa untuk ingat balik aku daftar mengundi kat mana.', 'Musim pilihan raya. Saudara-mara aku berhenti bertegur lagi.', 'Esok bendera penuh merata. Tiang lampu belum pulih dari yang lepas.'],
  byElection: ['Pilihan raya kecil! Tiba-tiba lubang jalan kami ditampal.', 'Satu kerusi, empat puluh menteri datang melawat. Patut buat PRK tiap bulan.', 'Jalan baharu, lampu jalan baharu. Terima kasih kepada sesiapa yang letak jawatan.'],
  statePolls: ['Pilihan raya negeri. Bendera lain, janji sama.', 'Negeri aku mengundi bulan ni. Harga durian lagi konsisten daripada manifesto.', 'Siapa pun menang, tolong baiki bekalan air. Itu je manifestonya.'],
  downturn: ['Harga naik, gaji sama. Tolong terangkan “ekonomi berdaya tahan” kepada gaji aku.', 'Pakar ekonomi suruh ikat perut. Tali pinggang aku dah lubang terakhir.', 'Kemelesetan global, katanya. Kemelesetan aku dah lama mula.'],
  echoGood: ['Lucu, keputusan tu nampak lebih baik sebulan kemudian.', 'Patut puji: yang tu menjadi.', 'Ingat tak masa semua orang kata ia silap?'],
  echoBad: ['Sebulan kemudian dan ia masih menggigit balik.', 'Mereka kata tak apa. Tapi ada apa-apa.', 'Siapa nak kata “aku dah cakap” dulu?'],
  echoMixed: ['Ada yang dapat apa dia nak, ada yang tidak. Selamat datang ke pemerintahan.', 'Terlalu awal nak kata, terlalu lewat nak tarik balik.', 'Tanya aku setahun lagi.'],
};
