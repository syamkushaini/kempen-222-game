import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import type { World } from '../election';
import type { Campaign, EndingKind } from './types';
import { startCareer, skipAhead, answerEvent, nextTerm } from './career';
import { autoPlayWeek, endWeek, closeNight, electionResult } from './turn';
import { endDay, makeOffer, emptyOffer, mood, blocs, resolveFormationScene } from './formation';
import type { Choice, Effect } from './events';
import { EVENTS, gambleChance } from './events';
import { standingOf } from './standing';

const PS = PARTY_IDS.indexOf('ps');
const BP = PARTY_IDS.indexOf('bp');
const PT = PARTY_IDS.indexOf('pt');

// ---------- choice scoring ----------

/** Where the player stands: affects how much stability vs unity matters. */
type Standing = 'pm' | 'gov' | 'opp';

/** Score one effect: how good/bad it is for the player's survival. Higher = better.
 *  `unityNow` and `stabilityNow` are the current values, used for threshold bonuses
 *  when the player is in danger and must prioritise survival. */
function scoreEffect(e: Effect, standing: Standing, unityNow: number, stabilityNow: number): number {
  switch (e.t) {
    case 'unity':
      // Unity below 12 = ousted. Positive is very good, negative is very bad.
      // Below 20, avoiding unity loss becomes the top priority.
      const uMult = unityNow < 20 ? 5 : 1;
      return e.n > 0 ? e.n * 2 * uMult : e.n * 3 * uMult;
    case 'stability':
      // Government stability below 30 risks mid-term collapse.
      // PMs and partners depend on stability for government survival; opposition does not.
      const mult = standing === 'opp' ? 0.3 : standing === 'gov' ? 1 : 1.5;
      // Below 30, stability becomes the top priority for governing parties.
      const sMult = stabilityNow < 30 ? 3 : 1;
      return e.n > 0 ? e.n * mult * sMult : e.n * mult * 1.5 * sMult;
    case 'cred':
      return e.n > 0 ? e.n * 0.5 : e.n * 0.8;
    case 'trust':
      return e.n > 0 ? e.n * 0.5 : e.n * 0.8;
    case 'funds':
      // Money at general-election scale; a point of funds is worth little compared to unity.
      return e.n * 0.001;
    case 'debt':
      // Debt above 75% brings a downgrade and drags on growth. Positive (more debt) is bad.
      return e.n > 0 ? -e.n * 0.5 : -e.n * 0.3;
    case 'graft':
      return -e.n * 0.5; // dubious choices are avoided, clean ones preferred
    case 'end':
      return -2000; // career end: avoid at all costs
    case 'falls':
      return -1000; // government falls: very bad
    case 'bankrupt':
      return -2000; // bankruptcy: government falls
    case 'austerity':
      return -0.5; // forced tight budget
    case 'machinery':
      return e.n * 0.1;
    case 'dossier':
      return e.n * -0.2; // more dossier = more exposure risk
    case 'public':
      return e.n * 0.001;
    case 'relation':
      return e.n * 0.1;
    default:
      return 0;
  }
}

/** Score a whole choice: sum of effect scores. For gambles, use expected value. */
function scoreChoice(c: Campaign, ch: Choice, standing: Standing, unityNow: number, stabilityNow: number): number {
  const base = ch.effects.reduce((a, e) => a + scoreEffect(e, standing, unityNow, stabilityNow), 0);
  if (!ch.gamble) return base;
  const chance = typeof ch.gamble.chance === 'number' ? ch.gamble.chance : gambleChance(c, ch.gamble.chance);
  const win = ch.gamble.win.reduce((a, e) => a + scoreEffect(e, standing, unityNow, stabilityNow), 0);
  const lose = ch.gamble.lose.reduce((a, e) => a + scoreEffect(e, standing, unityNow, stabilityNow), 0);
  return chance * win + (1 - chance) * lose;
}

/** Answer every scene waiting on the desk, picking the choice with the best score. */
function answerInbox(world: World, c: Campaign, player: number): void {
  while (c.inbox.length > 0) {
    const scene = c.inbox[0];
    const pc = c.parties[player];
    if (!pc) { c.inbox.shift(); continue; }
    // PM and partner depend on government stability; opposition does not.
    const standingRaw = c.career ? standingOf(c) : 'opp';
    const standing = standingRaw === 'pm' ? 'pm' : standingRaw === 'gov' ? 'gov' : 'opp';
    if (scene.kind === 'unityAdvice') {
      resolveFormationScene(c, scene, 0);
    } else {
      const def = scene.event ? EVENTS[scene.event] : undefined;
      const choices = def ? def.choices : [];
      let bestChoice = 0;
      let bestScore = -Infinity;
      const unityNow = pc.unity;
      const stabilityNow = c.career ? c.career.government.stability : 60;
      for (let i = 0; i < choices.length; i++) {
        const s = scoreChoice(c, choices[i], standing, unityNow, stabilityNow);
        if (s > bestScore) { bestScore = s; bestChoice = i; }
      }
      answerEvent(world, c, scene, bestChoice);
    }
    c.inbox.shift();
  }
}

// ---------- campaign / formation ----------

function runCampaign(world: World, c: Campaign): void {
  while (c.phase === 'campaign') {
    autoPlayWeek(world, c);
    endWeek(world, c);
  }
  if (c.phase === 'night') closeNight(world, c);
}

function runFormation(world: World, c: Campaign): void {
  let days = 0;
  while (c.phase === 'formation' && days < 40) {
    days++;
    if (c.inbox.length > 0) {
      answerInbox(world, c, c.player);
      continue;
    }
    const f = c.formation;
    if (f && f.claimants.includes(c.player) && f.meetings > 0 && !f.outcome) {
      for (const bloc of blocs(f)) {
        if (bloc === c.player || f.seats[bloc] <= 0) continue;
        const reply = mood(world, c, bloc, emptyOffer());
        if (reply === 'tempted' || reply === 'accept') {
          const fair = Math.max(1, Math.round(28 * f.seats[bloc] / 112));
          makeOffer(world, c, bloc, { ...emptyOffer(), posts: fair, cash: 0 });
        }
      }
    }
    endDay(world, c);
  }
}

interface CareerResult {
  terms: number;
  ended: boolean;
  ending: EndingKind | null;
  seatsByTerm: number[];
  pmTerms: number;
  credibility: number;
  unity: number;
  debt: number;
  elections: number;
  victories: number;
  falls: number;
  toppled: number;
}

/** Simulate one full career, auto-playing every week. */
function runCareer(world: World, player: number, seed: number): CareerResult {
  const c = startCareer(world, { player, difficulty: 'normal', seed, backstory: null });
  const seatsByTerm: number[] = [];
  let pmTerms = 0;

  while (!c.career?.ending && seatsByTerm.length < 6) {
    // ---- Run the term (252 weeks) ----
    while (c.phase === 'term' && !c.career?.ending) {
      if (c.inbox.length > 0) {
        answerInbox(world, c, player);
      } else {
        const ran = skipAhead(world, c, 52);
        if (ran === 0 && c.phase === 'term') break;
      }
    }
    if (c.career?.ending) break;

    // ---- Campaign (8 weeks) ----
    runCampaign(world, c);

    // ---- Formation talks ----
    runFormation(world, c);

    // ---- Record the election result and start the next term ----
    if (c.phase === 'done' && c.election && c.formation) {
      const result = electionResult(world, c);
      const seats = result ? result.tally[player] : 0;
      const o = c.formation.outcome;
      seatsByTerm.push(seats);
      if (o?.pm === player) pmTerms++;
      if (!nextTerm(world, c)) break;
    } else {
      break;
    }
  }

  const k = c.career!;
  const pc = c.parties[player];
  return {
    terms: seatsByTerm.length,
    ended: !!k.ending,
    ending: k.ending?.kind ?? null,
    seatsByTerm,
    pmTerms,
    credibility: k.credibility,
    unity: pc?.unity ?? 0,
    debt: k.economy.debt,
    elections: k.record.elections,
    victories: k.record.victories,
    falls: k.record.falls,
    toppled: k.record.toppled,
  };
}

describe('career balance simulation (machine-tested baseline)', () => {
  const world = getWorld('general')!;

  it('simulates full careers from multiple starting positions and seeds', () => {
    const starts: Array<{ player: number; label: string }> = [
      { player: PS, label: 'PM (PS)' },
      { player: BP, label: 'Partner (BP)' },
      { player: PT, label: 'Opposition (PT)' },
    ];
    for (const s of starts) {
      for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
        const r = runCareer(world, s.player, seed);
        // eslint-disable-next-line no-console
        console.log(
          `${s.label} seed=${seed} terms=${r.terms} ended=${r.ended} ending=${r.ending ?? '-'} ` +
          `pmTerms=${r.pmTerms} seats=${r.seatsByTerm.join(',')} ` +
          `cred=${r.credibility} unity=${r.unity.toFixed(0)} debt=${r.debt.toFixed(0)} ` +
          `elections=${r.elections} victories=${r.victories} falls=${r.falls} toppled=${r.toppled}`,
        );
      }
    }
    expect(true).toBe(true);
  }, 120000);
});
