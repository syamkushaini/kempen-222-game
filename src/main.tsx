import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loadScenario } from './data/world';
import { saveStore } from './state/store';
import { App } from './ui/App';
import { ErrorBoundary } from './ui/ErrorBoundary';
import './ui/theme.css';
import './ui/styles.css';
import './ui/polish.css';
import './ui/people.css';

// A saved game in a state election can only be read once that state's results are here, so they are fetched first.
// If one cannot be fetched (offline, say), the game still opens, and that save shows as unreadable until it can.
void Promise.allSettled(saveStore.scenarios().map(loadScenario)).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
});
