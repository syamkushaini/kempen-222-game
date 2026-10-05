import { useStore } from '../state/store';
import { partyShort, seatName, useFormat, useT, useWorld } from './hooks';

/** The most seats named for each rival, and the most close seats named, before the rest are counted. */
const SHOWN = 3;

/** A look back at last week: what the days and money went on, and what the rivals did while the player was elsewhere. */
export function RecapCard() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const recap = useStore((s) => s.game?.campaign.recap);
  const phase = useStore((s) => s.game?.campaign.phase);
  if (!recap || phase !== 'campaign') return null;

  const names = (ids: string[]) => {
    const shown = ids.slice(0, SHOWN).map((id) => seatName(world, id)).join(', ');
    return ids.length > SHOWN ? t('recap.more', { list: shown, n: ids.length - SHOWN }) : shown;
  };
  const unused = recap.daysLeft;
  const single = world.seats.length === 1;
  const missed = [...new Map(recap.missed.map((m) => [m.seat, m])).values()];

  return (
    <section className="recap" aria-label={t('recap.title', { week: recap.week })}>
      <h3>{t('recap.title', { week: recap.week })}</h3>
      <p className="small">
        {t('recap.used', { used: f.days(Math.max(0, recap.daysTotal - unused)), total: f.days(recap.daysTotal), rm: f.rm(recap.spent) })}
        {unused >= 1 && <> <strong>{t('recap.unused', { days: f.days(unused) })}</strong></>}
      </p>
      {!single && recap.rivals.map((r) => (
        <p key={r.party} className="small muted">{t('recap.rival', { party: partyShort(t, r.party), seats: names(r.seats) })}</p>
      ))}
      {!single && missed.length > 0 && (
        <p className="small">
          <strong>{t('recap.missed', { list: missed.slice(0, 4).map((m) => `${seatName(world, m.seat)} (${partyShort(t, m.party)})`).join(', ') })}</strong>
        </p>
      )}
    </section>
  );
}
