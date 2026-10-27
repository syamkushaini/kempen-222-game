// How far a Legacy Points total has carried the player, from a first Bilik Gerakan with a
// handful of seats to a coalition fought everywhere. Purely a reading of a point total: it
// does not touch any save or profile itself (see src/state/profile.ts for that).

export interface Tier {
  id: string;
  label: string;
  minPoints: number;
  /** How many seats a player at this tier may contest at once. */
  maxContest: number;
}

export const FEDERAL_SEATS = 222;

export const TIERS: Tier[] = [
  { id: 'activist', label: 'Grassroots Activist', minPoints: 0, maxContest: 1 },
  { id: 'organiser', label: 'Branch Organiser', minPoints: 20, maxContest: 10 },
  { id: 'statewide', label: 'State Campaign Chief', minPoints: 60, maxContest: 40 },
  { id: 'national', label: 'National Strategist', minPoints: 150, maxContest: 120 },
  { id: 'leader', label: 'Coalition Leader', minPoints: 300, maxContest: FEDERAL_SEATS },
];

/** The highest tier a point total has reached. */
export function tierForPoints(points: number): Tier {
  let best = TIERS[0];
  for (const t of TIERS) if (points >= t.minPoints) best = t;
  return best;
}

/** The tier after this one, or null at the top of the ladder. */
export function nextTier(points: number): Tier | null {
  const i = TIERS.indexOf(tierForPoints(points));
  return TIERS[i + 1] ?? null;
}

/** How many more points are needed to reach the next tier, or null at the top. */
export function pointsToNext(points: number): number | null {
  const next = nextTier(points);
  return next ? Math.max(0, next.minPoints - points) : null;
}
