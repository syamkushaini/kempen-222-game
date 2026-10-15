import { useEffect, useId, useState } from 'react';
import { spendingLimit } from '../sim/campaign/actions';
import { termIncome, termSpending } from '../sim/campaign/career';
import { hasPublicMoney, treasuryOf } from '../sim/campaign/treasury';
import { useStore } from '../state/store';
import { useFormat, useT, useWorld } from './hooks';

/**
 * The money on a phone's bottom bar: one tap on it says what the figure is. Party money and the government's are two different pots,
 * and a number with no label beside it ("+RM6k") is not obvious to someone who has only just started.
 */
export function MoneyButton() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const [open, setOpen] = useState(false);
  const id = useId();
  const k = campaign.career;
  const me = campaign.parties[campaign.player]!;
  const term = campaign.phase === 'term' && !!k;
  const net = term ? termIncome(world, campaign).total - termSpending(world, campaign).total : 0;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button type="button" className="hud-item hud-btn" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen((v) => !v)}>
        <span className="hud-label">{t('hud.partyFunds')} <span aria-hidden="true">ⓘ</span></span>
        <strong className="num hud-value">
          {f.rm(me.funds)}
          {term && <span className={`small ${net < 0 ? 'neg' : 'muted'}`}> {net < 0 ? '▼ −' : '▲ +'}{f.rm(Math.abs(net))}{t('hud.perWeek')}</span>}
        </strong>
        {term && hasPublicMoney(campaign) && <span className="hud-sub small muted">{t('hud.gov')} {f.rm(treasuryOf(campaign))}</span>}
      </button>
      {open && (
        <>
          <div className="money-backdrop" onClick={() => setOpen(false)} />
          <section id={id} className="money-sheet" role="dialog" aria-label={t('money.title')}>
            <header>
              <h3>{t('money.title')}</h3>
              <button type="button" className="btn small" onClick={() => setOpen(false)} aria-label={t('money.close')}>✕</button>
            </header>
            <dl>
              <dt>{t('hud.partyFunds')} · <span className="num">{f.rm(me.funds)}</span></dt>
              <dd>{t(term ? 'money.party.term' : 'money.party.campaign')}</dd>
              {term && (
                <>
                  <dt>{t('money.week')}</dt>
                  <dd>
                    <span className="num">+{f.rm(termIncome(world, campaign).total)}</span> {t('money.in')} · <span className="num">−{f.rm(termSpending(world, campaign).total)}</span> {t('money.out')} = <strong className={`num ${net < 0 ? 'neg' : ''}`}>{net < 0 ? '−' : '+'}{f.rm(Math.abs(net))}{t('hud.perWeek')}</strong>
                    <br /><span className="muted small">{t('money.week.note')}</span>
                  </dd>
                </>
              )}
              {!term && (
                <>
                  <dt>{t('money.limit')} · <span className="num">{f.rm(me.spent)} / {f.rm(spendingLimit(world))}</span></dt>
                  <dd>{t('money.limit.note')}</dd>
                </>
              )}
              {term && hasPublicMoney(campaign) && (
                <>
                  <dt>{t('hud.gov')} · <span className="num">{f.rm(treasuryOf(campaign))}</span></dt>
                  <dd>{t('money.gov')}</dd>
                </>
              )}
            </dl>
          </section>
        </>
      )}
    </>
  );
}
