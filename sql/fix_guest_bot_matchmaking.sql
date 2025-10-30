-- ============================================
-- FIX BOT MATCHMAKING FOR GUEST PLAYERS
-- Issue: inject_bot_into_room returns "room_not_found"
-- Root cause: RLS policies preventing function from seeing guest rooms
-- ============================================

-- ============================================
-- STEP 1: Check current RLS policies on game_rooms
-- ============================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'game_rooms'
ORDER BY policyname;

-- ============================================
-- STEP 2: Check current RLS policies on game_room_players
-- ============================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'game_room_players'
ORDER BY policyname;

-- ============================================
-- STEP 3: Add RLS policies for guest access
-- ============================================

-- Allow anonymous users (guests) to view all game rooms
DROP POLICY IF EXISTS "Allow anon to view all game rooms" ON game_rooms;
CREATE POLICY "Allow anon to view all game rooms"
ON game_rooms FOR SELECT
TO anon
USING (true);  -- Guests can see all rooms

-- Allow anonymous users (guests) to view all game room players
DROP POLICY IF EXISTS "Allow anon to view all game room players" ON game_room_players;
CREATE POLICY "Allow anon to view all game room players"
ON game_room_players FOR SELECT
TO anon
USING (true);  -- Guests can see all room players

-- ============================================
-- STEP 4: Verify inject_bot_into_room function
-- ============================================

-- Check if function exists and its security type
SELECT
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    CASE
        WHEN p.prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_type,
    r.rolname as owner
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_roles r ON p.proowner = r.oid
WHERE n.nspname = 'public'
    AND p.proname = 'inject_bot_into_room';

-- ============================================
-- STEP 5: Re-create inject_bot_into_room with better error handling
-- ============================================

CREATE OR REPLACE FUNCTION inject_bot_into_room(
  p_room_id UUID,
  p_min_rating INT DEFAULT 800,
  p_max_rating INT DEFAULT 2500
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with elevated privileges
AS $$
DECLARE
  room_data RECORD;
  bot_data RECORD;
  assigned_color TEXT;
  existing_player_color TEXT;
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
    FALSE,
    assigned_color
  );

  -- Update room player count
  UPDATE game_rooms
  SET current_players = 2
  WHERE id = p_room_id;

  RAISE NOTICE 'Bot injected successfully: % into room %', bot_data.bot_username, p_room_id;

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
  RAISE NOTICE 'Exception in inject_bot_into_room: % - %', SQLSTATE, SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'reason', 'error',
    'message', SQLERRM,
    'sqlstate', SQLSTATE
  );
END;
$$;

-- ============================================
-- STEP 6: Grant execute permissions
-- ============================================

GRANT EXECUTE ON FUNCTION inject_bot_into_room(UUID, INT, INT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_available_celestial_bot(INT, INT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_bot_available(UUID) TO authenticated, anon;

-- ============================================
-- STEP 7: Test bot injection for guests
-- ============================================

-- Test 1: Check if guest can see rooms
-- Run this as a test (replace room_id with actual guest room if available):
-- SELECT * FROM game_rooms WHERE status = 'waiting' LIMIT 5;

-- Test 2: Check if get_available_celestial_bot works
-- SELECT * FROM get_available_celestial_bot(800, 2500);

-- Test 3: Try injecting a bot manually (replace with actual waiting room ID)
-- SELECT * FROM inject_bot_into_room('YOUR_ROOM_ID_HERE'::UUID, 800, 2500);

-- ============================================
-- DIAGNOSTIC QUERIES
-- ============================================

-- Check guest players
SELECT
    id,
    username,
    is_guest,
    rating,
    gold_balance
FROM players
WHERE is_guest = TRUE;

-- Check waiting rooms (should be visible to guests)
SELECT
    gr.id,
    gr.status,
    gr.current_players,
    gr.mode,
    gr.entry_fee,
    (
        SELECT p.username || ' (guest: ' || p.is_guest || ')'
        FROM game_room_players grp
        JOIN players p ON grp.player_id = p.id
        WHERE grp.room_id = gr.id
        LIMIT 1
    ) as waiting_player
FROM game_rooms gr
WHERE gr.status = 'waiting'
    AND gr.current_players = 1
ORDER BY gr.created_at DESC;

-- Check available bots
SELECT
    p.username,
    p.rating,
    is_bot_available(p.id) as is_available
FROM players p
WHERE p.is_bot = TRUE
ORDER BY p.rating;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Guest bot matchmaking fix applied!';
    RAISE NOTICE '';
    RAISE NOTICE '🔓 RLS policies updated:';
    RAISE NOTICE '   - Guests can now view all game rooms';
    RAISE NOTICE '   - Guests can view all game room players';
    RAISE NOTICE '';
    RAISE NOTICE '🤖 inject_bot_into_room function updated:';
    RAISE NOTICE '   - Better error messages';
    RAISE NOTICE '   - Debug logging';
    RAISE NOTICE '   - Runs as SECURITY DEFINER';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test with:';
    RAISE NOTICE '   SELECT * FROM get_available_celestial_bot(800, 2500);';
    RAISE NOTICE '   -- Then create a guest room and wait 8 seconds';
END $$;
