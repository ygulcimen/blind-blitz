// src/services/liveMovesService.ts - REAL-TIME MULTIPLAYER CHESS
import { supabase } from '../lib/supabase';
import { Chess } from 'chess.js';
import type { GameResult } from '../types/GameTypes';

export interface LiveMove {
  id: string;
  created_at: string;
  game_id: string;
  move_number: number;
  player_color: 'white' | 'black';
  player_id: string;
  move_from: string;
  move_to: string;
  move_san: string;
  move_fen: string;
  is_check: boolean;
  is_checkmate: boolean;
  is_draw: boolean;
  time_taken_ms: number;
  time_remaining_ms: number;
}

export interface LiveGameState {
  id: string;
  game_id: string;
  white_player_id: string;
  black_player_id: string;
  current_turn: 'white' | 'black';
  move_count: number;
  current_fen: string;
  game_ended: boolean;
  game_result: GameResult | null;
  white_time_ms: number;
  black_time_ms: number;
  last_move_time: string;
  time_control_minutes: number;
  time_increment_seconds: number;
  updated_at: string;
}

export interface DrawOffer {
  id: string;
  game_id: string;
  offering_player: 'white' | 'black';
  is_active: boolean;
  responded_at: string | null;
  accepted: boolean | null;
  created_at: string;
}

class LiveMovesService {
  /**
   * Initialize live game after blind phase ends
   */
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();
  private readonly HEARTBEAT_INTERVAL = 120000; // 2 minutes instead of 30 seconds
  private readonly ABANDONMENT_THRESHOLD = 300000; // 5 minutes instead of 90 seconds
  startHeartbeatMonitoring(gameId: string): void {
    this.stopHeartbeatMonitoring(gameId);

    const interval = setInterval(async () => {
      await this.sendHeartbeat(gameId);
      await this.checkForAbandonment(gameId);
    }, this.HEARTBEAT_INTERVAL);

    this.heartbeatIntervals.set(gameId, interval);
  }

  /**
   * Send heartbeat ping
   */
  private async sendHeartbeat(gameId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Only update player_presence table, not game_live_state
      await supabase.from('player_presence').upsert(
        {
          player_id: user.id,
          game_id: gameId,
          last_ping: new Date().toISOString(),
          is_online: true,
        },
        {
          onConflict: 'player_id,game_id',
        }
      );

      // Remove any console.log here to reduce spam
    } catch (error) {
      // Silent fail to reduce console spam
    }
  }

  /**
   * Check for player abandonment
   */
  private async checkForAbandonment(gameId: string): Promise<void> {
    try {
      const gameState = await this.getGameState(gameId);
      if (!gameState || gameState.game_ended) return;

      const threshold = new Date(Date.now() - this.ABANDONMENT_THRESHOLD);

      const { data: presenceData } = await supabase
        .from('player_presence')
        .select('*')
        .eq('game_id', gameId)
        .gte('last_ping', threshold.toISOString());

      const activePlayers = presenceData || [];
      const playerIds = [gameState.white_player_id, gameState.black_player_id];

      const abandonedPlayer = playerIds.find(
        (playerId) => !activePlayers.some((p) => p.player_id === playerId)
      );

      if (abandonedPlayer) {
        await this.handlePlayerAbandonment(gameId, abandonedPlayer);
        this.stopHeartbeatMonitoring(gameId);
      }
    } catch (error) {
      console.error('Error checking for abandonment:', error);
    }
  }

  /**
   * Stop heartbeat monitoring
   */
  stopHeartbeatMonitoring(gameId: string): void {
    const interval = this.heartbeatIntervals.get(gameId);
    if (interval) {
      clearInterval(interval);
      this.heartbeatIntervals.delete(gameId);
    }
  }

  /**
   * Clean up player presence when leaving game
   */
  async leaveGame(gameId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('player_presence')
        .update({ is_online: false })
        .eq('player_id', user.id)
        .eq('game_id', gameId);

      this.stopHeartbeatMonitoring(gameId);
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  }

  private parseTimeControl(timeControl: string): {
    minutes: number;
    increment: number;
  } {
    const parts = timeControl.split('+');
    const minutes = parseInt(parts[0]) || 3; // Default to 3 minutes
    const increment = parseInt(parts[1]) || 2; // Default to 2 seconds increment

    return { minutes, increment };
  }
  async initializeLiveGame(
    gameId: string,
    whitePlayerId: string,
    blackPlayerId: string,
    startingFen: string
  ): Promise<LiveGameState | null> {
    try {
      // Check if live game state already exists
      const { data: existingState, error: checkError } = await supabase
        .from('game_live_state')
        .select('*')
        .eq('game_id', gameId)
        .single();

      // If state exists, return it regardless of the error type
      if (existingState) {
        console.log(
          '✅ Live game state already exists, returning existing state'
        );
        return existingState;
      }

      // Only proceed to create if we got a "not found" error (PGRST116)
      // Any other error indicates a real problem
      if (checkError && checkError.code !== 'PGRST116') {
        console.error(
          '❌ Unexpected error checking for existing state:',
          checkError
        );
        return null;
      }

      console.log('🔧 No existing live game state found, creating new one...');

      // ✅ Get time control from the room settings
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .select('time_control')
        .eq('id', gameId)
        .single();

      if (roomError) {
        console.warn(
          '⚠️ Could not get room time control, using default:',
          roomError
        );
      }

      const timeControl = roomData?.time_control || '3+2'; // Fallback to 3+2
      const { minutes, increment } = this.parseTimeControl(timeControl);
      const timeMs = minutes * 60 * 1000; // Convert to milliseconds

      console.log('⏰ Using time control from room:', {
        timeControl,
        minutes,
        increment,
        timeMs,
      });

      // Create new live game state
      // Create or update live game state (UPSERT to avoid 409 conflicts)
      const { data: newState, error } = await supabase
        .from('game_live_state')
        .upsert(
          {
            game_id: gameId,
            white_player_id: whitePlayerId,
            black_player_id: blackPlayerId,
            current_fen: startingFen,
            current_turn: 'white', // White always starts live phase
            move_count: 0,
            white_time_ms: timeMs,
            black_time_ms: timeMs,
            time_control_minutes: minutes,
            time_increment_seconds: increment,
            last_move_time: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'game_id' } // ✅ prevents duplicate key error
        )
        .select()
        .single();

      if (error) {
        // If we get a duplicate key error, try to fetch the existing record
        if (
          error.code === '23505' &&
          error.message.includes('game_live_state_game_id_key')
        ) {
          console.log(
            '🔄 Duplicate key error, fetching existing live game state...'
          );
          const { data: existingState } = await supabase
            .from('game_live_state')
            .select('*')
            .eq('game_id', gameId)
            .single();

          if (existingState) {
            console.log(
              '✅ Retrieved existing live game state after duplicate key error'
            );
            return existingState;
          }
        }

        console.error('❌ Error initializing live game:', error);
        return null;
      }

      console.log('✅ Live game initialized successfully');
      return newState;
    } catch (error) {
      console.error('❌ Failed to initialize live game:', error);
      return null;
    }
  }

  /**
   * Make a move in the live game
   */
  async makeMove(
    gameId: string,
    from: string,
    to: string,
    promotion?: string
  ): Promise<{ success: boolean; move?: LiveMove; error?: string }> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Get current game state
      const gameState = await this.getGameState(gameId);
      if (!gameState) {
        return { success: false, error: 'Game not found' };
      }

      if (gameState.game_ended) {
        return { success: false, error: 'Game has ended' };
      }

      // Check if it's the player's turn
      const playerColor =
        gameState.white_player_id === user.id ? 'white' : 'black';
      const chess = new Chess(gameState.current_fen);
      const actualTurn = chess.turn() === 'w' ? 'white' : 'black';

      console.log('🎯 TURN VALIDATION:', {
        playerColor,
        actualTurnFromFen: actualTurn,
        storedTurn: gameState.current_turn,
        canMove: actualTurn === playerColor,
      });

      if (actualTurn !== playerColor) {
        return { success: false, error: 'Not your turn' };
      }

      // Validate the move using chess.js
      const moveResult = chess.move({ from, to, promotion: promotion as any });

      if (!moveResult) {
        return { success: false, error: 'Invalid move' };
      }

      // Calculate time taken
      const currentTime = new Date().toISOString();
      const lastMoveTime = new Date(gameState.last_move_time || currentTime);
      const timeTaken = Math.max(0, Date.now() - lastMoveTime.getTime());

      console.log('⏱️ Time calculation:', {
        currentPlayer: playerColor,
        timeTaken: `${timeTaken}ms`,
        lastMoveTime: gameState.last_move_time,
        currentTime,
      });

      const timeIncrement = gameState.time_increment_seconds * 1000;
      const currentPlayerTime =
        playerColor === 'white'
          ? gameState.white_time_ms
          : gameState.black_time_ms;

      const newTimeRemaining = Math.max(
        0,
        currentPlayerTime - timeTaken + timeIncrement
      );

      // Check game end conditions
      const isCheck = chess.inCheck();
      const isCheckmate = chess.isCheckmate();
      const isDraw = chess.isDraw();
      const gameEnded = isCheckmate || isDraw;

      // Get the next move number directly from database
      const { data: lastMove } = await supabase
        .from('game_live_moves')
        .select('move_number')
        .eq('game_id', gameId)
        .order('move_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextMoveNumber = (lastMove?.move_number || 0) + 1;

      // Insert the move
      const { data: moveData, error: moveError } = await supabase
        .from('game_live_moves')
        .insert({
          game_id: gameId,
          move_number: nextMoveNumber,
          player_color: playerColor,
          player_id: user.id,
          move_from: from,
          move_to: to,
          move_san: moveResult.san,
          move_fen: chess.fen(),
          is_check: isCheck,
          is_checkmate: isCheckmate,
          is_draw: isDraw,
          time_taken_ms: timeTaken,
          time_remaining_ms: Math.max(0, newTimeRemaining),
        })
        .select()
        .single();

      if (moveError) {
        console.error('❌ Error saving move:', moveError);
        return { success: false, error: 'Failed to save move' };
      }

      // Update game state
      const nextTurn = playerColor === 'white' ? 'black' : 'white';
      let gameResult: GameResult | null = null;

      if (isCheckmate) {
        gameResult = {
          type: 'checkmate',
          winner: playerColor,
          reason: 'checkmate',
        };
      } else if (isDraw) {
        const drawReason = chess.isStalemate() ? 'stalemate' : 'draw';
        gameResult = {
          type: drawReason === 'stalemate' ? 'stalemate' : 'draw',
          winner: 'draw',
          reason: drawReason,
        };
      }

      const updateData: any = {
        current_turn: nextTurn,
        move_count: gameState.move_count + 1,
        current_fen: chess.fen(),
        last_move_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update player times
      if (playerColor === 'white') {
        updateData.white_time_ms = Math.max(0, newTimeRemaining);
      } else {
        updateData.black_time_ms = Math.max(0, newTimeRemaining);
      }

      // If game ended, update game state
      if (gameEnded) {
        updateData.game_ended = true;
        updateData.game_result = gameResult;
      }

      const { error: updateError } = await supabase
        .from('game_live_state')
        .update(updateData)
        .eq('game_id', gameId);

      if (updateError) {
        console.error('❌ Error updating game state:', updateError);
        return { success: false, error: 'Failed to update game state' };
      }

      return { success: true, move: moveData };
    } catch (error) {
      console.error('❌ Failed to make move:', error);
      return { success: false, error: 'Internal error' };
    }
  }
  // Add to liveMovesService.ts
  async handlePlayerAbandonment(
    gameId: string,
    abandonedPlayerId: string
  ): Promise<boolean> {
    try {
      const gameState = await this.getGameState(gameId);
      if (!gameState || gameState.game_ended) return false;

      const winner =
        gameState.white_player_id === abandonedPlayerId ? 'black' : 'white';
      const gameResult: GameResult = {
        type: 'abandonment',
        winner,
        reason: 'player_disconnected',
      };

      const { error } = await supabase
        .from('game_live_state')
        .update({
          game_ended: true,
          game_result: gameResult,
          updated_at: new Date().toISOString(),
        })
        .eq('game_id', gameId);

      return !error;
    } catch (error) {
      console.error('Failed to handle abandonment:', error);
      return false;
    }
  }
  /**
   * Get current game state
   */
  async getGameState(gameId: string): Promise<LiveGameState | null> {
    try {
      const { data, error } = await supabase
        .from('game_live_state')
        .select('*')
        .eq('game_id', gameId)
        .single();

      if (error) {
        console.error('❌ Error getting game state:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to get game state:', error);
      return null;
    }
  }

  /**
   * Get all moves for a game
   */
  async getMoves(gameId: string): Promise<LiveMove[]> {
    try {
      const { data, error } = await supabase
        .from('game_live_moves')
        .select('*')
        .eq('game_id', gameId)
        .order('move_number', { ascending: true });

      if (error) {
        console.error('❌ Error getting moves:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Failed to get moves:', error);
      return [];
    }
  }

  /**
   * Resign from the game
   */
  async resignGame(gameId: string): Promise<boolean> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return false;
      }

      const gameState = await this.getGameState(gameId);
      if (!gameState || gameState.game_ended) {
        return false;
      }

      const playerColor =
        gameState.white_player_id === user.id ? 'white' : 'black';
      const winner = playerColor === 'white' ? 'black' : 'white';

      const gameResult: GameResult = {
        type: 'resignation',
        winner,
        reason: 'resignation',
      };

      const { error } = await supabase
        .from('game_live_state')
        .update({
          game_ended: true,
          game_result: gameResult,
          updated_at: new Date().toISOString(),
        })
        .eq('game_id', gameId);

      if (error) {
        console.error('❌ Error resigning game:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to resign game:', error);
      return false;
    }
  }

  /**
   * Offer a draw
   */
  async offerDraw(gameId: string): Promise<boolean> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return false;
      }

      const gameState = await this.getGameState(gameId);
      if (!gameState || gameState.game_ended) {
        return false;
      }

      const playerColor =
        gameState.white_player_id === user.id ? 'white' : 'black';

      // Cancel any existing active draw offers
      await supabase
        .from('game_draw_offers')
        .update({ is_active: false })
        .eq('game_id', gameId)
        .eq('is_active', true);

      // Create new draw offer
      const { error } = await supabase.from('game_draw_offers').insert({
        game_id: gameId,
        offering_player: playerColor,
        is_active: true,
      });

      if (error) {
        console.error('❌ Error offering draw:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to offer draw:', error);
      return false;
    }
  }

  /**
   * Respond to a draw offer
   */
  async respondToDrawOffer(gameId: string, accept: boolean): Promise<boolean> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return false;
      }

      // Get active draw offer
      const { data: offer, error: offerError } = await supabase
        .from('game_draw_offers')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_active', true)
        .single();

      if (offerError || !offer) {
        console.error('❌ No active draw offer found');
        return false;
      }

      // Update draw offer
      const { error: updateError } = await supabase
        .from('game_draw_offers')
        .update({
          is_active: false,
          accepted: accept,
          responded_at: new Date().toISOString(),
        })
        .eq('id', offer.id);

      if (updateError) {
        console.error('❌ Error updating draw offer:', updateError);
        return false;
      }

      // If accepted, end the game
      if (accept) {
        const gameResult: GameResult = {
          type: 'draw',
          winner: 'draw',
          reason: 'agreement',
        };

        await supabase
          .from('game_live_state')
          .update({
            game_ended: true,
            game_result: gameResult,
            updated_at: new Date().toISOString(),
          })
          .eq('game_id', gameId);
      } else {
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to respond to draw offer:', error);
      return false;
    }
  }

  /**
   * Get active draw offer
   */
  async getActiveDrawOffer(gameId: string): Promise<DrawOffer | null> {
    try {
      const { data, error } = await supabase
        .from('game_draw_offers')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('❌ Error getting draw offer:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('❌ Failed to get draw offer:', error);
      return null;
    }
  }

  /**
   * Handle timeout (when a player runs out of time)
   */
  async handleTimeout(
    gameId: string,
    timedOutPlayer: 'white' | 'black'
  ): Promise<boolean> {
    try {
      const gameState = await this.getGameState(gameId);
      if (!gameState || gameState.game_ended) {
        return false;
      }

      const winner = timedOutPlayer === 'white' ? 'black' : 'white';
      const gameResult: GameResult = {
        type: 'timeout',
        winner,
        reason: 'timeout',
      };

      const { error } = await supabase
        .from('game_live_state')
        .update({
          game_ended: true,
          game_result: gameResult,
          updated_at: new Date().toISOString(),
        })
        .eq('game_id', gameId);

      if (error) {
        console.error('❌ Error handling timeout:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to handle timeout:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time game updates
   */
  subscribeToGameUpdates(
    gameId: string,
    callbacks: {
      onGameStateUpdate?: (gameState: LiveGameState) => void;
      onNewMove?: (move: LiveMove) => void;
      onDrawOfferUpdate?: (offer: DrawOffer | null) => void;
    }
  ): () => void {
    const gameStateSubscription = supabase
      .channel(`live-game-state-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_live_state',
          filter: `game_id=eq.${gameId}`,
        },
        async (payload) => {
          if (callbacks.onGameStateUpdate) {
            const gameState = await this.getGameState(gameId);
            if (gameState) {
              callbacks.onGameStateUpdate(gameState);
            }
          }
        }
      )
      .subscribe();

    const movesSubscription = supabase
      .channel(`live-moves-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_live_moves',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          if (callbacks.onNewMove) {
            callbacks.onNewMove(payload.new as LiveMove);
          }
        }
      )
      .subscribe();

    const drawOffersSubscription = supabase
      .channel(`draw-offers-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_draw_offers',
          filter: `game_id=eq.${gameId}`,
        },
        async () => {
          if (callbacks.onDrawOfferUpdate) {
            const offer = await this.getActiveDrawOffer(gameId);
            callbacks.onDrawOfferUpdate(offer);
          }
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(gameStateSubscription);
      supabase.removeChannel(movesSubscription);
      supabase.removeChannel(drawOffersSubscription);
    };
  }

  /**
   * Get player color in the game
   */
  async getPlayerColor(gameId: string): Promise<'white' | 'black' | null> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return null;
      }

      const gameState = await this.getGameState(gameId);
      if (!gameState) {
        return null;
      }

      if (gameState.white_player_id === user.id) {
        return 'white';
      } else if (gameState.black_player_id === user.id) {
        return 'black';
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get player color:', error);
      return null;
    }
  }
}

export const liveMovesService = new LiveMovesService();
