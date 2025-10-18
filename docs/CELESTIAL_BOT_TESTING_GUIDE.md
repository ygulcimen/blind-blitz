# Celestial Bot System - Testing Guide

## Implementation Status: COMPLETE

All code integration has been successfully completed. The Celestial bot system is now fully integrated into your game flow.

---

## Quick Verification Checklist

Before you start testing, verify these steps:

### 1. Database Setup (Required!)

Run these SQL scripts in order in your Supabase SQL editor:

```sql
-- Step 1: Clean up old bot system (if you had one)
-- Run: sql/cleanup_old_bot_system.sql
-- This removes any old bot tables/functions

-- Step 2: Create the 5 Celestial bot players
-- Run: sql/create_celestial_bots.sql
-- Creates: Arishem, Eson, Executioner, Gammenon, One Above All

-- Step 3: Create bot availability functions
-- Run: sql/bot_availability_functions.sql
-- Creates: is_bot_available, get_available_celestial_bot, inject_bot_into_room, etc.
```

### 2. Verify Database

After running the SQL scripts, verify in Supabase:

**Check Players Table:**
```sql
SELECT username, rating, is_bot, games_played, wins, losses
FROM players
WHERE is_bot = TRUE;
```

You should see 5 bots:
- Arishem_The_Judge (2150 rating)
- Eson_The_Searcher (1750 rating)
- Executioner (1450 rating)
- Gammenon_The_Gatherer (1650 rating)
- One_Above_All (2400 rating)

**Check Bot Configs View:**
```sql
SELECT username, config->>'name' as bot_name, config->>'difficulty' as difficulty
FROM celestial_bot_configs;
```

You should see 5 rows with bot configurations.

**Test Bot Functions:**
```sql
-- Test getting an available bot
SELECT * FROM get_available_celestial_bot(1200, 1600);

-- Should return a bot like Executioner or Gammenon within that rating range
```

---

## Testing Flow

### Test 1: Bot Injection (Most Important!)

This tests if bots automatically join when no humans are available.

**Steps:**
1. Start your app and log in
2. Go to the lobby page
3. Create a new game room OR join quickplay
4. Wait in the waiting room
5. **Start a timer** - count to 8 seconds
6. After 8 seconds, a bot should automatically join

**Expected Behavior:**
- At 8 seconds: Bot appears in the waiting room
- At 9 seconds: Bot marks ready automatically
- Both players ready: Payment processing starts
- After countdown: Game transitions to blind phase

**Console Logs to Watch:**
```
🤖 Starting bot injection timer (8 seconds)...
✅ Bot injected: Executioner
```

**What if it fails?**
- Check console for errors
- Verify SQL scripts were run
- Check Supabase logs for function errors
- Verify bots exist: `SELECT * FROM players WHERE is_bot = TRUE;`

---

### Test 2: Blind Phase Bot Behavior

This tests if bots generate and submit blind moves.

**Steps:**
1. After bot injection, both players should be ready
2. Game starts and enters blind phase
3. You create your 5 blind moves
4. Click "Submit Moves"
5. Wait a moment

**Expected Behavior:**
- Human submits moves: ✅
- System detects bot game
- Bot AI generates 5 moves automatically
- Bot submits moves to database
- Both submitted: Reveal phase starts

**Console Logs to Watch:**
```
🤖 Arishem The Judge generating blind phase moves...
✅ Bot generated moves: e4, Nf3, Bc4, O-O, d4
✅ Arishem The Judge submitted all blind moves!
```

**What if it fails?**
- Check: `SELECT * FROM game_blind_moves WHERE game_id = 'YOUR_GAME_ID';`
- Both players should have 5 moves with `is_submitted = TRUE`
- Check console for errors in `useBlindPhaseState.ts`

---

### Test 3: Live Phase Bot Moves

This tests if bots play moves during the live chess phase.

**Steps:**
1. Complete blind phase (reveal phase happens automatically)
2. Live phase starts
3. If you're white, make your first move
4. Wait 1 second

**Expected Behavior:**
- Human makes move: ✅
- Bot detects it's their turn
- Bot calculates best move (1 second delay)
- Bot makes move automatically
- Game continues until checkmate/draw

**Console Logs to Watch:**
```
🤖 Bot turn detected, calculating move...
🤖 Bot calculated move: Nf6
✅ Bot move submitted successfully
```

**What if it fails?**
- Check `MultiplayerLivePhaseScreen.tsx` console logs
- Verify `celestialBotAI.ts` is being imported correctly
- Check if `botGame` prop is being passed correctly

---

### Test 4: Game Ending & Rewards

This tests if stats/gold/ratings update correctly after playing a bot.

**Steps:**
1. Complete a full game against a bot (win, lose, or draw)
2. Game end modal appears
3. Check your stats

**Expected Behavior:**
- Game ends normally (checkmate/timeout/resignation)
- Rewards screen shows correct gold +/-
- Your rating changes based on result
- Bot's rating also updates
- Both appear in leaderboard

**Check Database:**
```sql
-- Check your stats updated
SELECT username, gold_balance, rating, games_played, wins, losses, draws
FROM players
WHERE username = 'YOUR_USERNAME';

-- Check bot stats updated
SELECT username, gold_balance, rating, games_played, wins, losses, draws
FROM players
WHERE username = 'Executioner'; -- Or whichever bot you played
```

---

## Common Issues & Solutions

### Issue 1: "No bot available after 8 seconds"

**Cause:** All bots are currently in other games (one bot = one game limit)

**Solutions:**
- Wait for bots to finish their games
- Add more bots (duplicate SQL with new UUIDs and names)
- Check: `SELECT * FROM is_bot_available('BOT_UUID');` for each bot

---

### Issue 2: "Bot doesn't submit blind moves"

**Cause:** `useCelestialBot` hook not detecting bot game

**Debug:**
```javascript
// In useBlindPhaseState.ts, check these logs:
console.log('Bot detection:', { isBotGame, bot, botColor });
```

**Solutions:**
- Verify bot is in `game_room_players` table
- Check `celestial_bot_configs` view exists
- Verify bot has `is_bot = TRUE` in players table

---

### Issue 3: "Bot doesn't make live moves"

**Cause:** Import path wrong or botGame prop not passed

**Check:**
1. `MultiplayerLivePhaseScreen.tsx` imports: `import { celestialBotAI } from '../../services/celestialBotAI';`
2. `GameScreen.tsx` passes `botGame` prop correctly
3. Console logs show: `🤖 Bot turn detected`

---

### Issue 4: "Bot injection timer doesn't start"

**Cause:** Conditions not met in `useWaitingRoomState`

**Debug:**
```javascript
// Check these values in console:
console.log({
  status: roomData.status,
  currentPlayers: roomData.current_players,
  playersLength: players.length
});
```

**Requirements:**
- `roomData.status === 'waiting'`
- `roomData.current_players === 1`
- `players.length === 1`

---

## Advanced Testing

### Test Different Bot Difficulties

Play against each bot to feel the difference:

1. **Executioner (1450)** - Aggressive, makes tactical mistakes
2. **Gammenon (1650)** - Defensive, patient, good piece coordination
3. **Eson (1750)** - Curious, strong positional play
4. **Arishem (2150)** - Strategic, calculating, rare mistakes
5. **One Above All (2400)** - Near-perfect play, very challenging

### Test Rating Matchmaking

Create accounts with different ratings and verify:
- Low rating (800-1200): Gets Executioner
- Medium rating (1400-1700): Gets Gammenon or Eson
- High rating (1800-2200): Gets Arishem
- Expert rating (2200+): Gets One Above All

### Test Bot Availability

1. Create 5 games simultaneously (using 5 different accounts)
2. Each game should get a different bot
3. Try creating a 6th game - no bot should inject (all busy)

---

## Performance Monitoring

### Check Bot Response Times

**Blind Phase:**
- Bot should generate 5 moves in < 500ms
- Check: `console.time('bot-blind-moves')` in `celestialBotAI.ts`

**Live Phase:**
- Bot should calculate move in < 1 second
- Depth 2-3 for easy bots, depth 4-5 for hard bots

### Check Database Load

```sql
-- Check active bot games
SELECT
  gr.id,
  gr.status,
  p1.username as player1,
  p2.username as player2
FROM game_rooms gr
JOIN game_room_players grp1 ON gr.id = grp1.room_id
JOIN players p1 ON grp1.player_id = p1.id
JOIN game_room_players grp2 ON gr.id = grp2.room_id AND grp2.player_id != grp1.player_id
JOIN players p2 ON grp2.player_id = p2.id
WHERE p1.is_bot = TRUE OR p2.is_bot = TRUE
AND gr.status IN ('waiting', 'starting', 'blind', 'revealing', 'live');
```

---

## Success Criteria

Your Celestial bot system is working correctly if:

✅ Bots inject after 8 seconds when no humans join
✅ Bots mark ready automatically after 1 second
✅ Bots generate and submit 5 blind moves
✅ Bots play live moves with realistic timing
✅ Bots appear in leaderboards
✅ Bot stats (gold, rating, W/L/D) update correctly
✅ Players can't tell they're playing against bots
✅ One bot only plays one game at a time

---

## Next Steps (Optional Enhancements)

Once core testing is complete, consider:

1. **More Bots** - Add more Celestial characters (Tiamut, Hargen, Nezarr, etc.)
2. **Bot Personalities** - Different opening preferences, endgame styles
3. **Bot Chat** - Auto-generated messages ("Good move!", "Well played!")
4. **Bot Scheduling** - Some bots only available at certain times
5. **Bot Events** - Special bot-only tournaments
6. **Bot Difficulty Scaling** - Bots adapt to player's rating over time

---

## Getting Help

If you encounter issues:

1. **Check Console Logs** - Most issues show clear error messages
2. **Check Supabase Logs** - Database errors appear in Supabase dashboard
3. **Verify SQL Scripts** - Re-run if needed
4. **Check Documentation** - Read [docs/supabaseFunctions.md](./supabaseFunctions.md)
5. **Test Functions Manually** - Use Supabase SQL editor to test RPC functions

---

## Summary

The Celestial bot system is **fully implemented and ready for testing**. Start with Test 1 (Bot Injection) and work your way through each test systematically. Good luck, and enjoy playing against the Celestials!
