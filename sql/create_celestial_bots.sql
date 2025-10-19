-- ============================================
-- CREATE CELESTIAL BOT PLAYERS
-- Marvel Celestials as indistinguishable bot players
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add is_bot field to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE;

-- 2. Create index for quick bot identification
CREATE INDEX IF NOT EXISTS idx_players_is_bot ON players(is_bot);

-- 3. Insert 5 Marvel Celestial bot players
-- These will appear as real players in the system

-- Note: You'll need to generate UUIDs for these bots
-- In Supabase, these will be treated as "service account" players
-- They won't have auth.users entries, just players table entries

INSERT INTO players (
  id,
  username,
  rating,
  gold_balance,
  games_played,
  wins,
  losses,
  draws,
  is_bot,
  created_at
) VALUES
  -- 1. ARISHEM THE JUDGE - Expert Level (2100-2200)
  (
    '00000000-0000-0000-0001-000000000001'::uuid,
    'Arishem_The_Judge',
    2150,
    50000,
    2847,
    1821,
    891,
    135,
    TRUE,
    NOW() - INTERVAL '2 years'
  ),

  -- 2. ESON THE SEARCHER - Hard Level (1700-1800)
  (
    '00000000-0000-0000-0001-000000000002'::uuid,
    'Eson_The_Searcher',
    1750,
    35000,
    1923,
    1142,
    698,
    83,
    TRUE,
    NOW() - INTERVAL '18 months'
  ),

  -- 3. EXECUTIONER - Medium Level (1400-1500)
  (
    '00000000-0000-0000-0001-000000000003'::uuid,
    'Executioner',
    1450,
    22000,
    1234,
    645,
    531,
    58,
    TRUE,
    NOW() - INTERVAL '1 year'
  ),

  -- 4. GAMMENON THE GATHERER - Medium-Hard Level (1600-1700)
  (
    '00000000-0000-0000-0001-000000000004'::uuid,
    'Gammenon_Gatherer',
    1650,
    28000,
    1567,
    892,
    615,
    60,
    TRUE,
    NOW() - INTERVAL '15 months'
  ),

  -- 5. ONE ABOVE ALL - God Tier (2300+) - Rare appearances
  (
    '00000000-0000-0000-0001-000000000005'::uuid,
    'One_Above_All',
    2400,
    100000,
    892,
    784,
    87,
    21,
    TRUE,
    NOW() - INTERVAL '3 years'
  )
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  rating = EXCLUDED.rating,
  gold_balance = EXCLUDED.gold_balance,
  games_played = EXCLUDED.games_played,
  wins = EXCLUDED.wins,
  losses = EXCLUDED.losses,
  draws = EXCLUDED.draws,
  is_bot = EXCLUDED.is_bot;

-- 4. Create a view for bot player configurations
CREATE OR REPLACE VIEW celestial_bot_configs AS
SELECT
  id,
  username,
  rating,
  CASE
    WHEN username = 'Arishem_The_Judge' THEN jsonb_build_object(
      'name', 'Arishem The Judge',
      'title', 'The Prime Celestial',
      'personality', 'Strategic and calculating. Rarely makes mistakes.',
      'difficulty', 'expert',
      'blind_phase', jsonb_build_object(
        'strategy', 'aggressive_development',
        'move_quality', 0.95,
        'blunder_chance', 0.02
      ),
      'live_phase', jsonb_build_object(
        'depth', 16,
        'stockfish_level', 16,
        'think_time_ms', 2000,
        'randomness', 0.02,
        'aggression', 0.7
      )
    )
    WHEN username = 'Eson_The_Searcher' THEN jsonb_build_object(
      'name', 'Eson The Searcher',
      'title', 'The Cosmic Explorer',
      'personality', 'Curious and analytical. Strong positional play.',
      'difficulty', 'hard',
      'blind_phase', jsonb_build_object(
        'strategy', 'balanced',
        'move_quality', 0.85,
        'blunder_chance', 0.05
      ),
      'live_phase', jsonb_build_object(
        'depth', 13,
        'stockfish_level', 13,
        'think_time_ms', 1500,
        'randomness', 0.05,
        'aggression', 0.5
      )
    )
    WHEN username = 'Executioner' THEN jsonb_build_object(
      'name', 'Executioner',
      'title', 'The Destroyer',
      'personality', 'Aggressive and tactical. Favors attacking chess.',
      'difficulty', 'medium',
      'blind_phase', jsonb_build_object(
        'strategy', 'aggressive',
        'move_quality', 0.75,
        'blunder_chance', 0.10
      ),
      'live_phase', jsonb_build_object(
        'depth', 10,
        'stockfish_level', 8,
        'think_time_ms', 1000,
        'randomness', 0.08,
        'aggression', 0.85
      )
    )
    WHEN username = 'Gammenon_Gatherer' THEN jsonb_build_object(
      'name', 'Gammenon The Gatherer',
      'title', 'The Collector',
      'personality', 'Patient and defensive. Gathers pieces strategically.',
      'difficulty', 'medium-hard',
      'blind_phase', jsonb_build_object(
        'strategy', 'defensive',
        'move_quality', 0.80,
        'blunder_chance', 0.07
      ),
      'live_phase', jsonb_build_object(
        'depth', 12,
        'stockfish_level', 11,
        'think_time_ms', 1200,
        'randomness', 0.06,
        'aggression', 0.4
      )
    )
    WHEN username = 'One_Above_All' THEN jsonb_build_object(
      'name', 'One Above All',
      'title', 'The Supreme Being',
      'personality', 'Omniscient and perfect. Near-flawless play.',
      'difficulty', 'god',
      'blind_phase', jsonb_build_object(
        'strategy', 'optimal',
        'move_quality', 0.98,
        'blunder_chance', 0.00
      ),
      'live_phase', jsonb_build_object(
        'depth', 20,
        'stockfish_level', 20,
        'think_time_ms', 2000,
        'randomness', 0.01,
        'aggression', 0.6
      )
    )
  END as config
FROM players
WHERE is_bot = TRUE;

-- 5. Grant permissions (bots should be readable by everyone)
-- No special RLS needed - they're just regular players with is_bot=true

-- 6. Create helper function to get a random available bot
CREATE OR REPLACE FUNCTION get_random_celestial_bot(
  min_rating INT DEFAULT 800,
  max_rating INT DEFAULT 2500
)
RETURNS TABLE(
  bot_id UUID,
  bot_username TEXT,
  bot_rating INT,
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
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
DECLARE
  bot_count INT;
BEGIN
  SELECT COUNT(*) INTO bot_count FROM players WHERE is_bot = TRUE;

  RAISE NOTICE '✅ Celestial bot system created successfully!';
  RAISE NOTICE '🤖 Total Celestial bots: %', bot_count;
  RAISE NOTICE '👑 Arishem The Judge - Expert (2150 rating)';
  RAISE NOTICE '🔍 Eson The Searcher - Hard (1750 rating)';
  RAISE NOTICE '⚔️ Executioner - Medium (1450 rating)';
  RAISE NOTICE '📦 Gammenon The Gatherer - Medium-Hard (1650 rating)';
  RAISE NOTICE '🌟 One Above All - God Tier (2400 rating)';
  RAISE NOTICE '🎮 Bots are now indistinguishable from real players!';
END $$;
