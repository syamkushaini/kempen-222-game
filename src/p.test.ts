import { it } from 'vitest';
import { getWorld } from './data/world';
import { PARTY_IDS } from './sim/types';
import { answerEvent, startCareer, termWeek } from './sim/campaign/career';
import { agenda, tableBill, deliver } from './sim/campaign/govern';
it('x', () => {
  const base = getWorld('career')!;
  const out: string[] = [];
  for (const seed of Array.from({ length: 24 }, (_, i) => i + 1)) {
    const c = startCareer(base, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed });
    let minStab = 100;
    for (let guard = 0; guard < 4000 && c.phase === 'term' && !c.career!.ending; guard++) {
      if (c.inbox.length) { answerEvent(base, c, c.inbox.shift()!, 0); continue; }
      const next = agenda(c)[0]; if (next) tableBill(c, next);
      c.career!.obligations.forEach((o, i) => { if (!o.done) deliver(c, i); });
      termWeek(base, c); minStab = Math.min(minStab, c.career!.government.stability);
    }
    const k = c.career!;
    out.push(`seed ${seed}: phase ${c.phase} week ${k.week} minStab ${minStab.toFixed(1)} standins ${k.cabinet.filter((m) => m.acting).length}/${k.cabinet.length}`);
  }
  const w = out.map((l) => Number(l.match(/week (\d+)/)![1])); require('fs').writeFileSync('/tmp/claude-0/scr/out12.txt', `mean weeks ${(w.reduce((a, b) => a + b, 0) / w.length).toFixed(1)} survived-to-252: ${w.filter((x) => x === 252).length}/${w.length}`);
}, 100000);
