import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Crown,
  Star,
  Zap,
  Sword,
  Shield,
  Clock,
  Trophy,
  Users,
  Eye,
  EyeOff,
  Bot,
} from 'lucide-react';

// Mock navigation hooks for demonstration
const useNavigate = () => (path: string) => console.log('Navigate to:', path);
const useLocation = () => ({ state: null });

export type GameMode = 'classic' | 'robot_chaos';

interface Player {
  id: string;
  name: string;
  rating: number;
  isReady: boolean;
  isHost: boolean;
}

interface WaitingRoomScreenProps {
  onGameStart: () => void;
  gameMode?: GameMode;
}

const WaitingRoomScreen: React.FC<WaitingRoomScreenProps> = ({
  onGameStart,
  gameMode = 'classic',
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameStarting, setGameStarting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Extract economic info from navigation state
  const navigationState = location.state as {
    gameMode?: GameMode;
    entryFee?: number;
    isHost?: boolean;
  } | null;

  const entryFee = navigationState?.entryFee || 50;
  const isHost = navigationState?.isHost || true;
  const prizePool = entryFee * 2;

  const getModeConfig = (mode: GameMode) => {
    switch (mode) {
      case 'classic':
        return {
          name: 'Blind Chess',
          subtitle: 'First 5 moves in darkness',
          icon: '👁️‍🗨️',
          gradient: 'from-purple-700 via-indigo-600 to-blue-700',
          bgGradient: 'from-purple-900/20 via-indigo-900/10 to-blue-900/20',
          accentColor: 'text-purple-400',
          borderColor: 'border-purple-500/50',
          description: 'Make 5 blind moves, then see the chaos unfold!',
        };
      case 'robot_chaos':
        return {
          name: 'RoboChaos',
          subtitle: 'AI trolls make your opening',
          icon: '🤖',
          gradient: 'from-red-600 via-orange-500 to-yellow-500',
          bgGradient: 'from-red-900/20 via-orange-900/10 to-yellow-900/20',
          accentColor: 'text-orange-400',
          borderColor: 'border-orange-500/50',
          description: 'Robot makes 5 chaotic moves for you!',
        };
      default:
        return {
          name: 'Mystery Mode',
          subtitle: 'Unknown challenge awaits',
          icon: '❓',
          gradient: 'from-slate-500 to-slate-600',
          bgGradient: 'from-slate-900/20 to-slate-800/10',
          accentColor: 'text-slate-400',
          borderColor: 'border-slate-500/50',
          description: 'Something unexpected...',
        };
    }
  };

  const mode = getModeConfig(gameMode);

  // Initialize players
  useEffect(() => {
    const mockCurrentPlayer: Player = {
      id: 'current-player',
      name: 'ChessKnight',
      rating: 1650,
      isReady: false,
      isHost: isHost,
    };
    setCurrentPlayer(mockCurrentPlayer);

    const initialPlayers: Player[] = [
      mockCurrentPlayer,
      {
        id: 'opponent',
        name: gameMode === 'robot_chaos' ? 'CyberMaster' : 'GrandSlayer',
        rating: 1847,
        isReady: false,
        isHost: !isHost,
      },
    ];
    setPlayers(initialPlayers);
  }, [isHost, gameMode]);

  // Pulse effect for ready state
  useEffect(() => {
    const allReady = players.length === 2 && players.every((p) => p.isReady);
    setPulseAnimation(allReady && !gameStarting);
  }, [players, gameStarting]);

  // Simulate opponent readiness
  useEffect(() => {
    if (currentPlayer?.isReady) {
      const timer = setTimeout(() => {
        setPlayers((prev) =>
          prev.map((p) => (p.id === 'opponent' ? { ...p, isReady: true } : p))
        );
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer?.isReady]);

  // Handle game start sequence
  useEffect(() => {
    const allReady = players.length === 2 && players.every((p) => p.isReady);
    if (allReady && !gameStarting) {
      setGameStarting(true);

      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setTimeout(onGameStart, 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [players, gameStarting, onGameStart]);

  const handleReady = () => {
    if (!currentPlayer) return;
    const updatedPlayer = { ...currentPlayer, isReady: !currentPlayer.isReady };
    setCurrentPlayer(updatedPlayer);
    setPlayers((prev) =>
      prev.map((p) => (p.id === currentPlayer.id ? updatedPlayer : p))
    );
  };

  const handleLeave = () => {
    navigate('/games');
  };

  // Countdown Screen with Epic Animation (80% smaller)
  if (gameStarting && countdown > 0) {
    return (
      <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${mode.bgGradient} animate-pulse`}
          />
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-3xl animate-spin-slow" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-bounce" />
        </div>

        {/* Battle Grid Effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className={`border border-white/20 ${
                  (Math.floor(i / 8) + (i % 8)) % 2 === 0
                    ? 'bg-white/5'
                    : 'bg-transparent'
                }`}
                style={{
                  animationDelay: `${i * 50}ms`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center">
          <div className="text-6xl mb-6 animate-bounce drop-shadow-2xl">
            {mode.icon}
          </div>
          <h1 className="text-5xl font-black mb-3 tracking-wider">
            <span
              className={`bg-gradient-to-r ${mode.gradient} bg-clip-text text-transparent animate-pulse`}
            >
              {gameMode === 'classic'
                ? 'ENTER THE DARKNESS!'
                : 'ROBOTS ACTIVATED!'}
            </span>
          </h1>
          <p className="text-lg text-gray-300 mb-5 font-medium tracking-wide">
            {gameMode === 'classic'
              ? '🕶️ 5 blind moves await...'
              : '🤖 Chaos bots are warming up...'}
          </p>
          <div className="relative">
            <div className="text-7xl font-black text-white animate-pulse drop-shadow-2xl">
              {countdown}
            </div>
            <div className="absolute inset-0 text-7xl font-black text-red-500 animate-ping opacity-50">
              {countdown}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${mode.bgGradient}`}
        />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Chess Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className={`${
                  (Math.floor(i / 8) + (i % 8)) % 2 === 0
                    ? 'bg-white'
                    : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header with Battle Theme (80% smaller) */}
        <div className="p-5 border-b border-white/20 backdrop-blur-sm bg-black/30">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={handleLeave}
              className="group flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/50 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold text-sm">Exit Arena</span>
            </button>

            {/* Mode Display with Blind Chess Theme */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-3">
                <div
                  className={`relative w-12 h-12 bg-gradient-to-br ${mode.gradient} rounded-xl flex items-center justify-center shadow-2xl`}
                >
                  <span className="text-2xl drop-shadow-lg">{mode.icon}</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />
                  {gameMode === 'classic' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center border-2 border-purple-400">
                      <EyeOff className="w-2 h-2 text-purple-400" />
                    </div>
                  )}
                  {gameMode === 'robot_chaos' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
                      <Bot className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-wide">
                    {mode.name}
                  </h1>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-400 font-bold text-xs tracking-wider">
                      ARENA LIVE
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">
                    {mode.subtitle}
                  </p>
                </div>
              </div>

              {/* Enhanced Stakes Display with Gold Theme */}
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
                        {entryFee}
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

        {/* Main Battle Arena (80% smaller) */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-5xl w-full">
            {/* Versus Section */}
            <div className="flex items-center justify-center gap-10 mb-6">
              {players.map((player, index) => (
                <React.Fragment key={player.id}>
                  {/* Warrior Card */}
                  <div
                    className={`relative group transition-all duration-500 ${
                      pulseAnimation ? 'animate-pulse' : ''
                    }`}
                  >
                    <div
                      className={`relative bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-sm border-2 rounded-2xl p-6 w-64 transition-all duration-300 shadow-2xl ${
                        player.isReady
                          ? `${mode.borderColor} shadow-green-500/30 scale-105`
                          : 'border-slate-600/50 hover:border-slate-500/70'
                      }`}
                    >
                      {/* Ready Crown */}
                      {player.isReady && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-black px-3 py-1 rounded-xl text-xs font-black shadow-lg animate-bounce">
                          ⚡ BATTLE READY ⚡
                        </div>
                      )}

                      {/* Warrior Avatar */}
                      <div className="text-center mb-6">
                        <div className="relative inline-block mb-3">
                          <div
                            className={`w-16 h-16 bg-gradient-to-br ${mode.gradient} rounded-xl flex items-center justify-center shadow-xl transform transition-transform hover:scale-110`}
                          >
                            <span className="text-white font-black text-xl drop-shadow-lg">
                              {player.name[0]}
                            </span>
                          </div>
                          {player.isHost && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                              <Crown className="w-4 h-4 text-white fill-current" />
                            </div>
                          )}

                          {/* Power Level Ring */}
                          <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-spin-slow opacity-60" />
                        </div>

                        <h3 className="text-lg font-black mb-2 tracking-wide">
                          {player.name}
                          {player.id === currentPlayer?.id && (
                            <span className="text-cyan-400 font-normal">
                              {' '}
                              (You)
                            </span>
                          )}
                        </h3>

                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-yellow-400 font-black text-base">
                            {player.rating}
                          </span>
                          <div className="px-2 py-1 bg-slate-700/60 rounded-lg">
                            <span className="text-xs text-slate-300 font-bold">
                              {player.rating > 1800
                                ? 'MASTER'
                                : player.rating > 1600
                                ? 'EXPERT'
                                : 'WARRIOR'}
                            </span>
                          </div>
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
                            {player.isHost ? 'Arena Master' : 'Challenger'}
                          </span>
                        </div>
                      </div>

                      {/* Battle Status with Blind/Robot Theme */}
                      <div className="mb-5">
                        {player.isReady ? (
                          <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/50 rounded-xl p-3 text-center backdrop-blur-sm">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              {gameMode === 'classic' ? (
                                <EyeOff className="w-4 h-4 text-green-400 animate-pulse" />
                              ) : (
                                <Bot className="w-4 h-4 text-green-400 animate-pulse" />
                              )}
                              <span className="text-green-400 font-black text-xs uppercase tracking-wider">
                                {gameMode === 'classic'
                                  ? 'Ready to Go Blind!'
                                  : 'Robots Standing By!'}
                              </span>
                            </div>
                            <div className="text-xs text-green-300">
                              {gameMode === 'classic'
                                ? 'Prepared for darkness...'
                                : 'Chaos protocols loaded...'}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-600/50 rounded-xl p-3 text-center backdrop-blur-sm">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                              <span className="text-amber-400 font-black text-xs uppercase tracking-wider">
                                Preparing...
                              </span>
                            </div>
                            <div className="text-xs text-slate-400">
                              {gameMode === 'classic'
                                ? 'Adjusting blindfold...'
                                : 'Calibrating chaos bots...'}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Button with Theme */}
                      {player.id === currentPlayer?.id && (
                        <button
                          onClick={handleReady}
                          disabled={gameStarting}
                          className={`w-full py-3 rounded-xl font-black text-base transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
                            player.isReady
                              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-500/30'
                              : `bg-gradient-to-r ${mode.gradient} text-white hover:shadow-xl`
                          }`}
                        >
                          {player.isReady
                            ? gameMode === 'classic'
                              ? '👁️ REMOVE BLINDFOLD'
                              : '🤖 DEACTIVATE BOTS'
                            : gameMode === 'classic'
                            ? '🕶️ PUT ON BLINDFOLD!'
                            : '🤖 ACTIVATE CHAOS BOTS!'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Epic VS Display */}
                  {index === 0 && (
                    <div className="flex flex-col items-center z-20">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform animate-pulse">
                          <span className="text-white font-black text-2xl drop-shadow-lg">
                            VS
                          </span>
                        </div>

                        {/* Battle Lightning */}
                        <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 animate-ping" />
                        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent animate-spin-slow" />
                      </div>

                      {/* Prize Pool in Center with Gold Theme */}
                      <div className="mt-5 bg-gradient-to-r from-yellow-900/90 to-amber-900/90 backdrop-blur-sm rounded-xl px-5 py-3 border-2 border-yellow-600/50 shadow-2xl">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-yellow-400 text-base">
                              💰
                            </span>
                            <span className="text-yellow-200 text-xs uppercase tracking-wider font-bold">
                              Winner Takes All
                            </span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-green-400 font-black text-xl">
                              {prizePool}
                            </span>
                            <span className="text-yellow-400 text-lg">🪙</span>
                          </div>
                          <div className="text-xs text-yellow-300 mt-1">
                            {gameMode === 'classic'
                              ? 'Survive the blindness!'
                              : 'Outsmart the chaos!'}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
                        ⚡ ARENA ⚡
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Status (80% smaller) */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-xl px-6 py-3 border border-slate-600/50 inline-flex items-center gap-3 shadow-xl">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300 font-bold text-sm">
                  Warriors Ready: {players.filter((p) => p.isReady).length}/2
                </span>
                {players.every((p) => p.isReady) && (
                  <div className="flex items-center gap-2 ml-3 px-3 py-1 bg-green-900/50 rounded-lg border border-green-500/50">
                    {gameMode === 'classic' ? (
                      <EyeOff className="w-3 h-3 text-green-400 animate-bounce" />
                    ) : (
                      <Bot className="w-3 h-3 text-green-400 animate-bounce" />
                    )}
                    <span
                      className={`${mode.accentColor} font-black text-xs animate-pulse`}
                    >
                      {gameMode === 'classic'
                        ? '🕶️ ENTERING DARKNESS...'
                        : '🤖 BOTS ACTIVATING...'}
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

export default WaitingRoomScreen;
