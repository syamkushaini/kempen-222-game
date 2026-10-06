// The words for everything that happens between elections, in English and
// Bahasa Malaysia. The rules for each event are in src/sim/campaign/events.ts;
// the ids, the number of choices, and which choices are gambles must match.
// All people, parties and institutions here are invented.

import { MORE_EVENTS_EN, MORE_EVENTS_MS } from './events2';
import { GOVERNING_EVENTS_EN, GOVERNING_EVENTS_MS } from './events3';

/** A result is one line, or for a gamble a pair: how it reads when it comes off, and when it does not. */
export interface EventText {
  title: string;
  body: string;
  options: string[];
  results: (string | [win: string, lose: string])[];
}

export const EVENTS_EN: Record<string, EventText> = {
  ultimatum: {
    title: 'An ultimatum',
    body: 'A partner’s leader asks to see you alone, and does not sit down. His members are restless, he says, and other people have been making them offers. Things must change, or they will find another arrangement.',
    options: ['Find money for their constituencies', 'Give them what they ask, and face your own party', 'Tell them to do their worst'],
    results: [
      'The money was found, and the restlessness went away. For now.',
      'They got what they asked for. Your own party noticed who did not.',
      ['They blinked. The talk of leaving stopped the same afternoon.', 'They did their worst.'],
    ],
  },
  flood: {
    title: 'The monsoon floods',
    body: 'The east coast is under water again. Thousands are in relief centres, and every politician in the country has discovered a sudden love of rubber boots.',
    options: ['Lead a relief mission and pay for it', 'Fly in, be photographed handing over one box, fly out', 'Stay in the capital'],
    results: [
      'Your volunteers cooked, cleaned and carried for two weeks. People noticed.',
      ['The photographs came out well, and nobody asked what was in the box.', 'The video of you being carried over a puddle has two million views.'],
      'You stayed dry. So did your support on the east coast.',
    ],
  },
  oldVideo: {
    title: 'An old video resurfaces',
    body: 'Someone has found a clip of you from ten years ago saying the opposite of everything you now believe. It is spreading faster than you can remember what you meant.',
    options: ['Apologise and say you have grown', 'Insist you were right then and right now', 'Say nothing and wait for the next outrage'],
    results: [
      'Your apology was accepted by people who were never going to vote for you anyway.',
      ['Your refusal to back down played well with people who admire a thick skin.', 'Being right twice in opposite directions proved a hard argument to make.'],
      'The story ran for a week and was replaced by somebody else’s.',
    ],
  },
  youthWing: {
    title: 'The youth wing wants a say',
    body: 'The youth wing has issued a statement, which is new, demanding seats on the supreme council and a third of the candidates under forty.',
    options: ['Give them the seats', 'Remind them who built this party'],
    results: [
      'The old guard grumbled into their teh tarik. The young turned up to canvass.',
      'The youth chief resigned on livestream. The old guard has never been happier.',
    ],
  },
  byElection: {
    title: 'A by-election',
    body: 'A seat has fallen vacant. One seat rarely changes who governs, but everyone will read the result as a verdict on you.',
    options: ['Throw everything at it', 'Send a candidate and a small budget', 'Leave it to the local branch'],
    results: ['The party threw everything at it.', 'A candidate and a small budget.', 'The branch fought it alone.'],
  },
  statePolls: {
    title: 'The states go to the polls',
    body: 'State assemblies are being dissolved. Whoever wins most seats in a state forms its government, and a state government is money, jobs and a platform for five years.',
    options: ['Fight every state flat out', 'A measured campaign', 'Leave it to the state chiefs'],
    results: ['The whole party went to the states.', 'A measured campaign.', 'The state chiefs fought alone.'],
  },
  influencer: {
    title: 'An influencer names a price',
    body: 'A lifestyle influencer with three million followers will say nice things about you. There is a rate card.',
    options: ['Pay the rate', 'Challenge them to interview you live instead', 'Decline'],
    results: [
      'The post went up, tagged #sponsored in very small letters.',
      ['The live interview went well. You were, briefly, relatable.', 'The live interview is now a meme, and not the good kind.'],
      'You kept your money and your dignity. Neither trends.',
    ],
  },
  warlord: {
    title: 'A state chief wants his own list',
    body: 'Your most powerful state chief wants to choose every candidate in his state himself. He delivers the votes there, and knows it.',
    options: ['Let him have his list', 'The list is the leader’s', 'Bring him to headquarters with a grand title'],
    results: [
      'He has his list, and the state machinery has never run better. Headquarters has never mattered less.',
      'He has gone quiet. His people have not.',
      'He now has an office, a title and a view. He is counting the days.',
    ],
  },
  forum: {
    title: 'A reform forum',
    body: 'A coalition of civil society groups invites every party leader to sign a public pledge on institutional reform, on stage, with cameras.',
    options: ['Go, and sign', 'Send regrets'],
    results: [
      'You signed. The cities approved; the establishment took note of your name.',
      'Your chair stayed empty on stage. They left it in shot.',
    ],
  },
  riders: {
    title: 'The riders’ strike',
    body: 'Delivery riders have switched off their apps over pay. Dinner is late across the country, and both sides want you to say something.',
    options: ['Stand with the riders', 'Stand with the customers and the small restaurants', 'Order in and say nothing'],
    results: [
      'You rode pillion at the rally. The riders will remember; so will the restaurant owners.',
      'Small businesses thanked you. The riders spat out your name.',
      'You said nothing, with dignity.',
    ],
  },
  settlers: {
    title: 'The settlers’ debts',
    body: 'Land-scheme settlers are drowning in debts to the agency that was set up to help them. Their association asks where you stand.',
    options: ['Promise to write the debts off', 'Call for an audit of the agency', 'Say it is complicated'],
    results: [
      'The settlers cheered. The economists asked who pays; you changed the subject.',
      'An audit sounds responsible. The settlers have heard it before.',
      'It is complicated. The settlers noticed that this did not help.',
    ],
  },
  podcast: {
    title: 'A podcast invitation',
    body: 'The country’s most popular podcast wants you for three unscripted hours. Careers have been made on that sofa, and ended there.',
    options: ['Go on, unscripted', 'Send your deputy', 'Decline politely'],
    results: [
      ['Three hours, no notes, no disasters. Clips of you being human are everywhere.', 'Somewhere in the third hour you said it. Everyone has seen the clip.'],
      'Your deputy did well. Perhaps a little too well.',
      'You declined. The hosts spent ten minutes on why.',
    ],
  },
  adviser: {
    title: 'A respected name offers to help',
    body: 'A retired senior civil servant, widely admired and never accused of anything, offers to join you as an adviser. Your old guard would rather he did not.',
    options: ['Welcome him aboard', 'Thank him and decline'],
    results: [
      'His name on your letterhead reassures the middle ground. The old guard sulks.',
      'The old guard is relieved. He has taken a call from another party.',
    ],
  },
  accountsLeak: {
    title: 'The donor list leaks',
    body: 'A spreadsheet of your donors is doing the rounds. It is accurate, which is the problem.',
    options: ['Publish the full accounts yourself', 'Refuse to comment on stolen documents', 'Blame the treasurer'],
    results: [
      'You opened the books. Some donors closed their wallets, but the public liked it.',
      'You did not comment. Everyone else did.',
      'The treasurer has resigned, loudly, with files.',
    ],
  },
  donorFavour: {
    title: 'A donor would like a word',
    body: 'One of your larger donors has a small matter: a licence, stuck in a ministry, that a friendly word could move. There would be gratitude.',
    options: ['Have the word', 'Decline, gently', 'Decline, and tell the press why'],
    results: [
      'The word was had. The gratitude arrived promptly, in a plain envelope.',
      'He understood. He is also returning fewer of your calls.',
      'You made a virtue of it in public. The donors’ dinner circuit has gone cold.',
    ],
  },
  donorLeak: {
    title: 'The licence comes out',
    body: 'A reporter has the story of the licence, the donor and your friendly word. She would like a comment before she publishes.',
    options: ['Deny everything', 'Admit it and return the money', 'Blame the treasurer'],
    results: [
      ['The denial held. She did not have the second source.', 'She had the second source. And the envelope.'],
      'You returned the money and took the hit. It was smaller than it might have been.',
      'The treasurer took the blame, and a great deal of the party’s goodwill with him.',
    ],
  },
  probe: {
    title: 'A visit from the anti-graft agency',
    body: 'Officers have asked, politely, for files on how certain government programmes came to be delivered through your party’s branches.',
    options: ['Co-operate and stop the practice', 'Offer up an official', 'Have a quiet word with the agency’s chief'],
    results: [
      'The files went over and the practice stopped. The story died within a week.',
      'An official has been charged. He does not intend to go quietly.',
      ['The file has been closed for lack of evidence.', 'The agency’s chief recorded the conversation.'],
    ],
  },
  firmWindfall: {
    title: 'The party’s firm has a good year',
    body: 'One of the party’s companies has made an unexpected profit. The directors ask what to do with it.',
    options: ['Take it as a dividend', 'Reinvest it'],
    results: ['The money is in the party account.', 'The firm is worth more than it was.'],
  },
  firmBust: {
    title: 'The party’s firm is in trouble',
    body: 'One of the party’s companies cannot pay its creditors. It can be rescued, at a price.',
    options: ['Bail it out', 'Let it fail'],
    results: ['The party paid. The firm lives to lose money another day.', 'The firm folded. The newspapers enjoyed the phrase “party-linked company”.'],
  },
  pricesGov: {
    title: 'Prices are rising',
    body: 'Chicken, eggs and cooking oil are all up. The opposition has discovered the price of everything, and the public expects the government to do something.',
    options: ['Emergency aid, paid for somehow', 'Explain global markets', 'Impose price controls'],
    results: [
      'The aid went out. The treasury will remember.',
      'Your explanation of global commodity markets was accurate and unpopular.',
      'Prices are fixed. So, shopkeepers point out, is the shortage.',
    ],
  },
  minister: {
    title: 'A minister in the headlines',
    body: 'One of your ministers has been photographed somewhere he should not be, with someone he should not know, holding something he cannot explain.',
    options: ['Sack him', 'Stand by him', 'Move him in a quiet reshuffle'],
    results: [
      'He is gone, and furious. The public approves.',
      'You stood by your man. The public did not.',
      'He is now minister for something smaller. Nobody is fooled, but nobody is angry.',
    ],
  },
  budget: {
    title: 'Budget day',
    body: 'The budget is tabled today. The plan is the one set out under “Next year’s budget” in the House tab; look it over first if you have not.',
    options: ['Table the budget as planned', 'Table last year’s budget again'],
    results: ['The budget is before the House.', 'A standstill budget is before the House.'],
  },
  budgetRevolt: {
    title: 'A revolt over the budget',
    body: 'Your partners have read the budget and found nothing in it for them. They say they cannot vote for it as it stands. If a budget falls, so does the government.',
    options: ['Find money for their constituencies', 'Put it to the House and dare them'],
    results: [
      'The partners found the revised budget most persuasive.',
      ['They voted for it, glaring.', 'They voted it down. A government that cannot pass its budget cannot govern.'],
    ],
  },
  motion: {
    title: 'A motion of no confidence',
    body: 'The opposition has tabled a motion of no confidence. The Speaker has set the vote for this week, and everyone is telephoning your partners.',
    options: ['Face the House', 'Shore up the partners first, whatever it costs'],
    results: ['The House divides.', 'The partners are reassured, expensively. The House divides.'],
  },
  downgrade: {
    title: 'The rating agencies call',
    body: 'The national debt has passed three-quarters of national income, and a rating agency has put the country on watch. Borrowing is about to cost more.',
    options: ['Announce a plan to bring the debt down', 'Say the agencies do not understand the country'],
    results: ['The plan was credible and painful, in that order.', 'The agencies were unmoved. So were the bond markets.'],
  },
  budgetAsk: {
    title: 'The budget is being drafted',
    body: 'The Finance Minister is writing the budget, and partners are expected to say what they want before it is too late to get it.',
    options: ['Ask for money for your heartlands', 'Back the budget without conditions', 'Threaten to vote against unless you get more'],
    results: [
      'You got an allocation, and a reputation for asking.',
      'Your loyalty was noted, and banked.',
      ['They gave way. Your constituencies do well out of this budget.', 'They called your bluff, and will not forget it.'],
    ],
  },
  downturnGov: {
    title: 'A global downturn',
    body: 'Export orders are falling and factories are cutting shifts. The slowdown started elsewhere, which will not matter to anyone who loses a job here.',
    options: ['Launch a stimulus package', 'Hold the line on spending'],
    results: ['The package softened the blow, and added to the debt.', 'You held the line. The line held; some jobs did not.'],
  },
  downturnOpp: {
    title: 'A global downturn',
    body: 'Export orders are falling and factories are cutting shifts. The slowdown started elsewhere, which will not matter to anyone who loses a job here.',
    options: ['Demand help for workers now', 'Offer the government your support for a rescue'],
    results: ['You spoke for the laid-off. The government looked slow.', 'You offered support. It was called statesmanlike, which is not the same as popular.'],
  },
  targeted: {
    title: 'The agency opens a file on you',
    body: 'The anti-graft agency has announced an investigation into your party’s accounts. The timing, your people say, is no coincidence.',
    options: ['Call it persecution and rally your supporters', 'Hand over everything, and say so', 'Keep your head down'],
    results: [
      ['Your supporters filled the streets. The investigation looks political now.', 'The rally was thin, and the cameras noticed.'],
      'You handed over the books. Nothing was found, slowly.',
      'You kept quiet. Quiet looked like guilt.',
    ],
  },
  walkoutThreat: {
    title: 'A partner threatens to walk',
    body: 'A coalition partner says it can no longer support the government unless things change. By things, it means cabinet posts.',
    options: ['Give them the posts', 'Call their bluff'],
    results: [
      'They have their posts, and your own ministers have less.',
      ['They blinked. They are staying, and quieter.', 'They were not bluffing.'],
    ],
  },
  plotWhispers: {
    title: 'Whispers of a plot',
    body: 'There is talk of late-night meetings in a hotel, of numbers being counted, and of statutory declarations being drafted. Nobody will say who by.',
    options: ['Reward the loyal with a reshuffle', 'Confront the plotters in public', 'Ignore it'],
    results: [
      'The loyal were rewarded. Those not rewarded have noted it.',
      ['Named and shamed, the plotters swore undying loyalty.', 'You named the wrong people. The right ones are still counting.'],
      'You ignored it. The whispers got louder.',
    ],
  },
  pricesOpp: {
    title: 'Prices are rising',
    body: 'Chicken, eggs and cooking oil are all up. The government is explaining global markets. This is the easiest week an opposition ever has.',
    options: ['Hammer the government every day', 'Publish a plan of your own', 'Let them suffer in silence'],
    results: [
      'You held up an egg at every press conference. It worked.',
      'Your plan was costed and credible. Three people read it; they were the right three.',
      'You said little. The prices spoke for themselves.',
    ],
  },
  shadowBudget: {
    title: 'The alternative budget',
    body: 'The government’s budget is next week. An opposition is expected to say what it would do instead.',
    options: ['Publish a fully costed alternative', 'Promise the moon', 'Criticise theirs and leave it there'],
    results: [
      'Your alternative budget added up. Commentators were surprised into praise.',
      'The moon was promised. Voters liked it; economists counted the zeroes.',
      'You criticised. That is, after all, the job.',
    ],
  },
  permit: {
    title: 'No permit for the rally',
    body: 'The police have refused a permit for your rally, citing traffic.',
    options: ['Hold it anyway', 'Move it indoors', 'Take the police to court'],
    results: [
      ['Thousands came. The police watched. The pictures were magnificent.', 'There were arrests, fines, and a great deal of footage of blocked roads.'],
      'The hall was full and the air-conditioning was not working. Morale survived, just.',
      'The court case will take two years. The point was made.',
    ],
  },
  hotelMeeting: {
    title: 'An invitation to a hotel',
    body: 'A senior figure on the government side would like to meet you, discreetly, at a hotel. He says he speaks for others, and that the numbers may be there.',
    options: ['Take the meeting', 'Decline: governments should fall at elections'],
    results: [
      'You met. Nothing was written down, and everything was understood.',
      'You declined. He looked relieved, then insulted.',
    ],
  },
  hotelNumbers: {
    title: 'The numbers',
    body: 'He is back, with a list. If every name on it holds, the government loses its majority tonight. If one of them is lying, you are the story.',
    options: ['Make the move', 'Walk away'],
    results: [
      ['The names held. By morning the government had lost its majority.', 'One of the names was lying. He had been sent to count yours.'],
      'You walked away. He has kept the list.',
    ],
  },
  fundGov: {
    title: 'Billions missing from the fund',
    body: 'A foreign newspaper reports that billions have gone missing from Dana Gemilang, the national investment fund. It names accounts, dates and a yacht.',
    options: ['Order an independent audit', 'Call it foreign interference'],
    results: [
      'The audit has begun. Several of your colleagues have stopped smiling.',
      'You blamed foreign jealousy. The newspaper printed the bank records.',
    ],
  },
  fundGovEnd: {
    title: 'The audit report lands',
    body: 'Whatever was said at the time, the facts about Dana Gemilang are now on paper. The money went where the newspaper said it went.',
    options: ['Publish it and let the courts act', 'Classify it'],
    results: [
      'The report is public and charges have followed. It hurt, and it was right.',
      ['The report is locked in a safe. So far, it has stayed there.', 'The report leaked within the week, along with the order to bury it.'],
    ],
  },
  fundOpp: {
    title: 'Billions missing from the fund',
    body: 'A foreign newspaper reports that billions have gone missing from Dana Gemilang, the national investment fund. It names accounts, dates and a yacht.',
    options: ['Demand a royal commission, loudly', 'Wait for the facts'],
    results: [
      'You have made the fund your cause. There is no going back on it now.',
      'You asked careful questions. They were the right ones, quietly.',
    ],
  },
  fundOppEnd: {
    title: 'The fund scandal breaks open',
    body: 'Documents, a whistleblower and a paper trail: what was rumour about Dana Gemilang is now fact, and the government has nowhere to hide.',
    options: ['Take it to the streets', 'Take it to the courts'],
    results: [
      'The rally filled the square. The government has never looked weaker.',
      'Your lawyers filed. It is slower, and it will stick.',
    ],
  },
  deputy: {
    title: 'Your deputy is restless',
    body: 'Your deputy has begun giving interviews about “the next generation of leadership”. He has not said whose generation, but he has had new photographs taken.',
    options: ['Name him your successor, in due course', 'Move him somewhere harmless', 'Pretend not to notice'],
    results: [
      'He is the anointed heir, and for now that is enough.',
      'He has been given a committee on the party’s constitution. He is reading it closely.',
      'You noticed nothing. He noticed that.',
    ],
  },
  assemblyFight: {
    title: 'A challenge at the party assembly',
    body: 'Your deputy will contest the presidency. The delegates are being counted, courted and, in some cases, driven to very good restaurants.',
    options: ['Fight it on the floor', 'Make sure of the delegates'],
    results: [
      ['You won handsomely. He conceded with a smile that did not reach his eyes.', 'You survived, narrowly. Half the hall did not stand for your speech.'],
      'The delegates were persuaded. It was not cheap, and people talk.',
    ],
  },
  assemblyCalm: {
    title: 'The party assembly',
    body: 'With the succession settled, the assembly is a coronation rehearsal. The only question is what you say about the young.',
    options: ['Give the usual speech', 'Promise to bring the next generation forward'],
    results: [
      'Three standing ovations, as scheduled.',
      'The young cheered. Several division chiefs counted the years they have left.',
    ],
  },
};

export const EVENTS_MS: Record<string, EventText> = {
  ultimatum: {
    title: 'Kata dua',
    body: 'Pemimpin sebuah parti rakan meminta berjumpa anda bersendirian, dan tidak duduk. Ahli-ahlinya resah, katanya, dan pihak lain sudah mula membuat tawaran. Keadaan mesti berubah, atau mereka akan mencari aturan lain.',
    options: ['Cari wang untuk kawasan mereka', 'Tunaikan permintaan mereka, dan hadapi parti sendiri', 'Suruh mereka buat apa yang mereka mahu'],
    results: [
      'Wang ditemui, dan keresahan itu reda. Buat masa ini.',
      'Mereka mendapat apa yang diminta. Parti anda sendiri perasan siapa yang tidak.',
      ['Mereka mengalah. Cakap-cakap mahu keluar terhenti petang itu juga.', 'Mereka buat apa yang mereka mahu.'],
    ],
  },
  flood: {
    title: 'Banjir musim tengkujuh',
    body: 'Pantai timur ditenggelami air sekali lagi. Ribuan orang berada di pusat pemindahan, dan setiap ahli politik di negara ini tiba-tiba jatuh cinta dengan but getah.',
    options: ['Ketuai misi bantuan dan tanggung kosnya', 'Terbang masuk, bergambar menyerahkan satu kotak, terbang keluar', 'Kekal di ibu kota'],
    results: [
      'Sukarelawan anda memasak, mencuci dan mengangkat barang selama dua minggu. Orang ramai perasan.',
      ['Gambarnya cantik, dan tiada siapa bertanya apa isi kotak itu.', 'Video anda didukung melintasi lopak air sudah mencecah dua juta tontonan.'],
      'Anda kekal kering. Begitu juga sokongan anda di pantai timur.',
    ],
  },
  oldVideo: {
    title: 'Video lama muncul semula',
    body: 'Seseorang menemui klip anda sepuluh tahun lalu yang mengatakan sebaliknya daripada semua yang anda percaya sekarang. Ia tersebar lebih pantas daripada anda sempat mengingat maksud asal anda.',
    options: ['Minta maaf dan katakan anda sudah matang', 'Tegaskan anda betul dahulu dan betul sekarang', 'Diam dan tunggu kemarahan orang beralih'],
    results: [
      'Permohonan maaf anda diterima oleh mereka yang memang tidak akan mengundi anda.',
      ['Keengganan anda berundur disukai mereka yang mengagumi kulit tebal.', 'Betul dua kali dalam dua arah bertentangan ternyata sukar dihujahkan.'],
      'Cerita itu hangat seminggu, kemudian diganti cerita orang lain.',
    ],
  },
  youthWing: {
    title: 'Sayap pemuda mahu bersuara',
    body: 'Sayap pemuda mengeluarkan kenyataan, sesuatu yang baharu, menuntut kerusi dalam majlis tertinggi dan satu pertiga calon di bawah umur empat puluh.',
    options: ['Beri mereka kerusi itu', 'Ingatkan mereka siapa yang membina parti ini'],
    results: [
      'Orang lama merungut di kedai teh tarik. Orang muda turun berkempen.',
      'Ketua pemuda meletak jawatan secara siaran langsung. Orang lama belum pernah segembira ini.',
    ],
  },
  byElection: {
    title: 'Pilihan raya kecil',
    body: 'Satu kerusi kosong. Satu kerusi jarang mengubah siapa memerintah, tetapi semua orang akan membaca keputusannya sebagai hukuman terhadap anda.',
    options: ['Kerah segala-galanya', 'Hantar calon dengan bajet kecil', 'Biar cawangan berjuang sendiri'],
    results: ['Parti mengerah segala-galanya.', 'Seorang calon dan bajet kecil.', 'Cawangan berjuang sendirian.'],
  },
  statePolls: {
    title: 'Negeri-negeri mengundi',
    body: 'Dewan undangan negeri dibubarkan. Sesiapa yang memenangi kerusi terbanyak di sesebuah negeri membentuk kerajaannya, dan kerajaan negeri bermakna wang, jawatan dan pentas selama lima tahun.',
    options: ['Bertarung habis-habisan di setiap negeri', 'Kempen sederhana', 'Serahkan kepada ketua negeri'],
    results: ['Seluruh parti turun ke negeri-negeri.', 'Kempen sederhana.', 'Ketua negeri berjuang sendirian.'],
  },
  influencer: {
    title: 'Pempengaruh menyebut harga',
    body: 'Seorang pempengaruh gaya hidup dengan tiga juta pengikut sanggup berkata yang baik-baik tentang anda. Ada senarai harganya.',
    options: ['Bayar harganya', 'Cabar dia menemu bual anda secara langsung', 'Tolak'],
    results: [
      'Hantaran itu sudah naik, dengan tanda #sponsored dalam huruf yang amat kecil.',
      ['Temu bual langsung itu berjalan lancar. Seketika, anda kelihatan seperti orang biasa.', 'Temu bual langsung itu kini menjadi meme, dan bukan jenis yang baik.'],
      'Wang dan maruah anda selamat. Kedua-duanya tidak tular.',
    ],
  },
  warlord: {
    title: 'Ketua negeri mahu senarai sendiri',
    body: 'Ketua negeri anda yang paling berkuasa mahu memilih sendiri setiap calon di negerinya. Dialah yang membawa undi di sana, dan dia tahu itu.',
    options: ['Biar dia dengan senarainya', 'Senarai calon hak pemimpin', 'Bawa dia ke ibu pejabat dengan gelaran besar'],
    results: [
      'Dia mendapat senarainya, dan jentera negeri belum pernah selancar ini. Ibu pejabat belum pernah sekecil ini.',
      'Dia mendiamkan diri. Orang-orangnya tidak.',
      'Kini dia ada pejabat, gelaran dan pemandangan. Dia sedang mengira hari.',
    ],
  },
  forum: {
    title: 'Forum reformasi',
    body: 'Gabungan pertubuhan masyarakat sivil menjemput setiap pemimpin parti menandatangani ikrar reformasi institusi, di atas pentas, di depan kamera.',
    options: ['Hadir dan tandatangan', 'Hantar ucapan maaf'],
    results: [
      'Anda menandatangani. Orang bandar bersetuju; golongan mapan mencatat nama anda.',
      'Kerusi anda kosong di atas pentas. Mereka sengaja membiarkannya dalam bingkai kamera.',
    ],
  },
  riders: {
    title: 'Mogok penghantar makanan',
    body: 'Penghantar makanan mematikan aplikasi kerana upah. Makan malam lewat di seluruh negara, dan kedua-dua pihak mahu anda bersuara.',
    options: ['Berdiri bersama penghantar', 'Berdiri bersama pelanggan dan restoran kecil', 'Pesan makanan dan diam'],
    results: [
      'Anda membonceng motosikal ke perhimpunan itu. Penghantar akan ingat; pemilik restoran juga.',
      'Peniaga kecil berterima kasih. Penghantar menyumpah nama anda.',
      'Anda diam, dengan penuh maruah.',
    ],
  },
  settlers: {
    title: 'Hutang peneroka',
    body: 'Peneroka rancangan tanah tenggelam dalam hutang kepada agensi yang ditubuhkan untuk membantu mereka. Persatuan mereka bertanya pendirian anda.',
    options: ['Janji hapuskan hutang itu', 'Tuntut audit ke atas agensi', 'Katakan ia rumit'],
    results: [
      'Peneroka bersorak. Pakar ekonomi bertanya siapa yang membayar; anda menukar topik.',
      'Audit kedengaran bertanggungjawab. Peneroka sudah pernah mendengarnya.',
      'Memang rumit. Peneroka perasan itu tidak membantu.',
    ],
  },
  podcast: {
    title: 'Jemputan podcast',
    body: 'Podcast paling popular di negara ini mahukan anda selama tiga jam tanpa skrip. Ada kerjaya yang lahir di sofa itu, dan ada yang berkubur di situ.',
    options: ['Hadir, tanpa skrip', 'Hantar timbalan anda', 'Tolak dengan sopan'],
    results: [
      ['Tiga jam, tanpa nota, tanpa bencana. Klip anda sebagai manusia biasa ada di mana-mana.', 'Entah pada jam ketiga, anda terlepas cakap. Semua orang sudah menonton klipnya.'],
      'Timbalan anda beraksi dengan baik. Barangkali terlalu baik.',
      'Anda menolak. Hos menghabiskan sepuluh minit membincangkan sebabnya.',
    ],
  },
  adviser: {
    title: 'Nama yang dihormati menawarkan bantuan',
    body: 'Seorang bekas pegawai kanan kerajaan, dikagumi ramai dan tidak pernah dituduh apa-apa, menawarkan diri menjadi penasihat anda. Orang lama parti lebih suka jika tidak.',
    options: ['Alu-alukan beliau', 'Ucap terima kasih dan tolak'],
    results: [
      'Namanya pada kepala surat anda meyakinkan golongan pertengahan. Orang lama merajuk.',
      'Orang lama lega. Beliau sudah menerima panggilan daripada parti lain.',
    ],
  },
  accountsLeak: {
    title: 'Senarai penderma bocor',
    body: 'Satu hamparan senarai penderma anda sedang tersebar. Ia tepat, dan itulah masalahnya.',
    options: ['Terbitkan sendiri akaun penuh', 'Enggan mengulas dokumen curi', 'Salahkan bendahari'],
    results: [
      'Anda membuka buku akaun. Sesetengah penderma menutup dompet, tetapi rakyat menyukainya.',
      'Anda tidak mengulas. Semua orang lain mengulas.',
      'Bendahari meletak jawatan, dengan lantang, bersama fail-failnya.',
    ],
  },
  donorFavour: {
    title: 'Seorang penderma ada hajat',
    body: 'Salah seorang penderma besar anda ada perkara kecil: satu lesen, tersangkut di kementerian, yang boleh bergerak dengan sepatah kata mesra. Tentu ada tanda terima kasih.',
    options: ['Sampaikan kata itu', 'Tolak dengan lembut', 'Tolak, dan beritahu media sebabnya'],
    results: [
      'Kata itu disampaikan. Tanda terima kasih tiba segera, dalam sampul polos.',
      'Dia faham. Dia juga semakin jarang menjawab panggilan anda.',
      'Anda menjadikannya modal politik. Majlis makan malam penderma kini dingin.',
    ],
  },
  donorLeak: {
    title: 'Kisah lesen terbongkar',
    body: 'Seorang wartawan memegang kisah lesen, penderma dan kata mesra anda. Dia mahu ulasan sebelum menerbitkannya.',
    options: ['Nafikan semuanya', 'Mengaku dan pulangkan wang', 'Salahkan bendahari'],
    results: [
      ['Penafian itu bertahan. Dia tiada sumber kedua.', 'Dia ada sumber kedua. Dan sampul itu.'],
      'Anda memulangkan wang dan menanggung akibatnya. Ia lebih ringan daripada yang mungkin berlaku.',
      'Bendahari menanggung salah, dan membawa bersama banyak muhibah parti.',
    ],
  },
  probe: {
    title: 'Lawatan agensi antirasuah',
    body: 'Pegawai meminta, dengan sopan, fail tentang bagaimana beberapa program kerajaan disalurkan melalui cawangan parti anda.',
    options: ['Beri kerjasama dan hentikan amalan itu', 'Korbankan seorang pegawai', 'Bercakap secara senyap dengan ketua agensi'],
    results: [
      'Fail diserahkan dan amalan itu dihentikan. Ceritanya reda dalam seminggu.',
      'Seorang pegawai didakwa. Dia tidak berhasrat jatuh sendirian.',
      ['Fail itu ditutup kerana kekurangan bukti.', 'Ketua agensi merakam perbualan itu.'],
    ],
  },
  firmWindfall: {
    title: 'Syarikat parti untung besar',
    body: 'Salah sebuah syarikat parti mencatat keuntungan di luar jangkaan. Para pengarah bertanya apa yang patut dibuat.',
    options: ['Ambil sebagai dividen', 'Laburkan semula'],
    results: ['Wang itu sudah masuk ke akaun parti.', 'Nilai syarikat itu kini lebih tinggi.'],
  },
  firmBust: {
    title: 'Syarikat parti dalam kesusahan',
    body: 'Salah sebuah syarikat parti tidak mampu membayar pemiutang. Ia boleh diselamatkan, dengan harga tertentu.',
    options: ['Selamatkan', 'Biar ia tumbang'],
    results: ['Parti membayar. Syarikat itu hidup untuk rugi sehari lagi.', 'Syarikat itu gulung tikar. Akhbar seronok dengan frasa “syarikat berkaitan parti”.'],
  },
  pricesGov: {
    title: 'Harga barang naik',
    body: 'Ayam, telur dan minyak masak semuanya naik. Pembangkang tiba-tiba tahu harga segala-galanya, dan rakyat menunggu kerajaan bertindak.',
    options: ['Bantuan kecemasan, entah dari mana wangnya', 'Terangkan tentang pasaran global', 'Kenakan kawalan harga'],
    results: [
      'Bantuan disalurkan. Perbendaharaan tidak akan lupa.',
      'Penjelasan anda tentang pasaran komoditi global tepat dan tidak popular.',
      'Harga ditetapkan. Begitu juga, kata peniaga, kekurangan bekalan.',
    ],
  },
  minister: {
    title: 'Seorang menteri jadi tajuk berita',
    body: 'Salah seorang menteri anda dirakam di tempat yang tidak sepatutnya, bersama orang yang tidak sepatutnya dikenalinya, memegang sesuatu yang tidak dapat dijelaskannya.',
    options: ['Pecat dia', 'Pertahankan dia', 'Pindahkan dia dalam rombakan senyap'],
    results: [
      'Dia sudah pergi, dalam keadaan berang. Rakyat bersetuju.',
      'Anda mempertahankan orang anda. Rakyat tidak.',
      'Kini dia menteri bagi sesuatu yang lebih kecil. Tiada siapa terpedaya, tetapi tiada siapa marah.',
    ],
  },
  budget: {
    title: 'Hari belanjawan',
    body: 'Belanjawan dibentang hari ini. Pelannya seperti yang ditetapkan di bawah “Belanjawan tahun depan” dalam tab Dewan; semak dahulu jika belum.',
    options: ['Bentang belanjawan seperti dirancang', 'Bentang semula belanjawan tahun lalu'],
    results: ['Belanjawan kini di hadapan Dewan.', 'Belanjawan tanpa perubahan kini di hadapan Dewan.'],
  },
  budgetRevolt: {
    title: 'Pemberontakan belanjawan',
    body: 'Rakan gabungan sudah membaca belanjawan dan tidak menemui apa-apa untuk mereka. Kata mereka, mereka tidak dapat menyokongnya. Jika belanjawan tumbang, kerajaan turut tumbang.',
    options: ['Cari wang untuk kawasan mereka', 'Bawa ke Dewan dan cabar mereka'],
    results: [
      'Rakan gabungan mendapati belanjawan yang dipinda itu amat meyakinkan.',
      ['Mereka menyokongnya, sambil menjeling.', 'Mereka menolaknya. Kerajaan yang gagal meluluskan belanjawan tidak boleh memerintah.'],
    ],
  },
  motion: {
    title: 'Usul undi tidak percaya',
    body: 'Pembangkang membentangkan usul undi tidak percaya. Yang di-Pertua Dewan menetapkan undian minggu ini, dan semua orang sedang menelefon rakan gabungan anda.',
    options: ['Hadapi Dewan', 'Kukuhkan rakan gabungan dahulu, berapa pun kosnya'],
    results: ['Dewan mengundi.', 'Rakan gabungan diyakinkan, dengan harga yang mahal. Dewan mengundi.'],
  },
  downgrade: {
    title: 'Agensi penarafan menelefon',
    body: 'Hutang negara melepasi tiga perempat pendapatan negara, dan sebuah agensi penarafan meletakkan negara dalam pemerhatian. Kos pinjaman bakal naik.',
    options: ['Umumkan pelan mengurangkan hutang', 'Katakan agensi itu tidak memahami negara ini'],
    results: ['Pelan itu meyakinkan dan memeritkan, mengikut turutan itu.', 'Agensi itu tidak berganjak. Begitu juga pasaran bon.'],
  },
  budgetAsk: {
    title: 'Belanjawan sedang didraf',
    body: 'Menteri Kewangan sedang menulis belanjawan, dan rakan gabungan dijangka menyatakan kehendak mereka sebelum terlambat.',
    options: ['Minta peruntukan untuk kawasan kuat anda', 'Sokong belanjawan tanpa syarat', 'Ugut membantah melainkan mendapat lebih'],
    results: [
      'Anda mendapat peruntukan, dan reputasi sebagai peminta.',
      'Kesetiaan anda dicatat, dan disimpan.',
      ['Mereka mengalah. Kawasan anda beruntung dalam belanjawan ini.', 'Mereka mencabar gertakan anda, dan tidak akan melupakannya.'],
    ],
  },
  downturnGov: {
    title: 'Kemelesetan global',
    body: 'Pesanan eksport merosot dan kilang mengurangkan syif. Kelembapan ini bermula di tempat lain, tetapi itu tidak penting bagi sesiapa yang hilang pekerjaan di sini.',
    options: ['Lancarkan pakej rangsangan', 'Kekalkan perbelanjaan'],
    results: ['Pakej itu melegakan tekanan, dan menambah hutang.', 'Anda bertahan. Pendirian itu kekal; sesetengah pekerjaan tidak.'],
  },
  downturnOpp: {
    title: 'Kemelesetan global',
    body: 'Pesanan eksport merosot dan kilang mengurangkan syif. Kelembapan ini bermula di tempat lain, tetapi itu tidak penting bagi sesiapa yang hilang pekerjaan di sini.',
    options: ['Tuntut bantuan untuk pekerja sekarang', 'Tawarkan sokongan kepada kerajaan untuk pelan penyelamat'],
    results: ['Anda bersuara bagi pihak yang diberhentikan. Kerajaan kelihatan lembap.', 'Anda menawarkan sokongan. Ia disifatkan berjiwa negarawan, yang tidak sama dengan popular.'],
  },
  targeted: {
    title: 'Agensi membuka kertas siasatan ke atas anda',
    body: 'Agensi antirasuah mengumumkan siasatan ke atas akaun parti anda. Masanya, kata orang anda, bukan kebetulan.',
    options: ['Sifatkan ia penganiayaan dan kerah penyokong', 'Serahkan segala-galanya, dan umumkan', 'Diamkan diri'],
    results: [
      ['Penyokong anda memenuhi jalan. Siasatan itu kini kelihatan bermotif politik.', 'Himpunan itu lengang, dan kamera perasan.'],
      'Anda menyerahkan buku akaun. Tiada apa ditemui, perlahan-lahan.',
      'Anda berdiam. Diam kelihatan seperti bersalah.',
    ],
  },
  walkoutThreat: {
    title: 'Rakan gabungan ugut keluar',
    body: 'Satu rakan gabungan berkata ia tidak lagi dapat menyokong kerajaan melainkan keadaan berubah. Maksudnya: jawatan Kabinet.',
    options: ['Beri mereka jawatan itu', 'Cabar gertakan mereka'],
    results: [
      'Mereka mendapat jawatan, dan menteri anda sendiri berkurangan.',
      ['Mereka mengalah. Mereka kekal, dan lebih senyap.', 'Mereka tidak menggertak.'],
    ],
  },
  plotWhispers: {
    title: 'Bisik-bisik komplot',
    body: 'Ada cerita tentang pertemuan lewat malam di sebuah hotel, angka yang sedang dikira, dan akuan bersumpah yang sedang didraf. Tiada siapa mahu menyebut siapa dalangnya.',
    options: ['Ganjari yang setia dengan rombakan', 'Bersemuka dengan dalang secara terbuka', 'Abaikan'],
    results: [
      'Yang setia diganjari. Yang tidak diganjari sudah mencatatnya.',
      ['Setelah didedahkan, para dalang bersumpah taat setia tidak berbelah bahagi.', 'Anda menamakan orang yang salah. Orang yang betul masih mengira.'],
      'Anda mengabaikannya. Bisikan itu semakin kuat.',
    ],
  },
  pricesOpp: {
    title: 'Harga barang naik',
    body: 'Ayam, telur dan minyak masak semuanya naik. Kerajaan sibuk menerangkan pasaran global. Inilah minggu paling mudah bagi mana-mana pembangkang.',
    options: ['Belasah kerajaan setiap hari', 'Terbitkan pelan anda sendiri', 'Biar mereka terseksa sendiri'],
    results: [
      'Anda mengangkat sebiji telur pada setiap sidang media. Ia berkesan.',
      'Pelan anda berkos dan meyakinkan. Tiga orang membacanya; tiga orang yang tepat.',
      'Anda tidak banyak bercakap. Harga barang bercakap sendiri.',
    ],
  },
  shadowBudget: {
    title: 'Belanjawan alternatif',
    body: 'Belanjawan kerajaan dibentang minggu depan. Pembangkang dijangka menyatakan apa yang akan dibuatnya.',
    options: ['Terbitkan alternatif berkos penuh', 'Janjikan bulan dan bintang', 'Kritik sahaja dan berhenti di situ'],
    results: [
      'Belanjawan alternatif anda seimbang. Pengulas terkejut sampai terpuji.',
      'Bulan dan bintang dijanjikan. Pengundi suka; pakar ekonomi mengira sifarnya.',
      'Anda mengkritik. Itulah, bagaimanapun, tugasnya.',
    ],
  },
  permit: {
    title: 'Permit himpunan ditolak',
    body: 'Polis menolak permit himpunan anda, atas alasan lalu lintas.',
    options: ['Teruskan juga', 'Pindah ke dalam dewan', 'Saman polis di mahkamah'],
    results: [
      ['Ribuan hadir. Polis memerhati. Gambarnya sungguh hebat.', 'Ada tangkapan, denda, dan banyak rakaman jalan yang sesak.'],
      'Dewan penuh dan pendingin hawa rosak. Semangat bertahan, itu pun nyaris.',
      'Kes mahkamah akan mengambil dua tahun. Mesejnya sudah sampai.',
    ],
  },
  hotelMeeting: {
    title: 'Jemputan ke sebuah hotel',
    body: 'Seorang tokoh kanan di pihak kerajaan mahu bertemu anda, secara senyap, di sebuah hotel. Katanya dia mewakili beberapa orang lain, dan angkanya mungkin cukup.',
    options: ['Hadiri pertemuan itu', 'Tolak: kerajaan patut jatuh melalui pilihan raya'],
    results: [
      'Anda bertemu. Tiada apa yang ditulis, dan semuanya difahami.',
      'Anda menolak. Dia kelihatan lega, kemudian tersinggung.',
    ],
  },
  hotelNumbers: {
    title: 'Angka',
    body: 'Dia datang lagi, dengan senarai. Jika setiap nama bertahan, kerajaan hilang majoriti malam ini. Jika seorang berbohong, andalah ceritanya.',
    options: ['Lancarkan langkah itu', 'Tarik diri'],
    results: [
      ['Semua nama bertahan. Menjelang pagi, kerajaan sudah hilang majoriti.', 'Salah satu nama berbohong. Dia dihantar untuk mengira angka anda.'],
      'Anda menarik diri. Dia menyimpan senarai itu.',
    ],
  },
  fundGov: {
    title: 'Berbilion hilang daripada dana',
    body: 'Sebuah akhbar asing melaporkan berbilion ringgit hilang daripada Dana Gemilang, dana pelaburan negara. Ia menyebut akaun, tarikh dan sebuah kapal layar mewah.',
    options: ['Arahkan audit bebas', 'Sifatkan ia campur tangan asing'],
    results: [
      'Audit sudah bermula. Beberapa rakan sejawat anda sudah berhenti tersenyum.',
      'Anda menyalahkan hasad dengki pihak asing. Akhbar itu menyiarkan rekod banknya.',
    ],
  },
  fundGovEnd: {
    title: 'Laporan audit tiba',
    body: 'Apa pun yang dikatakan dahulu, fakta tentang Dana Gemilang kini hitam putih. Wang itu pergi ke tempat yang disebut akhbar tersebut.',
    options: ['Terbitkan dan biar mahkamah bertindak', 'Rahsiakan'],
    results: [
      'Laporan itu diumumkan dan pertuduhan menyusul. Ia perit, dan ia betul.',
      ['Laporan itu dikunci dalam peti besi. Setakat ini, ia kekal di situ.', 'Laporan itu bocor dalam seminggu, bersama arahan untuk memendamnya.'],
    ],
  },
  fundOpp: {
    title: 'Berbilion hilang daripada dana',
    body: 'Sebuah akhbar asing melaporkan berbilion ringgit hilang daripada Dana Gemilang, dana pelaburan negara. Ia menyebut akaun, tarikh dan sebuah kapal layar mewah.',
    options: ['Tuntut suruhanjaya siasatan diraja, dengan lantang', 'Tunggu fakta'],
    results: [
      'Anda menjadikan dana itu perjuangan anda. Tiada jalan berpatah balik.',
      'Anda bertanya soalan yang cermat. Soalan yang tepat, dengan tenang.',
    ],
  },
  fundOppEnd: {
    title: 'Skandal dana terbongkar',
    body: 'Dokumen, pemberi maklumat dan jejak kertas: khabar angin tentang Dana Gemilang kini menjadi fakta, dan kerajaan tiada tempat bersembunyi.',
    options: ['Bawa ke jalanan', 'Bawa ke mahkamah'],
    results: [
      'Himpunan memenuhi dataran. Kerajaan belum pernah kelihatan selemah ini.',
      'Peguam anda memfailkan saman. Ia lebih perlahan, dan ia akan melekat.',
    ],
  },
  deputy: {
    title: 'Timbalan anda resah',
    body: 'Timbalan anda mula memberi temu bual tentang “kepimpinan generasi akan datang”. Dia tidak menyebut generasi siapa, tetapi dia sudah mengambil gambar potret baharu.',
    options: ['Namakan dia pengganti, apabila tiba masanya', 'Pindahkan dia ke tempat yang tidak berbahaya', 'Buat-buat tidak perasan'],
    results: [
      'Dia kini pewaris yang direstui, dan buat masa ini itu memadai.',
      'Dia diberi jawatankuasa perlembagaan parti. Dia sedang membacanya dengan teliti.',
      'Anda tidak perasan apa-apa. Dia perasan itu.',
    ],
  },
  assemblyFight: {
    title: 'Cabaran di perhimpunan agung',
    body: 'Timbalan anda akan bertanding jawatan presiden. Perwakilan sedang dikira, dipujuk dan, bagi sesetengahnya, dibawa ke restoran yang sangat baik.',
    options: ['Lawan di lantai perhimpunan', 'Pastikan sokongan perwakilan'],
    results: [
      ['Anda menang bergaya. Dia mengaku kalah dengan senyuman yang tidak sampai ke mata.', 'Anda selamat, nyaris-nyaris. Separuh dewan tidak berdiri untuk ucapan anda.'],
      'Perwakilan berjaya diyakinkan. Ia tidak murah, dan orang bercakap.',
    ],
  },
  assemblyCalm: {
    title: 'Perhimpunan agung parti',
    body: 'Dengan soal pengganti selesai, perhimpunan ini ibarat raptai pertabalan. Persoalannya hanya apa yang anda katakan tentang orang muda.',
    options: ['Beri ucapan seperti biasa', 'Janji mengetengahkan generasi baharu'],
    results: [
      'Tiga kali tepukan berdiri, seperti dijadualkan.',
      'Orang muda bersorak. Beberapa ketua bahagian mengira baki tahun mereka.',
    ],
  },
};

// The second batch of events is written in its own file and joins the first here.
Object.assign(EVENTS_EN, MORE_EVENTS_EN);
Object.assign(EVENTS_MS, MORE_EVENTS_MS);
Object.assign(EVENTS_EN, GOVERNING_EVENTS_EN);
Object.assign(EVENTS_MS, GOVERNING_EVENTS_MS);

/** Spreads the event text into the flat keys the interface looks up. */
export function flattenEvents(texts: Record<string, EventText>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [id, e] of Object.entries(texts)) {
    out[`event.${id}.title`] = e.title;
    out[`event.${id}.body`] = e.body;
    e.options.forEach((o, i) => { out[`event.${id}.o${i}`] = o; });
    e.results.forEach((r, i) => {
      if (typeof r === 'string') out[`event.${id}.r${i}`] = r;
      else { out[`event.${id}.r${i}w`] = r[0]; out[`event.${id}.r${i}l`] = r[1]; }
    });
  }
  return out;
}
