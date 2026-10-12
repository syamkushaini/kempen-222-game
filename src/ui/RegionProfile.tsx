import { useMemo } from 'react';
import type { World } from '../sim/election';
import { profileOf } from '../sim/profile';
import { partyColor, partyShort, useFormat, useT } from './hooks';

/**
 * What a contest is about, shown before it is chosen: for a state, the voters of that state; for the country's contests, all of Malaysia.
 * It is read from the same data the game is played on, so the figures are the game's own estimates.
 */
export function RegionProfile({ world, title }: { world: World; title: string }) {
  const t = useT();
  const f = useFormat();
  const p = useMemo(() => profileOf(world), [world]);
  const group = (id: string) => p.groups.find((g) => g.id === id)?.share ?? 0;
  const top = p.groups.slice(0, 5);
  return (
    <section className="profile" aria-label={t('profile.title', { name: title })}>
      <h4>{t('profile.title', { name: title })}</h4>
      <dl className="facts">
        <div><dt>{t('profile.voters')}</dt><dd className="num">{f.int(p.voters)}</dd></div>
        <div><dt>{t('profile.seats')}</dt><dd className="num">{p.seats}</dd></div>
        <div><dt>{t('profile.turnout')}</dt><dd className="num">{f.pct(p.turnout)}</dd></div>
        <div><dt>{t('profile.firstTime')}</dt><dd className="num">{f.pct(group('undi18'))}</dd></div>
        <div><dt>{t('profile.seniors')}</dt><dd className="num">{f.pct(group('seniors'))}</dd></div>
        <div><dt>{t('profile.urban')}</dt><dd className="num">{f.pct(p.places.urban)} · {f.pct(p.places.semi)} · {f.pct(p.places.rural)}</dd></div>
      </dl>
      <p className="muted small">{t('profile.urban.note')}</p>
      <h5>{t('profile.groups')}</h5>
      <ul className="profile-groups">
        {top.map((g) => (
          <li key={g.id}>
            <span>{t(`bloc.${g.id}`)}</span>
            <span className="profile-bar" aria-hidden="true"><span style={{ width: `${Math.round((g.share / top[0].share) * 100)}%` }} /></span>
            <span className="num">{f.pct(g.share)}</span>
          </li>
        ))}
      </ul>
      <h5>{t('profile.last')}</h5>
      <p className="profile-leaders">
        {p.leaders.slice(0, 4).map((l) => (
          <span key={l.party}><i className="dot" style={{ background: partyColor(l.party) }} /> {partyShort(t, l.party)} <span className="num">{l.seats}</span></span>
        ))}
      </p>
      <p className="muted small">{t('profile.close', { marginal: p.marginal, safe: p.safe })}</p>
      <p className="muted small">{t('profile.size', { big: p.largest.name, bigN: f.int(p.largest.voters), small: p.smallest.name, smallN: f.int(p.smallest.voters) })}</p>
      <p className="muted small">{t('profile.note')}</p>
    </section>
  );
}
