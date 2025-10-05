// services/cleanBlindMovesService.ts - Simplified and Clean
import { supabase } from '../lib/supabase';
import { Chess } from 'chess.js';
import type { BlindSequence, MoveLogItem } from '../types/BlindTypes';
import { withErrorHandling, handleServiceError } from '../utils/errorHandling';

export interface BlindGameState {
  gameId: string;
  whitePlayerId: string;
  blackPlayerId: string;
  whiteMoves: BlindSequence;
  blackMoves: BlindSequence;
  whiteSubmitted: boolean;
  blackSubmitted: boolean;
  bothSubmitted: boolean;
  maxMoves: number;
  blindPhaseStartedAt?: string; // ISO timestamp when blind phase started
}

export interface BlindPhaseResults {
  whitePlayerId: string;
  blackPlayerId: string;
  whiteTotalGold: number;
  blackTotalGold: number;
  remainingPot: number;
  finalFen: string;
  moveLog: MoveLogItem[];
}

class CleanBlindMovesService {
  private readonly MAX_MOVES = 5;

  /**
   * Initialize blind game - very simple
   */
  async initializeBlindGame(roomId: string): Promise<BlindGameState | null> {
    try {
      // Get players (first joiner = white, second = black)
      const { data: players, error } = await supabase
        .from('game_room_players')
        .select('player_id, created_at')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error || !players || players.length !== 2) {
        console.error('Failed to get players:', error);
        return null;
      }

      // Update room to blind phase and record start time
      const blindPhaseStartTime = new Date().toISOString();
      await supabase
        .from('game_rooms')
        .update({
          status: 'blind',
          blind_phase_started_at: blindPhaseStartTime
        })
        .eq('id', roomId);

      return {
        gameId: roomId,
        whitePlayerId: players[0].player_id,
        blackPlayerId: players[1].player_id,
        whiteMoves: [],
        blackMoves: [],
        whiteSubmitted: false,
        blackSubmitted: false,
        bothSubmitted: false,
        maxMoves: this.MAX_MOVES,
        blindPhaseStartedAt: blindPhaseStartTime,
      };
    } catch (error) {
      handleServiceError(error, 'initializeBlindGame');
      return null;
    }
  }

  /**
   * Add a blind move - simple validation
   */
  async addBlindMove(
    gameId: string,
    playerColor: 'white' | 'black',
    move: { from: string; to: string; san: string }
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      // Get current move count
      const { data: existingMoves } = await supabase
        .from('game_blind_moves')
        .select('move_number')
        .eq('game_id', gameId)
        .eq('player_id', user.id)
        .order('move_number', { ascending: false })
        .limit(1);

      const nextMoveNumber =
        existingMoves && existingMoves.length > 0
          ? existingMoves[0].move_number + 1
          : 1;

      // Check move limit
      if (nextMoveNumber > this.MAX_MOVES) {
        console.error('Maximum moves exceeded');
        return false;
      }

      // Insert move
      const { error } = await supabase.from('game_blind_moves').insert({
        game_id: gameId,
        player_id: user.id,
        player_color: playerColor,
        move_number: nextMoveNumber,
        move_from: move.from,
        move_to: move.to,
        move_san: move.san,
        is_submitted: false,
      });

      if (error) {
        console.error('Failed to add blind move:', error);
        return false;
      }

      return true;
    } catch (error) {
      handleServiceError(error, 'addBlindMove');
      return false;
    }
  }

  /**
   * Remove last blind move
   */
  async removeLastMove(
    gameId: string,
    playerColor: 'white' | 'black'
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      // Get last move
      const { data: lastMove } = await supabase
        .from('game_blind_moves')
        .select('id, move_number')
        .eq('game_id', gameId)
        .eq('player_id', user.id)
        .eq('is_submitted', false)
        .order('move_number', { ascending: false })
        .limit(1);

      if (!lastMove || lastMove.length === 0) return false;

      // Delete it
      const { error } = await supabase
        .from('game_blind_moves')
        .delete()
        .eq('id', lastMove[0].id);

      return !error;
    } catch (error) {
      console.error('Error removing last move:', error);
      return false;
    }
  }

  /**
   * Submit all moves for player
   */
  async submitMoves(
    gameId: string,
    playerColor: 'white' | 'black'
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      // First, check what moves exist
      const { data: existingMoves } = await supabase
        .from('game_blind_moves')
        .select('*')
        .eq('game_id', gameId)
        .eq('player_id', user.id);

      console.log('Existing moves before submit:', existingMoves);

      // Mark all moves as submitted
      const { error } = await supabase
        .from('game_blind_moves')
        .update({
          is_submitted: true,
          phase_completed_at: new Date().toISOString(),
        })
        .eq('game_id', gameId)
        .eq('player_id', user.id)
        .eq('is_submitted', false);

      if (error) {
        console.error('Failed to submit moves:', error);
        return false;
      }

      console.log('✅ Moves submitted successfully. Trigger will handle phase completion.');
      return true;
    } catch (error) {
      console.error('Error submitting moves:', error);
      return false;
    }
  }

  /**
   * Get current blind game state
   */
  async getBlindGameState(gameId: string): Promise<BlindGameState | null> {
    try {
      // Get room info including blind phase start time
      const { data: room } = await supabase
        .from('game_rooms')
        .select('blind_phase_started_at')
        .eq('id', gameId)
        .single();

      // Get players
      const { data: players } = await supabase
        .from('game_room_players')
        .select('player_id, created_at')
        .eq('room_id', gameId)
        .order('created_at', { ascending: true });

      if (!players || players.length !== 2) return null;

      const whitePlayerId = players[0].player_id;
      const blackPlayerId = players[1].player_id;

      // Get all moves
      const { data: moves } = await supabase
        .from('game_blind_moves')
        .select('*')
        .eq('game_id', gameId)
        .order('move_number');

      // Process moves
      const whiteMoves: BlindSequence = [];
      const blackMoves: BlindSequence = [];
      let whiteSubmitted = false;
      let blackSubmitted = false;

      if (moves) {
        const whitePlayerMoves = moves.filter(
          (m) => m.player_id === whitePlayerId
        );
        const blackPlayerMoves = moves.filter(
          (m) => m.player_id === blackPlayerId
        );

        // Build move sequences
        whiteMoves.push(
          ...whitePlayerMoves.map((m) => ({
            from: m.move_from,
            to: m.move_to,
            san: m.move_san,
          }))
        );

        blackMoves.push(
          ...blackPlayerMoves.map((m) => ({
            from: m.move_from,
            to: m.move_to,
            san: m.move_san,
          }))
        );

        // Check submission status
        whiteSubmitted =
          whitePlayerMoves.length > 0 &&
          whitePlayerMoves.every((m) => m.is_submitted);
        blackSubmitted =
          blackPlayerMoves.length > 0 &&
          blackPlayerMoves.every((m) => m.is_submitted);
      }

      return {
        gameId,
        whitePlayerId,
        blackPlayerId,
        whiteMoves,
        blackMoves,
        whiteSubmitted,
        blackSubmitted,
        bothSubmitted: whiteSubmitted && blackSubmitted,
        maxMoves: this.MAX_MOVES,
        blindPhaseStartedAt: room?.blind_phase_started_at || undefined,
      };
    } catch (error) {
      console.error('Failed to get blind game state:', error);
      return null;
    }
  }

  /**
   * Simulate blind phase and calculate rewards (CLIENT-SIDE)
   */
  simulateBlindPhase(
    whiteMoves: BlindSequence,
    blackMoves: BlindSequence,
    entryFee: number
  ): BlindPhaseResults {
    const game = new Chess();
    const moveLog: MoveLogItem[] = [];

    // Reward calculations
    const validReward = Math.floor(entryFee * 0.05); // 5 gold for 100 entry
    const invalidPenalty = Math.floor(entryFee * 0.05); // 5 gold penalty
    const captureBonus = Math.floor(entryFee * 0.15); // 15 gold for capture
    const opponentBonus = Math.floor(entryFee * 0.1); // 10 gold when opponent makes invalid move

    let whiteGold = 0;
    let blackGold = 0;
    let whiteIndex = 0;
    let blackIndex = 0;

    // Process moves in chess turn order
    while (whiteIndex < whiteMoves.length || blackIndex < blackMoves.length) {
      const isWhiteTurn = game.turn() === 'w';

      if (isWhiteTurn && whiteIndex < whiteMoves.length) {
        const move = whiteMoves[whiteIndex];
        const { reward, isValid, isCapture } = this.processMove(
          game,
          move,
          'P1'
        );

        if (isValid) {
          whiteGold += isCapture ? captureBonus : validReward;
        } else {
          whiteGold -= invalidPenalty;
          blackGold += opponentBonus; // Opponent gets bonus
        }

        moveLog.push({
          player: 'P1',
          san: move.san,
          isInvalid: !isValid,
          from: move.from,
          to: move.to,
        });

        whiteIndex++;
      } else if (!isWhiteTurn && blackIndex < blackMoves.length) {
        const move = blackMoves[blackIndex];
        const { reward, isValid, isCapture } = this.processMove(
          game,
          move,
          'P2'
        );

        if (isValid) {
          blackGold += isCapture ? captureBonus : validReward;
        } else {
          blackGold -= invalidPenalty;
          whiteGold += opponentBonus; // Opponent gets bonus
        }

        moveLog.push({
          player: 'P2',
          san: move.san,
          isInvalid: !isValid,
          from: move.from,
          to: move.to,
        });

        blackIndex++;
      } else {
        // Skip turn if no moves available
        this.forceTurnChange(game);
      }
    }

    // Handle negative balances
    if (whiteGold < 0) {
      blackGold += Math.abs(whiteGold);
      whiteGold = 0;
    }
    if (blackGold < 0) {
      whiteGold += Math.abs(blackGold);
      blackGold = 0;
    }

    // Calculate remaining pot
    const totalPot = entryFee * 2;
    const commission = Math.floor(totalPot * 0.05);
    const availablePot = totalPot - commission;
    const remainingPot = Math.max(0, availablePot - whiteGold - blackGold);

    return {
      whitePlayerId: '', // Will be filled by caller
      blackPlayerId: '', // Will be filled by caller
      whiteTotalGold: whiteGold,
      blackTotalGold: blackGold,
      remainingPot,
      finalFen: game.fen(),
      moveLog,
    };
  }

  /**
   * Process a single move and return reward info
   */
  private processMove(
    game: Chess,
    move: { from: string; to: string; san: string },
    player: 'P1' | 'P2'
  ): { reward: number; isValid: boolean; isCapture: boolean } {
    try {
      const beforePieces = game
        .board()
        .flat()
        .filter((p) => p !== null).length;

      const chessMove = game.move({
        from: move.from,
        to: move.to,
        promotion: 'q',
      });

      if (chessMove) {
        const afterPieces = game
          .board()
          .flat()
          .filter((p) => p !== null).length;
        const isCapture = beforePieces > afterPieces;

        return { reward: 0, isValid: true, isCapture };
      }
    } catch (error) {
      // Move failed
    }

    return { reward: 0, isValid: false, isCapture: false };
  }

  /**
   * Force turn change when no moves available
   */
  private forceTurnChange(game: Chess): void {
    try {
      const currentFen = game.fen();
      const fenParts = currentFen.split(' ');
      fenParts[1] = fenParts[1] === 'w' ? 'b' : 'w';
      game.load(fenParts.join(' '));
    } catch (e) {
      console.warn('Failed to force turn change');
    }
  }

  /**
   * Get player color
   */
  async getPlayerColor(gameId: string): Promise<'white' | 'black' | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: players } = await supabase
        .from('game_room_players')
        .select('player_id, created_at')
        .eq('room_id', gameId)
        .order('created_at', { ascending: true });

      if (!players || players.length !== 2) return null;

      return user.id === players[0].player_id ? 'white' : 'black';
    } catch (error) {
      console.error('Failed to get player color:', error);
      return null;
    }
  }

  /**
   * Subscribe to blind moves updates
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
          const gameState = await this.getBlindGameState(gameId);
          if (gameState) callback(gameState);
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
          if (payload.new.status === 'revealing') {
            const gameState = await this.getBlindGameState(gameId);
            if (gameState) callback(gameState);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }
}

export const cleanBlindMovesService = new CleanBlindMovesService();
