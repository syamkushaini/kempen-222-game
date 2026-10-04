import { describe, expect, it } from 'vitest';
import { getWorld } from '../data/world';
import { PARTIES } from '../data/parties';
import { NETIZEN_KINDS, NETIZENS_EN, NETIZENS_MS } from '../i18n/netizens';
import { HONOURS_EN } from '../i18n/honours';
import { PEOPLE_EN, PEOPLE_MS } from '../i18n/people';
import { CORE_KEYS } from '../i18n/strings';
import { LEADERS } from '../sim/campaign/cast';
import { pushNews } from '../sim/campaign/news';
import { newCampaign } from '../sim/campaign/turn';
import { BACKSTORY_IDS, ENDORSER_IDS, HOPEFUL_KINDS, OUTLET_IDS, ROLE_IDS, STAT_IDS } from '../sim/campaign/types';
import { newGame, parseSave, serializeSave } from '../state/game';
import { EMBLEM_IDS, isValidIdentity, LOOK_COUNT, makeIdentity, PARTY_COLORS } from '../state/identity';
import { leaderPortrait, PLAYER_LOOKS } from './faces';
import { applyIdentity } from './identity';
import { netizenFeed, netizenKind } from './netizens';

const general = getWorld('general')!;
const mine = { name: '  Parti   Harapan Rakyat ', short: 'phr', color: PARTY_COLORS[6], emblem: 'bridge', leader: 'Puan Sri Aminah Zain', look: 5 };

describe('a party of one’s own', () => {
  it('is tidied up, and refused if there is nothing to it', () => {
    expect(makeIdentity(mine)).toEqual({ name: 'Parti Harapan Rakyat', short: 'PHR', color: PARTY_COLORS[6], emblem: 'bridge', leader: 'Puan Sri Aminah Zain', look: 5 });
    expect(makeIdentity({ ...mine, name: '   ' })).toBeNull();
    expect(makeIdentity({ ...mine, color: '#123456' })).toBeNull();
    expect(makeIdentity({ ...mine, emblem: 'rocket' })).toBeNull();
    expect(makeIdentity({ ...mine, look: LOOK_COUNT })).toBeNull();
    expect(makeIdentity({ ...mine, name: 'x'.repeat(200) })!.name).toHaveLength(40);
    expect(PLAYER_LOOKS).toHaveLength(LOOK_COUNT);
    expect(EMBLEM_IDS).toHaveLength(8);
  });

  it('dresses the party everywhere, and takes it all off again', () => {
    const identity = makeIdentity(mine)!;
    const face = leaderPortrait(0);
    applyIdentity(0, identity);
    expect(PARTIES.ps).toMatchObject({ name: 'Parti Harapan Rakyat', short: 'PHR', color: PARTY_COLORS[6] });
    expect(LEADERS.ps).toBe('Puan Sri Aminah Zain');
    expect(leaderPortrait(0)).not.toBe(face);
    expect(PARTIES.bp.name).toBe('Barisan Pusaka');
    applyIdentity(1, identity);
    expect(PARTIES.ps.name).toBe('Pakatan Sinar'); // one party at a time
    expect(PARTIES.bp.name).toBe('Parti Harapan Rakyat');
    applyIdentity(null, null);
    expect(PARTIES.bp).toMatchObject({ name: 'Barisan Pusaka', short: 'BP' });
    expect(LEADERS.bp).toBe('Datuk Seri Rahmat Kassim');
    expect(leaderPortrait(0)).toBe(face);
  });

  it('is kept with the save, and a damaged one is refused', () => {
    const identity = makeIdentity(mine)!;
    const g = newGame('Mine', newCampaign(general, { player: 0, difficulty: 'normal', seed: 3, backstory: 'fixer' }), 5, false, identity);
    expect(parseSave(serializeSave(g))).toEqual({ ok: true, state: g });
    expect(isValidIdentity(null)).toBe(true);
    for (const bad of [{ ...identity, color: 'red' }, { ...identity, short: 'toolongname' }, { ...identity, name: 5 }, 'x', [identity]]) {
      expect(isValidIdentity(bad)).toBe(false);
      expect(parseSave(JSON.stringify({ ...g, identity: bad }))).toEqual({ ok: false, error: 'damaged' });
    }
  });

  it('is given to older saves as an ordinary leader with nobody hired', () => {
    const g = newGame('Old', newCampaign(general, { player: 0, difficulty: 'normal', seed: 3 }), 5) as any;
    const { team, ...campaign } = g.campaign;
    const { identity, ...rest } = g;
    const parties = campaign.parties.map((p: any) => { if (!p) return p; const { spent, fined, ...old } = p; return old; });
    expect(identity).toBeNull();
    expect(team.keySeats).toHaveLength(8);
    expect(parseSave(JSON.stringify({ ...rest, version: 7, campaign: { ...campaign, parties } }))).toEqual({ ok: true, state: g });
    const broken = JSON.parse(serializeSave(g));
    broken.campaign.team.leader.stats = [9, 3, 3, 3];
    expect(parseSave(JSON.stringify(broken))).toEqual({ ok: false, error: 'damaged' });
  });
});

describe('netizens', () => {
  it('have something to say about each kind of story, in both languages', () => {
    for (const table of [NETIZENS_EN, NETIZENS_MS]) {
      expect(Object.keys(table).sort()).toEqual([...NETIZEN_KINDS].sort());
      for (const kind of NETIZEN_KINDS) { expect(table[kind].length, kind).toBeGreaterThanOrEqual(3); for (const line of table[kind]) expect(line.length).toBeGreaterThan(10); }
    }
  });

  it('react to the stories that travel, and ignore the rest', () => {
    expect(netizenKind('news.me.ceramah.great')).toBe('crowdGreat');
    expect(netizenKind('news.me.attack.backfire')).toBe('backfire');
    expect(netizenKind('news.rival.attackYou.ok')).toBe('attack');
    expect(netizenKind('news.tycoon.exposedYou')).toBe('tycoon');
    expect(netizenKind('news.gov.budget.loose')).toBe('budget');
    expect(netizenKind('news.ec.finedYou')).toBe('fine');
    expect(netizenKind('news.income')).toBeNull();
    expect(netizenKind('news.me.canvass')).toBeNull();
  });

  it('say the same thing about the same news every time', () => {
    const c = newCampaign(general, { player: 0, difficulty: 'normal', seed: 3 });
    pushNews(c, { party: 0, key: 'news.me.megarally.great', tone: 'good' });
    pushNews(c, { party: 1, key: 'news.tycoon.exposed', tone: 'neutral' });
    pushNews(c, { party: 0, key: 'news.me.canvass', tone: 'neutral' });
    const name = (p: number) => ['Sinar', 'Pusaka'][p] ?? '?';
    const feed = netizenFeed(c.news, 'en', name, 0);
    expect(feed.length).toBeGreaterThanOrEqual(2);
    expect(feed).toEqual(netizenFeed(c.news, 'en', name, 0));
    expect(feed[0].handle.startsWith('@')).toBe(true);
    expect(feed.every((p) => !p.text.includes('{party}'))).toBe(true);
    expect(netizenFeed(c.news, 'ms', name, 0).map((p) => p.text)).not.toEqual(feed.map((p) => p.text));
    expect(netizenFeed(c.news, 'en', name, 0, 1)).toHaveLength(1);
  });
});

describe('the words for the people around the leader', () => {
  it('exist in both languages with the same blanks to fill', () => {
    expect(Object.keys(PEOPLE_MS).sort()).toEqual(Object.keys(PEOPLE_EN).sort());
    const holes = (s: string) => (s.match(/\{[a-z]+\}/gi) ?? []).sort().join();
    for (const [key, text] of Object.entries(PEOPLE_EN)) expect(holes((PEOPLE_MS as Record<string, string>)[key]), key).toBe(holes(text));
  });

  it('never reuse a key that already means something else', () => {
    const core = new Set(CORE_KEYS);
    expect([...Object.keys(PEOPLE_EN), ...Object.keys(HONOURS_EN)].filter((key) => core.has(key))).toEqual([]);
    expect(Object.keys(PEOPLE_EN).filter((k) => k in HONOURS_EN)).toEqual([]);
  });

  it('cover every backstory, job, candidate, endorser and outlet', () => {
    const has = (key: string) => expect((PEOPLE_EN as Record<string, string>)[key], key).toBeTruthy();
    for (const id of BACKSTORY_IDS) { has(`backstory.${id}`); has(`backstory.${id}.desc`); }
    for (const id of STAT_IDS) { has(`stat.${id}`); has(`stat.${id}.desc`); }
    for (const id of ROLE_IDS) { has(`role.${id}`); has(`role.${id}.does`); }
    for (const id of HOPEFUL_KINDS) { has(`hopeful.${id}`); has(`hopeful.${id}.desc`); }
    for (const id of ENDORSER_IDS) { has(`endorser.${id}`); has(`endorser.${id}.desc`); }
    for (const id of OUTLET_IDS) { has(`outlet.${id}`); has(`outlet.${id}.desc`); }
    for (const id of EMBLEM_IDS) has(`emblem.${id}`);
    for (const slant of ['friendly', 'even', 'hostile']) for (const topic of ['good', 'bad', 'quiet']) for (const n of [0, 1]) has(`front.${slant}.${topic}.${n}`);
  });
});
