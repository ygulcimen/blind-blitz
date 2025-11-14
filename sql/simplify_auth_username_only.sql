-- ============================================
-- SIMPLIFY AUTH: USERNAME + PASSWORD ONLY
-- No email required, simpler signup!
-- ============================================

-- ============================================
-- STEP 1: Make email optional in players table
-- ============================================

-- Make email nullable
ALTER TABLE players
ALTER COLUMN email DROP NOT NULL;

-- Add password_hash column for our own auth
ALTER TABLE players
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add session_token for our own session management
ALTER TABLE players
ADD COLUMN IF NOT EXISTS session_token TEXT;

-- Add session_expires_at
ALTER TABLE players
ADD COLUMN IF NOT EXISTS session_expires_at TIMESTAMPTZ;

-- Add index on session_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_players_session_token ON players(session_token);

-- ============================================
-- STEP 2: Create auth functions
-- ============================================

-- Function to sign up with username + password
CREATE OR REPLACE FUNCTION signup_with_username(
    p_username TEXT,
    p_password_hash TEXT
)
RETURNS TABLE(
    player_id UUID,
    username TEXT,
    session_token TEXT,
    message TEXT
) AS $$
DECLARE
    v_player_id UUID;
    v_session_token TEXT;
BEGIN
    -- Check if username exists
    IF EXISTS (SELECT 1 FROM players WHERE players.username = p_username) THEN
        RAISE EXCEPTION 'Username already taken';
    END IF;

    -- Generate new player ID
    v_player_id := gen_random_uuid();

    -- Generate session token
    v_session_token := encode(gen_random_bytes(32), 'base64');

    -- Insert new player
    INSERT INTO players (
        id,
        username,
        password_hash,
        session_token,
        session_expires_at,
        email,
        gold_balance,
        rating,
        games_played,
        wins,
        losses,
        draws,
        is_bot,
        is_guest,
        created_at
    ) VALUES (
        v_player_id,
        p_username,
        p_password_hash,
        v_session_token,
        NOW() + INTERVAL '30 days',
        NULL,  -- Email is optional
        1000,  -- Welcome bonus
        1200,  -- Starting rating
        0, 0, 0, 0,
        FALSE,
        FALSE,
        NOW()
    );

    RETURN QUERY SELECT
        v_player_id,
        p_username,
        v_session_token,
        'Account created successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sign in with username + password
CREATE OR REPLACE FUNCTION signin_with_username(
    p_username TEXT,
    p_password_hash TEXT
)
RETURNS TABLE(
    player_id UUID,
    username TEXT,
    session_token TEXT,
    message TEXT
) AS $$
DECLARE
    v_player RECORD;
    v_session_token TEXT;
BEGIN
    -- Find player
    SELECT id, username, password_hash
    INTO v_player
    FROM players
    WHERE players.username = p_username
        AND is_guest = FALSE;

    -- Check if player exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid username or password';
    END IF;

    -- Verify password
    IF v_player.password_hash != p_password_hash THEN
        RAISE EXCEPTION 'Invalid username or password';
    END IF;

    -- Generate new session token
    v_session_token := encode(gen_random_bytes(32), 'base64');

    -- Update session
    UPDATE players
    SET
        session_token = v_session_token,
        session_expires_at = NOW() + INTERVAL '30 days'
    WHERE id = v_player.id;

    RETURN QUERY SELECT
        v_player.id,
        v_player.username,
        v_session_token,
        'Signed in successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify session token
CREATE OR REPLACE FUNCTION verify_session(
    p_session_token TEXT
)
RETURNS TABLE(
    player_id UUID,
    username TEXT,
    email TEXT,
    is_valid BOOLEAN
) AS $$
DECLARE
    v_player RECORD;
BEGIN
    SELECT id, username, email, session_expires_at
    INTO v_player
    FROM players
    WHERE session_token = p_session_token
        AND is_guest = FALSE;

    -- Check if session exists and is valid
    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, FALSE;
        RETURN;
    END IF;

    -- Check if session expired
    IF v_player.session_expires_at < NOW() THEN
        RETURN QUERY SELECT v_player.id, v_player.username, v_player.email, FALSE;
        RETURN;
    END IF;

    -- Session is valid
    RETURN QUERY SELECT v_player.id, v_player.username, v_player.email, TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sign out (invalidate session)
CREATE OR REPLACE FUNCTION signout_session(
    p_session_token TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE players
    SET
        session_token = NULL,
        session_expires_at = NULL
    WHERE session_token = p_session_token;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 3: Grant permissions
-- ============================================

GRANT EXECUTE ON FUNCTION signup_with_username TO anon, authenticated;
GRANT EXECUTE ON FUNCTION signin_with_username TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_session TO anon, authenticated;
GRANT EXECUTE ON FUNCTION signout_session TO anon, authenticated;

-- ============================================
-- Success!
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Auth system simplified!';
    RAISE NOTICE '';
    RAISE NOTICE '🎮 Sign up: Just username + password';
    RAISE NOTICE '🔐 No email required (optional)';
    RAISE NOTICE '🚀 Session-based auth (30-day tokens)';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Functions created:';
    RAISE NOTICE '   - signup_with_username(username, password_hash)';
    RAISE NOTICE '   - signin_with_username(username, password_hash)';
    RAISE NOTICE '   - verify_session(session_token)';
    RAISE NOTICE '   - signout_session(session_token)';
END $$;
