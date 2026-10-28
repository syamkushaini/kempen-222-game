import { useState } from 'react';
import { PARTIES } from '../data/parties';
import { relationWord } from './hooks';
import { standingPact } from '../sim/campaign/field';
import type { SimConfig, SimPact } from '../sim/campaign/simulate';
import type { World } from '../sim/election';
import { PARTY_IDS } from '../sim/types';
import { partyColor, partyName, partyShort, useT } from './hooks';
import { Block, Matrix } from './simControls';

type Edit = (fn: (c: SimConfig) => void) => void;

/** Who governs as the campaign opens, how the leaders feel about each other, and which parties have agreed to share seats. */
export function SimCoalition({ world, cfg, base, edit, parties }: { world: World; cfg: SimConfig; base: SimConfig; edit: Edit; parties: number[] }) {
  const t = useT();
  const { pm, partners } = cfg.government;
  const standing = standingPact(world);
  const [a, setA] = useState(parties[0]);
  const [b, setB] = useState(parties[1] ?? parties[0]);
  const [mode, setMode] = useState<SimPact['mode']>('targeted');
  const taken = (x: number, y: number) => cfg.pacts.some((q) => (q.a === x && q.b === y) || (q.a === y && q.b === x)) || standing.pacts.some((q) => (q.a === x && q.b === y) || (q.a === y && q.b === x));
  // Seats where both parties put up a candidate: where a pact has something to settle.
  const clashes = a !== b ? world.seats.filter((_, i) => world.baseline.contesting[i][a] && world.baseline.contesting[i][b]).length : 0;
  const rows = parties.map((p) => ({ id: String(p), label: partyShort(t, p) }));

  return (
    <div className="sim-tab">
      <Block title={t('sim.gov')} note={t('sim.gov.note')} open changes={(pm === base.government.pm ? 0 : 1) + ([...partners].sort().join() === [...base.government.partners].sort().join() ? 0 : 1)}>
        <label className="field">
          <span>{t('sim.gov.pm')}</span>
          <select value={pm} onChange={(e) => edit((c) => { const n = Number(e.target.value); c.government.pm = n; c.government.partners = c.government.partners.filter((x) => x !== n); })}>
            {parties.map((p) => <option key={p} value={p}>{partyName(t, p)}</option>)}
          </select>
        </label>
        <span className="field-label">{t('sim.gov.partners')}</span>
        <div className="sim-chips" role="group" aria-label={t('sim.gov.partners')}>
          {parties.filter((p) => p !== pm).map((p) => {
            const on = partners.includes(p);
            return (
              <button key={p} type="button" className={on ? 'chip active' : 'chip'} aria-pressed={on} onClick={() => edit((c) => { c.government.partners = on ? c.government.partners.filter((x) => x !== p) : [...c.government.partners, p]; })}>
                <i className="sim-dot" style={{ background: partyColor(p) }} aria-hidden="true" />{partyShort(t, p)}
              </button>
            );
          })}
        </div>
      </Block>

      <Block title={t('sim.pacts')} note={t('sim.pacts.note')} open changes={cfg.pacts.length + (cfg.freePacts !== base.freePacts ? 1 : 0)}>
        {standing.pacts.length > 0 && (
          <p className="small muted">{t('sim.pacts.standing', { pacts: standing.pacts.map((q) => `${partyShort(t, q.a)} + ${partyShort(t, q.b)}`).join(', ') })}</p>
        )}
        {cfg.pacts.length === 0 && <p className="small muted">{t('sim.pacts.none')}</p>}
        <ul className="sim-pact-list">
          {cfg.pacts.map((q, i) => (
            <li key={i}>
              <span><i className="sim-dot" style={{ background: partyColor(q.a) }} aria-hidden="true" /> {partyShort(t, q.a)} + <i className="sim-dot" style={{ background: partyColor(q.b) }} aria-hidden="true" /> {partyShort(t, q.b)} <span className="muted small">· {t(`sim.pacts.${q.mode}`)}</span></span>
              <button type="button" className="btn small" onClick={() => edit((c) => { c.pacts.splice(i, 1); })}>{t('sim.remove')}</button>
            </li>
          ))}
        </ul>
        <div className="sim-pact-add">
          <label className="field"><span>{t('sim.pacts.a')}</span>
            <select value={a} onChange={(e) => setA(Number(e.target.value))}>{parties.map((p) => <option key={p} value={p}>{partyShort(t, p)} — {PARTIES[PARTY_IDS[p]].name}</option>)}</select>
          </label>
          <label className="field"><span>{t('sim.pacts.b')}</span>
            <select value={b} onChange={(e) => setB(Number(e.target.value))}>{parties.map((p) => <option key={p} value={p}>{partyShort(t, p)} — {PARTIES[PARTY_IDS[p]].name}</option>)}</select>
          </label>
          <label className="field"><span>{t('sim.pacts.mode')}</span>
            <select value={mode} onChange={(e) => setMode(e.target.value as SimPact['mode'])}>
              <option value="targeted">{t('sim.pacts.targeted')}</option>
              <option value="stronger">{t('sim.pacts.stronger')}</option>
            </select>
          </label>
          <button type="button" className="btn primary small" disabled={a === b || taken(a, b)} onClick={() => edit((c) => { c.pacts.push({ a, b, mode }); })}>{t('sim.pacts.add')}</button>
        </div>
        {a !== b && <p className="small muted">{t('sim.pacts.clash', { n: clashes })}</p>}
        <label className="sim-check">
          <input type="checkbox" checked={cfg.freePacts} onChange={(e) => edit((c) => { c.freePacts = e.target.checked; })} />
          <span><strong>{t('sim.pacts.free')}</strong><span className="small muted"> {t('sim.pacts.free.hint')}</span></span>
        </label>
      </Block>

      <Block title={t('sim.relations')} note={t('sim.relations.note')} changes={cfg.relations.reduce((n, row, i) => n + row.filter((v, j) => j > i && v !== base.relations[i][j]).length, 0)}>
        <Matrix label={t('sim.relations')} rows={rows} cols={parties} min={-100} max={100} step={5}
          get={(r, q) => (parties[r] === q ? 0 : cfg.relations[parties[r]][q])} def={(r, q) => (parties[r] === q ? 0 : base.relations[parties[r]][q])}
          set={(r, q, v) => { if (parties[r] !== q) edit((c) => { c.relations[parties[r]][q] = v; c.relations[q][parties[r]] = v; }); }} />
        <p className="small muted">{t('sim.relations.scale', { hostile: relationWord(-60), warm: relationWord(30) })}</p>
      </Block>
    </div>
  );
}
