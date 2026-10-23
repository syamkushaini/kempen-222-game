import { create } from 'zustand';
import { cloud, isCloudSlot, type CloudMeta, type CloudSlot } from './cloud';
import { serializeSave, type GameState } from './game';
import type { SaveStore, SlotId } from './saves';

// Keeps the cloud copy of the player's saves up to date while they are signed in, and tells the screens what it knows. A save is sent
// a few seconds after the last change (the game saves itself on every move), when the page is put away, and when the player asks.
// What is in the cloud is never put over what is on the device without the player saying so: see the restore button in CloudSaves.

export interface CloudState {
  email: string | null;
  syncing: boolean;
  /** When a slot was last sent. */
  syncedAt: number | null;
  /** The last send did not get through. */
  failed: boolean;
  /** What the cloud holds, as last read; null before it has been. */
  found: CloudMeta[] | null;
}

export const useCloud = create<CloudState>(() => ({ email: cloud.session()?.email ?? null, syncing: false, syncedAt: null, failed: false, found: null }));
const set = (patch: Partial<CloudState>) => useCloud.setState(patch);

/** Seconds to wait after a save for another, so that a run of moves is sent once. */
export const PUSH_DELAY_MS = 6000;

const pending = new Map<CloudSlot, GameState>();
const timers = new Map<CloudSlot, ReturnType<typeof setTimeout>>();

const outgoing = (g: GameState) => ({
  game: g.id, name: g.name, week: g.campaign.week, totalWeeks: g.campaign.totalWeeks, scenario: g.campaign.scenario, player: g.campaign.player, savedAt: g.updatedAt, text: serializeSave(g),
});

/** Sends one slot now. */
export async function pushSlot(slot: CloudSlot, game: GameState): Promise<boolean> {
  if (!cloud.session()) return false;
  set({ syncing: true });
  const result = await cloud.push(slot, outgoing(game));
  set({ syncing: false, ...(result === 'ok' ? { syncedAt: Date.now(), failed: false } : { failed: true }), email: cloud.session()?.email ?? null });
  return result === 'ok';
}

/** Sends whatever is waiting. */
export async function flush(): Promise<void> {
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
  const waiting = [...pending];
  pending.clear();
  for (const [slot, game] of waiting) await pushSlot(slot, game);
}

/** A slot has just been saved on the device: the cloud follows, a little later. */
export function queue(slot: SlotId, game: GameState): void {
  if (!cloud.enabled || !isCloudSlot(slot) || !cloud.session()) return;
  pending.set(slot, game);
  clearTimeout(timers.get(slot));
  timers.set(slot, setTimeout(() => { timers.delete(slot); const g = pending.get(slot); pending.delete(slot); if (g) void pushSlot(slot, g); }, PUSH_DELAY_MS));
}

/** Reads what the cloud holds. */
export async function refresh(): Promise<CloudMeta[] | null> {
  if (!cloud.session()) { set({ found: null, email: null }); return null; }
  const found = await cloud.list();
  set({ email: cloud.session()?.email ?? null, ...(found ? { found } : {}) });
  return found;
}

/** The cloud's copy of a slot, if it is newer than what the device has (or the device has none). */
export function newerInCloud(found: CloudMeta[] | null, slot: CloudSlot, localUpdatedAt: number | null): CloudMeta | null {
  const meta = found?.find((m) => m.slot === slot);
  return meta && (localUpdatedAt === null || meta.savedAt > localUpdatedAt + 1000) ? meta : null;
}

export async function signOut(): Promise<void> {
  await flush();
  await cloud.signOut();
  set({ email: null, found: null, failed: false, syncedAt: null });
}

/** Connects the device's saves to the cloud: every save that is written is followed, and the page being put away sends what waits. */
export function attachCloud(store: SaveStore): void {
  if (!cloud.enabled) return;
  store.onSave = queue;
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void flush(); });
  if (cloud.session()) void refresh();
}
