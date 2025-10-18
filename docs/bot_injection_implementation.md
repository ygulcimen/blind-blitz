# Bot Injection Implementation Guide

## ✅ What's Ready

### Database Functions (Run `sql/bot_availability_functions.sql`):
- ✅ `is_bot_available()` - Check if bot is free
- ✅ `get_available_celestial_bot()` - Get available bot by rating
- ✅ `inject_bot_into_room()` - Add bot to room
- ✅ `get_room_wait_time()` - Check how long room has been waiting
- ✅ `check_and_inject_bots()` - Batch auto-injection (optional)

### Frontend Services:
- ✅ `botInjectionService.ts` - All bot injection logic
- ✅ `celestialBotAI.ts` - AI for blind + live phases
- ✅ `celestialBotMatchmaking.ts` - Bot player management
- ✅ `useCelestialBot.ts` - React hook for detection

---

## 🎮 Implementation Steps

### Step 1: Run SQL Script
```bash
# Run this in Supabase SQL Editor
sql/bot_availability_functions.sql
```

### Step 2: Integrate Bot Injection into Matchmaking

When a player creates/joins a matchmaking room, start the 8-second timer:

```typescript
// In your matchmaking service or component
import { botInjectionService } from '../services/botInjectionService';

// After player joins room
const handleMatchmakingStart = (roomId: string, playerRating: number) => {
  console.log('🎯 Player joined room, starting bot injection timer...');

  // Start 8-second timer for bot injection
  const stopTimer = botInjectionService.startBotInjectionTimer(
    roomId,
    playerRating,
    (result) => {
      if (result.success) {
        console.log(`🤖 Bot injected: ${result.botUsername}`);
        // Bot will auto-mark ready after 1 second
        // Game will start when both players ready (normal flow)
      } else {
        console.log(`⚠️ No bot available: ${result.reason}`);
        // Player keeps waiting for humans
      }
    },
    8 // 8 seconds delay
  );

  // IMPORTANT: Clear timer if human joins before 8 seconds
  const subscription = supabase
    .channel(`room_${roomId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'game_room_players',
      filter: `room_id=eq.${roomId}`,
    }, (payload) => {
      // Check if new player is human (not bot)
      const isBot = payload.new.player_id.startsWith('00000000-0000-0000-0001');
      if (!isBot) {
        console.log('✅ Human player joined! Canceling bot injection');
        stopTimer(); // Cancel bot injection
      }
    })
    .subscribe();

  // Cleanup on unmount
  return () => {
    stopTimer();
    subscription.unsubscribe();
  };
};
```

### Step 3: Integrate Bot AI into Blind Phase

When bot needs to submit blind moves:

```typescript
// In BlindPhaseScreen.tsx or similar
import { useCelestialBot } from '../../hooks/useCelestialBot';
import { celestialBotAI } from '../../services/celestialBotAI';

const BlindPhaseScreen = ({ gameId }: { gameId: string }) => {
  const { isBotGame, bot, botColor } = useCelestialBot(gameId);

  // After human submits their moves
  const handleHumanSubmitMoves = async (humanMoves: string[]) => {
    // Submit human moves to database
    await submitBlindMoves(humanMoves, playerColor);

    // If bot game, generate and submit bot moves
    if (isBotGame && bot && botColor) {
      console.log(`🤖 ${bot.config.name} generating blind moves...`);

      // Generate 5 blind moves using bot AI
      const botMoves = await celestialBotAI.generateBlindPhaseMoves(
        bot.config,
        botColor
      );

      // Submit bot moves to database
      await submitBlindMoves(botMoves, botColor);

      console.log(`✅ Bot moves submitted: ${botMoves.join(', ')}`);
    }
  };

  // Rest of your blind phase UI
  return (
    <div>
      {/* Your blind phase UI */}
    </div>
  );
};
```

### Step 4: Integrate Bot AI into Live Phase

When it's bot's turn to move:

```typescript
// In LivePhaseScreen.tsx or MultiplayerLivePhaseScreen.tsx
import { useCelestialBot } from '../../hooks/useCelestialBot';
import { celestialBotAI } from '../../services/celestialBotAI';

const LivePhaseScreen = ({ gameId }: { gameId: string }) => {
  const { isBotGame, bot, botColor } = useCelestialBot(gameId);
  const [currentTurn, setCurrentTurn] = useState<'white' | 'black'>('white');

  // Watch for bot's turn
  useEffect(() => {
    if (isBotGame && currentTurn === botColor && bot) {
      makeBotMove();
    }
  }, [currentTurn, isBotGame, botColor]);

  const makeBotMove = async () => {
    console.log(`🤖 ${bot.config.name}'s turn...`);

    // Get current board position
    const currentFen = chess.fen();

    // Calculate best move using bot AI
    const botMove = await celestialBotAI.calculateLivePhaseMove(
      currentFen,
      bot.config
    );

    if (botMove) {
      console.log(`✅ Bot plays: ${botMove}`);

      // Make the move on the board
      const result = chess.move(botMove);

      // Submit move to database
      await submitLiveMove(result);

      // Update turn
      setCurrentTurn(chess.turn() === 'w' ? 'white' : 'black');
    }
  };

  // Rest of your live phase UI
  return (
    <div>
      {/* Your chess board and UI */}
    </div>
  );
};
```

---

## 🔄 Complete Game Flow

### 1. Matchmaking Phase
```
Player clicks "Quick Match"
  ↓
Room created with 1 player
  ↓
8-second timer starts
  ↓
Timer expires (no human joined)
  ↓
Bot injected into room
  ↓
Bot marks ready after 1 second
  ↓
Game starts (both ready)
```

### 2. Blind Phase
```
Game starts in blind phase
  ↓
Human submits 5 moves
  ↓
System detects bot opponent
  ↓
Bot AI generates 5 moves
  ↓
Bot auto-submits moves
  ↓
Proceed to reveal phase
```

### 3. Reveal Phase
```
Both players' moves revealed
  ↓
Blind phase rewards calculated
  ↓
Proceed to live phase
```

### 4. Live Phase
```
Live chess game starts
  ↓
Human's turn → Human moves
Bot's turn → Bot AI calculates & plays
  ↓
(Repeat until checkmate/draw)
  ↓
Game ends, rewards distributed
  ↓
Both players' stats updated (gold, rating, wins/losses)
```

---

## 🧪 Testing Steps

### Manual Test:
1. Create a test account
2. Start matchmaking
3. Wait 8 seconds (don't let anyone join)
4. Bot should inject automatically
5. Bot marks ready after 1 second
6. Game starts
7. Play blind phase (bot auto-submits after you)
8. See reveal phase
9. Play live phase (bot makes moves automatically)
10. Finish game and check rewards

### Check Bot Availability:
```sql
-- See which bots are available
SELECT
  p.username,
  p.rating,
  is_bot_available(p.id) as is_available
FROM players p
WHERE p.is_bot = TRUE;
```

---

## 🎯 Next Steps

**You need to:**
1. ✅ Run `sql/bot_availability_functions.sql` in Supabase
2. Tell me which files handle:
   - Matchmaking room creation/joining
   - Blind phase move submission
   - Live phase move handling
3. I'll integrate the bot injection and AI into those files

**Or:**
- Say "find and integrate" and I'll search for those files automatically

Ready to integrate? 🚀
