-- Check if Realtime is enabled for your tables
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check which tables have replica identity (needed for realtime)
SELECT
    schemaname,
    tablename,
    CASE
        WHEN pg_get_replica_identity_type(tablename::regclass) = 'f' THEN '✅ FULL (realtime ready)'
        WHEN pg_get_replica_identity_type(tablename::regclass) = 'd' THEN '⚠️ DEFAULT (realtime NOT configured)'
        WHEN pg_get_replica_identity_type(tablename::regclass) = 'n' THEN '❌ NOTHING (realtime disabled)'
        WHEN pg_get_replica_identity_type(tablename::regclass) = 'i' THEN '🔑 INDEX'
        ELSE 'Unknown'
    END as replica_status
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

-- 2. Check which tables are in the supabase_realtime publication
SELECT
    tablename,
    '✅ In realtime publication' as status
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

-- 3. Check if publication exists
SELECT
    pubname,
    CASE
        WHEN pubname = 'supabase_realtime' THEN '✅ Publication exists'
        ELSE 'Publication found'
    END as status
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- 4. Show MISSING tables (tables that need realtime but don't have it)
SELECT
    t.table_name,
    '❌ NOT in realtime publication - NEEDS ENABLING' as status
FROM information_schema.tables t
WHERE t.table_schema = 'public'
AND t.table_name IN (
    'game_live_moves',
    'game_live_state',
    'game_rooms',
    'game_room_players',
    'game_draw_offers'
)
AND NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables pt
    WHERE pt.pubname = 'supabase_realtime'
    AND pt.tablename = t.table_name
)
ORDER BY t.table_name;
