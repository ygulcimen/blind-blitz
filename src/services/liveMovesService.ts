// src/services/liveMovesService.ts - REAL-TIME MULTIPLAYER CHESS
import { supabase } from '../lib/supabase';
import { Chess } from 'chess.js';

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

export interface GameResult {
  type: 'checkmate' | 'draw' | 'resignation' | 'timeout' | 'abort';
  winner: 'white' | 'black' | 'draw';
  reason: string;
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
  async initializeLiveGame(
    gameId: string,
    whitePlayerId: string,
    blackPlayerId: string,
    startingFen: string
  ): Promise<LiveGameState | null> {
    try {
      console.log('🎯 Initializing live game:', {
        gameId,
        whitePlayerId,
        blackPlayerId,
      });

      const { data: existingState, error: checkError } = await supabase
        .from('game_live_state')
        .select('*')
        .eq('game_id', gameId)
        .single();

      if (existingState && !checkError) {
        console.log('✅ Live game already exists, returning existing state');
        return existingState;
      }

      // Create new live game state
      const { data: newState, error } = await supabase
        .from('game_live_state')
        .insert({
          game_id: gameId,
          white_player_id: whitePlayerId,
          black_player_id: blackPlayerId,
          current_fen: startingFen,
          current_turn: 'white', // White always starts live phase
          move_count: 0,
          white_time_ms: 3 * 60 * 1000, // 3 minutes
          black_time_ms: 3 * 60 * 1000, // 3 minutes
          time_control_minutes: 3,
          time_increment_seconds: 2,
        })
        .select()
        .single();

      if (error) {
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
      if (gameState.current_turn !== playerColor) {
        return { success: false, error: 'Not your turn' };
      }

      // Validate the move using chess.js
      const chess = new Chess(gameState.current_fen);
      const moveResult = chess.move({ from, to, promotion: promotion as any });

      if (!moveResult) {
        return { success: false, error: 'Invalid move' };
      }

      // Calculate time taken (mock for now, you can implement real timing)
      const timeTaken = 2000; // 2 seconds
      const timeIncrement = gameState.time_increment_seconds * 1000;
      const newTimeRemaining =
        playerColor === 'white'
          ? gameState.white_time_ms - timeTaken + timeIncrement
          : gameState.black_time_ms - timeTaken + timeIncrement;

      // Check game end conditions
      const isCheck = chess.inCheck();
      const isCheckmate = chess.isCheckmate();
      const isDraw = chess.isDraw();
      const gameEnded = isCheckmate || isDraw;

      // Insert the move
      const { data: moveData, error: moveError } = await supabase
        .from('game_live_moves')
        .insert({
          game_id: gameId,
          move_number: gameState.move_count + 1,
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
          winner: playerColor, // Current player wins by checkmate
          reason: 'checkmate',
        };
      } else if (isDraw) {
        gameResult = {
          type: 'draw',
          winner: 'draw',
          reason: chess.isStalemate() ? 'stalemate' : 'draw',
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

      console.log('✅ Move made successfully:', moveResult.san);
      return { success: true, move: moveData };
    } catch (error) {
      console.error('❌ Failed to make move:', error);
      return { success: false, error: 'Internal error' };
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

      console.log('✅ Game resigned successfully');
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

      console.log('✅ Draw offered successfully');
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

        console.log('✅ Draw accepted - game ended');
      } else {
        console.log('✅ Draw declined');
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

      console.log(`✅ Timeout handled - ${winner} wins`);
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
    console.log('🔗 Setting up live game subscriptions for:', gameId);

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
          console.log('🔄 Game state changed:', payload);
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
          console.log('🔄 New move:', payload.new);
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
          console.log('🔄 Draw offer changed');
          if (callbacks.onDrawOfferUpdate) {
            const offer = await this.getActiveDrawOffer(gameId);
            callbacks.onDrawOfferUpdate(offer);
          }
        }
      )
      .subscribe();

    console.log('📡 Live game subscriptions active');

    // Return cleanup function
    return () => {
      console.log('❌ Cleaning up live game subscriptions');
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
