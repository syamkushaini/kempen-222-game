# Kempen 222

A Malaysian political strategy game for the browser. All parties and politicians are fictional; the map, voter numbers and past results are real public data.

The full design is in [DESIGN.md](DESIGN.md). It has a career that runs from one parliament to the next, in government or out of it, until you retire or are removed, plus four single contests. You can lead a party as it is or make it your own, with a leader, a team, candidates, endorsers and a press to deal with.

| Contest | Size | Length |
| --- | --- | --- |
| By-election | One seat, drawn from the close three-way races (Hulu Selangor is one), with a guided tutorial | 3 weeks |
| State election | Any of the 13 states, from Perlis (15 seats) to Sarawak (82). In Sabah and Sarawak the state's own parties can be led | 6 weeks |
| General election | All 222 parliamentary seats | 8 weeks |
| Hung parliament | The last real result: nobody has a majority, and you negotiate | 5 days of talks |
| Career | A five-year term, then the general election and the talks, then the next term | 252 weeks a term, with skip-ahead |

## Run it

```bash
npm install
npm run dev
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm test` | Runs the simulation, campaign and save tests |
| `npm run build` | Type-checks and builds the static site into `dist/` |
| `npm run data` | Rebuilds `src/data/generated/` from the raw datasets in `data/raw/` |

Add `?dev` to the address to see the hidden true state of the race (an extra map view and a panel in each seat).

## How to play

You lead one of three national parties through the last weeks before polling day. The rules are the same in every contest; money is scaled to its size, and a state or single seat has no travel time.

- **Time.** Each week has seven days. Every action costs days, and the leader's travel is added: free within a zone, half a day between peninsular zones, a full day across the South China Sea.
- **Money.** Almost everything costs money. Members' donations arrive weekly; dinners, online appeals and one tycoon cheque raise more, each with a catch.
- **Actions.** Ceramah and walkabouts work in one seat. Door-to-door drives, get-out-the-vote operations, billboards and mega rallies work across a state. Television, social media and attacks work nationally.
- **Seat types.** Ceramah are strong in rural seats and weak in cities; walkabouts suit towns; door-to-door work reaches rural blocs best; social media reaches the young.
- **Fading.** Campaign effects fade each week, and repeating the same thing in the same place gives less each time.
- **Polls.** True support is hidden. A free public national poll comes out weekly; state and seat polls cost money and carry a margin of error. The "Your intelligence" map shows what you have polled.
- **Chiefs.** In the Chiefs tab you can put a state chief in charge of any state (a division chief per area in a state election). They run the ground campaign there without using your days: ceramah and walkabouts in the closest seats, door-to-door drives, billboards, new branches and get-out-the-vote. They spend party money, their events draw half the crowd yours would, and they act when you end the week. You choose how free a hand each one has (one, two or up to four operations a week) and how much money they must leave untouched.
- **Small parties.** Three small parties stand in a few seats, win votes and sometimes a seat, campaign on a shoestring where they stand, and sit in the talks as parties of their own with leaders and demands. Five other parties campaign under the same rules. The difficulty setting changes how well they read the race, not their resources.
- **Election night.** Results come in seat by seat, followed by a summary of what you gained and lost.
- **Deals.** In the Deals tab you sit down with the other leaders. Tea warms a relationship. A pact settles, seat by seat, who stands aside for whom; most of a party's voters follow to its partner, some stay home and some go elsewhere. A private understanding lines up support for after the vote. You can attack a common rival together, and court a rival's sitting member to cross over. Pacts and defections close on nomination day, three weeks before polling.
- **Party unity.** Standing candidates down, pacts with old enemies, scandals and defections strain your party. A divided party's machinery works less well and its members are easier to poach.
- **Forming a government.** If nobody wins a majority, the Palace gives the leaders a few days to show one. You have three meetings a day to sound parties out and make offers: cabinet posts, a senior post, policy concessions and money under the table. Rival leaders bid against you and raise their offers each day; parties hold out early and settle as the deadline nears. You can also give up and take a rival's offer. The result is rated for how long it is likely to last and how much public trust the deals cost.

## Career mode

A career starts at the opening of a parliament, with the government the last election produced. You choose to head it, to be a partner in it, or to lead the opposition.

- **Standing orders.** You set what the party does every week: what the leader spends their time on, how much goes on branches, publicity and research, which three states the effort is aimed at, and how hard you lean on donors and (in government) state resources. The orders run until you change them.
- **Skip-ahead.** Time moves a week, four weeks, or to the next decision. It stops whenever something lands on your desk.
- **Money.** Members' donations are clean but modest. Tycoon money and state resources pay more and bring favours asked, leaks and probes. Party businesses pay a steady return on money invested.
- **Policy.** You hold a position on twelve issues. Every position pleases some blocs and annoys others, and you can see where rivals stand. Changing your mind costs credibility, and credibility decides how far voters believe you.
- **Manifesto.** Up to six costed promises for the next election. Promises that cost more than the country has, or that contradict your own positions, convince fewer voters.
- **Events.** A hundred and two of them: floods, leaks, strikes, budgets, restless deputies, hotel-room plots, durian with the enemy. Each shows what a choice will do and what is left to chance. Some set off later events, and two belong to each leader's past.
- **By-elections.** When a seat falls vacant you choose how hard to fight it; the voters of that seat decide, and the winner sits in the House from then on.
- **State polls.** The states vote in three rounds through the term (weeks 70, 130 and 190). You choose the effort; each state goes to whoever wins most of its parliamentary seats. A state you govern pays the party a little every week.
- **Governments can fall.** A shaky coalition can lose a partner mid-term; if it loses its majority, the talks open again with the seats as they stand.
- **Dissolution.** The election comes after 252 weeks, or earlier if the head of government asks for it once three years have passed.
- **The next term.** After the election and the talks, the map is refitted to the result just declared and the next parliament begins. What you built carries over.

### In the House

The House tab shows the business of government. What you can do there depends on where you sit.

- **The economy.** Growth, inflation, unemployment and debt move every week. Voters hold the government answerable for how the economy feels.
- **The budget** (head of government). Five spending lines and taxes, each cut, held or boosted, tabled once a year. Each line is noticed by the voters it helps. A loose budget buys support now and prices and debt later; heavy debt drags on growth and brings a downgrade.
- **The cabinet.** Eight ministers, each with an ability rating. A capable Finance Minister trims the deficit; a capable minister gets a bill to its vote sooner. The head of government can replace any of them, at a cost.
- **Promises.** Every manifesto promise needs a bill. Two can be in preparation at once. Before the vote you see the whip count, and can put it to the House, sweeten it, make it a matter of confidence, or withdraw it. Promises never brought to a vote cost credibility and voters at the next election.
- **Owed to partners.** What you promised in the talks falls due, one item after another. Some are a signature with a price; some need a bill. Leaving them to slide sours the partnership and shakes the government.
- **Institutions.** A head of government can lean on the anti-graft agency, the police or the state broadcaster once a year each. It works, and it costs public trust.
- **Confidence.** An opposition leader can move no confidence once a year. A partner can walk out. A head of government whose coalition is shaky can face a motion, and can buy loyalty before it.
- **Rival governments** table their own budgets and bills, and you vote for, against or abstain. The voters the bill was promised to remember.
- **Decisions can wait.** Any event or vote can be set aside while you look around; time stands still until you answer.

### How it ends

A career ends when you retire, when your own party removes you (unity collapses), or when the party loses every seat. You are given one of ten legacies, from Statesman to Footnote, a score out of 100, and your record: years in office, promises kept and broken, elections won, governments lost and brought down.

## The leader, the party and the people

- **Your leader.** On the title screen you choose where your leader came from: organiser, technocrat, firebrand, tycoon, fixer or activist, or the party's own leader. A past sets four abilities (charisma, organisation, cunning, integrity) and brings something on the first day. Every past is a trade: the numbers always add up the same.
- **Your own party.** "Make the party your own" gives the party you take over a new name, initials, colour, emblem and leader. It keeps the old party's seats, voters and branches. In a career you can also give it a platform of its own.
- **Team tab.** Four jobs (campaign manager, strategist, media chief, treasurer), three people on offer for each. Better people cost more and are likelier to have something in their past; looking into someone costs half a day. Rival parties run without named staff.
- **Candidates.** In the closest seats you choose who stands, from three hopefuls: a division chief, a professional, a celebrity or a loyalist. Papers must be filed three weeks before polling and cannot be withdrawn. A candidate with a past may be found out.
- **Endorsements.** Ten public figures and organisations. Asking costs a day and sometimes money; those nobody wins may come out for whoever they lean towards.
- **The press.** Six outlets, each with its readers and its habits. An interview can win one round or hand it a headline. The News tab also shows the week's front pages and what netizens are saying.
- **Cybertroopers.** You can pay for accounts to push your line online. It works until the money is traced.
- **Spending limit.** The law caps what a campaign may spend. Rivals keep within it. You may go past it, and each week the Election Commission may act.

## Extras

- **Portraits.** Every leader, minister and the campaign manager has a face, drawn as flat vector art from a few features. They are invented, like the people.
- **Sound and music.** Short sound effects for clicks, phone calls, votes and results, and a quiet tune that writes itself as it plays. Both are made in the browser with no audio files. The Sound and Music switches are at the top of the screen; music is off until you turn it on.
- **Achievements.** Thirty of them, from winning a by-election to ten years at the top. Nothing in the game is locked behind them.
- **Legacy gallery.** Every finished career hangs in the gallery, with its legacy, score and record. Achievements and the gallery are kept on the device, apart from the saves; open them from the title screen.
- **Result card.** After any election night, and at the end of a career, "Share result" draws an image: the verdict, the figures and the chamber as it now sits (or the leader's portrait). Save it, or share it where the browser allows.

## How the voter model works

Each seat's electorate is split into blocs (heartland conservatives, urban professionals, first-time voters and so on). For each bloc, the model works out who they prefer and how many of them vote; the seat result is the sum.

- **Preference** is a softmax over the parties standing in the seat of: the bloc's default lean, a per-seat correction, and campaign effects (national, state and seat level).
- **Turnout** depends on the bloc, the seat and how motivated each party's supporters are.
- **Undecided voters** in each bloc split by the same preferences plus a late swing.
- **Early and postal voters** are not affected by polling-day shocks.

The per-seat corrections are fitted at start-up so that, with no campaign effects, the model reproduces the last general election's turnout and votes in every seat.

## What is real and what is modelled

| | Source |
| --- | --- |
| Seat list, electorate, turnout, votes | Real: Tindak Malaysia GE15 dataset (parliament, and the Perak, Pahang and Perlis assemblies) and its state election results for 2023 (Kedah, Kelantan, Terengganu, Penang, Selangor), Johor and Negeri Sembilan 2026, Sabah 2025, and Melaka and Sarawak 2021 |
| Boundaries, census inputs | Real: Department of Statistics Malaysia |
| Voter-bloc mix per seat | **Estimated** by formula from census inputs (`scripts/derive-blocs.mjs`) |
| Bloc leanings, turnout, undecided shares | **Design numbers**, tuned by hand (`src/sim/blocs.ts`) |
| Parties | Fictional; real coalitions are mapped to them in `scripts/build-data.mjs` |

Three small parties (a youth party, a Sarawak party and a Sabah interior party) are kept apart, each built from the real results of the small party it stands for; the rest of the small parties and the independents are pooled as one "independents and small parties" entry.

## Layout

```
data/raw/            raw public datasets (see data/README.md)
scripts/             builds game data from the raw datasets
src/sim/             the voter model: pure TypeScript, no browser code
src/sim/campaign/    campaign rules: actions, travel, polls, rival AI, the weekly turn,
                     dealings between leaders, and the talks to form a government
                     plus the career: the term between elections, policy and events
                     and governing: the economy, budget, cabinet, bills, confidence, endings
src/state/           game state, save format, save slots, the player's profile, the app store
src/data/            fictional parties and generated seat and map data
src/i18n/            interface and event text in English and Bahasa Malaysia
src/ui/              React components and styles, portraits, sound and the result card
prototype/           the original single-file prototype
```
