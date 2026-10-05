import { useMemo, useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { canHireTroopers, canInterview, coverage, interviewOdds, OUTLETS, trooperCost, usualCoverage } from '../sim/campaign/media';
import { OUTLET_IDS, type NewsItem } from '../sim/campaign/types';
import { useStore } from '../state/store';
import { partyColor, partyName, renderNews, useFog, useFormat, useT, useWorld } from './hooks';
import { netizenFeed } from './netizens';
import { ConfirmButton } from './SavesTab';

export function NewsLine({ item }: { item: NewsItem }) {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  return (
    <li className={`news-item ${item.tone}`}>
      <span className="dot" style={{ background: item.party === null ? 'var(--muted)' : partyColor(item.party) }} />
      <span>{renderNews(t, f, world, item)}</span>
    </li>
  );
}

type View = 'news' | 'press' | 'netizens';
const word = (n: number) => `coverage.${Math.max(-2, Math.min(2, Math.round(n)))}` as StringKey;

/** The outlets: how each treats the player, what it led with this week, and the chance to sit down with it. */
function Press() {
  const t = useT();
  const fog = useFog();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const lastReport = useStore((s) => s.lastReport);
  const interview = useStore((s) => s.interview);
  const hireTroopers = useStore((s) => s.hireTroopers);
  const me = campaign.player;
  const inCampaign = campaign.phase === 'campaign';
  const usual = useMemo(() => usualCoverage(campaign), [campaign]);

  // What kind of week the player had, as the papers would see it.
  const latest = campaign.news.reduce((a, n) => Math.max(a, n.week), 0);
  const mine = campaign.news.filter((n) => n.week === latest && n.party === me);
  const good = mine.filter((n) => n.tone === 'good').length, bad = mine.filter((n) => n.tone === 'bad').length;
  const topic = good > bad ? 'good' : bad > good ? 'bad' : 'quiet';

  return (
    <>
      {lastReport && <ul className="report"><NewsLine item={lastReport} /></ul>}
      <p className="muted small action-desc">{t('press.desc')}</p>
      <ul>
        {OUTLET_IDS.map((id, o) => {
          const now = coverage(campaign, id, me);
          const slant = now >= 1 ? 'friendly' : now <= -1 ? 'hostile' : 'even';
          const check = canInterview(campaign, id);
          const odds = interviewOdds(campaign, id);
          return (
            <li key={id} className="action outlet">
              <div className="grow">
                <span className="action-title">{t(`outlet.${id}`)} <span className={`badge rel-${now >= 1 ? 'warm' : now <= -1 ? 'hostile' : 'neutral'}`}>{t(word(now))}</span></span>
                <span className="action-meta">{t(`outlet.${id}.desc`)} {t('press.readers', { blocs: OUTLETS[id].audience.map((b) => t(`bloc.${b}`)).join(', ') })}</span>
                {inCampaign && <span className="headline-quote">{t(`front.${slant}.${topic}.${(o + latest) % 2}` as StringKey, { party: partyName(t, me) })}</span>}
                <span className="action-meta num">
                  {now !== usual[o][me] && <>{t('press.usual', { word: t(word(usual[o][me])).toLowerCase() })} · </>}
                  {inCampaign && <>{f.days(0.5)}{!fog && <> · {t('press.odds', { good: f.pct(odds.good, 0), gaffe: f.pct(odds.gaffe, 0) })}</>}</>}
                </span>
                {inCampaign && !check.ok && check.reason !== 'closed' && <span className="action-reason">{t(`reason.${check.reason}` as StringKey)}</span>}
              </div>
              {inCampaign && (
                <button className="btn small primary" disabled={!check.ok} onClick={() => interview(id)} aria-label={`${t('press.interview')}: ${t(`outlet.${id}`)}`}>{t('press.interview')}</button>
              )}
            </li>
          );
        })}
      </ul>
      {inCampaign && (
        <>
          <h3>{t('press.troopers')}</h3>
          <ul>
            <li className="action">
              <div className="grow">
                <span className="action-meta">{t(campaign.team.troopers === 0 ? 'press.troopers.desc' : campaign.team.troopers === 1 ? 'press.troopers.running' : 'press.troopers.exposed')}</span>
              </div>
              {campaign.team.troopers === 0 && (
                <ConfirmButton label={t('press.troopers.hire', { rm: f.rm(trooperCost(world)) })} confirmLabel={t('press.troopers.confirm')} disabled={!canHireTroopers(world, campaign)} onConfirm={hireTroopers} danger />
              )}
            </li>
          </ul>
        </>
      )}
    </>
  );
}

/** What people online make of the news. */
function Netizens() {
  const t = useT();
  const lang = useStore((s) => s.settings.lang);
  const campaign = useStore((s) => s.game!.campaign);
  const posts = useMemo(() => netizenFeed(campaign.news, lang, (p) => partyName(t, p), campaign.player), [campaign.news, lang, t, campaign.player]);
  if (posts.length === 0) return <p className="muted">{t('news.empty')}</p>;
  return (
    <ul className="feed">
      {posts.map((post, i) => (
        <li key={i} className="post">
          <span className="handle">{post.handle}</span>
          <span>{post.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function NewsTab() {
  const t = useT();
  const news = useStore((s) => s.game!.campaign.news);
  const [view, setView] = useState<View>('news');
  const weeks = [...new Set(news.map((n) => n.week))].sort((a, b) => b - a);
  return (
    <section className="news">
      <div className="segmented small news-views" role="group" aria-label={t('tab.news')}>
        {(['news', 'press', 'netizens'] as const).map((v) => (
          <button key={v} className={view === v ? 'active' : ''} aria-pressed={view === v} onClick={() => setView(v)}>{t(`news.view.${v}`)}</button>
        ))}
      </div>
      {view === 'press' && <Press />}
      {view === 'netizens' && <Netizens />}
      {view === 'news' && news.length === 0 && <p className="muted">{t('news.empty')}</p>}
      {view === 'news' && weeks.map((week) => (
        <div key={week}>
          <h3>{t('news.week', { n: week })}</h3>
          <ul>
            {news.map((item, i) => (item.week === week ? <NewsLine key={i} item={item} /> : null)).reverse()}
          </ul>
        </div>
      ))}
    </section>
  );
}
