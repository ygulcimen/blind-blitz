-- ============================================
-- FIX ALL AUTH FUNCTIONS - Fix ambiguous column references
-- ============================================

-- Fix signin_with_username - Add table prefix to all columns
DROP FUNCTION IF EXISTS signin_with_username(TEXT, TEXT);

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
    -- Find player - explicitly qualify column names with table alias
    SELECT p.id, p.username, p.password_hash
    INTO v_player
    FROM players p
    WHERE p.username = p_username
        AND p.is_guest = FALSE;

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

-- Fix verify_session - Already fixed in previous file, but ensuring consistency
DROP FUNCTION IF EXISTS verify_session(TEXT);

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
    -- Explicitly qualify all column names with table alias
    SELECT
        p.id,
        p.username,
        p.email,
        p.session_expires_at
    INTO v_player
    FROM players p
    WHERE p.session_token = p_session_token
        AND p.is_guest = FALSE;

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

-- Grant permissions
GRANT EXECUTE ON FUNCTION signin_with_username TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_session TO anon, authenticated;

-- Test it
DO $$
BEGIN
    RAISE NOTICE '✅ All auth functions fixed!';
    RAISE NOTICE 'signin_with_username and verify_session now use explicit table prefixes.';
    RAISE NOTICE 'No more ambiguous column references!';
END $$;
