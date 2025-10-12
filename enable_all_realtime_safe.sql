-- SAFE Enable Realtime for all game-related tables
-- Run this in Supabase SQL Editor

-- ═══════════════════════════════════════════════════════════════
-- SECURITY & PERFORMANCE FAQ
-- ═══════════════════════════════════════════════════════════════
-- Q: Is this secure?
-- A: YES! Your RLS policies STILL control who can see data.
--    Realtime only enables WebSocket transport, NOT data access.
--    Users can ONLY see what RLS allows them to see.
--
-- Q: Will this hurt performance?
-- A: NO! It's actually BETTER than polling (checking constantly).
--    Realtime only sends updates when data actually changes.
--    This is exactly what Supabase designed realtime for!
--
-- Q: Why do I need this?
-- A: Your subscriptions (like move log) use realtime to get instant
--    updates. Without this, they fail silently in production.
-- ═══════════════════════════════════════════════════════════════

-- 1. Enable realtime for game_live_moves (CRITICAL for move log)
DO $$
BEGIN
    ALTER TABLE game_live_moves REPLICA IDENTITY FULL;
    ALTER PUBLICATION supabase_realtime ADD TABLE game_live_moves;
    RAISE NOTICE '✅ game_live_moves enabled';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  game_live_moves already enabled';
END $$;

-- 2. Enable realtime for game_live_state (for timer and game state updates)
DO $$
BEGIN
    ALTER TABLE game_live_state REPLICA IDENTITY FULL;
    ALTER PUBLICATION supabase_realtime ADD TABLE game_live_state;
    RAISE NOTICE '✅ game_live_state enabled';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  game_live_state already enabled';
END $$;

-- 3. Enable realtime for game_rooms (for waiting room updates)
DO $$
BEGIN
    ALTER TABLE game_rooms REPLICA IDENTITY FULL;
    ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
    RAISE NOTICE '✅ game_rooms enabled';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  game_rooms already enabled';
END $$;

-- 4. Enable realtime for game_room_players (for player ready status)
DO $$
BEGIN
    ALTER TABLE game_room_players REPLICA IDENTITY FULL;
    ALTER PUBLICATION supabase_realtime ADD TABLE game_room_players;
    RAISE NOTICE '✅ game_room_players enabled';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  game_room_players already enabled';
END $$;

-- 5. Enable realtime for game_draw_offers (for draw offer notifications)
DO $$
BEGIN
    ALTER TABLE game_draw_offers REPLICA IDENTITY FULL;
    ALTER PUBLICATION supabase_realtime ADD TABLE game_draw_offers;
    RAISE NOTICE '✅ game_draw_offers enabled';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  game_draw_offers already enabled';
END $$;

-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (run these to check status)
-- ═══════════════════════════════════════════════════════════════

-- Check replica identity (should all show 'f' for FULL)
SELECT
    schemaname,
    tablename,
    pg_get_replica_identity_type(tablename::regclass) as replica_identity,
    CASE
        WHEN pg_get_replica_identity_type(tablename::regclass) = 'f' THEN '✅ Enabled'
        ELSE '❌ Not Enabled'
    END as status
FROM pg_tables
WHERE tablename IN (
    'game_live_moves',
    'game_live_state',
    'game_rooms',
    'game_room_players',
    'game_draw_offers'
)
AND schemaname = 'public'
ORDER BY tablename;

-- Check publication (should list all 5 tables)
SELECT
    tablename,
    '✅ In Publication' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND schemaname = 'public'
AND tablename IN (
    'game_live_moves',
    'game_live_state',
    'game_rooms',
    'game_room_players',
    'game_draw_offers'
)
ORDER BY tablename;
