import type { World } from '../election';
import { Rng } from '../rng';
import { applyDefaultLifts, candidatesWeek, makeDefaults, makeKeySeats } from './candidates';
import { endorsersWeek } from './endorsers';
import { mediaWeek, usualCoverage } from './media';
import { makeLeader } from './perks';
import { spendingWeek } from './spending';
import { makePool, staffWeek } from './staff';
import { ENDORSER_IDS, ROLE_IDS, type BackstoryId, type Campaign, type Team } from './types';
import { chiefsWeek } from './chiefs';

/** The team's dice are kept apart from the rest of the game's, so adding people does not change how anything else falls. */
const SALT = 0x7ea31c5d;

/** A team with nobody in it yet: the leader, people who could be hired, and the press as it usually is. */
export function emptyTeam(c: Omit<Campaign, 'team'>, backstory: BackstoryId | null = null): Team {
  return {
    leader: makeLeader(backstory, c.player),
    staff: ROLE_IDS.map(() => null),
    pool: makePool(new Rng(c.seed ^ SALT)),
    keySeats: [],
    endorsers: ENDORSER_IDS.map(() => null),
    media: usualCoverage(c as Campaign),
    troopers: 0,
  };
}

/** The seats that need a candidate in this campaign, and who wants to stand in each. The same every time it is asked. */
const keySeatsFor = (world: World, c: Campaign) => makeKeySeats(world, c, new Rng((c.seed ^ SALT) + (c.career?.term ?? 0) * 7919));

/** The party's own choice of candidate in every other seat it stands in. The same every time it is asked. */
const defaultsFor = (world: World, c: Campaign) => makeDefaults(world, c, new Rng((c.seed ^ SALT ^ 0xde7a) + (c.career?.term ?? 0) * 104729));

/** The team for a game saved before there was one: nobody hired, and candidates still to be chosen if a campaign is under way. */
export function teamFor(world: World, c: Omit<Campaign, 'team'>): Team {
  const team = emptyTeam(c);
  if (c.phase === 'campaign') { team.keySeats = keySeatsFor(world, { ...c, team }); team.defaults = defaultsFor(world, { ...c, team }); }
  return team;
}

/**
 * Readies the team for a campaign: the closest seats need candidates, no
 * endorser has yet declared, and nobody has spent anything. Called when a
 * single contest begins, and whenever a career reaches an election.
 */
export function openCampaign(world: World, c: Campaign): void {
  c.team.keySeats = keySeatsFor(world, c);
  c.team.defaults = defaultsFor(world, c);
  applyDefaultLifts(world, c);
  delete c.team.leaderSeat;
  c.team.endorsers = ENDORSER_IDS.map(() => null);
  c.team.troopers = 0;
  for (const pc of c.parties) if (pc) { pc.spent = 0; pc.fined = false; }
}

/** The election is over: candidates, endorsements and paid accounts belong to the campaign that has ended. */
export function closeCampaign(c: Campaign): void {
  c.team.keySeats = [];
  delete c.team.defaults;
  delete c.team.leaderSeat;
  c.team.endorsers = ENDORSER_IDS.map(() => null);
  c.team.troopers = 0;
  c.team.media = usualCoverage(c);
}

/** One week of everything around the leader in a campaign: wages, pasts coming out, endorsers, the press, and the limit on spending. */
export function teamWeek(world: World, c: Campaign): void {
  const rng = new Rng((c.rng ^ SALT) + c.week);
  staffWeek(world, c, rng);
  // The chiefs have dice of their own, so that meeting them changes nothing else.
  chiefsWeek(world, c, new Rng((c.rng ^ 0xc41ef5) + c.week));
  candidatesWeek(c, rng);
  endorsersWeek(world, c, rng);
  mediaWeek(world, c, rng);
  spendingWeek(world, c, rng);
}
