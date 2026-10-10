-- The leaderboard's table for Supabase. Run this once: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
--
-- Then give the game the project's address and its PUBLIC ("anon") key, both under Project Settings -> API:
--   * on your computer: a file named .env.local in the game's folder, with the two lines
--       VITE_LEADERBOARD_URL=https://YOUR-PROJECT.supabase.co
--       VITE_LEADERBOARD_KEY=YOUR-ANON-KEY
--   * for the published game: GitHub -> the repository -> Settings -> Secrets and variables -> Actions -> Variables,
--     two variables named LEADERBOARD_URL and LEADERBOARD_KEY with the same two values.
-- The anon key is meant to be public: it can only do what the rules below allow, which is to read the table and to add a row.
-- Never put the project's service_role key anywhere in the game.
--
-- What the rules do: nobody can change or delete a row from the game, a career can be posted once (the "game" column is unique),
-- and every number must be one a real career can reach. They cannot stop someone who writes the request by hand from posting a
-- made-up career that is within these limits; to remove a row, delete it in the dashboard (Table Editor -> scores).
-- The lists of parties, legacies and endings are the game's own: src/state/leaderboard.test.ts checks that they have not drifted apart.

create table if not exists public.scores (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  game        text not null unique check (char_length(game) between 6 and 64),
  name        text not null check (char_length(name) between 2 and 24),
  party       text not null check (party in ('ps', 'bp', 'pt', 'gbk', 'gbs', 'legasi', 'oth', 'genba', 'cahaya', 'suara')),
  mode        text not null check (mode in ('federal', 'state')),
  state       text check (state is null or char_length(state) between 2 and 24),
  difficulty  text not null check (difficulty in ('easy', 'normal', 'hard')),
  kind        text not null check (kind in ('retired', 'ousted', 'wipedOut')),
  legacy      text not null check (legacy in ('statesman', 'reformer', 'survivor', 'promiser', 'plotter', 'premier', 'kingmaker', 'conscience', 'nearly', 'footnote')),
  score       int not null check (score between 0 and 100),
  years       numeric(5, 1) not null check (years between 0 and 150),
  years_pm    numeric(5, 1) not null check (years_pm between 0 and years),
  elections   int not null check (elections between 1 and 40),
  victories   int not null check (victories between 0 and elections),
  kept        int not null check (kept between 0 and 400),
  broken      int not null check (broken between 0 and 400),
  version     text check (version is null or char_length(version) <= 32),
  check ((mode = 'state') = (state is not null))
);

create index if not exists scores_rank on public.scores (score desc, victories desc, years desc, created_at asc);
create index if not exists scores_mode_rank on public.scores (mode, score desc, victories desc, years desc);
-- Each level of difficulty has a board of its own (the game asks for one level at a time).
create index if not exists scores_level_rank on public.scores (difficulty, mode, score desc, victories desc, years desc);

alter table public.scores enable row level security;

drop policy if exists "anyone can read the board" on public.scores;
create policy "anyone can read the board" on public.scores for select to anon using (true);

drop policy if exists "anyone can post a career" on public.scores;
create policy "anyone can post a career" on public.scores for insert to anon with check (true);

-- No update or delete policy exists, so none is allowed.
revoke all on public.scores from anon;
grant select, insert on public.scores to anon;
