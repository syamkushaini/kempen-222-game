// The words for everything that happens between elections, in English and
// Bahasa Malaysia. The rules for each event are in src/sim/campaign/events.ts;
// the ids, the number of choices, and which choices are gambles must match.
// All people, parties and institutions here are invented.

import { MORE_EVENTS_EN, MORE_EVENTS_MS } from './events2';
import { GOVERNING_EVENTS_EN, GOVERNING_EVENTS_MS } from './events3';
import { STORY_EVENTS_EN, STORY_EVENTS_MS } from './events4';
import { SEASON_EVENTS_EN, SEASON_EVENTS_MS } from './events5';
import { FEDERATION_EVENTS_EN, FEDERATION_EVENTS_MS } from './events6';
import { STORY_EVENTS_2_EN, STORY_EVENTS_2_MS } from './events7';
import { NEW_EVENTS_EN, NEW_EVENTS_MS } from './events8';
import { NEW_EVENTS_2_EN, NEW_EVENTS_2_MS } from './events9';
import { PM_EVENTS_EN, PM_EVENTS_MS } from './events10';
import { PARTNER_EVENTS_EN, PARTNER_EVENTS_MS } from './events11';
import { LEAD_EVENTS_EN, LEAD_EVENTS_MS } from './events12';
import { LEAD_EVENTS_2_EN, LEAD_EVENTS_2_MS } from './events13';
import { OPP_EVENTS_EN, OPP_EVENTS_MS } from './events14';
import { DESK_EVENTS_EN, DESK_EVENTS_MS } from './events15';
import { DEBT_EVENTS_EN, DEBT_EVENTS_MS } from './events16';
import { SHOCK_EVENTS_EN, SHOCK_EVENTS_MS } from './events17';
import { FOLLOW_EVENTS_EN, FOLLOW_EVENTS_MS } from './events18';
import { STATE_STORIES_EN, STATE_STORIES_MS } from './events19';
import { KEDAH_STORIES_EN, KEDAH_STORIES_MS } from './events20';
import { SELANGOR_STORIES_EN, SELANGOR_STORIES_MS } from './events21';
import { FORCES_AND_PESTEL_EN, FORCES_AND_PESTEL_MS } from './events22';
import { SARAWAK_STORIES_EN, SARAWAK_STORIES_MS } from './events23';
import { VIRAL_EVENTS_EN, VIRAL_EVENTS_MS } from './events24';
import { GRAFT_EVENTS_EN, GRAFT_EVENTS_MS } from './graft';
import { CRISIS_EVENTS_EN, CRISIS_EVENTS_MS } from './events25';
import { OPENING_STORIES_EN, OPENING_STORIES_MS } from './events27';
import { PARTY_OPENING_EN, PARTY_OPENING_MS } from './events28';
import { POWER_EN, POWER_MS } from './events29';
import { PENANG_STORIES_EN, PENANG_STORIES_MS, PERLIS_STORIES_EN, PERLIS_STORIES_MS } from './events26';
import { MELAKA_STORIES_EN, MELAKA_STORIES_MS } from './events30';

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
    body: 'The budget is tabled today. The plan is the one set out under “Next year’s budget” in the Parliament tab; look it over first if you have not.',
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
    title: 'Ultimatum',
    body: 'Pemimpin parti rakan minta jumpa anda berdua saja. Dia tak duduk pun. Ahli-ahli dia dah resah, katanya, dan ada pihak lain yang mula tawar macam-macam. Kalau tak ada perubahan, mereka akan cari jalan lain.',
    options: ['Cari duit untuk kawasan mereka', 'Bagi apa yang mereka minta, lepas tu hadap parti sendiri', 'Suruh mereka buat apa yang mereka nak'],
    results: [
      'Duit dah dapat, hati pun reda. Buat masa ni.',
      'Mereka dapat apa yang diminta. Parti anda sendiri pula perasan siapa yang tak dapat.',
      ['Mereka mengalah. Cakap nak keluar terhenti petang tu juga.', 'Mereka buat betul-betul.'],
    ],
  },
  flood: {
    title: 'Banjir tengkujuh',
    body: 'Pantai timur kena banjir lagi. Beribu orang di pusat pemindahan, dan semua ahli politik tiba-tiba jatuh cinta dengan but getah.',
    options: ['Ketuai misi bantuan dan tanggung sendiri kosnya', 'Terbang masuk, bergambar hulur sekotak bantuan, terbang balik', 'Duduk saja di ibu kota'],
    results: [
      'Sukarelawan anda masak, kemas dan angkat barang dua minggu. Orang nampak.',
      ['Gambar cantik, dan tak ada siapa tanya apa dalam kotak tu.', 'Video anda kena dukung melintasi lopak dah cecah dua juta tontonan.'],
      'Anda kering. Sokongan di pantai timur pun kering.',
    ],
  },
  oldVideo: {
    title: 'Video lama naik balik',
    body: 'Ada orang jumpa klip anda sepuluh tahun lepas, cakap benda yang bertentangan dengan semua yang anda percaya sekarang. Ia tersebar lebih laju daripada anda boleh ingat apa yang anda maksudkan dulu.',
    options: ['Minta maaf dan kata anda dah matang', 'Tegaskan anda betul dulu, betul sekarang', 'Diam dan tunggu kontroversi lain'],
    results: [
      'Maaf anda diterima oleh orang yang memang tak akan undi anda pun.',
      ['Anda tak berganjak, dan mereka yang suka orang tebal kulit memang suka.', 'Betul dua kali ke arah bertentangan, memang susah nak dihujahkan.'],
      'Cerita tu hangat seminggu, lepas tu diganti cerita orang lain.',
    ],
  },
  youthWing: {
    title: 'Sayap pemuda nak bersuara',
    body: 'Sayap pemuda keluarkan kenyataan, benda baharu, menuntut kerusi dalam majlis tertinggi dan satu pertiga calon bawah umur empat puluh.',
    options: ['Bagi kerusi tu', 'Ingatkan mereka siapa yang bina parti ni'],
    results: [
      'Orang lama merungut sambil minum teh tarik. Orang muda turun berkempen.',
      'Ketua pemuda letak jawatan siaran langsung. Orang lama tak pernah segembira ini.',
    ],
  },
  byElection: {
    title: 'Pilihan raya kecil',
    body: 'Satu kerusi kosong. Satu kerusi jarang ubah siapa yang memerintah, tapi semua orang akan baca keputusannya sebagai penilaian terhadap anda.',
    options: ['Kerah segala-galanya', 'Hantar calon dengan bajet kecil', 'Serahkan pada cawangan tempatan'],
    results: ['Parti kerah segala-galanya.', 'Seorang calon dengan bajet kecil.', 'Cawangan berjuang sendirian.'],
  },
  statePolls: {
    title: 'Negeri-negeri turun mengundi',
    body: 'Dewan undangan negeri dibubarkan. Siapa menang kerusi terbanyak di sesebuah negeri, dia bentuk kerajaannya, dan kerajaan negeri bermakna duit, jawatan dan pentas selama lima tahun.',
    options: ['Bertarung habis-habisan di setiap negeri', 'Kempen sederhana', 'Serahkan pada ketua negeri'],
    results: ['Seluruh parti turun ke negeri-negeri.', 'Kempen sederhana.', 'Ketua negeri berjuang sendirian.'],
  },
  influencer: {
    title: 'Influencer sebut harga',
    body: 'Seorang influencer gaya hidup dengan tiga juta pengikut sanggup cakap baik-baik pasal anda. Ada rate card.',
    options: ['Bayar harga tu', 'Cabar dia temu bual anda secara langsung', 'Tolak'],
    results: [
      'Post naik, dengan tanda #sponsored dalam huruf yang sangat kecil.',
      ['Temu bual langsung berjalan lancar. Sekejap, anda nampak macam orang biasa.', 'Temu bual langsung tu dah jadi meme, dan bukan jenis yang best.'],
      'Duit dan maruah anda selamat. Dua-dua tak trending.',
    ],
  },
  warlord: {
    title: 'Ketua negeri nak senarai sendiri',
    body: 'Ketua negeri paling berkuasa dalam parti anda nak pilih sendiri semua calon di negerinya. Dia yang bawa undi di sana, dan dia tahu.',
    options: ['Biar dia dengan senarai dia', 'Senarai calon hak pemimpin', 'Bawa dia ke ibu pejabat dengan gelaran besar'],
    results: [
      'Dia dapat senarai dia, dan jentera negeri tak pernah selancar ini. Ibu pejabat pula tak pernah sekecil ini.',
      'Dia senyap. Orang-orang dia tidak.',
      'Sekarang dia ada pejabat, gelaran dan pemandangan. Dia tengah kira hari.',
    ],
  },
  forum: {
    title: 'Forum reformasi',
    body: 'Gabungan kumpulan masyarakat sivil jemput setiap pemimpin parti tandatangani ikrar reformasi institusi, atas pentas, depan kamera.',
    options: ['Pergi dan tandatangan', 'Hantar ucapan maaf'],
    results: [
      'Anda tandatangan. Orang bandar setuju; golongan mapan catat nama anda.',
      'Kerusi anda kosong atas pentas. Mereka sengaja biar ia dalam gambar.',
    ],
  },
  riders: {
    title: 'Rider mogok',
    body: 'Rider penghantar makanan matikan app sebab upah. Makan malam lambat di seluruh negara, dan dua-dua pihak nak anda bersuara.',
    options: ['Berdiri bersama rider', 'Berdiri bersama pelanggan dan restoran kecil', 'Order makanan dan diam'],
    results: [
      'Anda membonceng motor ke perhimpunan. Rider akan ingat; tauke restoran pun sama.',
      'Peniaga kecil berterima kasih. Rider maki nama anda.',
      'Anda diam, penuh maruah.',
    ],
  },
  settlers: {
    title: 'Hutang peneroka',
    body: 'Peneroka rancangan tanah lemlas dengan hutang kepada agensi yang ditubuhkan untuk membantu mereka. Persatuan mereka tanya di mana pendirian anda.',
    options: ['Janji hapuskan hutang tu', 'Tuntut audit ke atas agensi', 'Kata ia rumit'],
    results: [
      'Peneroka bersorak. Pakar ekonomi tanya siapa nak bayar; anda tukar topik.',
      'Audit bunyi bertanggungjawab. Peneroka dah selalu dengar.',
      'Memang rumit. Peneroka perasan ia tak membantu pun.',
    ],
  },
  podcast: {
    title: 'Jemputan podcast',
    body: 'Podcast paling popular di negara ni nak anda tiga jam tanpa skrip. Ada kerjaya yang naik atas sofa tu, ada juga yang tamat di situ.',
    options: ['Pergi, tanpa skrip', 'Hantar timbalan anda', 'Tolak dengan sopan'],
    results: [
      ['Tiga jam, tanpa nota, tanpa bencana. Klip anda jadi manusia biasa ada merata.', 'Entah bila dalam jam ketiga, anda terlepas cakap. Semua orang dah tengok klipnya.'],
      'Timbalan anda tampil bagus. Mungkin terlalu bagus.',
      'Anda tolak. Hos habiskan sepuluh minit bincang kenapa.',
    ],
  },
  adviser: {
    title: 'Nama yang dihormati tawar bantuan',
    body: 'Seorang bekas pegawai kanan kerajaan, dikagumi ramai dan tak pernah dituduh apa-apa, tawar diri jadi penasihat anda. Orang lama parti lebih suka kalau tidak.',
    options: ['Sambut dia dengan tangan terbuka', 'Ucap terima kasih dan tolak'],
    results: [
      'Nama dia atas kepala surat anda menenangkan golongan pertengahan. Orang lama merajuk.',
      'Orang lama lega. Dia dah terima panggilan daripada parti lain.',
    ],
  },
  accountsLeak: {
    title: 'Senarai penderma bocor',
    body: 'Spreadsheet senarai penderma anda sedang tersebar. Ia tepat, dan itulah masalahnya.',
    options: ['Terbitkan sendiri akaun penuh', 'Enggan ulas dokumen curi', 'Salahkan bendahari'],
    results: [
      'Anda buka buku akaun. Ada penderma tutup dompet, tapi rakyat suka.',
      'Anda tak ulas. Semua orang lain ulas.',
      'Bendahari letak jawatan, kuat-kuat, bawa fail sekali.',
    ],
  },
  donorFavour: {
    title: 'Penderma ada hajat',
    body: 'Salah seorang penderma besar anda ada hal kecil: satu lesen tersangkut di kementerian, yang boleh bergerak kalau ada sepatah kata mesra. Tentu ada tanda terima kasih.',
    options: ['Sampaikan kata tu', 'Tolak dengan lembut', 'Tolak, dan beritahu media kenapa'],
    results: [
      'Kata tu disampaikan. Terima kasih tiba cepat, dalam sampul biasa.',
      'Dia faham. Dia pun makin jarang jawab panggilan anda.',
      'Anda jadikannya modal depan orang ramai. Majlis makan malam penderma pun sejuk.',
    ],
  },
  donorLeak: {
    title: 'Cerita lesen terbongkar',
    body: 'Seorang wartawan pegang cerita lesen, penderma dan kata mesra anda. Dia nak komen sebelum menerbitkannya.',
    options: ['Nafikan semuanya', 'Mengaku dan pulangkan duit', 'Salahkan bendahari'],
    results: [
      ['Penafian bertahan. Dia tak ada sumber kedua.', 'Dia ada sumber kedua. Dan sampul tu.'],
      'Anda pulangkan duit dan tanggung akibatnya. Lebih ringan daripada yang mungkin.',
      'Bendahari tanggung salah, dan banyak muhibah parti pergi bersamanya.',
    ],
  },
  probe: {
    title: 'Agensi antirasuah datang melawat',
    body: 'Pegawai minta, dengan sopan, fail tentang bagaimana beberapa program kerajaan disalurkan melalui cawangan parti anda.',
    options: ['Beri kerjasama dan hentikan amalan tu', 'Korbankan seorang pegawai', 'Bercakap senyap-senyap dengan ketua agensi'],
    results: [
      'Fail diserahkan dan amalan dihentikan. Cerita reda dalam seminggu.',
      'Seorang pegawai didakwa. Dia tak berniat jatuh sendirian.',
      ['Fail ditutup sebab kurang bukti.', 'Ketua agensi rakam perbualan tu.'],
    ],
  },
  firmWindfall: {
    title: 'Syarikat parti untung besar',
    body: 'Salah sebuah syarikat parti catat keuntungan tak dijangka. Para pengarah tanya nak buat apa dengan duit tu.',
    options: ['Ambil sebagai dividen', 'Labur semula'],
    results: ['Duit dah masuk akaun parti.', 'Nilai syarikat naik.'],
  },
  firmBust: {
    title: 'Syarikat parti dalam masalah',
    body: 'Salah sebuah syarikat parti tak mampu bayar pemiutang. Ia boleh diselamatkan, tapi ada harganya.',
    options: ['Selamatkan', 'Biar ia tumbang'],
    results: ['Parti bayar. Syarikat tu hidup untuk rugi lagi sehari.', 'Syarikat gulung tikar. Akhbar seronok sangat dengan frasa “syarikat berkaitan parti”.'],
  },
  pricesGov: {
    title: 'Harga barang naik',
    body: 'Ayam, telur dan minyak masak semua naik. Pembangkang tiba-tiba tahu harga semua benda, dan rakyat harap kerajaan buat sesuatu.',
    options: ['Bantuan kecemasan, entah dari mana duitnya', 'Terangkan pasal pasaran global', 'Kenakan kawalan harga'],
    results: [
      'Bantuan disalurkan. Perbendaharaan tak akan lupa.',
      'Penjelasan anda pasal pasaran komoditi global tepat, tapi tak popular.',
      'Harga ditetapkan. Begitu juga, kata peniaga, bekalan yang tak cukup.',
    ],
  },
  minister: {
    title: 'Menteri jadi tajuk berita',
    body: 'Salah seorang menteri anda kena tangkap kamera di tempat yang tak sepatutnya, dengan orang yang tak sepatutnya dikenali, pegang benda yang dia tak boleh jelaskan.',
    options: ['Pecat dia', 'Pertahankan dia', 'Pindahkan dia dalam rombakan senyap'],
    results: [
      'Dia dah pergi, berang. Rakyat setuju.',
      'Anda pertahankan orang anda. Rakyat tak.',
      'Sekarang dia menteri untuk benda yang lebih kecil. Tak ada siapa terpedaya, tapi tak ada siapa marah.',
    ],
  },
  budget: {
    title: 'Hari bajet',
    body: 'Bajet dibentang hari ni. Pelannya macam yang ditetapkan di bawah “Bajet tahun depan” dalam tab Parlimen; semak dulu kalau belum.',
    options: ['Bentang bajet seperti dirancang', 'Bentang semula bajet tahun lepas'],
    results: ['Bajet dah di hadapan Dewan.', 'Bajet tanpa perubahan dah di hadapan Dewan.'],
  },
  budgetRevolt: {
    title: 'Bajet kena bantah',
    body: 'Rakan gabungan dah baca bajet dan tak jumpa apa-apa untuk mereka. Kata mereka, mereka tak boleh sokong macam ni. Kalau bajet tumbang, kerajaan pun tumbang.',
    options: ['Cari duit untuk kawasan mereka', 'Bawa ke Dewan dan cabar mereka'],
    results: [
      'Rakan gabungan rasa bajet yang dipinda tu sangat meyakinkan.',
      ['Mereka sokong, sambil menjeling.', 'Mereka tolak. Kerajaan yang tak boleh lulus bajet tak boleh memerintah.'],
    ],
  },
  motion: {
    title: 'Usul undi tidak percaya',
    body: 'Pembangkang bentang usul undi tidak percaya. Speaker tetapkan undian minggu ni, dan semua orang tengah telefon rakan gabungan anda.',
    options: ['Hadapi Dewan', 'Kukuhkan rakan gabungan dulu, berapa pun kosnya'],
    results: ['Dewan mengundi.', 'Rakan gabungan diyakinkan, dengan harga yang mahal. Dewan mengundi.'],
  },
  downgrade: {
    title: 'Agensi penarafan telefon',
    body: 'Hutang negara dah lepas tiga perempat pendapatan negara, dan sebuah agensi penarafan letakkan negara dalam pemerhatian. Kos pinjaman bakal naik.',
    options: ['Umum pelan kurangkan hutang', 'Kata agensi tu tak faham negara ni'],
    results: ['Pelan tu meyakinkan dan memeritkan, ikut turutan tu.', 'Agensi tak berganjak. Pasaran bon pun sama.'],
  },
  budgetAsk: {
    title: 'Bajet sedang didraf',
    body: 'Menteri Kewangan tengah tulis bajet, dan rakan gabungan dijangka sebut apa yang mereka nak sebelum terlambat.',
    options: ['Minta peruntukan untuk kawasan kuat anda', 'Sokong bajet tanpa syarat', 'Ugut nak bantah kecuali dapat lebih'],
    results: [
      'Anda dapat peruntukan, dan nama sebagai kaki minta.',
      'Kesetiaan anda dicatat, dan disimpan.',
      ['Mereka mengalah. Kawasan anda untung dalam bajet ni.', 'Mereka cabar gertakan anda, dan tak akan lupa.'],
    ],
  },
  downturnGov: {
    title: 'Kemelesetan global',
    body: 'Pesanan eksport jatuh dan kilang kurangkan syif. Kelembapan ni bermula di tempat lain, tapi tak penting pun bagi sesiapa yang hilang kerja di sini.',
    options: ['Lancarkan pakej rangsangan', 'Kekalkan perbelanjaan'],
    results: ['Pakej tu lembutkan impak, dan tambah hutang.', 'Anda bertahan. Pendirian tu kekal; ada kerja yang tak.'],
  },
  downturnOpp: {
    title: 'Kemelesetan global',
    body: 'Pesanan eksport jatuh dan kilang kurangkan syif. Kelembapan ni bermula di tempat lain, tapi tak penting pun bagi sesiapa yang hilang kerja di sini.',
    options: ['Tuntut bantuan untuk pekerja sekarang', 'Tawar sokongan kepada kerajaan untuk pelan penyelamat'],
    results: ['Anda bersuara bagi pihak yang diberhentikan. Kerajaan nampak lembab.', 'Anda tawar sokongan. Orang kata macam negarawan, yang tak sama dengan popular.'],
  },
  targeted: {
    title: 'Agensi buka fail siasatan atas anda',
    body: 'Agensi antirasuah umum siasatan ke atas akaun parti anda. Masanya, kata orang anda, bukan kebetulan.',
    options: ['Panggil ia penganiayaan dan kerah penyokong', 'Serahkan segala-galanya, dan umumkan', 'Diamkan diri'],
    results: [
      ['Penyokong anda penuhkan jalan. Siasatan tu nampak bermotif politik sekarang.', 'Himpunan lengang, dan kamera perasan.'],
      'Anda serah buku akaun. Tak ada apa ditemui, perlahan-lahan.',
      'Anda diam. Diam nampak macam bersalah.',
    ],
  },
  walkoutThreat: {
    title: 'Rakan gabungan ugut keluar',
    body: 'Satu rakan gabungan kata mereka tak boleh lagi sokong kerajaan kecuali ada perubahan. Maksudnya: jawatan Kabinet.',
    options: ['Bagi jawatan tu', 'Cabar gertakan mereka'],
    results: [
      'Mereka dapat jawatan, dan menteri anda sendiri makin kurang.',
      ['Mereka mengalah. Mereka kekal, dan lebih senyap.', 'Mereka tak menggertak.'],
    ],
  },
  plotWhispers: {
    title: 'Bisik-bisik komplot',
    body: 'Ada cerita pasal pertemuan lewat malam di hotel, angka yang sedang dikira, dan akuan bersumpah yang sedang didraf. Tak ada siapa nak sebut siapa dalangnya.',
    options: ['Ganjari yang setia dengan rombakan', 'Bersemuka dengan dalang secara terbuka', 'Abaikan'],
    results: [
      'Yang setia diganjari. Yang tak diganjari dah catat.',
      ['Dalang yang didedahkan bersumpah setia tak berbelah bahagi.', 'Anda sebut nama orang yang salah. Yang betul masih mengira.'],
      'Anda abaikan. Bisikan makin kuat.',
    ],
  },
  pricesOpp: {
    title: 'Harga barang naik',
    body: 'Ayam, telur dan minyak masak semua naik. Kerajaan sibuk terangkan pasaran global. Inilah minggu paling senang untuk mana-mana pembangkang.',
    options: ['Belasah kerajaan setiap hari', 'Terbitkan pelan sendiri', 'Biar mereka terseksa sendiri'],
    results: [
      'Anda angkat sebiji telur di setiap sidang media. Menjadi.',
      'Pelan anda dikos dan meyakinkan. Tiga orang baca; tiga orang yang betul.',
      'Anda tak banyak cakap. Harga barang cakap sendiri.',
    ],
  },
  shadowBudget: {
    title: 'Bajet alternatif',
    body: 'Bajet kerajaan dibentang minggu depan. Pembangkang dijangka cakap apa yang akan dibuat sebaliknya.',
    options: ['Terbitkan alternatif yang dikos penuh', 'Janji bulan dan bintang', 'Kritik saja dan berhenti situ'],
    results: [
      'Bajet alternatif anda seimbang. Penganalisis terkejut sampai memuji.',
      'Bulan dan bintang dijanjikan. Pengundi suka; pakar ekonomi kira sifar.',
      'Anda kritik. Itulah tugasnya, kan.',
    ],
  },
  permit: {
    title: 'Permit himpunan ditolak',
    body: 'Polis tolak permit himpunan anda, atas alasan lalu lintas.',
    options: ['Teruskan juga', 'Pindah ke dalam dewan', 'Saman polis di mahkamah'],
    results: [
      ['Beribu hadir. Polis perhati. Gambarnya memang hebat.', 'Ada tangkapan, denda, dan banyak rakaman jalan sesak.'],
      'Dewan penuh, pendingin hawa pula rosak. Semangat bertahan, itu pun nyaris.',
      'Kes mahkamah ambil dua tahun. Mesej dah sampai.',
    ],
  },
  hotelMeeting: {
    title: 'Jemputan ke hotel',
    body: 'Seorang tokoh kanan di pihak kerajaan nak jumpa anda, senyap-senyap, di sebuah hotel. Katanya dia wakil beberapa orang lain, dan angkanya mungkin cukup.',
    options: ['Hadiri pertemuan tu', 'Tolak: kerajaan patut jatuh melalui pilihan raya'],
    results: [
      'Anda bertemu. Tak ada apa ditulis, tapi semua faham.',
      'Anda tolak. Dia nampak lega, lepas tu tersinggung.',
    ],
  },
  hotelNumbers: {
    title: 'Angka',
    body: 'Dia datang lagi, dengan senarai. Kalau semua nama bertahan, kerajaan hilang majoriti malam ni. Kalau seorang menipu, anda pula jadi berita.',
    options: ['Buat langkah tu', 'Tarik diri'],
    results: [
      ['Semua nama bertahan. Menjelang pagi, kerajaan dah hilang majoriti.', 'Salah satu nama menipu. Dia dihantar untuk kira angka anda.'],
      'Anda tarik diri. Dia simpan senarai tu.',
    ],
  },
  fundGov: {
    title: 'Berbilion hilang daripada dana',
    body: 'Akhbar asing lapor berbilion ringgit hilang daripada Dana Gemilang, dana pelaburan negara. Ia sebut akaun, tarikh dan sebuah kapal layar mewah.',
    options: ['Arahkan audit bebas', 'Panggil ia campur tangan asing'],
    results: [
      'Audit dah bermula. Beberapa rakan sejawat anda dah berhenti senyum.',
      'Anda salahkan dengki pihak asing. Akhbar tu siarkan rekod bank.',
    ],
  },
  fundGovEnd: {
    title: 'Laporan audit sampai',
    body: 'Apa pun yang dikatakan dulu, fakta pasal Dana Gemilang dah hitam putih. Duit tu pergi ke tempat yang akhbar sebut.',
    options: ['Terbitkan dan biar mahkamah bertindak', 'Rahsiakan'],
    results: [
      'Laporan diumumkan dan pertuduhan menyusul. Perit, tapi betul.',
      ['Laporan dikunci dalam peti besi. Setakat ni, ia kekal di situ.', 'Laporan bocor dalam seminggu, bersama arahan untuk memendamnya.'],
    ],
  },
  fundOpp: {
    title: 'Berbilion hilang daripada dana',
    body: 'Akhbar asing lapor berbilion ringgit hilang daripada Dana Gemilang, dana pelaburan negara. Ia sebut akaun, tarikh dan sebuah kapal layar mewah.',
    options: ['Tuntut suruhanjaya diraja, kuat-kuat', 'Tunggu fakta'],
    results: [
      'Anda jadikan dana tu perjuangan anda. Tak ada jalan berpatah balik.',
      'Anda tanya soalan yang berhati-hati. Soalan yang betul, secara senyap.',
    ],
  },
  fundOppEnd: {
    title: 'Skandal dana terbongkar',
    body: 'Dokumen, pemberi maklumat dan jejak kertas: apa yang tadinya khabar angin pasal Dana Gemilang kini fakta, dan kerajaan tak ada tempat nak sorok.',
    options: ['Bawa ke jalanan', 'Bawa ke mahkamah'],
    results: [
      'Himpunan penuhkan dataran. Kerajaan tak pernah nampak selemah ini.',
      'Peguam anda failkan saman. Lebih lambat, tapi ia akan melekat.',
    ],
  },
  deputy: {
    title: 'Timbalan anda resah',
    body: 'Timbalan anda mula beri temu bual pasal “kepimpinan generasi akan datang”. Dia tak sebut generasi siapa, tapi dia dah ambil gambar potret baharu.',
    options: ['Namakan dia pengganti, bila tiba masanya', 'Pindahkan dia ke tempat yang tak berbahaya', 'Buat-buat tak perasan'],
    results: [
      'Dia pewaris yang direstui, dan buat masa ni itu dah cukup.',
      'Dia diberi jawatankuasa perlembagaan parti. Dia sedang baca betul-betul.',
      'Anda tak perasan apa-apa. Dia perasan yang tu.',
    ],
  },
  assemblyFight: {
    title: 'Cabaran di perhimpunan agung',
    body: 'Timbalan anda akan bertanding jawatan presiden. Perwakilan sedang dikira, dipujuk dan, ada yang dibawa ke restoran yang sangat sedap.',
    options: ['Lawan di lantai perhimpunan', 'Pastikan perwakilan di pihak anda'],
    results: [
      ['Anda menang besar. Dia mengaku kalah dengan senyuman yang tak sampai ke mata.', 'Anda selamat, nyaris-nyaris. Separuh dewan tak berdiri untuk ucapan anda.'],
      'Perwakilan berjaya diyakinkan. Tak murah, dan orang bercakap.',
    ],
  },
  assemblyCalm: {
    title: 'Perhimpunan agung parti',
    body: 'Soal pengganti dah selesai, jadi perhimpunan ni macam raptai pertabalan. Cuma satu soalan: apa yang anda cakap pasal orang muda.',
    options: ['Beri ucapan macam biasa', 'Janji mengetengahkan generasi baharu'],
    results: [
      'Tiga kali tepukan berdiri, ikut jadual.',
      'Orang muda bersorak. Beberapa ketua bahagian mula kira baki tahun mereka.',
    ],
  },
};

// The second batch of events is written in its own file and joins the first here.
Object.assign(EVENTS_EN, MORE_EVENTS_EN);
Object.assign(EVENTS_MS, MORE_EVENTS_MS);
Object.assign(EVENTS_EN, GOVERNING_EVENTS_EN);
Object.assign(EVENTS_MS, GOVERNING_EVENTS_MS);
Object.assign(EVENTS_EN, STORY_EVENTS_EN);
Object.assign(EVENTS_MS, STORY_EVENTS_MS);
Object.assign(EVENTS_EN, SEASON_EVENTS_EN);
Object.assign(EVENTS_MS, SEASON_EVENTS_MS);
Object.assign(EVENTS_EN, FEDERATION_EVENTS_EN);
Object.assign(EVENTS_MS, FEDERATION_EVENTS_MS);
Object.assign(EVENTS_EN, STORY_EVENTS_2_EN);
Object.assign(EVENTS_MS, STORY_EVENTS_2_MS);
Object.assign(EVENTS_EN, NEW_EVENTS_EN, NEW_EVENTS_2_EN);
Object.assign(EVENTS_MS, NEW_EVENTS_MS, NEW_EVENTS_2_MS);
Object.assign(EVENTS_EN, PM_EVENTS_EN, PARTNER_EVENTS_EN, LEAD_EVENTS_EN, LEAD_EVENTS_2_EN, OPP_EVENTS_EN, DESK_EVENTS_EN, DEBT_EVENTS_EN, SHOCK_EVENTS_EN, FOLLOW_EVENTS_EN, STATE_STORIES_EN, KEDAH_STORIES_EN, SELANGOR_STORIES_EN, FORCES_AND_PESTEL_EN, SARAWAK_STORIES_EN, VIRAL_EVENTS_EN, GRAFT_EVENTS_EN, CRISIS_EVENTS_EN, PENANG_STORIES_EN, PERLIS_STORIES_EN, MELAKA_STORIES_EN, OPENING_STORIES_EN, PARTY_OPENING_EN, POWER_EN);
Object.assign(EVENTS_MS, PM_EVENTS_MS, PARTNER_EVENTS_MS, LEAD_EVENTS_MS, LEAD_EVENTS_2_MS, OPP_EVENTS_MS, DESK_EVENTS_MS, DEBT_EVENTS_MS, SHOCK_EVENTS_MS, FOLLOW_EVENTS_MS, STATE_STORIES_MS, KEDAH_STORIES_MS, SELANGOR_STORIES_MS, FORCES_AND_PESTEL_MS, SARAWAK_STORIES_MS, VIRAL_EVENTS_MS, GRAFT_EVENTS_MS, CRISIS_EVENTS_MS, PENANG_STORIES_MS, PERLIS_STORIES_MS, MELAKA_STORIES_MS, OPENING_STORIES_MS, PARTY_OPENING_MS, POWER_MS);

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
