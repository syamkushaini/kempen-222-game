import { useStore } from '../state/store';
import { useT } from './hooks';
import { feedbackUrl } from './report';

/** Opens a new GitHub issue with the version and contest filled in. The player reads it and decides whether to send it. */
export function FeedbackLink() {
  const t = useT();
  const lang = useStore((s) => s.settings.lang);
  const campaign = useStore((s) => s.game?.campaign);
  const href = feedbackUrl({
    version: __APP_VERSION__,
    lang,
    scenario: campaign?.scenario ?? null,
    week: campaign ? campaign.week : null,
    width: typeof window === 'undefined' ? null : window.innerWidth,
  });
  return (
    <p className="feedback small">
      <a href={href} target="_blank" rel="noopener noreferrer">{t('feedback.send')}</a>
      <span className="muted"> · {t('feedback.note')} · v{__APP_VERSION__}</span>
    </p>
  );
}
