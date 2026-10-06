// Builds the game's static data from the raw public datasets in data/raw.
//
//   node scripts/build-data.mjs
//
// Outputs (both committed, so the game builds without the raw files):
//   src/data/generated/seats.json  - 222 parliamentary seats: electorate, last
//                                    general election result, voter-bloc mix
//   src/data/generated/map.json    - projected SVG paths for seats and states
//   src/data/generated/dun-*.json and map-dun-*.json
//                                  - the same for each state assembly we have
//                                    a result for
//
// What is real and what is modelled:
//   REAL      seat list, state, electorate, turnout, votes (Tindak Malaysia GE15
//             dataset), boundaries and census inputs (DOSM).
//   MODELLED  the voter-bloc mix of each seat. It is estimated by formula from
//             census inputs (density, income, age, demographics, farm businesses)
//             in deriveBlocs() below. Treat it as a game abstraction, not a fact.
//
// Real coalitions are mapped to the game's fictional parties here, so no real
// party name reaches the game data.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveBlocs, BLOC_IDS } from './derive-blocs.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data/raw');
const OUT = join(ROOT, 'src/data/generated');

// ---------- helpers ----------

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

const readCsv = (p) => parseCsv(readFileSync(join(RAW, p), 'utf8'));
const num = (s) => (s === '' || s == null ? 0 : Number(String(s).replace(/,/g, '')));
const normCode = (s) => s.replace(/\s+/g, '');

// ---------- parties ----------

// Order must match PARTY_IDS in src/sim/types.ts.
const PARTY_IDS = ['ps', 'bp', 'pt', 'gbk', 'gbs', 'legasi', 'oth', 'genba', 'cahaya', 'suara'];
// Real coalition column -> fictional party id. A state election fought by other line-ups gives its own
// table (see DUN_SOURCES); where one column holds an alliance of parties that are separate in the game,
// the entry is a function of the candidate's own party.
const COALITION_COLUMNS = {
  PH: 'ps', BN: 'bp', PN: 'pt', GPS: 'gbk', GRS: 'gbs', WARISAN: 'legasi',
};
// Small parties that won a seat or a large share somewhere are kept apart, by the party name the
// dataset gives each candidate. A name only counts in the region it is a regional party of: the same
// label also stood in other regions' state seats, where it is pooled with the rest.
const SMALL_PARTIES = {
  MUDA: { id: 'genba' },
  PSB: { id: 'cahaya', region: 'sarawak' },
  PBM: { id: 'cahaya', region: 'sarawak' },
  KDM: { id: 'suara', region: 'sabah' },
};
// Everything else (the rest of the small parties, independents) is pooled as "oth".

/** The candidate columns of a result row: each has a vote column, spelt "X VOTE" or "X CANDIDATE VOTE" depending on the file. */
function candidateColumns(r) {
  return Object.keys(r).filter((k) => / VOTE$/.test(k)).map((key) => ({ col: key.replace(/( CANDIDATE)? VOTE$/, ''), key }));
}

/** The game's party for a candidate in a coalition's column, or undefined where the column is not a coalition's. */
function coalitionParty(columns, col, party) {
  const to = columns[col];
  return typeof to === 'function' ? to(party) : to;
}

// ---------- states ----------

const STATES = {
  'Perlis': ['perlis', 'peninsular'], 'Kedah': ['kedah', 'peninsular'],
  'Kelantan': ['kelantan', 'peninsular'], 'Terengganu': ['terengganu', 'peninsular'],
  'Pulau Pinang': ['penang', 'peninsular'], 'Perak': ['perak', 'peninsular'],
  'Pahang': ['pahang', 'peninsular'], 'Selangor': ['selangor', 'peninsular'],
  'W.P. Kuala Lumpur': ['kl', 'peninsular'], 'W.P. Putrajaya': ['putrajaya', 'peninsular'],
  'Negeri Sembilan': ['nsembilan', 'peninsular'], 'Melaka': ['melaka', 'peninsular'],
  'Johor': ['johor', 'peninsular'], 'W.P. Labuan': ['labuan', 'sabah'],
  'Sabah': ['sabah', 'sabah'], 'Sarawak': ['sarawak', 'sarawak'],
};

// ---------- seats ----------

/**
 * Builds one seat record from a census row and its election result.
 * `ids` says how this kind of seat is named and grouped.
 */
function buildSeat(c, r, ids, columns = COALITION_COLUMNS) {
  const votes = PARTY_IDS.map(() => 0);
  // Pool the minor candidates, but keep the strongest one separately so we can
  // tell whether a minor candidate actually won the seat.
  let othTotal = 0, othBest = 0;
  for (const { col, key } of candidateColumns(r)) {
    const v = num(r[key]);
    const party = (r[col] ?? '').trim().toUpperCase();
    const coalition = coalitionParty(columns, col, party);
    if (coalition) {
      votes[PARTY_IDS.indexOf(coalition)] += v;
      continue;
    }
    const small = SMALL_PARTIES[party];
    if (small && (!small.region || small.region === ids.region)) {
      votes[PARTY_IDS.indexOf(small.id)] += v;
      continue;
    }
    othTotal += v;
    othBest = Math.max(othBest, v);
  }
  const bestMajor = Math.max(...votes);
  // If no single minor candidate beat the leading coalition, the pooled total
  // must not either; otherwise pooling would invent a winner. In that case keep
  // only the strongest minor candidate and note the dropped votes.
  let dropped = 0;
  if (othBest < bestMajor && othTotal >= bestMajor) {
    dropped = othTotal - othBest;
    othTotal = othBest;
  }
  votes[PARTY_IDS.indexOf('oth')] = othTotal;

  const valid = votes.reduce((a, b) => a + b, 0);
  // The column is spelt both ways across the files.
  const electorate = num(r['TOTAL ELECTORATE'] ?? r['TOTAL ELECTORS']);
  const issued = num(r['TOTAL BALLOTS ISSUED']);
  if (valid + dropped !== num(r['TOTAL VALID VOTES'])) throw new Error(`Vote sum mismatch in ${ids.id}`);

  const winnerIdx = votes.indexOf(Math.max(...votes));
  // "PH - DAP", "GPS-PBB", "PBS", "INDEPENDENT - KEY": the coalition, then the candidate's own party where the file gives it.
  const [realWinner, ownParty = ''] = r[Object.keys(r).find((k) => k.startsWith('WINNING PARTY'))].split('-').map((x) => x.trim().toUpperCase());
  const named = SMALL_PARTIES[realWinner];
  const expected = coalitionParty(columns, realWinner, ownParty) ?? (named && (!named.region || named.region === ids.region) ? named.id : 'oth');
  if (PARTY_IDS[winnerIdx] !== expected) {
    throw new Error(`${ids.id}: pooled winner ${PARTY_IDS[winnerIdx]} != recorded winner ${expected}`);
  }

  const { blocs, urbanity, kind } = deriveBlocs(c, ids.region, ids.stateSlug);
  return {
    id: ids.id,
    name: ids.name,
    state: ids.group,
    region: ids.region,
    kind,
    urbanity: round(urbanity, 3),
    electorate,
    blocs: blocs.map((x) => round(x, 4)),
    last: {
      votes,
      turnout: round(issued / electorate, 5),
      validRate: round(valid / issued, 5),
    },
    _dropped: dropped,
  };
}

const census = readCsv('dosm/census_parlimen.csv');
const results = readCsv('tindak/MALAYSIA_GE15_PARLIAMENT_ELECTIONS_v25122022.csv');
const resultByCode = new Map(results.map((r) => [normCode(r['UNIQUE CODE']), r]));

const seats = census.map((c) => {
  const code = c.code_parlimen;
  const r = resultByCode.get(code);
  if (!r) throw new Error(`No election result for ${code}`);
  const [state, region] = STATES[c.state] ?? [];
  if (!state) throw new Error(`Unknown state ${c.state}`);
  return buildSeat(c, r, { id: code, name: c.parlimen.replace(/^P\.\d+\s+/, ''), group: state, region, stateSlug: state });
});

function round(x, d) { const k = 10 ** d; return Math.round(x * k) / k; }

const droppedSeats = seats.filter((s) => s._dropped > 0);
for (const s of seats) delete s._dropped;

// ---------- map ----------

const parlimenGeo = JSON.parse(readFileSync(join(RAW, 'dosm/electoral_0_parlimen.geojson'), 'utf8'));
const stateGeo = JSON.parse(readFileSync(join(RAW, 'dosm/administrative_1_state.geojson'), 'utf8'));

// Equirectangular projection scaled for Malaysia's latitude. The country sits
// within 1-7.5 degrees of the equator, so distortion is negligible.
const COS = Math.cos((4.2 * Math.PI) / 180);

/** A projection that fits the given longitude/latitude box into a canvas `width` wide and at most `maxHeight` tall. */
function fitProjection([lon0, lat0, lon1, lat1], width, maxHeight) {
  const k = Math.min(width / ((lon1 - lon0) * COS), maxHeight / (lat1 - lat0));
  return {
    project: ([lon, lat]) => [(lon - lon0) * COS * k, (lat1 - lat) * k],
    width: (lon1 - lon0) * COS * k,
    height: (lat1 - lat0) * k,
  };
}

function lonLatBounds(features) {
  const b = [Infinity, Infinity, -Infinity, -Infinity];
  const visit = (c) => {
    if (typeof c[0] === 'number') {
      b[0] = Math.min(b[0], c[0]); b[1] = Math.min(b[1], c[1]);
      b[2] = Math.max(b[2], c[0]); b[3] = Math.max(b[3], c[1]);
    } else c.forEach(visit);
  };
  for (const f of features) visit(f.geometry.coordinates);
  return b;
}

function toPath(geometry, project, precision) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  const bbox = [Infinity, Infinity, -Infinity, -Infinity];
  let d = '';
  for (const poly of polys) {
    for (const ring of poly) {
      let px = null, py = null, part = '';
      let count = 0;
      for (const pt of ring) {
        const [x0, y0] = project(pt);
        const x = round(x0, precision), y = round(y0, precision);
        if (x === px && y === py) continue;
        bbox[0] = Math.min(bbox[0], x); bbox[1] = Math.min(bbox[1], y);
        bbox[2] = Math.max(bbox[2], x); bbox[3] = Math.max(bbox[3], y);
        part += px === null ? `M${x} ${y}` : `l${round(x - px, precision)} ${round(y - py, precision)}`;
        px = x; py = y; count++;
      }
      if (count >= 3) d += part + 'z';
    }
  }
  return { d, bbox: bbox.map((v) => round(v, 2)) };
}

// National map: fixed frame so the whole country fits 1000 units wide.
const national = fitProjection([99.55, 0.8, 119.35, 7.45], 1000, Infinity);
const map = { width: 1000, height: Math.ceil(national.height), seats: {}, states: {} };
for (const f of parlimenGeo.features) {
  map.seats[f.properties.code_parlimen] = toPath(f.geometry, national.project, 2);
}
for (const f of stateGeo.features) {
  const [id] = STATES[f.properties.state] ?? [];
  if (!id) throw new Error(`Unknown state in geodata: ${f.properties.state}`);
  map.states[id] = toPath(f.geometry, national.project, 2);
}
for (const s of seats) if (!map.seats[s.id]) throw new Error(`No boundary for ${s.id}`);

// ---------- state assemblies ----------

// States with a state election result in the raw data, by the file it is in. Each
// becomes its own small world: assembly seats grouped by the parliamentary seat
// they sit in.
//
// In the six states that voted in August 2023, two of the national coalitions
// were allies and stood aside for each other in every seat (`allies`). Those
// seats also get a `basis`: an estimate of the result had all three stood, so
// that the party which stood aside can stand again if the pact ends.
//
// Melaka (November 2021) and Johor (March 2022) were three-way fights between
// the national coalitions. Sarawak (December 2021) and Sabah (September 2020)
// were fought by other line-ups, so each gives its own `columns`:
//   Sarawak  the governing state coalition against the national reformists and
//            a state opposition party; the one candidate of a national
//            conservative party counts for that coalition.
//   Sabah    the parties that later formed the state's governing coalition stood
//            under two banners, which are added together (in the six seats where
//            both stood, the sum never changes the winner). The other alliance
//            put up one candidate a seat, from the state party or from one of
//            the national reformists' parties: two allied parties in the game.
const DUN_SOURCES = [
  { file: 'tindak/MALAYSIA_GE15_DUN_RESULTS_V27122022.csv', states: ['Perlis', 'Perak', 'Pahang'] },
  {
    file: 'tindak/prn6-2023/MALAYSIA_PRN6_2023_ELECTION_RESULTS.csv',
    states: ['Kedah', 'Kelantan', 'Terengganu', 'Pulau Pinang', 'Selangor'],
    allies: ['ps', 'bp'],
  },
  { file: 'tindak/melaka-2021/MELAKA_2021_ELECTION_RESULTS.csv', states: ['Melaka'] },
  // Johor and Negeri Sembilan voted again in 2026, each coalition on its own: the newest result is the one played.
  { file: 'tindak/johor-2026/2026_JOHOR_DUN_RESULTS.csv', states: ['Johor'] },
  { file: 'tindak/nsembilan-2026/2026_NEGERI_SEMBILAN_DUN_RESULTS.csv', states: ['Negeri Sembilan'] },
  { file: 'tindak/sarawak-2021/SARAWAK_2021_ELECTION_RESULTS.csv', states: ['Sarawak'], columns: { GPS: 'gbk', PH: 'ps', PAS: 'pt' } },
  // Sabah voted again in 2025, every coalition for itself: GRS, Warisan, BN, PH and PN have parties in the game, KDM is the
  // small Sabah party, and the rest (UPKO, STAR, the smaller parties and the independents) are pooled, as everywhere else.
  { file: 'tindak/sabah-2025/2025_SABAH_DUN_RESULTS.csv', states: ['Sabah'] },
];
const censusDun = readCsv('dosm/census_dun.csv');
const parliamentById = new Map(seats.map((s) => [s.id, s]));

// How many of a party's voters follow it to the ally it stands aside for, and how many stay at home.
// These must match RATES in src/sim/transfer.ts; a test checks that the two agree.
const TRANSFER = {
  'ps>bp': { to: 0.6, home: 0.15 },
  'bp>ps': { to: 0.4, home: 0.15 },
  'ps>legasi': { to: 0.55, home: 0.15 },
  'legasi>ps': { to: 0.55, home: 0.15 },
};

/**
 * Works back from a result in which one ally stood aside to the result had both
 * stood. The allies' relative strength is taken from the same area at the 2022
 * general election, when they fought each other; their combined size is whatever
 * makes the pact reproduce the votes actually cast. A modelled figure, not a fact.
 */
function withAllStanding(seat, allies, stateRatio) {
  const [a, b] = allies.map((id) => PARTY_IDS.indexOf(id));
  const votes = seat.last.votes;
  if ((votes[a] > 0) === (votes[b] > 0)) throw new Error(`${seat.id}: expected exactly one of ${allies.join(', ')} on the ballot`);
  const stoodIn = votes[a] > 0 ? a : b, aside = votes[a] > 0 ? b : a;
  const { to, home } = TRANSFER[`${PARTY_IDS[aside]}>${PARTY_IDS[stoodIn]}`];
  const parent = parliamentById.get(seat.state).last.votes;
  // In two areas one ally stood aside in 2022 for the youth party, whose vote there stands in for its own.
  // Failing that there is nothing local to go on, and the state as a whole is used.
  const local = (p) => parent[p] || (PARTY_IDS[p] === 'ps' ? parent[PARTY_IDS.indexOf('genba')] : 0);
  const ratio = local(stoodIn) > 0 && local(aside) > 0 ? local(aside) / local(stoodIn) : stateRatio(aside, stoodIn);
  const cast = votes.reduce((x, y) => x + y, 0), seen = votes[stoodIn];
  // Votes of the one that stood, had its ally stood too: found by bisection, as the pact's effect grows with it.
  const lift = (own) => 1 + ((1 - to - home) * ratio * own) / (cast - (1 - home) * ratio * own);
  let lo = 0, hi = seen;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (mid * lift(mid) + to * ratio * mid < seen) lo = mid; else hi = mid;
  }
  const own = (lo + hi) / 2, k = lift(own);
  const full = votes.map((v, p) => Math.round(p === stoodIn ? own : p === aside ? ratio * own : v / k));
  const stood = PARTY_IDS.map((_, p) => (p === aside ? stoodIn : -1));
  const total = full.reduce((x, y) => x + y, 0);
  return { stood, basis: { votes: full, turnout: round(Math.min(0.98, (seat.last.turnout * total) / cast), 5) } };
}

const dunGeo = JSON.parse(readFileSync(join(RAW, 'dosm/electoral_1_dun.geojson'), 'utf8'));
const dunOut = [];

for (const source of DUN_SOURCES) for (const stateName of source.states) {
  // Codes are spelt "P.134_N.1", "P. 140_N. 01" or "P.192_N. 01" depending on the file.
  const dunCode = (s) => normCode(s).replace(/N\.(\d)$/, 'N.0$1');
  const dunResultByCode = new Map(readCsv(source.file).filter((r) => r['UNIQUE CODE']).map((r) => [dunCode(r['UNIQUE CODE']), r]));
  const [slug, region] = STATES[stateName];
  const regions = {};
  // The allies' relative strength across the state at the 2022 general election, in the seats where both stood.
  const both = seats.filter((s) => s.state === slug && source.allies?.every((id) => s.last.votes[PARTY_IDS.indexOf(id)] > 0));
  const stateRatio = (aside, stoodIn) => both.reduce((x, s) => x + s.last.votes[aside], 0) / both.reduce((x, s) => x + s.last.votes[stoodIn], 0);
  const dunSeats = censusDun.filter((c) => c.state === stateName).map((c) => {
    const r = dunResultByCode.get(`${c.code_parlimen}_${c.code_dun}`);
    if (!r) throw new Error(`No state election result for ${stateName} ${c.code_dun}`);
    regions[c.code_parlimen] = c.parlimen.replace(/^P\.\d+\s+/, '');
    const seat = buildSeat(c, r, { id: c.code_dun, name: c.dun.replace(/^N\.\d+\s+/, ''), group: c.code_parlimen, region, stateSlug: slug }, source.columns);
    return source.allies ? { ...seat, ...withAllStanding(seat, source.allies, stateRatio) } : seat;
  });

  const features = dunGeo.features.filter((f) => f.properties.state === stateName);
  const areas = parlimenGeo.features.filter((f) => f.properties.state === stateName);
  const fit = fitProjection(lonLatBounds(features), 1000, 470);
  const dunMap = { width: 1000, height: Math.ceil(fit.height), seats: {}, states: {} };
  // Centre a narrow state in the canvas.
  const dx = (1000 - fit.width) / 2;
  const project = (pt) => { const [x, y] = fit.project(pt); return [x + dx, y]; };
  for (const f of features) dunMap.seats[f.properties.code_dun] = toPath(f.geometry, project, 2);
  for (const f of areas) dunMap.states[f.properties.code_parlimen] = toPath(f.geometry, project, 2);
  for (const s of dunSeats) if (!dunMap.seats[s.id]) throw new Error(`No boundary for ${stateName} ${s.id}`);

  const dropped = dunSeats.filter((s) => s._dropped > 0).map((s) => s.id);
  for (const s of dunSeats) delete s._dropped;
  dunOut.push({ slug, seats: dunSeats, regions, map: dunMap, dropped });
}

// ---------- write ----------

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'seats.json'), JSON.stringify({ partyIds: PARTY_IDS, blocIds: BLOC_IDS, seats }));
writeFileSync(join(OUT, 'map.json'), JSON.stringify(map));
for (const d of dunOut) {
  writeFileSync(join(OUT, `dun-${d.slug}.json`), JSON.stringify({ partyIds: PARTY_IDS, blocIds: BLOC_IDS, state: d.slug, regions: d.regions, seats: d.seats }));
  writeFileSync(join(OUT, `map-dun-${d.slug}.json`), JSON.stringify(d.map));
}

// ---------- report ----------

const tally = Object.fromEntries(PARTY_IDS.map((p) => [p, 0]));
for (const s of seats) tally[PARTY_IDS[s.last.votes.indexOf(Math.max(...s.last.votes))]]++;
const kinds = { urban: 0, semi: 0, rural: 0 };
for (const s of seats) kinds[s.kind]++;
const totalElectorate = seats.reduce((a, s) => a + s.electorate, 0);
const blocNational = BLOC_IDS.map((_, i) =>
  seats.reduce((a, s) => a + s.blocs[i] * s.electorate, 0) / totalElectorate);

console.log(`seats: ${seats.length}, electorate: ${totalElectorate.toLocaleString()}`);
console.log('last election seat tally:', tally);
console.log('seat kinds:', kinds);
console.log('national bloc mix:', Object.fromEntries(BLOC_IDS.map((b, i) => [b, round(blocNational[i] * 100, 1) + '%'])));
if (droppedSeats.length) {
  console.log(`pooled minor votes capped in ${droppedSeats.length} seat(s):`, droppedSeats.map((s) => s.id).join(', '));
}
console.log(`map.json: ${(JSON.stringify(map).length / 1024).toFixed(0)} KB`);
for (const d of dunOut) {
  const t = Object.fromEntries(PARTY_IDS.map((p) => [p, 0]));
  for (const seat of d.seats) t[PARTY_IDS[seat.last.votes.indexOf(Math.max(...seat.last.votes))]]++;
  console.log(`state assembly ${d.slug}: ${d.seats.length} seats in ${Object.keys(d.regions).length} areas,`, JSON.stringify(t),
    `map ${(JSON.stringify(d.map).length / 1024).toFixed(0)} KB`, d.dropped.length ? `(minor votes capped in ${d.dropped.join(', ')})` : '');
}
