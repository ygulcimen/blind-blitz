-- ============================================
-- FIX BOT COLOR RANDOMIZATION
-- Issue: Human player always gets white when playing against bots
-- Solution: Randomize human's color first, then assign bot opposite color
-- ============================================

CREATE OR REPLACE FUNCTION inject_bot_into_room(
  p_room_id UUID,
  p_min_rating INT DEFAULT 800,
  p_max_rating INT DEFAULT 2500
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  room_data RECORD;
  bot_data RECORD;
  assigned_bot_color TEXT;
  assigned_human_color TEXT;
  existing_player_id UUID;
BEGIN
  -- Debug: Log the attempt
  RAISE NOTICE 'inject_bot_into_room called for room: %, rating range: %-%, caller role: %',
    p_room_id, p_min_rating, p_max_rating, current_user;

  -- Try to get room WITHOUT locking first (to check if it exists)
  SELECT * INTO room_data
  FROM game_rooms
  WHERE id = p_room_id;

  -- Check if room exists
  IF room_data IS NULL THEN
    RAISE NOTICE 'Room not found: %', p_room_id;
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'room_not_found',
      'message', 'Room does not exist or is not accessible',
      'debug_room_id', p_room_id::TEXT
    );
  END IF;

  -- Now lock it
  SELECT * INTO room_data
  FROM game_rooms
  WHERE id = p_room_id
  FOR UPDATE;

  -- Check if room is waiting
  IF room_data.status != 'waiting' THEN
    RAISE NOTICE 'Room not waiting: % (status: %)', p_room_id, room_data.status;
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'room_not_waiting',
      'message', 'Room status is: ' || room_data.status
    );
  END IF;

  -- Check player count
  IF room_data.current_players != 1 THEN
    RAISE NOTICE 'Room has wrong player count: % (expected 1)', room_data.current_players;
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'room_full_or_empty',
      'message', 'Room has ' || room_data.current_players || ' players'
    );
  END IF;

  -- Get an available bot
  SELECT * INTO bot_data
  FROM get_available_celestial_bot(p_min_rating, p_max_rating);

  IF bot_data IS NULL THEN
    RAISE NOTICE 'No bot available in rating range: %-% ', p_min_rating, p_max_rating;
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'no_bot_available',
      'message', 'No bots available in rating range ' || p_min_rating || '-' || p_max_rating
    );
  END IF;

  -- 🎲 NEW: RANDOMIZE HUMAN PLAYER'S COLOR FIRST
  -- Get the existing human player's ID
  SELECT player_id INTO existing_player_id
  FROM game_room_players
  WHERE room_id = p_room_id
  LIMIT 1;

  -- Randomly assign color to human (50/50 chance)
  IF random() < 0.5 THEN
    assigned_human_color := 'white';
    assigned_bot_color := 'black';
  ELSE
    assigned_human_color := 'black';
    assigned_bot_color := 'white';
  END IF;

  -- Update human player's color to the random color
  UPDATE game_room_players
  SET color = assigned_human_color
  WHERE room_id = p_room_id
  AND player_id = existing_player_id;

  RAISE NOTICE '🎲 Random colors for bot game - Human: %, Bot: %',
    assigned_human_color, assigned_bot_color;

  -- Add bot to room with opposite color
  INSERT INTO game_room_players (
    room_id,
    player_id,
    player_username,
    player_rating,
    ready,
    color
  ) VALUES (
    p_room_id,
    bot_data.bot_id,
    bot_data.bot_username,
    bot_data.bot_rating,
    FALSE,
    assigned_bot_color
  );

  -- Update room player count to 2 (not increment, set to 2)
  UPDATE game_rooms
  SET current_players = 2
  WHERE id = p_room_id;

  RAISE NOTICE '✅ Bot injected successfully: % (rating: %) as %',
    bot_data.bot_username, bot_data.bot_rating, assigned_bot_color;

  -- Return success with bot info (including bot_config for compatibility)
  RETURN jsonb_build_object(
    'success', true,
    'bot_id', bot_data.bot_id,
    'bot_username', bot_data.bot_username,
    'bot_rating', bot_data.bot_rating,
    'bot_color', assigned_bot_color,
    'human_color', assigned_human_color,
    'bot_config', bot_data.bot_config,
    'message', 'Bot joined successfully as ' || assigned_bot_color
  );

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Exception in inject_bot_into_room: % - %', SQLSTATE, SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'reason', 'error',
    'message', SQLERRM,
    'sqlstate', SQLSTATE
  );
END;
$$;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions to authenticated and anonymous users (for guests)
GRANT EXECUTE ON FUNCTION inject_bot_into_room(UUID, INT, INT) TO authenticated, anon;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if function was updated
SELECT
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname = 'inject_bot_into_room';
