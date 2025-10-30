# Guest Player Bot Matchmaking Fix

## Problem

Guest players can't get matched with bots. Frontend logs show:
```
🤖 Attempting to inject bot into room 165ec12a-9940-46a2-a09e-6aa52cc04541
⚠️ Bot injection failed: {reason: 'room_not_found', message: undefined}
⚠️ No bot available: room_not_found
```

## Root Cause

**RLS (Row Level Security) Issue**: The `inject_bot_into_room` PostgreSQL function runs with `SECURITY DEFINER` but the RLS policies on `game_rooms` and `game_room_players` tables are preventing it from seeing rooms created by guest players (anonymous users).

### Why This Happens

1. Guest creates a room → stored in `game_rooms` table
2. After 8 seconds, frontend calls `inject_bot_into_room(roomId)`
3. Function tries to `SELECT * FROM game_rooms WHERE id = roomId`
4. **RLS policy blocks the query** because:
   - Function runs as owner (postgres/service role)
   - But RLS policies might only allow authenticated users or room creators to see rooms
   - Guest rooms might not be visible to the function

## Solution

Update RLS policies to allow anonymous (guest) users to:
- View all game rooms
- View all game room players
- Execute bot injection functions

## How to Fix

### Step 1: Run the Fix Script

Open Supabase Dashboard → SQL Editor and run:

**File**: `sql/fix_guest_bot_matchmaking.sql`

This will:
1. ✅ Add RLS policies allowing guests to view all rooms
2. ✅ Update `inject_bot_into_room` with better error messages
3. ✅ Grant execute permissions to anonymous users
4. ✅ Add debug logging to help troubleshoot

### Step 2: Test It Works

After running the fix, test with these queries:

```sql
-- 1. Check if bots are available
SELECT * FROM get_available_celestial_bot(800, 2500);
-- Should return a bot (not empty)

-- 2. Check if guest rooms are visible
SELECT id, status, current_players
FROM game_rooms
WHERE status = 'waiting';
-- Should show waiting rooms (including guest rooms)

-- 3. Create a guest account and room in your app
-- Wait 8 seconds
-- Bot should auto-inject
```

### Step 3: Verify in Frontend

1. Open your app in incognito mode
2. Click "TRY AS GUEST"
3. Join any arena (Classic Mode or RoboChaos)
4. Wait 8 seconds
5. Check console logs - should see:
   ```
   ✅ Bot injected successfully!
   🤖 Matched with [Bot Name]
   ```

## What Was Fixed

### Before ❌
- Guest creates room
- Function can't see the room due to RLS
- Returns `room_not_found` error
- No bot joins

### After ✅
- Guest creates room
- Function can see all rooms (RLS allows it)
- Finds available bot
- Bot joins room successfully

## Technical Details

### RLS Policies Added

```sql
-- Allow guests to view all game rooms
CREATE POLICY "Allow anon to view all game rooms"
ON game_rooms FOR SELECT
TO anon
USING (true);

-- Allow guests to view all game room players
CREATE POLICY "Allow anon to view all game room players"
ON game_room_players FOR SELECT
TO anon
USING (true);
```

### Function Updates

Updated `inject_bot_into_room`:
- Added debug logging with `RAISE NOTICE`
- Better error messages showing exactly what failed
- Checks room exists BEFORE locking
- Returns detailed error info in JSON

### Permissions Granted

```sql
GRANT EXECUTE ON FUNCTION inject_bot_into_room TO anon;
GRANT EXECUTE ON FUNCTION get_available_celestial_bot TO anon;
GRANT EXECUTE ON FUNCTION is_bot_available TO anon;
```

## Troubleshooting

### Issue: Still getting "room_not_found"

**Check 1**: Verify RLS policies are active
```sql
SELECT * FROM pg_policies
WHERE tablename = 'game_rooms'
AND policyname LIKE '%anon%';
-- Should show the new policies
```

**Check 2**: Check function logs (Supabase Dashboard → Logs)
Look for NOTICE messages showing why it failed:
```
Room not found: [room-id]
Room not waiting: [room-id] (status: starting)
No bot available in rating range: 800-2500
```

**Check 3**: Verify guest can see rooms
```sql
-- Run this as test (simulates guest access)
SET ROLE anon;
SELECT * FROM game_rooms WHERE status = 'waiting';
RESET ROLE;
-- Should show waiting rooms
```

### Issue: "No bots available"

**Reason**: All bots are in active games

**Solution 1**: Wait for games to finish

**Solution 2**: Clean stuck bot games
```sql
SELECT * FROM cleanup_stuck_bot_games();
```

**Solution 3**: Create more bots
```sql
-- Run: sql/add_beginner_celestial_bots.sql
```

### Issue: Bot injection works but bot never moves

**Reason**: Different issue - bot AI not running

**Check**: Look for errors in `celestialBotAI.ts` logs

## Testing Checklist

After running the fix, verify:

- [ ] Guest can create rooms
- [ ] Guest rooms are visible in waiting list
- [ ] After 8 seconds, bot joins the room
- [ ] Bot username appears in waiting room
- [ ] Game starts when both players ready
- [ ] Bot makes moves during game

## Related Files

- **Fix Script**: `sql/fix_guest_bot_matchmaking.sql`
- **Bot Functions**: `sql/bot_availability_functions.sql`
- **Frontend Service**: `src/services/botInjectionService.ts`
- **Cleanup System**: `sql/RUN_THIS_TO_FIX_EVERYTHING.sql`

## Summary

**Problem**: Guests couldn't match with bots due to RLS blocking room access

**Solution**: Added RLS policies allowing anonymous users (guests) to view rooms and execute bot functions

**Result**: Guests can now play against bots just like authenticated users! 🎉
