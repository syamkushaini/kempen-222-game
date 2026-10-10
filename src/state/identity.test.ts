import { describe, expect, it } from 'vitest';
import { DEFAULT_EMBLEMS, fitColor, isOwnColor, isPicture, isValidIdentity, makeIdentity, PARTY_COLORS, PICTURE_MAX } from './identity';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const raw = { name: 'Gerakan Rakyat Baru', short: 'GRB', color: PARTY_COLORS[0], emblem: DEFAULT_EMBLEMS.genba, leader: 'Sang Pengasas', look: 0 };

describe('the colours of a party', () => {
  it('offers thirty, all different and all readable, the first ten as they always were', () => {
    expect(PARTY_COLORS).toHaveLength(30);
    expect(new Set(PARTY_COLORS).size).toBe(30);
    expect(PARTY_COLORS.slice(0, 3)).toEqual(['#d9483f', '#3558b8', '#2e9b6a']);
    for (const c of PARTY_COLORS) expect(isOwnColor(c), c).toBe(true);
  });

  it('takes any readable colour of the player’s own, and fits one that is not', () => {
    expect(makeIdentity({ ...raw, color: '#12a4b6' })?.color).toBe('#12a4b6');
    expect(makeIdentity({ ...raw, color: '#ffffff' })).toBeNull();
    expect(makeIdentity({ ...raw, color: '#000000' })).toBeNull();
    expect(makeIdentity({ ...raw, color: 'red' })).toBeNull();
    for (const c of ['#ffffff', '#fffde0', '#000000', '#010101', 'nonsense']) expect(isOwnColor(fitColor(c)), c).toBe(true);
    expect(fitColor('#12A4B6')).toBe('#12a4b6');
    expect(isValidIdentity(makeIdentity({ ...raw, color: '#12a4b6' }))).toBe(true);
  });
});

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
