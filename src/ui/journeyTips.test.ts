import { describe, expect, it, vi } from 'vitest';
import { translate, type StringKey } from '../i18n/strings';
import { STEPS } from '../sim/campaign/journey';
import { TIPS_PER_LEVEL } from './JourneyResult';

// Server rendering reads a store's initial state; the panel is rendered here from its live state instead.
vi.mock('../state/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../state/store')>();
  const live = Object.assign(((sel?: (s: unknown) => unknown) => (sel ? sel(actual.useStore.getState()) : actual.useStore.getState())) as unknown as typeof actual.useStore, actual.useStore);
  return { ...actual, useStore: live };
});

describe('tips for a level that was not cleared', () => {
  const played = STEPS.filter((s) => s.contest !== 'career' && s.contest !== 'federal');
  it('are written, in both languages, for every level played as a contest', () => {
    for (const s of played) {
      for (let n = 1; n <= TIPS_PER_LEVEL; n++) {
        const key = `tip.${s.id}.${n}` as StringKey;
        for (const lang of ['en', 'ms'] as const) {
          const text = translate(lang, key);
          expect(text, `${lang} ${key}`).not.toBe(key);
          expect(text.length, `${lang} ${key}`).toBeGreaterThan(20);
        }
      }
    }
    expect(played.length).toBe(9);
  });
});

describe('the result panel', () => {
  it('shows the tips after a lost level and not after a cleared one', async () => {
    await import('../data/allStates');
    const { createElement } = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { useStore } = await import('../state/store');
    const { dunByElections } = await import('../data/world');
    const { FOUNDING_SLOT } = await import('../sim/campaign/founding');
    const { emptyJourney, journeyLevel, stepScenario, FIRST_LEVEL_FOLLOWING } = await import('../sim/campaign/journey');
    const { PARTY_IDS } = await import('../sim/types');
    const { JourneyResult } = await import('./JourneyResult');
    const store = () => useStore.getState();
    const seen = { lost: false, won: false };
    for (let seed = 1; seed <= 40 && !(seen.lost && seen.won); seed++) {
      useStore.setState((s) => ({ profile: { ...s.profile, journey: emptyJourney() } }));
      store().quitToTitle();
      store().startCampaign({ name: 'T', scenario: stepScenario(0, dunByElections), player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: null, seed, founded: true, journey: true, following: FIRST_LEVEL_FOLLOWING });
      useStore.setState((st) => ({ game: { ...st.game!, tutorial: null } }));
      store().finishWithTeam();
      store().finishNight();
      const html = renderToStaticMarkup(createElement(JourneyResult));
      const won = journeyLevel(store().profile.journey) === 2;
      if (won) { seen.won = true; expect(html).not.toContain('journey-tips'); }
      else { seen.lost = true; expect(html).toContain('journey-tips'); expect(html).toContain(translate('en', 'tip.firstSeat.1' as StringKey)); }
    }
    expect(seen).toEqual({ lost: true, won: true });
  }, 120000);
});

describe('the campaign manager during a level', () => {
  it('speaks once the tutorial is over, with a tip for the week', async () => {
    await import('../data/allStates');
    const { createElement } = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { useStore } = await import('../state/store');
    const { dunByElections } = await import('../data/world');
    const { FOUNDING_SLOT } = await import('../sim/campaign/founding');
    const { emptyJourney, stepScenario, FIRST_LEVEL_FOLLOWING } = await import('../sim/campaign/journey');
    const { PARTY_IDS } = await import('../sim/types');
    const { Adviser } = await import('./Adviser');
    useStore.setState((s) => ({ profile: { ...s.profile, journey: emptyJourney() } }));
    useStore.getState().quitToTitle();
    useStore.getState().startCampaign({ name: 'T', scenario: stepScenario(0, dunByElections), player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: null, seed: 1, founded: true, journey: true, following: FIRST_LEVEL_FOLLOWING });
    useStore.setState((st) => ({ game: { ...st.game!, tutorial: null } }));
    const html = renderToStaticMarkup(createElement(Adviser));
    expect(html).toContain(translate('en', 'adviser.name'));
    expect(html).toMatch(/adviser-strip/);
    expect(html).toContain(translate('en', 'ctip.later' as StringKey));
  }, 120000);
});
