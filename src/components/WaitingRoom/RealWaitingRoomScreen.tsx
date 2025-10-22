// RealWaitingRoomScreen.tsx - Refactored and Clean
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  useWaitingRoomState,
  type GameMode,
} from '../../hooks/useWaitingRoomState';

// Component imports
import { WaitingRoomHeader } from './WaitingRoomHeader';
import { WaitingRoomArena } from './WaitingRoomArena';
import { PaymentProcessingScreen } from './PaymentProcessingScreen';
import { GameStartingScreen } from './GameStartingScreen';
import { LoadingScreen } from './LoadingScreen';
import { ErrorScreen } from './ErrorScreen';

interface RealWaitingRoomScreenProps {
  onGameStart: (gameMode?: GameMode) => void;
}

const RealWaitingRoomScreen: React.FC<RealWaitingRoomScreenProps> = ({
  onGameStart,
}) => {
  const navigate = useNavigate();
  const { gameId } = useParams();

  const {
    roomData,
    players,
    loading,
    error,
    paymentPhase,
    paymentError,
    countdown,
    handleReady,
    handleLeave,
    allPlayersReady,
  } = useWaitingRoomState(gameId);

  // Handle leaving with navigation
  const handleLeaveWithNavigation = async () => {
    const success = await handleLeave();
    navigate('/games');
  };

  // Set up real-time subscription to monitor game start - OPTIMIZED
  useEffect(() => {
    if (!gameId || !roomData) return;

    console.log('⚡ Setting up game start monitoring for room:', gameId);

    // Use a ref to prevent duplicate transitions
    let hasTransitioned = false;

    const subscription = supabase
      .channel(`game-start-${gameId}-${Date.now()}`) // Unique channel per mount
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          // Check if game started (blind phase)
          if ((payload.new as any)?.status === 'blind' && !hasTransitioned) {
            hasTransitioned = true;
            console.log('🎮 Game started! Transitioning to blind phase (optimized)');
            const gameScreenMode: GameMode =
              roomData?.mode === 'robochaos' ? 'robot_chaos' : 'classic';

            // Immediate transition with minimal delay for smooth UX
            requestAnimationFrame(() => {
              onGameStart(gameScreenMode);
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up game start subscription');
      supabase.removeChannel(subscription);
    };
  }, [gameId, roomData?.mode, onGameStart]);

  // Loading state
  if (loading) {
    return <LoadingScreen />;
  }

  // Error state
  if (error || !roomData) {
    return (
      <ErrorScreen error={error} onReturnToLobby={() => navigate('/games')} />
    );
  }

  // Don't show payment screens if game has already started
  const gameStarted = roomData.status === 'blind' || roomData.status === 'live';

  // Payment processing states
  if (!gameStarted && paymentPhase === 'processing_payment') {
    return <PaymentProcessingScreen entryFee={roomData.entry_fee} />;
  }

  // If payment failed, redirect to lobby with error message
  useEffect(() => {
    if (!gameStarted && paymentPhase === 'payment_failed') {
      console.error('Payment failed:', paymentError);
      // Navigate back to lobby
      navigate('/games');
    }
  }, [paymentPhase, gameStarted, paymentError, navigate]);

  if (!gameStarted && paymentPhase === 'game_starting' && countdown > 0) {
    return <GameStartingScreen mode={roomData.mode} countdown={countdown} />;
  }

  // Determine background theming based on tier and mode
  const isRoboChaos = roomData.mode === 'robochaos';

  // Import tier config
  const getTierFromEntryFee = (entryFee: number) => {
    if (entryFee >= 10 && entryFee <= 24) return 'pawn';
    if (entryFee >= 25 && entryFee <= 49) return 'knight';
    if (entryFee >= 50 && entryFee <= 99) return 'bishop';
    if (entryFee >= 100 && entryFee <= 249) return 'rook';
    if (entryFee >= 250 && entryFee <= 499) return 'queen';
    if (entryFee >= 500) return 'king';
    return 'pawn';
  };

  const tierBgConfig = {
    pawn: {
      bgGradient: 'from-emerald-900/20 via-black to-green-900/20',
      orb1: 'from-emerald-500/15 to-green-500/15',
      orb2: 'from-green-500/15 to-emerald-500/15',
    },
    knight: {
      bgGradient: 'from-blue-900/20 via-black to-cyan-900/20',
      orb1: 'from-blue-500/15 to-cyan-500/15',
      orb2: 'from-cyan-500/15 to-blue-500/15',
    },
    bishop: {
      bgGradient: 'from-purple-900/20 via-black to-indigo-900/20',
      orb1: 'from-purple-500/15 to-indigo-500/15',
      orb2: 'from-indigo-500/15 to-purple-500/15',
    },
    rook: {
      bgGradient: 'from-orange-900/20 via-black to-amber-900/20',
      orb1: 'from-orange-500/15 to-amber-500/15',
      orb2: 'from-amber-500/15 to-orange-500/15',
    },
    queen: {
      bgGradient: 'from-pink-900/20 via-black to-rose-900/20',
      orb1: 'from-pink-500/15 to-rose-500/15',
      orb2: 'from-rose-500/15 to-pink-500/15',
    },
    king: {
      bgGradient: 'from-yellow-900/20 via-black to-orange-900/20',
      orb1: 'from-yellow-500/20 to-orange-500/20',
      orb2: 'from-orange-500/20 to-yellow-500/20',
    },
  };

  const tier = getTierFromEntryFee(roomData.entry_fee);
  const tierBg = tierBgConfig[tier];

  const bgGradient = isRoboChaos
    ? 'from-purple-900/30 via-pink-900/20 to-red-900/30'
    : tierBg.bgGradient;
  const orb1 = isRoboChaos
    ? 'from-pink-500/20 to-purple-500/20'
    : tierBg.orb1;
  const orb2 = isRoboChaos
    ? 'from-purple-500/20 to-red-500/20'
    : tierBg.orb2;

  // Main waiting room UI
  return (
    <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white overflow-hidden">
      {/* Background - THEMED */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient}`} />
        <div className={`absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-br ${orb1} rounded-full blur-3xl animate-pulse`} />
        <div className={`absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br ${orb2} rounded-full blur-3xl animate-pulse delay-1000`} />
        {isRoboChaos && (
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIzNiwgNzIsIDE1MywgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        )}
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <WaitingRoomHeader
          roomData={roomData}
          onLeave={handleLeaveWithNavigation}
        />

        <WaitingRoomArena
          roomData={roomData}
          players={players}
          onReady={handleReady}
          allPlayersReady={allPlayersReady}
          paymentPhase={paymentPhase}
        />
      </div>
    </div>
  );
};

export default RealWaitingRoomScreen;
