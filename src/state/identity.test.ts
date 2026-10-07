import { describe, expect, it } from 'vitest';
import { DEFAULT_EMBLEMS, isPicture, isValidIdentity, makeIdentity, PARTY_COLORS, PICTURE_MAX } from './identity';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const raw = { name: 'Gerakan Rakyat Baru', short: 'GRB', color: PARTY_COLORS[0], emblem: DEFAULT_EMBLEMS.genba, leader: 'Sang Pengasas', look: 0 };

describe('pictures a player uploads', () => {
  it('takes a small JPEG, PNG or WebP and nothing else', () => {
    expect(isPicture(PNG)).toBe(true);
    expect(isPicture('data:image/jpeg;base64,/9j/4AAQSkZJRg==')).toBe(true);
    expect(isPicture('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=')).toBe(false);
    expect(isPicture('data:text/html;base64,PHNjcmlwdD4=')).toBe(false);
    expect(isPicture('https://example.com/face.png')).toBe(false);
    expect(isPicture('javascript:alert(1)')).toBe(false);
    expect(isPicture(`data:image/png;base64,${'A'.repeat(PICTURE_MAX)}`)).toBe(false);
    expect(isPicture(42)).toBe(false);
  });

  it('keeps a photo and a flag on the party, and drops them when there are none', () => {
    expect(makeIdentity({ ...raw, photo: PNG, flag: PNG })).toMatchObject({ photo: PNG, flag: PNG });
    const plain = makeIdentity(raw)!;
    expect('photo' in plain).toBe(false);
    expect('flag' in plain).toBe(false);
    expect(makeIdentity({ ...raw, photo: undefined, flag: undefined })).toEqual(plain);
  });

  it('refuses a party whose picture is not one the game made', () => {
    expect(makeIdentity({ ...raw, photo: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=' })).toBeNull();
    expect(makeIdentity({ ...raw, flag: 'https://example.com/flag.png' })).toBeNull();
  });

  it('reads saves with and without pictures, and refuses a save with a bad one', () => {
    expect(isValidIdentity(makeIdentity(raw))).toBe(true);
    expect(isValidIdentity(makeIdentity({ ...raw, photo: PNG }))).toBe(true);
    expect(isValidIdentity({ ...makeIdentity(raw)!, photo: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=' })).toBe(false);
    expect(isValidIdentity({ ...makeIdentity(raw)!, flag: 7 })).toBe(false);
  });
});
