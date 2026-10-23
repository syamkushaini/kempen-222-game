-- Cloud saves: a player who signs in with an e-mail address keeps a copy of their saved games here, so that a cleared browser, a
-- browser built into another app, or a new phone does not lose them.
--
-- Run this once: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
--
-- Then, in the same project:
--   1. Authentication -> Providers -> Email: switch it on. Leave "Confirm email" on.
--   2. Authentication -> Email Templates -> "Magic Link" (and "Confirm signup"): the game asks the player to type a code, not to follow a
--      link, so put the code in the message, for example:
--          <h2>Your Kempen 222 code</h2><p>Type this in the game: <b>{{ .Token }}</b></p>
--      Without {{ .Token }} in the template the mail has only a link and the game cannot finish signing in.
--   3. Authentication -> Rate Limits / SMTP: the built-in sender allows only a few mails an hour. For real use, set your own SMTP server.
--
-- What is kept: the game as the player saved it (compressed), a short label for the list, and the account's e-mail address (in
-- Supabase's own auth tables). A player can delete all of it from the game: it calls delete_my_account() below.

create table if not exists public.cloud_saves (
  user_id     uuid   not null default auth.uid() references auth.users (id) on delete cascade,
  slot        text   not null check (slot in ('auto', 'prev', '1', '2', '3', '4', '5')),
  -- Which game it is (the game's own id): a different game taking over the autosave moves the old one to 'prev' (the game does this).
  game        text   not null default '' check (char_length(game) <= 64),
  name        text   not null default '' check (char_length(name) <= 80),
  week        int    not null default 0,
  total_weeks int    not null default 0,
  scenario    text   not null default '' check (char_length(scenario) <= 64),
  player      int    not null default 0,
  -- When the player saved it, by the player's own clock (milliseconds): compared with the copy on the device.
  saved_at    bigint not null,
  enc         text   not null check (enc in ('gzip-b64', 'json')),
  data        text   not null check (char_length(data) <= 1500000),
  updated_at  timestamptz not null default now(),
  primary key (user_id, slot)
);

alter table public.cloud_saves enable row level security;

drop policy if exists "read own saves" on public.cloud_saves;
drop policy if exists "add own saves" on public.cloud_saves;
drop policy if exists "change own saves" on public.cloud_saves;
drop policy if exists "delete own saves" on public.cloud_saves;
create policy "read own saves"   on public.cloud_saves for select to authenticated using (auth.uid() = user_id);
create policy "add own saves"    on public.cloud_saves for insert to authenticated with check (auth.uid() = user_id);
create policy "change own saves" on public.cloud_saves for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own saves" on public.cloud_saves for delete to authenticated using (auth.uid() = user_id);

revoke all on public.cloud_saves from anon;
grant select, insert, update, delete on public.cloud_saves to authenticated;

-- A player deletes their account, and with it every save (the rows go with the user).
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
