-- Add is_bot column to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE;

-- Create index for faster bot queries
CREATE INDEX IF NOT EXISTS idx_players_is_bot ON players(is_bot);

-- Update RLS policies to allow bots to join rooms
-- (Bots should be able to join any room)
