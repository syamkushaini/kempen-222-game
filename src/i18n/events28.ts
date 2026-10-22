import type { EventText } from './events';

// Twelve small stories for the first months of a career of a party that was already there: four for leading the government, four for a partner in it, four for the opposition. Every place and person is invented. A result written as a pair is for a gamble: the win, then the loss.

export const PARTY_OPENING_EN: Record<string, EventText> = {
  startPmHundredDays: {
    title: 'The hundred-day list',
    body: 'Your communications chief wants a public list of promises for the first hundred days. It would be easy to hold you to, and that is exactly the point. The finance people would rather you promised nothing that has a date on it.',
    options: ['Publish ten promises, each with a date', 'Publish three, the three you are sure of', 'Promise a list, and let the suspense do the work'],
    results: [
      'The list is read, copied and pinned to a great many walls. By week eight, three items are already late and the walls remember.',
      'Three promises, all kept, and a rumour that the government is shy. The rumour does less harm than a list with holes in it.',
      ['The list is announced, and the country waits for it with unusual interest. It is, when it comes, better than the waiting.', 'The list is announced, and the country waits, and waits. By the time it appears, the joke about it is better than the list.'],
    ],
  },
  startPmSecretary: {
    title: 'The secretary-general’s quiet word',
    body: 'The most senior civil servant asks for ten minutes alone. A large project begun by your predecessor is over budget and behind schedule, he says, and every month it continues costs more to stop. He would like to know, before he signs anything, which way you lean.',
    options: ['Order a full review, and say so in public', 'Let the project finish, and keep the review for later', 'Cancel it, and blame the predecessor'],
    results: [
      'The review takes weeks and finds what he said. The news is bad, and it is yours, and people notice that it is told straight.',
      'The project goes on. The civil service is relieved, and a few of your own people ask what the point of a new government is.',
      'The cancellation is popular with those who did not want it and ruinous for those who built it. A contractor’s lawyer is already on the phone.',
    ],
  },
  startPmClaimants: {
    title: 'Two ministries, three claimants',
    body: 'Two important ministries are still to be filled, and three of your senior people feel that one of them is theirs. One has been loyal for twenty years. One brought in a great many votes. One is simply very good, and knows it.',
    options: ['Give them to the two who have been loyal longest', 'Give them to the two who are best at the work', 'Let the party’s council settle it by vote, and accept the result'],
    results: [
      'Loyalty is rewarded, and the party is pleased. The ministries are run competently, and no one is surprised, and no one is much impressed.',
      'The best get the jobs. The one left out says nothing in public, and a great deal in private.',
      ['The council votes, and the result is accepted by all three, with remarkably good grace.', 'The council votes, and the loser walks out of the room in a manner remembered for years.'],
    ],
  },
  startPmSchoolVisit: {
    title: 'A first visit that left the script',
    body: 'On your first official visit to a school, a nine-year-old on a stage asks, into a microphone, why her bus takes an hour and a half. Everyone in the hall has their phone out. Your staff are looking at the ceiling.',
    options: ['Answer her honestly, in front of everyone, and promise to find out', 'Make a joke, and keep walking', 'Pass the question to the minister, who is standing at the back'],
    results: [
      'You do not know the answer, and say so. The clip is shared as the first honest thing the government has done, and the bus route is looked at that week.',
      'The joke lands, mostly. A few people ask why a child’s question deserved a joke.',
      'The minister is surprised to be asked. The answer is correct, and sounds like a leaflet.',
    ],
  },
  startGovRearRow: {
    title: 'A seat in the back row',
    body: 'At the first official ceremony, your leader has been placed in the third row, behind two ministers of the senior party who are not senior to him. Someone on your team has already taken a photograph. The picture is, it must be said, a good one.',
    options: ['Post the photograph, and ask politely where the front row went', 'Say nothing, and take the seat with a smile', 'Raise it privately with the prime minister’s office, with the photograph'],
    results: [
      'The photograph is shared by your own supporters, and the senior party is not amused. Your members are delighted, and the prime minister’s office is cool for a week.',
      'The smile is noticed. The party’s old hands think you are being too polite, and the new ones think you are being wise.',
      ['The office is apologetic, and the next ceremony has a better seating plan. The photograph is never seen.', 'The office says it will look into it, and does not. The photograph leaks anyway, and now you look both timid and sly.'],
    ],
  },
  startGovDeputy: {
    title: 'The deputy minister post nobody asked for',
    body: 'The senior party has offered your party a deputy minister’s post in a portfolio your members know little about. It comes with a car, a salary and a small staff. Two of your people want it, and a third says it is a trap.',
    options: ['Give it to the loyal veteran who has waited longest', 'Give it to the young MP with the most promise', 'Decline, and ask for a post where you have expertise'],
    results: [
      'The veteran is thrilled, the ministry is bemused, and your members are happy to see someone rewarded for patience.',
      'The young MP is good, and the veteran is hurt. The party agrees, at length, that both things are true.',
      'The prime minister’s office is surprised to be asked, and takes a month to answer. The answer is not quite what you asked for.',
    ],
  },
  startGovBackbench: {
    title: 'The backbenchers’ letter',
    body: 'Fourteen of your MPs have signed a letter to the leader. They say the party is in government and the constituencies have not noticed. They want a larger share of the allocations, and a promise that the first road repaired will be theirs.',
    options: ['Take the letter to the senior party, and push for a fair share', 'Ask them to be patient, and promise to talk in six months', 'Meet them, listen, and promise something small and certain'],
    results: [
      'The senior party is irritated and the MPs are delighted. The letter is quoted, in two newspapers, as a sign of the coalition’s tension.',
      'The MPs wait. Most of them are patient, and a few are not, and the few start to talk to people they should not.',
      'The small promise is kept, and the MPs are quietly satisfied. Nobody writes a headline about it.',
    ],
  },
  startGovMemo: {
    title: 'A memo from the prime minister’s office',
    body: 'A memo arrives on a Friday afternoon. It asks your party to publicly endorse a policy, by Monday, before you have seen the text. The covering note says it is “a formality”. A formality, in your experience, is the thing that is not.',
    options: ['Endorse it, and read the text over the weekend', 'Say you will endorse it after you have read it', 'Ask for a call with the prime minister, and see how the call goes'],
    results: [
      'You endorse it, and read it, and find two clauses you would not have signed. The prime minister’s office is happy, and you are not.',
      'The reply is polite and cool. The text arrives on Monday, and it is, as it happens, quite reasonable.',
      ['The call is cordial, and the text is changed in one place, to your satisfaction. Everyone is a little more careful with you after.', 'The call is brief, and the prime minister is not in a mood for changes. You are left looking both difficult and unheard.'],
    ],
  },
  startOppShadow: {
    title: 'The shadow cabinet list',
    body: 'The leader must name the shadow cabinet, and three factions have each sent a list of names, with a covering letter that is not quite a threat. There are only so many portfolios, and the cleverest people are not always the most loyal.',
    options: ['Share the posts among the factions, in proportion', 'Name the most capable, whatever faction they are from', 'Name the loyalists, and give the rest committee seats'],
    results: [
      'Everyone gets something. No one gets quite enough, and the shadow cabinet’s first meeting is long.',
      'The team is good, and the one faction that was passed over is cool for a month. The press notices the team more than the faction.',
      'The loyalists are pleased and the rest are watching. The shadow cabinet is united, and a little dull.',
    ],
  },
  startOppMotion: {
    title: 'A motion that will lose',
    body: 'A group of your MPs wants to put a motion to the House on the cost of living. It will not pass; the government has the numbers. The question is whether to make a speech of it, to hold it back for a better moment, or to find a partner who will table it with you.',
    options: ['Table it, make the speech, and lose with dignity', 'Hold it back, and save it for a week when the news is on your side', 'Offer it jointly to another opposition party, and share the credit'],
    results: [
      'The motion loses, as expected. The speech is quoted in two of the three papers that matter.',
      'The week you were waiting for does not come, and the motion is never tabled. Your MPs wonder why they were told to wait.',
      ['The joint motion is warmly received, and the two parties have a good day.', 'The other party agrees, and then tables its own the day before. You are left with the same words and none of the credit.'],
    ],
  },
  startOppLeak: {
    title: 'A document nobody can verify',
    body: 'A man you do not know has left an envelope at the party office. It appears to show that a ministry hired a company, owned by a relative of the minister, at three times the usual rate. The paper looks real. Nobody can say that it is.',
    options: ['Take it to a journalist, and say plainly that you have not verified it', 'Release it at once as a scandal, and let the government answer', 'Hand it to the anti-corruption body, and say nothing'],
    results: [
      'The journalist checks, takes a week, and finds half of it true. The story is smaller than you hoped and more solid than you feared.',
      ['The release is a sensation, and the document turns out to be true. The government has a bad month.', 'The release is a sensation, and a clause in the document turns out to be false. The government has a good month, and you do not.'],
      'The body receives it with thanks. You are, for once, the party that behaved like a party in government. That is not a headline either.',
    ],
  },
  startOppVacancy: {
    title: 'A rumour of a vacancy',
    body: 'The MP for a marginal seat that your party hopes to win is said to be unwell, and a by-election may come. Nothing has been announced. Your branch there has no candidate, and three members want to be asked.',
    options: ['Start the work now, quietly, and choose a candidate early', 'Hold a public contest among the three, and let members decide', 'Wait for the announcement, and choose in a hurry if it comes'],
    results: [
      'The groundwork is done, and the rumour proves false. The branch is better for the work, and the three are grateful for being taken seriously.',
      'The contest is lively and the loser is gracious. Your branch has never been so talked about, and the seat is still not vacant.',
      'The announcement does not come, and the rumour dies away. The three members wonder whether anyone had been going to ask them.',
    ],
  },
};

export const PARTY_OPENING_MS: Record<string, EventText> = {
  startPmHundredDays: {
    title: 'Senarai seratus hari',
    body: 'Ketua komunikasi anda mahu senarai janji awam untuk seratus hari pertama. Senang untuk dipegang janji, dan itulah tujuannya. Orang kewangan lebih suka anda tak janji apa-apa yang ada tarikh.',
    options: ['Siar sepuluh janji, setiap satu ada tarikh', 'Siar tiga, yang anda pasti', 'Janji sebuah senarai, dan biar debaran bekerja'],
    results: [
      'Senarai dibaca, disalin dan ditampal di banyak dinding. Menjelang minggu kelapan, tiga perkara sudah lewat dan dinding mengingatinya.',
      'Tiga janji, semuanya ditunaikan, dan khabar angin kerajaan malu-malu. Khabar itu kurang bahaya daripada senarai yang berlubang.',
      ['Senarai diumumkan, dan negara menunggu dengan minat luar biasa. Bila keluar, ia lebih baik daripada penantiannya.', 'Senarai diumumkan, negara menunggu, dan menunggu lagi. Bila ia muncul, jenaka tentangnya lebih baik daripada senarai itu.'],
    ],
  },
  startPmSecretary: {
    title: 'Pesanan perlahan setiausaha agung',
    body: 'Penjawat awam paling kanan minta sepuluh minit bersendirian. Satu projek besar yang dimulakan pendahulu anda melebihi bajet dan lewat, katanya, dan setiap bulan ia diteruskan, semakin mahal untuk dihentikan. Dia mahu tahu, sebelum menandatangani apa-apa, anda condong ke mana.',
    options: ['Arahkan semakan penuh, dan umumkan', 'Biar projek siap, dan simpan semakan untuk kemudian', 'Batalkan, dan salahkan pendahulu'],
    results: [
      'Semakan ambil beberapa minggu dan dapati seperti yang dikatakan. Beritanya buruk, dan ia milik anda, dan orang perasan ia diceritakan dengan jujur.',
      'Projek diteruskan. Perkhidmatan awam lega, dan beberapa orang anda tanya apa gunanya kerajaan baharu.',
      'Pembatalan disambut mereka yang tak mahu projek itu dan memusnahkan mereka yang membinanya. Peguam seorang kontraktor sudah menelefon.',
    ],
  },
  startPmClaimants: {
    title: 'Dua kementerian, tiga penuntut',
    body: 'Dua kementerian penting belum diisi, dan tiga orang kanan anda rasa salah satu milik mereka. Seorang setia dua puluh tahun. Seorang membawa banyak undi. Seorang lagi memang sangat baik, dan tahu itu.',
    options: ['Beri kepada dua orang yang paling lama setia', 'Beri kepada dua orang yang paling pandai bekerja', 'Biar majlis parti putuskan dengan undi, dan terima keputusannya'],
    results: [
      'Kesetiaan dihargai, dan parti gembira. Kementerian ditadbir dengan cekap, tiada yang terkejut, dan tiada yang kagum.',
      'Yang terbaik dapat jawatan. Yang ketinggalan tak cakap apa-apa di depan orang, dan banyak sekali di belakang.',
      ['Majlis mengundi, dan ketiga-tiganya menerima keputusan dengan hati yang luar biasa baik.', 'Majlis mengundi, dan yang kalah keluar dari bilik dengan cara yang diingati bertahun-tahun.'],
    ],
  },
  startPmSchoolVisit: {
    title: 'Lawatan pertama yang lari skrip',
    body: 'Pada lawatan rasmi pertama ke sebuah sekolah, seorang budak sembilan tahun di pentas bertanya, ke dalam mikrofon, kenapa bas dia ambil sejam setengah. Semua orang di dewan sudah keluarkan telefon. Kakitangan anda tengok siling.',
    options: ['Jawab dengan jujur di depan semua orang, dan janji untuk mencari tahu', 'Buat lawak, dan terus berjalan', 'Serahkan soalan kepada menteri yang berdiri di belakang'],
    results: [
      'Anda tak tahu jawapannya, dan berkata begitu. Klip dikongsi sebagai perkara jujur pertama yang kerajaan buat, dan laluan bas disemak minggu itu.',
      'Lawak itu menjadi, kebanyakannya. Beberapa orang tanya kenapa soalan seorang kanak-kanak layak dijawab dengan lawak.',
      'Menteri terkejut ditanya. Jawapannya betul, dan bunyinya macam risalah.',
    ],
  },
  startGovRearRow: {
    title: 'Kerusi di barisan belakang',
    body: 'Pada majlis rasmi pertama, ketua anda diletakkan di barisan ketiga, di belakang dua menteri parti kanan yang tak lebih kanan daripadanya. Seseorang dalam pasukan anda sudah ambil gambar. Gambarnya, harus diakui, cantik.',
    options: ['Siarkan gambar itu, dan tanya dengan sopan ke mana perginya barisan depan', 'Tak cakap apa-apa, dan ambil tempat dengan senyum', 'Bangkitkan secara peribadi dengan pejabat perdana menteri, bersama gambar'],
    results: [
      'Gambar dikongsi penyokong anda sendiri, dan parti kanan tak terhibur. Ahli anda gembira, dan pejabat perdana menteri dingin seminggu.',
      'Senyum itu disedari. Orang lama parti rasa anda terlalu sopan, dan yang baharu rasa anda bijak.',
      ['Pejabat meminta maaf, dan majlis seterusnya ada susunan tempat duduk yang lebih baik. Gambar tak pernah dilihat.', 'Pejabat kata akan semak, dan tak buat. Gambar bocor juga, dan kini anda nampak penakut dan licik sekali gus.'],
    ],
  },
  startGovDeputy: {
    title: 'Jawatan timbalan menteri yang tak diminta',
    body: 'Parti kanan menawarkan parti anda jawatan timbalan menteri dalam portfolio yang ahli anda kurang tahu. Ia disertai kereta, gaji dan kakitangan kecil. Dua orang anda mahukannya, dan seorang lagi kata ia perangkap.',
    options: ['Beri kepada veteran setia yang paling lama menunggu', 'Beri kepada ahli parlimen muda yang paling berpotensi', 'Tolak, dan minta jawatan yang anda ada kepakaran'],
    results: [
      'Veteran itu teruja, kementerian kebingungan, dan ahli anda gembira melihat seseorang diberi ganjaran atas kesabaran.',
      'Ahli parlimen muda itu bagus, dan veteran terguris. Parti bersetuju, panjang lebar, kedua-duanya benar.',
      'Pejabat perdana menteri terkejut ditanya, dan ambil sebulan untuk menjawab. Jawapannya tak sama seperti yang anda minta.',
    ],
  },
  startGovBackbench: {
    title: 'Surat ahli bukan menteri',
    body: 'Empat belas ahli parlimen anda menandatangani surat kepada ketua. Mereka kata parti sudah dalam kerajaan dan kawasan tak perasan. Mereka mahu bahagian peruntukan lebih besar, dan janji jalan pertama yang dibaiki adalah milik mereka.',
    options: ['Bawa surat itu kepada parti kanan, dan desak bahagian yang adil', 'Minta mereka bersabar, dan janji berbincang dalam enam bulan', 'Jumpa mereka, dengar, dan janji sesuatu yang kecil dan pasti'],
    results: [
      'Parti kanan jengkel dan ahli parlimen gembira. Surat itu dipetik, dalam dua akhbar, sebagai tanda ketegangan gabungan.',
      'Ahli parlimen menunggu. Kebanyakan bersabar, dan beberapa tak, dan yang beberapa itu mula bercakap dengan orang yang tak sepatutnya.',
      'Janji kecil itu ditunaikan, dan ahli parlimen puas dalam diam. Tiada siapa tulis tajuk berita tentangnya.',
    ],
  },
  startGovMemo: {
    title: 'Memo dari pejabat perdana menteri',
    body: 'Sebuah memo tiba petang Jumaat. Ia minta parti anda menyokong satu dasar secara terbuka, menjelang Isnin, sebelum anda lihat teksnya. Nota pengiring kata ia “sekadar formaliti”. Formaliti, dalam pengalaman anda, ialah perkara yang bukan.',
    options: ['Sokong, dan baca teksnya hujung minggu', 'Kata anda akan sokong selepas membacanya', 'Minta panggilan dengan perdana menteri, dan lihat bagaimana ia berjalan'],
    results: [
      'Anda sokong, dan baca, dan jumpa dua fasal yang anda tak akan tandatangan. Pejabat perdana menteri gembira, dan anda tak.',
      'Jawapannya sopan dan dingin. Teks tiba hari Isnin, dan ternyata cukup munasabah.',
      ['Panggilan itu mesra, dan teks diubah di satu tempat, memuaskan hati anda. Semua orang lebih berhati-hati dengan anda selepas itu.', 'Panggilan itu ringkas, dan perdana menteri tak ada angin nak ubah apa-apa. Anda kelihatan susah dan tak didengari sekali gus.'],
    ],
  },
  startOppShadow: {
    title: 'Senarai kabinet bayangan',
    body: 'Ketua mesti namakan kabinet bayangan, dan tiga kumpulan telah menghantar senarai nama, bersama surat yang hampir ugutan. Portfolio ada had, dan orang paling bijak tak selalu paling setia.',
    options: ['Bahagi jawatan antara kumpulan, mengikut nisbah', 'Namakan yang paling berkebolehan, tak kira kumpulan', 'Namakan yang setia, dan beri yang lain kerusi jawatankuasa'],
    results: [
      'Semua orang dapat sesuatu. Tiada siapa cukup, dan mesyuarat pertama kabinet bayangan panjang.',
      'Pasukan bagus, dan satu kumpulan yang dilangkau dingin sebulan. Akhbar lebih perasan pasukan daripada kumpulan itu.',
      'Yang setia gembira dan yang lain memerhati. Kabinet bayangan bersatu, dan sedikit membosankan.',
    ],
  },
  startOppMotion: {
    title: 'Usul yang akan kalah',
    body: 'Sekumpulan ahli parlimen anda mahu bawa usul tentang kos sara hidup ke Dewan. Ia tak akan lulus; kerajaan ada bilangan. Soalnya sama ada nak buat ucapan besar, simpan untuk saat lebih baik, atau cari rakan yang bersedia bentang bersama.',
    options: ['Bentang, beri ucapan, dan kalah dengan maruah', 'Simpan, untuk minggu bila berita memihak anda', 'Tawarkan bersama kepada parti pembangkang lain, dan kongsi kredit'],
    results: [
      'Usul kalah, seperti dijangka. Ucapan dipetik dalam dua daripada tiga akhbar penting.',
      'Minggu yang ditunggu tak datang, dan usul tak pernah dibentang. Ahli parlimen anda tertanya kenapa disuruh menunggu.',
      ['Usul bersama disambut baik, dan dua parti ada hari yang elok.', 'Parti lain bersetuju, kemudian membentang usul sendiri sehari sebelum itu. Anda tinggal dengan kata-kata yang sama dan tiada kredit.'],
    ],
  },
  startOppLeak: {
    title: 'Dokumen yang tiada siapa dapat sahkan',
    body: 'Seorang lelaki yang anda tak kenal meninggalkan sampul surat di pejabat parti. Ia nampaknya menunjukkan sebuah kementerian mengupah syarikat milik saudara menteri dengan kadar tiga kali ganda. Kertasnya nampak sahih. Tiada siapa boleh kata ia memang sahih.',
    options: ['Bawa kepada wartawan, dan katakan terus terang anda belum sahkan', 'Siar segera sebagai skandal, dan biar kerajaan menjawab', 'Serahkan kepada badan antirasuah, dan diam'],
    results: [
      'Wartawan menyemak, ambil seminggu, dan dapati separuh benar. Ceritanya lebih kecil daripada harapan anda dan lebih kukuh daripada ketakutan anda.',
      ['Siaran itu sensasi, dan dokumen ternyata benar. Kerajaan ada bulan yang buruk.', 'Siaran itu sensasi, dan satu fasal dalam dokumen ternyata palsu. Kerajaan ada bulan yang baik, dan anda tak.'],
      'Badan itu menerimanya dengan terima kasih. Buat sekali ini, anda parti yang berkelakuan seperti parti dalam kerajaan. Itu pun bukan tajuk berita.',
    ],
  },
  startOppVacancy: {
    title: 'Khabar angin kerusi kosong',
    body: 'Wakil rakyat sebuah kerusi marginal yang parti anda harap menangi dikatakan kurang sihat, dan pilihan raya kecil mungkin menyusul. Belum ada pengumuman. Cawangan anda di sana tiada calon, dan tiga ahli mahu ditanya.',
    options: ['Mula kerja sekarang, secara senyap, dan pilih calon awal', 'Adakan pertandingan terbuka antara tiga orang itu, dan biar ahli putuskan', 'Tunggu pengumuman, dan pilih tergesa-gesa jika ia datang'],
    results: [
      'Kerja asas dibuat, dan khabar angin ternyata palsu. Cawangan lebih baik kerana kerja itu, dan ketiga-tiganya berterima kasih kerana dipandang serius.',
      'Pertandingan meriah dan yang kalah berlapang dada. Cawangan anda tak pernah sebegitu diperkatakan, dan kerusi masih belum kosong.',
      'Pengumuman tak datang, dan khabar angin reda. Tiga ahli itu tertanya sama ada ada orang yang berniat bertanya.',
    ],
  },
};
