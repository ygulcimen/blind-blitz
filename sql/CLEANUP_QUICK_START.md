# Cleanup System Quick Start Guide

## Problem Found
The guest cleanup function was failing because it referenced `updated_at` column which doesn't exist in the `players` table.

## Fix Applied
Created a comprehensive cleanup system that handles:
1. ✅ Expired guest accounts
2. ✅ Stuck bot games (bots trapped in old games)

## How to Run Manually

### 1. Preview What Will Be Cleaned (Safe - Doesn't Delete)

```sql
-- See expired guests that would be deleted
SELECT * FROM preview_guest_cleanup();

-- See stuck bot games that would be cleaned
SELECT * FROM preview_bot_game_cleanup();
```

### 2. Run Cleanup Manually (Actually Cleans)

```sql
-- Clean ONLY expired guests
SELECT * FROM cleanup_expired_guest_accounts();

-- Clean ONLY stuck bot games
SELECT * FROM cleanup_stuck_bot_games();

-- Run BOTH cleanups at once
SELECT * FROM run_all_cleanup();
```

### 3. Check If Cron Jobs Are Running

```sql
-- Check if jobs exist
SELECT
    jobname,
    schedule,
    active,
    command
FROM cron.job
WHERE jobname IN ('comprehensive-cleanup', 'cleanup-stuck-bots-hourly')
ORDER BY jobname;

-- Check recent job runs
SELECT
    j.jobname,
    jr.status,
    jr.return_message,
    jr.start_time
FROM cron.job_run_details jr
JOIN cron.job j ON jr.jobid = j.jobid
WHERE j.jobname IN ('comprehensive-cleanup', 'cleanup-stuck-bots-hourly')
ORDER BY jr.start_time DESC
LIMIT 10;
```

## Installation Steps

### Step 1: Fix the Guest Cleanup Function
Run this in Supabase SQL Editor:
```sql
-- Run: sql/fix_guest_cleanup_function.sql
```

### Step 2: Install Comprehensive Cleanup System
Run this in Supabase SQL Editor:
```sql
-- Run: sql/cleanup_system_fixed.sql
-- (This drops old functions first, then creates new ones)
```

This will:
- Fix the guest cleanup function
- Add stuck bot game cleanup
- Set up cron jobs:
  - **Daily at 3 AM**: Run both cleanups
  - **Every hour**: Clean stuck bot games (frees bots)

## What Gets Cleaned

### Guest Accounts
- **Criteria**: Guest accounts that are:
  - Expired (past `guest_expires_at` date)
  - Created more than 24 hours ago
- **Result**: Deleted from database

### Stuck Bot Games
- **Criteria**: Game rooms that are:
  - Still in active status (not finished)
  - Created more than 2 hours ago
  - Have at least one bot player
- **Result**:
  - Room marked as finished
  - All players removed (bots freed)
  - Bots become available for new games

## Testing the Fix

### Test 1: Check Current State
```sql
-- How many guests exist and how many are expired?
SELECT
    COUNT(*) as total_guests,
    COUNT(*) FILTER (WHERE guest_expires_at < NOW()) as expired_guests,
    COUNT(*) FILTER (WHERE guest_expires_at < NOW() AND created_at < NOW() - INTERVAL '1 day') as eligible_for_cleanup
FROM players
WHERE is_guest = TRUE;

-- How many bots are stuck in old games?
SELECT COUNT(*)
FROM game_rooms gr
WHERE gr.status IN ('waiting', 'starting', 'blind', 'revealing', 'live')
    AND gr.created_at < NOW() - INTERVAL '2 hours'
    AND EXISTS (
        SELECT 1 FROM game_room_players grp
        JOIN players p ON grp.player_id = p.id
        WHERE grp.room_id = gr.id AND p.is_bot = TRUE
    );
```

### Test 2: Preview What Would Be Cleaned
```sql
-- Safe preview (doesn't actually delete)
SELECT * FROM preview_guest_cleanup();
SELECT * FROM preview_bot_game_cleanup();
```

### Test 3: Run Cleanup Manually
```sql
-- Actually run the cleanup
SELECT * FROM run_all_cleanup();
```

### Test 4: Verify Results
```sql
-- Check if guests were deleted
SELECT COUNT(*) FROM players WHERE is_guest = TRUE;

-- Check if bots are now available
SELECT
    p.username,
    p.is_bot,
    is_bot_available(p.id) as is_available
FROM players p
WHERE p.is_bot = TRUE;
```

## Troubleshooting

### Issue: Function still references `updated_at`
**Solution**: Run `fix_guest_cleanup_function.sql` to fix it

### Issue: Cron jobs not running
**Solution**:
1. Check if `pg_cron` is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```
2. If empty, enable it in Dashboard → Database → Extensions
3. Re-run `cleanup_system.sql`

### Issue: All bots are busy/unavailable
**Solution**:
1. Check for stuck games:
   ```sql
   SELECT * FROM preview_bot_game_cleanup();
   ```
2. Clean them manually:
   ```sql
   SELECT * FROM cleanup_stuck_bot_games();
   ```
3. Verify bots are freed:
   ```sql
   SELECT username, is_bot_available(id) FROM players WHERE is_bot = TRUE;
   ```

## Summary

**Fixed**: Guest cleanup now uses `created_at` instead of non-existent `updated_at`

**Added**: Bot game cleanup to free stuck bots

**Automated**: Cron jobs run automatically:
- Full cleanup: Daily at 3 AM
- Bot cleanup: Every hour

**Manual**: Run anytime with `SELECT * FROM run_all_cleanup();`
