import { houseTally } from '../sim/campaign/contests';
import { pledged } from '../sim/campaign/formation';
import { loyalty, type Whip } from '../sim/campaign/govern';
import type { Campaign, Formation } from '../sim/campaign/types';
import type { World } from '../sim/election';
import { PARTY_IDS } from '../sim/types';
import type { Bloc, Side } from './hemicycle';

// Who sits on which side of the chamber, worked out from the game's own state: the House between elections, the talks
// after one, and a division on a bill. Nothing here decides anything; it only reads what the simulation has decided.

const OTH = PARTY_IDS.indexOf('oth');

/** The House as it stands: the government and the partners still behind it on the left, wavering partners between, the rest on the right. */
export function houseSeating(world: World, c: Campaign): Bloc[] {
  const g = c.career!.government;
  const seats = houseTally(world, c);
  const out: Bloc[] = [];
  const add = (party: number, n: number, side: Side) => { if (n > 0) out.push({ party, seats: n, side }); };
  add(g.pm, seats[g.pm], 'left');
  const partners = g.partners.filter((p) => p !== g.pm && p !== OTH).sort((a, b) => seats[b] - seats[a]);
  for (const p of partners) add(p, seats[p], loyalty(c, p) > 0 ? 'left' : 'middle');
  // Half the independents vote with whoever governs, as the confidence count has it.
  const friendly = Math.floor(seats[OTH] / 2);
  add(OTH, friendly, 'left');
  const others = seats.map((n, p) => ({ n, p })).filter((x) => x.p !== g.pm && x.p !== OTH && !g.partners.includes(x.p) && x.n > 0).sort((a, b) => b.n - a.n);
  for (const x of others) add(x.p, x.n, 'right');
  add(OTH, seats[OTH] - friendly, 'right');
  return out;
}

/** The same House in a division: each party's seats marked with how the whips expect it to vote. */
export function divisionSeating(world: World, c: Campaign, whip: Whip): Bloc[] {
  const seats = houseTally(world, c);
  // The independents split: so many for, the rest against.
  let ayes = Math.min(seats[OTH], Math.max(0, whip.yes - seats.reduce((a, n, p) => a + (p !== OTH && whip.votes[p] === 'yes' ? n : 0), 0)));
  return houseSeating(world, c).flatMap((b): Bloc[] => {
    if (b.party !== OTH) return [{ ...b, vote: whip.votes[b.party] === 'yes' ? 'aye' : whip.votes[b.party] === 'wavering' ? 'waver' : 'no' }];
    const yes = Math.min(b.seats, ayes);
    ayes -= yes;
    return [{ ...b, seats: yes, vote: 'aye' as const }, { ...b, seats: b.seats - yes, vote: 'no' as const }].filter((x) => x.seats > 0);
  });
}

/** Whose bid for government the talks are shown from: the one that came off, else the player's own, else the strongest. */
export function talksFocus(f: Formation, me: number): { focus: number; rival: number | null } {
  if (f.outcome) return { focus: f.outcome.pm, rival: null };
  const ranked = [...f.claimants].sort((a, b) => pledged(f, b) - pledged(f, a));
  const focus = f.claimants.includes(me) ? me : ranked[0];
  return { focus, rival: ranked.find((k) => k !== focus) ?? null };
}

/** The talks: those signed for one would-be head of government on the left, those signed for their main rival on the right, the rest between. */
export function talksSeating(f: Formation, me: number): Bloc[] {
  const { focus, rival } = talksFocus(f, me);
  const sideOf = (to: number | null): Side => (to === focus ? 'left' : f.outcome || (rival !== null && to === rival) ? 'right' : 'middle');
  const out: Bloc[] = [];
  const parties = f.seats.map((n, p) => ({ n, p })).filter((x) => x.p !== OTH && x.n > 0);
  // The one bidding sits at the very end of their own side, the biggest backers next to them.
  const rank = (x: { n: number; p: number }) => (x.p === focus || x.p === rival ? Infinity : x.n);
  for (const side of ['left', 'middle', 'right'] as const) {
    for (const x of parties.filter((x) => sideOf(f.pledge[x.p]) === side).sort((a, b) => rank(b) - rank(a))) out.push({ party: x.p, seats: x.n, side });
    const indep = f.indep.filter((i) => sideOf(i.pledge) === side).length;
    if (indep > 0) out.push({ party: OTH, seats: indep, side });
  }
  return out;
}
