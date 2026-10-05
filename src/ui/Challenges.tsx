import { PARTIES } from '../data/parties';
import { getWorld } from '../data/world';
import type { StringKey } from '../i18n/strings';
import { CHALLENGES, challengeById, goalResult, type ChallengeDef, type Goal } from '../sim/campaign/challenges';
import type { Summary } from '../sim/campaign/night';
import { PARTY_IDS } from '../sim/types';
import { useStore } from '../state/store';
import { useT, type T } from './hooks';

const goalText = (t: T, goal: Goal) =>
  goal.kind === 'win' ? t('challenges.goal.win') : t(`challenges.goal.${goal.kind}` as StringKey, { n: goal.atLeast });

/** What the blurb of a challenge names: its party and, in a by-election, its seat. */
const blurbVars = (def: ChallengeDef) => {
  const world = getWorld(def.scenario);
  return { party: PARTIES[def.party].name, seat: world && world.rules.kind === 'byelection' ? world.seats[0].name : '' };
};

/** The set challenges on the title screen: the same contest every time, with a goal to meet. */
export function ChallengeList() {
  const t = useT();
  const startCampaign = useStore((s) => s.startCampaign);
  const play = (def: ChallengeDef) => startCampaign({
    name: t(`challenges.c.${def.id}` as StringKey), scenario: def.scenario, player: PARTY_IDS.indexOf(def.party),
    difficulty: 'hard', seed: def.seed, challenge: { fog: !!def.fog, noisy: !!def.noisy, goal: def.id },
  });
  return (
    <details className="challenges">
      <summary><h3>{t('challenges.title')}</h3></summary>
      <p className="muted small">{t('challenges.intro')}</p>
      <ul className="challenge-list">
        {CHALLENGES.map((def) => (
          <li key={def.id} className="challenge">
            <div className="grow">
              <strong>{t(`challenges.c.${def.id}` as StringKey)}</strong>
              <span className="small">{t(`challenges.c.${def.id}.blurb` as StringKey, blurbVars(def))}</span>
              <span className="muted small">
                {t('challenges.goal')}: {goalText(t, def.goal)}
                {(def.fog || def.noisy) && ` · ${t('challenges.blind')}`}
              </span>
            </div>
            <button className="btn small" onClick={() => play(def)}>{t('challenges.play')} ▸</button>
          </li>
        ))}
      </ul>
    </details>
  );
}

/** A reminder, while the campaign runs, of what this challenge asks. */
export function GoalLine() {
  const t = useT();
  const def = challengeById(useStore((s) => s.game?.campaign.challenge?.goal));
  if (!def) return null;
  return (
    <p className="goal-line" role="status">
      <strong>{t('challenges.label')}</strong>
      <span>{t(`challenges.c.${def.id}` as StringKey)} · {t('challenges.goal')}: {goalText(t, def.goal)}</span>
    </p>
  );
}

/** Whether the count met the challenge's goal. Nothing for a game that is not a challenge. */
export function GoalResult({ summary }: { summary: Pick<Summary, 'seats' | 'before'> }) {
  const t = useT();
  const def = challengeById(useStore((s) => s.game?.campaign.challenge?.goal));
  if (!def) return null;
  const { met, got, need } = goalResult(def.goal, summary);
  const title = t(`challenges.c.${def.id}` as StringKey);
  return (
    <p className={`goal-result ${met ? 'met' : 'missed'}`} role="status">
      {met ? t('challenges.met', { title })
        : def.goal.kind === 'win' ? t('challenges.missedWin', { title })
        : t('challenges.missed', { title, goal: goalText(t, def.goal), got: def.goal.kind === 'gain' ? `${got > 0 ? '+' : got < 0 ? '−' : ''}${Math.abs(got)}` : got, need })}
    </p>
  );
}
