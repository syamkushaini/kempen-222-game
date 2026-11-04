import { describe, expect, it } from 'vitest';
import { ROLE_IDS } from '../sim/campaign/teamTypes';
import { STAFF_NAMES } from '../sim/campaign/staff';
import { PARTIES } from '../data/parties';
import { PARTY_IDS } from '../sim/types';
import { ADVISER_LOOK, MINISTER_LOOKS, ROLE_ACCENT, STAFF_LOOKS, leaderLook, ministerLook, staffPortrait } from './faces';
import { canDraw3D } from './Manager';

describe('the managers drawn in 3D', () => {
  it('have a look for every person who may be hired, and a colour for every job', () => {
    expect(STAFF_LOOKS).toHaveLength(STAFF_NAMES.length);
    for (const role of ROLE_IDS) expect(ROLE_ACCENT[role]).toMatch(/^#[0-9a-f]{6}$/i);
    expect(ADVISER_LOOK.glasses).toBe(true);
  });
  it('keep a flat picture for where 3D cannot be drawn', () => {
    expect(canDraw3D()).toBe(false); // the tests run without a browser's graphics
    for (let i = 0; i < STAFF_NAMES.length; i++) expect(staffPortrait(i, ROLE_IDS[Math.floor(i / 3)])).toMatch(/^data:image\/svg\+xml,/);
  });
});

describe('the ministers and party leaders drawn in 3D', () => {
  it('give every party leader their party colour, and leave the pooled independents out', () => {
    PARTY_IDS.forEach((id, p) => {
      const l = leaderLook(p);
      if (id === 'oth') expect(l).toBeNull();
      else { expect(l).not.toBeNull(); expect(l!.accent).toBe(PARTIES[id].color); }
    });
  });
  it('give every minister a look, in the colour of their party, wrapping round the list', () => {
    expect(MINISTER_LOOKS.length).toBeGreaterThan(40);
    expect(ministerLook(3, 0).look).toBe(MINISTER_LOOKS[3]);
    expect(ministerLook(MINISTER_LOOKS.length + 2, 1).look).toBe(MINISTER_LOOKS[2]);
    expect(ministerLook(0, 1).accent).toBe(PARTIES[PARTY_IDS[1]].color);
  });
});
