-- ============================================
-- RANDOMIZE PLAYER COLORS IN ROOMS
-- Fix: Players always getting white when creating rooms
-- Solution: Randomly assign colors to both players
--
-- IMPORTANT: Only randomizes for HUMAN vs HUMAN games
-- Bot games keep their deterministic color assignment
-- (Bot gets opposite color of the human player)
-- ============================================

-- Helper function to assign random colors when second player joins
CREATE OR REPLACE FUNCTION assign_random_colors_on_join()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_random_color TEXT;
    v_opposite_color TEXT;
    v_first_player_id UUID;
    v_first_player_is_bot BOOLEAN;
    v_second_player_is_bot BOOLEAN;
BEGIN
    -- Only trigger when second player joins (current_players becomes 2)
    IF (SELECT current_players FROM game_rooms WHERE id = NEW.room_id) = 2 THEN

        -- Get the first player (already in room)
        SELECT player_id INTO v_first_player_id
        FROM game_room_players
        WHERE room_id = NEW.room_id
        AND player_id != NEW.player_id
        LIMIT 1;

        -- Check if either player is a bot
        -- Bots have is_bot = true in the players table
        SELECT is_bot INTO v_first_player_is_bot
        FROM players
        WHERE id = v_first_player_id;

        SELECT is_bot INTO v_second_player_is_bot
        FROM players
        WHERE id = NEW.player_id;

        -- Only randomize if BOTH players are human (not bots)
        -- Note: is_bot is NULL for regular players, TRUE for bots
        IF COALESCE(v_first_player_is_bot, FALSE) = FALSE
           AND COALESCE(v_second_player_is_bot, FALSE) = FALSE THEN

            -- Randomly decide colors (50/50 chance)
            IF random() < 0.5 THEN
                v_random_color := 'white';
                v_opposite_color := 'black';
            ELSE
                v_random_color := 'black';
                v_opposite_color := 'white';
            END IF;

            -- Assign random color to first player
            UPDATE game_room_players
            SET color = v_random_color
            WHERE room_id = NEW.room_id
            AND player_id = v_first_player_id;

            -- Assign opposite color to second player (NEW player joining)
            NEW.color := v_opposite_color;

            RAISE NOTICE '🎲 Random colors assigned - First player: %, Second player: %',
                v_random_color, v_opposite_color;
        ELSE
            RAISE NOTICE '🤖 Bot detected - skipping color randomization (keeping assigned colors)';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_assign_random_colors ON game_room_players;

-- Create trigger that fires BEFORE INSERT on game_room_players
-- This ensures colors are randomized when second player joins
CREATE TRIGGER trigger_assign_random_colors
BEFORE INSERT ON game_room_players
FOR EACH ROW
EXECUTE FUNCTION assign_random_colors_on_join();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if trigger was created successfully
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_assign_random_colors';

-- Test the randomization by creating a test room
-- (Run this manually to verify colors are random)
/*
-- Create test room
INSERT INTO game_rooms (name, mode, entry_fee, max_players, time_control, status, host_username)
VALUES ('Color Test Room', 'classic', 0, 2, '5+0', 'waiting', 'TestHost')
RETURNING id;

-- Add first player (will get initial color)
INSERT INTO game_room_players (room_id, player_id, player_username, player_rating, ready, color)
VALUES ('[ROOM_ID]', '[PLAYER1_ID]', 'Player1', 1200, false, 'white');

-- Add second player (this should trigger randomization)
INSERT INTO game_room_players (room_id, player_id, player_username, player_rating, ready, color)
VALUES ('[ROOM_ID]', '[PLAYER2_ID]', 'Player2', 1200, false, 'black');

-- Check the results
SELECT player_username, color
FROM game_room_players
WHERE room_id = '[ROOM_ID]'
ORDER BY created_at;
*/
