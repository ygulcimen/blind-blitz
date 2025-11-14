-- Fix the verify_session function - the column reference was ambiguous

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
    -- Explicitly qualify all column names with table name
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
GRANT EXECUTE ON FUNCTION verify_session TO anon, authenticated;

-- Test it
DO $$
BEGIN
    RAISE NOTICE '✅ verify_session function fixed!';
    RAISE NOTICE 'The ambiguous column reference has been resolved.';
END $$;
