-- ============================================
-- COMPREHENSIVE BOT CLEANUP - FREE ALL BOTS
-- Removes bots from ALL rooms (finished, revealing, live, etc.)
-- ============================================

-- Function to force cleanup ALL bot rooms (including finished games)
CREATE OR REPLACE FUNCTION force_cleanup_all_bot_rooms()
RETURNS TABLE(
    rooms_deleted INTEGER,
    players_removed INTEGER,
    message TEXT
) AS $$
DECLARE
    deleted_count INTEGER;
    players_removed_count INTEGER;
BEGIN
    -- Count rooms that will be affected
    SELECT COUNT(DISTINCT grp.room_id) INTO deleted_count
    FROM game_room_players grp
    JOIN players p ON grp.player_id = p.id
    WHERE p.is_bot = TRUE;

    -- Count player entries that will be removed
    SELECT COUNT(*) INTO players_removed_count
    FROM game_room_players grp
    JOIN players p ON grp.player_id = p.id
    WHERE p.is_bot = TRUE;

    -- STEP 1: Remove all bot entries from game_room_players
    -- This instantly frees the bots
    DELETE FROM game_room_players
    WHERE player_id IN (
        SELECT id FROM players WHERE is_bot = TRUE
    );

    RETURN QUERY SELECT
        deleted_count,
        players_removed_count,
        'All bot entries removed from game_room_players. Bots are now available!'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '🤖 COMPREHENSIVE BOT CLEANUP LOADED!';
    RAISE NOTICE '';
    RAISE NOTICE '💣 This will remove ALL bots from ALL rooms (finished, live, etc.)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 To free all bots immediately:';
    RAISE NOTICE '   SELECT * FROM force_cleanup_all_bot_rooms();';
    RAISE NOTICE '';
    RAISE NOTICE '✅ To verify all bots are free:';
    RAISE NOTICE '   SELECT username, is_bot_available(id) FROM players WHERE is_bot = TRUE;';
END $$;
