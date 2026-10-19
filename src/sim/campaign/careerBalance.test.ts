import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import type { World } from '../election';
import type { Campaign, EndingKind } from './types';
import { startCareer, skipAhead, answerEvent, nextTerm } from './career';
import { autoPlayWeek, endWeek, closeNight, electionResult } from './turn';
import { endDay, makeOffer, emptyOffer, mood, blocs, resolveFormationScene } from './formation';

const PS = PARTY_IDS.indexOf('ps');
const BP = PARTY_IDS.indexOf('bp');
const PT = PARTY_IDS.indexOf('pt');

/** Answer every scene waiting on the desk with the first choice, removing it from the inbox. */
function answerInbox(world: World, c: Campaign, player: number): void {
  while (c.inbox.length > 0) {
    const scene = c.inbox[0];
    const pc = c.parties[player];
    if (!pc) { c.inbox.shift(); continue; }
    if (scene.kind === 'unityAdvice') {
      resolveFormationScene(c, scene, 0);
    } else {
      answerEvent(world, c, scene, 0);
    }
    c.inbox.shift();
  }
}

/** Auto-play one campaign (8 weeks) using the rival logic, then move to night. */
function runCampaign(world: World, c: Campaign): void {
  while (c.phase === 'campaign') {
    autoPlayWeek(world, c);
    endWeek(world, c);
  }
  if (c.phase === 'night') closeNight(world, c);
}

/** Auto-resolve formation talks: sound out, make reasonable offers, end each day. */
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
      for (const seed of [1, 2, 3]) {
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
