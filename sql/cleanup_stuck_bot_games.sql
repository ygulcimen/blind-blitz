-- ============================================
-- CLEANUP STUCK BOT GAMES
-- Frees up bots that are stuck in rooms that never properly started
-- ============================================

-- ============================================
-- STEP 1: View stuck bots (for diagnosis)
-- ============================================

-- Check bots that are in game_room_players but rooms are stuck
SELECT
    p.username as bot_name,
    p.rating as bot_rating,
    gr.id as room_id,
    gr.status as room_status,
    gr.current_players,
    gr.created_at,
    gr.updated_at,
    EXTRACT(EPOCH FROM (NOW() - gr.updated_at)) / 60 as minutes_since_update
FROM players p
JOIN game_room_players grp ON p.id = grp.player_id
JOIN game_rooms gr ON grp.room_id = gr.id
WHERE p.is_bot = TRUE
    AND gr.status IN ('waiting', 'starting')  -- Stuck in pre-game states
    AND gr.updated_at < NOW() - INTERVAL '2 minutes'  -- No activity for 2+ minutes
ORDER BY gr.updated_at DESC;

-- ============================================
-- STEP 2: Cleanup stuck bot games
-- ============================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS cleanup_stuck_bot_games();

-- Function to cleanup stuck bot games
CREATE OR REPLACE FUNCTION cleanup_stuck_bot_games()
RETURNS TABLE(
    room_id UUID,
    room_status TEXT,
    bots_freed INTEGER,
    action TEXT
) AS $$
DECLARE
    stuck_room RECORD;
    bots_in_room INTEGER;
BEGIN
    -- Find rooms that are stuck (waiting/starting for 2+ minutes)
    FOR stuck_room IN
        SELECT DISTINCT gr.id, gr.status, gr.updated_at
        FROM game_rooms gr
        JOIN game_room_players grp ON gr.id = grp.room_id
        JOIN players p ON grp.player_id = p.id
        WHERE gr.status IN ('waiting', 'starting')
            AND gr.updated_at < NOW() - INTERVAL '2 minutes'
            AND p.is_bot = TRUE
    LOOP
        -- Count bots in this room
        SELECT COUNT(*) INTO bots_in_room
        FROM game_room_players grp
        JOIN players p ON grp.player_id = p.id
        WHERE grp.room_id = stuck_room.id
            AND p.is_bot = TRUE;

        -- Delete the room (will cascade to game_room_players)
        DELETE FROM game_rooms WHERE id = stuck_room.id;

        RETURN QUERY SELECT
            stuck_room.id,
            stuck_room.status,
            bots_in_room,
            'Room deleted, bots freed'::TEXT;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 3: Force free all bots (NUCLEAR OPTION)
-- ============================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS force_free_all_bots();

-- WARNING: Only use this if you want to free ALL bots immediately
-- This will delete ALL rooms that have bots and are not in live phase

CREATE OR REPLACE FUNCTION force_free_all_bots()
RETURNS TABLE(
    rooms_deleted INTEGER,
    bots_freed INTEGER,
    message TEXT
) AS $$
DECLARE
    deleted_count INTEGER;
    bot_count INTEGER;
BEGIN
    -- Count affected rooms
    SELECT COUNT(DISTINCT gr.id) INTO deleted_count
    FROM game_rooms gr
    JOIN game_room_players grp ON gr.id = grp.room_id
    JOIN players p ON grp.player_id = p.id
    WHERE p.is_bot = TRUE
        AND gr.status IN ('waiting', 'starting', 'blind');

    -- Count bots in those rooms
    SELECT COUNT(*) INTO bot_count
    FROM game_room_players grp
    JOIN players p ON grp.player_id = p.id
    JOIN game_rooms gr ON grp.room_id = gr.id
    WHERE p.is_bot = TRUE
        AND gr.status IN ('waiting', 'starting', 'blind');

    -- Delete all non-live rooms with bots
    DELETE FROM game_rooms
    WHERE id IN (
        SELECT DISTINCT gr.id
        FROM game_rooms gr
        JOIN game_room_players grp ON gr.id = grp.room_id
        JOIN players p ON grp.player_id = p.id
        WHERE p.is_bot = TRUE
            AND gr.status IN ('waiting', 'starting', 'blind')
    );

    RETURN QUERY SELECT
        deleted_count,
        bot_count,
        'All non-live bot rooms deleted. Bots are now available.'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 4: Check bot availability after cleanup
-- ============================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_all_bots_status();

CREATE OR REPLACE FUNCTION check_all_bots_status()
RETURNS TABLE(
    bot_name TEXT,
    bot_rating INTEGER,
    is_available BOOLEAN,
    current_room_id UUID,
    room_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.username,
        p.rating,
        is_bot_available(p.id),
        grp.room_id,
        gr.status
    FROM players p
    LEFT JOIN game_room_players grp ON p.id = grp.player_id
    LEFT JOIN game_rooms gr ON grp.room_id = gr.id
    WHERE p.is_bot = TRUE
    ORDER BY p.rating;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================

-- 1. View stuck bots (safe, read-only)
-- Run the SELECT query at the top of this file

-- 2. Cleanup stuck bot games (safe, only cleans 2+ minute old stuck rooms)
-- SELECT * FROM cleanup_stuck_bot_games();

-- 3. Check bot status after cleanup
-- SELECT * FROM check_all_bots_status();

-- 4. NUCLEAR OPTION - Free all bots immediately (use with caution!)
-- SELECT * FROM force_free_all_bots();

-- ============================================
-- RECOMMENDED WORKFLOW
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '🤖 Bot Cleanup Script Loaded!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Available Functions:';
    RAISE NOTICE '   1. cleanup_stuck_bot_games() - Clean up rooms stuck for 2+ minutes';
    RAISE NOTICE '   2. force_free_all_bots() - Nuclear option: free ALL bots';
    RAISE NOTICE '   3. check_all_bots_status() - Check which bots are available';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Quick Fix:';
    RAISE NOTICE '   SELECT * FROM cleanup_stuck_bot_games();';
    RAISE NOTICE '   SELECT * FROM check_all_bots_status();';
    RAISE NOTICE '';
    RAISE NOTICE '💣 Nuclear Option (if quick fix doesnt work):';
    RAISE NOTICE '   SELECT * FROM force_free_all_bots();';
END $$;
