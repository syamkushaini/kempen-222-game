import type { World } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { ENDORSERS } from './endorserData';
import { stat } from './perks';
import { pushNews, ref } from './news';
import { ENDORSER_IDS, type Campaign, type EndorserId } from './types';

const COURT_DAYS = 1;
/** Weekly chance that an endorser nobody has won makes up their own mind. */
const DRIFT = 0.1;
const index = (id: EndorserId) => ENDORSER_IDS.indexOf(id);

/** Endorsements are sought in contests fought across many seats; a by-election is too small for them. */
export const hasEndorsers = (world: World) => world.rules.kind === 'general' || world.rules.kind === 'state';

export const holder = (c: Campaign, id: EndorserId) => c.team.endorsers[index(id)];

/** Whether the party has done something that makes this endorser turn away. */
const barred = (c: Campaign, p: number, id: EndorserId) => id === 'watchdog' && c.parties[p]?.tycoon === 2;

/** The chance the endorser says yes to the player. */
export function courtChance(c: Campaign, id: EndorserId): number {
  const def = ENDORSERS[id];
  const me = c.player;
  if (barred(c, me, id)) return 0;
  const withRival = def.rival && holder(c, def.rival) === me ? 0.25 : 0;
  return clamp(0.3 + 0.6 * (def.natural[PARTY_IDS[me]] ?? 0) + 0.08 * (stat(c, me, 'charisma') - 3) - withRival, 0.05, 0.9);
}

export type CourtRefusal = 'closed' | 'taken' | 'days' | 'funds' | 'usedThisWeek';
export function canCourtEndorser(world: World, c: Campaign, id: EndorserId): { ok: true } | { ok: false; reason: CourtRefusal } {
  const no = (reason: CourtRefusal) => ({ ok: false as const, reason });
  const pc = c.parties[c.player];
  if (c.phase !== 'campaign' || !hasEndorsers(world) || !pc) return no('closed');
  if (holder(c, id) !== null) return no('taken');
  if (pc.used[`endorser:${id}`]) return no('usedThisWeek');
  if (pc.days < COURT_DAYS) return no('days');
  if (pc.funds < scaled(world, ENDORSERS[id].money)) return no('funds');
  return { ok: true };
}
export const courtCost = (world: World, id: EndorserId) => ({ days: COURT_DAYS, money: ENDORSERS[id].money ? scaled(world, ENDORSERS[id].money) : 0 });

/** Puts an endorser behind a party, or takes them away again. Their followers move with them for as long as it lasts. */
function endorse(c: Campaign, id: EndorserId, p: number, sign = 1): void {
  c.team.endorsers[index(id)] = sign > 0 ? p : null;
}

export { ENDORSERS };

/** The leader goes to ask for an endorsement. Returns the news of how it went, or null if it could not be tried. */
export function courtEndorser(world: World, c: Campaign, id: EndorserId) {
  if (!canCourtEndorser(world, c, id).ok) return null;
  const pc = c.parties[c.player]!;
  const cost = courtCost(world, id);
  pc.days -= cost.days;
  pc.funds -= cost.money;
  pc.spent += cost.money;
  pc.used[`endorser:${id}`] = 1;
  const rng = new Rng(c.rng);
  const won = rng.next() < courtChance(c, id);
  c.rng = rng.state;
  if (won) endorse(c, id, c.player);
  return pushNews(c, { party: c.player, key: won ? 'news.endorser.won' : 'news.endorser.refused', vars: { who: `@endorser:${id}` }, tone: won ? 'good' : 'neutral' });
}

/**
 * The endorsers' week: those nobody has won may come out for a party of their
 * own accord, and one who has been embarrassed walks away.
 */
export function endorsersWeek(world: World, c: Campaign, rng: Rng): void {
  if (!hasEndorsers(world)) return;
  for (const id of ENDORSER_IDS) {
    const has = holder(c, id);
    if (has !== null) {
      if (barred(c, has, id)) {
        endorse(c, id, has, -1);
        pushNews(c, { party: has, key: 'news.endorser.left', vars: { who: `@endorser:${id}`, party: ref.party(has) }, tone: has === c.player ? 'bad' : 'neutral' });
      }
      continue;
    }
    if (rng.next() >= DRIFT) continue;
    const options = PARTY_IDS.map((pid, p) => ({ p, w: c.parties[p] && !barred(c, p, id) ? ENDORSERS[id].natural[pid] ?? 0 : 0 })).filter((o) => o.w > 0);
    const total = options.reduce((a, o) => a + o.w, 0);
    // The stronger their leaning, the likelier they act on it; an endorser with no favourite stays out.
    if (rng.next() > total) continue;
    let roll = rng.next() * total;
    const to = options.find((o) => (roll -= o.w) <= 0) ?? options[0];
    endorse(c, id, to.p);
    pushNews(c, { party: to.p, key: to.p === c.player ? 'news.endorser.cameOver' : 'news.endorser.rival', vars: { who: `@endorser:${id}`, party: ref.party(to.p) }, tone: to.p === c.player ? 'good' : 'neutral' });
  }
}
