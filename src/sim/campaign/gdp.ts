import type { World } from '../election';
import { clamp } from '../math';
import { pushNews, ref } from './news';
import { deficit } from './office';
import { SECTOR_IDS, SECTORS, sectorsOf, type SectorId } from './sectors';
import { LINE_IDS, type Campaign, type Career, type LineId } from './types';

// The size of the economy in ringgit: what the country (or a state) produces in a year, and what each person's share of it is.
// It grows with the economy's growth and its prices, and it rests on four sectors (oil, electronics, tourism and farming), each
// state in a different mix, so a state that lives on oil does well when oil does. Once a year the government announces it, with
// the public finances: what it owes, and whether the debt is growing or shrinking.

/** The country's output in a year at the start of a career, in ringgit, and the voters it was divided among. */
export const NATIONAL_GDP = 1_800_000_000_000;
export const NATIONAL_ELECTORS = 21_173_638;
/** People per voter on the roll, and the yearly growth of the population. */
export const PEOPLE_PER_ELECTOR = 1.55;
export const POPULATION_GROWTH = 0.011;
/** What a state produces for each voter on its roll, against the country's average: Penang's factories and Sarawak's gas, Kelantan's farms. */
const PRODUCTIVITY: Record<string, number> = {
  perlis: 0.5, kedah: 0.55, kelantan: 0.4, terengganu: 1.0, penang: 1.3, perak: 0.6, pahang: 0.8, selangor: 1.25, nsembilan: 1.0,
  melaka: 0.95, johor: 0.9, sabah: 0.8, sarawak: 1.5,
};
/** Where each state's output comes from (oil, electronics, tourism, farming and the rest); the country's is given by `SECTORS`. */
const MIX: Record<string, Record<SectorId, number>> = {
  perlis: { oil: 0.05, electronics: 0.15, tourism: 0.25, farming: 0.55 },
  kedah: { oil: 0.05, electronics: 0.25, tourism: 0.25, farming: 0.45 },
  kelantan: { oil: 0.1, electronics: 0.1, tourism: 0.25, farming: 0.55 },
  terengganu: { oil: 0.65, electronics: 0.1, tourism: 0.1, farming: 0.15 },
  penang: { oil: 0.05, electronics: 0.65, tourism: 0.2, farming: 0.1 },
  perak: { oil: 0.1, electronics: 0.25, tourism: 0.2, farming: 0.45 },
  pahang: { oil: 0.15, electronics: 0.2, tourism: 0.25, farming: 0.4 },
  selangor: { oil: 0.1, electronics: 0.5, tourism: 0.15, farming: 0.25 },
  nsembilan: { oil: 0.1, electronics: 0.45, tourism: 0.15, farming: 0.3 },
  melaka: { oil: 0.1, electronics: 0.35, tourism: 0.3, farming: 0.25 },
  johor: { oil: 0.2, electronics: 0.4, tourism: 0.15, farming: 0.25 },
  sabah: { oil: 0.4, electronics: 0.1, tourism: 0.2, farming: 0.3 },
  sarawak: { oil: 0.6, electronics: 0.1, tourism: 0.1, farming: 0.2 },
};
/** How much a sector at its best or worst moves the output of a place that lives by it, in a year. */
const SECTOR_PULL = 0.02;
/**
 * What a state government handles, against what its economy produces, compared with the country's: a tenth (the federation carries
 * much of the rest, so a state's budget is far smaller than its economy suggests).
 */
export const STATE_PUBLIC = 0.1;
/** What each line of the budget is of the economy's output, at the middle setting; and how far a notch moves it. */
export const LINE_SHARE: Record<LineId, number> = { aid: 0.013, health: 0.022, education: 0.036, rural: 0.01, civil: 0.018 };
export const LINE_NOTCH = 0.15;
/** How many yearly reports are kept. */
export const REPORTS = 10;

export interface Figures { gdp: number; population: number; perCapita: number }
/** One year's announcement. */
export interface YearReport { year: number; gdp: number; perCapita: number; growth: number; inflation: number; debt: number; debtRm: number; deficitRm: number }

/** The state a world is of, from its id (`career:selangor`, `state:selangor`): a state's own regions are its parliamentary seats, not its name. */
const stateOf = (world: World): string | null => (world.rules.kind === 'state' ? world.id.slice(world.id.indexOf(':') + 1) : null);
const electors = (world: World) => world.seats.reduce((a, s) => a + s.electorate, 0);

/** The mix of a place's output across the four sectors. */
export function mixOf(world: World): Record<SectorId, number> {
  const st = stateOf(world);
  if (st && MIX[st]) return MIX[st];
  return Object.fromEntries(SECTOR_IDS.map((id) => [id, SECTORS[id].growth])) as Record<SectorId, number>;
}

/** What the place produces and how many people share it, at the start of a career. */
export function startFigures(world: World): Figures {
  const st = stateOf(world);
  const e = electors(world);
  const gdp = Math.round(((NATIONAL_GDP * e) / NATIONAL_ELECTORS) * (st ? PRODUCTIVITY[st] ?? 1 : 1));
  const population = Math.round(e * PEOPLE_PER_ELECTOR);
  return { gdp, population, perCapita: gdp / population };
}

/** The figures as they stand: kept in the economy once the career has run a week, worked out from the start before. */
export function figuresOf(world: World, k: Career): Figures {
  const start = startFigures(world);
  const gdp = k.economy.gdp ?? start.gdp;
  const population = k.economy.population ?? start.population;
  return { gdp, population, perCapita: gdp / population };
}

/** The output of each sector, as a share of the whole: it moves with how each is doing. */
export function sectorShares(world: World, k: Career): Record<SectorId, number> {
  const mix = mixOf(world);
  const now = sectorsOf(k);
  const w = SECTOR_IDS.map((id) => mix[id] * (1 + 0.6 * ((now[id] - 50) / 50)));
  const total = w.reduce((a, b) => a + b, 0) || 1;
  return Object.fromEntries(SECTOR_IDS.map((id, i) => [id, w[i] / total])) as Record<SectorId, number>;
}

/** How far this place's sectors pull it away from the country's: a state that lives on oil gains or loses more with oil. */
function tilt(world: World, k: Career): number {
  const mix = mixOf(world);
  const now = sectorsOf(k);
  return SECTOR_IDS.reduce((a, id) => a + (mix[id] - SECTORS[id].growth) * ((now[id] - 50) / 50), 0) * SECTOR_PULL;
}

/** The government's own finances at the output given: what a notch of each line is, the deficit a year runs, and what is owed. */
export function publicFinance(world: World, k: Career) {
  const base = figuresOf(world, k).gdp * (world.rules.kind === 'state' ? STATE_PUBLIC : 1);
  const lines = Object.fromEntries(LINE_IDS.map((id) => [id, base * LINE_SHARE[id] * (1 + LINE_NOTCH * k.tabled.lines[id])])) as Record<LineId, number>;
  const deficitRm = (deficit(k) / 100) * base;
  const debtRm = (k.economy.debt / 100) * base;
  return { lines, deficitRm, debtRm, budgetRm: LINE_IDS.reduce((a, id) => a + lines[id], 0) };
}

/** One week of the economy's size: it grows with growth and prices (and the place's own sectors), and the people grow in number. */
export function gdpWeek(world: World, c: Campaign): void {
  const k = c.career;
  if (!k) return;
  const e = k.economy;
  const now = figuresOf(world, k);
  e.gdp = Math.round(now.gdp * (1 + (clamp((e.growth + e.inflation) / 100 + tilt(world, k), -0.2, 0.2)) / 52));
  e.population = Math.round(now.population * (1 + POPULATION_GROWTH / 52));
  if (k.week > 0 && k.week % 52 === 0) announce(world, c);
}

/** The yearly announcement: what the country produced and what each person's share was, and whether the debt grew. */
function announce(world: World, c: Campaign): void {
  const k = c.career!;
  const f = figuresOf(world, k);
  const fin = publicFinance(world, k);
  const past = k.reports ?? [];
  const report: YearReport = {
    year: (past.at(-1)?.year ?? 0) + 1, gdp: f.gdp, perCapita: Math.round(f.perCapita), growth: Math.round(k.economy.growth * 10) / 10, inflation: Math.round(k.economy.inflation * 10) / 10,
    debt: Math.round(k.economy.debt * 10) / 10, debtRm: Math.round(fin.debtRm), deficitRm: Math.round(fin.deficitRm),
  };
  k.reports = [...past, report].slice(-REPORTS);
  const before = past.at(-1);
  const rising = before ? report.perCapita >= before.perCapita : report.growth >= 0;
  const debtUp = before ? report.debtRm > before.debtRm : fin.deficitRm > 0;
  pushNews(c, {
    party: null,
    key: `news.gdp.${rising ? 'up' : 'down'}.${debtUp ? 'debtUp' : 'debtDown'}`,
    vars: { gdp: ref.rm(report.gdp), pc: ref.rm(report.perCapita), debt: ref.rm(report.debtRm), pct: report.debt.toFixed(1), growth: report.growth.toFixed(1) },
    tone: rising ? 'good' : 'bad',
  });
}
