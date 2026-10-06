import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// The version people quote in a bug report: the release number and the commit it was built from.
const version = (() => {
  const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
  try { return `${version}+${execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()}`; } catch { return version as string; }
})();

export default defineConfig({
  // Relative base so the build works from any static host or sub-path.
  base: './',
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(version) },
  // The map boundaries are one large chunk, loaded on demand.
  build: { chunkSizeWarningLimit: 900 },
  // The game fetches a state's results when first wanted; the tests have them all from the start.
  test: { environment: 'node', include: ['src/**/*.test.ts'], setupFiles: ['src/data/allStates.ts'] },
});
