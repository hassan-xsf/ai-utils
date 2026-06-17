-- CV Builder schema
-- Run in Supabase SQL editor after schema.sql

-- =========================================================================
-- cv_documents: one CV per row, stores latex source and metadata
-- =========================================================================
create table if not exists public.cv_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled CV',
  template_id text not null default 'jakes',
  latex_source text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cv_documents_user_idx on public.cv_documents(user_id, updated_at desc);

alter table public.cv_documents enable row level security;

create policy "cv_documents_select_own" on public.cv_documents
  for select using (auth.uid() = user_id);
create policy "cv_documents_insert_own" on public.cv_documents
  for insert with check (auth.uid() = user_id);
create policy "cv_documents_update_own" on public.cv_documents
  for update using (auth.uid() = user_id);
create policy "cv_documents_delete_own" on public.cv_documents
  for delete using (auth.uid() = user_id);

drop trigger if exists cv_documents_updated on public.cv_documents;
create trigger cv_documents_updated before update on public.cv_documents
  for each row execute function public.set_updated_at();

-- =========================================================================
-- cv_contexts: user knowledge base (bio, skills, projects, etc.)
-- one row per user, upserted
-- =========================================================================
create table if not exists public.cv_contexts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  bio text not null default '',
  skills text not null default '',
  experience text not null default '',
  education text not null default '',
  projects text not null default '',
  certifications text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.cv_contexts enable row level security;

create policy "cv_contexts_select_own" on public.cv_contexts
  for select using (auth.uid() = user_id);
create policy "cv_contexts_insert_own" on public.cv_contexts
  for insert with check (auth.uid() = user_id);
create policy "cv_contexts_update_own" on public.cv_contexts
  for update using (auth.uid() = user_id);

drop trigger if exists cv_contexts_updated on public.cv_contexts;
create trigger cv_contexts_updated before update on public.cv_contexts
  for each row execute function public.set_updated_at();
