import { IDEOLOGY_IDS, shiftStances, type IdeologyId } from '../sim/campaign/leader';
import { ISSUE_GROUPS } from '../sim/campaign/policy';
import { ISSUE_IDS } from '../sim/campaign/types';
import type { StringKey } from '../i18n/strings';
import { useT } from './hooks';

const POSITIONS = [-2, -1, 0, 1, 2];

/**
 * The platform of a party the player is founding: where it stands on each issue, from one pole to the other.
 * A few ready-made starting points fill the whole thing in, and every issue can then be moved by hand.
 */
export function PlatformEditor({ stances, base, onChange }: { stances: number[]; base: number[]; onChange(next: number[]): void }) {
  const t = useT();
  const set = (i: number, to: number) => onChange(stances.map((s, j) => (j === i ? to : s)));
  return (
    <div className="platform">
      <span className="field-label">{t('platform.title')}</span>
      <p className="muted small">{t('platform.note')}</p>
      <div className="chips" role="group" aria-label={t('platform.presets')}>
        <button className="chip" onClick={() => onChange([...base])}>{t('platform.blank')}</button>
        {IDEOLOGY_IDS.map((id: IdeologyId) => (
          <button key={id} className="chip" onClick={() => onChange(shiftStances(base, id))}>{t(`ideology.${id}` as StringKey)}</button>
        ))}
      </div>
      {ISSUE_GROUPS.map(({ group, issues }) => (
        <div key={group}>
          <h4>{t(`issueGroup.${group}` as StringKey)}</h4>
          <ul className="issue-list">
            {issues.map((id) => {
              const i = ISSUE_IDS.indexOf(id);
              return (
                <li key={id} className="issue">
                  <div className="issue-head"><span className="action-title">{t(`issue.${id}` as StringKey)}</span></div>
                  <div className="issue-scale" role="group" aria-label={t(`issue.${id}` as StringKey)}>
                    <span className="pole">{t(`issue.${id}.lo` as StringKey)}</span>
                    {POSITIONS.map((pos) => (
                      <button key={pos} className={`pos${pos === stances[i] ? ' here' : ''}`} aria-pressed={pos === stances[i]} aria-label={t('policy.position', { n: pos + 3 })} onClick={() => set(i, pos)} />
                    ))}
                    <span className="pole">{t(`issue.${id}.hi` as StringKey)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
