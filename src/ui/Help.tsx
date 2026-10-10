import { useEffect, useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { GLOSSARY, type TermId } from './glossary';
import { hemicycle, pitch } from './hemicycle';
import { partyColor, useT } from './hooks';
import { Icon, type IconName } from './Icon';

/** What each term is called where it has no word of its own to be found in running text. */
const NAMES: Partial<Record<TermId, StringKey>> = {
  unity: 'term.unity', credibility: 'term.credibility', safe: 'legend.safe', leaning: 'legend.leaning', marginal: 'legend.marginal',
  orders: 'tab.orders', stability: 'hint.stability', trust: 'hint.trust',
};
const ORDER: TermId[] = ['marginal', 'leaning', 'safe', 'ceramah', 'machinery', 'moe', 'hung', 'unity', 'credibility', 'stability', 'trust', 'orders', 'dossier'];
const WEEK: { icon: IconName; key: string }[] = [{ icon: 'compass', key: 'where' }, { icon: 'megaphone', key: 'act' }, { icon: 'intel', key: 'learn' }, { icon: 'play', key: 'end' }];

/** A small chamber to show what a majority looks like: sixty seats, the first thirty-one lit. */
function SmallChamber() {
  const places = hemicycle(60);
  const r = pitch(60) * 0.4;
  return (
    <svg className="howto-chamber" viewBox="-1.05 -1.05 2.1 1.1" aria-hidden="true">
      {places.map((p, i) => <circle key={i} cx={p.x} cy={-p.y} r={r} fill={i < 31 ? partyColor(0) : 'var(--line-3)'} />)}
    </svg>
  );
}

type TabId = 'start' | 'career' | 'missions' | 'challenges' | 'money' | 'economy' | 'tips' | 'words';
const TABS: TabId[] = ['start', 'career', 'missions', 'challenges', 'money', 'economy', 'tips', 'words'];
/** The titled paragraphs of each tab, by the stem of their strings (`help.<stem>.t` and `.x`). */
const SECTIONS: Partial<Record<TabId, string[]>> = {
  start: ['start.pick', 'start.map', 'start.save'],
  career: ['career.term', 'career.tabs', 'career.promises', 'career.end', 'career.own'],
  missions: ['missions.what', 'missions.decide', 'missions.risk', 'missions.final'],
  challenges: ['challenges.weekly', 'challenges.own', 'challenges.points'],
  money: ['money.funds', 'money.limit', 'money.team', 'money.candidates'],
  economy: ['economy.figures', 'economy.size', 'economy.treasury', 'economy.mood', 'economy.budget', 'economy.debt', 'economy.nation', 'economy.notice', 'economy.keep'],
};
const TIPS = 10;
const KEEP = ['credibility', 'unity', 'stability', 'trust'];

/** The Help page: how to play, a career, missions, challenges, money, tips and the words. Reached from the main menu and the game's own. */
export function Help({ onClose }: { onClose(): void }) {
  const t = useT();
  const lang = useStore((s) => s.settings.lang);
  const [tab, setTab] = useState<TabId>('start');
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog panel howto" role="dialog" aria-modal="true" aria-label={t('howto.title')}>
        <div className="panel-head">
          <h2>{t('howto.title')}</h2>
          <button className="btn small primary" onClick={onClose}>{t('settings.done')}</button>
        </div>
        <div className="help-tabs" role="tablist" aria-label={t('howto.title')}>
          {TABS.map((id) => (
            <button key={id} role="tab" id={`help-tab-${id}`} aria-selected={tab === id} aria-controls="help-panel" className={tab === id ? 'btn small primary' : 'btn small'} onClick={() => setTab(id)}>{t(`help.tab.${id}` as StringKey)}</button>
          ))}
        </div>
        <div id="help-panel" role="tabpanel" aria-labelledby={`help-tab-${tab}`} className="help-panel">
          {tab === 'start' && (
            <>
              <section className="howto-goal">
                <SmallChamber />
                <div>
                  <h3>{t('howto.goal')}</h3>
                  <p>{t('howto.goal.text')}</p>
                </div>
              </section>
              <h3>{t('howto.week')}</h3>
              <ol className="howto-week">
                {WEEK.map(({ icon, key }, i) => (
                  <li key={key}>
                    <span className="row-icon"><Icon name={icon} size={22} /></span>
                    <strong>{i + 1}. {t(`howto.${key}` as StringKey)}</strong>
                    <span className="muted small">{t(`howto.${key}.text` as StringKey)}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
          {SECTIONS[tab]?.map((stem) => (
            <section key={stem} className="help-section">
              <h3>{t(`help.${stem}.t` as StringKey)}</h3>
              <p>{t(`help.${stem}.x` as StringKey)}</p>
            </section>
          ))}
          {tab === 'tips' && (
            <>
              <section className="help-section">
                <h3>{t('help.keep.t')}</h3>
                <p>{t('help.keep.x')}</p>
              </section>
              {KEEP.map((id) => (
                <section key={id} className="help-section">
                  <h3>{t(`help.keep.${id}.t` as StringKey)}</h3>
                  <p>{t(`help.keep.${id}.x` as StringKey)}</p>
                </section>
              ))}
              <h3>{t('help.tab.tips')}</h3>
              <ul className="help-tips">
                {Array.from({ length: TIPS }, (_, i) => <li key={i}>{t(`help.tips.${i + 1}` as StringKey)}</li>)}
              </ul>
            </>
          )}
          {tab === 'words' && (
            <>
              <h3>{t('help.words.t')}</h3>
              <dl className="howto-words">
                {ORDER.map((id) => (
                  <div key={id}>
                    <dt>{NAMES[id] ? t(NAMES[id]!) : GLOSSARY[id].words[lang][0]}</dt>
                    <dd className="muted small">{t(GLOSSARY[id].text)}</dd>
                  </div>
                ))}
              </dl>
              <h3>{t('help.words.keys')}</h3>
              <p className="muted small">{t('help.words.keys.x')}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
