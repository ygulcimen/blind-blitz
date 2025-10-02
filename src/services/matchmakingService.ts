// src/services/matchmakingService.ts - NEW Pure Matchmaking System
import { supabase } from '../lib/supabase';

interface MatchmakingPreferences {
  mode: 'classic' | 'robochaos';
  minEntryFee: number;
  maxEntryFee: number;
  ratingFlexibility: number;
}

interface MatchmakingResult {
  success: boolean;
  action: 'joined_existing' | 'created_room' | 'error';
  roomId?: string;
  entryFee?: number;
  opponent?: string;
  message: string;
  nextPhase: 'payment' | 'waiting_for_opponent' | 'error';
}

interface PaymentResult {
  success: boolean;
  message: string;
  totalPot?: number;
  phase?: 'blind';
}

interface MatchmakingStatus {
  status: 'not_in_game' | 'waiting' | 'starting' | 'blind' | 'live';
  roomId?: string;
  entryFee?: number;
  color?: 'white' | 'black';
  ready?: boolean;
  currentPlayers?: number;
  expiresAt?: string;
}

class MatchmakingService {
  /**
   * Start matchmaking with preferences
   */
  async startMatchmaking(
    preferences: MatchmakingPreferences
  ): Promise<MatchmakingResult> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        return {
          success: false,
          action: 'error',
          message: 'Authentication required',
          nextPhase: 'error',
        };
      }

      // Call our backend matchmaking function
      const { data, error } = await supabase.rpc('start_matchmaking', {
        player_uuid: user.id,
        p_mode: preferences.mode,
        p_min_entry_fee: preferences.minEntryFee,
        p_max_entry_fee: preferences.maxEntryFee,
        p_rating_flexibility: preferences.ratingFlexibility,
      });

      if (error) {
        console.error('Matchmaking error:', error);
        return {
          success: false,
          action: 'error',
          message: error.message || 'Matchmaking failed',
          nextPhase: 'error',
        };
      }

      if (!data.success) {
        return {
          success: false,
          action: 'error',
          message: data.reason || 'Matchmaking failed',
          nextPhase: 'error',
        };
      }

      return {
        success: true,
        action: data.action as 'joined_existing' | 'created_room',
        roomId: data.room_id,
        entryFee: data.entry_fee,
        opponent: data.opponent,
        message:
          data.action === 'joined_existing'
            ? `Matched with ${data.opponent || 'opponent'}!`
            : 'Room created, waiting for opponent...',
        nextPhase: data.next_phase as 'payment' | 'waiting_for_opponent',
      };
    } catch (error) {
      console.error('Matchmaking service error:', error);
      return {
        success: false,
        action: 'error',
        message: 'Network error. Please try again.',
        nextPhase: 'error',
      };
    }
  }

  /**
   * Process payments and start the game
   */
  async processPaymentAndStartGame(roomId: string): Promise<PaymentResult> {
    try {
      console.log('💰 Processing payments for room:', roomId);

      const { data, error } = await supabase.rpc(
        'charge_entry_fees_and_start_game',
        {
          room_uuid: roomId,
        }
      );

      if (error) {
        console.error('❌ Payment processing error:', error);
        return {
          success: false,
          message: error.message || 'Payment processing failed',
        };
      }

      if (!data.success) {
        // Handle specific payment failures
        if (data.reason?.includes('insufficient_gold')) {
          const playerId = data.player_id;
          return {
            success: false,
            message: `Payment failed - insufficient gold. Player will be removed from room.`,
          };
        }

        return {
          success: false,
          message: data.reason || 'Payment processing failed',
        };
      }

      console.log('✅ Payments processed successfully:', data);

      return {
        success: true,
        message: 'Game starting! Entering blind phase...',
        totalPot: data.total_pot,
        phase: 'blind',
      };
    } catch (error) {
      console.error('💥 Payment processing error:', error);
      return {
        success: false,
        message: 'Network error during payment processing',
      };
    }
  }

  /**
   * Get current matchmaking status
   */
  async getMatchmakingStatus(): Promise<MatchmakingStatus> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        return { status: 'not_in_game' };
      }

      const { data, error } = await supabase.rpc(
        'get_player_matchmaking_status',
        {
          player_uuid: user.id,
        }
      );

      if (error || !data) {
        return { status: 'not_in_game' };
      }

      return {
        status: data.status,
        roomId: data.room_id,
        entryFee: data.entry_fee,
        color: data.color,
        ready: data.ready,
        currentPlayers: data.current_players,
        expiresAt: data.expires_at,
      };
    } catch (error) {
      console.error('Error getting matchmaking status:', error);
      return { status: 'not_in_game' };
    }
  }

  /**
   * Leave current matchmaking room
   */
  async leaveMatchmaking(): Promise<{ success: boolean; message: string }> {
    try {
      const status = await this.getMatchmakingStatus();

      if (status.status === 'not_in_game' || !status.roomId) {
        return { success: true, message: 'Not in any matchmaking room' };
      }

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, message: 'Authentication required' };
      }

      // Remove player from room
      const { error } = await supabase
        .from('game_room_players')
        .delete()
        .eq('room_id', status.roomId)
        .eq('player_id', user.id);

      if (error) {
        console.error('Error leaving matchmaking room:', error);
        return { success: false, message: 'Failed to leave room' };
      }

      console.log('✅ Left matchmaking room successfully');
      return { success: true, message: 'Left matchmaking room' };
    } catch (error) {
      console.error('Error leaving matchmaking:', error);
      return { success: false, message: 'Network error' };
    }
  }

  /**
   * Subscribe to matchmaking room updates
   */
  subscribeToMatchmakingUpdates(
    roomId: string,
    callbacks: {
      onRoomFilled?: () => void;
      onGameStarted?: () => void;
      onPlayerLeft?: () => void;
      onRoomExpired?: () => void;
    }
  ): () => void {
    console.log('🔔 Subscribing to matchmaking updates for room:', roomId);

    const channel = supabase
      .channel(`matchmaking-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          const newRoom = payload.new as any;
          console.log(
            '🔄 Room update:',
            newRoom.status,
            'players:',
            newRoom.current_players
          );

          // Room filled - ready for payment
          if (newRoom.current_players === 2 && newRoom.status === 'starting') {
            callbacks.onRoomFilled?.();
          }

          // Game started
          if (newRoom.status === 'blind' && newRoom.entry_fees_charged) {
            callbacks.onGameStarted?.();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'game_room_players',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          console.log('👤 Player left matchmaking room');
          callbacks.onPlayerLeft?.();
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Get optimal entry fee suggestions based on player's gold
   */
  getEntrySuggestions(
    playerGold: number
  ): { min: number; max: number; suggested: number }[] {
    const suggestions = [];

    // Free option
    if (playerGold >= 0) {
      suggestions.push({ min: 0, max: 0, suggested: 0 });
    }

    // Low stakes
    if (playerGold >= 50) {
      suggestions.push({ min: 25, max: 75, suggested: 50 });
    }

    // Standard stakes
    if (playerGold >= 100) {
      suggestions.push({ min: 75, max: 150, suggested: 100 });
    }

    // High stakes
    if (playerGold >= 250) {
      suggestions.push({ min: 150, max: 350, suggested: 250 });
    }

    // Premium stakes
    if (playerGold >= 500) {
      suggestions.push({ min: 300, max: 500, suggested: 400 });
    }

    return suggestions;
  }

  /**
   * Get rating flexibility suggestions
   */
  getRatingFlexibilityOptions(): {
    value: number;
    label: string;
    description: string;
  }[] {
    return [
      { value: 100, label: 'Similar Skill', description: '±100 rating points' },
      { value: 200, label: 'Flexible', description: '±200 rating points' },
      { value: 400, label: 'Any Skill', description: '±400 rating points' },
    ];
  }
}

export const matchmakingService = new MatchmakingService();
