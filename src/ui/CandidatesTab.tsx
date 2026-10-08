import { useMemo, useState } from 'react';
import { contests } from '../sim/campaign/actions';
import { CHOOSE_DAYS, HOPEFUL_NAMES, canOpen, canStand } from '../sim/campaign/candidates';
import { canForce } from '../sim/campaign/contests';
import { FACTION_IDS } from '../sim/campaign/factions';
import { canGrantSafe, safeSeats } from '../sim/campaign/safeseat';
import { enteredSeats } from '../sim/campaign/entry';
import { STANDS } from '../sim/transfer';
import { useStore } from '../state/store';
import { lastOutcome, partyColor, partyShort, regionLabel, useDisplay, useFormat, useT, useWorld } from './hooks';

type Filter = 'hold' | 'target' | 'close' | 'aside' | 'new';
const FILTERS: Filter[] = ['hold', 'target', 'close', 'aside', 'new'];
const PAGE = 40;

/**
 * Where the party stands, seat by seat: the seats it holds and means to keep, the seats it is fighting for, where it has
 * stood aside for an ally, and where it has never stood. Every seat is the party's own business, so this is the list the
 * leader works from; a seat opens on the map, with its card.
 */
export function CandidatesTab() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const selectSeat = useStore((s) => s.selectSeat);
  const openSeat = useStore((s) => s.openSeat);
  const standLeader = useStore((s) => s.standLeader);
  const grantSafe = useStore((s) => s.grantSafe);
  const revokeSafe = useStore((s) => s.revokeSafe);
  const forceBy = useStore((s) => s.forceByElection);
  const setTab = useStore((s) => s.setTab);
  const display = useDisplay();
  const [filter, setFilter] = useState<Filter>('hold');
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(PAGE);
  const me = campaign.player;
  const k = campaign.career;
  const last = lastOutcome(world);
  const entered = new Set(enteredSeats(campaign));

  const rows = useMemo(() => world.seats.map((seat, i) => {
    const row = campaign.standDowns[seat.id]?.[me];
    const aside = row !== undefined && row >= 0;
    const fighting = campaign.phase === 'term' ? world.baseline.contesting[i][me] : contests(world, campaign, i, me);
    const holder = k?.house[seat.id] ?? last.seats[i].winner;
    const d = display[i];
    const mine = last.seats[i].valid > 0 ? last.seats[i].votes[me] / last.seats[i].valid : 0;
    const key = campaign.team.keySeats.find((x) => x.seat === seat.id);
    const candidate = key && key.pick !== null ? key.options[key.pick] : campaign.team.defaults?.[seat.id] ?? null;
    const chosen = !!key && key.pick !== null;
    return { seat, i, chosen, aside, fighting, holder, d, mine, key, candidate, blown: !!key?.blown, fresh: entered.has(seat.id), unseen: !fighting && !aside && row !== undefined && row !== STANDS };
  }), [world, campaign, display, k, last, me, entered]);

  const counts = {
    hold: rows.filter((r) => r.fighting && r.holder === me).length,
    target: rows.filter((r) => r.fighting && r.holder !== me).length,
    close: rows.filter((r) => r.fighting && r.d.cls !== 'safe').length,
    aside: rows.filter((r) => r.aside).length,
    new: rows.filter((r) => !r.fighting && !r.aside).length,
  };
  const q = query.trim().toLowerCase();
  const list = rows
    .filter((r) => {
      if (q && !r.seat.name.toLowerCase().includes(q) && !r.seat.id.toLowerCase().includes(q)) return false;
      switch (filter) {
        case 'hold': return r.fighting && r.holder === me;
        case 'target': return r.fighting && r.holder !== me;
        case 'close': return r.fighting && r.d.cls !== 'safe';
        case 'aside': return r.aside;
        default: return !r.fighting && !r.aside;
      }
    })
    .sort((a, b) => a.d.margin - b.d.margin);
  const withCandidates = rows.filter((r) => r.candidate).length;

  return (
    <section className="candidates">
      <div className="panel-head">
        <h2>{t('slate.title')}</h2>
        <span className="muted small">{t('slate.summary', { n: counts.hold + counts.target, total: world.seats.length })}</span>
      </div>
      <p className="muted small">{t('slate.intro', { hold: counts.hold, close: counts.close, named: withCandidates })}</p>
      {campaign.team.leaderSeat && <p className="note">{t('slate.leader', { seat: world.seats[world.seatIndex.get(campaign.team.leaderSeat)!].name })}</p>}
      <div className="chips" role="group" aria-label={t('slate.filter')}>
        {FILTERS.map((id) => (
          <button key={id} className={filter === id ? 'chip active' : 'chip'} aria-pressed={filter === id} onClick={() => { setFilter(id); setShown(PAGE); }}>
            {t(`slate.filter.${id}`)} <span className="num">{counts[id]}</span>
          </button>
        ))}
      </div>
      <label className="field">
        <span>{t('nom.search')}</span>
        <input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setShown(PAGE); }} />
      </label>
      {list.length === 0 && <p className="muted small">{t('slate.empty')}</p>}
      <ul className="seat-list">
        {list.slice(0, shown).map((r) => (
          <li key={r.seat.id}>
            <button className="seat-row" onClick={() => selectSeat(r.seat.id, r.seat.state)}>
              <span className="dot" data-party={r.holder} style={{ background: partyColor(r.holder) }} />
              <span className="grow">
                <span className="seat-name">{r.seat.name}</span>
                <span className="muted small">
                  {r.seat.id} · {regionLabel(t, world, r.seat.state)} · {t('slate.holder', { party: partyShort(t, r.holder) })}
                  {r.fighting && <> · {t('slate.share', { pct: f.pct(r.mine) })}</>}
                  {r.fresh && <> · {t('entry.status.in')}</>}
                </span>
                {r.candidate && (
                  <span className={r.blown || r.candidate.blown ? 'action-reason' : 'muted small'}>
                    {t(r.chosen ? 'slate.candidate' : 'slate.party', { name: HOPEFUL_NAMES[r.candidate.name], kind: t(`hopeful.${r.candidate.kind}`) })}
                    {(r.blown || r.candidate.blown) && ` · ${t('slate.blown')}`}
                    {!r.blown && r.candidate.vetted && r.candidate.skeleton && ` · ${t('slate.skeleton')}`}
                  </span>
                )}
                {!r.chosen && r.key && <span className="muted small">{t('slate.undecided')}</span>}
                {campaign.team.leaderSeat === r.seat.id && <span className="muted small">{t('slate.you')}</span>}
                {r.seat.id in safeSeats(campaign) && <span className="muted small">{t('slate.safe', { faction: t(`faction.${FACTION_IDS[safeSeats(campaign)[r.seat.id]]}`) })}</span>}
              </span>
              {r.fighting && <span className={`badge ${r.d.cls}`}>{f.pct(r.d.margin)}</span>}
            </button>
            {campaign.phase === 'term' && r.holder === me && (
              <div className="button-row tight slate-actions">
                {r.seat.id in safeSeats(campaign)
                  ? <button className="btn small" onClick={() => revokeSafe(r.seat.id)}>{t('slate.safe.revoke')}</button>
                  : FACTION_IDS.map((id, n) => (
                    <button key={id} className="btn small" disabled={!canGrantSafe(world, campaign, r.seat.id, n).ok} onClick={() => grantSafe(r.seat.id, n)}>{t('slate.safe.give', { faction: t(`faction.${id}`) })}</button>
                  ))}
                <button className="btn small" disabled={!canForce(world, campaign, r.seat.id).ok} onClick={() => forceBy(r.seat.id)}>{t('slate.force')}</button>
              </div>
            )}
            {campaign.phase === 'campaign' && r.fighting && (
              <div className="button-row tight slate-actions">
                {canOpen(world, campaign, r.seat.id) && <button className="btn small" onClick={() => { openSeat(r.seat.id); setTab('team'); }}>{t('slate.open', { n: CHOOSE_DAYS })}</button>}
                {r.key && !r.chosen && <button className="btn small" onClick={() => setTab('team')}>{t('slate.toTeam')}</button>}
                {canStand(world, campaign, r.seat.id) && <button className="btn small" onClick={() => standLeader(r.seat.id)}>{t('slate.stand')}</button>}
              </div>
            )}
          </li>
        ))}
      </ul>
      {list.length > shown && <button className="btn small" onClick={() => setShown(shown + PAGE)}>{t('slate.more', { n: list.length - shown })}</button>}
    </section>
  );
}
