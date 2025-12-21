-- Add is_public column to team_members table with default value of true
ALTER TABLE team_members
ADD COLUMN is_public BOOLEAN DEFAULT true;
