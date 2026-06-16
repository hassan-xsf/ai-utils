-- Migration: tm_configs → tm_presets (many per user, named)
-- and tm_routines gets preset_id FK.
-- Run this in the Supabase SQL editor AFTER the initial schema.sql.

-- 1. Create tm_presets from tm_configs data
create table if not exists public.tm_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_url text not null,
  http_method text not null default 'POST' check (http_method in ('GET','POST','PUT','PATCH')),
  request_body jsonb,
  auth_header_name text not null default 'Authorization',
  auth_scheme text not null default 'Bearer',
  token_ciphertext text not null,
  token_preview text not null,
  extra_headers jsonb,              -- optional fixed headers sent on every request
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Copy existing configs as presets named "Default"
insert into public.tm_presets (user_id, name, target_url, http_method, request_body, auth_header_name, auth_scheme, token_ciphertext, token_preview, created_at, updated_at)
select user_id, 'Default', target_url, http_method, request_body, auth_header_name, auth_scheme, token_ciphertext, token_preview, created_at, updated_at
from public.tm_configs
on conflict do nothing;

-- 2. Add preset_id to tm_routines (nullable during migration, then backfill)
alter table public.tm_routines
  add column if not exists preset_id uuid references public.tm_presets(id) on delete set null;

-- Backfill: assign each routine the preset that belongs to the same user
update public.tm_routines r
set preset_id = (
  select p.id from public.tm_presets p where p.user_id = r.user_id limit 1
);

-- 3. RLS for tm_presets
alter table public.tm_presets enable row level security;

create policy "tm_presets_select_own" on public.tm_presets
  for select using (auth.uid() = user_id);
create policy "tm_presets_insert_own" on public.tm_presets
  for insert with check (auth.uid() = user_id);
create policy "tm_presets_update_own" on public.tm_presets
  for update using (auth.uid() = user_id);
create policy "tm_presets_delete_own" on public.tm_presets
  for delete using (auth.uid() = user_id);

-- 4. updated_at trigger for tm_presets
drop trigger if exists tm_presets_updated on public.tm_presets;
create trigger tm_presets_updated before update on public.tm_presets
  for each row execute function public.set_updated_at();

-- 5. Drop the old 5-routine limit trigger
drop trigger if exists tm_routines_limit on public.tm_routines;
drop function if exists public.enforce_tm_routines_limit();

-- 6. Add extra_headers to existing tm_presets table (if already created without it)
alter table public.tm_presets
  add column if not exists extra_headers jsonb;
