import { useEffect, useMemo, useRef, useState } from 'react';
import { flipKind } from '../sim/campaign/night';
import { countBatches, declarationOrder, electionResult, summarise } from '../sim/campaign/turn';
import { majorityLine } from '../sim/election';
import { N_PARTIES } from '../sim/types';
import { useStore } from '../state/store';
import { lastOutcome, partyColor, partyName, partyShort, regionLabel, seatName, useFormat, useT, useWorld, type SeatDisplay } from './hooks';
import { sound } from './audio';
import { MapView, type PulseKind } from './MapView';
import { GoalResult } from './Challenges';
import { GamePanel } from './SavesTab';
import { electionCard, ShareDialog } from './ShareDialog';
import { Review } from './Review';
import { Tally } from './Tally';

const STEP_MS = { normal: 210, fast: 45 };
const UNDECLARED: SeatDisplay = { winner: -1, margin: 0, cls: 'safe', shares: null, stale: false };

export function ElectionNight() {
  const world = useWorld();
  return world.rules.kind === 'byelection' ? <ByElectionCount /> : <SeatBySeat />;
}

/** Results arrive seat by seat, like a television results programme. */
function SeatBySeat() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const TOTAL = world.seats.length, MAJORITY = majorityLine(world);
  const campaign = useStore((s) => s.game!.campaign);
  const finishNight = useStore((s) => s.finishNight);
  const quitToTitle = useStore((s) => s.quitToTitle);
  const restart = useStore((s) => s.restart);
  const leaveNight = useStore((s) => s.leaveNight);
  const selectSeat = useStore((s) => s.selectSeat);
  const selectedSeat = useStore((s) => s.selectedSeat);
  const electionSeed = campaign.election?.rng;

  // The campaign object changes when the night is marked finished; the result does not.
  const result = useMemo(() => electionResult(world, campaign)!, [world, electionSeed]); // eslint-disable-line react-hooks/exhaustive-deps
  const order = useMemo(() => declarationOrder(world, campaign), [world, electionSeed]); // eslint-disable-line react-hooks/exhaustive-deps
  const summary = useMemo(() => summarise(world, campaign, result), [result]); // eslint-disable-line react-hooks/exhaustive-deps

  const [count, setCount] = useState(campaign.phase !== 'night' ? TOTAL : 0);
  const [playing, setPlaying] = useState(true);
  const [fast, setFast] = useState(false);
  const [sharing, setSharing] = useState(false);
  const finished = count >= TOTAL;

  useEffect(() => {
    if (!playing || finished) return;
    const id = setInterval(() => setCount((c) => Math.min(TOTAL, c + 1)), fast ? STEP_MS.fast : STEP_MS.normal);
    return () => clearInterval(id);
  }, [playing, fast, finished, TOTAL]);

  useEffect(() => { if (finished) finishNight(); }, [finished, finishNight]);

  const { display, tally, votes, majorityAt } = useMemo(() => {
    const display: SeatDisplay[] = world.seats.map(() => UNDECLARED);
    const tally = new Array<number>(N_PARTIES).fill(0);
    const votes = new Array<number>(N_PARTIES).fill(0);
    let majorityAt: { party: number; at: number } | null = null;
    const running = new Array<number>(N_PARTIES).fill(0);
    order.forEach((i, n) => {
      const o = result.seats[i];
      running[o.winner]++;
      if (!majorityAt && running[o.winner] >= MAJORITY) majorityAt = { party: o.winner, at: n + 1 };
      if (n >= count) return;
      display[i] = { winner: o.winner, margin: o.margin, cls: o.cls, shares: o.votes.map((v) => v / o.valid), stale: false };
      tally[o.winner]++;
      for (let p = 0; p < N_PARTIES; p++) votes[p] += o.votes[p];
    });
    return { display, tally, votes, majorityAt: majorityAt as { party: number; at: number } | null };
  }, [world, order, result, count, MAJORITY]);

  const last = lastOutcome(world);
  // Each declaration has its sound: the player's gains and losses stand out, and a majority gets a fanfare.
  const heard = useRef(count);
  useEffect(() => {
    const from = heard.current;
    heard.current = count;
    if (count !== from + 1) return;
    const i = order[count - 1];
    const o = result.seats[i], was = last.seats[i].winner;
    if (majorityAt?.at === count) sound.play('fanfare');
    else if (o.winner === campaign.player) sound.play('seatWon');
    else if (was === campaign.player) sound.play('seatLost');
    else if (!fast) sound.play('seat');
  }, [count]); // eslint-disable-line react-hooks/exhaustive-deps
  const card = useMemo(() => electionCard(t, f, world, campaign, result, summary), [t, f, world, campaign, result, summary]);
  const ticker = order.slice(Math.max(0, count - 8), count).reverse();
  // The seat just declared flashes on the map, and the colour says what it meant. A skip to the end flashes nothing.
  const pulse = useMemo(() => {
    if (count === 0 || count >= TOTAL || !playing) return null;
    const i = order[count - 1];
    const o = result.seats[i], was = last.seats[i].winner;
    const kind: PulseKind = flipKind(o.winner, was, campaign.player);
    return { id: world.seats[i].id, kind, n: count };
  }, [count, playing]); // eslint-disable-line react-hooks/exhaustive-deps
  const picked = selectedSeat ? world.seatIndex.get(selectedSeat)! : -1;
  const pickedShown = picked >= 0 && display[picked].winner >= 0 ? result.seats[picked] : null;

  const seatLinks = (ids: string[]) => ids.length === 0 ? <span className="muted">{t('summary.none')}</span> : (
    <span className="seat-links">
      {ids.map((id) => (
        <button key={id} className="link inline" onClick={() => selectSeat(id, world.seats[world.seatIndex.get(id)!].state)}>{seatName(world, id)}</button>
      ))}
    </span>
  );

  return (
    <main className="layout">
      <section className="map-column">
        <MapView
          display={display}
          pulse={pulse}
          toolbar={<span className="muted num">{t('night.declared', { n: count, total: TOTAL })}</span>}
        />
        <div className="progress" aria-hidden="true"><span style={{ width: `${(count / TOTAL) * 100}%` }} /></div>
      </section>

      <aside className="sidebar">
        <Tally tally={tally} votes={votes} title={t('night.title')} note={t('night.declared', { n: count, total: TOTAL })} highlight={campaign.player} />

        {!finished && (
          <div className="button-row">
            <button className="btn" onClick={() => setPlaying((p) => !p)}>{playing ? t('night.pause') : t('night.play')}</button>
            <button className="btn" onClick={() => setFast((v) => !v)}>{fast ? t('night.normal') : t('night.faster')}</button>
            <button className="btn" onClick={() => setCount(TOTAL)}>{t('night.skip')}</button>
          </div>
        )}

        <div className="tab-body">
          {majorityAt && count >= majorityAt.at && (
            <p className="call majority" style={{ borderColor: partyColor(majorityAt.party) }}>
              {t('night.majorityCall', { party: partyName(t, majorityAt.party), n: MAJORITY })}
            </p>
          )}

          {finished && (
            <section className="summary">
              <h2>{t('summary.title')}</h2>
              <p className={`verdict ${summary.verdict}`}>{t(`summary.verdict.${summary.verdict}`)}</p>
              <GoalResult summary={summary} />
              <dl className="facts">
                <div><dt>{t('summary.seats')}</dt><dd className="num">{summary.seats}</dd></div>
                <div><dt>{t('summary.change')}</dt><dd className="num">{summary.seats - summary.before >= 0 ? '+' : ''}{summary.seats - summary.before}</dd></div>
                <div><dt>{t('summary.voteShare')}</dt><dd className="num">{f.pct(summary.voteShare)}</dd></div>
                <div><dt>{t('summary.rank')}</dt><dd className="num">#{summary.rank}</dd></div>
              </dl>
              {campaign.formation && (
                <p className="note">{t(campaign.formation.outcome ? 'summary.settled' : 'summary.hung')}</p>
              )}
              <h3>{t('summary.gained', { n: summary.gained.length })}</h3>
              {seatLinks(summary.gained)}
              <h3>{t('summary.lost', { n: summary.lost.length })}</h3>
              {seatLinks(summary.lost)}
              <Review campaign={campaign} result={result} />
              <div className="button-row">
                {campaign.formation
                  ? <button className="btn primary" onClick={leaveNight}>{t(campaign.formation.outcome ? 'summary.toGovernment' : 'summary.toTalks')} ▸</button>
                  : <><button className="btn primary" onClick={quitToTitle}>{t('summary.again')} ▸</button><button className="btn" onClick={restart}>{t('summary.restart')}</button></>}
                <button className="btn" onClick={() => setSharing(true)}>{t('share.button')}</button>
              </div>
              {sharing && <ShareDialog data={card} onClose={() => setSharing(false)} />}
            </section>
          )}

          {pickedShown && (
            <section className="picked">
              <h3>{seatName(world, selectedSeat!)} · {f.pct(pickedShown.turnout)} {t('seat.turnout').toLowerCase()}</h3>
              <ul className="result-bars">
                {pickedShown.votes.map((v, p) => ({ v, p })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v).map(({ v, p }) => (
                  <li key={p}>
                    <div className="result-label">
                      <span>{partyName(t, p)}</span>
                      <span className="num"><span className="muted small">{t('seat.votes', { n: f.int(v) })} </span><strong>{f.pct(v / pickedShown.valid)}</strong></span>
                    </div>
                    <div className="bar"><span style={{ width: `${(v / pickedShown.valid) * 100}%`, background: partyColor(p) }} /></div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!finished && (
            <ul className="ticker" aria-live="off">
              {ticker.length === 0 && <li className="muted">{t('night.waiting')}</li>}
              {ticker.map((i) => {
                const o = result.seats[i];
                const was = last.seats[i].winner;
                const mine = o.winner === campaign.player || was === campaign.player;
                return (
                  <li key={i} className={mine ? 'mine' : ''}>
                    <span className="dot" style={{ background: partyColor(o.winner) }} />
                    <span className="grow">
                      <span className="seat-name">{world.seats[i].name}</span>
                      <span className="muted small">{regionLabel(t, world, world.seats[i].state)} · {t('map.margin', { pct: f.pct(o.margin) })}</span>
                    </span>
                    <span className={was === o.winner ? 'badge plain' : 'badge marginal'}>
                      {partyShort(t, o.winner)} {was === o.winner ? t('night.hold') : t('night.gain', { party: partyShort(t, was) })}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <GamePanel />
        </div>
      </aside>
    </main>
  );
}

const BOXES = 12;

/** A single seat's count, box by box, with the lead changing hands as boxes come in. */
function ByElectionCount() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const finishNight = useStore((s) => s.finishNight);
  const quitToTitle = useStore((s) => s.quitToTitle);
  const restart = useStore((s) => s.restart);
  const electionSeed = campaign.election?.rng;

  const result = useMemo(() => electionResult(world, campaign)!, [world, electionSeed]); // eslint-disable-line react-hooks/exhaustive-deps
  const boxes = useMemo(() => countBatches(campaign, result, BOXES), [result]); // eslint-disable-line react-hooks/exhaustive-deps
  const summary = useMemo(() => summarise(world, campaign, result), [result]); // eslint-disable-line react-hooks/exhaustive-deps

  const [count, setCount] = useState(campaign.phase !== 'night' ? BOXES : 0);
  const [playing, setPlaying] = useState(true);
  const [sharing, setSharing] = useState(false);
  const finished = count >= BOXES;

  useEffect(() => {
    if (!playing || finished) return;
    const id = setInterval(() => setCount((c) => Math.min(BOXES, c + 1)), 1300);
    return () => clearInterval(id);
  }, [playing, finished]);
  useEffect(() => { if (finished) finishNight(); }, [finished, finishNight]);

  const seat = result.seats[0];
  const heard = useRef(count);
  useEffect(() => {
    const from = heard.current;
    heard.current = count;
    if (count === from) return;
    if (count < BOXES) sound.play('seat');
    else sound.play(seat.winner === campaign.player ? 'fanfare' : 'bad');
  }, [count]); // eslint-disable-line react-hooks/exhaustive-deps
  const card = useMemo(() => electionCard(t, f, world, campaign, result, summary), [t, f, world, campaign, result, summary]);
  const votes = count === 0 ? seat.votes.map(() => 0) : boxes[count - 1];
  const counted = votes.reduce((a, b) => a + b, 0);
  const order = seat.votes.map((v, p) => ({ p, final: v, now: votes[p] })).filter((x) => x.final > 0).sort((a, b) => b.now - a.now || b.final - a.final);
  const leader = counted > 0 ? order[0].p : -1;
  const display: SeatDisplay[] = [finished
    ? { winner: seat.winner, margin: seat.margin, cls: seat.cls, shares: seat.votes.map((v) => v / seat.valid), stale: false }
    : UNDECLARED];

  return (
    <main className="layout">
      <section className="map-column">
        <MapView display={display} toolbar={<span className="muted num">{t('count.boxes', { n: count, total: BOXES })}</span>} />
        <div className="progress" aria-hidden="true"><span style={{ width: `${(count / BOXES) * 100}%` }} /></div>
      </section>

      <aside className="sidebar roomy">
        <section className="panel count">
          <div className="panel-head">
            <h2>{t('count.title', { seat: world.seats[0].name })}</h2>
            <span className="muted num">{t('count.boxes', { n: count, total: BOXES })}</span>
          </div>
          <p className="headline">
            {finished ? t('count.winner', { party: partyName(t, seat.winner) })
              : leader >= 0 ? t('count.leading', { party: partyName(t, leader) }) : t('night.waiting')}
          </p>
          <ul className="result-bars">
            {order.map(({ p, now }) => (
              <li key={p} className={p === campaign.player ? 'mine' : ''}>
                <div className="result-label">
                  <span>{partyName(t, p)}</span>
                  <span className="num"><span className="muted small">{t('seat.votes', { n: f.int(now) })} </span><strong>{counted > 0 ? f.pct(now / counted) : '–'}</strong></span>
                </div>
                <div className="bar tall"><span style={{ width: `${counted > 0 ? (now / seat.valid) * 100 : 0}%`, background: partyColor(p) }} /></div>
              </li>
            ))}
          </ul>
          {!finished && (
            <div className="button-row">
              <button className="btn" onClick={() => setPlaying((v) => !v)}>{playing ? t('night.pause') : t('night.play')}</button>
              <button className="btn" onClick={() => setCount(BOXES)}>{t('night.skip')}</button>
            </div>
          )}
        </section>

        {finished && (
          <section className="summary">
            <h2>{t('summary.title')}</h2>
            <p className={`verdict ${summary.verdict}`}>{t(`summary.verdict.${summary.verdict}`)}</p>
            <GoalResult summary={summary} />
            <dl className="facts">
              <div><dt>{t('summary.voteShare')}</dt><dd className="num">{f.pct(summary.voteShare)}</dd></div>
              <div><dt>{t('seat.margin')}</dt><dd className="num">{f.pct(seat.margin)}</dd></div>
              <div><dt>{t('seat.turnout')}</dt><dd className="num">{f.pct(seat.turnout)}</dd></div>
              <div><dt>{t('summary.rank')}</dt><dd className="num">#{1 + seat.votes.filter((v) => v > seat.votes[campaign.player]).length}</dd></div>
            </dl>
            <Review campaign={campaign} result={result} />
            <p className="note">{t('count.next')}</p>
            <div className="button-row">
              <button className="btn primary" onClick={quitToTitle}>{t('summary.again')} ▸</button>
              <button className="btn" onClick={restart}>{t('summary.restart')}</button>
              <button className="btn" onClick={() => setSharing(true)}>{t('share.button')}</button>
            </div>
            {sharing && <ShareDialog data={card} onClose={() => setSharing(false)} />}
          </section>
        )}
        <GamePanel />
      </aside>
    </main>
  );
}
