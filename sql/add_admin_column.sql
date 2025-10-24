-- Add is_admin column to players table
-- Run this first before creating bug_reports table

-- Add the column if it doesn't exist
ALTER TABLE players
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create an index for faster admin checks
CREATE INDEX IF NOT EXISTS idx_players_is_admin ON players(is_admin) WHERE is_admin = true;

-- Add a comment
COMMENT ON COLUMN players.is_admin IS 'Flag to identify admin users who can manage bug reports and other admin tasks';

-- Set yourself as admin (replace with your actual email)
-- UPDATE players
-- SET is_admin = true
-- WHERE email = 'your@email.com';

-- Optional: Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM players
    WHERE id = user_id
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_admin IS 'Check if a user has admin privileges';
