import type { World } from '../election';
import { Rng } from '../rng';
import { N_BLOCS } from '../types';
import { scaled } from './actions';
import { shiftUnity } from './diplomacy';
import { pushNews } from './news';

export { fundsBoost, gaffeCut, incomeBoost, managerDays, mediaBoost, pollDiscount, pollPrecision, skill } from './perks';
import { ROLE_IDS, type Campaign, type RoleId, type Staffer } from './types';

/** Invented names for the people who might work for the leader, three for each job. Proper nouns; the same in every language. */
export const STAFF_NAMES = [
  'Faridah Osman', 'Daniel Ooi', 'Suresh Nair',
  'Hazlina Aziz', 'Kelvin Teo', 'Bernard Luping',
  'Aiman Rosli', 'Michelle Khoo', 'Priya Menon',
  'Salleh Mahmud', 'Grace Lim', 'Raymond Jimbun',
];
const PER_ROLE = 3;

const WAGE = 4_000;
/** Between elections a team is kept on a retainer. */
const RETAINER = 0.25;
const VET_DAYS = 0.5;
const VET_MONEY = 10_000;
/** Weekly chance that a hidden past comes out: in the glare of a campaign, and in the quiet between. */
const EXPOSURE = { campaign: 0.12, term: 0.012 };

const role = (id: RoleId) => ROLE_IDS.indexOf(id);

/**
 * The people on offer for each job as a game begins: one ordinary, one good,
 * one outstanding. The better they are, the likelier there is something in
 * their past.
 */
export function makePool(rng: Rng): Staffer[][] {
  return ROLE_IDS.map((_, r) => {
    const skills = [2, 3, 5].map((s) => Math.min(5, s + (rng.next() < 0.35 ? 1 : 0)));
    // Who is which varies from game to game.
    const order = rng.shuffled([0, 1, 2]);
    return order.map((slot, i) => {
      const skill = skills[slot];
      return { name: r * PER_ROLE + i, skill, skeleton: rng.next() < (skill >= 5 ? 0.5 : skill >= 3 ? 0.25 : 0.1), vetted: false };
    });
  });
}

/** What the team costs each week. */
export function wages(world: World, c: Campaign): number {
  const total = c.team.staff.reduce((a, s) => a + (s ? scaled(world, WAGE * s.skill) : 0), 0);
  return Math.round(total * (c.phase === 'term' ? RETAINER : 1));
}

const open = (c: Campaign) => c.phase === 'campaign' || c.phase === 'term';

/** Takes someone on for a job. Whoever held it before goes, and the party notices. */
export function hire(c: Campaign, id: RoleId, index: number): boolean {
  const r = role(id);
  const pick = c.team.pool[r]?.[index];
  if (!open(c) || !pick || c.team.staff[r]?.name === pick.name) return false;
  if (c.team.staff[r]) shiftUnity(c, c.player, -1);
  c.team.staff[r] = pick;
  pushNews(c, { party: c.player, key: 'news.staff.hired', vars: { name: STAFF_NAMES[pick.name], role: `@role:${id}` }, tone: 'neutral' });
  return true;
}

export function dismiss(c: Campaign, id: RoleId): boolean {
  const r = role(id);
  if (!open(c) || !c.team.staff[r]) return false;
  c.team.staff[r] = null;
  shiftUnity(c, c.player, -1);
  return true;
}

export type VetCost = { days: number; money: number };
/** What looking into someone's past costs: half a day of the leader's time in a campaign, money between elections. */
export function vetCost(world: World, c: Campaign): VetCost {
  return c.phase === 'term' ? { days: 0, money: scaled(world, VET_MONEY) } : { days: VET_DAYS, money: 0 };
}

export function canVet(world: World, c: Campaign): boolean {
  const pc = c.parties[c.player];
  const cost = vetCost(world, c);
  return open(c) && !!pc && pc.days >= cost.days && pc.funds >= cost.money;
}

/** Pays for looking into a past. The caller marks whoever was looked into. */
export function payVet(world: World, c: Campaign): boolean {
  if (!canVet(world, c)) return false;
  const pc = c.parties[c.player]!;
  const cost = vetCost(world, c);
  pc.days -= cost.days;
  pc.funds -= cost.money;
  return true;
}

/** Looks into the past of someone who could be hired, or already has been. What is found stays found. */
export function vet(world: World, c: Campaign, id: RoleId, index: number): boolean {
  const r = role(id);
  const who = c.team.pool[r]?.[index];
  if (!who || who.vetted || !payVet(world, c)) return false;
  who.vetted = true;
  const held = c.team.staff[r];
  if (held?.name === who.name) held.vetted = true;
  return true;
}

/**
 * The team's week: wages go out (unless the caller has already paid them),
 * and a past that was never looked into, or was looked into and ignored, may
 * come out.
 */
export function staffWeek(world: World, c: Campaign, rng: Rng, pay = true): void {
  const pc = c.parties[c.player];
  if (!pc) return;
  if (pay) {
    const paid = Math.min(pc.funds, wages(world, c));
    pc.funds -= paid;
    // A campaign team's pay is campaign spending like any other.
    if (c.phase === 'campaign') pc.spent += paid;
  }
  const chance = c.phase === 'term' ? EXPOSURE.term : EXPOSURE.campaign;
  c.team.staff.forEach((s, r) => {
    if (!s?.skeleton || rng.next() >= chance) return;
    c.team.staff[r] = null;
    c.team.pool[r] = c.team.pool[r].filter((x) => x.name !== s.name);
    shiftUnity(c, c.player, -3);
    // The story runs everywhere for a week or two.
    const rows = c.career && c.phase === 'term' ? c.career.mood : c.dyn.support.nat;
    for (let b = 0; b < N_BLOCS; b++) rows[b][c.player] -= 0.04;
    if (c.career) c.career.credibility = Math.max(0, c.career.credibility - 3);
    pushNews(c, { party: c.player, key: 'news.staff.scandal', vars: { name: STAFF_NAMES[s.name], role: `@role:${ROLE_IDS[r]}` }, tone: 'bad' });
  });
}
