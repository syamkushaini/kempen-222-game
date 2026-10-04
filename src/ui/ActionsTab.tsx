import type { StringKey } from '../i18n/strings';
import { ACTIONS, actionCost, canDo, expectedYield, spendingLimit } from '../sim/campaign/actions';
import { probeChance } from '../sim/campaign/spending';
import type { ActionId, ActionTarget, Family } from '../sim/campaign/types';
import type { RegionId } from '../sim/types';
import { useStore } from '../state/store';
import { partyColor, partyShort, regionLabel, useFormat, useT, useWorld } from './hooks';
import { NewsLine } from './NewsTab';

const FAMILIES: { family: Family; actions: ActionId[] }[] = [
  { family: 'ground', actions: ['ceramah', 'walkabout', 'megarally'] },
  { family: 'machinery', actions: ['canvass', 'gotv', 'build'] },
  { family: 'media', actions: ['tv', 'social', 'billboards', 'attack'] },
  { family: 'funds', actions: ['dinner', 'crowdfund', 'tycoon'] },
];

export function ActionsTab() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const selectedSeat = useStore((s) => s.selectedSeat);
  const selectedState = useStore((s) => s.selectedState);
  const lastReport = useStore((s) => s.lastReport);
  const act = useStore((s) => s.act);

  const me = campaign.player;
  const pc = campaign.parties[me]!;
  const seat = selectedSeat ? world.seats[world.seatIndex.get(selectedSeat)!] : null;
  // State actions follow the map: the open state, else the selected seat's state, else where the leader is.
  const state: RegionId = selectedState ?? seat?.state ?? pc.location;
  const area = world.rules.kind === 'general' ? 'state' : 'area';
  const rivals = campaign.parties.map((p, i) => (p && i !== me ? i : -1)).filter((i) => i >= 0);

  const row = (id: ActionId, target: ActionTarget, key: string, title: string, extra?: string) => {
    const check = canDo(world, campaign, me, id, target);
    const cost = actionCost(world, campaign, me, id, target);
    const reason = check.ok ? null
      : check.reason === 'noTarget' ? t(`reason.noTarget.${ACTIONS[id].target === 'state' ? area : (ACTIONS[id].target as 'seat' | 'party')}`)
      : t(`reason.${check.reason}` as StringKey);
    return (
      <li key={key} className="action">
        <div className="grow">
          <span className="action-title">{title}</span>
          <span className="action-meta num">
            {f.days(cost.days)} · {cost.money > 0 ? f.rm(cost.money) : t('cost.free')}
            {cost.travelDays > 0 && <> · {t('cost.travel', { days: f.days(cost.travelDays) })}</>}
            {extra && <> · {extra}</>}
          </span>
          {reason && <span className="action-reason">{reason}</span>}
        </div>
        <button className="btn small primary" disabled={!check.ok} onClick={() => act(id, target)} aria-label={`${t('actions.go')}: ${title}`}>
          {t('actions.go')}
        </button>
      </li>
    );
  };

  const render = (id: ActionId) => {
    const name = t(`action.${id}`);
    const stateName = regionLabel(t, world, state);
    switch (ACTIONS[id].target) {
      case 'seat':
        return row(id, { seat: seat?.id }, id, `${name} — ${seat ? seat.name : t('actions.noSeat')}`);
      case 'state': {
        const extra =
          id === 'dinner' ? t('actions.expected', { rm: f.rm(expectedYield(world, campaign, me, 'dinner', state)) })
          : ACTIONS[id].family === 'machinery' ? t('actions.machinery', { n: pc.machinery[world.states.indexOf(state)] })
          : undefined;
        return row(id, { state }, id, `${name} — ${stateName}`, extra);
      }
      case 'party':
        return rivals.map((r) => row(id, { party: r }, `${id}-${r}`, `${name} — ${partyShort(t, r)}`));
      default: {
        const extra =
          id === 'crowdfund' ? t('actions.expected', { rm: f.rm(expectedYield(world, campaign, me, 'crowdfund')) })
          : id === 'tycoon' ? t('actions.expected', { rm: f.rm(expectedYield(world, campaign, me, 'tycoon')) })
          : undefined;
        return row(id, {}, id, name, extra);
      }
    }
  };

  return (
    <section className="actions">
      {lastReport && <ul className="report"><NewsLine item={lastReport} /></ul>}
      <p className="target-line">
        <span className="muted">{t('actions.target')}:</span>{' '}
        <i className="dot" style={{ background: partyColor(me) }} />
        <strong>{seat && world.seats.length > 1 ? `${seat.name}, ` : ''}{regionLabel(t, world, state)}</strong>
        {pc.chiefs[state] && <span className="badge plain">{t('chiefs.badge', { level: t(`chiefs.level.${pc.chiefs[state]}`) })}</span>}
      </p>
      <p className={`muted small spend ${pc.spent > spendingLimit(world) ? 'over' : ''}`}>
        {t('spend.line', { spent: f.rm(pc.spent), limit: f.rm(spendingLimit(world)) })}
        {pc.fined ? ` ${t('spend.fined')}` : pc.spent > spendingLimit(world) ? ` ${t('spend.over', { pct: f.pct(probeChance(world, campaign, me), 0) })}` : ''}
      </p>
      {FAMILIES.map(({ family, actions: all }) => {
        const actions = all.filter((id) => world.rules.actions.includes(id));
        if (actions.length === 0) return null;
        return (
        <div key={family}>
          <h3>{t(`family.${family}`)}</h3>
          <ul className="action-list">
            {actions.map((id) => (
              <li key={id} className="action-group">
                <p className="muted small action-desc">{t(`action.${id}.desc` as StringKey)}</p>
                <ul>{render(id)}</ul>
              </li>
            ))}
          </ul>
        </div>
        );
      })}
    </section>
  );
}
