import { economicMood } from '../sim/campaign/office';
import { ISSUE_IDS } from '../sim/campaign/types';
import type { SimConfig } from '../sim/campaign/simulate';
import { BLOC_IDS, PARTY_IDS } from '../sim/types';
import type { World } from '../sim/election';
import { partyColor, partyName, regionLabel, useT } from './hooks';
import { Block, Matrix, Slider, signed } from './simControls';

type Edit = (fn: (c: SimConfig) => void) => void;

const pts = (v: number) => `${signed(v)} pt`;
const differing = (a: readonly number[], b: readonly number[]) => a.filter((v, i) => v !== b[i]).length;

/** The state of the country on the day the campaign opens: the mood, the groups of voters, the states, the issues, the economy. */
export function SimConditions({ world, cfg, base, edit, parties }: { world: World; cfg: SimConfig; base: SimConfig; edit: Edit; parties: number[] }) {
  const t = useT();
  const e = cfg.economy;
  const feel = economicMood(e);
  const blocRows = BLOC_IDS.map((b) => ({ id: b, label: t(`bloc.${b}`) }));
  const stateRows = world.states.map((st) => ({ id: st, label: regionLabel(t, world, st) }));
  const governing = [cfg.government.pm, ...cfg.government.partners];

  return (
    <div className="sim-tab">
      <Block title={t('sim.mood')} note={t('sim.mood.note')} open changes={differing(cfg.mood, base.mood)}>
        {parties.map((p) => (
          <Slider key={p} color={partyColor(p)} label={partyName(t, p)} value={cfg.mood[p]} def={base.mood[p]} min={-12} max={12} step={0.5} fmt={pts}
            onChange={(v) => edit((c) => { c.mood[p] = v; })} />
        ))}
      </Block>

      <Block title={t('sim.economy')} note={t('sim.economy.note')} changes={(['growth', 'inflation', 'jobless', 'debt'] as const).filter((k) => e[k] !== base.economy[k]).length}>
        <Slider label={t('sim.econ.growth')} value={e.growth} def={base.economy.growth} min={-6} max={9} step={0.1} fmt={(v) => `${v.toFixed(1)}%`} onChange={(v) => edit((c) => { c.economy.growth = v; })} />
        <Slider label={t('sim.econ.inflation')} value={e.inflation} def={base.economy.inflation} min={-1} max={12} step={0.1} fmt={(v) => `${v.toFixed(1)}%`} onChange={(v) => edit((c) => { c.economy.inflation = v; })} />
        <Slider label={t('sim.econ.jobless')} value={e.jobless} def={base.economy.jobless} min={2} max={12} step={0.1} fmt={(v) => `${v.toFixed(1)}%`} onChange={(v) => edit((c) => { c.economy.jobless = v; })} />
        <Slider label={t('sim.econ.debt')} value={e.debt} def={base.economy.debt} min={0} max={120} step={1} fmt={(v) => `${Math.round(v)}% GDP`} onChange={(v) => edit((c) => { c.economy.debt = v; })} />
        <p className="sim-readout">
          {t('sim.econ.feel', { feel: signed(feel, 1) })}{' '}
          <span className={feel > 0.2 ? 'good' : feel < -0.2 ? 'bad' : 'muted'}>{t(feel > 0.2 ? 'sim.econ.helps' : feel < -0.2 ? 'sim.econ.hurts' : 'sim.econ.neutral', { parties: governing.map((p) => PARTY_IDS[p].toUpperCase()).join(', ') })}</span>
        </p>
      </Block>

      <Block title={t('sim.issues')} note={t('sim.issues.note')} changes={differing(cfg.salience, base.salience)}>
        {ISSUE_IDS.map((id, i) => (
          <Slider key={id} label={t(`issue.${id}`)} value={cfg.salience[i]} def={base.salience[i]} min={0} max={2} step={0.1} fmt={(v) => `×${v.toFixed(1)}`}
            onChange={(v) => edit((c) => { c.salience[i] = v; })} />
        ))}
      </Block>

      <Block title={t('sim.groups')} note={t('sim.groups.note')} changes={cfg.blocSwing.reduce((a, row, b) => a + differing(row, base.blocSwing[b]), 0)}>
        <Matrix label={t('sim.groups')} rows={blocRows} cols={parties} min={-15} max={15}
          get={(r, p) => cfg.blocSwing[r][p]} def={(r, p) => base.blocSwing[r][p]} set={(r, p, v) => edit((c) => { c.blocSwing[r][p] = v; })} />
      </Block>

      <Block title={t('sim.states')} note={t('sim.states.note')} changes={world.states.reduce((a, st) => a + differing(cfg.stateSwing[st] ?? [], base.stateSwing[st] ?? []), 0)}>
        <Matrix label={t('sim.states')} rows={stateRows} cols={parties} min={-15} max={15}
          get={(r, p) => cfg.stateSwing[world.states[r]]?.[p] ?? 0} def={(r, p) => base.stateSwing[world.states[r]]?.[p] ?? 0}
          set={(r, p, v) => edit((c) => { (c.stateSwing[world.states[r]] ??= base.stateSwing[world.states[r]].map(() => 0))[p] = v; })} />
      </Block>

      <Block title={t('sim.turnout')} note={t('sim.turnout.note')} changes={differing(cfg.turnoutBloc, base.turnoutBloc) + differing(cfg.turnoutParty, base.turnoutParty)}>
        <h4 className="sim-sub">{t('sim.turnout.groups')}</h4>
        {BLOC_IDS.map((b, i) => (
          <Slider key={b} label={t(`bloc.${b}`)} value={cfg.turnoutBloc[i]} def={base.turnoutBloc[i]} min={-12} max={12} step={0.5} fmt={pts} onChange={(v) => edit((c) => { c.turnoutBloc[i] = v; })} />
        ))}
        <h4 className="sim-sub">{t('sim.turnout.parties')}</h4>
        {parties.map((p) => (
          <Slider key={p} color={partyColor(p)} label={partyName(t, p)} value={cfg.turnoutParty[p]} def={base.turnoutParty[p]} min={-12} max={12} step={0.5} fmt={pts}
            onChange={(v) => edit((c) => { c.turnoutParty[p] = v; })} />
        ))}
      </Block>

      <Block title={t('sim.late')} note={t('sim.late.note')} changes={differing(cfg.lateSwing, base.lateSwing)}>
        {parties.map((p) => (
          <Slider key={p} color={partyColor(p)} label={partyName(t, p)} value={cfg.lateSwing[p]} def={base.lateSwing[p]} min={-10} max={10} step={0.5} fmt={pts}
            onChange={(v) => edit((c) => { c.lateSwing[p] = v; })} />
        ))}
      </Block>

      <Block title={t('sim.chance')} note={t('sim.chance.note')} changes={(cfg.volatility !== base.volatility ? 1 : 0) + (cfg.surprise !== base.surprise ? 1 : 0)}>
        <Slider label={t('sim.volatility')} hint={t('sim.volatility.hint')} value={cfg.volatility} def={base.volatility} min={0} max={3} step={0.1} fmt={(v) => `×${v.toFixed(1)}`} onChange={(v) => edit((c) => { c.volatility = v; })} />
        <Slider label={t('sim.surprise')} hint={t('sim.surprise.hint')} value={cfg.surprise} def={base.surprise} min={0} max={3} step={0.1} fmt={(v) => `×${v.toFixed(1)}`} onChange={(v) => edit((c) => { c.surprise = v; })} />
      </Block>
    </div>
  );
}
