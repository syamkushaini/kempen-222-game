import type { StringKey } from '../i18n/strings';
import { now } from '../sim/campaign/news';
import { useStore } from '../state/store';
import { BriefingCard } from './BriefingCard';
import { seatName, useFormat, useT, useWorld } from './hooks';
import { Icon, type IconName } from './Icon';
import { Moves } from './Moves';
import { NewsLine } from './NewsTab';
import { StoryCard } from './StoryCard';

function DeskCard({ icon, tone, title, children, go, onGo }: { icon: IconName; tone: string; title: string; children: React.ReactNode; go?: string; onGo?: () => void }) {
  return (
    <li className={`desk-card tone-${tone}`}>
      <span className="row-icon"><Icon name={icon} size={20} /></span>
      <div className="grow">
        <span className="action-title">{title}</span>
        {children}
      </div>
      {go && onGo && <button className="btn small" onClick={onGo}>{go}</button>}
    </li>
  );
}

/**
 * The desk between elections: the three or four things that want the player this week, and nothing else. A decision
 * waiting, the figure in most danger, the money, and how long until the country votes. Everything else is a tab away.
 */
export function TermDesk() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const setTab = useStore((s) => s.setTab);
  const openScene = useStore((s) => s.openScene);
  const k = campaign.career!;
  const waiting = campaign.inbox.length;
  const left = k.length - k.week + 1;
  const latest = campaign.news.filter((n) => n.week === now(campaign)).slice(-3).reverse();

  return (
    <section className="desk">
      <StoryCard />
      <BriefingCard />
      <Moves />
      <ul className="desk-list">
        {waiting > 0 && (
          <DeskCard icon="inbox" tone="dare" title={t(waiting === 1 ? 'inbox.one' : 'inbox.many', { n: waiting })} go={t('inbox.open')} onGo={() => openScene()}>
            <span className="action-meta">{t('desk.waiting')}</span>
          </DeskCard>
        )}
        {k.petitioned && k.week <= 13 && (
          <DeskCard icon="ballot" tone="dare" title={t('desk.petition.title', { n: k.petitioned.n })}>
            <span className="action-meta">{t('desk.petition.body', { seats: k.petitioned.seats.map((id) => seatName(world, id)).join(', ') })}</span>
          </DeskCard>
        )}
        {k.lastLoss && k.week - k.lastLoss.week <= 6 && k.week >= k.lastLoss.week && (
          <DeskCard icon="coins" tone="dare" title={t(`desk.loss.${k.lastLoss.why}`, { rm: f.rm(k.lastLoss.rm), what: t(`holding.${k.lastLoss.id}` as StringKey) })} go={t('tab.funds')} onGo={() => setTab('funds')}>
            <span className="action-meta">{t('desk.loss.note')}</span>
          </DeskCard>
        )}
        <DeskCard icon="ballot" tone="won" title={t('orders.due', { n: left })} go={t('tab.policy')} onGo={() => setTab('policy')}>
          <div className="progress term-progress" role="img" aria-label={t('term.progress', { n: k.week, total: k.length })}><span style={{ width: `${(k.week / k.length) * 100}%` }} /></div>
        </DeskCard>
      </ul>
      {latest.length > 0 && (
        <>
          <h3>{t('desk.news')}</h3>
          <ul className="report">{latest.map((n, i) => <NewsLine key={i} item={n} />)}</ul>
        </>
      )}
    </section>
  );
}
