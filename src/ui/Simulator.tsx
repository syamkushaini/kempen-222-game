import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getWorld, loadScenario, STATE_SCENARIOS } from '../data/world';
import type { World } from '../sim/election';
import { ISSUE_IDS, type Difficulty } from '../sim/campaign/types';
import {
  changeCounts, cleanConfig, defaultSimConfig, fieldedParties, focusable, simulate, spreadOf, type SimConfig, type SimResult,
} from '../sim/campaign/simulate';
import { PARTY_IDS } from '../sim/types';
import { useStore } from '../state/store';
import { partyName, useT } from './hooks';
import { Icon } from './Icon';
import { SimCoalition } from './SimCoalition';
import { SimConditions } from './SimConditions';
import { SimParties } from './SimParties';
import { SimResults, type CompareTo, type RunRecord, type SpreadRecord } from './SimResults';
import { Block, Slider } from './simControls';
import './simulator.css';

// The simulator: the whole contest, run with nobody at the controls. Everything that shapes it can be set, the contest is
// run, and then the settings can be changed and the contest run again to see what the change did.

type Tab = 'setup' | 'conditions' | 'parties' | 'coalition';
const TABS: Tab[] = ['setup', 'conditions', 'parties', 'coalition'];
const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];
const SCENARIOS = ['career', ...STATE_SCENARIOS.map((s) => `career:${s}`)];
const KEEP_RUNS = 30;
const STEP_MS = 650;

// ---------- what is kept on the device ----------

const SCENARIO_KEY = 'k222.sim.scenario';
const CONFIG_KEY = (scenario: string) => `k222.sim.cfg.${scenario}`;
const SLOTS_KEY = 'k222.sim.slots';

function read<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : null; } catch { return null; }
}
function write(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage is full or off: the simulator works without it */ }
}

interface Slot { name: string; at: number; cfg: SimConfig }

// ---------- quick scenarios ----------

interface Preset { id: string; apply(c: SimConfig, base: SimConfig, world: World): void }
const idx = (id: string) => PARTY_IDS.indexOf(id as (typeof PARTY_IDS)[number]);
const bump = (xs: number[], i: number, by: number, lo = -15, hi = 15) => { xs[i] = Math.max(lo, Math.min(hi, xs[i] + by)); };

/** Starting points for a what-if. Each is added on top of the settings as they stand. */
const PRESETS: Preset[] = [
  { id: 'wave', apply: (c) => { bump(c.mood, c.focus, 6); ['graft', 'reform', 'liberties'].forEach((k) => { const i = ISSUE_IDS.indexOf(k as never); c.salience[i] = Math.min(2, c.salience[i] + 0.4); }); } },
  { id: 'fatigue', apply: (c) => { bump(c.mood, c.government.pm, -6); c.government.partners.forEach((p) => bump(c.mood, p, -2.5)); } },
  { id: 'slump', apply: (c) => { c.economy = { growth: -2.5, inflation: 7.5, jobless: 7, debt: 95 }; } },
  { id: 'prices', apply: (c) => { c.economy = { ...c.economy, inflation: 7.5 }; ['subsidies', 'wages', 'taxes'].forEach((k) => { const i = ISSUE_IDS.indexOf(k as never); c.salience[i] = Math.min(2, c.salience[i] + 0.6); }); } },
  { id: 'youth', apply: (c) => { const ps = idx('ps'); bump(c.blocSwing[0], ps, 8); bump(c.turnoutBloc, 0, 8); bump(c.blocSwing[6], ps, 4); } },
  { id: 'borneo', apply: (c, _b, w) => { for (const st of ['sabah', 'sarawak']) if (c.stateSwing[st]) ['gbk', 'gbs', 'legasi'].forEach((id) => bump(c.stateSwing[st], idx(id), 8)); void w; } },
];

// ---------- the screen ----------

export function Simulator() {
  const t = useT();
  const setSimulating = useStore((s) => s.setSimulating);
  const startSandbox = useStore((s) => s.startSandbox);
  const [scenario, setScenario] = useState<string>(() => { const s = read<string>(SCENARIO_KEY); return s && SCENARIOS.includes(s) ? s : 'career'; });
  const [world, setWorld] = useState<World | null>(null);
  const [cfg, setCfg] = useState<SimConfig | null>(null);
  const [tab, setTab] = useState<Tab>('setup');
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [viewId, setViewId] = useState<number | null>(null);
  const [compareTo, setCompareTo] = useState<CompareTo>('prev');
  const [spreads, setSpreads] = useState<SpreadRecord[]>([]);
  const [head, setHead] = useState(Infinity);
  const [busy, setBusy] = useState<null | 'one' | { done: number; total: number }>(null);
  const [error, setError] = useState<string | null>(null);
  const [freshSeed, setFreshSeed] = useState(false);
  const [many, setMany] = useState(20);
  const counter = useRef(0);
  const cancel = useRef(false);
  const pending = useRef<unknown>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // The contest's results come from the server for a state; the country's are already here.
  useEffect(() => {
    let alive = true;
    setWorld(null);
    loadScenario(scenario).then(() => {
      if (!alive) return;
      const w = getWorld(scenario);
      if (!w) return;
      const stored = pending.current ?? read<unknown>(CONFIG_KEY(scenario));
      pending.current = null;
      setCfg(stored ? cleanConfig(w, stored) : defaultSimConfig(w));
      setWorld(w);
      setRuns([]); setSpreads([]); setViewId(null); setHead(Infinity);
    });
    return () => { alive = false; };
  }, [scenario]);

  useEffect(() => { write(SCENARIO_KEY, scenario); }, [scenario]);
  useEffect(() => { if (cfg && world && cfg.scenario === scenario) write(CONFIG_KEY(scenario), cfg); }, [cfg, world, scenario]);

  const base = useMemo(() => (world ? defaultSimConfig(world, cfg?.focus) : null), [world, cfg?.focus]);
  // What "unchanged" means is the contest as it opens, whoever is in focus.
  const original = useMemo(() => (world ? defaultSimConfig(world) : null), [world]);
  const parties = useMemo(() => (world ? fieldedParties(world) : []), [world]);
  const counts = useMemo(() => (cfg && original ? changeCounts(cfg, { ...original, focus: cfg.focus }) : null), [cfg, original]);

  const edit = useCallback((fn: (c: SimConfig) => void) => {
    setCfg((prev) => { if (!prev) return prev; const next = structuredClone(prev); fn(next); return next; });
  }, []);

  const view = runs.find((r) => r.id === viewId) ?? runs[runs.length - 1] ?? null;
  const spread = spreads[spreads.length - 1] ?? null;

  // The campaign plays out a week at a time on screen, and then the count.
  useEffect(() => {
    if (!view || head >= view.result.trend.length) return;
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) { setHead(Infinity); return; }
    const id = setTimeout(() => setHead((h) => h + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [head, view]);

  const scrollToResults = () => { if (typeof window !== 'undefined' && window.matchMedia?.('(max-width: 899px)').matches) resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  const runOnce = () => {
    if (!world || !cfg || busy) return;
    setBusy('one'); setError(null);
    const snap = structuredClone(cfg);
    setTimeout(() => {
      try {
        const result = simulate(world, snap);
        const rec: RunRecord = { id: ++counter.current, n: counter.current, cfg: snap, result };
        setRuns((rs) => [...rs, rec].slice(-KEEP_RUNS));
        setViewId(rec.id); setHead(0);
        if (freshSeed) edit((c) => { c.seed = (c.seed % 999_999) + 1; });
        scrollToResults();
      } catch (e) {
        setError(String(e instanceof Error ? e.message : e));
      } finally { setBusy(null); }
    }, 30);
  };

  const runMany = () => {
    if (!world || !cfg || busy) return;
    cancel.current = false; setError(null);
    const snap = structuredClone(cfg);
    const results: SimResult[] = [];
    setBusy({ done: 0, total: many });
    const step = (i: number) => {
      if (cancel.current) { setBusy(null); return; }
      try {
        results.push(simulate(world, { ...snap, seed: snap.seed + i }));
      } catch (e) { setError(String(e instanceof Error ? e.message : e)); setBusy(null); return; }
      if (i + 1 < many) { setBusy({ done: i + 1, total: many }); setTimeout(() => step(i + 1), 0); return; }
      const id = counter.current + 1000 + spreads.length;
      setSpreads((ss) => [...ss, { id, n: ss.length + 1, cfg: snap, spread: spreadOf(results, parties), focus: snap.focus }].slice(-6));
      setBusy(null);
      scrollToResults();
    };
    setTimeout(() => step(0), 30);
  };

  const restore = (run: RunRecord) => { setCfg(structuredClone(run.cfg)); setTab('setup'); };

  if (!world || !cfg || !base || !original || !counts) {
    return <main className="simulator"><p className="muted">{t('app.loading')}</p></main>;
  }

  const running = busy !== null;
  const busyMany = busy !== null && busy !== 'one';

  return (
    <main className="simulator">
      <header className="sim-top">
        <button type="button" className="link back-link" onClick={() => setSimulating(false)}><Icon name="back" size={14} /> {t('menu.back')}</button>
        <div>
          <h2>{t('sim.title')}</h2>
          <p className="muted small">{t('sim.intro')}</p>
        </div>
      </header>

      <div className="sim-layout">
        <section className="sim-editor panel" aria-label={t('sim.editor')}>
          <div className="segmented sim-tabs" role="tablist" aria-label={t('sim.editor')}>
            {TABS.map((id) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
                {t(`sim.tab.${id}`)}{counts[id] > 0 && <b className="sim-count" aria-label={t('sim.changes', { n: counts[id] })}>{counts[id]}</b>}
              </button>
            ))}
          </div>

          {tab === 'setup' && <SetupTab world={world} cfg={cfg} base={base} edit={edit} scenario={scenario} onScenario={setScenario} freshSeed={freshSeed} setFreshSeed={setFreshSeed}
            counts={counts} onReset={() => setCfg(defaultSimConfig(world, cfg.focus))} onLoad={(raw) => { if (raw.scenario && raw.scenario !== scenario && SCENARIOS.includes(raw.scenario)) { pending.current = raw; setScenario(raw.scenario); } else setCfg(cleanConfig(world, raw)); }} />}
          {tab === 'conditions' && <SimConditions world={world} cfg={cfg} base={base} edit={edit} parties={parties} />}
          {tab === 'parties' && <SimParties world={world} cfg={cfg} base={base} edit={edit} parties={parties} />}
          {tab === 'coalition' && <SimCoalition world={world} cfg={cfg} base={base} edit={edit} parties={parties} />}
        </section>

        <aside className="sim-side">
          <div className="sim-runbar panel">
            <button type="button" className="btn primary sim-run-btn" disabled={running} onClick={runOnce}>
              <Icon name="play" size={16} /> {busy === 'one' ? t('sim.running') : runs.length === 0 ? t('sim.run.first') : t('sim.run.again')}
            </button>
            <div className="sim-many">
              <select aria-label={t('sim.many.count')} value={many} disabled={running} onChange={(e) => setMany(Number(e.target.value))}>
                {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{t('sim.many.times', { n })}</option>)}
              </select>
              {busyMany
                ? <button type="button" className="btn small" onClick={() => { cancel.current = true; }}>{t('sim.cancel')}</button>
                : <button type="button" className="btn small" disabled={running} onClick={runMany}>{t('sim.many.run')}</button>}
            </div>
            {busyMany && typeof busy === 'object' && busy && <progress className="sim-progress" max={busy.total} value={busy.done} aria-label={t('sim.many.progress', { done: busy.done, total: busy.total })} />}
            <button type="button" className="btn sim-play" disabled={running} onClick={() => startSandbox(structuredClone(cfg))} title={t('sim.play.hint')}>{t('sim.play')}</button>
            <p className="small muted sim-runnote">{counts.total > 0 ? t('sim.changed', { n: counts.total }) : t('sim.unchanged')} · {t('sim.seed')} {cfg.seed}</p>
            {error && <p className="small bad" role="alert">{error}</p>}
          </div>
          <div ref={resultsRef} className="sim-results-anchor">
          <SimResults
            world={world} runs={runs} view={view} compareTo={compareTo} onCompare={setCompareTo} onView={(id) => { setViewId(id); setHead(Infinity); }} onRestore={restore}
            head={head} onSkip={() => setHead(Infinity)} spread={spread} previousSpread={spreads[spreads.length - 2] ?? null} parties={parties}
          />
          </div>
        </aside>
      </div>
    </main>
  );
}

// ---------- the first tab ----------

function SetupTab({ world, cfg, base, edit, scenario, onScenario, freshSeed, setFreshSeed, counts, onReset, onLoad }: {
  world: World; cfg: SimConfig; base: SimConfig; edit(fn: (c: SimConfig) => void): void; scenario: string; onScenario(s: string): void;
  freshSeed: boolean; setFreshSeed(b: boolean): void; counts: { total: number }; onReset(): void; onLoad(raw: SimConfig): void;
}) {
  const t = useT();
  const focuses = focusable(world);
  const [slots, setSlots] = useState<Slot[]>(() => read<Slot[]>(SLOTS_KEY) ?? []);
  const [name, setName] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const keep = (next: Slot[]) => { setSlots(next); write(SLOTS_KEY, next); };
  const save = () => {
    const label = name.trim() || t('sim.slot.default', { n: slots.length + 1 });
    keep([{ name: label, at: Date.now(), cfg: structuredClone(cfg) }, ...slots.filter((s) => s.name !== label)].slice(0, 20));
    setName(''); setNote(t('sim.slot.saved', { name: label }));
  };
  const download = () => {
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `kempen222-sim-${scenario.replace(':', '-')}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const upload = async (f: File | undefined) => {
    if (!f) return;
    try { onLoad(JSON.parse(await f.text()) as SimConfig); setNote(t('sim.import.ok')); } catch { setNote(t('sim.import.bad')); }
  };

  return (
    <div className="sim-tab">
      <Block title={t('sim.contest')} open note={t('sim.contest.note')}>
        <label className="field">
          <span>{t('sim.contest')}</span>
          <select value={scenario} onChange={(e) => onScenario(e.target.value)}>
            {SCENARIOS.map((s) => <option key={s} value={s}>{s === 'career' ? t('sim.contest.general') : t('sim.contest.state', { state: t(`state.${s.slice(7)}` as never) })}</option>)}
          </select>
        </label>
        <label className="field">
          <span>{t('sim.focus')}</span>
          <select value={cfg.focus} onChange={(e) => edit((c) => { c.focus = Number(e.target.value); })}>
            {focuses.map((p) => <option key={p} value={p}>{partyName(t, p)}</option>)}
          </select>
          <small className="muted">{t('sim.focus.note')}</small>
        </label>
        <span className="field-label">{t('sim.difficulty')}</span>
        <div className="segmented small" role="radiogroup" aria-label={t('sim.difficulty')}>
          {DIFFICULTIES.map((d) => (
            <button key={d} type="button" role="radio" aria-checked={cfg.difficulty === d} className={cfg.difficulty === d ? 'active' : ''} onClick={() => edit((c) => { c.difficulty = d; })}>{t(`difficulty.${d}`)}</button>
          ))}
        </div>
        <p className="small muted">{t(`difficulty.${cfg.difficulty}.hint`)}</p>
        <Slider label={t('sim.weeks')} hint={t('sim.weeks.hint')} value={cfg.weeks ?? world.rules.weeks} def={world.rules.weeks} min={2} max={16} step={1}
          fmt={(v) => t('sim.weeks.n', { n: v })} onChange={(v) => edit((c) => { c.weeks = v === world.rules.weeks ? null : v; })} />
      </Block>

      <Block title={t('sim.seedTitle')} open note={t('sim.seed.note')}>
        <div className="sim-seed">
          <label className="field">
            <span>{t('sim.seed')}</span>
            <input type="number" min={1} max={2147483647} value={cfg.seed} onChange={(e) => { const n = Math.round(Number(e.target.value)); if (Number.isFinite(n) && n >= 1) edit((c) => { c.seed = n; }); }} />
          </label>
          <button type="button" className="btn small" onClick={() => edit((c) => { c.seed = 1 + Math.floor(Math.random() * 999_999); })}>{t('sim.seed.roll')}</button>
        </div>
        <label className="sim-check">
          <input type="checkbox" checked={freshSeed} onChange={(e) => setFreshSeed(e.target.checked)} />
          <span><strong>{t('sim.seed.fresh')}</strong><span className="small muted"> {t('sim.seed.fresh.hint')}</span></span>
        </label>
      </Block>

      <Block title={t('sim.presets')} note={t('sim.presets.note')} open>
        <div className="sim-presets">
          {PRESETS.map((p) => (
            <button key={p.id} type="button" className="sim-preset" onClick={() => edit((c) => p.apply(c, base, world))}>
              <strong>{t(`sim.preset.${p.id}` as never)}</strong>
              <span className="small muted">{t(`sim.preset.${p.id}.desc` as never)}</span>
            </button>
          ))}
        </div>
      </Block>

      <Block title={t('sim.slots')} note={t('sim.slots.note')}>
        <div className="sim-slot-add">
          <input type="text" value={name} maxLength={40} placeholder={t('sim.slot.name')} aria-label={t('sim.slot.name')} onChange={(e) => setName(e.target.value)} />
          <button type="button" className="btn small primary" onClick={save}>{t('sim.slot.save')}</button>
        </div>
        {slots.length === 0 && <p className="small muted">{t('sim.slot.none')}</p>}
        <ul className="sim-slots">
          {slots.map((s) => (
            <li key={s.name}>
              <span>{s.name} <span className="small muted">· {s.cfg.scenario === 'career' ? t('sim.contest.general') : t('sim.contest.state', { state: t(`state.${s.cfg.scenario.slice(7)}` as never) })}</span></span>
              <span className="sim-slot-actions">
                <button type="button" className="btn small" onClick={() => onLoad(s.cfg)}>{t('sim.slot.load')}</button>
                <button type="button" className="btn small" aria-label={t('sim.slot.delete', { name: s.name })} onClick={() => keep(slots.filter((x) => x !== s))}>×</button>
              </span>
            </li>
          ))}
        </ul>
        <div className="button-row">
          <button type="button" className="btn small" onClick={download}>{t('sim.export')}</button>
          <button type="button" className="btn small" onClick={() => file.current?.click()}>{t('sim.import')}</button>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ''; }} />
        </div>
        {note && <p className="small" role="status">{note}</p>}
      </Block>

      <p>
        <button type="button" className="btn" disabled={counts.total === 0 && cfg.seed === 1} onClick={onReset}>{t('sim.reset.all')}</button>
      </p>
    </div>
  );
}
