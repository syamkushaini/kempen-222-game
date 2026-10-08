import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import {
  ALLIANCE, ALLIANCE_MARKS, ALLIANCE_NAMES, allianceBonus, allianceWeek, canExpel, canFound, canInvite, dissolveAlliance, dropMember, expel, foundAlliance, invite,
} from './alliance';
import { startCareer, syncOpinion } from './career';
import { houseTally } from './contests';
import { ASK, resolveCampaignScene } from './diplomacy';
import { relation } from './diplomacy';
import { RENEW_WITHIN, WITHDRAW, canRenew, discontent, renewSupply, signSupply, supplyWeek, SUPPLY_WEEKS } from './supply';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const [PS, BP, PT, GBK, GBS, LEGASI] = PARTY_IDS.map((_, i) => i);
void PT; void GBK; void GBS;
const world = getWorld('career')!;
const career = (seed = 5): Campaign => {
  const c = startCareer(world, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  c.parties[PS]!.funds = scaled(world, 5_000_000);
  return c;
};
const warm = (c: Campaign, p: number, n = 80) => { c.relations[PS][p] = c.relations[p][PS] = n; };

describe('an alliance with a name', () => {
  it('is founded with a name and a mark, once, for a fee', () => {
    const c = career();
    expect(canFound(world, c, 99, 0)).toEqual({ ok: false, reason: 'name' });
    const funds = c.parties[PS]!.funds;
    expect(foundAlliance(world, c, 2, 3)).toBe(true);
    expect(c.career!.alliance).toEqual({ name: 2, mark: 3, members: [PS] });
    expect(c.parties[PS]!.funds).toBe(funds - scaled(world, ALLIANCE.found));
    expect(canFound(world, c, 1, 1)).toEqual({ ok: false, reason: 'exists' });
    expect(ALLIANCE_MARKS).toHaveLength(6);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
  it('takes in a party that likes the player, up to a limit, and lifts the members', () => {
    const c = career();
    foundAlliance(world, c, 0, 0);
    expect(allianceBonus(c, PS)).toBe(0);
    expect(canInvite(world, c, BP)).toMatchObject({ ok: false });
    c.relations[PS][LEGASI] = c.relations[LEGASI][PS] = 5;
    expect(canInvite(world, c, LEGASI)).toEqual({ ok: false, reason: 'warmth' });
    warm(c, LEGASI);
    expect(invite(world, c, LEGASI)).toBe(true);
    expect(allianceBonus(c, PS)).toBeCloseTo(ALLIANCE.lift, 9);
    expect(allianceBonus(c, LEGASI)).toBeCloseTo(ALLIANCE.lift, 9);
    expect(allianceBonus(c, BP)).toBe(0);
    expect(canInvite(world, c, LEGASI)).toEqual({ ok: false, reason: 'already' });
    // A bigger alliance lifts more, but never past the cap.
    c.career!.alliance!.members.push(BP, PT, GBK, GBS);
    expect(allianceBonus(c, PS)).toBe(ALLIANCE.cap);
    expect(canInvite(world, c, GBS)).toMatchObject({ ok: false });
  });
  it('shows in the national opinion for a member', () => {
    const c = career();
    foundAlliance(world, c, 0, 0);
    warm(c, LEGASI);
    syncOpinion(c);
    const before = c.drift.support.nat[0][LEGASI];
    invite(world, c, LEGASI);
    syncOpinion(c);
    expect(c.drift.support.nat[0][LEGASI]).toBeCloseTo(before + ALLIANCE.lift, 9);
  });
  it('is left by a member that turns cold, and taking it apart costs the player', () => {
    const c = career();
    foundAlliance(world, c, 0, 0);
    warm(c, LEGASI);
    invite(world, c, LEGASI);
    c.career!.week = 8;
    c.relations[PS][LEGASI] = c.relations[LEGASI][PS] = -10;
    allianceWeek(c);
    expect(c.career!.alliance).toBeUndefined();
    expect(c.news.some((n) => n.key === 'news.alliance.quit')).toBe(true);

    const d = career();
    foundAlliance(world, d, 1, 1);
    warm(d, LEGASI);
    invite(world, d, LEGASI);
    const cred = d.career!.credibility;
    const rel = relation(d, PS, LEGASI);
    expect(dissolveAlliance(d)).toBe(true);
    expect(d.career!.alliance).toBeUndefined();
    expect(d.career!.credibility).toBe(cred - ALLIANCE.leaveCredibility);
    expect(relation(d, PS, LEGASI)).toBeLessThan(rel);
    expect(dissolveAlliance(d)).toBe(false);
    dropMember(d, LEGASI);
    expect(ALLIANCE_NAMES).toBe(6);
  });
});

describe('a partner asking for seats', () => {
  it('costs goodwill, and the government’s steadiness, to turn down; and mends relations when accepted', () => {
    const seat = world.seats.find((s) => s.last.votes.indexOf(Math.max(...s.last.votes)) === PS)!.id;
    const run = (choice: number) => {
      const c = career();
      c.career!.government.partners = [LEGASI];
      const scene = { id: 1, kind: 'pactOffer' as const, from: LEGASI, give: [seat], get: [], ask: [seat] };
      const rel = relation(c, PS, LEGASI);
      const stab = c.career!.government.stability;
      resolveCampaignScene(world, c, scene, choice);
      return { rel: relation(c, PS, LEGASI) - rel, stab: c.career!.government.stability - stab };
    };
    const declined = run(1);
    expect(declined.rel).toBeLessThanOrEqual(-3 + ASK.refused);
    expect(declined.stab).toBe(-ASK.stability);
    const accepted = run(0);
    expect(accepted.rel).toBeGreaterThanOrEqual(ASK.accepted);
    expect(accepted.stab).toBe(0);
  });
  it('can be put in a campaign by a partner, in the seats the player is clearly ahead in', async () => {
    const { newCampaign } = await import('./turn');
    const { rivalDiplomacy } = await import('./diplomacy');
    const general = getWorld('general')!;
    let asked = 0, offers = 0;
    for (let seed = 1; seed <= 14; seed++) {
      const c = newCampaign(general, { player: PS, difficulty: 'normal', seed });
      // Make every other party a friend, and one of them a partner of the player's own.
      c.parties.forEach((_, p) => { if (p !== PS) c.relations[PS][p] = c.relations[p][PS] = 80; });
      rivalDiplomacy(general, c);
      for (const s of c.inbox) if (s.kind === 'pactOffer') { offers++; if (s.ask?.length) asked++; }
      for (const s of c.inbox) for (const id of s.ask ?? []) expect(s.give).toContain(id);
    }
    expect(offers).toBeGreaterThan(0);
    // Only partners and members of the alliance ask; here no one is, so no one does.
    expect(asked).toBe(0);
  });
});

describe('a confidence and supply deal', () => {
  const deal = (price: 'cash' | 'policy' = 'cash') => {
    const c = career();
    const g = c.career!.government;
    g.pm = PS;
    // A thin government wants outside help.
    g.seats = Math.floor(world.seats.length / 2) + 1;
    const seats = houseTally(world, c);
    const p = [BP, PT, GBK, GBS, LEGASI].find((q) => (seats[q] ?? 0) > 0 && !g.partners.includes(q) && q !== g.pm)!;
    warm(c, p, 60);
    expect(signSupply(world, c, p, price)).toBe(true);
    return { c, p };
  };
  it('can be renewed in its last weeks at the price again', () => {
    const { c, p } = deal();
    const k = c.career!;
    expect(canRenew(world, c, p)).toEqual({ ok: false, reason: 'already' });
    k.week += SUPPLY_WEEKS - RENEW_WITHIN;
    const funds = c.parties[PS]!.funds;
    const until = k.supply![0].until;
    expect(renewSupply(world, c, p)).toBe(true);
    expect(k.supply![0].until).toBe(until + SUPPLY_WEEKS);
    expect(c.parties[PS]!.funds).toBeLessThan(funds);
    expect(canRenew(world, c, p).ok).toBe(false);
  });
  it('is withdrawn by a supporter that has lost patience, without bringing the government down', () => {
    let withdrew = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const { c, p } = deal();
      c.seed = seed * 31;
      c.relations[PS][p] = c.relations[p][PS] = WITHDRAW.below - 10;
      expect(discontent(c, p)).toBe(true);
      const stab = c.career!.government.stability;
      for (let w = 0; w < 30 && c.career!.supply; w++) { c.career!.week++; supplyWeek(c); }
      if (c.news.some((n) => n.key === 'news.supply.withdrew')) { withdrew++; expect(c.career!.government.stability).toBeLessThan(stab); expect(c.career!.government.pm).toBe(PS); }
    }
    expect(withdrew).toBeGreaterThan(10);
  });
  it('is kept by a supporter that is content', () => {
    const { c, p } = deal();
    c.relations[PS][p] = c.relations[p][PS] = 70;
    expect(discontent(c, p)).toBe(false);
    for (let w = 0; w < 40; w++) { c.career!.week++; c.relations[PS][p] = c.relations[p][PS] = 70; supplyWeek(c); if (!c.career!.supply) break; }
    expect(c.news.some((n) => n.key === 'news.supply.withdrew')).toBe(false);
  });
});

describe('putting a partner out', () => {
  it('turns the partner into an enemy and costs the government its steadiness and the leader their name', () => {
    const c = career();
    const k = c.career!;
    const g = k.government;
    g.pm = PS;
    const partner = g.partners[0];
    expect(partner).toBeDefined();
    // Give the government a comfortable majority without that partner.
    g.seats = world.seats.length;
    const [cred, stab, rel] = [k.credibility, g.stability, relation(c, PS, partner)];
    const others = g.partners.filter((q) => q !== partner);
    const otherRel = others.map((q) => relation(c, PS, q));
    expect(canExpel(world, c, partner).ok).toBe(true);
    expect(expel(world, c, partner)).toBe(true);
    expect(g.partners).not.toContain(partner);
    expect(g.deals[partner]).toBeNull();
    expect(k.credibility).toBeLessThan(cred);
    expect(g.stability).toBeLessThan(stab);
    expect(relation(c, PS, partner)).toBeLessThan(rel - 20);
    others.forEach((q, i) => expect(relation(c, PS, q)).toBeLessThan(otherRel[i]));
    expect(k.cabinet.every((m) => m.party !== partner)).toBe(true);
    expect(c.news.at(-1)).toMatchObject({ key: 'news.expel', tone: 'bad' });
    expect(canExpel(world, c, partner)).toEqual({ ok: false, reason: 'none' });
  });
  it('cannot be done if the government would lose its majority', () => {
    const c = career();
    const g = c.career!.government;
    g.pm = PS;
    const partner = g.partners[0];
    g.seats = Math.floor(world.seats.length / 2) + 1;
    expect(canExpel(world, c, partner)).toEqual({ ok: false, reason: 'majority' });
    expect(expel(world, c, partner)).toBe(false);
  });
  it('takes the partner out of the alliance too', () => {
    const c = career();
    const g = c.career!.government;
    g.pm = PS;
    g.seats = world.seats.length;
    const partner = g.partners[0];
    foundAlliance(world, c, 0, 0);
    warm(c, partner);
    invite(world, c, partner);
    expel(world, c, partner);
    expect(c.career!.alliance).toBeUndefined();
  });
});

describe('strings', () => {
  it('exist in both languages', () => {
    const keys = ['alliance.title', 'alliance.desc', 'alliance.name', 'alliance.mark', 'alliance.found', 'alliance.invite', 'alliance.dissolve', 'alliance.dissolve.confirm', 'alliance.lift', 'alliance.no.exists', 'alliance.no.funds', 'alliance.no.warmth', 'alliance.no.full', 'alliance.no.already', 'alliance.no.name', 'news.alliance.founded', 'news.alliance.joined', 'news.alliance.dissolved', 'news.alliance.quit', 'scene.pact.ask', 'supply.renew', 'supply.restless', 'news.supply.renewed', 'news.supply.withdrew', 'expel.title', 'expel.desc', 'expel.do', 'expel.confirm', 'expel.majority', 'news.expel'] as StringKey[];
    for (const key of keys) { expect(STRINGS.en[key], key).toBeTruthy(); expect(STRINGS.ms[key], key).toBeTruthy(); }
    for (let n = 0; n < ALLIANCE_NAMES; n++) for (const lang of ['en', 'ms'] as const) expect(STRINGS[lang][`alliance.name.${n}` as StringKey]).toBeTruthy();
  });
});
