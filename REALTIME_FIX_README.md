# Fix Move Log Not Updating in Production

## Problem
Move log works locally but not in production because **Supabase Realtime is not enabled** for the `game_live_moves` table.

## Solution
You need to enable Realtime for the database tables in your Supabase project.

## Steps to Fix:

### 1. Go to Supabase Dashboard
1. Open your project at https://supabase.com
2. Click on your project (blind-blitz)
3. Go to **SQL Editor** in the left sidebar

### 2. Run the SQL Script
Copy and paste the contents of `enable_all_realtime.sql` into the SQL Editor and click **Run**.

This will:
- Enable realtime for `game_live_moves` (fixes move log)
- Enable realtime for `game_live_state` (ensures timer updates)
- Enable realtime for `game_rooms` (waiting room updates)
- Enable realtime for `game_room_players` (player ready status)
- Enable realtime for `game_draw_offers` (draw offer notifications)

### 3. Verify It Worked
The script will show you which tables have realtime enabled. You should see:
```
tablename           | replica_identity
--------------------|------------------
game_draw_offers    | f
game_live_moves     | f
game_live_state     | f
game_room_players   | f
game_rooms          | f
```

And in the publication check:
```
tablename
------------------
game_draw_offers
game_live_moves
game_live_state
game_room_players
game_rooms
```

### 4. Alternative: Use Supabase UI (Easier)
1. Go to **Database** → **Replication** in Supabase Dashboard
2. Find `supabase_realtime` publication
3. Click **Edit**
4. Add these tables:
   - `game_live_moves` ✅ **MOST IMPORTANT**
   - `game_live_state`
   - `game_rooms`
   - `game_room_players`
   - `game_draw_offers`
5. Click **Save**

## Why This Fixes It
- **Locally**: Your local Supabase has realtime enabled by default for development
- **Production**: Supabase requires explicit configuration for security/performance
- **The Fix**: Explicitly enable realtime publications for the tables we're subscribing to

## Test After Fix
1. Deploy your app
2. Play a game with your friend
3. Make moves - they should appear immediately without refresh!

## If Still Not Working
Check RLS policies to ensure users can SELECT from `game_live_moves`:
```sql
-- Verify RLS policies allow reading moves
SELECT * FROM game_live_moves WHERE game_id = 'your-test-game-id';
```

If you can't see moves, you may need to adjust RLS policies.
