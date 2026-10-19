import { useEffect, useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { DialogFocus } from './dialog';
import { Icon } from './Icon';
import { useT } from './hooks';

/** How long a notification stays before auto-dismissing. */
const AUTO_DISMISS_MS = 8000;

/** The notification center: a dropdown from the header bell icon showing recent news and decisions. */
export function NotificationCenter() {
  const t = useT();
  const notifications = useStore((s) => s.notifications);
  const dismissNotification = useStore((s) => s.dismissNotification);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Auto-dismiss old notifications
  useEffect(() => {
    const id = setTimeout(() => {
      setDismissed((d) => {
        const next = new Set(d);
        notifications.forEach((n) => next.add(n.id));
        return next;
      });
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [notifications]);

  const visible = notifications.filter((n) => !dismissed.has(n.id));
  const unread = visible.length;

  return (
    <>
      <button
        className={`icon-btn notification-bell${open ? ' active' : ''}${unread > 0 ? ' has-notifications' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('notifications.bell')}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="bell" size={20} />
        {unread > 0 && <span className="count-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <DialogFocus open={open} onClose={() => setOpen(false)} className="panel notification-panel" role="menu" aria-modal="true" aria-label={t('notifications.title')}>
          <div className="panel-head">
            <h2>{t('notifications.title')}</h2>
            <button className="btn small" onClick={() => setOpen(false)}>{t('whatsNew.close')}</button>
          </div>
          {visible.length === 0 ? (
            <p className="muted small">{t('notifications.empty')}</p>
          ) : (
            <ul className="notification-list" role="menu">
              {visible.map((n) => (
                <li key={n.id} role="menuitem" className={`notification-item${n.read ? ' read' : ''}`}>
                  <span className="muted small">{t('notifications.week', { week: n.week })}</span>
                  <strong>{t(n.title as StringKey)}</strong>
                  <p className="muted small">{t(n.body as StringKey)}</p>
                  <button className="link inline" onClick={() => dismissNotification(n.id)} aria-label={t('notifications.dismiss')}>
                    {t('notifications.dismiss')}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="button-row">
            <button className="btn small" onClick={() => { setDismissed(new Set()); setOpen(false); }}>
              {t('notifications.clearAll')}
            </button>
          </div>
        </DialogFocus>
      )}
    </>
  );
}
