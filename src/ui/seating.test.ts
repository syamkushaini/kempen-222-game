import { describe, expect, it } from 'vitest';
import { getWorld } from '../data/world';
import { startCareer } from '../sim/campaign/career';
import { houseTally } from '../sim/campaign/contests';
import { pledged } from '../sim/campaign/formation';
import { confidenceCount, whipCount } from '../sim/campaign/govern';
import { PLEDGES } from '../sim/campaign/policy';
import { newCampaign } from '../sim/campaign/turn';
import { PLEDGE_IDS } from '../sim/campaign/types';
import { PARTY_IDS } from '../sim/types';
import { arrange, sideCount } from './hemicycle';
import { divisionSeating, houseSeating, talksFocus, talksSeating } from './seating';

const PS = PARTY_IDS.indexOf('ps');

describe('seating the House', () => {
  const world = getWorld('career')!;
  const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 3 });

  it('seats every member once, with the government and its loyal partners on the left', () => {
    const blocs = houseSeating(world, c);
    expect(arrange(blocs)).toHaveLength(world.seats.length);
    expect(blocs[0]).toMatchObject({ party: c.career!.government.pm, side: 'left' });
    // The left of the chamber is what the confidence count says the government commands.
    expect(sideCount(blocs, 'left')).toBe(confidenceCount(world, c));
    const tally = houseTally(world, c);
    for (const [p, n] of tally.entries()) expect(blocs.filter((b) => b.party === p).reduce((a, b) => a + b.seats, 0)).toBe(n);
  });

  it('marks a division as the whips count it', () => {
    const bill = PLEDGE_IDS.find((id) => PLEDGES[id])!;
    const whip = whipCount(world, c, bill, c.career!.government.pm);
    const blocs = divisionSeating(world, c, whip);
    expect(arrange(blocs)).toHaveLength(world.seats.length);
    const count = (v: string) => blocs.filter((b) => b.vote === v).reduce((a, b) => a + b.seats, 0);
    expect(count('aye')).toBe(whip.yes);
    expect(count('waver')).toBe(whip.wavering);
    expect(count('aye') + count('no') + count('waver')).toBe(world.seats.length);
  });
});

describe('seating the talks', () => {
  const world = getWorld('hung')!;
  const c = newCampaign(world, { player: PS, difficulty: 'normal', seed: 3, backstory: null });
  const f = c.formation!;

  it('puts those signed for the player on the left and for the main rival on the right', () => {
    const { focus, rival } = talksFocus(f, PS);
    const blocs = talksSeating(f, PS);
    expect(arrange(blocs)).toHaveLength(world.seats.length);
    expect(sideCount(blocs, 'left')).toBe(pledged(f, focus));
    if (rival !== null) expect(sideCount(blocs, 'right')).toBe(pledged(f, rival));
    expect(blocs[0].party).toBe(focus);
  });

  it('moves a party across when it signs, without changing the size of the House', () => {
    const { focus } = talksFocus(f, PS);
    const free = f.pledge.findIndex((to, p) => to === null && f.seats[p] > 0 && PARTY_IDS[p] !== 'oth');
    if (free < 0) return;
    const before = sideCount(talksSeating(f, PS), 'left');
    const signed = { ...f, pledge: f.pledge.map((to, p) => (p === free ? focus : to)) };
    const after = talksSeating(signed, PS);
    expect(sideCount(after, 'left')).toBe(before + f.seats[free]);
    expect(arrange(after)).toHaveLength(world.seats.length);
  });
});
