import { describe, expect, it } from 'vitest';
import { nearSlider, SLIDER_REACH } from './TouchGestures';

// A slider 354 wide and 16 high, with its top left at (18, 414), as on a phone.
const slider = { left: 18, right: 372, top: 414, bottom: 430 };

describe('nearSlider', () => {
  it('counts a touch on the slider', () => {
    expect(nearSlider(100, 422, [slider])).toBe(true);
  });

  it('counts a touch that lands beside it, above or below, where a thumb misses the thin track', () => {
    expect(nearSlider(100, 422 + 26, [slider])).toBe(true);
    expect(nearSlider(100, 422 - 40, [slider])).toBe(true);
    expect(nearSlider(18 - SLIDER_REACH.x, 422, [slider])).toBe(true);
  });

  it('leaves a touch far from every slider to the swipe', () => {
    expect(nearSlider(100, 430 + SLIDER_REACH.y + 1, [slider])).toBe(false);
    expect(nearSlider(100, 414 - SLIDER_REACH.y - 1, [slider])).toBe(false);
    expect(nearSlider(100, 422, [])).toBe(false);
  });
});
