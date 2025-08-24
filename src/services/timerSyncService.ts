// src/services/timerSyncService.ts - SERVER-SIDE TIMER SYNC
import { supabase } from '../lib/supabase';
import { liveMovesService, type LiveGameState } from './liveMovesService';

class TimerSyncService {
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();
  private gameStates: Map<string, LiveGameState> = new Map();

  /**
   * Start server-side timer that updates database
   */
  startServerTimer(gameId: string): () => void {
    // Don't start if already running
    if (this.activeTimers.has(gameId)) {
      console.log('⚠️ Timer already running for game:', gameId);
      return this.stopServerTimer.bind(this, gameId);
    }

    console.log('🚀 Starting server-side timer for game:', gameId);

    const timerInterval = setInterval(async () => {
      await this.updateGameTimer(gameId);
    }, 1000); // Update every 1 second

    this.activeTimers.set(gameId, timerInterval);

    // Return cleanup function
    return () => this.stopServerTimer(gameId);
  }

  /**
   * Stop server-side timer
   */
  stopServerTimer(gameId: string): void {
    const timer = this.activeTimers.get(gameId);
    if (timer) {
      clearInterval(timer);
      this.activeTimers.delete(gameId);
      this.gameStates.delete(gameId);
      console.log('🛑 Stopped server timer for game:', gameId);
    }
  }

  /**
   * Update game timer in database
   */
  private async updateGameTimer(gameId: string): Promise<void> {
    try {
      // Get current game state
      const gameState = await liveMovesService.getGameState(gameId);
      if (!gameState || gameState.game_ended) {
        this.stopServerTimer(gameId);
        return;
      }

      // Calculate elapsed time since last update
      const now = new Date();
      const lastUpdate = new Date(gameState.last_move_time);
      const elapsedMs = now.getTime() - lastUpdate.getTime();

      // Cap elapsed time to prevent huge jumps (max 2 seconds)
      const cappedElapsed = Math.min(elapsedMs, 2000);

      let updateData: any = {
        last_move_time: now.toISOString(),
        updated_at: now.toISOString(),
      };

      let gameEnded = false;
      let gameResult = null;

      // Update current player's time
      if (gameState.current_turn === 'white') {
        const newWhiteTime = Math.max(
          0,
          gameState.white_time_ms - cappedElapsed
        );
        updateData.white_time_ms = newWhiteTime;

        if (newWhiteTime <= 0) {
          gameEnded = true;
          gameResult = {
            type: 'timeout',
            winner: 'black',
            reason: 'timeout',
          };
          updateData.game_ended = true;
          updateData.game_result = gameResult;
        }
      } else {
        const newBlackTime = Math.max(
          0,
          gameState.black_time_ms - cappedElapsed
        );
        updateData.black_time_ms = newBlackTime;

        if (newBlackTime <= 0) {
          gameEnded = true;
          gameResult = {
            type: 'timeout',
            winner: 'white',
            reason: 'timeout',
          };
          updateData.game_ended = true;
          updateData.game_result = gameResult;
        }
      }

      // Update database
      const { error } = await supabase
        .from('game_live_state')
        .update(updateData)
        .eq('game_id', gameId);

      if (error) {
        console.error('❌ Error updating timer:', error);
        return;
      }

      if (gameEnded) {
        console.log(`⏰ Server timeout: ${gameResult?.winner} wins by time`);
        this.stopServerTimer(gameId); // Stop timer when game ends
      } else {
        // Log timer updates (every 10 seconds to avoid spam)
        const currentSecond = Math.floor(now.getTime() / 1000);
        if (currentSecond % 10 === 0) {
          console.log(`🕐 Timer update (${gameState.current_turn}):`, {
            white: `${Math.floor(
              updateData.white_time_ms || gameState.white_time_ms / 60000
            )}:${Math.floor(
              ((updateData.white_time_ms || gameState.white_time_ms) % 60000) /
                1000
            )
              .toString()
              .padStart(2, '0')}`,
            black: `${Math.floor(
              updateData.black_time_ms || gameState.black_time_ms / 60000
            )}:${Math.floor(
              ((updateData.black_time_ms || gameState.black_time_ms) % 60000) /
                1000
            )
              .toString()
              .padStart(2, '0')}`,
          });
        }
      }
    } catch (error) {
      console.error('❌ Timer update failed:', error);
    }
  }

  /**
   * Sync client timer with server immediately
   */
  async syncWithServer(gameId: string): Promise<LiveGameState | null> {
    try {
      console.log('🔄 Syncing with server timer...');
      const gameState = await liveMovesService.getGameState(gameId);

      if (gameState) {
        console.log('✅ Synced timer state:', {
          white: `${Math.floor(gameState.white_time_ms / 60000)}:${Math.floor(
            (gameState.white_time_ms % 60000) / 1000
          )
            .toString()
            .padStart(2, '0')}`,
          black: `${Math.floor(gameState.black_time_ms / 60000)}:${Math.floor(
            (gameState.black_time_ms % 60000) / 1000
          )
            .toString()
            .padStart(2, '0')}`,
          turn: gameState.current_turn,
          ended: gameState.game_ended,
        });
      }

      return gameState;
    } catch (error) {
      console.error('❌ Failed to sync with server:', error);
      return null;
    }
  }

  /**
   * Clean up all timers (call this on app unmount)
   */
  cleanup(): void {
    console.log('🧹 Cleaning up all server timers...');
    this.activeTimers.forEach((timer, gameId) => {
      this.stopServerTimer(gameId);
    });
  }
}

export const timerSyncService = new TimerSyncService();
