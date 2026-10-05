import { START_NATION, STRONG, WEAK } from '../sim/campaign/nation';
import type { Nation } from '../sim/campaign/types';
import { answersFor } from '../sim/campaign/nation';
import { useStore } from '../state/store';
import { useT } from './hooks';

const KEYS: (keyof Nation)[] = ['health', 'education', 'standing'];

/** How the country is looked after and how it stands abroad: three bars, with a word for each. */
export function NationCard() {
  const t = useT();
  const campaign = useStore((s) => s.game!.campaign);
  const n = campaign.career!.nation ?? START_NATION;
  return (
    <>
      <h3>{t('nation.title')}</h3>
      <ul className="nation-list">
        {KEYS.map((key) => {
          const value = n[key];
          const word = value < WEAK ? 'weak' : value >= STRONG ? 'strong' : 'fair';
          return (
            <li key={key}>
              <div className="result-label">
                <span>{t(`nation.${key}`)}</span>
                <span className={`num ${word === 'weak' ? 'neg' : word === 'strong' ? 'pos-text' : 'muted'}`}>{t(`nation.${word}`)} · {Math.round(value)}</span>
              </div>
              <div className="bar" role="img" aria-label={`${t(`nation.${key}`)} ${Math.round(value)}`}>
                <span style={{ width: `${value}%`, background: word === 'weak' ? 'var(--bad)' : word === 'strong' ? 'var(--good)' : 'var(--muted)' }} />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="muted small">{t(answersFor(campaign) ? 'nation.note.gov' : 'nation.note.opp')}</p>
    </>
  );
}
