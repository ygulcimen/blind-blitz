-- Check current RLS policies for game_draw_offers table

-- 1. Check if RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'game_draw_offers';

-- 2. Check existing policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'game_draw_offers'
ORDER BY policyname;

-- 3. Check if there are any active draw offers
SELECT
  id,
  game_id,
  offering_player,
  is_active,
  created_at
FROM game_draw_offers
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check recent draw offers (including inactive)
SELECT
  id,
  game_id,
  offering_player,
  is_active,
  created_at
FROM game_draw_offers
ORDER BY created_at DESC
LIMIT 10;
