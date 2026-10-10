import { AUTO_SLATE, nominationsOpen, openSeats } from '../sim/campaign/slate';
import { canChoose, chiefPicks } from '../sim/campaign/candidates';
import { CHIEF_NAMES, chiefView } from '../sim/campaign/chiefs';
import { useStore } from '../state/store';
import { Gauge } from './Gauge';
import { regionLabel, useT, useWorld } from './hooks';

/** One button that fills the candidates: the best hopeful where the leader chooses, and the likeliest seats for a party of the player's own. */
export function AutoFill() {
  const t = useT();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const autoFill = useStore((s) => s.autoFill);
  if (campaign.phase !== 'campaign') return null;
  const toChoose = canChoose(campaign) && campaign.team.keySeats.some((k) => k.pick === null);
  const toField = nominationsOpen(campaign) && openSeats(world, campaign).length > 0;
  const something = toChoose || toField;
  return (
    <div className="autofill">
      <button className="btn small primary" disabled={!something} onClick={autoFill}>{t('autofill.button')}</button>
      <p className="muted small">{something ? t('autofill.hint', { pct: Math.round(AUTO_SLATE * 100) }) : t('autofill.none')}</p>
    </div>
  );
}

/** What the state chiefs have made of the party's own choices: how well each picks, and how many of their seats are in capable hands. */
export function ChiefPicks() {
  const t = useT();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const rows = chiefPicks(world, campaign);
  if (rows.length === 0) return null;
  return (
    <section className="picks" aria-label={t('picks.title')}>
      <h4>{t('picks.title')}</h4>
      <p className="muted small action-desc">{t('picks.desc')}</p>
      <ul className="picks-list">
        {rows.map((r) => (
          <li key={r.state}>
            <strong>{regionLabel(t, world, r.state)}</strong>
            <span className="muted small">{t('picks.row', { chief: CHIEF_NAMES[chiefView(world, campaign, r.state).name] })}</span>
            <Gauge value={Math.round(r.quality * 100)} label={t('picks.quality')} />
            <span className="muted small">{t('picks.count', { able: r.able, seats: r.seats, risky: r.risky })}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
