import { describe, expect, it } from 'vitest';
import { foundedWorld, getWorld, worldOf } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { STORY_EN, STORY_MS } from '../../i18n/story';
import { PARTY_IDS } from '../types';
import { answerEvent, nextTerm, resumeTerm, skipAhead, startCareer, termWeek, TERM_WEEKS } from './career';
import { endDay } from './formation';
import { closeNight, endWeek } from './turn';
import { EVENTS, eligible, seatOf } from './events';
import { BEAT_STYLES, FOUNDED_BEATS, NAT_BEATS, STATE_BEATS, STORY_EVENTS } from './eventListStory';
import { playable } from './field';
import { ARCS, GAP, answerOf, arcFor, beatOf, beginStory, chapterDue, closeChapter, cliffhanger, manner, openChapter, styleOf, unseen, markSeen } from './storyline';
import { isValidCampaign } from './validate';
import type { Campaign } from './types';

const PS = PARTY_IDS.indexOf('ps');
const PT = PARTY_IDS.indexOf('pt');
const nat = getWorld('career')!;
const natCareer = (player = PS, seed = 7): Campaign => startCareer(nat, { player, difficulty: 'normal', seed });
const stateCareer = (st = 'melaka'): Campaign => { const w = getWorld(`career:${st}`)!; return startCareer(w, { player: playable(w)[0], difficulty: 'normal', seed: 4 }); };
const founded = (): Campaign => startCareer(foundedWorld(), { player: PARTY_IDS.indexOf('genba' as never), difficulty: 'normal', seed: 5, founded: true });

/** Runs weeks until the story puts its decision on the desk, setting aside what else turns up; false if it never did within a term. */
function toBeat(c: Campaign, w = nat): boolean {
  const mine = (id?: string) => !!id && id in BEAT_STYLES;
  for (let i = 0; i < TERM_WEEKS && c.phase === 'term'; i++) {
    if (c.inbox.some((x) => mine(x.event))) { c.inbox = c.inbox.filter((x) => mine(x.event)); return true; }
    c.inbox = [];
    skipAhead(w, c, 1);
  }
  return false;
}
const answer = (w: typeof nat, c: Campaign, choice: number) => { const scene = c.inbox[0]; c.inbox = c.inbox.filter((x) => x !== scene); answerEvent(w, c, scene, choice); };

describe('the beats of the stories', () => {
  const ids = [...NAT_BEATS, ...STATE_BEATS, ...FOUNDED_BEATS];

  it('are decisions with words in both languages, a pair for each gamble, and a style for every answer', () => {
    expect(ids).toHaveLength(18);
    for (const id of ids) {
      expect(EVENTS[id], id).toBeDefined();
      expect(EVENTS[id].weight, id).toBe(0);
      expect(BEAT_STYLES[id], id).toHaveLength(3);
      for (const text of [EVENTS_EN[id], EVENTS_MS[id]]) {
        expect(text.body.length, id).toBeGreaterThan(150);
        expect(text.options, id).toHaveLength(3);
        EVENTS[id].choices.forEach((ch, i) => expect(Array.isArray(text.results[i]), `${id} ${i}`).toBe(!!ch.gamble));
      }
      expect(EVENTS_MS[id].title, id).not.toBe(EVENTS_EN[id].title);
    }
  });

  it('leave every answer a mark, never trap the player with a price, and keep to the sizes the game uses', () => {
    const BOUND = { mood: 0.06, unity: 5, funds: 100_000, cred: 3, dossier: 8, relation: 5, graft: 10 } as Record<string, number>;
    for (const id of ids) {
      EVENTS[id].choices.forEach((ch, i) => {
        expect(ch.effects, `${id} ${i}`).toContainEqual({ t: 'flag', id: `sb:${id}:${i}` });
        for (const e of [...ch.effects, ...(ch.gamble ? [...ch.gamble.win, ...ch.gamble.lose] : [])]) if ('n' in e && BOUND[e.t] !== undefined) expect(Math.abs(e.n), `${id} ${e.t}`).toBeLessThanOrEqual(BOUND[e.t]);
      });
      // One answer costs no money, and one earns the leader's word or the party's heart.
      expect(EVENTS[id].choices.some((ch) => !ch.effects.some((e) => e.t === 'funds' && e.n < 0)), id).toBe(true);
      expect(EVENTS[id].choices.some((ch) => [...ch.effects, ...(ch.gamble?.win ?? [])].some((e) => (e.t === 'cred' || e.t === 'unity') && e.n > 0)), id).toBe(true);
    }
    expect(Object.keys(STORY_EVENTS)).toEqual(Object.keys(BEAT_STYLES));
  });

  it('are told in the country, in a state, or in both, and not by chance', () => {
    const c = natCareer();
    const s = stateCareer();
    for (const id of NAT_BEATS) { expect(eligible(c, id), `${id} nat`).toBe(true); expect(eligible(s, id), `${id} state`).toBe(false); }
    for (const id of STATE_BEATS) { expect(eligible(c, id), `${id} nat`).toBe(false); expect(eligible(s, id), `${id} state`).toBe(true); }
  });
});

describe('the chapters of the stories', () => {
  it('have a title, a teaser and a closing line for each way an answer can read, in both languages', () => {
    for (const arc of Object.values(ARCS)) {
      expect(arc.chapters).toHaveLength(5);
      for (const ch of arc.chapters) {
        for (const lang of [STORY_EN, STORY_MS]) {
          for (const key of [`story.${ch.id}.title`, `story.${ch.id}.hook`, ...(['steady', 'bold', 'shady'] as const).map((s) => `story.${ch.id}.close.${s}`)]) expect(lang[key], key).toBeTruthy();
        }
        expect(ch.beats.every((b) => b in EVENTS), ch.id).toBe(true);
      }
      for (const lang of [STORY_EN, STORY_MS]) {
        expect(lang[`story.arc.${arc.id}.name`]).toBeTruthy();
        expect(lang[`story.${arc.id}.told`]).toBeTruthy();
        for (const style of ['steady', 'bold', 'shady']) expect(lang[`story.${arc.id}.end.${style}`], `${arc.id} ${style}`).toBeTruthy();
      }
    }
  });

  it('come in order, and never earlier than the one before', () => {
    for (const arc of Object.values(ARCS)) {
      const times = arc.chapters.map((ch) => ch.from[0] * 1000 + ch.from[1]);
      expect(times).toEqual([...times].sort((a, b) => a - b));
      arc.chapters.forEach((ch) => expect(ch.by[0] * 1000 + ch.by[1], ch.id).toBeGreaterThanOrEqual(ch.from[0] * 1000 + ch.from[1]));
    }
  });

  it('tell the story that fits the career: the country\'s, a state\'s, or a party founded', () => {
    expect(arcFor(natCareer())).toBe('nat');
    expect(arcFor(stateCareer('penang'))).toBe('state');
    expect(arcFor(founded())).toBe('founded');
    expect(natCareer().career!.story).toMatchObject({ arc: 'nat', ch: 0, log: [], seen: 0 });
  });
});

describe('a story unfolding', () => {
  it('puts the first chapter on the desk, closes it when it is answered, says so in the news, and waits before the next', () => {
    const c = natCareer();
    expect(toBeat(c)).toBe(true);
    expect(c.inbox[0].event).toBe('natInheritance');
    expect(c.career!.week).toBeGreaterThanOrEqual(10);
    answer(nat, c, 1);
    const s = c.career!.story!;
    expect(s.log).toHaveLength(1);
    expect(s.log[0]).toMatchObject({ ch: 0, pick: 1, beat: 'natInheritance', term: 1, year: 1 });
    expect(s.ch).toBe(1);
    expect(unseen(c.career!)).toBe(1);
    expect(c.news.some((n) => n.key === 'story.nat1.close.shady')).toBe(true);
    // The chapter is over once and only once.
    expect(closeChapter(c)).toBe(false);
    expect(s.log).toHaveLength(1);
    // Nothing else of the story arrives for half a year, whatever the state of things.
    const ch = openChapter(c.career!)!;
    expect(chapterDue(c, ch, s)).toBe(false);
    s.since = GAP;
    expect(chapterDue(c, ch, s)).toBe(c.career!.week >= 40);
    markSeen(c.career!);
    expect(unseen(c.career!)).toBe(0);
  });

  it('brings a chapter sooner when things have gone wrong, and no later than its deadline when they have not', () => {
    const c = natCareer();
    const k = c.career!;
    const s = k.story!;
    s.ch = 1; s.since = GAP; k.week = 45;
    k.government.stability = 80; k.government.minority = false; c.parties[c.player]!.unity = 80;
    expect(chapterDue(c, openChapter(k)!, s)).toBe(false);
    c.parties[c.player]!.unity = 40;
    expect(chapterDue(c, openChapter(k)!, s)).toBe(true);
    c.parties[c.player]!.unity = 80;
    k.week = 90;
    expect(chapterDue(c, openChapter(k)!, s)).toBe(true);
  });

  it('is told differently to a government and to an opposition, and to a founded party that won seats and one that did not', () => {
    const gov = natCareer(PS);
    const opp = natCareer(PT);
    for (const c of [gov, opp]) { c.career!.story!.ch = 3; }
    expect(beatOf(gov, openChapter(gov.career!)!)).toBe('natAfterGov');
    expect(beatOf(opp, openChapter(opp.career!)!)).toBe('natAfterOpp');
    const f = founded();
    f.career!.story!.ch = 3;
    f.career!.record.bestSeats = 1;
    expect(beatOf(f, openChapter(f.career!)!)).toBe('foundWall');
    f.career!.record.bestSeats = 5;
    expect(beatOf(f, openChapter(f.career!)!)).toBe('foundBreakthrough');
    const st = stateCareer();
    st.career!.story!.ch = 3;
    expect(beatOf(st, openChapter(st.career!)!)).toBe(seatOf(st) === 'opp' ? 'stateAfterOpp' : 'stateAfterGov');
  });

  it('reads the career by the way most of its answers went, by the book when they are tied', () => {
    const c = natCareer();
    const s = c.career!.story!;
    expect(manner(s)).toBe('steady');
    s.log.push({ ch: 0, pick: 1, beat: 'natInheritance', term: 1, year: 1 }, { ch: 1, pick: 2, beat: 'natFirstCrack', term: 1, year: 2 });
    expect(styleOf('natInheritance', 1)).toBe('shady');
    expect(manner(s)).toBe('shady');
    s.log.push({ ch: 2, pick: 0, beat: 'natPaperTrail', term: 1, year: 3 }, { ch: 3, pick: 0, beat: 'natAfterGov', term: 2, year: 6 });
    expect(manner(s)).toBe('steady');
    s.log = [{ ch: 0, pick: 2, beat: 'natInheritance', term: 1, year: 1 }];
    expect(manner(s)).toBe('bold');
  });

  it('begins a game saved before stories without replaying what is long past', () => {
    const c = natCareer();
    delete c.career!.story;
    c.career!.term = 2; c.career!.week = 60;
    const s = beginStory(c);
    expect(s.ch).toBe(4);
    expect(s.log).toEqual([]);
    c.career!.term = 3;
    expect(beginStory(c).ch).toBe(5);
    expect(openChapter(c.career!)).toBeNull();
  });
});

describe('a story across parliaments', () => {
  it('goes with the career into the next term, with its log and what the player has been shown', () => {
    const c = natCareer();
    expect(toBeat(c)).toBe(true);
    answer(nat, c, 0);
    c.career!.week = TERM_WEEKS;
    termWeek(nat, c);
    while (c.phase === 'campaign') endWeek(nat, c);
    closeNight(nat, c);
    for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(nat, c);
    expect(nextTerm(nat, c)).toBe(true);
    const s = c.career!.story!;
    expect(s.log).toHaveLength(1);
    expect(s.ch).toBe(1);
    expect(s.log[0].beat).toBe('natInheritance');
    expect(c.career!.flags).toContain('sb:natInheritance:0');
    // The beats of the old parliament are not asked again: the story only moves on.
    expect(answerOf(c.career!, 'natInheritance')).toBe(0);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), nat)).toBe(true);
    const broken = JSON.parse(JSON.stringify(c));
    broken.career.story.log[0].pick = 7;
    expect(isValidCampaign(broken, nat)).toBe(false);
    // A save from before stories has none, and is still a campaign.
    const old = JSON.parse(JSON.stringify(c));
    delete old.career.story;
    expect(isValidCampaign(old, nat)).toBe(true);
    // A line about what is coming is on the news.
    expect(c.news.some((n) => n.key === `story.${openChapter(c.career!)!.id}.hook`)).toBe(true);
  });

  it('says nothing of what is coming before the first chapter has closed', () => {
    const c = natCareer();
    c.news = [];
    cliffhanger(c);
    expect(c.news).toHaveLength(0);
  });
});

describe('the three stories, played through the first chapter', () => {
  it('raise their first beat for a state and for a founded party too', () => {
    const s = stateCareer('melaka');
    expect(toBeat(s, getWorld('career:melaka')!)).toBe(true);
    expect(s.inbox[0].event).toBe('stateKeys');
    const f = founded();
    expect(toBeat(f, foundedWorld())).toBe(true);
    expect(f.inbox[0].event).toBe('foundHall');
    answer(foundedWorld(), f, 2);
    expect(f.career!.story!.log[0]).toMatchObject({ beat: 'foundHall', pick: 2 });
  });
});

/** Plays a career on, answering whatever comes up with the first answer and the story's beats with `pick`, for up to `terms` parliaments. */
function playOn(c: Campaign, pick: number, terms: number): string[] {
  const told: string[] = [];
  for (let term = 1; term <= terms && !c.career!.ending; term++) {
    const w = () => worldOf(c)!;
    for (let g = 0; c.phase !== 'campaign' && g < 800 && !c.career!.ending; g++) {
      if (c.phase === 'formation') { endDay(w(), c); continue; }
      if (c.phase === 'done') { resumeTerm(c); continue; }
      skipAhead(w(), c, 400);
      while (c.inbox.length) {
        const scene = c.inbox.shift()!;
        const mine = !!scene.event && scene.event in BEAT_STYLES;
        if (mine) told.push(scene.event!);
        answerEvent(w(), c, scene, mine ? pick : 0);
      }
    }
    if (c.career!.ending) break;
    while (c.phase === 'campaign') endWeek(w(), c);
    closeNight(w(), c);
    for (let d = 0; d < 12 && c.phase === 'formation'; d++) endDay(w(), c);
    nextTerm(w(), c);
  }
  return told;
}

describe('a career played on', () => {
  it.each([
    ['the country, in government', () => natCareer(PS, 21), 'nat'],
    ['the country, in opposition', () => natCareer(PT, 21), 'nat'],
    ['a state', () => stateCareer('penang'), 'state'],
    ['a founded party', () => founded(), 'founded'],
  ] as const)('tells all five chapters of the story in its first two parliaments: %s', (_, make, arc) => {
    for (const pick of [0, 1, 2]) {
      const c = make();
      const told = playOn(c, pick, 2);
      const s = c.career!.story!;
      expect(s.arc).toBe(arc);
      // Whatever the answers, nothing is told twice or out of order, and the story ends in the second parliament at the latest.
      expect(JSON.stringify(c.career!.ending) + told.join(), `pick ${pick}`).toBe('null' + told.join());
      expect(told, `pick ${pick}`).toHaveLength(5);
      expect(s.log.map((e) => e.ch)).toEqual([0, 1, 2, 3, 4]);
      expect(s.log.map((e) => e.beat)).toEqual(told);
      expect(s.log.every((e) => e.pick === pick)).toBe(true);
      expect(s.ch).toBe(5);
      expect(openChapter(c.career!)).toBeNull();
      expect(s.log[4].term).toBeLessThanOrEqual(2);
    }
  }, 120_000);
});
