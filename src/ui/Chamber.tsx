import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useStore } from '../state/store';
import { arrange, hemicycle, majorityTurn, pitch, sideCount, type Bloc, type Member, type Place, type Side } from './hemicycle';
import { partyColor, partyName, useT } from './hooks';
import { canDraw3D } from './map3d';

// The 3D chamber and the library behind it are fetched only where 3D is on; until they arrive the flat one stands in.
const ChamberScene3D = lazy(() => import('./ChamberScene3D'));

export interface ChamberProps {
  blocs: Bloc[];
  /** Seats that make a majority. */
  need: number;
  /** What each side is called, for the line under the chamber and the card of a party pointed at. */
  sides: Record<Side, string>;
  /** Parties declare their votes one after another, rather than all at once. */
  stagger?: boolean;
  /** The chamber fills party by party, the largest first: for the moment a result is declared. */
  reveal?: boolean;
}

/** What the scene, flat or 3D, is asked to draw. */
export interface ChamberView {
  places: Place[];
  members: Member[];
  /** How far round from the left the majority line falls. */
  line: number;
  need: number;
  hot: number | null;
  onHot(party: number | null): void;
  label: string;
}

const calm = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The House as a hemicycle, one mark for each seat: the side being counted fills from the left toward the majority line, the
 * other side from the right. Pointing at a seat picks out its whole party. In 3D where the player has it on, flat otherwise.
 */
export function Chamber({ blocs, need, sides, stagger, reveal }: ChamberProps) {
  const t = useT();
  const want3d = useStore((s) => s.settings.map3d);
  const [hot, setHot] = useState<number | null>(null);
  const total = blocs.reduce((a, b) => a + Math.round(b.seats), 0);

  // In a division the parties declare one at a time: each bloc's vote shows only once its turn has come.
  const voting = blocs.filter((b) => b.vote !== undefined && b.seats > 0);
  const key = voting.map((b) => `${b.party}${b.vote}`).join();
  const [declared, setDeclared] = useState(stagger && !calm() ? 0 : voting.length);
  useEffect(() => {
    if (!stagger || calm()) { setDeclared(voting.length); return; }
    setDeclared(0);
    const id = setInterval(() => setDeclared((n) => { if (n + 1 >= voting.length) clearInterval(id); return n + 1; }), 420);
    return () => clearInterval(id);
  }, [key, stagger]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = useMemo(() => {
    const said = new Set(voting.slice(0, declared).map((b) => b.party));
    return blocs.map((b) => (b.vote !== undefined && !said.has(b.party) ? { ...b, vote: undefined } : b));
  }, [blocs, declared]); // eslint-disable-line react-hooks/exhaustive-deps

  // A chamber that fills: the parties take their seats one after another, the largest first.
  const entering = useMemo(() => [...new Set([...blocs].sort((a, b) => b.seats - a.seats).map((b) => b.party))], [blocs]);
  const [seated, setSeated] = useState(reveal && !calm() ? 0 : entering.length);
  useEffect(() => {
    if (!reveal || calm()) { setSeated(entering.length); return; }
    setSeated(0);
    const id = setInterval(() => setSeated((n) => { if (n + 1 >= entering.length) clearInterval(id); return n + 1; }), 380);
    return () => clearInterval(id);
  }, [reveal, entering.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const filled = useMemo(() => {
    if (seated >= entering.length) return shown;
    const here = new Set(entering.slice(0, seated));
    return shown.map((b) => (here.has(b.party) ? b : { ...b, hidden: true }));
  }, [shown, seated, entering]);

  const places = useMemo(() => hemicycle(total), [total]);
  const members = useMemo(() => arrange(filled), [filled]);
  if (total === 0) return null;

  const left = sideCount(blocs, 'left'), right = sideCount(blocs, 'right');
  const ayes = shown.filter((b) => b.vote === 'aye').reduce((a, b) => a + b.seats, 0);
  const noes = shown.filter((b) => b.vote === 'no').reduce((a, b) => a + b.seats, 0);
  const picked = hot === null ? null : blocs.filter((b) => b.party === hot);
  const label = `${blocs.filter((b) => b.seats > 0).map((b) => `${partyName(t, b.party)} ${b.seats}`).join(', ')}. ${t('tally.majority', { n: need })}`;
  const view: ChamberView = { places, members, line: majorityTurn(total, need), need, hot, onHot: setHot, label };

  return (
    <div className="chamber">
      {want3d && canDraw3D()
        ? <Suspense fallback={<FlatChamber {...view} />}><ChamberScene3D {...view} partyColor={partyColor} /></Suspense>
        : <FlatChamber {...view} />}
      <p className="chamber-line" aria-live="polite">
        {picked && picked.length > 0 ? (
          <>
            <i className="dot" data-party={hot!} style={{ background: partyColor(hot!) }} />
            <strong>{partyName(t, hot!)}</strong> · {t('state.seats', { n: picked.reduce((a, b) => a + b.seats, 0) })} · {picked.map((b) => sides[b.side]).filter((s, i, all) => all.indexOf(s) === i).join(', ')}
          </>
        ) : voting.length > 0 ? (
          <><strong className="num">{t('chamber.ayes', { n: ayes })}</strong> · <span className="num">{t('chamber.noes', { n: noes })}</span> · <span className="muted">{t('tally.majority', { n: need })}</span></>
        ) : (
          <>
            <strong className={`num ${left >= need ? 'pos-text' : ''}`}>{sides.left} {left}</strong> · <span className="num">{sides.right} {right}</span>
            {total - left - right > 0 && <> · <span className="num muted">{sides.middle} {total - left - right}</span></>}
            {' '}· <span className="muted">{t('tally.majority', { n: need })}</span>
          </>
        )}
      </p>
    </div>
  );
}

/** The chamber as a flat drawing: the picture every player gets, and what stands in while the 3D one loads. */
function FlatChamber({ places, members, line, need, hot, onHot, label }: ChamberView) {
  const r = Math.max(0.012, pitch(places.length) * 0.4);
  const angle = Math.PI * (1 - line);
  const tip = { x: Math.cos(angle) * 1.07, y: Math.sin(angle) * 1.07 };
  return (
    <svg className="chamber-flat" viewBox="-1.1 -1.14 2.2 1.2" role="img" aria-label={label} onPointerLeave={() => onHot(null)}>
      <line className="chamber-majority" x1={Math.cos(angle) * 0.3} y1={-Math.sin(angle) * 0.3} x2={tip.x} y2={-tip.y} />
      <text className="chamber-need" x={tip.x} y={-tip.y - 0.025} textAnchor="middle">{need}</text>
      {members.map((m, i) => {
        const p = places[i];
        if (!p) return null;
        const cls = `seat-dot${m.hidden ? ' unseated' : ''}${m.vote ? ` ${m.vote}` : ''}${hot !== null && hot !== m.party ? ' dim' : ''}${hot === m.party ? ' hot' : ''}`;
        return (
          <circle
            key={`${m.party}:${m.k}`} className={cls} r={r} data-party={m.party} fill={partyColor(m.party)}
            style={{ transform: `translate(${p.x}px, ${-p.y}px)` }} onPointerEnter={() => onHot(m.party)}
          />
        );
      })}
    </svg>
  );
}
