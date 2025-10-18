-- ============================================
-- VERIFY CELESTIAL BOT SYSTEM SETUP
-- Run this in Supabase SQL Editor to verify everything is set up correctly
-- ============================================

-- Check 1: Verify bot players exist
SELECT '✅ Check 1: Bot Players' AS check_name;
SELECT
  id,
  username,
  rating,
  is_bot,
  games_played,
  wins,
  losses,
  draws,
  gold_balance
FROM players
WHERE is_bot = TRUE
ORDER BY rating DESC;

-- Check 2: Verify celestial_bot_configs view exists and has data
SELECT '✅ Check 2: Bot Configs View' AS check_name;
SELECT
  username,
  config->>'name' as bot_name,
  config->>'difficulty' as difficulty,
  config->'live_phase'->>'search_depth' as search_depth
FROM celestial_bot_configs
ORDER BY (config->'live_phase'->>'search_depth')::int DESC;

-- Check 3: Test is_bot_available function
SELECT '✅ Check 3: Bot Availability Function' AS check_name;
SELECT
  p.username,
  is_bot_available(p.id) as is_available
FROM players p
WHERE p.is_bot = TRUE
ORDER BY p.rating DESC;

-- Check 4: Test get_available_celestial_bot function
SELECT '✅ Check 4: Get Available Bot Function' AS check_name;
SELECT * FROM get_available_celestial_bot(1200, 1600);

-- Check 5: Verify all required functions exist
SELECT '✅ Check 5: Required Functions' AS check_name;
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'is_bot_available',
    'get_available_celestial_bot',
    'inject_bot_into_room',
    'get_room_wait_time',
    'check_and_inject_bots'
  )
ORDER BY routine_name;

-- Check 6: Verify permissions
SELECT '✅ Check 6: Function Permissions' AS check_name;
SELECT
  routine_name,
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name IN (
    'is_bot_available',
    'get_available_celestial_bot',
    'inject_bot_into_room'
  )
  AND grantee IN ('authenticated', 'anon')
ORDER BY routine_name, grantee;

-- Check 7: Verify game_room_players table has color column
SELECT '✅ Check 7: Table Structure' AS check_name;
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'game_room_players'
  AND column_name IN ('room_id', 'player_id', 'color', 'ready', 'player_username', 'player_rating')
ORDER BY column_name;

-- Summary
SELECT '🎯 SUMMARY' AS check_name;
SELECT
  (SELECT COUNT(*) FROM players WHERE is_bot = TRUE) as total_bots,
  (SELECT COUNT(*) FROM players WHERE is_bot = TRUE AND is_bot_available(id)) as available_bots,
  (SELECT COUNT(*) FROM celestial_bot_configs) as bot_configs,
  (SELECT COUNT(*) FROM information_schema.routines
   WHERE routine_schema = 'public'
   AND routine_name IN ('is_bot_available', 'get_available_celestial_bot', 'inject_bot_into_room')
  ) as required_functions;

-- If everything is correct, you should see:
-- ✅ 5 total_bots
-- ✅ 5 available_bots (if no games are active)
-- ✅ 5 bot_configs
-- ✅ 3 required_functions
