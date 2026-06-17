-- Migration: replace latex_source with resume_data (JSONB)
-- Run each block separately in the Supabase SQL editor.

-- Step 1: Add the new column as nullable
ALTER TABLE public.cv_documents
  ADD COLUMN IF NOT EXISTS resume_data jsonb;

-- Step 2: Backfill existing rows with a minimal stub
UPDATE public.cv_documents
SET resume_data = jsonb_build_object(
  'personal', jsonb_build_object(
    'name', name,
    'email', '',
    'phone', '',
    'location', ''
  ),
  'experience', '[]'::jsonb,
  'education',  '[]'::jsonb,
  'skills',     '[]'::jsonb,
  'projects',   '[]'::jsonb
)
WHERE resume_data IS NULL;

-- Step 3: Make NOT NULL with empty-object default
ALTER TABLE public.cv_documents
  ALTER COLUMN resume_data SET NOT NULL,
  ALTER COLUMN resume_data SET DEFAULT '{}'::jsonb;

-- Step 4: Drop the old column (run after verifying Step 3)
ALTER TABLE public.cv_documents
  DROP COLUMN IF EXISTS latex_source;
