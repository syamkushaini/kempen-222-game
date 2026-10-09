#!/usr/bin/env node
// Draws the picture of every decision with Gemini, so that it can stand in for the sketch the game draws by itself.
//
//   export GEMINI_API_KEY=...            (in your own terminal; the key is read from the environment and never written anywhere)
//   node scripts/make-art.mjs --only flood,budget --force   (try a few first)
//   node scripts/make-art.mjs                                (everything that is not yet drawn)
//
// It reads scripts/art/prompts.json (kept in step with the game's own words by a test), asks the model for a 16:9 picture of each
// decision, shrinks it to a JPEG of 960 pixels across with the macOS `sips` tool (without it, the picture is kept as it comes), and
// puts it in public/scenes/<id>.jpg with a manifest the game reads. A picture already there is left alone unless --force is given,
// so the run can be stopped and started again. Pictures that fail or are refused are listed in scripts/art/failed.json.
//
//   --only a,b      only these decisions (ids as in prompts.json)
//   --limit N       at most N pictures this run
//   --force         draw again even if a picture is there
//   --dry           print what would be asked, and send nothing
//   --model NAME    the model (default gemini-2.5-flash-image)
//   --concurrency N pictures asked for at once (default 2)
//   --width N       width of the finished JPEG (default 960)
//   --quality N     JPEG quality, 1 to 100 (default 60: these line drawings run to about 200 KB a picture)
//   --base URL      another API address, for testing
//   --out DIR       where the pictures go (default public/scenes)
//   --prompts FILE  other words than scripts/art/prompts.json, for testing
//   --failed FILE   where refused pictures are listed (default scripts/art/failed.json)

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..');
const readSpec = (file) => JSON.parse(readFileSync(file, 'utf8'));
export const SPEC = readSpec(join(here, 'art', 'prompts.json'));

/** The words for one decision, put together as the game's own prompts.ts puts them. */
export const compose = (title, body, spec = SPEC) => `${spec.style}\n\n${spec.lead} "${title}": ${body}\n${spec.tail}\n${spec.avoid}`;

export function parseArgs(argv) {
  const o = { only: null, limit: Infinity, force: false, dry: false, model: 'gemini-2.5-flash-image', concurrency: 2, width: 960, quality: 60, base: 'https://generativelanguage.googleapis.com', out: join(ROOT, 'public', 'scenes'), prompts: null, failed: join(here, 'art', 'failed.json') };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--only') o.only = next().split(',').map((x) => x.trim()).filter(Boolean);
    else if (a === '--limit') o.limit = Number(next());
    else if (a === '--force') o.force = true;
    else if (a === '--dry') o.dry = true;
    else if (a === '--model') o.model = next();
    else if (a === '--concurrency') o.concurrency = Math.max(1, Number(next()));
    else if (a === '--width') o.width = Number(next());
    else if (a === '--quality') o.quality = Number(next());
    else if (a === '--base') o.base = next();
    else if (a === '--out') o.out = next();
    else if (a === '--prompts') o.prompts = next();
    else if (a === '--failed') o.failed = next();
    else throw new Error(`unknown option ${a}`);
  }
  return o;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Asks for one picture. Returns { mime, data (a Buffer) } or { refused: reason }. Retries what is worth retrying. */
export async function draw(prompt, opts, key) {
  const url = `${opts.base}/v1beta/models/${opts.model}:generateContent`;
  const body = (withAspect) => JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'], ...(withAspect ? { imageConfig: { aspectRatio: '16:9' } } : {}) },
  });
  let withAspect = true;
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key }, body: body(withAspect) });
    if (res.status === 400 && withAspect) { withAspect = false; continue; }
    if (res.status === 429 || res.status >= 500) {
      const wait = Number(res.headers.get('retry-after')) * 1000 || 2000 * 2 ** attempt;
      await sleep(wait);
      continue;
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { refused: `HTTP ${res.status}: ${json.error?.message ?? 'no message'}` };
    if (json.promptFeedback?.blockReason) return { refused: `blocked: ${json.promptFeedback.blockReason}` };
    const parts = json.candidates?.[0]?.content?.parts ?? [];
    const image = parts.find((p) => p.inlineData?.data);
    if (image) return { mime: image.inlineData.mimeType ?? 'image/png', data: Buffer.from(image.inlineData.data, 'base64') };
    return { refused: `no picture came back (${json.candidates?.[0]?.finishReason ?? 'no reason given'})` };
  }
  return { refused: 'the service stayed busy after five tries' };
}

/** The pictures already in a folder, as the manifest the game reads. */
export function manifestOf(dir) {
  const out = {};
  for (const f of readdirSync(dir).sort()) {
    const m = /^(.+)\.(jpg|png|webp)$/.exec(f);
    if (m) out[m[1]] = f;
  }
  return out;
}

/** Shrinks a picture to a JPEG of the width asked for; without sips the picture is kept as it came. Returns the file name. */
export function finish(raw, mime, dir, id, width, quality = 60) {
  const ext = mime.includes('jpeg') ? 'jpg' : mime.includes('webp') ? 'webp' : 'png';
  const tmp = join(dir, `.${id}.${ext}`);
  writeFileSync(tmp, raw);
  try {
    const out = join(dir, `${id}.jpg`);
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(quality), '--resampleWidth', String(width), tmp, '--out', out], { stdio: 'ignore' });
    execFileSync('rm', ['-f', tmp]);
    return `${id}.jpg`;
  } catch {
    const kept = join(dir, `${id}.${ext}`);
    execFileSync('mv', [tmp, kept]);
    return `${id}.${ext}`;
  }
}

export async function main(argv, env = process.env, log = console.log) {
  const opts = parseArgs(argv);
  const key = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
  const spec = opts.prompts ? readSpec(opts.prompts) : SPEC;
  const ids = Object.keys(spec.scenes).filter((id) => !opts.only || opts.only.includes(id));
  if (opts.only) for (const id of opts.only) if (!spec.scenes[id]) throw new Error(`no such decision: ${id}`);
  const have = existsSync(opts.out) ? manifestOf(opts.out) : {};
  const todo = ids.filter((id) => opts.force || !have[id]).slice(0, opts.limit);
  log(`${ids.length} decisions, ${Object.keys(have).length} pictures already, ${todo.length} to draw with ${opts.model}`);
  if (opts.dry) { for (const id of todo) log(`\n== ${id}\n${compose(spec.scenes[id].title, spec.scenes[id].body, spec)}`); return { drawn: 0, failed: [] }; }
  if (todo.length === 0) return { drawn: 0, failed: [] };
  if (!key) throw new Error('No key: put it in the environment first, in your own terminal:  export GEMINI_API_KEY=...');
  mkdirSync(opts.out, { recursive: true });
  const failedFile = opts.failed;
  const failed = existsSync(failedFile) ? JSON.parse(readFileSync(failedFile, 'utf8')) : {};
  let drawn = 0, next = 0, bytes = 0;
  const worker = async () => {
    while (next < todo.length) {
      const id = todo[next++];
      const { title, body } = spec.scenes[id];
      const result = await draw(compose(title, body, spec), opts, key);
      if (result.refused) { failed[id] = result.refused; log(`  ✗ ${id}: ${result.refused}`); continue; }
      const file = finish(result.data, result.mime, opts.out, id, opts.width, opts.quality);
      delete failed[id];
      drawn++; bytes += result.data.length;
      log(`  ✓ ${id} → ${file} (${Math.round(result.data.length / 1024)} KB as drawn) [${drawn}/${todo.length}]`);
      writeFileSync(join(opts.out, 'manifest.json'), JSON.stringify(manifestOf(opts.out), null, 1) + '\n');
    }
  };
  await Promise.all(Array.from({ length: opts.concurrency }, worker));
  writeFileSync(join(opts.out, 'manifest.json'), JSON.stringify(manifestOf(opts.out), null, 1) + '\n');
  mkdirSync(dirname(failedFile), { recursive: true });
  writeFileSync(failedFile, JSON.stringify(failed, null, 1) + '\n');
  log(`\nDone: ${drawn} drawn, ${Object.keys(failed).length} on the failed list (scripts/art/failed.json). ${Math.round(bytes / 1024 / 1024)} MB as drawn.`);
  return { drawn, failed: Object.keys(failed) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((e) => { console.error(String(e.message ?? e)); process.exit(1); });
}
