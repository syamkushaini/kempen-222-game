import { Fragment, useEffect } from 'react';
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
import { Toasts } from './Honours';
import { LegacyScreen } from './LegacyScreen';
import { SceneModal } from './SceneModal';
import { ElectionNight } from './ElectionNight';
import { CampaignBar, Header } from './Header';
import { GoalLine } from './Challenges';
import { GameMenu } from './GameMenu';
import { NextStep } from './NextStep';
import { DisplayContext, useCampaignDisplay, useNarrow, useSpot, useT, useWorld } from './hooks';
import { MapView } from './MapView';
import { now } from '../sim/campaign/news';
import { NewsTab } from './NewsTab';
import { OrdersTab } from './OrdersTab';
import { PolicyTab } from './PolicyTab';
import { PollsTab } from './PollsTab';
import { SavesTab } from './SavesTab';
import { SeatsTab } from './SeatsTab';
import { Standing } from './Standing';
import { TeamTab } from './TeamTab';
import { Title } from './Title';
import { installIdentity } from './identity';

installIdentity();

const TABS: SidebarTab[] = ['orders', 'house', 'actions', 'team', 'chiefs', 'deals', 'policy', 'seats', 'polls', 'news', 'saves'];
/** Tabs that belong only to the years between elections, and only to the campaign. */
const TERM_ONLY: SidebarTab[] = ['orders', 'house'];
const CAMPAIGN_ONLY: SidebarTab[] = ['actions', 'chiefs', 'deals'];

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

/** A reminder that something set aside still needs an answer; time will not move until it has one. */
function Waiting() {
  const t = useT();
  const hidden = useStore((s) => s.hiddenScene);
  const waiting = useStore((s) => s.game!.campaign.inbox[0]);
  const hideScene = useStore((s) => s.hideScene);
  if (!waiting || waiting.id !== hidden) return null;
  return (
    <p className="note waiting">
      {t('scene.waiting')} <button className="btn small primary" onClick={() => hideScene(null)}>{t('scene.open')}</button>
    </p>
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
  const narrow = useNarrow();
  // A one-seat contest has nobody to delegate to and no pacts to make.
  const term = campaign.phase === 'term';
  const tabs = TABS.filter((id) =>
    (id !== 'chiefs' || hasChiefs(world)) && (id !== 'deals' || hasDiplomacy(world)) &&
    (id !== 'policy' || !!campaign.career) && !(term ? CAMPAIGN_ONLY : TERM_ONLY).includes(id));
  const shown = tabs.includes(tab) ? tab : tabs[0];
  const unread = campaign.news.filter((n) => n.week === now(campaign) && n.tone === 'bad').length;

  return (
    <DisplayContext.Provider value={display}>
      <main className="layout">
        <NextStep />
        <GoalLine />
        {/* on a phone the adviser comes first, where she cannot be missed */}
        {narrow && <Adviser />}
        <section className="map-column">
          <MapView display={display} toolbar={<ViewSwitch />} marker={term ? null : campaign.parties[campaign.player]!.location} />
          {/* the poll sits under the map, so that the side column is all tabs: what the player works in gets the height */}
          <Standing campaign={campaign} />
        </section>
        <aside className="sidebar">
          {!narrow && <Adviser />}
          <Waiting />
          <div className="tabs" role="tablist">
            {tabs.map((id) => (
              <button key={id} role="tab" aria-selected={shown === id} className={`${shown === id ? 'tab active' : 'tab'}${spot(`tab-${id}`) ? ' spot' : ''}`} onClick={() => setTab(id)}>
                {t(`tab.${id}`)}
                {id === 'news' && unread > 0 && shown !== 'news' && <span className="pip" aria-hidden="true" />}
              </button>
            ))}
          </div>
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
            {shown === 'news' && <NewsTab />}
            {shown === 'saves' && <SavesTab />}
          </div>
        </aside>
      </main>
      <CampaignBar />
    </DisplayContext.Provider>
  );
}

export function App() {
  const t = useT();
  const { theme, lang, palette, textSize } = useStore((s) => s.settings);
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
  }, [theme, lang, textSize]);

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
      <footer className="footer">{t('footer.fiction')}</footer>
    </div>
  );
}
