import { worldOf } from '../data/world';
import { START_UNITY, startRelations } from '../sim/campaign/cast';
import { formCabinet, makeObligations, standstill, startEconomy } from '../sim/campaign/govern';
import { ROUNDS, startStates } from '../sim/campaign/contests';
import { teamFor } from '../sim/campaign/team';
import { freshParty } from '../sim/campaign/turn';
import type { Campaign } from '../sim/campaign/types';
import { Rng } from '../sim/rng';
import { isMinor, N_PARTIES, PARTY_IDS } from '../sim/types';
import { isValidCampaign } from '../sim/campaign/validate';
import { isValidIdentity, type Identity } from './identity';

/** Bump when the saved shape changes, and add a step to `migrate`. */
export const SAVE_VERSION = 10;

/** Everything that must survive a save and reload. Plain JSON only. */
export interface GameState {
  version: typeof SAVE_VERSION;
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  campaign: Campaign;
  /**
   * Progress through the adviser's guided steps, or null when there is no
   * tutorial or it has been dismissed.
   */
  tutorial: { step: number } | null;
  /** The player's own name, colours and leader for their party, or null to play it as it is. */
  identity: Identity | null;
}

export function newGame(name: string, campaign: Campaign, now: number = Date.now(), tutorial = false, identity: Identity | null = null): GameState {
  return {
    version: SAVE_VERSION,
    id: `${now.toString(36)}-${campaign.seed.toString(36)}`,
    name,
    createdAt: now,
    updatedAt: now,
    campaign,
    tutorial: tutorial ? { step: 0 } : null,
    identity,
  };
}

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

export type ParseError = 'not-json' | 'not-a-save' | 'too-new' | 'outdated' | 'damaged';
export type ParseResult = { ok: true; state: GameState } | { ok: false; error: ParseError };

/**
 * Upgrades an older save to the current version, or returns null if it cannot
 * be carried forward. Version 1 saves came from the foundation build, which
 * had no campaign to continue.
 */
function migrate(raw: Record<string, unknown>): Record<string, unknown> | null {
  if (raw.version === 1) return null;
  // Before the small parties were added there were seven parties; every list that runs one entry per party is the wrong length.
  if (isRecord(raw.campaign) && Array.isArray(raw.campaign.parties) && raw.campaign.parties.length !== N_PARTIES) return null;
  let s = raw;
  if (s.version === 2 && isRecord(s.campaign)) {
    // Version 2 had only the general election and no tutorial.
    s = { ...s, version: 3, tutorial: null, campaign: { ...s.campaign, scenario: 'general' } };
  }
  if (s.version === 3 && isRecord(s.campaign) && Array.isArray(s.campaign.parties)) {
    // Version 3 had no chiefs.
    const parties = s.campaign.parties.map((p) => (isRecord(p) ? { ...p, chiefs: {}, chiefFloor: 0 } : p));
    s = { ...s, version: 4, campaign: { ...s.campaign, parties } };
  }
  if (s.version === 4 && isRecord(s.campaign) && Array.isArray(s.campaign.parties)) {
    // Version 4 had no dealings between leaders and no talks after the election.
    const parties = s.campaign.parties.map((p, i) => (isRecord(p) ? { ...p, unity: START_UNITY[PARTY_IDS[i] as keyof typeof START_UNITY] ?? 65 } : p));
    s = {
      ...s, version: 5,
      campaign: {
        ...s.campaign, parties, relations: startRelations(), standDowns: {}, pacts: [], understandings: [],
        met: new Array<number>(N_PARTIES).fill(0), katak: [], offered: [], inbox: [], nextScene: 1, formation: null,
      },
    };
  }
  if (s.version === 5 && isRecord(s.campaign)) {
    // Version 5 had single contests only.
    s = { ...s, version: 6, campaign: { ...s.campaign, career: null } };
  }
  if (s.version === 6 && isRecord(s.campaign)) {
    // Version 6 careers had no governing: no economy, budget, cabinet or record.
    const career = s.campaign.career;
    s = { ...s, version: 7, campaign: { ...s.campaign, career: isRecord(career) ? withOffice(s.campaign as unknown as Campaign) : career } };
  }
  if (s.version === 7 && isRecord(s.campaign) && Array.isArray(s.campaign.parties)) {
    // Version 7 had no team around the leader, no endorsers or press, and no limit on spending.
    const parties = s.campaign.parties.map((p) => (isRecord(p) ? { ...p, spent: 0, fined: false } : p));
    const campaign: Record<string, unknown> = { ...s.campaign, parties };
    // Careers also gain by-elections and state polls: the House as elected, and whoever carried each state last time.
    const career = isRecord(campaign.career) ? withContests(campaign as unknown as Campaign) : campaign.career;
    s = { ...s, version: 8, identity: null, campaign: { ...campaign, career, team: withTeam(campaign as unknown as Campaign) } };
  }
  if (s.version === 8) {
    // Version 9 added three small parties; nothing else about a save changed.
    s = { ...s, version: 9 };
  }
  if (s.version === 9 && isRecord(s.campaign) && Array.isArray(s.campaign.parties)) {
    // Version 10 lets the small parties campaign. A game from before has none running for them: start them as on the first day.
    s = { ...s, version: 10, campaign: { ...s.campaign, parties: withSmallParties(s.campaign as unknown as Campaign) } };
  }
  return s;
}

/** Starts a campaign for each small party that would have one, as it stands on the first day. */
function withSmallParties(campaign: Campaign): unknown {
  try {
    const world = worldOf(campaign);
    if (!world) return campaign.parties;
    return campaign.parties.map((p, i) => (p === null && isMinor(i) ? freshParty(world, i) : p));
  } catch {
    return campaign.parties;
  }
}

/** Gives an older career the House as it was elected and the state governments the last election implies. Rounds of state polls already past are not held again. */
function withContests(campaign: Campaign): unknown {
  try {
    const world = worldOf(campaign);
    const k = campaign.career!;
    return { ...k, house: {}, states: world ? startStates(world) : {}, rounds: ROUNDS.filter((r) => r.week <= k.week).length };
  } catch {
    return campaign.career;
  }
}

/** Gives a game from before there were people around the leader an ordinary leader, people to hire, and the press as it usually is. */
function withTeam(campaign: Campaign): unknown {
  try {
    const world = worldOf(campaign);
    return world ? teamFor(world, campaign) : null;
  } catch {
    return null;
  }
}

/** Gives a career from before the governing layer an economy, a standstill budget, a cabinet and a blank record. */
function withOffice(campaign: Campaign): unknown {
  try {
    const c = structuredClone(campaign);
    Object.assign(c.career!, {
      economy: startEconomy(), budget: standstill(), tabled: standstill(), fiscal: 0,
      cabinet: [], bills: [], delivery: {}, obligations: [], levers: [0, 0, 0], motion: 0, rivalBills: 0,
      record: { elections: Math.max(0, c.career!.term - 1), victories: 0, weeksPm: 0, weeksGov: 0, weeksOpp: 0, kept: [], broken: 0, bestSeats: 0, falls: 0, toppled: 0 },
      ending: null,
    });
    formCabinet(c, new Rng(c.seed));
    makeObligations(c);
    return c.career;
  } catch {
    return campaign.career;
  }
}

/** Reads a save from text, checking it thoroughly: the text may be damaged or hand-edited. */
export function parseSave(text: string): ParseResult {
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return { ok: false, error: 'not-json' }; }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { ok: false, error: 'not-a-save' };
  const first = raw as Record<string, unknown>;
  if (typeof first.version !== 'number') return { ok: false, error: 'not-a-save' };
  if (first.version > SAVE_VERSION) return { ok: false, error: 'too-new' };
  const s = migrate(first);
  if (!s) return { ok: false, error: 'outdated' };

  // A career's world is built from the results stored in the save, which may themselves be damaged.
  const saved = s.campaign as { scenario?: unknown; career?: unknown } | null;
  let world = null;
  try {
    if (typeof saved?.scenario === 'string') world = worldOf(saved as Parameters<typeof worldOf>[0]);
  } catch {
    return { ok: false, error: 'damaged' };
  }
  const tutorial = s.tutorial as { step?: unknown } | null;
  const valid =
    world !== null &&
    typeof s.id === 'string' && typeof s.name === 'string' &&
    typeof s.createdAt === 'number' && typeof s.updatedAt === 'number' &&
    isValidCampaign(s.campaign, world) && isValidIdentity(s.identity) &&
    (tutorial === null || (typeof tutorial === 'object' && Number.isInteger(tutorial.step) && (tutorial.step as number) >= 0));
  if (!valid) return { ok: false, error: 'damaged' };

  return {
    ok: true,
    state: {
      version: SAVE_VERSION,
      id: s.id as string,
      name: (s.name as string).slice(0, 60),
      createdAt: s.createdAt as number,
      updatedAt: s.updatedAt as number,
      campaign: s.campaign as Campaign,
      tutorial: tutorial === null ? null : { step: tutorial.step as number },
      identity: s.identity as Identity | null,
    },
  };
}

export function serializeSave(state: GameState): string {
  return JSON.stringify(state);
}
