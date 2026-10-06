import { contestsState } from '../sim/campaign/actions';
import { chiefAllowance } from '../sim/campaign/ai';
import { CHIEF_NAMES, chiefMood, chiefView } from '../sim/campaign/chiefs';
import { now } from '../sim/campaign/news';
import type { ChiefLevel, NewsItem } from '../sim/campaign/types';
import { useStore } from '../state/store';
import { Gauge } from './Gauge';
import { actionList, regionLabel, useFormat, useT, useWorld } from './hooks';
import { Pips } from './TeamTab';

const LEVELS: (ChiefLevel | 0)[] = [0, 1, 2, 3];
/** Amounts, at general-election scale, that chiefs can be told to leave untouched. */
const FLOORS = [0, 100_000, 250_000, 500_000, 1_000_000];

function LevelSwitch(props: { value: ChiefLevel | 0 | null; label: string; onChange(level: ChiefLevel | 0): void }) {
  const t = useT();
  return (
    <div className="segmented small" role="group" aria-label={props.label}>
      {LEVELS.map((level) => (
        <button
          key={level}
          className={props.value === level ? 'active' : ''}
          aria-pressed={props.value === level}
          onClick={() => props.onChange(level)}
        >
          {t(`chiefs.level.${level}`)}
        </button>
      ))}
    </div>
  );
}

/** Where the player hands regions over to chiefs who run the ground campaign there. */
export function ChiefsTab() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const selectedState = useStore((s) => s.selectedState);
  const selectState = useStore((s) => s.selectState);
  const setChiefs = useStore((s) => s.setChiefs);
  const setChiefFloor = useStore((s) => s.setChiefFloor);

  const me = campaign.player;
  const pc = campaign.parties[me]!;
  const kind = world.rules.kind === 'general' ? 'general' : 'state';
  const regions = world.states.filter((st) => contestsState(world, campaign, me, st));
  const appointed = regions.filter((st) => pc.chiefs[st]);
  const levels = new Set(regions.map((st) => pc.chiefs[st] ?? 0));
  const floors = FLOORS.map((amount) => amount * world.rules.econ);
  if (!floors.includes(pc.chiefFloor)) floors.push(pc.chiefFloor);

  // What each chief did last week, from the news.
  const lastWork = new Map<string, NewsItem>();
  for (const item of campaign.news) {
    if (item.week === now(campaign) - 1 && item.key === 'news.chief.work') lastWork.set(String(item.vars?.state).slice('@state:'.length), item);
  }

  return (
    <section className="chiefs">
      <div className="panel-head">
        <h2>{t(`chiefs.title.${kind}`)}</h2>
        <span className="muted">{t('chiefs.count', { n: appointed.length, total: regions.length })}</span>
      </div>
      <p className="muted small">{t(`chiefs.intro.${kind}`)}</p>
      <p className="muted small">{t('chiefs.when')}</p>
      <p className="muted small">{t('chiefs.people')}</p>

      <div className="chief-controls">
        <div className="chief-control">
          <span>{t('chiefs.all')}</span>
          <LevelSwitch label={t('chiefs.all')} value={levels.size === 1 ? [...levels][0] : null} onChange={(level) => setChiefs(regions, level)} />
        </div>
        <label className="chief-control">
          <span>{t('chiefs.floor')}</span>
          <select value={pc.chiefFloor} onChange={(e) => setChiefFloor(Number(e.target.value))}>
            {floors.sort((a, b) => a - b).map((amount) => (
              <option key={amount} value={amount}>{amount === 0 ? t('chiefs.floor.none') : f.rm(amount)}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="note">
        {appointed.length === 0 ? t('chiefs.none') : t('chiefs.allowance', { rm: f.rm(chiefAllowance(campaign, me)) })}
        {' '}{t('chiefs.levels')}
      </p>

      <ul className="chief-list">
        {regions.map((st) => {
          const level = pc.chiefs[st] ?? 0;
          const work = lastWork.get(st);
          const name = regionLabel(t, world, st);
          const person = chiefView(world, campaign, st);
          return (
            <li key={st} className={`chief${level ? ' on' : ''}${st === selectedState ? ' here' : ''}`}>
              <div className="grow">
                <button className="link chief-name" onClick={() => selectState(st)}>{name}</button>
                <span className="action-meta chief-person">
                  <span>{CHIEF_NAMES[person.name]}</span>
                  <Pips n={person.skill} label={`${t('chiefs.skill')}: ${person.skill} / 5`} />
                  {level > 0 && <Gauge value={person.loyalty} label={t(`chiefs.mood.${chiefMood(person)}`)} />}
                </span>
                <span className="action-meta num">
                  {t('state.seats', { n: world.seatsByState[st].length })} · {t('actions.machinery', { n: pc.machinery[world.states.indexOf(st)] })}
                </span>
                {work && (
                  <span className="action-meta">
                    {t('chiefs.last', {
                      actions: actionList(t, world, String(work.vars?.actions).slice('@actions:'.length)),
                      rm: f.rm(Number(String(work.vars?.rm).slice('@rm:'.length))),
                    })}
                  </span>
                )}
              </div>
              <LevelSwitch label={name} value={level} onChange={(next) => setChiefs([st], next)} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
