# Arena Entry Requirements System

## Overview
To prevent players from losing all their gold too quickly and becoming unable to play, we've implemented a **2x Average Stake Rule** for arena entry.

## The Rule
**Players must have at least 2x the average entry fee of an arena to enter it.**

This prevents "all-in" situations where a player risks all their gold in one match.

## Arena Thresholds

| Arena | Entry Fee Range | Average Stake | Required Gold | Rationale |
|-------|----------------|---------------|---------------|-----------|
| 🛡️ **Pawn** | 10-24 🪙 | 17 🪙 | **34 🪙** | Even if you lose, you still have 17+ gold left |
| ⚔️ **Knight** | 25-49 🪙 | 37 🪙 | **74 🪙** | Can still play lower arenas after a loss |
| ⭐ **Bishop** | 50-99 🪙 | 75 🪙 | **150 🪙** | Maintains financial safety net |
| 🏰 **Rook** | 100-249 🪙 | 175 🪙 | **350 🪙** | High stakes require high bankroll |
| 👑 **Queen** | 250-499 🪙 | 375 🪙 | **750 🪙** | Premium arena for wealthy players |
| 💎 **King** | 500+ 🪙 | 750 🪙 | **1500 🪙** | Elite arena with maximum protection |

## Example Scenarios

### Scenario 1: Player with 500 Gold
- ✅ Can enter: Pawn, Knight, Bishop, Rook
- ❌ Cannot enter: Queen (needs 750), King (needs 1500)
- **Why?** If they enter Queen arena and lose 375 gold, they'd have only 125 gold left, which severely limits their options.

### Scenario 2: Player with 100 Gold
- ✅ Can enter: Pawn, Knight
- ❌ Cannot enter: Bishop (needs 150), higher arenas
- **Protection:** Even after two losses in Knight arena (~74 gold), they still have gold to play Pawn arena

### Scenario 3: Player with 30 Gold
- ✅ Can enter: Pawn only
- ❌ Cannot enter: All other arenas
- **Safety:** Forces players to build up their bankroll gradually

## Benefits

1. **Prevents Bankruptcy**: Players can't go broke in one match
2. **Encourages Gradual Progression**: Must build gold before accessing higher arenas
3. **Reduces Tilt Losses**: Can't rage-bet all gold on one high-stakes match
4. **Maintains Player Base**: Players always have enough gold to keep playing
5. **Fair Competition**: Players in each arena have similar financial capacity

## Implementation

### Frontend Validation
- **File**: `src/utils/arenaRequirements.ts`
- **Functions**:
  - `canEnterArena(playerGold, minStake, maxStake)`: Checks if player meets requirement
  - `getRequiredGold(minStake, maxStake)`: Calculates required gold
  - `getArenaLockMessage()`: Returns user-friendly error message

### UI Updates
- **Arena Cards**: Show lock icon and required gold for locked arenas
- **Tooltip**: Displays "(2x avg stake)" explanation
- **Quick Join**: Only selects arenas player can afford under the 2x rule

### Backend Validation
- **File**: `sql/add_arena_entry_validation.sql`
- **Function**: `can_enter_arena(player_id, entry_fee)`
- **Integration**: Updated `start_matchmaking()` to check requirements server-side

## Related Changes

### Daily Login Bonus Reduction
- **Changed from**: 100 gold → **50 gold**
- **Rationale**: With the 2x rule, players need to be more strategic about gold management
- **File**: `sql/update_daily_reward_amount.sql`

### UI Improvements
- Removed "Economy Rules" from footer (redundant)
- Updated arena cards to show clear lock states
- Added explanatory text when players can't afford an arena

## Testing Checklist

- [ ] Run SQL updates in Supabase
- [ ] Test with player gold = 30 (should only access Pawn)
- [ ] Test with player gold = 500 (should access up to Rook)
- [ ] Test Quick Join with various gold amounts
- [ ] Verify server-side validation prevents bypassing
- [ ] Check arena cards display correct required gold amounts
- [ ] Test daily login bonus gives 50 gold (not 100)

## Future Enhancements

1. **Dynamic Thresholds**: Adjust requirements based on player statistics
2. **VIP Bypass**: Premium members might have lower requirements
3. **Tournament Mode**: Different rules for tournament entries
4. **Gold Loans**: Allow players to "borrow" gold with interest for arena entry
5. **Insurance System**: Optional insurance to protect against total loss

---

**Implementation Date**: 2025-10-23
**Version**: 1.0
**Status**: Ready for Testing
