import type { EventText } from './events';

// The decisions of the three storylines, in English and Bahasa Malaysia (see eventListStory.ts and storyline.ts). Invented people only: Puan Sri
// Mariam, Farid, Dato' Lazim and Kak Dewi turn up in every story. {state} and {trade} are filled in for a state's story (see story.ts).

export const STORYLINE_EN: Record<string, EventText> = {
  natInheritance: {
    title: 'The Inheritance',
    body: "Your first weeks are keys, passwords and unpaid invoices. Puan Sri Mariam, the party's eldest elder, leaves a thick folder on your desk: the debts, the promises, and a list of people who expect favours. Farid, your chief of staff, says the first thing you do will become the story of how you lead.",
    options: ['Publish a short charter of three promises you can keep', "Let Dato' Lazim pay for a grand launch", 'Tour the branches with cameras and promise a clean-out of the old guard'],
    results: [
      'The charter is short and people read it. It is hard to break a promise that fits on one page.',
      'The launch is glorious and the bills are paid. Some of the guests are on no list you have seen.',
      ['The branches cheer, the old guard stops answering your calls, and the clips travel far.', 'The clean-out sounds like a threat. The old guard says so, loudly, and the clips travel further.'],
    ],
  },
  natFirstCrack: {
    title: 'The Memo',
    body: "Farid brings a folded memo that was meant for someone else: a list of names with ticks and question marks beside them. Someone in the House is counting heads for a new arrangement, and your party is on it, in the column for friends or in the column for 'to be handled'. Puan Sri Mariam says to ignore it. Dato' Lazim's people say to act first.",
    options: ['Return the memo and say openly that you will not play counting games', 'Start your own count and find out who is really in', "Let Dato' Lazim's people have a quiet word with the names on the list"],
    results: [
      'The sender is embarrassed, and the story becomes that you are not a head-counter. It is a good story to have.',
      'Your count is slow and tiring, and several people dislike being counted. But now you know the numbers.',
      'Three names change their minds by Friday. You do not ask how, and people notice that you did not ask.',
    ],
  },
  natPaperTrail: {
    title: 'The Midnight Call',
    body: "Kak Dewi, editor of Suara Pagi, rings at midnight. Her reporters have your party's donor list, and three entries do not add up: a rented hall, a consultancy fee, and a 'friend of the party' nobody has met. She gives you until Friday to answer, and she has a long memory for how people answer.",
    options: ['Open the books: publish the full donor list and take the hit', "Go on the radio and question the paper's motives", 'Quietly repay the money and say nothing'],
    results: [
      'It stings for a week. Then it is just a thing you did, and people stop asking.',
      ['The host is on your side and so are the callers. For one day it works.', 'The callers turn on you. Kak Dewi reads your answer back, line by line, on the front page.'],
      'The money goes back and the story fades, though not for everyone who noticed it was there.',
    ],
  },
  natAfterGov: {
    title: 'The Morning After',
    body: 'The votes are counted, the oath is taken, and your party is in government. At the first meeting of the new cabinet nobody is sure who pours the tea and who carries the blame. Puan Sri Mariam wants a broad cabinet, Farid wants a small one of people you trust, and the old guard wants its turn.',
    options: ['Pick the cabinet on merit, even if the old guard sulks', 'Reward the loyal and keep rivals close with big posts', 'Offer posts to the reformers of a rival party'],
    results: [
      'The cabinet looks like a team, not a seating plan. The sulking is audible but short.',
      'Everyone you owed is paid, and everyone who might betray you has a car and a driver to lose.',
      ['Two of the reformers accept, and give a speech about working across the aisle. The country is intrigued.', 'The offer is refused in public. The old guard has opinions about the offer, and about you for making it.'],
    ],
  },
  natAfterOpp: {
    title: 'The Long Bench',
    body: 'The votes are counted and your party sits on the opposition side of the House. Some of your people want to rest; others want to bring the government down by Friday. Farid has drawn two plans on a napkin, and Puan Sri Mariam looks at you and says nothing, which is her loudest advice.',
    options: ['Build a shadow cabinet that publishes careful, costed alternatives', 'Run a daily campaign on every government slip', "Quietly court the government's unhappiest partners"],
    results: [
      'The papers call it dull. The ministers find it hard to answer.',
      'The government is rattled, and so is your budget. Your people are tired but fired up.',
      'A few conversations in the car park go further than a month of speeches, if anyone is counting.',
    ],
  },
  natLastPage: {
    title: 'The Last Page',
    body: 'The years have gone faster than the diary said. Farid has started writing a book and Puan Sri Mariam has started giving away her recipes, which she only does when she is thinking of leaving. The question that follows you into every room is simple: what will people say you did here? Three answers are on the table.',
    options: ['Spend the season on one reform you will be proud of', 'Go for the biggest prize: a coalition that cannot be beaten', 'Make sure your friends are looked after before you go'],
    results: [
      'It is not the biggest thing you did. It is the one people will still be using in twenty years.',
      ['The coalition holds, and the country sees a leader who finished what was started.', 'The coalition wobbles in public. Everyone remembers who was holding the other end.'],
      'Your friends are comfortable. The papers do the arithmetic, and the arithmetic is not.',
    ],
  },

  stateKeys: {
    title: 'The Keys',
    body: 'The office in {state} smells of fresh paint and old files. The State Secretary lays out three stacks: the projects that are ready, the ones the last administration promised, and the two complaints about {trade} that arrive every week. Whatever you announce first, the whole state will read it as a sign of what you care about.',
    options: ['Announce a modest list: the repairs people complain about most', 'Announce a headline project with a famous investor', "Promise a turnaround for the state's main trade within a year"],
    results: [
      'Nobody throws a parade for a drain, but the drains work. It is a start.',
      'The investor smiles for the cameras. Nobody has read the terms yet, including some in your own team.',
      ['The promise lands. People start asking how it is going, with hope.', 'The promise lands badly. People start asking how it is going, with a calendar.'],
    ],
  },
  stateHandshake: {
    title: 'The Envelope',
    body: 'A federal minister arrives in {state} with a thick envelope: a grant, with conditions. They are not outrageous, but they would tie the state\'s hands on a project you care about. Farid shrugs. The state legal adviser asks to read the small print twice.',
    options: ['Negotiate the conditions line by line, even if it takes months', 'Take the money and sort the conditions out later', "Go public: say the centre is bargaining for the state's loyalty"],
    results: [
      'It takes four months and two trips to the capital. The final terms are yours, and the minister respects you for it.',
      'The money arrives. The conditions arrive a little later, and so do the questions.',
      ['The state rallies and the minister blinks. Your phone rings with offers.', 'The minister says it is a misunderstanding, in a tone that makes it sound like yours. Funds for the project go quiet.'],
    ],
  },
  stateTrade: {
    title: 'A Bad Season',
    body: "A quiet crisis in {state}: the trade everyone knows it for, {trade}, has had a bad season. Prices have dropped, a big buyer has gone elsewhere, and kopitiam talk is all about it. Kak Dewi's reporters are on their way to the district, and Dato' Lazim has already offered to 'help'.",
    options: ['Set up a small relief and retraining fund with clear rules', "Let Dato' Lazim's company run the rescue", 'Call everyone in the trade together and let them write the plan'],
    results: [
      'The fund helps real people on clear terms. It is not enough, and everyone knows it, but it is honest.',
      'The rescue is fast and generous to a few. The accounts will need reading.',
      ['The meeting runs three hours and ends with a plan nobody expected, because nobody expected to be asked.', 'The meeting runs three hours and ends in an argument. At least the cameras were told it was a meeting.'],
    ],
  },
  stateAfterGov: {
    title: 'The Morning After',
    body: "{state} has voted, and your side governs it. The celebration is teh tarik at midnight. Now the hard part: Puan Sri Mariam says the state has trusted you for five more years; Farid says the voters have trusted you for five more months. The assembly's budget is due and the local councils are restless.",
    options: ['Keep the team and publish a five-year plan', 'Reshuffle: bring in new faces and bench the tired ones', 'Give each partner a prize project to keep the peace'],
    results: [
      'The plan is long, honest and a little dull. The state likes a government that writes things down.',
      ['The new faces are fresh and the tired ones are gracious. Everyone says it is overdue.', 'The tired ones are not gracious. Whispers begin about who is next.'],
      'Everyone gets a ribbon to cut. The projects will cost more than the ribbons, and the cost is not in the plan.',
    ],
  },
  stateAfterOpp: {
    title: 'The Long Walk',
    body: "{state} has voted, and your party sits across the aisle. The government's numbers are thin and its partners are still counting. Some of your people want to wait for it to fall; others say voters will only reward a party that shows them how it would run things.",
    options: ['Publish a shadow budget for the state', 'Challenge the government on every vote in the assembly', "Open a back channel to the government's most restless partner"],
    results: [
      'The shadow budget has real numbers in it. Reporters read it, which is more than they do for most things.',
      'Every vote becomes a fight. The government is tired by Thursday; so are your people.',
      'Nobody says anything on the record. Everyone knows a call was made.',
    ],
  },
  stateKeeper: {
    title: 'The Plaque',
    body: 'Late in the term, {state} is quiet the way a kampung is quiet before a kenduri: everyone is busy and nobody will say what for. Puan Sri Mariam says it is time to decide what will be on the plaque when you are gone. Kak Dewi is writing a profile and wants to know, off the record, what you would do differently.',
    options: ['Tell her honestly what went wrong and what you learned', 'Say you would do it all again, and mean it', "Ask Dato' Lazim to fund a memorial project with your name on it"],
    results: [
      'The profile is fair, even kind. You come out of it looking like someone who can be trusted with the next chapter.',
      ['The line is quoted everywhere. People like a leader who does not flinch.', 'The line is quoted everywhere. People do not like a leader who does not learn.'],
      'The project is handsome and the name is large. The state has seen a lot of names on a lot of buildings.',
    ],
  },

  foundHall: {
    title: 'Seven Chairs',
    body: "Your party's first headquarters is a rented shoplot with seven plastic chairs and a banner that has already lost a corner. A stranger at the door says they have a hall that holds three hundred; the price is a small favour, to be named later. Meanwhile three volunteers, a student, a retired teacher and a lorry driver, offer to run the first meeting in the car park.",
    options: ['Hold the first meeting in the car park with the volunteers', "Take the stranger's hall, favour to be named later", 'Rent a stage and a sound system and launch loudly'],
    results: [
      'Forty people come and fifteen stay for tea. Every one of them is yours.',
      'The hall is full and it costs nothing. The favour has not been named, which is the part that worries Farid.',
      ['The launch is loud and photographs well. A party that cannot be ignored is a party.', 'The sound system outdoes the speeches. The photographs are of empty chairs and one very large speaker.'],
    ],
  },
  foundOffer: {
    title: "The Big Party's Offer",
    body: "A senior figure from an established party invites you for teh tarik and makes a proposal: join them, and you get a safe seat and perhaps a post. Refuse, and they will not be hostile, but they will not stand aside either. Puan Sri Mariam's advice is the opposite of Farid's, which usually means both are right.",
    options: ['Decline politely and say you will stay independent', 'Agree to a quiet understanding: no merger, but no fighting in each other\'s seats', 'Publish the offer and dare them to publish their terms'],
    results: [
      'They are gracious about it, and cold about it. You are known for knowing your own mind.',
      'Nothing is written down and everyone knows. Some volunteers go quiet.',
      ['The terms are never published, and the offer was never made, officially. You are everywhere on the radio.', 'They publish their terms, and the terms are thinner than you said. You look like someone who exaggerates.'],
    ],
  },
  foundCheque: {
    title: 'The Cheque',
    body: "Dato' Lazim's cheque is the largest your party has ever seen. The card says: 'No strings. Only a seat in the room when decisions are made.' The treasurer has gone pale; the volunteers have gone quiet. Money has never been scarcer and the building fund has never been closer.",
    options: ['Return the cheque and publish a rule: no donation above a set limit', 'Accept it for the building fund, with receipts published', 'Raise the same amount from small donors in thirty days, to prove the party needs no patron'],
    results: [
      'The cheque goes back. So does a little of the volunteers\' fear.',
      'The building fund is full and the receipts are published. People read the name on them anyway.',
      ['The thirty days are exhausting. By the end the party has more members and no strings.', 'The thirty days are exhausting and the total falls short. The party has a lot of new members and some bruised pride.'],
    ],
  },
  foundBreakthrough: {
    title: 'The Corner of the Table',
    body: 'The count is over and your party has more than a handful of seats: enough that the big coalitions have started calling at odd hours. A phone rings at 2 a.m., another at 2:10. Farid is writing names on a whiteboard and Puan Sri Mariam has brought a flask of kopi.',
    options: ['Set your price in public: three reforms, no posts', 'Sell your votes to the highest bidder', 'Offer support from outside, case by case'],
    results: [
      'Two of the three reforms make it into the programme. The posts go to someone else, and you are the only one not tired of this.',
      'The bidder is generous, and the bidding is not secret for long. The party is richer and your word is cheaper.',
      ['Support from outside means every vote is a negotiation, and you win more of them than expected.', 'Support from outside means every vote is a negotiation, and you lose the first two in public.'],
    ],
  },
  foundWall: {
    title: 'The Wall',
    body: 'The count is in and the numbers are thin. The student volunteer is in tears, the lorry driver has already booked the van for the next campaign, and an old friend says the party should fold into a bigger one. Puan Sri Mariam says every big party was once somebody\'s embarrassing small one.',
    options: ['Hold a candid meeting: thank the volunteers, publish what went wrong, plan the long road', "Accept a place on the bigger party's list", 'Back a bold rebrand and a new flagship policy'],
    results: [
      'It is the most honest meeting the party has had. By the end there is a plan, and a van.',
      'A place on the list is a place. The volunteers are quiet about it, in a way that is worse than shouting.',
      ['The rebrand lands. People who ignored you at the election are suddenly curious.', 'The rebrand is a new logo on the same problem. At least the problem looks better.'],
    ],
  },
  foundGovernment: {
    title: 'Government or Never',
    body: "The next election is on the horizon and, for the first time, a poll has your party in the conversation: the kind of conversation where people say 'what if?'. Farid has made a spreadsheet, Kak Dewi has made an appointment, and Dato' Lazim has made his intentions known.",
    options: ['Keep the message simple and the books clean', 'Go for broke: a national tour and a bet on the surge', 'Hand the campaign to professionals with deep pockets and no questions'],
    results: [
      'The message is simple and the books are clean. In a long campaign, that is a kind of strength.',
      ['The tour fills halls. The surge arrives, a little ahead of schedule.', 'The tour fills halls, but the surge does not come. You are tired and so is the money.'],
      'The campaign looks magnificent. The people who paid for it do not say what they expect.',
    ],
  },
};

export const STORYLINE_MS: Record<string, EventText> = {
  natInheritance: {
    title: 'Warisan',
    body: 'Minggu-minggu pertama anda penuh dengan kunci, kata laluan dan invois yang belum dibayar. Puan Sri Mariam, orang tua parti yang paling dihormati, tinggalkan satu fail tebal atas meja anda: hutang, janji, dan senarai orang yang mengharapkan budi. Farid, ketua staf anda, kata perkara pertama yang anda buat akan jadi cerita tentang cara anda memimpin.',
    options: ['Terbitkan piagam pendek dengan tiga janji yang anda boleh tunaikan', "Biar Dato' Lazim tanggung majlis pelancaran yang gilang-gemilang", 'Jelajah cawangan dengan kamera dan janji untuk bersihkan barisan lama'],
    results: [
      'Piagam itu pendek dan orang betul-betul baca. Susah nak mungkir janji yang muat dalam satu muka surat.',
      'Majlis itu meriah dan semua bil dijelaskan. Ada tetamu yang tiada dalam mana-mana senarai yang pernah anda lihat.',
      ['Cawangan bersorak, barisan lama berhenti jawab panggilan anda, dan klip tersebar jauh.', 'Janji "bersihkan" itu kedengaran macam ugutan. Barisan lama kata begitu, kuat-kuat, dan klipnya tersebar lebih jauh.'],
    ],
  },
  natFirstCrack: {
    title: 'Memo Itu',
    body: "Farid bawa satu memo berlipat yang sepatutnya sampai ke orang lain: senarai nama dengan tanda semak dan tanda soal di sebelahnya. Ada orang dalam Dewan sedang mengira kepala untuk satu susunan baharu, dan parti anda ada dalam senarai itu, sama ada lajur 'kawan' atau lajur 'untuk diuruskan'. Puan Sri Mariam suruh abaikan. Orang Dato' Lazim suruh bertindak dulu.",
    options: ['Pulangkan memo itu dan katakan terus terang anda tak main kira-kira kepala', 'Mula mengira sendiri dan cari siapa yang betul-betul bersama anda', "Biar orang Dato' Lazim 'berbual sikit' dengan nama-nama dalam senarai"],
    results: [
      'Pengirimnya malu, dan ceritanya jadi anda bukan orang yang suka kira kepala. Itu cerita yang elok untuk dimiliki.',
      'Kiraan anda perlahan dan memenatkan, dan ada yang tak suka dikira. Tapi sekarang anda tahu angkanya.',
      'Tiga nama tukar fikiran menjelang Jumaat. Anda tak tanya bagaimana, dan orang perasan anda tak tanya.',
    ],
  },
  natPaperTrail: {
    title: 'Panggilan Tengah Malam',
    body: "Kak Dewi, editor Suara Pagi, telefon tengah malam. Wartawannya dapat senarai penderma parti anda, dan tiga entri tak tally: sewa dewan, bayaran perundingan, dan seorang 'kawan parti' yang tiada siapa pernah jumpa. Dia beri anda sampai Jumaat untuk menjawab, dan dia ingat lama bagaimana orang menjawab.",
    options: ['Buka buku akaun: terbitkan senarai penderma penuh dan terima akibatnya', 'Naik radio dan persoalkan niat akhbar itu', 'Senyap-senyap pulangkan wang itu dan jangan cakap apa-apa'],
    results: [
      'Pedih seminggu. Lepas itu ia sekadar sesuatu yang anda pernah buat, dan orang berhenti bertanya.',
      ['Pengacara di pihak anda, begitu juga pemanggil. Untuk sehari, ia menjadi.', 'Pemanggil berbalik menentang anda. Kak Dewi bacakan semula jawapan anda, baris demi baris, di muka depan.'],
      'Wang itu dipulangkan dan cerita itu pudar, walaupun tidak bagi semua yang perasan wang itu pernah ada.',
    ],
  },
  natAfterGov: {
    title: 'Pagi Selepas Itu',
    body: 'Undi sudah dikira, sumpah sudah diangkat, dan parti anda dalam kerajaan. Dalam mesyuarat pertama kabinet baharu, tiada siapa pasti siapa yang tuang teh dan siapa yang tanggung salah. Puan Sri Mariam mahu kabinet yang luas, Farid mahu kabinet kecil yang diisi orang yang anda percaya, dan barisan lama mahu giliran mereka.',
    options: ['Pilih kabinet ikut merit, walaupun barisan lama merajuk', 'Ganjari yang setia dan dekatkan pesaing dengan jawatan besar', 'Tawarkan jawatan kepada golongan reformis parti lawan'],
    results: [
      'Kabinet nampak macam pasukan, bukan susunan tempat duduk. Rajuk kedengaran tapi singkat.',
      'Semua yang anda terhutang budi sudah dibayar, dan semua yang mungkin mengkhianati anda ada kereta dan pemandu untuk dikehilangkan.',
      ['Dua orang reformis menerima, dan berucap tentang kerjasama merentasi lorong. Negara tertarik.', 'Tawaran itu ditolak secara terbuka. Barisan lama ada pendapat tentang tawaran itu, dan tentang anda yang membuatnya.'],
    ],
  },
  natAfterOpp: {
    title: 'Bangku Panjang',
    body: 'Undi sudah dikira dan parti anda duduk di sebelah pembangkang Dewan. Ada orang anda mahu berehat; yang lain mahu jatuhkan kerajaan menjelang Jumaat. Farid dah lukis dua pelan atas napkin, dan Puan Sri Mariam pandang anda dan tak cakap apa-apa, itulah nasihatnya yang paling kuat.',
    options: ['Bina kabinet bayangan yang menerbitkan alternatif yang teliti dan dikosankan', 'Jalankan kempen setiap hari terhadap setiap kesilapan kerajaan', 'Senyap-senyap pikat rakan kerajaan yang paling tak puas hati'],
    results: [
      'Akhbar kata ia membosankan. Menteri-menteri susah nak menjawab.',
      'Kerajaan tergugat, begitu juga bajet anda. Orang anda penat tapi bersemangat.',
      'Beberapa perbualan di tempat letak kereta pergi lebih jauh daripada sebulan ucapan, kalau ada yang mengira.',
    ],
  },
  natLastPage: {
    title: 'Muka Surat Terakhir',
    body: 'Tahun-tahun berlalu lebih pantas daripada yang tertulis dalam diari. Farid dah mula menulis buku dan Puan Sri Mariam dah mula memberi resipinya, yang dia hanya buat bila terfikir untuk berhenti. Soalan yang mengikut anda ke setiap bilik mudah sahaja: apa orang akan kata anda buat di sini? Tiga jawapan ada di atas meja.',
    options: ['Habiskan musim ini untuk satu pembaharuan yang anda akan bangga', 'Kejar hadiah terbesar: gabungan yang tak boleh dikalahkan', 'Pastikan kawan-kawan anda terjaga sebelum anda pergi'],
    results: [
      'Ia bukan perkara terbesar yang anda buat. Ia yang orang masih guna dua puluh tahun lagi.',
      ['Gabungan itu bertahan, dan negara nampak pemimpin yang menyudahkan apa yang dimulakan.', 'Gabungan itu bergoyang di depan umum. Semua orang ingat siapa yang pegang hujung satu lagi.'],
      'Kawan-kawan anda selesa. Akhbar buat pengiraan, dan pengiraannya tak selesa.',
    ],
  },

  stateKeys: {
    title: 'Kunci',
    body: 'Pejabat di {state} berbau cat baharu dan fail lama. Setiausaha Kerajaan Negeri susun tiga longgokan: projek yang sudah siap, projek yang dijanjikan pentadbiran lepas, dan dua aduan tentang {trade} yang sampai setiap minggu. Apa pun yang anda umumkan dulu, seluruh negeri akan baca ia sebagai tanda apa yang anda pentingkan.',
    options: ['Umumkan senarai sederhana: pembaikan yang paling kerap diadukan', 'Umumkan projek utama dengan pelabur terkenal', 'Janji untuk memulihkan perdagangan utama negeri dalam setahun'],
    results: [
      'Tiada siapa raikan longkang, tapi longkang berfungsi. Itu permulaan.',
      'Pelabur tersenyum depan kamera. Belum ada yang baca syaratnya, termasuk sebahagian pasukan anda sendiri.',
      ['Janji itu mengena. Orang mula tanya bagaimana perkembangannya, dengan harapan.', 'Janji itu tak menjadi. Orang mula tanya bagaimana perkembangannya, dengan kalendar di tangan.'],
    ],
  },
  stateHandshake: {
    title: 'Sampul Surat',
    body: 'Seorang menteri persekutuan tiba di {state} dengan sampul tebal: satu geran, bersama syarat. Syaratnya tak keterlaluan, tapi ia mengikat tangan negeri dalam satu projek yang anda pentingkan. Farid angkat bahu. Penasihat undang-undang negeri minta baca cetakan halus itu dua kali.',
    options: ['Runding syarat baris demi baris, walaupun makan masa berbulan', 'Ambil wang itu dan selesaikan syaratnya kemudian', 'Dedahkan kepada umum: kata pusat sedang tawar-menawar untuk kesetiaan negeri'],
    results: [
      'Ia makan masa empat bulan dan dua kali ke ibu negara. Syarat akhirnya milik anda, dan menteri itu menghormati anda kerananya.',
      'Wang sampai. Syaratnya sampai sedikit lewat, begitu juga soalan-soalan.',
      ['Negeri bersatu di belakang anda dan menteri itu berkelip. Telefon anda berdering dengan tawaran.', 'Menteri kata ia salah faham, dengan nada yang buat ia kedengaran seperti salah faham anda. Dana projek itu senyap.'],
    ],
  },
  stateTrade: {
    title: 'Musim yang Buruk',
    body: "Krisis senyap di {state}: perdagangan yang paling dikenali orang tentangnya, {trade}, mengalami musim yang buruk. Harga jatuh, pembeli besar dah pergi ke tempat lain, dan semua orang di kopitiam bercakap tentangnya. Wartawan Kak Dewi sedang menuju ke daerah itu, dan Dato' Lazim dah pun menawarkan untuk 'membantu'.",
    options: ['Wujudkan dana bantuan dan latihan semula yang kecil dengan peraturan yang jelas', "Biar syarikat Dato' Lazim uruskan penyelamatan", 'Panggil semua yang terlibat dalam perdagangan itu dan biar mereka tulis pelan sendiri'],
    results: [
      'Dana itu bantu orang sebenar dengan syarat yang jelas. Tak cukup, dan semua orang tahu, tapi ia jujur.',
      'Penyelamatan pantas dan murah hati kepada segelintir. Akaunnya perlu dibaca.',
      ['Mesyuarat berjalan tiga jam dan berakhir dengan pelan yang tiada siapa jangka, sebab tiada siapa jangka akan ditanya.', 'Mesyuarat berjalan tiga jam dan berakhir dengan pertengkaran. Sekurang-kurangnya kamera diberitahu ia mesyuarat.'],
    ],
  },
  stateAfterGov: {
    title: 'Pagi Selepas Itu',
    body: 'Rakyat {state} dah mengundi, dan pihak anda memerintahnya. Sambutannya teh tarik tengah malam. Sekarang bahagian yang susah: Puan Sri Mariam kata negeri dah percayakan anda lima tahun lagi; Farid kata pengundi percayakan anda lima bulan lagi. Bajet dewan sudah hampir dan majlis-majlis tempatan resah.',
    options: ['Kekalkan pasukan dan terbitkan pelan lima tahun', 'Rombak: bawa muka baharu dan rehatkan yang sudah letih', 'Beri setiap rakan satu projek hadiah untuk menjaga keamanan'],
    results: [
      'Pelannya panjang, jujur dan sedikit membosankan. Negeri suka kerajaan yang menulis perkara.',
      ['Muka baharu segar dan yang letih berlapang dada. Semua kata ia sudah lama patut dibuat.', 'Yang letih tak berlapang dada. Bisikan bermula tentang siapa yang seterusnya.'],
      'Setiap orang dapat riben untuk dipotong. Projek-projek itu akan makan lebih daripada riben, dan kosnya tiada dalam pelan.',
    ],
  },
  stateAfterOpp: {
    title: 'Jalan yang Panjang',
    body: 'Rakyat {state} dah mengundi, dan parti anda duduk di seberang lorong. Bilangan kerajaan nipis dan rakan-rakannya masih mengira. Ada orang anda mahu tunggu ia jatuh; yang lain kata pengundi hanya akan memberi ganjaran kepada parti yang menunjukkan bagaimana ia akan mentadbir.',
    options: ['Terbitkan bajet bayangan untuk negeri', 'Cabar kerajaan pada setiap undi dalam dewan', 'Buka saluran belakang kepada rakan kerajaan yang paling resah'],
    results: [
      'Bajet bayangan itu ada angka sebenar. Wartawan membacanya, lebih daripada yang mereka buat untuk kebanyakan benda.',
      'Setiap undi jadi pertarungan. Kerajaan penat menjelang Khamis; begitu juga orang anda.',
      'Tiada siapa cakap apa-apa secara rasmi. Semua orang tahu ada panggilan dibuat.',
    ],
  },
  stateKeeper: {
    title: 'Plak',
    body: 'Lewat penggal, {state} sunyi macam kampung sebelum kenduri: semua orang sibuk dan tiada siapa nak cakap sebab apa. Puan Sri Mariam kata dah tiba masa memutuskan apa yang akan tertulis pada plak bila anda tiada. Kak Dewi sedang menulis profil dan mahu tahu, di luar rekod, apa yang akan anda buat berbeza.',
    options: ['Beritahu dia terus terang apa yang tak kena dan apa yang anda belajar', 'Kata anda akan buat semuanya lagi, dan maksudkannya', "Minta Dato' Lazim membiayai projek peringatan dengan nama anda"],
    results: [
      'Profilnya adil, malah baik. Anda keluar daripadanya nampak seperti orang yang boleh dipercayai untuk bab seterusnya.',
      ['Ayat itu dipetik di mana-mana. Orang suka pemimpin yang tak gentar.', 'Ayat itu dipetik di mana-mana. Orang tak suka pemimpin yang tak belajar.'],
      'Projek itu menawan dan namanya besar. Negeri ini dah banyak nampak nama atas banyak bangunan.',
    ],
  },

  foundHall: {
    title: 'Tujuh Kerusi',
    body: 'Ibu pejabat pertama parti anda ialah sebuah lot kedai sewa dengan tujuh kerusi plastik dan sepanduk yang dah koyak satu penjuru. Seorang yang tak dikenali di pintu kata dia ada dewan yang muat tiga ratus; harganya satu budi kecil, disebut kemudian. Sementara itu tiga sukarelawan, seorang pelajar, seorang guru pencen dan seorang pemandu lori, menawarkan untuk mengendalikan mesyuarat pertama di tempat letak kereta.',
    options: ['Adakan mesyuarat pertama di tempat letak kereta bersama sukarelawan', 'Ambil dewan orang itu, budi disebut kemudian', 'Sewa pentas dan sistem bunyi dan lancarkan dengan meriah'],
    results: [
      'Empat puluh orang datang dan lima belas tinggal minum teh. Setiap seorang daripada mereka milik anda.',
      'Dewan penuh dan percuma. Budi itu belum disebut, itulah bahagian yang merisaukan Farid.',
      ['Pelancaran itu meriah dan cantik bila difoto. Parti yang tak boleh diabaikan ialah parti.', 'Sistem bunyi mengatasi ucapan. Gambarnya kerusi kosong dan satu pembesar suara yang sangat besar.'],
    ],
  },
  foundOffer: {
    title: 'Tawaran Parti Besar',
    body: 'Seorang tokoh kanan sebuah parti yang mapan mengajak anda minum teh tarik dan membuat cadangan: sertai mereka, dan anda dapat kerusi selamat dan mungkin satu jawatan. Tolak, dan mereka takkan memusuhi, tapi mereka juga takkan mengalah. Nasihat Puan Sri Mariam bertentangan dengan Farid, yang biasanya bermakna kedua-duanya betul.',
    options: ['Tolak dengan sopan dan kata anda kekal bebas', 'Setuju dengan persefahaman senyap: tiada penggabungan, tapi tak bertanding di kerusi masing-masing', 'Umumkan tawaran itu dan cabar mereka umumkan syaratnya'],
    results: [
      'Mereka bersopan tentangnya, dan dingin tentangnya. Anda dikenali sebagai orang yang tahu pendirian sendiri.',
      'Tiada apa ditulis dan semua orang tahu. Sesetengah sukarelawan jadi senyap.',
      ['Syarat itu tak pernah diumumkan, dan tawaran itu tak pernah dibuat, secara rasmi. Anda ada di mana-mana di radio.', 'Mereka umumkan syaratnya, dan syaratnya lebih nipis daripada yang anda cakap. Anda nampak seperti orang yang melebih-lebih.'],
    ],
  },
  foundCheque: {
    title: 'Cek Itu',
    body: "Cek Dato' Lazim ialah yang terbesar pernah parti anda lihat. Kad itu tertulis: 'Tiada syarat. Hanya satu tempat dalam bilik bila keputusan dibuat.' Bendahari dah pucat; sukarelawan dah senyap. Wang tak pernah sesukar ini dan tabung bangunan tak pernah sedekat ini.",
    options: ['Pulangkan cek dan terbitkan peraturan: tiada derma melebihi had tertentu', 'Terima untuk tabung bangunan, dengan resit diterbitkan', 'Kumpul jumlah yang sama daripada penderma kecil dalam tiga puluh hari, untuk buktikan parti tak perlukan penaung'],
    results: [
      'Cek itu dipulangkan. Begitu juga sedikit ketakutan sukarelawan.',
      'Tabung bangunan penuh dan resit diterbitkan. Orang tetap baca nama pada resit itu.',
      ['Tiga puluh hari itu memenatkan. Pada akhirnya parti ada lebih ramai ahli dan tiada syarat.', 'Tiga puluh hari itu memenatkan dan jumlahnya tak cukup. Parti ada ramai ahli baharu dan sedikit ego yang lebam.'],
    ],
  },
  foundBreakthrough: {
    title: 'Penjuru Meja',
    body: 'Pengiraan sudah selesai dan parti anda ada lebih daripada segelintir kerusi: cukup untuk gabungan-gabungan besar mula menelefon pada waktu pelik. Satu telefon berdering pukul 2 pagi, satu lagi pukul 2:10. Farid menulis nama atas papan putih dan Puan Sri Mariam bawa termos kopi.',
    options: ['Tetapkan harga anda di depan umum: tiga pembaharuan, tiada jawatan', 'Jual undi anda kepada penawar tertinggi', 'Tawarkan sokongan dari luar, kes demi kes'],
    results: [
      'Dua daripada tiga pembaharuan masuk dalam program. Jawatan pergi kepada orang lain, dan anda seorang sahaja yang tak jemu dengan semua ini.',
      'Penawar itu murah hati, dan tawaran itu tak lama menjadi rahsia. Parti lebih kaya dan kata-kata anda lebih murah.',
      ['Sokongan dari luar bermakna setiap undi ialah rundingan, dan anda menang lebih banyak daripada jangkaan.', 'Sokongan dari luar bermakna setiap undi ialah rundingan, dan anda kalah dua yang pertama di depan umum.'],
    ],
  },
  foundWall: {
    title: 'Tembok',
    body: 'Pengiraan sudah siap dan angkanya nipis. Sukarelawan pelajar menangis, pemandu lori dah tempah van untuk kempen seterusnya, dan seorang kawan lama kata parti patut bergabung dengan yang lebih besar. Puan Sri Mariam kata setiap parti besar dahulunya parti kecil yang memalukan seseorang.',
    options: ['Adakan mesyuarat terbuka: berterima kasih kepada sukarelawan, terbitkan apa yang silap, rancang jalan panjang', 'Terima tempat dalam senarai parti yang lebih besar', 'Sokong penjenamaan semula yang berani dan dasar utama baharu'],
    results: [
      'Ia mesyuarat paling jujur yang pernah parti ada. Menjelang akhir ada pelan, dan van.',
      'Tempat dalam senarai ialah tempat. Sukarelawan senyap tentangnya, dengan cara yang lebih teruk daripada menjerit.',
      ['Penjenamaan semula itu mengena. Orang yang mengabaikan anda semasa pilihan raya tiba-tiba ingin tahu.', 'Penjenamaan semula itu logo baharu pada masalah yang sama. Sekurang-kurangnya masalahnya nampak lebih cantik.'],
    ],
  },
  foundGovernment: {
    title: 'Kerajaan atau Tidak Sama Sekali',
    body: "Pilihan raya seterusnya semakin dekat dan, buat pertama kali, satu tinjauan meletakkan parti anda dalam perbualan: jenis perbualan yang orang kata 'kalau?'. Farid dah buat hamparan data, Kak Dewi dah buat temu janji, dan Dato' Lazim dah nyatakan hasratnya.",
    options: ['Kekalkan mesej mudah dan akaun bersih', 'Pertaruhkan segalanya: jelajah seluruh negara dan bertaruh pada gelombang sokongan', 'Serahkan kempen kepada profesional berpoket dalam tanpa soalan'],
    results: [
      'Mesejnya mudah dan akaunnya bersih. Dalam kempen yang panjang, itu satu kekuatan.',
      ['Jelajah itu memenuhkan dewan. Gelombang sokongan tiba, sedikit lebih awal daripada jadual.', 'Jelajah itu memenuhkan dewan, tapi gelombang tak datang. Anda penat dan begitu juga wang.'],
      'Kempen itu nampak hebat. Orang yang membayarnya tak cakap apa yang mereka harapkan.',
    ],
  },
};
