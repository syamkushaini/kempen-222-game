import { useState } from 'react';
import type { StringKey } from '../i18n/strings';
import { figuresOf, sectorShares, startFigures } from '../sim/campaign/gdp';
import { careerYears } from '../sim/campaign/legacy';
import { ministerName } from '../sim/campaign/office';
import { SECTOR_IDS } from '../sim/campaign/sectors';
import { inStateCareer } from '../sim/campaign/statepowers';
import type { Campaign, PortfolioId } from '../sim/campaign/types';
import type { World } from '../sim/election';
import { useStore } from '../state/store';
import { leaderPortrait, ministerPortrait } from './faces';
import { contestName, leaderName, partyColor, partyName, useFormat, useT, useWorld, type Format, type T } from './hooks';
import { paintedLeader } from './painted';
import { drawCabinetChart, drawEconomy, drawFrontPage, type CabinetChart, type EconomyInfographic, type FrontPage, type Person } from './infographics';
import { common, ShareDialog, type Drawn } from './ShareDialog';

/** What the player may show off. */
export type BragKind = 'cabinet' | 'economy' | 'record';

const SECTOR_COLOR = { oil: '#e08e0b', electronics: '#3b82f6', teal: '#14b8a6', farming: '#84cc16' };
const colorOfSector = (id: (typeof SECTOR_IDS)[number]) => (id === 'tourism' ? SECTOR_COLOR.teal : SECTOR_COLOR[id]);

/** The branch of government each post hangs from on the chart. */
const BRANCH: Record<PortfolioId, 'economy' | 'people' | 'security' | 'build'> = {
  finance: 'economy', economy: 'economy', costOfLiving: 'economy', agri: 'economy', plantation: 'economy', energy: 'economy', tourism: 'economy',
  education: 'people', highered: 'people', health: 'people', humanRes: 'people', women: 'people', youth: 'people', religion: 'people',
  home: 'security', defence: 'security', foreign: 'security', law: 'security',
  rural: 'build', works: 'build', housing: 'build', digital: 'build', science: 'build', comms: 'build', environment: 'build',
};
const BRANCHES = ['economy', 'people', 'security', 'build'] as const;

const leaderFace = (p: number) => paintedLeader(p) ?? leaderPortrait(p) ?? undefined;
const kicker = (t: T, world: World, c: Campaign) => `${contestName(t, world)} · ${t('share.term', { n: c.career!.term })}`;

/** Whether the player's party has anyone at the cabinet table: a government's party, or a partner in it. */
export const hasCabinetSeat = (c: Campaign): boolean => !!c.career?.cabinet.some((m) => m.party === c.player);

/** The cabinet as an organisation chart: the head of government on top, the posts in branches beneath. */
export function cabinetPicture(t: T, world: World, c: Campaign): Drawn {
  const k = c.career!;
  const me = c.player;
  const all = k.cabinet;
  const person = (m: (typeof all)[number]): Person => ({
    post: t(`portfolio.${m.portfolio}` as StringKey), name: ministerName(m), stars: m.skill, color: partyColor(m.party),
    portrait: ministerPortrait(m.name, m.party), mine: m.party === me,
  });
  const branches = BRANCHES.map((b) => ({ title: t(`brag.branch.${b}` as StringKey), people: all.filter((m) => BRANCH[m.portfolio] === b).map(person) })).filter((b) => b.people.length > 0);
  const mine = all.filter((m) => m.party === me).length;
  const stars = all.length ? all.reduce((a, m) => a + m.skill, 0) / all.length : 0;
  const pm = k.government.pm ?? me;
  const post = t(inStateCareer(c) ? 'brag.cabinet.head.post' : 'brag.cabinet.head.post.pm');
  const chart: CabinetChart = {
    ...common(t), accent: partyColor(me), title: t('brag.cabinet.title'), kicker: kicker(t, world, c),
    head: { post, name: leaderName(t, pm), sub: t('brag.cabinet.head.sub', { party: partyName(t, pm) }), stars: 5, color: partyColor(pm), portrait: leaderFace(pm) },
    branches,
    facts: [
      { label: t('brag.cabinet.ministers'), value: String(all.length) },
      { label: t('brag.cabinet.ours'), value: String(mine) },
      { label: t('brag.cabinet.skill'), value: stars.toFixed(1) },
      { label: t('brag.cabinet.parties'), value: String(new Set(all.map((m) => m.party)).size) },
    ],
  };
  const title = t('brag.cabinet.title');
  return { headline: title, text: t('brag.cabinet.text', { title, party: partyName(t, me), n: all.length, mine, tag: t('brag.tag') }), draw: (el) => drawCabinetChart(el, chart) };
}

/** The economy as an infographic: its size, its years, its sectors and the figures it is judged on. */
export function economyPicture(t: T, f: Format, world: World, c: Campaign): Drawn {
  const k = c.career!;
  const e = k.economy;
  const now = figuresOf(world, k);
  const shares = sectorShares(world, k);
  const mood = e.growth >= 4 ? 'boom' : e.growth >= 2 ? 'steady' : 'testing';
  const title = t(`brag.eco.${mood}` as StringKey);
  const pct = (n: number, d = 1) => `${n.toFixed(d)}%`;
  const points = (k.reports ?? []).map((r) => ({ label: String(r.year), value: r.gdp }));
  // Before the first yearly announcement there is only the start and now.
  if (points.length < 2) points.splice(0, points.length, { label: t('brag.eco.start'), value: startFigures(world).gdp }, { label: t('brag.eco.now'), value: now.gdp });
  const info: EconomyInfographic = {
    ...common(t), accent: partyColor(c.player), title, kicker: `${partyName(t, c.player)} · ${kicker(t, world, c)}`,
    gdp: { value: f.rm(now.gdp), label: t('house.gdp') },
    chips: [
      { label: t('house.perCapita'), value: f.rm(now.perCapita) },
      { label: t('brag.eco.population'), value: `${(now.population / 1_000_000).toFixed(2)}m` },
      { label: t('brag.eco.growth'), value: pct(e.growth) },
    ],
    trend: { title: t('brag.eco.trend'), points },
    sectors: { title: t('brag.eco.sectors'), parts: SECTOR_IDS.map((id) => ({ label: t(`sector.${id}`), share: shares[id], color: colorOfSector(id) })) },
    gauges: {
      title: t('brag.eco.gauges'),
      items: [
        { label: t('brag.eco.growth'), value: pct(e.growth), frac: e.growth / 8, good: e.growth >= 3 },
        { label: t('brag.eco.jobless'), value: pct(e.jobless), frac: e.jobless / 10, good: e.jobless < 5 },
        { label: t('brag.eco.inflation'), value: pct(e.inflation), frac: e.inflation / 8, good: e.inflation < 3 },
        { label: t('brag.eco.debt'), value: pct(e.debt, 0), frac: e.debt / 100, good: e.debt < 60 },
      ],
    },
    note: t('brag.eco.note', { growth: pct(e.growth), jobless: pct(e.jobless), inflation: pct(e.inflation), debt: pct(e.debt, 0) }),
  };
  return { headline: title, text: t('brag.eco.text', { title, gdp: f.rm(now.gdp), perCapita: f.rm(now.perCapita), growth: pct(e.growth), tag: t('brag.tag') }), draw: (el) => drawEconomy(el, info) };
}

/** The record as the front page of a newspaper. */
export function recordPicture(t: T, world: World, c: Campaign): Drawn {
  const k = c.career!;
  const r = k.record;
  const years = careerYears(c).toFixed(1);
  const laws = k.laws?.length ?? 0;
  const party = partyName(t, c.player);
  const headline = t(r.kept.length > 0 ? 'brag.paper.headline' : 'brag.paper.headline.none', { party, kept: r.kept.length });
  const page: FrontPage = {
    ...common(t), accent: partyColor(c.player), paper: t('brag.paper.name'), dateline: `${kicker(t, world, c)} · ${t('share.legacy.sub', { party, years })}`,
    headline, standfirst: t('brag.paper.standfirst', { years, elections: r.elections, laws }),
    portrait: leaderFace(c.player), caption: t('brag.paper.caption', { name: leaderName(t, c.player), party, elections: r.elections }),
    chart: r.terms?.length ? { title: t('brag.paper.chart'), bars: r.terms.slice(-6).map((x, i, all) => ({ label: t('brag.paper.election', { n: r.terms!.length - all.length + i + 1 }), value: x.seats, won: x.pm })) } : undefined,
    numbers: {
      title: t('brag.paper.numbers'),
      items: [
        { label: t('house.record.kept'), value: String(r.kept.length) },
        { label: t('house.record.pm'), value: (r.weeksPm / 52).toFixed(1) },
        { label: t('brag.paper.best'), value: String(r.bestSeats) },
        { label: t('brag.paper.laws'), value: String(laws) },
      ],
    },
  };
  return { headline, text: t('brag.paper.text', { headline, years, elections: r.elections, laws, tag: t('brag.tag') }), draw: (el) => drawFrontPage(el, page) };
}

/** A button that opens the picture of one thing the player may be proud of. */
export function BragButton({ kind }: { kind: BragKind }) {
  const t = useT();
  const f = useFormat();
  const world = useWorld();
  const campaign = useStore((s) => s.game!.campaign);
  // The picture is made once, when the button is pressed: a dialog that gets a new one every render would draw again every time.
  const [picture, setPicture] = useState<Drawn | null>(null);
  const open = () => setPicture(kind === 'cabinet' ? cabinetPicture(t, world, campaign) : kind === 'economy' ? economyPicture(t, f, world, campaign) : recordPicture(t, world, campaign));
  return (
    <>
      <button className="btn small" onClick={open}>{t(`brag.button.${kind}` as StringKey)}</button>
      {picture && <ShareDialog data={picture} onClose={() => setPicture(null)} />}
    </>
  );
}
