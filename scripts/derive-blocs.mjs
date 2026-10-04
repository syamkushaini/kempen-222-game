// Estimates each seat's voter-bloc mix from census inputs.
//
// This is a MODEL. The census does not record "heartland conservatives" or
// "gig workers"; the shares below are produced by hand-tuned formulas so that
// seats differ from each other in plausible ways. The blocs partition the
// electorate (each voter belongs to exactly one, by primary political identity).

// Order must match BLOC_IDS in src/sim/types.ts.
export const BLOC_IDS = [
  'undi18',        // first-time and very young voters
  'heartland',     // rural and small-town traditionalists (peninsular)
  'felda',         // land-scheme and plantation settlers
  'agri',          // farmers and fishermen
  'civil',         // civil servants and uniformed services
  'urban_b40',     // urban working class
  'gig',           // gig and informal workers
  'm40',           // suburban middle class
  'urban_lib',     // urban professionals
  'smallbiz',      // small business owners and traders
  'seniors',       // pensioners
  'borneo_native', // interior Sabah and Sarawak
  'borneo_urban',  // Sabah and Sarawak townsfolk
];

// Rough weight of land-scheme settlements by state. General knowledge, not data.
const FELDA_STATE = {
  pahang: 1, johor: 0.8, nsembilan: 0.8, terengganu: 0.4, kedah: 0.3,
  perak: 0.3, kelantan: 0.3, melaka: 0.3, selangor: 0.2, sabah: 0.3,
};

const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
const n = (s) => Number(s) || 0;

export function deriveBlocs(c, region, state) {
  const pop = n(c.population_total);
  const density = pop / Math.max(1, n(c.area_km2));
  // 50 people/km2 -> 0 (deep rural), 2000 -> 1 (city).
  const urb = clamp((Math.log10(density) - 1.7) / (3.3 - 1.7));
  const kind = urb >= 0.8 ? 'urban' : urb >= 0.35 ? 'semi' : 'rural';

  const majority = n(c.ethnicity_proportion_bumi) / 100; // used only to estimate blocs
  const income = clamp((n(c.income_median) - 3500) / (9000 - 3500));
  const adults = Math.max(1, n(c.age_proportion_18_above));
  const farmsPer1000 = ((n(c.businesses_agriculture) + n(c.businesses_livestock) + n(c.businesses_fisheries)) / pop) * 1000;

  const seniors = clamp(n(c.age_proportion_65_above) / adults, 0.02, 0.25);
  const undi18 = clamp(0.13 + 0.6 * (n(c.age_proportion_0_14) / 100 - 0.23), 0.08, 0.2);
  const rest = 1 - seniors - undi18;

  const w = Object.fromEntries(BLOC_IDS.map((b) => [b, 0]));
  const farm = clamp(farmsPer1000 / 1.5);

  if (region === 'peninsular') {
    w.heartland = majority * (1 - 0.75 * urb);
    w.felda = majority * (1 - urb) * (FELDA_STATE[state] ?? 0) * 0.5;
    w.agri = (1 - urb) * (0.02 + 0.25 * farm);
    w.civil = majority * 0.12 + (state === 'putrajaya' ? 2 : 0);
    w.urban_b40 = urb * (1 - income) * 0.8;
    w.gig = urb * 0.12 * (1 - 0.5 * income);
    w.m40 = 0.35 * (0.4 + 0.6 * urb);
    w.urban_lib = urb * (1 - 0.7 * majority) * (0.3 * (1 - majority) + 0.9 * income);
    w.smallbiz = 0.06 + (1 - majority) * 0.25;
  } else {
    w.borneo_native = 1 - 0.8 * urb;
    w.borneo_urban = 0.05 + 0.9 * urb;
    w.civil = 0.08;
    w.agri = (1 - urb) * (0.05 + 0.15 * farm);
    w.gig = urb * 0.08;
    w.urban_lib = urb * income * (1 - majority) * 0.5;
    w.smallbiz = 0.05 + (1 - majority) * 0.2;
    w.felda = (1 - urb) * (FELDA_STATE[state] ?? 0) * 0.15;
  }

  const sum = Object.values(w).reduce((a, b) => a + b, 0);
  for (const b of BLOC_IDS) w[b] = (w[b] / sum) * rest;
  w.seniors = seniors;
  w.undi18 = undi18;

  return { blocs: BLOC_IDS.map((b) => w[b]), urbanity: urb, kind };
}
