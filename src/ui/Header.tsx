import { useEffect, useRef } from 'react';
import { termIncome, termSpending } from '../sim/campaign/career';
import { DAYS_PER_WEEK } from '../sim/campaign/types';
import { useStore } from '../state/store';
import { MenuButton } from './GameMenu';
import { Delta } from './Delta';
import { PartyMark } from './identity';
import { Logo } from './Logo';
import { SettingsButton } from './SettingsPanel';
import { partyName, useFormat, useNarrow, useSpot, useT, useWorld } from './hooks';

/** Ending the week takes one press. What would be thrown away is written on the button, so nobody does it by accident. */
export function useEndWeek() {
  const t = useT();
  const f = useFormat();
  const campaign = useStore((s) => s.game!.campaign);
  const endWeek = useStore((s) => s.endWeek);
  const me = campaign.parties[campaign.player]!;
  const final = campaign.week === campaign.totalWeeks;
  const unused = Math.floor(me.days);
  const base = final ? t('hud.toPolls') : t('hud.endWeek');
  return { onEnd: endWeek, unused, label: `${base}${unused >= 1 ? ` (${t('hud.unused', { days: f.days(unused) })})` : ''} ▸` };
}

function EndWeekButton({ className = '' }: { className?: string }) {
  const { onEnd, unused, label } = useEndWeek();
  const spot = useSpot();
  return <button className={`btn primary end-week${className}${unused >= 1 ? ' unused' : ''}${spot('end-week') ? ' spot' : ''}`} onClick={onEnd}>{label}</button>;
}

/** The days left, funds and End week button, kept at the bottom of a phone screen so they never scroll away. */
export function CampaignBar() {
  const t = useT();
  const f = useFormat();
  const campaign = useStore((s) => s.game!.campaign);
  const narrow = useNarrow();
  if (campaign.phase !== 'campaign' || !narrow) return null;
  const me = campaign.parties[campaign.player]!;
  return (
    <div className="campaign-bar">
      <div className="hud-item">
        <span className="hud-label">{t('hud.days')}</span>
        <strong className="num hud-value">{me.days}</strong>
      </div>
      <div className="hud-item">
        <span className="hud-label">{t('hud.funds')}</span>
        <strong className="num hud-value">{f.rm(me.funds)}</strong>
      </div>
      <EndWeekButton />
    </div>
  );
}

/** Week, days, money and location, plus the button that ends the week. */
function Hud() {
  const t = useT();
  const f = useFormat();
  const campaign = useStore((s) => s.game!.campaign);
  const scope = useStore((s) => s.game!.id);
  const narrow = useNarrow();
  const me = campaign.parties[campaign.player]!;
  const final = campaign.week === campaign.totalWeeks;

  return (
    <div className="hud">
      <div className="hud-item">
        <span className="hud-label">{final ? t('hud.finalWeek') : t('hud.week', { n: campaign.week, total: campaign.totalWeeks })}</span>
        <div className="weeks" aria-hidden="true">
          {Array.from({ length: campaign.totalWeeks }, (_, i) => (
            <i key={i} className={i + 1 < campaign.week ? 'past' : i + 1 === campaign.week ? 'now' : ''} />
          ))}
        </div>
      </div>
      {/* days and funds are in the bar at the bottom of a phone screen */}
      {!narrow && <div className="hud-item">
        <span className="hud-label">{t('hud.days')}</span>
        <div className="days" role="img" aria-label={f.days(me.days)}>
          {Array.from({ length: DAYS_PER_WEEK }, (_, i) => (
            <i key={i} className={me.days >= i + 1 ? 'full' : me.days >= i + 0.5 ? 'half' : ''} />
          ))}
          <strong className="num">{me.days}</strong>
        </div>
      </div>}
      {!narrow && <div className="hud-item">
        <span className="hud-label">{t('hud.funds')}</span>
        <strong className="num hud-value">{f.rm(me.funds)} <Delta value={me.funds} format={(n) => f.rm(Math.abs(n))} scope={scope} least={1000} /></strong>
      </div>}
      {/* on a phone the button lives in the bottom bar */}
      {!narrow && <EndWeekButton />}
    </div>
  );
}

/** The years between elections: where the term stands, the money, and the buttons that move time on. */
function TermHud() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const advance = useStore((s) => s.advance);
  const k = campaign.career!;
  const me = campaign.parties[campaign.player]!;
  const net = termIncome(world, campaign).total - termSpending(world, campaign).total;
  const waiting = campaign.inbox.length > 0;
  const year = Math.floor((k.week - 1) / 52) + 1, week = ((k.week - 1) % 52) + 1;
  return (
    <div className="hud">
      <div className="hud-item">
        <span className="hud-label">{t('term.date', { term: k.term, year, week })}</span>
        <div className="progress term-progress" role="img" aria-label={t('term.progress', { n: k.week, total: k.length })}>
          <span style={{ width: `${(k.week / k.length) * 100}%` }} />
        </div>
        {(k.record.terms?.length ?? 0) > 0 && (
          <ol className="career-line" aria-label={t('career.line')}>
            {k.record.terms!.map((r, i) => (
              <li key={i} className={r.pm ? 'won' : 'lost'} title={t(r.pm ? 'career.term.won' : 'career.term.lost', { n: i + 1, seats: r.seats })}>{i + 1}</li>
            ))}
            <li className="now" title={t('career.term.now', { n: k.term })}>{k.term}</li>
          </ol>
        )}
      </div>
      <div className="hud-item">
        <span className="hud-label">{t('hud.funds')}</span>
        <strong className="num hud-value">{f.rm(me.funds)} <span className={`small ${net < 0 ? 'neg' : 'muted'}`}>{net < 0 ? '−' : '+'}{f.rm(Math.abs(net))}</span></strong>
      </div>
      {!k.ending && <div className="button-row tight term-buttons">
        <button className="btn small" disabled={waiting} onClick={() => advance(1)}>{t('term.next')} ▸</button>
        <button className="btn small" disabled={waiting} onClick={() => advance(4)}>{t('term.month')} ▸▸</button>
        <button className="btn small primary" disabled={waiting} onClick={() => advance(52)}>{t('term.skip')} ⏭</button>
      </div>}
    </div>
  );
}

export function Header() {
  const t = useT();
  const phase = useStore((s) => s.game?.campaign.phase);
  const name = useStore((s) => s.game?.name);
  const challenge = useStore((s) => s.game?.campaign.challenge);
  const saved = useStore((s) => s.autosavedAt);
  const saveFailed = useStore((s) => s.autosaveFailed);
  const bar = useRef<HTMLElement>(null);
  const player = useStore((s) => s.game?.campaign.player);
  // The sticky sidebar sits below the bar, so it needs to know how tall the bar is.
  useEffect(() => {
    const el = bar.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const set = () => document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    set();
    const watch = new ResizeObserver(set);
    watch.observe(el);
    return () => watch.disconnect();
  }, []);
  return (
    <header className="header" ref={bar}>
      <div className="brand">
        {/* in a game the header says whose campaign this is; on the title it is the game's own mark */}
        {player !== undefined ? <PartyMark party={player} size={34} /> : <Logo size={36} />}
        <div>
          <h1>{player !== undefined ? partyName(t, player) : t('app.title')}</h1>
          <p>
            {name ? [name, challenge?.fog && t('challenge.fog'), challenge?.noisy && t('challenge.noisy')].filter(Boolean).join(' · ') : t('app.tagline')}
            {name && saveFailed && <span className="autosave bad" role="status"> · {t('saves.failedShort')}</span>}
            {name && !saveFailed && saved && <span key={saved} className="autosave" role="status"> · ✓ {t('saves.autosavedShort')}</span>}
          </p>
        </div>
      </div>
      {phase === 'campaign' && <Hud />}
      {phase === 'term' && <TermHud />}
      <MenuButton />
      <SettingsButton />
    </header>
  );
}
