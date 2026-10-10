import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { StringKey } from '../i18n/strings';
import { useStore, type Theme } from '../state/store';
import { ACCENTS, SKINS, unlocked, wearing } from './cosmetics';
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

/** The skins and accent colours: those earned can be worn, the rest say what earns them. */
function Look() {
  const t = useT();
  const s = useStore((x) => x.settings);
  const set = useStore((x) => x.setSettings);
  const profile = useStore((x) => x.profile);
  const locked = [...SKINS, ...ACCENTS].filter((c) => !unlocked(profile, c));
  const nameOf = (c: { id: string }) => t((SKINS.some((k) => k.id === c.id) && c.id !== 'party' ? `skin.${c.id}` : `accent.${c.id}`) as StringKey);
  return (
    <>
      <Row label={t('look.skin')}>
        <Choice label={t('look.skin')} value={s.skin} options={SKINS.map((k) => ({ id: k.id, name: `${t(`skin.${k.id}` as StringKey)}${unlocked(profile, k) ? '' : ' 🔒'}` }))} disabled={(id) => !unlocked(profile, SKINS.find((k) => k.id === id)!)} onPick={(skin) => set({ skin })} />
      </Row>
      <Row label={t('look.accent')}>
        <div className="accent-swatches" role="group" aria-label={t('look.accent')}>
          {ACCENTS.map((a) => {
            const open = unlocked(profile, a);
            const name = t(`accent.${a.id}` as StringKey);
            return (
              <button
                key={a.id} className={`accent-swatch${s.accent === a.id ? ' on' : ''}${a.id === 'party' ? ' party' : ''}`} style={a.color ? { background: a.color } : undefined}
                aria-pressed={s.accent === a.id} aria-label={open ? name : `${name} 🔒`} title={name} disabled={!open} onClick={() => set({ accent: a.id })}
              >{!open && <span aria-hidden="true">🔒</span>}</button>
            );
          })}
        </div>
      </Row>
      {locked.length > 0 && (
        <ul className="cosmetic-list muted small">
          {locked.map((c) => <li key={c.id}>{t('look.locked', { ach: t(`ach.${c.unlock!}` as StringKey), name: nameOf(c) })}</li>)}
        </ul>
      )}
      <p className="muted small">{t('look.hint')}</p>
    </>
  );
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
  // A skin that is worn sets the colour scheme itself.
  const profile = useStore((x) => x.profile);
  const forced = wearing(profile, s.skin, s.accent).skin.scheme !== null;
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
        <Row label={t('theme.label')} note={forced ? t('look.themeSet') : undefined}>
          <Choice label={t('theme.label')} value={s.theme} options={themes.map((id) => ({ id, name: t(`theme.${id}`) }))} onPick={(theme) => set({ theme })} disabled={() => forced} />
        </Row>
        <Look />
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
