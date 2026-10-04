import { useEffect, useState } from 'react';
import { termIncome, termSpending } from '../sim/campaign/career';
import { DAYS_PER_WEEK } from '../sim/campaign/types';
import { useStore, type Theme } from '../state/store';
import { regionLabel, useFormat, useT, useWorld } from './hooks';

function SettingsControls() {
  const t = useT();
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  return (
    <div className="header-controls">
      <div className="segmented small" role="group" aria-label={t('lang.label')}>
        {(['en', 'ms'] as const).map((l) => (
          <button key={l} className={settings.lang === l ? 'active' : ''} aria-pressed={settings.lang === l} onClick={() => setSettings({ lang: l })}>
            {l === 'en' ? 'EN' : 'BM'}
          </button>
        ))}
      </div>
      <div className="segmented small" role="group" aria-label={t('theme.label')}>
        {(['system', 'light', 'dark'] as Theme[]).map((th) => (
          <button key={th} className={settings.theme === th ? 'active' : ''} aria-pressed={settings.theme === th} onClick={() => setSettings({ theme: th })}>
            {t(`theme.${th}`)}
          </button>
        ))}
      </div>
      <div className="segmented small" role="group" aria-label={t('sound.label')}>
        <button className={settings.sound ? 'active' : ''} aria-pressed={settings.sound} onClick={() => setSettings({ sound: !settings.sound })}>
          {t('sound.sfx')}
        </button>
        <button className={settings.music ? 'active' : ''} aria-pressed={settings.music} onClick={() => setSettings({ music: !settings.music })}>
          {t('sound.music')}
        </button>
      </div>
    </div>
  );
}

/** Week, days, money and location, plus the button that ends the week. */
function Hud() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const endWeek = useStore((s) => s.endWeek);
  const me = campaign.parties[campaign.player]!;
  const final = campaign.week === campaign.totalWeeks;
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(id);
  }, [armed]);
  useEffect(() => setArmed(false), [campaign.week]);

  // Ask before throwing away a day or more of unused time.
  const onEnd = () => {
    if (me.days >= 1 && !armed) setArmed(true);
    else { setArmed(false); endWeek(); }
  };

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
      <div className="hud-item">
        <span className="hud-label">{t('hud.days')}</span>
        <div className="days" role="img" aria-label={f.days(me.days)}>
          {Array.from({ length: DAYS_PER_WEEK }, (_, i) => (
            <i key={i} className={me.days >= i + 1 ? 'full' : me.days >= i + 0.5 ? 'half' : ''} />
          ))}
          <strong className="num">{me.days}</strong>
        </div>
      </div>
      <div className="hud-item">
        <span className="hud-label">{t('hud.funds')}</span>
        <strong className="num hud-value">{f.rm(me.funds)}</strong>
      </div>
      {world.states.length > 1 && (
        <div className="hud-item">
          <span className="hud-label">{t('hud.location')}</span>
          <strong className="hud-value">{regionLabel(t, world, me.location)}</strong>
        </div>
      )}
      <button className={`btn primary end-week${armed ? ' armed' : ''}`} onClick={onEnd}>
        {armed ? t('hud.endWeekConfirm') : final ? t('hud.toPolls') : t('hud.endWeek')} ▸
      </button>
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
      <div className="hud-item">
        <span className="hud-label">{t('term.unity')}</span>
        <strong className="num hud-value">{Math.round(me.unity)}</strong>
      </div>
      <div className="hud-item">
        <span className="hud-label">{t('term.credibility')}</span>
        <strong className="num hud-value">{Math.round(k.credibility)}</strong>
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
  return (
    <header className="header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">222</span>
        <div>
          <h1>{t('app.title')}</h1>
          <p>{name ?? t('app.tagline')}</p>
        </div>
      </div>
      {phase === 'campaign' && <Hud />}
      {phase === 'term' && <TermHud />}
      <SettingsControls />
    </header>
  );
}
