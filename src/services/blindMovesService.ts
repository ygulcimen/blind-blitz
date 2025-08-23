// src/services/blindMovesService.ts - FIXED TYPESCRIPT ISSUES
import { supabase } from '../lib/supabase';
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
   * Initialize blind phase for a game
   */
  async initializeBlindGame(roomId: string): Promise<BlindGameState | null> {
    try {
      // Get players from the room
      const { data: players, error: playersError } = await supabase
        .from('game_room_players')
        .select('player_id, player_username')
        .eq('room_id', roomId);

      if (playersError || !players || players.length !== 2) {
        console.error('Error getting players:', playersError);
        return null;
      }

      // Randomly assign colors
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      const whitePlayer = shuffled[0];
      const blackPlayer = shuffled[1];

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
      console.error('Failed to initialize blind game:', error);
      return null;
    }
  }

  /**
   * Save a single blind move to database
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
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      // Upsert the move (insert or update if exists)
      const { error } = await supabase.from('game_blind_moves').upsert(
        {
          game_id: gameId,
          player_id: user.id,
          player_color: playerColor,
          move_number: moveNumber,
          move_from: from,
          move_to: to,
          move_san: san,
          is_submitted: false,
        },
        {
          onConflict: 'game_id,player_id,move_number',
        }
      );

      if (error) {
        console.error('Error saving blind move:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to save blind move:', error);
      return false;
    }
  }

  /**
   * Delete a blind move (for undo)
   */
  async deleteBlindMove(
    gameId: string,
    playerColor: 'white' | 'black',
    moveNumber: number
  ): Promise<boolean> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('game_blind_moves')
        .delete()
        .eq('game_id', gameId)
        .eq('player_id', user.id)
        .eq('player_color', playerColor)
        .eq('move_number', moveNumber);

      if (error) {
        console.error('Error deleting blind move:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete blind move:', error);
      return false;
    }
  }

  /**
   * Submit all blind moves (mark as submitted)
   */
  async submitBlindMoves(
    gameId: string,
    playerColor: 'white' | 'black'
  ): Promise<boolean> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      // Mark all moves as submitted
      const { error } = await supabase
        .from('game_blind_moves')
        .update({ is_submitted: true })
        .eq('game_id', gameId)
        .eq('player_id', user.id)
        .eq('player_color', playerColor);

      if (error) {
        console.error('Error submitting blind moves:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to submit blind moves:', error);
      return false;
    }
  }

  /**
   * Get current blind game state - FIXED TYPESCRIPT ISSUES
   */
  /**
   * Get current blind game state - FIXED TYPESCRIPT ISSUES
   */
  async getBlindGameState(gameId: string): Promise<BlindGameState | null> {
    try {
      // Get all blind moves for this game
      const { data: moves, error: movesError } = await supabase
        .from('game_blind_moves')
        .select('*')
        .eq('game_id', gameId)
        .order('move_number');

      if (movesError) {
        console.error('Error getting blind moves:', movesError);
        return null;
      }

      // Get players from the room
      const { data: players, error: playersError } = await supabase
        .from('game_room_players')
        .select('player_id')
        .eq('room_id', gameId);

      if (playersError || !players || players.length !== 2) {
        console.error('Error getting players:', playersError);
        return null;
      }

      // Separate moves by color
      const whiteMoves: BlindSequence = [];
      const blackMoves: BlindSequence = [];
      let whitePlayerId = '';
      let blackPlayerId = '';
      let whiteSubmitted = false;
      let blackSubmitted = false;

      if (moves) {
        // ✅ FIX: Properly type the accumulator and moves with explicit typing
        const movesByPlayer = moves.reduce(
          (acc: Record<string, BlindMove[]>, move: BlindMove) => {
            if (!acc[move.player_id]) {
              acc[move.player_id] = [];
            }
            acc[move.player_id].push(move);
            return acc;
          },
          {} as Record<string, BlindMove[]>
        );

        // ✅ FIX: Process each player's moves with type assertion
        Object.entries(movesByPlayer).forEach(([playerId, playerMoves]) => {
          const typedPlayerMoves = playerMoves as BlindMove[];

          if (typedPlayerMoves.length === 0) return;

          const playerColor = typedPlayerMoves[0].player_color;

          // ✅ FIX: Explicitly type the sort parameters
          const sortedMoves = typedPlayerMoves.sort(
            (a: BlindMove, b: BlindMove) => a.move_number - b.move_number
          );

          // ✅ FIX: Explicitly type the map parameter
          const sequence = sortedMoves.map((move: BlindMove) => ({
            from: move.move_from,
            to: move.move_to,
            san: move.move_san,
          }));

          if (playerColor === 'white') {
            whitePlayerId = playerId;
            whiteMoves.push(...sequence);
            whiteSubmitted = typedPlayerMoves.every(
              (move: BlindMove) => move.is_submitted
            );
          } else {
            blackPlayerId = playerId;
            blackMoves.push(...sequence);
            blackSubmitted = typedPlayerMoves.every(
              (move: BlindMove) => move.is_submitted
            );
          }
        });

        // If we don't have color assignments yet, assign them
        if (!whitePlayerId && !blackPlayerId) {
          const shuffled = [...players].sort(() => Math.random() - 0.5);
          whitePlayerId = shuffled[0].player_id;
          blackPlayerId = shuffled[1].player_id;
        }
      }

      return {
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
    } catch (error) {
      console.error('Failed to get blind game state:', error);
      return null;
    }
  }

  /**
   * Check if current user is white or black
   */
  async getPlayerColor(gameId: string): Promise<'white' | 'black' | null> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Not authenticated for getPlayerColor');
        return null;
      }

      console.log(
        '🔍 Getting player color for user:',
        user.id,
        'in game:',
        gameId
      );

      // First, check if we already have moves for this player
      const { data: moves, error } = await supabase
        .from('game_blind_moves')
        .select('player_color')
        .eq('game_id', gameId)
        .eq('player_id', user.id)
        .limit(1);

      if (error) {
        console.error('❌ Error getting player color from moves:', error);
      } else if (moves && moves.length > 0) {
        console.log(
          '✅ Found existing color from moves:',
          moves[0].player_color
        );
        return moves[0].player_color;
      }

      // If no moves yet, get players and assign colors deterministically
      const { data: players, error: playersError } = await supabase
        .from('game_room_players')
        .select('player_id, created_at')
        .eq('room_id', gameId)
        .order('created_at', { ascending: true }); // ✅ Consistent ordering by join time

      if (playersError || !players || players.length !== 2) {
        console.error(
          '❌ Error getting players for color assignment:',
          playersError
        );
        return null;
      }

      console.log('👥 Room players (ordered by join time):', players);

      // ✅ Deterministic color assignment: first to join = white, second = black
      const player1 = players[0];
      const player2 = players[1];

      let assignedColor: 'white' | 'black';

      if (user.id === player1.player_id) {
        assignedColor = 'white'; // First player = white
      } else if (user.id === player2.player_id) {
        assignedColor = 'black'; // Second player = black
      } else {
        console.error('❌ User not found in room players!');
        return null;
      }

      console.log('🎨 Assigned color:', assignedColor, 'to user:', user.id);
      console.log(
        '📋 Assignment logic: player1 (white):',
        player1.player_id,
        'player2 (black):',
        player2.player_id
      );

      return assignedColor;
    } catch (error) {
      console.error('❌ Failed to get player color:', error);
      return null;
    }
  }

  /**
   * Subscribe to real-time blind moves updates - FIXED RETURN TYPE
   */
  subscribeToBlindMoves(
    gameId: string,
    callback: (gameState: BlindGameState) => void
  ): () => void {
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
        async () => {
          console.log('🔄 Blind moves changed - refreshing...');
          const gameState = await this.getBlindGameState(gameId);
          if (gameState) {
            callback(gameState);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Blind moves subscription status:', status);
      });

    // ✅ Return a proper cleanup function
    return () => {
      supabase.removeChannel(subscription);
    };
  }

  /**
   * Clear all blind moves for a game (reset)
   */
  async clearBlindMoves(
    gameId: string,
    playerColor: 'white' | 'black'
  ): Promise<boolean> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('game_blind_moves')
        .delete()
        .eq('game_id', gameId)
        .eq('player_id', user.id)
        .eq('player_color', playerColor);

      if (error) {
        console.error('Error clearing blind moves:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to clear blind moves:', error);
      return false;
    }
  }
}

export const blindMovesService = new BlindMovesService();
