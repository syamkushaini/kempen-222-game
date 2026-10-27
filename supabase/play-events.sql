-- How the game is played, counted without names, for Supabase. Run this once, like the other files:
-- Supabase dashboard -> SQL Editor -> New query -> paste -> Run. It uses the same project address and public key
-- as the leaderboard: nothing else needs setting. Running it again is safe.
--
-- What a row holds is only what the game sends (src/state/analytics.ts): a random id for the browser (pid) and one for the visit (sid),
-- what happened (t), the kind of contest, how far into it, which screen, the language, phone/tablet/desktop and the game's version.
-- No name, no party, no save, no IP address: this table has no column for one. (Supabase's own request logs, which only the
-- dashboard can see, keep the address of each request for a day or so on the free plan, as they do for the leaderboard.)
--
-- The game can only add rows. Nobody with the public key can read, change or delete them: read them in the dashboard, with the
-- views at the bottom (Table Editor -> the view, or SQL Editor: select * from play_daily;).

create table if not exists public.play_events (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  pid        text not null check (pid ~ '^[0-9a-f]{16}$'),
  sid        text not null check (sid ~ '^[0-9a-f]{16}$'),
  t          text not null check (t in ('open', 'start', 'resume', 'election', 'term', 'end', 'again', 'share', 'leave')),
  secs       int  not null default 0 check (secs between 0 and 604800),
  lang       text not null check (lang in ('en', 'ms')),
  device     text not null check (device in ('phone', 'tablet', 'desktop')),
  version    text not null check (char_length(version) <= 32),
  mode       text check (mode in ('career', 'career-state', 'general', 'hung', 'state', 'byelection')),
  scenario   text check (char_length(scenario) <= 40),
  difficulty text check (difficulty in ('easy', 'normal', 'hard')),
  screen     text not null check (screen in ('title', 'campaign', 'term', 'night', 'talks', 'legacy')),
  week       int check (week between 0 and 100000),
  n          int check (n between 0 and 100000),
  detail     text check (char_length(detail) <= 24)
);

create index if not exists play_events_time on public.play_events (created_at);
create index if not exists play_events_visit on public.play_events (sid, id);

alter table public.play_events enable row level security;

drop policy if exists "the game can add play events" on public.play_events;
create policy "the game can add play events" on public.play_events for insert to anon with check (true);
-- No select, update or delete policy exists, so none is allowed from the game.
revoke select, update, delete, truncate on public.play_events from anon, authenticated;
grant insert on public.play_events to anon;

-- ---------- reading it: views for the dashboard only ----------
-- Each view runs with the rights of whoever reads it (security_invoker), so the public key, which cannot read the table, cannot read these either.

-- One row per visit: when, on what, how long, how far it got and where it stopped. A visit is the events with the same sid.
create or replace view public.play_visits with (security_invoker = true) as
select
  sid,
  min(pid) as pid,
  min(created_at) as began,
  (array_agg(device order by id))[1] as device,
  (array_agg(lang order by id desc))[1] as lang,
  (array_agg(mode order by id desc) filter (where mode is not null))[1] as mode,
  max(secs) as secs,
  max(week) as last_week,
  coalesce(max(n) filter (where t = 'leave'), 0) as weeks_played,
  (array_agg(screen order by id desc))[1] as last_screen,
  bool_or(t in ('start', 'resume')) as played,
  bool_or(t = 'election') as reached_election,
  bool_or(t = 'again') as played_again,
  bool_or(t = 'share') as shared
from public.play_events
group by sid;

-- Visits per day, how many played at all, and the median weeks played (Malaysian time).
create or replace view public.play_daily with (security_invoker = true) as
select
  (began at time zone 'Asia/Kuala_Lumpur')::date as day,
  count(*) as visits,
  count(distinct pid) as browsers,
  count(*) filter (where played) as played,
  percentile_cont(0.5) within group (order by weeks_played) filter (where played) as median_weeks_played,
  percentile_cont(0.5) within group (order by secs) filter (where played) as median_seconds,
  count(*) filter (where device = 'phone') as on_phone
from public.play_visits
group by 1
order by 1 desc;

-- Where visits stop: the last screen seen, and by kind of contest.
create or replace view public.play_where_stopped with (security_invoker = true) as
select coalesce(mode, '(none)') as mode, last_screen, count(*) as visits,
  round(100.0 * count(*) / sum(count(*)) over (partition by coalesce(mode, '(none)')), 1) as pct_of_mode
from public.play_visits
group by 1, 2
order by 1, visits desc;

-- Drop-off by week: of the visits that played a kind of contest, how many stopped at each week (and how many got that far).
create or replace view public.play_dropoff with (security_invoker = true) as
select mode, last_week as week, count(*) as stopped_here,
  sum(count(*)) over (partition by mode order by last_week desc) as reached
from public.play_visits
where played and mode is not null and last_week is not null
group by mode, last_week
order by mode, week;

-- Completion by kind of contest: of the games started, how many reached polling day, how many careers ended, and what came after.
create or replace view public.play_completion with (security_invoker = true) as
with games as (
  select sid, mode, count(*) filter (where t = 'start') as starts, count(*) filter (where t = 'election') as elections,
    count(*) filter (where t = 'end') as endings, count(*) filter (where t = 'again') as agains, count(*) filter (where t = 'share') as shares
  from public.play_events where mode is not null group by sid, mode
)
select mode,
  sum(starts) as games_started,
  sum(elections) as elections_reached,
  round(100.0 * count(*) filter (where elections > 0) / nullif(count(*) filter (where starts > 0), 0), 1) as pct_visits_reaching_election,
  sum(endings) as careers_ended,
  sum(agains) as play_again_pressed,
  sum(shares) as shares
from games
group by mode
order by games_started desc;

-- How elections went, by kind of contest.
create or replace view public.play_results with (security_invoker = true) as
select mode, detail as verdict, count(*) as elections, round(avg(n), 1) as avg_seats
from public.play_events where t = 'election'
group by mode, detail
order by mode, elections desc;

revoke all on public.play_visits, public.play_daily, public.play_where_stopped, public.play_dropoff, public.play_completion, public.play_results from anon, authenticated;

-- To keep the free plan's space, rows older than a year can be cleared now and then from the SQL Editor:
--   delete from public.play_events where created_at < now() - interval '1 year';
