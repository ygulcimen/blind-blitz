-- Function to make a live move for a bot player (bypasses RLS/auth)
-- This allows the client to make moves on behalf of the bot

-- Drop the old function signature if it exists
DROP FUNCTION IF EXISTS make_bot_live_move(UUID, UUID, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION make_bot_live_move(
  p_game_id UUID,
  p_bot_player_id UUID,
  p_from_square TEXT,
  p_to_square TEXT,
  p_move_san TEXT,
  p_new_fen TEXT,
  p_is_check BOOLEAN,
  p_is_checkmate BOOLEAN,
  p_is_draw BOOLEAN,
  p_promotion TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_game_state RECORD;
  v_player_color TEXT;
  v_chess_turn TEXT;
  v_game_ended BOOLEAN;
  v_time_taken BIGINT;
  v_current_player_time BIGINT;
  v_new_time_remaining BIGINT;
  v_time_increment BIGINT;
  v_next_move_number INTEGER;
  v_game_result JSONB;
  v_move_record RECORD;
BEGIN
  -- Get current game state
  SELECT * INTO v_game_state
  FROM game_live_state
  WHERE game_id = p_game_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Game not found'
    );
  END IF;

  IF v_game_state.game_ended THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Game has ended'
    );
  END IF;

  -- Determine bot's color
  IF v_game_state.white_player_id = p_bot_player_id THEN
    v_player_color := 'white';
  ELSIF v_game_state.black_player_id = p_bot_player_id THEN
    v_player_color := 'black';
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Bot is not a player in this game'
    );
  END IF;

  -- Check if it's the bot's turn
  -- Extract turn from FEN (second field)
  v_chess_turn := CASE
    WHEN split_part(v_game_state.current_fen, ' ', 2) = 'w' THEN 'white'
    ELSE 'black'
  END;

  IF v_chess_turn != v_player_color THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not bot''s turn'
    );
  END IF;

  -- Call the chess validation function (you'll need to implement this)
  -- For now, we'll trust the client-side validation and just build the move
  -- In production, you should validate the move server-side using a chess library

  -- Get the next move number
  SELECT COALESCE(MAX(move_number), 0) + 1 INTO v_next_move_number
  FROM game_live_moves
  WHERE game_id = p_game_id;

  -- Calculate time taken
  v_time_taken := CASE
    WHEN v_game_state.last_move_time IS NOT NULL THEN
      GREATEST(0, EXTRACT(EPOCH FROM (NOW() - v_game_state.last_move_time)) * 1000)::BIGINT
    ELSE 0
  END;

  -- Bot moves are instant, so we don't add time increment (otherwise bot gains time)
  -- We just keep the bot's current time as-is
  v_current_player_time := CASE
    WHEN v_player_color = 'white' THEN v_game_state.white_time_ms
    ELSE v_game_state.black_time_ms
  END;

  -- Bot doesn't lose OR gain time - keep it exactly as it was
  v_new_time_remaining := v_current_player_time;

  -- Determine if game has ended
  v_game_ended := p_is_checkmate OR p_is_draw;

  -- Set game result if game has ended
  IF p_is_checkmate THEN
    v_game_result := jsonb_build_object(
      'winner', v_player_color,
      'reason', 'checkmate'
    );
  ELSIF p_is_draw THEN
    v_game_result := jsonb_build_object(
      'winner', 'draw',
      'reason', 'draw'
    );
  ELSE
    v_game_result := NULL;
  END IF;

  -- Insert the move (include player_id)
  INSERT INTO game_live_moves (
    game_id,
    player_id,
    move_number,
    player_color,
    move_from,
    move_to,
    move_san,
    move_fen,
    is_check,
    is_checkmate,
    time_taken_ms,
    time_remaining_ms
  ) VALUES (
    p_game_id,
    p_bot_player_id,
    v_next_move_number,
    v_player_color,
    p_from_square,
    p_to_square,
    p_move_san,
    p_new_fen,
    p_is_check,
    p_is_checkmate,
    v_time_taken,
    v_new_time_remaining
  ) RETURNING * INTO v_move_record;

  -- Update game state with the new FEN
  -- We DO update last_move_time to start the human player's timer
  -- The bot "thinking" delay happens in the frontend, so by the time we get here
  -- the appropriate time has already elapsed
  UPDATE game_live_state
  SET
    current_fen = p_new_fen,
    current_turn = CASE WHEN v_player_color = 'white' THEN 'black' ELSE 'white' END,
    move_count = move_count + 1,
    white_time_ms = CASE WHEN v_player_color = 'white' THEN v_new_time_remaining ELSE white_time_ms END,
    black_time_ms = CASE WHEN v_player_color = 'black' THEN v_new_time_remaining ELSE black_time_ms END,
    last_move_time = NOW(),
    game_ended = v_game_ended,
    game_result = v_game_result,
    updated_at = NOW()
  WHERE game_id = p_game_id;

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'move', row_to_json(v_move_record)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION make_bot_live_move(UUID, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION make_bot_live_move(UUID, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, TEXT) TO anon;

COMMENT ON FUNCTION make_bot_live_move IS 'Makes a live move for a bot player, bypassing RLS checks. Accepts pre-calculated FEN and move details from client.';
