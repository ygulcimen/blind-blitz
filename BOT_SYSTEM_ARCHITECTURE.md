# BlindChess Bot System Architecture

## Overview
The BlindChess bot system uses simple but effective minimax algorithm with depth 2 for all Celestial bots. Stockfish integration was attempted but abandoned due to browser security restrictions.

## Active Components

### TypeScript Services (src/services/)
1. **celestialBotAI.ts** - Core bot AI logic
   - Minimax algorithm with depth 2
   - Generates both blind phase and live phase moves
   - Works for all bot difficulty levels

2. **botInjectionService.ts** - Room injection logic
   - Automatically injects bots after 8 seconds wait
   - Checks bot availability
   - Handles bot ready status

3. **celestialBotMatchmaking.ts** - Bot matchmaking utilities
   - Helper functions for bot matching

### SQL Database Functions (sql/)

#### Core Functions
1. **bot_availability_functions.sql** - ESSENTIAL
   - `is_bot_available()` - Checks if bot is free
   - `get_available_celestial_bot()` - Gets random available bot
   - `inject_bot_into_room()` - Adds bot to waiting room
   - `get_room_wait_time()` - Calculates room wait duration

2. **cleanup_bot_on_player_leave.sql** - ESSENTIAL (NEW)
   - `cleanup_bots_from_abandoned_rooms()` - Removes bots when players leave
   - Trigger: Runs automatically when player leaves room
   - Ensures bots become available immediately

3. **create_celestial_bots.sql** - ESSENTIAL
   - Creates 3 Celestial bot players (Nebula, Quasar, Nova)
   - Initializes bot configurations in database

#### Fix/Migration Files (Apply Once)
4. **fix_bot_functions_bigint.sql**
   - Fixes rating data type issues (BIGINT compatibility)

5. **fix_bot_moves_rls.sql**
   - Sets up Row Level Security for bot moves
   - Allows bots to bypass RLS policies

6. **fix_bot_payment.sql**
   - Ensures bots don't pay entry fees

### Database Migration (supabase/migrations/)
- **make_bot_live_move.sql** - Allows bots to make moves in live phase

## Setup Instructions

### Initial Setup (Do Once)
1. Run in order:
   ```sql
   sql/create_celestial_bots.sql
   sql/fix_bot_functions_bigint.sql
   sql/fix_bot_moves_rls.sql
   sql/fix_bot_payment.sql
   sql/bot_availability_functions.sql
   sql/cleanup_bot_on_player_leave.sql
   ```

2. Run migration:
   ```sql
   supabase/migrations/make_bot_live_move.sql
   ```

### How It Works

#### Bot Injection Flow
1. Player creates room → waits in lobby
2. After 8 seconds: `inject_bot_into_room()` is called
3. Bot is added to `game_room_players` table
4. Bot auto-marks ready after 1 second
5. Game starts when both ready

#### Bot Availability Flow
1. `is_bot_available(bot_id)` checks if bot is in active game
2. Active = room status in ('waiting', 'starting', 'blind', 'revealing', 'live')
3. `get_available_celestial_bot()` returns random available bot
4. When player leaves room → trigger removes bot → bot becomes available

#### Bot Move Generation
- **Blind Phase**: Generates 5 random legal moves
- **Live Phase**: Uses minimax depth 2 to calculate best move
- All bots use same algorithm (difficulty differences are cosmetic for now)

## Removed Components (Cleanup Complete)

### Removed Files
- ❌ `src/services/stockfishWASM.ts` - Failed WASM integration
- ❌ `src/services/stockfishCDN.ts` - Failed CDN integration
- ❌ `public/stockfish/` - Unused Stockfish files
- ❌ `sql/cleanup_old_bot_system.sql` - Redundant
- ❌ `sql/verify_bot_system.sql` - Redundant
- ❌ `docs/bot_injection_implementation.md` - Outdated
- ❌ `docs/bot_system_cleanup_summary.md` - Outdated
- ❌ `docs/celestial_bot_integration_guide.md` - Outdated
- ❌ `APPLY_BOT_CLEANUP_FIX.md` - Temporary guide

### Removed Dependencies
- ❌ `stockfish.wasm` npm package (uninstalled)

## Current Bot Roster

### Celestial Bots
1. **Nebula** (Rating: 1000) - Easy
2. **Quasar** (Rating: 1400) - Medium
3. **Nova** (Rating: 1800) - Hard

All bots use minimax depth 2 for now. Rating differences are for matchmaking only.

## Future Improvements (Planned, Not Implemented)

When ready to implement stronger bots:
1. Research Stockfish.js Web Worker integration with proper CORS
2. Set up SharedArrayBuffer headers if needed
3. Or increase minimax depth for harder bots (may cause UI lag)
4. Or use different evaluation functions per bot level

For now, keep it simple - current system works reliably!
