// Arena entry requirements
// Players must have at least 2x the average entry fee of an arena to enter

export interface ArenaRequirement {
  minStake: number;
  maxStake: number;
  averageStake: number;
  requiredGold: number;
}

export const ARENA_REQUIREMENTS: Record<string, ArenaRequirement> = {
  pawn: {
    minStake: 10,
    maxStake: 24,
    averageStake: 17, // (10 + 24) / 2
    requiredGold: 34, // 17 * 2
  },
  knight: {
    minStake: 25,
    maxStake: 49,
    averageStake: 37, // (25 + 49) / 2
    requiredGold: 74, // 37 * 2
  },
  bishop: {
    minStake: 50,
    maxStake: 99,
    averageStake: 75, // (50 + 99) / 2
    requiredGold: 150, // 75 * 2
  },
  rook: {
    minStake: 100,
    maxStake: 249,
    averageStake: 175, // (100 + 249) / 2
    requiredGold: 350, // 175 * 2
  },
  queen: {
    minStake: 250,
    maxStake: 499,
    averageStake: 375, // (250 + 499) / 2
    requiredGold: 750, // 375 * 2
  },
  king: {
    minStake: 500,
    maxStake: 1000,
    averageStake: 750, // (500 + 1000) / 2
    requiredGold: 1500, // 750 * 2
  },
};

/**
 * Check if player can afford to enter an arena
 * Requires 2x the average entry fee to prevent "all-in" situations
 */
export function canEnterArena(
  playerGold: number,
  minStake: number,
  maxStake: number
): boolean {
  const averageStake = Math.floor((minStake + maxStake) / 2);
  const requiredGold = averageStake * 2;
  return playerGold >= requiredGold;
}

/**
 * Get the minimum gold required to enter an arena
 */
export function getRequiredGold(minStake: number, maxStake: number): number {
  const averageStake = Math.floor((minStake + maxStake) / 2);
  return averageStake * 2;
}

/**
 * Get a message explaining why an arena is locked
 */
export function getArenaLockMessage(
  playerGold: number,
  minStake: number,
  maxStake: number
): string {
  const requiredGold = getRequiredGold(minStake, maxStake);
  const deficit = requiredGold - playerGold;
  return `Need ${requiredGold} 🪙 (${deficit} more)`;
}
