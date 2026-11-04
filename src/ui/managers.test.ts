import { describe, expect, it } from 'vitest';
import { ROLE_IDS } from '../sim/campaign/teamTypes';
import { STAFF_NAMES } from '../sim/campaign/staff';
import { ADVISER_LOOK, ROLE_ACCENT, STAFF_LOOKS, staffPortrait } from './faces';
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
