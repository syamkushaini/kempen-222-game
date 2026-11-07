import type { StringKey } from '../i18n/strings';
import type { TipFacts } from '../sim/campaign/contestTips';
import { partyShort, type Format, type T } from './hooks';

/** A tip of a level, with its figures filled in: sums of money as money, the seat, who held it, and the plan that suits the kind of place. */
export function tipText(t: T, f: Format, key: string, facts: TipFacts, extra: Record<string, number> = {}): string {
  const vars: Record<string, string | number> = { ...extra };
  for (const [k, v] of Object.entries(facts.money)) vars[k] = f.rm(v);
  for (const [k, v] of Object.entries(facts.nums)) vars[k] = k === 'voters' ? f.int(v) : v;
  vars.seat = facts.seat;
  vars.holder = partyShort(t, facts.holder);
  vars.runner = partyShort(t, facts.runner);
  if (facts.kind) {
    vars.ground = t(`tipseat.${facts.kind}` as StringKey);
    vars.plan = t(`tipplan.${facts.kind}` as StringKey, vars);
  }
  return t(key as StringKey, vars);
}
