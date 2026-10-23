import { useState } from 'react';
import { cloud } from '../state/cloud';
import { newerInCloud, useCloud } from '../state/cloudSync';
import { currentInApp } from '../state/environment';
import { AUTO_SLOT } from '../state/saves';
import { saveStore } from '../state/store';
import { restoreFromCloud } from './cloudRestore';
import { useT } from './hooks';

/**
 * Two notices at the top of the menu. One for a player in the browser of another app, which may erase what the game saves; it goes away for
 * good once they have signed in. One for a signed-in player whose cloud holds a newer game than this device does: the way back from a lost save.
 */
export function StorageNotices({ onBackUp }: { onBackUp(): void }) {
  const t = useT();
  const app = currentInApp();
  const signed = useCloud((s) => s.email);
  const found = useCloud((s) => s.found);
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  // Read once: reading a save means checking all of it.
  const [local] = useState(() => saveStore.meta(AUTO_SLOT)?.updatedAt ?? null);
  const newer = signed ? newerInCloud(found, AUTO_SLOT, local) : null;
  return (
    <>
      {app && !signed && !hidden && (
        <section className="welcome-back storage-notice" role="note">
          <p className="small">{t('storage.inApp', { app })}</p>
          <div className="button-row">
            {cloud.enabled
              ? <button className="btn primary" onClick={onBackUp}>{t('storage.back')}</button>
              : <button className="btn primary" onClick={onBackUp}>{t('saves.export')}</button>}
            <button className="btn" onClick={() => setHidden(true)}>{t('storage.dismiss')}</button>
          </div>
        </section>
      )}
      {newer && (
        <section className="welcome-back storage-notice" role="status">
          <p className="small">{t('cloud.found', { name: newer.name, week: newer.week })}</p>
          <div className="button-row">
            <button className="btn primary" disabled={busy} onClick={() => { setBusy(true); void restoreFromCloud(AUTO_SLOT).finally(() => setBusy(false)); }}>{t('cloud.found.restore')}</button>
          </div>
        </section>
      )}
    </>
  );
}
