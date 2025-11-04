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

-- Allow anonymous users (guests) to update game rooms
-- This is CRITICAL for payment function to update room status to 'blind'
DROP POLICY IF EXISTS "Allow anon to update game rooms" ON game_rooms;
CREATE POLICY "Allow anon to update game rooms"
ON game_rooms FOR UPDATE
TO anon
USING (true)  -- Allow updating any room
WITH CHECK (true);  -- No restrictions on new values

-- Allow anonymous users (guests) to view all game room players
DROP POLICY IF EXISTS "Allow anon to view all game room players" ON game_room_players;
CREATE POLICY "Allow anon to view all game room players"
ON game_room_players FOR SELECT
TO anon
USING (true);  -- Guests can see all room players

-- Allow anonymous users (guests) to update game room players
-- This is CRITICAL for marking bots as ready in guest games
DROP POLICY IF EXISTS "Allow anon to update game room players" ON game_room_players;
CREATE POLICY "Allow anon to update game room players"
ON game_room_players FOR UPDATE
TO anon
USING (true)  -- Allow updating any player record
WITH CHECK (true);  -- No restrictions on new values

-- Allow anonymous users (guests) to view players table
-- Needed for payment function to check gold balance
DROP POLICY IF EXISTS "Allow anon to view players" ON players;
CREATE POLICY "Allow anon to view players"
ON players FOR SELECT
TO anon
USING (true);

-- Allow anonymous users (guests) to update players table
-- Needed for payment function to deduct gold from guest player
DROP POLICY IF EXISTS "Allow anon to update players" ON players;
CREATE POLICY "Allow anon to update players"
ON players FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Allow anonymous users (guests) to insert gold transactions
-- Needed for payment function to log entry fee deduction
DROP POLICY IF EXISTS "Allow anon to insert gold transactions" ON gold_transactions;
CREATE POLICY "Allow anon to insert gold transactions"
ON gold_transactions FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous users (guests) to view blind moves
-- Needed to see opponent's move count and submission status
DROP POLICY IF EXISTS "Allow anon to view blind moves" ON game_blind_moves;
CREATE POLICY "Allow anon to view blind moves"
ON game_blind_moves FOR SELECT
TO anon
USING (true);

-- Allow anonymous users (guests) to insert blind moves
-- CRITICAL for guest players to make moves in blind phase
DROP POLICY IF EXISTS "Allow anon to insert blind moves" ON game_blind_moves;
CREATE POLICY "Allow anon to insert blind moves"
ON game_blind_moves FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous users (guests) to update blind moves
-- Needed to submit moves and undo moves
DROP POLICY IF EXISTS "Allow anon to update blind moves" ON game_blind_moves;
CREATE POLICY "Allow anon to update blind moves"
ON game_blind_moves FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Allow anonymous users (guests) to delete blind moves
-- Needed for undo functionality
DROP POLICY IF EXISTS "Allow anon to delete blind moves" ON game_blind_moves;
CREATE POLICY "Allow anon to delete blind moves"
ON game_blind_moves FOR DELETE
TO anon
USING (true);

-- Allow anonymous users (guests) to view live game state
-- Needed to see current board position and game status
DROP POLICY IF EXISTS "Allow anon to view live game state" ON game_live_state;
CREATE POLICY "Allow anon to view live game state"
ON game_live_state FOR SELECT
TO anon
USING (true);

-- Allow anonymous users (guests) to insert live game state
-- CRITICAL for transitioning from blind phase to live phase
DROP POLICY IF EXISTS "Allow anon to insert live game state" ON game_live_state;
CREATE POLICY "Allow anon to insert live game state"
ON game_live_state FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous users (guests) to update live game state
-- Needed for making moves and updating clock
DROP POLICY IF EXISTS "Allow anon to update live game state" ON game_live_state;
CREATE POLICY "Allow anon to update live game state"
ON game_live_state FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Allow anonymous users (guests) to view live moves
-- Needed to see move history
DROP POLICY IF EXISTS "Allow anon to view live moves" ON game_live_moves;
CREATE POLICY "Allow anon to view live moves"
ON game_live_moves FOR SELECT
TO anon
USING (true);

-- Allow anonymous users (guests) to insert live moves
-- CRITICAL for making moves in live phase
DROP POLICY IF EXISTS "Allow anon to insert live moves" ON game_live_moves;
CREATE POLICY "Allow anon to insert live moves"
ON game_live_moves FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous users (guests) to upsert player presence
-- Needed for heartbeat/online status tracking
DROP POLICY IF EXISTS "Allow anon to upsert player presence" ON player_presence;
CREATE POLICY "Allow anon to upsert player presence"
ON player_presence FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon to update player presence" ON player_presence;
CREATE POLICY "Allow anon to update player presence"
ON player_presence FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

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

-- ============================================
-- STEP 8: Add better error logging to payment function
-- ============================================

CREATE OR REPLACE FUNCTION charge_entry_fees_and_start_game(room_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  room_data RECORD;
  white_player RECORD;
  black_player RECORD;
  total_pot INTEGER;
BEGIN
  RAISE NOTICE '💰 charge_entry_fees_and_start_game called for room: %', room_uuid;

  SELECT * INTO room_data
  FROM game_rooms
  WHERE id = room_uuid
  FOR UPDATE;

  IF room_data IS NULL THEN
    RAISE NOTICE '❌ Room not found: %', room_uuid;
    RETURN jsonb_build_object('success', false, 'reason', 'room_not_found');
  END IF;

  RAISE NOTICE '📊 Room status: %, players: %', room_data.status, room_data.current_players;

  -- Accept BOTH 'starting' AND 'waiting' status (for bot-injected rooms)
  IF room_data.status NOT IN ('starting', 'waiting') THEN
    RAISE NOTICE '❌ Invalid room status: %', room_data.status;
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'invalid_room_state',
      'current_status', room_data.status
    );
  END IF;

  -- Get white player with bot check
  SELECT p.*, grp.color, p.is_bot INTO white_player
  FROM players p
  JOIN game_room_players grp ON p.id = grp.player_id
  WHERE grp.room_id = room_uuid AND grp.color = 'white';

  -- Get black player with bot check
  SELECT p.*, grp.color, p.is_bot INTO black_player
  FROM players p
  JOIN game_room_players grp ON p.id = grp.player_id
  WHERE grp.room_id = room_uuid AND grp.color = 'black';

  RAISE NOTICE '👥 White player: % (bot: %), Black player: % (bot: %)',
    white_player.username, white_player.is_bot, black_player.username, black_player.is_bot;

  -- Check gold ONLY for human players
  IF white_player.is_bot IS NULL OR white_player.is_bot = FALSE THEN
    RAISE NOTICE '💰 White player gold: %, entry fee: %', white_player.gold_balance, room_data.entry_fee;
    IF white_player.gold_balance < room_data.entry_fee THEN
      RAISE NOTICE '❌ White player insufficient gold';
      RETURN jsonb_build_object('success', false, 'reason', 'white_insufficient_gold', 'player_id', white_player.id);
    END IF;
  END IF;

  IF black_player.is_bot IS NULL OR black_player.is_bot = FALSE THEN
    RAISE NOTICE '💰 Black player gold: %, entry fee: %', black_player.gold_balance, room_data.entry_fee;
    IF black_player.gold_balance < room_data.entry_fee THEN
      RAISE NOTICE '❌ Black player insufficient gold';
      RETURN jsonb_build_object('success', false, 'reason', 'black_insufficient_gold', 'player_id', black_player.id);
    END IF;
  END IF;

  -- Deduct entry fee ONLY from human players
  IF white_player.is_bot IS NULL OR white_player.is_bot = FALSE THEN
    RAISE NOTICE '💳 Charging white player: %', room_data.entry_fee;
    UPDATE players
    SET gold_balance = gold_balance - room_data.entry_fee
    WHERE id = white_player.id;

    -- Log transaction for human player
    INSERT INTO gold_transactions (player_id, amount, transaction_type, description, game_id, balance_after)
    VALUES (
      white_player.id,
      -room_data.entry_fee,
      'game_entry_fee',
      'BlindChess 5+0 Battle Entry',
      room_uuid,
      white_player.gold_balance - room_data.entry_fee
    );
  END IF;

  IF black_player.is_bot IS NULL OR black_player.is_bot = FALSE THEN
    RAISE NOTICE '💳 Charging black player: %', room_data.entry_fee;
    UPDATE players
    SET gold_balance = gold_balance - room_data.entry_fee
    WHERE id = black_player.id;

    -- Log transaction for human player
    INSERT INTO gold_transactions (player_id, amount, transaction_type, description, game_id, balance_after)
    VALUES (
      black_player.id,
      -room_data.entry_fee,
      'game_entry_fee',
      'BlindChess 5+0 Battle Entry',
      room_uuid,
      black_player.gold_balance - room_data.entry_fee
    );
  END IF;

  -- Update room status to blind phase
  UPDATE game_rooms
  SET status = 'blind',
      entry_fees_charged = TRUE,
      updated_at = NOW()
  WHERE id = room_uuid;

  -- Mark both players as ready
  UPDATE game_room_players
  SET ready = TRUE
  WHERE room_id = room_uuid;

  -- Calculate total pot (bots contribute to pot even though they don't pay from their balance)
  total_pot := room_data.entry_fee * 2;

  RAISE NOTICE '✅ Payment successful! Total pot: %, game starting', total_pot;

  RETURN jsonb_build_object(
    'success', true,
    'room_id', room_uuid,
    'total_pot', total_pot,
    'phase', 'blind'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '💥 Exception in charge_entry_fees_and_start_game: % - %', SQLSTATE, SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'reason', 'error',
    'message', SQLERRM,
    'sqlstate', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION charge_entry_fees_and_start_game TO authenticated, anon;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Guest bot matchmaking fix applied!';
    RAISE NOTICE '';
    RAISE NOTICE '🔓 RLS policies updated for anonymous (guest) users:';
    RAISE NOTICE '   ✅ SELECT on game_rooms';
    RAISE NOTICE '   ✅ UPDATE on game_rooms (for payment to change status to blind)';
    RAISE NOTICE '   ✅ SELECT on game_room_players';
    RAISE NOTICE '   ✅ UPDATE on game_room_players (for bot ready status)';
    RAISE NOTICE '   ✅ SELECT on players (for payment to check gold)';
    RAISE NOTICE '   ✅ UPDATE on players (for payment to deduct gold)';
    RAISE NOTICE '   ✅ INSERT on gold_transactions (for payment logging)';
    RAISE NOTICE '   ✅ SELECT on game_blind_moves (to view blind moves)';
    RAISE NOTICE '   ✅ INSERT on game_blind_moves (to make moves in blind phase)';
    RAISE NOTICE '   ✅ UPDATE on game_blind_moves (to submit moves)';
    RAISE NOTICE '   ✅ DELETE on game_blind_moves (to undo moves)';
    RAISE NOTICE '   ✅ SELECT on game_live_state (to view live game)';
    RAISE NOTICE '   ✅ INSERT on game_live_state (to create live game after blind phase)';
    RAISE NOTICE '   ✅ UPDATE on game_live_state (to update board and clock)';
    RAISE NOTICE '   ✅ SELECT on game_live_moves (to view move history)';
    RAISE NOTICE '   ✅ INSERT on game_live_moves (to make moves in live phase)';
    RAISE NOTICE '';
    RAISE NOTICE '🤖 inject_bot_into_room function updated:';
    RAISE NOTICE '   - Better error messages';
    RAISE NOTICE '   - Debug logging';
    RAISE NOTICE '   - Runs as SECURITY DEFINER';
    RAISE NOTICE '';
    RAISE NOTICE '💰 charge_entry_fees_and_start_game function updated:';
    RAISE NOTICE '   - Added comprehensive debug logging';
    RAISE NOTICE '   - Better error messages';
    RAISE NOTICE '   - Tracks exactly where payment fails';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test with:';
    RAISE NOTICE '   1. Open app in incognito mode';
    RAISE NOTICE '   2. Click TRY AS GUEST';
    RAISE NOTICE '   3. Join a free arena (0 gold)';
    RAISE NOTICE '   4. Wait 8 seconds - bot should join';
    RAISE NOTICE '   5. Bot marks ready after 1 second';
    RAISE NOTICE '   6. Click ready as guest';
    RAISE NOTICE '   7. Game should start and route to blind phase!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 If issues occur:';
    RAISE NOTICE '   - Check browser console for payment errors';
    RAISE NOTICE '   - Check Supabase Logs → Postgres Logs for NOTICE messages';
    RAISE NOTICE '   - Look for 💰, 👥, ❌, ✅ emoji indicators';
END $$;
