import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useStore, type Theme } from '../state/store';
import { useT } from './hooks';
import { Icon } from './Icon';
import { canDraw3D } from './map3d';

/** A row of the settings panel: what it is on the left, the choice on the right. */
function Row({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return (
    <div className="setting">
      <div className="grow">
        <span className="setting-name">{label}</span>
        {note && <span className="muted small">{note}</span>}
      </div>
      {children}
    </div>
  );
}

/** One of a few named choices. */
function Choice<T extends string>({ label, value, options, onPick, disabled }: { label: string; value: T; options: { id: T; name: string }[]; onPick(id: T): void; disabled?: (id: T) => boolean }) {
  return (
    <div className="segmented small" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} className={value === o.id ? 'active' : ''} aria-pressed={value === o.id} disabled={disabled?.(o.id)} onClick={() => onPick(o.id)}>{o.name}</button>
      ))}
    </div>
  );
}

/** Something that is either on or off. */
function Switch({ label, on, onFlip }: { label: string; on: boolean; onFlip(): void }) {
  return <button className={on ? 'switch on' : 'switch'} role="switch" aria-checked={on} aria-label={label} onClick={onFlip}><i /></button>;
}

/** Every setting in one place, each with its name beside it: language, look, the map, sound and hints. */
function SettingsDialog({ onClose }: { onClose(): void }) {
  const t = useT();
  const s = useStore((x) => x.settings);
  const set = useStore((x) => x.setSettings);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const themes: Theme[] = ['system', 'light', 'dark'];
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog panel settings-dialog" role="dialog" aria-modal="true" aria-label={t('settings.title')}>
        <div className="panel-head">
          <h2>{t('settings.title')}</h2>
          <button className="btn small primary" onClick={onClose}>{t('settings.done')}</button>
        </div>
        <Row label={t('lang.label')}>
          <Choice label={t('lang.label')} value={s.lang} options={[{ id: 'en', name: 'English' }, { id: 'ms', name: 'Bahasa Malaysia' }]} onPick={(lang) => set({ lang })} />
        </Row>
        <Row label={t('theme.label')}>
          <Choice label={t('theme.label')} value={s.theme} options={themes.map((id) => ({ id, name: t(`theme.${id}`) }))} onPick={(theme) => set({ theme })} />
        </Row>
        <Row label={t('display.palette')}>
          <Choice label={t('display.palette')} value={s.palette} options={(['standard', 'accessible'] as const).map((id) => ({ id, name: t(`display.palette.${id}`) }))} onPick={(palette) => set({ palette })} />
        </Row>
        <Row label={t('display.text')}>
          <Choice label={t('display.text')} value={s.textSize} options={(['normal', 'large'] as const).map((id) => ({ id, name: t(`display.text.${id}`) }))} onPick={(textSize) => set({ textSize })} />
        </Row>
        <Row label={t('display.density')}>
          <Choice label={t('display.density')} value={s.density} options={(['comfortable', 'compact'] as const).map((id) => ({ id, name: t(`display.density.${id}`) }))} onPick={(density) => set({ density })} />
        </Row>
        <Row label={t('map.view')} note={canDraw3D() ? undefined : t('map.3d.unsupported')}>
          <Choice
            label={t('map.view')} value={s.map3d ? 'three' : 'flat'} options={[{ id: 'flat', name: t('map.view.flat') }, { id: 'three', name: t('map.view.3d') }]}
            onPick={(v) => set({ map3d: v === 'three' })} disabled={(v) => v === 'three' && !canDraw3D()}
          />
        </Row>
        <Row label={t('sound.sfx')}><Switch label={t('sound.sfx')} on={s.sound} onFlip={() => set({ sound: !s.sound })} /></Row>
        <Row label={t('sound.music')}><Switch label={t('sound.music')} on={s.music} onFlip={() => set({ music: !s.music })} /></Row>
        <Row label={t('guide.show')}><Switch label={t('guide.show')} on={s.hints} onFlip={() => set({ hints: !s.hints })} /></Row>
      </div>
    </div>
  );
}

/** The one button that opens the settings. */
export function SettingsButton() {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="icon-btn settings-button" title={t('settings.title')} aria-label={t('settings.title')} aria-haspopup="dialog" onClick={() => setOpen(true)}><Icon name="gear" size={20} /></button>
      {/* The header clips what is inside it, so the panel is hung from the page itself. */}
      {open && createPortal(<SettingsDialog onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}
