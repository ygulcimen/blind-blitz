-- ============================================
-- FIX BOT FUNCTIONS - BIGINT RATING TYPE
-- Run this to fix the type mismatch error
-- ============================================

-- Drop the existing function that has wrong return type
DROP FUNCTION IF EXISTS get_available_celestial_bot(integer, integer);

-- Recreate with correct BIGINT type for rating
CREATE OR REPLACE FUNCTION get_available_celestial_bot(
  min_rating INT DEFAULT 800,
  max_rating INT DEFAULT 2500
)
RETURNS TABLE(
  bot_id UUID,
  bot_username TEXT,
  bot_rating BIGINT,
  bot_config JSONB
) AS $$
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
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_available_celestial_bot TO authenticated, anon;

-- Test the function
DO $$
DECLARE
  test_result RECORD;
BEGIN
  -- Test get_available_celestial_bot
  SELECT * INTO test_result FROM get_available_celestial_bot(1000, 2000);

  IF test_result IS NOT NULL THEN
    RAISE NOTICE '✅ Function fixed! Test bot: % (rating: %)', test_result.bot_username, test_result.bot_rating;
  ELSE
    RAISE NOTICE '⚠️ No bots available in rating range 1000-2000 (this is OK if all bots are in games)';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ get_available_celestial_bot() function fixed with BIGINT rating type!';
  RAISE NOTICE '🎮 Bot injection should now work correctly!';
END $$;
