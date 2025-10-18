# Celestial Bot System - Quick Start

## Implementation Status: ✅ COMPLETE

All code is implemented. Just run the SQL scripts and test!

---

## 3-Step Setup

### Step 1: Run SQL Scripts in Supabase

Open your Supabase SQL Editor and run these **in order**:

#### 1.1 Clean Old System
```sql
-- Copy/paste contents of: sql/cleanup_old_bot_system.sql
```

#### 1.2 Create Bot Players
```sql
-- Copy/paste contents of: sql/create_celestial_bots.sql
```

#### 1.3 Create Bot Functions
```sql
-- Copy/paste contents of: sql/bot_availability_functions.sql
```

---

### Step 2: Verify Database

Run this query in Supabase:
```sql
SELECT username, rating, is_bot FROM players WHERE is_bot = TRUE;
```

**Expected Result:**
```
username                | rating | is_bot
-----------------------|--------|--------
Arishem_The_Judge      | 2150   | true
Eson_The_Searcher      | 1750   | true
Executioner            | 1450   | true
Gammenon_Gatherer      | 1650   | true
One_Above_All          | 2400   | true
```

✅ If you see 5 bots, you're ready to test!

---

### Step 3: Test the System

#### Quick Test (2 minutes)

1. **Start your app** and log in
2. **Go to lobby** (`/games`)
3. **Create a game room** (any stake amount)
4. **Wait in waiting room** - count to 8 seconds
5. **Watch for bot injection** at 8 seconds
6. **Bot marks ready** automatically after 1 second
7. **Both ready** - payment processes, game starts
8. **Play blind phase** - submit your 5 moves
9. **Bot auto-submits** - wait a moment, reveal phase starts
10. **Play live phase** - bot makes moves automatically

---

## What to Watch For

### Console Logs (Developer Tools)

If everything works, you'll see:

```
🤖 Starting bot injection timer (8 seconds)...
✅ Bot injected: Executioner
🤖 Executioner generating blind phase moves...
✅ Bot generated moves: e4, Nf3, Bc4, O-O, d4
✅ Executioner submitted all blind moves!
🤖 Bot turn detected, calculating move...
🤖 Bot calculated move: Nf6
✅ Bot move submitted successfully
```

### UI Behavior

- **8 seconds**: Bot player appears in waiting room
- **9 seconds**: Bot shows as "Ready" (green checkmark)
- **Blind phase**: Bot move counter shows 5/5 after you submit
- **Live phase**: Bot moves appear automatically (1-second delay)

---

## Troubleshooting Quick Fixes

### ❌ No bot appears after 8 seconds

**Fix:**
```sql
-- Verify bots exist
SELECT * FROM players WHERE is_bot = TRUE;

-- Check bot availability function exists
SELECT * FROM get_available_celestial_bot(1200, 1600);
```

### ❌ Bot doesn't submit blind moves

**Fix:**
- Check console for error messages
- Verify bot detection:
```sql
SELECT * FROM game_room_players WHERE room_id = 'YOUR_GAME_ID';
```

### ❌ Bot doesn't make live moves

**Fix:**
- Open browser console (F12)
- Look for "🤖 Bot turn detected" message
- If missing, check `MultiplayerLivePhaseScreen.tsx` has correct import:
```typescript
import { celestialBotAI } from '../../services/celestialBotAI';
```

---

## The 5 Celestial Bots

| Bot | Rating | Difficulty | Play Style |
|-----|--------|-----------|------------|
| 👑 **Arishem The Judge** | 2150 | Expert | Strategic, rarely makes mistakes |
| 🔍 **Eson The Searcher** | 1750 | Hard | Analytical, strong positional play |
| ⚔️ **Executioner** | 1450 | Medium | Aggressive, tactical, attacking |
| 📦 **Gammenon Gatherer** | 1650 | Medium-Hard | Patient, defensive, strategic |
| 🌟 **One Above All** | 2400 | God Tier | Near-flawless, omniscient play |

---

## Key Files Reference

### SQL Scripts (Run These First)
- [`sql/cleanup_old_bot_system.sql`](../sql/cleanup_old_bot_system.sql)
- [`sql/create_celestial_bots.sql`](../sql/create_celestial_bots.sql)
- [`sql/bot_availability_functions.sql`](../sql/bot_availability_functions.sql)

### Bot Services (Already Implemented)
- [`src/services/celestialBotAI.ts`](../src/services/celestialBotAI.ts) - Bot intelligence
- [`src/services/celestialBotMatchmaking.ts`](../src/services/celestialBotMatchmaking.ts) - Bot management
- [`src/services/botInjectionService.ts`](../src/services/botInjectionService.ts) - Bot injection logic

### Integration Hooks (Already Modified)
- [`src/hooks/useCelestialBot.ts`](../src/hooks/useCelestialBot.ts) - Bot detection
- [`src/hooks/useWaitingRoomState.ts`](../src/hooks/useWaitingRoomState.ts) - 8-second timer
- [`src/hooks/useBlindPhaseState.ts`](../src/hooks/useBlindPhaseState.ts) - Bot blind moves
- [`src/components/LivePhase/MultiplayerLivePhaseScreen.tsx`](../src/components/LivePhase/MultiplayerLivePhaseScreen.tsx) - Bot live moves

### Documentation
- [`docs/IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) - Complete overview
- [`docs/CELESTIAL_BOT_TESTING_GUIDE.md`](./CELESTIAL_BOT_TESTING_GUIDE.md) - Detailed testing
- [`docs/supabaseFunctions.md`](./supabaseFunctions.md) - Database functions reference

---

## FAQ

### Q: Can players tell they're playing a bot?

**A:** No! Bots are indistinguishable from real players:
- Have realistic usernames
- Show in leaderboards
- Have game history (wins/losses/draws)
- Move with realistic timing (1-4 seconds)
- No "BOT" label or indicator

### Q: How long do players wait before a bot joins?

**A:** Exactly 8 seconds. This gives time for humans to join first.

### Q: Can multiple players get the same bot?

**A:** No. Each bot can only play one game at a time (like a real player).

### Q: What happens if all bots are busy?

**A:** Player waits in the room for a human opponent. No bot injection happens.

### Q: Do bots cost money/resources to run?

**A:** No. Bots use the same database tables as humans. AI runs in the browser (client-side).

### Q: Can I add more bots?

**A:** Yes! Duplicate the bot creation SQL with new UUIDs and names.

### Q: Do bots appear in leaderboards?

**A:** Yes! They're real players with stats that update after each game.

### Q: How good are the bots?

**A:** Ranges from 1450 (decent) to 2400 (extremely strong). Most players will find Arishem (2150) challenging.

---

## Next Steps

1. ✅ Run the 3 SQL scripts
2. ✅ Verify bots exist in database
3. ✅ Test bot injection (8-second wait)
4. ✅ Test full game flow (blind → live → end)
5. 📚 Read detailed docs if needed

---

## Need Help?

1. **Check Console Logs** - Most issues show clear error messages
2. **Verify SQL Ran** - Re-run scripts if needed
3. **Test Functions** - Use Supabase SQL editor to test bot functions
4. **Read Full Guide** - See [CELESTIAL_BOT_TESTING_GUIDE.md](./CELESTIAL_BOT_TESTING_GUIDE.md)

---

## Success Checklist

After testing, you should be able to:

- [ ] Create a game room
- [ ] Wait 8 seconds and see a bot join
- [ ] Bot marks ready automatically
- [ ] Both players ready triggers payment
- [ ] Game starts in blind phase
- [ ] Submit your 5 blind moves
- [ ] Bot auto-generates and submits 5 moves
- [ ] Reveal phase shows both move sets
- [ ] Live phase starts
- [ ] Bot makes moves automatically
- [ ] Game ends normally (checkmate/timeout/draw)
- [ ] Stats update for both players
- [ ] Bots appear in leaderboard

If all boxes checked: 🎉 **System is working perfectly!**

---

**Ready to test? Start with Step 1!** 🚀
