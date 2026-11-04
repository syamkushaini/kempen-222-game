-- The Career Campaign leaderboard: each player's highest level. Run once: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
-- It uses the same project, address and public key as the other tables (see leaderboard.sql). One row for each player (a random id kept
-- in the player's browser); the game updates the row as the level rises, and the table refuses a lower level, so a row never goes down.

create table if not exists public.journey_levels (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  player      text not null unique check (char_length(player) between 8 and 64),
  name        text not null check (char_length(name) between 2 and 24),
  party       text not null default 'genba' check (party in ('ps', 'bp', 'pt', 'gbk', 'gbs', 'legasi', 'oth', 'genba', 'cahaya', 'suara')),
  level       int not null check (level between 1 and 53),
  governed    int not null check (governed between 0 and 13),
  version     text check (version is null or char_length(version) <= 32)
);

create index if not exists journey_levels_rank on public.journey_levels (level desc, governed desc, updated_at asc);

create or replace function public.journey_levels_only_up() returns trigger language plpgsql as $$
begin
  if new.level < old.level or new.governed < old.governed then
    raise exception 'a level cannot go down';
  end if;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists journey_levels_only_up on public.journey_levels;
create trigger journey_levels_only_up before update on public.journey_levels for each row execute function public.journey_levels_only_up();

alter table public.journey_levels enable row level security;
drop policy if exists "anyone can read the levels" on public.journey_levels;
create policy "anyone can read the levels" on public.journey_levels for select to anon using (true);
drop policy if exists "anyone can post a level" on public.journey_levels;
create policy "anyone can post a level" on public.journey_levels for insert to anon with check (true);
drop policy if exists "a level can be raised" on public.journey_levels;
create policy "a level can be raised" on public.journey_levels for update to anon using (true) with check (true);

-- The player column is never read back by the game, so a row can be raised only by whoever holds that id.
revoke all on public.journey_levels from anon;
grant select (id, created_at, updated_at, name, party, level, governed) on public.journey_levels to anon;
grant insert, update on public.journey_levels to anon;
