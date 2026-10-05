import { useEffect, useRef, useState } from 'react';
import { PARTIES } from '../data/parties';
import type { Summary } from '../sim/campaign/turn';
import type { Campaign } from '../sim/campaign/types';
import type { World } from '../sim/election';
import { PARTY_IDS, type ElectionOutcome } from '../sim/types';
import { leaderPortrait } from './faces';
import { contestName, leaderName, partyColor, partyName, useT, type Format, type T } from './hooks';
import { drawCard, type CardData } from './shareCard';

/** Read when the card is made, so it follows the palette in use. */
const flags = () => PARTY_IDS.filter((id) => id !== 'oth').map((id) => PARTIES[id].color);
const common = (t: T) => ({ flags: flags(), tagline: t('share.tagline'), fiction: t('share.fiction') });

/** The card for an election night: the verdict, the figures and the chamber as it now sits. */
export function electionCard(t: T, f: Format, world: World, c: Campaign, result: ElectionOutcome, summary: Summary): CardData {
  const me = c.player;
  const kind = world.rules.kind;
  const contest = c.career ? `${t('scenario.career')} · ${t('share.term', { n: c.career.term })}` : `${t(`scenario.${kind}`)} · ${contestName(t, world)}`;
  const base = {
    ...common(t), accent: partyColor(me), kicker: `${contest} · ${partyName(t, me)}`,
    headline: t(`card.verdict.${summary.verdict}`), body: t(`summary.verdict.${summary.verdict}`),
  };
  if (kind === 'byelection') {
    const seat = result.seats[0];
    return {
      ...base,
      stats: [
        { label: t('summary.voteShare'), value: f.pct(summary.voteShare) },
        { label: t('seat.margin'), value: f.pct(seat.margin) },
        { label: t('seat.turnout'), value: f.pct(seat.turnout) },
      ],
      bars: seat.votes.map((v, p) => ({ label: partyName(t, p), share: v / seat.valid, color: partyColor(p) }))
        .filter((b) => b.share > 0).sort((a, b) => b.share - a.share),
    };
  }
  // The player's party sits on the left, the rest in order of size.
  const order = result.tally.map((n, p) => ({ n, p })).filter((x) => x.n > 0).sort((a, b) => (b.p === me ? 1 : 0) - (a.p === me ? 1 : 0) || b.n - a.n);
  const change = summary.seats - summary.before;
  return {
    ...base,
    stats: [
      { label: t('summary.seats'), value: String(summary.seats) },
      { label: t('summary.change'), value: `${change >= 0 ? '+' : '−'}${Math.abs(change)}` },
      { label: t('summary.voteShare'), value: f.pct(summary.voteShare) },
      { label: t('summary.rank'), value: `#${summary.rank}` },
    ],
    chamber: {
      seats: order.flatMap(({ n, p }) => new Array<string>(n).fill(partyColor(p))),
      caption: t('share.ofSeats', { n: summary.seats, total: world.seats.length }),
    },
  };
}

/** The card for the end of a career: the legacy, the score and the record. */
export function legacyCard(t: T, c: Campaign): CardData {
  const k = c.career!;
  const end = k.ending!;
  const years = ((k.term - 1) * 260 + k.week) / 52;
  return {
    ...common(t), accent: partyColor(c.player), kicker: t(`ending.${end.kind}`),
    headline: t(`legacy.${end.legacy}`), body: t(`legacy.${end.legacy}.text`),
    stats: [
      { label: t('legacy.score'), value: String(end.score) },
      { label: t('legacy.years'), value: years.toFixed(1) },
      { label: t('house.record.pm'), value: (k.record.weeksPm / 52).toFixed(1) },
    ],
    portrait: { src: leaderPortrait(c.player) ?? '', caption: leaderName(t, c.player), sub: partyName(t, c.player) },
  };
}

/** Shows the result card, with buttons to save it as an image or hand it to the device's share sheet. */
export function ShareDialog({ data, onClose }: { data: CardData; onClose(): void }) {
  const t = useT();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    const el = canvas.current;
    if (!el) return;
    drawCard(el, data)
      .then(() => el.toBlob((blob) => { if (live && blob) setFile(new File([blob], 'kempen-222.png', { type: 'image/png' })); else if (live) setFailed(true); }, 'image/png'))
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [data]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const save = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const canShare = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
  const share = () => { if (file) void navigator.share({ files: [file], title: 'Kempen 222', text: data.headline }).catch(() => undefined); };

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog panel share-dialog" role="dialog" aria-modal="true" aria-label={t('share.title')}>
        <h2>{t('share.title')}</h2>
        <p className="muted small">{t('share.hint')}</p>
        <canvas ref={canvas} className="share-card" role="img" aria-label={t('share.alt', { headline: data.headline })} />
        {failed && <p className="note">{t('share.failed')}</p>}
        <div className="button-row">
          <button className="btn primary" disabled={!file} onClick={save}>{t('share.save')}</button>
          {canShare && <button className="btn" onClick={share}>{t('share.share')}</button>}
          <button className="btn" onClick={onClose}>{t('share.close')}</button>
        </div>
      </div>
    </div>
  );
}
