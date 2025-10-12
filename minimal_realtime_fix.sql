-- MINIMAL FIX: Only enable realtime for move log
-- If you want to test with minimal changes, run ONLY this

-- This is the ONE table that definitely needs realtime for move log
ALTER TABLE game_live_moves REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE game_live_moves;

-- Verify it worked
SELECT
    tablename,
    CASE
        WHEN pg_get_replica_identity_type(tablename::regclass) = 'f' THEN '✅ Realtime Ready'
        ELSE '❌ Not Ready'
    END as status
FROM pg_tables
WHERE tablename = 'game_live_moves';

-- Check if in publication
SELECT
    CASE
        WHEN EXISTS(
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
            AND tablename = 'game_live_moves'
        ) THEN '✅ In Publication - Move log will work!'
        ELSE '❌ Not in Publication - Move log won''t update'
    END as publication_status;
