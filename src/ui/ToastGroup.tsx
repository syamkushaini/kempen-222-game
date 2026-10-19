import { useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { useT } from './hooks';
import { Icon } from './Icon';

/** Groups similar toasts together so they don't stack endlessly. */
export function ToastGroup({ toasts, onDismiss }: { toasts: StringKey[]; onDismiss: (id: StringKey) => void }) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);

  if (toasts.length === 0) return null;
  const count = toasts.length;
  const first = toasts[0];
  const rest = toasts.slice(1);

  return (
    <div className="toast-group toast panel" role="status" aria-live="polite">
      <div className="toast-group-body">
        <span className="medal" aria-hidden="true">★</span>
        <div className="grow">
          <span className="dialog-from">{t('toast.achievement')}</span>
          <span className="action-title">{count === 1 ? t(first) : t('toast.grouped', { n: count })}</span>
          <span className="action-meta">{count > 1 ? t('toast.more', { n: count - 1 }) : t(`ach.${first}.desc` as StringKey)}</span>
        </div>
        <button className="close-x" onClick={() => onDismiss(first)} aria-label={t('toast.dismiss')}>
          <Icon name="close" size={18} />
        </button>
      </div>
      {count > 1 && (
        <div className="toast-group-expand" onClick={() => setExpanded(!expanded)}>
          <Icon name="chevron" size={14} />
          <span className="muted small">{expanded ? t('toast.less') : t('toast.more', { n: count - 1 })}</span>
        </div>
      )}
      {expanded && rest.map((id, i) => (
        <div key={i} className="toast-group-item">
          <span className="action-title">{t(id)}</span>
        </div>
      ))}
    </div>
  );
}
