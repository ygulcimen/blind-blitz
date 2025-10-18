-- ============================================
-- FIX BOT MOVES RLS (Row-Level Security)
-- Allow system to insert bot moves on behalf of bots
-- ============================================

-- Create a function that can insert bot moves with elevated privileges
CREATE OR REPLACE FUNCTION insert_bot_blind_move(
  p_game_id UUID,
  p_player_color TEXT,
  p_move_number INTEGER,
  p_move_from TEXT,
  p_move_to TEXT,
  p_move_san TEXT,
  p_is_submitted BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
SECURITY DEFINER -- This allows function to bypass RLS
SET search_path = public
AS $$
DECLARE
  bot_player_id UUID;
  is_player_bot BOOLEAN;
BEGIN
  -- Get the player ID for this color in this game
  SELECT grp.player_id, p.is_bot INTO bot_player_id, is_player_bot
  FROM game_room_players grp
  JOIN players p ON p.id = grp.player_id
  WHERE grp.room_id = p_game_id
    AND grp.color = p_player_color;

  -- Verify this is actually a bot
  IF is_player_bot IS NULL OR is_player_bot = FALSE THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'not_a_bot',
      'message', 'Can only insert moves for bot players'
    );
  END IF;

  -- Insert the move (including player_id)
  INSERT INTO game_blind_moves (
    game_id,
    player_id,
    player_color,
    move_number,
    move_from,
    move_to,
    move_san,
    is_submitted
  ) VALUES (
    p_game_id,
    bot_player_id,
    p_player_color,
    p_move_number,
    p_move_from,
    p_move_to,
    p_move_san,
    p_is_submitted
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Bot move inserted successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', 'database_error',
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to mark bot moves as submitted
CREATE OR REPLACE FUNCTION mark_bot_moves_submitted(
  p_game_id UUID,
  p_player_color TEXT
)
RETURNS JSONB
SECURITY DEFINER -- This allows function to bypass RLS
SET search_path = public
AS $$
DECLARE
  is_player_bot BOOLEAN;
BEGIN
  -- Verify this is actually a bot
  SELECT p.is_bot INTO is_player_bot
  FROM game_room_players grp
  JOIN players p ON p.id = grp.player_id
  WHERE grp.room_id = p_game_id
    AND grp.color = p_player_color;

  IF is_player_bot IS NULL OR is_player_bot = FALSE THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'not_a_bot',
      'message', 'Can only mark moves for bot players'
    );
  END IF;

  -- Mark moves as submitted
  UPDATE game_blind_moves
  SET is_submitted = TRUE
  WHERE game_id = p_game_id
    AND player_color = p_player_color;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Bot moves marked as submitted'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', 'database_error',
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION insert_bot_blind_move TO authenticated, anon;
GRANT EXECUTE ON FUNCTION mark_bot_moves_submitted TO authenticated, anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Bot moves RLS functions created!';
  RAISE NOTICE '🔒 insert_bot_blind_move() - Insert bot moves with elevated privileges';
  RAISE NOTICE '📝 mark_bot_moves_submitted() - Mark bot moves as submitted';
  RAISE NOTICE '🤖 These functions bypass RLS for bot players only!';
END $$;
