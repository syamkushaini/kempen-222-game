import { isValidIdentity, type Identity } from './identity';

// The party a player made for the Career Campaign: the name they play under and the party, logo and leader they chose. It is kept in
// this browser so that the next visit starts from it (the player can change anything); nothing about it is sent anywhere.

export interface JourneyParty { name: string; identity: Identity | null }

const KEY = 'k222.journey.party';
const safe = (): Storage | null => { try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; } };

/** The party made last time, or null if there is none or it is no longer a usable one. */
export function loadJourneyParty(kv: Pick<Storage, 'getItem'> | null = safe()): JourneyParty | null {
  try {
    const raw: unknown = JSON.parse(kv?.getItem(KEY) ?? 'null');
    if (typeof raw !== 'object' || raw === null) return null;
    const r = raw as Record<string, unknown>;
    const name = typeof r.name === 'string' ? r.name.trim().slice(0, 24) : '';
    return isValidIdentity(r.identity) && r.identity !== null ? { name, identity: r.identity } : null;
  } catch { return null; }
}

export function saveJourneyParty(party: JourneyParty, kv: Pick<Storage, 'setItem'> | null = safe()): void {
  try { kv?.setItem(KEY, JSON.stringify({ name: party.name.trim().slice(0, 24), identity: party.identity })); } catch { /* it is only a convenience */ }
}
