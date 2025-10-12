# How to Enable Realtime (Step-by-Step)

## Why You Need This
Your move log works locally but not in production because Supabase Realtime needs to be enabled in your production database.

## Is This Safe?
**YES! 100% SAFE!**

### Security:
- ✅ Your RLS policies **STILL control** who can see data
- ✅ Realtime only enables the **transport mechanism** (WebSocket)
- ✅ Users can **ONLY** see data they're allowed to see via RLS
- ✅ No data is exposed that wasn't already accessible

### Performance:
- ✅ **Better** than constantly polling for updates
- ✅ Only sends data when it actually changes
- ✅ This is exactly what Supabase designed realtime for

## How to Check First

### Step 1: Check Current Status
1. Go to https://supabase.com
2. Open your project
3. Click **SQL Editor**
4. Copy and paste contents of `check_realtime_status.sql`
5. Click **Run**

**What you'll see:**
- ❌ Tables marked "NOT in realtime publication" = Need enabling
- ✅ Tables marked "In realtime publication" = Already enabled

---

## How to Enable (Choose ONE method)

### Method A: SQL Script (Recommended - Safer)
1. Go to https://supabase.com
2. Open your project
3. Click **SQL Editor**
4. Copy contents of `enable_all_realtime_safe.sql`
5. Paste and click **Run**
6. Check the output - should see ✅ messages

**This script:**
- Handles errors gracefully
- Shows clear status messages
- Won't break if tables already enabled

### Method B: Supabase UI (Easier)
1. Go to https://supabase.com
2. Open your project
3. Go to **Database** → **Replication** (left sidebar)
4. Find the `supabase_realtime` publication
5. Click **Edit** or **Manage tables**
6. Enable these tables:
   - ☑️ `game_live_moves` ← **MOST IMPORTANT**
   - ☑️ `game_live_state`
   - ☑️ `game_rooms`
   - ☑️ `game_room_players`
   - ☑️ `game_draw_offers`
7. Click **Save**

---

## Verify It Worked

### Run the check script again:
```sql
-- Should show all tables with ✅ status
SELECT tablename, '✅ Enabled' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN (
    'game_live_moves',
    'game_live_state',
    'game_rooms',
    'game_room_players',
    'game_draw_offers'
);
```

---

## Test in Production
1. Deploy your app (it's already deployed)
2. Play a game with your friend
3. Make moves
4. **Moves should appear instantly without refresh!** 🎉

---

## What Each Table Does

| Table | Purpose | Impact if not enabled |
|-------|---------|----------------------|
| `game_live_moves` | Move log updates | **Moves don't show without refresh** |
| `game_live_state` | Timer & game state | Timer updates may lag |
| `game_rooms` | Waiting room status | Room status may be stale |
| `game_room_players` | Player ready status | Ready status may lag |
| `game_draw_offers` | Draw offer notifications | Draw offers may not appear |

---

## Still Having Issues?

### Check RLS Policies
Make sure users can read from these tables:
```sql
-- Test if you can read moves
SELECT * FROM game_live_moves LIMIT 5;

-- If this fails, your RLS policies need adjustment
```

### Check Supabase Logs
1. Go to **Logs** → **Realtime** in Supabase Dashboard
2. Look for subscription errors
3. Look for authentication issues

---

## Summary
1. **Check**: Run `check_realtime_status.sql`
2. **Enable**: Run `enable_all_realtime_safe.sql` OR use UI
3. **Verify**: Check status again
4. **Test**: Play a game - moves should appear instantly!

This is a standard configuration that all production Supabase apps need for realtime features. 🚀
