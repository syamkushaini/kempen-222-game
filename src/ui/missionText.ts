import type { StringKey } from '../i18n/strings';
import type { FinalPart, Mission, MissionRecord } from '../sim/campaign/types';
import { partyName, type Format, type T } from './hooks';

/** The part of a mission the words need: what it asks, whether it is a record or a mission still to do. */
type Ask = Pick<Mission, 'kind' | 'need' | 'seats' | 'party' | 'alone'> & Partial<Pick<Mission, 'elections' | 'weeks' | 'parts'>>;

/** By when: the next election, the one after, or a number of weeks. A mission to hold seats is judged at each. */
export function missionWhen(t: T, m: Ask): string {
  if (m.weeks !== undefined) return t('mission.when.weeks', { n: m.weeks });
  if ((m.elections ?? 1) >= 2) return t(m.kind === 'hold' ? 'mission.when.hold2' : 'mission.when.two');
  return t('mission.when.one');
}

/** What is asked, in a sentence. */
export function missionGoal(t: T, f: Format, m: Ask, when = missionWhen(t, m)): string {
  // Where no time is given (a mission under way says how long is left beside it) the sentence closes without a gap.
  return goal(t, f, m, when).replace(/ +([.,])/g, '$1').replace(/,\.$/, '.').trim();
}

function goal(t: T, f: Format, m: Ask, when: string): string {
  const n = m.seats?.length ?? 0;
  switch (m.kind) {
    case 'seize': return t('mission.goal.seize', { need: m.need, n, when });
    case 'hold': return t('mission.goal.hold', { need: m.need, n, when });
    case 'bloc': return m.party !== undefined ? t('mission.goal.bloc.party', { party: partyName(t, m.party), when }) : t('mission.goal.bloc', { need: m.need, when });
    case 'majority': return m.alone ? t('mission.goal.majority.alone', { need: m.need, when }) : t('mission.goal.majority.lead', { when });
    case 'final': return t('mission.goal.final', { n: m.parts?.length ?? 4, when });
    case 'credibility': return t('mission.goal.credibility', { need: m.need, when });
    case 'unity': return t('mission.goal.unity', { need: m.need, when });
    case 'funds': return t('mission.goal.funds', { rm: f.rm(m.need), when });
  }
}

/** Why it is on offer: what is at stake in it, as the party's advisers would put it. */
export function missionWhy(t: T, m: Ask): string {
  const key = m.kind === 'bloc' && m.party !== undefined ? 'bloc.party' : m.kind === 'majority' ? (m.alone ? 'majority.alone' : 'majority.lead') : m.kind;
  return t(`mission.why.${key}` as StringKey);
}

export const recordAsk = (r: MissionRecord): Ask => ({ kind: r.kind, need: r.need, seats: r.seats, party: r.party, alone: r.alone, parts: r.parts });

/** One part of the final mission, in a sentence. */
export const partGoal = (t: T, f: Format, p: FinalPart): string => missionGoal(t, f, p, '');
