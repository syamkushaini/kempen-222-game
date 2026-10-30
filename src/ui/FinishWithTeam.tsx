import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../state/store';
import { ConfirmDialog } from './ConfirmDialog';
import { useT, useWorld } from './hooks';

/**
 * In a by-election, once the first week has been played, an offer to let the team run the weeks that remain and go straight to
 * polling day: for a first visit that has to be short, or a player who has seen what there is to see. It asks before it acts.
 */
export function FinishWithTeam() {
  const t = useT();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const guided = useStore((s) => !!s.game!.tutorial);
  const finish = useStore((s) => s.finishWithTeam);
  const [asking, setAsking] = useState(false);
  const left = campaign.totalWeeks - campaign.week + 1;
  if (world.rules.kind !== 'byelection' || campaign.phase !== 'campaign' || guided || campaign.sim || campaign.challenge?.goal || campaign.week < 2 || left < 2) return null;
  return (
    <>
      <p className="next-step step-finish" role="status">
        <span className="grow">{t('finish.line', { n: left })}</span>
        <button className="btn small" onClick={() => setAsking(true)}>{t('finish.button')}</button>
      </p>
      {asking && createPortal(
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setAsking(false); }}>
          <ConfirmDialog
            open onClose={() => setAsking(false)} onConfirm={() => { setAsking(false); finish(); }}
            title={t('finish.title')} body={t('finish.body', { n: left })} confirmLabel={t('finish.confirm')} cancelLabel={t('finish.cancel')}
          />
        </div>,
        document.body,
      )}
    </>
  );
}
