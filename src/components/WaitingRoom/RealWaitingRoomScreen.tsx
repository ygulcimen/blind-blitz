import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { lobbyService } from '../../services/lobbyService';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { matchmakingService } from '../../services/matchmakingService';
import {
  ArrowLeft,
  Crown,
  Star,
  Sword,
  Shield,
  Trophy,
  Users,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';

export type GameMode = 'classic' | 'robot_chaos';

interface RealPlayer {
  id: string;
  username: string;
  rating: number;
  ready: boolean;
  isHost: boolean;
}

interface RoomData {
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

interface RealWaitingRoomScreenProps {
  onGameStart: (gameMode?: GameMode) => void;
}

type PaymentPhase =
  | 'waiting'
  | 'processing_payment'
  | 'payment_failed'
  | 'game_starting';

const RealWaitingRoomScreen: React.FC<RealWaitingRoomScreenProps> = ({
  onGameStart,
}) => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { playerData } = useCurrentUser();

  // State
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [players, setPlayers] = useState<RealPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>('waiting');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

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

  // Initial load
  useEffect(() => {
    loadRoomData();
  }, [gameId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!gameId) return;

    console.log('Setting up subscription for room:', gameId);

    const subscription = supabase
      .channel(`room-${gameId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_room_players',
        },
        () => {
          console.log('Player table changed - reloading room data');
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
        (payload) => {
          console.log('Room table changed:', payload);
          // Check if game started (blind phase)
          if ((payload.new as any)?.status === 'blind') {
            console.log('Game started! Transitioning to blind phase...');
            const gameScreenMode: GameMode =
              roomData?.mode === 'robochaos' ? 'robot_chaos' : 'classic';
            setTimeout(() => onGameStart(gameScreenMode), 500);
            return;
          }
          loadRoomData();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(subscription);
    };
  }, [gameId, roomData?.mode, onGameStart]);

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
  const handleLeave = async () => {
    if (!gameId) return;

    try {
      await lobbyService.leaveRoom(gameId);
      navigate('/games');
    } catch (error) {
      console.error('Failed to leave room:', error);
      navigate('/games');
    }
  };

  // Check if all players are ready
  const allPlayersReady = players.length === 2 && players.every((p) => p.ready);

  // 💰 PAYMENT PROCESSING: When all players ready → charge fees → start game
  useEffect(() => {
    if (allPlayersReady && paymentPhase === 'waiting' && roomData) {
      console.log('All players ready - processing payments...');
      setPaymentPhase('processing_payment');

      const processPayments = async () => {
        try {
          console.log('🎯 Charging entry fees for room:', gameId);

          const result = await matchmakingService.processPaymentAndStartGame(
            gameId!
          );

          if (result.success) {
            console.log(
              '✅ Payments processed successfully - starting countdown'
            );
            setPaymentPhase('game_starting');

            // Start countdown
            setCountdown(3);
            const countdownInterval = setInterval(() => {
              setCountdown((prev) => {
                if (prev <= 1) {
                  clearInterval(countdownInterval);
                  console.log('Game starting now!');
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          } else {
            console.error('❌ Payment processing failed:', result.message);
            setPaymentError(result.message);
            setPaymentPhase('payment_failed');

            // Reset player ready states on payment failure
            setTimeout(() => {
              setPaymentPhase('waiting');
              setPaymentError(null);
              loadRoomData(); // Reload to get updated ready states
            }, 5000);
          }
        } catch (error) {
          console.error('💥 Payment processing error:', error);
          setPaymentError('Network error during payment processing');
          setPaymentPhase('payment_failed');

          setTimeout(() => {
            setPaymentPhase('waiting');
            setPaymentError(null);
          }, 5000);
        }
      };

      processPayments();
    }
  }, [allPlayersReady, paymentPhase, gameId, roomData]);

  // Get mode configuration
  const getModeConfig = (mode: 'classic' | 'robochaos') => {
    switch (mode) {
      case 'classic':
        return {
          name: 'Classic Blind',
          subtitle: 'First 5 moves in darkness',
          icon: '👁️‍🗨️',
          gradient: 'from-purple-700 via-indigo-600 to-blue-700',
          bgGradient: 'from-purple-900/20 via-indigo-900/10 to-blue-900/20',
          accentColor: 'text-purple-400',
          borderColor: 'border-purple-500/50',
        };
      case 'robochaos':
        return {
          name: 'RoboChaos',
          subtitle: 'AI trolls make your opening',
          icon: '🤖',
          gradient: 'from-red-600 via-orange-500 to-yellow-500',
          bgGradient: 'from-red-900/20 via-orange-900/10 to-yellow-900/20',
          accentColor: 'text-orange-400',
          borderColor: 'border-orange-500/50',
        };
      default:
        return {
          name: 'Unknown Mode',
          subtitle: 'Unknown challenge awaits',
          icon: '❓',
          gradient: 'from-slate-500 to-slate-600',
          bgGradient: 'from-slate-900/20 to-slate-800/10',
          accentColor: 'text-slate-400',
          borderColor: 'border-slate-500/50',
        };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚔️</div>
          <div className="text-2xl font-bold mb-2">Loading Battle Arena...</div>
          <div className="text-gray-400">Preparing for combat</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !roomData) {
    return (
      <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-2xl font-bold mb-2 text-red-400">
            {error || 'Room Not Found'}
          </div>
          <div className="text-gray-400 mb-6">
            {error || 'This battle arena no longer exists'}
          </div>
          <button
            onClick={() => navigate('/games')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  const mode = getModeConfig(roomData.mode);
  const prizePool = roomData.entry_fee * 2;

  // 💰 PAYMENT PROCESSING SCREEN
  if (paymentPhase === 'processing_payment') {
    return (
      <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-orange-900/10 to-yellow-900/20 animate-pulse" />
        </div>

        <div className="relative z-10 text-center">
          <div className="text-6xl mb-6 animate-bounce">💰</div>
          <h1 className="text-4xl font-black mb-3 text-yellow-400">
            PROCESSING PAYMENTS
          </h1>
          <p className="text-lg text-gray-300 mb-5">
            Charging entry fees of {roomData.entry_fee} gold each...
          </p>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-0"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  // 💰 PAYMENT FAILED SCREEN
  if (paymentPhase === 'payment_failed') {
    return (
      <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-orange-900/10 to-red-900/20 animate-pulse" />
        </div>

        <div className="relative z-10 text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-3xl font-black mb-3 text-red-400">
            PAYMENT FAILED
          </h1>
          <p className="text-lg text-gray-300 mb-5">
            {paymentError || 'Unable to process entry fees'}
          </p>
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
            <p className="text-red-300 text-sm">
              Players have been returned to ready room. Please ensure all
              players have sufficient gold and try again.
            </p>
          </div>
          <div className="text-gray-500 text-sm">
            Returning to waiting room in a moment...
          </div>
        </div>
      </div>
    );
  }

  // 🎮 COUNTDOWN SCREEN
  if (paymentPhase === 'game_starting' && countdown > 0) {
    return (
      <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${mode.bgGradient} animate-pulse`}
          />
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-3xl animate-spin-slow" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-bounce" />
        </div>

        <div className="relative z-10 text-center">
          <div className="text-6xl mb-6 animate-bounce drop-shadow-2xl">
            {mode.icon}
          </div>
          <h1 className="text-5xl font-black mb-3 tracking-wider">
            <span
              className={`bg-gradient-to-r ${mode.gradient} bg-clip-text text-transparent animate-pulse`}
            >
              {roomData.mode === 'classic'
                ? 'ENTER THE DARKNESS!'
                : 'ROBOTS ACTIVATED!'}
            </span>
          </h1>
          <p className="text-lg text-gray-300 mb-2">
            💰 Entry fees charged successfully!
          </p>
          <p className="text-lg text-gray-300 mb-5">Battle beginning in...</p>
          <div className="text-7xl font-black text-white animate-pulse drop-shadow-2xl">
            {countdown}
          </div>
        </div>
      </div>
    );
  }

  // 🎮 MAIN WAITING ROOM UI (unchanged from your original)
  return (
    <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${mode.bgGradient}`}
        />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/20 backdrop-blur-sm bg-black/30">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={handleLeave}
              className="group flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/50 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold text-sm">Leave Room</span>
            </button>

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-3">
                <div
                  className={`relative w-12 h-12 bg-gradient-to-br ${mode.gradient} rounded-xl flex items-center justify-center shadow-2xl`}
                >
                  <span className="text-2xl drop-shadow-lg">{mode.icon}</span>
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-wide">
                    {roomData.name}
                  </h1>
                  <p className="text-xs text-gray-400 font-medium">
                    {mode.subtitle}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-900/80 to-amber-900/80 backdrop-blur-sm rounded-xl px-5 py-3 border-2 border-yellow-600/50 shadow-2xl">
                <div className="flex items-center gap-5">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-yellow-400 text-sm">💰</span>
                      <span className="text-yellow-200 text-xs uppercase tracking-wider font-bold">
                        Entry Fee
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-red-400 font-black text-sm">
                        {roomData.entry_fee}
                      </span>
                      <span className="text-yellow-400 text-sm">🪙</span>
                    </div>
                  </div>
                  <div className="w-px h-6 bg-gradient-to-b from-transparent via-yellow-400/50 to-transparent" />
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Trophy className="w-3 h-3 text-yellow-400" />
                      <span className="text-yellow-200 text-xs uppercase tracking-wider font-bold">
                        Prize Pool
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-green-400 font-black text-sm">
                        {prizePool}
                      </span>
                      <span className="text-yellow-400 text-sm">🪙</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Arena */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-5xl w-full">
            <div className="flex items-center justify-center gap-10 mb-6">
              {players.length === 0 ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">👤</div>
                  <div className="text-xl font-bold mb-2">
                    Waiting for players...
                  </div>
                  <div className="text-gray-400">
                    Share this room to invite opponents!
                  </div>
                </div>
              ) : players.length === 1 ? (
                <>
                  <PlayerCard
                    player={players[0]}
                    mode={mode}
                    isCurrentPlayer={players[0].id === playerData?.id}
                    onReady={handleReady}
                    gameStarting={paymentPhase !== 'waiting'}
                  />
                  <VSDisplay mode={mode} prizePool={prizePool} />
                  <WaitingSlot mode={mode} />
                </>
              ) : (
                <>
                  <PlayerCard
                    player={players[0]}
                    mode={mode}
                    isCurrentPlayer={players[0].id === playerData?.id}
                    onReady={handleReady}
                    gameStarting={paymentPhase !== 'waiting'}
                  />
                  <VSDisplay mode={mode} prizePool={prizePool} />
                  <PlayerCard
                    player={players[1]}
                    mode={mode}
                    isCurrentPlayer={players[1].id === playerData?.id}
                    onReady={handleReady}
                    gameStarting={paymentPhase !== 'waiting'}
                  />
                </>
              )}
            </div>

            {/* Status */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-xl px-6 py-3 border border-slate-600/50 inline-flex items-center gap-3 shadow-xl">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300 font-bold text-sm">
                  Players: {players.length}/2 | Ready:{' '}
                  {players.filter((p) => p.ready).length}/2
                </span>
                {allPlayersReady && paymentPhase === 'waiting' && (
                  <div className="flex items-center gap-2 ml-3 px-3 py-1 bg-yellow-900/50 rounded-lg border border-yellow-500/50">
                    <CreditCard className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-black text-xs animate-pulse">
                      💰 PROCESSING PAYMENTS...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const PlayerCard: React.FC<{
  player: RealPlayer;
  mode: any;
  isCurrentPlayer: boolean;
  onReady: () => void;
  gameStarting: boolean;
}> = ({ player, mode, isCurrentPlayer, onReady, gameStarting }) => {
  return (
    <div
      className={`relative group transition-all duration-500 ${
        player.ready ? 'animate-pulse' : ''
      }`}
    >
      <div
        className={`relative bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-sm border-2 rounded-2xl p-6 w-64 transition-all duration-300 shadow-2xl ${
          player.ready
            ? `${mode.borderColor} shadow-green-500/30 scale-105`
            : 'border-slate-600/50 hover:border-slate-500/70'
        }`}
      >
        {player.ready && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-black px-3 py-1 rounded-xl text-xs font-black shadow-lg animate-bounce">
            ⚡ READY ⚡
          </div>
        )}

        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <div
              className={`w-16 h-16 bg-gradient-to-br ${mode.gradient} rounded-xl flex items-center justify-center shadow-xl transform transition-transform hover:scale-110`}
            >
              <span className="text-white font-black text-xl drop-shadow-lg">
                {player.username[0].toUpperCase()}
              </span>
            </div>
            {player.isHost && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                <Crown className="w-4 h-4 text-white fill-current" />
              </div>
            )}
          </div>

          <h3 className="text-lg font-black mb-2 tracking-wide">
            {player.username}
            {isCurrentPlayer && (
              <span className="text-cyan-400 font-normal"> (You)</span>
            )}
          </h3>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-yellow-400 font-black text-base">
              {player.rating}
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${
              player.isHost
                ? 'bg-purple-900/40 text-purple-300'
                : 'bg-blue-900/40 text-blue-300'
            }`}
          >
            {player.isHost ? (
              <Shield className="w-3 h-3" />
            ) : (
              <Sword className="w-3 h-3" />
            )}
            <span className="font-bold text-xs">
              {player.isHost ? 'Host' : 'Player'}
            </span>
          </div>
        </div>

        {isCurrentPlayer && (
          <button
            onClick={onReady}
            disabled={gameStarting}
            className={`w-full py-3 rounded-xl font-black text-base transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
              gameStarting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : player.ready
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-500/30'
                : `bg-gradient-to-r ${mode.gradient} text-white hover:shadow-xl`
            }`}
          >
            {gameStarting
              ? '⏳ PROCESSING...'
              : player.ready
              ? '❌ NOT READY'
              : '✅ READY UP!'}
          </button>
        )}
      </div>
    </div>
  );
};

const WaitingSlot: React.FC<{ mode: any }> = ({ mode }) => {
  return (
    <div className="relative group">
      <div className="relative bg-gradient-to-br from-slate-800/30 to-slate-900/50 backdrop-blur-sm border-2 border-dashed border-slate-600/50 rounded-2xl p-6 w-64 transition-all duration-300 shadow-xl">
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center shadow-xl">
              <span className="text-slate-400 text-2xl">👤</span>
            </div>
          </div>
          <h3 className="text-lg font-black mb-2 tracking-wide text-slate-400">
            Waiting for opponent...
          </h3>
          <div className="text-slate-500 text-sm">Share room to invite</div>
        </div>
      </div>
    </div>
  );
};

const VSDisplay: React.FC<{ mode: any; prizePool: number }> = ({
  mode,
  prizePool,
}) => {
  return (
    <div className="flex flex-col items-center z-20">
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform animate-pulse">
          <span className="text-white font-black text-2xl drop-shadow-lg">
            VS
          </span>
        </div>
      </div>

      <div className="mt-5 bg-gradient-to-r from-yellow-900/90 to-amber-900/90 backdrop-blur-sm rounded-xl px-5 py-3 border-2 border-yellow-600/50 shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-yellow-400 text-base">💰</span>
            <span className="text-yellow-200 text-xs uppercase tracking-wider font-bold">
              Prize Pool
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-green-400 font-black text-xl">
              {prizePool}
            </span>
            <span className="text-yellow-400 text-lg">🪙</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealWaitingRoomScreen;
