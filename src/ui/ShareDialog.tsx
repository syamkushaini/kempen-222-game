import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Summary } from '../sim/campaign/turn';
import type { Campaign, MissionRecord } from '../sim/campaign/types';
import { lastElection, majorityLine, type World } from '../sim/election';
import { challengeById, goalResult } from '../sim/campaign/challenges';
import { careerYears, legacyOf } from '../sim/campaign/legacy';
import type { StringKey } from '../i18n/strings';
import type { ElectionOutcome } from '../sim/types';
import { seedLink } from '../sim/rng';
import { voiceOf } from './cardVoice';
import { leaderPortrait } from './faces';
import { paintedLeader } from './painted';
import { contestName, leaderName, partyColor, partyName, seatName, useT, type Format, type T } from './hooks';
import { mapPicture } from './map3d';
import { missionGoal, recordAsk } from './missionText';
import { drawCard, type CardData } from './shareCard';
import { drawMelakaCard } from './melakaCard';
import { CopyButton } from './CopyButton';
import { challengeLink, withInvite } from '../sim/campaign/challengeCode';
import { countClick } from '../state/playWatch';
import { useStore } from '../state/store';
import { useBackClose } from './backClose';

export const common = (t: T) => ({ tagline: t('share.tagline'), fiction: t('share.fiction') });

/** The leader's face for the card: the painted portrait where there is one, otherwise the drawn bust. */
export const face = (t: T, p: number) => ({ src: paintedLeader(p) ?? leaderPortrait(p) ?? '', caption: leaderName(t, p), sub: partyName(t, p) });

/** How the game was played, for those who want to show it off: only what is worth showing. */
function badgesOf(t: T, c: Campaign, summary: Pick<Summary, 'seats' | 'before' | 'voteShare'>): string[] {
  const out: string[] = [];
  // The player's own political persona: how a career like this one is remembered (see legacy.ts), read mid-career too.
  if (c.career) out.push(t(`legacy.${legacyOf(c).legacy}` as StringKey));
  if (c.difficulty === 'hard') out.push(t('card.badge.hard'));
  if (c.challenge?.fog) out.push(t('card.badge.fog'));
  if (c.challenge?.noisy) out.push(t('card.badge.noisy'));
  const def = challengeById(c.challenge?.goal);
  if (def && goalResult(def.goal, summary).met) out.push(t('card.badge.met', { title: t(`challenges.c.${def.id}` as StringKey) }));
  return out;
}

/**
 * The seat that most defied the odds: one the player's party won this time having lost it outright last time, picked for
 * the widest margin it lost by then. `null` where nothing like that happened (or there is no earlier result to compare to).
 */
export function biggestUpset(world: World, c: Campaign, result: ElectionOutcome): string | null {
  const me = c.player;
  const before = lastElection(world);
  const flipped = result.seats
    .map((s, i) => ({ id: s.seatId, was: before.seats[i], won: s.winner === me }))
    .filter((x): x is { id: string; was: (typeof before.seats)[number]; won: true } => x.won && !!x.was && x.was.winner !== me)
    .sort((a, b) => b.was.margin - a.was.margin);
  return flipped[0] ? seatName(world, flipped[0].id) : null;
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
  const upset = biggestUpset(world, c, result);
  return {
    ...base,
    badges: [...base.badges, ...(upset ? [t('card.upset', { seat: upset })] : [])],
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

/** The picture of an election night: the ordinary card, or for a state election in Melaka a card of its own, with the old town at dusk. */
export function resultPicture(t: T, f: Format, world: World, c: Campaign, result: ElectionOutcome, summary: Summary): CardData | Drawn {
  const card = electionCard(t, f, world, c, result, summary);
  if (world.id !== 'state:melaka' || c.career) return card;
  const pill = `${t('scenario.state')} · ${t('state.melaka')}`.toUpperCase();
  return { headline: card.headline, draw: (canvas) => drawMelakaCard(canvas, card, pill) };
}

/** The card for the end of a career: the legacy, the score and the record. */
export function legacyCard(t: T, c: Campaign, total: number = c.career!.ending!.score): CardData {
  const k = c.career!;
  const end = k.ending!;
  const years = careerYears(c);
  return {
    ...common(t), accent: partyColor(c.player), kicker: `${t(`ending.${end.kind}`)} · ${partyName(t, c.player)}`,
    headline: t(`legacy.${end.legacy}`), body: t(`legacy.${end.legacy}.text`),
    hero: { value: String(total), label: t('legacy.score'), sub: t('card.hero.years', { n: years.toFixed(1) }) },
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

/** The card for a mission won: what it was, the figure it asked for and the record so far. */
export function missionCard(t: T, f: Format, c: Campaign, r: MissionRecord): CardData {
  const k = c.career!;
  const kinds = r.kind === 'majority' ? (r.alone ? 'majority.alone' : 'majority.lead') : r.kind;
  const done = r.parts?.filter((p) => p.done).length ?? 0;
  const value = r.kind === 'final' ? `${done}/${r.parts?.length ?? 4}` : r.kind === 'funds' ? f.rm(r.need) : r.kind === 'majority' && !r.alone ? '✓' : String(r.need);
  const history = k.missions?.done ?? [];
  const won = history.filter((x) => x.won).length;
  const years = careerYears(c);
  return {
    ...common(t), accent: partyColor(c.player), kicker: `${t('scenario.career')} · ${t('share.term', { n: r.term })}`,
    headline: t(r.kind === 'final' ? 'mission.final.won' : 'mission.won'), body: r.kind === 'final' ? t('card.mission.finalBody') : `${t(`mission.kind.${r.kind}` as StringKey)}. ${missionGoal(t, f, recordAsk(r), '')}`,
    hero: { value, label: t(`card.mission.unit.${kinds}` as StringKey), sub: t(`mission.kind.${r.kind}` as StringKey) },
    stats: [
      { label: t('legacy.years'), value: years.toFixed(1) },
      { label: t('house.record.elections'), value: String(k.record.elections) },
      { label: t('card.mission.won'), value: String(won) },
      { label: t('card.mission.lost'), value: String(history.length - won) },
    ],
    badges: [...(r.kind === 'final' ? [t('card.badge.final')] : []), ...(c.difficulty === 'hard' ? [t('card.badge.hard')] : [])],
    portrait: face(t, c.player),
  };
}

/** A picture that draws itself (a chart, an infographic, a front page) in place of the result poster. */
export interface Drawn { headline: string; text?: string; draw(canvas: HTMLCanvasElement): Promise<void> }

/** Shows the result card, with buttons to save it as an image or hand it to the device's share sheet. */
export function ShareDialog({ data, onClose }: { data: CardData | Drawn; onClose(): void }) {
  useBackClose(onClose);
  const t = useT();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [failed, setFailed] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null);
  // A card from a challenge carries the way to play the very same contest; an ordinary career carries its plain seed instead,
  // so that whoever sees it can start from the exact same scenario and try to beat it.
  const code = useStore((s) => s.game?.campaign.challenge?.code);
  const seed = useStore((s) => s.game?.campaign.seed);
  const invite = code ? `${t('share.try')} ${challengeLink(code, location.href)}` : seed !== undefined ? `${t('share.trySeed')} ${seedLink(seed, location.href)}` : null;
  const caption = 'text' in data && data.text ? data.text : data.headline;
  const message = withInvite(caption, invite);
  // Counted once when the card is opened; the screen it was opened from goes with it.
  useEffect(() => countClick('share', code ? 'challenge' : 'card'), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let live = true;
    const el = canvas.current;
    if (!el) return;
    // If the 3D map is on screen behind this dialog, it goes on the card.
    const done = 'draw' in data ? data.draw(el) : drawCard(el, { ...data, backdrop: data.backdrop ?? mapPicture() ?? undefined });
    done
      .then(() => { if (live) setRatio(el.width / el.height); el.toBlob((blob) => { if (live && blob) setFile(new File([blob], 'kempen-222.png', { type: 'image/png' })); else if (live) setFailed(true); }, 'image/png'); })
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
  const share = () => { if (file) void navigator.share({ files: [file], title: 'Kempen 222', text: message }).catch(() => undefined); };

  return createPortal(
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog panel share-dialog" role="dialog" aria-modal="true" aria-label={t('share.title')}>
        <h2>{t('share.title')}</h2>
        <p className="muted small">{t('share.hint')}</p>
        <canvas ref={canvas} className="share-card" style={ratio ? { aspectRatio: String(ratio) } : undefined} role="img" aria-label={t('share.alt', { headline: data.headline })} />
        {failed && <p className="note">{t('share.failed')}</p>}
        {invite && <p className="muted small">{t('share.challengeNote')}</p>}
        <div className="button-row">
          <button className="btn primary" disabled={!file} onClick={save}>{t('share.save')}</button>
          {canShare && <button className="btn" onClick={share}>{t('share.share')}</button>}
          <a className="btn" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" onClick={() => countClick('share', 'whatsapp')}>{t('share.whatsapp')}</a>
          <a className="btn" href={`https://t.me/share/url?url=${encodeURIComponent(invite ?? location.href)}&text=${encodeURIComponent(caption)}`} target="_blank" rel="noopener noreferrer" onClick={() => countClick('share', 'telegram')}>{t('share.telegram')}</a>
          <CopyButton text={withInvite(data.headline, invite)} label={t(invite ? 'share.copyLink' : 'share.copy')} />
          <button className="btn" onClick={onClose}>{t('share.close')}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
