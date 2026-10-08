import type { World } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { BLOC_IDS, type BlocId } from '../types';
import { scaled } from './actions';
import { forgetAct, agenda, enact } from './govern';
import { isPm, lift } from './office';
import { pushNews } from './news';
import { PLEDGES, blocSizes, isEnacted } from './policy';
import type { Campaign, PledgeId } from './types';

// Two ways the law is made or unmade outside the House. A government may put a contested promise to the voters
// themselves, and what they decide binds, and no court touches it. And a constitutional court looks, rarely, at an Act
// that scraped through the House, and may strike it down.

// ---------- a referendum ----------

export const REFERENDUM = { money: 150_000, credibility: 4, trust: 3, failCredibility: 5, failTrust: 5, failStability: 3, contested: -0.04 };

/** A promise is contested when some group of voters is set hard against it. */
export const isContested = (id: PledgeId): boolean => Object.values(PLEDGES[id].appeal).some((v) => v <= REFERENDUM.contested);

export type ReferendumRefusal = 'phase' | 'bill' | 'tame' | 'funds' | 'again';

export function canReferendum(world: World, c: Campaign, id: PledgeId): { ok: true } | { ok: false; reason: ReferendumRefusal } {
  const k = c.career;
  const pc = c.parties[c.player];
  if (!k || !pc || c.phase !== 'term' || c.inbox.length > 0 || !isPm(c)) return { ok: false, reason: 'phase' };
  if (!agenda(c).includes(`pledge:${id}`)) return { ok: false, reason: 'bill' };
  if (!isContested(id)) return { ok: false, reason: 'tame' };
  if (k.flags.includes(`referendum${k.term}`)) return { ok: false, reason: 'again' };
  if (pc.funds < scaled(world, REFERENDUM.money)) return { ok: false, reason: 'funds' };
  return { ok: true };
}

/** The chance the voters carry the promise: how the blocs feel about it, weighted by their size, and how far they believe the government. */
export function referendumOdds(world: World, c: Campaign, id: PledgeId): number {
  const size = blocSizes(world);
  const net = BLOC_IDS.reduce((a, b, i) => a + size[i] * (PLEDGES[id].appeal[b as BlocId] ?? 0), 0);
  const k = c.career!;
  return clamp(0.5 + 8 * net + (k.credibility - 50) / 400 + (k.government.trust - 50) / 400, 0.1, 0.9);
}

/**
 * Puts a contested promise to the voters. If they carry it, it passes without the House and for good, and the
 * government is stronger for it. If not, it fails in front of everyone.
 */
export function callReferendum(world: World, c: Campaign, id: PledgeId): boolean {
  if (!canReferendum(world, c, id).ok) return false;
  const k = c.career!;
  const me = c.player;
  const odds = referendumOdds(world, c, id);
  const rng = new Rng((c.rng ^ 0x4efe) + k.week);
  const passed = rng.next() < odds;
  c.rng = rng.state;
  c.parties[me]!.funds -= scaled(world, REFERENDUM.money);
  k.flags.push(`referendum${k.term}`);
  k.bills = k.bills.filter((b) => b.id !== `pledge:${id}`);
  const bill = `@bill:pledge:${id}`;
  if (passed) {
    enact(c, `pledge:${id}`, me);
    k.delivery[id] = 'kept';
    k.record.kept.push(id);
    if (PLEDGES[id].law && isEnacted(k, id)) (k.mandated ??= []).push(id);
    k.credibility = clamp(k.credibility + REFERENDUM.credibility, 0, 100);
    k.government.trust = clamp(k.government.trust + REFERENDUM.trust, 0, 100);
    pushNews(c, { party: me, key: 'news.referendum.won', vars: { bill, pct: Math.round(odds * 100) }, tone: 'good' });
  } else {
    k.delivery[id] = 'failed';
    k.credibility = clamp(k.credibility - REFERENDUM.failCredibility, 0, 100);
    k.government.trust = clamp(k.government.trust - REFERENDUM.failTrust, 0, 100);
    k.government.stability = clamp(k.government.stability - REFERENDUM.failStability, 5, 95);
    pushNews(c, { party: me, key: 'news.referendum.lost', vars: { bill }, tone: 'bad' });
  }
  return true;
}

// ---------- the constitutional court ----------

/** How often (in weeks) the court sits, and the yearly chance it strikes down an Act that was shaky, and any other. */
export const COURT = { every: 52, shaky: 0.12, sound: 0.012, trust: 3, credibility: 2, undo: 0.3 };

export const strikeChance = (c: Campaign, id: PledgeId): number => {
  const k = c.career!;
  if (k.mandated?.includes(id)) return 0;
  return k.shaky?.includes(id) ? COURT.shaky : COURT.sound;
};

/** Once a year the court may look at the Acts on the books. It strikes one down rarely, and a shaky one likelier. */
export function courtWeek(c: Campaign, rng: Rng): void {
  const k = c.career!;
  if (k.week % COURT.every !== 0 || !k.laws?.length) return;
  for (const id of [...k.laws]) {
    if (rng.next() >= strikeChance(c, id)) continue;
    k.laws = k.laws.filter((x) => x !== id);
    if (k.laws.length === 0) delete k.laws;
    forgetAct(k, id);
    delete k.delivery[id];
    // The party that made it loses part of what it gained.
    const pm = k.government.pm;
    for (const [bloc, v] of Object.entries(PLEDGES[id].appeal)) if (v > 0) lift(k, pm, [bloc as BlocId], -v * COURT.undo);
    if (pm === c.player) {
      k.government.trust = clamp(k.government.trust - COURT.trust, 0, 100);
      k.credibility = clamp(k.credibility - COURT.credibility, 0, 100);
    }
    pushNews(c, { party: pm, key: 'news.court.struck', vars: { bill: `@bill:pledge:${id}` }, tone: pm === c.player ? 'bad' : 'neutral' });
    return;
  }
}
