import { Rng } from '../rng';
import { pushNews } from './news';
import type { Campaign } from './types';
import type { Effect } from './events';

// A decision is not over when it is made. A month or two later the papers go back to it and say how it turned out, and the
// people online say what they think of that. What they say depends on what the decision did.

export type EchoKind = 'good' | 'bad' | 'mixed';
export interface Echo { week: number; event: string; kind: EchoKind }

/** The weeks, at the least and at the most, between a decision and the story about how it turned out. */
export const ECHO = { min: 4, max: 10, good: 0.5, bad: -0.5 };

/** How an event’s consequences add up: what helped its maker, less what hurt. Credibility and trust count most; money spent counts a little against. */
export function scoreOf(effects: readonly Effect[]): number {
  let n = 0;
  for (const e of effects) {
    switch (e.t) {
      case 'cred': n += e.n * 0.5; break;
      case 'trust': n += e.n * 0.3; break;
      case 'stability': n += e.n * 0.3; break;
      case 'unity': n += e.n * 0.2; break;
      case 'mood': n += e.n * 30 * (e.blocs === 'all' ? 3 : Math.min(3, e.blocs.length)); break;
      case 'funds': case 'public': n += Math.sign(e.n) * Math.min(1, Math.abs(e.n) / 100_000) * 0.2; break;
      case 'end': case 'falls': n -= 3; break;
      default: break;
    }
  }
  return n;
}

export const kindOf = (score: number): EchoKind => (score >= ECHO.good ? 'good' : score <= ECHO.bad ? 'bad' : 'mixed');

/** Queues the story about how a decision turned out. Not for events that were only a vote or a by-election. */
export function queueEcho(c: Campaign, event: string, effects: readonly Effect[]): void {
  const k = c.career!;
  if (k.ending) return;
  const rng = new Rng(((c.seed ^ 0xec40) + k.week * 977 + event.length) >>> 0);
  (k.echoes ??= []).push({ week: k.week + ECHO.min + rng.int(ECHO.max - ECHO.min + 1), event, kind: kindOf(scoreOf(effects)) });
}

/** A week of echoes: the ones that are due are printed. */
export function echoWeek(c: Campaign): void {
  const k = c.career!;
  if (!k.echoes?.length) return;
  const due = k.echoes.filter((e) => e.week <= k.week);
  if (due.length === 0) return;
  k.echoes = k.echoes.filter((e) => e.week > k.week);
  if (k.echoes.length === 0) delete k.echoes;
  for (const e of due) pushNews(c, { party: c.player, key: `news.echo.${e.kind}`, vars: { event: `@event:${e.event}` }, tone: e.kind === 'good' ? 'good' : e.kind === 'bad' ? 'bad' : 'neutral' });
}
