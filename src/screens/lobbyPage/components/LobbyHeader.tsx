// src/screens/LobbyPage/components/LobbyHeader.tsx
import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, Zap, Crown, Star, Target } from 'lucide-react';

interface LobbyHeaderProps {
  playerGold: number;
}

export const LobbyHeader: React.FC<LobbyHeaderProps> = ({ playerGold }) => {
  const [liveCount, setLiveCount] = useState(2847);
  const [goldGain, setGoldGain] = useState(14);
  const [activeGames, setActiveGames] = useState(362);
  const [prizePool, setPrizePool] = useState(158000);

  // Mock player data - in real app this would come from user context
  const playerData = {
    xp: 8420,
    level: 12,
    nextLevelXP: 10000,
    username: 'ChessWarrior',
  };

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

  const xpProgress = (playerData.xp / playerData.nextLevelXP) * 100;

  return (
    <div className="mb-4">
      {/* Gaming HUD Status Bar */}
      <div className="bg-gradient-to-r from-gray-900/90 via-black/70 to-gray-900/90 backdrop-blur-xl border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-6">
          {/* Two-Row Layout for Clear Separation */}
          <div className="space-y-3">
            {/* Top Row: Redesigned Player Stats - Sleeker */}
            <div className="flex items-center justify-between bg-gradient-to-r from-gray-800/60 via-gray-900/40 to-gray-800/60 backdrop-blur-lg rounded-2xl px-8 py-4 border border-white/10 shadow-2xl">
              {/* Left: Player Identity */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-white font-black text-2xl">
                      {playerData.username[0]}
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
                    <Star className="w-3 h-3 fill-current" />
                    Elite Warrior
                  </div>
                </div>
              </div>

              {/* Center: XP Progress */}
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
                        style={{ width: `${xpProgress}%` }}
                      />
                    </div>
                    <span className="text-blue-400 text-sm font-bold">
                      {playerData.nextLevelXP.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-blue-300 text-xs font-medium mt-1">
                    {Math.floor(
                      playerData.nextLevelXP - playerData.xp
                    ).toLocaleString()}{' '}
                    XP to next level
                  </div>
                </div>
              </div>

              {/* Right: Gold Treasury */}
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
                          {playerGold.toLocaleString()}
                        </span>
                        <span className="text-yellow-400 text-xl">🪙</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 text-xs font-bold">
                          +{goldGain}% today
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Game Server Status - Clean Horizontal */}
            <div className="flex items-center justify-center gap-12 text-sm">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
