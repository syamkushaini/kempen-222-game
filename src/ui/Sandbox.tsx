import { useEffect, useRef, useState } from 'react';
import { PARTIES } from '../data/parties';
import { FISCAL_ROOM, ISSUE_GROUPS, MAX_PLEDGES, PLEDGES, manifestoCost } from '../sim/campaign/policy';
import { skill, stat } from '../sim/campaign/perks';
import { pledgesIn, POINT } from '../sim/campaign/simulate';
import { ISSUE_IDS, ROLE_IDS, STAT_IDS, type Campaign, type PledgeId, type RoleId } from '../sim/campaign/types';
import { BLOC_IDS, N_BLOCS, PARTY_IDS } from '../sim/types';
import { useStore } from '../state/store';
import { partyName, regionLabel, useFormat, useT, useWorld } from './hooks';
import { Icon } from './Icon';
import { Block, Matrix, PartyChips, Slider, signed, type SliderProps } from './simControls';
import './simulator.css';
import { useBackClose } from './backClose';

// The sandbox: a game played with every setting open. This panel changes anything about the game as it stands, for any party,
// and every change can be taken back with Undo.

type Tab = 'party' | 'country' | 'talks';
const TABS: Tab[] = ['party', 'country', 'talks'];
const POSITIONS = [-2, -1, 0, 1, 2] as const;

const round1 = (v: number) => Math.round(v * 10) / 10;
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);

/** A slider that waits a moment after it stops moving before it changes the game, so that dragging it stays smooth. */
function Live({ value, onCommit, ...rest }: Omit<SliderProps, 'def' | 'onChange'> & { onCommit(v: number): void }) {
  const [shown, setShown] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => setShown(value), [value]);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <Slider
      {...rest} value={shown} def={value}
      onChange={(v) => { setShown(v); clearTimeout(timer.current); timer.current = setTimeout(() => onCommit(v), 120); }}
    />
  );
}

/** The button that opens the panel, and the panel. Present only in a sandbox game. */
export function Sandbox() {
  const t = useT();
  const sandbox = useStore((s) => !!s.game?.campaign.sim?.sandbox);
  const [open, setOpen] = useState(false);
  const undo = useStore((s) => s.sandboxUndo);
  const canUndo = useStore((s) => s.undoStack.length > 0);
  if (!sandbox) return null;
  return (
    <>
      <div className="sandbox-fab">
        <button type="button" className="btn primary" aria-expanded={open} onClick={() => setOpen(!open)}><Icon name="sliders" size={16} /> {t('sandbox.open')}</button>
        {!open && <button type="button" className="btn" disabled={!canUndo} onClick={undo} aria-label={t('sandbox.undo')} title={t('sandbox.undo')}>↶ {t('sandbox.undo')}</button>}
      </div>
      {open && <Panel onClose={() => setOpen(false)} />}
    </>
  );
}

function Panel({ onClose }: { onClose(): void }) {
  useBackClose(onClose);
  const t = useT();
  const [tab, setTab] = useState<Tab>('party');
  const undo = useStore((s) => s.sandboxUndo);
  const canUndo = useStore((s) => s.undoStack.length > 0);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <aside className="sandbox-panel panel" aria-label={t('sandbox.title')}>
      <header className="sandbox-head">
        <div>
          <h3>{t('sandbox.title')}</h3>
          <p className="small muted">{t('sandbox.note')}</p>
        </div>
        <span className="sandbox-head-actions">
          <button type="button" className="btn small" disabled={!canUndo} onClick={undo}>↶ {t('sandbox.undo')}</button>
          <button type="button" className="btn small" onClick={onClose} aria-label={t('sandbox.close')}>×</button>
        </span>
      </header>
      <div className="segmented sim-tabs" role="tablist" aria-label={t('sandbox.title')}>
        {TABS.map((id) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{t(`sandbox.tab.${id}`)}</button>)}
      </div>
      {tab === 'party' && <PartyTab />}
      {tab === 'country' && <CountryTab />}
      {tab === 'talks' && <TalksTab />}
    </aside>
  );
}

/** The parties on the field in this contest. */
const onField = (c: Campaign) => c.parties.map((pc, p) => (pc ? p : -1)).filter((p) => p >= 0);

/** Sets a rival's setting, making room for it in the simulator's overrides. */
function hooks(c: Campaign) { return (c.sim ??= {}); }

function PartyTab() {
  const t = useT();
  const f = useFormat();
  const c = useStore((s) => s.game!.campaign);
  const edit = useStore((s) => s.sandboxEdit);
  const parties = onField(c);
  const [chosen, setChosen] = useState(c.player);
  const p = parties.includes(chosen) ? chosen : c.player;
  const pc = c.parties[p]!;
  const k = c.career!;
  const mine = p === c.player;
  const credibility = mine ? k.credibility : c.sim?.credibility?.[p] ?? 60;
  const picks = k.manifesto[p] ?? [];
  const cost = manifestoCost(picks);
  const offered = pledgesIn(c.scenario);

  const setLeader = (i: number, v: number) => edit((g) => {
    if (p === g.player) { g.team.leader.stats[i] = v; return; }
    const h = hooks(g);
    const row = [...(h.leaders?.[p] ?? STAT_IDS.map((id) => stat(g, p, id)))];
    row[i] = v;
    (h.leaders ??= [])[p] = row;
  });
  const setStaff = (j: number, v: number) => edit((g) => {
    if (p === g.player) { g.team.staff[j] = v > 0 ? { name: j, skill: v, skeleton: false, vetted: true } : null; return; }
    const h = hooks(g);
    (h.staff ??= [])[p] = { ...(h.staff?.[p] ?? Object.fromEntries(ROLE_IDS.map((r) => [r, skill(g, p, r)]))), [ROLE_IDS[j]]: v } as Partial<Record<RoleId, number>>;
  });
  const setCredibility = (v: number) => edit((g) => { if (p === g.player) g.career!.credibility = v; else (hooks(g).credibility ??= [])[p] = v; });
  const pledge = (id: PledgeId) => edit((g) => {
    const list = g.career!.manifesto[p];
    g.career!.manifesto[p] = list.includes(id) ? list.filter((x) => x !== id) : list.length < MAX_PLEDGES ? [...list, id] : list;
  });

  return (
    <div className="sim-tab">
      <PartyChips parties={parties} value={p} onChange={setChosen} />
      <p className="small muted">{partyName(t, p)}{mine ? ` · ${t('sandbox.yours')}` : ''}</p>

      <Block title={t('sandbox.resources')} open>
        <Live label={t('sim.funds')} value={pc.funds} min={0} max={Math.max(5_000_000, Math.round(pc.funds * 2))} step={10_000} fmt={(v) => f.rm(v)} onCommit={(v) => edit((g) => { g.parties[p]!.funds = Math.round(v); })} />
        <div className="button-row">
          {[100_000, 1_000_000, 10_000_000].map((n) => <button key={n} type="button" className="btn small" onClick={() => edit((g) => { g.parties[p]!.funds += n; })}>+{f.rm(n)}</button>)}
        </div>
        <Live label={t('sandbox.days')} value={pc.days} min={0} max={Math.max(7, pc.capacity + 7)} step={0.5} fmt={(v) => f.days(v)} onCommit={(v) => edit((g) => { g.parties[p]!.days = v; })} />
        <button type="button" className="btn small" onClick={() => edit((g) => { g.parties[p]!.days = g.parties[p]!.capacity + 7; })}>{t('sandbox.refill')}</button>
        <Live label={t('sim.unity')} value={pc.unity} min={0} max={100} step={1} onCommit={(v) => edit((g) => { g.parties[p]!.unity = v; })} />
        <Live label={t('sim.credibility')} value={credibility} min={0} max={100} step={1} onCommit={setCredibility} />
      </Block>

      <Block title={t('sim.leader')}>
        {STAT_IDS.map((id, i) => <Live key={id} label={t(`stat.${id}`)} hint={t(`sim.stat.${id}`)} value={stat(c, p, id)} min={1} max={5} step={1} onCommit={(v) => setLeader(i, v)} />)}
        <h4 className="sim-sub">{t('sim.team')}</h4>
        {ROLE_IDS.map((id, j) => <Live key={id} label={t(`role.${id}`)} value={skill(c, p, id)} min={0} max={5} step={1} onCommit={(v) => setStaff(j, v)} />)}
      </Block>

      <Block title={t('sim.positions')} note={t('sandbox.positions.note')}>
        {ISSUE_GROUPS.map(({ group, issues }) => (
          <div key={group}>
            <h4 className="sim-sub">{t(`issueGroup.${group}`)}</h4>
            {issues.map((id) => {
              const i = ISSUE_IDS.indexOf(id);
              return (
                <div key={id} className="sim-issue">
                  <div className="sim-slider-head"><span className="sim-slider-label">{t(`issue.${id}`)}</span></div>
                  <div className="sim-scale" role="group" aria-label={t(`issue.${id}`)}>
                    <span className="pole">{t(`issue.${id}.lo`)}</span>
                    {POSITIONS.map((pos) => (
                      <button key={pos} type="button" className={`pos${pos === k.stances[p][i] ? ' here' : ''}${pos === k.stances0[p][i] ? ' began' : ''}`} aria-pressed={pos === k.stances[p][i]}
                        aria-label={t('policy.position', { n: pos + 3 })} onClick={() => edit((g) => { g.career!.stances[p][i] = pos; })} />
                    ))}
                    <span className="pole">{t(`issue.${id}.hi`)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </Block>

      <Block title={t('sim.manifesto')} note={t('sandbox.manifesto.note')}>
        <p className="sim-readout">{t('manifesto.count')}: <b className="num">{picks.length}/{MAX_PLEDGES}</b> · {t('manifesto.cost')}: <b className={cost > FISCAL_ROOM ? 'bad num' : 'num'}>{cost}/{FISCAL_ROOM}</b></p>
        <div className="sim-pledges">
          {offered.map((id) => {
            const on = picks.includes(id);
            return (
              <button key={id} type="button" className={`sim-pledge${on ? ' on' : ''}`} aria-pressed={on} disabled={!on && picks.length >= MAX_PLEDGES} onClick={() => pledge(id)}>
                <strong>{t(`pledge.${id}`)}</strong>
                <span className="small muted">{t('sim.pledge.cost', { cost: PLEDGES[id].cost })}</span>
              </button>
            );
          })}
        </div>
      </Block>
    </div>
  );
}

function CountryTab() {
  const t = useT();
  const world = useWorld();
  const c = useStore((s) => s.game!.campaign);
  const edit = useStore((s) => s.sandboxEdit);
  const k = c.career!;
  const parties = onField(c);
  const blocRows = BLOC_IDS.map((b) => ({ id: b, label: t(`bloc.${b}`) }));
  const stateRows = world.states.map((st) => ({ id: st, label: regionLabel(t, world, st) }));
  const stateMean = (st: string, p: number) => mean((c.drift.support.state[st] ?? []).map((row) => row[p]));

  return (
    <div className="sim-tab">
      <Block title={t('sim.mood')} note={t('sandbox.mood.note')} open>
        {parties.map((p) => (
          <Live key={p} color={PARTIES[PARTY_IDS[p]].color} label={partyName(t, p)} value={round1(mean(k.mood.map((row) => row[p])) / POINT)} min={-15} max={15} step={0.5} fmt={(v) => `${signed(v)} pt`}
            onCommit={(v) => edit((g) => { const now = mean(g.career!.mood.map((row) => row[p])); for (let b = 0; b < N_BLOCS; b++) g.career!.mood[b][p] += v * POINT - now; })} />
        ))}
      </Block>
      <Block title={t('sim.late')} note={t('sim.late.note')}>
        {parties.map((p) => (
          <Live key={p} color={PARTIES[PARTY_IDS[p]].color} label={partyName(t, p)} value={round1(c.drift.lateSwing[p] / POINT)} min={-10} max={10} step={0.5} fmt={(v) => `${signed(v)} pt`}
            onCommit={(v) => edit((g) => { g.drift.lateSwing[p] = v * POINT; })} />
        ))}
      </Block>
      <Block title={t('sim.groups')} note={t('sim.groups.note')}>
        <Matrix label={t('sim.groups')} rows={blocRows} cols={parties} min={-15} max={15}
          get={(r, p) => round1(k.mood[r][p] / POINT)} def={(r, p) => round1(k.mood[r][p] / POINT)} set={(r, p, v) => edit((g) => { g.career!.mood[r][p] = v * POINT; })} />
      </Block>
      <Block title={t('sim.states')} note={t('sim.states.note')}>
        <Matrix label={t('sim.states')} rows={stateRows} cols={parties} min={-15} max={15}
          get={(r, p) => round1(stateMean(world.states[r], p) / POINT)} def={(r, p) => round1(stateMean(world.states[r], p) / POINT)}
          set={(r, p, v) => edit((g) => { const st = world.states[r]; const now = mean((g.drift.support.state[st] ?? []).map((row) => row[p])); for (const row of g.drift.support.state[st] ?? []) row[p] += v * POINT - now; })} />
      </Block>
    </div>
  );
}

function TalksTab() {
  const t = useT();
  const c = useStore((s) => s.game!.campaign);
  const edit = useStore((s) => s.sandboxEdit);
  const k = c.career!;
  const parties = onField(c);
  const gov = k.government;
  const rows = parties.map((p) => ({ id: String(p), label: partyName(t, p) }));

  return (
    <div className="sim-tab">
      <Block title={t('sim.gov')} note={t('sandbox.gov.note')} open>
        <label className="field">
          <span>{t('sim.gov.pm')}</span>
          <select value={gov.pm} onChange={(e) => edit((g) => { const n = Number(e.target.value); g.career!.government.pm = n; g.career!.government.partners = g.career!.government.partners.filter((x) => x !== n); })}>
            {parties.map((p) => <option key={p} value={p}>{partyName(t, p)}</option>)}
          </select>
        </label>
        <span className="field-label">{t('sim.gov.partners')}</span>
        <div className="sim-chips" role="group" aria-label={t('sim.gov.partners')}>
          {parties.filter((p) => p !== gov.pm).map((p) => {
            const on = gov.partners.includes(p);
            return <button key={p} type="button" className={on ? 'chip active' : 'chip'} aria-pressed={on} onClick={() => edit((g) => { const gv = g.career!.government; gv.partners = on ? gv.partners.filter((x) => x !== p) : [...gv.partners, p]; })}>
              <i className="sim-dot" style={{ background: PARTIES[PARTY_IDS[p]].color }} aria-hidden="true" />{PARTIES[PARTY_IDS[p]].short}
            </button>;
          })}
        </div>
      </Block>
      <Block title={t('sim.relations')} note={t('sim.relations.note')} open>
        <Matrix label={t('sim.relations')} rows={rows} cols={parties} min={-100} max={100} step={5}
          get={(r, q) => (parties[r] === q ? 0 : c.relations[parties[r]][q])} def={(r, q) => (parties[r] === q ? 0 : c.relations[parties[r]][q])}
          set={(r, q, v) => { if (parties[r] !== q) edit((g) => { g.relations[parties[r]][q] = v; g.relations[q][parties[r]] = v; }); }} />
        <p className="small muted">{t('sandbox.pacts.note')}</p>
      </Block>
    </div>
  );
}
