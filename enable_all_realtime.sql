-- Enable Realtime for all game-related tables
-- Run this in Supabase SQL Editor

-- 1. Enable realtime for game_live_moves (CRITICAL for move log)
ALTER TABLE game_live_moves REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE game_live_moves;

-- 2. Enable realtime for game_live_state (for timer and game state updates)
ALTER TABLE game_live_state REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE game_live_state;

-- 3. Enable realtime for game_rooms (for waiting room updates)
ALTER TABLE game_rooms REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;

-- 4. Enable realtime for game_room_players (for player ready status)
ALTER TABLE game_room_players REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE game_room_players;

-- 5. Enable realtime for game_draw_offers (for draw offer notifications)
ALTER TABLE game_draw_offers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE game_draw_offers;

-- Verify all tables have realtime enabled
SELECT
    schemaname,
    tablename,
    pg_get_replica_identity_type(tablename::regclass) as replica_identity
FROM pg_tables
WHERE tablename IN (
    'game_live_moves',
    'game_live_state',
    'game_rooms',
    'game_room_players',
    'game_draw_offers'
)
ORDER BY tablename;

-- Check which tables are in the publication
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
