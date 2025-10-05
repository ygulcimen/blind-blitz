import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface PlayerStats {
  username: string;
  rating: number;
  gold_balance: number;
  games_played: number;
  wins: number;
  losses: number;
  draws?: number;
  created_at: string;
}

interface RecentGame {
  id: string;
  opponent_username: string;
  opponent_rating: number;
  result: 'win' | 'loss' | 'draw';
  moves_count: number;
  created_at: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPlayerData();
    }
  }, [user]);

  const fetchPlayerData = async () => {
    if (!user) return;

    try {
      // Fetch player stats
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', user.id)
        .single();

      if (playerError) throw playerError;
      setStats(playerData);

      // Fetch recent games (mock data for now - you can implement actual query)
      // This would need a proper games history table
      setRecentGames([
        {
          id: '1',
          opponent_username: 'BlindNinja',
          opponent_rating: 1623,
          result: 'win',
          moves_count: 34,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          opponent_username: 'QueenGambit',
          opponent_rating: 1892,
          result: 'loss',
          moves_count: 67,
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          opponent_username: 'RookiePlayer',
          opponent_rating: 1456,
          result: 'win',
          moves_count: 28,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error fetching player data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getMemberSince = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const winRate = stats ? Math.round((stats.wins / (stats.games_played || 1)) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-white">Loading profile...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-white">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-400 bg-clip-text text-transparent">
                Player Profile
              </span>
            </h1>
            <p className="text-xl text-gray-400">
              Your BlindChess journey and achievements
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-4"
            >
              <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 shadow-2xl">
                {/* Avatar & Name */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="inline-block"
                  >
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-6xl shadow-2xl shadow-purple-500/50">
                      ♔
                    </div>
                  </motion.div>

                  <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
                    {stats.username}
                  </h2>

                  {/* Rating Badge */}
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-2xl mb-6">
                    <span className="text-sm text-yellow-400 font-semibold">Rating</span>
                    <span className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      {stats.rating}
                    </span>
                  </div>

                  {/* Gold Balance */}
                  <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border border-amber-500/30 rounded-xl">
                    <span className="text-xl">💰</span>
                    <span className="text-amber-400 font-bold text-lg">{stats.gold_balance}</span>
                    <span className="text-amber-400/70 text-sm">Gold</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-gray-400 flex items-center gap-2">
                      <span className="text-xl">📅</span>
                      Member since
                    </span>
                    <span className="text-white font-semibold">{getMemberSince(stats.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-gray-400 flex items-center gap-2">
                      <span className="text-xl">🎮</span>
                      Games played
                    </span>
                    <span className="text-white font-semibold">{stats.games_played}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-gray-400 flex items-center gap-2">
                      <span className="text-xl">🏆</span>
                      Victories
                    </span>
                    <span className="text-green-400 font-semibold">{stats.wins}</span>
                  </div>
                </div>

                {/* Play Button */}
                <Link
                  to="/games"
                  className="block w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500
                             text-white font-bold py-4 px-6 rounded-2xl
                             transition-all duration-300 transform hover:scale-105 active:scale-95
                             shadow-lg hover:shadow-purple-500/50 text-center text-lg"
                >
                  🚀 Play Now
                </Link>
              </div>
            </motion.div>

            {/* Right Column - Stats & Games */}
            <div className="lg:col-span-8 space-y-8">
              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="group bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-2xl p-6 text-center hover:border-green-500/50 transition-all duration-300 hover:scale-105">
                    <div className="text-4xl font-black text-green-400 mb-2">
                      {stats.wins}
                    </div>
                    <div className="text-green-300/80 text-sm font-semibold">Games Won</div>
                  </div>

                  <div className="group bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6 text-center hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
                    <div className="text-4xl font-black text-blue-400 mb-2">
                      {winRate}%
                    </div>
                    <div className="text-blue-300/80 text-sm font-semibold">Win Rate</div>
                  </div>

                  <div className="group bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-2xl p-6 text-center hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                    <div className="text-4xl font-black text-purple-400 mb-2">
                      {stats.losses}
                    </div>
                    <div className="text-purple-300/80 text-sm font-semibold">Defeats</div>
                  </div>

                  <div className="group bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-500/30 rounded-2xl p-6 text-center hover:border-yellow-500/50 transition-all duration-300 hover:scale-105">
                    <div className="text-4xl font-black text-yellow-400 mb-2">
                      {stats.draws || 0}
                    </div>
                    <div className="text-yellow-300/80 text-sm font-semibold">Draws</div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Games */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-indigo-500/20 shadow-2xl"
              >
                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <span className="text-3xl">📜</span>
                  Recent Games
                </h3>

                <div className="space-y-3">
                  {recentGames.map((game, index) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="group flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-300 border border-transparent hover:border-purple-500/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${
                          game.result === 'win'
                            ? 'bg-green-400 shadow-lg shadow-green-400/50'
                            : game.result === 'loss'
                            ? 'bg-red-400 shadow-lg shadow-red-400/50'
                            : 'bg-gray-400 shadow-lg shadow-gray-400/50'
                        } group-hover:scale-125 transition-transform`} />

                        <div>
                          <div className="text-white font-bold text-lg">
                            vs {game.opponent_username}
                          </div>
                          <div className="text-gray-400 text-sm flex items-center gap-2">
                            <span>Rating: {game.opponent_rating}</span>
                            <span>•</span>
                            <span>{game.moves_count} moves</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-black text-xl mb-1 ${
                          game.result === 'win'
                            ? 'text-green-400'
                            : game.result === 'loss'
                            ? 'text-red-400'
                            : 'text-gray-400'
                        }`}>
                          {game.result === 'win' ? 'WIN' : game.result === 'loss' ? 'LOSS' : 'DRAW'}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {getTimeAgo(game.created_at)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 shadow-2xl"
              >
                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <span className="text-3xl">🏆</span>
                  Achievements
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Unlocked Achievement */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-4 p-5 bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-500/40 rounded-2xl shadow-lg hover:shadow-yellow-500/30 transition-all"
                  >
                    <span className="text-4xl">🎯</span>
                    <div>
                      <div className="text-yellow-400 font-black text-lg">First Blood</div>
                      <div className="text-yellow-300/70 text-sm">
                        Win your first BlindChess game
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-4 p-5 bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/40 rounded-2xl shadow-lg hover:shadow-purple-500/30 transition-all"
                  >
                    <span className="text-4xl">🕶️</span>
                    <div>
                      <div className="text-purple-400 font-black text-lg">
                        Blind Master
                      </div>
                      <div className="text-purple-300/70 text-sm">
                        Win 25 games in blind phase
                      </div>
                    </div>
                  </motion.div>

                  {/* Locked Achievements */}
                  <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-gray-800/30 to-gray-700/20 border border-gray-600/30 rounded-2xl opacity-50">
                    <span className="text-4xl grayscale">👑</span>
                    <div>
                      <div className="text-gray-400 font-black text-lg">Chess Royalty</div>
                      <div className="text-gray-500 text-sm">
                        Reach 2000+ rating
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-gray-800/30 to-gray-700/20 border border-gray-600/30 rounded-2xl opacity-50">
                    <span className="text-4xl grayscale">⚡</span>
                    <div>
                      <div className="text-gray-400 font-black text-lg">
                        Lightning Fast
                      </div>
                      <div className="text-gray-500 text-sm">
                        Win 10 bullet games
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
