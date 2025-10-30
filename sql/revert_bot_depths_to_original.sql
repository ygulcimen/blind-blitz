-- ============================================
-- REVERT BOT DEPTHS TO ORIGINAL VALUES
-- Restores the original bot depth configuration before Edge Function attempt
-- ============================================

-- Drop the modified view
DROP VIEW IF EXISTS celestial_bot_configs;

-- Recreate with original depths
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
        'depth', 16,  -- RESTORED to original
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
        'depth', 13,  -- RESTORED to original
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
        'depth', 10,  -- RESTORED to original
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
        'depth', 12,  -- RESTORED to original
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
        'depth', 20,  -- RESTORED to original
        'stockfish_level', 20,
        'think_time_ms', 2000,
        'randomness', 0.01,
        'aggression', 0.6
      )
    )

    -- BEGINNER BOTS
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
        'depth', 6,  -- RESTORED to original
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
        'depth', 7,  -- RESTORED to original
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
        'depth', 8,  -- RESTORED to original
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
        'depth', 9,  -- RESTORED to original
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
        'depth', 9,  -- RESTORED to original
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
BEGIN
  RAISE NOTICE '✅ Bot depths reverted to original values!';
  RAISE NOTICE '';
  RAISE NOTICE 'NOTE: These high depth values will NOT be used.';
  RAISE NOTICE 'The code uses depth 2 client-side to prevent UI freezing.';
  RAISE NOTICE '';
  RAISE NOTICE '🤖 BEGINNER BOTS:';
  RAISE NOTICE '   📊 Nezarr: Depth 6 (stored, but uses 2)';
  RAISE NOTICE '   📏 Hargen: Depth 7 (stored, but uses 2)';
  RAISE NOTICE '   🔬 Jemiah: Depth 8 (stored, but uses 2)';
  RAISE NOTICE '';
  RAISE NOTICE '🤖 MEDIUM BOTS:';
  RAISE NOTICE '   🔍 Oneg: Depth 9 (stored, but uses 2)';
  RAISE NOTICE '   🗺️ Tefral: Depth 9 (stored, but uses 2)';
  RAISE NOTICE '   ⚔️ Executioner: Depth 10 (stored, but uses 2)';
  RAISE NOTICE '';
  RAISE NOTICE '🤖 HARD BOTS:';
  RAISE NOTICE '   📦 Gammenon: Depth 12 (stored, but uses 2)';
  RAISE NOTICE '   🔍 Eson: Depth 13 (stored, but uses 2)';
  RAISE NOTICE '';
  RAISE NOTICE '🤖 EXPERT+ BOTS:';
  RAISE NOTICE '   👑 Arishem: Depth 16 (stored, but uses 2)';
  RAISE NOTICE '   🌟 One Above All: Depth 20 (stored, but uses 2)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ All bots now use client-side depth 2 calculation.';
  RAISE NOTICE '💡 Edge Function approach was abandoned due to CPU timeout limits.';
END $$;
