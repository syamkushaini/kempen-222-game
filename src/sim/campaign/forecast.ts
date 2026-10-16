import { START_DEFENCE, defenceTargets, readinessRate } from './defence';
import { START_PESTEL, pestelTargets } from './pestel';
import { stanceOf, type Notch, type StanceId } from './stances';
import type { Career } from './types';

// What the sliders show before they are used: where a meter is heading with a slider at a setting, and the line it would follow over the next
// weeks. The same drift the weeks themselves use (a meter closes a share of the gap to its target each week), without the week's small noise,
// so it is the line a meter would follow, not a promise.

export const FORECAST_WEEKS = 52;
/** The share of the gap to its target a meter closes in a week (see pestelWeek and defenceWeek). */
const DRIFT = 0.015;

/** A meter's value as it stands, on its own scale (0 to 100, so that for the armed forces' influence more is a greater say). */
export const meterNow = (k: Career, id: StanceId): number => (id === 'readiness' || id === 'influence' ? (k.defence ?? START_DEFENCE)[id] : (k.pestel ?? START_PESTEL)[id]);

/** Where a meter is heading with its slider at a notch and the rest as they are. */
export function meterTarget(k: Career, id: StanceId, notch: Notch): number {
  const probe: Career = { ...k, stance: { ...k.stance, [id]: notch } };
  return id === 'readiness' || id === 'influence' ? defenceTargets(probe)[id] : pestelTargets(probe)[id];
}

/** The meter week by week from now, with its slider at a notch: index 0 is now. */
export function forecast(k: Career, id: StanceId, notch: Notch = stanceOf(k, id), weeks = FORECAST_WEEKS): number[] {
  const target = meterTarget(k, id, notch);
  const out = [meterNow(k, id)];
  for (let w = 0; w < weeks; w++) {
    const v = out[out.length - 1];
    // A capable defence minister speeds readiness up and slows its fall.
    const rate = id === 'readiness' ? readinessRate(k, target > v) : DRIFT;
    out.push(v + (target - v) * rate);
  }
  return out;
}
