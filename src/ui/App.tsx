import { Fragment, useEffect } from 'react';
import type { StringKey } from '../i18n/strings';
import { useStore, type MapView as MapViewId, type SidebarTab } from '../state/store';
import { hasChiefs } from '../sim/campaign/ai';
import { ActionsTab } from './ActionsTab';
import { Adviser } from './Adviser';
import { ChiefsTab } from './ChiefsTab';
import { hasDiplomacy } from '../sim/campaign/diplomacy';
import { DiplomacyTab } from './DiplomacyTab';
import { FormationScreen } from './Formation';
import { GovernmentTab } from './GovernmentTab';
import { installFeedback } from './feedback';
import { ActionToasts, Toasts } from './Honours';
import { LegacyScreen } from './LegacyScreen';
import { SceneModal } from './SceneModal';
import { ElectionNight } from './ElectionNight';
import { CampaignBar, Header } from './Header';
import { GoalLine } from './Challenges';
import { GameMenu } from './GameMenu';
import { NextStep } from './NextStep';
import { DisplayContext, partyColor, useCampaignDisplay, useSpot, useT, useWorld } from './hooks';
import { MapView } from './MapView';
import { now } from '../sim/campaign/news';
import { NewsTab } from './NewsTab';
import { OrdersTab } from './OrdersTab';
import { PolicyTab } from './PolicyTab';
import { PollsTab } from './PollsTab';
import { SeatsTab } from './SeatsTab';
import { Standing } from './Standing';
import { TeamTab } from './TeamTab';
import { VotersTab } from './VotersTab';
import { Icon, type IconName } from './Icon';
import { Title } from './Title';
import { installIdentity } from './identity';
import { ground, mix } from './shareCard';

installIdentity();

/**
 * The tabs come in three groups so that the row holds three things, not eight: what you run (the campaign, or the
 * government between elections), the people around you, and what you know. Saves is in the Menu.
 */
type GroupId = 'run' | 'people' | 'intel';
const GROUPS: { id: GroupId; icon: IconName; tabs: SidebarTab[] }[] = [
  { id: 'run', icon: 'flag', tabs: ['orders', 'house', 'actions', 'chiefs', 'policy'] },
  { id: 'people', icon: 'people', tabs: ['team', 'deals'] },
  { id: 'intel', icon: 'intel', tabs: ['seats', 'polls', 'voters', 'news'] },
];
/** Tabs that belong only to the years between elections, and only to the campaign. */
const TERM_ONLY: SidebarTab[] = ['orders', 'house'];
const CAMPAIGN_ONLY: SidebarTab[] = ['actions', 'chiefs', 'deals'];
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
    (id !== 'policy' || !!campaign.career) && !(term ? CAMPAIGN_ONLY : TERM_ONLY).includes(id);
  const groups = GROUPS.map((g) => ({ ...g, tabs: g.tabs.filter(available) })).filter((g) => g.tabs.length > 0);
  const every = groups.flatMap((g) => g.tabs);
  const shown = every.includes(tab) ? tab : every[0];
  const group = groups.find((g) => g.tabs.includes(shown)) ?? groups[0];
  const unread = campaign.news.filter((n) => n.week === now(campaign) && n.tone === 'bad').length;
  const endWeek = useStore((s) => s.endWeek);
  const advance = useStore((s) => s.advance);
  const waiting = campaign.inbox.length > 0;
  const flash = useStore((s) => s.flash);

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
      <main className="layout">
        <NextStep />
        <GoalLine />
        <section className="map-column">
          <MapView display={display} toolbar={<ViewSwitch />} marker={term ? null : campaign.parties[campaign.player]!.location} pulse={flash.seat ? { id: flash.seat, kind: 'gain', n: flash.n } : null} />
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
                <Icon name={g.id === 'run' && term ? 'landmark' : g.icon} />
                {t(groupLabel(g.id, term))}
                {g.tabs.includes('news') && unread > 0 && shown !== 'news' && <span className="pip" aria-hidden="true" />}
              </button>
            ))}
          </div>
          {group.tabs.length > 1 && (
            <div className="subtabs segmented small" role="tablist" aria-label={t(groupLabel(group.id, term))}>
              {group.tabs.map((id) => (
                <button key={id} role="tab" aria-selected={shown === id} className={`${shown === id ? 'active' : ''}${spot(`tab-${id}`) ? ' spot' : ''}`} onClick={() => setTab(id)}>
                  {t(`tab.${id}`)}
                </button>
              ))}
            </div>
          )}
          <div className="tab-body" role="tabpanel">
            {shown === 'orders' && <OrdersTab />}
            {shown === 'house' && <GovernmentTab />}
            {shown === 'policy' && <PolicyTab />}
            {shown === 'actions' && <ActionsTab />}
            {shown === 'team' && <TeamTab />}
            {shown === 'chiefs' && <ChiefsTab />}
            {shown === 'deals' && <DiplomacyTab />}
            {shown === 'seats' && <SeatsTab />}
            {shown === 'polls' && <PollsTab />}
            {shown === 'voters' && <VotersTab />}
            {shown === 'news' && <NewsTab />}
          </div>
        </aside>
      </main>
      <CampaignBar />
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
      {/* the screens read party colours when they draw, so a new palette starts them afresh */}
      <Fragment key={palette}>
        {!phase && <Title />}
        {ended && <LegacyScreen />}
        {!ended && (phase === 'campaign' || phase === 'term') && <CampaignScreen />}
        {!ended && night && <ElectionNight key={loads} />}
        {!ended && phase && phase !== 'campaign' && phase !== 'term' && !night && <FormationScreen />}
        {!ended && phase && !night && <SceneModal />}
      </Fragment>
      <GameMenu />
      <Toasts />
      <ActionToasts />
      <footer className="footer">{t('footer.fiction')}</footer>
    </div>
  );
}
