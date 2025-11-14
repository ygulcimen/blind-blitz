-- Fix RLS policies for game_draw_offers to work with SimpleAuth
-- The issue is that draw offers can't be read by players using SimpleAuth
-- because all policies check auth.uid() which returns NULL for SimpleAuth users

-- Drop ALL existing policies (both authenticated and public roles)
DROP POLICY IF EXISTS "Players can view draw offers" ON game_draw_offers;
DROP POLICY IF EXISTS "Players can create draw offers" ON game_draw_offers;
DROP POLICY IF EXISTS "Players can update draw offers" ON game_draw_offers;
DROP POLICY IF EXISTS "Users can view draw offers for their games" ON game_draw_offers;
DROP POLICY IF EXISTS "Users can create draw offers in their games" ON game_draw_offers;

-- Create new unified policies for PUBLIC role (works for all auth types)
CREATE POLICY "Players can view draw offers for their games"
ON game_draw_offers FOR SELECT
TO public
USING (
  -- Allow if user is a player in the game
  game_id IN (
    SELECT game_id FROM game_live_state
    WHERE white_player_id = COALESCE(
      auth.uid(),
      (SELECT id FROM players WHERE session_token = current_setting('request.headers', true)::json->>'authorization' LIMIT 1)
    )
    OR black_player_id = COALESCE(
      auth.uid(),
      (SELECT id FROM players WHERE session_token = current_setting('request.headers', true)::json->>'authorization' LIMIT 1)
    )
  )
);

CREATE POLICY "Players can create draw offers for their games"
ON game_draw_offers FOR INSERT
TO public
WITH CHECK (
  -- Allow if user is a player in the game
  game_id IN (
    SELECT game_id FROM game_live_state
    WHERE white_player_id = COALESCE(
      auth.uid(),
      (SELECT id FROM players WHERE session_token = current_setting('request.headers', true)::json->>'authorization' LIMIT 1)
    )
    OR black_player_id = COALESCE(
      auth.uid(),
      (SELECT id FROM players WHERE session_token = current_setting('request.headers', true)::json->>'authorization' LIMIT 1)
    )
  )
);

CREATE POLICY "Players can update draw offers for their games"
ON game_draw_offers FOR UPDATE
TO public
USING (
  -- Allow if user is a player in the game
  game_id IN (
    SELECT game_id FROM game_live_state
    WHERE white_player_id = COALESCE(
      auth.uid(),
      (SELECT id FROM players WHERE session_token = current_setting('request.headers', true)::json->>'authorization' LIMIT 1)
    )
    OR black_player_id = COALESCE(
      auth.uid(),
      (SELECT id FROM players WHERE session_token = current_setting('request.headers', true)::json->>'authorization' LIMIT 1)
    )
  )
);
