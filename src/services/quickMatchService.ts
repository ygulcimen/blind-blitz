// src/services/quickMatchService.ts
import { lobbyService } from './lobbyService';

interface QuickMatchResult {
  success: boolean;
  gameId?: string;
  action: 'joined_existing' | 'created_new' | 'error';
  message?: string;
}

class QuickMatchService {
  async findQuickMatch(playerGold: number): Promise<QuickMatchResult> {
    console.log('QuickMatch starting for player with', playerGold, 'gold');

    try {
      // Step 1: Look for existing rooms to join
      const availableRooms = await lobbyService.getAvailableRoomsForQuickMatch(
        playerGold
      );
      console.log('Found', availableRooms.length, 'available rooms');

      if (availableRooms.length > 0) {
        const room = availableRooms[0];
        console.log('Attempting to join room:', room.id);

        try {
          await lobbyService.joinRoom(room.id);
          console.log('Successfully joined room:', room.id);
          return {
            success: true,
            gameId: room.id,
            action: 'joined_existing',
            message: `Joined ${room.host}'s room`,
          };
        } catch (joinError) {
          console.log('Failed to join room, will create new one:', joinError);
          // Continue to room creation below
        }
      }

      // Step 2: Create new room
      const entryFee = this.calculateEntryFee(playerGold);
      console.log('Creating new room with entry fee:', entryFee);

      const roomConfig = {
        mode: 'classic' as const,
        entryFee,
        timeControl: '10+5',
        isPrivate: false,
        maxPlayers: 2,
      };

      const roomId = await lobbyService.createRoom(roomConfig);
      console.log('Successfully created room:', roomId);

      return {
        success: true,
        gameId: roomId,
        action: 'created_new',
        message: 'Created new room - waiting for opponent',
      };
    } catch (error) {
      console.error('QuickMatch failed:', error);
      return {
        success: false,
        action: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to find or create a match',
      };
    }
  }

  private calculateEntryFee(playerGold: number): number {
    if (playerGold >= 500) return 100;
    if (playerGold >= 200) return 50;
    if (playerGold >= 100) return 25;
    return 10;
  }
}

export const quickMatchService = new QuickMatchService();
