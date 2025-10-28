-- ============================================
-- ADD BEGINNER CELESTIAL BOT PLAYERS
-- Adding more bots in the 1000-1400 rating range for newcomers
-- Run this in Supabase SQL Editor
-- ============================================

-- Insert 5 new beginner-level Celestial bots
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
  -- 6. NEZARR THE CALCULATOR - Beginner Level (1000-1100)
  (
    '00000000-0000-0000-0001-000000000006'::uuid,
    'Nezarr_Calculator',
    1050,
    8000,
    456,
    198,
    234,
    24,
    TRUE,
    NOW() - INTERVAL '8 months'
  ),

  -- 7. HARGEN THE MEASURER - Beginner-Medium Level (1100-1200)
  (
    '00000000-0000-0000-0001-000000000007'::uuid,
    'Hargen_Measurer',
    1150,
    10000,
    542,
    256,
    264,
    22,
    TRUE,
    NOW() - INTERVAL '9 months'
  ),

  -- 8. JEMIAH THE ANALYZER - Beginner-Medium Level (1200-1300)
  (
    '00000000-0000-0000-0001-000000000008'::uuid,
    'Jemiah_Analyzer',
    1250,
    12000,
    678,
    334,
    318,
    26,
    TRUE,
    NOW() - INTERVAL '10 months'
  ),

  -- 9. ONEG THE PROBER - Medium Level (1300-1400)
  (
    '00000000-0000-0000-0001-000000000009'::uuid,
    'Oneg_Prober',
    1350,
    15000,
    812,
    421,
    362,
    29,
    TRUE,
    NOW() - INTERVAL '11 months'
  ),

  -- 10. TEFRAL THE SURVEYOR - Medium Level (1350-1450)
  (
    '00000000-0000-0000-0001-000000000010'::uuid,
    'Tefral_Surveyor',
    1400,
    18000,
    934,
    489,
    416,
    29,
    TRUE,
    NOW() - INTERVAL '13 months'
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

-- Update the celestial_bot_configs view to include new bots
CREATE OR REPLACE VIEW celestial_bot_configs AS
SELECT
  id,
  username,
  rating,
  CASE
    -- ORIGINAL BOTS
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

    -- NEW BEGINNER BOTS
    WHEN username = 'Nezarr_Calculator' THEN jsonb_build_object(
      'name', 'Nezarr The Calculator',
      'title', 'The Number Keeper',
      'personality', 'Learning and developing. Makes occasional mistakes.',
      'difficulty', 'beginner',
      'blind_phase', jsonb_build_object(
        'strategy', 'simple_development',
        'move_quality', 0.55,
        'blunder_chance', 0.20
      ),
      'live_phase', jsonb_build_object(
        'depth', 6,
        'stockfish_level', 3,
        'think_time_ms', 800,
        'randomness', 0.15,
        'aggression', 0.3
      )
    )
    WHEN username = 'Hargen_Measurer' THEN jsonb_build_object(
      'name', 'Hargen The Measurer',
      'title', 'The Distance Keeper',
      'personality', 'Cautious and methodical. Still learning patterns.',
      'difficulty', 'beginner',
      'blind_phase', jsonb_build_object(
        'strategy', 'simple_development',
        'move_quality', 0.60,
        'blunder_chance', 0.18
      ),
      'live_phase', jsonb_build_object(
        'depth', 7,
        'stockfish_level', 4,
        'think_time_ms', 850,
        'randomness', 0.13,
        'aggression', 0.35
      )
    )
    WHEN username = 'Jemiah_Analyzer' THEN jsonb_build_object(
      'name', 'Jemiah The Analyzer',
      'title', 'The Pattern Seeker',
      'personality', 'Analytical but inexperienced. Improving steadily.',
      'difficulty', 'beginner-medium',
      'blind_phase', jsonb_build_object(
        'strategy', 'balanced',
        'move_quality', 0.65,
        'blunder_chance', 0.15
      ),
      'live_phase', jsonb_build_object(
        'depth', 8,
        'stockfish_level', 5,
        'think_time_ms', 900,
        'randomness', 0.12,
        'aggression', 0.4
      )
    )
    WHEN username = 'Oneg_Prober' THEN jsonb_build_object(
      'name', 'Oneg The Prober',
      'title', 'The Investigator',
      'personality', 'Testing and probing. Decent tactical awareness.',
      'difficulty', 'medium',
      'blind_phase', jsonb_build_object(
        'strategy', 'aggressive',
        'move_quality', 0.70,
        'blunder_chance', 0.12
      ),
      'live_phase', jsonb_build_object(
        'depth', 9,
        'stockfish_level', 6,
        'think_time_ms', 950,
        'randomness', 0.10,
        'aggression', 0.5
      )
    )
    WHEN username = 'Tefral_Surveyor' THEN jsonb_build_object(
      'name', 'Tefral The Surveyor',
      'title', 'The Territory Mapper',
      'personality', 'Strategic observer. Good understanding of positions.',
      'difficulty', 'medium',
      'blind_phase', jsonb_build_object(
        'strategy', 'balanced',
        'move_quality', 0.73,
        'blunder_chance', 0.11
      ),
      'live_phase', jsonb_build_object(
        'depth', 9,
        'stockfish_level', 7,
        'think_time_ms', 950,
        'randomness', 0.09,
        'aggression', 0.45
      )
    )
  END as config
FROM players
WHERE is_bot = TRUE;

-- Success message
DO $$
DECLARE
  bot_count INT;
  beginner_bot_count INT;
BEGIN
  SELECT COUNT(*) INTO bot_count FROM players WHERE is_bot = TRUE;
  SELECT COUNT(*) INTO beginner_bot_count FROM players WHERE is_bot = TRUE AND rating < 1400;

  RAISE NOTICE '✅ Beginner Celestial bots added successfully!';
  RAISE NOTICE '🤖 Total Celestial bots: %', bot_count;
  RAISE NOTICE '🎮 Beginner/Medium bots (under 1400): %', beginner_bot_count;
  RAISE NOTICE '';
  RAISE NOTICE 'NEW BEGINNER BOTS:';
  RAISE NOTICE '📊 Nezarr The Calculator - Beginner (1050 rating)';
  RAISE NOTICE '📏 Hargen The Measurer - Beginner (1150 rating)';
  RAISE NOTICE '🔬 Jemiah The Analyzer - Beginner-Medium (1250 rating)';
  RAISE NOTICE '🔍 Oneg The Prober - Medium (1350 rating)';
  RAISE NOTICE '🗺️ Tefral The Surveyor - Medium (1400 rating)';
  RAISE NOTICE '';
  RAISE NOTICE 'EXISTING BOTS:';
  RAISE NOTICE '⚔️ Executioner - Medium (1450 rating)';
  RAISE NOTICE '📦 Gammenon The Gatherer - Medium-Hard (1650 rating)';
  RAISE NOTICE '🔍 Eson The Searcher - Hard (1750 rating)';
  RAISE NOTICE '👑 Arishem The Judge - Expert (2150 rating)';
  RAISE NOTICE '🌟 One Above All - God Tier (2400 rating)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Newcomers at 1200 rating now have 5 bots in their range!';
END $$;
