// src/hooks/useWaitingRoomState.ts - Complete Implementation
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { lobbyService } from '../services/lobbyService';
import { matchmakingService } from '../services/matchmakingService';
import { useCurrentUser } from './useCurrentUser';

export type GameMode = 'classic' | 'robot_chaos';
export type PaymentPhase =
  | 'waiting'
  | 'processing_payment'
  | 'payment_failed'
  | 'game_starting';

export interface RealPlayer {
  id: string;
  username: string;
  rating: number;
  ready: boolean;
  isHost: boolean;
}

export interface RoomData {
  id: string;
  name: string;
  mode: 'classic' | 'robochaos';
  entry_fee: number;
  host_id: string;
  host_username: string;
  current_players: number;
  max_players: number;
  status: string;
}

export const useWaitingRoomState = (gameId: string | undefined) => {
  const { playerData } = useCurrentUser();

  // State
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [players, setPlayers] = useState<RealPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>('waiting');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  // Refs for cleanup
  const subscriptionRef = useRef<any>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load room data and players
  const loadRoomData = async () => {
    if (!gameId) return;

    try {
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', gameId)
        .single();

      if (roomError || !room) {
        setError('Room not found');
        return;
      }

      const { data: roomPlayers, error: playersError } = await supabase
        .from('game_room_players')
        .select('*')
        .eq('room_id', gameId);

      if (playersError) {
        console.error('Error loading players:', playersError);
        setError('Failed to load players');
        return;
      }

      setRoomData(room);

      const transformedPlayers: RealPlayer[] = (roomPlayers || []).map(
        (player) => ({
          id: player.player_id,
          username: player.player_username,
          rating: player.player_rating,
          ready: player.ready || false,
          isHost: player.player_id === room.host_id,
        })
      );

      setPlayers(transformedPlayers);
      setLoading(false);
    } catch (error) {
      console.error('Error loading room:', error);
      setError('Failed to load room data');
      setLoading(false);
    }
  };

  // Handle ready toggle
  const handleReady = async () => {
    if (!playerData || !gameId) return;

    try {
      const currentPlayer = players.find((p) => p.id === playerData.id);
      if (!currentPlayer) return;

      const newReadyState = !currentPlayer.ready;

      const { error } = await supabase
        .from('game_room_players')
        .update({ ready: newReadyState })
        .eq('room_id', gameId)
        .eq('player_id', playerData.id);

      if (error) {
        console.error('Error updating ready state:', error);
        return;
      }

      // Update local state optimistically
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === playerData.id ? { ...p, ready: newReadyState } : p
        )
      );
    } catch (error) {
      console.error('Failed to toggle ready:', error);
    }
  };

  // Handle leaving room
  const handleLeave = async (): Promise<boolean> => {
    if (!gameId) return false;

    try {
      await lobbyService.leaveRoom(gameId);
      return true;
    } catch (error) {
      console.error('Failed to leave room:', error);
      return false;
    }
  };

  // Process payments
  const processPayments = async () => {
    if (!gameId) return;

    try {
      console.log('Payment processing started');

      const result = await matchmakingService.processPaymentAndStartGame(
        gameId
      );

      if (result.success) {
        console.log('Payment successful - game starting');
        setPaymentPhase('game_starting');

        // Start countdown
        setCountdown(3);
        countdownIntervalRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
              }
              console.log('Game started');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        console.error('Payment failed:', result.message);
        setPaymentError(result.message);
        setPaymentPhase('payment_failed');

        // Reset after delay
        setTimeout(() => {
          setPaymentPhase('waiting');
          setPaymentError(null);
          loadRoomData();
        }, 5000);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentError('Network error during payment processing');
      setPaymentPhase('payment_failed');

      setTimeout(() => {
        setPaymentPhase('waiting');
        setPaymentError(null);
      }, 5000);
    }
  };

  // Setup real-time subscriptions
  useEffect(() => {
    if (!gameId) return;

    subscriptionRef.current = supabase
      .channel(`room-${gameId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_room_players',
        },
        () => {
          loadRoomData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms',
        },
        () => {
          loadRoomData();
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [gameId]);

  // Initial load
  useEffect(() => {
    loadRoomData();
  }, [gameId]);

  // Auto-process payments when ready
  const allPlayersReady = players.length === 2 && players.every((p) => p.ready);

  useEffect(() => {
    if (allPlayersReady && paymentPhase === 'waiting' && roomData) {
      setPaymentPhase('processing_payment');
      processPayments();
    }
  }, [allPlayersReady, paymentPhase, roomData]);

  return {
    // State
    roomData,
    players,
    loading,
    error,
    paymentPhase,
    paymentError,
    countdown,

    // Actions
    handleReady,
    handleLeave,
    loadRoomData,

    // Computed values
    allPlayersReady,
  };
};
