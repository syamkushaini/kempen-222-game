import { Fragment, lazy, Suspense, useEffect, useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { useStore, type MapView as MapViewId, type SidebarTab } from '../state/store';
import { hasChiefs } from '../sim/campaign/ai';
import { ActionsTab } from './ActionsTab';
import { Adviser } from './Adviser';
import { ChiefsTab } from './ChiefsTab';
import { hasDiplomacy } from '../sim/campaign/diplomacy';
import { DiplomacyTab } from './DiplomacyTab';
import { installFeedback } from './feedback';
import { ActionToasts, Toasts } from './Honours';
import { SceneModal } from './SceneModal';
import { CampaignBar, Header, TermBar } from './Header';
import { GoalLine } from './Challenges';
import { GameMenu } from './GameMenu';
import { NextStep } from './NextStep';
import { DisplayContext, partyColor, useCampaignDisplay, useSpot, useT, useWorld, useNarrow } from './hooks';
import { AsideBanner } from './Aside';
import { MapView } from './MapView';
import { now } from '../sim/campaign/news';
import { NewsTab } from './NewsTab';
import { PollsTab } from './PollsTab';
import { SectionJump } from './SectionJump';
import { SeatDetail, SeatsTab } from './SeatsTab';
import { WeekRecap } from './WeekRecap';
import { Standing } from './Standing';
import { TeamTab } from './TeamTab';
import { CandidatesTab } from './CandidatesTab';
import { VotersTab } from './VotersTab';
import { Icon, type IconName } from './Icon';
import { Title } from './Title';
import { installIdentity } from './identity';
import { ground, mix } from './shareCard';

// The screens a game only reaches later (the count, the talks, the years between elections, the end of a career) are
// fetched when they are first wanted, so that the first download, which matters most on a phone, is smaller.
const ElectionNight = lazy(() => import('./ElectionNight').then((m) => ({ default: m.ElectionNight })));
const FormationScreen = lazy(() => import('./Formation').then((m) => ({ default: m.FormationScreen })));
const LegacyScreen = lazy(() => import('./LegacyScreen').then((m) => ({ default: m.LegacyScreen })));
const GovernmentTab = lazy(() => import('./GovernmentTab').then((m) => ({ default: m.GovernmentTab })));
const OrdersTab = lazy(() => import('./OrdersTab').then((m) => ({ default: m.OrdersTab })));
const PartyTab = lazy(() => import('./PartyTab').then((m) => ({ default: m.PartyTab })));
const PolicyTab = lazy(() => import('./PolicyTab').then((m) => ({ default: m.PolicyTab })));
const TermDesk = lazy(() => import('./TermDesk').then((m) => ({ default: m.TermDesk })));

installIdentity();

/**
 * The tabs come in three groups so that the row holds three things, not eight: what you run (the campaign, or the
 * government between elections), the people around you, and what you know. Saves is in the Menu.
 */
type GroupId = 'run' | 'people' | 'intel';
const GROUPS: { id: GroupId; icon: IconName; tabs: SidebarTab[] }[] = [
  { id: 'run', icon: 'flag', tabs: ['desk', 'orders', 'house', 'actions', 'chiefs', 'policy'] },
  { id: 'people', icon: 'people', tabs: ['team', 'party', 'slate', 'deals'] },
  { id: 'intel', icon: 'intel', tabs: ['seats', 'polls', 'voters', 'news'] },
];
/** Tabs that belong only to the years between elections, and only to the campaign. */
const TERM_ONLY: SidebarTab[] = ['desk', 'orders', 'house'];
const CAMPAIGN_ONLY: SidebarTab[] = ['actions', 'chiefs', 'deals'];
/** The picture that goes with each tab, beside its name. */
const TAB_ICON: Record<SidebarTab, IconName> = {
  desk: 'inbox', orders: 'doc', house: 'landmark', policy: 'sliders', actions: 'megaphone', team: 'crown', party: 'coins', slate: 'ballot', chiefs: 'flag', deals: 'chat',
  seats: 'target', polls: 'intel', voters: 'people', news: 'book', saves: 'folder',
};
const groupLabel = (id: GroupId, term: boolean): StringKey => (id === 'run' ? (term ? 'group.run.term' : 'group.run.campaign') : `group.${id}`) as StringKey;
export const groupOf = (tab: SidebarTab): GroupId | null => GROUPS.find((g) => g.tabs.includes(tab))?.id ?? null;

function ViewSwitch() {
  const t = useT();
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const dev = useStore((s) => s.dev);
  const views: MapViewId[] = dev ? ['last', 'estimate', 'truth'] : ['last', 'estimate'];
  return (
    <div className="segmented small" role="group" aria-label={t('view.label')}>
      {views.map((v) => (
        <button key={v} className={view === v ? 'active' : ''} aria-pressed={view === v} onClick={() => setView(v)}>
          {t(`view.${v}`)}
        </button>
      ))}
    </div>
  );
}

/**
 * Decisions wait here until the player opens them: a calls from another leader, an event on the desk. A new one
 * pulses once so that it is noticed; the week cannot end while one is waiting, and the bar says so.
 */
function Inbox() {
  const t = useT();
  const waiting = useStore((s) => s.game!.campaign.inbox.length);
  const open = useStore((s) => s.sceneOpen);
  const openScene = useStore((s) => s.openScene);
  if (waiting === 0 || open) return null;
  return (
    <button className="inbox-bar" key={waiting} onClick={() => openScene(true)}>
      <Icon name="inbox" />
      <span className="grow">{t(waiting === 1 ? 'inbox.one' : 'inbox.many', { n: waiting })}</span>
      <strong>{t('inbox.open')} ▸</strong>
    </button>
  );
}

function CampaignScreen() {
  const t = useT();
  const spot = useSpot();
  const campaign = useStore((s) => s.game!.campaign);
  const tab = useStore((s) => s.tab);
  const setTab = useStore((s) => s.setTab);
  const display = useCampaignDisplay();
  const world = useWorld();
  // A one-seat contest has nobody to delegate to and no pacts to make.
  const term = campaign.phase === 'term';
  const available = (id: SidebarTab) =>
    (id !== 'chiefs' || hasChiefs(world)) && (id !== 'deals' || hasDiplomacy(world)) &&
    (id !== 'policy' || !!campaign.career) && (id !== 'party' || !!campaign.career) && !(term ? CAMPAIGN_ONLY : TERM_ONLY).includes(id);
  const groups = GROUPS.map((g) => ({ ...g, tabs: g.tabs.filter(available) })).filter((g) => g.tabs.length > 0);
  const every = groups.flatMap((g) => g.tabs);
  const shown = every.includes(tab) ? tab : every[0];
  const group = groups.find((g) => g.tabs.includes(shown)) ?? groups[0];
  const unread = campaign.news.filter((n) => n.week === now(campaign) && n.tone === 'bad').length;
  const endWeek = useStore((s) => s.endWeek);
  const advance = useStore((s) => s.advance);
  const waiting = campaign.inbox.length > 0;
  const flash = useStore((s) => s.flash);
  // A seat picked on the map opens as a card over the side panel, from whichever tab is open. Closing the card keeps the seat chosen.
  const selectedSeat = useStore((s) => s.selectedSeat);
  const [card, setCard] = useState<string | null>(null);
  // A decision waiting in the inbox is a bar, not a screen: it does not stop a seat being looked at.
  useEffect(() => { setCard(selectedSeat && world.seats.length > 1 ? selectedSeat : null); }, [selectedSeat]); // eslint-disable-line react-hooks/exhaustive-deps
  // What each tab has waiting: decisions for whoever runs things, bad news not yet read.
  const waitingFor = (id: SidebarTab) => (id === 'news' ? (shown === 'news' ? 0 : unread) : id === 'desk' ? (shown === 'desk' ? 0 : campaign.inbox.length) : id === 'house' ? (shown === 'house' ? 0 : campaign.career?.appointments?.length ?? 0) : 0);
  // On a phone the map and the panel are separate screens, changed from a bar at the bottom.
  const narrow = useNarrow();
  const [screen, setScreen] = useState<'map' | 'panel'>('panel');
  const mapWanted = spot('map');
  useEffect(() => { if (mapWanted) setScreen('map'); }, [mapWanted]);
  const seatCard = card && (
    <div className="seat-card panel" role="dialog" aria-label={t('seat.card')}>
      <SeatDetail seatId={card} onClose={() => setCard(null)} />
    </div>
  );

  // The keyboard: Space ends the week (or moves a term on a week), and a number key opens a group; pressed again it
  // goes on to the next tab in that group.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A|SUMMARY)$/.test(el.tagName))) return;
      if (document.querySelector('[role=dialog]')) return;
      if (e.key === ' ') {
        e.preventDefault();
        if (term) { if (!waiting && !campaign.career?.ending) advance(1); } else endWeek();
        return;
      }
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= groups.length) {
        const g = groups[n - 1];
        const at = g.tabs.indexOf(shown);
        setTab(g.tabs[at >= 0 ? (at + 1) % g.tabs.length : 0]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <DisplayContext.Provider value={display}>
      <main className={narrow ? `layout phone-${screen}` : 'layout'}>
        <NextStep />
        <GoalLine />
        <section className="map-column">
          <MapView tall display={display} toolbar={<ViewSwitch />} marker={term ? null : campaign.parties[campaign.player]!.location} pulse={flash.seat ? { id: flash.seat, kind: 'gain', n: flash.n } : null} />
          {/* the poll sits under the map, so that the side column is all tabs: what the player works in gets the height */}
          <Standing campaign={campaign} />
        </section>
        <aside className="sidebar">
          <Inbox />
          <div className="tabs" role="tablist">
            {groups.map((g, n) => (
              <button
                key={g.id} role="tab" aria-selected={group.id === g.id} title={`${t(groupLabel(g.id, term))} (${n + 1})`}
                className={`${group.id === g.id ? 'tab active' : 'tab'}${g.tabs.some((id) => spot(`tab-${id}`)) ? ' spot' : ''}`}
                onClick={() => { if (group.id !== g.id) setTab(g.tabs[0]); }}
              >
                <Icon name={g.id === 'run' && term ? 'landmark' : g.icon} size={20} />
                <span className="tab-name">{t(groupLabel(g.id, term))}</span>
                {g.tabs.reduce((a, id) => a + waitingFor(id), 0) > 0 && group.id !== g.id && <span className="count-badge" aria-label={t('tab.waiting', { n: g.tabs.reduce((a, id) => a + waitingFor(id), 0) })}>{g.tabs.reduce((a, id) => a + waitingFor(id), 0)}</span>}
              </button>
            ))}
          </div>
          {group.tabs.length > 1 && (
            <div className="subtabs segmented small" role="tablist" aria-label={t(groupLabel(group.id, term))}>
              {group.tabs.map((id) => (
                <button key={id} role="tab" aria-selected={shown === id} className={`${shown === id ? 'active' : ''}${spot(`tab-${id}`) ? ' spot' : ''}`} onClick={() => setTab(id)}>
                  <Icon name={TAB_ICON[id]} size={15} />
                  {t(`tab.${id}`)}
                  {waitingFor(id) > 0 && <span className="count-badge" aria-label={t('tab.waiting', { n: waitingFor(id) })}>{waitingFor(id)}</span>}
                </button>
              ))}
            </div>
          )}
          <div className="tab-body" role="tabpanel">
            {narrow && <SectionJump watch={shown} />}
            <Suspense fallback={<p className="muted small">{t('app.loading')}</p>}>
            {shown === 'desk' && <TermDesk />}
            {shown === 'orders' && <OrdersTab />}
            {shown === 'house' && <GovernmentTab />}
            {shown === 'policy' && <PolicyTab />}
            {shown === 'actions' && <ActionsTab />}
            {shown === 'team' && <TeamTab />}
            {shown === 'party' && <PartyTab />}
            {shown === 'slate' && <CandidatesTab />}
            {shown === 'chiefs' && <ChiefsTab />}
            {shown === 'deals' && <DiplomacyTab />}
            {shown === 'seats' && <SeatsTab />}
            {shown === 'polls' && <PollsTab />}
            {shown === 'voters' && <VotersTab />}
            {shown === 'news' && <NewsTab />}
            </Suspense>
          </div>
          {!narrow && seatCard}
        </aside>
      </main>
      {narrow && seatCard}
      <WeekRecap />
      <CampaignBar />
      <TermBar />
      {narrow && (
        <nav className="phone-nav" aria-label={t('nav.label')}>
          <button className={screen === 'map' ? 'active' : ''} aria-pressed={screen === 'map'} onClick={() => setScreen('map')}>
            <Icon name="compass" size={22} /><span>{t('nav.map')}</span>
          </button>
          {groups.map((g) => {
            const here = screen === 'panel' && group.id === g.id;
            const n = g.tabs.reduce((a, id) => a + waitingFor(id), 0);
            return (
              <button key={g.id} className={`${here ? 'active' : ''}${g.tabs.some((id) => spot(`tab-${id}`)) ? ' spot' : ''}`} aria-pressed={here} onClick={() => { setScreen('panel'); if (group.id !== g.id) setTab(g.tabs[0]); }}>
                <Icon name={g.id === 'run' && term ? 'landmark' : g.icon} size={22} /><span>{t(groupLabel(g.id, term))}</span>
                {n > 0 && !here && <span className="count-badge">{n}</span>}
              </button>
            );
          })}
        </nav>
      )}
      {/* Kak Ros is a strip along the bottom, like subtitles, so that she never covers what she is pointing at */}
      <Adviser />
    </DisplayContext.Provider>
  );
}

export function App() {
  const t = useT();
  const { theme, lang, palette, textSize, density } = useStore((s) => s.settings);
  const player = useStore((s) => s.game?.campaign.player);
  const phase = useStore((s) => s.game?.campaign.phase);
  const talks = useStore((s) => !!s.game?.campaign.formation);
  const showNight = useStore((s) => s.showNight);
  const ended = useStore((s) => !!s.game?.campaign.career?.ending);
  const loads = useStore((s) => s.loads);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
    root.lang = lang;
    if (textSize === 'large') root.dataset.text = 'large';
    else delete root.dataset.text;
    root.dataset.density = density;
    root.dataset.palette = palette;
    // Text follows the size the browser has been told to use: a root size of 20 px, not 16, scales everything by a quarter.
    const px = parseFloat(getComputedStyle(root).fontSize) || 16;
    root.style.setProperty('--ui-zoom', String(Math.round((px / 16) * 100) / 100));
  }, [theme, lang, textSize, density, palette]);

  // The player's party colour tints the buttons, the active tab, the focus ring and the mark; the title screen keeps the lavender.
  useEffect(() => {
    const root = document.documentElement;
    const names = ['--primary', '--primary-hover', '--primary-focus', '--ring', '--party'];
    if (player === undefined) { for (const n of names) root.style.removeProperty(n); return; }
    const color = partyColor(player);
    const [base] = ground(color);
    root.style.setProperty('--primary', base);
    root.style.setProperty('--primary-hover', mix(base, '#ffffff', 0.35));
    root.style.setProperty('--primary-focus', mix(base, '#000000', 0.15));
    root.style.setProperty('--ring', `color-mix(in srgb, ${mix(base, '#ffffff', 0.3)} 55%, transparent)`);
    root.style.setProperty('--party', color);
  }, [player, palette]);

  useEffect(() => installFeedback(), []);

  // Election night stays up until the player moves on to the talks that follow it.
  const night = phase === 'night' || ((phase === 'formation' || phase === 'done') && (showNight || !talks));
  return (
    <div className="app">
      <Header />
      <AsideBanner />
      {/* the screens read party colours when they draw, so a new palette starts them afresh */}
      <Fragment key={palette}>
        {!phase && <Title />}
        <Suspense fallback={<p className="muted">{t('app.loading')}</p>}>
        {ended && <LegacyScreen />}
        {!ended && (phase === 'campaign' || phase === 'term') && <CampaignScreen />}
        {!ended && night && <ElectionNight key={loads} />}
        {!ended && phase && phase !== 'campaign' && phase !== 'term' && !night && <FormationScreen />}
        </Suspense>
        {!ended && phase && !night && <SceneModal />}
      </Fragment>
      <GameMenu />
      <Toasts />
      <ActionToasts />
      <footer className="footer">{t('footer.fiction')}</footer>
    </div>
  );
}
