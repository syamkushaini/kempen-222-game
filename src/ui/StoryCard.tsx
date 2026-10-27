import type { StringKey } from '../i18n/strings';
import { ARCS, beatOf, manner, openChapter, styleOf, unseen } from '../sim/campaign/storyline';
import type { Campaign } from '../sim/campaign/types';
import { useStore } from '../state/store';
import { regionLabel, useT, useWorld } from './hooks';
import { Icon } from './Icon';

/** The state's name and what it is known for, to fill into the words of a state's story. Empty in the country's. */
export function useStoryVars(): Record<string, string> {
  const t = useT();
  const world = useWorld();
  const scenario = useStore((s) => s.game?.campaign.scenario ?? '');
  if (!scenario.startsWith('career:')) return { state: '', trade: '' };
  const st = scenario.slice(7);
  const known = `story.trade.${st}` as StringKey;
  return { state: regionLabel(t, world, st), trade: t(known) === known ? t('story.trade.default') : t(known) };
}

/**
 * The storyline on the desk: the chapter the career is in, a teaser of the one that is coming (never more than that, so that nothing
 * is given away), and, folded away, what has happened so far and what the player chose.
 */
export function StoryCard() {
  const t = useT();
  const vars = useStoryVars();
  const campaign = useStore((s) => s.game!.campaign);
  const k = campaign.career!;
  const s = k.story;
  if (!s) return null;
  const arc = ARCS[s.arc];
  const total = arc.chapters.length;
  const open = openChapter(k);
  const waiting = open ? campaign.inbox.some((x) => x.event === beatOf(campaign, open)) : false;
  return (
    <section className="story-card" aria-label={t('story.card.title')}>
      <div className="story-head">
        <span className="row-icon"><Icon name="book" size={18} /></span>
        <div className="grow">
          <span className="action-title">{t(`story.arc.${s.arc}.name` as StringKey)}</span>
          <span className="action-meta">{open ? t('story.card.chapter', { n: s.ch + 1, total }) : t('story.card.told')}</span>
        </div>
        <ol className="story-dots" aria-hidden="true">
          {arc.chapters.map((ch, i) => <li key={ch.id} className={i < s.ch ? 'done' : i === s.ch ? 'now' : ''} />)}
        </ol>
      </div>
      {open ? (
        <p className="story-next">
          <strong>{t(`story.${open.id}.title` as StringKey, vars)}</strong>
          <span className="muted"> · {waiting ? t('story.card.now.desk') : t('story.card.next')}</span>
          <br />
          <em>{t(`story.${open.id}.hook` as StringKey, vars)}</em>
        </p>
      ) : (
        <p className="story-next"><em>{t(`story.${s.arc}.told` as StringKey, vars)}</em></p>
      )}
      {s.log.length > 0 && (
        <details className="story-log">
          <summary>{t('story.card.past')} ({s.log.length})</summary>
          <ol>
            {s.log.map((e) => (
              <li key={e.ch}>
                <strong>{t(`story.${arc.chapters[e.ch].id}.title` as StringKey, vars)}</strong>
                <span className="muted"> · {t('story.card.year', { n: e.year })}</span>
                <br />
                <span>{t(`story.${arc.chapters[e.ch].id}.close.${styleOf(e.beat, e.pick)}` as StringKey, vars)}</span>
                <br />
                <span className="muted small">{t('story.chosen', { option: t(`event.${e.beat}.o${e.pick}` as StringKey) })}</span>
              </li>
            ))}
          </ol>
          {s.ch < total && <p className="muted small">{t('story.card.later')}: {Array.from({ length: total - s.ch - 1 }, (_, i) => t('story.card.unwritten', { n: s.ch + i + 2 })).join(' · ') || '–'}</p>}
        </details>
      )}
    </section>
  );
}

/** A chapter has closed: said once, with a teaser of the next. It waits while a decision is on the desk or its result is being read. */
export function ChapterModal() {
  const t = useT();
  const vars = useStoryVars();
  const campaign = useStore((s) => s.game?.campaign);
  const waiting = useStore((s) => !!s.decisionNews);
  const seeStory = useStore((s) => s.seeStory);
  const k = campaign?.career;
  if (!campaign || !k?.story || campaign.phase !== 'term' || campaign.inbox.length > 0 || waiting || k.ending || unseen(k) <= 0) return null;
  const s = k.story;
  const entry = s.log[s.seen];
  const arc = ARCS[s.arc];
  const chapter = arc.chapters[entry.ch];
  const next = s.seen === s.log.length - 1 ? openChapter(k) : arc.chapters[s.log[s.seen + 1].ch];
  const style = styleOf(entry.beat, entry.pick);
  return (
    <div className="overlay">
      <div className="dialog panel story-modal" role="dialog" aria-modal="true" aria-label={t('story.modal.title', { n: entry.ch + 1 })}>
        <p className="dialog-from">{t(`story.arc.${s.arc}.name` as StringKey)} · {t('story.modal.title', { n: entry.ch + 1 })}</p>
        <h2>{t(`story.${chapter.id}.title` as StringKey, vars)}</h2>
        <p>{t(`story.${chapter.id}.close.${style}` as StringKey, vars)}</p>
        <p className="muted small">{t('story.chosen', { option: t(`event.${entry.beat}.o${entry.pick}` as StringKey) })}</p>
        <p className="story-teaser">{next ? t('story.modal.next', { hook: t(`story.${next.id}.hook` as StringKey, vars) }) : t('story.modal.last')}</p>
        <div className="button-row"><button className="btn primary" autoFocus onClick={seeStory}>{t('story.modal.go')} ▸</button></div>
      </div>
    </div>
  );
}

/** At the career's end: the story of this run, chapter by chapter, in the player's own choices, and how it ends. */
export function StoryRecap({ campaign }: { campaign: Campaign }) {
  const t = useT();
  const vars = useStoryVars();
  const k = campaign.career!;
  const s = k.story;
  if (!s) return null;
  const arc = ARCS[s.arc];
  const open = openChapter(k);
  const how = manner(s);
  return (
    <section className="story-recap" aria-label={t('story.recap.title')}>
      <h3>{t('story.recap.title')} · {t(`story.arc.${s.arc}.name` as StringKey)}</h3>
      {s.log.length === 0 ? <p className="muted">{t('story.recap.none')}</p> : (
        <>
          <p className="story-manner"><strong>{t(`story.recap.manner.${how}` as StringKey)}</strong></p>
          <ol className="story-log-list">
            {s.log.map((e) => (
              <li key={e.ch}>
                <strong>{t(`story.${arc.chapters[e.ch].id}.title` as StringKey, vars)}</strong>
                <span className="muted"> · {t('story.card.year', { n: e.year })}</span>
                <br />
                <span>{t(`story.${arc.chapters[e.ch].id}.close.${styleOf(e.beat, e.pick)}` as StringKey, vars)}</span>
                <br />
                <span className="muted small">{t('story.chosen', { option: t(`event.${e.beat}.o${e.pick}` as StringKey) })}</span>
              </li>
            ))}
          </ol>
          <p>{t(`story.${s.arc}.end.${how}` as StringKey, vars)}</p>
        </>
      )}
      {open && <p className="muted small">{t('story.recap.unwritten', { title: t(`story.${open.id}.title` as StringKey, vars) })}</p>}
      <p className="muted small">{t('story.cast')}</p>
    </section>
  );
}
