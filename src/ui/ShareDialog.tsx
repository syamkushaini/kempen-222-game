import { useEffect, useRef, useState } from 'react';
import type { Summary } from '../sim/campaign/turn';
import type { Campaign } from '../sim/campaign/types';
import { majorityLine, type World } from '../sim/election';
import { challengeById, goalResult } from '../sim/campaign/challenges';
import { careerYears } from '../sim/campaign/legacy';
import type { StringKey } from '../i18n/strings';
import type { ElectionOutcome } from '../sim/types';
import { voiceOf } from './cardVoice';
import { leaderPortrait } from './faces';
import { paintedLeader } from './painted';
import { contestName, leaderName, partyColor, partyName, useT, type Format, type T } from './hooks';
import { mapPicture } from './map3d';
import { drawCard, type CardData } from './shareCard';

const common = (t: T) => ({ tagline: t('share.tagline'), fiction: t('share.fiction') });

/** The leader's face for the card: the painted portrait where there is one, otherwise the drawn bust. */
const face = (t: T, p: number) => ({ src: paintedLeader(p) ?? leaderPortrait(p) ?? '', caption: leaderName(t, p), sub: partyName(t, p) });

/** How the game was played, for those who want to show it off: only what is worth showing. */
function badgesOf(t: T, c: Campaign, summary: Pick<Summary, 'seats' | 'before' | 'voteShare'>): string[] {
  const out: string[] = [];
  if (c.difficulty === 'hard') out.push(t('card.badge.hard'));
  if (c.challenge?.fog) out.push(t('card.badge.fog'));
  if (c.challenge?.noisy) out.push(t('card.badge.noisy'));
  const def = challengeById(c.challenge?.goal);
  if (def && goalResult(def.goal, summary).met) out.push(t('card.badge.met', { title: t(`challenges.c.${def.id}` as StringKey) }));
  return out;
}

/** The card for an election night: the verdict, the figures and the chamber as it now sits. */
export function electionCard(t: T, f: Format, world: World, c: Campaign, result: ElectionOutcome, summary: Summary): CardData {
  const me = c.player;
  const kind = world.rules.kind;
  const contest = c.career ? `${t('scenario.career')} · ${t('share.term', { n: c.career.term })}` : `${t(`scenario.${kind}`)} · ${contestName(t, world)}`;
  const seat = result.seats[0];
  const lead = seat ? [...seat.votes].sort((a, b) => b - a) : [];
  const margin = kind === 'byelection' && seat ? seat.margin : 0;
  const voice = voiceOf({ verdict: summary.verdict, seats: summary.seats, before: summary.before, total: world.seats.length, majority: majorityLine(world), margin });
  const base = {
    ...common(t), accent: partyColor(me), kicker: contest,
    headline: t(voice.shout as StringKey), body: t(voice.line as StringKey),
    badges: badgesOf(t, c, summary), portrait: face(t, me),
  };
  if (kind === 'byelection') {
    const mine = seat.votes[me] ?? 0;
    const won = mine === lead[0];
    const gap = Math.abs(won ? mine - (lead[1] ?? 0) : lead[0] - mine);
    return {
      ...base,
      hero: { value: f.pct(summary.voteShare), label: t('card.hero.vote') },
      stats: [
        { label: t(won ? 'card.wonBy' : 'card.lostBy'), value: f.int(gap) },
        { label: t('summary.rank'), value: `#${1 + seat.votes.filter((v) => v > mine).length}` },
        { label: t('seat.turnout'), value: f.pct(seat.turnout) },
      ],
      bars: seat.votes.map((v, p) => ({ label: partyName(t, p), share: v / seat.valid, color: partyColor(p), mine: p === me }))
        .filter((b) => b.share > 0).sort((a, b) => b.share - a.share),
    };
  }
  // The player's party sits on the left, the rest in order of size.
  const order = result.tally.map((n, p) => ({ n, p })).filter((x) => x.n > 0).sort((a, b) => (b.p === me ? 1 : 0) - (a.p === me ? 1 : 0) || b.n - a.n);
  const change = summary.seats - summary.before;
  return {
    ...base,
    hero: { value: String(summary.seats), label: t('card.hero.seats'), sub: t('card.hero.of', { total: world.seats.length }) },
    stats: [
      { label: t('card.vsLast'), value: `${change >= 0 ? '+' : '−'}${Math.abs(change)}` },
      { label: t('summary.voteShare'), value: f.pct(summary.voteShare) },
      { label: t('summary.rank'), value: `#${summary.rank}` },
      { label: t('card.toGovern'), value: String(majorityLine(world)) },
    ],
    chamber: { seats: order.flatMap(({ n, p }) => new Array<string>(n).fill(partyColor(p))), mine: result.tally[me] ?? 0 },
  };
}

/** The card for the end of a career: the legacy, the score and the record. */
export function legacyCard(t: T, c: Campaign): CardData {
  const k = c.career!;
  const end = k.ending!;
  const years = careerYears(c);
  return {
    ...common(t), accent: partyColor(c.player), kicker: `${t(`ending.${end.kind}`)} · ${partyName(t, c.player)}`,
    headline: t(`legacy.${end.legacy}`), body: t(`legacy.${end.legacy}.text`),
    hero: { value: String(end.score), label: t('legacy.score'), sub: t('card.hero.years', { n: years.toFixed(1) }) },
    stats: [
      { label: t('legacy.years'), value: years.toFixed(1) },
      { label: t('house.record.pm'), value: (k.record.weeksPm / 52).toFixed(1) },
      { label: t('house.record.elections'), value: String(k.record.elections) },
      { label: t('house.record.kept'), value: String(k.record.kept.length) },
    ],
    badges: c.difficulty === 'hard' ? [t('card.badge.hard')] : [],
    portrait: face(t, c.player),
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
    // If the 3D map is on screen behind this dialog, it goes on the card.
    drawCard(el, { ...data, backdrop: data.backdrop ?? mapPicture() ?? undefined })
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
