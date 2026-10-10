import { useEffect, useState } from 'react';
import { PARTIES } from '../data/parties';
import { getWorld } from '../data/world';
import { encodeChallenge } from '../sim/campaign/challengeCode';
import { timeLeft, weekIndex, weeklySpec } from '../sim/campaign/weekly';
import { useStore } from '../state/store';
import { BoardButton, hasBoards } from './ChallengeBoard';
import { contestLabel, CopyLink } from './ChallengeMaker';
import { useT, type T } from './hooks';

const MINUTE = 60_000, HOUR = 60 * MINUTE, DAY = 24 * HOUR;

/** The time left in the week, in words: days and hours, then hours, then minutes. */
export function endsIn(t: T, ms: number): string {
  if (ms >= DAY) return t('challenge.weekly.ends', { d: Math.floor(ms / DAY), h: Math.floor((ms % DAY) / HOUR) });
  if (ms >= HOUR) return t('challenge.weekly.endsHours', { h: Math.floor(ms / HOUR) });
  return t('challenge.weekly.endsMinutes', { m: Math.max(1, Math.ceil(ms / MINUTE)) });
}

/** What a week's contest is called: the seat for a by-election, the state for a state, the country for the rest. */
function contestOf(t: T, scenario: string): string {
  if (!scenario.startsWith('byelection:')) return contestLabel(t, scenario);
  const seat = getWorld('general')?.seats.find((s) => s.id === scenario.slice('byelection:'.length));
  return `${t('scenario.byelection')}: ${seat?.name ?? scenario.slice('byelection:'.length)}`;
}

/** The challenge of the week: the same election for everyone, with its board, until Monday. */
export function WeeklyChallenge() {
  const t = useT();
  const startChallenge = useStore((s) => s.startChallenge);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), MINUTE); return () => clearInterval(id); }, []);
  const n = weekIndex(now);
  const spec = weeklySpec(n);
  const code = encodeChallenge(spec);
  const rules = [
    ...(spec.fog ? [t('challenge.fog')] : []), ...(spec.noisy ? [t('challenge.noisy')] : []), ...(spec.lean ? [t('challenge.make.lean')] : []),
    ...(spec.weeks !== undefined ? [t('challenge.make.weeks.n', { n: spec.weeks })] : []),
  ];
  return (
    <section className="weekly panel" aria-label={t('challenge.weekly.title')}>
      <h3>{t('challenge.weekly.title')}</h3>
      <p>{t('challenge.weekly.body', { contest: contestOf(t, spec.scenario), party: PARTIES[spec.party].name, level: t(`difficulty.${spec.difficulty}`) })}</p>
      <p className="muted small">{t('challenge.invite.rules', { rules: rules.length ? rules.join(', ') : t('challenge.invite.rules.none') })}</p>
      <p className="muted small">{endsIn(t, timeLeft(now))}</p>
      <div className="mission-buttons">
        <button className="btn primary" onClick={() => startChallenge(spec)}>{t('challenge.make.play')} ▸</button>
        <BoardButton challenge={code} />
        <CopyLink code={code} />
        {hasBoards && n > 0 && <BoardButton challenge={encodeChallenge(weeklySpec(n - 1))} label={t('challenge.weekly.last')} />}
      </div>
    </section>
  );
}
