import { useEffect, useMemo, useRef } from 'react';
import { Fall3D } from './fall3d';
import { arrange, hemicycle, type Bloc } from './hemicycle';
import { partyColor, partyName, useT } from './hooks';

/** How long the House stands before the benches go, and how long the moment lasts in all. */
const HOLD_MS = 900, WHOLE_MS = 5200;

/**
 * A government has lost the House. For a few seconds the chamber fills the screen and the government's benches come
 * down. A tap or a key ends it early. Shown only where 3D is on and motion is welcome; the news says the same in words.
 */
export default function GovernmentFalls({ blocs, party, onDone }: { blocs: Bloc[]; party: number; onDone(): void }) {
  const t = useT();
  const host = useRef<HTMLDivElement>(null);
  const members = useMemo(() => arrange(blocs), [blocs]);
  const places = useMemo(() => hemicycle(members.length), [members.length]);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (!host.current) return;
    const scene = new Fall3D(host.current, places, members, partyColor);
    const go = setTimeout(() => scene.release(), HOLD_MS);
    const end = setTimeout(() => done.current(), WHOLE_MS);
    const key = () => done.current();
    window.addEventListener('keydown', key);
    return () => { clearTimeout(go); clearTimeout(end); window.removeEventListener('keydown', key); scene.dispose(); };
  }, [places, members]);

  return (
    <div className="overlay fall" role="dialog" aria-modal="true" aria-label={t('fall.title')} onClick={() => onDone()}>
      <div className="fall-stage" ref={host} />
      <div className="fall-words">
        <h2>{t('fall.title')}</h2>
        <p>{t('fall.body', { party: partyName(t, party) })}</p>
        <p className="muted small">{t('fall.skip')}</p>
      </div>
    </div>
  );
}
