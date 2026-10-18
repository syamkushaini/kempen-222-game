import type { EventText } from './events';

// What lands on the desk of the leader of the opposition (first part), in English and Bahasa Malaysia. Every person, company and
// body in them is invented. A result written as a pair is for a gamble: what is reported if it comes off, then if it does not.

export const LEAD_EVENTS_EN: Record<string, EventText> = {
  shadowGaffe: {
    title: 'Your shadow minister’s gaffe',
    body: 'Your shadow finance minister, in an interview, confused the national debt with the national deficit, then compared the national budget to a wedding, then said that he was “speaking as a father”. The government has put the clip on a loop.',
    options: ['Replace him, and say you hold your people to account', 'Back him, and say that everyone misspeaks', 'Move him to another portfolio in the next reshuffle'],
    results: [
      'He went, with dignity and a short letter. The party said you were firm, and the press said you were a little cold.',
      'You backed him. Your members respected the loyalty, and the government used the clip at three more events.',
      'The reshuffle came in a month, and by then nobody was looking for it, which was the point.',
    ],
  },
  censureMotion: {
    title: 'A censure motion',
    body: 'The government is wobbling, and a motion of censure against a minister who has made one blunder too many is ready, with your name at the top of it. Your whips say that you can carry it if your members stay on side, and that there is no point in losing it.',
    options: ['Table the motion', 'Call for the minister’s resignation, and leave it there', 'Hold fire, and let the government do it to itself'],
    results: [
      ['The motion was carried, and the government shuddered, and the minister fell on his sword.', 'The motion was defeated, and the government took it as a victory, and the minister was seen smiling.'],
      'The call was made, and the minister did not resign, and the story ran for a week and went quiet.',
      'You held your fire, and the government went on wobbling without any help from you. The older voters thought it dignified.',
    ],
  },
  bipartisanOffer: {
    title: 'An offer from the Prime Minister',
    body: 'The Prime Minister has proposed that the two sides work together on a long-term plan for the country’s water supply. It is a good idea, and it is, you suspect, a trap, since a joint plan would be the government’s plan by the next election.',
    options: ['Accept, and help to shape the plan', 'Refuse, and say the government should show its own plan', 'Accept on conditions, to see if the government agrees'],
    results: [
      'You joined, and helped, and the plan was a good one. The voters said it was grown-up, and your own side wondered who was the opposition.',
      'You refused. The party was pleased, and the public said that you might at least have looked at it.',
      ['The conditions were agreed, and the plan was joint, and you had a share of the credit.', 'The conditions were rejected, and you had a fine reason to say no, which is better than a bad reason.'],
    ],
  },
  crossoverHints: {
    title: 'Members of the government hint',
    body: 'Three members of the government’s own backbenches have said, in the presence of reporters and a good meal, that they are “open to conversations”. The government is shaky, and the arithmetic in the House, for the first time, has become interesting.',
    options: ['Welcome them in public', 'Talk to them quietly, and vet them first', 'Refuse, and say you will not buy a majority'],
    results: [
      'The welcome was loud, and the government was furious. Your members were uneasy at the type of people it brought.',
      'The talks were quiet. Two of the three were found to be after something other than principle, and were not heard from again.',
      'The refusal was noted, with admiration and some surprise. The government’s backbenchers settled down.',
    ],
  },
  inquiryCall: {
    title: 'A call for a Royal Commission',
    body: 'A series of accidents on a government-funded project has killed four workers, and the government’s response has been to call it “regrettable”. Your members say that this is a case for a Royal Commission. The evidence is thin, but the feeling is thick.',
    options: ['Demand a Royal Commission, in public', 'Table a motion in the House for an inquiry', 'Wait until you have the evidence, and collect it'],
    results: [
      'The demand was made. The government said it would consider it, which is the way that governments say they will not.',
      ['The motion was carried, and an inquiry was held, and your name was on it.', 'The motion was lost, and the government said you had politicised the dead.'],
      'You collected the evidence in a month. It was serious, and it was yours, and you used it wisely.',
    ],
  },
  massRally: {
    title: 'A rally for the capital',
    body: 'The election is on the way, and your organisers say that the moment has come for the great rally, with trains from every state, a stage the size of a house and a speech that your speechwriters have been polishing for a year. It will cost a great deal, and be remembered, one way or the other.',
    options: ['Hold it in the national stadium', 'Hold it online, with many small gatherings', 'Take the rally on a tour of the states'],
    results: [
      'The stadium was full, and the speech was long. The photographs were very good, and the bill was very large.',
      'The online rally was watched by a very large number of people, and a few thousand showed up in person to see what the fuss was about.',
      'The tour reached places that no rally had been to, and left the branches stronger. It lacked a single photograph for the front pages.',
    ],
  },
  oppositionPact: {
    title: 'An alliance of the opposition',
    body: 'The smaller opposition parties have asked you to lead a pact for the election: one candidate against the government in each seat, with the seats shared out in advance. Everyone agrees. Nobody agrees about which seats.',
    options: ['Negotiate a seat-sharing agreement', 'Refuse, and say you will go it alone', 'Propose a looser front, with a common platform and no promises on seats'],
    results: [
      'The talks took weeks, and the agreement was signed with a photograph of everyone holding the same pen.',
      'You refused. Your members were pleased, and the smaller parties were not, and some of them are already talking to someone else.',
      ['The front was agreed, and was loose enough to hold everyone.', 'The front was thought to be a promise to do nothing, and was left alone.'],
    ],
  },
  speakerBars: {
    title: 'Members barred from the House',
    body: 'The Speaker has barred four of your members from the House for a week, for what he calls “disorderly conduct” and what they call “speaking”. The government benches are quiet. Your own are not.',
    options: ['Challenge the ruling, in the House and in the press', 'Accept it, and respect the chair', 'Boycott the House until the members are back'],
    results: [
      'The challenge was made. The Speaker held firm, and the press printed a good photograph of the empty seats.',
      'You accepted it. Your members were furious, and the public, who had not noticed, did not notice more.',
      'The boycott was kept for three days, and the government used the quiet to pass two bills.',
    ],
  },
  taxPledge: {
    title: 'The tax pledge',
    body: 'Your economic team says the party should promise a tax cut in the manifesto. The treasury shadow says that the party cannot afford one. The party’s members say they would like to hear the word “cut”, and nothing more precise than that.',
    options: ['Promise a tax cut, and leave the figures for later', 'Promise fiscal responsibility, and no new cuts', 'Promise better services, and say that is worth more than a tax cut'],
    results: [
      'The promise was cheered, and the figures were asked for, and the party said they were coming.',
      'The promise was dull and credible, and the commentators said it was “a leader’s speech”.',
      'The promise was heard by those who would benefit, and ignored by those who would pay.',
    ],
  },
  civilServantFile: {
    title: 'A file from the ministry',
    body: 'A civil servant has left a brown envelope at your office. It contains a memo that, if real, shows that a ministry was told about a safety problem a year ago and did nothing. The covering note is unsigned and spelled very well.',
    options: ['Use it in the House, and see what happens', 'Refer it to the anti-graft agency', 'Decline to use it, and return it'],
    results: [
      ['The memo was real, and the House heard it in silence. The government spent a week explaining it.', 'The memo was not real, or at least not all of it, and the government spent a week explaining you.'],
      'The agency took it, and the story unfolded slowly, in your favour. The public took you for serious.',
      'You returned it. A few of your own members thought you had thrown away a gift, and a few were pleased you had not.',
    ],
  },
  pollLead: {
    title: 'The polls say you are ahead',
    body: 'A series of polls puts the opposition ahead, and your aides are in a very good mood, and have started to speak of “when we govern”. It is the most dangerous point in any campaign, and a few members have noticed.',
    options: ['Rest on the lead, and avoid mistakes', 'Press harder, and spend to widen it', 'Spend the time preparing for office: plans, names and costings'],
    results: [
      'The lead held for a little. The country noticed a certain complacency, and the polls did too.',
      'The campaign went on, and the lead widened a little, and the bank balance did not.',
      'Your plans were published in a series of papers that were read by a few, and trusted by many.',
    ],
  },
};

export const LEAD_EVENTS_MS: Record<string, EventText> = {
  shadowGaffe: {
    title: 'Terlepas cakap menteri bayangan anda',
    body: 'Menteri kewangan bayangan anda, dalam temu bual, tertukar hutang negara dengan defisit negara, lepas tu bandingkan bajet negara dengan majlis perkahwinan, lepas tu kata dia “bercakap sebagai seorang bapa”. Kerajaan dah letak klip tu berulang-ulang.',
    options: ['Gantikan dia, dan kata anda pertanggungjawabkan orang anda', 'Sokong dia, dan kata semua orang pernah tersilap cakap', 'Pindahkan dia ke portfolio lain dalam rombakan akan datang'],
    results: [
      'Dia pergi, dengan maruah dan surat ringkas. Parti kata anda tegas, akhbar kata anda agak dingin.',
      'Anda sokong dia. Ahli anda hormati kesetiaan tu, dan kerajaan guna klip tu di tiga acara lagi.',
      'Rombakan datang dalam sebulan, dan masa tu tak ada siapa cari pun, itulah tujuannya.',
    ],
  },
  censureMotion: {
    title: 'Usul teguran',
    body: 'Kerajaan goyah, dan usul teguran terhadap seorang menteri yang dah buat satu kesilapan terlalu banyak dah siap, dengan nama anda di atasnya. Whip anda kata anda boleh lulus kalau ahli anda kekal di pihak anda, dan tak guna kalau kalah.',
    options: ['Bentangkan usul tu', 'Serukan menteri letak jawatan, dan berhenti di situ', 'Tahan tembakan, dan biar kerajaan buat sendiri'],
    results: [
      ['Usul diluluskan, kerajaan menggeletar, dan menteri jatuh atas pedangnya sendiri.', 'Usul dikalahkan, kerajaan anggap ia kemenangan, dan menteri nampak tersenyum.'],
      'Seruan dibuat, menteri tak letak jawatan, dan cerita berlarutan seminggu lepas tu senyap.',
      'Anda tahan tembakan, dan kerajaan terus goyah tanpa bantuan anda. Pengundi yang lebih tua anggap ia bermaruah.',
    ],
  },
  bipartisanOffer: {
    title: 'Tawaran Perdana Menteri',
    body: 'Perdana Menteri cadangkan dua pihak bekerjasama dalam pelan jangka panjang untuk bekalan air negara. Idea yang baik, dan, anda syak, perangkap, sebab pelan bersama akan jadi pelan kerajaan menjelang pilihan raya akan datang.',
    options: ['Terima, dan bantu bentuk pelan tu', 'Tolak, dan kata kerajaan patut tunjuk pelannya sendiri', 'Terima dengan syarat, untuk tengok kerajaan setuju atau tak'],
    results: [
      'Anda sertai, dan bantu, dan pelan tu bagus. Pengundi kata ia matang, dan pihak anda sendiri tertanya-tanya siapa pembangkang.',
      'Anda tolak. Parti gembira, dan orang awam kata sekurang-kurangnya anda boleh tengok dulu.',
      ['Syarat dipersetujui, pelan tu bersama, dan anda dapat sebahagian kredit.', 'Syarat ditolak, dan anda ada sebab baik untuk kata tak, yang lebih baik daripada sebab buruk.'],
    ],
  },
  crossoverHints: {
    title: 'Ahli kerajaan bagi isyarat',
    body: 'Tiga ahli di bangku belakang kerajaan sendiri cakap, depan wartawan dan hidangan yang sedap, yang mereka “terbuka untuk berbual”. Kerajaan goyah, dan aritmetik di Dewan, buat pertama kali, jadi menarik.',
    options: ['Alu-alukan mereka depan orang ramai', 'Berbincang senyap-senyap, dan tapis mereka dulu', 'Tolak, dan kata anda tak beli majoriti'],
    results: [
      'Sambutan lantang, dan kerajaan berang. Ahli anda tak selesa dengan jenis orang yang dibawanya.',
      'Perbincangan senyap. Dua daripada tiga didapati mengejar sesuatu selain prinsip, dan terus senyap.',
      'Penolakan dicatat, dengan kekaguman dan sikit kejutan. Bangku belakang kerajaan bertenang.',
    ],
  },
  inquiryCall: {
    title: 'Seruan Suruhanjaya Diraja',
    body: 'Satu siri kemalangan di projek yang dibiayai kerajaan membunuh empat pekerja, dan jawapan kerajaan cuma panggil ia “mendukacitakan”. Ahli anda kata ini kes untuk Suruhanjaya Diraja. Buktinya nipis, tapi perasaannya tebal.',
    options: ['Tuntut Suruhanjaya Diraja, depan orang ramai', 'Bentangkan usul di Dewan untuk siasatan', 'Tunggu sampai ada bukti, dan kumpulkannya'],
    results: [
      'Tuntutan dibuat. Kerajaan kata ia akan pertimbangkan, cara kerajaan kata tak akan.',
      ['Usul diluluskan, siasatan diadakan, dan nama anda ada padanya.', 'Usul dikalahkan, dan kerajaan kata anda memolitikkan yang telah meninggal.'],
      'Anda kumpul bukti dalam sebulan. Serius, milik anda, dan anda guna dengan bijak.',
    ],
  },
  massRally: {
    title: 'Himpunan untuk ibu negara',
    body: 'Pilihan raya makin dekat, dan penganjur anda kata dah tiba masa untuk himpunan besar, dengan kereta api dari setiap negeri, pentas sebesar rumah dan ucapan yang penulis ucapan anda dah cuba sempurnakan setahun. Kosnya besar, dan akan diingati, sama ada baik atau buruk.',
    options: ['Adakan di stadium negara', 'Adakan dalam talian, dengan banyak perhimpunan kecil', 'Bawa himpunan melawat negeri-negeri'],
    results: [
      'Stadium penuh, dan ucapan panjang. Gambar sangat bagus, dan bilnya sangat besar.',
      'Himpunan dalam talian ditonton ramai orang, dan beberapa ribu hadir sendiri untuk tengok apa yang dihebohkan.',
      'Lawatan sampai ke tempat yang tak pernah ada himpunan, dan kukuhkan cawangan. Tapi tak ada satu pun gambar untuk muka depan.',
    ],
  },
  oppositionPact: {
    title: 'Pakatan pembangkang',
    body: 'Parti pembangkang yang lebih kecil minta anda ketuai pakatan untuk pilihan raya: satu calon menentang kerajaan di setiap kerusi, dengan kerusi dibahagi awal-awal. Semua setuju. Tak ada siapa setuju kerusi yang mana.',
    options: ['Runding perjanjian perkongsian kerusi', 'Tolak, dan kata anda bertanding sendiri', 'Cadangkan barisan lebih longgar, dengan platform bersama dan tiada janji kerusi'],
    results: [
      'Rundingan ambil beberapa minggu, dan perjanjian ditandatangani dengan gambar semua orang pegang pen yang sama.',
      'Anda tolak. Ahli anda gembira, parti kecil tak, dan ada yang dah berbual dengan orang lain.',
      ['Barisan dipersetujui, dan cukup longgar untuk muatkan semua orang.', 'Barisan dianggap janji untuk tak buat apa-apa, dan dibiarkan.'],
    ],
  },
  speakerBars: {
    title: 'Ahli digantung daripada Dewan',
    body: 'Speaker gantung empat ahli anda daripada Dewan seminggu, sebab apa yang dia panggil “kelakuan tak teratur” dan apa yang mereka panggil “bercakap”. Bangku kerajaan senyap. Bangku anda tak.',
    options: ['Cabar keputusan tu, di Dewan dan akhbar', 'Terima, dan hormati kerusi', 'Boikot Dewan sampai ahli kembali'],
    results: [
      'Cabaran dibuat. Speaker bertegas, dan akhbar siarkan gambar kerusi kosong yang bagus.',
      'Anda terima. Ahli anda berang, dan orang awam, yang tak perasan pun, jadi lagi tak perasan.',
      'Boikot kekal tiga hari, dan kerajaan guna senyap tu untuk lulus dua rang undang-undang.',
    ],
  },
  taxPledge: {
    title: 'Ikrar cukai',
    body: 'Pasukan ekonomi anda kata parti patut janji potongan cukai dalam manifesto. Bayangan perbendaharaan kata parti tak mampu. Ahli parti kata mereka nak dengar perkataan “potong”, dan tak perlu lebih tepat daripada tu.',
    options: ['Janji potongan cukai, dan tinggalkan angka untuk kemudian', 'Janji tanggungjawab fiskal, dan tiada pemotongan baharu', 'Janji perkhidmatan lebih baik, dan kata itu lebih bernilai'],
    results: [
      'Janji tu disambut, angka diminta, dan parti kata ia akan datang.',
      'Janji tu membosankan dan boleh dipercayai, dan pengulas kata ia “ucapan pemimpin”.',
      'Janji tu didengar oleh yang akan dapat manfaat, dan diabaikan oleh yang akan bayar.',
    ],
  },
  civilServantFile: {
    title: 'Fail dari kementerian',
    body: 'Seorang penjawat awam tinggalkan sampul coklat di pejabat anda. Dalamnya ada memo yang, kalau betul, tunjuk kementerian diberitahu pasal masalah keselamatan setahun lepas dan tak buat apa-apa. Nota penghantarnya tak bertandatangan dan dieja dengan sangat baik.',
    options: ['Guna di Dewan, dan tengok apa jadi', 'Rujuk kepada agensi anti-rasuah', 'Enggan guna, dan pulangkan'],
    results: [
      ['Memo tu tulen, dan Dewan dengar dalam senyap. Kerajaan habiskan seminggu menerangkannya.', 'Memo tu bukan tulen, atau tak semuanya, dan kerajaan habiskan seminggu menerangkan anda.'],
      'Agensi ambil, dan cerita berkembang perlahan-lahan, memihak anda. Orang awam anggap anda serius.',
      'Anda pulangkan. Beberapa ahli anda rasa anda buang hadiah, dan beberapa gembira anda tak guna.',
    ],
  },
  pollLead: {
    title: 'Tinjauan kata anda mendahului',
    body: 'Satu siri tinjauan letak pembangkang di hadapan, dan pembantu anda dalam mood yang sangat baik, dan mula cakap “bila kita memerintah”. Ini titik paling bahaya dalam mana-mana kempen, dan beberapa ahli perasan.',
    options: ['Berehat atas kelebihan, dan elak kesilapan', 'Tekan lebih kuat, dan belanja untuk lebarkannya', 'Guna masa untuk sedia memerintah: pelan, nama dan kos'],
    results: [
      'Kelebihan bertahan seketika. Negara perasan sikit sikap berpuas hati, tinjauan pun sama.',
      'Kempen diteruskan, dan kelebihan melebar sikit, tapi baki bank tak.',
      'Pelan anda diterbitkan dalam siri kertas yang dibaca sikit orang, tapi dipercayai ramai.',
    ],
  },
};
