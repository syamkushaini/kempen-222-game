import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loadScenario } from './data/world';
import { saveStore } from './state/store';
import { App } from './ui/App';
import { ErrorBoundary } from './ui/ErrorBoundary';
// One typeface for everything, bundled so that the game looks the same offline. The package splits it by script and the
// browser fetches only the parts a page uses: for this game, the Latin part, about 48 kB.
import '@fontsource-variable/inter/wght.css';
import './ui/theme.css';
import './ui/styles.css';
import './ui/polish.css';
import './ui/people.css';
import './ui/ui2.css';
import './ui/ios.css';

// A saved game in a state election can only be read once that state's results are here, so they are fetched first.
// If one cannot be fetched (offline, say), the game still opens, and that save shows as unreadable until it can.
void Promise.allSettled(saveStore.scenarios().map(loadScenario)).then(() => {
  // The splash has been up since the page opened; it goes a moment after the first screen is drawn, and not before.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const splash = document.getElementById('splash');
    splash?.classList.add('gone');
    setTimeout(() => splash?.remove(), 450);
  }));
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
});
