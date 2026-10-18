import type { StringKey } from '../i18n/strings';
import { MOVES, MOVE_IDS, moveRefusal, moveWait } from '../sim/campaign/moves';
import { useStore } from '../state/store';
import { describeEffect } from './effectText';
import { useFormat, useT, useWorld } from './hooks';

/** The leader's own moves: each buys something now with something later, and must rest ten to fifteen weeks before it is made again. */
export function Moves() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const make = useStore((s) => s.makeMove);
  if (!campaign.career || campaign.phase !== 'term') return null;
  const shown = MOVE_IDS.filter((id) => moveRefusal(campaign, id) !== 'federal');
  const text = (id: (typeof MOVE_IDS)[number]) => [...MOVES[id].effects, ...(MOVES[id].gamble ? MOVES[id].gamble!.win : [])].map((e) => describeEffect(t, f, world, campaign, e)).filter(Boolean).join(' · ');
  const risk = (id: (typeof MOVE_IDS)[number]) => (MOVES[id].gamble ? MOVES[id].gamble!.lose.map((e) => describeEffect(t, f, world, campaign, e)).filter(Boolean).join(' · ') : '');
  return (
    <section className="moves" aria-label={t('moves.title')}>
      <h3>{t('moves.title')}</h3>
      <p className="muted small">{t('moves.desc')}</p>
      <ul>
        {shown.map((id) => {
          const no = moveRefusal(campaign, id);
          return (
            <li key={id} className="action">
              <div className="grow">
                <span className="action-title">{t(`move.${id}` as StringKey)}</span>
                <span className="action-meta">{t(`move.${id}.desc` as StringKey)}</span>
                <span className="action-meta num">{text(id)}</span>
                {MOVES[id].gamble && <span className="action-meta num">{t('moves.risk', { chance: Math.round((1 - MOVES[id].gamble!.chance) * 100), what: risk(id) })}</span>}
                {no === 'role' && <span className="action-reason">{t('moves.no.role')}</span>}
                {no === 'rest' && <span className="action-reason">{t('moves.no.rest', { n: moveWait(campaign, id) })}</span>}
              </div>
              <button type="button" className="btn small" disabled={!!no} onClick={() => make(id)}>{t('moves.make')}</button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
