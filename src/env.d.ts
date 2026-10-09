/** Set at build time in vite.config.ts: the release number and the commit. */
declare const __APP_VERSION__: string;

/** Where the leaderboard lives (see supabase/leaderboard.sql). Both are public by design; without them the game has no leaderboard. */
interface ImportMetaEnv {
  readonly VITE_LEADERBOARD_URL?: string;
  readonly VITE_LEADERBOARD_KEY?: string;
}
