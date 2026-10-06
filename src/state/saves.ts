import { parseSave, scenarioIn, serializeSave, type GameState } from './game';

/** The part of Web Storage we use; lets tests supply an in-memory stand-in. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const AUTO_SLOT = 'auto';
export const MANUAL_SLOTS = ['1', '2', '3', '4', '5'] as const;
export type SlotId = typeof AUTO_SLOT | (typeof MANUAL_SLOTS)[number];

export interface SaveMeta {
  slot: SlotId;
  name: string;
  week: number;
  totalWeeks: number;
  /** Scenario id of the contest. */
  scenario: string;
  /** Party index the player leads. */
  player: number;
  /** The campaign has reached polling day. */
  finished: boolean;
  /** The game is in, or ended with, the talks to form a government. */
  talks: boolean;
  /** In a career between elections: which term, and how far into it. */
  term: { term: number; week: number } | null;
  updatedAt: number;
}

const key = (slot: SlotId) => `k222.save.${slot}`;

/**
 * Save slots on top of a key-value store. Storage can be missing, full or
 * blocked (private windows), so nothing here throws: writes report success and
 * reads return null.
 */
export class SaveStore {
  constructor(private kv: KeyValueStore | null) {}

  get available(): boolean {
    return this.kv !== null;
  }

  save(slot: SlotId, state: GameState): boolean {
    if (!this.kv) return false;
    try {
      this.kv.setItem(key(slot), serializeSave(state));
      return true;
    } catch {
      return false;
    }
  }

  load(slot: SlotId): GameState | null {
    if (!this.kv) return null;
    try {
      const text = this.kv.getItem(key(slot));
      if (text === null) return null;
      const parsed = parseSave(text);
      return parsed.ok ? parsed.state : null;
    } catch {
      return null;
    }
  }

  /** The scenarios of the games in the slots, so that what they need can be fetched before any of them is read. */
  scenarios(): string[] {
    const found: string[] = [];
    for (const slot of [AUTO_SLOT, ...MANUAL_SLOTS] as SlotId[]) {
      try {
        const text = this.kv?.getItem(key(slot));
        const scenario = text ? scenarioIn(text) : null;
        if (scenario) found.push(scenario);
      } catch { /* an unreadable slot needs nothing */ }
    }
    return found;
  }

  delete(slot: SlotId): void {
    try { this.kv?.removeItem(key(slot)); } catch { /* nothing to do */ }
  }

  meta(slot: SlotId): SaveMeta | null {
    const s = this.load(slot);
    if (!s) return null;
    const c = s.campaign;
    return {
      slot, name: s.name, week: c.week, totalWeeks: c.totalWeeks, scenario: c.scenario, player: c.player,
      finished: c.phase !== 'campaign' && c.phase !== 'term', talks: c.formation !== null,
      term: c.career && c.phase === 'term' ? { term: c.career.term, week: c.career.week } : null, updatedAt: s.updatedAt,
    };
  }

  list(): (SaveMeta | null)[] {
    return MANUAL_SLOTS.map((slot) => this.meta(slot));
  }
}

/** The browser's local storage, or null where it is unavailable. */
export function browserStorage(): KeyValueStore | null {
  try {
    const ls = globalThis.localStorage;
    const probe = 'k222.probe';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    return null;
  }
}

export function exportFileName(state: GameState): string {
  const safe = state.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'game';
  return `kempen222-${safe}-week${state.campaign.week}.json`;
}
