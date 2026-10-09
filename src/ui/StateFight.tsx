import { useEffect, useState } from 'react';
import { fightWorld, loadState, stateLoaded } from '../data/world';
import { canFight, stakeFor } from '../sim/campaign/aside';
import { useStore } from '../state/store';
import { partyShort, regionLabel, useFormat, useT, useWorld } from './hooks';

/**
 * In the round of state polls, the states the player may fight in person: each with who holds it, what the contest's purse
 * is, and a tick. The party cannot put in more than it has; a state it does not stand in cannot be ticked.
 */
export function StateFight({ states, selected, onChange }: { states: string[]; selected: string[]; onChange(next: string[]): void }) {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const [, tick] = useState(0);
  const key = states.join(',');
  // A state's results are fetched when it is first wanted.
  useEffect(() => {
    let live = true;
    void Promise.all(states.map((st) => loadState(st as never))).then(() => { if (live) tick((n) => n + 1); });
    return () => { live = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const me = campaign.player;
  const funds = campaign.parties[me]!.funds;
  const holders = campaign.career!.states;
  const rows = states.map((st) => {
    const sw = stateLoaded(st as never) ? fightWorld(campaign, st) : null;
    return { st, sw, can: !!sw && canFight(sw, campaign), stake: sw ? stakeFor(sw, me, !!campaign.career!.founded) : 0 };
  });
  const put = rows.filter((r) => selected.includes(r.st)).reduce((a, r) => a + r.stake, 0);
  const toggle = (st: string) => onChange(selected.includes(st) ? selected.filter((x) => x !== st) : [...selected, st]);

  return (
    <section className="state-fight" aria-label={t('fight.title')}>
      <h3>{t('fight.title')}</h3>
      <p className="muted small">{t('fight.desc')}</p>
      <ul>
        {rows.map((r) => {
          const on = selected.includes(r.st);
          const short = !on && r.stake > funds - put;
          return (
            <li key={r.st}>
              <label className={r.can && !short ? 'fight-row' : 'fight-row off'}>
                <input type="checkbox" checked={on} disabled={!r.can || short} onChange={() => toggle(r.st)} />
                <span className="grow">
                  <strong>{regionLabel(t, world, r.st)}</strong>
                  <span className="muted small">
                    {holders[r.st] !== undefined && <>{t('fight.holds', { party: partyShort(t, holders[r.st]) })} · </>}
                    {!r.sw ? t('fight.loading') : !r.can ? t('fight.cant') : short ? t('fight.short') : t('fight.cost', { rm: f.rm(r.stake) })}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {selected.length > 0 && <p className="note">{t('fight.total', { n: selected.length, rm: f.rm(put), funds: f.rm(funds) })}</p>}
    </section>
  );
}
