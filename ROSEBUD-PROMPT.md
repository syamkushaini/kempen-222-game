# Kempen 222 — prompts for Rosebud AI

Rosebud builds a game best in stages. Paste **Prompt 1** first, play it, then paste the follow-ups one at a time.
Do not paste everything at once: the full game is far larger than one prompt can carry.

---

## Prompt 1 — the core game (paste this first)

Build a 2D browser strategy game called **"Kempen 222"**: a satirical Malaysian election campaign simulator. All parties and politicians are FICTIONAL lookalikes; the satire targets politicians only, never communities, religion or the monarchy. The tone is serious systems with funny writing. It must be easy to learn and hard to master, and it must work on a phone as well as on a laptop (portrait layout on phones, with the map and the side panel as two screens switched from a bar at the bottom).

**Goal:** lead a party through an election campaign and win the most seats, or enough to form the government.

**Map:** a clickable map of Malaysia (Peninsular Malaysia, Sabah and Sarawak) drawn as simple stylised regions, one per state (13 states). Clicking a state zooms in to its constituencies, shown as small tiles coloured by who is leading. Each seat is tagged safe, leaning or marginal. Seats are urban, semi-urban or rural, and actions work very differently in each (a ceramah talk works in the heartland, social media works in cities, and so on).

**Parties (fictional, three national plus regional):**
- "Pakatan Sejahtera" (PS), a reformist coalition, currently the government.
- "Barisan Perpaduan" (BP), an old establishment coalition.
- "Perikatan Tindakan" (PT), a conservative opposition bloc.
- Sabah and Sarawak each have their own local parties, which treat peninsular parties as outsiders.
The player picks a party and a leader backstory (each backstory unlocks different events).

**Core loop (weekly turns):**
- A campaign lasts 8 weeks (a by-election lasts 3). Each week the player has a limited number of days to spend.
- Actions cost different numbers of days and money: ceramah (rally), walkabout, canvassing, get-out-the-vote, social media push, attack ad, fundraising dinner, crowdfunding, town hall, press conference.
- The leader has a location; travelling (especially to Borneo) costs days.
- Money is tight and central. Income comes from members, crowdfunding and donors with strings attached.
- The true level of support in each seat is HIDDEN. The player pays for noisy opinion polls (quick and cheap but rough, or full and costly but sharp). Undecided voters break late.
- Rival parties are AI-controlled, named characters who also campaign, attack, make pacts and sometimes poach (defect) candidates ("katak").

**Voters:** model voter blocs (age, income B40/M40/T20, urban liberals versus heartland conservatives, civil servants, farmers and fishermen, gig workers, first-time Undi18 voters who are volatile and online). Keep race and religion abstracted into these blocs and never named.

**Events:** each week there is a chance of a decision card in an inbox (scandal, gaffe, endorsement, flood, haze, a leaked recording). **A new decision must pop up automatically on screen** and be answered before the week can end. Each choice shows its plain effects (money, public trust, party unity, seat support). Some choices are gambles and are flagged as such. A player can press "Look around first" to set one aside; it then waits as a bar until reopened.

**Election night:** results reveal seat by seat on the map with a live tally. If nobody has a majority, a government-formation phase starts: negotiate pacts with the other leaders (cabinet seats, state deals, unity government) while a ceremonial Palace sets a deadline.

**Score and ending:** show the final seats, popular vote, and a "legacy" score out of 100 with a title for how the career is remembered. Keep a local scoreboard of the player's best runs in localStorage.

**Style:** warm, clean, flat graphics with party colours; a main menu with New game, Load game, How to play, Achievements, and a **"Buy me a coffee" button** that opens a dialog with the text "Kalau korang enjoy hasil kerja saya dan nak support, belanja saya secawan kopi pun dah cukup. ☕️ Terima kasih atas sokongan!" and a placeholder image for a payment QR code. English and Bahasa Malaysia must both be selectable from the settings, and every text must exist in both. Save the game automatically every week to localStorage.

Build the simplest playable version first: ONE by-election in a single seat with three parties, the weekly action system, hidden support with paid polls, three types of event, and an election-night result. Keep the simulation in a separate module from the UI so that it can be extended later.

---

## Follow-up prompts (one at a time, after the first works)

**2 — State and general elections.**
Add a state election (pick any of the 13 states; seat counts range from Perlis with 15 to Sarawak with 82) and a general election of 222 parliamentary seats over 8 weeks. Add state-level opinion that moves seats together, and national-level opinion that moves states.

**3 — Pacts and diplomacy.**
Add pacts between parties before nomination day: allies stand down in each other's seats, with a relationship score between leaders. Breaking a pact costs a lot of goodwill. Add government formation after a hung result: offers of cabinet posts, a Palace deadline, and a possible unity government.

**4 — Career mode.**
Add a career: a five-year term played week by week with skip-ahead, then the next general election, in government or in opposition, until the player retires or is removed. In government the player passes laws (laws carry over to the next parliament and can be repealed at a political price), manages a budget, appoints a cabinet, and keeps the coalition together. A government can fall through a no-confidence vote.

**5 — Party and candidates.**
Add a party screen: unity meter, factions, funds, branches built per state over years, and a training college. Add a candidates screen for key seats: each candidate has hidden skeletons that vetting can reveal. Add defections in both directions.

**6 — Scoreboard.**
Add a high-score table: the best ten careers by legacy score, split by mode and party. Each entry shows the player name, party, seats won, years in office, laws passed and legacy title. (Local first. Do not add a server unless asked.)

**7 — Polish.**
Add achievements, a how-to-play guide with a glossary for political terms, sound effects, and a gentle tutorial in the by-election that walks the player through the first three weeks.

---

## Tips for using Rosebud

- Paste Prompt 1, play it, and fix problems with short follow-ups ("the poll button does nothing", "make the map bigger on phones") before adding new features.
- If Rosebud loses track, restate the rule that matters: *"keep the simulation in its own module and the UI separate"*.
- The real game (with the real map and real past results) is a TypeScript and React project in this repository. Rosebud will only be able to approximate it with stylised data, so keep the parties and people fictional.
