# Kempen 222 — Design Brief

Decisions from the 110-question design interview (3 Oct 2026). The original single-file prototype is kept in `prototype/` and predates this brief.

## Vision
- **Player feeling:** "I outsmarted them" — strategy that pays off.
- **Audience:** Malaysians who follow politics, plus casual players.
- **Purpose:** fun, education and satire together.
- **Tone:** serious systems, funny writing.
- **Complexity:** easy to learn, hard to master.
- **Inspirations:** The Political Machine (map campaigning) and Suzerain (characters, consequences).
- **Unique hook:** authentically Malaysian politics.
- **Release:** free public release, no deadline, zero budget.

## Setting
- Present day. Start matches present-day reality; events, skeletons and rival choices vary per game.
- **Parties:** fictional, one-to-one parallels of the real coalitions and their component parties.
- **Politicians:** fictional lookalikes.
- **Race and religion:** modelled through abstracted blocs (e.g. heartland conservatives, urban liberals), never named directly.
- **3R:** handled carefully; satire targets politicians, never communities or the monarchy.
- **Palace:** an active, respectfully treated part of government formation (audiences, deadlines, unity-government suggestions).
- **Sabah and Sarawak:** fully distinct politics — local parties, autonomy demands, peninsular parties as outsiders.
- **Numbers:** real seat counts, state assembly sizes, electorate sizes and demographics.
- **Language:** English and Bahasa Malaysia, switchable.

## Player and characters
- Full party creator (name, logo, colour, ideology), or take over a preset established party.
- Start as opposition or as the sitting government (player's choice).
- Leader has stats and a chosen backstory that unlocks unique events.
- Candidates chosen for key seats only; the rest auto-filled. Candidates and staff have hidden skeletons; vetting costs time.
- Small staff team (campaign manager, strategist, media chief, treasurer) as named characters.
- Defections ("katak") in both directions.
- Party unity as a single meter (light faction model).
- Rival leaders are named characters with relationship scores.
- Wide range of endorsers: influencers, celebrities, NGOs, unions, business, religious figures.

## Map and electorate
- All 222 parliamentary constituencies, plus fully modelled state elections.
- Real geographic map; click a state to zoom to its seats.
- Urban, semi-urban and rural seats behave strongly differently (which actions work where).
- Voter blocs: age, income (B40/M40/T20), abstracted identity blocs, occupational blocs (civil servants, FELDA settlers, farmers and fishermen, gig workers, small business).
- Undi18 first-time voters as a distinct, volatile, online bloc.
- Turnout per bloc. Postal, early and overseas voters modelled.
- Malapportionment via real electorate sizes (no redelineation mechanic).
- Local issues per state.
- Seats tagged safe / leaning / marginal, with a hot-seat watchlist.
- True support is hidden; the player pays for noisy polls.
- Undecided voters visible per seat and break late.

## Time and core loop
- Weekly turns across a full five-year term (about 260 turns).
- Standing orders with skip-ahead until something needs attention.
- Time budget per week: actions cost different numbers of days.
- Leader has a location; travel costs time (more for Borneo).
- All four action families matter: ceramah and walkabouts, party machinery, media, fundraising.
- Social media is its own system with virality and backlash.
- Money is tight and central. Sources: members and crowdfunding, tycoons and corporate donors, state resources, party businesses and assets.
- Spending limits with enforcement risk.
- Party machinery is a per-state resource built over years.
- Attacks are a major system with opposition research.
- Dirty play available at real risk: money politics, vote-buying, cybertroopers, sponsored spoiler candidates.
- Public pledges and private deals, both called in later.

## Policy
- Stances on 10–12 issues along a spectrum.
- Issue groups: bread and butter; governance; public services; identity and federation.
- Hard trade-offs: every stance costs someone.
- Costed, tracked manifesto; broken promises punished in government.
- Issue salience shifts with events and with agenda-setting by players.
- U-turns allowed at a credibility cost.
- Rival platforms visible and shifting.
- Populist giveaways are a constant temptation with deferred costs.

## Events and narrative
- 100+ events: scripted backbone, state-triggered and random.
- Heavy use of fictionalised real political history.
- Long event arcs spanning years.
- Nomination day as a set-piece.
- Institutions (election commission, anti-graft agency, police, courts) act, and a governing party can lean on them at a cost.
- Media outlets with leanings.
- Dialogue scenes at key moments (coalition talks, betrayals, Palace audiences).
- News feed and netizen social feed react to player actions; main home of the humour.

## Rivals
- Full field of coalitions with component parties.
- Strategic, reactive AI with distinct personalities. Difficulty levels change AI skill only.
- Rivals run on the same rules as the player (money, trust, unity, skeletons) and act against each other: pacts, poaching, splits, collapse.
- Full diplomacy: non-contest pacts, secret understandings, joint attacks, mergers, betrayal.
- Pre-election coalitions with seat-by-seat allocation talks.
- Single-player only.

## Election and after
- Election night as a live seat-by-seat broadcast.
- Hung parliament: full negotiation phase under a Palace deadline.
- On the table: cabinet posts, policy concessions, state-level deals, under-the-table inducements.
- Statutory declarations and defections, constrained by an anti-hopping law (parties move as blocs).
- Game continues into the next term. Full governing layer: annual budget, cabinet, bills, reacting economy, confidence votes, manifesto delivery.
- Legacy endings when the player retires, is ousted or loses the party.
- Detailed post-election analysis (swing by seat and bloc, turnout, decisive decisions, polling timeline).
  - Built so far ("What decided it", under the result on election night): the closest seats won and lost, in votes; the swing, seat change and the player's own actions in each state or area; and the last national poll against the result. It is read from the campaign's news trail, polls and decision record. The record (`Campaign.ledger`, save version 11) notes, for each action, pact, joint attack and court approach the player makes, how many seats and how much national vote share it moved in the projection of the day it was taken; the review lists the three that helped most and the two that cost most. The measure is the worth at the time: campaign effects fade, so it is not the worth at the count, and the review says so. Events are not in the record because they happen in the years between elections, not in the campaign. A game saved before version 11 has an empty record and the section is left out. It also shows who moved: the party's share of each voter group's votes nationwide against the last election, for the five groups it moved most among (groups under 2% of voters left out). This is the game's own model of the country, before and after, so it mixes the national mood with what the player did, and the review says so. Nothing is left to do on the planned analysis except turnout.

## Modes and progression
- Career mode, plus scenarios: campaign-only, by-election, state election, hung parliament.
- Achievements and a legacy gallery; nothing locked.
- Autosave plus manual slots, with export/import to file.
- Playable by-election tutorial, then gradual introduction of systems by an adviser character.

## Presentation
- Campaign war room style: map, briefing papers, phone messages, polling charts.
- AI-generated illustrated portraits in one consistent style, not resembling real people too closely.
- Full Malaysian campaign flavour: flag wars, banners, ceramah tents, posters; echo real colour schemes without copying logos.
- Music and sound effects (royalty-free or generated).
- Lively animation. Light and dark themes, switchable.

## Platform
- React + TypeScript; simulation tested; content in data files.
- Desktop first, usable on mobile.
- Fully offline: runs in the browser, saves on the device, no backend.
- Free static hosting with the code on GitHub.
- Shareable result image card.

## Open risks
- **Scope.** This describes a multi-year grand strategy game. It needs to be built in playable stages.
- **Data.** Real figures for 222 parliamentary seats and about 600 state seats must come from a public dataset, not from memory.
- **Writing volume.** 100+ events, dialogue scenes and two feeds, all in two languages.
- **Legal and sensitivity.** One-to-one parody parties and lookalike politicians, with playable corruption and institutional pressure, in a public release. Needs a clear fiction disclaimer and care that parody characters are not presented as factual claims about real people.

## Build stages

1. **Foundation** — done (4 Oct 2026). React + TypeScript project, real data for 222 seats, zoomable map, voter-bloc and turnout model, saves, English/BM, light/dark.
2. **Campaign-only scenario** — done (4 Oct 2026). Eight weekly turns, time budget, travel, the four action families, paid polls, rival AI with three difficulty levels, live election night. Not yet published.
3. **By-election tutorial and state election scenario** — done (4 Oct 2026). A guided three-week by-election with an adviser, and six-week state elections in Perak, Pahang and Perlis.
4. **Coalitions** — done (4 Oct 2026). Leader relationships, seat-by-seat pacts with vote transfers, private understandings, joint attacks, defections, party unity, and talks to form a government under a Palace deadline. Adds the hung-parliament scenario.
5. **Career mode** — done (4 Oct 2026). Five-year terms with standing orders and skip-ahead, four money sources, machinery built over years, twelve policy stances, a costed manifesto, 35 events with three multi-step arcs, governments that can fall mid-term, and the loop from one parliament to the next.
6. **Governing layer and legacy endings** — done (4 Oct 2026). A reacting economy, an annual budget, a named cabinet, bills for every manifesto promise with whip counts, debts to coalition partners, leaning on institutions, confidence and no-confidence votes, rival governments' bills, and ten legacy endings on retirement, removal or wipe-out.
7. **Polish** — done (4 Oct 2026). Portraits for every named character, sound effects and generated music, thirty achievements, a legacy gallery, a shareable result card, bunting and small animations.
8. **The unassigned items** — done (4 Oct 2026). Leader backstories and abilities, a party creator, named staff, candidates for key seats, endorsers, media outlets, a netizen feed, a spending limit, by-elections and state polls inside a career, and events brought up to 102.

## Decisions made while building stage 1

- **Fictional coalitions** (working names): Pakatan Sinar, Barisan Pusaka, Perikatan Teguh, Gabungan Bumi Kenyalang, Gabungan Bayu Sabah, Parti Legasi Sabah. Component parties are not modelled yet.
- **Starting point** is the 2022 general election result. By-elections and realignments since then are not reflected yet.
- **Voter blocs** are a single partition of 13 blocs per seat rather than separate age, income, identity and occupation dimensions. Each voter belongs to one bloc by primary political identity.
- **Bloc shares per seat are estimates** from census indicators, not published figures. Land-scheme settler and civil servant shares are the weakest estimates.
- **Small parties and independents are pooled** into one entry.
- **State assembly seats** are downloaded but not yet processed.
- **True support is visible** in this build as a developer view. Hiding it behind paid polls belongs to stage 2.

## Decisions made while building stage 2

- **Length:** eight weekly turns of seven days each.
- **Playable parties:** the three national coalitions only. The Borneo blocs are rivals for now. *Changed (6 Oct 2026):* in Sabah's and Sarawak's own state elections and by-elections, the state's parties can be led (see "The last four states").
- **Hidden drift:** each new campaign starts with a random, hidden shift in opinion since the last election, so the last result is a guide and polls are worth buying.
- **Travel zones:** north, east, central, south, Sabah (with Labuan) and Sarawak. Travel is free within a zone.
- **Regional parties have fewer days per week** (4-5 against 7), so that a small party does not out-campaign national ones on its home ground. This departs slightly from "rivals run on the same rules".
- **Where each party stands** is fixed to where its stand-in stood in 2022. Seat allocation comes with coalitions in stage 4.
- **Attacks, social media and tycoon money are simple versions** of the fuller systems in the brief (opposition research, a social media system, donors with strings).
- **No random events yet** beyond tycoon exposure. The event system comes with career mode.
- **The what-if sliders from stage 1 were removed.** The `?dev` address option shows the true state of the race instead.
- **Balance is only machine-tested:** a party run by the rival logic ends about 15 seats ahead of an idle one, and an all-rival race stays close to the last result. It has not been tuned through human play.

## Decisions made while building stage 3

- **One engine, three sizes.** A contest is a set of seats plus a small rule set: money multiplier, length, which actions and polls are offered, and travel zones. Nothing else differs.
- **State elections cover all thirteen states.** Perak, Pahang and Perlis voted with the 2022 general election. Kedah, Kelantan, Terengganu, Penang, Selangor and Negeri Sembilan were added later from the August 2023 results (see "Six more states" below), and Melaka, Johor, Sarawak and Sabah after that from their own elections (see "The last four states").
- **In a state election, seats are grouped by the parliamentary seat they sit in.** Those areas play the role states play nationally (door-to-door drives, billboards, area polls). There is no travel time inside a state.
- **The by-election is Hulu Selangor**, a three-way marginal, as a fictional vacancy. It doubles as the tutorial. *Changed (4 Oct 2026, at the designer's request):* the title screen now draws the vacant seat at random from the 36 seats where each of the three national parties took at least a fifth of the vote and the top two were within 12 points (Hulu Selangor is one). A button draws another. The scenario id carries the seat (`byelection:P.133`); the plain id `byelection` still means Hulu Selangor, so older saves load. The tutorial works in any of them; the adviser's opening line says whether the player's party won the seat last time.
- **The adviser is "Kak Ros", campaign manager**, shown with an initials badge until portraits arrive. Her 11 steps advance when the player does the thing, and can be skipped.
- **Only parties with real support campaign in a contest** (a seat held, or 5% of the vote). Token candidacies still appear on the ballot but run no campaign.
- **The tutorial defaults to the easiest rivals.**
- **The hung-parliament scenario from the brief is not built**; it belongs with coalitions in stage 4.

## State chiefs (added after stage 3, 4 Oct 2026)

Requested by the designer: let each state have an AI state leader who runs the campaign there, so the country is easier to manage.

- **Optional, per region.** The player can put a chief in charge of any state they contest (a division chief per parliamentary area in a state election). A one-seat by-election has none.
- **What a chief does.** Ceramah and walkabouts in the closest seats, door-to-door drives, billboards, new branches and get-out-the-vote. The leader keeps the national work: mega rallies, television, social media, attacks and fundraising.
- **The trade-off.** A chief costs none of the leader's days and no travel, at the normal prices. Their ceramah and walkabouts draw half the leader's crowd, and they choose for themselves what to do.
- **Three levels of freedom:** Lean (one operation a week), Standard (two), All out (up to four).
- **Money.** Chiefs spend party funds when the week ends. Between them they may spend only a share of the funds each week, weighted towards polling day because effects fade; the final week has no limit. The player can set an amount chiefs must leave untouched. A chief spends nothing when nothing on offer is good value.
- **No doubling up.** A chief skips whatever the leader has already done in that seat or state that week.
- **Local knowledge.** Chiefs read their own ground through the same kind of noise as a normal-difficulty rival, so where they campaign is a mild hint about which seats are close.
- **Rivals have chiefs too**, in every state they contest, funded from whatever they hold above their reserve. In practice the computer's leaders spend most of their money themselves, so rival chiefs do little.
- **Chiefs have no names or personalities yet.** Named chiefs with loyalty and skeletons belong with the staff and defection systems in later stages.
- **Balance, from simulated campaigns only:** with the leader doing nothing, chiefs everywhere at All out win about 5 more seats than no campaign at all in a general election, against about 13 for a leader campaigning in person. Chiefs are a way to turn spare money into votes, not a replacement for the leader.
- **Saves** move to version 4; stage 3 saves load and start with no chiefs.

## Decisions made while building stage 4

**Before the vote**

- **Leaders are named, invented characters** with a relationship score to every other leader (-100 to 100). The player takes the place of their own party's leader. Relationships start where the parties stood going into the 2022 election and move with what leaders do: tea warms them, attacks sour them, pacts bind them.
- **A pact is a seat-by-seat list** of who stands aside for whom. The player can fill it by hand, or start from a suggestion ("only where it matters" or "every seat"). An incumbent never stands aside.
- **Voters do not all follow.** When a party stands aside, a share of its voters moves to the partner, a share stays home and the rest scatter. The shares differ by pair of parties (old enemies transfer badly) and are design numbers, not measurements.
- **Leaders judge a pact** by the seats it is worth to them, how the gains are split, and how they feel about the proposer. Leaders on bad terms will not talk at all, so a pact with an old enemy has to be prepared with meetings first.
- **Nomination day** falls three weeks before polling. Pacts and defections must happen before it.
- **Rivals deal with each other too**: they sign pacts among themselves, put pact offers to the player, court the player's sitting members, and lose members to each other.
- **Defections** move a sitting member's personal vote from one party to another for the rest of the campaign. Courting one costs a day and money and may fail or leak.
- **Party unity** is one number per party. It falls when candidates are stood down, when a pact is signed with a party whose supporters are far from one's own, after scandals, backfired attacks and defections; a big rally lifts it. Low unity weakens door-to-door and get-out-the-vote work and invites poaching.
- **Mergers are not built.** Component parties inside each coalition are still not modelled, so there is nothing to merge.

**After the vote**

- **Talks happen whenever nobody has a majority**, in general and state elections. An outright winner, or a pact that wins a majority between its partners, is appointed at once.
- **The Palace sets the timetable** and is written respectfully throughout: a summons, a deadline (five days federally, three in a state), advice to consider a unity government if nobody has the numbers halfway through, one extension of two days, and then the appointment of whoever has the most members behind them as a minority government.
- **Parties move as blocs**, as the anti-hopping law requires. The six parties each sign as one. Independents decide one by one. Rebel signatures against a party's line appear as news and count for nothing.
- **An offer has four parts:** cabinet posts, one senior post, policy concessions, and money under the table. Each party values these differently; sounding a party out (one meeting) shows what it wants and how it would take an offer.
- **Concessions are a fixed list of eleven** (Borneo autonomy, oil royalty, the Sabah chief ministership, subsidies, a reform agenda, shelving reforms, a "fair review" of court cases, a heartland values agenda, constituency funds, the Speaker's chair, local appointments). They stand in for the policy system that arrives in stage 5. Each has a cost to the giver: party unity, public trust or the treasury.
- **Leaders hold out early and settle late**, and rival leaders raise their offers each day. A party that has signed can still be bought away by a clearly better offer. Money already paid is not returned.
- **The player can stand down** and take a rival's offer, becoming a partner in that government.
- **The result is rated** for stability (size of majority, number of partners, relationships, unity, trust) and public trust. The deals are stored with the save so that the governing layer can call them in.
- **The hung-parliament scenario** starts from the real 2022 result with campaign funds mostly spent, playable as any of the three national parties.

**Not built in this stage:** component parties and mergers; betrayal after the government is formed (it needs the governing layer); cabinet posts by name beyond the senior ones; any state-level deal beyond the Sabah chief ministership.

**Balance is machine-tested only.** Left alone, a rival forms the government on about the third day. No human play-testing has tuned how hard the talks are.

**Saves** move to version 5; earlier saves load with leaders on their starting terms.

## Decisions made while building stage 5

**The shape of a career**

- **A career opens at the start of a parliament**, under the government the 2022 election produced: Pakatan Sinar leading, with Barisan Pusaka, Gabungan Bumi Kenyalang, Gabungan Bayu Sabah and Parti Legasi Sabah. Choosing a party chooses your seat: head of government, partner, or opposition.
- **A term is 252 weeks, then the eight-week campaign.** The head of government may dissolve early after three years; a rival head of government may do so in the last year when ahead.
- **Standing orders replace weekly actions between elections.** One focus for the leader's time, three spending dials, up to three target states, and two dials for outside money. They run until changed.
- **Skip-ahead** moves one week, four weeks, or to the next decision, and always stops when an event needs an answer.
- **The campaign, election night and the talks are the stage 2-4 game**, entered with whatever the term built: funds, machinery, unity, relationships, credibility and a dossier on rivals. Rivals arrive at the campaign rested and funded as before.
- **After the talks the next term begins on a refitted map.** The model is fitted again to the result just declared, so "last election" always means the last one played. Where a pact kept a party off the ballot, the model is fitted to what would have happened with everyone standing, so that party can stand again next time. Pacts lapse at each election.
- **Half of what is left in the bank goes on the campaign's bills** when a new term begins.

**Money**

- **Peacetime donations run at a tenth of campaign-time donations.** A party on the default orders reaches the election with a war chest similar to the single-contest starting funds.
- **Four sources**: members (clean, follows support, unity and credibility), tycoons and corporate donors (three levels; favours, leaks and slow loss of credibility), state resources (government only; three levels; erodes public trust and invites the anti-graft agency), and party businesses (bought in lots, steady return, a tenth lost on selling).
- **Spending limits with enforcement are not built.**

**Policy and manifesto**

- **Twelve issues in four groups**, each a five-point scale between two poles. Each bloc has a preferred position and a weight on every issue; these are design numbers.
- **Policy moves voters relative to where the party stood at the last election**, so a party that changes nothing gains and loses nothing.
- **Credibility** (0-100) scales how much voters respond to the player's positions and promises. U-turns cost it, twice over within a year; moving away from the party's founding positions also costs unity.
- **Sixteen promises**, up to six in a manifesto, against a fiscal limit. A manifesto only counts for more or less than the party's usual one; rivals keep their usual ones. Promises are recorded for the governing stage to hold the player to.
- **Rival platforms move**: twice a year a national rival may shift one step on one issue towards where the votes are.
- **"Values" and "identity" issues stay abstract**, in line with the brief: no issue or promise names a race or religion.

**Events**

- **35 events**: random ones weighted by role, yearly ones (the budget, the alternative budget) and three arcs: a sovereign-fund scandal that takes most of a year to come out, a restless deputy who comes to a head at the party assembly, and a hotel-room plot to bring the government down between elections.
- **Each choice shows its plain consequences and the odds of any gamble.** This favours strategy over surprise.
- **Event text lives in its own file** (`src/i18n/events.ts`), with a test that every event has matching words in both languages.
- The brief asks for 100+ events; this is the first third.

**Governments between elections**

- **Stability and public trust**, set when a government is formed, now matter: events move them, a shaky government can lose a partner, and if that costs it its majority the Palace talks open mid-term with the seats as they stand. A rival-led government falls of its own accord at most once a term.
- **Governing itself is not played yet.** A head of government gets budget day and a few crises as events; bills, cabinet and the economy are stage 6.

**Not built in this stage, and not yet assigned to a stage:** the party creator, leader stats and backstory, named staff, choosing candidates for key seats, endorsers, media outlets with leanings, a netizen feed, spending limits, playable by-elections and state elections inside a career, and the remaining events. These need scheduling.

**Balance is machine-tested only.** Whole terms have been run by script; nobody has played five years by hand.

**Saves** move to version 6; a career save carries the last election's result in every seat, and is about 85 KB.

## Decisions made while building stage 6

**The economy and the budget**

- **Four numbers**: growth, inflation, unemployment and debt as a share of national income. They move a little every week towards where the budget in force points them, with some noise. Events (downturns, price shocks) knock them about.
- **Voters hold the government answerable.** How the economy feels (good growth, low inflation, low unemployment) adds to or takes from the governing parties' standing every week, the head of government's party twice as much as its partners'.
- **The budget is five spending lines and taxes**, each cut, held or boosted, planned in the House tab and tabled on budget day (week 40 of each year). Each line lifts the party with the blocs that notice it. Partners watch their own lines: Barisan Pusaka the civil service, the others rural and Borneo development.
- **Generosity is paid for later.** A loose budget raises prices and adds to the debt; debt above 70% drags on growth and above 75% brings a downgrade. Bills passed and promises to partners add to standing commitments, which loosen every later budget. Scripted runs put a five-year giveaway about one seat ahead of a standstill budget at the next election, with debt near 90% and inflation near 5% for whoever governs next.
- **A rival head of government tables a budget too**, each party to its habits, and all of them raise taxes once the debt passes 70%.

**The cabinet**

- **Eight portfolios, named ministers, one ability rating each** (one to five stars). Names are invented and drawn from a fixed list; ministers have no personal scandals or baggage yet.
- **Partners hold posts in line with what they were given in the talks**, and a partner promised Finance or Home Affairs gets that ministry.
- **Ability matters in two places**: the Finance Minister trims or widens the deficit, and each minister sets how many weeks their bills take to reach a vote. A capable cabinet also steadies the government slightly.
- **A reshuffle replaces one minister with a new appointee from the head of government's party**, whose ability is a gamble. It costs unity for one's own minister, and stability and the relationship for a partner's.
- **When a partner leaves the government its ministers go with it.**

**Bills and promises**

- **Every manifesto promise needs a bill**, and so do three of the concessions made to partners (Borneo autonomy, the values agenda, the reform agenda). Two bills can be in preparation at once.
- **Parties vote their own position on the issue a bill turns on**, tempered by loyalty to the government and their relationship with whoever proposed it. Members close to the line are shown as wavering and decide on the day.
- **Four ways to take a bill to its vote**: as it stands; sweetened, which wins waverers and adds to standing commitments; as a matter of confidence, which brings partners into line and brings the government down if it is lost; or withdrawn.
- **A promise kept goes on the record the day its bill passes** and raises credibility. A bill lost marks the promise as tried and failed, which costs a little. A promise never brought to a vote costs credibility and the voters it was made to at the dissolution.
- **A rival-led government puts one of its promises to the House about every forty weeks.** The player votes for, against or abstains; the blocs the bill was aimed at remember, and a partner who votes against its own government damages it.

**Debts to partners**

- **What the player promised in the talks falls due**, the first after a year and the rest at half-yearly intervals. Each is settled with a signature (some cost the treasury, some cost credibility when done in daylight) or with a bill.
- **A debt left to slide** costs the relationship and the government's stability every year it is overdue.
- **Pausing the reform agenda for a partner breaks the player's own reform promises.**
- **What a rival head of government owes the player as a partner is not modelled.**

**Institutions**

- **Three levers, once a year each, for the head of government only**: the anti-graft agency against the main opposition party (usually hurts them, sometimes makes a martyr), the police against opposition rallies, and the state broadcaster. All cost public trust.
- **A rival government's use of the agency against the player arrives as an event.** Rivals do not otherwise pull these levers.

**Confidence**

- **A partner stands by the government** if it gets on with its head and the government looks like lasting. The House tab shows how many members the government can count on.
- **An opposition leader may move no confidence** after half a year, and once a year after that. Failure costs credibility and steadies the government.
- **A partner may walk out.** If the government keeps its majority it carries on, weaker.
- **A shaky government led by the player can face a motion**, and can buy loyalty first at the treasury's expense. A budget tabled by a shaky or narrow government can meet a revolt.
- **A fall opens the Palace talks mid-term**, as in stage 5.

**Endings**

- **Three ways to end**: retiring (any quiet moment between elections), being removed by the party when unity collapses, and losing every seat.
- **Ten legacies**: Statesman, Reformer, Survivor, Promiser, Plotter, Premier, Kingmaker, Conscience, Almost Prime Minister, Footnote. Chosen from years in the top job, promises kept and broken, credibility, governments lost and brought down, and the best seat tally.
- **A legacy score out of 100** from the same record.
- **Achievements and a gallery of past legacies are left to stage 7.**

**Interface**

- **A House tab** between elections, showing more or less depending on the player's seat.
- **Any event or vote can be set aside** ("Look around first"). A banner stays until it is answered, and time does not move.
- **Seven events were added and one removed**, for 41 in all: a budget revolt, a no-confidence motion, a credit downgrade, a partner's budget request, downturns for government and opposition, and being targeted by the agency.

**Balance is machine-tested only.** Whole terms have been run by script with different budgets and with and without bills; nobody has governed for five years by hand.

**Saves** move to version 7; a career saved before this stage is given the starting economy, a standstill budget, a new cabinet and a blank record.

## Decisions made while building stage 7

**Portraits**

- **Drawn as vector art, not generated by an image model.** The brief asked for AI-generated illustrated portraits. There is no image generator in the build environment and no budget, so each portrait is a flat vector bust assembled from a few features (skin tone, hair, headwear, glasses, facial hair, dress) in the party's colour. One style throughout, and no image files. Illustrated portraits can replace them later without touching anything else.
- **Nobody is based on a real person.** Each leader's features were chosen to differ from any real leader their party might bring to mind.
- **Who has one**: the six party leaders, the twenty ministers, and Kak Ros the campaign manager. The player's portrait is their party's leader.
- **The Palace is shown as a place**, a gateway under a dome, never as a person. The House and the leader's desk have emblems of their own.
- **Where they appear**: the title screen, the Deals tab, the talks, phone calls and other scenes, the cabinet, the legacy screen, the gallery and the result card.

**Sound and music**

- **Everything is synthesised in the browser** from oscillators. No audio files, so nothing to license or download and the game still works offline.
- **Twelve effects**: clicks, the week turning, a phone call, good and bad news, money in, a gavel for votes and governments formed, seats declared (won, lost, someone else's), a fanfare, and an achievement.
- **One sound at most for each thing that happens**, chosen by importance.
- **The music writes itself**: a slow five-note tune over a four-bar bass, different every session.
- **Sound effects are on by default and music is off.** Both have a switch in the header and are remembered. Sound pauses when the page is in the background.
- **Not checked by ear.** The build environment has no speakers: the sound engine was verified to start and schedule notes without errors, but how it sounds has not been judged by anyone.

**Achievements and the gallery**

- **Thirty achievements** in four groups: single contests, dealings, a career, and endings. All are visible from the start with what earns them; nothing is hidden and nothing is locked behind them, as the brief asks.
- **Judged from the state of the game**, so they are earned the same way whether a game is played through or reloaded. Election results are not announced by an achievement until the count has been watched.
- **A legacy gallery** holds every finished career: legacy, score, party, years, elections and promises. The newest forty are kept.
- **Kept in a profile on the device**, apart from the saves, so deleting a save loses nothing. The profile is not part of the export file.
- **A notice appears when one is earned**, one at a time.

**The result card**

- **A 1200 by 630 image drawn on a canvas**: the verdict, up to four figures, and either the chamber as it now sits (one dot a seat, the player's party on the left), the vote shares in a by-election, or the leader's portrait at the end of a career.
- **Saved as a PNG, or handed to the device's share sheet** where the browser has one.
- **It carries the fiction notice** and names only the game's invented parties.

**Presentation**

- **Bunting in the parties' colours** on the title screen, the legacy screen and the result card.
- **Small movements**: dialogs, tab changes, results and notices ease in; buttons press. All are switched off for anyone whose device asks for reduced motion.
- **A line left over from stage 4** that said the governing game was not yet built has been corrected.

**Not built**

- Illustrated portraits and recorded music, as above.
- The rest of the campaign flavour the brief lists (flag wars, ceramah tents, posters).
- The brief items never assigned to a stage: party creator, leader stats and backstory, named staff beyond the campaign manager, candidate selection, endorsers, media outlets, a netizen feed, spending limits, by-elections and state elections inside a career, and the remaining events (41 of 100+ exist).
- Publishing. The game has not been put on a host or into a repository.

**Saves** are unchanged at version 7. Settings gain two switches, for sound and music.

## Decisions made while building stage 8 (the unassigned items)

**The leader**

- **Six backstories**, each a set of four abilities from 1 to 5: charisma, organisation, cunning and integrity. Every set adds up to twelve, the same as an ordinary leader's threes, so a backstory is a trade and not a bonus.
- **Each point from ordinary is worth 8%** on what the ability touches: charisma on the leader's own ceramah, walkabouts, rallies, television and interviews; organisation on door-to-door work, turnout drives and branches; cunning on attacks and digging for dirt; integrity on how hard the leader is to smear and how fast credibility builds.
- **Each backstory also brings something on the first day**: stronger branches, credibility, unity, a quarter more money, warmer relations with every leader, or a grudge from the establishment.
- **Two events belong to each backstory** in a career.
- **Rival leaders are all ordinary**, so difficulty remains a matter of how well rivals read the race.

**A party of one's own**

- **The creator rebrands one of the three national parties**: name, initials, colour (ten on offer), emblem (eight), leader's name and portrait (eight). The party keeps its seats, voters and branches. A party built from nothing is not modelled: every voter in the model already belongs somewhere.
- **No emblem copies a real party's symbol.** Scales, a rocket, an eye, a keris and a crescent are deliberately not on offer.
- **Ideology counts in a career only**, where parties hold positions: one of four platforms moves the party a step on three issues from where the old party stood, with no charge for a U-turn.
- **The identity is stored with the save** and is presentation only: the rules see the same party as before.

**Staff**

- **Four jobs, three named people on offer for each**: one ordinary, one good, one outstanding. Wages rise with ability.
- **What they do**: the manager finds up to a day more in the leader's week; the strategist makes polls cheaper and more accurate; the media chief strengthens television, online and billboard work and cuts gaffes; the treasurer raises more from fundraisers and members.
- **Skeletons.** The better someone is, the likelier there is something in their past. Looking into them costs half a day in a campaign, or money between elections. A past nobody looked into, or looked into and ignored, may come out: the person goes, and the party takes the damage.
- **Rival parties have no named staff.** This is a departure from "rivals play by the same rules": everything staff give is an edge the player pays for. Balance has not been retuned for it.

**Candidates**

- **The leader chooses in the closest seats only**: eight in a general election, five in a state election, the one seat in a by-election. Everywhere else the party fills the slate as before.
- **Four kinds of hopeful**, three offered in each seat: the division chief (strong in rural seats, risky), the professional (strong in cities), the celebrity (a lift anywhere, and resented by the branch), the loyalist (small and safe).
- **Papers are filed once and cannot be withdrawn**, and must be in three weeks before polling.
- **Rival parties' candidates are not modelled.**

**Endorsers**

- **Ten invented figures and organisations**, each moving particular blocs for the whole campaign; some put other voters off. The preacher is one figure among ten and is written respectfully.
- **Asking costs a day**, sometimes money, and may fail. The unions and the business chamber will not share a stage. The clean-government coalition walks away from anyone caught with a tycoon's money.
- **Those nobody wins make up their own minds**, by how they lean, so rivals gain endorsers too.
- **Not in by-elections**, which are too small for them.

**The press and netizens**

- **Six invented outlets**, each with an audience and habitual leanings; the state broadcaster favours whoever governs.
- **Coverage moves voters only where it differs from an outlet's habit**, so the press changes nothing until someone changes it.
- **An interview** costs half a day and can win an outlet round, change nothing, or produce a gaffe. Rival leaders give interviews too.
- **Cybertroopers** are the dirty option: they work at once and have a one-in-five chance each week of being traced.
- **Front pages** are written from each outlet's slant and the kind of week the player had.
- **The netizen feed** reacts to twenty-five kinds of story with three remarks each in each language, from twelve invented handles. It is presentation only and is rebuilt from the news, so it adds nothing to saves.
- **The press plays no part between elections yet.**

**Spending limit**

- **RM2.6 million in a general election**, scaled down for smaller contests. Actions, polls, endorsers' fees, paid accounts and staff wages all count.
- **Rival parties never exceed it.** The player may; each week over the limit carries a chance, rising with the excess, that the Election Commission fines the party half of the excess and the story costs votes. A party is fined once.

**Contests inside a term**

- **By-elections are fought with one decision**, not a full campaign: everything, a small budget, or the local branch alone. The seat's own voters decide, with the country's mood as it stands. The winner sits in the House from then on, so whip counts, confidence votes and the government's majority all move.
- **State polls come in three rounds a term**: Sabah and Sarawak in week 70, six states in week 130, five in week 190. Again one decision sets the effort.
- **Each state is decided on its parliamentary seats.** Real assembly results exist in the game for only three states, so this keeps every state on the same footing. Whoever wins most seats governs.
- **A state government is worth a small weekly income** to the party that holds it, and a state changing hands moves the national mood a little.
- **State governments carry over a general election**; the House is elected afresh.

**Events**

- **Sixty more, for 102 in all**: the leader's past (12), staff (4), the press (5), money and the economy (11), the party (8), institutions (6), Borneo and the federation (5), and the life of the country (9).
- **The old by-election event, which was a coin toss, is now the played by-election.**

**Found while testing**

- **The talks let a leader promise a partner both the reform agenda and a pause on reform**, and every other concession at once. A real saved game did this with three partners and its leader was removed by the party eighteen weeks into the term. Fixed (4 Oct 2026):
  - **Contradictory concessions are refused.** The reform agenda cannot be in the same offer as a pause on reform or as the "fair review" of court cases, nor can they be promised to two different partners in one government. A pause on reform and the court cases may still go together. Rival leaders are held to the same rule, and an offer left on the table loses whatever has come to contradict a deal signed since. The list of contradictions is a table of pairs with these two entries.
  - **The offer panel shows what an offer costs the party in unity** before it is put: what the offer gives away (its senior post and concessions, the same figures shown against each), the whole government so far including cabinet seats the party goes without, and where that leaves the party. In a career it warns when that is at or below the level at which the party removes its leader (12 when a crisis is answered, 6 in any week). The warning does not block the offer.
  - **The talks have a way out.** A game panel at the foot of the talks screen (and of the new-government screen) holds the same save slots, file export and import as the Saves tab, and a "Quit to title" button. Election night, both the seat-by-seat count and a by-election's box count, has the same panel. Loading a game from it starts the count again.
  - **Debts to partners all fall due within the term.** The first still falls due after a year and the rest half a year apart, but where there are too many for that, or the government was formed late in the term, they close up so that the last falls due by the final week. Careers already saved keep the dates they had.

**Balance is machine-tested only**, and the player now has several edges rivals lack (staff, chosen candidates, a leader with abilities). Nobody has played through with them by hand.

**Saves** move to version 8. Older games get an ordinary leader with nobody hired; older careers get the House as elected and the state governments the last election implies.

## Changes after the first players' feedback (5 Oct 2026)

First players said the actions screen was cluttered and that it was not clear what to press first.

- **Action groups fold away.** Each group on the Actions tab (ceramah and walkabouts, party machinery, media, fundraising) is a dropdown whose header says how many of its actions can be done now. A first visit opens only the suggestions (below); what the player opens or closes is remembered on the device. While the adviser's tutorial is running every group stays open, so nothing she names is hidden.
- **A "What now?" line sits above the map** on the campaign and term screens, on phones as well as desktops. It says in one sentence what to do: answer whoever is waiting; poll in the first two weeks if you have not; spend the week and press End week; go to the polls after the last week; in a career, that the standing orders are running. It reads the state of the game only (`src/sim/campaign/guide.ts`), so it works in every contest and not just the tutorial.
- **A "Suggested this week" group tops the Actions tab** with up to three actions of different kinds that can be done now, each with a line saying why and, for ground work, a link that shows the seat on the map. They are ranked by the same value-for-effort rule the rivals use (`rankOptions` in `ai.ts`, shared; the rivals were checked to play exactly as before). Unlike the rivals, who see the true race through noise, the suggestions use only what the player can see: the last election, and any poll they paid for in a seat. So they improve as the player polls, and hidden drift changes nothing. An action drops off the list once done. Attacks are weighted down (they cost nothing, so would lead every list, and three in ten backfire), and tycoon money is never suggested. The group is hidden during the tutorial.
- **Money under RM500 shows as it is** (`RM0`, not `RM0k`).

- **The title screen opens on a quick start.** One card: pick a party (three pills), see the randomly drawn vacancy (and draw another), and press "Start the tutorial", which starts the guided three-week by-election on gentle rivals. Everything else (other contests, a leader's backstory, a party of one's own, difficulty, the game's name) is behind "Customise instead", and a player who customises lands there on later visits (remembered on the device). For anyone with a game to continue, "Continue" is the screen's one primary button.

- **The tutorial points at what it asks for.** Kak Ros's current step rings the one control she is talking about, using the system's focus ring in pulsing lavender: the Next button, the map, a tab, the Go button for the action, the seat poll buttons or End week. If the control is on another tab, the tab is ringed first. A "Show me" button scrolls to the ringed control, which matters on phones where it may be far off screen. The steps and what each points at are one table (`src/ui/tutorial.ts`) with tests; the ring is static for anyone whose device asks for reduced motion.

- **Two optional challenges, apart from difficulty.** The design brief says difficulty changes how well the rivals play and nothing else, so the harder settings are separate switches under "Customise" on the title screen, chosen at the start of a game and kept in the save (`Campaign.challenge`, absent in earlier games):
  - **Hidden odds** removes every chance of something left to luck from the screen: an event's gamble ("A gamble: ... Otherwise: ..." in place of "50% chance: ..."), the loyalty appeal against a defection, the chance of courting a defector or an endorser, interview odds, and the spending probe. The two descriptions that said "three times in ten" now say "can". Nothing in the rules changes; the player simply judges the risk.
  - **Noisy polls** doubles the sampling error of every poll, the free public ones included, from the first. A poll states its own margin of error, so that doubles too (±4 points becomes ±8) and the player is not misled.
  - Neither changes the rivals, the money or the race. The top bar shows which are on, beside the game's name. The quick start never uses them.

- **Three small parties, built from the real small parties' results.** The feedback asked for fictional versions of Malaysia's small parties. The raw dataset names each small-party candidate, so three were split out of the pooled "independents and small parties" entry, each with the votes the real party took in the same seats: *Parti Generasi Baharu* (GENBA, a youth party: six seats contested, one won, from MUDA's results), *Parti Cahaya Sarawak* (CAHAYA: from PSB and PBM in Sarawak, one seat won) and *Parti Suara Pedalaman* (SUARA: from KDM in Sabah, one seat won). The names are invented and echo no real party; the leaders (Cik Nurin Sofea, Datuk Dennis Lapok, Puan Dorothy Gimbad) are invented and drawn to resemble nobody.
  - **What they do.** They win votes and seats like any party, show in polls, the map legend, results and the House, and sit in the talks to form a government as one-member blocs, each with a leader, a portrait, things it wants (reform for GENBA; autonomy and oil royalties for CAHAYA; autonomy, development funds and the Sabah chief ministership for SUARA) and its own way of saying yes or no. They can be signed, owed promises, and given cabinet posts, and a whole term with all three in government has been run in tests.
  - **What they do not do.** They cannot be played. (They did not campaign at first; see the next entry.)
  - **Left pooled on purpose.** The independents, and the other small parties (including one that is a single well-known person's vehicle, which an invented party would be too easy to read as).
  - **Polls** shrink their error for the tiniest shares (a party on half a percent can no longer read as two), so the small parties read sensibly. The noisy-polls challenge still doubles every error.
  - **Saves** move to version 9. A save made before this has seven parties where there are now ten, and is turned away as "from an earlier build"; export files from earlier builds are too.
- **The small parties campaign.** A small party now runs a campaign wherever it holds a seat or took 5% of the vote (so in a general election and in a career, not in a by-election or the three state assemblies we have). They play their weeks with the rivals' own logic and their own styles (the young reformers live online; the Borneo locals knock on doors), and they can be met, offered pacts and given understandings like any leader; the voters of a small party follow a pact with the party they are closest to far better than with one they are not. They are held to a size, though:
  - **Money.** They start with RM60-90k against RM300k-1.6m for the others, receive a third of the usual donations and raise a third at a dinner or an online appeal (fundraising yields were fixed sums, so a party of one seat raised as much as a national one and spent over a million).
  - **Days.** Four or five in a week, as the other regional parties.
  - **No national attacks,** which hit a target's support in every seat and would be out of proportion from a party of one seat. They are not offered to the player as targets, and a small party's routine ground work is not news (a viral video or a flop still is).
  - **Result.** In 20 simulated campaigns with the player idle, they won on average 1.7, 0.8 and 1.7 seats against the 1 each they hold, and none ended in debt.
  - **Saves** move to version 10; a version 9 game (made after the small parties arrived and before they campaigned) is upgraded by starting a campaign for each.
- **Quick wins for first-time and wider audiences.**
  - **Feedback link.** "Send feedback or report a problem" on the title screen and in the game panel opens a new GitHub issue with the version (release number and commit), language, contest, week and screen width filled in. The game sends nothing itself; the player reads the text and decides. It holds no name, save or account. It needs the repository to be public for strangers to use it.
  - **Jargon tooltips.** A few words a newcomer may not know (ceramah, machinery, hung parliament, margin of error; and the unity and credibility labels) get a dotted underline and a short explanation on hover, focus or tap, in both languages. A word is marked only where it first appears in a sentence, and only in the adviser's text, action descriptions, title-screen blurbs and the term labels, not in event text, so a common word like "unity" is not underlined in "unity government".
  - **Colour-blind palette and larger text.** A "Display" menu in the header switches the party colours to a set that differs in brightness as well as hue (red, blue and green become orange, blue and yellow) and makes all text 15% larger. Both are remembered. A party the player designs keeps its own colour. Party names are always written beside their colours, so colour is never the only signal.
- **Election night, animated in 2D.** Each seat as it is declared flashes an outline on the map, in a colour that says what it meant: grey for a hold, white for a seat that changed hands between other parties, green for a seat the player won, red for one the player lost. The seat numbers in the tally run up to their new value instead of jumping (so skipping to the result reads as a count, not a cut), and the call that a party has a majority pulses once. Nothing moves for a player who has asked their system for reduced motion, and a skip to the end flashes nothing. It reads the same result data as before and changes nothing in the sim; a 3D version, if it comes, is a separate screen on top of this.
- **Set challenges.** A "Challenges" list on the title screen offers six fixed contests, each with a goal: two by-elections (one as the underdog, one with hidden odds and noisy polls), three state elections (Perlis, Perak, Pahang) and a general election as BP (gain 15 seats). The seed is fixed, so everyone who plays one faces the same hidden swing and can compare results; they always run on hard, and the adviser stays out of the by-elections. The goal shows as a line above the map while playing, and the verdict (met or not, and what was managed) sits right under the result headline on election night. The goals were set by playing each contest with the game's own autoplayer, which does a sound but unimaginative job: an idle player fails every one, and the autoplayer meets all but one or two. They are stored as `Campaign.challenge.goal` (an id), which is optional, so no save version change was needed. Careers are not offered as challenges.
- **A look back at last week (opportunity cost).** From the second week of a campaign, the top of the Actions tab says what the previous week went on: days used out of those available (unused days in bold), money spent, where each rival's leader campaigned, and the close seats a rival's leader visited that the player's did not. It uses only what a player could know: their own days and money, leaders' visits (public), and which seats look close by the last election and any poll they paid for (within ten points of the lead, with at least 5% in the seat). Rivals' unseen work (machinery, chiefs, advertising) is not shown, because the player would not see it. It is stored as `Campaign.recap`, optional, so no save version change was needed, and it is hidden while the adviser is guiding.
- **Round 2 of player requests (Malay brief).**
  - **A party founded from nothing.** In a career, a party of the player's own can now either take over a big party (as before, with its seats and money) or be *founded*: it takes the place of the small party GENBA, with one seat, about half a per cent of the vote and RM150k, while its name is put on the ballot in every seat with a 0.5% seed (`foundedWorld`), because a party with no votes in a seat can never grow there. It grows each week among the voter groups whose wishes its platform matches (`alignment`, from -1 to 1), faster when the leader is believed and the branches are strong, and slower as it gets large (growth falls to a tenth by 30% of the vote). The size of the lift was set by simulation with the game's autoplayer: about 2.5% of the vote after one term, 6-10% after two, 13-20% after three, and 23-28% after four, with seats lagging (5 seats until about 10%, then 25-70) as first-past-the-post makes them. Because the lift follows the platform, where a player stands decides where the party grows. Rivals attack it like a big party, and it is not held to the small-party purse. It is saved as `Career.founded`, optional, so no save version change was needed.
  - **A platform of its own.** The creator shows all 12 issues as five-step scales with four ready-made starting points (reformist, populist, conservative, technocratic) and a centre ground; each is then free to move by hand. It starts as the party's platform, so a new party is not accused of a U-turn, and can be changed later in the Policy tab at a price in credibility.
  - **Map zoom and pan on phones.** Pinch with two fingers, drag with one once zoomed (a single finger on the whole map still scrolls the page), or use the +/- buttons; Ctrl/Cmd and scroll zooms on a desktop. The zoom starts afresh whenever another state is opened. A drag never picks a seat by accident.
  - **Action groups start closed**, including the suggested one, each with a one-line count; the choice is remembered.
  - **Autosave is visible.** The game already saved after every change; the header now says "Saved automatically" after each save, and warns if the device cannot store it.
  - **Eight more actions, each with a catch.** The player can now also hold an *open town hall* (strong in cities, weak in villages, one time in five a gaffe), a *community aid drive* (wins the poor and the villages and lifts turnout, but one time in six it is reported as vote-buying, more often when over the spending limit), a *youth drive* (wins first-time voters and gig workers and brings young voters out, which helps whoever else they favour too), a *people's carnival* (a little from everyone, every time, and unity up by 2), a *party conference* (a day spent on the party, not the voters: unity up by 8, no votes), a *TV debate* (won or lost by the speakers' charisma, a loss hurts, a repeat is worth 0.6 of the last), the *manifesto launch* (once a campaign; strong with graduates and professionals, weak if the party is divided, better with a believed leader) and a *local radio slot* (cheap, reaches the villages and pensioners). The by-election offers the town hall, aid drive, carnival and conference; the others need a state, a country or a rival. They are the player's alone: rival parties do not use them, so nothing about the rivals' balance changed. Measured against the autoplayer over eight general elections, spending the days on any one of them leaves the result about level (82-85 seats against 84), and spending them on all four wins fewer (78), so none is a shortcut. Saved as `PartyCampaign.plays` (optional) for the counts a one-off or fading action needs.
  - **Pick any seat for a by-election.** The title screen lists every parliamentary seat (222) and every assembly seat of Perak, Pahang and Perlis (116), with a search by name, code or state, so nobody has to press "another seat" until theirs comes up. Close three-way races are marked, and "random" still draws one of those. A by-election in an assembly seat is fought on that state's own map and results (`byelection:dun:<state>:<code>`). Only the parties that stood in that seat last time can be led, since a party off the ballot could do nothing there, and the adviser's welcome no longer claims every seat was a close three-way fight. The vacancies that arise by themselves during a career are still drawn at random, as they are events the game imposes.
  - **Governing: the state of the nation.** Three figures from 0 to 100 are added beside the economy: how well the country's health and its schooling are looked after, and its standing among other nations (`Career.nation`, optional, so no save version change). Each drifts slowly towards a target: health and education follow the budget's own line for them (a boost lifts the target by 14 points, a cut lowers it by 14) and the skill of the minister who runs it, and are squeezed by debt above 80%; standing follows how steady and believed the government is, the growth rate, and debt above 70%. Those in government answer for them: voters in the groups who notice each figure reward or punish the prime minister (and half so the partners). Boosting health and education to about 68 over a term costs about 13 points of debt (74% against 61% when cut), which sets standing and the agencies against the wards and the classrooms.
  - **Sixteen challenges of governing** (events, in both languages): hospitals full, an outbreak, bad exam results, a campus protest, a teachers' strike, a rating agencies' warning, a trading partner's tariffs, boats in the offshore waters (with a follow-up ruling by a regional mediator), hosting a regional summit, refugee boats, a large foreign investor, an invitation from two great powers, Sabah and Sarawak's royalties row, the Palace's unease, and a state refusing a federal directive. The ones tied to a figure come only when it is low (health or education below 50) or the books are strained (debt above 65%). Other nations are never named: "a trading partner", "two great powers". A run of ten careers sees about 3-4 of them a term, from 11 to 15 kinds.
- **Six more states (5 Oct 2026).** Kedah, Kelantan, Terengganu, Penang, Selangor and Negeri Sembilan can be played as state elections, from Tindak Malaysia's results for 12 August 2023 (CC BY 4.0; credited in the game). The boundaries and census figures for them were already in the DOSM files.
  - **They open as they were fought.** In 2023 the real counterparts of PS and BP were allies and never stood against each other: in each of the 245 seats exactly one of them faced PT. A state election there opens with that pact in force (`standingPact`, from a new optional `stood` on each seat): the allies start on good terms, the first day's news says so, the title screen's party cards say how many seats each stands in (BP stands in 12 of Selangor's 56), and the player can end the pact in the Deals tab before nomination day like any other. The three states that voted in 2022 were three-way fights and open with none.
  - **What each ally would poll alone is an estimate.** The engine already fits a seat to "what it would have done with everyone standing" (`basis`) where a pact kept a party off the ballot; here that figure is worked back from the declared result, splitting the allies' joint vote by their relative strength in the same area in 2022. It is checked by a test: with the pact applied, the model gives the declared winner in 240 of 245 seats and vote shares within a point on average. End the pact and the allies split their vote: in Negeri Sembilan the model then has PT winning 14 seats instead of 5.
  - **A by-election in one of these seats is a fresh three-way contest**, with no pact: a by-election has no dealings between leaders. The seat picker now lists 361 assembly seats.
  - A party's right to campaign is now judged on what it would poll with everyone standing, so an ally kept off most ballots by the pact (PS in Terengganu) still has a campaign and a leader to hold the pact with.
  - Cost: the six states' seat data is loaded with the page, which adds about 100 kB before compression (the main script is now about 1.06 MB, 325 kB compressed). Their maps load only when opened.
- **A game menu.** A Menu button in the header (and Escape to close) opens what any game has: Resume, Restart this game, Save or load, New game, and Main menu. Restart begins the same contest, party, difficulty, leader, challenge and party identity again under the same name, with fresh luck, or with the same fixed seed for a set challenge; it asks to be pressed twice, since it replaces the autosave. New game goes to the title screen with the full set-up open; Main menu goes to the title screen as it is. Election night also offers "Play this again". The set-up is kept with the game (`GameState.start`, optional, so no save version change); for a game saved before, it is worked out from the game itself, which recovers everything except a taken-over party's one-step ideology.
- **The last four states (6 Oct 2026).** Melaka, Johor, Sarawak and Sabah complete the set: all thirteen state assemblies can be played, and the by-election picker lists all 600 assembly seats. The results are Tindak Malaysia's (CC BY 4.0, credited in the game with their listed sources).
  - **Which election.** Each state uses the election nearest the 2022 general election: Melaka November 2021, Johor March 2022, Sarawak December 2021, Sabah September 2020. Sabah has voted again since (2025), and Johor and Negeri Sembilan in 2026; those are left out so every map describes the same few years and the same line-up of parties.
  - **Melaka and Johor** were three-way fights and are taken as declared. In six Johor seats PS's counterpart stood aside for the youth party, so PS is not on those ballots, as in one parliamentary seat.
  - **Sarawak** is GBK's: 76 of 82 seats, with CAHAYA (4) and PS (2) the opposition. BP did not stand and is absent; PT's counterpart stood in one seat.
  - **Sabah** was fought by two camps. The parties that by 2022 had become GBS's counterpart stood under two banners in 2020; their votes are added together (they met in six seats, and the sum never changes the winner). The other camp put up one candidate a seat, from LEGASI's counterpart or from one of PS's: in the game that is a standing LEGASI-PS pact, handled exactly as the 2023 one (an estimated `basis` for each seat, the pact in force on the first day, and the player free to end it). With the pact applied the model gives the declared winner in 72 of 73 seats.
  - **The parties of Sabah and Sarawak can be led on their own ground.** GBK in Sarawak, GBS and LEGASI in Sabah, in the state election or any by-election there (`atHome`), and they are offered first. Elsewhere, and in general elections and careers, only the three national parties can be led, as before. Stage 2 decided "the three national coalitions only; the Borneo blocs are rivals for now"; that still holds nationally. This exception was added because a Sarawak election in which the player can only be a two-seat opposition is not much of a game.
  - **A fuller chest at home.** A national party brings 30% of its national chest to a state; a regional party's national chest is small because it only ever fights there. On its home ground it starts with three times its usual sum (scaled to the contest like everyone's): GBK RM630k in a Sarawak election against PS's RM360k. The small parties CAHAYA and SUARA get the same lift at home (CAHAYA, the main opposition in Sarawak, would otherwise start with RM24k), though they still cannot be led. It also applies to all of them as rivals in a by-election in Sabah or Sarawak.
  - **Checked by simulation,** six campaigns for each party on offer, played by the rival logic and again left idle (averages): Sarawak stays GBK's (66 seats when it sits idle, 73 when it campaigns, 78 against an idle PS); Sabah is a four-way fight in which nobody averages the 37 needed alone (GBS 19 to 28, LEGASI 14 to 24, BP 11 to 21, PS 9 to 12).
  - **Not done.** The home parties have no tutorial of their own, the "close race" mark in the seat picker still looks only at the three national parties, and the six states' and four states' seat data all load with the page (the main script is now about 1.13 MB, 343 kB compressed).
  - `turn.ts` had grown past 500 lines; who takes the field and what they start with now lives in `field.ts`.
- **An empty chest buys nothing (6 Oct 2026).** Found in play: with no money left, a choice in an event that cost money could still be taken, and gave everything it promised.
  - **Event choices.** A choice that costs more than the party has is shown, greyed, with "Not enough money", and cannot be taken (`canChoose` in `events.ts`). Every event keeps at least one choice that costs nothing. What a gamble may lose is not counted: a loss takes what is there.
  - **By-elections and state polls in a career** follow the same rule: an effort is chosen only if it can be paid for in full. Before, the party paid what it had and got that share of the effect.
  - **Wages.** A team that cannot be paid in full is not paid and does not work: every job counts for nothing (no extra days, no cheaper or sharper polls, no lift to media, fundraising or income) until a payday is met. Before, the party paid what it had and the team worked on. Between elections the retainer is cut back with the rest of the orders, and a team on part pay does not work either. The news says so once when it starts and once when it ends, and the Team tab says so while it lasts. Nobody quits over it. Saved as `Team.unpaid` (optional, so no save version change).
  - **Unchanged:** actions that cost only days can still be taken with no money, as intended.

## Visual design: the Linear system (5 Oct 2026)

The interface was restyled to follow `design-md/linear.app/DESIGN.md` strictly: a near-black `#010102` canvas, the four-step surface ladder (`#0f1011` to `#191a1b`) with hairline borders and no drop shadows, a single lavender accent (`#5e6ad2`) used only for the brand mark, primary buttons, focus rings and links, system sans type at weights 400 to 600, 8px buttons and inputs, 12px cards, 16px map and dialog panels, pill tabs and badges, a 56px sticky top bar, content capped at 1280px, and 4px-based spacing. Tokens live in `src/ui/theme.css`.

Where the system was silent or the game needed more, these are the choices made:

- **Party colours are kept.** The six parties are data on the map and charts, not decoration (the designer's choice when asked). Everything else is monochrome plus lavender.
- **A light theme exists, derived.** Linear documents none. It is built from the system's own inverse tokens (white canvas, near-white surfaces, black ink) and the same lavender, with greys interpolated between them. Dark is the default for new players; "Auto" still follows the device.
- **Success and error colours.** Success is the documented `#27a644`. Error and warning use `#eb5757`, from the in-product colour tags the system mentions but does not specify.
- **Link text uses the hover lavender** (`#828fff`) in dark, because the base lavender is too dim for small text on near-black.
- **Repeated row buttons are secondary** (surface and hairline); lavender is reserved for each screen's one call to action.
- **The party-coloured bunting was removed** from the title and legacy screens: it was decoration in several accents, which the system forbids.
- **Fonts are the documented fallback stack** (SF Pro, then the system sans), because the app is offline and cannot load Inter.
- **Unity and credibility are bars (6 Oct 2026),** in the header of a career, on the Deals tab (unity) and on the Policy tab (credibility), at the player's request: the bar's length is the figure out of 100 and its colour runs from the error red when low, through amber, to the success green when full. The number stays beside it. With the colour-blind palette the bar runs from orange to blue instead. This is the one place outside the party colours where colour carries a value.
- **Not restyled:** the shareable result card image, which has its own cream look, and the small animations, which are unchanged and still switched off for reduced motion.
