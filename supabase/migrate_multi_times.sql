-- Migration: tm_routines time_of_day → times_of_day (array)
-- Run in Supabase SQL editor.

alter table public.tm_routines
  add column if not exists times_of_day time[] not null default '{}';

-- Backfill: copy existing single time into the array
update public.tm_routines
set times_of_day = array[time_of_day]
where times_of_day = '{}';

-- Optional: drop the old column once you're happy
-- alter table public.tm_routines drop column time_of_day;
