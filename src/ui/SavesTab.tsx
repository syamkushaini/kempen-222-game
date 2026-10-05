import { useEffect, useRef, useState } from 'react';
import { PARTIES } from '../data/parties';
import { getWorld } from '../data/world';
import type { StringKey } from '../i18n/strings';
import { PARTY_IDS } from '../sim/types';
import { parseSave } from '../state/game';
import { MANUAL_SLOTS, type SaveMeta, type SlotId } from '../state/saves';
import { saveStore, useStore } from '../state/store';
import { downloadGame } from './download';
import { FeedbackLink } from './FeedbackLink';
import { contestName, useFormat, useT, type T } from './hooks';

/** A button that asks for a second click before doing something destructive. */
export function ConfirmButton(props: { label: string; name?: string; confirmLabel: string; onConfirm: () => void; disabled?: boolean; danger?: boolean; className?: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(id);
  }, [armed]);
  return (
    <button
      className={`${props.className ?? 'btn small'}${armed ? ' armed' : ''}${props.danger ? ' danger' : ''}`}
      disabled={props.disabled}
      aria-label={props.name && !armed ? props.name : undefined}
      onClick={() => { if (armed) { setArmed(false); props.onConfirm(); } else setArmed(true); }}
    >
      {armed ? props.confirmLabel : props.label}
    </button>
  );
}

/** One line describing a saved game: which contest, which party, how far in. */
export function saveLine(t: T, meta: SaveMeta): string {
  const world = getWorld(meta.scenario);
  return [
    world ? contestName(t, world) : meta.scenario,
    PARTIES[PARTY_IDS[meta.player]].short,
    meta.talks ? t('saves.talks') : meta.term ? t('saves.term', { term: meta.term.term, week: meta.term.week }) : t('saves.week', { n: meta.week, total: meta.totalWeeks }),
  ].join(' · ');
}

/** The five save slots plus file import and export. Saving is offered only while a game is open. */
export function SaveSlots() {
  const t = useT();
  const f = useFormat();
  const game = useStore((s) => s.game);
  const loadGame = useStore((s) => s.loadGame);

  const [slots, setSlots] = useState<(SaveMeta | null)[]>(() => saveStore.list());
  const [message, setMessage] = useState<{ text: string; bad: boolean } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const refresh = () => setSlots(saveStore.list());

  const save = (slot: SlotId) => {
    if (!game) return;
    const ok = saveStore.save(slot, game);
    setMessage(ok ? null : { text: t('saves.failed'), bad: true });
    refresh();
  };
  const load = (slot: SlotId) => {
    const state = saveStore.load(slot);
    if (state) { loadGame(state); setMessage({ text: t('saves.imported'), bad: false }); }
  };
  const remove = (slot: SlotId) => { saveStore.delete(slot); refresh(); };

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    const parsed = parseSave(await file.text());
    if (parsed.ok) {
      loadGame(parsed.state);
      setMessage({ text: t('saves.imported'), bad: false });
    } else {
      setMessage({ text: t(`saves.error.${parsed.error}` as StringKey), bad: true });
    }
    if (fileInput.current) fileInput.current.value = '';
  };

  return (
    <>
      {!saveStore.available && <p className="note bad">{t('saves.noStorage')}</p>}
      <ul className="slot-list">
        {MANUAL_SLOTS.map((slot, i) => {
          const meta = slots[i];
          const slotName = t('saves.slot', { n: slot });
          const saveName = `${t('saves.save')}: ${slotName}`;
          return (
            <li key={slot}>
              <div className="grow">
                <span className="seat-name">{meta ? meta.name : slotName}</span>
                <span className="muted small">
                  {meta
                    ? `${saveLine(t, meta)} · ${f.dateTime(meta.updatedAt)}`
                    : t('saves.empty')}
                </span>
              </div>
              {game && (meta
                ? <ConfirmButton label={t('saves.save')} name={saveName} confirmLabel={t('saves.confirm')} onConfirm={() => save(slot)} disabled={!saveStore.available} />
                : <button className="btn small" aria-label={saveName} onClick={() => save(slot)} disabled={!saveStore.available}>{t('saves.save')}</button>)}
              {game
                ? <ConfirmButton label={t('saves.load')} name={`${t('saves.load')}: ${slotName}`} confirmLabel={t('saves.confirm')} onConfirm={() => load(slot)} disabled={!meta} />
                : <button className="btn small" aria-label={`${t('saves.load')}: ${slotName}`} onClick={() => load(slot)} disabled={!meta}>{t('saves.load')}</button>}
              <ConfirmButton label={t('saves.delete')} name={`${t('saves.delete')}: ${slotName}`} confirmLabel={t('saves.confirm')} onConfirm={() => remove(slot)} disabled={!meta} danger />
            </li>
          );
        })}
      </ul>

      <div className="button-row">
        {game && <button className="btn" onClick={() => downloadGame(game)}>{t('saves.export')}</button>}
        <button className="btn" onClick={() => fileInput.current?.click()}>{t('saves.import')}</button>
        <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={(e) => importFile(e.target.files?.[0])} />
      </div>
      {message && <p className={message.bad ? 'note bad' : 'note good'} role="status">{message.text}</p>}
    </>
  );
}

/** The game's name, where it stands, the slots, and the way out to the title. A screen that has its own title and quit button embeds it without them. */
export function SavesPanel({ embedded = false }: { embedded?: boolean }) {
  const t = useT();
  const f = useFormat();
  const game = useStore((s) => s.game)!;
  const autosavedAt = useStore((s) => s.autosavedAt);
  const autosaveFailed = useStore((s) => s.autosaveFailed);
  const renameGame = useStore((s) => s.renameGame);
  const quitToTitle = useStore((s) => s.quitToTitle);

  return (
    <section className="saves">
      {!embedded && <h3>{t('saves.game')}</h3>}
      <label className="field">
        <span>{t('saves.name')}</span>
        <input type="text" value={game.name} maxLength={60} onChange={(e) => renameGame(e.target.value)} />
      </label>
      <p className="muted small">
        {game.campaign.phase === 'night' ? t('night.title') : game.campaign.formation && game.campaign.phase !== 'term' ? t('saves.talks') : t('saves.week', { n: game.campaign.week, total: game.campaign.totalWeeks })}
        {autosavedAt && !autosaveFailed ? ` · ${t('saves.autosaved', { time: f.time(autosavedAt) })}` : ''}
      </p>
      {autosaveFailed && <p className="note bad">{t('saves.failed')}</p>}

      <h3>{t('saves.slots')}</h3>
      <SaveSlots />

      {!embedded && (
        <div className="button-row">
          <button className="btn" onClick={quitToTitle}>{t('hud.quit')}</button>
        </div>
      )}
    </section>
  );
}

export const SavesTab = () => <SavesPanel />;

/** The way out of a screen that has no Saves tab, such as the count and the talks: the saves, behind a button, and a quit to the title. */
export function GamePanel() {
  const t = useT();
  const quitToTitle = useStore((s) => s.quitToTitle);
  const [open, setOpen] = useState(false);
  return (
    <section className="panel t-game">
      <div className="panel-head"><h2>{t('saves.game')}</h2></div>
      <div className="button-row">
        <button className="btn" aria-expanded={open} onClick={() => setOpen(!open)}>{t('tab.saves')} {open ? '▴' : '▾'}</button>
        <button className="btn" onClick={quitToTitle}>{t('hud.quit')}</button>
      </div>
      {open && <SavesPanel embedded />}
      <FeedbackLink />
    </section>
  );
}
