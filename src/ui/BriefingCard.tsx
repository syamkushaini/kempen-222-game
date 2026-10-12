import type { StringKey } from '../i18n/strings';
import { briefingOf, type Change } from '../sim/campaign/briefing';
import { useStore, type SidebarTab } from '../state/store';
import { useFormat, useT, useWorld } from './hooks';

/**
 * The week in four short parts: what has changed since a month ago, what needs the player now, what is worth watching, and what they could
 * do. Everything in it is worked out from the state of the game; a part with nothing to say is left out, and a quiet week says so.
 */
export function BriefingCard() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const setTab = useStore((s) => s.setTab);
  const openScene = useStore((s) => s.openScene);
  const b = briefingOf(world, campaign);
  if (!b) return null;
  const value = (c: Change, n: number) => (c.id === 'funds' || c.id === 'treasury' ? f.rm(n) : c.id === 'growth' || c.id === 'inflation' || c.id === 'jobless' || c.id === 'debt' ? `${n.toFixed(1)}%` : String(Math.round(n)));
  const go = (tab: string) => (tab === 'desk' ? openScene() : setTab(tab as SidebarTab));
  const quiet = b.changed.length === 0 && b.attention.length === 0 && b.watch.length === 0 && b.can.length === 0;
  return (
    <section className="briefing" aria-label={t('brief.title')}>
      <h3>{t('brief.title')}</h3>
      {quiet && <p className="muted small">{t('brief.quiet')}</p>}
      {b.attention.length > 0 && (
        <div className="brief-part needs">
          <h4>{t('brief.attention')}</h4>
          <ul>
            {b.attention.map((x) => (
              <li key={x.id} className={`brief-item ${x.level}`}>
                <span>{t(`brief.a.${x.id}` as StringKey, x.vars)}</span>
                <button type="button" className="btn small" onClick={() => go(x.tab)}>{t('remind.go')}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {b.changed.length > 0 && (
        <div className="brief-part">
          <h4>{t('brief.changed')}</h4>
          <ul>
            {b.changed.map((c) => (
              <li key={c.id} className="brief-change">
                <span>{t(`brief.c.${c.id}` as StringKey)}</span>
                <span className={`num ${c.better === null ? '' : c.better ? 'pos-text' : 'neg'}`}>{c.to > c.from ? '▲' : '▼'} {value(c, c.from)} → {value(c, c.to)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {b.watch.length > 0 && (
        <div className="brief-part">
          <h4>{t('brief.watch')}</h4>
          <ul>{b.watch.map((x) => <li key={x.id} className="brief-item note"><span>{t(`brief.w.${x.id}` as StringKey, x.vars)}</span><button type="button" className="btn small" onClick={() => go(x.tab)}>{t('remind.go')}</button></li>)}</ul>
        </div>
      )}
      {b.can.length > 0 && (
        <div className="brief-part">
          <h4>{t('brief.can')}</h4>
          <ul>{b.can.map((x) => <li key={x.id} className="brief-item note"><span>{t(`brief.can.${x.id}` as StringKey)}</span><button type="button" className="btn small" onClick={() => go(x.tab)}>{t('remind.go')}</button></li>)}</ul>
        </div>
      )}
    </section>
  );
}
