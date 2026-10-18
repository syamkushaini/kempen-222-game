import { useEffect, useRef, useState } from 'react';
import { Icon, type IconName } from './Icon';

export interface GroupEntry { id: string; label: string; icon: IconName; waiting: number; waitingLabel: string; spot: boolean }

/**
 * The groups of tabs, as one button that opens a short list, so that the side column shows the name of where the player is and not
 * seven names at once. A badge on the button says when another group has something waiting.
 */
export function GroupMenu({ groups, current, onPick, label }: { groups: GroupEntry[]; current: string; onPick(id: string): void; label: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', key); };
  }, [open]);
  const here = groups.find((g) => g.id === current) ?? groups[0];
  const elsewhere = groups.filter((g) => g.id !== here.id).reduce((a, g) => a + g.waiting, 0);
  return (
    <div className="group-menu" ref={root}>
      <button type="button" className={`group-menu-btn${here.spot ? ' spot' : ''}`} aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={() => setOpen(!open)}>
        <Icon name={here.icon} size={20} />
        <span className="tab-name">{here.label}</span>
        {elsewhere > 0 && <span className="count-badge" aria-label={here.waitingLabel}>{elsewhere}</span>}
        <span className="group-menu-chevron" aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul className="group-menu-list" role="menu">
          {groups.map((g, n) => (
            <li key={g.id} role="none">
              <button type="button" role="menuitem" className={`${g.id === here.id ? 'active' : ''}${g.spot ? ' spot' : ''}`} onClick={() => { setOpen(false); if (g.id !== here.id) onPick(g.id); }}>
                <Icon name={g.icon} size={18} />
                <span className="tab-name">{g.label}</span>
                {g.waiting > 0 && g.id !== here.id && <span className="count-badge" aria-label={g.waitingLabel}>{g.waiting}</span>}
                <kbd>{n + 1}</kbd>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
