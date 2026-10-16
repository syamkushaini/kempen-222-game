import type { StringKey } from '../i18n/strings';
import { defenceTargets } from '../sim/campaign/defence';
import { isPm, ministerName } from '../sim/campaign/office';
import { pestelOf, pestelTargets } from '../sim/campaign/pestel';
import { COMBOS, NOTCHES, STANCES, STANCE_IDS, activeCombos, capitalOf, capitalUsed, ministerFor, ministerMood, stanceAvailable, stanceCost, stanceOf, stretch, type Notch, type StanceId } from '../sim/campaign/stances';
import { ALLOCATION, MONTH, govMoney } from '../sim/campaign/treasury';
import type { Career } from '../sim/campaign/types';
import { useStore } from '../state/store';
import { START_DEFENCE } from '../sim/campaign/defence';
import { DOCTRINES, METERS, PEERS, STRONG_AT, WEAK_AT, TITLE_WEEKS, doctrineAvailable, doctrineHeld, gradeOf, peerScore } from '../sim/campaign/doctrines';
import { Portrait } from './Portrait';
import { useFormat, useT, useWorld } from './hooks';

/** Where a meter is heading with a slider at a given notch, the rest as they are. */
function heading(k: Career, id: StanceId, notch: Notch): number {
  const probe: Career = { ...k, stance: { ...k.stance, [id]: notch } };
  return id === 'readiness' || id === 'influence' ? defenceTargets(probe)[id] : pestelTargets(probe)[id];
}
const nowOf = (k: Career, id: StanceId): number => (id === 'readiness' || id === 'influence' ? (k.defence ?? START_DEFENCE)[id] : pestelOf(k)[id]);

/**
 * Standing policy for the meters the budget does not reach, as sliders from easing off to pushing hard (see stances.ts). Each says where its
 * meter is heading at the setting, what that costs or saves a month, who it pleases and who it does not, and any price of its own.
 */
export function MeterSliders() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const set = useStore((s) => s.setMeterPolicy);
  const adopt = useStore((s) => s.adoptDoctrine);
  if (!campaign.career || campaign.phase !== 'term' || !isPm(campaign)) return null;
  const k = campaign.career;
  const unit = govMoney(world, ALLOCATION.pm) * MONTH;
  const cap = capitalOf(k), used = capitalUsed(k), thin = stretch(k);
  const active = activeCombos(k).map((x) => x.id);
  const held = doctrineHeld(campaign);
  const titles = k.titles ?? [];
  const cards = k.scorecards ?? [];
  const latest = cards[cards.length - 1], before = cards[cards.length - 2];
  const visible = STANCE_IDS.filter((id) => stanceAvailable(campaign.scenario, id));
  return (
    <section className="meter-sliders" aria-label={t('stances.title')}>
      <h3>{t('stances.title')}</h3>
      <p className="muted small action-desc">{t('stances.desc')}</p>
      <div className="capital" role="group" aria-label={t('stances.capital', { used, cap })}>
        <div className="result-label"><strong>{t('stances.capital', { used, cap })}</strong></div>
        <div className="capital-pips" aria-hidden="true">
          {Array.from({ length: Math.max(cap, used) }, (_, i) => <i key={i} className={i < used ? (i >= cap ? 'over' : 'used') : ''} />)}
        </div>
        <p className="small muted">{thin < 1 ? t('stances.capital.over', { pct: Math.round(thin * 100) }) : used >= cap ? t('stances.capital.full') : t('stances.capital.desc')}</p>
      </div>
      <div className="doctrines">
        <h4>{t('doctrines.title')}</h4>
        <p className="muted small">{t('doctrines.desc')}</p>
        <ul>
          {DOCTRINES.filter((d) => doctrineAvailable(campaign.scenario, d)).map((d) => {
            const on = held?.id === d.id;
            const weeks = on && k.doctrine?.id === d.id ? k.week - k.doctrine.since : 0;
            return (
              <li key={d.id} className={`doctrine ${on ? 'on' : ''}`}>
                <div className="grow">
                  <strong>{t(`doctrine.${d.id}` as StringKey)}</strong>{titles.includes(d.id) && <span className="small pos-text"> ★</span>}{d.federal && <span className="small muted"> · {t('doctrines.forces')}</span>}
                  <p className="small muted">{t(`doctrine.${d.id}.desc` as StringKey)}</p>
                  {on && <p className="small num">{t('doctrines.held', { n: weeks })}{!titles.includes(d.id) && ` · ${Math.min(weeks, TITLE_WEEKS)}/${TITLE_WEEKS}`}</p>}
                </div>
                <button type="button" className="btn small" disabled={on} onClick={() => adopt(d.id)}>{on ? t('doctrines.set') : t('doctrines.adopt')}</button>
              </li>
            );
          })}
        </ul>
        {titles.length > 0 && <p className="small">{t('doctrines.titles')}: {titles.map((id) => t(`doctrine.${id}` as StringKey)).join(', ')}</p>}
      </div>
      {visible.map((id) => {
        const def = STANCES[id];
        const notch = stanceOf(k, id);
        const cost = stanceCost(k, id) * unit;
        const name = t(`stance.${id}` as StringKey);
        const who = (blocs: string[]) => blocs.map((b) => t(`bloc.${b}` as StringKey)).join(', ');
        // What easing off pleases is what pushing displeases, and the other way about.
        const pleased = notch >= 0 ? def.likes : def.dislikes, displeased = notch >= 0 ? def.dislikes : def.likes;
        const growth = (def.growth ?? 0) * notch;
        return (
          <div key={id} className="plan-card stance">
            <div className="result-label">
              <strong>{name}</strong>
              <span className="num muted">{t(`stances.notch.${notch}` as StringKey)}</span>
            </div>
            <p className="muted small">{t(`stance.${id}.desc` as StringKey)}</p>
            <input type="range" min={-2} max={2} step={1} value={notch} aria-label={name} aria-valuetext={t(`stances.notch.${notch}` as StringKey)}
              onChange={(e) => { const n = Number(e.target.value) as Notch; if (capitalUsed(k, [id, n]) > cap && capitalUsed(k, [id, n]) > used) return; set(id, n); }} list={`stance-ticks-${id}`} />
            <datalist id={`stance-ticks-${id}`}>{NOTCHES.map((n) => <option key={n} value={n} />)}</datalist>
            <div className="stance-poles small muted"><span>{t(`stance.${id}.lo` as StringKey)}</span><span>{t(`stance.${id}.hi` as StringKey)}</span></div>
            {(() => {
              const m = ministerFor(k, id);
              const mood = ministerMood(k, id);
              if (!m) return null;
              return (
                <div className={`stance-minister mood-${mood}`}>
                  <Portrait minister={m.name} party={m.party} size={34} />
                  <div>
                    <strong className="small">{ministerName(m)}</strong>{m.trait && <span className="small muted"> · {t(`trait.${m.trait}` as StringKey)}</span>}
                    <p className="small">{m.acting ? t('minister.acting') : mood === 'neutral' ? '' : t(`minister.say.${mood}.${m.trait ?? 'loyalist'}` as StringKey, { slider: name })}</p>
                  </div>
                </div>
              );
            })()}
            <p className="small num">
              {t('stances.forecast', { to: Math.round(heading(k, id, notch)), now: Math.round(nowOf(k, id)) })}
              {' · '}{cost < 0 ? t('stances.saves', { rm: f.rm(-cost) }) : t('stances.cost', { rm: f.rm(cost) })}
            </p>
            {notch !== 0 && <p className="small muted">{t('stances.pleases', { who: who(pleased) })} · {t('stances.displeases', { who: who(displeased) })}</p>}
            {notch !== 0 && growth !== 0 && <p className="small muted">{t('stances.price.growth', { sign: `${growth > 0 ? '+' : '−'}${Math.abs(growth).toFixed(2)}` })}</p>}
            {notch > 0 && def.stability && <p className="small muted">{t('stances.price.stability')}</p>}
            {notch > 0 && id === 'influence' && <p className="small muted">{t('stances.price.readiness')}</p>}
          </div>
        );
      })}
      <div className="combos">
        <h4>{t('stances.combos')}</h4>
        <p className="muted small">{t('stances.combos.desc')}</p>
        <ul>
          {COMBOS.filter((x) => x.needs.every(([id]) => visible.includes(id))).map((x) => {
            const on = active.includes(x.id), seen = k.combosSeen?.includes(x.id);
            return (
              <li key={x.id} className={`combo ${x.kind} ${on ? 'on' : ''}`}>
                <strong>{on || seen ? t(`combo.${x.id}` as StringKey) : '???'}</strong>
                <span className="small muted"> · {on ? t('combo.found') : seen ? t('combo.seen') : t('combo.unknown')}</span>
                <p className="small muted">{on || seen ? t(`combo.${x.id}.desc` as StringKey) : t('combo.hint', { slider: t(`stance.${x.needs[0][0]}` as StringKey) })}</p>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="report-card">
        <h4>{t('report.title')}</h4>
        <p className="muted small">{t('report.desc')}</p>
        {!latest ? <p className="small">{t('report.none')}</p> : (
          <>
            <div className="result-label">
              <strong>{t('report.year', { year: latest.year })} · {t('report.overall')}: {gradeOf(latest.overall)}</strong>
              <span className="num muted">{t('report.rank', { rank: latest.rank, of: PEERS.length + 1 })}</span>
            </div>
            <ul className="grades">
              {Object.entries(latest.scores).map(([id, score]) => {
                const prev = before?.scores[id];
                const label = METERS.includes(id as never) ? t(`tools.goal.${id}` as StringKey) : t(`nation.${id}` as StringKey);
                return (
                  <li key={id}>
                    <span>{label}</span>
                    <strong className={`grade grade-${gradeOf(score)}`}>{gradeOf(score)}</strong>
                    {prev !== undefined && Math.abs(score - prev) >= 1 && <span className={`small ${score > prev ? 'pos-text' : 'neg'}`} title={t(score > prev ? 'report.better' : 'report.worse')}>{score > prev ? '▲' : '▼'}</span>}
                  </li>
                );
              })}
            </ul>
            <h5>{t('report.peers')}</h5>
            <ol className="league small">
              {[...PEERS.map((p) => ({ id: p.id, name: t(`report.peer.${p.id}` as StringKey), score: peerScore(p.id, p.base, p.trend, latest.term, latest.year) })), { id: 'you', name: t('report.you'), score: latest.overall }]
                .sort((a, b) => b.score - a.score).map((x) => <li key={x.id} className={x.id === 'you' ? 'you' : ''}>{x.name} <span className="num muted">{Math.round(x.score)} · {gradeOf(x.score)}</span></li>)}
            </ol>
          </>
        )}
        <p className="small muted">{t('report.milestones', { n: k.milestones?.length ?? 0, of: METERS.filter((m) => visible.includes(m as never)).length * 2 })} ({t('report.tip', { hi: STRONG_AT, lo: WEAK_AT })})</p>
      </div>
    </section>
  );
}
