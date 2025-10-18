### calculate_elo_change

DECLARE
k_factor INTEGER := 32;
expected_score NUMERIC;
BEGIN
expected_score := 1.0 / (1.0 + POWER(10, (opponent_rating - player_rating) / 400.0));
RETURN ROUND(k_factor \* (result - expected_score));
END;

###

### can_claim_daily_reward

DECLARE
last_claim TIMESTAMP WITH TIME ZONE;
BEGIN
SELECT last_daily_claim INTO last_claim
FROM players
WHERE id = p_player_id;

    -- First time claiming
    IF last_claim IS NULL THEN
        RETURN jsonb_build_object(
            'can_claim', true,
            'reason', 'first_time'
        );
    END IF;

    -- 24 hours passed
    IF last_claim < NOW() - INTERVAL '24 hours' THEN
        RETURN jsonb_build_object(
            'can_claim', true,
            'next_claim_at', last_claim + INTERVAL '24 hours'
        );
    END IF;

    -- Cannot claim yet
    RETURN jsonb_build_object(
        'can_claim', false,
        'next_claim_at', last_claim + INTERVAL '24 hours',
        'time_remaining', (last_claim + INTERVAL '24 hours') - NOW()
    );

END;

###

### can_player_join_room

DECLARE
room_data RECORD;
player_gold BIGINT;
BEGIN
-- Get room data
SELECT \* INTO room_data FROM game_rooms WHERE id = room_uuid;

    -- Room doesn't exist
    IF room_data IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Room is full
    IF room_data.current_players >= room_data.max_players THEN
        RETURN FALSE;
    END IF;

    -- Room is not waiting
    IF room_data.status != 'waiting' THEN
        RETURN FALSE;
    END IF;

    -- Check if player already in room
    IF EXISTS(
        SELECT 1 FROM game_room_players
        WHERE room_id = room_uuid AND player_id = player_uuid
    ) THEN
        RETURN FALSE;
    END IF;

    -- Check player has enough gold
    SELECT gold_balance INTO player_gold FROM players WHERE id = player_uuid;
    IF player_gold < room_data.entry_fee THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;

END;

###

### charge_entry_fees_and_start_game

DECLARE
room_data RECORD;
white_player RECORD;
black_player RECORD;
total_pot INTEGER;
BEGIN
SELECT \* INTO room_data
FROM game_rooms
WHERE id = room_uuid
FOR UPDATE;

    IF room_data IS NULL THEN
        RETURN jsonb_build_object('success', false, 'reason', 'room_not_found');
    END IF;

    -- Accept BOTH 'starting' AND 'ready' status
    IF room_data.status NOT IN ('starting', 'ready') THEN
        RETURN jsonb_build_object(
            'success', false,
            'reason', 'invalid_room_state',
            'current_status', room_data.status
        );
    END IF;

    SELECT p.*, grp.color INTO white_player
    FROM players p
    JOIN game_room_players grp ON p.id = grp.player_id
    WHERE grp.room_id = room_uuid AND grp.color = 'white';

    SELECT p.*, grp.color INTO black_player
    FROM players p
    JOIN game_room_players grp ON p.id = grp.player_id
    WHERE grp.room_id = room_uuid AND grp.color = 'black';

    IF white_player.gold_balance < room_data.entry_fee THEN
        RETURN jsonb_build_object('success', false, 'reason', 'white_insufficient_gold', 'player_id', white_player.id);
    END IF;

    IF black_player.gold_balance < room_data.entry_fee THEN
        RETURN jsonb_build_object('success', false, 'reason', 'black_insufficient_gold', 'player_id', black_player.id);
    END IF;

    UPDATE players
    SET gold_balance = gold_balance - room_data.entry_fee
    WHERE id = white_player.id;

    UPDATE players
    SET gold_balance = gold_balance - room_data.entry_fee
    WHERE id = black_player.id;

    INSERT INTO gold_transactions (player_id, amount, transaction_type, description, game_id, balance_after)
    VALUES
    (white_player.id, -room_data.entry_fee, 'game_entry_fee', 'BlindChess 5+0 Battle Entry', room_uuid, white_player.gold_balance - room_data.entry_fee),
    (black_player.id, -room_data.entry_fee, 'game_entry_fee', 'BlindChess 5+0 Battle Entry', room_uuid, black_player.gold_balance - room_data.entry_fee);

    UPDATE game_rooms
    SET status = 'blind',
        entry_fees_charged = TRUE,
        updated_at = NOW()
    WHERE id = room_uuid;

    UPDATE game_room_players
    SET ready = TRUE
    WHERE room_id = room_uuid;

    total_pot := room_data.entry_fee * 2;

    RETURN jsonb_build_object(
        'success', true,
        'room_id', room_uuid,
        'total_pot', total_pot,
        'phase', 'blind'
    );

END;

###

### check_game_completion

DECLARE
white_submitted BOOLEAN := FALSE;
black_submitted BOOLEAN := FALSE;
current_room_status TEXT;
BEGIN
SELECT status INTO current_room_status
FROM game_rooms
WHERE id = p_game_id;

    IF current_room_status != 'blind' THEN
        RETURN 'already_processed';
    END IF;

    SELECT
        EXISTS(SELECT 1 FROM game_blind_moves WHERE game_id = p_game_id AND player_color = 'white' AND is_submitted = TRUE),
        EXISTS(SELECT 1 FROM game_blind_moves WHERE game_id = p_game_id AND player_color = 'black' AND is_submitted = TRUE)
    INTO white_submitted, black_submitted;

    IF white_submitted AND black_submitted THEN
        UPDATE game_rooms
        SET status = 'revealing', updated_at = NOW()
        WHERE id = p_game_id AND status = 'blind';

        RETURN 'revealing';
    END IF;

    RETURN 'waiting';

END;

###

### claim_daily_reward

DECLARE
player_record RECORD;
can_claim BOOLEAN := FALSE;
reward_amount INTEGER := 100;
new_balance BIGINT;
BEGIN
-- Get player data with lock
SELECT \* INTO player_record
FROM players
WHERE id = p_player_id
FOR UPDATE;

    IF player_record IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'reason', 'player_not_found'
        );
    END IF;

    -- Check if can claim (first time OR 24 hours passed)
    IF player_record.last_daily_claim IS NULL THEN
        can_claim := TRUE;
    ELSIF player_record.last_daily_claim < NOW() - INTERVAL '24 hours' THEN
        can_claim := TRUE;
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'reason', 'already_claimed',
            'next_claim_at', player_record.last_daily_claim + INTERVAL '24 hours',
            'time_remaining', (player_record.last_daily_claim + INTERVAL '24 hours') - NOW()
        );
    END IF;

    -- Award the reward
    IF can_claim THEN
        new_balance := player_record.gold_balance + reward_amount;

        UPDATE players
        SET gold_balance = new_balance,
            last_daily_claim = NOW()
        WHERE id = p_player_id;

        -- Log transaction
        INSERT INTO gold_transactions (
            player_id,
            amount,
            transaction_type,
            description,
            balance_after
        ) VALUES (
            p_player_id,
            reward_amount,
            'daily_reward',
            'Daily login bonus',
            new_balance
        );

        RETURN jsonb_build_object(
            'success', true,
            'reward', reward_amount,
            'new_balance', new_balance,
            'next_claim_at', NOW() + INTERVAL '24 hours'
        );
    END IF;

    RETURN jsonb_build_object('success', false, 'reason', 'unknown_error');

END;

###

### cleanup_abandoned_content

BEGIN
-- Use the enhanced matchmaking cleanup
RETURN cleanup_abandoned_matchmaking();
END;

###

### cleanup_abandoned_matchmaking

DECLARE
cleaned_count INTEGER := 0;
expired_count INTEGER := 0;
BEGIN
-- Mark players offline if not seen for 5 minutes
UPDATE player_presence
SET is_online = FALSE, status = 'away'
WHERE last_seen < NOW() - INTERVAL '5 minutes'
AND is_online = TRUE;

    -- Delete expired waiting rooms (auto-created ones)
    DELETE FROM game_rooms
    WHERE auto_created = TRUE
    AND status = 'waiting'
    AND (match_expires_at < NOW() OR match_expires_at IS NULL);

    GET DIAGNOSTICS expired_count = ROW_COUNT;

    -- Delete empty waiting rooms older than 30 minutes (manual ones)
    DELETE FROM game_rooms
    WHERE current_players = 0
    AND created_at < NOW() - INTERVAL '30 minutes'
    AND status = 'waiting'
    AND auto_created = FALSE;

    GET DIAGNOSTICS cleaned_count = ROW_COUNT;

    -- Delete old notifications
    DELETE FROM notifications
    WHERE expires_at < NOW();

    -- Refund entry fees for rooms stuck in 'starting' phase
    UPDATE players
    SET gold_balance = gold_balance + gr.entry_fee
    FROM game_rooms gr
    JOIN game_room_players grp ON gr.id = grp.room_id
    WHERE gr.status = 'starting'
    AND gr.created_at < NOW() - INTERVAL '10 minutes'
    AND gr.entry_fees_charged = FALSE
    AND players.id = grp.player_id;

    -- Clean up those stuck rooms
    DELETE FROM game_rooms
    WHERE status = 'starting'
    AND created_at < NOW() - INTERVAL '10 minutes'
    AND entry_fees_charged = FALSE;

    RETURN cleaned_count + expired_count;

END;

###

### cleanup_old_rooms

BEGIN
-- Clean up rooms older than 10 minutes with no real players
DELETE FROM game_rooms
WHERE status = 'waiting'
AND (
created_at < NOW() - INTERVAL '10 minutes'
OR (
current_players > 0
AND NOT EXISTS (
SELECT 1 FROM game_room_players
WHERE room_id = game_rooms.id
)
)
);
END;

###

### create_matchmaking_room

DECLARE
room_uuid UUID;
player_data RECORD;
match_timeout TIMESTAMP WITH TIME ZONE;
BEGIN
-- Get player info
SELECT username, rating INTO player_data
FROM players
WHERE id = player_uuid;

    IF player_data IS NULL THEN
        RAISE EXCEPTION 'Player not found';
    END IF;

    -- Set match timeout (5 minutes)
    match_timeout := NOW() + INTERVAL '5 minutes';

    -- Create room (trigger will auto-set game_mode from mode)
    INSERT INTO game_rooms (
        name,
        mode,
        entry_fee,
        max_players,
        time_control,
        status,
        current_players,
        host_id,
        host_username,
        rated,
        private,
        region,
        auto_created,
        match_expires_at,
        matchmaking_preferences
    ) VALUES (
        'BlindChess 5+0 Battle',
        p_mode,
        p_entry_fee,
        2,
        '5+0',
        'waiting',
        0,
        player_uuid,
        player_data.username,
        TRUE,
        FALSE,
        'global',
        TRUE,
        match_timeout,
        jsonb_build_object(
            'entry_fee_range', jsonb_build_array(p_entry_fee, p_entry_fee),
            'rating_flexibility', p_rating_flexibility,
            'created_by_rating', player_data.rating
        )
    )
    RETURNING id INTO room_uuid;

    -- Add creator as first player (no payment yet)
    INSERT INTO game_room_players (
        room_id,
        player_id,
        player_username,
        player_rating,
        ready,
        color
    ) VALUES (
        room_uuid,
        player_uuid,
        player_data.username,
        player_data.rating,
        FALSE,
        'white'
    );

    -- Update room count
    UPDATE game_rooms
    SET current_players = 1
    WHERE id = room_uuid;

    RETURN room_uuid;

END;

###

### distribute_final_rewards

DECLARE
reward_summary RECORD;
winner_id UUID;
loser_id UUID;
winner_amount INTEGER;
loser_amount INTEGER;
BEGIN
-- Get blind rewards
SELECT \* INTO reward_summary FROM get_blind_rewards(p_game_id);

    -- If no rewards calculated, exit early
    IF reward_summary IS NULL THEN
        RAISE NOTICE 'No reward summary found for game %', p_game_id;
        RETURN;
    END IF;

    -- Default NULL values to 0
    reward_summary.white_total_gold := COALESCE(reward_summary.white_total_gold, 0);
    reward_summary.black_total_gold := COALESCE(reward_summary.black_total_gold, 0);
    reward_summary.remaining_pot := COALESCE(reward_summary.remaining_pot, 0);

    -- Determine winner/loser based on result
    IF p_winner = 'white' THEN
        winner_id := reward_summary.white_player_id;
        loser_id := reward_summary.black_player_id;
        winner_amount := reward_summary.white_total_gold + reward_summary.remaining_pot;
        loser_amount := reward_summary.black_total_gold;
    ELSIF p_winner = 'black' THEN
        winner_id := reward_summary.black_player_id;
        loser_id := reward_summary.white_player_id;
        winner_amount := reward_summary.black_total_gold + reward_summary.remaining_pot;
        loser_amount := reward_summary.white_total_gold;
    END IF;

    -- Handle win/loss scenario
    IF winner_id IS NOT NULL THEN
        -- Winner gets their blind rewards + remaining pot
        UPDATE players
        SET gold_balance = gold_balance + winner_amount,
            wins = wins + 1,
            games_played = games_played + 1
        WHERE id = winner_id;

        -- Loser gets only their blind rewards
        UPDATE players
        SET gold_balance = gold_balance + loser_amount,
            losses = losses + 1,
            games_played = games_played + 1
        WHERE id = loser_id;

        -- Log transactions for winner (only if gold_transactions table exists)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gold_transactions') THEN
            INSERT INTO gold_transactions (player_id, amount, transaction_type, description, game_id, balance_after)
            VALUES (
                winner_id,
                winner_amount,
                'game_win_reward',
                'Victory rewards: blind phase + remaining pot',
                p_game_id,
                (SELECT gold_balance FROM players WHERE id = winner_id)
            );

            -- Log transactions for loser
            INSERT INTO gold_transactions (player_id, amount, transaction_type, description, game_id, balance_after)
            VALUES (
                loser_id,
                loser_amount,
                'blind_phase_reward',
                'Blind phase performance rewards only',
                p_game_id,
                (SELECT gold_balance FROM players WHERE id = loser_id)
            );
        END IF;

    ELSE
        -- Draw scenario - both get blind rewards + half remaining pot each
        UPDATE players
        SET gold_balance = gold_balance + reward_summary.white_total_gold + (reward_summary.remaining_pot / 2),
            games_played = games_played + 1
        WHERE id = reward_summary.white_player_id;

        UPDATE players
        SET gold_balance = gold_balance + reward_summary.black_total_gold + (reward_summary.remaining_pot / 2),
            games_played = games_played + 1
        WHERE id = reward_summary.black_player_id;

        -- Add draws column update if it exists
        UPDATE players SET draws = draws + 1 WHERE id = reward_summary.white_player_id AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'draws');
        UPDATE players SET draws = draws + 1 WHERE id = reward_summary.black_player_id AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'draws');

        -- Log draw transactions (only if table exists)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gold_transactions') THEN
            INSERT INTO gold_transactions (player_id, amount, transaction_type, description, game_id, balance_after)
            VALUES
            (reward_summary.white_player_id, reward_summary.white_total_gold + (reward_summary.remaining_pot / 2), 'game_draw_reward', 'Draw rewards: blind phase + half pot', p_game_id, (SELECT gold_balance FROM players WHERE id = reward_summary.white_player_id)),
            (reward_summary.black_player_id, reward_summary.black_total_gold + (reward_summary.remaining_pot / 2), 'game_draw_reward', 'Draw rewards: blind phase + half pot', p_game_id, (SELECT gold_balance FROM players WHERE id = reward_summary.black_player_id));
        END IF;
    END IF;

    -- Mark game as finished
    UPDATE game_rooms
    SET status = 'finished', completed_at = NOW()
    WHERE id = p_game_id;

    -- Clear remaining pot since it's been distributed
    UPDATE game_live_state
    SET remaining_pot = 0
    WHERE game_id = p_game_id;

END;

###

### find_matching_room

DECLARE
current_player_rating INTEGER;
min_rating INTEGER;
max_rating INTEGER;
BEGIN
-- Get player's rating
SELECT rating INTO current_player_rating
FROM players
WHERE id = player_uuid;

    IF current_player_rating IS NULL THEN
        current_player_rating := 1200; -- Default rating
    END IF;

    -- Calculate rating range
    min_rating := GREATEST(800, current_player_rating - p_rating_flexibility);
    max_rating := current_player_rating + p_rating_flexibility;

    RETURN QUERY
    WITH valid_rooms AS (
        SELECT
            gr.id,
            gr.entry_fee,
            gr.host_username,
            gr.current_players,
            COUNT(grp.player_id) as actual_players,
            AVG(grp.player_rating::INTEGER) as avg_rating
        FROM game_rooms gr
        LEFT JOIN game_room_players grp ON gr.id = grp.room_id
        WHERE
            gr.status = 'waiting'
            AND gr.mode = p_mode
            AND gr.time_control = '5+0'
            AND gr.entry_fee >= p_min_entry_fee
            AND gr.entry_fee <= p_max_entry_fee
            AND gr.created_at > NOW() - INTERVAL '10 minutes' -- Not too old
            AND NOT EXISTS ( -- Player not already in this room
                SELECT 1 FROM game_room_players grp2
                WHERE grp2.room_id = gr.id AND grp2.player_id = player_uuid
            )
        GROUP BY gr.id, gr.entry_fee, gr.host_username, gr.current_players
        HAVING
            COUNT(grp.player_id) > 0  -- Has real players
            AND COUNT(grp.player_id) < 2  -- Not full
            AND (
                COUNT(grp.player_id) = 0 OR  -- Empty room
                AVG(grp.player_rating::INTEGER) BETWEEN min_rating AND max_rating -- Rating match
            )
    )
    SELECT
        vr.id,
        vr.entry_fee,
        vr.host_username
    FROM valid_rooms vr
    ORDER BY
        -- Prefer rooms with matching entry fees and ratings
        ABS(vr.entry_fee - ((p_min_entry_fee + p_max_entry_fee) / 2)),
        ABS(COALESCE(vr.avg_rating, current_player_rating) - current_player_rating),
        vr.actual_players DESC -- Prefer rooms with players over empty ones
    LIMIT 3;

END;

###

### force_timeout_game

DECLARE
winner_color TEXT := CASE WHEN timed_out_color = 'white' THEN 'black' ELSE 'white' END;
BEGIN
-- Update game_live_state
UPDATE game_live_state
SET game_ended = TRUE,
game_result = jsonb_build_object(
'type', 'timeout',
'winner', winner_color,
'reason', 'timeout'
),
completed_at = NOW()
WHERE game_id = game_uuid AND game_ended = FALSE;

    -- Update games table as fallback
    UPDATE games
    SET result = winner_color || '_wins',
        result_reason = 'timeout',
        updated_at = NOW()
    WHERE room_id = game_uuid AND result IS NULL;

    RETURN FOUND;

END;

###

### get_blind_rewards

DECLARE
entry_fee INTEGER;
total_pot INTEGER;
commission INTEGER;
available_pot INTEGER;
white_gold INTEGER := 0;
black_gold INTEGER := 0;
BEGIN
-- Get entry fee for pot calculation
SELECT gr.entry_fee INTO entry_fee
FROM game_rooms gr
WHERE gr.id = p_game_id;

    -- Calculate available pot
    total_pot := COALESCE(entry_fee, 100) * 2;
    commission := FLOOR(total_pot * 0.05);
    available_pot := total_pot - commission;

    -- Get player IDs
    SELECT player_id INTO white_player_id
    FROM game_room_players
    WHERE room_id = p_game_id
    ORDER BY created_at ASC
    LIMIT 1;

    SELECT player_id INTO black_player_id
    FROM game_room_players
    WHERE room_id = p_game_id
    ORDER BY created_at ASC
    OFFSET 1 LIMIT 1;

    -- Get calculated totals from frontend
    SELECT COALESCE(gold_amount, 0) INTO white_gold
    FROM blind_phase_rewards
    WHERE game_id = p_game_id
    AND player_id = white_player_id
    AND move_type = 'calculated_total';

    SELECT COALESCE(gold_amount, 0) INTO black_gold
    FROM blind_phase_rewards
    WHERE game_id = p_game_id
    AND player_id = black_player_id
    AND move_type = 'calculated_total';

    -- Calculate remaining pot
    remaining_pot := GREATEST(0, available_pot - white_gold - black_gold);

    RETURN QUERY SELECT white_player_id, black_player_id, white_gold, black_gold, remaining_pot;

END;

###

### get_complete_game_state

DECLARE
result JSON;
BEGIN
SELECT json*build_object(
'room', row_to_json(gr.*),
'live*state', row_to_json(gls.*),
'blind*moves', (
SELECT json_agg(row_to_json(gbm.*) ORDER BY player*color, move_number)
FROM game_blind_moves gbm
WHERE gbm.game_id = room_uuid
),
'live_moves', (
SELECT json_agg(row_to_json(glm.*) ORDER BY move_number)  
 FROM game_live_moves glm
WHERE glm.game_id = room_uuid
),
'players', (
SELECT json_agg(json_build_object(
'player_id', grp.player_id,
'username', grp.player_username,
'rating', grp.player_rating,
'ready', grp.ready,
'color', grp.color
))
FROM game_room_players grp
WHERE grp.room_id = room_uuid
)
) INTO result
FROM game_rooms gr
LEFT JOIN game_live_state gls ON gr.id = gls.game_id
WHERE gr.id = room_uuid;

    RETURN result;

END;

###

### get_gold_leaderboard

BEGIN
RETURN QUERY
SELECT
ROW_NUMBER() OVER (ORDER BY p.gold_balance DESC) as rank,
p.id as player_id,
p.username,
p.gold_balance,
p.rating::BIGINT,
p.games_played::BIGINT,
p.wins::BIGINT
FROM players p
ORDER BY p.gold_balance DESC
LIMIT 100;
END;

###

### get_matchmaking_stats

DECLARE
stats JSONB;
BEGIN
SELECT jsonb*build_object(
'waiting_rooms', COUNT(*) FILTER (WHERE status = 'waiting' AND auto*created = TRUE),
'active_games', COUNT(*) FILTER (WHERE status IN ('blind', 'live')),
'players*in_queue', COUNT(*) FILTER (WHERE status = 'waiting' AND current*players = 1),
'avg_entry_fee', ROUND(AVG(entry_fee)) FILTER (WHERE status = 'waiting' AND auto_created = TRUE),
'total_pot_value', SUM(entry_fee * current_players) FILTER (WHERE status IN ('waiting', 'starting', 'blind', 'live'))
) INTO stats
FROM game_rooms;

    RETURN stats;

END;

###

### get_player_current_game

BEGIN
RETURN QUERY
SELECT
gls.game_id,
CASE
WHEN gr.status = 'waiting' THEN 'waiting'
WHEN gr.status = 'starting' THEN 'starting'  
 WHEN gr.status = 'blind' THEN 'blind'
WHEN gr.status = 'revealing' THEN 'revealing'
WHEN gls.game_ended = FALSE THEN 'live'
ELSE 'finished'
END::TEXT,
CASE
WHEN gls.white_player_id = player_uuid THEN 'white'::TEXT
ELSE 'black'::TEXT
END
FROM game_live_state gls
JOIN game_rooms gr ON gls.game_id = gr.id
WHERE (gls.white_player_id = player_uuid OR gls.black_player_id = player_uuid)

    UNION

    SELECT
        gr.id,
        gr.status::TEXT,
        grp.color::TEXT
    FROM game_rooms gr
    JOIN game_room_players grp ON gr.id = grp.room_id
    WHERE grp.player_id = player_uuid
    AND gr.status IN ('waiting', 'starting', 'blind');

END;

###

### get_player_gold_rank

DECLARE
player_rank BIGINT;
player_gold BIGINT;
total_players BIGINT;
BEGIN
-- Get total players
SELECT COUNT(\*) INTO total_players FROM players;

    -- Get player's rank and gold
    SELECT
        rank_data.rank,
        rank_data.gold_balance
    INTO player_rank, player_gold
    FROM (
        SELECT
            id,
            gold_balance,
            ROW_NUMBER() OVER (ORDER BY gold_balance DESC) as rank
        FROM players
    ) rank_data
    WHERE rank_data.id = p_player_id;

    IF player_rank IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'reason', 'player_not_found'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'rank', player_rank,
        'gold', player_gold,
        'total_players', total_players,
        'percentile', ROUND((1 - (player_rank::NUMERIC / total_players)) * 100, 1)
    );

END;

###

### get_player_matchmaking_status

DECLARE
current_room RECORD;
BEGIN
SELECT gr.\*, grp.color, grp.ready
INTO current_room
FROM game_rooms gr
JOIN game_room_players grp ON gr.id = grp.room_id
WHERE grp.player_id = player_uuid
AND gr.status IN ('waiting', 'starting', 'blind', 'live');

    IF current_room.id IS NULL THEN
        RETURN jsonb_build_object('status', 'not_in_game');
    END IF;

    RETURN jsonb_build_object(
        'status', current_room.status,
        'room_id', current_room.id,
        'entry_fee', current_room.entry_fee,
        'color', current_room.color,
        'ready', current_room.ready,
        'auto_created', current_room.auto_created,
        'current_players', current_room.current_players,
        'expires_at', current_room.match_expires_at
    );

END;

###

### handle_blind_phase_completion

DECLARE
white_submitted BOOLEAN;
black_submitted BOOLEAN;
BEGIN
-- Check if both players have submitted their moves
SELECT
EXISTS(
SELECT 1 FROM game_blind_moves
WHERE game_id = p_game_id
AND player_color = 'white'
AND is_submitted = TRUE
),
EXISTS(
SELECT 1 FROM game_blind_moves
WHERE game_id = p_game_id
AND player_color = 'black'
AND is_submitted = TRUE
)
INTO white_submitted, black_submitted;

    IF white_submitted AND black_submitted THEN
        -- Transition room to reveal phase
        -- The game_live_state will be created by frontend after reveal animation completes
        UPDATE game_rooms
        SET status = 'revealing', updated_at = NOW()
        WHERE id = p_game_id;

        RETURN 'revealing';
    END IF;

    -- Still waiting for submissions
    RETURN 'waiting';

EXCEPTION WHEN OTHERS THEN
-- Raise the error instead of hiding it
RAISE NOTICE 'Error in handle_blind_phase_completion: %', SQLERRM;
RAISE;
END;

###

### handle_game_end_rewards

DECLARE
winner_text TEXT;
BEGIN
-- Only for newly ended games
IF NEW.game_ended = TRUE AND OLD.game_ended = FALSE THEN
winner_text := (NEW.game_result->>'winner')::TEXT;

        -- Distribute final rewards using our new function
        PERFORM distribute_final_rewards(NEW.game_id, winner_text);

        -- Update room status
        UPDATE game_rooms
        SET status = 'finished', completed_at = NOW()
        WHERE id = NEW.game_id;
    END IF;

    RETURN NEW;

END;

###

### initialize_live_game

DECLARE
live_state_id UUID;
BEGIN
INSERT INTO game_live_state (
game_id,
white_player_id,
black_player_id,
current_fen
) VALUES (
p_game_id,
p_white_player_id,
p_black_player_id,
p_starting_fen
)
RETURNING id INTO live_state_id;

RETURN live_state_id;
END;

###

### process_gold_transaction

DECLARE
current_balance BIGINT;
BEGIN
-- Get current balance
SELECT gold_balance INTO current_balance FROM players WHERE id = NEW.player_id;

    -- Prevent insufficient funds for negative transactions
    IF NEW.amount < 0 AND (current_balance + NEW.amount) < 0 THEN
        RAISE EXCEPTION 'Insufficient gold: Current %, Attempted %', current_balance, NEW.amount;
    END IF;

    -- Update balance_after if not set
    IF NEW.balance_after IS NULL THEN
        NEW.balance_after := current_balance + NEW.amount;
    END IF;

    RETURN NEW;

END;

###

### safe_join_matchmaking_room

DECLARE
room_data RECORD;
player_data RECORD;
join_success BOOLEAN := FALSE;
BEGIN
-- Get player info
SELECT username, rating, gold_balance INTO player_data
FROM players
WHERE id = player_uuid;

    IF player_data IS NULL THEN
        RETURN jsonb_build_object('success', false, 'reason', 'player_not_found');
    END IF;

    -- Lock the room for atomic operations
    SELECT * INTO room_data
    FROM game_rooms
    WHERE id = room_uuid
    FOR UPDATE;

    -- Validate room state
    IF room_data IS NULL THEN
        RETURN jsonb_build_object('success', false, 'reason', 'room_not_found');
    END IF;

    IF room_data.status != 'waiting' THEN
        RETURN jsonb_build_object('success', false, 'reason', 'room_not_waiting');
    END IF;

    IF room_data.current_players >= room_data.max_players THEN
        RETURN jsonb_build_object('success', false, 'reason', 'room_full');
    END IF;

    IF room_data.match_expires_at <= NOW() THEN
        RETURN jsonb_build_object('success', false, 'reason', 'room_expired');
    END IF;

    -- Check if player can afford
    IF player_data.gold_balance < room_data.entry_fee THEN
        RETURN jsonb_build_object('success', false, 'reason', 'insufficient_gold');
    END IF;

    -- Check if player already in room
    IF EXISTS(SELECT 1 FROM game_room_players WHERE room_id = room_uuid AND player_id = player_uuid) THEN
        RETURN jsonb_build_object('success', false, 'reason', 'already_in_room');
    END IF;

    -- Add player to room
    INSERT INTO game_room_players (
        room_id,
        player_id,
        player_username,
        player_rating,
        ready,
        color
    ) VALUES (
        room_uuid,
        player_uuid,
        player_data.username,
        player_data.rating,
        FALSE,  -- Not ready until payment
        'black'
    );

    -- Update room - mark as ready for payment
    UPDATE game_rooms
    SET current_players = 2,
        status = 'starting',  -- Ready for payment phase
        updated_at = NOW()
    WHERE id = room_uuid;

    RETURN jsonb_build_object(
        'success', true,
        'room_id', room_uuid,
        'entry_fee', room_data.entry_fee,
        'next_phase', 'payment'
    );

END;

###

### save_calculated_rewards

BEGIN
-- Clear any existing rewards for this game
DELETE FROM blind_phase_rewards WHERE game_id = p_game_id;

-- Insert the calculated totals
INSERT INTO blind_phase_rewards (game_id, player_id, move_number, move_type, gold_amount, entry_fee)
VALUES
(p_game_id, p_white_player_id, 1, 'calculated_total', p_white_gold, 100),
(p_game_id, p_black_player_id, 1, 'calculated_total', p_black_gold, 100);
END;

###

### start_matchmaking

DECLARE
matching_room RECORD;
new_room_id UUID;
join_result JSONB;
player_gold INTEGER;
BEGIN
SELECT gold_balance INTO player_gold FROM players WHERE id = player_uuid;

    IF player_gold IS NULL THEN
        RETURN jsonb_build_object('success', false, 'reason', 'player_not_found');
    END IF;

    IF player_gold < p_min_entry_fee THEN
        RETURN jsonb_build_object('success', false, 'reason', 'insufficient_gold_for_minimum');
    END IF;

    p_max_entry_fee := LEAST(p_max_entry_fee, player_gold);

    SELECT * INTO matching_room
    FROM find_matching_room(player_uuid, p_mode, p_min_entry_fee, p_max_entry_fee, p_rating_flexibility)
    LIMIT 1;

    IF matching_room.room_id IS NOT NULL THEN
        join_result := safe_join_matchmaking_room(matching_room.room_id, player_uuid);

        IF (join_result->>'success')::BOOLEAN THEN
            RETURN jsonb_build_object(
                'success', true,
                'action', 'joined_existing',
                'room_id', matching_room.room_id,
                'entry_fee', matching_room.entry_fee,
                'opponent', matching_room.host_username,
                'next_phase', 'payment'
            );
        END IF;
    END IF;

    new_room_id := create_matchmaking_room(
        player_uuid,
        p_mode,
        p_min_entry_fee + floor(random() * (p_max_entry_fee - p_min_entry_fee + 1))::INTEGER,
        p_rating_flexibility
    );

    RETURN jsonb_build_object(
        'success', true,
        'action', 'created_room',
        'room_id', new_room_id,
        'entry_fee', p_min_entry_fee + floor(random() * (p_max_entry_fee - p_min_entry_fee + 1))::INTEGER,
        'next_phase', 'waiting_for_opponent'
    );

END;

###

### sync_game_mode

BEGIN
-- Auto-set game_mode based on mode
IF NEW.mode = 'robochaos' THEN
NEW.game_mode := 'robot_chaos';
ELSIF NEW.mode = 'classic' THEN
NEW.game_mode := 'classic';
END IF;

RETURN NEW;
END;

###

### trigger_blind_submission_check

BEGIN
IF NEW.is_submitted = TRUE AND OLD.is_submitted = FALSE THEN
PERFORM handle_blind_phase_completion(NEW.game_id);
END IF;
RETURN NEW;
END;

###

### update_bot_stats

BEGIN
IF NEW.result = 'bot_win' THEN
UPDATE bot_players
SET wins = wins + 1,
games_played = games_played + 1,
updated_at = NOW()
WHERE id = NEW.bot_id;
ELSIF NEW.result = 'player_win' THEN
UPDATE bot_players
SET losses = losses + 1,
games_played = games_played + 1,
updated_at = NOW()
WHERE id = NEW.bot_id;
ELSIF NEW.result = 'draw' THEN
UPDATE bot_players
SET draws = draws + 1,
games_played = games_played + 1,
updated_at = NOW()
WHERE id = NEW.bot_id;
END IF;
RETURN NEW;
END;

###

### update_player_presence

BEGIN
INSERT INTO player_presence (player_id, last_seen, is_online, status)
VALUES (NEW.player_id, NOW(), TRUE, 'in_game')
ON CONFLICT (player_id)
DO UPDATE SET
last_seen = NOW(),
is_online = TRUE,
status = 'in_game',
current_game_id = NEW.room_id;
RETURN NEW;
END;

###

### update_player_time_on_move

DECLARE
time_elapsed_ms INTEGER;
previous_player TEXT;
BEGIN
-- CRITICAL: Only process actual moves, not initial clock start
-- Check that BOTH old and new last_move_time exist (this is a move, not initial start)
IF NEW.last_move_time IS DISTINCT FROM OLD.last_move_time
AND OLD.last_move_time IS NOT NULL
AND NEW.last_move_time IS NOT NULL THEN

    -- Calculate time elapsed
    time_elapsed_ms := EXTRACT(EPOCH FROM (NEW.last_move_time - OLD.last_move_time)) * 1000;

    -- Who just moved? (opposite of current turn)
    previous_player := CASE
      WHEN NEW.current_turn = 'white' THEN 'black'
      ELSE 'white'
    END;

    -- Deduct time from player who just moved
    IF previous_player = 'white' THEN
      NEW.white_time_ms := GREATEST(0, OLD.white_time_ms - time_elapsed_ms);
    ELSE
      NEW.black_time_ms := GREATEST(0, OLD.black_time_ms - time_elapsed_ms);
    END IF;

    RAISE NOTICE 'Move timer: % used %ms, remaining: %ms',
      previous_player, time_elapsed_ms,
      CASE WHEN previous_player = 'white' THEN NEW.white_time_ms ELSE NEW.black_time_ms END;

ELSIF OLD.last_move_time IS NULL AND NEW.last_move_time IS NOT NULL THEN
-- Initial clock start - don't deduct anything
RAISE NOTICE 'Clock started at %', NEW.last_move_time;
END IF;

RETURN NEW;
END;

###

### update_ratings

DECLARE
white_rating BIGINT;
black_rating BIGINT;
white_result NUMERIC;
black_result NUMERIC;
white_change INTEGER;
black_change INTEGER;
winner_text TEXT;
BEGIN
IF NEW.game_ended = TRUE AND OLD.game_ended = FALSE THEN
winner_text := (NEW.game_result->>'winner')::TEXT;

        SELECT rating INTO white_rating FROM players WHERE id = NEW.white_player_id;
        SELECT rating INTO black_rating FROM players WHERE id = NEW.black_player_id;

        CASE winner_text
            WHEN 'white' THEN white_result := 1.0; black_result := 0.0;
            WHEN 'black' THEN white_result := 0.0; black_result := 1.0;
            ELSE white_result := 0.5; black_result := 0.5;
        END CASE;

        white_change := calculate_elo_change(white_rating, black_rating, white_result);
        black_change := calculate_elo_change(black_rating, white_rating, black_result);

        UPDATE players
        SET rating = GREATEST(800, rating + white_change)
        WHERE id = NEW.white_player_id;

        UPDATE players
        SET rating = GREATEST(800, rating + black_change)
        WHERE id = NEW.black_player_id;
    END IF;

    RETURN NEW;

END;

###

### update_room_player_count

BEGIN
IF TG_OP = 'INSERT' THEN
UPDATE game_rooms
SET current_players = current_players + 1,
updated_at = NOW()
WHERE id = NEW.room_id;
RETURN NEW;
ELSIF TG_OP = 'DELETE' THEN
UPDATE game_rooms
SET current_players = current_players - 1,
updated_at = NOW()
WHERE id = OLD.room_id;

        DELETE FROM game_rooms
        WHERE id = OLD.room_id
          AND current_players = 0
          AND status = 'waiting';

        RETURN OLD;
    END IF;
    RETURN NULL;

END;

###

### is_bot_available

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

###

### get_available_celestial_bot

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

###

### inject_bot_into_room

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

###

### get_room_wait_time

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

###

### check_and_inject_bots

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

###
