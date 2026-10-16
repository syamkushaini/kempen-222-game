import { WEAK, STRONG } from '../sim/campaign/nation';
import { PESTEL_GROUPS, groupScore, pestelAnswers, pestelScores } from '../sim/campaign/pestel';
import type { StringKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { useGaugeColour } from './Gauge';
import { useT } from './hooks';

const word = (v: number) => (v < WEAK ? 'weak' : v >= STRONG ? 'strong' : 'fair');

/**
 * PESTEL: how the country (or state) is doing in six ways, each a group of bars from 0 to 100: political, economic, social,
 * technological, environmental and legal. For a government, they are the ones to answer for. Each group says in a line what moves it.
 */
export function PestelCard() {
  const t = useT();
  const campaign = useStore((s) => s.game!.campaign);
  const colour = useGaugeColour();
  const k = campaign.career!;
  const scores = pestelScores(k);
  const e = k.economy;
  /** What is written beside an economic bar: the figure itself, which is what a player knows it by. */
  const figure = (m: string): string | null => (m === 'growth' ? `${e.growth.toFixed(1)}%` : m === 'inflation' ? `${e.inflation.toFixed(1)}%` : m === 'jobless' ? `${e.jobless.toFixed(1)}%` : m === 'debt' ? `${e.debt.toFixed(0)}%` : null);
  return (
    <>
      <h3>{t('pestel.title')}</h3>
      <p className="muted small">{t(pestelAnswers(campaign) ? 'pestel.note.gov' : 'pestel.note.opp')}</p>
      {PESTEL_GROUPS.map((g) => {
        const score = groupScore(k, g.id);
        return (
          <section key={g.id} className="pestel-group" aria-label={t(`pestel.group.${g.id}` as StringKey)}>
            <div className="result-label">
              <strong>{t(`pestel.group.${g.id}.letter` as StringKey)} · {t(`pestel.group.${g.id}` as StringKey)}</strong>
              <span className={`num ${word(score) === 'weak' ? 'neg' : word(score) === 'strong' ? 'pos-text' : 'muted'}`}>{t(`nation.${word(score)}` as StringKey)} · {Math.round(score)}</span>
            </div>
            <p className="muted small">{t(`pestel.group.${g.id}.desc` as StringKey)}</p>
            <ul className="nation-list">
              {g.meters.map((m) => {
                const value = scores[m];
                const fig = figure(m);
                return (
                  <li key={m}>
                    <div className="result-label">
                      <span>{t(`pestel.${m}` as StringKey)}</span>
                      <span className={`num ${word(value) === 'weak' ? 'neg' : word(value) === 'strong' ? 'pos-text' : 'muted'}`}>{fig ? `${fig} · ` : ''}{Math.round(value)}</span>
                    </div>
                    <div className="bar" role="img" aria-label={`${t(`pestel.${m}` as StringKey)} ${Math.round(value)}`}>
                      <span style={{ width: `${value}%`, background: colour(value) }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </>
  );
}
