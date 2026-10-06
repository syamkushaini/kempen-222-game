import { useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { earned } from '../sim/campaign/achievements';
import type { Campaign } from '../sim/campaign/types';
import { useStore } from '../state/store';
import { useT, useWorld } from './hooks';
import { Icon } from './Icon';
import { ratingUrl } from './report';

/** The achievements this game has earned, listed under the verdict, each with what it asks. Nothing if none. */
export function AchievementsEarned({ campaign }: { campaign: Campaign }) {
  const t = useT();
  const world = useWorld();
  const list = earned(world, campaign);
  if (list.length === 0) return null;
  return (
    <div className="earned-here">
      <h3>{t('result.earned', { n: list.length })}</h3>
      <ul className="badge-list">
        {list.map((id) => (
          <li key={id} className="badge-card earned">
            <span className="medal" aria-hidden="true">★</span>
            <span>
              <span className="action-title">{t(`ach.${id}` as StringKey)}</span>
              <span className="action-meta">{t(`ach.${id}.desc` as StringKey)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * One tap after a game: was it good? A thumb opens a small box for a comment if the player wants to write one, and a
 * button that opens a prefilled GitHub issue. Nothing leaves the game unless the player presses that button.
 */
export function RateGame({ campaign }: { campaign: Campaign }) {
  const t = useT();
  const lang = useStore((s) => s.settings.lang);
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  if (done) return <p className="muted small rate">{t('rate.thanks')}</p>;
  const href = rating ? ratingUrl({ version: __APP_VERSION__, lang, scenario: campaign.scenario, week: campaign.week, width: typeof window === 'undefined' ? null : window.innerWidth }, rating, comment) : '';
  return (
    <div className="rate">
      <span className="muted small">{t('rate.ask')}</span>
      <div className="button-row tight">
        <button className={`icon-btn${rating === 'up' ? ' on' : ''}`} aria-pressed={rating === 'up'} title={t('rate.up')} aria-label={t('rate.up')} onClick={() => setRating('up')}><Icon name="thumbUp" /></button>
        <button className={`icon-btn${rating === 'down' ? ' on' : ''}`} aria-pressed={rating === 'down'} title={t('rate.down')} aria-label={t('rate.down')} onClick={() => setRating('down')}><Icon name="thumbDown" /></button>
      </div>
      {rating && (
        <div className="rate-box">
          <label className="field">
            <span>{t('rate.comment')}</span>
            <textarea rows={3} maxLength={600} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('rate.placeholder')} />
          </label>
          <div className="button-row">
            <a className="btn primary" href={href} target="_blank" rel="noopener noreferrer" onClick={() => setDone(true)}>{t('rate.send')}</a>
            <button className="btn" onClick={() => setDone(true)}>{t('rate.skip')}</button>
          </div>
          <p className="muted small">{t('rate.note')}</p>
        </div>
      )}
    </div>
  );
}
