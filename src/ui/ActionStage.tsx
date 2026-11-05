import { lazy, Suspense, useEffect } from 'react';
import { ADVISER_LOOK, leaderLook, ministerLook, modelFor } from './faces';
import { useStore } from '../state/store';
import { PARTY_IDS } from '../sim/types';
import { PARTIES } from '../data/parties';
import { useT, useWorld } from './hooks';
import { canDraw3D } from './Manager';
import { prefersCalm } from './useTypewriter';
import type { StringKey } from '../i18n/strings';

const Stage3D = lazy(() => import('./stage/Stage3D'));

/** How long a scene plays on the map before it clears itself, in milliseconds. */
export const STAGE_MS = 4200;

/**
 * A few seconds of 3D over the map each time the player does something: the leader at the ceramah, on the walkabout, in the town hall, on
 * the air and so on. A press anywhere on it ends it. Nothing plays for a player who asked for less motion or where 3D cannot be drawn.
 */
export function ActionStage() {
  const t = useT();
  const world = useWorld();
  const stage = useStore((s) => s.stage);
  const clear = useStore((s) => s.clearStage);
  const player = useStore((s) => s.game?.campaign.player ?? 0);
  const n = stage?.n;
  // The leader is drawn as a modelled person, by what they wear: start fetching that model, the rival's and the neighbours' while the player is still on the map.
  const mine = leaderLook(player);
  const mineKey = mine ? JSON.stringify(modelFor(mine.look, true)) : '';
  useEffect(() => {
    if (!canDraw3D() || prefersCalm()) return;
    const later = (window as unknown as { requestIdleCallback?: (f: () => void) => number }).requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 1500));
    later(() => {
      void import('./stage/Politician').then((m) => { if (mineKey.includes('"rig"')) m.preloadPolitician(JSON.parse(mineKey).id); m.preloadPolitician('rival'); }).catch(() => undefined);
      void import('./stage/StaticFigure').then((m) => { m.preloadStatic('baju'); m.preloadStatic('tudung'); }).catch(() => undefined);
    });
  }, [mineKey]);
  // the ballot box and the voting booth are 12 KB and 42 KB: they are fetched for everyone
  useEffect(() => {
    if (!canDraw3D() || prefersCalm()) return;
    const later = (window as unknown as { requestIdleCallback?: (f: () => void) => number }).requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 2500));
    later(() => { void import('./stage/BallotBox').then((m) => m.preloadBallotBox()).catch(() => undefined); void import('./stage/VotingBooth').then((m) => m.preloadVotingBooth()).catch(() => undefined); void import('./stage/Props').then((m) => m.preloadProps()).catch(() => undefined); void import('./stage/people').then((m) => { void m.loadPeople(); void m.loadTrinkets(); }).catch(() => undefined); });
  }, []);
  const playable = !!stage && canDraw3D() && !prefersCalm();
  useEffect(() => {
    if (!stage || !playable) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') clear(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage, playable, clear]);
  useEffect(() => {
    if (!stage) return;
    if (!playable) { clear(); return; }
    const timer = setTimeout(clear, STAGE_MS);
    return () => clearTimeout(timer);
    // a new action restarts the clock
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, playable]);
  if (!stage || !playable) return null;
  const me = leaderLook(player) ?? { look: ADVISER_LOOK, accent: PARTIES[PARTY_IDS[player]].color };
  // The one on the other side: the party attacked or debated, else the first other party with a leader of its own.
  const other = stage.party !== undefined && stage.party !== player ? stage.party : PARTY_IDS.findIndex((id, p) => p !== player && id !== 'oth' && !!leaderLook(p));
  const rival = (other >= 0 ? leaderLook(other) : null) ?? ministerLook(2, player);
  const place = stage.seat ? world.seats[world.seatIndex.get(stage.seat) ?? -1]?.name : undefined;
  const caption = `${t(`action.${stage.id}` as StringKey)}${place ? ` · ${place}` : ''}`;
  return (
    <div className="stage-overlay" key={stage.n} role="img" aria-label={caption} onClick={clear} style={{ ['--stage-ms' as string]: `${STAGE_MS}ms` }}>
      <Suspense fallback={null}><Stage3D id={stage.id} look={me.look} accent={me.accent} rival={rival} /></Suspense>
      <p className="stage-caption">{caption}</p>
      <span className="stage-skip">{t('stage.skip')}</span>
    </div>
  );
}
