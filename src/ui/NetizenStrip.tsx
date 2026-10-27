import { useMemo } from 'react';
import { useStore } from '../state/store';
import { partyName, useT } from './hooks';
import { netizenFeed } from './netizens';

/** A peek at what people online are saying, next to the map, so it never needs a tab click to be seen. */
export function NetizenStrip() {
  const t = useT();
  const lang = useStore((s) => s.settings.lang);
  const campaign = useStore((s) => s.game!.campaign);
  const setTab = useStore((s) => s.setTab);
  const posts = useMemo(
    () => netizenFeed(campaign.news, lang, (p) => partyName(t, p), campaign.player, 3),
    [campaign.news, lang, t, campaign.player],
  );
  if (posts.length === 0) return null;
  return (
    <section className="panel netizen-strip">
      <button className="netizen-strip-head" onClick={() => setTab('news')}>
        <span className="netizen-strip-title">{t('netizens.strip.title')}</span>
        <span className="muted small">{t('netizens.strip.more')}</span>
      </button>
      <ul className="feed compact">
        {posts.map((post, i) => (
          <li key={i} className="post">
            <span className="handle">{post.handle}</span>
            <span>{post.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
