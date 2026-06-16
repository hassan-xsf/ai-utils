-- AI Utils — Token Maxxer schema
-- Run this in the Supabase SQL editor.

-- =========================================================================
-- profiles: 1:1 with auth.users, lets us extend user info later
-- =========================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- tm_configs: per-user Token Maxxer config (1 row per user)
-- token is stored encrypted (AES-GCM) by the Worker / server actions.
-- token_preview holds the last 4 chars for display.
-- =========================================================================
create table if not exists public.tm_configs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  target_url text not null,
  http_method text not null default 'POST' check (http_method in ('GET','POST','PUT','PATCH')),
  request_body jsonb,
  auth_header_name text not null default 'Authorization',
  auth_scheme text not null default 'Bearer',   -- prefix before the token; '' for no prefix
  token_ciphertext text not null,   -- base64(iv | ciphertext | tag)
  token_preview text not null,      -- last 4 chars, e.g. "••••abcd"
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- For existing installs, run:
-- alter table public.tm_configs
--   add column if not exists auth_header_name text not null default 'Authorization',
--   add column if not exists auth_scheme text not null default 'Bearer';

alter table public.tm_configs enable row level security;

create policy "tm_configs_select_own" on public.tm_configs
  for select using (auth.uid() = user_id);
create policy "tm_configs_insert_own" on public.tm_configs
  for insert with check (auth.uid() = user_id);
create policy "tm_configs_update_own" on public.tm_configs
  for update using (auth.uid() = user_id);
create policy "tm_configs_delete_own" on public.tm_configs
  for delete using (auth.uid() = user_id);

-- =========================================================================
-- tm_routines: up to 5 per user, each is a scheduled ping at HH:MM in tz
-- days_of_week: array of ints 0..6 (0 = Sunday)
-- =========================================================================
create table if not exists public.tm_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  time_of_day time not null,                -- e.g. '12:30'
  timezone text not null,                   -- IANA tz, e.g. 'America/New_York'
  days_of_week smallint[] not null default '{0,1,2,3,4,5,6}',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tm_routines_user_idx on public.tm_routines(user_id);
create index if not exists tm_routines_enabled_idx on public.tm_routines(enabled) where enabled = true;

alter table public.tm_routines enable row level security;

create policy "tm_routines_select_own" on public.tm_routines
  for select using (auth.uid() = user_id);
create policy "tm_routines_insert_own" on public.tm_routines
  for insert with check (auth.uid() = user_id);
create policy "tm_routines_update_own" on public.tm_routines
  for update using (auth.uid() = user_id);
create policy "tm_routines_delete_own" on public.tm_routines
  for delete using (auth.uid() = user_id);

-- Enforce max 5 routines per user
create or replace function public.enforce_tm_routines_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.tm_routines where user_id = new.user_id) >= 5 then
    raise exception 'Maximum of 5 routines per user';
  end if;
  return new;
end;
$$;

drop trigger if exists tm_routines_limit on public.tm_routines;
create trigger tm_routines_limit
  before insert on public.tm_routines
  for each row execute function public.enforce_tm_routines_limit();

-- =========================================================================
-- tm_runs: history of executions. Rolling window of last 30 per routine.
-- =========================================================================
create table if not exists public.tm_runs (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid references public.tm_routines(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  triggered_by text not null check (triggered_by in ('cron','manual')),
  status text not null check (status in ('success','failure')),
  http_status int,
  duration_ms int,
  response_excerpt text,           -- first ~500 chars of response
  error_message text,
  started_at timestamptz not null default now()
);

create index if not exists tm_runs_routine_idx on public.tm_runs(routine_id, started_at desc);
create index if not exists tm_runs_user_idx on public.tm_runs(user_id, started_at desc);

alter table public.tm_runs enable row level security;

create policy "tm_runs_select_own" on public.tm_runs
  for select using (auth.uid() = user_id);
-- inserts happen via service role from the Worker; no insert policy for users.

-- Keep last 30 runs per routine
create or replace function public.trim_tm_runs()
returns trigger
language plpgsql
as $$
begin
  delete from public.tm_runs
  where id in (
    select id from public.tm_runs
    where routine_id = new.routine_id
    order by started_at desc
    offset 30
  );
  return new;
end;
$$;

drop trigger if exists tm_runs_trim on public.tm_runs;
create trigger tm_runs_trim
  after insert on public.tm_runs
  for each row when (new.routine_id is not null)
  execute function public.trim_tm_runs();

-- updated_at helpers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists tm_configs_updated on public.tm_configs;
create trigger tm_configs_updated before update on public.tm_configs
  for each row execute function public.set_updated_at();

drop trigger if exists tm_routines_updated on public.tm_routines;
create trigger tm_routines_updated before update on public.tm_routines
  for each row execute function public.set_updated_at();
