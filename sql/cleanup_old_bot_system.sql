-- ============================================
-- CLEANUP OLD BOT SYSTEM
-- This removes the previous bot implementation
-- Run this in Supabase SQL Editor BEFORE creating the new system
-- ============================================

-- 1. Drop trigger first
DROP TRIGGER IF EXISTS trigger_update_bot_stats ON bot_game_stats;

-- 2. Drop function
DROP FUNCTION IF EXISTS update_bot_stats();

-- 3. Drop view
DROP VIEW IF EXISTS bot_leaderboard;

-- 4. Drop tables (cascade will handle foreign keys)
DROP TABLE IF EXISTS bot_game_stats CASCADE;
DROP TABLE IF EXISTS bot_players CASCADE;

-- 5. Remove bot-related columns from game_rooms
DO $$
BEGIN
  -- Remove is_bot_game column if exists
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='game_rooms' AND column_name='is_bot_game') THEN
    ALTER TABLE game_rooms DROP COLUMN is_bot_game;
    RAISE NOTICE '✅ Removed is_bot_game column from game_rooms';
  END IF;

  -- Remove bot_player_id column if exists
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='game_rooms' AND column_name='bot_player_id') THEN
    ALTER TABLE game_rooms DROP COLUMN bot_player_id;
    RAISE NOTICE '✅ Removed bot_player_id column from game_rooms';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Old bot system cleaned up successfully!';
  RAISE NOTICE '📝 Removed: bot_players, bot_game_stats tables';
  RAISE NOTICE '📝 Removed: bot_leaderboard view';
  RAISE NOTICE '📝 Removed: update_bot_stats function and trigger';
  RAISE NOTICE '📝 Removed: bot-related columns from game_rooms';
  RAISE NOTICE '🎯 Ready to implement bots as real players!';
END $$;
