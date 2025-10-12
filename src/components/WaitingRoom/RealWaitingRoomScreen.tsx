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
import { PaymentFailedScreen } from './PaymentFailedScreen';
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

  // Set up real-time subscription to monitor game start
  useEffect(() => {
    if (!gameId || !roomData) return;

    console.log('Setting up game start monitoring for room:', gameId);

    const subscription = supabase
      .channel(`game-start-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          console.log('Room update detected:', payload);

          // Check if game started (blind phase)
          if ((payload.new as any)?.status === 'blind') {
            console.log('Game started! Transitioning to blind phase...');
            const gameScreenMode: GameMode =
              roomData?.mode === 'robochaos' ? 'robot_chaos' : 'classic';

            // Immediately transition to prevent payment screen flash
            onGameStart(gameScreenMode);
            return;
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up game start subscription');
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

  if (!gameStarted && paymentPhase === 'payment_failed') {
    return <PaymentFailedScreen error={paymentError} />;
  }

  if (!gameStarted && paymentPhase === 'game_starting' && countdown > 0) {
    return <GameStartingScreen mode={roomData.mode} countdown={countdown} />;
  }

  // Determine background theming based on mode
  const isRoboChaos = roomData.mode === 'robochaos';
  const bgGradient = isRoboChaos
    ? 'from-purple-900/30 via-pink-900/20 to-red-900/30'
    : 'from-purple-900/20 via-indigo-900/10 to-blue-900/20';
  const orb1 = isRoboChaos
    ? 'from-pink-500/20 to-purple-500/20'
    : 'from-red-500/10 to-orange-500/10';
  const orb2 = isRoboChaos
    ? 'from-purple-500/20 to-red-500/20'
    : 'from-blue-500/10 to-purple-500/10';

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
