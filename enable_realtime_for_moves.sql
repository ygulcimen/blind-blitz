-- Enable Realtime for game_live_moves table
-- This allows real-time subscriptions to work in production

-- Enable realtime on the table
ALTER TABLE game_live_moves REPLICA IDENTITY FULL;

-- Enable publication for realtime
ALTER PUBLICATION supabase_realtime ADD TABLE game_live_moves;

-- Verify it's enabled
SELECT schemaname, tablename,
       pg_get_replica_identity_type(tablename::regclass) as replica_identity
FROM pg_tables
WHERE tablename = 'game_live_moves';
