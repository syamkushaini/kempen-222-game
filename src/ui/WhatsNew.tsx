import { useEffect, useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { DialogFocus } from './dialog';
import { Kbd } from './Kbd';
import { useT } from './hooks';

/** Changelog entries shown in the "What's New" modal. Each entry has a version, title, and bullet points. */
const CHANGELOG: Array<{ version: string; title: StringKey; items: StringKey[] }> = [
  {
    version: '0.2.0',
    title: 'whatsNew.title',
    items: ['whatsNew.keyboard', 'whatsNew.welcomeBack', 'whatsNew.shortcuts', 'whatsNew.emptyStates'],
  },
];

/** Shows a "What's New" modal when the app version changes since the player last saw it. */
export function WhatsNew() {
  const t = useT();
  const setSettings = useStore((s) => s.setSettings);
  const settings = useStore((s) => s.settings);
  const [open, setOpen] = useState(false);
  const current = __APP_VERSION__;

  useEffect(() => {
    if (!settings.lastSeenVersion || settings.lastSeenVersion !== current) {
      setOpen(true);
    }
  }, [current, settings.lastSeenVersion]);

  if (!open) return null;

  return (
    <DialogFocus open={open} onClose={() => { setSettings({ ...settings, lastSeenVersion: current }); setOpen(false); }} className="panel whats-new" role="dialog" aria-modal="true" aria-label={t('whatsNew.title')}>
      <div className="panel-head">
        <h2>{t('whatsNew.title')} <span className="muted small">v{current}</span></h2>
        <button className="btn small" onClick={() => { setSettings({ ...settings, lastSeenVersion: current }); setOpen(false); }}>{t('whatsNew.close')}</button>
      </div>
      <div className="whats-new-list">
        {CHANGELOG.map((entry) => (
          <section key={entry.version} className="whats-new-entry">
            <h3>{entry.version}</h3>
            <ul>
              {entry.items.map((id) => (
                <li key={id}>{t(id)}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="button-row">
        <button className="btn primary" onClick={() => { setSettings({ ...settings, lastSeenVersion: current }); setOpen(false); }}>{t('whatsNew.gotIt')} <Kbd shortcut="Enter" /></button>
      </div>
    </DialogFocus>
  );
}
