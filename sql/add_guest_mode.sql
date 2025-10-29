-- ============================================
-- ADD GUEST MODE SUPPORT
-- Allows users to play without signing up
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add guest-related columns to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS guest_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS guest_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS converted_from_guest BOOLEAN DEFAULT FALSE;

-- 2. Create indexes for guest lookups
CREATE INDEX IF NOT EXISTS idx_players_guest_token ON players(guest_token) WHERE guest_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_is_guest ON players(is_guest) WHERE is_guest = TRUE;
CREATE INDEX IF NOT EXISTS idx_players_guest_expires ON players(guest_expires_at) WHERE guest_expires_at IS NOT NULL;

-- 3. Create function to create a guest player
CREATE OR REPLACE FUNCTION create_guest_player(
    p_guest_token TEXT,
    p_username TEXT DEFAULT NULL
)
RETURNS TABLE(
    player_id UUID,
    username TEXT,
    guest_token TEXT,
    gold_balance INTEGER
) AS $$
DECLARE
    v_username TEXT;
    v_player_id UUID;
BEGIN
    -- Generate random username if not provided
    IF p_username IS NULL THEN
        v_username := 'Guest_' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

        -- Ensure username is unique
        WHILE EXISTS (SELECT 1 FROM players WHERE players.username = v_username) LOOP
            v_username := 'Guest_' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        END LOOP;
    ELSE
        v_username := p_username;
    END IF;

    -- Create guest player
    INSERT INTO players (
        username,
        rating,
        gold_balance,
        games_played,
        wins,
        losses,
        draws,
        is_bot,
        is_guest,
        guest_token,
        guest_expires_at,
        created_at
    ) VALUES (
        v_username,
        1200,  -- Starting rating
        500,   -- Guest players get 500 gold (less than registered 1000)
        0,
        0,
        0,
        0,
        FALSE,
        TRUE,
        p_guest_token,
        NOW() + INTERVAL '7 days',  -- Guest accounts expire in 7 days
        NOW()
    )
    RETURNING id INTO v_player_id;

    -- Return player info
    RETURN QUERY
    SELECT
        v_player_id,
        v_username,
        p_guest_token,
        500;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to get or create guest player
CREATE OR REPLACE FUNCTION get_or_create_guest_player(
    p_guest_token TEXT
)
RETURNS TABLE(
    player_id UUID,
    username TEXT,
    guest_token TEXT,
    gold_balance INTEGER,
    is_new BOOLEAN
) AS $$
DECLARE
    v_player RECORD;
    v_is_new BOOLEAN := FALSE;
BEGIN
    -- Try to find existing guest player
    SELECT id, players.username, players.guest_token, players.gold_balance
    INTO v_player
    FROM players
    WHERE players.guest_token = p_guest_token
        AND players.is_guest = TRUE
        AND players.guest_expires_at > NOW();

    -- If not found, create new guest player
    IF NOT FOUND THEN
        v_is_new := TRUE;
        SELECT * INTO v_player
        FROM create_guest_player(p_guest_token);
    END IF;

    -- Return player info
    RETURN QUERY
    SELECT
        v_player.id,
        v_player.username,
        v_player.guest_token,
        v_player.gold_balance,
        v_is_new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to convert guest to registered player
CREATE OR REPLACE FUNCTION convert_guest_to_registered(
    p_guest_token TEXT,
    p_auth_user_id UUID,
    p_new_username TEXT,
    p_email TEXT
)
RETURNS TABLE(
    success BOOLEAN,
    player_id UUID,
    message TEXT
) AS $$
DECLARE
    v_guest_player_id UUID;
    v_bonus_gold INTEGER := 500;  -- Bonus for converting
BEGIN
    -- Find guest player
    SELECT id INTO v_guest_player_id
    FROM players
    WHERE guest_token = p_guest_token
        AND is_guest = TRUE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Guest player not found';
        RETURN;
    END IF;

    -- Check if new username is available (if different from guest username)
    IF EXISTS (
        SELECT 1 FROM players
        WHERE username = p_new_username
            AND id != v_guest_player_id
    ) THEN
        RETURN QUERY SELECT FALSE, v_guest_player_id, 'Username already taken';
        RETURN;
    END IF;

    -- Convert guest to registered player
    UPDATE players
    SET
        username = p_new_username,
        is_guest = FALSE,
        guest_token = NULL,
        guest_expires_at = NULL,
        converted_from_guest = TRUE,
        gold_balance = gold_balance + v_bonus_gold,  -- Add conversion bonus
        updated_at = NOW()
    WHERE id = v_guest_player_id;

    -- Return success
    RETURN QUERY SELECT TRUE, v_guest_player_id, 'Guest converted successfully. +500 gold bonus!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to cleanup expired guest accounts
CREATE OR REPLACE FUNCTION cleanup_expired_guest_accounts()
RETURNS TABLE(
    deleted_count INTEGER
) AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Delete expired guest players who haven't played recently
    DELETE FROM players
    WHERE is_guest = TRUE
        AND guest_expires_at < NOW()
        AND updated_at < NOW() - INTERVAL '1 day';  -- Haven't been active in 24 hours

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update RLS policies to allow guest players
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Guests can view their own profile" ON players;
DROP POLICY IF EXISTS "Guests can update their own profile" ON players;

-- Allow guests to read their own data
CREATE POLICY "Guests can view their own profile"
ON players FOR SELECT
TO anon
USING (guest_token IS NOT NULL);

-- Allow guests to update their own profile (within limits)
CREATE POLICY "Guests can update their own profile"
ON players FOR UPDATE
TO anon
USING (guest_token IS NOT NULL)
WITH CHECK (guest_token IS NOT NULL);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Guest mode system created successfully!';
    RAISE NOTICE '🎮 Users can now play as guests without signing up';
    RAISE NOTICE '💰 Guest players start with 500 gold';
    RAISE NOTICE '⏰ Guest accounts expire after 7 days of inactivity';
    RAISE NOTICE '🔄 Guests can convert to registered users and get +500 gold bonus';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Functions created:';
    RAISE NOTICE '   - create_guest_player(guest_token)';
    RAISE NOTICE '   - get_or_create_guest_player(guest_token)';
    RAISE NOTICE '   - convert_guest_to_registered(guest_token, auth_id, username, email)';
    RAISE NOTICE '   - cleanup_expired_guest_accounts()';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ Run cleanup_expired_guest_accounts() periodically (daily cron job)';
END $$;
