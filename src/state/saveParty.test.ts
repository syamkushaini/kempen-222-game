import { describe, expect, it } from 'vitest';
import '../data/allStates';
import { dunByElections } from '../data/world';
import { FOUNDING_SLOT } from '../sim/campaign/founding';
import { PARTY_IDS } from '../sim/types';
import { saveLine } from '../ui/SavesTab';
import { DEFAULT_EMBLEMS, PARTY_COLORS, makeIdentity } from './identity';
import { AUTO_SLOT, SaveStore } from './saves';
import { useStore } from './store';

const memory = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) }; };

const t = ((k: string, p?: Record<string, unknown>) => `${k}${p ? JSON.stringify(p) : ''}`) as never;

describe('the summary of a saved game', () => {
  it('names the party the player made, not the party slot underneath', () => {
    const identity = makeIdentity({ name: 'Harapan Rakyat', short: 'HR', color: PARTY_COLORS[2], emblem: DEFAULT_EMBLEMS.genba, leader: 'Aina Rahman', look: 1 })!;
    useStore.getState().quitToTitle();
    useStore.getState().startCampaign({ name: 'Aina', scenario: dunByElections('selangor')[0], player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: null, identity, seed: 3, founded: true });
    const saveStore = new SaveStore(memory());
    expect(saveStore.save(AUTO_SLOT, useStore.getState().game!)).toBe(true);
    const meta = saveStore.meta(AUTO_SLOT)!;
    expect(meta.party).toBe('Harapan Rakyat');
    const line = saveLine(t, meta);
    expect(line).toContain('Harapan Rakyat');
    expect(line.toLowerCase()).not.toContain('genba');
  });
});
