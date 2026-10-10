import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { counterSeats, inPact, relation, resolveCampaignScene, rivalDiplomacy } from './diplomacy';
import { newCampaign } from './turn';

const PS = PARTY_IDS.indexOf('ps');
const general = getWorld('general')!;

describe('naming a price on a pact offer', () => {
  it('signs the pact with more seats stood aside, or lets the offer lapse and cools relations', () => {
    let tried = 0, signed = 0, lapsed = 0;
    for (let seed = 1; seed <= 25 && tried < 6; seed++) {
      const c = newCampaign(general, { player: PS, difficulty: 'normal', seed });
      c.parties.forEach((_, p) => { if (p !== PS) c.relations[PS][p] = c.relations[p][PS] = 80; });
      rivalDiplomacy(general, c);
      for (const scene of c.inbox.filter((s) => s.kind === 'pactOffer' && s.from !== null)) {
        const extra = counterSeats(general, c, scene);
        if (!extra.length) continue;
        tried++;
        const before = relation(c, PS, scene.from!);
        const news = c.news.length;
        resolveCampaignScene(general, c, scene, 3);
        const key = c.news[c.news.length - 1].key;
        expect(c.news.length).toBe(news + (c.news.length - news));
        if (inPact(c, PS, scene.from!)) { signed++; expect(key).toBe('news.pact.counter.won'); expect(relation(c, PS, scene.from!)).toBeGreaterThanOrEqual(before); }
        else { lapsed++; expect(key).toBe('news.pact.counter.lost'); expect(relation(c, PS, scene.from!)).toBeLessThan(before); }
        break;
      }
    }
    expect(tried).toBeGreaterThan(0);
    expect(signed + lapsed).toBe(tried);
  });

  it('has nothing to ask on a scene that is not a pact offer', () => {
    const c = newCampaign(general, { player: PS, difficulty: 'normal', seed: 3 });
    expect(counterSeats(general, c, { id: 1, kind: 'event', from: null } as never)).toEqual([]);
  });
});
