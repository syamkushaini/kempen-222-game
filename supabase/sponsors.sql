-- The top sponsors shown in "Buy me a coffee", for Supabase. Run this once, like the other files:
-- Supabase dashboard -> SQL Editor -> New query -> paste -> Run. It uses the same project address and public key
-- as the leaderboard: nothing else needs setting.
--
-- To change the list afterwards, edit the table in the dashboard (Table Editor -> sponsors): add a row, change a name,
-- or change "position" (1 is the top). The game reads the table when the dialog is opened, in the order of "position".
-- Only the dashboard can change it: the game, and anyone with the public key, can only read it. If the table cannot
-- be reached, the game shows the list that was built into it.

create table if not exists public.sponsors (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  position   int not null,
  name       text not null check (char_length(name) between 1 and 80)
);

create index if not exists sponsors_position on public.sponsors (position, id);

alter table public.sponsors enable row level security;

drop policy if exists "anyone can read the sponsors" on public.sponsors;
create policy "anyone can read the sponsors" on public.sponsors for select to anon using (true);

-- No insert, update or delete policy exists, so none is allowed from the game.

-- The first nine, in order. Nothing is added if the table already has any (running this file again is safe).
insert into public.sponsors (position, name)
select v.position, v.name
from (values
  (1, 'Muhammad Syafiq bin Sabtu'),
  (2, 'Muhammad Sofwan bin Zul Kepli'),
  (3, 'Ariff Hakimi bin Abdul Hamid'),
  (4, 'Muhammad Irfan Hareez bin Zulkarnaen'),
  (5, 'Muhammad Hazeem Ezariq'),
  (6, 'Muhammad Edzwan Ashraf'),
  (7, 'Razif bin Radzi'),
  (8, 'Muhammad Zulfahmi bin Sil'),
  (9, 'Lau Shi Lin')
) as v(position, name)
where not exists (select 1 from public.sponsors);
