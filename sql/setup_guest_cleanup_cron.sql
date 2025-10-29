-- ============================================
-- SETUP AUTOMATIC GUEST ACCOUNT CLEANUP
-- Using Supabase pg_cron extension
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Enable pg_cron extension (if not already enabled)
-- Note: In Supabase, pg_cron may need to be enabled via Dashboard > Database > Extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule daily cleanup at 3 AM UTC
-- This runs cleanup_expired_guest_accounts() every day at 3:00 AM
SELECT cron.schedule(
  'cleanup-expired-guests',           -- Job name
  '0 3 * * *',                        -- Cron schedule (3 AM daily)
  $$
  SELECT cleanup_expired_guest_accounts();
  $$
);

-- 3. Verify the job was created
SELECT * FROM cron.job WHERE jobname = 'cleanup-expired-guests';

-- 4. Check job run history (after it runs)
-- SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-expired-guests') ORDER BY start_time DESC LIMIT 10;

-- ============================================
-- MANAGEMENT COMMANDS
-- ============================================

-- To manually trigger cleanup (for testing):
-- SELECT cleanup_expired_guest_accounts();

-- To unschedule the job:
-- SELECT cron.unschedule('cleanup-expired-guests');

-- To change the schedule (e.g., run every hour):
-- SELECT cron.unschedule('cleanup-expired-guests');
-- SELECT cron.schedule('cleanup-expired-guests', '0 * * * *', $$ SELECT cleanup_expired_guest_accounts(); $$);

-- ============================================
-- NOTES
-- ============================================
-- Cron schedule format: 'minute hour day month weekday'
-- Examples:
--   '0 3 * * *'     - Daily at 3 AM
--   '0 */6 * * *'   - Every 6 hours
--   '0 0 * * 0'     - Weekly on Sunday midnight
--   '0 2 1 * *'     - Monthly on 1st at 2 AM
--
-- The cleanup function will:
-- - Delete guest players where guest_expires_at < NOW() (expired after 7 days)
-- - Only delete if updated_at < NOW() - INTERVAL '1 day' (inactive for 24 hours)
-- - Return count of deleted accounts
