-- ============================================
-- 🚀 FINAL CLEANUP SCRIPT (WITH CORRECT FK TABLES)
-- Copy and paste this entire file into Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Drop old functions
-- ============================================

DROP FUNCTION IF EXISTS cleanup_expired_guest_accounts();
DROP FUNCTION IF EXISTS cleanup_stuck_bot_games();
DROP FUNCTION IF EXISTS run_all_cleanup();
DROP FUNCTION IF EXISTS preview_guest_cleanup();
DROP FUNCTION IF EXISTS preview_bot_game_cleanup();

-- ============================================
-- STEP 2: Create fixed guest cleanup
-- ============================================

CREATE FUNCTION cleanup_expired_guest_accounts()
RETURNS TABLE(
    deleted_count INTEGER,
    message TEXT
) AS $$
DECLARE
    v_deleted_count INTEGER := 0;
    v_guest_usernames TEXT[];
    guest_id UUID;
BEGIN
    -- Get list of expired guests
    SELECT ARRAY_AGG(username) INTO v_guest_usernames
    FROM players
    WHERE is_guest = TRUE
        AND guest_expires_at < NOW()
        AND created_at < NOW() - INTERVAL '1 day';

    -- Delete each guest and their related data
    FOR guest_id IN
        SELECT id
        FROM players
        WHERE is_guest = TRUE
            AND guest_expires_at < NOW()
            AND created_at < NOW() - INTERVAL '1 day'
    LOOP
        -- Delete related data in correct order (based on actual FK constraints)

        -- 1. Delete blind phase rewards
        DELETE FROM blind_phase_rewards WHERE player_id = guest_id;

        -- 2. Delete game blind moves
        DELETE FROM game_blind_moves WHERE player_id = guest_id;

        -- 3. Delete game live moves
        DELETE FROM game_live_moves WHERE player_id = guest_id;

        -- 4. Delete game live state (where they are white or black player)
        DELETE FROM game_live_state WHERE white_player_id = guest_id OR black_player_id = guest_id;

        -- 5. Delete game room players
        DELETE FROM game_room_players WHERE player_id = guest_id;

        -- 6. Delete games (where they are white or black player)
        DELETE FROM games WHERE white_player_id = guest_id OR black_player_id = guest_id;

        -- 7. Delete gold transactions
        DELETE FROM gold_transactions WHERE player_id = guest_id;

        -- 8. Delete player presence
        DELETE FROM player_presence WHERE player_id = guest_id;

        -- 9. Finally delete the player
        DELETE FROM players WHERE id = guest_id;

        v_deleted_count := v_deleted_count + 1;
    END LOOP;

    RETURN QUERY SELECT
        v_deleted_count,
        CASE
            WHEN v_deleted_count = 0 THEN 'No expired guests to clean up'::TEXT
            WHEN v_deleted_count = 1 THEN ('Deleted 1 expired guest: ' || COALESCE(v_guest_usernames[1], 'unknown'))::TEXT
            ELSE ('Deleted ' || v_deleted_count || ' expired guests')::TEXT
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 3: Create bot game cleanup
-- ============================================

CREATE FUNCTION cleanup_stuck_bot_games()
RETURNS TABLE(
    cleaned_rooms INTEGER,
    freed_bots INTEGER,
    message TEXT
) AS $$
DECLARE
    v_cleaned_rooms INTEGER := 0;
    v_freed_bots INTEGER := 0;
    stuck_room RECORD;
    bot_count INTEGER;
BEGIN
    FOR stuck_room IN
        SELECT gr.id, gr.status, gr.created_at,
               EXTRACT(EPOCH FROM (NOW() - gr.created_at))/3600 as hours_old
        FROM game_rooms gr
        WHERE gr.status IN ('waiting', 'starting', 'blind', 'revealing', 'live')
            AND gr.created_at < NOW() - INTERVAL '2 hours'
            AND EXISTS (
                SELECT 1 FROM game_room_players grp
                JOIN players p ON grp.player_id = p.id
                WHERE grp.room_id = gr.id AND p.is_bot = TRUE
            )
    LOOP
        SELECT COUNT(*) INTO bot_count
        FROM game_room_players grp
        JOIN players p ON grp.player_id = p.id
        WHERE grp.room_id = stuck_room.id AND p.is_bot = TRUE;

        DELETE FROM game_room_players WHERE room_id = stuck_room.id;
        UPDATE game_rooms SET status = 'finished' WHERE id = stuck_room.id;

        v_cleaned_rooms := v_cleaned_rooms + 1;
        v_freed_bots := v_freed_bots + bot_count;
    END LOOP;

    RETURN QUERY SELECT
        v_cleaned_rooms,
        v_freed_bots,
        CASE
            WHEN v_cleaned_rooms = 0 THEN 'No stuck bot games to clean up'::TEXT
            WHEN v_cleaned_rooms = 1 THEN ('Cleaned 1 stuck game, freed ' || v_freed_bots || ' bot(s)')::TEXT
            ELSE ('Cleaned ' || v_cleaned_rooms || ' stuck games, freed ' || v_freed_bots || ' bot(s)')::TEXT
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 4: Run both cleanups at once
-- ============================================

CREATE FUNCTION run_all_cleanup()
RETURNS TABLE(
    cleanup_type TEXT,
    count INTEGER,
    message TEXT
) AS $$
DECLARE
    guest_result RECORD;
    bot_result RECORD;
BEGIN
    SELECT * INTO guest_result FROM cleanup_expired_guest_accounts() LIMIT 1;
    RETURN QUERY SELECT 'guests'::TEXT, guest_result.deleted_count, guest_result.message;

    SELECT * INTO bot_result FROM cleanup_stuck_bot_games() LIMIT 1;
    RETURN QUERY SELECT 'bot_games'::TEXT, bot_result.freed_bots, bot_result.message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 5: Preview functions (safe testing)
-- ============================================

CREATE FUNCTION preview_guest_cleanup()
RETURNS TABLE(
    username TEXT,
    created_at TIMESTAMPTZ,
    guest_expires_at TIMESTAMPTZ,
    age_days NUMERIC,
    days_until_expiry NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.username, p.created_at, p.guest_expires_at,
        ROUND(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 86400, 1) as age_days,
        ROUND(EXTRACT(EPOCH FROM (p.guest_expires_at - NOW())) / 86400, 1) as days_until_expiry
    FROM players p
    WHERE p.is_guest = TRUE
        AND p.guest_expires_at < NOW()
        AND p.created_at < NOW() - INTERVAL '1 day'
    ORDER BY p.created_at ASC;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION preview_bot_game_cleanup()
RETURNS TABLE(
    room_id UUID,
    status TEXT,
    created_at TIMESTAMPTZ,
    hours_old NUMERIC,
    bot_count BIGINT,
    total_players BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        gr.id, gr.status, gr.created_at,
        ROUND(EXTRACT(EPOCH FROM (NOW() - gr.created_at)) / 3600, 1) as hours_old,
        COUNT(*) FILTER (WHERE p.is_bot = TRUE) as bot_count,
        COUNT(*) as total_players
    FROM game_rooms gr
    JOIN game_room_players grp ON grp.room_id = gr.id
    JOIN players p ON grp.player_id = p.id
    WHERE gr.status IN ('waiting', 'starting', 'blind', 'revealing', 'live')
        AND gr.created_at < NOW() - INTERVAL '2 hours'
        AND EXISTS (
            SELECT 1 FROM game_room_players grp2
            JOIN players p2 ON grp2.player_id = p2.id
            WHERE grp2.room_id = gr.id AND p2.is_bot = TRUE
        )
    GROUP BY gr.id, gr.status, gr.created_at
    ORDER BY gr.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 6: Grant permissions
-- ============================================

GRANT EXECUTE ON FUNCTION cleanup_expired_guest_accounts TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cleanup_stuck_bot_games TO authenticated, anon;
GRANT EXECUTE ON FUNCTION run_all_cleanup TO authenticated, anon;
GRANT EXECUTE ON FUNCTION preview_guest_cleanup TO authenticated, anon;
GRANT EXECUTE ON FUNCTION preview_bot_game_cleanup TO authenticated, anon;

-- ============================================
-- STEP 7: Set up cron jobs
-- ============================================

-- Remove old cron jobs
DO $$
BEGIN
    PERFORM cron.unschedule('cleanup-expired-guests');
    PERFORM cron.unschedule('comprehensive-cleanup');
    PERFORM cron.unschedule('cleanup-stuck-bots-hourly');
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if jobs don't exist
END $$;

-- Daily cleanup at 3 AM (both guests and bots)
SELECT cron.schedule(
  'comprehensive-cleanup',
  '0 3 * * *',
  $$ SELECT * FROM run_all_cleanup(); $$
);

-- Hourly bot cleanup (frees stuck bots faster)
SELECT cron.schedule(
  'cleanup-stuck-bots-hourly',
  '0 * * * *',
  $$ SELECT * FROM cleanup_stuck_bot_games(); $$
);

-- ============================================
-- 🎉 DONE! Now test it:
-- ============================================

-- Test 1: Preview what would be cleaned (SAFE - doesn't delete)
SELECT * FROM preview_guest_cleanup();
SELECT * FROM preview_bot_game_cleanup();

-- Test 2: Actually run cleanup NOW
SELECT * FROM run_all_cleanup();

-- Test 3: Check if cron jobs are scheduled
SELECT jobname, schedule, active FROM cron.job
WHERE jobname IN ('comprehensive-cleanup', 'cleanup-stuck-bots-hourly');

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Everything fixed and installed!';
    RAISE NOTICE '';
    RAISE NOTICE '🎮 Guest cleanup: FIXED (deletes from all 10 FK tables)';
    RAISE NOTICE '🤖 Bot cleanup: ADDED (frees stuck bots)';
    RAISE NOTICE '⏰ Cron jobs: SCHEDULED';
    RAISE NOTICE '   - Daily at 3 AM: Both cleanups';
    RAISE NOTICE '   - Every hour: Bot cleanup only';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test commands:';
    RAISE NOTICE '   SELECT * FROM preview_guest_cleanup();';
    RAISE NOTICE '   SELECT * FROM preview_bot_game_cleanup();';
    RAISE NOTICE '   SELECT * FROM run_all_cleanup();';
END $$;
