-- ============================================
-- TEST COLOR RANDOMIZATION
-- This script tests if colors are properly randomized
-- for both human vs human and human vs bot games
-- ============================================

-- ============================================
-- OPTION 1: Simple check of recent games
-- ============================================

-- Check color distribution in recent bot games
-- (Look for games where one player is a bot)
SELECT
    grp.player_username,
    p.is_bot,
    grp.color,
    COUNT(*) as game_count
FROM game_room_players grp
JOIN players p ON grp.player_id = p.id
WHERE grp.created_at > NOW() - INTERVAL '1 hour'
    AND grp.room_id IN (
        -- Rooms with exactly one bot
        SELECT room_id
        FROM game_room_players grp2
        JOIN players p2 ON grp2.player_id = p2.id
        WHERE p2.is_bot = TRUE
        GROUP BY room_id
        HAVING COUNT(*) = 1
    )
GROUP BY grp.player_username, p.is_bot, grp.color
ORDER BY p.is_bot, grp.color;

-- ============================================
-- OPTION 2: Check your recent games specifically
-- ============================================

-- Replace 'YOUR_USERNAME' with your actual username
-- This shows your color distribution in recent games
SELECT
    grp.color,
    COUNT(*) as times_played,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM game_room_players grp
JOIN players p ON grp.player_id = p.id
WHERE p.username = 'YOUR_USERNAME'  -- ⬅️ CHANGE THIS
    AND grp.created_at > NOW() - INTERVAL '1 day'
GROUP BY grp.color
ORDER BY grp.color;

-- ============================================
-- OPTION 3: Detailed view of your recent games
-- ============================================

-- Shows each of your recent games with colors
SELECT
    gr.id as room_id,
    gr.created_at,
    gr.mode,
    grp.color as your_color,
    grp2.player_username as opponent,
    p2.is_bot as opponent_is_bot,
    grp2.color as opponent_color
FROM game_room_players grp
JOIN game_rooms gr ON grp.room_id = gr.id
JOIN players p ON grp.player_id = p.id
LEFT JOIN game_room_players grp2 ON grp2.room_id = gr.id AND grp2.player_id != grp.player_id
LEFT JOIN players p2 ON grp2.player_id = p2.id
WHERE p.username = 'YOUR_USERNAME'  -- ⬅️ CHANGE THIS
    AND gr.created_at > NOW() - INTERVAL '1 day'
ORDER BY gr.created_at DESC
LIMIT 20;

-- ============================================
-- OPTION 4: Force test with manual bot injection
-- ============================================

-- Step 1: Create a test room (run this, note the returned ID)
/*
INSERT INTO game_rooms (name, mode, entry_fee, max_players, time_control, status, host_username)
VALUES ('Color Test Room', 'classic', 0, 2, '5+0', 'waiting', 'TestUser')
RETURNING id, name;
*/

-- Step 2: Add yourself to the room (replace ROOM_ID and YOUR_PLAYER_ID)
/*
INSERT INTO game_room_players (room_id, player_id, player_username, player_rating, ready, color)
VALUES ('ROOM_ID'::UUID, 'YOUR_PLAYER_ID'::UUID, 'YOUR_USERNAME', 1200, false, 'white')
RETURNING *;
*/

-- Step 3: Inject a bot (replace ROOM_ID)
/*
SELECT * FROM inject_bot_into_room('ROOM_ID'::UUID, 800, 2500);
*/

-- Step 4: Check the colors
/*
SELECT player_username, color, created_at
FROM game_room_players
WHERE room_id = 'ROOM_ID'::UUID
ORDER BY created_at;
*/

-- ============================================
-- OPTION 5: Check if trigger is active
-- ============================================

-- Verify the trigger exists and is enabled
SELECT
    trigger_name,
    event_manipulation,
    action_timing,
    tgenabled as is_enabled
FROM information_schema.triggers
WHERE trigger_name = 'trigger_assign_random_colors';

-- ============================================
-- OPTION 6: Check if inject_bot function is updated
-- ============================================

-- Check if the function contains the randomization code
SELECT
    p.proname as function_name,
    CASE
        WHEN pg_get_functiondef(p.oid) LIKE '%assigned_human_color%' THEN '✅ Has color randomization'
        ELSE '❌ Missing color randomization'
    END as randomization_status,
    CASE
        WHEN pg_get_functiondef(p.oid) LIKE '%random()%' THEN '✅ Uses random()'
        ELSE '❌ No random() call'
    END as random_check
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname = 'inject_bot_into_room';
