// src/services/quickMatchService.ts - Updated for 5+0 Signature
import { lobbyService } from './lobbyService';
import { BLINDCHESS_CONSTANTS } from '../screens/lobbyPage/types/lobby.types';

interface QuickMatchResult {
  success: boolean;
  gameId?: string;
  action: 'joined_existing' | 'created_new' | 'error';
  message?: string;
}

class QuickMatchService {
  async findQuickMatch(playerGold: number): Promise<QuickMatchResult> {
    try {
      // Step 1: Look for existing 5+0 signature rooms to join
      const availableRooms = await lobbyService.getAvailableRoomsForQuickMatch(
        playerGold
      );

      if (availableRooms.length > 0) {
        // Prioritize rooms that match our preferences
        const room = this.selectBestRoom(availableRooms, playerGold);

        try {
          await lobbyService.joinRoom(room.id);
          return {
            success: true,
            gameId: room.id,
            action: 'joined_existing',
            message: `Joined ${room.host}'s BlindChess 5+0 battle`,
          };
        } catch (joinError) {
          // Continue to room creation below
        }
      }

      // Step 2: Create new BlindChess 5+0 signature room
      const entryFee = this.calculateOptimalEntryFee(playerGold);

      const roomConfig = {
        mode: 'classic' as const, // Default to classic for quick match
        timeControl: BLINDCHESS_CONSTANTS.TIME_CONTROL, // 🎯 SIGNATURE 5+0
        entryFee,
        isPrivate: false,
        maxPlayers: 2,
        ratingRestriction: 'any', // Open to all for quick match
      };

      const roomId = await lobbyService.createRoom(roomConfig);

      return {
        success: true,
        gameId: roomId,
        action: 'created_new',
        message: 'Created new BlindChess 5+0 battle - waiting for opponent',
      };
    } catch (error) {
      console.error('QuickMatch failed:', error);
      return {
        success: false,
        action: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to find or create a BlindChess 5+0 match',
      };
    }
  }

  /**
   * Select the best room for quick match based on various factors
   */
  private selectBestRoom(rooms: any[], playerGold: number) {
    // Sort rooms by preference:
    // 1. Rooms with entry fees we can comfortably afford (not too high)
    // 2. Rooms that are almost full (faster start)
    // 3. Rooms with reasonable entry fees for our gold level
    return rooms.sort((a, b) => {
      const aAffordability = playerGold / Math.max(1, a.entryFee);
      const bAffordability = playerGold / Math.max(1, b.entryFee);

      // Prefer rooms where we have at least 5x the entry fee (comfortable)
      const aComfortable = aAffordability >= 5 ? 1 : 0;
      const bComfortable = bAffordability >= 5 ? 1 : 0;

      if (aComfortable !== bComfortable) {
        return bComfortable - aComfortable;
      }

      // Prefer rooms closer to full (faster game start)
      const aFillRatio = a.players / a.maxPlayers;
      const bFillRatio = b.players / b.maxPlayers;

      return bFillRatio - aFillRatio;
    })[0];
  }

  /**
   * Calculate optimal entry fee for BlindChess 5+0 based on player's gold
   */
  private calculateOptimalEntryFee(playerGold: number): number {
    // 🎯 BlindChess 5+0 Signature Entry Fee Tiers
    if (playerGold >= 1000) return 200; // High stakes for wealthy players
    if (playerGold >= 500) return 100; // Standard stakes
    if (playerGold >= 250) return 50; // Moderate stakes
    if (playerGold >= 100) return 25; // Low stakes
    return 0; // Free for new players
  }

  /**
   * Get recommended entry fee range for display
   */
  getRecommendedEntryFeeRange(playerGold: number): string {
    const optimal = this.calculateOptimalEntryFee(playerGold);
    if (optimal === 0) return 'Free';

    const min = Math.max(0, optimal - 25);
    const max = Math.min(playerGold, optimal + 50);

    return `${min}-${max}g`;
  }

  /**
   * Check if player can afford BlindChess 5+0 battles
   */
  canPlayBlindChess(playerGold: number): boolean {
    return playerGold >= 0; // Even free battles are available
  }

  /**
   * Get BlindChess 5+0 signature info for UI
   */
  getSignatureInfo() {
    return {
      timeControl: BLINDCHESS_CONSTANTS.TIME_CONTROL,
      description: BLINDCHESS_CONSTANTS.DESCRIPTION,
      signature: BLINDCHESS_CONSTANTS.SIGNATURE,
      blindMoves: BLINDCHESS_CONSTANTS.BLIND_MOVES_COUNT,
      liveMinutes: BLINDCHESS_CONSTANTS.TIME_CONTROL_MINUTES,
      increment: BLINDCHESS_CONSTANTS.TIME_CONTROL_INCREMENT,
    };
  }
}

export const quickMatchService = new QuickMatchService();
