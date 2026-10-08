import { HANDLES, NETIZENS_EN, NETIZENS_MS, type NetizenKind } from '../i18n/netizens';
import type { Lang } from '../i18n/strings';
import type { NewsItem } from '../sim/campaign/types';

/** Which kind of story a news item is, as far as people online are concerned. Most news passes them by. */
export function netizenKind(key: string): NetizenKind | null {
  if (key.endsWith('.backfire') || key === 'news.joint.backfire') return 'backfire';
  if (/^news\.(me|rival)\.(ceramah|megarally)\.great$/.test(key)) return 'crowdGreat';
  if (/^news\.me\.(ceramah|megarally)\.weak$/.test(key)) return 'crowdWeak';
  if (key === 'news.me.social.viral' || key === 'news.rival.viral') return 'viral';
  if (key === 'news.me.social.flop' || key === 'news.rival.flop') return 'flop';
  if (/^news\.(me\.attack|rival\.attack|rival\.attackYou|joint)\.ok$/.test(key)) return 'attack';
  if (key.startsWith('news.tycoon.exposed')) return 'tycoon';
  if (key === 'news.poll.public') return 'poll';
  if (key === 'news.pact.signed' || key === 'news.pact.mine') return 'pact';
  if (key === 'news.katak' || key === 'news.court.won' || key.startsWith('news.poach.lost')) return 'katak';
  if (key === 'news.candidate.scandal') return 'candidate';
  if (key === 'news.staff.scandal') return 'staff';
  if (key === 'news.endorser.won' || key === 'news.endorser.rival' || key === 'news.endorser.cameOver') return 'endorser';
  if (key.startsWith('news.ec.fined')) return 'fine';
  if (key === 'news.media.troopersExposed') return 'troopers';
  if (key === 'news.media.interview.gaffe') return 'gaffe';
  if (key.startsWith('news.gov.budget.')) return 'budget';
  if (key === 'news.gov.passed' || key === 'news.house.passed') return 'billPassed';
  if (key === 'news.gov.defeated' || key === 'news.house.defeated') return 'billDefeated';
  if (key.startsWith('news.motion.')) return 'motion';
  if (key === 'news.term.walkout' || key === 'news.gov.youLeft') return 'walkout';
  if (key === 'news.term.dissolved') return 'dissolved';
  if (key.startsWith('news.by.')) return 'byElection';
  if (key.startsWith('news.states.')) return 'statePolls';
  if (key === 'news.echo.good') return 'echoGood';
  if (key === 'news.echo.bad') return 'echoBad';
  if (key === 'news.echo.mixed') return 'echoMixed';
  if (key.startsWith('event.downturn') || key.startsWith('event.prices')) return 'downturn';
  return null;
}

export interface Post { handle: string; text: string; week: number; tone: NewsItem['tone'] }

const mix = (n: number) => { let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b) >>> 0; x ^= x >>> 13; return Math.imul(x, 0xc2b2ae35) >>> 0; };

/**
 * What people are saying online about the news, newest first. The same news
 * always draws the same remarks, so the feed does not change when it is
 * looked at twice. `nameOf` gives a party's name; `fallback` is the party to
 * name when a story is about nobody in particular.
 */
export function netizenFeed(news: NewsItem[], lang: Lang, nameOf: (party: number) => string, fallback: number, limit = 40): Post[] {
  const table = lang === 'ms' ? NETIZENS_MS : NETIZENS_EN;
  const posts: Post[] = [];
  for (let i = news.length - 1; i >= 0 && posts.length < limit; i--) {
    const item = news[i];
    const kind = netizenKind(item.key);
    if (!kind) continue;
    // Polls come every week or every month; people only bother with some of them.
    const h = mix(i * 31 + item.week);
    if (kind === 'poll' && h % 3 !== 0) continue;
    const lines = table[kind];
    posts.push({
      handle: HANDLES[h % HANDLES.length],
      text: lines[(h >>> 8) % lines.length].replaceAll('{party}', nameOf(item.party ?? fallback)),
      week: item.week,
      tone: item.tone,
    });
  }
  return posts;
}
