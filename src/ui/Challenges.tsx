import { PARTIES } from '../data/parties';
import { getWorld, loadScenario } from '../data/world';
import type { StringKey } from '../i18n/strings';
import { CHALLENGES, challengeById, goalResult, type ChallengeDef, type Goal } from '../sim/campaign/challenges';
import type { Summary } from '../sim/campaign/night';
import { outlook, par } from '../sim/campaign/outlook';
import { PARTY_IDS } from '../sim/types';
import { useStore } from '../state/store';
import { useFormat, useT, useWorld, type T } from './hooks';
import { BoardButton, PostChallenge } from './ChallengeBoard';
import { ChallengeMaker, CopyLink } from './ChallengeMaker';
import { WeeklyChallenge } from './WeeklyChallenge';

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
  // A challenge in a state fetches that state's results first.
  const play = (def: ChallengeDef) => void loadScenario(def.scenario).then(() => startCampaign({
    name: t(`challenges.c.${def.id}` as StringKey), scenario: def.scenario, player: PARTY_IDS.indexOf(def.party),
    difficulty: 'hard', seed: def.seed, challenge: { fog: !!def.fog, noisy: !!def.noisy, goal: def.id },
  }));
  return (
    <>
    <WeeklyChallenge />
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
            <div className="challenge-buttons">
              <button className="btn small" onClick={() => play(def)}>{t('challenges.play')} ▸</button>
              <BoardButton challenge={`set:${def.id}`} />
            </div>
          </li>
        ))}
      </ul>
    </details>
    <ChallengeMaker />
    </>
  );
}

/** A reminder, while the campaign runs, of what this challenge asks. */
export function GoalLine() {
  const t = useT();
  const def = challengeById(useStore((s) => s.game?.campaign.challenge?.goal));
  if (!def) return <OutlookLine />;
  return (
    <p className="goal-line" role="status">
      <strong>{t('challenges.label')}</strong>
      <span>{t(`challenges.c.${def.id}` as StringKey)} · {t('challenges.goal')}: {goalText(t, def.goal)}</span>
    </p>
  );
}

/** In a by-election, where the player stands and what a good night would be: a win, or for a party not expected to win, a share of the vote. */
function OutlookLine() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const player = useStore((s) => s.game?.campaign.player);
  const phase = useStore((s) => s.game?.campaign.phase);
  const where = player === undefined || phase !== 'campaign' ? null : outlook(world, player);
  if (!where || player === undefined) return null;
  return (
    <p className="goal-line" role="status">
      <strong>{t(`outlook.${where}`)}</strong>
      <span>{t(`outlook.goal.${where}`, { pct: f.pct(par(world, player) ?? 0, 0) })}</span>
    </p>
  );
}

/** A lost by-election, measured against what was expected of the party. */
function OutlookResult({ summary }: { summary: Pick<Summary, 'seats' | 'voteShare'> }) {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const player = useStore((s) => s.game?.campaign.player);
  const need = player === undefined ? null : par(world, player);
  if (need === null || summary.seats > 0) return null;
  const met = summary.voteShare >= need;
  return <p className={`goal-result ${met ? 'met' : 'missed'}`} role="status">{t(met ? 'outlook.result.met' : 'outlook.result.missed', { got: f.pct(summary.voteShare, 1), need: f.pct(need, 0) })}</p>;
}

/** Whether the count met the challenge's goal. For a game that is not a challenge, how a by-election went against what was expected. */
export function GoalResult({ summary }: { summary: Pick<Summary, 'seats' | 'before' | 'voteShare'> }) {
  const t = useT();
  const def = challengeById(useStore((s) => s.game?.campaign.challenge?.goal));
  const code = useStore((s) => s.game?.campaign.challenge?.code);
  // A challenge somebody made: the result can be sent on, as the same election for the next person.
  if (!def && code) return <><p className="goal-result" role="status">{t('challenge.sendOn')} <CopyLink code={code} /></p><PostChallenge summary={summary} /></>;
  if (!def) return <OutlookResult summary={summary} />;
  const { met, got, need } = goalResult(def.goal, summary);
  const title = t(`challenges.c.${def.id}` as StringKey);
  return (
    <>
      <p className={`goal-result ${met ? 'met' : 'missed'}`} role="status">
        {met ? t('challenges.met', { title })
          : def.goal.kind === 'win' ? t('challenges.missedWin', { title })
          : t('challenges.missed', { title, goal: goalText(t, def.goal), got: def.goal.kind === 'gain' ? `${got > 0 ? '+' : got < 0 ? '−' : ''}${Math.abs(got)}` : got, need })}
      </p>
      <PostChallenge summary={summary} />
    </>
  );
}
