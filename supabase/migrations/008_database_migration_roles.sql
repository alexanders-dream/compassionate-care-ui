-- 1. Update the App Role Enum
-- Note: You cannot natively 'ADD VALUE IF NOT EXISTS' in all Postgres versions easily in one line without a block.
-- If these values already exist, these lines might error.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'medical_staff';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'front_office';
-- 2. Link Team Members to System Users
-- This is critical for the "Unified Management" to work reliably (instead of matching by Name).
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
-- Optional: Create an index for performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
-- 3. Enforce Single Role per User
-- First, clean up any existing duplicates (keeping the most recently attached role)
DELETE FROM public.user_roles
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rnum
    FROM public.user_roles
  ) t
  WHERE t.rnum > 1
);
-- Now it is safe to add the constraint
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
-- 4. RLS Policies (Reminders)
-- Ensure 'user_roles' and 'team_members' have appropriate RLS policies.
-- Example (You may already have these):
-- ALL ON team_members FOR ALL USING (true); -- Public Read
-- ALL ON team_members FOR INSERT/UPDATE/DELETE TO authenticated USING ( exists(select 1 from user_roles where user_id = auth.uid() and role = 'admin') );