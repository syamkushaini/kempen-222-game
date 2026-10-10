import { useEffect, useState } from 'react';
import { useT } from './hooks';

/** The picture of the map, to look at and to save or hand to the device's share sheet. Only the map: no card, no figures. */
export function MapShareDialog({ picture, caption, onClose }: { picture: string; caption: string; onClose(): void }) {
  const t = useT();
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(picture).then((r) => r.blob()).then((blob) => { if (live) setFile(new File([blob], 'kempen-222-map.png', { type: 'image/png' })); }).catch(() => undefined);
    return () => { live = false; };
  }, [picture]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const save = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url; a.download = file.name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const canShare = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
  const share = () => { if (file) void navigator.share({ files: [file], title: 'Kempen 222', text: caption }).catch(() => undefined); };
  const copy = () => {
    void navigator.clipboard?.writeText(caption).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => undefined);
  };

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog panel share-dialog" role="dialog" aria-modal="true" aria-label={t('mapshare.title')}>
        <h2>{t('mapshare.title')}</h2>
        <p className="muted small">{t('mapshare.hint')}</p>
        <img className="share-card" src={picture} alt={t('mapshare.alt')} />
        <label className="field">
          <span>{t('mapshare.text')}</span>
          <textarea readOnly rows={3} value={caption} onFocus={(e) => e.currentTarget.select()} />
        </label>
        <div className="button-row">
          <button className="btn primary" disabled={!file} onClick={save}>{t('share.save')}</button>
          <button className="btn" onClick={copy}>{t(copied ? 'mapshare.copied' : 'mapshare.copy')}</button>
          {canShare && <button className="btn" onClick={share}>{t('share.share')}</button>}
          <button className="btn" onClick={onClose}>{t('share.close')}</button>
        </div>
      </div>
    </div>
  );
}
