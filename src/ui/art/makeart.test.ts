import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { allScenes } from './scenes';
import { promptFor } from './prompts';

// The script that has Gemini draw the pictures, tried against a small server of our own that answers as the real one does.
const script = '../../../scripts/make-art.mjs';
const load = async () => (await import(/* @vite-ignore */ new URL(script, import.meta.url).href)) as {
  main(argv: string[], env: Record<string, string | undefined>, log: (s: string) => void): Promise<{ drawn: number; failed: string[] }>;
  compose(title: string, body: string): string;
  parseArgs(argv: string[]): { only: string[] | null; limit: number; force: boolean; dry: boolean; concurrency: number };
  manifestOf(dir: string): Record<string, string>;
};

/** A real PNG, 64 by 36, in one flat colour. */
function png(): Buffer {
  const crc = (buf: Buffer) => { let c = ~0; for (const b of buf) { c ^= b; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return ~c >>> 0; };
  const chunk = (type: string, data: Buffer) => { const t = Buffer.concat([Buffer.from(type), data]); const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const sum = Buffer.alloc(4); sum.writeUInt32BE(crc(t)); return Buffer.concat([len, t, sum]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(64, 0); ihdr.writeUInt32BE(36, 4); ihdr[8] = 8; ihdr[9] = 2;
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(64 * 3, 200)]);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(Buffer.concat(Array.from({ length: 36 }, () => row)))), chunk('IEND', Buffer.alloc(0))]);
}

let server: ReturnType<typeof createServer>;
let base = '';
const seen: { key: string | undefined; prompt: string; model: string }[] = [];
beforeAll(async () => {
  server = createServer((req, res) => {
    let raw = '';
    req.on('data', (d) => (raw += d));
    req.on('end', () => {
      const prompt = JSON.parse(raw).contents[0].parts[0].text as string;
      seen.push({ key: req.headers['x-goog-api-key'] as string | undefined, prompt, model: /models\/([^:]+):/.exec(req.url ?? '')?.[1] ?? '' });
      res.setHeader('content-type', 'application/json');
      if (prompt.includes('A refused moment')) return void res.end(JSON.stringify({ promptFeedback: { blockReason: 'SAFETY' } }));
      res.end(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'here' }, { inlineData: { mimeType: 'image/png', data: png().toString('base64') } }] } }] }));
    });
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
afterAll(() => { server.close(); });

describe('the script that has Gemini draw the pictures', () => {
  it('puts a decision to the model exactly as the game words it', async () => {
    const { compose } = await load();
    for (const [id, s] of Object.entries(allScenes()).slice(0, 40)) expect(compose(s.title, s.body), id).toBe(promptFor(s.title, s.body));
  });

  it('reads its options', async () => {
    const { parseArgs } = await load();
    expect(parseArgs(['--only', 'flood,budget', '--limit', '3', '--force', '--concurrency', '4'])).toMatchObject({ only: ['flood', 'budget'], limit: 3, force: true, concurrency: 4 });
    expect(() => parseArgs(['--nonsense'])).toThrow();
  });

  it('asks with the key in a header, saves what comes back, leaves what is drawn alone, and lists what is refused', async () => {
    const { main, manifestOf } = await load();
    const dir = mkdtempSync(join(tmpdir(), 'scenes-'));
    try {
      const lines: string[] = [];
      const first = await main(['--only', 'flood,budget', '--base', base, '--out', dir, '--failed', join(dir, 'failed.json')], { GEMINI_API_KEY: 'test-key' }, (l) => lines.push(l));
      expect(first.drawn).toBe(2);
      expect(Object.keys(manifestOf(dir)).sort()).toEqual(['budget', 'flood']);
      expect(JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'))).toEqual(manifestOf(dir));
      expect(seen.every((r) => r.key === 'test-key' && r.model === 'gemini-2.5-flash-image')).toBe(true);
      expect(seen.map((r) => r.prompt).join()).toContain('The monsoon floods');
      expect(lines.join('\n')).not.toContain('test-key');
      // A second run asks for nothing that is already there.
      const before = seen.length;
      const second = await main(['--only', 'flood,budget', '--base', base, '--out', dir, '--failed', join(dir, 'failed.json')], { GEMINI_API_KEY: 'test-key' }, () => {});
      expect(second.drawn).toBe(0);
      expect(seen.length).toBe(before);
      // --force draws again.
      expect((await main(['--only', 'flood', '--force', '--base', base, '--out', dir, '--failed', join(dir, 'failed.json')], { GEMINI_API_KEY: 'test-key' }, () => {})).drawn).toBe(1);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('lists what the model refuses, and goes on with the rest', async () => {
    const { main, manifestOf } = await load();
    const dir = mkdtempSync(join(tmpdir(), 'scenes-'));
    try {
      const spec = JSON.parse(readFileSync(new URL('../../../scripts/art/prompts.json', import.meta.url), 'utf8'));
      spec.scenes = { fine: { title: 'A fine moment', body: 'Nothing wrong.' }, bad: { title: 'A refused moment', body: 'Refused.' } };
      writeFileSync(join(dir, 'spec.json'), JSON.stringify(spec));
      const result = await main(['--prompts', join(dir, 'spec.json'), '--base', base, '--out', join(dir, 'out'), '--failed', join(dir, 'failed.json')], { GEMINI_API_KEY: 'k' }, () => {});
      expect(result).toEqual({ drawn: 1, failed: ['bad'] });
      expect(Object.keys(manifestOf(join(dir, 'out')))).toEqual(['fine']);
      expect(JSON.parse(readFileSync(join(dir, 'failed.json'), 'utf8')).bad).toMatch(/SAFETY/);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('will not run without a key, and says how to give one; a dry run asks for nothing', async () => {
    const { main } = await load();
    const dir = mkdtempSync(join(tmpdir(), 'scenes-'));
    try {
      await expect(main(['--only', 'flood', '--out', dir], {}, () => {})).rejects.toThrow(/GEMINI_API_KEY/);
      expect(existsSync(join(dir, 'flood.jpg'))).toBe(false);
      const before = seen.length;
      const out: string[] = [];
      await main(['--only', 'flood', '--dry', '--out', dir], {}, (l) => out.push(l));
      expect(out.join('\n')).toContain('The monsoon floods');
      expect(seen.length).toBe(before);
      await expect(main(['--only', 'noSuchThing', '--dry'], {}, () => {})).rejects.toThrow(/no such decision/);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});
