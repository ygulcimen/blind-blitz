import React from 'react';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  // Mock user data
  const user = {
    name: 'ChessMaster2024',
    rating: 1847,
    gamesPlayed: 156,
    gamesWon: 89,
    winRate: 57,
    blindWins: 34,
    epicMoments: 23,
    joinDate: 'March 2024',
    avatar: '♔',
  };

  const recentGames = [
    {
      opponent: 'BlindNinja',
      result: 'win',
      rating: 1623,
      moves: 34,
      time: '2 hours ago',
    },
    {
      opponent: 'QueenGambit',
      result: 'loss',
      rating: 1892,
      moves: 67,
      time: '5 hours ago',
    },
    {
      opponent: 'RookiePlayer',
      result: 'win',
      rating: 1456,
      moves: 28,
      time: '1 day ago',
    },
  ];

  return (
    <div className="min-h-screen pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
              Player Profile
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Your BlindChess journey and achievements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="text-center">
                <div className="text-6xl mb-4">{user.avatar}</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {user.name}
                </h2>
                <div className="text-3xl font-black text-yellow-400 mb-2">
                  {user.rating}
                </div>
                <div className="text-gray-400 text-sm mb-6">Current Rating</div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Member since:</span>
                    <span className="text-white">{user.joinDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Games played:</span>
                    <span className="text-white">{user.gamesPlayed}</span>
                  </div>
                </div>

                <Link
                  to="/lobby"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 
                             text-white font-bold py-3 px-4 rounded-xl 
                             transition-all duration-300 transform hover:scale-105 active:scale-95
                             shadow-lg hover:shadow-blue-500/30 block text-center"
                >
                  🚀 Play Now
                </Link>
              </div>
            </div>
          </div>

          {/* Stats & Recent Games */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {user.gamesWon}
                </div>
                <div className="text-green-300 text-sm">Games Won</div>
              </div>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {user.winRate}%
                </div>
                <div className="text-blue-300 text-sm">Win Rate</div>
              </div>
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {user.blindWins}
                </div>
                <div className="text-purple-300 text-sm">Blind Victories</div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {user.epicMoments}
                </div>
                <div className="text-yellow-300 text-sm">Epic Moments</div>
              </div>
            </div>

            {/* Recent Games */}
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="text-2xl mr-2">📜</span>
                Recent Games
              </h3>

              <div className="space-y-4">
                {recentGames.map((game, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          game.result === 'win' ? 'bg-green-400' : 'bg-red-400'
                        }`}
                      />
                      <div>
                        <div className="text-white font-medium">
                          vs {game.opponent}
                        </div>
                        <div className="text-gray-400 text-sm">
                          Rating: {game.rating} • {game.moves} moves
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-bold ${
                          game.result === 'win'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {game.result.toUpperCase()}
                      </div>
                      <div className="text-gray-400 text-sm">{game.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="text-2xl mr-2">🏆</span>
                Achievements
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="text-yellow-400 font-bold">First Blood</div>
                    <div className="text-yellow-300 text-sm">
                      Win your first BlindChess game
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <span className="text-2xl">🕶️</span>
                  <div>
                    <div className="text-purple-400 font-bold">
                      Blind Master
                    </div>
                    <div className="text-purple-300 text-sm">
                      Win 25 games in blind phase
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-600/20 border border-gray-500/30 rounded-lg opacity-60">
                  <span className="text-2xl">👑</span>
                  <div>
                    <div className="text-gray-400 font-bold">Chess Royalty</div>
                    <div className="text-gray-500 text-sm">
                      Reach 2000+ rating
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-600/20 border border-gray-500/30 rounded-lg opacity-60">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <div className="text-gray-400 font-bold">
                      Lightning Fast
                    </div>
                    <div className="text-gray-500 text-sm">
                      Win 10 bullet games
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
