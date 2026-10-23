import { loadScenario } from '../data/world';
import { cloud, type CloudSlot } from '../state/cloud';
import { parseSave, scenarioIn } from '../state/game';
import type { SlotId } from '../state/saves';
import { saveStore, useStore } from '../state/store';

/** Takes a game back from the cloud and opens it. A slot of the player's own is written to the same slot on the device as well. */
export async function restoreFromCloud(slot: CloudSlot): Promise<boolean> {
  const text = await cloud.pull(slot);
  if (!text) return false;
  // A game played in a state needs that state's results before it can be checked.
  await loadScenario(scenarioIn(text) ?? '').catch(() => {});
  const parsed = parseSave(text);
  if (!parsed.ok) return false;
  if (slot !== 'prev') saveStore.save(slot as SlotId, parsed.state);
  useStore.getState().loadGame(parsed.state);
  return true;
}
