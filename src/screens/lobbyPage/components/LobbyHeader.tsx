// src/screens/LobbyPage/components/LobbyHeader.tsx
import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, Zap, Crown, Star, Target } from 'lucide-react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

// ✅ NO PROPS NEEDED - gets all data from useCurrentUser hook
export const LobbyHeader: React.FC = () => {
  const { playerData, loading } = useCurrentUser();
  const [liveCount, setLiveCount] = useState(2847);
  const [goldGain, setGoldGain] = useState(14);
  const [activeGames, setActiveGames] = useState(362);
  const [prizePool, setPrizePool] = useState(158000);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount((prev) => prev + Math.floor(Math.random() * 11) - 5);
      setActiveGames((prev) =>
        Math.max(300, prev + Math.floor(Math.random() * 21) - 10)
      );
      setPrizePool((prev) => prev + Math.floor(Math.random() * 500));

      if (Math.random() < 0.3) {
        setGoldGain((prev) =>
          Math.max(5, prev + Math.floor(Math.random() * 5) - 2)
        );
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="mb-4">
        <div className="bg-gradient-to-r from-gray-900/90 via-black/70 to-gray-900/90 backdrop-blur-xl border-b border-white/10 py-4">
          <div className="max-w-7xl mx-auto px-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gradient-to-r from-gray-800/60 via-gray-900/40 to-gray-800/60 backdrop-blur-lg rounded-2xl px-8 py-4 border border-white/10 shadow-2xl">
                <div className="animate-pulse flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-700 rounded-2xl"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-700 rounded w-32"></div>
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded w-40"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (!playerData) {
    return (
      <div className="mb-4">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400 mx-4">
          Error loading player data. Please refresh the page.
        </div>
      </div>
    );
  }

  // Calculate XP progress for next level (every 1000 XP = 1 level)
  const nextLevelXP = playerData.level * 1000;
  const xpProgress = (playerData.xp / nextLevelXP) * 100;

  // Calculate win rate
  const winRate =
    playerData.games_played > 0
      ? Math.round((playerData.wins / playerData.games_played) * 100)
      : 0;

  // Determine player rank based on rating
  const getRank = (rating: number) => {
    if (rating >= 2000) return { name: 'Grandmaster', icon: '👑' };
    if (rating >= 1800) return { name: 'Master', icon: '⭐' };
    if (rating >= 1600) return { name: 'Expert', icon: '🎯' };
    if (rating >= 1400) return { name: 'Advanced', icon: '⚔️' };
    if (rating >= 1200) return { name: 'Intermediate', icon: '🛡️' };
    return { name: 'Novice', icon: '🔰' };
  };

  const playerRank = getRank(playerData.rating);

  return (
    <div className="mb-4">
      {/* Gaming HUD Status Bar */}
      <div className="bg-gradient-to-r from-gray-900/90 via-black/70 to-gray-900/90 backdrop-blur-xl border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-6">
          {/* Two-Row Layout for Clear Separation */}
          <div className="space-y-3">
            {/* Top Row: REAL Player Stats */}
            <div className="flex items-center justify-between bg-gradient-to-r from-gray-800/60 via-gray-900/40 to-gray-800/60 backdrop-blur-lg rounded-2xl px-8 py-4 border border-white/10 shadow-2xl">
              {/* Left: Player Identity - REAL DATA */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-white font-black text-2xl">
                      {playerData.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="text-white font-black text-2xl tracking-tight">
                    {playerData.username}
                  </div>
                  <div className="text-blue-300 text-sm font-semibold flex items-center gap-1">
                    <span>{playerRank.icon}</span>
                    {playerRank.name} • {playerData.rating} ELO
                  </div>
                </div>
              </div>

              {/* Center: XP Progress - REAL DATA */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center mb-1">
                    <span className="text-blue-400 font-black text-xl">
                      LEVEL {playerData.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm font-medium">
                      {playerData.xp.toLocaleString()}
                    </span>
                    <div className="w-32 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full transition-all duration-500 shadow-lg"
                        style={{ width: `${Math.min(xpProgress, 100)}%` }}
                      />
                    </div>
                    <span className="text-blue-400 text-sm font-bold">
                      {nextLevelXP.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-blue-300 text-xs font-medium mt-1">
                    {Math.max(0, nextLevelXP - playerData.xp).toLocaleString()}{' '}
                    XP to next level
                  </div>
                </div>
              </div>

              {/* Right: Gold Treasury - REAL DATA */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">
                    Treasury Balance
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Coins className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-black text-2xl tracking-tight">
                          {playerData.gold_balance.toLocaleString()}
                        </span>
                        <span className="text-yellow-400 text-xl">🪙</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 text-xs font-bold">
                          {winRate}% win rate
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Game Server Status + Player Stats */}
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 font-bold">LIVE</span>
                <span className="text-white font-bold text-lg">
                  {liveCount.toLocaleString()}
                </span>
                <span className="text-gray-400">warriors online</span>
              </div>

              <div className="w-px h-4 bg-white/20" />

              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-lg">
                  {activeGames}
                </span>
                <span className="text-gray-400">battles raging</span>
              </div>

              <div className="w-px h-4 bg-white/20" />

              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-lg">
                  {Math.floor(prizePool / 1000)}K
                </span>
                <span className="text-yellow-400 text-lg">🪙</span>
                <span className="text-gray-400">prize pool</span>
              </div>

              <div className="w-px h-4 bg-white/20" />

              {/* REAL Player Battle Stats */}
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-bold text-lg">
                  {playerData.wins}W
                </span>
                <span className="text-red-400 font-bold text-lg">
                  {playerData.losses}L
                </span>
                <span className="text-gray-400">
                  ({playerData.games_played} total)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
