import { useState } from 'react';
import { publicFinance } from '../sim/campaign/gdp';
import { allocation, debtEased, govBooks, hasPublicMoney, repayLimit, treasuryCap, treasuryOf, type BookFlow } from '../sim/campaign/treasury';
import type { StringKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { useFormat, useT, useWorld } from './hooks';

/** The government's money: what the treasury holds against the most it keeps, what comes in each week, and, for the head of government, a way to pay some of it towards the debt. */
export function TreasuryCard() {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  const repay = useStore((s) => s.repayDebt);
  const [pct, setPct] = useState(25);
  if (!campaign.career || !hasPublicMoney(campaign)) return null;
  const k = campaign.career;
  const held = treasuryOf(campaign);
  const cap = treasuryCap(world, campaign);
  const limit = repayLimit(world, campaign);
  const amount = Math.floor((limit * pct) / 100 / 100_000) * 100_000;
  const eased = amount > 0 ? debtEased(world, campaign, amount) : 0;
  const fin = publicFinance(world, k);
  const now = govBooks(world, campaign);
  const next = govBooks(world, campaign, k.budget);
  return (
    <section className="treasury-card" aria-label={t('treasury.title')}>
      <h4>{t('treasury.title')}</h4>
      <dl className="facts orders-facts">
        <div><dt>{t('treasury.held')}</dt><dd className="num">{f.rm(held)}</dd></div>
        <div><dt>{t('treasury.month')}</dt><dd className={`num ${allocation(world, campaign) < 0 ? 'neg' : ''}`}>{allocation(world, campaign) < 0 ? '−' : '+'}{f.rm(Math.abs(allocation(world, campaign)) * MONTH)}</dd></div>
        <div><dt>{t('house.owed')}</dt><dd className={`num ${k.economy.debt > 75 ? 'neg' : ''}`}>{f.rm(fin.debtRm)} <span className="muted small">{k.economy.debt.toFixed(1)}%</span></dd></div>
      </dl>
      <div className="progress" role="img" aria-label={t('treasury.bar', { held: f.rm(held), cap: f.rm(cap) })}>
        <span style={{ width: `${cap > 0 ? Math.min(100, (held / cap) * 100) : 0}%` }} />
      </div>
      <p className="muted small">{t('treasury.cap', { cap: f.rm(cap) })}</p>
      {now && next && (
        <>
          <h4>{t('books.title')}</h4>
          <p className="muted small">{t('books.desc')}</p>
          <table className="ledger books">
            <thead><tr><th /><th>{t('books.now')}</th><th>{t('books.next')}</th></tr></thead>
            <tbody>
              <tr className="group"><th colSpan={3}>{t('books.in')}</th></tr>
              {now.income.map((x, i) => <Row key={x.id} name={t(books(x))} a={x.amount} b={next.income[i].amount} good />)}
              <tr className="group"><th colSpan={3}>{t('books.out')}</th></tr>
              {now.spend.map((x, i) => <Row key={x.id} name={t(books(x))} a={x.amount} b={next.spend[i].amount} />)}
              <tr className="total"><th>{t('books.net')}</th><Money v={now.net} /><Money v={next.net} /></tr>
            </tbody>
          </table>
          {now.net < 0 && held < -now.net * 4 && <p className="note bad">{t('books.borrow')}</p>}
          <p className="muted small">{t('books.control')}</p>
        </>
      )}
      {limit > 0 ? (
        <div className="repay">
          <label className="muted small" htmlFor="repay-range">{t('treasury.repay')}</label>
          <input id="repay-range" type="range" min={0} max={100} step={5} value={pct} onChange={(e) => setPct(Number(e.target.value))} />
          <p className="small num">{amount > 0 ? t('treasury.repay.effect', { rm: f.rm(amount), from: k.economy.debt.toFixed(2), to: (k.economy.debt - eased).toFixed(2) }) : t('treasury.repay.none')}</p>
          <button className="btn small primary" disabled={amount <= 0} onClick={() => { repay(amount); }}>{t('treasury.repay.go')}</button>
        </div>
      ) : (
        <p className="muted small">{k.economy.debt <= 30 ? t('treasury.repay.clear') : now ? t('treasury.repay.empty') : t('treasury.repay.pm')}</p>
      )}
    </section>
  );
}

/** Weeks to a month, for the figures shown. */
const MONTH = 52 / 12;
const books = (x: BookFlow): StringKey => (x.id === 'oil' || x.id === 'electronics' || x.id === 'tourism' || x.id === 'farming' ? `sector.${x.id}` : `books.${x.id}`) as StringKey;

function Money({ v }: { v: number }) {
  const f = useFormat();
  return <td className={`num ${v < 0 ? 'neg' : ''}`}>{v < 0 ? '−' : ''}{f.rm(Math.abs(v) * MONTH)}</td>;
}

/** One line of the books: what it is now, and what it will be when the next budget is tabled. */
function Row({ name, a, b, good }: { name: string; a: number; b: number; good?: boolean }) {
  const f = useFormat();
  const up = b > a * 1.005, down = b < a * 0.995;
  return (
    <tr>
      <th>{name}</th>
      <td className="num">{f.rm(a * MONTH)}</td>
      <td className={`num ${up ? (good ? 'pos-text' : 'neg') : down ? (good ? 'neg' : 'pos-text') : ''}`}>{f.rm(b * MONTH)} {up ? '▲' : down ? '▼' : ''}</td>
    </tr>
  );
}
