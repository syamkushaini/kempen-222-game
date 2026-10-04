import { actionCost, canDo } from '../sim/campaign/actions';
import { playerPollCost } from '../sim/campaign/turn';
import { BLOC_IDS, N_PARTIES } from '../sim/types';
import { useStore } from '../state/store';
import {
  lastOutcome, partyColor, partyName, partyShort, regionLabel, useDisplay, useFormat, useIntel, useT, useTruth, useWorld, type SeatDisplay,
} from './hooks';

const HOT_SEATS = 15;

export function SeatsTab() {
  const selectedState = useStore((s) => s.selectedState);
  const selectedSeat = useStore((s) => s.selectedSeat);
  const world = useWorld();
  if (world.seats.length === 1) return <SeatDetail seatId={world.seats[0].id} />;
  if (selectedSeat) return <SeatDetail seatId={selectedSeat} />;
  if (selectedState) return <StateList />;
  return <HotSeats />;
}

function SeatRow({ index, display, showState }: { index: number; display: SeatDisplay; showState: boolean }) {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const selectSeat = useStore((s) => s.selectSeat);
  const seat = world.seats[index];
  return (
    <li>
      <button className="seat-row" onClick={() => selectSeat(seat.id, seat.state)}>
        <span className="dot" style={{ background: partyColor(display.winner), opacity: display.stale ? 0.4 : 1 }} />
        <span className="grow">
          <span className="seat-name">{seat.name}</span>
          <span className="muted small">
            {seat.id}{showState ? ` · ${regionLabel(t, world, seat.state)}` : ''}{display.stale ? ` · ${t('map.fog')}` : ''}
          </span>
        </span>
        <span className="muted small">{partyShort(t, display.winner)}</span>
        <span className={`badge ${display.cls}`}>{f.pct(display.margin)}</span>
      </button>
    </li>
  );
}

function HotSeats() {
  const t = useT();
  const display = useDisplay();
  const hot = display.map((d, i) => ({ d, i })).sort((a, b) => a.d.margin - b.d.margin).slice(0, HOT_SEATS);
  return (
    <section>
      <div className="panel-head">
        <h2>{t('hot.title')}</h2>
        <span className="muted">{t('hot.subtitle')}</span>
      </div>
      <ul className="seat-list">{hot.map(({ d, i }) => <SeatRow key={i} index={i} display={d} showState />)}</ul>
    </section>
  );
}

function StateList() {
  const t = useT();
  const world = useWorld();
  const display = useDisplay();
  const state = useStore((s) => s.selectedState)!;
  const seats = world.seatsByState[state].map((i) => ({ d: display[i], i })).sort((a, b) => a.d.margin - b.d.margin);
  const tally = new Array<number>(N_PARTIES).fill(0);
  for (const { d } of seats) tally[d.winner]++;
  const order = tally.map((n, p) => ({ n, p })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);

  return (
    <section>
      <div className="panel-head">
        <h2>{regionLabel(t, world, state)}</h2>
        <span className="muted">{t('state.seats', { n: seats.length })}</span>
      </div>
      <div className="seatbar thin">
        {order.map((o) => <span key={o.p} style={{ width: `${(o.n / seats.length) * 100}%`, background: partyColor(o.p) }} />)}
      </div>
      <p className="state-tally">
        {order.map((o) => (
          <span key={o.p}><i className="dot" style={{ background: partyColor(o.p) }} />{partyShort(t, o.p)} <strong className="num">{o.n}</strong></span>
        ))}
      </p>
      <p className="muted small">{t('state.sortHint')}</p>
      <ul className="seat-list">{seats.map(({ d, i }) => <SeatRow key={i} index={i} display={d} showState={false} />)}</ul>
    </section>
  );
}

/** Vote shares as labelled bars, biggest first. */
function ShareBars({ shares, votes }: { shares: number[]; votes?: number[] }) {
  const t = useT();
  const f = useFormat();
  const order = shares.map((s, p) => ({ s, p })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  return (
    <ul className="result-bars">
      {order.map(({ s, p }) => (
        <li key={p}>
          <div className="result-label">
            <span>{partyName(t, p)}</span>
            <span className="num">
              {votes && <span className="muted small">{t('seat.votes', { n: f.int(votes[p]) })} </span>}
              <strong>{f.pct(s)}</strong>
            </span>
          </div>
          <div className="bar"><span style={{ width: `${s * 100}%`, background: partyColor(p) }} /></div>
        </li>
      ))}
    </ul>
  );
}

function SeatDetail({ seatId }: { seatId: string }) {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const dev = useStore((s) => s.dev);
  const selectSeat = useStore((s) => s.selectSeat);
  const act = useStore((s) => s.act);
  const poll = useStore((s) => s.poll);
  const intel = useIntel().get(seatId);
  const real = useTruth(world, campaign, dev);

  const index = world.seatIndex.get(seatId)!;
  const seat = world.seats[index];
  const last = lastOutcome(world).seats[index];
  const me = campaign.player;
  const funds = campaign.parties[me]!.funds;
  const visited = campaign.parties[me]!.visits.includes(seatId);
  const blocs = seat.blocs.map((share, i) => ({ share, i })).filter((b) => b.share > 0.005).sort((a, b) => b.share - a.share);
  const truthSeat = real?.seats[index];

  const quick = (id: 'ceramah' | 'walkabout') => {
    const cost = actionCost(world, campaign, me, id, { seat: seatId });
    return (
      <button className="btn small" disabled={!canDo(world, campaign, me, id, { seat: seatId }).ok} onClick={() => act(id, { seat: seatId })}>
        {t(`action.${id}`)} <span className="muted">{f.days(cost.days)} · {f.rm(cost.money)}</span>
      </button>
    );
  };
  const pollButton = (quality: 'quick' | 'full') => {
    const cost = playerPollCost(world, campaign, 'seat', seatId, quality);
    return (
      <button className="btn small" disabled={cost > funds} onClick={() => poll('seat', seatId, quality)}>
        {t('polls.seat')} ({t(`polls.${quality}`)}) <span className="muted">{f.rm(cost)}</span>
      </button>
    );
  };

  return (
    <section className="seat-detail">
      {world.seats.length > 1 && <button className="link" onClick={() => selectSeat(null)}>‹ {t('seat.close')}</button>}
      <div className="panel-head">
        <h2>{seat.name}</h2>
        <span className="muted">{seat.id}{world.seats.length > 1 ? ` · ${regionLabel(t, world, seat.state)}` : ''}</span>
      </div>
      <p className="badges">
        <span className="badge plain">{t(`kind.${seat.kind}`)}</span>
        <span className="badge plain">{f.int(seat.electorate)} {t('seat.electorate').toLowerCase()}</span>
        {visited && <span className="badge leaning">{t('seat.visitedThisWeek')}</span>}
      </p>
      {(campaign.standDowns[seatId] ?? []).map((to, from) => to >= 0 && (
        <p key={from} className="note">{t('seat.aside', { from: partyName(t, from), to: partyName(t, to) })}</p>
      ))}
      <div className="button-row tight">{quick('ceramah')}{quick('walkabout')}</div>

      <h3>{t('seat.poll')}{intel && <span className="h3-note"> · {t('seat.pollMeta', { n: intel.week, moe: Math.round(intel.moe * 100) })}</span>}</h3>
      {intel ? <ShareBars shares={intel.shares} /> : <p className="muted small">{t('seat.noPoll')}</p>}
      <div className="button-row tight">{pollButton('quick')}{pollButton('full')}</div>

      <h3>{t('seat.lastResult')}<span className="h3-note"> · {t('seat.turnout')} {f.pct(last.turnout)}</span></h3>
      <ShareBars shares={last.votes.map((v) => v / last.valid)} votes={last.votes} />

      {truthSeat && (
        <>
          <h3>{t('seat.truth')}</h3>
          <ShareBars shares={truthSeat.votes.map((v) => v / truthSeat.valid)} />
        </>
      )}

      <h3>{t('seat.blocs')}</h3>
      <table className="bloc-table">
        <tbody>
          {blocs.map((b) => (
            <tr key={b.i}>
              <th scope="row">{t(`bloc.${BLOC_IDS[b.i]}`)}</th>
              <td className="num">{f.pct(b.share, 0)}</td>
              <td>
                {truthSeat
                  ? <div className="stack">{truthSeat.blocs[b.i].shares.map((s, p) => (s > 0 ? <span key={p} style={{ width: `${s * 100}%`, background: partyColor(p) }} /> : null))}</div>
                  : <div className="bar"><span style={{ width: `${(b.share / blocs[0].share) * 100}%`, background: 'var(--muted)' }} /></div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="note">{t('seat.blocsNote')}</p>
    </section>
  );
}
