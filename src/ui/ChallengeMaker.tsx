import { useEffect, useMemo, useState } from 'react';
import { PARTIES } from '../data/parties';
import { byElectionId, getWorld, loadScenario, STATE_SCENARIOS } from '../data/world';
import type { StringKey } from '../i18n/strings';
import { challengeLink, encodeChallenge, WEEKS_MAX, WEEKS_MIN, type ChallengeSpec } from '../sim/campaign/challengeCode';
import { playable } from '../sim/campaign/field';
import type { Difficulty } from '../sim/campaign/types';
import { PARTY_IDS } from '../sim/types';
import { randomSeed } from '../sim/rng';
import { useStore } from '../state/store';
import { contestName, partyName, useT, type T } from './hooks';

const LEVELS: Difficulty[] = ['easy', 'normal', 'hard'];
const WEEKS = [undefined, ...Array.from({ length: WEEKS_MAX - WEEKS_MIN + 1 }, (_, i) => WEEKS_MIN + i)];
const CONTESTS = ['general', 'hung', ...STATE_SCENARIOS.map((s) => `state:${s}`), 'byelection'];

/** What a rule is called, for a list of the rules a challenge has. */
const rulesOf = (t: T, s: Pick<ChallengeSpec, 'fog' | 'noisy' | 'lean' | 'weeks'>): string[] => [
  ...(s.fog ? [t('challenge.fog')] : []), ...(s.noisy ? [t('challenge.noisy')] : []), ...(s.lean ? [t('challenge.make.lean')] : []),
  ...(s.weeks !== undefined ? [t('challenge.make.weeks.n', { n: s.weeks })] : []),
];

/** The name of a contest as a player would pick it. */
const contestLabel = (t: T, id: string): string =>
  id === 'general' ? t('scenario.general') : id === 'hung' ? t('scenario.hung') : id === 'byelection' ? t('scenario.byelection') : `${t('scenario.state')} · ${t(`state.${id.slice('state:'.length)}` as StringKey)}`;

/** Whether the scenario of a spec, once loaded, can be played in as that party. */
export function playableAs(spec: Pick<ChallengeSpec, 'scenario' | 'party'>): boolean {
  const world = getWorld(spec.scenario);
  return !!world && !world.rules.career && playable(world).includes(PARTY_IDS.indexOf(spec.party));
}

/** Copies text; false if the browser would not allow it. */
async function copy(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

/** A button that copies a link to a challenge and says so. */
export function CopyLink({ code }: { code: string }) {
  const t = useT();
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  useEffect(() => { if (state === 'idle') return; const id = setTimeout(() => setState('idle'), 2500); return () => clearTimeout(id); }, [state]);
  return (
    <>
      <button className="btn small" onClick={() => void copy(challengeLink(code, location.href)).then((ok) => setState(ok ? 'copied' : 'failed'))}>
        {state === 'copied' ? t('challenge.make.copied') : t('challenge.make.copy')}
      </button>
      {state === 'failed' && <span className="note" role="alert">{t('challenge.make.copyFailed')}</span>}
    </>
  );
}

/** Makes a challenge: a contest, a party, a seed and some rules, with a link to send. */
export function ChallengeMaker() {
  const t = useT();
  const startChallenge = useStore((s) => s.startChallenge);
  const [contest, setContest] = useState('general');
  const [seat, setSeat] = useState('P.094');
  const [party, setParty] = useState('ps');
  const [difficulty, setDifficulty] = useState<Difficulty>('hard');
  const [fog, setFog] = useState(false);
  const [noisy, setNoisy] = useState(false);
  const [lean, setLean] = useState(false);
  const [weeks, setWeeks] = useState<number | undefined>(undefined);
  const [seed, setSeed] = useState(() => randomSeed());
  const scenario = contest === 'byelection' ? byElectionId(seat) : contest;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    setReady(false);
    void loadScenario(scenario).then(() => { if (live) setReady(true); });
    return () => { live = false; };
  }, [scenario]);
  const world = ready ? getWorld(scenario) : null;
  const parties = useMemo(() => (world ? playable(world).map((p) => PARTY_IDS[p]) : []), [world]);
  // A party that cannot be led in this contest is swapped for one that can.
  useEffect(() => { if (parties.length > 0 && !parties.includes(party as never)) setParty(parties[0]); }, [parties, party]);
  const seats = useMemo(() => getWorld('general')?.seats.map((s) => ({ id: s.id, name: s.name })).sort((a, b) => a.name.localeCompare(b.name)) ?? [], []);
  const spec: ChallengeSpec = { scenario, party: party as ChallengeSpec['party'], seed, difficulty, fog, noisy, lean, ...(weeks !== undefined ? { weeks } : {}) };
  const code = encodeChallenge(spec);
  const can = !!world && parties.includes(spec.party);

  return (
    <details className="challenges maker">
      <summary><h3>{t('challenge.make.title')}</h3></summary>
      <p className="muted small">{t('challenge.make.intro')}</p>
      <div className="maker-form">
        <label className="field-label" htmlFor="mk-contest">{t('challenge.make.contest')}</label>
        <select id="mk-contest" className="text-input" value={contest} onChange={(e) => setContest(e.target.value)}>
          {CONTESTS.map((id) => <option key={id} value={id}>{contestLabel(t, id)}</option>)}
        </select>
        {contest === 'byelection' && (
          <>
            <label className="field-label" htmlFor="mk-seat">{t('challenge.make.seat')}</label>
            <select id="mk-seat" className="text-input" value={seat} onChange={(e) => setSeat(e.target.value)}>
              {seats.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </>
        )}
        <label className="field-label" htmlFor="mk-party">{t('challenge.make.party')}</label>
        <select id="mk-party" className="text-input" value={party} disabled={!world} onChange={(e) => setParty(e.target.value)}>
          {!world && <option>{t('challenge.make.loading')}</option>}
          {parties.map((id) => <option key={id} value={id}>{PARTIES[id].name}</option>)}
        </select>
        <span className="field-label">{t('title.difficulty')}</span>
        <div className="segmented" role="group" aria-label={t('title.difficulty')}>
          {LEVELS.map((d) => <button key={d} className={difficulty === d ? 'active' : ''} aria-pressed={difficulty === d} onClick={() => setDifficulty(d)}>{t(`difficulty.${d}`)}</button>)}
        </div>
        <span className="field-label">{t('challenge.make.rules')}</span>
        <label className="check"><input type="checkbox" checked={fog} onChange={(e) => setFog(e.target.checked)} /><span>{t('challenge.fog')}</span></label>
        <label className="check"><input type="checkbox" checked={noisy} onChange={(e) => setNoisy(e.target.checked)} /><span>{t('challenge.noisy')}</span></label>
        <label className="check"><input type="checkbox" checked={lean} onChange={(e) => setLean(e.target.checked)} /><span>{t('challenge.make.lean')}</span></label>
        {lean && <p className="muted small">{t('challenge.make.lean.desc')}</p>}
        {contest !== 'hung' && (
          <>
            <label className="field-label" htmlFor="mk-weeks">{t('challenge.make.weeks')}</label>
            <select id="mk-weeks" className="text-input" value={weeks ?? ''} onChange={(e) => setWeeks(e.target.value === '' ? undefined : Number(e.target.value))}>
              {WEEKS.map((n) => <option key={n ?? 'usual'} value={n ?? ''}>{n === undefined ? t('challenge.make.weeks.usual') : t('challenge.make.weeks.n', { n })}</option>)}
            </select>
          </>
        )}
        <label className="field-label" htmlFor="mk-seed">{t('challenge.make.seed')}</label>
        <div className="post-row">
          <input id="mk-seed" className="text-input" inputMode="numeric" value={seed} onChange={(e) => { const n = Number(e.target.value.replace(/\D/g, '').slice(0, 10)); setSeed(Math.min(n, 0xffffffff)); }} />
          <button className="btn small" onClick={() => setSeed(randomSeed())}>{t('challenge.make.seed.new')}</button>
        </div>
        <span className="field-label">{t('challenge.make.code')}</span>
        <code className="challenge-code" tabIndex={0}>{code}</code>
        <div className="mission-buttons">
          <button className="btn primary" disabled={!can} onClick={() => startChallenge(spec)}>{t('challenge.make.play')} ▸</button>
          <CopyLink code={code} />
        </div>
      </div>
    </details>
  );
}

/** A challenge sent as a link: what it asks, and a choice of playing it. */
export function ChallengeInvite() {
  const t = useT();
  const spec = useStore((s) => s.pendingChallenge);
  const set = useStore((s) => s.setPendingChallenge);
  const start = useStore((s) => s.startChallenge);
  const [state, setState] = useState<'loading' | 'ok' | 'bad'>('loading');
  useEffect(() => {
    if (!spec) return;
    let live = true;
    setState('loading');
    void loadScenario(spec.scenario).then(() => { if (live) setState(playableAs(spec) ? 'ok' : 'bad'); });
    return () => { live = false; };
  }, [spec]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') set(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [set]);
  if (!spec) return null;
  const world = state === 'ok' ? getWorld(spec.scenario) : null;
  const rules = rulesOf(t, spec);
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) set(null); }}>
      <div className="dialog panel" role="dialog" aria-modal="true" aria-label={t('challenge.invite.title')}>
        <h2>{t('challenge.invite.title')}</h2>
        {state === 'loading' && <p className="muted" role="status">{t('challenge.make.loading')}</p>}
        {state === 'bad' && <p role="alert">{t('challenge.invite.bad')}</p>}
        {world && (
          <>
            <p>{t('challenge.invite.body', { contest: `${contestLabel(t, spec.scenario.startsWith('byelection') ? 'byelection' : spec.scenario)}: ${contestName(t, world)}`, party: partyName(t, PARTY_IDS.indexOf(spec.party)), level: t(`difficulty.${spec.difficulty}`) })}</p>
            <p className="muted">{t('challenge.invite.rules', { rules: rules.length ? rules.join(', ') : t('challenge.invite.rules.none') })}</p>
          </>
        )}
        <div className="mission-buttons">
          {state === 'ok' && <button className="btn primary" autoFocus onClick={() => start(spec)}>{t('challenge.invite.play')} ▸</button>}
          <button className="btn" onClick={() => set(null)}>{t('challenge.invite.later')}</button>
        </div>
      </div>
    </div>
  );
}
