// src/services/blindMovesService.ts - FIXED: Aligned with actual database schema
import { supabase } from '../lib/supabase';
import { getCurrentPlayerId } from './authHelpers';
import type { BlindSequence } from '../types/BlindTypes';

export interface BlindMove {
  id: string;
  game_id: string;
  player_id: string;
  player_color: 'white' | 'black';
  move_number: number;
  move_from: string;
  move_to: string;
  move_san: string;
  is_submitted: boolean;
  created_at: string;
  phase_completed_at?: string;
}

export interface BlindGameState {
  gameId: string;
  whitePlayerId: string;
  blackPlayerId: string;
  whiteMoves: BlindSequence;
  blackMoves: BlindSequence;
  whiteMoveCount: number;
  blackMoveCount: number;
  whiteSubmitted: boolean;
  blackSubmitted: boolean;
  bothSubmitted: boolean;
}

class BlindMovesService {
  /**
   * Initialize blind phase - simplified with database automation
   */
  async initializeBlindGame(roomId: string): Promise<BlindGameState | null> {
    try {
      console.log('🎯 Initializing blind game for room:', roomId);

      // Get players from room with their ACTUAL assigned colors
      const { data: players, error: playersError } = await supabase
        .from('game_room_players')
        .select('player_id, player_username, color')
        .eq('room_id', roomId);

      if (playersError || !players || players.length !== 2) {
        console.error('❌ Error getting players for blind game:', playersError);
        return null;
      }

      // Use actual assigned colors from database (randomized)
      const whitePlayer = players.find(p => p.color === 'white');
      const blackPlayer = players.find(p => p.color === 'black');

      if (!whitePlayer || !blackPlayer) {
        console.error('❌ Could not find players with white/black colors');
        return null;
      }

      console.log('🎨 Color assignment from database:', {
        white: whitePlayer.player_username,
        black: blackPlayer.player_username,
      });

      // Update room status to blind phase if not already
      const { error: roomUpdateError } = await supabase
        .from('game_rooms')
        .update({
          status: 'blind',
          updated_at: new Date().toISOString(),
        })
        .eq('id', roomId);

      if (roomUpdateError) {
        console.error('❌ Error updating room status:', roomUpdateError);
      }

      // Return initial state
      return {
        gameId: roomId,
        whitePlayerId: whitePlayer.player_id,
        blackPlayerId: blackPlayer.player_id,
        whiteMoves: [],
        blackMoves: [],
        whiteMoveCount: 0,
        blackMoveCount: 0,
        whiteSubmitted: false,
        blackSubmitted: false,
        bothSubmitted: false,
      };
    } catch (error) {
      console.error('💥 Failed to initialize blind game:', error);
      return null;
    }
  }

  /**
   * Save a blind move with proper error handling
   */
  async saveBlindMove(
    gameId: string,
    playerColor: 'white' | 'black',
    moveNumber: number,
    from: string,
    to: string,
    san: string
  ): Promise<boolean> {
    try {
      const playerId = await getCurrentPlayerId();

      if (!playerId) {
        console.error('❌ Not authenticated for saveBlindMove');
        return false;
      }

      console.log('💾 Saving blind move:', {
        gameId,
        playerColor,
        moveNumber,
        san,
      });

      const { error } = await supabase.from('game_blind_moves').insert({
        game_id: gameId,
        player_id: playerId,
        player_color: playerColor,
        move_number: moveNumber,
        move_from: from,
        move_to: to,
        move_san: san,
        // Remove is_valid field completely
        is_submitted: false,
      });

      if (error) {
        console.error('❌ Error saving blind move:', error);
        return false;
      }

      console.log('✅ Blind move saved successfully');
      return true;
    } catch (error) {
      console.error('💥 Failed to save blind move:', error);
      return false;
    }
  }

  /**
   * Delete a blind move (for undo functionality)
   */
  async deleteBlindMove(
    gameId: string,
    playerColor: 'white' | 'black',
    moveNumber: number
  ): Promise<boolean> {
    try {
      const playerId = await getCurrentPlayerId();

      if (!playerId) {
        console.error('❌ Not authenticated for deleteBlindMove');
        return false;
      }

      console.log('🗑️ Deleting blind move:', {
        gameId,
        playerColor,
        moveNumber,
      });

      const { error } = await supabase
        .from('game_blind_moves')
        .delete()
        .eq('game_id', gameId)
        .eq('player_id', playerId)
        .eq('player_color', playerColor)
        .eq('move_number', moveNumber);

      if (error) {
        console.error('❌ Error deleting blind move:', error);
        return false;
      }

      console.log('✅ Blind move deleted successfully');
      return true;
    } catch (error) {
      console.error('💥 Failed to delete blind move:', error);
      return false;
    }
  }

  // Updated submitBlindMoves function for your backend architecture
  // In your blindMovesService.ts, replace the submitBlindMoves function:
  async submitBlindMoves(
    gameId: string,
    playerColor: 'white' | 'black'
  ): Promise<boolean> {
    try {
      const playerId = await getCurrentPlayerId();

      if (!playerId) {
        console.error('❌ Not authenticated for submitBlindMoves');
        return false;
      }

      // Submit moves (your existing logic)
      const { error: updateError } = await supabase
        .from('game_blind_moves')
        .update({
          is_submitted: true,
          phase_completed_at: new Date().toISOString(),
        })
        .eq('game_id', gameId)
        .eq('player_id', playerId)
        .eq('player_color', playerColor)
        .eq('is_submitted', false);

      if (updateError) {
        console.error('❌ Error submitting blind moves:', updateError);
        return false;
      }

      // Check if game should transition
      const { data: result, error: checkError } = await supabase.rpc(
        'check_game_completion',
        { p_game_id: gameId }
      );

      if (checkError) {
        console.error('❌ Error checking game completion:', checkError);
      } else {
        console.log('🎯 Game completion check:', result);
      }

      console.log('✅ Moves submitted successfully');
      return true;
    } catch (error) {
      console.error('💥 Failed to submit blind moves:', error);
      return false;
    }
  }

  /**
   * Get blind game state with accurate data
   */
  async getBlindGameState(gameId: string): Promise<BlindGameState | null> {
    try {
      console.log('🔍 Getting blind game state for:', gameId);

      // Get all blind moves for this game
      const { data: moves, error: movesError } = await supabase
        .from('game_blind_moves')
        .select('*')
        .eq('game_id', gameId)
        .order('move_number');

      if (movesError) {
        console.error('❌ Error getting blind moves:', movesError);
        return null;
      }

      // Get players with their ACTUAL assigned colors from database
      const { data: players, error: playersError } = await supabase
        .from('game_room_players')
        .select('player_id, color')
        .eq('room_id', gameId);

      if (playersError || !players || players.length !== 2) {
        console.error('❌ Error getting players for game state:', playersError);
        return null;
      }

      // Use actual assigned colors from database (randomized)
      const whitePlayer = players.find(p => p.color === 'white');
      const blackPlayer = players.find(p => p.color === 'black');

      if (!whitePlayer || !blackPlayer) {
        console.error('❌ Could not find players with white/black colors');
        return null;
      }

      const whitePlayerId = whitePlayer.player_id;
      const blackPlayerId = blackPlayer.player_id;

      // Process moves by color
      const whiteMoves: BlindSequence = [];
      const blackMoves: BlindSequence = [];
      let whiteSubmitted = false;
      let blackSubmitted = false;

      if (moves && moves.length > 0) {
        // Group moves by player
        const whitePlayerMoves = moves.filter(
          (m) => m.player_id === whitePlayerId
        );
        const blackPlayerMoves = moves.filter(
          (m) => m.player_id === blackPlayerId
        );

        // Build white moves sequence
        whiteMoves.push(
          ...whitePlayerMoves
            .sort((a, b) => a.move_number - b.move_number)
            .map((move) => ({
              from: move.move_from,
              to: move.move_to,
              san: move.move_san,
            }))
        );

        // Build black moves sequence
        blackMoves.push(
          ...blackPlayerMoves
            .sort((a, b) => a.move_number - b.move_number)
            .map((move) => ({
              from: move.move_from,
              to: move.move_to,
              san: move.move_san,
            }))
        );

        // Check submission status
        whiteSubmitted =
          whitePlayerMoves.length > 0 &&
          whitePlayerMoves.every((move) => move.is_submitted);
        blackSubmitted =
          blackPlayerMoves.length > 0 &&
          blackPlayerMoves.every((move) => move.is_submitted);
      }

      const gameState = {
        gameId,
        whitePlayerId,
        blackPlayerId,
        whiteMoves,
        blackMoves,
        whiteMoveCount: whiteMoves.length,
        blackMoveCount: blackMoves.length,
        whiteSubmitted,
        blackSubmitted,
        bothSubmitted: whiteSubmitted && blackSubmitted,
      };

      console.log('📊 Blind game state:', {
        whiteMoves: gameState.whiteMoveCount,
        blackMoves: gameState.blackMoveCount,
        whiteSubmitted,
        blackSubmitted,
        bothSubmitted: gameState.bothSubmitted,
      });

      return gameState;
    } catch (error) {
      console.error('💥 Failed to get blind game state:', error);
      return null;
    }
  }

  /**
   * Get player color with deterministic assignment
   */
  async getPlayerColor(gameId: string): Promise<'white' | 'black' | null> {
    try {
      const playerId = await getCurrentPlayerId();

      if (!playerId) {
        console.error('❌ Not authenticated for getPlayerColor');
        return null;
      }

      console.log(
        '🎨 Getting player color for user:',
        playerId,
        'in game:',
        gameId
      );

      // Check existing moves first (for consistency)
      const { data: existingMoves } = await supabase
        .from('game_blind_moves')
        .select('player_color')
        .eq('game_id', gameId)
        .eq('player_id', playerId)
        .limit(1);

      if (existingMoves && existingMoves.length > 0) {
        console.log('✅ Found existing color:', existingMoves[0].player_color);
        return existingMoves[0].player_color;
      }

      // Determine from room players - use ACTUAL assigned color from database
      const { data: myPlayer, error: playersError } = await supabase
        .from('game_room_players')
        .select('color')
        .eq('room_id', gameId)
        .eq('player_id', playerId)
        .single();

      if (playersError || !myPlayer) {
        console.error(
          '❌ Error getting player color from room:',
          playersError
        );
        return null;
      }

      // Return the actual assigned color from database (randomized or bot-assigned)
      console.log('✅ Player color from database:', myPlayer.color);
      return myPlayer.color as 'white' | 'black';
    } catch (error) {
      console.error('💥 Failed to get player color:', error);
      return null;
    }
  }

  /**
   * Subscribe to blind moves updates with optimized queries
   */
  subscribeToBlindMoves(
    gameId: string,
    callback: (gameState: BlindGameState) => void
  ): () => void {
    console.log('📡 Setting up blind moves subscription for:', gameId);

    const subscription = supabase
      .channel(`blind-moves-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_blind_moves',
          filter: `game_id=eq.${gameId}`,
        },
        async (payload) => {
          console.log('🔄 Blind moves changed:', payload.eventType);

          // Refresh game state and notify
          const gameState = await this.getBlindGameState(gameId);
          if (gameState) {
            callback(gameState);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${gameId}`,
        },
        async (payload) => {
          console.log('🔄 Room status changed:', payload.new.status);

          // If room transitioned to revealing, get final state
          if (payload.new.status === 'revealing') {
            const gameState = await this.getBlindGameState(gameId);
            if (gameState) {
              callback(gameState);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Blind moves subscription status:', status);
      });

    // Return cleanup function
    return () => {
      console.log('❌ Cleaning up blind moves subscription');
      supabase.removeChannel(subscription);
    };
  }

  /**
   * Clear all blind moves (reset functionality)
   */
  async clearBlindMoves(
    gameId: string,
    playerColor: 'white' | 'black'
  ): Promise<boolean> {
    try {
      const playerId = await getCurrentPlayerId();

      if (!playerId) {
        console.error('❌ Not authenticated for clearBlindMoves');
        return false;
      }

      console.log('🧹 Clearing all blind moves for:', playerColor);

      const { error } = await supabase
        .from('game_blind_moves')
        .delete()
        .eq('game_id', gameId)
        .eq('player_id', playerId)
        .eq('player_color', playerColor);

      if (error) {
        console.error('❌ Error clearing blind moves:', error);
        return false;
      }

      console.log('✅ All blind moves cleared successfully');
      return true;
    } catch (error) {
      console.error('💥 Failed to clear blind moves:', error);
      return false;
    }
  }

  /**
   * Check if both players have submitted (for UI states)
   */
  async checkBothSubmitted(gameId: string): Promise<boolean> {
    try {
      const gameState = await this.getBlindGameState(gameId);
      return gameState ? gameState.bothSubmitted : false;
    } catch (error) {
      console.error('💥 Failed to check submission status:', error);
      return false;
    }
  }

  /**
   * Get blind moves in MoveLog format for display WITH validation (isInvalid flags)
   */
  async getBlindMovesForMoveLog(gameId: string): Promise<Array<{
    player: 'P1' | 'P2';
    san: string;
    isInvalid: boolean;
    from?: string;
    to?: string;
    moveNumber?: number;
  }>> {
    try {
      console.log('📝 Getting blind moves for move log:', gameId);

      // Get all blind moves from database
      const { data: moves, error: movesError } = await supabase
        .from('game_blind_moves')
        .select('*')
        .eq('game_id', gameId)
        .order('move_number');

      if (movesError) {
        console.error('❌ Error getting blind moves for move log:', movesError);
        return [];
      }

      if (!moves || moves.length === 0) {
        console.log('📝 No blind moves found for move log');
        return [];
      }

      // Get room entry fee for simulation
      const { data: room } = await supabase
        .from('game_rooms')
        .select('entry_fee, game_mode')
        .eq('id', gameId)
        .single();

      const entryFee = room?.entry_fee || 100;

      // Separate white and black moves
      const whiteMoves = moves
        .filter(m => m.player_color === 'white' && m.move_number > 0)
        .sort((a, b) => a.move_number - b.move_number)
        .map(m => ({ from: m.move_from, to: m.move_to, san: m.move_san }));

      const blackMoves = moves
        .filter(m => m.player_color === 'black' && m.move_number > 0)
        .sort((a, b) => a.move_number - b.move_number)
        .map(m => ({ from: m.move_from, to: m.move_to, san: m.move_san }));

      console.log('🎮 Simulating blind moves to get validation data:', {
        whiteMoves: whiteMoves.length,
        blackMoves: blackMoves.length,
      });

      // Import and use the simulation function
      const { simulateBlindMovesWithRewards } = await import('../utils/simulateBlindMoves');

      const { log } = simulateBlindMovesWithRewards(
        whiteMoves,
        blackMoves,
        entryFee,
        room?.game_mode
      );

      console.log('✅ Simulation complete, move log with validation:', log.length);

      // Map to expected format with move numbers
      const moveLogItems = log.map((move, index) => ({
        player: move.player as 'P1' | 'P2',
        san: move.san,
        isInvalid: move.isInvalid || false,
        from: move.from,
        to: move.to,
        moveNumber: Math.ceil((index + 1) / 2),
      }));

      console.log('📝 Returning move log with validation data:', moveLogItems.length);
      return moveLogItems;
    } catch (error) {
      console.error('💥 Failed to get blind moves for move log:', error);
      return [];
    }
  }

  /**
   * Resign from blind phase
   */
  async resignFromBlindPhase(gameId: string): Promise<boolean> {
    try {
      console.log('🏳️ Resigning from blind phase:', gameId);

      const playerId = await getCurrentPlayerId();

      if (!playerId) {
        console.error('❌ Not authenticated');
        return false;
      }

      // Call the SQL function to resign
      const { data, error } = await supabase.rpc('resign_from_blind_phase', {
        p_game_id: gameId,
        p_resigning_player_id: playerId,
      });

      if (error) {
        console.error('❌ Error resigning from blind phase:', error);
        return false;
      }

      if (data && data.success === false) {
        console.error('❌ Resignation failed:', data.error);
        return false;
      }

      console.log('✅ Successfully resigned from blind phase');
      return true;
    } catch (error) {
      console.error('❌ Failed to resign from blind phase:', error);
      return false;
    }
  }
}

export const blindMovesService = new BlindMovesService();
