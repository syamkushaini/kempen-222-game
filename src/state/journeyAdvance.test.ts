import { beforeEach, describe, expect, it } from 'vitest';
import '../data/allStates';
import { dunByElections, getWorld, nextContest, worldOf } from '../data/world';
import { FOUNDING_SLOT } from '../sim/campaign/founding';
import { REBUILD_WEEKS, emptyJourney, nextAfterLoss, nextStep, record } from '../sim/campaign/journey';
import { REBUILD_ONLY, canDo, rebuilding } from '../sim/campaign/actions';
import { SHADOW_POSTS } from '../sim/campaign/opposition';
import { PARTY_IDS } from '../sim/types';
import { useStore } from './store';

const dun = () => dunByElections('selangor')[0];

describe('advancing along the journey', () => {
  it('offers nothing after a by-election that was not won (the old rule would offer the state election)', () => {
    const j = emptyJourney();
    expect(nextStep(j, dun(), dunByElections)).toBeNull();
    // what the old fallback would have done: carry the player on regardless
    expect(nextContest(dun(), getWorld(dun())!)).toBe('state:selangor');
  });
  it('offers nothing after a state election that did not take the state', () => {
    expect(nextStep(emptyJourney(), 'state:selangor', dunByElections)).toBeNull();
    expect(nextStep(record(emptyJourney(), 'state:selangor', { won: true, governed: false }), 'state:selangor', dunByElections)).toBeNull();
  });
});

describe('carrying on after a loss', () => {
  const seats = dunByElections('selangor');
  it('offers the same by-election again, whichever seat it was', () => {
    expect(nextAfterLoss(emptyJourney(), seats[0])).toBe(seats[0]);
    expect(nextAfterLoss(emptyJourney(), seats[2])).toBe(seats[2]);
  });
  it('offers the same state election again until the state is taken, and nothing for a state taken or a general election', () => {
    expect(nextAfterLoss(emptyJourney(), 'state:selangor')).toBe('state:selangor');
    const j = record(emptyJourney(), 'state:selangor', { won: true, governed: true });
    expect(nextAfterLoss(j, 'state:selangor')).toBeNull();
    expect(nextAfterLoss(emptyJourney(), 'general')).toBeNull();
  });
  it('does not change the level by itself', () => {
    expect(record(emptyJourney(), seats[0], { won: false, governed: false })).toEqual(emptyJourney());
  });
});

describe('a Career Campaign game', () => {
  beforeEach(() => useStore.getState().quitToTitle());
  it('remembers that it is one, through starting again', () => {
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: null, seed: 3, founded: true, journey: true });
    expect(useStore.getState().game!.start?.journey).toBe(true);
    useStore.getState().restart();
    expect(useStore.getState().game!.start?.journey).toBe(true);
  });
  it('carries on to the same contest after a loss without raising the level', async () => {
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: null, seed: 3, founded: true, journey: true });
    useStore.setState((s) => ({ game: { ...s.game!, tutorial: null }, profile: { ...s.profile, journey: undefined } }));
    useStore.getState().finishWithTeam();
    useStore.getState().finishNight();
    const before = useStore.getState().game!;
    await useStore.getState().climb();
    const j = useStore.getState().profile.journey;
    const won = (j?.fought.length ?? 0) > 0;
    if (!won) {
      // nothing was won for this seed: a new game of the same contest starts, and the level is still the first
      const after = useStore.getState().game!;
      expect(after.id).not.toBe(before.id);
      expect(after.campaign.scenario).toBe(before.campaign.scenario);
      expect(after.start?.journey).toBe(true);
      expect(j?.dunWon ?? 0).toBe(0);
    }
  });
});

describe('the weeks of rebuilding after a loss', () => {
  it('open a contest played again with weeks in opposition before the election, and survive a restart', () => {
    const PS = PARTY_IDS.indexOf('ps');
    useStore.getState().quitToTitle();
    const base = getWorld(dun())!.rules.weeks;
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: PS, difficulty: 'normal', founded: true, journey: true, rebuild: REBUILD_WEEKS, weeks: base + REBUILD_WEEKS });
    const c = useStore.getState().game!.campaign;
    expect(c.rebuild).toBe(REBUILD_WEEKS);
    expect(c.totalWeeks).toBe(base + REBUILD_WEEKS);
    useStore.getState().restart();
    expect(useStore.getState().game!.campaign.rebuild).toBe(REBUILD_WEEKS);
  });
});

describe('opposition actions in the weeks of rebuilding', () => {
  it('are open only while the rebuild weeks last, and work', () => {
    const PS = PARTY_IDS.indexOf('ps');
    useStore.getState().quitToTitle();
    const base = getWorld(dun())!.rules.weeks;
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: PS, difficulty: 'normal', founded: true, journey: true, rebuild: REBUILD_WEEKS, weeks: base + REBUILD_WEEKS });
    const world = () => worldOf(useStore.getState().game!.campaign)!;
    const c = () => useStore.getState().game!.campaign;
    const rival = PARTY_IDS.indexOf('pt');
    for (const id of REBUILD_ONLY) expect(JSON.stringify(canDo(world(), c(), PS, id, id === 'scrutiny' ? { party: rival } : {})), id).toBe('{"ok":true}');
    const before = c().parties[PS]!.unity;
    useStore.getState().act('regroup', {});
    expect(c().parties[PS]!.unity).toBeGreaterThanOrEqual(before);
    useStore.getState().skipRebuild(9999, true);
    expect(c().week).toBe(REBUILD_WEEKS + 1);
    expect(rebuilding(c())).toBe(false);
    for (const id of REBUILD_ONLY) expect(canDo(world(), c(), PS, id, id === 'scrutiny' ? { party: rival } : {}).ok, id).toBe(false);
  });
  it('are not open in an ordinary contest', () => {
    const PS = PARTY_IDS.indexOf('ps');
    useStore.getState().quitToTitle();
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: PS, difficulty: 'normal', founded: true, journey: true });
    for (const id of REBUILD_ONLY) expect(canDo(getWorld(dun())!, useStore.getState().game!.campaign, PS, id, id === 'scrutiny' ? { party: 0 } : {}).ok, id).toBe(false);
  });
});

describe('the opposition in the years of rebuilding', () => {
  const begin = () => {
    useStore.getState().quitToTitle();
    const base = getWorld(dun())!.rules.weeks;
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', founded: true, journey: true, rebuild: REBUILD_WEEKS, weeks: base + REBUILD_WEEKS });
    return () => useStore.getState().game!.campaign;
  };
  it('has a government to oppose, and a cabinet in waiting that costs money', () => {
    const c = begin();
    const o = c().opposition!;
    expect(o.govt).not.toBe(PARTY_IDS.indexOf('ps'));
    expect(o.policies).toHaveLength(4);
    const funds = c().parties[PARTY_IDS.indexOf('ps')]!.funds;
    useStore.getState().oppShadow(SHADOW_POSTS[0]);
    expect(c().opposition!.shadow[SHADOW_POSTS[0]]).toBeDefined();
    expect(c().parties[PARTY_IDS.indexOf('ps')]!.funds).toBeLessThan(funds);
  });
  it('digs a dossier up at a committee, once a week, and spends it on a challenge', () => {
    const c = begin();
    useStore.getState().oppCommittee();
    expect(c().opposition!.dossier).toBeGreaterThan(0);
    useStore.getState().oppCommittee();
    expect(c().opposition!.used.filter((x) => x === 'committee')).toHaveLength(1);
    const id = c().opposition!.policies[0];
    const before = c().opposition!.dossier;
    useStore.getState().oppChallenge(id, 'debate');
    expect(c().opposition!.challenged).toContain(id);
    expect(c().opposition!.dossier).toBeLessThan(before);
    // each policy once, and not again so soon
    useStore.getState().oppChallenge(c().opposition!.policies[1], 'debate');
    expect(c().opposition!.challenged).toHaveLength(1);
  });
  it('is not there in an ordinary contest', () => {
    useStore.getState().quitToTitle();
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', founded: true, journey: true });
    expect(useStore.getState().game!.campaign.opposition).toBeUndefined();
  });
});

describe('what the years in opposition earn', () => {
  it('raise the start of the campaign by more for a party that did the work, and tell the player', () => {
    const PS = PARTY_IDS.indexOf('ps');
    const run = (work: boolean) => {
      useStore.getState().quitToTitle();
      const base = getWorld(dun())!.rules.weeks;
      useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: PS, difficulty: 'normal', founded: true, journey: true, rebuild: 52, weeks: base + 52, seed: 7 });
      if (work) { useStore.getState().oppShadow(SHADOW_POSTS[0]); useStore.getState().oppShadow(SHADOW_POSTS[1]); useStore.getState().oppCommittee(); }
      useStore.getState().skipRebuild(9999, true);
      return useStore.getState().game!.campaign;
    };
    const idle = run(false);
    const busy = run(true);
    expect(busy.week).toBe(53);
    expect(busy.opposition!.result!.bonus).toBeGreaterThan(idle.opposition!.result!.bonus);
    expect(busy.opposition!.result!.bonus).toBeLessThanOrEqual(0.1);
    expect(busy.news.some((n) => n.key === 'news.opp.result')).toBe(true);
  });
  it('can be a year, two or five', () => {
    const PS = PARTY_IDS.indexOf('ps');
    useStore.getState().quitToTitle();
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: PS, difficulty: 'normal', founded: true, journey: true, rebuild: 104, weeks: getWorld(dun())!.rules.weeks + 104 });
    expect(useStore.getState().game!.campaign.rebuild).toBe(104);
  });
});

describe('what the years in opposition bring the next campaign', () => {
  it('turns the work done into a head start, set once when the campaign begins', () => {
    const ps = PARTY_IDS.indexOf('ps');
    useStore.getState().quitToTitle();
    const base = getWorld(dun())!.rules.weeks;
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: ps, difficulty: 'normal', founded: true, journey: true, rebuild: 52, weeks: base + 52 });
    const c = () => useStore.getState().game!.campaign;
    const idle = (() => { useStore.getState().skipRebuild(9999, true); return c().opposition!.result!.bonus; })();
    expect(c().week).toBe(53);
    expect(idle).toBeGreaterThanOrEqual(0);
    useStore.getState().quitToTitle();
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: ps, difficulty: 'normal', founded: true, journey: true, rebuild: 52, weeks: base + 52 });
    for (const post of SHADOW_POSTS) { useStore.getState().oppShadow(post); }
    useStore.getState().skipRebuild(9999, true);
    const worked = c().opposition!.result!;
    expect(worked.shadow).toBeGreaterThan(0);
    expect(worked.bonus).toBeGreaterThan(idle);
    expect(worked.bonus).toBeLessThanOrEqual(0.1);
  });
});

describe('skipping the years in opposition', () => {
  it('stops at the end of a quarter or an opening, and runs on to the campaign when told to pass them', () => {
    const ps = PARTY_IDS.indexOf('ps');
    useStore.getState().quitToTitle();
    const base = getWorld(dun())!.rules.weeks;
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: ps, difficulty: 'normal', founded: true, journey: true, rebuild: REBUILD_WEEKS, weeks: base + REBUILD_WEEKS });
    const c = () => useStore.getState().game!.campaign;
    useStore.getState().skipRebuild(9999);
    expect(c().week).toBeGreaterThan(1);
    expect(c().week).toBeLessThanOrEqual(14);
    expect(rebuilding(c())).toBe(true);
    useStore.getState().skipRebuild(9999, true);
    expect(rebuilding(c())).toBe(false);
  });
});
