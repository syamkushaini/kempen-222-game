# Data sources

Raw files are kept unmodified in `raw/`. `npm run data` turns them into the game data in `src/data/generated/`.

## Department of Statistics Malaysia (DOSM)

From <https://github.com/dosm-malaysia/data-open>, under DOSM's Open Data Licence (`raw/dosm/LICENSE.md`), which allows copying, adapting and redistributing. It must not be used in a way that suggests official status or endorsement.

| File | Used for |
| --- | --- |
| `electoral_0_parlimen.geojson` | Parliamentary seat boundaries |
| `administrative_1_state.geojson` | State boundaries |
| `census_parlimen.csv` | 2020 census indicators per seat, used to estimate voter blocs |
| `electoral_1_dun.geojson`, `census_dun.csv` | State assembly seat boundaries and census indicators, used for the states listed below |
| `state_parlimen_dun.csv` | Not used (the same mapping is in `census_dun.csv`) |

## Tindak Malaysia

From <https://github.com/TindakMalaysia/GE15-Dataset-ARCHIVED->, licensed CC BY 4.0 (`raw/tindak/Licence`).

| File | Used for |
| --- | --- |
| `MALAYSIA_GE15_PARLIAMENT_ELECTIONS_v25122022.csv` | Electorate, turnout and votes per seat at the 2022 general election |
| `MALAYSIA_GE15_DUN_RESULTS_V27122022.csv` | State assembly results for Perak, Pahang and Perlis, which voted on the same day in 2022 |
| The two metadata files | Reference only |

From <https://github.com/TindakMalaysia/HISTORICAL-ELECTION-RESULTS> (folder `2023-PRN6-STATE-ELECTIONS`), licensed CC BY 4.0 with compulsory attribution to Tindak Malaysia and to the sources its metadata lists: the Election Commission of Malaysia (SPR), Tindak Malaysia (2023) and the Attorney General's Chambers (`raw/tindak/prn6-2023/Licence`).

| File | Used for |
| --- | --- |
| `prn6-2023/MALAYSIA_PRN6_2023_ELECTION_RESULTS.csv` | State assembly results for Kedah, Kelantan, Terengganu, Penang, Selangor and Negeri Sembilan, which voted on 12 August 2023 |
| `prn6-2023/MALAYSIA_PRN6_2023_ELECTION_RESULTS_METADATA.csv`, `Readme` | Reference only: field descriptions, sources and the publisher's notices of correction |

From the same repository, the four states that voted on other dates. Their folders carry no licence file of their own, so the repository's general licence applies (`raw/tindak/General_Licence`): CC BY 4.0, with compulsory attribution to Tindak Malaysia and to every source each dataset's metadata lists.

| File | Used for | Sources listed in its metadata |
| --- | --- | --- |
| `melaka-2021/MELAKA_2021_ELECTION_RESULTS.csv` | Melaka, 20 November 2021 | Election Commission of Malaysia (SPR), Tindak Malaysia (2021), Attorney General Chambers, Perikatan Nasional Facebook Page, UMNO Online, Sinar Harian, Berita Harian, Malaysiakini, Bernama, individual political party Facebook pages |
| `johor-2022/JOHOR_2022_ELECTION_RESULTS.csv` | Johor, 12 March 2022 | Election Commission of Malaysia (SPR), Tindak Malaysia (2021), Attorney General Chambers, Sinar Harian, Berita Harian, New Straits Times, The Star, Harian Metro, Malaysiakini, Bernama, RTM, Utusan TV, Astro Awani, individual political party Facebook pages, Perikatan Nasional Facebook Page, Perwakilan Bahagian ke Perhimpunan Agung UMNO 2008, Akhbar Rakyat, and the further links under "Additional Sources" in the metadata file |
| `sarawak-2021/SARAWAK_2021_ELECTION_RESULTS.csv` | Sarawak, 18 December 2021 | Election Commission of Malaysia (SPR), Tindak Malaysia (2021), Attorney General Chambers, Bernama, Berita Harian |
| `sabah-2020/SABAH_2020_ELECTION_RESULTS.csv` | Sabah, 26 September 2020 | Election Commission of Malaysia (SPR), Tindak Malaysia (2022), Attorney General Chambers, Sinar Harian, Berita Harian, Sinar Project, individual political party Facebook pages |
| Each folder's metadata file and `Readme` | Reference only: field descriptions, sources and the publisher's notices of correction | |

Only the electorate, ballots and votes are used from these files; candidates' names, ages and sex are not. Sabah also voted in 2025, and Johor and Negeri Sembilan in 2026; the game uses the election nearest the 2022 general election for each state, so that every map describes the same few years.

## Changes made to the data

- Real coalitions are mapped to the game's fictional parties.
- Four small parties that won a seat or a large share somewhere are kept apart, by the party name the dataset gives each candidate: MUDA becomes the game's youth party; PSB and PBM, in Sarawak only, become its Sarawak party; KDM, in Sabah only, becomes its Sabah interior party. (The same labels also stood in other regions' state seats, where they are pooled.) The rest of the small parties and the independents stay pooled into one entry per seat. In one seat (P.202) the pooled total would have exceeded the actual winner, so only the strongest minor candidate is kept there.
- Each of the four states above is mapped in its own way (`DUN_SOURCES` in `scripts/build-data.mjs`). Melaka and Johor were three-way fights between the national coalitions and need nothing special; in six Johor seats one coalition stood aside for the youth party, which is kept as it was, as it is for one parliamentary seat. In Sarawak the state's governing coalition and the state opposition party are the game's two Sarawak parties, and the single candidate of a national conservative party counts for that coalition. In Sabah the parties that formed the state's governing coalition by 2022 stood under two banners in 2020, and their votes are added together as the game's one party (in the six seats where both stood, the sum does not change the winner); the other alliance put up one candidate a seat, either from the state party or from one of the national reformist coalition's parties, which are two allied parties in the game. In two Sabah seats (N.02, N.08) the pooled minor candidates would have outpolled the winner, so only the strongest is kept.
- Sabah's two allies are treated as the 2023 allies are (next point), using the same areas' 2022 general election result to split them. With the pact in place the model gives the declared winner in 72 of the 73 seats, with vote shares within 0.15 points on average. The other three states are fitted exactly.
- In the six states that voted in 2023, two of the national coalitions were allies and one of them stood in each seat. The game keeps that result as it was declared, and also needs to know what each would poll if all three stood, in case the pact ends. That figure is an estimate: the allies' relative strength is taken from the same area at the 2022 general election (in two areas, where one of them had stood aside for the youth party, from that party's vote; failing that, from the state as a whole), and their combined size is whatever makes the pact reproduce the votes actually cast. With the pact in place the model gives the declared winner in 240 of the 245 seats, with vote shares within 0.1 to 0.6 points on average.
- Boundaries are projected to flat coordinates and rounded.
- Each seat's voter-bloc mix is an estimate derived from census indicators. It is a game abstraction, not a published statistic.
