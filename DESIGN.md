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

## Second interview: what to improve (6 Oct 2026)

Thirty questions, answered by the designer one at a time after a day of play. These are wishes, not yet built; where an answer overturns an earlier decision it says so.

**How it plays**
- The designer mostly plays the **by-election**, and the commonest complaint is that **the outcome feels decided** before the player's choices can matter. Difficulty is **uneven**. This is the first thing to measure and fix.
- Sittings should be as long as the mode: no single target.
- **An empty chest should have two ways out,** each with a price: a loan repaid from later income, and a donor with strings.
- A career's five years between elections feel about right.
- **Winning a career means staying in power** across terms.

**Rivals and politics**
- **Rival leaders get stats and personalities.** *Overturns* "rival leaders are all ordinary, so difficulty stays a matter of skill".
- **Rivals use everything the player can:** staff, endorsers and the eight extra actions. *Overturns* "they are the player's alone"; the balance figures recorded for those actions will need measuring again.
- **State chiefs become full characters:** names, skill, loyalty, pasts that can come out, defection.
- **Component parties inside each coalition, without mergers.**
- **Partners plot.** After a government forms they scheme, issue ultimatums and walk out when it suits them, with signs the player can read.
- **The Sabah and Sarawak parties can be led nationally, as kingmakers,** in a general election and a career.
- **Maps move to each state's newest result** (Sabah 2025, Johor and Negeri Sembilan 2026). *Overturns* "every map describes the same few years". Needs the data, and Sabah's line-up of parties changed.

**Content**
- More events of every kind: scandals and intrigue, local colour, governing crises, and moments on the campaign trail itself.
- **Most new events belong to story chains** with later chapters.
- The satire is about right. The netizen feed and the media outlets are read and liked.
- **A full tutorial for the home parties** of Sabah and Sarawak.

**Look and feel**
- **Flags, tents and posters as marks on the map** where the player and rivals are active. An exception to the Linear rule against decoration, to be drawn as data (who is active where).
- **Illustrated portraits,** as the brief first asked, replacing the vector busts. Needs a source for the art.
- **More red-to-green bars:** government stability and trust, rival parties' unity, and the nation figures.
- **The phone layout is awkward** in places; which screens is still to be asked.
- **Election night is too short:** more drama, commentary, calls made and unmade.

**New players**
- After the tutorial, **suggest one next contest and say why**; no second guided tutorial.
- **Tooltips for the game's own terms** (momentum, key seat, standing orders, dossier, safe, leaning, marginal).
- The audience, in order: Malaysians who follow politics, Malaysians who do not, outsiders.

**Release**
- What blocks going public: **choosing a licence**, and **more building first**. The media-law read and the small playtest were not named this time.
- **Load each state's data only when it is chosen,** before launch.
- Success after launch: finished careers, shared result cards, feedback, and players coming back.

## Built from the second interview (6 Oct 2026)

**By-elections that are not decided before they start**
- **Measured first.** Over the 36 three-way seats, each of the three parties, six seeds, with the game's autoplayer at its best playing the party: a party that led last time wins about 3 in 4; one within 3 points, about half the time against gentle rivals and a quarter against sharp ones; one 3 to 8 points behind, about 1 in 5; one further back, never (0 of 156 at every difficulty), and it is squeezed to a median 24 points behind. The quick start drew its seat from all 36 for whichever party was picked, so about 4 draws in 10 could not be won, and nothing said so.
- **A fair draw.** The quick start and "Random close race" now draw only seats where the chosen party led or was within 3 points (`fairSeats`: 15 to 17 seats for each party). Changing party on the quick start draws again if the seat shown is out of reach. Any seat can still be picked by hand.
- **Told where you stand.** Favourite, close fight, uphill or long shot (`outlook.ts`), shown on the quick start, on each party card of a by-election, and above the map while the campaign runs.
- **A goal that fits.** A party not expected to win is judged on its share of the vote: an uphill campaign has to add 2 points to its last share, a long shot has only to hold its own (which the autoplayer manages about one time in four). Meeting it gives a new verdict, "beat expectations", in place of "there is no second prize". A favourite or a close fight is still judged on the seat alone.
- Not changed: the size of any campaign effect. A leader who campaigns wins and one who sits idle loses (76% against 9%), so the choices already matter where the seat is in reach.
- **Measured again after the rivals were given teams and the newer actions:** a favourite who campaigns well wins 74% of the time against gentle rivals and 82% against sharp ones (the autoplayer is the player in both, and is sharper than the gentle rivals); a close fight is won about half the time (47 to 54%); uphill 17 to 27%; a long shot 1 to 5%. A favourite who sits idle now wins 1 or 2 times in 100. The fair draw still holds.

**Before launch**
- **A state's results load when the state is first wanted** (`loadState` in `world.ts`), not with the page. The main script went from 1,139 kB to 951 kB (345 to 299 kB compressed). Saved games are checked for the states they need before the first screen is drawn, and an imported save fetches its state before it is read. The tests register every state up front (`src/data/allStates.ts`, never imported by the game). Both languages' text still loads together (about 330 kB of source): splitting it by language is the next saving.
- **On a phone** the language, theme, display and sound switches fold into one "Settings" button, and the days and funds are no longer repeated in the header when the bar at the bottom shows them, so the map is on the first screen. No tab scrolls sideways at 375 points wide. Checked in an emulated phone, not on a real one.

**Small wins**
- **More red-to-green bars:** government stability and public trust on the Orders tab, each rival party's unity beside its leader on the Deals tab, and the nation figures.
- **Tooltips for the game's own words:** safe, leaning and marginal on the map legend; standing orders, stability, public trust and dossier on the Orders tab.
- **After a by-election, one contest is suggested** with a button that starts it: Perak for PS, Pahang for BP and PT, the home state for a party of Sabah or Sarawak.
- **Two ways out of an empty chest.** A lender advances the next weeks of income at 80 sen in the ringgit and takes that income as it arrives (three weeks' worth in a campaign, eight between elections; one loan at a time; none in the last week, when no income is left to lend against; `loan.ts`, saved as `PartyCampaign.loan`, optional). The donor with strings already existed as the tycoon action and the donors order; the tycoon is now on offer in by-elections too.
- **A by-election count with a commentary.** 18 boxes in place of 12, the last five slower while the seat is open. Each box gets a line (first box, the lead changing hands, closing, pulling away), and a desk that leans one way once the lead is more than half the votes still out, takes that back if a box goes the other way, and calls the seat only when the votes left cannot change it (`countStory`). The seat-by-seat night of a larger election is unchanged.

**Rival leaders with stats and tempers** *(overturns "rival leaders are all ordinary")*
- Each of the nine leaders has four stats that add up to twelve, like every backstory (`LEADER_STATS` in `cast.ts`): the reformer fills a hall and is believed, the old hand organises and schemes, the patriarch of Sarawak organises above all. They work on a rival exactly as the player's leader's do on the player: the crowd at a rally, the branches, how hard an attack lands and how well one is shrugged off.
- **The party's own leader is no longer a blank.** A player who picks no backstory leads with their party's leader and that leader's stats. A party founded from nothing still gets an ordinary leader.
- **Tempers.** Each leader takes what the player does to them in their own way (`TEMPER`): an insult lands 1.5 times as hard on the proud leader of LEGASI and 0.6 times on the patient one of GBK; a kindness counts 1.3 times with the opportunist of GBS. It scales every change in a rival's relations with the player. The Deals tab shows each leader's stats and a line on their temper.
- **Balance.** Averaged over ten general elections played by the autoplayer, the three national parties finish where they did before (PS 74.7, BP 26.9, PT 73.0 seats, against 73.8, 25.5 and 75.7 with ordinary leaders). A single fixed seed, though, moves by several seats under any change to the rules, so the six set challenges were given new seeds and "The comeback" now asks for 10 seats gained, not 15.
- Not done from the same answers: rivals still have no staff, endorsers or the eight extra actions.

**Kingmakers** *(overturns "the three national coalitions only" for national contests)*
- GBK, GBS and LEGASI can be led in a general election, the hung-parliament talks and a career, offered after the three national parties. They stand only at home, so there is no majority to be won: the game is whom to put in office and what to take for it. The coalition talks already let a player back a rival's claim. Two full terms as each of the three run through cleanly under the autoplayer. Nothing was written specially for them: no tutorial, no events of their own, and "winning" is still measured as for anyone else.

**Partners who plot**
- A partner in the player's government now drifts towards the door when it has a grievance (`plots.ts`): most of all when the player is on cold terms with it or has let a promise to it fall overdue, and a little when the government is shaky or disliked. It drifts back when the grievance is gone.
- **Signs to read.** The Orders tab says how each partner is (content, restless, plotting). At 35 of 100 the papers notice ("seen dining with the opposition"). At 65 its leader comes with an ultimatum: find money for their constituencies (RM150k at general scale, credibility −1), give them their way (unity −6, stability +4), or tell them to do their worst (they back down more often from a steady government and a leader they do not hate; otherwise they leave at once). At 100, unanswered, they walk.
- When one partner brings an ultimatum the others step back 20, so they do not all come in the same month.
- **Measured** over six first terms as head of government with nothing done to keep partners happy: about two ultimatums a term; conceding each keeps every partner; daring each loses one partner in most terms and brought the government down in one of the six.
- Saved as `Career.plots` (optional, so no save version change). Only the player's own government is watched: a rival's partners still leave as they did.

**Decided after the second interview (6 Oct 2026)**
- **No licence yet.** The repository carries none: all rights stay with the designer until one is chosen.
- **Newer results may be downloaded** from the same Tindak Malaysia repository, where it has them.
- **Illustrated portraits are to be generated**, one sample leader first, and the rest only if the style is liked.

**Newest results** *(overturns "every map describes the same few years")*
- **Johor and Negeri Sembilan are played on their 2026 results** (11 July and 1 August 2026, Tindak Malaysia, CC BY 4.0, credited in the game). Both were fought by the three coalitions separately and are taken as declared: Johor BP 48 and PS 8 of 56; Negeri Sembilan BP 18, PS 11, PT 7 of 36. Negeri Sembilan therefore no longer opens under the 2023 PS-BP pact; the other five states of August 2023 still do. The 2022 Johor file is kept but no longer read.
- **Sabah is played on its 2025 result** (29 November 2025), with the small parties pooled, as the designer chose. GRS is GBS, Warisan is LEGASI, BN is BP, PH is PS, PN is PT and KDM is SUARA; UPKO, STAR, the smaller parties and the independents are pooled as "others", who hold ten of the 73 seats between them (five independents, three UPKO, two STAR). The seats as declared: GBS 29, LEGASI 25, others 10, BP 6, and one each for PS, PT and SUARA. Every coalition stood for itself, so the model fits exactly and **Sabah no longer opens under a LEGASI-PS pact**. PT won a seat and can now be led there. The 2020 file is kept but no longer read. Not rewritten: the party blurbs, which still read true, and the Sabah balance figures recorded under "The last four states", which describe the 2020 map.
- Parliament is still the 2022 general election.

**Painted portraits** *(the brief's "illustrated portraits", begun)*
- The party leaders are getting painted portraits in place of the drawn busts: generated through the designer's Canva account from a written description of each invented leader (age, dress, bearing, the party's colour as a glow behind them), each asked for as "an invented person who does not resemble any real politician". The designer approved the first as the style for the set.
- **All nine leaders are in,** as 200-pixel images of about 9 kB each in `src/assets/portraits/<party>.jpg`. A leader with a file there is shown painted; one without, a leader the player has given a look of their own, ministers, staff and the adviser keep the drawn bust (`Portrait.tsx`). The share card still draws its own.
- Still drawn, not painted: the ministers, the staff and the adviser.

**The rest of the second interview (6 Oct 2026, continued)**

- **Marks on the map.** A seat a party has worked hard lately shows a ceramah tent in the party's colour; one still being worked shows a flag, and two flags in a seat are a flag war (`marks.ts`). They are read from the lift each party's visits have left in the seat, which fades week by week, so a mark goes when the party stops coming. At most two parties are marked in a seat. Seen from the whole country only the tents show; the flags appear once a state is open. This is the brief's "flag wars, ceramah tents", drawn as information, not decoration; posters are not drawn.
- **Stories in chapters** (`eventList4.ts`, `i18n/events4.ts`). Three stories of three chapters each, in both languages: the accountant's papers (a scandal that reaches the player's own people), the bridge (four villages, one contract, one ribbon) and the rice (a shortage, a price, an inquiry that names the party's donors; for a party in government). Only a first chapter comes up by chance; every choice in it sets the next in motion some weeks later. With the partner's ultimatum, the event list now has 128 entries.
- **Rivals use everything** *(overturns "they are the player's alone")*.
  - The eight newer actions (town hall, aid drive, youth drive, carnival, conference, debate, manifesto, radio) are weighed by rivals beside the old ones, each for the groups it reaches, a town hall less its one flop in five, a debate by who is the better speaker, a conference only by a party that is coming apart. The same weighing feeds the "Suggested this week" list.
  - Each of the six larger parties has a small team of its own (`RIVAL_STAFF`): PS a media chief, BP a treasurer and a middling manager, PT a manager, and so on. GBK has none (its leader is its organiser), and of the small parties only CAHAYA has one. Rivals do not pay wages or hire and fire.
  - Endorsers already came out for rivals of their own accord; rivals still do not court them.
  - **Balance,** twenty general elections with the player (PS) idle: PS 70.9, BP 27.9, PT 76.7, GBK 27.1, GBS 8.2, LEGASI 6.3, and the small parties 1.8, 0.65 and 1.75 of the seat each holds; close to before. A manager for GBK as well cut CAHAYA to a third of that, which is why GBK has none.
  - The set challenges were given new seeds twice more. "Dent the fortress" now asks PS for two seats in Perlis, which is all the autoplayer manages there against a PT with a manager, and "The comeback" asks BP to hold 28 of its 30 seats, where an idle BP keeps 14.
- **A guided start for the parties of Sabah and Sarawak.** The quick start offers GBK, GBS and LEGASI a by-election in a seat on their own ground where they led or were close (`fairSeats`), and the adviser speaks to their position: the fuller chest, the national parties as visitors.
- **Chiefs are people** (`chiefs.ts`). Each of the player's chiefs has a name, an ability from 2 to 5 that moves the crowd at their rallies a tenth either way for each point from 3, and a loyalty that rises by 4 a week when the leader is in their region or visits a seat there and falls by 2 when not (3 more in a party whose unity is under 40). Below 30 the chief says so in the papers. Below 20 they may cross to whoever else is strongest on the ground there, taking 15 points of branches. One chief in five has something in their past, which a campaign brings out about one week in sixteen. Either way a steadier, less able deputy waits to be appointed. Shown on the Chiefs tab. Rivals' chiefs stay nameless. Saved as `Team.chiefs` (optional).
- **Member parties, with moods** (the lighter of the two versions offered, as the designer chose; `members.ts`). PS, BP, PT, GBK and GBS are each three invented member parties with a share of the coalition's seats and voters of their own (for PS: Parti Reformasi Rakyat, 45%, the urban poor, gig workers and the young; Parti Suara Kota, 35%, urban liberals, the middle class and small business; Parti Amanah Desa, 20%, the heartland and the civil service). LEGASI, the small parties and a party the player founded are single parties.
  - **A member follows its own voters.** Between elections its mood moves a twentieth of the way each week towards 60 plus 250 times the party's swing among those voters since the election: 10 points down among them and it is restless (below 35), 16 down and it is mutinous (below 20). A row that costs the party unity is felt by all three at once.
  - **Signs and consequences.** The Orders tab says how each member is. A member that turns restless says so in the news. A mutinous one may walk out, taking its share of the party's MPs, the ones in the seats where its voters are thickest; they sit apart until the next election, the party loses 8 unity, and a government it was part of loses the seats and 6 stability. The largest member is the party's core and cannot leave: mutinous, it costs the leader a point of unity a week.
  - **Measured** over eight first terms played two ways: in most nobody stirs; a member turned restless in three of sixteen; in the one term the party sank more than 20 points everywhere, both smaller members left.
  - Not followed: rivals' members; decisions that cost unity outside events (deals in coalition talks, pacts) do not reach the members directly; nothing happens to them during a campaign. Saved as `Career.members` (optional).

**Asked for while playing (6 Oct 2026, evening)**

- **The centre map in a career.** Between elections the map had fallen into the side column and the centre stood empty: the jargon tooltip's style (`.term`, with `all: unset`) also matched the "What now?" line, whose class carried its step's name, `term`. The tooltip is now `.gloss` and the line's class is prefixed.
- **More room for the tabs.** The poll panel sits under the map, so the side column is the tabs and what they open; the column is two fifths of the page, between 400 and 520 pixels.
- **Stability and public trust in the header,** beside unity and credibility in a career, two by two. On a wide screen the game's name, the menu and the switches share the header's first row and the figures take the second.
- **Support by voter group, as a poll reads it** *(a change to "how each bloc is leaning is not public")*. Every national poll now also records the player's share of the vote within each voter group (`Poll.groups`, optional), read twice as roughly as the poll itself because each group is a smaller sample. The bars sit under the poll, coloured from red to green with full green at half a group's votes, and they move only when a new poll comes in, so a poll is still worth paying for. How a group leans in a single seat is still not shown. The groups' dice are their own, so nothing else about any game changed.
- **No sideways scrolling.** The header's full-width rule reached past the page on both sides and let the whole page be scrolled sideways into nothing on a wide screen; the page no longer scrolls that way.

**The result card, redone as a poster (6 Oct 2026, from ten questions answered one by one)**

- **What it was:** cream paper, a strip of bunting, a headline and four small figures. Players found it dull.
- **What it is:** a 1200×630 poster in the party's own colour (darkened by lightness so the hue stays rich and white type stands out: a gold party gets a deep amber, not olive), with light rays, a white inner frame and the game's mark small in the corner.
  - **The leader and the number side by side.** The painted portrait, large, in a white frame with a name plate across its foot; and a giant figure: seats won, with the whole chamber drawn big around it and the player's own seats lit in white and the rest dimmed; or in a by-election the share of the vote, over the four vote bars; or for a career the legacy score. The chamber is pushed out from its centre to leave a hole for the number.
  - **The shout** is a headline in capitals, one per result: "The House is ours", "Biggest in the House", "Ground gained", "The line holds", "Still standing", "The seat is ours", "Beat expectations", "We fought. We'll be back." A loss gets the same bold card and a defiant word, never a mocking one.
  - **The line under it speaks by result** (`cardVoice.ts`): grand for a clear win (a majority ten seats clear, the largest party with two fifths of the seats, a gain of 8% of the chamber or more, a by-election won by 2 points or more) and the game's dry wit for a squeaker, a hold, a loss or a defeat. Both in English and Bahasa Malaysia, in the player's own language; the Bahasa lines are checked by a test against being left unwritten.
  - **Figures:** seats against last time, vote share, position and the seats needed to govern; in a by-election the margin in votes, position and turnout; in a career, years as leader, years in the top job, elections fought and promises kept. **Badges** for how it was done: ruthless rivals, hidden odds, noisy polls, and a set challenge met.
  - **Branding is small:** the mark in the corner and the tagline and the fiction notice in the foot. No address, no call to play.
  - **One format,** the wide 1200×630, as chosen.
- **Not done:** posters or stories in other shapes (portrait, square, story); the ministers' and staff's faces on the card; any writing in the card's own language independent of the game's.

## Third interview: UI and UX (6 Oct 2026)

Fifty questions, answered one at a time. These are wishes, not yet built. The designer plays on a **laptop or desktop**; the phone should get "a fair amount" of polish. The one thing to fix first: **too many things on screen.**

**Where the answers pull against each other**
- The top priority is *fewer things on screen*, but several answers add things: a relationship map, a timeline, a headline ticker, commentators, toasts, flashes, a Voters tab, sliders. **Simplify first**; build each addition only where it replaces something or earns its room.
- **"Follow the device" for the colour-blind palette is not possible as stated:** browsers expose no colour-blindness setting. What can be done instead: mark parties with shapes or patterns as well as colour everywhere (so the switch matters less), and keep the Display switch.
- **Sound and music on by default at low volume** will not play until the player's first click or key press (browsers block it), so it starts after the first interaction, with a mute button always in view.

**Layout and navigation**
- **Title screen:** pick a mode first (by-election, state, general, career as big cards). Customise becomes **steps** (contest, party, leader, difficulty, start), one decision per screen.
- **Header:** **icons only** for the switches (language stays a small EN | BM, since an icon cannot say which language), theme **follows the device** by default, and sound controls stay in reach.
- **Map is the biggest part** of the screen. Colouring stays as it is (party colour shaded by margin). Hover keeps the small tooltip.
- **Tabs are grouped** into fewer, larger ones, each with **an icon and a word**. Saves moves to the Menu. The voter-group bars move to **their own tab**, off the poll panel. Seats becomes **target seats first**, ranked by what is worth the next day, with the reason. Deals becomes **a relationship map**. Polls gets **a recommendation** of the most worthwhile poll, with the reason. The career's Policy tab uses **sliders**. A **timeline** across the top shows the five years.
- **Keyboard:** Space ends the week; number keys switch tabs.

**Playing**
- **Actions:** folded groups with suggestions on top, as now. Each action shows its **cost and its expected gain**. A blocked action **offers the fix** ("Not enough money. Raise some?"). Taking an action gives **a toast and a flash on the map**.
- **End week:** no confirmation; the button reads **"End week (3 days unused)"**. **No undo.** Autosave keeps a **history** of recent saves per game.
- **Guidance:** the "What now?" line stays but gets **a switch to hide it**. Kak Ros moves to **a bottom strip**, like subtitles. **The adviser speaks up** when a career figure falls into danger. Terms are explained **once, on first use**; tooltips otherwise as now.
- **Decisions** (events, calls from leaders) wait in **an inbox** you open, with a badge, rather than covering the screen. The week still cannot end while one waits.
- **Long text:** a short line first, **more on request**. Numbers stay rounded (RM480k, 38%).
- **Election night:** a headline ticker, a big tally bar always in view, a pause on big moments, and commentary, as in the by-election count. **The result screen** keeps the verdict and figures first, and lists new **achievements under the verdict**. A **thumbs up or down** after each game, with an optional comment, sent only if the player chooses.

**Look and feel**
- **More lively:** smooth transitions, cards that slide in, numbers that tick, with Reduce motion honoured. **Density switch** (comfortable or compact) in Display. **Party colour** tints the interface (header, accents, buttons).
- **One bundled typeface for everything** (Inter, about 100 kB) in place of system fonts. **Default text size follows the browser's setting.**
- **Larger targets only for the main actions** (End week, Go, dialog choices); the rest stays compact. **Empty states** get **a small illustration** and a line in the game's voice. **Errors** get a plain, kind message with a next step. A **branded splash** while the game loads.
- **Outsiders** get only the tooltips; no primer. **Phone:** a fair amount of polish.


**What was built from this interview (7 Oct 2026), and what was not**
- Built: grouped tabs with icons, a quieter header, a Voters tab, decisions in an inbox, Kak Ros as a bottom strip; Space and number-key shortcuts; the End-week label with unused days; actions showing their expected gain and offering the fix when blocked; toasts and a map flash; theme and text size following the device; bundled Inter; party-colour tint; density switch; lively motion; empty states; kind error messages; a branded splash; a history of autosaves; achievements earned under the verdict and a thumbs up or down with an optional comment (sent only through a prefilled GitHub page the player opens); the Seats tab leading with seats to win and seats to keep; Polls suggesting the closest seat nobody has polled lately; Kak Ros warning when one of the four career figures falls below 25.
- Built afterwards, the same day: election-night commentary ("On the desk") and an automatic pause when a party crosses the majority line, with the tally kept in view on a phone (the ticker, tally bar and pause button were already there); each term explaining itself once on first use (one at a time, switched off with the "What now?" hide switch); a short first sentence with "More" on the long intros; a career timeline in the header, one marker per parliament (filled where the player came out heading the government, dashed where not; `CareerRecord.terms`, optional); a relationship map under Deals (tucked in a fold; solid and dashed lines, thick for pacts); Policy stances moved on a slider with the rivals' positions beneath; Customise as three steps (contest, party and leader, rules).
- Built last: the title opens on a choice of how to play (learn by playing, choose a contest, a whole career), with the last choice marked; in the colour-blind palette every party also has its own **shape** (dots and legends) and its own **fill** (bars, and a pattern laid over its seats on the map), so colour is never the only signal. Every item from the interview is now built.

**A brand-new party in any contest (8 Oct 2026).** Suggested by the designer: let the player create and lead a totally new party instead of taking over an existing one. A career could already found one; now **the choice is the first thing asked on the party step** ("Take over a big party" or "Found a new party from nothing") for every contest except a hung parliament, whose votes are already in. In a single contest there are no years to grow in, so the new party arrives **with a following**: a share of the vote in every seat (`NEW_PARTY_SHARE`: 25% in a by-election, 14% in a state, 7% in the general election), a small purse (the same `FOUNDING_FUNDS`) and an ordinary leader unless a past is chosen. It takes the place of GENBA, as a founded career party does, in a world built by `newPartyWorld`, which keeps the contest's own id so maps and saves read it as the same contest. The game remembers it as `Campaign.newParty` (optional). Set by simulation with the autoplayer over twelve seeds: it ends a by-election on 12-22% and a state election on 10-15%, with no seat in either, and the general election on about 6% with one to three seats, so it is an underdog fight in which a good player can do better than the autoplayer. A single contest has no platform editor; the platform is a career matter.

## Fourth interview: Three.js (8 Oct 2026)

Thirty questions, answered one at a time. Nothing here is built yet. The agreed first step is **a working prototype of the 3D map**, to be judged before anything else is started.

**What and where**
- **First home for 3D: the Malaysia map itself.** It is a **view**, switched between **Flat and 3D** (a button in the map toolbar and a Display setting, remembered across games). The flat map stays the default on phones and wherever 3D cannot run.
- **Second candidate, later: a 3D parliament chamber**, drawn as a **semicircle by party with a majority line**, shown during **government formation and House votes** (hung-parliament talks, coalition building, no-confidence motions, bills).
- **The share card** takes a **snapshot of the 3D map** when it is available, and the current flat drawing otherwise.

**The map**
- **Geometry:** the **existing SVG seat outlines, extruded**, so 3D matches flat exactly with no new data. Tiny urban seats are reached **by zooming**, as now.
- **Height means how firmly the leader holds the seat:** tall is safe, low is marginal, so close contests sit low and stand out.
- **Style:** clean, **flat-shaded blocks** in party colours, one soft fixed light matching the light or dark theme.
- **Camera:** tilt and zoom, **limited**, with a Reset button. No free orbit.
- **Fog of war:** a seat with no fresh word sits **low, pale and patterned**.
- **Markers:** the tents, flags and leader's pin become **small 3D props** standing on the seats.
- **Picking:** the same tooltip card and the same taps as the flat map (a ray picks the seat); the Seats tab works unchanged.
- **Colour-blind palette:** the same **patterns on the top faces** as the flat map.
- **Election night:** each seat **rises and changes colour** as it is declared, with the existing pulse for a flip. Existing sounds are reused; no new audio.
- **Change over time:** blocks **slide to their new height** when a poll arrives or a week ends. No ghost outlines.
- **Simplicity:** height should **carry information the flat map's small bars and labels carry now**, so 3D lets things be removed rather than adding panels.

**How it is built**
- **Plain Three.js in one React component** (no react-three-fiber or drei); the simulation is untouched.
- **Loaded only when 3D is switched on**, so the first load is no slower.
- **Performance:** **60 fps on a normal laptop, 30 on phones**: one merged mesh per party colour, no per-seat objects.
- **Devices:** laptop first. Phones and weak devices **fall back to the flat map** with a short note; with reduced motion, 3D is allowed but without animation.
- **Testing:** the height, colour and geometry maths in **unit tests**, plus headless-Chrome screenshots (software WebGL) to confirm it draws.
- **First slice:** the seat-level map in **a by-election and a state**, then the 222-seat general election.

**What 3D must not do** (all four were ticked): slow down the first load; make the map harder to tap on a phone; change how the game plays (it is a view only); look gimmicky or dizzy (calm movement only, no spinning, swooping or shaking).

**The 3D map prototype (8 Oct 2026).** Built to the interview above, for the seat-level map in every contest (not only a by-election and a state; the general election works too). What it does:
- A **3D** button in the map's toolbar and a **Map view: Flat or 3D** choice in Display, remembered in the settings (`map3d`). Without WebGL the choice is greyed with a note and the map stays flat.
- `scene3d.ts` is plain Three.js: each seat's outline (read from the existing SVG paths by `map3d.ts`) is extruded into a block. **Height is how firmly the seat is held** (`seatHeight`: the margin up to 30%, with a floor so toss-ups stay visible); a seat in the fog sits lowest, pale and hatched; an undeclared seat is nearly flat. Heights and markers are **in proportion to the area on show**, so they follow the camera into a state, and a one-seat contest gets four times the rise so there is something to see.
- **Camera:** tilt (about 54 degrees) with a limited turn left and right, pan kept on the country, zoom with the + and - buttons or Ctrl or Cmd and scroll (a plain scroll stays the page's), and a button that puts it back. Choosing a state glides the camera there. `fitDistance` accounts for the tilt, since the near edge of a tilted box decides what fits.
- **Taps and hovers** use the same code as the flat map (a ray picks the seat), so the card, the state-then-seat selection and the Seats tab are unchanged.
- **Colour-blind palette:** the same ten patterns, painted on the top faces. Tents, flags and the leader's pin stand on the seats as small solid props. A declared seat **rises** from the ground; a seat just declared flashes. Reduced motion skips every glide and flash.
- **Loading:** Three.js sits in its own chunk (about 600 kB, minified), fetched only when 3D is on; the main bundle is unchanged. The pattern list moved to `map3d.ts` and is shared with the flat map.
- **Tested:** the outline reading (every seat on the national map), the holes and islands, the heights, the camera fit and the glide are unit tests; headless Chrome with software WebGL drew the state, general-election, by-election and colour-blind views, and hover, drag, reset and zoom were exercised there.

**Not yet:** the 3D parliament chamber, the 3D share-card snapshot (`snapshot()` is in the scene, but nothing calls it), a seat-by-seat look at election night in the browser (the code path is the same `setDisplay`, but it was not watched live), phone testing, and a measured frame rate. The scene builds one mesh per seat (222 draw calls in a general election) rather than one merged mesh per party colour; that was needed to let each seat rise on its own, and should be measured before it is trusted on a phone.

## Fifth interview: the chamber, the look and 3D in the interface (8 Oct 2026)

Sixty questions, one at a time. The designer's own words on the worst clutter: *"Main Menu, please make each menu and button distinguishable, font is right size to the box, and the box when clicked has distinguish effect, for the improve UI and UX also please include 3js elements"*, and the side tabs. The biggest complaint is still **too much on screen**; in the side tabs the trouble is that **everything looks the same**.

**Must not change:** how the game plays (rules, numbers, balance); saved games must still load; both languages stay complete; everything works with 3D off and on a phone.

**Order of work:** the chamber, then the main menu, then the game screen, with 3D extras last. Each stage is shown and committed before the next begins.

**The chamber**
- **One seat, one block.** Government backers fill from one side, everyone else from the other, with a **majority line**.
- **Talks:** a party's blocks **slide across** when it joins, and a count runs toward the line. **House votes:** parties declare **one at a time**, their blocks rising for Aye or dropping for No.
- **Fixed camera**, one well-chosen angle. Pointing at a block **highlights its whole party** and names it, with its seats and which side it is on.
- Without 3D it is **a flat semicircle of dots**, the same picture. It **replaces the seat bar**; one short list of parties stays beneath it.

**The main menu**
- **A game-style menu over a 3D scene:** a short list of big choices, with **a slowly turning 3D Malaysia in last election's colours** behind it, dimmed, not interactive. The menu is usable at once; the scene **fades in when ready**, and is skipped on phones, without WebGL or with reduced motion.
- Every choice is told apart by **an icon, a colour accent and a clear order of size**.
- **Pressing** a button: it sinks, flashes and gives a soft click; a selected card keeps a solid border and a tick.
- **Text that overflows or wraps awkwardly is the fault to fix:** shorter wording in both languages first, then shrink to fit; never cut off. Layouts are **designed for the longer language and tested in both**.

**The game screen**
- **Header:** week, days, funds and End week only. Gauges move to the tabs they belong to; settings become **one gear button** opening a labelled panel. The player's **emblem and party name** sit in the header, and the party colour is on the main button; the rest stays neutral.
- **Map panel:** the extras (state picker, view switch, 3D, legend) fold behind **one Map options button**. **3D is the default on laptops that can run it.** A **search box** finds a seat by name or code.
- **Poll card:** a **slim strip** under the map (share, gap, seats, and a **small trend line**) that opens on tap.
- **Side tabs:** keep the three groups, with the active one obvious. Rows become **cards with an icon and one clear action**; each tab shows **the best few and folds the rest**. **An icon for every action and tab.** Tabs with news carry **a dot or a count**.
- **A seat opens as a card sliding over the side panel**, from any tab.
- **Ending a week** gives **a short recap card**: three headlines and the player's change.
- **Changed numbers** show a small **+/−** beside them that fades.
- **Before an action is taken**, pointing at it **shows its effect on the map**.
- **Laptop:** the map stays put and only the side panel scrolls. **Phone:** a **bottom bar** (Map, Campaign, People, Intel).
- **Career between elections:** a **dashboard of what needs the player this week**.
- **Saves:** a list of games with party colour and a line of status; empty slots hidden.

**Look and feel**
- **A polished game interface**, dark first with light kept in step. Buttons in **three clear levels** (one primary per screen, outlined secondary, plain text minor; red for danger).
- **Portraits larger** on the menu, in deals and on the result. **A soft click** on main buttons and a tick on tabs.
- **Motion with a purpose:** things move to show where they went; nothing bounces or loops.
- **The verdict is a full-screen moment**, with the leader's portrait and the chamber behind, then the details.
- **Learning:** the tutorial shortens to **five steps**, with hints as things come up, and there is a short **How to play** page with pictures in the menu.
- **Access:** every control reachable and named, a clear focus ring, and a text equivalent for the 3D views.

**More 3D**
- **Election-night finale:** about five seconds, skippable: the map settles and the chamber fills.
- **The share card** has the final 3D map as the picture behind the verdict.
- **Poll bars** rise from the regions when the poll strip is opened in 3D mode.

**Stage 1 built: the chamber (8 Oct 2026).** `hemicycle.ts` lays out any House as benches of a half circle (seats spread in proportion to bench length, taken left to right so a run of seats is a wedge) and `seating.ts` reads who sits where from the game's own state: the House (`houseSeating`, whose left side equals the confidence count), a division as the whips count it (`divisionSeating`) and the talks (`talksSeating`: the player's bid, or the strongest, on the left; its main rival on the right; the rest between). `Chamber.tsx` draws it flat in SVG for everyone and, where 3D is on, as `chamber3d.ts`: one instanced block per seat on stepped benches, a wall at the majority line, one fixed camera. Members keep their identity (`party:k`), so a party that signs **slides across the floor**; in a division parties declare **one at a time**, Ayes rising and Noes sinking. Pointing at a seat picks out its whole party and names it. It stands in the talks (in place of the claim bars, with one line per bid beneath), at the head of the House tab, and in vote scenes. **3D is now the default** for a player on a laptop or desktop who has not chosen (`prefers3d`). The division shown in a vote scene is the whips' forecast before the player decides, labelled as such; the simulation resolves the vote as before and nothing about it was changed.

**Physics, one moment only (8 Oct 2026).** The designer offered Oimo.js, enable3d, ammo.js, cannon-es, rapier and Jolt. Asked where a physics engine belongs, given the wish for calm motion and a first load no slower, the answer was **one moment: when a government falls**, its blocks in the chamber tumble and scatter. **cannon-es** (the smallest, plain JavaScript) is to be used, fetched only at that moment. Everything else keeps its planned, smooth movement.

**The falling government, built (8 Oct 2026).** `fall3d.ts` and `GovernmentFalls.tsx`, with cannon-es: when talks open between elections (a government has lost the House), the chamber fills the screen, stands for a breath, and the government's blocks are let go to fall and scatter; the rest of the House does not move. About five seconds, ended early by a tap or a key, shown once per game and week, above whatever dialog opens the talks. It appears only where 3D is on and motion is welcome; the news says the same in words. The physics engine sits in its own chunk and is fetched only at that moment. The knocks given to the blocks follow a fixed pattern, not chance, so nothing about the game's own randomness is touched.

**Stage 2 built: the main menu (8 Oct 2026).**
- The title screen opens on **a main menu**: Continue (large, filled, with the game's name and where it stands), New game, Load game, Challenges and Achievements, each with **its own icon and colour** and a line of what is behind it; credits and feedback are small lines at the foot. The three ways to play are one step in, as cards with the same icons and colours. Saved games, the challenges and the set-up each open as their own panel with a way back.
- **Behind the menu the country turns slowly** (`MenuScene`): the 3D map in the last election's colours, swaying a little from side to side, to the right of the menu, faded in when it is ready and dimmed further behind a panel. It is fetched after the menu is on screen and only on a laptop with 3D on and motion welcome; nothing in it can be pressed.
- **Pressing** any button, card or chip: it sinks two pixels, brightens, and clicks (a softer tick for tabs). **A chosen card keeps a solid border and a tick.** Buttons now come in **three ranks**: one filled main action, outlined second choices, plain links.
- **Words fit their boxes:** `FitText` shrinks a label a little to keep it on its line and lets it wrap rather than cut it; the longest labels were written short in both languages; `labels.test.ts` holds each kind of label to a length that fits in English and Bahasa Malaysia.
- **Saved games on the title** list only the games that exist, each with its party's colour; a game in play still shows the empty slots, to save into.

**Stage 3, first half, built: the game screen (8 Oct 2026).**
- **Header:** the player's emblem and party name, then week, days, funds and End week. Between elections: the date, funds and the three buttons that move time. The location line and the four gauges are gone from it (unity is now at the head of the Team tab; stability and trust were already in Orders, credibility in Policy). **Settings are one gear button** opening a panel in which every setting has its name beside it.
- **Map panel:** a state picker and a **seat search** (name or code) beside one **Map options** button, which holds the view switch, Flat or 3D, the 3D hint and the key. On a laptop **the map column stays put** while the side panel scrolls.
- **The poll is one line under the map:** the player's share, how far ahead or behind and of whom, a trend line poll by poll, and seats held. A press opens the whole poll.
- **Side panel:** the three group tabs are large, with icons, the open one filled in the party colour; the tabs within a group have icons too, and **a count** where something is waiting. **Every action is a card** with its own icon, coloured by its kind, its price and expected gain as chips, and one filled Go button; the suggestions stay on top and the families stay folded.
- **A seat picked on the map opens as a card over the side panel**, from whichever tab is open, and closes back to it with the seat still chosen. On a phone it is a sheet from the bottom.
- Fixed in passing: a suggestion aimed at a party read "across state.undefined"; a slow test that sometimes ran past five seconds on a busy machine now has twenty.

**Stage 3, second half, built (8 Oct 2026).**
- **The week just ended** arrives as a short card when a week ends in a campaign (`WeekRecap`): the three headlines that matter most (bad news first, the player's own ahead of others'), the player's share of the latest poll with how it moved, what was spent and the days left unused, and one button to carry on (Enter does it too). Where the days went and where the rivals were is one press further in. It never appears while the adviser is guiding, nor over a decision that is waiting. The old recap at the head of the Actions tab is gone.
- **A figure that has just moved says by how much** for a few seconds (`Delta`): funds in the header, the share on the poll line, and every gauge, with an arrow and a sign as well as a colour.
- **Pointing at an action that lands on a seat shows that seat on the map** (a dashed green outline on the flat map, a lift in 3D) before anything is spent.
- **Between elections the first tab is "This week"** (`TermDesk`): a decision waiting, the figure in most danger, the money and how long it lasts, and the time to the election, each with a button to the tab that deals with it, then the week's news.
- **On a phone the map and the panel are separate screens**, changed from **a bar at the bottom** (Map, then the three groups, with counts); the days, funds and End week sit just above it. When the adviser points at the map the phone goes there by itself.

**Stage 4 built: the verdict, learning, and the rest of the 3D (8 Oct 2026).**
- **The verdict has its moment.** When a count ends before the player's eyes the screen clears, **the chamber fills party by party** (the largest first, the player's on the left against the majority line), and then the verdict is read out large beside the leader's portrait, with the seats and the share and one button to the figures. A press or any key skips ahead. A contest for one seat has no chamber to fill and goes straight to the words. A night looked at again later does not replay it.
- **The result card carries the 3D map** where one is on screen: a picture of the whole contest from the usual angle (`snapshot`, offered through `offerPicture`), laid faintly behind the poster in the party's colour. Without 3D the card is as it was.
- **Poll columns on the 3D map:** opening the poll line under the map makes a column rise over each region, the parties' shares there stacked; closing it lowers them.
- **The tutorial is five steps** (welcome, choose the seat, hold a ceramah, commission a poll, end the week), down from eleven; a game saved part-way through the old one simply finds the tutorial over. After it, the "What now?" line and the words that explain themselves do the teaching.
- **How to play** is one page, reached from the main menu and from the game's own menu: the goal with a small chamber, a week in four pictures, what the words mean (the game's glossary), and the keys.
- **Larger faces** where a person matters (choosing a party, the leaders in Deals, the verdict). **A clear focus ring** wherever the keyboard is.
- The label test now also holds the recap and verdict buttons and the phone bar's names to length in both languages.

**Loose ends tied (9 Oct 2026).** Four things were listed as not done or not seen when the interview's work was reported. Each is now dealt with.
- **The 3D map is one mesh.** It had been one mesh per seat with a material for each face group, which came to **1,602 draw calls a frame** in a general election. Now every seat is a run of vertices in a single mesh: a seat rises by moving its upper vertices, takes its colour from vertex colours, and wears its pattern (the colour-blind palette, the fog) from a few lines in the material's shader, keyed by a number per seat. The outlines are one line mesh, and the flat seats around a by-election are one mesh. **Four draw calls**, and the undersides nobody sees are no longer built (217,000 triangles down to 164,000). The seats' own shapes are kept, never drawn, only for a ray to find which seat is under the pointer. On this Mac (Apple M1, measured in headless Chrome with the real graphics card) a frame's drawing went from about 3.6 ms to about 0.1 ms. No phone was measured.
- **A seat opens over a waiting decision.** The card was held back while the inbox had something in it; a waiting decision is a bar, not a screen, so it no longer is.
- **One look for whatever is chosen.** Anything marked as pressed or checked (cards, chips, segments, toggles) now takes the same ring in the party's colour from one rule, and cards a tick as well, instead of each kind having its own. **One main action a screen:** only End week (or its like) wears the party's colour. The Go on a card is a real button but a quiet one, and the open tab is a lit panel with the colour beneath it rather than a filled one.
- **In a 3D vote the parties keep their colours.** Ayes rise and Noes sink and dim; mixing in green and red had turned every party to mud.
- **Seen and pressed in a real browser** (headless Chrome driving the game's own controls, thirty-two checks, all passing): a held button sinks and brightens, a press clicks and a tab ticks; every chosen thing on the set-up's three steps and in a campaign is ringed, and the chosen contest ticked; each of the title's set-up, a campaign and the term has exactly one party-coloured button; Go on a card spends the days and reports it; Flat and 3D switch from Map options; the seat search opens the seat's card and closing it keeps the seat; the settings change the language and close on Escape; a seat card opens while a decision waits; a bill tabled in the House reaches its vote and the scene shows the chamber with the whips' count; **a government falls for real**, the player walking out of it and carrying a no-confidence motion through the House tab's own buttons, and the benches come down; and a by-election's verdict has its moment, without a chamber. The checks live outside the repository, as they need a browser driver the project does not depend on.

**A new mark (9 Oct 2026).** The designer found the logo dull: it was the number 222 in a plain rounded box (and the browser icon was still an older amber one). Four ideas were drawn and shown side by side: the chamber over the number, the inked finger of polling day, the cross on a ballot paper, and three 2s in three colours. **The chamber was chosen** ("Dewan"): thirty seats in a half circle over 222, a bare majority of them lit and **one gold seat at the line**, on the brand's blue. The 2s are drawn as single strokes, so the mark does not depend on any typeface and looks the same before the game's font has loaded. Its geometry is in `mark.ts` and the picture in `Logo.tsx`; it is on the loading splash (the seats arriving one by one), the browser icon, the header of the title screen, the result card, and large on the main menu beside the game's name, where the seats take their places as the menu opens and the gold one settles last. A test holds the splash and the icon, which are written out by hand in `index.html`, to the same mark.

**A pass for phones (9 Oct 2026).** Asked to improve and optimise the game for phone users, every main screen was looked at at phone size (390 by 844, and 320 wide) in both languages, measured for sideways scrolling, controls too small for a thumb and text too small to read, and then driven with real taps.
- **What was wrong:** nothing scrolled sideways, but the top of the screen was wasted (a brand row, a boxed week, a row for Menu and settings, and a five-line hint came before any of the game: the tab began past halfway down); sub-tabs, links, switches and sliders were smaller than a thumb; some tabs ran to seven screens' length; between elections the buttons that move time were at the top, out of reach; and a waiting decision could be scrolled out of sight.
- **The header is one line that stays put:** the party's emblem and name, the week or the date beneath it, a decision waiting (when there is one), the menu and the settings. The week has no box of its own. The tab now begins about a quarter of the way down.
- **The hint is two lines** until tapped, and keeps quiet while the adviser is talking. The adviser's strip is smaller.
- **Between elections the money and the three time buttons sit in a bar at the bottom**, where the days and End week are in a campaign.
- **On the map screen the map is nearly square**, so a state fills the screen; election night keeps the wide one, since the tally shares the screen.
- **A long tab has its headings in reach** as a row of chips under the header (`SectionJump`, which reads the headings from the tab itself): a tap goes to that part.
- **Everything pressed is thumb-sized:** sub-tabs, back links, switches, icon buttons, sliders, checkboxes, zoom buttons; words that are links in a line of text get a larger reach without moving the line. Fields are sixteen points so that an iPhone does not zoom the page when one is touched; double-tap zoom is off on controls.
- **No dialog is taller than the screen**, and the bars keep clear of the home indicator (the page now asks for the safe area).
- **It can be put on the home screen:** a web-app manifest and icons made from the mark, so that it opens full-screen like an app. It is not an offline app; there is no service worker.
- **Smaller first download, a little:** the count, the talks, the end of a career and the tabs of the years between elections are fetched when first reached. The first load went from 345 kB to 336 kB compressed, which is not much: most of the weight is the simulation and the two languages, which every game needs. Splitting the languages would save English players about another 50 kB and was left for a time when it is worth the upheaval. The 3D library is never fetched on a phone unless 3D is switched on.
- Twenty-three phone checks and the thirty-two desktop ones pass, all outside the repository. No real phone was used: this was headless Chrome at a phone's size with touch, so feel and speed on a real device are still to be seen.

**Messages that close, and a result that is not a mess (9 Oct 2026).** The designer, playing on a phone: the screen was still cluttered, "especially after the polls result", and "notifications stay forever (should make 'x' button to close the notifications)". Looked at on a phone, there were three things wrong.
- **A message about an action stayed for good.** It came up as a toast and was also repeated at the head of four tabs until the next action. Now there is **one message**, with **a × and a tap to close it**, and it goes by itself after six seconds; the copy at the head of the tabs is gone (the News tab keeps the record). On a phone it comes down from under the header, clear of the bars at the bottom. Achievements are announced the same way, with a thumb-sized ×, a count when there are several ("1/2"), and five seconds each; they are **not announced over the verdict**, since the result screen lists them.
- **A poll just bought was hard to find.** Its result is now **a card at the head of the Polls tab** (the shares, or for a state how many seats each party leads in, with the margin of error), with a × to close it. The suggestion of where to poll has a × too. On a phone each poll is its name, then its two prices side by side.
- **After an election the result was buried.** On a phone the tally stuck to the top of the screen *over* the verdict, and the button to carry on was 2,700 points down the page, below the whole account of what decided it. Now the tally only sticks while the count is running; when it is over **the result comes first** (verdict, figures, then **the button to carry on**), then what was earned, then "Seats gained and lost" and "What decided it" **folded** on a phone, then the tally and the map. The page went from about 3,200 points long to about 2,100, with the button 350 from the top.
- Also: words that explain themselves no longer open unprompted on a touch screen (one more thing to close); they wait to be tapped.
- Twelve notification checks, twenty-three phone checks and thirty-two desktop checks pass in a headless browser.

**The box that sat on the screen behind it (9 Oct 2026).** The designer sent a picture from a real phone, on the published game, after winning a by-election: the "Current game" box (Saves, Quit to title) lay over the count behind it, which showed as a red bar with its words spilling out from under the box.
- **The cause was a name.** The little red badge for tab counts was styled as `.count`; the by-election's count panel is `panel count`. So the panel took the badge's style: eighteen points tall, red, rounded, and everything in it spilled over whatever came next. This had been so **since the tab counts were added, on the desktop as well as the phone, all through a by-election's count and after it**. The check that was meant to see the by-election count only asked whether a panel existed, so it passed. The badge is now `.count-badge`, and a test fails if any stylesheet styles a bare `.count` again.
- **The box was moved, as asked.** On a phone, when a count is over, the page is one column in this order: the result (verdict, figures, the button to carry on), the count or the tally, the map, and **last of all** the box for saving and leaving. Nothing in that column can be squeezed shorter than what is in it.
- Looked at again on a phone and on the desktop, during a by-election's count and after it, and after a state and a general election: nothing lies over anything, and no part is shorter than its contents.

**Your own emblem and leader's photo (7 Oct 2026).** The designer asked that players upload their own party emblem and leader's portrait. Decided: **in the party creator only** (an "Upload your own" button beside the ready-made emblems and faces, not changeable mid-game), and **the photo appears everywhere the leader does, the shareable result card included**.
- The picture is read on the player's device, **cropped to a centred square and shrunk** (a face to a JPEG at most 192 points; a flag to a PNG at most 128, so a logo with clear corners keeps them), then kept **inside the saved game** as two optional fields on the party's identity (`photo`, `flag`). Nothing is uploaded anywhere. Old saves load as before; no save version changed.
- A saved picture is accepted **only if it is a small JPEG, PNG or WebP the game made itself** (under 60,000 characters); anything else, including an SVG or a web address, makes the identity invalid. A file that is not a picture is refused with a message and leaves the earlier choice alone.
- An uploaded flag is drawn on the party's colour, like the ready-made emblems. Choosing a ready-made face or emblem takes the upload away.

**An iPhone-style look (7 Oct 2026).** The designer asked for the buttons and the whole design to look like current iOS, and chose **the whole game, with glass panels**. I do not have reliable details of iOS 27, so this follows the newest language I know well, iOS 26's frosted glass.
- It is **one stylesheet, `ios.css`, loaded last**, working almost wholly through the colour and radius tokens, so no layout rule changed. Apple's system colours (black and white, grouped grey and white panels in the light theme), the system font first (SF on Apple devices, Inter elsewhere), a blue accent, **pill buttons** (grey fill for the ordinary, the party's colour for the one that matters), a grey **track with a lifted thumb** for tabs and segmented controls, soft 20-point corners on panels and 28 on dialogs, a small give when a control is pressed.
- **Frosted glass only on what floats**: the top bar, the bottom bar on a phone, dialogs, messages and the seat sheet. Blurring behind every panel costs a phone more than it is worth. It becomes solid where the browser cannot blur, or where the device asks for less transparency or more contrast.
- Two things went wrong on the way and are worth remembering. A full-width pseudo-element wider than the screen (`-100vmax`) made a phone **zoom the whole page out** to fit it; it is now exactly one screen wide. And the older stylesheets had a ghost-button rule that out-ranked the new fill, so the same selector is repeated in `ios.css`. An action's "Go" stays the quiet grey button: **one main button per screen** still holds.
- Checked in a headless browser, dark and light, on a desktop and a phone: 32 desktop, 23 phone and 12 notification checks pass.

**Choosing who becomes a minister (8 Oct 2026).** The designer asked: when the player's party is given cabinet posts, let the player choose who is appointed, each choice with its own risk and benefit. Decided: **a panel in the Government (Dewan) tab**, not a decision that stops time.
- A post the player's party holds starts with a **stand-in** (ability 2): a small drag on the government's steadiness every week (0.08 a post), until the player chooses. Posts of other parties are filled as before. The tab shows how many are waiting.
- Each post offers **three people, each of a different kind** (drawn from four), with what they bring in green and what they cost in red: **the expert** (ability 4-5; credibility +3, but unity −3: not one of the party), **the stalwart** (ability 2-3; unity +3, but the post is run poorly), **the rising star** (ability 3-4; a small lift with every voter group, but in time may go after the leader's job: unity −6, once), **the fixer** (ability 3; RM25k for the party now, but a scandal can force a resignation: credibility −8, public trust −5, and the post is the player's to fill again). The risks are chance rolls each week (0.4% and 0.5%), rolled only for such a minister, so a game with none plays out as before.
- It applies when a government is formed, when a party leaves and its posts fall to the player's party, and after the player dismisses a minister (the old "Replace" now dismisses and leaves the choice to the player). The people on offer are drawn from their own stream of chance, so nothing else in a saved game's course moves.
- Saved games load unchanged (all new fields are optional). Ten tests; checked on a desktop and a phone, in both languages.

**A career in one state (7 Oct 2026).** The designer asked that a state election can be played as a career, and that the country's career can include real state elections (the second half is queued, see below). Decided: **a full career in one state**: five-year terms, governing or opposing the state, assembly elections each term.
- It is a new scenario family `career:<state>` (all thirteen states), built on the state's own seats with the career switched on (`STATE_CAREER_RULES`). A state election gets a choice on the set-up screen: **one election, or a career in the state**. A party founded from nothing is not offered there yet.
- The first government is drawn from the state's last assembly election: the largest party heads it, with the parties it governs with in Putrajaya where they won seats, and then the next largest until the numbers are there. The country's state-poll rounds, and events that only a country's government deals with (foreign affairs, Borneo's claims, tolls, national schemes), do not come up. Words change in a state (`<key>.assembly` strings): Assembly, Chief Minister, executive council, target areas.
- Found along the way: the map for a state career was wrongly the country's (the file was chosen by scenario id). It now follows `stateNeeded`.

**Layers on the map (7 Oct 2026).** The designer asked for tickable map layers to monitor the game from the map. Chosen: all eight offered. **Close seats** (ring), **changed hands** (dot in the old party's colour), **my seats and targets** (square; target on the ten closest others), **my branches** (teal tint by the strength of the party's machinery), **no fresh poll** (diamond), **tents and flags** (the old marks, now optional and on by default), **pacts** (triangles for who stands aside for whom) and **main voters** (hexagon by the largest of six voter families).
- A layer is a decision (`layers.ts`, pure and tested) and a drawing (flat map and 3D map both). The marks stand beside each other where several land on one seat; active layers are chips under the map, each switched off with one tap; the options panel lists them with a short explanation. The choice is kept in the player's settings, and a player who has not chosen sees what the map always showed.
- In 3D the marks stand on the seat's block, a little in front of the tents; the branches tint is blended into the block's colour.

**Queued for a second session (7 Oct 2026):** choosing who becomes a minister, a player-made party standing in any seat at a cost per seat (with a map layer for the seats it stands in), and playing real state elections inside the country's career.

**Candidates in any seat, at a price, for a party the player made (8 Oct 2026).** The designer asked why a party they made could not stand in every parliamentary or assembly seat in a career, and answered: it should be able to, **each seat has its own cost, standing is limited by what the party can afford, and it must be easy to see which seats the party stands in.**
- **The reason it could not:** a party only stands where it had votes last time. A party made "one's own" kept its original's seats (PS 214 of 222, BP 178, PT 171); a founded party stood in every seat for nothing in its first term.
- **Now, in a career (the country's or a state's):** a party the player made (renamed or founded) has its own world with a few votes in every seat (`ownWorld`), so any seat can be fielded. Seats it stood in last time are carried over free; any other is **unfielded until paid for**. A founded party starts with none.
- **The price of a seat:** (RM1,000 + RM0.012 for every voter) × (0.8 + half the city-ness of the seat), scaled to the contest: RM1k to RM6k in a general election's seats, a few hundred in an assembly's. It is a deposit and a candidate's costs, in the game's own money, not the real RM10,000.
- **When:** from the first week of the campaign until nomination day (the same day pacts and defections close, `nominationWeek`). Candidates added this time can be taken back for what they cost; seats carried over cannot. After nomination day it is as it stands. At the end of the election the seats stood in become next time's carried-over seats.
- **An unfielded seat is not on the ballot:** actions there are refused ("not contesting"), the party's voters stay home or go to whoever is left (a new `WITHDRAWN` marker in the stand-down list, apart from a pact, which pactSeats and the pact screens ignore).
- **Seeing it:** a panel at the head of the Campaign tab (how many seats, the price range, "Choose seats", "Add the 10 cheapest", "Add all I can afford"); a list of every seat with search, filters (all, with a candidate, without, affordable) and "Cheapest first", each with its price and a button to the map; a line on a seat's card; and **a map layer, "Seats I contest"**, a flag on every seat with a candidate, on the flat and the 3D map.
- **A founded party must now pay for its seats**, which it did not before: the game's autoplayer (used for balance tests) fields what 30% of its money buys each week until nomination day, and the founded party's growth test was adjusted (the first term's vote share is over 1% where it was over 1.5%). A party that stands nowhere wins nothing and the career ends; the panel says so in red.
- Saved games load unchanged (new fields are optional). Fifteen tests; checked on a desktop and a phone, in Malay and English text.

**State elections fought in person, inside a career (8 Oct 2026).** The designer asked for an option to bring "real" state elections into a career, and chose: **any states of a round the player picks, as long as the party can pay for them.**
- **An option at set-up** ("Fight state elections yourself") for the country's career, for a party taken over and for one founded from nothing alike. A founded party fights each state as a new party does in a state election played alone (`fightWorld`: the state with the party on every ballot, a following of its own, the purse a new party starts with, an ordinary leader unless the player chose a past); it first shipped without this and the tick was hidden for it, which players read as a bug. Off, nothing changes: the three rounds of state polls (weeks 70, 130 and 190) are settled by the model with a level of effort, as before.
- **On, when a round falls due**, its scene lists the round's states with who holds each, **the purse of that state's contest** (what a party of its standing starts a state election with: roughly RM330k to RM480k) and a tick; a state the party does not stand in, or that the party cannot pay for on top of those ticked, cannot be ticked. The three levels of effort below still decide **the states not ticked**, and choosing one starts the ones ticked. (Where every state of a round is fought in person there is no effort to pay for.)
- **A ticked state is a state election of its own**: the same six weeks, map, actions and talks as a state election played alone, led by the same party and the same kind of leader. The career waits, parked in the saved game (`aside`: the career, the state, and the states still to come), and the screen says so in a line under the header. When the talks end, **one button takes the player to the next state, or back to the career.**
- **What it does to the career:** the money not spent comes back; whoever formed the state's government is recorded as holding the state, with the same effects as when the model decides it (the country's mood, the party's unity, a line of news), plus a line of its own. A career whose leader loses the party's confidence in the process ends as it would.
- **Checked on real figures:** a Pakatan Sinar or Perikatan Teguh career has RM1.1m to RM1.8m at the rounds, so several states can be fought; a Barisan Pusaka career has about RM460k, so one. Not fought in person: a state the party does not stand in.
- Saved games load unchanged (the new fields are optional); a save made in the middle of a state election carries the career with it, and is refused if the career in it is not sound. Five tests, and the whole flow checked in a browser (scene, ticking, the state's campaign, the result, the way back), on a desktop in English and on a phone in Malay.

## Seventh round: requests from play (8 Oct 2026)

The designer sent a list after a long session of career play. Built, in order of the list; the questions it raised are answered below. Nothing here overturns an earlier decision except where it says so.

**Each state election asks its own question.** Thirteen states each have one local question (`agenda.ts`) that reaches the desk after the first week: padi and the border in Perlis, floods in Kedah, reclamation in Penang, Orang Asli land in Perak, oil royalty and Islamic criminal law in Kelantan, royalty and fishermen in Terengganu, the rare-earth plant in Pahang, water and traffic in Selangor, customary land in Negeri Sembilan, the island and the old town in Melaka, the causeway in Johor, the 1963 agreement in Sabah and in Sarawak. Three answers each: two that please some voters and cost with others (a loss among a group, money or unity), and silence. An unanswered question comes to silence when the week ends. The effect is put into the hidden drift, so it lasts the campaign. The federal territories have no question.

**Pitching an event to one voter group.** A ceramah, walkabout or town hall can be aimed at one of the groups in the seat (`segments.ts`). The lift is a new seat-by-group layer (`support.seatBloc`, optional in saves). A pitch lands at three times the usual lift on its target, softly on the other groups of its family, and against groups set against it (rural against liberal, young against pensioners); a third of it is simply being seen and goes to the whole seat. The Actions tab shows each group's share of the seat and what the night should add to the party's vote, read off the model by projecting the seat with and without it, with the best aim starred. *Found while testing:* the biggest group is the best aim in about a third of seats only, because a logit lift moves most votes where the party is already near half; the screen shows the figure so the player does not have to guess.

**A party may stand where it never stood** (`entry.ts`). Until nomination day any party the player leads can put a candidate in a seat it had none in, at one and a half times the price of a seat it holds ground in (the player-made party's slate is unchanged). A newcomer starts a full logit below an established party with the same appeal (`ENTRANT_PENALTY`), the party that held the seat takes it as an affront, and the party can then build branches in the state. In the model it is a new stand-down value, `ENTERS`, read by the projection. *Overturns* "a party only stands where it had votes last time" for the player's party; rivals still stand where they stood. The pact that opened a contest (Selangor’s PS and BP) could already be torn up in the Deals tab before nomination day, and the first-day news says so; it is the designer who had not seen it.

**Parties of Sabah and Sarawak in other states' elections.** In a state election the three Borneo parties are offered as outsiders, after the others: no seat, no branches, a purse of a national party's size, candidates to be put up seat by seat. *Overturns* "the Sabah and Sarawak parties can be led only on their own ground and in a general election".

**Acts that pass stay law.** A promise marked as an Act (`law` in `policy.ts`: the term limit, the anti-graft commission, repealing the old laws, the minimum wage and six new ones) is written into `career.laws` once the House passes it, comes out of every party's manifesto, cannot be promised again, and carries into the next parliament. Programmes (cash aid, hospitals, homes) can be promised again. Twelve new promises: party-hopping ban, fixed terms, an information Act, local elections, gig workers' rights, oil royalty, school meals, health cover, a green grid, village roads, loans for small business, a pension. The Policy tab lists what is law.

**The Party tab** (`party.ts`): the membership roll, which moves a fiftieth of the way each week to what the party's branches, unity, credibility and standing support, and sets the dues the party takes in (income is now scaled by the roll against the party's ordinary roll, which is proportional to its vote), and speeds the growth of branches. Five kinds of business (property, a hotel, a newspaper and website, a plantation, a training college), each with its own return and its own way of going wrong; money put into "businesses" before this stays as property and earns what it did. Three things the party does before a campaign: a membership drive, the annual assembly (mends unity), a school for cadres (every branch a little stronger). **The Candidates tab** lists the party's seats: held, fought for, close, stood aside in, never stood in; with the candidate where one was chosen.

**Money buys defections.** A sitting member can be offered one, two or four times the usual sum: each doubling is ten points more chance (ceiling 85%), the leak on failure is a quarter likelier per doubling, and a successful big offer costs the party left behind some unity and costs the buyer a little standing. A rival with a deep purse raids the player's seats more often, up to fifteen points. *Answers the designer's question:* more money means more of what can be bought (defections, seats, branches, publicity, loans repaid), and each has a price in exposure.

**A bug.** The by-election guide stayed on its "poll" step, at the foot of the screen, for the rest of the campaign if the first week ended without a paid poll. The guide now moves to the step after the furthest one already done.

**Is a government of one party possible?** Measured, not argued: in a single eight-week general election the autoplayer (rivals' own logic) reached at most 93 of 112 with Pakatan Sinar, 82 with Perikatan Teguh and 49 with Barisan Pusaka, in 36 runs of each, at all three levels. In a career over four terms Pakatan Sinar on standing orders alone reached 110 once in four. So it is not impossible, but it is the long game and it takes several terms of branches, members and manifesto; one campaign cannot do it. Whether that is what the designer wants is asked in `CAREER-QUESTIONS.md`, with 99 more questions about the career mode.

**What was left open from the seventh round, settled (8 Oct 2026).**
- **Rivals aim their events.** A computer-led party that can read the race (normal and hard, not easy) aims a ceramah, walkabout or town hall at the group that will move most in the seat (`bestAim`: how many of the group there are, times how open it is to the party, with the same spill to neighbours and resentment from opponents the player faces). Measured against the autoplayer: the best seat counts for the three parties moved by two seats at most.
- **Rivals look for new ground** (`rivalEntries`): before nomination day a rival with money in hand may put up to three candidates a week in seats it never stood in, where the sitting party leads narrowly and the rival has branches in the state, at the player's price. A rival that does not campaign in a contest (Barisan Pusaka in Sarawak) does not start.
- **Rivals buy members with money.** A rival's member crossing to another rival now costs the suitor twice the usual sum, and a richer suitor makes it likelier.
- **The state's question comes back** in a state career, in weeks 80 and 170 of every term. A leader who says again what they said before gains a little credibility and is heard half as much; one who changes their answer loses four. Silence is neither. The effect moves opinion, not the campaign's drift.
- **Public trust recovers slowly** (`TRUST_RECOVERY`): while a government in office leaves state resources at none and has not leant on an institution for 26 weeks, trust closes 0.4% of its gap to 80 each week (about ten points in a year from 30). Before, nothing but a clean choice in an event could raise it.

## Eighth round: the first answers to the career questions (8 Oct 2026)

The designer answered four of the hundred questions in `CAREER-QUESTIONS.md`, each as recommended: (1) a government of one party should be reachable only after several parliaments; (3) what lets a party outgrow its limits is a large membership and strong branches; (10) money matters greatly, within legal limits and the risk of exposure; (52) a term limit passed into law should bind the leader for real, who must hand the premiership to a successor.

- **Grassroots** (`grassrootsLift` in `party.ts`). At each election the player's members and branches add to the party's support in every group of voters, up to `GRASSROOTS_MAX` (0.14 logit, about three and a half points, worth eight or more seats from where the autoplayer stood). Both halves are needed: sixty per cent more members than the party's ordinary roll, and branch strength from 40 (nothing) to 80 (all of it). A membership drive, schools, branches and a united party get there over terms, not in a week. The Party tab says what it is worth, and the campaign opens with a line when it counts. Rivals do not have it: the player's progression across terms is the point.
- **The term limit bites.** Once the two-term promise is law and the player's party has headed the government for two parliaments in a row (`pmRun`), the third is held without the player as head of government (`career.limited`): the party governs, a successor of its own is prime minister, and the leader leads from outside the premiership. In that term the player has the powers of a partner in government and none of the prime minister's (no budget, no cabinet, no dissolution, no partner plots); the successor's budgets and bills come as a rival government's do, and the player votes on them. A term out of office resets the count.
- **Money** stays as built: wealth buys defections, seats and branches, at a price in exposure, and the legal limit on spending holds. Nothing further was asked for.

**The second four answers (8 Oct 2026),** all as recommended: (20) the leader can be challenged at a party election and lose; (22/23) the party has wings and factions with heads of their own; (36) boundaries are redrawn every few parliaments; (67) the Palace has a real part.

- **Factions, wings and the party's meeting** (`factions.ts`). Three factions (loyalists, reformers, veterans, in shares of the roll that differ by party) and three wings (youth, women, elders), each with a head and a mood towards the leader that moves 2% a week towards what the leader has earned: unity and office for the loyalists; credibility, trust and the line on reform and graft for the reformers; donors, businesses and the line on reform (against) for the veterans; the party's alignment with first-time voters and gig workers, civil servants and the urban poor, pensioners and the villages for the wings. Backing is three parts factions to one part wings. Three years into every term the party meets: a leader whose backing is 60 or more is returned unopposed (unity +3); below it there is a challenge, certain at 10, from the faction most set against them, and the leader courts the delegates (RM80k, +8), makes a deal with the challenger's faction (+5, credibility −2) or stands on the record. The odds are 12% + 0.85% a point of backing, shown unless fog is on. A leader who loses is out (the `ousted` ending); one who wins gains unity and the challenger's faction cools. The wings also nudge the membership roll.
- **Redrawn boundaries** (`redraw.ts`). In the term before every third parliament (terms 4, 7, …), in week 200, the head of government is asked: leave it to the commission (a few neighbouring seats in a state mixed at random, 12–25%) or ask for a map that suits the party (30% of the voters of its safest seats moved into the narrowest seats held by the other side, in the same state, 6% of seats, at a cost of 6 trust and 3 credibility). Where someone else heads the government it asks about half the time, and the news says so. The redrawn votes become the results the next term is fitted to, so the map, the saves and the model all see them; the news at the start of the term says how many seats would have changed hands.
- **The Palace.** A request to dissolve can be refused (`palaceRefusal`: 0 for a government with a majority and its footing, rising as stability falls below 50, as it governs as a minority, and as trust falls below 40, capped at 60%): the government loses 8 stability and must wait 13 weeks to ask again. In the talks after a hung result the Palace first invites the leader with most behind them (`Formation.invited`); a government they head begins 4 points steadier, one made without the Palace's first choice 3 points less.

**The third four answers (8 Oct 2026),** all as recommended: (63) partners may cross to the opposition, with warning; (5) a minority government may be kept in office from outside, by confidence and supply; (50) a government may repeal an Act, at a political price; (70) the budget is more than five dials.

- **Crossing the floor** (`plots.ts`). When a partner's plot reaches the door and the government is less steady than `CROSS_BELOW` (35), the partner crosses to the largest party outside the government instead of simply leaving: its leader's relations with that party's rise by 20 and with the player's fall by 15, and the news says where it went. A government in that state is also told, when the ultimatum arrives, that the partner knows whom it will go to. A steady government loses a partner to the door only, as before.
- **Confidence and supply** (`supply.ts`). The head of government of a government without a comfortable majority (fewer than 8 seats over the line) can ask up to two parties outside the cabinet, whose leaders are at least a little warm, to keep it in office for 52 weeks, for RM200k (at general-election scale) or for the thing the party wants most (a promise added to what is owed to partners, due in 30 weeks). Their seats count in confidence votes and in the whip on the government's bills; stability +6 on signing. When the year is out the deal lapses (stability −4, relations −3) unless made again, and a deal does not outlast the government that made it. Found in the Government tab.
- **Repealing an Act** (`repeal` in `govern.ts`). The head of government may repeal an Act already law, once a term: trust −3, credibility −3, the voters who liked it punish them and those who disliked it are a little pleased. The promise can be made again.
- **A budget that pays for particular things** (`MEASURES` in `office.ts`). Ten measures, two to a line (cash top-up, petrol price, clinics, hospital beds, scholarships, school repairs, village roads, farm inputs, a civil-service bonus, pensions), at most three in a budget. Each counts towards looseness (0.7 to 1 apiece, so towards the deficit, growth and prices) and, when the budget is tabled, is noticed by the groups it is for (partners notice 40% as much). Plain dials still work; a rival's budget has none.

**The fourth four answers (8 Oct 2026),** all as recommended: (8) staying in power wears the voters out; (9) a landslide has its own risk; (13) owning many businesses brings investigators; (17) money can be set aside as a war chest.

- **Weariness** (`fatigueOf`). A party that has sat in government (as head or partner) for several parliaments in a row loses 0.05 logit among all groups at the start of each parliament after the first (`govRun`), about 1.25 points of the vote a term and cumulative: three terms in a row cost about 2.5 points. It does not apply to opposition, and a term out of office resets it. The Party tab says so.
- **A landslide** (`landslide`). A win of 150 of 222 seats (two in three and more; the same share of an assembly) takes 10 off the party's unity, 10 off every faction's feeling for the leader and 5 off every wing's.
- **Investigators** (`probeChance`). Each week the party owns businesses there is a chance, 0.04% for each RM100k held (at general-election scale) up to 2%, that investigators come: they leave with 10 to 25% of the largest holding, credibility −3, and trust −2 in government. The Party tab shows this week's chance.
- **The war chest** (`setAside`). Money set aside in lots of RM100k is out of reach of the weeks between elections; when the campaign begins it comes out with 10% added by donors; taking it back early costs 15%. It survives the post-election bills, which take half of what is in hand.

**The fifth four answers (8 Oct 2026),** all as recommended: (25) the college grows both candidates and members; (26) branches can be disciplined; (28) the party can change its name and face, at a price; (29) new ground takes years to build on.

- **Graduates.** A party with a training college has its graduates among the hopefuls it chooses from (`graduate` in `candidates.ts`): capable in town and village (lift 0.07/0.09/0.09), a risk of 2% of something in their past, and a little unity. How often one is on the list rises with the size of the college (the same scale that sets its growth of the rolls and its unity).
- **Discipline** (`discipline`). A state's branches can be suspended (branches −20, unity +3) or dissolved (−45, unity +7, rolls −4%, the wings −2, and the state's branches count as young again), once in 26 weeks for any one state.
- **Rebranding** (`rebrand`). Once a parliament the party may take a new name, flag, colours and leader (the same creator as at the start, in the Party tab). It costs RM150k (general-election scale) and 8 credibility, 5% of the rolls; loyal groups (heartland, settlers, farmers, pensioners, civil servants) feel 0.03 less for it and the young, the cities, the suburbs and gig workers 0.04 more. The identity is presentation only; the rules see the same party.
- **Young branches.** A state the party has never had branches in, once it stands there, starts at a foothold of 5 and grows at 35% of the usual speed until it reaches 40 (`fresh`); in a campaign, a day's building on ground below 20 adds 40% of what it adds elsewhere. A state's branches that have just been dissolved are young again.

**The sixth four answers (8 Oct 2026):** (30) every seat has a named candidate; (33) the leader can choose for any seat, with limited time; (34) the price of a newcomer's candidate stays as it is; (37) the leader can stand in a seat of their own and lose it.

- **Every seat has a candidate** (`team.defaults`). At the start of a campaign the party's own choice stands in every seat it contests that the leader is not already choosing for: a name and a kind, some with a past (a quarter as often as the leader's hopefuls, then 0.6 of that again, to keep the autoplayer's balance). They bring nothing, but when their past comes out in a campaign week the seat loses a fifth of a logit, and the leader hears of all of the week's together.
- **Choosing for any seat** (`openSeat`). Until nomination day the leader can open any seat for half a day of their week: three hopefuls come forward, as in the closest eight (or five), and the choice replaces the party's. The Candidates tab has the button, and the choosing is done in the Team tab as before.
- **The leader on the ballot** (`standLeader`). Once, before nomination day, the leader may stand in a seat the party contests: the seat gains 0.08 logit plus 0.03 for every point of charisma above ordinary. If the leader's seat is lost on election night, the leader is out of the House whatever the party did: credibility −10, unity −8, and if the party won the premiership it falls to a successor (the term-limit mechanism, `limited`), the leader leading from outside. In a single contest, which has no term after it, the leader's seat counts for nothing beyond the votes.
- The price and the start of a newcomer in a new seat are unchanged, as asked.

**A bug found while tuning (8 Oct 2026).** The grassroots lift was added to the campaign's opinion in `beginCampaign` and then overwritten by `syncOpinion`, which works the opinion out afresh from mood, profile and policy; so it had no effect on any election. It is now kept as `career.grass` and added by `syncOpinion` itself, for the player's party only. The same applies to the state's question when it is put in a career: it is written to mood as well as to the campaign's opinion. Tuned with a bot that plays well (standing orders at full, a drive, an assembly and a school whenever they are open, a united party) over four terms and six seeds: `GRASSROOTS_MAX` is 0.25 (about six points of vote at most), and the bot's party reaches 104–111 seats in the second election and a majority (112 to 118) in the third or fourth in three of the six; no seed reaches it in the first. That is "two or three parliaments" as the designer asked (question 2).

**The seventh four answers (8 Oct 2026):** (2) a majority of one's own in two or three parliaments (see the tuning note above); (4) a small ally can be taken in, at a price; (6) a career that loses every seat still ends, as now; (7) the opposition has a shadow cabinet.

- **Taking in an ally** (`merge.ts`). In the years between elections the player may take in a party whose leader is at least 50 warm towards them and which holds no more than 35% of the player's seats, up to three in a career. Its seats in the House become the player's (`career.house`), it leaves the government if it was a partner, half of what its voters feel goes to the player's party, the party's stance moves one step on the issue where the two stood furthest apart, the roll grows in proportion to its seats, and it costs 8 unity (more for a party far from it in affinity) and 3 credibility. At the next election it does not stand: its seats are stood aside to the player with a transfer far stronger than any pact's (`MERGED`, 85% follow), and when the result is recorded its votes are added to the player's party's column and zeroed, so the party is gone from the ballot for good.
- **A shadow cabinet** (`shadow.ts`). From the opposition benches the player may name someone to shadow each of the eight posts (RM25k at general-election scale a name; replacing costs the same). Half a cabinet earns 2 credibility and a whole one 3 more, once a parliament each, and each week the party's profile is lifted a little more the fuller the cabinet and the better its people. When the party governs, the person who shadowed a post is first among the three the player may appoint to it; a shadow cabinet is dropped once the party is in office.
- A career that is left without a seat still ends in `wipedOut`, as it did: nothing was changed.

**The eighth four answers (8 Oct 2026):** (11) and (12) buying members leaves a trail; (14) money from abroad; (15) a stricter spending limit.

- **The trail** (`trailWeek`, `career.trail`). Every approach to a sitting member of another party adds to the trail: the size of the offer if it worked, half of it if it did not. Each week the trail fades by 1%, and there is a chance of an anti-graft inquiry of 0.4% a point, at most 6%. An inquiry freezes RM100k (general-election scale) a point of trail, costs 6 credibility, 4 unity, and 4 goodwill with partners if in government, and halves the trail. The Party tab shows the week's chance.
- **Money from abroad** (`takeForeign`, `foreignWeek`). Once a parliament the party can take RM1.5m at once from a foreign donor in return for one of three favours (trade, tax, values), which moves the party's stance a step on the donor's side (wages down, taxes down, values up). Each time taken adds 0.3% a week to the chance of being found out (at most 3%). When it is, the party loses 30% of its funds, 15 credibility, 10 unity, 10 goodwill with partners if in government and 0.04 of mood everywhere, and the count is cleared.
- **Overspending.** The Election Commission's probe chance is `0.3 + 2.5 × (spent/limit − 1)` (30–90%) instead of a flat 60%; the fine is 1.5 times the overspend (from 1×), the hit to the national vote is 5 points (from 4), and credibility −6. A party that was fined and spent at least 1.4 times the limit is petitioned against after the election (`petition`): its narrowest wins, two plus one for every tenth over, at most eight, go to the runner-up.

**The ninth four answers (8 Oct 2026):** (16) small donors for a respected opposition; (27) members on paper; (35) safe seats as rewards; (38) a by-election the party calls on itself.

- **Small donors** (`crowdIncome`, a new `crowd` line in `termIncome`). Out of government only: RM6k a week (general-election scale) × respect (credibility 30 → 0, 70 → 1, up to 1.25) × need (1.5 with an empty purse, down to 0.4 with RM6m or more in the bank).
- **Members on paper** (`padRolls`, `paddedWeek`, `career.padded`). Once a parliament the rolls may be swelled by 15%: dues and the show of strength rise at once, but the padded names do not knock on doors (`genuineRolls` is what `grassrootsLift` counts). They fade with the rolls (2% a week), and each week there is a chance of 0.1 × the padded share of the roll (at most 3%) that it comes out: the padding goes, a tenth of the true rolls desert, credibility −10, unity −5, mood −0.03 everywhere.
- **Safe seats** (`safeseat.ts`, `career.safe`). In the years between elections up to three seats the party holds can be given to a faction's figure. The faction's mood rises by 10 at once and its target by 4 for every seat given, so it stays better disposed; unity +2. Taking one back costs 12 mood with the faction and 2 unity. At the start of a campaign a seat given is fought at 0.06 logit less (a candidate not chosen to win), and one the party has lost is dropped.
- **Forcing a by-election** (`forceByElection`, `career.forced`). Once a parliament a seat the party holds can be made vacant on purpose: RM30k, 3 credibility, 2 unity, and the by-election scene (the same three efforts) comes at once. Won, credibility +5; lost, −3 more.

**The tenth four answers (8 Oct 2026):** (18) the states as a source of money, with the risk of graft; (19) a plain ledger; (24) the deputy is a real person and a rival; (31) a challenger who loses may leave.

- **Patronage** (`patronage.ts`, `career.patronage` 0–2). A party that governs states can draw on them little, freely or without shame: the states' weekly income is multiplied by 1, 2 or 3.5. Each week there is a chance of 0.15% × states governed × level (at most 4%) that the anti-graft agency comes asking: it takes 15% of the party's funds, credibility −8, unity −4, mood −0.02 everywhere, and the level falls back to little. The level is dropped by itself when the party governs no state. It is set in the Orders tab.
- **The ledger** (`ledger` in `career.ts`; the Orders tab). The week's books by source and by kind with the net, the lines being those of `termIncome` and `termSpending` (and the new small donors).
- **The deputy** (`deputyOf`, `factions.deputy`). A named person (from the names not used by the six chiefs), of one of the three factions, with an ambition from 30 to 70 which drifts towards 0.9 × (100 − backing) at 1% a week. At the party's election, if there is a challenge, the chance it is the deputy is `0.15 + (ambition − 40)/100 + (50 − backing)/250` (5–80%); a deputy is harder to beat (−10 points of odds, `DEPUTY_EDGE`). The Party tab says who the deputy is and the chance; the scene tells the player when it is them.
- **The one who lost** (`challengerLeaves`). When the leader wins the party's election, the challenger (the deputy, or the head of the faction) may leave: 30% (+15 for a deputy, −25 if a deal was struck with them, plus (50 − backing)/300; 5–60%). They take 1 seat (2 for a deputy) from the party's seats in the House, to the largest party outside the government or, half the time, to independents (`oth`); unity −4, their faction's mood −8, the government's stability −2 if the party governs. A deputy who leaves is replaced by a new one.
- `lastElection` is now remembered per world when the world has no stored result; it was being projected afresh on every call, and a seat-by-seat loop over it took most of a second.

**The eleventh four answers (8 Oct 2026):** (32) a member’s own vote; (39) a candidate’s background is a bonus, not a quota; (40) media can be aimed at a group; (45) an event for each state.

- **Aimed media** (`aimReach` in `segments.ts`). Television, radio and social media take an optional `segment` in the target. The medium's reach, bloc by bloc, becomes: the target ×2.2, groups of its family as before, the rest × (0.9 + 2·heard) between 0.1 and 1, and a group strongly set against it (`heard` below −0.25) −0.15, so it turns them off a little. The Actions tab has one row of chips for all three media. Rivals still push to everyone.
- **A local event** (`local`, a new action: RM45k, a day, in a state, `LOCAL_REACH`). Each state has its own: the adat of Negeri Sembilan, Kaamatan in Sabah, Gawai in Sarawak, the padi harvest in Kedah, FELDA settlers’ day in Pahang, Penang's street-food festival, Selangor's gig-work fair and so on (sixteen, with Putrajaya and Labuan). It is named for the state in the list, lifts the groups of the place (0.09 × the leader's presence × the reach) and gives the party 1 unity. A state's own election uses the state itself, and a place without an event gets a plain open house. The rivals' AI does not use it.
- **Candidates' backgrounds** (`HOPEFUL_TRAITS`, `diversityBonus`). Each of the 24 names is a woman or a man, young or not, Malay, Chinese, Indian or a Borneo native. In a seat they suit they add to the candidate's lift, only ever as a bonus: a woman 0.015 + 0.1 × the share of the salaried and town groups (up to 0.075), a young one 0.01 + 0.5 × first-time voters and half the gig workers (up to 0.11), a Chinese or Indian candidate 0.07 × the seat's urbanity, a Borneo native 0.1 × the Borneo share (up to 0.08). The Team tab names the traits; there is no quota.
- **A member's own vote** (`tenure.ts`, `career.tenure`). Each election records who won each seat and for how many terms in a row (a career begins with a seat won by 10 points counted as 2 terms and one by 20 as 3). At the start of a campaign the party that holds a seat after two or more terms gets 0.035 logit for every term beyond the first, up to 0.105, for every party, not only the player's. A player who picks a new candidate in a seat held by a long-standing member of their own loses half of it. The Candidates tab says how long a member has held a seat.

**The twelfth four answers (8 Oct 2026):** (54) a promise in a short or a full form; (56) rivals copy popular promises; (58) a referendum on a contested promise; (59) a constitutional court that rarely strikes an Act down.

- **Short promises** (`career.brief`, `setBrief`, `BRIEF`). Before the manifesto is launched each promise in it can be made in its short form (the Policy tab): it counts for half of the manifesto's cost, appeals half as much, does half as much when it passes (`enact`) and costs the treasury half; kept it earns 2 credibility (3 for a full one) and failed it costs 1 (2). Taking a promise out of the manifesto drops it from the short ones.
- **Copying** (`copyPledges`, `career.copied`). When the player launches the manifesto, each larger rival may copy up to two of its promises worth at least 0.2 across the blocs (half the time, 70% if the promise fits the rival's line): they are added to its manifesto. A copied promise is believed half as much from the copier, and loses a fifth of its worth to the player for each copier (never below half). The Policy tab says who copied what. Copies last for the one term.
- **A referendum** (`courts.ts`, `callReferendum`). The head of government may put a contested promise (one that some bloc is set hard against, appeal ≤ −0.04) to the voters instead of the House: RM150k, once a parliament. The chance is 0.5 + 8 × (the blocs' net feeling, weighted by size) + the credibility and trust of the government, between 10% and 90%. Carried: it is enacted without a vote, credibility +4, trust +3, and an Act that results is protected (`career.mandated`) from the court. Lost: it fails (credibility −5, trust −5, stability −3).
- **The constitutional court** (`courtWeek`). Once a year it looks at each Act on the books: 1.2% for a sound one, 12% for a shaky one, which is an Act that passed the House with under 55% of the votes (`career.shaky`), and nothing for one the voters carried. A struck Act leaves the books and can be promised again; the party that made it loses 30% of what it gained, and if it is the player's, trust −3 and credibility −2.

**A bug found on the way (8 Oct 2026).** The next parliament's career is built from a list of what to carry, and several things added since were not on it: the factions and the deputy, the members' tenure, the trail, foreign money, padded rolls, safe seats, the level of patronage, the young branches and the recruitment drive were all lost at every election. They are now carried (see `carry` in `nextTerm`), with a test that runs a whole parliament.

**The thirteenth four answers (8 Oct 2026):** (60) a coalition with a name and a mark; (61) a partner may ask for seats; (64) outside supporters can withdraw and be renewed; (65) a partner can be put out.

- **The alliance** (`alliance.ts`, `career.alliance`). From the Party tab the player founds a named alliance (one of six names and six marks; RM40k at general-election scale) and invites parties whose leaders are at least 30 warm (RM30k each, four in all). Each member is lifted 0.006 logit for every other member, up to 0.02, in the national opinion (`syncOpinion`). Every eight weeks members that have grown cold (relation below 0) quit, with credibility −2, and those that stay grow a point warmer. A partner that walks out of the government leaves the alliance and is 15 colder. The player dissolving it costs 4 credibility, 3 unity and 20 goodwill with each member. It is carried into the next parliament.
- **A price on a pact** (`ASK`). A friendly party's pact offer (a government partner, the head of government, or an alliance member) may come with up to three of the seats where the player is clearly ahead (15 points) and the party has at least 12% of the vote of its own: they are added to what the player would give, and the scene says so (`scene.ask`). Accepting mends relations (+6); declining costs 5 more goodwill, and a government partner that was refused takes 2 off the government's stability.
- **Outside supporters** (`supply.ts`). A deal is renewed in its last ten weeks at the same price (cash again, or the party's chief demand again). A supporter whose leader has cooled below 5, or whose policy was promised and is overdue, may withdraw with a 6% chance a week: stability −4, relation −8, and the government stands.
- **Putting a partner out** (`expel`). The head of government may remove a partner so long as the seats of the government and its outside supporters still make a majority: stability −6, credibility −3, the partner is 40 colder, the others 8 colder, and the partner's posts go to the head of government's party. It also leaves the alliance.

**The fourteenth four answers (8 Oct 2026):** (72) a minister’s scandal is a press conference; (74) more quarrels with other nations; (77) the year’s seasons; (78) the opposition’s select committee.

- **A scandal at the table** (`ministerScandal`). When a fixer in the player’s cabinet is found out, the player no longer pays at once: `career.scandal` names the post and a scene asks what to say. Sacking costs 3 credibility and 2 trust. Standing by them is a gamble on credibility: it comes off (they stay, +1 credibility) or the minister goes with credibility −7, trust −5 and stability −3. Suspending them costs 2, 1 and 2 stability. If something else is already on the player’s desk the old automatic way is used (credibility −8, trust −5). A new `minister` effect (`sack` / `keep`) does the sacking (`dismiss` in `office.ts`).
- **Other nations.** Three more quarrels for a government: a border standoff, a threat of tariffs, and citizens stranded abroad (all of the country’s government only, as the others are). The border standoff can lead to the mediation award.
- **The seasons** (`SEASON_EVENTS`, `yearly`). Every year, for anyone in office or out of it: the price of food (week 20), the haze (31), the monsoon (47); each answer costs money, trust or standing and is tested against the player’s stability or credibility where it is a gamble. The haze is moved off week 30, where the start-of-term events sit.
- **A select committee** (`committee.ts`, `career.committee`). From the opposition benches, once in 26 weeks, for RM30k and 30 of the dossier (which must hold at least 30): the chance it finds something is 0.3 + dossier/200 + credibility/400 (20–85%). Found: the government’s trust −8, its parties' standing −0.02 (head) and −0.01 (partners), and the opposition’s credibility +3. Not found: credibility −4 and the government’s head +0.01.

**The fifteenth four answers (8 Oct 2026):** (82) the federation's quarrels as stories over a parliament; (84) "Sabah for the people of Sabah"; (85) the federal territories have troubles of their own; (87) a state may go to the polls early, at a risk.

- **Claims, in chapters** (`eventList6.ts`). For a government of the country: the Borneo states' claims (`claimsTalks`, then `claimsStalled` ten or fourteen weeks later, then `claimsVerdict` twelve weeks after that); the choices at each step move Borneo's mood, the Borneo parties' goodwill, the treasury and the standing of the government. For the government of a state (`STATE_ONLY`, so never in the country's): a grant the centre will not pay (`fedGrantCut`, `fedTalks`, `fedSettlement`) with a protest, quiet lobbying, a legal claim, a trade of votes or a holding out. Each story can begin once in a parliament.
- **The federal territories**: `cityHousing`, `flashFloods` and `mayorRow` (the capital's rents, its drains and its appointed mayor), country-only.
- **Local pride** (`pride.ts`, `applyPride`). When a campaign opens, in every seat of Sabah, Sarawak and Labuan the parties of Borneo (GBK, GBS, Legasi, Cahaya, Suara) get 0.07 logit and every other party standing there loses 0.04, each × (0.5 + the seat's Borneo share, up to 1.5), on top of what the last election gave them. It applies to every party, the player's included.
- **Going early, at a risk** (`dissolve`, `opportunism`). A government that asks for a dissolution loses up to 0.04 logit of its own vote (1.2 points a year left, 4.8 at the most, a tenth of 25 points per logit) unless its term is nearly out (26 weeks) or its footing is shaky (half below a stability of 50, none below 35). A state's ruler is 10 points likelier to refuse than the Palace.

**The sixteenth four answers (8 Oct 2026):** (75) leaning on the same institution again; (76) the economy has sectors; (79) the courts come for the leader; (86) the states may go to the polls with the country.

- **Strain** (`LEVER_STRAIN`, `career.leverUses`). Each earlier use of the same lever in a parliament costs 2 more trust (up to four earlier uses), makes the agency’s attack 10 points likelier to backfire, the police’s harm to the cities and the young 0.01 greater, and the broadcaster 1 more credibility. The Government tab says how often a lever has been used. Counts last one parliament.
- **Sectors** (`sectors.ts`, `career.sectors`). Oil, electronics, tourism and farming each wander around 50 (a pull of 1.2% a week to the middle, noise of 1.4), with a shock to one of them (14–26 points, up or down) in about 0.7% of weeks. Each week, the head of government’s party gets 0.0008 logit × how far the sector is from the middle among the blocs that live by it (partners half), and growth moves by 0.03 × the weighted deviation. The head of government may help a sector once in 26 weeks for 1 fiscal and +12. The Government tab shows all four.
- **A case in court** (`trial.ts`, the event `courtCase`). Each year from the second, with a fixed roll from the seed and the week, the courts may come for the leader: 0.5% (technocrat) to 7% (fixer) a year from their past, plus 1.2% for each point of the trail, 4% for foreign money and 2% for padded rolls, at most 30%; once in a parliament. The player fights (RM150k; a gamble on 0.3 + credibility/200 − 0.02 per point of trail, 15–85%; won, +4 credibility, lost, the career ends as ousted), settles (RM200k, −8 credibility, −4 unity) or steps down (the career ends as retired).
- **States with the country** (`dissolve(…, together)`, `career.together`). At dissolution a government of the country that governs states can take them to the polls on the same day. When the term closes, those states are decided by the parliamentary seat winners in them (the same rule as the state polls, `leaders`), and the party’s moods feel each as the polls do. The other states keep their rounds.

**The seventeenth set of answers (8 Oct 2026), the campaign:** (43) three more groups to aim at; (46) a debate as a game of choices; (47) cybertroopers; (48) online and offline do not cost alike; (49) the weather.

The designer asked to see the rest through to the end. For the remaining questions, the answer marked ★ in `CAREER-QUESTIONS.md` is taken, as the designer took it in every earlier one. Q44 (a neglected group costs only the seat) is already how it works, Q70 and Q83 are already in, and Q99 (Party and Candidates stay sub-tabs of People) is how it is.

- **More groups** (`OVERLAY_IDS`, `segmentShare`). The undecided (a plain pitch worth 0.7 + 2 × their share of the seat, which is 5–35% and larger where the last result was close), the young of the villages (60% first-time voters, with the villages’ groups) and fishing families (the farmers, the heartland and the Borneo natives, in coastal states only) can be aimed at, in seats that have enough of them (3%). They are mixes of the thirteen, so they spill and resent as the thirteen do. Media can only be aimed at the thirteen.
- **A debate with a question and an answer** (`debateOdds`, `Posture`). The player picks one of the four most salient questions of the day and a way of answering. A question on which the party’s line is nearer the country’s than the rival’s adds up to 0.2 to the chance, doubled for "stick to the substance"; "go for their record" takes 0.05 off but wins 1.3 × and takes 1.6 × from the rival, and loses 1.6 × as much; "be human" wins 0.9 × and loses 0.7 × and adds 0.06 for the better-liked speaker (−0.04 for the other). The odds are shown. Rivals debate as before.
- **Cybertroopers** (`troops`, a media action against a rival, RM80k, half a day). It takes 0.045 off the rival among those who live on their phones and gives 0.02. The chance of being traced is 25% plus 12% for every earlier use, less the leader’s cunning and a social-media hand; traced, the party loses 0.05 everywhere and the leader 8 credibility in a career.
- **On a phone** (`ONLINE`, `saturation`). Each post or troop operation in a week takes a quarter off the next.
- **Weather** (`weather.ts`). In each state each week it is fair, rain (20%, 75% of an outdoor action's effect) or flood (4%, 45%); on the east coast in a monsoon campaign (three in ten) it is 38% and 14%. Rallies, walkabouts, mega-rallies, charity, youth drives, festivals, local events and canvassing are outdoors; the town hall, television, social media and the rest are not. It applies to every party alike. The Actions tab says what the weather is in the state being looked at.

**The eighteenth set of answers (8 Oct 2026), coalitions and the government:** (62) seats agreed a year out; (66) a government of national unity; (68) an ally that could lead is a rival; (69) ties between leaders; (71) the House has a Speaker and backbenchers; (73) the head of the civil service.

- **Ties** (`TIES`, `tieBetween`). Six pairs of leaders (cousins, school friends, an old feud) add a fixed number to how they feel about each other (+6 to +10, −8 to −12). `relation()` returns what the game keeps plus the tie, clamped; the game’s own relation moves on top of it. The Party tab names the tie by each party.
- **Early agreements** (`earlypact.ts`, `career.early`). In the last year of the term, in a general election, the player may agree seats with up to three parties whose leaders are at least 20 warm and whose seats clash with the player’s: the same drafts the campaign makes. +10 goodwill at once. They are signed when the campaign opens (the seats that still clash only), with another +10 and +2 unity for having said it in time. Dropping an agreement is −25 goodwill and −3 credibility.
- **National unity** (`grand.ts`, `career.grand`). A government with a stability of 35 or less, or without a majority, can ask in each party outside it with 8% of the House or more whose leader is not colder than −20: they sit in the cabinet for 78 weeks, once in a term; stability goes up to at least 65 and trust +8. The voters take 0.0006 logit a week off each member and give 0.001 to those outside. At the end the members leave (goodwill −5 each) and stability −8.
- **A rival at the table** (`isRival`, `offerDeputy`). A partner with half the head of government’s seats and no deputy premiership adds 0.25 to its pressure towards the door. Making it deputy (the senior post in its deal) removes that and is +10 goodwill, +3 stability, −2 unity; whoever had the post loses it, and 10 goodwill with the head of government.
- **The House** (`chamber.ts`). Each parliament has a named Speaker who leans −0.5, 0 or +0.5 towards the government. A wavering party’s vote on a bill goes 6 points of probability (× the lean) the government’s way, a tied House goes with the lean, and committee inquiries by the opposition are 8 points (× the lean) harder if the Speaker is for the government. The proposer’s own backbenchers rebel when the party is not at peace: (55 − unity)% of its members, at most 30%, vote against their own bill. Once in a while the Speaker rules (`speakerRuling`).
- **The head of the civil service** (`ksu.ts`, `career.ksu`). A named Chief Secretary with an outlook: reformist (reform and graft bills take 2 weeks less to draft), cautious (costly bills take 2 more) or political (the government is 0.01 steadier each week). Their trust in the government starts at 50; below 25 something said in the room reaches the papers 1.5% of weeks (trust −4, credibility −2). A yearly memo (`ksuMemo`, week 35) lets the head of government follow (+6), overrule (−12) or replace the Chief Secretary.

**The nineteenth set of answers (8 Oct 2026), stories:** (88) a state’s own customs, carefully; (89) more stories in chapters; (90) the country’s great stories, in fiction; (91) open letters and speeches; (92) the papers and the netizens go back to a decision; (93) advisers with a memory.

- **Customs** (`needs.holds`, `governsState`). Six events, each told only to a player who governs the state or is in its career: the adat chiefs’ choice of a successor (Negeri Sembilan), the weekly holiday (Kelantan), customary land of the natives (Sabah), a road through a longhouse (Sarawak), a procession’s route through a multi-faith street (Penang) and a ruler’s remarks (Johor). Each answer respects the custom and costs something to someone, and none takes a side against a faith or a way of life.
- **Three more stories in chapters** (`eventList7.ts`): the port lease (`portBid` → `portProtest` → `portAudit`), the youth fund (`youthFund` → `youthFundProbe` → `youthFundVerdict`) and the river (`riverFactory` → `fishKill` → `riverCourt`). Each chapter after the first has no chance of its own and only comes when the one before sends it, nine to fourteen weeks on.
- **In fiction, from the country’s politics.** A state fund that lost the country’s money abroad (`sovereignFund` → `fundProbe` → `fundTrial`) and a night of dinners at a hotel when a government’s numbers are thin (`hotelMeeting` → `hotelAftermath`). Nobody and nothing is named.
- **Open letters and speeches** (`letters.ts`). Once in 13 weeks the player picks one of the twelve questions and one of three voices (reasonable ×0.7, plain ×1, rousing ×1.3). Each group moves by how much it cares about the question and how near the party’s line is to what it wants (+0.5 to −0.5), ×0.025 logit, ×the voice. The question gets hotter (0.1 and 0.25 for the louder voices), warm adds 1 unity, and a letter on a question where the party’s line is two steps from where it began costs 2 credibility.
- **Echoes** (`echoes.ts`, `career.echoes`). When an event is answered, a story is queued for 4 to 10 weeks on: good, bad or mixed by how the effects add up (credibility ×0.5, trust, stability ×0.3, a bloc’s mood ×30, money a little, an end or a fall −3). The papers name the event, and the netizens (three new kinds) say what they think.
- **The advisers** (`advisers.ts`, `career.advisers`). A treasurer, a strategist and a conscience, each a named person. Every 13 weeks each says what worries them, if a worry is true: debt or an empty purse; a party not at peace or a restless ally; broken promises or a name that has slipped. The same worry again is the Nth quarter they have said it. The third time they ask for a word (`adviserUltimatum`): listen (+2 credibility, the count cleared), brush them off (−3, −2 stability, back to one) or let them go (a new face with no memory, −2 unity, −1 credibility). When a worry goes away they say so (+1 credibility).

**The twentieth set of answers (8 Oct 2026), rivals, difficulty, history and legacy:** (94) rivals have a style a player can read; (96) difficulty changes how cruel the years are; (97) a "what if" for the real election; (98) a legacy counts the laws that are still law.

- **Styles** (`styleOf`, `STYLE_IDS`). From each party’s campaign profile: aggressive (attack > 0.9), populist (ground > 1.15), a machine (machinery > 1.25), online (media > 1.25), cautious (attack < 0.55) and shady (takes money with strings); the one or two that fit best are named with a line of explanation, beside the party’s temper (quick or slow to warm, holds a grudge or forgives), in a "Reading the rivals" list in the Party tab.
- **Realism** (`REALISM`, `realistic`). On the hard level the consequences of events are 1.3 × as bad and 0.95 × as good, and trouble comes 25% more often; on the easy level 0.8 ×, 1.1 × and 15% less often. The normal level is unchanged.
- **What if** (`whatif.ts`, `challenge.whatIf`). On the title screen, for the general election, the real election can be played with one change: the young and gig workers turn out (+0.12 turnout), a sour economy (the leading party −0.03 everywhere), a scandal at the top (the leading party −0.04 and −10 unity) or a better year for the player (+0.03 everywhere). Not in a career.
- **Laws in the legacy** (`legacyOf`). Each Act still on the books when the career ends adds 2 to the score and is shown on the ending; a leader with two Acts of reform standing (`REFORM_LAWS`) is a reformer whether or not they were promised, and five promises kept or Acts standing together can make a statesman. An Act that was repealed or struck down does not count.

Q100 ("what is the one thing you most want career mode to do") was a free answer and is left to the designer; Q44, Q70, Q83, Q95 and Q99 were already so, and Q99’s answer is that Party and Candidates stay sub-tabs of People.

**The last three (8 Oct 2026):** (53) amendments need two thirds; (55) a manifesto for a state or a seat; (81) the powers of a state.

- **Two thirds** (`PledgeDef.amend`, `voteNeed`). The five Acts that change the constitution (`termLimit`, `fixedTerm`, `partyHopBan`, `oilRoyalty`, `localVote`) need two thirds of the House (148 of 222), and the vote, the whip and the chamber show it. A government with a majority and no more must bring the opposition along or leave the law unpassed; the Policy tab marks them.
- **A local manifesto** (`theme`, `THEME_REACH`). In a state’s election and in a by-election (which now has the manifesto action too) the manifesto is about one thing: roads and bridges, water and power, jobs or housing. Each speaks to the groups it concerns, and does 1.4 × as much for them as the all-purpose one does. The by-election's rivals do not play it.
- **The state’s powers** (`statepowers.ts`, `career.powers`). In a career in one state the head of government can release land (+RM150k, a trail of 1, −2 credibility, the traders pleased and the villages not), grant timber concessions (+RM120k, a trail of 0.5, −1 credibility, the cities and the interior not pleased, a little less health), or send development grants (−RM100k, +1 credibility, the villages glad); the first two once in 26 weeks, the third in 13. The trail is the one the anti-graft agency follows.

**Decisions open by themselves (8 Oct 2026).** In a campaign or a term, a decision that arrives in the inbox now opens on screen at once, so that it is not missed (before, it waited behind a bar until the player opened it). The bar is still there for a decision the player has set aside with "Look around first" or has closed: it does not open again until they ask. See `Inbox` in `App.tsx`.
**The party's money and the government's money, kept apart (9 Oct 2026).** The designer asked to separate the party's funds from the state's and the government's, and decided: the government's money is **for development grants in the places the party governs**, it comes as **a weekly allocation**, and **"State resources" becomes a diversion** to the party; and, on the cost of it, **state patronage moves to the government's money too** (the stricter split).
- **A treasury of its own** (`treasury` on the career, shown beside "Funds" in the header and on a phone's bottom bar): each week the head of government's party gets RM36k, a partner RM14k, and every state the party governs adds RM2k, at general-election scale. It holds at most 26 weeks of it. It is **frozen in an election campaign**, and **left behind** by a party that governs neither at the centre nor in a state. A party in opposition at the centre that governs states has their patronage and a treasury of its own.
- **What it buys: development grants** (a standing order, Off to High, RM10k a level), aimed at the target regions already chosen for branches (or everywhere the party stands). Each week of spending wins **goodwill** there (0 to 100, fading 1.5% a week), which lifts the party's standing in that region with every group of voters, up to about +0.06 at the top, in the same hidden drift the rest of opinion lives in.
- **It reaches the party only by being diverted**: the old "State resources" order now moves RM10k a level each week from the treasury to the party, no faster than the treasury fills, with the risks it always had (public trust wears down; the anti-graft events).
- **The party's own income is its own**: members, donors, businesses, and what is diverted. **Cost of the stricter split, seen in play:** a career on default orders now has RM4k to RM10k a week less (Pakatan Sinar's party purse at week 130 is about RM0.5m, not RM1.8m; Perikatan Teguh and Barisan Pusaka run dry in the first term unless they raise money, invest or divert). The treasury, meanwhile, fills faster than grants can spend it, so most of it lapses at the cap: a place to make the grants bigger later if wanted.
- Saved games load unchanged (all new fields are optional; a game saved before starts with an empty treasury). Nine tests; checked on a desktop and a phone.

## Only one filled button per screen, again

- Two things from the merged work broke "one main button per screen": the entry panel's "Choose new seats" (now an ordinary button) and the chosen chip in a row of chips ("Everyone" when aiming media). A **chosen chip is now tinted and ringed** in the party's colour, not filled; the solid fill belongs to the screen's one main button.
- The audit script was brought in line with the game: a new decision now opens by itself, and the desk bar appears only once it is set aside; the no-confidence check souring the government's partners (the opening House gives it a seat or two to spare); the long-tab check taps the chip by its name, since a new "Suggested this week" section moved the others along.

## State elections as a signal in a career

- **What is kept:** each state election held in a career (a round of state polls, a state the player fought in person, or a state that voted with the general election) records the **seats each party took there**, next to the seats each held in that state at the last general election (`stateVotes` on the career, optional, so saved games load unchanged; a new term starts the record afresh). The seats are the model's own count, the parliamentary seats of the state that decide it, labelled just "seats"; where the player fought the state in person they are the state's own assembly seats.
- **Where it shows:** a "State elections so far" block at the head of Intel > Seats (every state that has voted, with a one-line read for the player's party: voters moving your way, away from you, or steady, and the party that gained most), and the same block for one state on that state's card when it is picked on the map. Nothing is shown until a state has voted. Each state's seats are a bar with every party's count and its swing against the last general election.
- It is information only: it changes nothing in the sim.

## An analysis page after the count, a picture for every decision, forty new events

- **The analysis page.** After a general or state election's count, once the verdict has had its moment, a full-screen page of charts opens by itself (a button in the result brings it back; Escape or "Back to the result" closes it). It shows the seats and vote share against the last election, the chamber as a hemicycle, "what it says" (up to seven plain sentences: how far from a majority, what the closest losses were worth, the best and worst state and whether the work went where it paid, the voter groups gained and lost, how true the player's last poll was), the seats before and now as two stacked bars (held, gained, lost) with the majority line, every party's seats and vote share with their change, state by state a bar each side of zero with a dot for each action aimed there, voter groups before and after, close wins and losses, and the player's own work (actions, polls, funds, the decisions that helped and hurt most). It replaces the text "What decided it" block on those results; a by-election keeps it, since one seat has no charts to draw. It reads the result and what the campaign already recorded, so a saved game needs nothing added. (`analysis.ts`, `Analysis.tsx`)
- **Pictures are drawn, not generated.** A first plan was to have an image model draw each decision; it was dropped for drawn SVG scenes: no key, no cost, nothing to download, tiny, light and dark alike, and the same on a phone. A scene is written as a line of text ("storm|water: kampung@22, person@42, rain@50") from about ninety parts (people, buildings, props, weather) and drawn as an editorial ink sketch (see below); every event has one, and so does every other kind of decision (a call from another party, a vote, the party's own election). It shows full width above the heading of the decision, a little cropped on a phone so that the ground stays in view. (`src/ui/art/`)
- **Decisions are not made up while a game runs.** A site on static hosting has no server to hold a key, and a key in the page would be public, so the new scenarios were written ahead of play instead: forty events (the price of breakfast, a leaked chat group, a heritage house in a road's way, a foreign campus, a carbon tax), each with three choices, English and Bahasa Malaysia, a picture, and consequences kept inside the sizes the rest of the game uses (a test checks them). Governing ones come only to a government, the foreign ones not to a state career, and the opposition ones only across the floor. Every person and company in them is invented, and none takes a side against anyone's faith. A game with a key of the player's own, to write scenarios as it goes, was considered and left for later.

## Four places to stand, and troubles that fit them

- **The decisions are sorted by where the player stands:** leading the government (`pm`), a partner in it (`gov`), leading the opposition (`lead`, the largest party outside the government, noted each week of the term), or in opposition without leading it (`opp`). An event says which of the four it is for (`seats`, falling back on its old `role`); the dialog says it too ("On your desk · as lead opposition"). A trouble told in the government's voice (a price cap, a ruling on a licence, a ferry subsidy) no longer comes to the opposition, which has its own telling of such things; what only a head of government can do (a reshuffle, emergency powers) is not put to a partner; what only a leader of the opposition can do (a censure motion, an alliance of the opposition) is not put to the rest.
- **Seventy new events were written for those places** (twelve for the head of government, sixteen for a partner, twenty-two for the leader of the opposition, twenty for the other opposition parties), each with three choices, English and Bahasa Malaysia, a picture, and consequences kept inside the sizes the rest of the game uses. Their options are what that seat can do: a partner is asked to whip a vote it dislikes, to claim credit or share it, to stay or go; the leader of the opposition is handed a leaked budget, a petition, a poll lead; a smaller opposition party is courted for its few votes, offered a ministry, asked to merge, or left out of the planning.
- **Logic about when:** an event can now wait for the state of things it is about: a slump (growth under 3%), prices rising fast (over 3.6%), a restless party (unity under a figure), the last third or first third of a term, a shaky government (a censure motion only against one that is).
- **Against repetition:** the kind of trouble that has just come (cost of living, scandal, the House, the party's own house, and so on, about a dozen kinds) is a quarter as likely for twenty weeks; an event seen in an earlier term is less likely each time it comes again; an event written for one or two of the places is twice as likely as one told to everybody; the monsoon, the haze and the price of food come in about half the years instead of every one, and the opposition's alternative budget in four years of five; an adviser who has been listened to gives the leader some time before asking for another word.
- Saved games load unchanged (`oppLeader`, `topicWeeks` and `seen` are optional).

## The pictures as ink sketches

- **The look asked for:** an editorial political cartoon on warm cream paper: charcoal outlines that wobble and vary in weight, light watercolour-like washes in desaturated, earthy tones with pops of royal blue, campaign red and emerald, cross-hatching and stippling where the tone is dark, a deckled edge, in a wide 16:9 frame, with no writing in the picture. The same scene text and the same parts as before; only how they are drawn changed, so every decision keeps its picture and a saved game is untouched.
- **How, with no image model and no file to fetch:** one SVG per scene, with filters doing the hand: a slow and a fine turbulence displace every line (the wobble), a stroke in CSS outlines each part (three weights in rotation), the washes are semi-transparent over a grain of paper, and three masks built from the picture's own darkness let a hatching, a cross-hatching and a stippling pattern through only where it is dark. Parts that are weather or water are left without outline or shadow. Every standing figure casts a hatched shadow.
- **Malaysian detail:** batik shirts (a quarter of the figures, a printed pattern defined in each picture) with sleeves rolled to the elbow, songkoks, headscarves, glasses of teh tarik on kopitiam tables, plastic monobloc chairs, satirical campaign posters pasted on the wall (a grinning face, nothing written on it), kampung houses on stilts, longhouses, shophouses. The writing that was on a sack, a ballot box and a pump is drawn as marks instead.
- **Limits:** the effect leans on SVG filters and masks, tested in Chrome only; where a browser draws them badly the picture is still the sketch, less the hatching. A phone shows the picture cropped to 150px tall (the ground stays in view).

## Letting Gemini draw the pictures

- **The sketch stays; a drawn picture goes over it.** The game still draws every decision's ink sketch itself. If a picture drawn by an image model is in `public/scenes/` (and listed in `public/scenes/manifest.json`), it fades in over the sketch in the decision's dialog (`ScenePicture`), 16:9, cropped to the middle on a phone; if it is missing or fails to load, the sketch is what the player sees, so a game never has a hole where a picture should be. Nothing is fetched when there is no manifest.
- **How the pictures are made:** `scripts/make-art.mjs` (`npm run art`), run by the person with the key, in their own terminal, with `GEMINI_API_KEY` in the environment (it is sent in a header, never printed or written). It reads `scripts/art/prompts.json` (the look asked for, in one paragraph, and each decision's title and first few sentences, 284 of them; a test keeps the file in step with the game's own words), asks for a 16:9 picture of each, shrinks it with `sips` to a JPEG 960 across, and writes `public/scenes/<id>.jpg` and the manifest. A picture already there is left alone, so it can be stopped and started again; refusals go to `scripts/art/failed.json`; `--only a,b --force` draws a few first; `--dry` shows the words and sends nothing.
- **What to expect and what it costs:** each picture is its own request, so the same character will not look the same twice; the cost is the model's price per picture (about US$0.04 each when this was written, so about US$11 for all of them; check the current price); the finished folder is some 20 MB, which the site then serves; a picture that the model refuses is simply left to the sketch. The prompts forbid text in the picture, real or recognisable people, and real party emblems.
- Tested against a server of our own that answers as the real one does (the key in a header, a refused picture listed and skipped, a second run asking for nothing); not tested against Gemini itself, since no key was given.

## Better drawing, still drawn by the game

- One picture made by an image model for one decision showed what was wanted and what it would cost in hand work; prompting 284 of them by hand was judged a waste of time, so the game's own drawing was made better instead. (The script, the prompts and the slot for a drawn picture are still there; none is used.)
- **People are people now** (`figure.tsx`): a head with brows, eyes, a nose and a mouth that shows one of five tempers (calm, glad, cross, worried, shocked), hair, a songkok worn loose, a headscarf that drapes, a bun, glasses and moustaches; a batik shirt, a plain one, a T-shirt, a baju Melayu with its sampin, a baju kurung, a blazer; arms that bend at the elbow in nine ways (talking with open hands, pointing, waving, hands on hips, hands to the head, arms folded); trousers and shoes; a shaded side for the hatching to find. Who each one is comes from their number, so neighbours differ and the same scene always has the same cast. A leader wears the party's rosette; chiefs its sash; police, workers, students, reporters, riders and a ruler have their own dress.
- **A scene has a temper**, read from what is in it (a storm, an alarm, a falling chart; a trophy, bunting, a handshake), and the faces follow it.
- **A scene has depth** (`backdrop.tsx`): a far line of trees with a kampung roof and palms, or a town's skyline; clouds, birds or stars; tufts of grass, or floorboards running to a point; what is asked smaller stands further back and higher; where a scene has few people, two or three lookers-on stand behind (clear of its buildings, none on water); something close to the eye in a bottom corner (banana leaves outdoors, the back of a plastic chair indoors); a darkening toward the edges.
- **Things belong to the world**, not to a diagram: a chart is on an easel, a question is a thought over a head, alarm is a cartoon burst in the air, a phone is on a tripod in a ring light, coins are stacks, a placard carries a drawing (scales, a sun, a fist, a cross, a heart). Rooms have a ceiling fan, a strip light, shuttered windows, a noticeboard and posters; shophouses a five-foot way and louvres; a kampung house its steps; a court its steps and a shaded side.

## An online leaderboard

- **What it is:** a finished career can be posted, by the player's own choice, to a table the maker owns; the best fifty are read back in a dialog on the main menu (all careers, federal, state), ranked by the career score out of 100, then elections won, then years. Careers that fought no election are not ranked.
- **No server of our own:** the game talks to a Supabase table over plain `fetch` (`src/state/leaderboard.ts`), with the project's address and its public (anon) key, which are set at build time (`VITE_LEADERBOARD_URL`, `VITE_LEADERBOARD_KEY`, in `.env.local` or, for the published game, the repository variables `LEADERBOARD_URL` and `LEADERBOARD_KEY`). Without them the game has no leaderboard: no menu line, no form. `supabase/leaderboard.sql` is run once in the project's SQL editor.
- **What is sent, and when:** only when the player presses the button on the end-of-career page, after being shown the list: the name they type, party, federal or state (and which), difficulty, ending, legacy, score, years, years as PM, elections and wins, promises kept and broken, the game's version, and the career's id (so that it can be posted once). No account, no save file, nothing from the device. The name is cleaned (letters, digits, a few marks, 24 long) and checked against a short list in English and Malay; the last name used and the careers posted are remembered on the device.
- **One board for each difficulty (10 Oct 2026):** Easygoing, Competent and Ruthless each have their own list, so a career played on the easy level is never ranked against one on the hard level. The dialog opens on Competent (or on the level of the career just finished, from the end-of-career page); inside a level, All / Federal / State narrows it. The game asks the table for one level at a time (`difficulty=eq.…`), so nothing in the table changed; an optional index for it is in `supabase/leaderboard.sql`.
- **What the table refuses:** any change or delete (there is no policy for them), a second post of the same career, and any number a real career cannot reach. It cannot stop someone writing the request by hand with a made-up career inside those limits: it is a leaderboard for fun, and rows can be removed in the Supabase dashboard. `leaderboard.test.ts` reads the SQL and checks that its lists of parties, legacies, endings and difficulties are the game's own.
- **When it is down:** the dialog says so and offers to try again; posting says it failed and can be tried again. Nothing in the game waits for it.

## A checking pass: what several hundred random careers and a read of the sums turned up (9 Oct 2026)

How it was checked: a test player that chooses at random played several hundred careers (every party, founded and custom parties, three state careers, three difficulties, up to four terms) with invariants checked every week and every save written and read back; the sums were read file by file; every tab of every phase was opened in both languages and at phone width and the text scanned. The seat counts, assembly sizes and electorates were checked against the published figures. What changed:

- **A campaign no longer leaves its marks on the next parliament.** The next term's picture of the voters used to be fitted to the votes as cast, so everything that helped on polling day (a sitting member's tenure, Borneo's pull to its own parties, a safe seat's complacency, a candidate, the party's profile, grassroots, an alliance, a manifesto) was built into the baseline and then added again at the next election. Over five elections Borneo's local parties went from 55% to 87% there, the average winning margin from 25 to 43 points and the marginal seats from 36 to 9. Now the baseline is drawn from opinion that has settled (the mood, where the parties have moved on the issues, what each state and seat has drifted to) with everyone standing; what lasts a campaign and no longer is kept apart (`held`) and ends with it. Weariness with a long government is a level, charged as it grows and given back when the party leaves office. The same five elections now run 58–64% and 27–31 points, with 18–32 marginals.
- **A party that is taken in brings its seats with it.** Where the party that swallowed it had no candidate, the merged party's seats were given up without a vote and its voters had no one to follow: the merged party's candidate now stands for it there. Votes never go to a partner with no candidate (a partner that has itself stood aside, or is not on the ballot); those voters scatter as if there had been no pact.
- **The government has the seats the House gives it.** A seat overturned on petition, a redrawn map and a merger all left the government's count as it had been; the count now follows. A redrawing no longer changes who sits before an election is held on it. A government is a minority or not as the House now stands, week by week.
- **Promises of support end with the deal.** What was owed to a party that withdrew its support, or was merged, was still charged every year.
- **Money:** nothing is charged for what costs nothing (the smallest step used to be charged); the price shown for an event's choice is the price charged at every difficulty, and the effects shown are the effects applied; the week's income says when a lender has taken it.
- **Time:** a career's length is the weeks sat through, not the parliaments times five years (an early election overstated it by most of a year); a career's campaign is "Campaign week 3", not week 255; a turnout drive fades like every other effect of a campaign.
- **A career in one state** is judged on its share of that state's seats (twenty of fifty-six is as good as seventy-nine of 222), shares portfolios out of a state's ten posts, not the country's twenty-eight, and speaks of the Chief Minister, the Assembly and its members wherever a text was written for the country and has no state wording of its own (`translate`, with the title screen, the guide and the honours left alone).
- **People:** ministers, the three advisers and the head of the civil service no longer share a name and a face; the treasurer does not warn an opposition leader about the country's debt, the conscience does not go on for ever about a promise broken parliaments ago, and each says it differently the second time.
- **Small things:** "1 week", not "1 weeks"; a petition names only the seats it overturned and none nobody else fought; an event cannot shut a branch; a poll cannot be taken where none is offered; the credits name the state elections the data now holds.
- **Set challenges and the fixed seeds:** making the turnout drive fade reshuffled what a fixed seed produces, so two challenges were given new seeds (Perak, The comeback), as the file says is done after any change to the rules.
- **Left as they are, on purpose:** a government that has slipped below a majority through by-elections is not brought down by that alone (it faces a motion when it is shaky, as before); in a state career a few texts still speak of "the country" where the state would do (they read naturally either way).

## Missions (10 Oct 2026)

Built from the hundred-question interview (questions 3–21 and 58–61): a career was found to feel repetitive, and the answer was something to aim at beyond the next election.

- **Two sorts.** *Main* missions are offered when a parliament opens (and at the start of a career), one of each kind that fits, and are judged when the votes are counted and the government made: **take seats** from rivals (seats where the party's candidate trails narrowly), **hold seats** (the party's own, narrowest for the hard ones), **govern together** (so many parties in the government, or one named party), and **a majority** (the party's own seats are a majority if it heads the government; otherwise heading a government that has one). *Side* missions come now and then in a term (never more than two at once) and are judged week by week: raise credibility, raise unity, build the party's funds. The player takes any, all or none; what is not taken is withdrawn at the next parliament (a side offer after 26 weeks).
- **The game sets how hard each is** (a tier of one to three, from how much of the House the party holds, with a little chance in it), and shows no label: the reward and the risk say it. A hard main mission runs to the election after next. Seats asked for grow with the square root of the House's size, so a state assembly is not asked for the country's numbers. A party with a tenth of what a majority takes is not offered the top job.
- **What winning brings and failing costs** are in `rewardOf` and `penaltyOf` (money, credibility, the mood of the country and unity for a main mission; the thing the party lacked for a side one). Failing a mission to hold seats or to win a majority is dear (a big risk: credibility, unity and the mood of the country); the others are a small risk. A mission to hold seats is lost at the first election it is not kept and won only when the last has passed; the others are won as soon as they are done and lost when their elections or weeks run out. Giving one up counts as failing it. Winning or losing is shown as a card (once, one at a time, when no decision is waiting) and as a line in the news.
- **Where it lives:** `Career.missions` (active, offers, a record of the last forty, and the endings not yet shown), carried from parliament to parliament and validated on loading; the engine is `src/sim/campaign/missions.ts`, the tab `MissionsTab.tsx` (in the group that runs the term and the campaign, with a badge for offers waiting), the text `src/i18n/missions.ts`. A change of government between elections (the talks after a fall) is noticed the next week and may win a mission to govern together or to lead; it never loses one.
- **Not yet built, asked for in the interview:** missions' own share cards and cabinet-level side missions. Questions 3–21 are otherwise all in.

### The final mission (10 Oct 2026)

- **Opens** once the leader has won a main mission of each of the four kinds, one of them a hard (third tier) one (the interview's "all missions done", since missions themselves never run out). The tab says how far along that is. It is offered at the next parliament, and again at each until it is won; a news line says it is open.
- **Asks all four at once**, over two elections: take about seven in ten of eight seats within reach; keep all but one of the party's eight narrowest seats; govern with three to five parties; win a majority of the party's own. Each part but the seats to keep is done once, at any election in the window; the seats to keep must be kept at the election that finishes it (so they cannot be kept early and lost late). Losing it costs a credibility of 12, ten unity and a little of the country's mood; winning pays RM1.5m, ten credibility and unity and a better mood. The record shows which parts were done.
- **After it:** a card says it is done and asks whether to carry on playing or start a new career. Carrying on is free play: no more missions of any kind are offered, and the country, its troubles and its rivals go on until the player is bored. An achievement, "The Last Word", goes with it.
- **The share card is the ordinary one** (the interview first asked for a 3D chamber and a five-second video, then for just the usual card): a mission won, any kind, has a Share button on its result card that opens the same card as an election night or a career's end (1200×630, saved as a picture or handed to the device's share sheet), with the figure the mission asked for, what it was and the career's record; the final mission's card shows its four parts done. It is not made without being asked.


## Challenges made by players, and sent as links (10 Oct 2026)

From the interview (questions 86–93): challenges are the player's to take, with rules in combination, the same seed for everyone, and a link to send to friends.

- **A challenge is a code** (`src/sim/campaign/challengeCode.ts`): a contest (the general election, a hung parliament, a state, or a by-election in any seat), a party, a seed, a difficulty, rules and a length, written as plain text such as `1~state:perlis~ps~668742559~h~fl~4`, and sent as a link (`#c=<code>`). The same seed gives the same hidden swing, so everyone who plays a code faces the same election (a test plays one twice and gets the same result). Nothing in a code is trusted until it is read back: a scenario that is not a single election, a party that cannot be led, a seed or length out of range, or another version of the game is refused, and a damaged link opens nothing.
- **The rules in combination:** the level of the rivals (easygoing, competent, ruthless), hidden odds, noisy polls, a **lean purse** (new: 40% less money to begin with and 40% less coming in, for the player only) and a length of three to twelve weeks of campaign.
- **Making one:** the Challenges screen has "Make your own challenge": pick the contest (and the seat for a by-election), the party (only those that can be led in it), the rules, the length and the seed (or draw a new one), then play it or copy the link. **Playing one:** a link opens an invitation on the title screen that says what is asked and the rules, and the address is cleared. The result of a challenge that was made says "send this challenge on" with a copy-link button.
- **Not yet built:** a board for each challenge (so that results can be compared by name, ranked by seats then share of the vote, with the board kept in Supabase like the career leaderboard), a challenge of the week, and the badge and points for completing one.
