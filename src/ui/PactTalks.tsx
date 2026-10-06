import { useMemo, useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { canTalk, clashSeats, COST, draftPact, inPact, pactPreview, TALK_ROUNDS, type PactProposal } from '../sim/campaign/diplomacy';
import { transferRate } from '../sim/transfer';
import type { RegionId } from '../sim/types';
import { useStore } from '../state/store';
import { lastOutcome, leaderName, partyName, partyShort, regionLabel, seatName, useFormat, useT, useWorld } from './hooks';
import { Brief } from './Brief';

/** Who stands in a seat both parties contest: the player ("mine"), the other party ("theirs"), or both. */
type Stand = 'mine' | 'both' | 'theirs';

/**
 * Seat-by-seat pact talks with one leader. The player marks, for each seat
 * both parties contest, who stands aside, then puts the list to the other
 * side.
 */
export function PactTalks({ party, onClose }: { party: number; onClose(): void }) {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const reply = useStore((s) => (s.pactReply?.party === party ? s.pactReply.verdict : null));
  const proposePact = useStore((s) => s.proposePact);

  const me = campaign.player;
  const last = lastOutcome(world);
  const signed = inPact(campaign, me, party);
  // Seats I stand aside in ("give") and seats they do ("get"). Everything else stays a fight.
  const [give, setGive] = useState<Set<string>>(new Set());
  const [get, setGet] = useState<Set<string>>(new Set());
  const [openRegion, setOpenRegion] = useState<RegionId | null>(null);

  const clash = useMemo(() => clashSeats(world, campaign, me, party), [world, campaign, me, party]);
  const byRegion = useMemo(() => {
    const m = new Map<RegionId, number[]>();
    for (const i of clash) m.set(world.seats[i].state, [...(m.get(world.seats[i].state) ?? []), i]);
    return m;
  }, [clash, world]);
  const proposal: PactProposal = useMemo(() => ({ give: [...give], get: [...get] }), [give, get]);
  const preview = useMemo(() => pactPreview(world, campaign, me, party, proposal), [world, campaign, me, party, proposal]);

  const set = (seat: string, stand: Stand) => {
    const g = new Set(give), h = new Set(get);
    g.delete(seat); h.delete(seat);
    if (stand === 'theirs') g.add(seat);
    if (stand === 'mine') h.add(seat);
    setGive(g); setGet(h);
  };
  const fill = (mode: 'targeted' | 'stronger' | 'clear') => {
    const p = mode === 'clear' ? { give: [], get: [] } : draftPact(world, campaign, me, party, mode, last);
    setGive(new Set(p.give)); setGet(new Set(p.get));
  };
  const standOf = (seat: string): Stand => (give.has(seat) ? 'theirs' : get.has(seat) ? 'mine' : 'both');

  const check = canTalk(world, campaign, party);
  const rounds = campaign.parties[me]!.used[`talks:${party}`] ?? 0;
  const share = (i: number, p: number) => last.seats[i].votes[p] / last.seats[i].valid;
  const names = (ids: string[]) => ids.map((id) => seatName(world, id)).join(', ');

  if (signed) {
    return (
      <section className="pact">
        <button className="link" onClick={onClose}>‹ {t('pact.back')}</button>
        <p className="note good">{t('pact.done', { leader: leaderName(t, party) })}</p>
      </section>
    );
  }

  return (
    <section className="pact">
      <button className="link" onClick={onClose}>‹ {t('pact.back')}</button>
      <div className="panel-head">
        <h2>{t('pact.title', { party: partyName(t, party) })}</h2>
        <span className="muted">{t('pact.clash', { n: clash.length })}</span>
      </div>
      <Brief text={t('pact.intro')} />
      <p className="muted small">
        {t('pact.transfer', {
          theirs: f.pct(transferRate(party, me).to, 0), mine: f.pct(transferRate(me, party).to, 0), party: partyShort(t, party),
        })}
      </p>

      <div className="button-row tight">
        <button className="btn small" onClick={() => fill('targeted')}>{t('pact.fill.targeted')}</button>
        <button className="btn small" onClick={() => fill('stronger')}>{t('pact.fill.stronger')}</button>
        <button className="btn small" onClick={() => fill('clear')}>{t('pact.fill.clear')}</button>
      </div>

      <dl className="facts pact-facts">
        <div><dt>{t('pact.youAside')}</dt><dd className="num">{give.size}</dd></div>
        <div><dt>{t('pact.theyAside')}</dt><dd className="num">{get.size}</dd></div>
        <div><dt>{partyShort(t, me)}</dt><dd className="num">{preview.a[0]} → {preview.a[1]}</dd></div>
        <div><dt>{partyShort(t, party)}</dt><dd className="num">{preview.b[0]} → {preview.b[1]}</dd></div>
      </dl>
      <p className="muted small">{t('pact.previewNote')}</p>

      {reply && (
        <div className={reply.reply === 'ok' ? 'note good' : 'note bad'}>
          <strong>{leaderName(t, party)}:</strong> {t(`pact.reply.${reply.reply}` as StringKey)}
          {reply.insist.length > 0 && (
            <>
              <p>{names(reply.insist)}</p>
              <button className="btn small" onClick={() => { const h = new Set(get); reply.insist.forEach((s) => h.delete(s)); setGet(h); }}>{t('pact.fix.insist')}</button>
            </>
          )}
          {reply.want.length > 0 && (
            <>
              <p>{t('pact.want')} {names(reply.want)}</p>
              <button className="btn small" onClick={() => { const g = new Set(give); reply.want.forEach((s) => g.add(s)); setGive(g); }}>{t('pact.fix.want')}</button>
            </>
          )}
        </div>
      )}

      <div className="button-row sticky">
        <button className="btn primary" disabled={!check.ok || give.size + get.size === 0} onClick={() => proposePact(party, proposal)}>
          {t('pact.propose')} ▸
        </button>
        <span className="muted small">
          {!check.ok ? t(`deals.reason.${check.reason}` as StringKey)
            : rounds === 0 ? t('pact.cost', { days: f.days(COST.talks) }) : t('pact.rounds', { n: TALK_ROUNDS - rounds })}
        </span>
      </div>

      <ul className="pact-regions">
        {[...byRegion].map(([region, seats]) => {
          const mine = seats.filter((i) => get.has(world.seats[i].id)).length;
          const theirs = seats.filter((i) => give.has(world.seats[i].id)).length;
          return (
            <li key={region}>
              <button className="seat-row" aria-expanded={openRegion === region} onClick={() => setOpenRegion(openRegion === region ? null : region)}>
                <span className="grow">
                  <span className="seat-name">{regionLabel(t, world, region)}</span>
                  <span className="muted small">{t('pact.regionLine', { n: seats.length, mine, theirs })}</span>
                </span>
                <span className="muted">{openRegion === region ? '▾' : '▸'}</span>
              </button>
              {openRegion === region && (
                <ul className="pact-seats">
                  {seats.map((i) => {
                    const seat = world.seats[i];
                    const stand = standOf(seat.id);
                    return (
                      <li key={seat.id} className="pact-seat">
                        <span className="grow">
                          <span className="seat-name">{seat.name}</span>
                          <span className="muted small num">
                            {partyShort(t, me)} {f.pct(share(i, me), 0)} · {partyShort(t, party)} {f.pct(share(i, party), 0)} · {t('pact.heldBy', { party: partyShort(t, last.seats[i].winner) })}
                          </span>
                        </span>
                        <div className="segmented small" role="group" aria-label={seat.name}>
                          {(['mine', 'both', 'theirs'] as Stand[]).map((s) => (
                            <button key={s} className={stand === s ? 'active' : ''} aria-pressed={stand === s} onClick={() => set(seat.id, s)}>
                              {s === 'mine' ? partyShort(t, me) : s === 'theirs' ? partyShort(t, party) : t('pact.both')}
                            </button>
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
