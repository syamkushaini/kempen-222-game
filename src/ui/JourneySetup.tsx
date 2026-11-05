import { useState } from 'react';
import { FOUNDING_SLOT } from '../sim/campaign/founding';
import { validLeaderStats } from '../sim/campaign/perks';
import type { BackstoryId, Difficulty } from '../sim/campaign/types';
import { DEFAULT_EMBLEMS, makeIdentity, PARTY_COLORS, type Identity } from '../state/identity';
import { isJourneyLevel, JOURNEY_LEVELS, loadJourneyParty } from '../state/journeyParty';
import type { StringKey } from '../i18n/strings';
import { useT } from './hooks';
import { UnlockRoadmap } from './UnlockRoadmap';
import { LeaderPicker, PartyCreator, StatEffects, type Draft } from './Setup';

const NAME_MAX = 24;

/** Where a Career Campaign begins: the player makes their own name, party, logo and leader, then starts at Level 1. Last time's party is the starting point. */
export function JourneySetup({ onStart }: { onStart(name: string, identity: Identity, backstory: BackstoryId | null, leaderStats: number[] | undefined, level: Difficulty): void }) {
  const t = useT();
  const [saved] = useState(() => loadJourneyParty());
  const [name, setName] = useState(saved?.name ?? '');
  const [backstory, setBackstory] = useState<BackstoryId | null>(null);
  // How well the rivals play and how hard events hit: easy, normal or Realistic (the hardest). Last time's choice is kept.
  const [level, setLevel] = useState<Difficulty>(() => (isJourneyLevel(saved?.level) ? saved.level : 'easy'));
  // A leader built by hand: the stats spend all the points there are, and are used instead of a background once the player picks that card.
  const [mine, setMine] = useState(false);
  const [stats, setStats] = useState<number[]>([3, 3, 3, 3]);
  const [draft, setDraft] = useState<Draft>(() => ({
    name: saved?.identity?.name ?? t('platform.founded.name'), short: saved?.identity?.short ?? t('platform.founded.short'),
    color: saved?.identity?.color ?? PARTY_COLORS[6], emblem: saved?.identity?.emblem ?? DEFAULT_EMBLEMS[FOUNDING_SLOT],
    leader: saved?.identity?.leader ?? t('platform.founded.leader'), look: saved?.identity?.look ?? 0, ideology: null,
    ...(saved?.identity?.photo ? { photo: saved.identity.photo } : {}), ...(saved?.identity?.flag ? { flag: saved.identity.flag } : {}),
  }));
  const identity = makeIdentity(draft);
  const ready = identity !== null && name.trim().length > 0 && (!mine || validLeaderStats(stats));
  return (
    <div className="journey-setup">
      <h2>{t('journey.setup.title')}</h2>
      <p className="muted small">{t('journey.setup.desc')}</p>
      <UnlockRoadmap />
      <label className="field-label" htmlFor="journey-name">{t('journey.setup.name')}</label>
      <input id="journey-name" className="text-input" value={name} maxLength={NAME_MAX} autoComplete="off" placeholder={t('journey.setup.name.ph')} onChange={(e) => setName(e.target.value)} />
      <h3>{t('journey.setup.party')}</h3>
      <PartyCreator draft={draft} career={false} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
      <h3>{t('journey.setup.level')}</h3>
      <div className="segmented" role="group" aria-label={t('journey.setup.level')}>
        {JOURNEY_LEVELS.map((d) => (
          <button key={d} className={level === d ? 'active' : ''} aria-pressed={level === d} onClick={() => setLevel(d)}>{t(`journey.level.${d}` as StringKey)}</button>
        ))}
      </div>
      <p className="muted small">{t(`journey.level.${level}.hint` as StringKey)}</p>
      <h3>{t('journey.setup.leader')}</h3>
      <StatEffects />
      <LeaderPicker value={backstory} party={-1} onChange={(b) => { setMine(false); setBackstory(b); }} custom={{ active: mine, stats, onSelect: () => { setMine(true); setBackstory(null); }, onChange: setStats }} />
      <div className="button-row">
        <button className="btn primary" disabled={!ready} onClick={() => { if (identity) onStart(name.trim(), identity, mine ? null : backstory, mine ? stats : undefined, level); }}>{t('journey.setup.start')} ▸</button>
      </div>
      {!ready && <p className="muted small">{t('journey.setup.need')}</p>}
    </div>
  );
}
