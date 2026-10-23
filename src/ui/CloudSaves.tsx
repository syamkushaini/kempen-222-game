import { useState } from 'react';
import { cloud, CODE, type CloudSlot } from '../state/cloud';
import { flush, pushSlot, refresh, signOut, useCloud } from '../state/cloudSync';
import { MANUAL_SLOTS, AUTO_SLOT } from '../state/saves';
import { saveStore } from '../state/store';
import type { StringKey } from '../i18n/strings';
import { restoreFromCloud } from './cloudRestore';
import { FormField } from './FormField';
import { useFormat, useT } from './hooks';
import { ConfirmButton } from './SavesTab';

/** Where the cloud copy of the player's saves is looked after: signing in, what is kept, taking a game back, and leaving. Nothing shows without a cloud. */
export function CloudSaves() {
  const t = useT();
  const f = useFormat();
  const { email: signed, syncing, syncedAt, failed, found } = useCloud();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ key: StringKey; bad: boolean; status?: number } | null>(null);
  if (!cloud.enabled) return null;

  const say = (key: StringKey, bad = false, status?: number) => setMessage({ key, bad, ...(status ? { status } : {}) });
  const slotName = (slot: CloudSlot) => (slot === 'auto' || slot === 'prev' ? t(`cloud.slot.${slot}` as StringKey) : t('saves.slot', { n: slot }));

  const ask = async () => {
    setBusy(true); setMessage(null);
    const result = await cloud.requestCode(email);
    setBusy(false);
    if (result === 'sent') { setStep('code'); setCode(''); } else say(`cloud.error.${result}` as StringKey, true, cloud.lastStatus);
  };
  const enter = async () => {
    setBusy(true); setMessage(null);
    const result = await cloud.verify(email, code);
    if (result !== 'ok') { setBusy(false); say(`cloud.error.${result}` as StringKey, true, cloud.lastStatus); return; }
    useCloud.setState({ email: cloud.session()?.email ?? null });
    await refresh();
    setBusy(false);
    setStep('email'); setCode('');
  };
  const sendAll = async () => {
    setBusy(true); setMessage(null);
    let all = true;
    for (const slot of [AUTO_SLOT, ...MANUAL_SLOTS] as const) {
      const game = saveStore.load(slot);
      if (game && !(await pushSlot(slot, game))) all = false;
    }
    await flush();
    await refresh();
    setBusy(false);
    if (all) say('cloud.sent'); else say('cloud.error.failed', true);
  };
  const restore = async (slot: CloudSlot) => {
    setBusy(true); setMessage(null);
    const ok = await restoreFromCloud(slot);
    setBusy(false);
    say(ok ? 'cloud.restored' : 'cloud.restoreFailed', !ok);
  };
  const leave = async () => { setBusy(true); await signOut(); setBusy(false); setMessage(null); };
  const wipe = async () => {
    setBusy(true);
    const ok = await cloud.deleteAccount();
    if (ok) { useCloud.setState({ email: null, found: null, failed: false, syncedAt: null }); say('cloud.deleted'); } else say('cloud.deleteFailed', true);
    setBusy(false);
  };

  return (
    <section className="cloud-saves panel" aria-label={t('cloud.title')}>
      <h4>{t('cloud.title')}</h4>
      {!signed ? (
        <>
          <p className="muted small">{t('cloud.intro')}</p>
          {step === 'email' ? (
            <>
              <FormField label={t('cloud.email')} type="email" value={email} onChange={setEmail} placeholder="nama@contoh.com" />
              <div className="button-row">
                <button className="btn primary" disabled={busy || email.trim().length < 5} onClick={() => void ask()}>{t('cloud.sendCode')}</button>
              </div>
            </>
          ) : (
            <>
              <p className="note good" role="status">{t('cloud.codeSent', { email: email.trim().toLowerCase() })}</p>
              <FormField label={t('cloud.code')} value={code} onChange={(v) => setCode(v.replace(/\s+/g, ''))} placeholder="123456" />
              <div className="button-row">
                <button className="btn primary" disabled={busy || !CODE.test(code)} onClick={() => void enter()}>{t('cloud.signIn')}</button>
                <button className="btn" disabled={busy} onClick={() => { setStep('email'); setMessage(null); }}>{t('cloud.otherEmail')}</button>
              </div>
            </>
          )}
          <p className="muted small">{t('cloud.privacy')}</p>
        </>
      ) : (
        <>
          <p>{t('cloud.signedIn', { email: signed })}</p>
          <p className={failed ? 'note bad' : 'muted small'} role="status">
            {syncing ? t('cloud.syncing') : failed ? t('cloud.failedSync') : syncedAt ? t('cloud.synced', { when: f.dateTime(syncedAt) }) : ''}
          </p>
          <h5>{t('cloud.saves')}</h5>
          {found && found.length === 0 && <p className="muted small">{t('cloud.none')}</p>}
          <ul className="slot-list">
            {(found ?? []).map((m) => (
              <li key={m.slot}>
                <div className="grow">
                  <span className="seat-name">{slotName(m.slot)} · {m.name}</span>
                  <span className="muted small">{t('title.week', { week: m.week, total: m.totalWeeks })} · {f.dateTime(m.savedAt)}</span>
                </div>
                <ConfirmButton label={t('cloud.restore')} name={`${t('cloud.restore')}: ${slotName(m.slot)}`} confirmLabel={t('saves.confirm')} onConfirm={() => void restore(m.slot)} disabled={busy} />
              </li>
            ))}
          </ul>
          <div className="button-row">
            <button className="btn" disabled={busy} onClick={() => void sendAll()}>{t('cloud.sendNow')}</button>
            <button className="btn" disabled={busy} onClick={() => void leave()}>{t('cloud.signOut')}</button>
            <ConfirmButton label={t('cloud.delete')} confirmLabel={t('saves.confirm')} onConfirm={() => void wipe()} disabled={busy} danger />
          </div>
          <p className="muted small">{t('cloud.privacy')}</p>
        </>
      )}
      {message && <p className={message.bad ? 'note bad' : 'note good'} role="status">{t(message.key)}{message.status ? ` (HTTP ${message.status})` : ''}</p>}
    </section>
  );
}
