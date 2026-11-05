-- The Career Campaign leaderboard: each player's highest level. Run once: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
-- It uses the same project, address and public key as the other tables (see leaderboard.sql). One row for each player (a random id kept
-- in the player's browser); the game updates the row as the level rises, and the table refuses a lower level, so a row never goes down.
-- A row carries the party the player made for the Career Campaign: its name, short name, colour and logo (one of the game's emblems).
-- The player's own uploaded pictures are never sent. Running this again is safe: it changes nothing that is already there.

create table if not exists public.journey_levels (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  player       text not null unique check (char_length(player) between 8 and 64),
  name         text not null check (char_length(name) between 2 and 24),
  party_name   text not null check (char_length(party_name) between 2 and 40),
  party_short  text not null check (char_length(party_short) between 1 and 6),
  party_color  text not null check (party_color ~ '^#[0-9a-f]{6}$'),
  emblem       text not null check (emblem in ('sun', 'torch', 'mountain', 'wave', 'paddy', 'star', 'tree', 'bridge')),
  level        int not null check (level between 1 and 53),
  governed     int not null check (governed between 0 and 13),
  version      text check (version is null or char_length(version) <= 32)
);

create index if not exists journey_levels_rank on public.journey_levels (level desc, governed desc, updated_at asc);

-- A level only goes up. The party may change (a player can rename their party), but the row keeps its first posting time.
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

-- The player column is never read back by the game, so a row can be raised only by whoever holds that id. For the same reason the public
-- key cannot write to the table itself (an "add or raise" needs to see that column): it posts through post_level below instead.
revoke all on public.journey_levels from anon;
grant select (id, created_at, updated_at, name, party_name, party_short, party_color, emblem, level, governed) on public.journey_levels to anon;

-- Adds a player's row, or raises it if the player is already on the board. It never lowers a level or the states governed: a lower number
-- sent later is ignored. The table's own checks still refuse anything that is not a valid row, and the function runs as the table's owner.
create or replace function public.post_level(
  p_player text, p_name text, p_party_name text, p_party_short text, p_party_color text, p_emblem text, p_level int, p_governed int, p_version text
) returns void language sql security definer set search_path = public as $$
  insert into public.journey_levels as j (player, name, party_name, party_short, party_color, emblem, level, governed, version)
  values (p_player, p_name, p_party_name, p_party_short, p_party_color, p_emblem, p_level, p_governed, p_version)
  on conflict (player) do update set
    name = excluded.name, party_name = excluded.party_name, party_short = excluded.party_short, party_color = excluded.party_color,
    emblem = excluded.emblem, version = excluded.version,
    level = greatest(j.level, excluded.level), governed = greatest(j.governed, excluded.governed);
$$;
revoke all on function public.post_level(text, text, text, text, text, text, int, int, text) from public;
grant execute on function public.post_level(text, text, text, text, text, text, int, int, text) to anon;
