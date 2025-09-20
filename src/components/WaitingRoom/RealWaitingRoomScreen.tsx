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

            setTimeout(() => {
              onGameStart(gameScreenMode);
            }, 500);
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

  // Payment processing states
  if (paymentPhase === 'processing_payment') {
    return <PaymentProcessingScreen entryFee={roomData.entry_fee} />;
  }

  if (paymentPhase === 'payment_failed') {
    return <PaymentFailedScreen error={paymentError} />;
  }

  if (paymentPhase === 'game_starting' && countdown > 0) {
    return <GameStartingScreen mode={roomData.mode} countdown={countdown} />;
  }

  // Main waiting room UI
  return (
    <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-indigo-900/10 to-blue-900/20" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
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
