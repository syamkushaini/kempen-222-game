import { useEffect } from 'react';
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

/** One page on how the game is played: the goal, a week, what the figures mean, and the keys. Reached from the main menu and the game's own. */
export function HowToPlay({ onClose }: { onClose(): void }) {
  const t = useT();
  const lang = useStore((s) => s.settings.lang);
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

        <h3>{t('howto.words')}</h3>
        <dl className="howto-words">
          {ORDER.map((id) => (
            <div key={id}>
              <dt>{NAMES[id] ? t(NAMES[id]!) : GLOSSARY[id].words[lang][0]}</dt>
              <dd className="muted small">{t(GLOSSARY[id].text)}</dd>
            </div>
          ))}
        </dl>

        <h3>{t('howto.keys')}</h3>
        <p className="muted small">{t('howto.keys.text')}</p>
      </div>
    </div>
  );
}
