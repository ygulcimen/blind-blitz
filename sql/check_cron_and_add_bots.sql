-- ============================================
-- CHECK CRON STATUS & ADD MORE 1200-1300 BOTS
-- ============================================

-- ============================================
-- STEP 1: Check if pg_cron is enabled
-- ============================================
SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
) as pg_cron_installed;

-- ============================================
-- STEP 2: Check if cron jobs are scheduled
-- ============================================
SELECT
    jobid,
    jobname,
    schedule,
    active,
    command
FROM cron.job
WHERE jobname IN ('comprehensive-cleanup', 'cleanup-stuck-bots-hourly')
ORDER BY jobname;

-- ============================================
-- STEP 3: Check last run status
-- ============================================
SELECT
    cj.jobname,
    cjr.runid,
    cjr.status,
    cjr.start_time,
    cjr.end_time,
    cjr.return_message
FROM cron.job_run_details cjr
JOIN cron.job cj ON cjr.jobid = cj.jobid
WHERE cj.jobname IN ('comprehensive-cleanup', 'cleanup-stuck-bots-hourly')
ORDER BY cjr.start_time DESC
LIMIT 10;

-- ============================================
-- STEP 4: Check current bot availability
-- ============================================
SELECT
    p.username,
    p.rating,
    p.is_bot,
    COUNT(grp.room_id) as rooms_count,
    ARRAY_AGG(gr.status) FILTER (WHERE gr.status IS NOT NULL) as room_statuses
FROM players p
LEFT JOIN game_room_players grp ON p.id = grp.player_id
LEFT JOIN game_rooms gr ON grp.room_id = gr.id
WHERE p.is_bot = TRUE
    AND p.rating BETWEEN 1100 AND 1400
GROUP BY p.id, p.username, p.rating, p.is_bot
ORDER BY p.rating;

-- ============================================
-- STEP 5: Add 3 more bots in 1200-1300 range
-- ============================================

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
  -- 11. ZIRAN THE TESTER - 1220 rating
  (
    '00000000-0000-0000-0001-000000000011'::uuid,
    'Ziran_Tester',
    1220,
    11000,
    587,
    289,
    278,
    20,
    TRUE,
    NOW() - INTERVAL '9 months'
  ),

  -- 12. ASHEMA THE LISTENER - 1240 rating
  (
    '00000000-0000-0000-0001-000000000012'::uuid,
    'Ashema_Listener',
    1240,
    11500,
    612,
    304,
    286,
    22,
    TRUE,
    NOW() - INTERVAL '9 months'
  ),

  -- 13. EXITAR THE EXTERMINATOR - 1270 rating
  (
    '00000000-0000-0000-0001-000000000013'::uuid,
    'Exitar_Exterminator',
    1270,
    12500,
    648,
    328,
    298,
    22,
    TRUE,
    NOW() - INTERVAL '10 months'
  ),

  -- 14. TIAMUT THE DREAMING - 1290 rating
  (
    '00000000-0000-0000-0001-000000000014'::uuid,
    'Tiamut_Dreaming',
    1290,
    13000,
    678,
    344,
    311,
    23,
    TRUE,
    NOW() - INTERVAL '10 months'
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

-- ============================================
-- STEP 6: Update celestial_bot_configs view
-- ============================================

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

    -- NEW 1200-1300 BOTS
    WHEN username = 'Ziran_Tester' THEN jsonb_build_object(
      'name', 'Ziran The Tester',
      'title', 'The Truth Seeker',
      'personality', 'Tests positions carefully. Building experience.',
      'difficulty', 'beginner-medium',
      'blind_phase', jsonb_build_object(
        'strategy', 'balanced',
        'move_quality', 0.62,
        'blunder_chance', 0.16
      ),
      'live_phase', jsonb_build_object(
        'depth', 8,
        'stockfish_level', 5,
        'think_time_ms', 880,
        'randomness', 0.12,
        'aggression', 0.38
      )
    )
    WHEN username = 'Ashema_Listener' THEN jsonb_build_object(
      'name', 'Ashema The Listener',
      'title', 'The Cosmic Ear',
      'personality', 'Observant and patient. Learns from every game.',
      'difficulty', 'beginner-medium',
      'blind_phase', jsonb_build_object(
        'strategy', 'defensive',
        'move_quality', 0.64,
        'blunder_chance', 0.15
      ),
      'live_phase', jsonb_build_object(
        'depth', 8,
        'stockfish_level', 5,
        'think_time_ms', 890,
        'randomness', 0.12,
        'aggression', 0.35
      )
    )
    WHEN username = 'Exitar_Exterminator' THEN jsonb_build_object(
      'name', 'Exitar The Exterminator',
      'title', 'The Destroyer of Worlds',
      'personality', 'Aggressive but sometimes overextends.',
      'difficulty', 'beginner-medium',
      'blind_phase', jsonb_build_object(
        'strategy', 'aggressive',
        'move_quality', 0.67,
        'blunder_chance', 0.14
      ),
      'live_phase', jsonb_build_object(
        'depth', 8,
        'stockfish_level', 5,
        'think_time_ms', 900,
        'randomness', 0.11,
        'aggression', 0.55
      )
    )
    WHEN username = 'Tiamut_Dreaming' THEN jsonb_build_object(
      'name', 'Tiamut The Dreaming',
      'title', 'The Sleeping Giant',
      'personality', 'Contemplative and strategic. Shows flashes of brilliance.',
      'difficulty', 'beginner-medium',
      'blind_phase', jsonb_build_object(
        'strategy', 'balanced',
        'move_quality', 0.68,
        'blunder_chance', 0.13
      ),
      'live_phase', jsonb_build_object(
        'depth', 8,
        'stockfish_level', 6,
        'think_time_ms', 920,
        'randomness', 0.11,
        'aggression', 0.42
      )
    )
  END as config
FROM players
WHERE is_bot = TRUE;

-- ============================================
-- STEP 7: Verify new bots
-- ============================================

SELECT
    username,
    rating,
    games_played,
    wins,
    losses,
    draws,
    created_at
FROM players
WHERE is_bot = TRUE
    AND rating BETWEEN 1200 AND 1300
ORDER BY rating;

-- ============================================
-- STEP 8: Summary
-- ============================================

DO $$
DECLARE
    total_bots INT;
    bots_1200_1300 INT;
BEGIN
    SELECT COUNT(*) INTO total_bots FROM players WHERE is_bot = TRUE;
    SELECT COUNT(*) INTO bots_1200_1300 FROM players WHERE is_bot = TRUE AND rating BETWEEN 1200 AND 1300;

    RAISE NOTICE '✅ Bot update complete!';
    RAISE NOTICE '';
    RAISE NOTICE '🤖 Total Celestial bots: %', total_bots;
    RAISE NOTICE '🎯 Bots in 1200-1300 range: %', bots_1200_1300;
    RAISE NOTICE '';
    RAISE NOTICE 'NEW BOTS ADDED:';
    RAISE NOTICE '🧪 Ziran The Tester - 1220 rating';
    RAISE NOTICE '👂 Ashema The Listener - 1240 rating';
    RAISE NOTICE '⚔️ Exitar The Exterminator - 1270 rating';
    RAISE NOTICE '💤 Tiamut The Dreaming - 1290 rating';
END $$;
