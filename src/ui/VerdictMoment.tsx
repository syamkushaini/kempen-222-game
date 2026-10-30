import { useEffect, useMemo, useState } from 'react';
import type { Summary } from '../sim/campaign/turn';
import type { Campaign } from '../sim/campaign/types';
import { majorityLine } from '../sim/election';
import type { ElectionOutcome } from '../sim/types';
import { Chamber } from './Chamber';
import type { Bloc } from './hemicycle';
import { leaderName, partyName, useFormat, useT, useWorld } from './hooks';
import { Portrait } from './Portrait';

/** How long the chamber is given to fill before the verdict is read out over it. */
const FILL_MS = 2600;

const CONFETTI_COLOURS = ['#f5c542', '#e8553d', '#3da5d9', '#5cb85c', '#c06cf2', '#ffffff'];

/** A burst of paper over the verdict of a good night. Pure CSS: each piece falls once and is gone. */
function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 48 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    dur: 2.4 + Math.random() * 1.8,
    drift: (Math.random() - 0.5) * 160,
    colour: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
    spin: 360 + Math.random() * 540,
  })), []);
  useEffect(() => { try { navigator.vibrate?.([40, 60, 40]); } catch { /* not every device can */ } }, []);
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{ left: `${p.left}%`, background: p.colour, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, ['--drift' as string]: `${p.drift}px`, ['--spin' as string]: `${p.spin}deg` }} />
      ))}
    </div>
  );
}

/**
 * The moment a result is known: the chamber fills party by party, then the verdict is read out large, with the leader's
 * face beside it. A press, or any key, goes straight to the figures. A contest for one seat has no chamber to fill.
 */
export function VerdictMoment({ campaign, summary, result, onDone }: { campaign: Campaign; summary: Summary; result: ElectionOutcome; onDone(): void }) {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const me = campaign.player;
  const single = world.seats.length === 1;
  const calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [read, setRead] = useState(single || calm);

  useEffect(() => {
    if (read) return;
    const id = setTimeout(() => setRead(true), FILL_MS);
    return () => clearTimeout(id);
  }, [read]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { e.preventDefault(); if (read) onDone(); else setRead(true); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [read, onDone]);

  // The player's party on the left, counted toward the line; everyone else on the right, the largest at the far end.
  const blocs = useMemo((): Bloc[] => {
    const rest = result.tally.map((n, p) => ({ n, p })).filter((x) => x.p !== me && x.n > 0).sort((a, b) => b.n - a.n);
    return [{ party: me, seats: result.tally[me], side: 'left' as const }, ...rest.map((x) => ({ party: x.p, seats: x.n, side: 'right' as const }))].filter((b) => b.seats > 0);
  }, [result, me]);
  const good = summary.verdict === 'majority' || summary.verdict === 'largest' || summary.verdict === 'gained' || summary.verdict === 'won' || summary.verdict === 'creditable';

  return (
    <div className="overlay verdict-moment" role="dialog" aria-modal="true" aria-label={t('summary.title')} onClick={() => (read ? onDone() : setRead(true))}>
      {read && good && !calm && <Confetti />}
      {!single && <div className="verdict-chamber"><Chamber reveal blocs={blocs} need={majorityLine(world)} sides={{ left: partyName(t, me), right: t('chamber.rest'), middle: '' }} /></div>}
      {read && (
        <div className={`verdict-words ${good ? 'good' : 'bad'}`}>
          <Portrait leader={me} size={112} />
          <div>
            <p className="verdict-who">{leaderName(t, me)} · {partyName(t, me)}</p>
            <h2>{t(`summary.verdict.${summary.verdict}`)}</h2>
            <p className="verdict-figure num">
              {single ? f.pct(summary.voteShare) : t('verdict.seats', { n: summary.seats, total: world.seats.length })}
              {!single && <span className="muted"> · {f.pct(summary.voteShare)}</span>}
            </p>
            <button className="btn primary" autoFocus onClick={(e) => { e.stopPropagation(); onDone(); }}>{t('verdict.go')} ▸</button>
          </div>
        </div>
      )}
      {!read && <p className="muted small verdict-skip">{t('fall.skip')}</p>}
    </div>
  );
}
