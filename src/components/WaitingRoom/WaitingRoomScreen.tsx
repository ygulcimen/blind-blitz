import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Player {
  id: string;
  name: string;
  rating: number;
  isReady: boolean;
  isHost: boolean;
}

interface WaitingRoomScreenProps {
  onGameStart: () => void;
}

const WaitingRoomScreen: React.FC<WaitingRoomScreenProps> = ({
  onGameStart,
}) => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameStarting, setGameStarting] = useState(false);

  // Mock current player (in real app, this would come from auth)
  useEffect(() => {
    const mockCurrentPlayer: Player = {
      id: 'current-player',
      name: 'You',
      rating: 1650,
      isReady: false,
      isHost: true,
    };
    setCurrentPlayer(mockCurrentPlayer);

    // Mock initial players (simulate joining a table)
    const initialPlayers: Player[] = [
      mockCurrentPlayer,
      {
        id: 'opponent',
        name: 'ChessMaster2024',
        rating: 1847,
        isReady: false,
        isHost: false,
      },
    ];
    setPlayers(initialPlayers);
  }, []);

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
    navigate('/lobby');
  };

  const allPlayersReady =
    players.length === 2 && players.every((p) => p.isReady);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-128 h-128 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
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
                  <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
                    Battle Starting!
                  </span>
                </h1>
                <div className="text-6xl mb-6 animate-bounce">⚔️</div>
                <p className="text-2xl text-gray-300 mb-8">
                  Get ready for BlindChess chaos!
                </p>

                {/* Countdown */}
                <div className="text-8xl font-black text-yellow-400 animate-pulse mb-4">
                  3
                </div>
                <div className="text-gray-400">Game starting...</div>
              </>
            ) : (
              <>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
                    Battle Room
                  </span>
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  Preparing for BlindChess warfare! Both players must be ready
                  to begin.
                </p>
              </>
            )}
          </div>

          {/* Players Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {players.map((player) => (
              <div
                key={player.id}
                className={`
                  bg-black/20 backdrop-blur-lg rounded-2xl p-8 border transition-all duration-300
                  ${
                    player.isReady
                      ? 'border-green-500/50 shadow-green-500/20 shadow-xl'
                      : 'border-white/10'
                  }
                `}
              >
                {/* Player Avatar */}
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">
                    {player.isHost ? '♔' : '♛'}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {player.name}
                    {player.id === currentPlayer?.id && ' (You)'}
                  </h3>
                  <div className="text-yellow-400 font-bold text-lg mb-2">
                    ⭐ {player.rating}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {player.isHost ? '👑 Host' : '🎯 Player'}
                  </div>
                </div>

                {/* Player Status */}
                <div className="text-center">
                  {player.isReady ? (
                    <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4 mb-4">
                      <div className="text-green-400 text-xl font-bold mb-2">
                        ✅ Ready for Battle!
                      </div>
                      <div className="text-green-300 text-sm">
                        Waiting for opponent...
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-4 mb-4">
                      <div className="text-yellow-400 text-xl font-bold mb-2">
                        ⏳ Getting Ready...
                      </div>
                      <div className="text-yellow-300 text-sm">
                        Click ready when prepared
                      </div>
                    </div>
                  )}

                  {/* Ready Button (only for current player) */}
                  {player.id === currentPlayer?.id && (
                    <button
                      onClick={handleReady}
                      disabled={gameStarting}
                      className={`
                        w-full font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95
                        ${
                          player.isReady
                            ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                        }
                        ${
                          gameStarting
                            ? 'opacity-50 cursor-not-allowed'
                            : 'shadow-lg'
                        }
                      `}
                    >
                      {player.isReady ? '❌ Not Ready' : '✅ Ready to Fight!'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Game Info */}
          <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center">
              <span className="text-2xl mr-2">ℹ️</span>
              Game Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="text-2xl mb-2">🕶️</div>
                <div className="text-blue-400 font-bold text-sm">
                  Blind Phase
                </div>
                <div className="text-blue-300 text-xs">
                  5 moves each, 5s per move
                </div>
              </div>

              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <div className="text-2xl mb-2">🎬</div>
                <div className="text-purple-400 font-bold text-sm">
                  Epic Reveal
                </div>
                <div className="text-purple-300 text-xs">
                  Watch chaos unfold
                </div>
              </div>

              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="text-2xl mb-2">⚔️</div>
                <div className="text-red-400 font-bold text-sm">
                  Live Battle
                </div>
                <div className="text-red-300 text-xs">3+2 Blitz format</div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center mt-8">
            {allPlayersReady ? (
              <div className="text-green-400 font-bold text-lg animate-pulse">
                🚀 Both players ready! Starting game...
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
