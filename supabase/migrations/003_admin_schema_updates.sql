-- Add missing columns to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'initial',
ADD COLUMN IF NOT EXISTS location text DEFAULT 'in-home';

-- Add 'contacted' to submission_status enum if it doesn't exist
-- Note: PostgreSQL doesn't support IF NOT EXISTS for enum values directly in a simple way
-- We catch the error if it exists or just try to add it.
-- However, running this in Supabase SQL editor:
ALTER TYPE submission_status ADD VALUE IF NOT EXISTS 'contacted';
