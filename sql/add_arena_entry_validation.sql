-- Add server-side validation for arena entry requirements
-- Players must have at least 2x the average entry fee to prevent going "all-in"

CREATE OR REPLACE FUNCTION can_enter_arena(
    p_player_id UUID,
    p_entry_fee INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    player_gold BIGINT;
    required_gold INTEGER;
BEGIN
    -- Get player's current gold balance
    SELECT gold_balance INTO player_gold
    FROM players
    WHERE id = p_player_id;

    IF player_gold IS NULL THEN
        RETURN jsonb_build_object(
            'can_enter', false,
            'reason', 'player_not_found'
        );
    END IF;

    -- Calculate required gold (2x the entry fee as a safety buffer)
    -- This prevents players from losing all their gold in one match
    required_gold := p_entry_fee * 2;

    IF player_gold < required_gold THEN
        RETURN jsonb_build_object(
            'can_enter', false,
            'reason', 'insufficient_gold',
            'player_gold', player_gold,
            'required_gold', required_gold,
            'deficit', required_gold - player_gold
        );
    END IF;

    RETURN jsonb_build_object(
        'can_enter', true,
        'player_gold', player_gold,
        'required_gold', required_gold
    );
END;
$$;

-- Update the start_matchmaking function to include arena entry validation
CREATE OR REPLACE FUNCTION start_matchmaking(
    player_uuid UUID,
    p_mode TEXT,
    p_min_entry_fee INTEGER,
    p_max_entry_fee INTEGER,
    p_rating_flexibility INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    matching_room RECORD;
    new_room_id UUID;
    join_result JSONB;
    player_gold INTEGER;
    validation_result JSONB;
BEGIN
    SELECT gold_balance INTO player_gold FROM players WHERE id = player_uuid;

    IF player_gold IS NULL THEN
        RETURN jsonb_build_object('success', false, 'reason', 'player_not_found');
    END IF;

    -- Validate that player can afford the MINIMUM entry fee with 2x buffer
    validation_result := can_enter_arena(player_uuid, p_min_entry_fee);

    IF NOT (validation_result->>'can_enter')::BOOLEAN THEN
        RETURN jsonb_build_object(
            'success', false,
            'reason', 'insufficient_gold_for_arena',
            'details', validation_result
        );
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
$$;
