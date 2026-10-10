import type { StringKey } from '../i18n/strings';
import { TITLE_MAX } from '../sim/campaign/alliance';
import { PARTY_COLORS, fitColor } from '../state/identity';
import { ALLIANCE_NAMES_COUNT } from './allianceNames';
import { useT } from './hooks';

/** A name typed by the player (the ready-made ones are suggestions that fill it in) and the one colour the alliance's parties share on the map. */
export function AllianceForm({ title, color, onTitle, onColor }: { title: string; color: string; onTitle(v: string): void; onColor(v: string): void }) {
  const t = useT();
  return (
    <div className="alliance-form">
      <label className="field-label" htmlFor="alliance-title">{t('alliance.title.label')}</label>
      <input id="alliance-title" className="text-input" type="text" maxLength={TITLE_MAX} value={title} placeholder={t('alliance.title.placeholder')} onChange={(e) => onTitle(e.target.value)} />
      <div className="chips" role="group" aria-label={t('alliance.name')}>
        {Array.from({ length: ALLIANCE_NAMES_COUNT }, (_, n) => {
          const name = t(`alliance.name.${n}` as StringKey);
          return <button key={n} type="button" className={title === name ? 'chip active' : 'chip'} aria-pressed={title === name} onClick={() => onTitle(name)}>{name}</button>;
        })}
      </div>
      <span className="field-label">{t('alliance.color')}</span>
      <div className="swatches" role="radiogroup" aria-label={t('alliance.color')}>
        {PARTY_COLORS.map((c) => (
          <button key={c} type="button" role="radio" aria-checked={color === c} aria-label={c} className={color === c ? 'swatch-btn active' : 'swatch-btn'} style={{ background: c }} onClick={() => onColor(c)} />
        ))}
        <label className={PARTY_COLORS.includes(color) ? 'swatch-btn custom' : 'swatch-btn custom active'} title={t('creator.color.custom')} style={{ background: PARTY_COLORS.includes(color) ? undefined : color }}>
          <span aria-hidden="true">{PARTY_COLORS.includes(color) ? '+' : ''}</span>
          <input type="color" aria-label={t('creator.color.custom')} value={color} onChange={(e) => onColor(fitColor(e.target.value))} />
        </label>
      </div>
    </div>
  );
}
