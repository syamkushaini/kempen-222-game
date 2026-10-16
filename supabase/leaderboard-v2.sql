-- Run this once on a leaderboard that was set up before the score lost its ceiling of 100:
-- Supabase dashboard -> SQL Editor -> New query -> paste -> Run. A board set up from the current leaderboard.sql does not need it.
--
-- What it does: widens the score to 0-10000, and marks every row already in the table as version 1 (the old score out of 100). The game
-- posts version 2 and shows only version 2, so the old rows stay in the table and are not ranked against the new scores.
-- To bring the old ones back or remove them, use the dashboard (Table Editor -> scores).

alter table public.scores add column if not exists score_version int not null default 1;
alter table public.scores alter column score_version set default 2;
alter table public.scores drop constraint if exists scores_score_check;
alter table public.scores add constraint scores_score_check check (score between 0 and 10000);
alter table public.scores drop constraint if exists scores_score_version_check;
alter table public.scores add constraint scores_score_version_check check (score_version in (1, 2));
create index if not exists scores_version_rank on public.scores (score_version, difficulty, mode, score desc, victories desc, years desc);
