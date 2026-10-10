-- The challenge boards' table for Supabase: one table for every challenge, a challenge being told apart by its code
-- (a challenge a player made, such as 1~state:perlis~ps~668742559~h~fl~4) or by "set:<name>" (one of the game's own).
-- Run this once, like leaderboard.sql: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
-- It uses the same project address and public key as the career leaderboard: nothing else needs setting.
--
-- What the rules do: nobody can change or delete a row from the game, one game can be posted once (the "game" column is unique),
-- and every number must be one a real election can reach. They cannot stop someone who writes the request by hand from posting a
-- made-up result within these limits; to remove a row, delete it in the dashboard (Table Editor -> challenge_scores).

create table if not exists public.challenge_scores (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  game        text not null unique check (char_length(game) between 6 and 64),
  challenge   text not null check (char_length(challenge) between 4 and 80),
  name        text not null check (char_length(name) between 2 and 24),
  party       text not null check (party in ('ps', 'bp', 'pt', 'gbk', 'gbs', 'legasi', 'oth', 'genba', 'cahaya', 'suara')),
  difficulty  text not null check (difficulty in ('easy', 'normal', 'hard')),
  seats       int not null check (seats between 0 and 222),
  total_seats int not null check (total_seats between 1 and 222),
  vote_share  numeric(5, 4) not null check (vote_share between 0 and 1),
  points      int not null default 0 check (points between 0 and 300),
  met         boolean,
  version     text check (version is null or char_length(version) <= 32),
  check (seats <= total_seats)
);

-- A table made before there were points gets the column here; running this file again is safe.
alter table public.challenge_scores add column if not exists points int not null default 0 check (points between 0 and 300);

create index if not exists challenge_scores_points_rank on public.challenge_scores (challenge, points desc, seats desc, vote_share desc, created_at asc);

alter table public.challenge_scores enable row level security;

drop policy if exists "anyone can read the challenge boards" on public.challenge_scores;
create policy "anyone can read the challenge boards" on public.challenge_scores for select to anon using (true);

drop policy if exists "anyone can post a result" on public.challenge_scores;
create policy "anyone can post a result" on public.challenge_scores for insert to anon with check (true);

-- No update or delete policy exists, so none is allowed.
revoke all on public.challenge_scores from anon;
grant select, insert on public.challenge_scores to anon;
