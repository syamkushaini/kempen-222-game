import { useEffect, useRef } from 'react';
import { termIncome, termSpending } from '../sim/campaign/career';
import { DAYS_PER_WEEK } from '../sim/campaign/types';
import { useStore, type Theme } from '../state/store';
import { MenuButton } from './GameMenu';
import { Gauge } from './Gauge';
import { Icon, type IconName } from './Icon';
import { Term } from './Term';
import { regionLabel, useFormat, useNarrow, useSpot, useT, useWorld } from './hooks';

function SettingsControls() {
  const t = useT();
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  // One button for the theme, going round Auto, Light, Dark: the icon says which is in use, the label says which comes next.
  const themes: Theme[] = ['system', 'light', 'dark'];
  const nextTheme = themes[(themes.indexOf(settings.theme) + 1) % themes.length];
  const themeIcon: IconName = settings.theme === 'light' ? 'sun' : settings.theme === 'dark' ? 'moon' : 'auto';
  return (
    <div className="header-controls">
      {/* the language stays in words: an icon cannot say which of two languages is which */}
      <div className="segmented small" role="group" aria-label={t('lang.label')}>
        {(['en', 'ms'] as const).map((l) => (
          <button key={l} className={settings.lang === l ? 'active' : ''} aria-pressed={settings.lang === l} onClick={() => setSettings({ lang: l })}>
            {l === 'en' ? 'EN' : 'BM'}
          </button>
        ))}
      </div>
      <button className="icon-btn" title={`${t('theme.label')}: ${t(`theme.${settings.theme}`)} → ${t(`theme.${nextTheme}`)}`} aria-label={`${t('theme.label')}: ${t(`theme.${settings.theme}`)}`} onClick={() => setSettings({ theme: nextTheme })}>
        <Icon name={themeIcon} />
      </button>
      <details className="display-menu">
        <summary className="icon-btn" title={t('display.title')} aria-label={t('display.title')}><Icon name="sliders" /></summary>
        <div className="display-panel">
          <span className="hud-label">{t('display.palette')}</span>
          <div className="segmented small" role="group" aria-label={t('display.palette')}>
            {(['standard', 'accessible'] as const).map((p) => (
              <button key={p} className={settings.palette === p ? 'active' : ''} aria-pressed={settings.palette === p} onClick={() => setSettings({ palette: p })}>
                {t(`display.palette.${p}`)}
              </button>
            ))}
          </div>
          <span className="hud-label">{t('display.text')}</span>
          <div className="segmented small" role="group" aria-label={t('display.text')}>
            {(['normal', 'large'] as const).map((z) => (
              <button key={z} className={settings.textSize === z ? 'active' : ''} aria-pressed={settings.textSize === z} onClick={() => setSettings({ textSize: z })}>
                {t(`display.text.${z}`)}
              </button>
            ))}
          </div>
          <label className="check small">
            <input type="checkbox" checked={settings.hints} onChange={(e) => setSettings({ hints: e.target.checked })} />
            <span>{t('guide.show')}</span>
          </label>
          <span className="hud-label">{t('display.density')}</span>
          <div className="segmented small" role="group" aria-label={t('display.density')}>
            {(['comfortable', 'compact'] as const).map((d) => (
              <button key={d} className={settings.density === d ? 'active' : ''} aria-pressed={settings.density === d} onClick={() => setSettings({ density: d })}>
                {t(`display.density.${d}`)}
              </button>
            ))}
          </div>
        </div>
      </details>
      <button className={`icon-btn${settings.sound ? ' on' : ''}`} aria-pressed={settings.sound} title={t('sound.sfx')} aria-label={t('sound.sfx')} onClick={() => setSettings({ sound: !settings.sound })}>
        <Icon name={settings.sound ? 'speaker' : 'muted'} />
      </button>
      <button className={`icon-btn${settings.music ? ' on' : ''}`} aria-pressed={settings.music} title={t('sound.music')} aria-label={t('sound.music')} onClick={() => setSettings({ music: !settings.music })}>
        <Icon name="music" />
      </button>
    </div>
  );
}

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
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
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
        <strong className="num hud-value">{f.rm(me.funds)}</strong>
      </div>}
      {world.states.length > 1 && (
        <div className="hud-item">
          <span className="hud-label">{t('hud.location')}</span>
          <strong className="hud-value">{regionLabel(t, world, me.location)}</strong>
        </div>
      )}
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
      </div>
      <div className="hud-item">
        <span className="hud-label">{t('hud.funds')}</span>
        <strong className="num hud-value">{f.rm(me.funds)} <span className={`small ${net < 0 ? 'neg' : 'muted'}`}>{net < 0 ? '−' : '+'}{f.rm(Math.abs(net))}</span></strong>
      </div>
      {/* Two of the party's own, and the government's two, whoever leads it: they matter as much to those trying to bring it down. */}
      <div className="hud-gauges">
        <Gauge value={me.unity} label={<Term id="unity">{t('term.unity')}</Term>} />
        <Gauge value={k.government.stability} label={<Term id="stability">{t('hint.stability')}</Term>} />
        <Gauge value={k.credibility} label={<Term id="credibility">{t('term.credibility')}</Term>} />
        <Gauge value={k.government.trust} label={<Term id="trust">{t('hint.trust')}</Term>} />
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
  const narrow = useNarrow();
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
        <span className="brand-mark" aria-hidden="true">222</span>
        <div>
          <h1>{t('app.title')}</h1>
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
      {/* on a phone the switches fold away, so that the game and not its settings fills the first screen */}
      {narrow ? <details className="settings-fold"><summary>{t('settings.title')}</summary><SettingsControls /></details> : <SettingsControls />}
    </header>
  );
}
