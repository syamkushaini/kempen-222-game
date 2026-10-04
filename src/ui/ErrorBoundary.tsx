import { Component, type ReactNode } from 'react';
import { translate, type StringKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { downloadGame } from './download';

/**
 * What the player sees if the screen breaks. The game is autosaved, so the
 * worst case is a reload; the export button is there in case the autosave is
 * the thing that is wrong. It reads the language from the store directly,
 * because the screen it replaces may be the one that supplied it.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) { return { error }; }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const lang = useStore.getState().settings.lang;
    const t = (key: StringKey) => translate(lang, key);
    const game = useStore.getState().game;
    return (
      <main className="title">
        <section className="panel error-fallback" role="alert">
          <h2>{t('error.title')}</h2>
          <p>{t('error.body')}</p>
          <div className="button-row">
            <button className="btn primary" onClick={() => location.reload()}>{t('error.reload')}</button>
            {game && <button className="btn" onClick={() => downloadGame(game)}>{t('error.export')}</button>}
          </div>
          <details>
            <summary className="muted small">{t('error.detail')}</summary>
            <pre className="small">{String(error.stack ?? error.message ?? error).slice(0, 1200)}</pre>
          </details>
        </section>
      </main>
    );
  }
}
