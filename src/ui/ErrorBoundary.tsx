import { Component, type ReactNode } from 'react';
import { translate, type StringKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { downloadGame } from './download';
import { Kbd } from './Kbd';

/** What the player sees if the screen breaks. The game is autosaved, so the
 * worst case is a reload; the export button is there in case the autosave is
 * the thing that is wrong. It reads the language from the store directly,
 * because the screen it replaces may be the one that supplied it. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null; retryCount: number }> {
  state = { error: null as Error | null, retryCount: 0 };

  static getDerivedStateFromError(error: Error) { return { error, retryCount: 0 }; }

  private retry() {
    this.setState((prev) => ({ error: null, retryCount: prev.retryCount + 1 }));
    // A small delay so the React error boundary has time to unmount the broken tree
    setTimeout(() => location.reload(), 100);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const lang = useStore.getState().settings.lang;
    const t = (key: StringKey) => translate(lang, key);
    const game = useStore.getState().game;
    const isNetwork = error.message.includes('network') || error.message.includes('fetch');
    return (
      <main className="title">
        <section className="panel error-fallback" role="alert">
          <h2>{isNetwork ? t('error.network') : t('error.title')}</h2>
          <p>{isNetwork ? t('error.networkBody') : t('error.body')}</p>
          <div className="button-row">
            <button className="btn primary" onClick={() => this.retry()}>{t('error.reload')} <Kbd shortcut="R" /></button>
            {game && <button className="btn" onClick={() => downloadGame(game)}>{t('error.export')}</button>}
          </div>
          {this.state.retryCount > 0 && (
            <p className="muted small">{t('error.retrying')}</p>
          )}
          <details>
            <summary className="muted small">{t('error.detail')}</summary>
            <pre className="small">{String(error.stack ?? error.message ?? error).slice(0, 1200)}</pre>
          </details>
        </section>
      </main>
    );
  }
}
