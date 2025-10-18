-- ============================================
-- BOT AVAILABILITY & INJECTION SYSTEM
-- Ensures bots only play one game at a time
-- ============================================

-- 1. Function to check if a bot is currently in an active game
CREATE OR REPLACE FUNCTION is_bot_available(bot_player_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  active_game_count INTEGER;
BEGIN
  -- Check if bot is in any active game (waiting, starting, blind, revealing, live)
  SELECT COUNT(*) INTO active_game_count
  FROM game_room_players grp
  JOIN game_rooms gr ON grp.room_id = gr.id
  WHERE grp.player_id = bot_player_id
    AND gr.status IN ('waiting', 'starting', 'blind', 'revealing', 'live');

  -- Bot is available if not in any active game
  RETURN active_game_count = 0;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to get an available bot within rating range
CREATE OR REPLACE FUNCTION get_available_celestial_bot(
  min_rating INT DEFAULT 800,
  max_rating INT DEFAULT 2500
)
RETURNS TABLE(
  bot_id UUID,
  bot_username TEXT,
  bot_rating BIGINT,
  bot_config JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.rating,
    cbc.config
  FROM players p
  JOIN celestial_bot_configs cbc ON p.id = cbc.id
  WHERE p.is_bot = TRUE
    AND p.rating BETWEEN min_rating AND max_rating
    AND is_bot_available(p.id) = TRUE  -- Only available bots
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to inject bot into an existing room
CREATE OR REPLACE FUNCTION inject_bot_into_room(
  p_room_id UUID,
  p_min_rating INT DEFAULT 800,
  p_max_rating INT DEFAULT 2500
)
RETURNS JSONB AS $$
DECLARE
  room_data RECORD;
  bot_data RECORD;
  assigned_color TEXT;
  existing_player_color TEXT;
BEGIN
  -- Lock the room
  SELECT * INTO room_data
  FROM game_rooms
  WHERE id = p_room_id
  FOR UPDATE;

  -- Check if room exists and is waiting
  IF room_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'room_not_found');
  END IF;

  IF room_data.status != 'waiting' THEN
    RETURN jsonb_build_object('success', false, 'reason', 'room_not_waiting');
  END IF;

  IF room_data.current_players != 1 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'room_full_or_empty');
  END IF;

  -- Get an available bot
  SELECT * INTO bot_data
  FROM get_available_celestial_bot(p_min_rating, p_max_rating);

  IF bot_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_bot_available');
  END IF;

  -- Get existing player's color
  SELECT color INTO existing_player_color
  FROM game_room_players
  WHERE room_id = p_room_id
  LIMIT 1;

  -- Assign opposite color to bot
  IF existing_player_color = 'white' THEN
    assigned_color := 'black';
  ELSE
    assigned_color := 'white';
  END IF;

  -- Add bot to room
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
    FALSE,  -- Not ready yet, will be set ready after 1 second by frontend
    assigned_color
  );

  -- Update room player count
  UPDATE game_rooms
  SET current_players = 2,
      updated_at = NOW()
  WHERE id = p_room_id;

  -- Return success with bot info
  RETURN jsonb_build_object(
    'success', true,
    'bot_id', bot_data.bot_id,
    'bot_username', bot_data.bot_username,
    'bot_rating', bot_data.bot_rating,
    'bot_color', assigned_color,
    'bot_config', bot_data.bot_config
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'reason', 'error',
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;

-- 4. Function to get room's waiting time
CREATE OR REPLACE FUNCTION get_room_wait_time(p_room_id UUID)
RETURNS INTEGER AS $$
DECLARE
  room_created_at TIMESTAMP WITH TIME ZONE;
  wait_seconds INTEGER;
BEGIN
  SELECT created_at INTO room_created_at
  FROM game_rooms
  WHERE id = p_room_id;

  IF room_created_at IS NULL THEN
    RETURN 0;
  END IF;

  wait_seconds := EXTRACT(EPOCH FROM (NOW() - room_created_at))::INTEGER;
  RETURN wait_seconds;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to auto-inject bot if room waiting too long
-- This can be called by a cron job or from frontend
CREATE OR REPLACE FUNCTION check_and_inject_bots()
RETURNS TABLE(
  room_id UUID,
  bot_injected BOOLEAN,
  bot_username TEXT,
  message TEXT
) AS $$
DECLARE
  waiting_room RECORD;
  injection_result JSONB;
  player_rating INTEGER;
BEGIN
  -- Find rooms waiting for 8+ seconds with 1 player
  FOR waiting_room IN
    SELECT gr.id, gr.created_at, gr.current_players
    FROM game_rooms gr
    WHERE gr.status = 'waiting'
      AND gr.current_players = 1
      AND gr.created_at < NOW() - INTERVAL '8 seconds'
    ORDER BY gr.created_at ASC
  LOOP
    -- Get the waiting player's rating
    SELECT player_rating INTO player_rating
    FROM game_room_players
    WHERE room_id = waiting_room.id
    LIMIT 1;

    -- Try to inject a bot with similar rating (±300)
    injection_result := inject_bot_into_room(
      waiting_room.id,
      GREATEST(800, player_rating - 300),
      player_rating + 300
    );

    IF (injection_result->>'success')::BOOLEAN THEN
      RETURN QUERY SELECT
        waiting_room.id,
        TRUE,
        (injection_result->>'bot_username')::TEXT,
        'Bot injected successfully'::TEXT;
    ELSE
      RETURN QUERY SELECT
        waiting_room.id,
        FALSE,
        NULL::TEXT,
        (injection_result->>'reason')::TEXT;
    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- 6. Grant execute permissions
GRANT EXECUTE ON FUNCTION is_bot_available TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_available_celestial_bot TO authenticated, anon;
GRANT EXECUTE ON FUNCTION inject_bot_into_room TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_room_wait_time TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_and_inject_bots TO authenticated, anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Bot availability & injection system created!';
  RAISE NOTICE '🔍 is_bot_available() - Check if bot is free';
  RAISE NOTICE '🤖 get_available_celestial_bot() - Get free bot by rating';
  RAISE NOTICE '💉 inject_bot_into_room() - Add bot to waiting room';
  RAISE NOTICE '⏱️ get_room_wait_time() - Get room waiting duration';
  RAISE NOTICE '🔄 check_and_inject_bots() - Auto-inject for old rooms';
  RAISE NOTICE '🎮 Bots will only play one game at a time!';
END $$;
