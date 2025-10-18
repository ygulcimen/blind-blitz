# Celestial Bot Integration Guide

## ✅ What's Been Created

### 1. Database Setup
- ✅ 5 Celestial bot accounts in `players` table
- ✅ `is_bot` field added to players
- ✅ `celestial_bot_configs` view with AI configurations
- ✅ `get_random_celestial_bot()` function for matchmaking

### 2. AI Services Created
- ✅ `src/services/celestialBotAI.ts` - AI engine for both phases
- ✅ `src/services/celestialBotMatchmaking.ts` - Bot player management
- ✅ `src/hooks/useCelestialBot.ts` - React hook for bot detection

### 3. Bot Capabilities
- ✅ **Blind Phase**: Generates 5 moves based on personality/strategy
- ✅ **Live Phase**: Minimax algorithm with alpha-beta pruning
- ✅ **Difficulty Levels**: Each Celestial has unique AI parameters
- ✅ **Personalities**: Different play styles (aggressive, defensive, optimal, etc.)

---

## 🎮 How Bots Work

### The 5 Celestial Bots

1. **Arishem The Judge** (Expert - 2150 rating)
   - Strategy: Aggressive development
   - Very strong, rarely blunders (2% chance)
   - Deep search (16 depth), strategic play

2. **Eson The Searcher** (Hard - 1750 rating)
   - Strategy: Balanced
   - Strong positional play (5% blunder chance)
   - Medium-deep search (13 depth)

3. **Executioner** (Medium - 1450 rating)
   - Strategy: Aggressive
   - Favors attacking chess (10% blunder chance)
   - Moderate search (10 depth)

4. **Gammenon The Gatherer** (Medium-Hard - 1650 rating)
   - Strategy: Defensive
   - Patient, defensive play (7% blunder chance)
   - Good search (12 depth)

5. **One Above All** (God - 2400 rating)
   - Strategy: Optimal
   - Near-perfect play (0% blunder chance)
   - Very deep search (20 depth)

---

## 🔧 Integration Steps

### Step 1: Integrate into Blind Phase

You need to modify your blind phase screen to:

1. **Detect if opponent is a bot** using `useCelestialBot` hook
2. **Auto-submit bot moves** after human submits theirs
3. **Generate bot moves** using `celestialBotAI.generateBlindPhaseMoves()`

Example integration:
```typescript
import { useCelestialBot } from '../../hooks/useCelestialBot';
import { celestialBotAI } from '../../services/celestialBotAI';

// In your BlindPhase component
const { isBotGame, bot, botColor } = useCelestialBot(gameId);

// After human submits their blind moves
const handleHumanSubmit = async () => {
  // ... submit human moves ...

  // If bot game, generate and submit bot moves
  if (isBotGame && bot && botColor) {
    const botMoves = await celestialBotAI.generateBlindPhaseMoves(
      bot.config,
      botColor
    );

    // Submit bot moves to database
    await submitBotBlindMoves(botMoves, botColor);
  }
};
```

### Step 2: Integrate into Live Phase

Modify your live phase screen to:

1. **Detect bot's turn**
2. **Calculate bot move** using `celestialBotAI.calculateLivePhaseMove()`
3. **Auto-play bot move** on the board

Example integration:
```typescript
// In your LivePhase component
const { isBotGame, bot, botColor } = useCelestialBot(gameId);

// When it's bot's turn
useEffect(() => {
  if (isBotGame && currentTurn === botColor && bot) {
    const makeBotMove = async () => {
      const currentFen = chess.fen();
      const botMove = await celestialBotAI.calculateLivePhaseMove(
        currentFen,
        bot.config
      );

      if (botMove) {
        // Make the move on the board
        chess.move(botMove);
        // Submit to database
        await submitMove(botMove);
      }
    };

    makeBotMove();
  }
}, [currentTurn, isBotGame, botColor]);
```

### Step 3: Bot Matchmaking (Optional - Future Enhancement)

For automatic bot injection when no humans are available:

1. Create a backend service (Edge Function or similar)
2. Monitor matchmaking queues
3. If queue empty for 15-30 seconds, inject a bot
4. Bot joins queue using `matchmakingService.startMatchmaking()`

This makes bots appear automatically when needed!

---

## 📝 Files to Modify

### Must Modify:
1. **Blind Phase Screen** - Add bot move generation
2. **Live Phase Screen** - Add bot turn handling

### Optional (for better UX):
3. **Game Screen** - Show bot personality/title
4. **Leaderboard** - Bots already appear naturally

---

## 🧪 Testing Checklist

- [ ] Create a game with a bot (manually add bot to game_room_players)
- [ ] Human submits blind moves
- [ ] Bot auto-submits blind moves
- [ ] Reveal phase works normally
- [ ] Live phase: Bot makes moves automatically
- [ ] Game ends normally with rewards
- [ ] Bot stats update (wins/losses/gold/rating)
- [ ] Bot appears in leaderboard

---

## 🎯 Next Actions

**Now you need to:**
1. Tell me which screen files handle Blind Phase and Live Phase
2. I'll help you integrate the bot AI into those screens
3. Test the integration with a manual bot game

**Or if you prefer:**
- I can search for those files and start integrating
- Just say "find and integrate" and I'll do it!

The bots are ready to play - they just need to be connected to your game flow! 🤖♟️
