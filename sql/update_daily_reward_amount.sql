-- Update daily reward amount from 100 to 50 gold
-- This function needs to be recreated to change the hardcoded reward amount

CREATE OR REPLACE FUNCTION claim_daily_reward(p_player_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    player_record RECORD;
    can_claim BOOLEAN := FALSE;
    reward_amount INTEGER := 50;  -- Changed from 100 to 50
    new_balance BIGINT;
BEGIN
    -- Get player data with lock
    SELECT * INTO player_record
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
$$;
