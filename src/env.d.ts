/** Set at build time in vite.config.ts: the release number and the commit. */
declare const __APP_VERSION__: string;

/** Where the leaderboard and the cloud saves live (see supabase/leaderboard.sql and cloud-saves.sql). Both are public by design; without them the game has neither. */
interface ImportMetaEnv {
  readonly VITE_LEADERBOARD_URL?: string;
  readonly VITE_LEADERBOARD_KEY?: string;
}
