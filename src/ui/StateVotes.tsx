import { lean, pulse, swing, topParty, votedStates } from '../sim/campaign/statevotes';
import type { StateVote } from '../sim/campaign/types';
import { PARTY_IDS } from '../sim/types';
import { useStore } from '../state/store';
import { partyColor, partyShort, regionLabel, useT, useWorld } from './hooks';

const OTH = PARTY_IDS.indexOf('oth');
const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');
const arrow = (d: number) => (d > 0 ? '▲' : d < 0 ? '▼' : '•');

/** One state election: the seats of each party, each with how far it moved from the last general election. */
function Vote({ state, vote, bare }: { state: string; vote: StateVote; bare: boolean }) {
  const t = useT();
  const world = useWorld();
  const me = useStore((s) => s.game!.campaign.player);
  const total = vote.seats.reduce((a, n) => a + n, 0) || 1;
  const order = vote.seats.map((n, p) => ({ n, p })).filter((x) => x.n > 0 || x.p === me).sort((a, b) => b.n - a.n);
  const mine = lean(vote, me);
  return (
    <li className="state-vote">
      <div className="panel-head">
        {bare ? <span /> : <strong>{regionLabel(t, world, state)}</strong>}
        <span className="muted small">{t('statevote.week', { week: vote.week })}{vote.inPerson ? ` · ${t('statevote.person')}` : ''}</span>
      </div>
      <div className="seatbar thin" aria-hidden="true">
        {order.map((o) => <span key={o.p} data-party={o.p} style={{ width: `${(o.n / total) * 100}%`, background: partyColor(o.p) }} />)}
      </div>
      <p className="state-tally">
        {order.map((o) => {
          const d = swing(vote, o.p);
          return (
            <span key={o.p} aria-label={t('statevote.seats', { party: partyShort(t, o.p), seats: o.n, change: signed(d) })}>
              <i className="dot" data-party={o.p} style={{ background: partyColor(o.p) }} />{partyShort(t, o.p)} <strong className="num">{o.n}</strong>
              {o.p !== OTH && <small className={`num ${d > 0 ? 'pos-text' : d < 0 ? 'neg' : 'muted'}`}> {arrow(d)}{signed(d)}</small>}
            </span>
          );
        })}
      </p>
      <p className={`small ${mine > 0 ? 'pos-text' : mine < 0 ? 'neg' : 'muted'}`}>
        {t(mine > 0 ? 'statevote.read.up' : mine < 0 ? 'statevote.read.down' : 'statevote.read.flat')}
        {topParty(vote) !== me && vote.seats[topParty(vote)] > 0 ? ` ${t('statevote.top', { party: partyShort(t, topParty(vote)), seats: vote.seats[topParty(vote)] })}` : ''}
      </p>
    </li>
  );
}

/**
 * What the state elections held so far this term say about how the voters are leaning, for a career: every state that has
 * voted, or just the one given. Nothing is shown before any state has voted.
 */
export function StateVotes({ only }: { only?: string }) {
  const t = useT();
  const campaign = useStore((s) => s.game!.campaign);
  const rows = votedStates(campaign).filter(([st]) => !only || st === only);
  if (rows.length === 0) return null;
  const p = only ? null : pulse(campaign);
  const trend = p ? Math.sign(p.seats - p.before) : 0;
  return (
    <section className="state-votes" aria-label={t('statevote.title')}>
      <div className="panel-head">
        <h2>{t('statevote.title')}</h2>
      </div>
      {p && (
        <>
          <p className={trend > 0 ? 'pos-text' : trend < 0 ? 'neg' : 'muted'}>
            <strong>{t(trend > 0 ? 'statevote.read.up' : trend < 0 ? 'statevote.read.down' : 'statevote.read.flat')}</strong>{' '}
            {t('statevote.pulse', { n: p.states, seats: p.seats, before: p.before })}
            {p.gainer && p.gainer.party !== campaign.player ? ` ${t('statevote.gainer', { party: partyShort(t, p.gainer.party), n: p.gainer.seats })}` : ''}
          </p>
          <p className="muted small">{t('statevote.note')}</p>
        </>
      )}
      <ul className="state-vote-list">{rows.map(([st, v]) => <Vote key={st} state={st} vote={v} bare={!!only} />)}</ul>
    </section>
  );
}
