import type { EventText } from './events';

// The second batch of events between elections, in English and Bahasa
// Malaysia. A result written as a pair is for a gamble: what is reported if
// it comes off, then if it does not.

export const MORE_EVENTS_EN: Record<string, EventText> = {
  organiserWarlords: {
    title: 'The division chiefs want their due',
    body: 'They have carried boxes, hung banners and delivered votes for you for thirty years. Now they would like to be the candidates. All of them.',
    options: ['Promise them the seats', 'Tell them candidates are chosen on merit'],
    results: ['The chiefs are content. The reformers in the party are not.', 'You said it kindly. They heard it anyway.'],
  },
  organiserReunion: {
    title: 'An old comrade needs a favour',
    body: 'He chaired the branch where you started. His son’s firm has bid for a small council contract, and he wonders whether you still remember your friends.',
    options: ['Remember your friends', 'Remember your principles'],
    results: ['The contract was awarded. So, quietly, was a reputation.', 'He left without finishing his tea. The branch has heard his version.'],
  },
  technocratLecture: {
    title: '“Professor”',
    body: 'You were asked about the price of eggs at a kenduri and answered for forty minutes, with a diagram. The clip has two million views and a nickname for you.',
    options: ['Lean into it: “Yes, I am boring. Boring is what you need.”', 'Hire a speech coach'],
    results: [
      ['It works. Boring is trending, and the middle class finds it reassuring.', 'The heartland decides you think they are stupid.'],
      'You can now explain inflation in under a minute. Almost.',
    ],
  },
  technocratOffer: {
    title: 'A job abroad',
    body: 'A development bank in Washington would like you back, at a salary with several more digits. The offer reached the newspapers before it reached your family.',
    options: ['Decline it in public, at once', 'Let the rumour run for a week'],
    results: [
      'You stayed. The party noticed that you could have gone.',
      ['They begged you to stay. You graciously agreed.', 'Nobody begged. Two of your deputies measured your office for curtains.'],
    ],
  },
  firebrandSpeech: {
    title: 'A speech from another life',
    body: 'Someone has found the tape. You are twenty-two, on the back of a lorry, calling half of the people you now sit beside thieves and the other half cowards.',
    options: ['Stand by every word', 'Say you were young'],
    results: ['The voters liked the old you. Your colleagues are checking which half they were in.', 'You were young. You were also right, and everyone knows you know it.'],
  },
  firebrandRally: {
    title: 'The crowd wants the moon',
    body: 'Ten thousand people in the rain, chanting for a promise you cannot afford to make. The microphone is in your hand.',
    options: ['Promise it', 'Tell them what it would cost'],
    results: [
      'The roar was heard three villages away. So, later, was the Treasury’s arithmetic.',
      ['They listened. A crowd that will listen to arithmetic is a crowd worth having.', 'You could hear the rain. That is how quiet it went.'],
    ],
  },
  tycoonAudit: {
    title: 'The tax office remembers you',
    body: 'An audit of companies you sold years ago. The timing may be a coincidence; nobody in politics believes in those.',
    options: ['Open every book to them', 'Call it a political hit'],
    results: [
      'The accountants were expensive and the audit was clean. Mostly clean.',
      ['The public smells persecution, and sides with you.', 'They published the figures. The figures were not helpful.'],
    ],
  },
  tycoonFriends: {
    title: 'A quiet word about a licence',
    body: 'Your old business partner would never ask for anything improper. He only wonders whether the ministry might look at his application again. He has brought a donation, separately.',
    options: ['Make one phone call', 'Show him the door'],
    results: ['The application was looked at again. The donation cleared.', 'He was offended. His friends, who are also donors, were offended on his behalf.'],
  },
  fixerDebt: {
    title: 'The book of debts',
    body: 'Fifteen years ago you saved a young politician from bankruptcy and never mentioned it again. He now sits on the other side’s front bench, and he knows things.',
    options: ['Call in the debt', 'Leave it in the book'],
    results: ['He paid in documents. Your dossier is thicker, and your conscience has seen worse.', 'Some debts are worth more unpaid.'],
  },
  fixerProfile: {
    title: '“The Man Who Counts”',
    body: 'A magazine is writing six thousand words on how you make deals. The journalist has done her homework, which is the problem.',
    options: ['Sit down with her and be charming', 'Have a word with her editor'],
    results: [
      ['The profile calls you “indispensable”. You have had it framed.', 'The profile calls you “the reason nothing changes”. So does everyone else, now.'],
      'The piece was spiked. The editor will want something one day.',
    ],
  },
  activistVigil: {
    title: 'The anniversary',
    body: 'Twenty years since they came for you at four in the morning. Your old supporters are holding a candlelight vigil, and they have left a space at the front.',
    options: ['Go, and speak', 'Mark it in private'],
    results: ['You spoke without notes. The young had not heard the story before; the establishment had hoped they never would.', 'You lit a candle at home. Some things are not for campaigns.'],
  },
  activistComrades: {
    title: 'Old comrades, new complaints',
    body: 'The people you marched with have written an open letter. It uses the word “betrayal” four times and “compromise” as if it were a crime.',
    options: ['Meet them and listen', 'Reply that governing is not marching'],
    results: ['Three hours, no agreement, and a little more respect on both sides.', 'It was a good line. It cost you the people who taught you your first ones.'],
  },

  staffPoached: {
    title: 'A better offer',
    body: 'One of your best people has been offered double by a rival party, and has had the decency to tell you before saying yes.',
    options: ['Match the offer', 'Appeal to loyalty'],
    results: [
      'They stayed. The rest of the office has noticed what loyalty costs.',
      ['They stayed for the cause. You have promised to remember it.', 'They went, and took a filing cabinet’s worth of what they knew.'],
    ],
  },
  staffLeak: {
    title: 'The memo',
    body: 'Your strategy memo for the next election is on a news site, including the page headed “seats we have given up on”. The members in those seats can read.',
    options: ['Find the leaker', 'Shrug it off in public'],
    results: ['You found them. The office is tidier, quieter and more frightened.', '“Every party writes memos.” True, and it changed nobody’s mind in the seats you gave up on.'],
  },
  internRevolt: {
    title: 'The volunteers would like to be paid',
    body: 'The young people who run your social media have calculated their hourly rate. It is a short calculation. They have posted it, with a chart.',
    options: ['Pay them properly', '“The experience is the reward”'],
    results: ['You pay your volunteers now, and they have posted that too.', 'The chart has been updated to include your quote.'],
  },
  speechwriter: {
    title: 'A familiar paragraph',
    body: 'The best passage in your conference speech turns out to have been delivered first by an American senator in 1988. Your speechwriter says great minds think alike.',
    options: ['Own up and laugh about it', 'Say a member of staff has been dealt with'],
    results: [
      'A day of jokes at your expense, then nothing.',
      ['Nobody asked a follow-up question.', 'The member of staff gave an interview. It was you who liked the paragraph.'],
    ],
  },

  talkShow: {
    title: 'An invitation you should probably refuse',
    body: 'The country’s most-watched talk show wants you for an hour. The host has ended three careers and is polite about it.',
    options: ['Go on', 'Decline'],
    results: [
      ['You held your own. People who never vote for you said so.', 'The clip of you looking for an answer is eleven seconds long. It feels longer.'],
      'An empty chair was shown with your name on it.',
    ],
  },
  deepfake: {
    title: 'A recording of you that you never made',
    body: 'An audio clip is going round in which you insult your own voters. It is fake, and very well made.',
    options: ['Pay experts to take it apart in public', 'Ignore it', 'Make fun of it'],
    results: [
      'The forensic report was thorough and dull, which is what was needed.',
      ['It faded by the weekend.', 'Silence was taken for a confession.'],
      ['Your parody of the fake outran the fake.', 'Half the country now thinks you were joking about something you really said.'],
    ],
  },
  editorDinner: {
    title: 'Dinner with the editors',
    body: 'Off the record, six editors, one long table. They want to know what you really think. So does everyone they will tell.',
    options: ['Speak freely', 'Stay on script'],
    results: [
      ['You learned more than you gave away, and they liked you for the candour.', '“Off the record” lasted until the coffee.'],
      'A pleasant evening in which nothing was said.',
    ],
  },
  newsroomRaid: {
    title: 'The police visit a newsroom',
    body: 'Officers have taken computers from a news site after a story about a minister. The site is publishing from a coffee shop and its readership has tripled.',
    options: ['Stand by the police', 'Say the press must be free to report'],
    results: ['The government closed ranks. The country’s editors opened a file on it.', 'You said what needed saying. Some of your colleagues will not forget that you said it.'],
  },
  filmBan: {
    title: 'The censors want a film banned',
    body: 'The board says a new local film offends public morals. Nobody has seen it, which has not prevented anyone from having a view.',
    options: ['Uphold the ban', 'Overrule the censors'],
    results: ['The film is banned and has been downloaded four million times.', 'The film opened to full houses and a protest outside each one.'],
  },

  ringgitSlide: {
    title: 'The ringgit slides',
    body: 'The currency has lost a tenth of its value in a month. Importers are frightened, exporters are quiet, and everyone’s holiday just got dearer.',
    options: ['Defend it with the reserves', 'Let it find its level'],
    results: ['The slide stopped. The reserves are thinner for it.', 'Prices rose, exports recovered, and the markets noted that you did not panic.'],
  },
  tolls: {
    title: 'The toll concessions are up',
    body: 'The highway contracts are up for renewal. Every government promises to abolish tolls, and every government then reads the contracts.',
    options: ['Abolish the tolls and pay the companies off', 'Freeze the rates', 'Let them rise as agreed'],
    results: ['The barriers came down. The bill went to the Treasury.', 'Nobody is happy and nobody is angry.', 'The contracts were honoured. The commuters will remember.'],
  },
  riceShortage: {
    title: 'No local rice on the shelves',
    body: 'Shoppers are photographing empty shelves where the cheap local rice used to be. Imported rice is plentiful, at twice the price.',
    options: ['Import and subsidise', 'Blame the hoarders'],
    results: [
      'The shelves filled. So did the subsidy bill.',
      ['A warehouse raid made the evening news, and the shelves filled soon after.', 'No hoarders were found. The shelves stayed empty and the blame came home.'],
    ],
  },
  megaProject: {
    title: 'A railway across the country',
    body: 'A foreign contractor offers to build a coast-to-coast railway, with a loan to match. The east coast wants it. The Treasury wants to see the small print.',
    options: ['Sign it', 'Cancel it', 'Send it back for a better price'],
    results: [
      'Ground was broken, with golden shovels. The repayments begin in three years.',
      'You saved the money and lost the photograph.',
      ['They came back a third cheaper. You look like someone who can read a contract.', 'They walked away, and said why.'],
    ],
  },
  gigStrike: {
    title: 'The riders switch off their apps',
    body: 'Delivery riders across the cities have logged off over a cut in their rates. Dinner is late everywhere, and the platforms say their hands are tied by the market.',
    options: ['Stand with the riders', 'Stand with the platforms', 'Stay out of it'],
    results: ['You rode pillion to the picket. The riders will remember; so will the restaurants.', 'The platforms were grateful, in the usual way.', 'You expressed concern. Nobody quoted it.'],
  },
  dryTaps: {
    title: 'The taps run dry',
    body: 'A pollution scare has shut a treatment plant, and a million homes have no water for the fourth time this year.',
    options: ['Send water tankers with your logo on', 'Blame whoever runs the state'],
    results: [
      'The tankers were filmed. So was the logo.',
      ['The blame stuck where you threw it.', 'It was pointed out that your own party runs the water company.'],
    ],
  },
  pensionCall: {
    title: 'Let us take our own money',
    body: 'A campaign wants people allowed to draw on their retirement savings now. Most who would do so have little saved, and need it badly.',
    options: ['Back the withdrawals', 'Oppose them'],
    results: ['You were cheered. The economists wrote a joint letter.', 'You were right, and it did not feel like it at the market.'],
  },
  subsidyReform: {
    title: 'The fuel subsidy',
    body: 'Half of the fuel subsidy goes to the people who need it least. The plan to target it has been ready for a decade, waiting for someone brave or foolish.',
    options: ['Do it', 'Put it back in the drawer'],
    results: ['Prices rose, the budget breathed, and the middle class has your name written down.', 'The plan is back in the drawer. It knows the way.'],
  },
  foreignWorkers: {
    title: 'Who does the work',
    body: 'Factories and plantations say they cannot run without more foreign workers. The unions say they could, if the pay were better.',
    options: ['Open the door wider', 'Freeze the intake'],
    results: ['The factories are humming. The unions are not.', 'Wages edged up. So did the number of “temporarily closed” signs.'],
  },
  windfall: {
    title: 'A windfall',
    body: 'Oil is up and so is the revenue: several billion more than the budget expected. Everybody has a view on whose money it is.',
    options: ['Pay down the debt', 'A cash handout for every household', 'A bigger share for Sabah and Sarawak'],
    results: ['Nobody thanked you. The ratings agencies sent a card.', 'The money was spent by the weekend, and prices followed it up.', 'Kuching and Kota Kinabalu are pleased. The peninsula asks where its share went.'],
  },
  haze: {
    title: 'The haze is back',
    body: 'Smoke from across the strait has closed schools and airports. It happens every year, and every year it is a surprise.',
    options: ['Summon the ambassador', 'Hand out masks and close the schools'],
    results: ['Strong words were exchanged. The wind was not consulted.', 'It cost money and it was competent, which is rarer.'],
  },

  youthQuota: {
    title: 'A third of the seats for the young',
    body: 'The youth wing demands that a third of your candidates be under forty. The members over forty, who are most of them, have feelings about this.',
    options: ['Agree', 'Refuse'],
    results: ['The youth wing is jubilant. Several division chiefs have discovered they are younger than previously recorded.', 'The old hands are relieved. The young are drafting something.'],
  },
  topTable: {
    title: 'The top table',
    body: 'The women’s wing chief has pointed out, with a photograph, that the party’s leadership looks like a reunion of the same boys’ school.',
    options: ['Put women in the top posts', 'Say posts go on merit'],
    results: ['Three new faces at the top table, and three men looking for someone to blame.', '“Merit.” The photograph is circulating again, with that as the caption.'],
  },
  founderMemoir: {
    title: 'The founder’s memoir',
    body: 'The party’s founder has published his memoirs at ninety. Chapter eleven is about you. It is called “The Disappointment”.',
    options: ['Be gracious', 'Answer back'],
    results: ['“He is entitled to his memories.” The book sold out anyway.', 'You won the argument with a ninety-year-old. Enjoy it.'],
  },
  branchBrawl: {
    title: 'Chairs fly at a branch meeting',
    body: 'A dispute over who chairs a division was settled by throwing the chairs. Somebody filmed it, and set it to music.',
    options: ['Suspend both factions', 'Call it “passion for the party”'],
    results: ['Both sides are suspended and, for once, united: against you.', 'The remix is very popular.'],
  },
  defectorsKnock: {
    title: 'Three members would like to come over',
    body: 'Three rival members of Parliament are unhappy where they are and would be happy where you are. They have terms. They always have terms.',
    options: ['Welcome them', 'Refuse them on principle'],
    results: ['They crossed. Your own members, who fought those three at the last election, are not celebrating.', 'You turned them away, and said why. People believed you a little more.'],
  },
  partyPolls: {
    title: 'The party elections',
    body: 'Every three years the party votes on its own leadership. This year a challenger has emerged, with money behind them and a slogan about fresh starts.',
    options: ['Fight it openly', 'Cut a deal with the challenger'],
    results: [
      ['You won by a distance. The party is yours again.', 'You held on, narrowly, and everyone saw how narrowly.'],
      'The challenger withdrew and became your deputy. Nobody asked what it cost.',
    ],
  },
  merchandise: {
    title: 'The T-shirts',
    body: 'The party’s campaign T-shirts cost three times the going rate. The supplier is a company owned by the treasurer’s brother-in-law.',
    options: ['Order an audit', 'Say nothing and change supplier'],
    results: [
      'The audit found what audits find. The treasurer’s faction is seething.',
      ['Nobody noticed.', 'Somebody noticed, and had the invoices.'],
    ],
  },
  oldGuard: {
    title: 'New faces',
    body: 'Half of your front bench was there when the party was founded. Your strategists would like candidates who were not also there when television was.',
    options: ['Ask the veterans to make way', 'Keep the veterans'],
    results: ['They went, with speeches. Some of the speeches mentioned you.', 'Experience counts. So do the votes of the under-thirties, elsewhere.'],
  },

  acquittal: {
    title: 'A rival walks free',
    body: 'A court has thrown out the corruption charges against a senior rival. He is on the steps with a garland, thanking the judges and promising revenge.',
    options: ['Say the courts must be respected', 'Demand an appeal'],
    results: ['Dull, proper, and noted by people who value that.', 'The reformers cheered. He has added your name to the list.'],
  },
  boundaries: {
    title: 'New boundaries',
    body: 'The Election Commission has proposed new constituency boundaries. By coincidence they would give your party about eight more seats.',
    options: ['Take the gift', 'Send it back'],
    results: ['The map passed. So did a little more of the public’s faith in the referee.', 'You sent it back. Your own members think you are mad; others think you might be serious.'],
  },
  auditReport: {
    title: 'The Auditor-General reports',
    body: 'This year’s report finds a ministry that paid for forty laptops at the price of four hundred, and a bridge with no river.',
    options: ['Sack those responsible', 'Set up a committee'],
    results: ['Heads rolled, some of them well connected. The government is shakier and better thought of.', 'The committee will report in due course. Everyone knows what that means.'],
  },
  custodyDeath: {
    title: 'A death in custody',
    body: 'A young man arrested over a stolen motorcycle has died in a police lock-up. His family want answers, and the answers so far do not match each other.',
    options: ['Set up an independent inquiry', 'Leave it to an internal one'],
    results: ['The inquiry has teeth. The police are unhappy and the public is listening.', 'The internal inquiry cleared everyone. Nobody was surprised and nobody was satisfied.'],
  },
  whistleblower: {
    title: 'A brown envelope',
    body: 'A civil servant has brought you documents showing a contract awarded without tender. They are either the story of the year or a trap.',
    options: ['Publish them', 'Hand them to the anti-graft agency'],
    results: [
      ['The documents were real. The government spent a week explaining them.', 'One page was forged. That is the only page anyone talks about.'],
      'You did it properly. The agency says it is looking into the matter, and you have kept copies.',
    ],
  },
  shadowCabinet: {
    title: 'A shadow cabinet',
    body: 'The press keeps asking who would run the ministries if you won. Naming names answers the question, and tells everyone not named where they stand.',
    options: ['Name a full team', 'Stay vague'],
    results: ['You look like a government in waiting. The unnamed look like an opposition within it.', '“All in good time.” Your colleagues continue to hope.'],
  },

  borneoThird: {
    title: 'A third of Parliament for Borneo',
    body: 'Sabah and Sarawak want a third of the seats in Parliament, as they say was understood when the federation was formed. The peninsula’s parties would pay for it in seats.',
    options: ['Endorse it', 'Call for a study'],
    results: ['Borneo heard a peninsular leader say yes. They will hold you to it.', 'Another study. Borneo has a shelf of them.'],
  },
  oilRights: {
    title: 'Whose oil',
    body: 'Sarawak has passed a law claiming the oil and gas off its shore. The national oil company has lawyers and so does Kuching.',
    options: ['Concede the claim', 'See them in court'],
    results: ['A deal was signed. It will cost the federal budget for a generation, and it kept the peace.', 'The writ was filed. Relations with Kuching have not been this bad in decades.'],
  },
  borneoHighway: {
    title: 'The road that never ends',
    body: 'The highway across Borneo was due five years ago. A video of a lorry sunk to its axles on the “completed” stretch has reached the peninsula.',
    options: ['Go and see it, and pledge your support', 'Issue a statement'],
    results: ['You drove it yourself, slowly. Borneo noticed that you came.', 'The statement was noted, and filed with the others.'],
  },
  peninsulaGaffe: {
    title: 'One of yours on Borneo',
    body: 'One of your peninsular members has explained on camera that Sabahans should be grateful for what they get. He has also mispronounced three place names.',
    options: ['Strip him of his post', 'Say he was misquoted'],
    results: ['He is on the back benches, and his friends are sulking.', 'He was not misquoted. There is video.'],
  },
  stateDefiance: {
    title: 'A chief minister of your own',
    body: 'The head of a state government your party runs has announced a policy you oppose, and added that the state is not run from party headquarters.',
    options: ['Let it pass', 'Call them to order'],
    results: ['The state went its own way. People ask who leads the party.', 'They backed down, in public, and will not forget it in private.'],
  },

  durianFeast: {
    title: 'Durian with the enemy',
    body: 'A rival leader has invited you to his orchard for the first fruit of the season. There will be cameras. There will also be very good durian.',
    options: ['Go', 'Send regrets'],
    results: ['You ate with your hands and talked for an hour. Your own hardliners have seen the photographs.', 'You stayed away. He ate your share.'],
  },
  footballFinal: {
    title: 'The final',
    body: 'The national team is in a final for the first time in a generation. Every politician in the country has discovered a lifelong love of football.',
    options: ['Fly to the match', 'Watch it at a mamak with the voters'],
    results: [
      ['They won, and you were in the photograph.', 'They lost. The internet has decided you are bad luck.'],
      'You shouted at the same screen as everyone else. It was noticed.',
    ],
  },
  openHouse: {
    title: 'Open house season',
    body: 'The festive season is here and every leader is expected to feed the nation. The question is whether to feed all of it at once.',
    options: ['Host one enormous open house', 'Visit a hundred small ones'],
    results: ['Forty thousand people, nine tonnes of rendang and a queue visible from the highway.', 'You ate at a hundred tables. The branches loved it; your doctor did not.'],
  },
  danceTrend: {
    title: 'The dance',
    body: 'Your media team has a plan. It involves you, a song with eighty million plays, and fifteen seconds of choreography.',
    options: ['Dance', 'Decline, with dignity'],
    results: [
      ['It is charming, somehow. The young are sharing it without irony.', 'It is being shared, with irony.'],
      'Dignity preserved. The media team is sulking.',
    ],
  },
  examLeak: {
    title: 'The exam papers leak',
    body: 'The national school-leaving exam was circulating on phones the night before. Half a million families want to know what happens now.',
    options: ['Everyone sits it again', 'Adjust the marks and move on'],
    results: ['A hard week for the students, and the right call.', 'Nobody believes this year’s results, including the universities.'],
  },
  potholes: {
    title: 'The man who fills potholes',
    body: 'A retired mechanic has been filling potholes in his town with his own cement, and painting the date the council was first told beside each one.',
    options: ['Pick up a shovel and join him', 'Promise an audit of road repairs'],
    results: [
      ['He let you help. The photograph is a good one.', 'He told the cameras you had held the shovel upside down.'],
      'An audit was promised. He has painted the date.',
    ],
  },
  shophouses: {
    title: 'A row of old shophouses',
    body: 'A developer wants to replace a street of pre-war shophouses with a tower. The families who have traded there for four generations would rather he did not.',
    options: ['Side with the traders', 'Side with the developer'],
    results: ['The street stays. The developer and his friends will give elsewhere.', 'The tower will be called Heritage Residences.'],
  },
  roguePoll: {
    title: 'A poll nobody believes',
    body: 'A pollster nobody has heard of has you ten points down. It is nonsense, and it is the headline everywhere.',
    options: ['Publish your own numbers', 'Laugh at it'],
    results: [
      'Your pollster’s figures were duly reported, lower down the page.',
      ['The joke landed. The pollster has gone quiet.', 'Your own members are asking whether it might be true.'],
    ],
  },
  marketScolding: {
    title: 'A scolding at the market',
    body: 'A woman selling vegetables has told you, at length and on camera, what a kilo of chillies costs and what she thinks of people who do not know.',
    options: ['Listen, and thank her', 'Explain the statistics'],
    results: ['You listened to all of it. She gave you a bag of chillies and a look.', 'Your figures were accurate. Hers were on the price tags.'],
  },
};

export const MORE_EVENTS_MS: Record<string, EventText> = {
  organiserWarlords: {
    title: 'Ketua bahagian nak ganjaran',
    body: 'Tiga puluh tahun mereka angkat kotak, gantung sepanduk, hantar undi untuk anda. Sekarang mereka nak jadi calon. Semua sekali.',
    options: ['Janjikan kerusi pada mereka', 'Kata calon dipilih ikut merit'],
    results: ['Ketua bahagian puas hati. Golongan reformis dalam parti tak.', 'Anda cakap lembut-lembut. Mereka dengar juga.'],
  },
  organiserReunion: {
    title: 'Kawan lama minta tolong',
    body: 'Dialah pengerusi cawangan tempat anda mula dulu. Syarikat anaknya bida kontrak kecil majlis, dan dia tertanya-tanya anda masih ingat kawan ke tidak.',
    options: ['Ingat kawan', 'Ingat prinsip'],
    results: ['Kontrak diberi. Reputasi pun ikut, senyap-senyap.', 'Dia balik tanpa habiskan teh dia. Cawangan dah dengar versi dia.'],
  },
  technocratLecture: {
    title: '“Prof”',
    body: 'Anda ditanya pasal harga telur di sebuah kenduri dan jawab empat puluh minit, siap dengan gambar rajah. Klip tu dah ditonton dua juta kali dan anda dapat gelaran.',
    options: ['Terima saja: “Ya, saya membosankan. Itulah yang awak perlukan.”', 'Ambil jurulatih pidato'],
    results: [
      ['Menjadi. “Boring” sekarang trending, dan kelas pertengahan rasa tenang.', 'Orang kampung putuskan anda anggap mereka bodoh.'],
      'Sekarang anda boleh terangkan inflasi dalam masa seminit. Hampir.',
    ],
  },
  technocratOffer: {
    title: 'Tawaran kerja di luar negara',
    body: 'Sebuah bank pembangunan di Washington nak anda balik, dengan gaji yang lebih banyak digit. Tawaran tu sampai ke akhbar sebelum sampai ke keluarga anda.',
    options: ['Tolak terang-terangan, sekarang juga', 'Biar khabar angin berlegar seminggu'],
    results: [
      'Anda kekal. Parti sedar anda boleh saja pergi.',
      ['Mereka merayu supaya anda kekal. Anda setuju dengan penuh budi.', 'Tak ada siapa merayu. Dua timbalan anda dah ukur langsir pejabat anda.'],
    ],
  },
  firebrandSpeech: {
    title: 'Ucapan dari zaman lain',
    body: 'Ada orang jumpa pita tu. Anda dua puluh dua tahun, atas belakang lori, panggil separuh daripada orang yang duduk sebelah anda sekarang pencuri, dan separuh lagi pengecut.',
    options: ['Pertahankan setiap patah kata', 'Kata anda muda lagi masa tu'],
    results: ['Pengundi suka anda yang dulu. Rakan-rakan tengah semak mereka dalam separuh yang mana.', 'Anda memang muda. Anda juga betul, dan semua orang tahu anda tahu.'],
  },
  firebrandRally: {
    title: 'Orang ramai nak bulan',
    body: 'Sepuluh ribu orang dalam hujan, laung janji yang anda tak mampu nak buat. Mikrofon di tangan anda.',
    options: ['Janjikan', 'Beritahu mereka berapa kosnya'],
    results: [
      'Sorakan kedengaran sampai tiga kampung. Tak lama lepas tu, kira-kira Perbendaharaan pun sampai.',
      ['Mereka dengar. Orang ramai yang sanggup dengar kira-kira memang berharga.', 'Bunyi hujan pun kedengaran. Begitulah senyapnya.'],
    ],
  },
  tycoonAudit: {
    title: 'Pejabat cukai masih ingat anda',
    body: 'Audit ke atas syarikat yang anda jual bertahun-tahun lalu. Masanya mungkin kebetulan; tak ada orang dalam politik percaya kebetulan.',
    options: ['Buka semua buku akaun', 'Kata ni serangan politik'],
    results: [
      'Akauntan mahal dan audit bersih. Kebanyakannya bersih.',
      ['Rakyat bau penganiayaan, dan berpihak pada anda.', 'Mereka terbitkan angkanya. Angka tu tak membantu.'],
    ],
  },
  tycoonFriends: {
    title: 'Sepatah dua kata pasal lesen',
    body: 'Rakan niaga lama anda tak akan minta benda yang tak patut. Dia cuma tertanya-tanya kalau kementerian boleh tengok semula permohonannya. Dia bawa derma sekali, asing-asing.',
    options: ['Buat satu panggilan', 'Tunjuk pintu'],
    results: ['Permohonan tu dilihat semula. Derma pun masuk.', 'Dia tersinggung. Kawan-kawan dia, yang juga penderma, tersinggung bagi pihaknya.'],
  },
  fixerDebt: {
    title: 'Buku hutang budi',
    body: 'Lima belas tahun lepas anda selamatkan seorang ahli politik muda daripada muflis dan tak pernah ungkit. Sekarang dia duduk di barisan depan pihak lawan, dan dia tahu banyak benda.',
    options: ['Tuntut hutang tu', 'Biar dalam buku'],
    results: ['Dia bayar dengan dokumen. Fail anda lebih tebal, dan hati nurani anda pernah tengok yang lebih teruk.', 'Ada hutang yang lebih bernilai kalau tak dituntut.'],
  },
  fixerProfile: {
    title: '“Orang yang Mengira”',
    body: 'Sebuah majalah tengah tulis enam ribu patah perkataan pasal cara anda berunding. Wartawannya dah buat kerja rumah, dan itulah masalahnya.',
    options: ['Duduk dengan dia dan jadi menawan', 'Bercakap dengan editornya'],
    results: [
      ['Profil tu gelar anda “tak boleh diganti”. Anda dah bingkaikannya.', 'Profil tu gelar anda “punca tak ada apa berubah”. Sekarang semua orang cakap macam tu.'],
      'Rencana tu tak jadi terbit. Editor tu mesti minta balasan suatu hari nanti.',
    ],
  },
  activistVigil: {
    title: 'Ulang tahun',
    body: 'Dua puluh tahun sejak mereka datang jemput anda pukul empat pagi. Penyokong lama anda adakan himpunan lilin, dan mereka kosongkan tempat di depan.',
    options: ['Hadir, dan berucap', 'Kenang secara peribadi'],
    results: ['Anda berucap tanpa nota. Orang muda belum pernah dengar kisah tu; golongan lama berharap mereka tak akan dengar.', 'Anda nyalakan lilin di rumah. Ada benda yang bukan untuk kempen.'],
  },
  activistComrades: {
    title: 'Kawan seperjuangan, rungutan baharu',
    body: 'Orang yang pernah berarak dengan anda tulis surat terbuka. Perkataan “khianat” muncul empat kali, dan “kompromi” disebut macam jenayah.',
    options: ['Jumpa mereka dan dengar', 'Balas yang memerintah tak sama dengan berarak'],
    results: ['Tiga jam, tak ada persetujuan, tapi sikit lagi hormat di kedua-dua pihak.', 'Ayat tu memang bernas. Harganya ialah orang yang ajar anda ayat-ayat pertama anda.'],
  },

  staffPoached: {
    title: 'Tawaran lebih lumayan',
    body: 'Salah seorang kakitangan terbaik anda ditawar gaji dua kali ganda oleh parti lawan, dan dia cukup baik hati untuk beritahu anda sebelum setuju.',
    options: ['Samakan tawaran tu', 'Rayu atas nama kesetiaan'],
    results: [
      'Dia kekal. Seluruh pejabat dah tahu harga kesetiaan.',
      ['Dia kekal demi perjuangan. Anda berjanji tak akan lupa.', 'Dia pergi, bawa sekali sekabinet fail pengetahuan.'],
    ],
  },
  staffLeak: {
    title: 'Memo tu',
    body: 'Memo strategi anda untuk pilihan raya akan datang tersiar di portal berita, termasuk muka surat bertajuk “kerusi yang kita dah lepaskan”. Ahli di kerusi-kerusi tu pandai membaca.',
    options: ['Cari pembocor', 'Buat tak endah di depan orang'],
    results: ['Anda jumpa dia. Pejabat jadi lebih kemas, lebih senyap dan lebih takut.', '“Semua parti tulis memo.” Betul, dan ia tak ubah fikiran sesiapa di kerusi yang anda lepaskan.'],
  },
  internRevolt: {
    title: 'Sukarelawan nak dibayar',
    body: 'Anak-anak muda yang uruskan media sosial anda dah kira kadar upah sejam mereka. Kira-kiranya pendek. Mereka siarkan, siap dengan carta.',
    options: ['Bayar mereka betul-betul', '“Pengalaman tu ganjarannya”'],
    results: ['Sekarang anda bayar sukarelawan, dan mereka siarkan benda tu juga.', 'Carta tu dikemas kini untuk masukkan ayat anda.'],
  },
  speechwriter: {
    title: 'Perenggan yang macam pernah dengar',
    body: 'Bahagian terbaik ucapan anda di perhimpunan rupa-rupanya pernah disampaikan oleh seorang senator Amerika pada 1988. Penulis ucapan anda kata orang bijak fikir serupa.',
    options: ['Mengaku dan gelak sekali', 'Kata seorang kakitangan dah dikenakan tindakan'],
    results: [
      'Sehari jadi bahan jenaka, lepas tu senyap.',
      ['Tak ada siapa tanya lanjut.', 'Kakitangan tu bagi temu bual. Rupa-rupanya anda yang suka perenggan tu.'],
    ],
  },

  talkShow: {
    title: 'Jemputan yang patut ditolak',
    body: 'Rancangan bual bicara paling ramai penonton nak anda sejam. Pengacaranya dah tamatkan tiga kerjaya, dengan penuh sopan.',
    options: ['Pergi', 'Tolak'],
    results: [
      ['Anda bertahan. Orang yang tak pernah undi anda pun mengaku.', 'Klip anda tercari-cari jawapan cuma sebelas saat. Rasa macam lebih lama.'],
      'Nama anda dipaparkan pada kerusi kosong.',
    ],
  },
  deepfake: {
    title: 'Rakaman yang anda tak pernah buat',
    body: 'Satu klip audio tersebar; dalamnya anda hina pengundi sendiri. Ia palsu, dan dibuat sangat kemas.',
    options: ['Upah pakar bedah klip tu depan orang ramai', 'Abaikan', 'Jadikan bahan jenaka'],
    results: [
      'Laporan forensik teliti dan membosankan, memang itu yang diperlukan.',
      ['Ia reda menjelang hujung minggu.', 'Diam dianggap mengaku.'],
      ['Parodi anda terhadap klip palsu tu lebih laku daripada klip tu sendiri.', 'Separuh negara sekarang ingat anda bergurau pasal benda yang anda memang pernah cakap.'],
    ],
  },
  editorDinner: {
    title: 'Makan malam dengan para editor',
    body: 'Luar rekod, enam editor, satu meja panjang. Mereka nak tahu apa sebenarnya pendapat anda. Semua orang yang mereka akan beritahu pun nak tahu.',
    options: ['Cakap terus terang', 'Ikut skrip'],
    results: [
      ['Anda dapat lebih daripada yang anda dedahkan, dan mereka suka keterbukaan anda.', '“Luar rekod” bertahan sampai kopi dihidang.'],
      'Malam yang menyenangkan, tapi tak ada apa-apa yang dicakapkan.',
    ],
  },
  newsroomRaid: {
    title: 'Polis melawat bilik berita',
    body: 'Pegawai rampas komputer sebuah portal berita lepas laporan pasal seorang menteri. Portal tu sekarang terbit dari kedai kopi, dan pembacanya naik tiga kali ganda.',
    options: ['Pertahankan polis', 'Kata akhbar mesti bebas melapor'],
    results: ['Kerajaan rapatkan barisan. Para editor negara buka fail pasal tu.', 'Anda cakap apa yang patut dicakap. Ada rakan yang tak akan lupa anda cakap.'],
  },
  filmBan: {
    title: 'Lembaga penapis nak haramkan filem',
    body: 'Lembaga kata sebuah filem tempatan baharu menyinggung kesusilaan awam. Belum ada yang tonton, tapi itu tak halang sesiapa pun daripada ada pendapat.',
    options: ['Kekalkan pengharaman', 'Batalkan keputusan lembaga'],
    results: ['Filem tu diharamkan dan dimuat turun empat juta kali.', 'Filem tu ditayangkan dengan panggung penuh, dan bantahan di luar setiap satunya.'],
  },

  ringgitSlide: {
    title: 'Ringgit merudum',
    body: 'Mata wang susut sepersepuluh nilainya dalam sebulan. Pengimport cemas, pengeksport diam, dan cuti semua orang jadi lagi mahal.',
    options: ['Pertahankan dengan rizab', 'Biar ia cari parasnya'],
    results: ['Kejatuhan terhenti. Rizab menipis kerananya.', 'Harga naik, eksport pulih, dan pasaran catat yang anda tak panik.'],
  },
  tolls: {
    title: 'Konsesi tol tamat',
    body: 'Kontrak lebuh raya kena diperbaharui. Setiap kerajaan janji mansuhkan tol, dan setiap kerajaan lepas tu baca kontraknya.',
    options: ['Mansuhkan tol dan bayar pampasan syarikat', 'Bekukan kadar', 'Biar naik macam dipersetujui'],
    results: ['Palang tol diturunkan. Bilnya pergi ke Perbendaharaan.', 'Tak ada siapa gembira dan tak ada siapa marah.', 'Kontrak dihormati. Pengguna lebuh raya akan ingat.'],
  },
  riceShortage: {
    title: 'Beras tempatan hilang dari rak',
    body: 'Pembeli merakam rak kosong tempat beras tempatan murah biasanya disusun. Beras import banyak, harga dua kali ganda.',
    options: ['Import dan beri subsidi', 'Salahkan penyorok'],
    results: [
      'Rak penuh balik. Bil subsidi pun sama.',
      ['Serbuan gudang masuk berita malam, dan rak penuh tak lama lepas tu.', 'Tak jumpa penyorok pun. Rak kekal kosong dan salah berbalik pada anda.'],
    ],
  },
  megaProject: {
    title: 'Landasan merentas negara',
    body: 'Kontraktor asing tawar landasan kereta api dari pantai ke pantai, lengkap dengan pinjaman. Pantai timur mahukannya. Perbendaharaan nak baca cetakan halusnya.',
    options: ['Tandatangan', 'Batalkan', 'Hantar balik minta harga lebih baik'],
    results: [
      'Majlis pecah tanah berlangsung, dengan penyodok emas. Bayaran balik bermula dalam tiga tahun.',
      'Anda jimat duit tapi terlepas gambar kenangan.',
      ['Mereka balik dengan harga sepertiga lebih murah. Anda nampak macam orang yang pandai baca kontrak.', 'Mereka tarik diri, dan sebut sebabnya.'],
    ],
  },
  gigStrike: {
    title: 'Rider tutup app',
    body: 'Rider penghantar makanan di bandar-bandar log keluar sebab kadar upah dipotong. Makan malam lewat di mana-mana, dan syarikat platform kata tangan mereka terikat dengan pasaran.',
    options: ['Berdiri bersama rider', 'Berdiri bersama platform', 'Jangan masuk campur'],
    results: ['Anda membonceng ke piket. Rider akan ingat; pemilik restoran pun sama.', 'Syarikat platform berterima kasih, dengan cara biasa.', 'Anda nyatakan kebimbangan. Tak ada siapa petik.'],
  },
  dryTaps: {
    title: 'Paip kering',
    body: 'Pencemaran tutup sebuah loji rawatan, dan sejuta rumah terputus bekalan air buat kali keempat tahun ni.',
    options: ['Hantar lori tangki berlogo parti', 'Salahkan sesiapa yang tadbir negeri'],
    results: [
      'Lori tangki dirakam. Logo pun sama.',
      ['Salah tu melekat di tempat anda baling.', 'Ada orang tunjuk yang parti anda sendiri uruskan syarikat air tu.'],
    ],
  },
  pensionCall: {
    title: 'Biar kami keluarkan duit sendiri',
    body: 'Satu kempen nak rakyat dibenarkan keluarkan simpanan persaraan sekarang. Kebanyakan yang akan buat macam tu simpanannya sikit, dan memang terdesak.',
    options: ['Sokong pengeluaran', 'Bantah'],
    results: ['Anda disorak. Ahli ekonomi tulis surat bersama.', 'Anda betul, tapi di pasar rasanya tak macam tu.'],
  },
  subsidyReform: {
    title: 'Subsidi bahan api',
    body: 'Separuh subsidi bahan api pergi pada orang yang paling kurang memerlukannya. Pelan penyasaran dah siap sedekad, menunggu seseorang yang berani atau nekad.',
    options: ['Laksanakan', 'Simpan balik dalam laci'],
    results: ['Harga naik, bajet lega, dan kelas pertengahan dah catat nama anda.', 'Pelan tu balik ke laci. Dia dah hafal jalannya.'],
  },
  foreignWorkers: {
    title: 'Siapa yang buat kerja',
    body: 'Kilang dan ladang kata mereka tak boleh jalan tanpa lebih ramai pekerja asing. Kesatuan kata boleh, kalau gajinya lebih baik.',
    options: ['Buka pintu lebih luas', 'Bekukan pengambilan'],
    results: ['Kilang berdengung balik. Kesatuan tak.', 'Gaji naik sikit. Papan tanda “tutup sementara” pun sama.'],
  },
  windfall: {
    title: 'Durian runtuh',
    body: 'Harga minyak naik dan hasil pun naik: beberapa bilion lebih daripada jangkaan bajet. Semua orang ada pendapat pasal duit siapa tu.',
    options: ['Bayar hutang', 'Bantuan tunai untuk setiap isi rumah', 'Bahagian lebih besar untuk Sabah dan Sarawak'],
    results: ['Tak ada siapa ucap terima kasih. Agensi penarafan hantar kad ucapan.', 'Duit tu habis menjelang hujung minggu, dan harga barang ikut naik.', 'Kuching dan Kota Kinabalu gembira. Semenanjung tanya mana bahagiannya.'],
  },
  haze: {
    title: 'Jerebu datang balik',
    body: 'Asap dari seberang selat tutup sekolah dan lapangan terbang. Setiap tahun berlaku, setiap tahun terkejut.',
    options: ['Panggil duta', 'Edarkan pelitup muka dan tutup sekolah'],
    results: ['Kata-kata keras bertukar. Angin tak dirunding.', 'Ia menelan belanja dan ia cekap, yang lagi jarang.'],
  },

  youthQuota: {
    title: 'Sepertiga kerusi untuk orang muda',
    body: 'Sayap pemuda tuntut sepertiga calon anda berusia bawah empat puluh. Ahli yang lebih empat puluh, iaitu kebanyakannya, ada perasaan pasal hal ni.',
    options: ['Setuju', 'Tolak'],
    results: ['Sayap pemuda bersorak. Beberapa ketua bahagian tiba-tiba sedar mereka lebih muda daripada yang tercatat.', 'Orang lama lega. Orang muda tengah merangka sesuatu.'],
  },
  topTable: {
    title: 'Meja utama',
    body: 'Ketua sayap wanita tunjuk, siap dengan gambar, yang pimpinan parti nampak macam reunion sebuah sekolah lelaki.',
    options: ['Letak wanita di jawatan tertinggi', 'Kata jawatan diisi ikut merit'],
    results: ['Tiga muka baharu di meja utama, dan tiga lelaki cari orang untuk disalahkan.', '“Merit.” Gambar tu tersebar lagi, dengan perkataan tu sebagai kapsyen.'],
  },
  founderMemoir: {
    title: 'Memoir pengasas',
    body: 'Pengasas parti terbitkan memoir pada usia sembilan puluh. Bab sebelas pasal anda. Tajuknya “Kekecewaan”.',
    options: ['Bersikap tenang', 'Jawab balik'],
    results: ['“Beliau berhak atas kenangannya.” Buku tu tetap habis dijual.', 'Anda menang berhujah dengan orang sembilan puluh tahun. Nikmatilah.'],
  },
  branchBrawl: {
    title: 'Kerusi terbang di mesyuarat cawangan',
    body: 'Pertikaian siapa nak pengerusikan bahagian diselesaikan dengan baling kerusi. Ada orang rakam, dan letak muzik.',
    options: ['Gantung kedua-dua puak', 'Gelarkannya “semangat cintakan parti”'],
    results: ['Kedua-dua puak digantung dan, buat pertama kali, bersatu: menentang anda.', 'Remix dia sangat popular.'],
  },
  defectorsKnock: {
    title: 'Tiga wakil rakyat nak melompat',
    body: 'Tiga Ahli Parlimen lawan tak gembira di tempat mereka dan akan gembira di tempat anda. Mereka ada syarat. Mereka sentiasa ada syarat.',
    options: ['Sambut mereka', 'Tolak atas dasar prinsip'],
    results: ['Mereka melompat. Ahli anda sendiri, yang lawan tiga orang tu pada pilihan raya lepas, tak meraikannya.', 'Anda tolak mereka, dan beritahu sebabnya. Orang percaya anda sikit lagi.'],
  },
  partyPolls: {
    title: 'Pemilihan parti',
    body: 'Setiap tiga tahun parti pilih pimpinan sendiri. Tahun ni muncul seorang pencabar, dengan duit di belakangnya dan slogan pasal permulaan baharu.',
    options: ['Lawan terbuka', 'Buat perjanjian dengan pencabar'],
    results: [
      ['Anda menang besar. Parti ni milik anda semula.', 'Anda bertahan, tipis, dan semua orang nampak betapa tipisnya.'],
      'Pencabar tarik diri dan jadi timbalan anda. Tak ada siapa tanya harganya.',
    ],
  },
  merchandise: {
    title: 'Baju-T tu',
    body: 'Baju-T kempen parti berharga tiga kali ganda harga pasaran. Pembekalnya syarikat milik ipar bendahari.',
    options: ['Arahkan audit', 'Diam dan tukar pembekal'],
    results: [
      'Audit jumpa apa yang audit biasa jumpa. Puak bendahari membara.',
      ['Tak ada siapa perasan.', 'Ada yang perasan, dan dia simpan invoisnya.'],
    ],
  },
  oldGuard: {
    title: 'Muka baharu',
    body: 'Separuh barisan depan anda dah ada masa parti ditubuhkan. Pakar strategi anda nak calon yang belum lahir masa televisyen mula-mula ada.',
    options: ['Minta orang lama beri laluan', 'Kekalkan orang lama'],
    results: ['Mereka berundur, dengan ucapan. Ada ucapan yang sebut nama anda.', 'Pengalaman penting. Undi bawah tiga puluh, di tempat lain, pun sama.'],
  },

  acquittal: {
    title: 'Seorang lawan dibebaskan',
    body: 'Mahkamah tolak pertuduhan rasuah terhadap seorang pemimpin kanan lawan. Dia berdiri di tangga dengan kalungan bunga, berterima kasih kepada hakim dan berjanji nak balas dendam.',
    options: ['Kata mahkamah mesti dihormati', 'Tuntut rayuan'],
    results: ['Hambar, betul, dan dicatat oleh mereka yang hargai benda tu.', 'Golongan reformis bersorak. Dia dah tambah nama anda dalam senarainya.'],
  },
  boundaries: {
    title: 'Sempadan baharu',
    body: 'Suruhanjaya Pilihan Raya cadangkan sempadan kawasan baharu. Secara kebetulan ia bagi parti anda kira-kira lapan kerusi tambahan.',
    options: ['Terima hadiah tu', 'Hantar balik'],
    results: ['Peta tu lulus. Sikit lagi kepercayaan rakyat terhadap pengadil pun lulus.', 'Anda hantar balik. Ahli sendiri ingat anda gila; orang lain ingat anda mungkin serius.'],
  },
  auditReport: {
    title: 'Ketua Audit Negara melapor',
    body: 'Laporan tahun ni jumpa sebuah kementerian yang beli empat puluh laptop pada harga empat ratus, dan sebuah jambatan tanpa sungai.',
    options: ['Pecat yang bertanggungjawab', 'Tubuhkan jawatankuasa'],
    results: ['Ada yang dipecat, sebahagiannya berkabel besar. Kerajaan lebih goyah dan lebih dihormati.', 'Jawatankuasa akan melapor pada masanya. Semua orang tahu maksudnya.'],
  },
  custodyDeath: {
    title: 'Kematian dalam tahanan',
    body: 'Seorang pemuda yang ditahan sebab motosikal curi meninggal dunia di lokap polis. Keluarganya nak jawapan, dan jawapan setakat ni tak sepadan antara satu sama lain.',
    options: ['Tubuhkan siasatan bebas', 'Serahkan pada siasatan dalaman'],
    results: ['Siasatan tu bertaring. Polis tak senang dan rakyat memerhati.', 'Siasatan dalaman bersihkan semua orang. Tak ada siapa terkejut dan tak ada siapa puas hati.'],
  },
  whistleblower: {
    title: 'Sampul coklat',
    body: 'Seorang penjawat awam bawa dokumen yang tunjuk kontrak diberi tanpa tender. Sama ada ia berita terbesar tahun ni atau perangkap.',
    options: ['Dedahkan', 'Serahkan pada agensi antirasuah'],
    results: [
      ['Dokumen tu tulen. Kerajaan habiskan seminggu menjelaskannya.', 'Satu muka surat dipalsukan. Itulah satu-satunya muka surat yang orang cakap.'],
      'Anda ikut saluran yang betul. Agensi kata ia sedang meneliti perkara tu, dan anda simpan salinan.',
    ],
  },
  shadowCabinet: {
    title: 'Kabinet bayangan',
    body: 'Media asyik tanya siapa akan pegang kementerian kalau anda menang. Menamakan orang jawab soalan tu, dan beritahu yang tak dinamakan di mana kedudukan mereka.',
    options: ['Namakan pasukan penuh', 'Kekal samar'],
    results: ['Anda nampak macam kerajaan menunggu. Yang tak dinamakan nampak macam pembangkang di dalamnya.', '“Sampai masanya nanti.” Rakan-rakan anda terus berharap.'],
  },

  borneoThird: {
    title: 'Sepertiga Parlimen untuk Borneo',
    body: 'Sabah dan Sarawak nak sepertiga kerusi Parlimen, macam yang mereka kata difahami masa persekutuan dibentuk. Parti Semenanjung yang akan bayar dengan kerusi.',
    options: ['Sokong', 'Cadangkan kajian'],
    results: ['Borneo dengar pemimpin Semenanjung cakap ya. Mereka akan tuntut.', 'Satu lagi kajian. Borneo dah ada satu rak penuh.'],
  },
  oilRights: {
    title: 'Minyak siapa',
    body: 'Sarawak lulus undang-undang yang tuntut minyak dan gas di luar pantainya. Syarikat minyak negara ada peguam, Kuching pun sama.',
    options: ['Akur dengan tuntutan tu', 'Jumpa di mahkamah'],
    results: ['Perjanjian ditandatangani. Ia bebankan bajet persekutuan selama satu generasi, tapi keamanan terjaga.', 'Writ difailkan. Hubungan dengan Kuching tak pernah seteruk ni dalam beberapa dekad.'],
  },
  borneoHighway: {
    title: 'Jalan yang tak sudah-sudah',
    body: 'Lebuh raya merentas Borneo sepatutnya siap lima tahun lepas. Video sebuah lori terbenam sampai gandar di bahagian yang “dah siap” dah sampai ke Semenanjung.',
    options: ['Pergi tengok sendiri, dan nyatakan sokongan', 'Keluarkan kenyataan'],
    results: ['Anda pandu sendiri, perlahan-lahan. Borneo sedar anda datang.', 'Kenyataan tu dicatat, dan difailkan bersama yang lain.'],
  },
  peninsulaGaffe: {
    title: 'Orang anda tentang Borneo',
    body: 'Seorang wakil rakyat Semenanjung anda terangkan depan kamera yang orang Sabah patut bersyukur dengan apa yang dapat. Dia juga salah sebut tiga nama tempat.',
    options: ['Lucutkan jawatannya', 'Kata dia disalah petik'],
    results: ['Dia sekarang di barisan belakang, dan kawan-kawan dia merajuk.', 'Dia tak disalah petik. Ada video.'],
  },
  stateDefiance: {
    title: 'Ketua negeri sendiri pun degil',
    body: 'Ketua kerajaan negeri yang parti anda perintah umum dasar yang anda tentang, dan tambah yang negeri tak ditadbir dari ibu pejabat parti.',
    options: ['Biarkan', 'Tegur secara rasmi'],
    results: ['Negeri tu ikut haluan sendiri. Orang tanya siapa yang pimpin parti.', 'Dia berundur, di depan orang ramai, dan tak akan lupa di belakang tabir.'],
  },

  durianFeast: {
    title: 'Makan durian dengan lawan',
    body: 'Seorang pemimpin lawan jemput anda ke dusunnya untuk buah pertama musim ni. Mesti ada kamera. Mesti ada juga durian yang sangat sedap.',
    options: ['Pergi', 'Minta maaf tak dapat hadir'],
    results: ['Anda makan dengan tangan dan berbual sejam. Golongan keras dalam parti anda dah tengok gambarnya.', 'Anda tak datang. Dia makan bahagian anda.'],
  },
  footballFinal: {
    title: 'Perlawanan akhir',
    body: 'Pasukan kebangsaan ke perlawanan akhir buat pertama kali dalam satu generasi. Setiap ahli politik tiba-tiba jumpa cinta seumur hidup terhadap bola sepak.',
    options: ['Terbang ke stadium', 'Tengok di kedai mamak dengan pengundi'],
    results: [
      ['Mereka menang, dan anda ada dalam gambar.', 'Mereka kalah. Internet putuskan anda pembawa sial.'],
      'Anda menjerit pada skrin yang sama macam orang lain. Ada yang perasan.',
    ],
  },
  openHouse: {
    title: 'Musim rumah terbuka',
    body: 'Musim raya tiba dan setiap pemimpin dijangka jamu negara. Soalnya, nak jamu semua serentak ke tak.',
    options: ['Anjur satu rumah terbuka gergasi', 'Kunjungi seratus yang kecil'],
    results: ['Empat puluh ribu orang, sembilan tan rendang dan barisan yang nampak dari lebuh raya.', 'Anda makan di seratus meja. Cawangan gembira; doktor anda tak.'],
  },
  danceTrend: {
    title: 'Tarian tu',
    body: 'Pasukan media anda ada rancangan. Ia melibatkan anda, sebuah lagu dengan lapan puluh juta tontonan, dan lima belas saat koreografi.',
    options: ['Menari', 'Tolak, dengan bermaruah'],
    results: [
      ['Entah macam mana, ia comel. Orang muda kongsi tanpa sindiran.', 'Ia dikongsi, dengan sindiran.'],
      'Maruah terpelihara. Pasukan media merajuk.',
    ],
  },
  examLeak: {
    title: 'Kertas peperiksaan bocor',
    body: 'Kertas peperiksaan lepasan sekolah tersebar di telefon malam sebelumnya. Setengah juta keluarga nak tahu apa jadi sekarang.',
    options: ['Semua duduki semula', 'Laraskan markah dan teruskan'],
    results: ['Minggu yang susah untuk pelajar, tapi keputusan yang betul.', 'Tak ada siapa percaya keputusan tahun ni, termasuk universiti.'],
  },
  potholes: {
    title: 'Lelaki yang tampal lubang jalan',
    body: 'Seorang mekanik bersara tampal lubang jalan di pekannya dengan simen sendiri, dan cat tarikh majlis mula-mula dimaklumkan di sebelah setiap satu.',
    options: ['Capai penyodok dan sertai dia', 'Janjikan audit pembaikan jalan'],
    results: [
      ['Dia benarkan anda tolong. Gambarnya cantik.', 'Dia beritahu kamera yang anda pegang penyodok terbalik.'],
      'Audit dijanjikan. Dia dah cat tarikhnya.',
    ],
  },
  shophouses: {
    title: 'Sederet rumah kedai lama',
    body: 'Sebuah pemaju nak ganti sederet rumah kedai sebelum perang dengan menara. Keluarga yang berniaga di situ empat generasi lebih suka ia tak berlaku.',
    options: ['Berpihak pada peniaga', 'Berpihak pada pemaju'],
    results: ['Deretan tu kekal. Pemaju dan kawan-kawannya akan derma ke tempat lain.', 'Menara tu akan dinamakan Residensi Warisan.'],
  },
  roguePoll: {
    title: 'Tinjauan yang tak ada siapa percaya',
    body: 'Sebuah firma tinjauan yang tak pernah didengari tunjuk anda ketinggalan sepuluh mata. Karut, tapi ia jadi tajuk utama di mana-mana.',
    options: ['Terbitkan angka sendiri', 'Gelakkan saja'],
    results: [
      'Angka firma anda dilaporkan sewajarnya, di bahagian bawah muka surat.',
      ['Jenaka tu mengena. Firma tu sekarang senyap.', 'Ahli anda sendiri tanya mana tahu betul.'],
    ],
  },
  marketScolding: {
    title: 'Kena leter di pasar',
    body: 'Seorang peniaga sayur beritahu anda, panjang lebar dan depan kamera, berapa harga sekilo cili dan apa dia fikir pasal orang yang tak tahu.',
    options: ['Dengar, dan ucap terima kasih', 'Terangkan statistiknya'],
    results: ['Anda dengar semuanya. Dia bagi anda sebungkus cili dan satu jelingan.', 'Angka anda tepat. Angka dia tertera pada tanda harga.'],
  },
};
