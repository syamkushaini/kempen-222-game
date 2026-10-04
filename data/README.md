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

Other states held their assembly elections on other dates and are not in this dataset, so they are not playable yet.

## Changes made to the data

- Real coalitions are mapped to the game's fictional parties.
- Small parties and independents are pooled into one entry per seat. In one seat (P.202) the pooled total would have exceeded the actual winner, so only the strongest minor candidate is kept there.
- Boundaries are projected to flat coordinates and rounded.
- Each seat's voter-bloc mix is an estimate derived from census indicators. It is a game abstraction, not a published statistic.
