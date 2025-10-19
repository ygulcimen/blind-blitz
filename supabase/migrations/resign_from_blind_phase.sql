-- Function to resign from blind phase
-- Sets the game room status to 'completed' and marks winner

CREATE OR REPLACE FUNCTION resign_from_blind_phase(
  p_game_id UUID,
  p_resigning_player_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room RECORD;
  v_player_color TEXT;
  v_winner TEXT;
BEGIN
  -- Get room details
  SELECT * INTO v_room
  FROM game_rooms
  WHERE id = p_game_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Game room not found'
    );
  END IF;

  -- Check if game is in blind phase
  IF v_room.status NOT IN ('waiting', 'blind') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Can only resign during waiting or blind phase'
    );
  END IF;

  -- Determine resigning player's color
  IF v_room.white_player_id = p_resigning_player_id THEN
    v_player_color := 'white';
    v_winner := 'black';
  ELSIF v_room.black_player_id = p_resigning_player_id THEN
    v_player_color := 'black';
    v_winner := 'white';
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Player is not in this game'
    );
  END IF;

  -- Update room status to completed with resignation result
  UPDATE game_rooms
  SET
    status = 'completed',
    winner = v_winner,
    end_reason = 'resignation',
    ended_at = NOW(),
    updated_at = NOW()
  WHERE id = p_game_id;

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'winner', v_winner,
    'reason', 'resignation'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION resign_from_blind_phase(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION resign_from_blind_phase(UUID, UUID) TO anon;

COMMENT ON FUNCTION resign_from_blind_phase IS 'Allows a player to resign during waiting or blind phase, ending the game immediately';
