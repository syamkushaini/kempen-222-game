import { lastElection, type World } from './election';
import { BLOC_IDS, N_PARTIES, type BlocId, type SeatKind } from './types';

// What a contest is fought over, before it is chosen: who the voters are, where they live, and how the last election went. All from the
// game's own data (the registered voters in each seat, the groups they belong to, and the last result), so these are the game's
// estimates, not census figures.

export interface Profile {
  seats: number;
  voters: number;
  /** Share of the registered voters who voted last time. */
  turnout: number;
  /** Share of the voters living in urban, semi-urban and rural seats. */
  places: Record<SeatKind, number>;
  /** The voter groups, largest first, with their share of all voters. */
  groups: { id: BlocId; share: number }[];
  /** The parties that won seats last time, most seats first. */
  leaders: { party: number; seats: number }[];
  /** Seats won by less than five points, and by more than twenty. */
  marginal: number;
  safe: number;
  largest: { name: string; voters: number };
  smallest: { name: string; voters: number };
  /** The share of the seats in each of the country's regions, when there is more than one. */
  regions: { region: string; seats: number }[];
}

export function profileOf(world: World): Profile {
  const total = world.totalElectorate || 1;
  const places: Record<SeatKind, number> = { urban: 0, semi: 0, rural: 0 };
  const groups = new Array<number>(BLOC_IDS.length).fill(0);
  for (const s of world.seats) {
    places[s.kind] += s.electorate / total;
    s.blocs.forEach((share, b) => { groups[b] += (share * s.electorate) / total; });
  }
  const last = lastElection(world);
  const bySize = [...world.seats].sort((a, b) => b.electorate - a.electorate);
  const regions = new Map<string, number>();
  for (const s of world.seats) regions.set(s.region, (regions.get(s.region) ?? 0) + 1);
  return {
    seats: world.seats.length,
    voters: world.totalElectorate,
    turnout: last.turnout,
    places,
    groups: BLOC_IDS.map((id, b) => ({ id, share: groups[b] })).sort((a, b) => b.share - a.share),
    leaders: Array.from({ length: N_PARTIES }, (_, party) => ({ party, seats: last.tally[party] ?? 0 })).filter((x) => x.seats > 0).sort((a, b) => b.seats - a.seats),
    marginal: last.seats.filter((x) => x.margin < 0.05).length,
    safe: last.seats.filter((x) => x.margin > 0.2).length,
    largest: { name: bySize[0].name, voters: bySize[0].electorate },
    smallest: { name: bySize[bySize.length - 1].name, voters: bySize[bySize.length - 1].electorate },
    regions: regions.size > 1 ? [...regions].map(([region, seats]) => ({ region, seats })) : [],
  };
}
