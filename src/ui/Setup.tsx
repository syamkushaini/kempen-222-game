import { BACKSTORIES, partyLeaderStats } from '../sim/campaign/perks';
import { IDEOLOGY_IDS, type IdeologyId } from '../sim/campaign/leader';
import { BACKSTORY_IDS, STAT_IDS, type BackstoryId } from '../sim/campaign/types';
import { EMBLEM_IDS, PARTY_COLORS, type EmblemId } from '../state/identity';
import { PLAYER_LOOKS, portraitSvg } from './faces';
import { useT } from './hooks';
import { PartyMark } from './identity';
import { Pips } from './TeamTab';

/** Choosing where the leader came from, and with it what they are good at. */
export function LeaderPicker({ value, party, onChange }: { value: BackstoryId | null; party: number; onChange(value: BackstoryId | null): void }) {
  const t = useT();
  const options: (BackstoryId | null)[] = [null, ...BACKSTORY_IDS];
  return (
    <>
      <p className="muted small">{t('leader.pick.note')}</p>
      <div className="party-cards backstories" role="radiogroup" aria-label={t('leader.pick')}>
        {options.map((id) => {
          const stats = id ? BACKSTORIES[id] : partyLeaderStats(party);
          return (
            <button key={id ?? 'none'} role="radio" aria-checked={value === id} className={value === id ? 'party-card plain active' : 'party-card plain'} onClick={() => onChange(id)}>
              <strong>{t(id ? `backstory.${id}` : 'backstory.none')}</strong>
              <span className="small">{t(id ? `backstory.${id}.desc` : 'backstory.none.desc')}</span>
              <span className="stat-grid small">
                {STAT_IDS.map((s, i) => (
                  <span key={s}><span className="muted">{t(`stat.${s}`)}</span> <Pips n={stats[i]} label={`${stats[i]} / 5`} /></span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

export interface Draft {
  name: string;
  short: string;
  color: string;
  emblem: EmblemId;
  leader: string;
  look: number;
  ideology: IdeologyId | null;
}

/** Giving the party the player has taken over a name, colours, a flag and a leader of their own. */
export function PartyCreator({ draft, career, onChange }: { draft: Draft; career: boolean; onChange(patch: Partial<Draft>): void }) {
  const t = useT();
  const ideologies: (IdeologyId | null)[] = [null, ...IDEOLOGY_IDS];
  return (
    <div className="creator">
      <p className="muted small">{t('creator.desc')}</p>
      <div className="creator-grid">
        <label className="field">
          <span>{t('creator.name')}</span>
          <input type="text" value={draft.name} maxLength={40} onChange={(e) => onChange({ name: e.target.value })} />
        </label>
        <label className="field short">
          <span>{t('creator.short')}</span>
          <input type="text" value={draft.short} maxLength={6} onChange={(e) => onChange({ short: e.target.value.toUpperCase() })} />
        </label>
        <label className="field">
          <span>{t('creator.leaderName')}</span>
          <input type="text" value={draft.leader} maxLength={50} onChange={(e) => onChange({ leader: e.target.value })} />
        </label>
      </div>

      <span className="field-label">{t('creator.color')}</span>
      <div className="swatches" role="radiogroup" aria-label={t('creator.color')}>
        {PARTY_COLORS.map((c) => (
          <button key={c} role="radio" aria-checked={draft.color === c} aria-label={c} className={draft.color === c ? 'swatch-btn active' : 'swatch-btn'} style={{ background: c }} onClick={() => onChange({ color: c })} />
        ))}
      </div>

      <span className="field-label">{t('creator.emblem')}</span>
      <div className="swatches" role="radiogroup" aria-label={t('creator.emblem')}>
        {EMBLEM_IDS.map((e) => (
          <button key={e} role="radio" aria-checked={draft.emblem === e} aria-label={t(`emblem.${e}`)} className={draft.emblem === e ? 'mark-btn active' : 'mark-btn'} onClick={() => onChange({ emblem: e })}>
            <PartyMark emblem={e} color={draft.color} size={34} />
          </button>
        ))}
      </div>

      <span className="field-label">{t('creator.look')}</span>
      <div className="swatches" role="radiogroup" aria-label={t('creator.look')}>
        {PLAYER_LOOKS.map((look, i) => (
          <button key={i} role="radio" aria-checked={draft.look === i} aria-label={t('creator.lookN', { n: i + 1 })} className={draft.look === i ? 'mark-btn active' : 'mark-btn'} onClick={() => onChange({ look: i })}>
            <img className="portrait" width={44} height={44} alt="" src={`data:image/svg+xml,${encodeURIComponent(portraitSvg(look, draft.color))}`} />
          </button>
        ))}
      </div>

      {career && (
        <>
          <span className="field-label">{t('creator.ideology')}</span>
          <div className="party-cards backstories" role="radiogroup" aria-label={t('creator.ideology')}>
            {ideologies.map((id) => (
              <button key={id ?? 'keep'} role="radio" aria-checked={draft.ideology === id} className={draft.ideology === id ? 'party-card plain active' : 'party-card plain'} onClick={() => onChange({ ideology: id })}>
                <strong>{t(`ideology.${id ?? 'keep'}`)}</strong>
                <span className="small">{t(`ideology.${id ?? 'keep'}.desc`)}</span>
              </button>
            ))}
          </div>
          <p className="muted small">{t('creator.ideology.note')}</p>
        </>
      )}
    </div>
  );
}
