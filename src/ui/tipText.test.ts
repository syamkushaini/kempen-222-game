import { describe, expect, it } from 'vitest';
import '../data/allStates';
import { dunByElections, worldOf } from '../data/world';
import { translate, type Lang, type StringKey } from '../i18n/strings';
import { tipFacts, TIPS_PER_LEVEL } from '../sim/campaign/contestTips';
import { FOUNDING_SLOT } from '../sim/campaign/founding';
import { STEPS, scenarioState, stepScenario } from '../sim/campaign/journey';
import { loadScenario, loadState } from '../data/world';
import { PARTY_IDS } from '../sim/types';
import { useStore } from '../state/store';
import { formatFor } from './hooks';
import { tipText } from './tipText';

describe('the tips of the levels, with their figures', () => {
  it('fill in every figure, in both languages, for every level played as a contest', async () => {
    const out: string[] = [];
    for (let i = 0; i < STEPS.length; i++) {
      const step = STEPS[i];
      if (step.contest === 'career' || step.contest === 'federal') continue;
      const scenario = stepScenario(i, dunByElections);
      const st = scenarioState(scenario);
      if (st) await loadState(st);
      await loadScenario(scenario);
      useStore.getState().quitToTitle();
      useStore.getState().startCampaign({ name: 'T', scenario, player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'normal', backstory: null, seed: 1, founded: true, journey: true });
      const c = useStore.getState().game!.campaign;
      const facts = tipFacts(worldOf(c)!, c, step);
      for (const lang of ['en', 'ms'] as Lang[]) {
        const t = (k: StringKey, v?: Record<string, string | number>) => translate(lang, k, v);
        const keys = [`ltip.${step.id}`, ...Array.from({ length: TIPS_PER_LEVEL }, (_, n) => `tip.${step.id}.${n + 1}`), 'ctip.budget', 'ctip.gotv', 'ctip.funds'];
        for (const key of keys) {
          const text = tipText(t, formatFor(lang), key, facts, { spentPct: 80 });
          expect(text, `${lang} ${key}`).not.toMatch(/[{}]/);
          expect(text, `${lang} ${key}`).not.toBe(key);
          if (process.env.SHOW_TIPS && lang === 'en') out.push(`[${key}] ${text}`);
        }
      }
    }
    if (out.length) console.log(out.join('\n'));
  }, 300000);
});
