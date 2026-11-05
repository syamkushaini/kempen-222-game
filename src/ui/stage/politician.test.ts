import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PEOPLE_EN } from '../../i18n/people';
import { ADVISER_LOOK, LEADER_LOOKS, MINISTER_LOOKS, isMaleLook, type Look } from '../faces';

/** The JSON part of a .glb file, which can be read without decoding the model. */
function glbJson(path: string): { nodes: { name?: string }[]; skins?: { joints: number[] }[]; animations?: unknown[]; extensionsRequired?: string[]; asset: { extras?: Record<string, string> } } {
  const buf = readFileSync(join(process.cwd(), path));
  expect(buf.toString('ascii', 0, 4)).toBe('glTF');
  const len = buf.readUInt32LE(12);
  return JSON.parse(buf.toString('utf8', 20, 20 + len));
}

describe('who counts as a male politician', () => {
  const look = (wear: Look['wear'], extra: Partial<Look> = {}): Look => ({ skin: 1, hair: 'short', hairColor: 'black', wear, ...extra });
  it('is a man in a suit, or in a baju with a songkok or facial hair, and nobody else', () => {
    expect(isMaleLook(look('suit'))).toBe(true);
    expect(isMaleLook(look('baju', { headwear: 'songkok' }))).toBe(true);
    expect(isMaleLook(look('baju', { facial: 'moustache' }))).toBe(true);
    expect(isMaleLook(look('baju'))).toBe(false);
    expect(isMaleLook(look('baju', { headwear: 'scarf' }))).toBe(false);
    expect(isMaleLook(look('blouse'))).toBe(false);
    expect(isMaleLook(ADVISER_LOOK)).toBe(false);
  });
  it('picks out some of the game’s leaders and ministers but not all of them', () => {
    const all = [...Object.values(LEADER_LOOKS), ...MINISTER_LOOKS];
    const men = all.filter(isMaleLook).length;
    expect(men).toBeGreaterThan(5);
    expect(men).toBeLessThan(all.length);
  });
});

describe('the model of the male politician', () => {
  const g = glbJson('public/models/politician.glb');
  const bones = new Set(g.skins![0].joints.map((j) => (g.nodes[j].name ?? '').replace(/_\d+$/, '')));
  it('has every bone the animator moves', () => {
    for (const name of ['Hips', 'Spine1', 'Spine2', 'Neck', 'Head', 'HeadTop_End',
      'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand',
      'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'RightUpLeg', 'RightLeg', 'RightFoot', 'LeftToe_End']) expect(bones.has(name), name).toBe(true);
  });
  it('is small enough for the web, and carries no clip of its own', () => {
    const size = readFileSync(join(process.cwd(), 'public/models/politician.glb')).length;
    expect(size).toBeLessThan(1_500_000);
    expect(g.animations ?? []).toHaveLength(0);
    expect(g.extensionsRequired).toContain('EXT_meshopt_compression');
  });
  it('keeps its author and licence inside the file, as the licence asks', () => {
    const extras = (g as unknown as { extras?: Record<string, string> }).extras ?? g.asset.extras ?? {};
    expect(extras.author).toContain('Pixel_Monster');
    expect(extras.license).toContain('CC-BY-4.0');
    expect(extras.source).toContain('sketchfab.com');
  });
  it('is credited in the game, in both languages', () => {
    expect(readFileSync(join(process.cwd(), 'src/i18n/strings.ts'), 'utf8').match(/'credits\.model'/g)).toHaveLength(2);
    expect(Object.keys(PEOPLE_EN).length).toBeGreaterThan(0);
  });
});

describe('the ballot box model', () => {
  const g = glbJson('public/models/ballot-box.glb');
  it('is one small model, with its body, lid, label and seal', () => {
    expect(readFileSync(join(process.cwd(), 'public/models/ballot-box.glb')).length).toBeLessThan(100_000);
    expect(g.nodes).toHaveLength(1);
    expect((g as unknown as { meshes: { name: string; primitives: unknown[] }[] }).meshes[0].name).toBe('MalaysianBallotBox');
    expect((g as unknown as { meshes: { primitives: unknown[] }[] }).meshes[0].primitives.length).toBeGreaterThanOrEqual(9);
  });
  it('is listed in the credits file, with the politician', () => {
    const credits = readFileSync(join(process.cwd(), 'public/models/CREDITS.txt'), 'utf8');
    expect(credits).toContain('politician.glb');
    expect(credits).toContain('ballot-box.glb');
  });
});

describe('the voting booth model', () => {
  const g = glbJson('public/models/voting-booth.glb');
  it('is one small model with its table, screen, pencil, ballot paper and stamp', () => {
    expect(readFileSync(join(process.cwd(), 'public/models/voting-booth.glb')).length).toBeLessThan(100_000);
    const mats = ((g as unknown as { materials: { name: string }[] }).materials).map((m) => m.name);
    for (const name of ['table_top', 'cardboard', 'pencil_wood', 'ballot_paper', 'stamp_base', 'stamp_handle']) expect(mats, name).toContain(name);
  });
  it('is listed in the credits file', () => {
    expect(readFileSync(join(process.cwd(), 'public/models/CREDITS.txt'), 'utf8')).toContain('voting-booth.glb');
  });
});
