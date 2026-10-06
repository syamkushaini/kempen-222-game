import { loanOffer } from '../sim/campaign/loan';
import { useStore } from '../state/store';
import { useFormat, useT, useWorld } from './hooks';

/** A lender's offer against the party's coming income, or what is still owed on the last one. */
export function Loan() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const borrow = useStore((s) => s.borrow);
  const owed = campaign.parties[campaign.player]?.loan;
  const offer = loanOffer(world, campaign);
  return (
    <div className="action loan">
      <div className="grow">
        <span className="action-title">{t('loan.title')}</span>
        <span className="action-meta">
          {owed ? t('loan.owing', { rm: f.rm(owed) })
            : offer ? t('loan.offer', { rm: f.rm(offer.advance), n: offer.weeks, owed: f.rm(offer.owed) })
            : t('loan.none')}
        </span>
      </div>
      {offer && <button className="btn small" onClick={borrow}>{t('loan.go', { rm: f.rm(offer.advance) })}</button>}
    </div>
  );
}
