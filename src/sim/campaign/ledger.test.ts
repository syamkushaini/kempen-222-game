import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { newGame, parseSave } from '../../state/game';
import { PARTY_IDS } from '../types';
import { signPact } from './diplomacy';
import { record, standing } from './ledger';
import { review } from './review';
import { electionResult, endWeek, newCampaign, playerAct, truth } from './turn';
import type { Decision } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps'), BP = PARTY_IDS.indexOf('bp'), PT = PARTY_IDS.indexOf('pt');
const world = getWorld('state:perak')!;
const fresh = (seed = 3) => newCampaign(world, { player: PS, difficulty: 'normal', seed });
const item = (key = 'news.me.tv') => ({ week: 1, party: PS, key, vars: {}, tone: 'neutral' as const });

describe('the record of the player’s decisions', () => {
  it('notes what each action moved in the projection when it was taken', () => {
    const c = fresh();
    const seat = world.seats[0].id;
    const before = truth(world, c);
    const news = playerAct(world, c, 'ceramah', { seat })!;
    const after = truth(world, c);
    expect(c.ledger).toHaveLength(1);
    expect(c.ledger[0].news).toEqual(news);
    expect(c.ledger[0].seats).toBe(after.tally[PS] - before.tally[PS]);
    const share = (o: typeof after) => o.votes[PS] / o.votes.reduce((a, b) => a + b, 0);
    expect(c.ledger[0].share).toBeCloseTo(share(after) - share(before), 10);
  });

  it('notes nothing for an action that could not be taken', () => {
    const c = fresh();
    expect(playerAct(world, c, 'ceramah', {})).toBeNull();
    expect(c.ledger).toEqual([]);
  });

  it('notes the player’s own pacts and not the pacts of others', () => {
    const c = fresh();
    signPact(world, c, BP, PT, { give: [], get: [] });
    expect(c.ledger).toEqual([]);
    signPact(world, c, PS, BP, { give: [], get: [] });
    expect(c.ledger.map((d) => d.news.key)).toEqual(['news.pact.mine']);
  });

  it('keeps only the latest few hundred', () => {
    const c = fresh();
    const here = standing(world, c);
    for (let i = 0; i < 450; i++) record(world, c, here, item());
    expect(c.ledger).toHaveLength(400);
  });

  it('is empty again when a new campaign begins, and survives a save and load', () => {
    const c = fresh();
    playerAct(world, c, 'ceramah', { seat: world.seats[1].id });
    endWeek(world, c);
    const copy = JSON.parse(JSON.stringify(c));
    expect(isValidCampaign(copy, world)).toBe(true);
    expect(copy.ledger).toHaveLength(1);
    copy.ledger = 'nonsense';
    expect(isValidCampaign(copy, world)).toBe(false);
  });

  it('is added, empty, to a game saved before it existed', () => {
    const g = newGame('Old', fresh(), 5) as any;
    g.version = 10;
    delete g.campaign.ledger;
    const parsed = parseSave(JSON.stringify(g));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.state.campaign.ledger).toEqual([]);
  });
});

describe('the choices the review picks out', () => {
  const d = (seats: number, share: number, key: string): Decision => ({ news: item(key), seats, share });

  it('lists the best three and the worst two, and skips what changed nothing', () => {
    const c = fresh();
    c.ledger = [d(1, 0.001, 'a'), d(3, 0.004, 'b'), d(0, 0.0005, 'ignored'), d(2, 0.002, 'c'), d(0, 0.006, 'd'), d(-1, -0.003, 'e'), d(-3, -0.01, 'f'), d(0, -0.004, 'g')];
    while (c.phase === 'campaign') endWeek(world, c);
    const moves = review(world, c, electionResult(world, c)!).moves;
    expect(moves.best.map((x) => x.news.key)).toEqual(['b', 'c', 'a']);
    expect(moves.worst.map((x) => x.news.key)).toEqual(['f', 'e']);
    expect(moves.total).toBe(8);
  });

  it('are empty for a game with no record', () => {
    const c = fresh();
    while (c.phase === 'campaign') endWeek(world, c);
    expect(review(world, c, electionResult(world, c)!).moves).toEqual({ best: [], worst: [], total: 0 });
  });
});
