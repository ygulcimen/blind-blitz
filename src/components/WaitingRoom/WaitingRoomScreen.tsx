// components/WaitingRoom/WaitingRoomScreen.tsx - MODERNIZED WITH PRESERVED FUNCTIONALITY
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlayerEconomy } from '../../context/PlayerEconomyConcept';

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
  const { state: economy } = usePlayerEconomy();

  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameStarting, setGameStarting] = useState(false);

  // Extract economic info from navigation state
  const navigationState = location.state as {
    gameMode?: GameMode;
    entryFee?: number;
    isHost?: boolean;
  } | null;

  const entryFee = navigationState?.entryFee || 50;
  const isHost = navigationState?.isHost || true;
  const prizePool = entryFee * 2;

  const getGameModeInfo = (mode: GameMode) => {
    switch (mode) {
      case 'classic':
        return {
          name: 'Classic Blind',
          icon: '🕶️',
          description: 'You control your blind moves',
          color: 'blue',
          theme: 'from-blue-400 via-purple-500 to-red-500',
        };
      case 'robot_chaos':
        return {
          name: 'Robot Chaos',
          icon: '🤖',
          description: 'AI robots make chaotic moves',
          color: 'purple',
          theme: 'from-purple-400 via-blue-500 to-green-500',
        };
      default:
        return {
          name: 'Unknown',
          icon: '❓',
          description: 'Unknown mode',
          color: 'gray',
          theme: 'from-gray-400 to-gray-500',
        };
    }
  };

  const modeInfo = getGameModeInfo(gameMode);

  // Mock current player (in real app, this would come from auth)
  useEffect(() => {
    const mockCurrentPlayer: Player = {
      id: 'current-player',
      name: 'You',
      rating: 1650,
      isReady: false,
      isHost: isHost,
    };
    setCurrentPlayer(mockCurrentPlayer);

    // Mock initial players (simulate joining a table)
    const initialPlayers: Player[] = [
      mockCurrentPlayer,
      {
        id: 'opponent',
        name:
          gameMode === 'robot_chaos' ? 'RobotMaster2024' : 'ChessMaster2024',
        rating: 1847,
        isReady: false,
        isHost: !isHost,
      },
    ];
    setPlayers(initialPlayers);
  }, [isHost, gameMode]);

  // Simulate opponent getting ready after a delay
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

  // Check if both players are ready
  useEffect(() => {
    const allReady = players.length === 2 && players.every((p) => p.isReady);
    if (allReady && !gameStarting) {
      setGameStarting(true);

      // Start countdown
      setTimeout(() => {
        onGameStart();
      }, 3000);
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

  const allPlayersReady =
    players.length === 2 && players.every((p) => p.isReady);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Modern Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 ${
            modeInfo.color === 'purple' ? 'bg-purple-500/5' : 'bg-blue-500/5'
          } rounded-full blur-3xl animate-pulse`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${
            modeInfo.color === 'purple' ? 'bg-blue-500/5' : 'bg-purple-500/5'
          } rounded-full blur-3xl animate-pulse delay-1000`}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-8 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleLeave}
            className="mb-8 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Lobby</span>
          </button>

          {/* Main Content */}
          <div className="text-center mb-12">
            {gameStarting ? (
              <>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
                  <span
                    className={`bg-gradient-to-r ${modeInfo.theme} bg-clip-text text-transparent animate-pulse`}
                  >
                    {gameMode === 'robot_chaos'
                      ? 'Robot Chaos Starting!'
                      : 'Battle Starting!'}
                  </span>
                </h1>
                <div className="text-6xl mb-6 animate-bounce">
                  {modeInfo.icon}
                </div>
                <p className="text-2xl text-gray-400 mb-8">
                  {gameMode === 'robot_chaos'
                    ? 'Get ready for robotic mayhem!'
                    : 'Get ready for BlindChess chaos!'}
                </p>

                {/* Countdown */}
                <div className="text-8xl font-black text-yellow-400 animate-pulse mb-4">
                  3
                </div>
                <div className="text-gray-400">
                  {gameMode === 'robot_chaos'
                    ? 'Initializing robots...'
                    : 'Game starting...'}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-gray-400 text-sm">
                    Waiting for players
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
                  <span
                    className={`bg-gradient-to-r ${modeInfo.theme} bg-clip-text text-transparent`}
                  >
                    {modeInfo.name} Room
                  </span>
                </h1>
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                  {gameMode === 'robot_chaos'
                    ? 'Preparing for robotic warfare! Both players must be ready to begin.'
                    : 'Preparing for BlindChess warfare! Both players must be ready to begin.'}
                </p>

                {/* Economic Display */}
                <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-6 max-w-md mx-auto mb-12">
                  <h3 className="text-yellow-400 font-bold mb-4 flex items-center justify-center">
                    <span className="text-xl mr-2">💰</span>
                    Economic Stakes
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-red-400 font-bold text-xl mb-1">
                        {entryFee} 🪙
                      </div>
                      <div className="text-gray-400 text-sm">Entry Fee</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-bold text-xl mb-1">
                        {prizePool} 🪙
                      </div>
                      <div className="text-gray-400 text-sm">Prize Pool</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
                    Winner takes all • Your balance:{' '}
                    <span className="text-yellow-400 font-semibold">
                      {economy.gold} gold
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Players Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {players.map((player) => (
              <div
                key={player.id}
                className={`
                  bg-gray-900/40 border backdrop-blur-sm rounded-2xl p-8 transition-all duration-300
                  ${
                    player.isReady
                      ? 'border-green-500/50 shadow-lg shadow-green-500/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }
                `}
              >
                {/* Player Avatar */}
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">
                    {player.isHost
                      ? gameMode === 'robot_chaos'
                        ? '🤖'
                        : '♔'
                      : '♛'}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {player.name}
                    {player.id === currentPlayer?.id && ' (You)'}
                  </h3>
                  <div className="text-yellow-400 font-bold text-lg mb-2">
                    ⭐ {player.rating}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {player.isHost
                      ? gameMode === 'robot_chaos'
                        ? '🤖 Robot Commander'
                        : '👑 Host'
                      : '🎯 Player'}
                  </div>
                </div>

                {/* Player Status */}
                <div className="text-center">
                  {player.isReady ? (
                    <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4 mb-6">
                      <div className="text-green-400 text-xl font-bold mb-2">
                        ✅ Ready for Battle!
                      </div>
                      <div className="text-green-300 text-sm">
                        Waiting for opponent...
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-800/40 border border-gray-600/50 rounded-xl p-4 mb-6">
                      <div className="text-gray-400 text-xl font-bold mb-2">
                        ⏳ Getting Ready...
                      </div>
                      <div className="text-gray-500 text-sm">
                        {gameMode === 'robot_chaos'
                          ? 'Calibrating chaos protocols...'
                          : 'Click ready when prepared'}
                      </div>
                    </div>
                  )}

                  {/* Ready Button (only for current player) */}
                  {player.id === currentPlayer?.id && (
                    <button
                      onClick={handleReady}
                      disabled={gameStarting}
                      className={`
                        w-full font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95
                        ${
                          player.isReady
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25'
                            : gameMode === 'robot_chaos'
                            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/25'
                            : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-500/25'
                        }
                        ${gameStarting ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {player.isReady
                        ? '❌ Not Ready'
                        : gameMode === 'robot_chaos'
                        ? '🤖 Ready for Chaos!'
                        : '✅ Ready to Fight!'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Game Info */}
          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8 max-w-3xl mx-auto backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
              <span className="text-3xl mr-3">{modeInfo.icon}</span>
              {modeInfo.name} Rules
            </h3>

            {gameMode === 'robot_chaos' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">🤖</div>
                  <div className="text-purple-400 font-bold mb-2">
                    Robot Phase
                  </div>
                  <div className="text-purple-300 text-sm">
                    AI makes 5 chaotic moves
                  </div>
                </div>

                <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <div className="text-blue-400 font-bold mb-2">
                    Robot Trolling
                  </div>
                  <div className="text-blue-300 text-sm">
                    Sassy AI commentary
                  </div>
                </div>

                <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">⚔️</div>
                  <div className="text-green-400 font-bold mb-2">
                    Live Battle
                  </div>
                  <div className="text-green-300 text-sm">
                    Deal with the chaos
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">🕶️</div>
                  <div className="text-blue-400 font-bold mb-2">
                    Blind Phase
                  </div>
                  <div className="text-blue-300 text-sm">
                    5 moves each, 5s per move
                  </div>
                </div>

                <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">🎬</div>
                  <div className="text-purple-400 font-bold mb-2">
                    Epic Reveal
                  </div>
                  <div className="text-purple-300 text-sm">
                    Watch chaos unfold
                  </div>
                </div>

                <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">⚔️</div>
                  <div className="text-red-400 font-bold mb-2">Live Battle</div>
                  <div className="text-red-300 text-sm">3+2 Blitz format</div>
                </div>
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="text-center mt-8">
            {allPlayersReady ? (
              <div
                className={`font-bold text-lg animate-pulse ${
                  gameMode === 'robot_chaos'
                    ? 'text-purple-400'
                    : 'text-green-400'
                }`}
              >
                🚀 Both players ready!
                {gameMode === 'robot_chaos'
                  ? ' Unleashing robots...'
                  : ' Starting game...'}
              </div>
            ) : (
              <div className="text-gray-400">
                {players.filter((p) => p.isReady).length}/2 players ready
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoomScreen;
