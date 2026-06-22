-- Add personal info column to cv_contexts
-- Run in Supabase SQL editor

alter table public.cv_contexts
  add column if not exists personal jsonb not null default '{}';
