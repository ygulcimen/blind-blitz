// src/services/liveMovesService.ts - REAL-TIME MULTIPLAYER CHESS
import { supabase } from '../lib/supabase';
import { Chess } from 'chess.js';
import type { GameResult } from '../types/GameTypes';
import { withErrorHandling, handleServiceError } from '../utils/errorHandling';

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
  private readonly HEARTBEAT_INTERVAL = 120000; // 2 minutes
  private readonly ABANDONMENT_THRESHOLD = 600000; // 10 minutes (increased from 5 to reduce false positives)

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
      // Silent fail to reduce spam
    }
  }

  /**
   * Check for player abandonment - IMPROVED: Only marks abandoned if player has explicitly left
   */
  private async checkForAbandonment(gameId: string): Promise<void> {
    try {
      const gameState = await this.getGameState(gameId);
      if (!gameState || gameState.game_ended) return;

      const threshold = new Date(Date.now() - this.ABANDONMENT_THRESHOLD);

      // Get ALL presence records for this game (not just recent ones)
      const { data: allPresenceData } = await supabase
        .from('player_presence')
        .select('*')
        .eq('game_id', gameId);

      const playerIds = [gameState.white_player_id, gameState.black_player_id];

      // Check each player individually
      for (const playerId of playerIds) {
        const presence = allPresenceData?.find((p) => p.player_id === playerId);

        // Only mark as abandoned if:
        // 1. Player has a presence record AND
        // 2. Their last ping is very old (>10 minutes) AND
        // 3. They're explicitly marked as offline
        if (presence &&
            new Date(presence.last_ping) < threshold &&
            presence.is_online === false) {
          console.log(`🚨 Player ${playerId} detected as abandoned - last ping: ${presence.last_ping}`);
          await this.handlePlayerAbandonment(gameId, playerId);
          this.stopHeartbeatMonitoring(gameId);
          break;
        }
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

  async initializeLiveGame(
    gameId: string,
    whitePlayerId: string,
    blackPlayerId: string,
    startingFen: string
  ): Promise<LiveGameState | null> {
    try {
      console.log('⏰ Initializing live game with 5 minute time control');

      // Fixed time control: 5 minutes, no increment
      const minutes = 5;
      const increment = 0;
      const timeMs = minutes * 60 * 1000; // 5 minutes = 300,000ms

      const chess = new Chess(startingFen);
      const actualTurn = chess.turn() === 'w' ? 'white' : 'black';

      // Use UPSERT with ignoreDuplicates to handle concurrent initialization
      // This is atomic and prevents race conditions
      const { data: newState, error } = await supabase
        .from('game_live_state')
        .upsert(
          {
            game_id: gameId,
            white_player_id: whitePlayerId,
            black_player_id: blackPlayerId,
            current_fen: startingFen,
            current_turn: actualTurn,
            move_count: 0,
            white_time_ms: timeMs,
            black_time_ms: timeMs,
            time_control_minutes: minutes,
            time_increment_seconds: increment,
            last_move_time: null, // Don't start clock until animated reveal completes
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'game_id',
            ignoreDuplicates: false, // Return existing if duplicate
          }
        )
        .select()
        .single();

      if (error) {
        console.error('❌ Error in upsert, attempting to fetch existing state:', error);

        // Fallback: Try to fetch existing state
        const { data: existingState } = await supabase
          .from('game_live_state')
          .select('*')
          .eq('game_id', gameId)
          .single();

        if (existingState) {
          console.log('✅ Retrieved existing live game state');
          return existingState;
        }

        console.error('❌ Failed to initialize or retrieve live game');
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
   * Start the game clock (called after countdown finishes)
   */
  async startGameClock(gameId: string): Promise<boolean> {
    try {
      console.log('⏰ Starting game clock');

      const { error } = await supabase
        .from('game_live_state')
        .update({
          last_move_time: new Date().toISOString(),
        })
        .eq('game_id', gameId)
        .is('last_move_time', null); // Only update if not already set

      if (error) {
        console.error('❌ Error starting game clock:', error);
        return false;
      }

      console.log('✅ Game clock started');
      return true;
    } catch (error) {
      console.error('❌ Failed to start game clock:', error);
      return false;
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

      // Calculate time taken for this move
      const now = Date.now();
      let timeTaken = 0;

      if (gameState.last_move_time) {
        // Calculate elapsed time since turn started
        const turnStartTime = new Date(gameState.last_move_time).getTime();
        timeTaken = Math.max(0, now - turnStartTime);
      }

      console.log('⏱️ Time calculation:', {
        currentPlayer: playerColor,
        timeTaken: `${timeTaken}ms (${(timeTaken / 1000).toFixed(1)}s)`,
        turnStartedAt: gameState.last_move_time || 'Not started',
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

      // DO NOT update times here - database trigger handles it automatically

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
      const gameError = handleServiceError(error, 'makeMove');
      return { success: false, error: gameError.userMessage };
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
      console.log(
        '🔍 GET GAME STATE: Fetching from database for gameId:',
        gameId
      );

      const { data, error } = await supabase
        .from('game_live_state')
        .select('*')
        .eq('game_id', gameId)
        .maybeSingle(); // Use maybeSingle() instead of single() to allow 0 or 1 results

      if (error) {
        console.error('❌ GET GAME STATE: Error getting game state:', error);
        return null;
      }

      // Return null if no data found (game not in live phase yet)
      if (!data) {
        console.log('ℹ️ GET GAME STATE: No live game state found (game not in live phase yet)');
        return null;
      }

      console.log('✅ GET GAME STATE: Retrieved data from database', {
        gameId: data?.game_id,
        game_ended: data?.game_ended,
        game_result: data?.game_result,
        move_count: data?.move_count,
        updated_at: data?.updated_at,
      });

      return data;
    } catch (error) {
      console.error('❌ GET GAME STATE: Failed to get game state:', error);
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
    console.log('🤝 DRAW RESPONSE: Starting respondToDrawOffer', {
      gameId,
      accept,
    });

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.log('❌ DRAW RESPONSE: Auth error or no user', {
          authError,
          user: !!user,
        });
        return false;
      }

      console.log('🤝 DRAW RESPONSE: User authenticated', { userId: user.id });

      // Get active draw offer
      console.log(
        '🤝 DRAW RESPONSE: Fetching active draw offer for gameId:',
        gameId
      );
      const { data: offer, error: offerError } = await supabase
        .from('game_draw_offers')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_active', true)
        .single();

      if (offerError || !offer) {
        console.error('❌ DRAW RESPONSE: No active draw offer found', {
          offerError,
          offer,
        });
        return false;
      }

      console.log('🤝 DRAW RESPONSE: Found active draw offer', offer);

      // Update draw offer
      console.log(
        '🤝 DRAW RESPONSE: Updating draw offer to inactive with response',
        { accept }
      );
      const { error: updateError } = await supabase
        .from('game_draw_offers')
        .update({
          is_active: false,
          accepted: accept,
          responded_at: new Date().toISOString(),
        })
        .eq('id', offer.id);

      if (updateError) {
        console.error(
          '❌ DRAW RESPONSE: Error updating draw offer:',
          updateError
        );
        return false;
      }

      console.log('✅ DRAW RESPONSE: Successfully updated draw offer');

      // If accepted, end the game
      if (accept) {
        console.log('🏁 DRAW RESPONSE: Draw accepted, ending game...');

        const gameResult: GameResult = {
          type: 'draw',
          winner: 'draw',
          reason: 'agreement',
        };

        console.log('🏁 DRAW RESPONSE: Created game result', gameResult);

        // Create a clean update payload with only known fields
        const cleanGameResult = {
          type: 'draw' as const,
          winner: 'draw' as const,
          reason: 'agreement',
        };

        console.log(
          '🏁 DRAW RESPONSE: Using clean game result payload:',
          cleanGameResult
        );

        // Clean database update with explicit field mapping
        console.log('🏁 DRAW RESPONSE: Attempting clean database update...');
        const updatePayload = {
          game_ended: true,
          game_result: cleanGameResult,
          updated_at: new Date().toISOString(),
        };

        console.log('🏁 DRAW RESPONSE: Update payload:', updatePayload);
        console.log(
          '🏁 DRAW RESPONSE: Payload JSON:',
          JSON.stringify(updatePayload, null, 2)
        );
        console.log(
          '🏁 DRAW RESPONSE: About to call supabase.from(game_live_state).update()'
        );

        const { data: gameEndData, error: gameEndError } = await supabase
          .from('game_live_state')
          .update(updatePayload)
          .eq('game_id', gameId)
          .select();

        if (gameEndError) {
          console.error('❌ DRAW RESPONSE: Clean update failed:', gameEndError);
          console.error(
            '❌ DRAW RESPONSE: Error details:',
            JSON.stringify(gameEndError, null, 2)
          );

          // Ultra-minimal fallback: Just set game_ended
          console.log(
            '🔧 DRAW RESPONSE: Trying ultra-minimal update (game_ended only)...'
          );
          const { data: minimalData, error: minimalError } = await supabase
            .from('game_live_state')
            .update({ game_ended: true })
            .eq('game_id', gameId)
            .select();

          if (minimalError) {
            console.error(
              '❌ DRAW RESPONSE: Even minimal update failed:',
              minimalError
            );
            return false;
          }

          console.log(
            '✅ DRAW RESPONSE: Minimal update succeeded',
            minimalData
          );
        } else {
          console.log('✅ DRAW RESPONSE: Clean update succeeded', gameEndData);
        }
      } else {
        console.log('🚫 DRAW RESPONSE: Draw declined, game continues');
      }

      console.log(
        '✅ DRAW RESPONSE: respondToDrawOffer completed successfully'
      );
      return true;
    } catch (error) {
      console.error(
        '❌ DRAW RESPONSE: Failed to respond to draw offer:',
        error
      );
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
          console.log('📡 REALTIME: Received game_live_state change', {
            gameId,
            event: payload.eventType,
            new: payload.new,
            old: payload.old,
          });

          if (callbacks.onGameStateUpdate) {
            console.log('📡 REALTIME: Fetching updated game state...');
            const gameState = await this.getGameState(gameId);
            console.log('📡 REALTIME: Retrieved game state', {
              gameState,
              game_ended: gameState?.game_ended,
              game_result: gameState?.game_result,
            });

            if (gameState) {
              console.log('📡 REALTIME: Calling onGameStateUpdate callback');
              callbacks.onGameStateUpdate(gameState);
            } else {
              console.log('❌ REALTIME: No game state retrieved');
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
        async (payload) => {
          console.log('📡 REALTIME: Received game_draw_offers change', {
            gameId,
            event: payload.eventType,
            new: payload.new,
            old: payload.old,
          });

          if (callbacks.onDrawOfferUpdate) {
            console.log('📡 REALTIME: Fetching active draw offer...');
            const offer = await this.getActiveDrawOffer(gameId);
            console.log('📡 REALTIME: Retrieved draw offer', { offer });
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
