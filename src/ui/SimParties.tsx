import { useState } from 'react';
import { BLOC_IDS } from '../sim/types';
import { FISCAL_ROOM, ISSUE_GROUPS, MAX_PLEDGES, PLEDGES } from '../sim/campaign/policy';
import {
  manifestoBill, partyChanges, pledgeFits, pledgesIn, platformEffect, stanceWorth, type SimConfig,
} from '../sim/campaign/simulate';
import { ISSUE_IDS, ROLE_IDS, STAT_IDS, type PledgeId } from '../sim/campaign/types';
import type { World } from '../sim/election';
import { leaderName, partyName, useFormat, useT } from './hooks';
import { Block, PartyChips, Slider, signed } from './simControls';

type Edit = (fn: (c: SimConfig) => void) => void;

const POSITIONS = [-2, -1, 0, 1, 2] as const;

/** Everything about one party that can be changed: its leader and team, its money and standing, where it stands and what it promises. */
export function SimParties({ world, cfg, base, edit, parties }: { world: World; cfg: SimConfig; base: SimConfig; edit: Edit; parties: number[] }) {
  const t = useT();
  const f = useFormat();
  const [chosen, setChosen] = useState<number>(cfg.focus);
  const p = parties.includes(chosen) ? chosen : parties[0];
  const me = cfg.parties[p], was = base.parties[p];
  const changes = partyChanges(cfg, base, p);
  const bill = manifestoBill(me.manifesto);
  const effect = platformEffect(world, cfg, p);
  const offered = pledgesIn(cfg.scenario);
  const set = <K extends keyof typeof me>(key: K, v: (typeof me)[K]) => edit((c) => { c.parties[p][key] = v; });
  const fundsMax = Math.max(1_000_000, Math.round((was.funds * 4) / 100_000) * 100_000);

  const toggle = (id: PledgeId) => edit((c) => {
    const list = c.parties[p].manifesto;
    c.parties[p].manifesto = list.includes(id) ? list.filter((x) => x !== id) : list.length < MAX_PLEDGES ? [...list, id] : list;
  });

  return (
    <div className="sim-tab">
      <PartyChips parties={parties} value={p} onChange={setChosen} marks={(q) => partyChanges(cfg, base, q)} />
      <div className="sim-party-head">
        <div>
          <h3>{partyName(t, p)}</h3>
          <p className="small muted">{leaderName(t, p)}{p === cfg.focus ? ` · ${t('sim.focus.mark')}` : ''}</p>
        </div>
        <button type="button" className="btn small" disabled={changes === 0} onClick={() => edit((c) => { c.parties[p] = structuredClone(base.parties[p]); })}>{t('sim.party.reset')}</button>
      </div>

      <Block title={t('sim.leader')} note={t('sim.leader.note')} open changes={STAT_IDS.filter((_, i) => me.leader[i] !== was.leader[i]).length}>
        {STAT_IDS.map((s, i) => (
          <Slider key={s} label={t(`stat.${s}`)} hint={t(`sim.stat.${s}` as never)} value={me.leader[i]} def={was.leader[i]} min={1} max={5} step={1}
            onChange={(v) => edit((c) => { c.parties[p].leader[i] = v; })} />
        ))}
        <h4 className="sim-sub">{t('sim.team')}</h4>
        {ROLE_IDS.map((r, i) => (
          <Slider key={r} label={t(`role.${r}`)} hint={t(`sim.role.${r}` as never)} value={me.staff[i]} def={was.staff[i]} min={0} max={5} step={1}
            onChange={(v) => edit((c) => { c.parties[p].staff[i] = v; })} />
        ))}
      </Block>

      <Block title={t('sim.standing')} note={t('sim.standing.note')} changes={(['credibility', 'profile', 'funds', 'days', 'unity', 'machinery'] as const).filter((k) => me[k] !== was[k]).length}>
        <Slider label={t('sim.credibility')} hint={t('sim.credibility.hint')} value={me.credibility} def={was.credibility} min={0} max={100} step={1} onChange={(v) => set('credibility', v)} />
        <Slider label={t('sim.profile')} hint={t('sim.profile.hint')} value={me.profile} def={was.profile} min={-1.6} max={1.6} step={0.1} fmt={(v) => `${signed(v)} pt`} onChange={(v) => set('profile', v)} />
        <Slider label={t('sim.unity')} hint={t('sim.unity.hint')} value={me.unity} def={was.unity} min={0} max={100} step={1} onChange={(v) => set('unity', v)} />
        <Slider label={t('sim.funds')} hint={t('sim.funds.hint')} value={me.funds} def={was.funds} min={0} max={fundsMax} step={10_000} fmt={(v) => f.rm(v)} onChange={(v) => set('funds', v)} />
        <Slider label={t('sim.days')} hint={t('sim.days.hint')} value={me.days} def={was.days} min={0} max={7} step={0.5} fmt={(v) => f.days(v)} onChange={(v) => set('days', v)} />
        <Slider label={t('sim.machinery')} hint={t('sim.machinery.hint')} value={me.machinery} def={was.machinery} min={0} max={2} step={0.05} fmt={(v) => `×${v.toFixed(2)}`} onChange={(v) => set('machinery', v)} />
      </Block>

      <Block title={t('sim.positions')} note={t('sim.positions.note')} open changes={me.stances.filter((v, i) => v !== was.stances[i]).length}>
        <p className={`sim-readout ${effect > 0.05 ? 'good' : effect < -0.05 ? 'bad' : ''}`}>{t('sim.positions.effect', { n: signed(effect, 1) })}</p>
        {ISSUE_GROUPS.map(({ group, issues }) => (
          <div key={group}>
            <h4 className="sim-sub">{t(`issueGroup.${group}`)}</h4>
            {issues.map((id) => {
              const i = ISSUE_IDS.indexOf(id);
              const worth = stanceWorth(world, cfg, p, i, me.stances[i]);
              return (
                <div key={id} className={me.stances[i] !== was.stances[i] ? 'sim-issue changed' : 'sim-issue'}>
                  <div className="sim-slider-head">
                    <span className="sim-slider-label">{t(`issue.${id}`)}</span>
                    <output className={`num small ${worth > 0.05 ? 'good' : worth < -0.05 ? 'bad' : 'muted'}`} title={t('sim.positions.worth')}>{signed(worth, 1)} pt</output>
                    <button type="button" className="sim-reset" disabled={me.stances[i] === was.stances[i]} aria-label={t('sim.reset.one', { n: t(`issue.${id}.${was.stances[i] < 0 ? 'lo' : 'hi'}`) })} onClick={() => edit((c) => { c.parties[p].stances[i] = was.stances[i]; })}>↺</button>
                  </div>
                  <div className="sim-scale" role="group" aria-label={t(`issue.${id}`)}>
                    <span className="pole">{t(`issue.${id}.lo`)}</span>
                    {POSITIONS.map((pos) => (
                      <button key={pos} type="button" className={`pos${pos === me.stances[i] ? ' here' : ''}${pos === was.stances[i] ? ' began' : ''}`} aria-pressed={pos === me.stances[i]}
                        aria-label={t('policy.position', { n: pos + 3 })} onClick={() => edit((c) => { c.parties[p].stances[i] = pos; })} />
                    ))}
                    <span className="pole">{t(`issue.${id}.hi`)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </Block>

      <Block title={t('sim.manifesto')} note={t('sim.manifesto.note')} open changes={[...me.manifesto].sort().join() === [...was.manifesto].sort().join() ? 0 : 1}>
        <p className="sim-readout">
          {t('manifesto.count')}: <b className="num">{me.manifesto.length}/{MAX_PLEDGES}</b> · {t('manifesto.cost')}: <b className={bill.cost > bill.room ? 'bad num' : 'num'}>{bill.cost}/{FISCAL_ROOM}</b>
        </p>
        {bill.cost > bill.room && <p className="small bad">{t('sim.manifesto.over')}</p>}
        <div className="sim-pledges">
          {offered.map((id) => {
            const def = PLEDGES[id];
            const on = me.manifesto.includes(id);
            const likes = Object.entries(def.appeal).filter(([, v]) => (v ?? 0) > 0).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0)).slice(0, 3).map(([b]) => t(`bloc.${b as (typeof BLOC_IDS)[number]}`)).join(', ');
            const dislikes = Object.entries(def.appeal).filter(([, v]) => (v ?? 0) < 0).map(([b]) => t(`bloc.${b as (typeof BLOC_IDS)[number]}`)).join(', ');
            const fits = pledgeFits(cfg, p, id);
            return (
              <button key={id} type="button" className={`sim-pledge${on ? ' on' : ''}${!fits ? ' misfit' : ''}`} aria-pressed={on} disabled={!on && me.manifesto.length >= MAX_PLEDGES} onClick={() => toggle(id)}>
                <strong>{t(`pledge.${id}`)}</strong>
                <span className="small muted">{t('sim.pledge.line', { cost: def.cost, likes })}{dislikes ? ` · ${t('sim.pledge.annoys', { blocs: dislikes })}` : ''}</span>
                {!fits && <span className="small bad">{t('sim.pledge.misfit', { issue: t(`issue.${def.needs![0]}`) })}</span>}
                {def.amend && <span className="small muted">{t('manifesto.amend')}</span>}
              </button>
            );
          })}
        </div>
      </Block>
    </div>
  );
}
