import { seatOf } from '../sim/campaign/events';
import { useStore } from '../state/store';
import { useMemo, useState } from 'react';
import { leaderName, partyName, useT } from './hooks';
import { Portrait } from './Portrait';
import { legacyCard, ShareDialog } from './ShareDialog';

/** The end of a career: how the leader will be remembered, and the record behind it. */
export function LegacyScreen() {
  const t = useT();
  const campaign = useStore((s) => s.game!.campaign);
  const quitToTitle = useStore((s) => s.quitToTitle);
  const k = campaign.career!;
  const end = k.ending!;
  const r = k.record;
  const years = ((k.term - 1) * 260 + k.week) / 52;
  const [sharing, setSharing] = useState(false);
  const card = useMemo(() => legacyCard(t, campaign), [t, campaign]);
  return (
    <main className="title legacy">
      <section className="panel title-main">
        <div className="legacy-head">
          <Portrait leader={campaign.player} size={96} className="reveal" />
          <div className="grow">
            <p className="dialog-from">{t(`ending.${end.kind}`)}</p>
            <h2 className="legacy-title reveal">{t(`legacy.${end.legacy}`)}</h2>
            <p className="muted small">{leaderName(t, campaign.player)} · {partyName(t, campaign.player)}</p>
          </div>
        </div>
        <p className="title-intro">{t(`legacy.${end.legacy}.text`)}</p>
        <dl className="facts">
          <div><dt>{t('legacy.score')}</dt><dd className="num">{end.score}</dd></div>
          <div><dt>{t('legacy.years')}</dt><dd className="num">{years.toFixed(1)}</dd></div>
          <div><dt>{t('house.record.pm')}</dt><dd className="num">{(r.weeksPm / 52).toFixed(1)}</dd></div>
          <div><dt>{t('legacy.inGov')}</dt><dd className="num">{(r.weeksGov / 52).toFixed(1)}</dd></div>
          <div><dt>{t('house.record.elections')}</dt><dd className="num">{r.elections}</dd></div>
          <div><dt>{t('legacy.victories')}</dt><dd className="num">{r.victories}</dd></div>
          <div><dt>{t('legacy.bestSeats')}</dt><dd className="num">{r.bestSeats}</dd></div>
          <div><dt>{t('term.credibility')}</dt><dd className="num">{Math.round(k.credibility)}</dd></div>
          <div><dt>{t('house.record.kept')}</dt><dd className="num">{r.kept.length}</dd></div>
          <div><dt>{t('house.record.broken')}</dt><dd className="num">{r.broken}</dd></div>
          <div><dt>{t('legacy.falls')}</dt><dd className="num">{r.falls}</dd></div>
          <div><dt>{t('legacy.toppled')}</dt><dd className="num">{r.toppled}</dd></div>
        </dl>
        <p className="note">{t('legacy.left', { party: partyName(t, campaign.player), seat: t(`orders.seat.${seatOf(campaign)}`) })}</p>
        <p className="muted small">{t('legacy.hung')}</p>
        <div className="button-row">
          <button className="btn primary" onClick={quitToTitle}>{t('summary.again')} ▸</button>
          <button className="btn" onClick={() => setSharing(true)}>{t('share.button')}</button>
        </div>
        {sharing && <ShareDialog data={card} onClose={() => setSharing(false)} />}
      </section>
    </main>
  );
}
