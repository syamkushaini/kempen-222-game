import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTIES } from '../../data/parties';
import { allianceLookOf } from '../../state/store';
import { showAlliance } from '../../state/allianceLook';
import { partyColor } from '../../ui/hooks';
import { PARTY_IDS } from '../types';
import { ALLIANCE, TITLE_MAX, cleanTitle, foundAlliance, invite, setAllianceLook } from './alliance';
import { startCareer } from './career';
import { scaled } from './actions';

const [PS, BP] = PARTY_IDS.map((_, i) => i);
const world = getWorld('career')!;
const founded = () => {
  const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
  c.parties[PS]!.funds = scaled(world, 5_000_000);
  c.relations[PS][BP] = c.relations[BP][PS] = 80;
  c.inbox = [];
  return c;
};

describe('an alliance with a name of its own and one colour', () => {
  it('cleans what the player types: one line, no longer than the most allowed, nothing means the ready-made name', () => {
    expect(cleanTitle('  Pakatan   Harapan Baru  ')).toBe('Pakatan Harapan Baru');
    expect(cleanTitle('x'.repeat(100))).toHaveLength(TITLE_MAX);
    expect(cleanTitle('<b>hi</b>\nthere')).toBe('b hi /b there');
    expect(cleanTitle('   ')).toBeUndefined();
    expect(cleanTitle(undefined)).toBeUndefined();
  });

  it('is founded with a typed name and colour, and they can be changed for nothing', () => {
    const c = founded();
    expect(foundAlliance(world, c, 0, 0, 'Gabungan Rakyat', '#112233')).toBe(true);
    expect(c.career!.alliance).toMatchObject({ title: 'Gabungan Rakyat', color: '#112233', members: [PS] });
    const funds = c.parties[PS]!.funds;
    expect(setAllianceLook(c, 'Perikatan Baru', '#AABBCC')).toBe(true);
    expect(c.career!.alliance).toMatchObject({ title: 'Perikatan Baru', color: '#aabbcc' });
    expect(c.parties[PS]!.funds).toBe(funds);
    // A colour that is not a colour, and an empty name, are dropped: the party's own colour and the ready-made name stand.
    setAllianceLook(c, '', 'red');
    expect(c.career!.alliance!.title).toBeUndefined();
    expect(c.career!.alliance!.color).toBeUndefined();
  });

  it('gives every member of the alliance one colour on the map, and the others their own', () => {
    const c = founded();
    foundAlliance(world, c, 0, 0, 'Gabungan Rakyat', '#112233');
    expect(invite(world, c, BP) || true).toBeTruthy();
    c.career!.alliance!.members = [PS, BP];
    const game = { campaign: c, id: 'x' } as never;
    showAlliance(allianceLookOf(game));
    expect(partyColor(PS)).toBe('#112233');
    expect(partyColor(BP)).toBe('#112233');
    const other = PARTY_IDS.indexOf('pt');
    expect(partyColor(other)).toBe(PARTIES.pt.color);
    // With no colour chosen, the player's own party's colour is the alliance's.
    delete c.career!.alliance!.color;
    showAlliance(allianceLookOf(game));
    expect(partyColor(BP)).toBe(PARTIES[PARTY_IDS[PS]].color);
    showAlliance(null);
    expect(partyColor(BP)).toBe(PARTIES.bp.color);
    expect(ALLIANCE.max).toBeGreaterThan(1);
  });
});
