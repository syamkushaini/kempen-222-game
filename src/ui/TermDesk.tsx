import { termIncome, termSpending } from '../sim/campaign/career';
import { now } from '../sim/campaign/news';
import { useStore, type SidebarTab } from '../state/store';
import { Gauge } from './Gauge';
import { useFormat, useT, useWorld } from './hooks';
import { Icon, type IconName } from './Icon';
import { NewsLine } from './NewsTab';

/** Below this a figure is worth the player's attention before anything else. */
const LOW = 40;

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
  const me = campaign.parties[campaign.player]!;
  const waiting = campaign.inbox.length;
  const net = termIncome(world, campaign).total - termSpending(world, campaign).total;
  const figures: { id: string; name: string; value: number; tab: SidebarTab }[] = [
    { id: 'unity', name: t('term.unity'), value: me.unity, tab: 'team' },
    { id: 'credibility', name: t('term.credibility'), value: k.credibility, tab: 'policy' },
    { id: 'stability', name: t('hint.stability'), value: k.government.stability, tab: 'orders' },
    { id: 'trust', name: t('hint.trust'), value: k.government.trust, tab: 'orders' },
  ];
  const worst = [...figures].sort((a, b) => a.value - b.value)[0];
  const left = k.length - k.week + 1;
  const latest = campaign.news.filter((n) => n.week === now(campaign)).slice(-3).reverse();

  return (
    <section className="desk">
      <ul className="desk-list">
        {waiting > 0 && (
          <DeskCard icon="inbox" tone="dare" title={t(waiting === 1 ? 'inbox.one' : 'inbox.many', { n: waiting })} go={t('inbox.open')} onGo={() => openScene(true)}>
            <span className="action-meta">{t('desk.waiting')}</span>
          </DeskCard>
        )}
        <DeskCard icon="target" tone={worst.value < LOW ? 'dare' : 'go'} title={worst.value < LOW ? t('desk.watch', { name: worst.name }) : t('desk.steady')} go={t('desk.look')} onGo={() => setTab(worst.tab)}>
          <Gauge value={worst.value} label={worst.name} />
        </DeskCard>
        <DeskCard icon="coins" tone={net < 0 ? 'dare' : 'load'} title={`${f.rm(me.funds)} · ${net < 0 ? '−' : '+'}${f.rm(Math.abs(net))} ${t('desk.aWeek')}`} go={t('tab.orders')} onGo={() => setTab('orders')}>
          <span className="action-meta">{net < 0 ? t('desk.runway', { n: Math.max(0, Math.floor(me.funds / -net)) }) : t('desk.saving')}</span>
        </DeskCard>
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
