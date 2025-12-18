-- Add user_id column to team_members table to link to system users
ALTER TABLE team_members
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create an index on user_id for faster lookups
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
