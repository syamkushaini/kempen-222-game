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
    title: 'Ketua bahagian menuntut balasan',
    body: 'Tiga puluh tahun mereka mengangkat kotak, menggantung sepanduk dan menghantar undi untuk anda. Kini mereka mahu menjadi calon. Semuanya.',
    options: ['Janjikan kerusi kepada mereka', 'Katakan calon dipilih atas merit'],
    results: ['Ketua bahagian berpuas hati. Golongan reformis dalam parti tidak.', 'Anda mengatakannya dengan lembut. Mereka tetap mendengarnya.'],
  },
  organiserReunion: {
    title: 'Kawan lama minta tolong',
    body: 'Dialah pengerusi cawangan tempat anda bermula. Syarikat anaknya membida kontrak kecil majlis, dan dia tertanya-tanya sama ada anda masih ingat kawan.',
    options: ['Ingat kawan', 'Ingat prinsip'],
    results: ['Kontrak diberikan. Begitu juga, secara senyap, satu reputasi.', 'Dia pulang tanpa menghabiskan tehnya. Cawangan sudah mendengar versinya.'],
  },
  technocratLecture: {
    title: '“Profesor”',
    body: 'Anda ditanya tentang harga telur di sebuah kenduri dan menjawab selama empat puluh minit, siap dengan gambar rajah. Klip itu ditonton dua juta kali dan anda mendapat gelaran.',
    options: ['Terima sahaja: “Ya, saya membosankan. Itulah yang anda perlukan.”', 'Upah jurulatih pidato'],
    results: [
      ['Menjadi. “Bosan” kini sohor kini, dan kelas pertengahan berasa tenang.', 'Orang kampung memutuskan anda menganggap mereka bodoh.'],
      'Kini anda boleh menerangkan inflasi dalam masa seminit. Hampir.',
    ],
  },
  technocratOffer: {
    title: 'Tawaran kerja di luar negara',
    body: 'Sebuah bank pembangunan di Washington mahu anda kembali, dengan gaji yang lebih banyak digitnya. Tawaran itu sampai ke akhbar sebelum sampai ke keluarga anda.',
    options: ['Tolak secara terbuka, serta-merta', 'Biarkan khabar angin berlegar seminggu'],
    results: [
      'Anda kekal. Parti sedar anda boleh sahaja pergi.',
      ['Mereka merayu anda supaya kekal. Anda bersetuju dengan penuh budi.', 'Tiada siapa merayu. Dua timbalan anda sudah mengukur langsir pejabat anda.'],
    ],
  },
  firebrandSpeech: {
    title: 'Ucapan dari zaman lain',
    body: 'Seseorang menemui pita rakaman itu. Anda berusia dua puluh dua, di atas lori, memanggil separuh daripada rakan semeja anda sekarang pencuri dan separuh lagi pengecut.',
    options: ['Pertahankan setiap patah kata', 'Katakan anda masih muda ketika itu'],
    results: ['Pengundi suka diri anda yang dahulu. Rakan-rakan sedang menyemak mereka dalam separuh yang mana.', 'Anda memang muda. Anda juga betul, dan semua tahu anda tahu.'],
  },
  firebrandRally: {
    title: 'Orang ramai mahukan bulan',
    body: 'Sepuluh ribu orang dalam hujan, melaungkan janji yang tidak mampu anda buat. Mikrofon di tangan anda.',
    options: ['Janjikan', 'Beritahu mereka kosnya'],
    results: [
      'Sorakan terdengar hingga tiga kampung. Begitu juga, kemudiannya, kira-kira Perbendaharaan.',
      ['Mereka mendengar. Khalayak yang sanggup mendengar kira-kira ialah khalayak yang berharga.', 'Bunyi hujan pun kedengaran. Begitulah senyapnya.'],
    ],
  },
  tycoonAudit: {
    title: 'Pejabat cukai masih ingat anda',
    body: 'Audit ke atas syarikat yang anda jual bertahun-tahun lalu. Masanya mungkin kebetulan; tiada sesiapa dalam politik percaya pada kebetulan.',
    options: ['Buka semua buku akaun', 'Katakan ia serangan politik'],
    results: [
      'Akauntan mahal dan audit bersih. Kebanyakannya bersih.',
      ['Rakyat terhidu penganiayaan, dan berpihak kepada anda.', 'Mereka menerbitkan angkanya. Angka itu tidak membantu.'],
    ],
  },
  tycoonFriends: {
    title: 'Sepatah dua kata tentang lesen',
    body: 'Rakan niaga lama anda tidak akan meminta sesuatu yang tidak wajar. Dia cuma tertanya-tanya kalau-kalau kementerian boleh melihat semula permohonannya. Dia juga membawa derma, secara berasingan.',
    options: ['Buat satu panggilan telefon', 'Tunjukkan pintu keluar'],
    results: ['Permohonan itu dilihat semula. Derma itu pun masuk.', 'Dia tersinggung. Kawan-kawannya, yang juga penderma, turut tersinggung bagi pihaknya.'],
  },
  fixerDebt: {
    title: 'Buku hutang budi',
    body: 'Lima belas tahun lalu anda menyelamatkan seorang ahli politik muda daripada muflis dan tidak pernah mengungkitnya. Kini dia duduk di barisan hadapan pihak lawan, dan dia tahu banyak perkara.',
    options: ['Tuntut hutang itu', 'Biarkan dalam buku'],
    results: ['Dia membayar dengan dokumen. Fail anda lebih tebal, dan hati nurani anda pernah melihat yang lebih teruk.', 'Ada hutang yang lebih bernilai jika tidak dituntut.'],
  },
  fixerProfile: {
    title: '“Orang yang Mengira”',
    body: 'Sebuah majalah sedang menulis enam ribu patah perkataan tentang cara anda berunding. Wartawannya sudah membuat kerja rumah, dan itulah masalahnya.',
    options: ['Duduk bersamanya dan pikat dia', 'Bercakap dengan editornya'],
    results: [
      ['Profil itu menggelar anda “tidak boleh diganti”. Anda sudah membingkaikannya.', 'Profil itu menggelar anda “punca tiada apa berubah”. Kini semua orang pun begitu.'],
      'Rencana itu digugurkan. Editor itu akan meminta sesuatu suatu hari nanti.',
    ],
  },
  activistVigil: {
    title: 'Ulang tahun',
    body: 'Dua puluh tahun sejak mereka datang menjemput anda pada pukul empat pagi. Penyokong lama anda mengadakan himpunan nyalaan lilin, dan mereka mengosongkan tempat di hadapan.',
    options: ['Hadir, dan berucap', 'Kenang secara peribadi'],
    results: ['Anda berucap tanpa nota. Orang muda belum pernah mendengar kisah itu; golongan lama berharap mereka tidak akan mendengarnya.', 'Anda menyalakan lilin di rumah. Ada perkara yang bukan untuk kempen.'],
  },
  activistComrades: {
    title: 'Kawan seperjuangan, rungutan baharu',
    body: 'Mereka yang pernah berarak bersama anda menulis surat terbuka. Perkataan “khianat” muncul empat kali, dan “kompromi” disebut seolah-olah ia jenayah.',
    options: ['Temui mereka dan dengar', 'Balas bahawa memerintah bukan berarak'],
    results: ['Tiga jam, tiada persetujuan, dan sedikit lagi rasa hormat di kedua-dua pihak.', 'Ayat itu memang bagus. Harganya ialah mereka yang mengajar anda ayat-ayat pertama anda.'],
  },

  staffPoached: {
    title: 'Tawaran lebih lumayan',
    body: 'Salah seorang kakitangan terbaik anda ditawarkan gaji dua kali ganda oleh parti lawan, dan dengan sopannya memberitahu anda sebelum bersetuju.',
    options: ['Samakan tawaran itu', 'Rayu atas nama kesetiaan'],
    results: [
      'Dia kekal. Seluruh pejabat kini tahu harga kesetiaan.',
      ['Dia kekal demi perjuangan. Anda berjanji tidak akan melupakannya.', 'Dia pergi, membawa bersama satu kabinet fail pengetahuan.'],
    ],
  },
  staffLeak: {
    title: 'Memo itu',
    body: 'Memo strategi anda untuk pilihan raya akan datang tersiar di portal berita, termasuk muka surat bertajuk “kerusi yang kita sudah lepaskan”. Ahli di kerusi-kerusi itu pandai membaca.',
    options: ['Cari pembocor', 'Buat tidak endah di khalayak'],
    results: ['Anda menemuinya. Pejabat kini lebih kemas, lebih senyap dan lebih takut.', '“Semua parti menulis memo.” Benar, dan ia tidak mengubah fikiran sesiapa di kerusi yang anda lepaskan.'],
  },
  internRevolt: {
    title: 'Sukarelawan mahu dibayar',
    body: 'Anak-anak muda yang mengendalikan media sosial anda sudah mengira kadar upah sejam mereka. Kira-kiranya pendek. Mereka menyiarkannya, bersama carta.',
    options: ['Bayar mereka dengan sewajarnya', '“Pengalaman itulah ganjarannya”'],
    results: ['Kini anda membayar sukarelawan, dan mereka menyiarkan itu juga.', 'Carta itu dikemas kini dengan petikan kata-kata anda.'],
  },
  speechwriter: {
    title: 'Perenggan yang biasa didengar',
    body: 'Bahagian terbaik ucapan anda di perhimpunan rupa-rupanya pernah disampaikan seorang senator Amerika pada 1988. Penulis ucapan anda berkata orang bijak berfikir serupa.',
    options: ['Mengaku dan ketawakan sahaja', 'Katakan seorang kakitangan sudah dikenakan tindakan'],
    results: [
      'Sehari menjadi bahan jenaka, kemudian senyap.',
      ['Tiada siapa bertanya lanjut.', 'Kakitangan itu memberi wawancara. Rupa-rupanya anda yang berkenan dengan perenggan itu.'],
    ],
  },

  talkShow: {
    title: 'Jemputan yang patut ditolak',
    body: 'Rancangan bual bicara paling ramai penonton mahu anda selama sejam. Pengacaranya sudah menamatkan tiga kerjaya, dengan penuh sopan.',
    options: ['Hadir', 'Tolak'],
    results: [
      ['Anda bertahan. Orang yang tidak pernah mengundi anda pun mengakuinya.', 'Klip anda tercari-cari jawapan hanya sebelas saat. Terasa lebih lama.'],
      'Sebuah kerusi kosong ditayangkan dengan nama anda.',
    ],
  },
  deepfake: {
    title: 'Rakaman yang tidak pernah anda buat',
    body: 'Satu klip audio tersebar; dalamnya anda menghina pengundi sendiri. Ia palsu, dan dibuat dengan sangat baik.',
    options: ['Upah pakar membedahnya secara terbuka', 'Abaikan', 'Jadikan bahan jenaka'],
    results: [
      'Laporan forensiknya teliti dan membosankan, tepat seperti yang diperlukan.',
      ['Ia reda menjelang hujung minggu.', 'Diam dianggap pengakuan.'],
      ['Parodi anda terhadap klip palsu itu lebih laku daripada klip itu sendiri.', 'Separuh negara kini menyangka anda bergurau tentang sesuatu yang benar-benar anda ucapkan.'],
    ],
  },
  editorDinner: {
    title: 'Makan malam bersama para editor',
    body: 'Luar rekod, enam editor, satu meja panjang. Mereka mahu tahu apa sebenarnya pendapat anda. Begitu juga semua orang yang akan mereka beritahu.',
    options: ['Bercakap terus terang', 'Ikut skrip'],
    results: [
      ['Anda mendapat lebih banyak daripada yang anda dedahkan, dan mereka suka keterbukaan anda.', '“Luar rekod” bertahan hingga kopi dihidang.'],
      'Malam yang menyenangkan, tanpa apa-apa yang diperkatakan.',
    ],
  },
  newsroomRaid: {
    title: 'Polis melawat bilik berita',
    body: 'Pegawai merampas komputer sebuah portal berita selepas laporan tentang seorang menteri. Portal itu kini menerbit dari kedai kopi, dan pembacanya naik tiga kali ganda.',
    options: ['Pertahankan polis', 'Katakan akhbar mesti bebas melapor'],
    results: ['Kerajaan merapatkan barisan. Para editor negara membuka fail mengenainya.', 'Anda mengatakan apa yang perlu. Sesetengah rakan tidak akan lupa anda mengatakannya.'],
  },
  filmBan: {
    title: 'Lembaga penapis mahu sebuah filem diharamkan',
    body: 'Lembaga berkata sebuah filem tempatan baharu menyinggung kesusilaan awam. Belum ada yang menontonnya, tetapi itu tidak menghalang sesiapa daripada berpendapat.',
    options: ['Kekalkan pengharaman', 'Batalkan keputusan lembaga'],
    results: ['Filem itu diharamkan dan dimuat turun empat juta kali.', 'Filem itu ditayangkan dengan panggung penuh, dan bantahan di luar setiap satunya.'],
  },

  ringgitSlide: {
    title: 'Ringgit merudum',
    body: 'Mata wang susut sepersepuluh nilainya dalam sebulan. Pengimport cemas, pengeksport diam, dan percutian semua orang bertambah mahal.',
    options: ['Pertahankan dengan rizab', 'Biarkan ia mencari parasnya'],
    results: ['Kejatuhan terhenti. Rizab menipis kerananya.', 'Harga naik, eksport pulih, dan pasaran mencatat bahawa anda tidak panik.'],
  },
  tolls: {
    title: 'Konsesi tol tamat tempoh',
    body: 'Kontrak lebuh raya perlu diperbaharui. Setiap kerajaan berjanji memansuhkan tol, dan setiap kerajaan kemudian membaca kontraknya.',
    options: ['Mansuhkan tol dan bayar pampasan syarikat', 'Bekukan kadar', 'Biarkan naik seperti dipersetujui'],
    results: ['Palang tol diturunkan. Bilnya dihantar ke Perbendaharaan.', 'Tiada siapa gembira dan tiada siapa marah.', 'Kontrak dihormati. Pengguna lebuh raya akan mengingatinya.'],
  },
  riceShortage: {
    title: 'Beras tempatan hilang dari rak',
    body: 'Pembeli merakam rak kosong tempat beras tempatan murah biasanya disusun. Beras import banyak, pada harga dua kali ganda.',
    options: ['Import dan beri subsidi', 'Salahkan penyorok'],
    results: [
      'Rak kembali penuh. Begitu juga bil subsidi.',
      ['Serbuan gudang masuk berita malam, dan rak penuh tidak lama kemudian.', 'Tiada penyorok ditemui. Rak kekal kosong dan kesalahan berbalik kepada anda.'],
    ],
  },
  megaProject: {
    title: 'Landasan merentas negara',
    body: 'Kontraktor asing menawarkan landasan kereta api dari pantai ke pantai, lengkap dengan pinjamannya. Pantai timur mahukannya. Perbendaharaan mahu membaca cetakan halusnya.',
    options: ['Tandatangani', 'Batalkan', 'Hantar balik untuk harga lebih baik'],
    results: [
      'Majlis pecah tanah berlangsung, dengan penyodok emas. Bayaran balik bermula dalam tiga tahun.',
      'Anda menjimatkan wang dan terlepas gambar kenangan.',
      ['Mereka kembali dengan harga sepertiga lebih murah. Anda kelihatan seperti orang yang pandai membaca kontrak.', 'Mereka menarik diri, dan menyatakan sebabnya.'],
    ],
  },
  gigStrike: {
    title: 'Penghantar menutup aplikasi',
    body: 'Penghantar makanan di bandar-bandar log keluar kerana kadar upah dipotong. Makan malam lewat di mana-mana, dan syarikat platform berkata tangan mereka terikat oleh pasaran.',
    options: ['Berdiri bersama penghantar', 'Berdiri bersama platform', 'Jangan campur'],
    results: ['Anda membonceng ke piket. Penghantar akan ingat; begitu juga pemilik restoran.', 'Syarikat platform berterima kasih, dengan cara biasa.', 'Anda menyatakan kebimbangan. Tiada siapa memetiknya.'],
  },
  dryTaps: {
    title: 'Paip kering',
    body: 'Pencemaran menutup sebuah loji rawatan, dan sejuta rumah terputus bekalan air buat kali keempat tahun ini.',
    options: ['Hantar lori tangki berlogo parti', 'Salahkan sesiapa yang mentadbir negeri'],
    results: [
      'Lori tangki dirakam. Logo pun begitu.',
      ['Kesalahan melekat di tempat anda melemparnya.', 'Ada yang menunjukkan bahawa parti anda sendiri yang mengurus syarikat air itu.'],
    ],
  },
  pensionCall: {
    title: 'Biar kami keluarkan wang sendiri',
    body: 'Satu kempen mahu rakyat dibenarkan mengeluarkan simpanan persaraan sekarang. Kebanyakan yang akan berbuat demikian simpanannya sedikit, dan amat memerlukannya.',
    options: ['Sokong pengeluaran', 'Bantah'],
    results: ['Anda disorak. Ahli ekonomi menulis surat bersama.', 'Anda betul, tetapi di pasar rasanya tidak begitu.'],
  },
  subsidyReform: {
    title: 'Subsidi bahan api',
    body: 'Separuh subsidi bahan api pergi kepada mereka yang paling kurang memerlukannya. Pelan penyasaran sudah siap sedekad, menunggu seseorang yang berani atau nekad.',
    options: ['Laksanakan', 'Simpan semula ke dalam laci'],
    results: ['Harga naik, belanjawan lega, dan kelas pertengahan sudah mencatat nama anda.', 'Pelan itu kembali ke laci. Ia sudah hafal jalannya.'],
  },
  foreignWorkers: {
    title: 'Siapa yang membuat kerja',
    body: 'Kilang dan ladang berkata mereka tidak boleh beroperasi tanpa lebih ramai pekerja asing. Kesatuan berkata boleh, jika gajinya lebih baik.',
    options: ['Buka pintu lebih luas', 'Bekukan pengambilan'],
    results: ['Kilang berdengung semula. Kesatuan tidak.', 'Gaji naik sedikit. Begitu juga bilangan papan tanda “tutup sementara”.'],
  },
  windfall: {
    title: 'Durian runtuh',
    body: 'Harga minyak naik dan hasil pun naik: beberapa bilion lebih daripada jangkaan belanjawan. Semua orang ada pendapat tentang wang siapa itu.',
    options: ['Bayar hutang', 'Bantuan tunai untuk setiap isi rumah', 'Bahagian lebih besar untuk Sabah dan Sarawak'],
    results: ['Tiada siapa berterima kasih. Agensi penarafan menghantar kad ucapan.', 'Wang itu habis menjelang hujung minggu, dan harga barang menyusul naik.', 'Kuching dan Kota Kinabalu gembira. Semenanjung bertanya ke mana bahagiannya.'],
  },
  haze: {
    title: 'Jerebu kembali',
    body: 'Asap dari seberang selat menutup sekolah dan lapangan terbang. Ia berlaku setiap tahun, dan setiap tahun ia mengejutkan.',
    options: ['Panggil duta', 'Edar pelitup muka dan tutup sekolah'],
    results: ['Kata-kata keras bertukar-tukar. Angin tidak dirunding.', 'Ia menelan belanja dan ia cekap, sesuatu yang lebih jarang.'],
  },

  youthQuota: {
    title: 'Sepertiga kerusi untuk orang muda',
    body: 'Sayap pemuda menuntut sepertiga calon anda berusia bawah empat puluh. Ahli berusia lebih empat puluh, iaitu kebanyakannya, ada perasaan tentang hal ini.',
    options: ['Setuju', 'Tolak'],
    results: ['Sayap pemuda bersorak. Beberapa ketua bahagian mendapati mereka lebih muda daripada yang tercatat.', 'Orang lama lega. Orang muda sedang merangka sesuatu.'],
  },
  topTable: {
    title: 'Meja utama',
    body: 'Ketua sayap wanita menunjukkan, bersama sekeping gambar, bahawa pimpinan parti kelihatan seperti perjumpaan semula sebuah sekolah lelaki.',
    options: ['Lantik wanita ke jawatan tertinggi', 'Katakan jawatan diisi atas merit'],
    results: ['Tiga wajah baharu di meja utama, dan tiga lelaki mencari seseorang untuk dipersalahkan.', '“Merit.” Gambar itu tersebar lagi, dengan perkataan itu sebagai kapsyen.'],
  },
  founderMemoir: {
    title: 'Memoir pengasas',
    body: 'Pengasas parti menerbitkan memoirnya pada usia sembilan puluh. Bab sebelas tentang anda. Tajuknya “Kekecewaan”.',
    options: ['Bersikap tenang', 'Jawab balik'],
    results: ['“Beliau berhak atas kenangannya.” Buku itu tetap habis dijual.', 'Anda menang berhujah dengan orang berusia sembilan puluh tahun. Nikmatilah.'],
  },
  branchBrawl: {
    title: 'Kerusi berterbangan di mesyuarat cawangan',
    body: 'Pertikaian tentang siapa mempengerusikan bahagian diselesaikan dengan membaling kerusinya. Seseorang merakamnya, dan menambah muzik.',
    options: ['Gantung kedua-dua puak', 'Gelarkannya “semangat cintakan parti”'],
    results: ['Kedua-dua puak digantung dan, buat pertama kali, bersatu: menentang anda.', 'Versi campurannya sangat popular.'],
  },
  defectorsKnock: {
    title: 'Tiga wakil rakyat mahu menyeberang',
    body: 'Tiga Ahli Parlimen lawan tidak gembira di tempat mereka dan akan gembira di tempat anda. Mereka ada syarat. Mereka sentiasa ada syarat.',
    options: ['Terima mereka', 'Tolak atas dasar prinsip'],
    results: ['Mereka menyeberang. Ahli anda sendiri, yang melawan tiga orang itu pada pilihan raya lalu, tidak meraikannya.', 'Anda menolak mereka, dan menyatakan sebabnya. Orang percaya kepada anda sedikit lagi.'],
  },
  partyPolls: {
    title: 'Pemilihan parti',
    body: 'Setiap tiga tahun parti memilih pimpinannya sendiri. Tahun ini muncul seorang pencabar, dengan wang di belakangnya dan slogan tentang permulaan baharu.',
    options: ['Lawan secara terbuka', 'Buat perjanjian dengan pencabar'],
    results: [
      ['Anda menang besar. Parti ini milik anda semula.', 'Anda bertahan, tipis, dan semua orang nampak betapa tipisnya.'],
      'Pencabar menarik diri dan menjadi timbalan anda. Tiada siapa bertanya harganya.',
    ],
  },
  merchandise: {
    title: 'Baju-T itu',
    body: 'Baju-T kempen parti berharga tiga kali ganda harga pasaran. Pembekalnya syarikat milik ipar bendahari.',
    options: ['Arahkan audit', 'Diam dan tukar pembekal'],
    results: [
      'Audit menemui apa yang biasa ditemui audit. Puak bendahari membara.',
      ['Tiada siapa perasan.', 'Ada yang perasan, dan dia menyimpan invoisnya.'],
    ],
  },
  oldGuard: {
    title: 'Muka baharu',
    body: 'Separuh barisan hadapan anda sudah ada ketika parti ditubuhkan. Pakar strategi anda mahukan calon yang belum lahir ketika televisyen mula-mula tiba.',
    options: ['Minta orang lama memberi laluan', 'Kekalkan orang lama'],
    results: ['Mereka berundur, dengan ucapan. Ada ucapan yang menyebut nama anda.', 'Pengalaman itu penting. Begitu juga undi mereka yang berusia bawah tiga puluh, di tempat lain.'],
  },

  acquittal: {
    title: 'Seorang lawan dibebaskan',
    body: 'Mahkamah menolak pertuduhan rasuah terhadap seorang pemimpin kanan lawan. Dia berdiri di tangga dengan kalungan bunga, berterima kasih kepada hakim dan berjanji membalas.',
    options: ['Katakan mahkamah mesti dihormati', 'Tuntut rayuan'],
    results: ['Hambar, betul, dan dicatat oleh mereka yang menghargainya.', 'Golongan reformis bersorak. Dia sudah menambah nama anda ke dalam senarainya.'],
  },
  boundaries: {
    title: 'Sempadan baharu',
    body: 'Suruhanjaya Pilihan Raya mencadangkan sempadan kawasan baharu. Secara kebetulan ia memberi parti anda kira-kira lapan kerusi tambahan.',
    options: ['Terima hadiah itu', 'Hantar balik'],
    results: ['Peta itu diluluskan. Begitu juga sedikit lagi kepercayaan rakyat terhadap pengadil.', 'Anda menghantarnya balik. Ahli sendiri fikir anda gila; orang lain fikir anda mungkin serius.'],
  },
  auditReport: {
    title: 'Laporan Ketua Audit Negara',
    body: 'Laporan tahun ini menemui sebuah kementerian yang membeli empat puluh komputer riba pada harga empat ratus, dan sebuah jambatan tanpa sungai.',
    options: ['Pecat mereka yang bertanggungjawab', 'Tubuhkan jawatankuasa'],
    results: ['Ada yang dipecat, sebahagiannya berkabel besar. Kerajaan lebih goyah dan lebih dihormati.', 'Jawatankuasa akan melapor pada masanya. Semua orang tahu maksudnya.'],
  },
  custodyDeath: {
    title: 'Kematian dalam tahanan',
    body: 'Seorang pemuda yang ditahan kerana motosikal curi meninggal dunia di lokap polis. Keluarganya mahukan jawapan, dan jawapan setakat ini tidak sepadan antara satu sama lain.',
    options: ['Tubuhkan siasatan bebas', 'Serahkan kepada siasatan dalaman'],
    results: ['Siasatan itu bertaring. Polis tidak senang dan rakyat memerhati.', 'Siasatan dalaman membersihkan semua orang. Tiada siapa terkejut dan tiada siapa berpuas hati.'],
  },
  whistleblower: {
    title: 'Sampul coklat',
    body: 'Seorang penjawat awam membawa dokumen yang menunjukkan kontrak diberi tanpa tender. Ia sama ada berita terbesar tahun ini atau satu perangkap.',
    options: ['Dedahkan', 'Serahkan kepada agensi antirasuah'],
    results: [
      ['Dokumen itu tulen. Kerajaan menghabiskan seminggu menjelaskannya.', 'Satu muka surat dipalsukan. Itulah satu-satunya muka surat yang diperkatakan orang.'],
      'Anda mengikut saluran yang betul. Agensi berkata ia sedang meneliti perkara itu, dan anda menyimpan salinan.',
    ],
  },
  shadowCabinet: {
    title: 'Kabinet bayangan',
    body: 'Media asyik bertanya siapa akan mengetuai kementerian jika anda menang. Menamakan orang menjawab soalan itu, dan memberitahu yang tidak dinamakan di mana kedudukan mereka.',
    options: ['Namakan pasukan penuh', 'Kekal samar'],
    results: ['Anda kelihatan seperti kerajaan menanti. Yang tidak dinamakan kelihatan seperti pembangkang di dalamnya.', '“Sampai masanya nanti.” Rakan-rakan anda terus berharap.'],
  },

  borneoThird: {
    title: 'Sepertiga Parlimen untuk Borneo',
    body: 'Sabah dan Sarawak mahukan sepertiga kerusi Parlimen, seperti yang mereka katakan difahami ketika persekutuan dibentuk. Parti Semenanjung yang akan membayarnya dengan kerusi.',
    options: ['Sokong', 'Cadangkan kajian'],
    results: ['Borneo mendengar seorang pemimpin Semenanjung berkata ya. Mereka akan menuntutnya.', 'Satu lagi kajian. Borneo sudah ada serak penuh.'],
  },
  oilRights: {
    title: 'Minyak siapa',
    body: 'Sarawak meluluskan undang-undang yang menuntut minyak dan gas di luar pantainya. Syarikat minyak negara ada peguam, begitu juga Kuching.',
    options: ['Akur dengan tuntutan itu', 'Jumpa di mahkamah'],
    results: ['Perjanjian ditandatangani. Ia membebankan belanjawan persekutuan selama satu generasi, dan ia mengekalkan keamanan.', 'Writ difailkan. Hubungan dengan Kuching tidak pernah seburuk ini dalam beberapa dekad.'],
  },
  borneoHighway: {
    title: 'Jalan yang tidak sudah-sudah',
    body: 'Lebuh raya merentas Borneo sepatutnya siap lima tahun lalu. Video sebuah lori terbenam hingga ke gandar di bahagian yang “sudah siap” telah sampai ke Semenanjung.',
    options: ['Pergi melihatnya, dan nyatakan sokongan', 'Keluarkan kenyataan'],
    results: ['Anda memandunya sendiri, perlahan-lahan. Borneo sedar anda datang.', 'Kenyataan itu dicatat, dan difailkan bersama yang lain.'],
  },
  peninsulaGaffe: {
    title: 'Orang anda tentang Borneo',
    body: 'Seorang wakil rakyat Semenanjung anda menjelaskan di hadapan kamera bahawa orang Sabah patut bersyukur dengan apa yang diterima. Dia juga salah menyebut tiga nama tempat.',
    options: ['Lucutkan jawatannya', 'Katakan dia disalah petik'],
    results: ['Dia kini di barisan belakang, dan kawan-kawannya merajuk.', 'Dia tidak disalah petik. Ada videonya.'],
  },
  stateDefiance: {
    title: 'Ketua negeri anda sendiri',
    body: 'Ketua kerajaan negeri yang diperintah parti anda mengumumkan dasar yang anda tentang, dan menambah bahawa negeri tidak ditadbir dari ibu pejabat parti.',
    options: ['Biarkan', 'Tegur secara rasmi'],
    results: ['Negeri itu mengikut haluannya. Orang bertanya siapa yang memimpin parti.', 'Dia berundur, di khalayak, dan tidak akan melupakannya di belakang tabir.'],
  },

  durianFeast: {
    title: 'Makan durian bersama lawan',
    body: 'Seorang pemimpin lawan menjemput anda ke dusunnya untuk buah pertama musim ini. Akan ada kamera. Akan ada juga durian yang sangat sedap.',
    options: ['Pergi', 'Minta maaf tidak dapat hadir'],
    results: ['Anda makan dengan tangan dan berbual sejam. Golongan keras dalam parti anda sudah melihat gambarnya.', 'Anda tidak hadir. Dia memakan bahagian anda.'],
  },
  footballFinal: {
    title: 'Perlawanan akhir',
    body: 'Pasukan kebangsaan ke perlawanan akhir buat pertama kali dalam satu generasi. Setiap ahli politik tiba-tiba menemui cinta seumur hidup terhadap bola sepak.',
    options: ['Terbang ke stadium', 'Tonton di kedai mamak bersama pengundi'],
    results: [
      ['Mereka menang, dan anda ada dalam gambar.', 'Mereka kalah. Internet memutuskan anda pembawa sial.'],
      'Anda menjerit pada skrin yang sama seperti semua orang. Ada yang perasan.',
    ],
  },
  openHouse: {
    title: 'Musim rumah terbuka',
    body: 'Musim perayaan tiba dan setiap pemimpin dijangka menjamu negara. Soalnya, mahu menjamu semuanya serentak atau tidak.',
    options: ['Anjur satu rumah terbuka gergasi', 'Kunjungi seratus yang kecil'],
    results: ['Empat puluh ribu orang, sembilan tan rendang dan barisan yang kelihatan dari lebuh raya.', 'Anda makan di seratus meja. Cawangan gembira; doktor anda tidak.'],
  },
  danceTrend: {
    title: 'Tarian itu',
    body: 'Pasukan media anda ada rancangan. Ia melibatkan anda, sebuah lagu dengan lapan puluh juta tontonan, dan lima belas saat koreografi.',
    options: ['Menari', 'Tolak, dengan bermaruah'],
    results: [
      ['Entah bagaimana, ia comel. Orang muda berkongsinya tanpa sindiran.', 'Ia dikongsi, dengan sindiran.'],
      'Maruah terpelihara. Pasukan media merajuk.',
    ],
  },
  examLeak: {
    title: 'Kertas peperiksaan bocor',
    body: 'Kertas peperiksaan lepasan sekolah tersebar di telefon pada malam sebelumnya. Setengah juta keluarga mahu tahu apa yang berlaku sekarang.',
    options: ['Semua menduduki semula', 'Laraskan markah dan teruskan'],
    results: ['Minggu yang sukar untuk pelajar, dan keputusan yang betul.', 'Tiada siapa percaya keputusan tahun ini, termasuk universiti.'],
  },
  potholes: {
    title: 'Lelaki yang menampal lubang jalan',
    body: 'Seorang mekanik bersara menampal lubang jalan di pekannya dengan simen sendiri, dan mengecat tarikh majlis mula-mula dimaklumkan di sebelah setiap satu.',
    options: ['Capai penyodok dan sertai dia', 'Janjikan audit pembaikan jalan'],
    results: [
      ['Dia membenarkan anda membantu. Gambarnya cantik.', 'Dia memberitahu kamera bahawa anda memegang penyodok terbalik.'],
      'Audit dijanjikan. Dia sudah mengecat tarikhnya.',
    ],
  },
  shophouses: {
    title: 'Sederet rumah kedai lama',
    body: 'Sebuah pemaju mahu menggantikan sederet rumah kedai sebelum perang dengan menara. Keluarga yang berniaga di situ sejak empat generasi lebih suka ia tidak berlaku.',
    options: ['Berpihak kepada peniaga', 'Berpihak kepada pemaju'],
    results: ['Deretan itu kekal. Pemaju dan kawan-kawannya akan menderma ke tempat lain.', 'Menara itu akan dinamakan Residensi Warisan.'],
  },
  roguePoll: {
    title: 'Tinjauan yang tiada siapa percaya',
    body: 'Sebuah firma tinjauan yang tidak pernah didengari menunjukkan anda ketinggalan sepuluh mata. Ia karut, dan ia menjadi tajuk utama di mana-mana.',
    options: ['Terbitkan angka anda sendiri', 'Ketawakan sahaja'],
    results: [
      'Angka firma anda dilaporkan sewajarnya, di bahagian bawah muka surat.',
      ['Jenaka itu mengena. Firma itu kini senyap.', 'Ahli anda sendiri bertanya kalau-kalau ia benar.'],
    ],
  },
  marketScolding: {
    title: 'Dileteri di pasar',
    body: 'Seorang peniaga sayur memberitahu anda, dengan panjang lebar dan di hadapan kamera, berapa harga sekilo cili dan apa pendapatnya tentang orang yang tidak tahu.',
    options: ['Dengar, dan ucap terima kasih', 'Terangkan statistiknya'],
    results: ['Anda mendengar semuanya. Dia memberi anda sebungkus cili dan satu jelingan.', 'Angka anda tepat. Angka dia tertera pada tanda harga.'],
  },
};
