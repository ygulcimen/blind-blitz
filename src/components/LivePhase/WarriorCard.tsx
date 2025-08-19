// components/LivePhase/WarriorCard.tsx - SMALLER & ALIGNED VERSION
import React from 'react';
import { Clock, Crown, Star } from 'lucide-react';

interface PlayerData {
  name: string;
  rating: number;
  isHost: boolean;
}

interface WarriorCardProps {
  player: 'white' | 'black';
  playerData: PlayerData;
  timeMs: number;
  active: boolean;
}

export const WarriorCard: React.FC<WarriorCardProps> = ({
  player,
  playerData,
  timeMs,
  active,
}) => {
  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor((timeMs % 60000) / 1000);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const isLowTime = timeMs < 30000; // 30 seconds
  const isCritical = timeMs < 10000; // 10 seconds
  const isWhite = player === 'white';

  return (
    <div
      className={`bg-gradient-to-br ${
        isWhite
          ? 'from-blue-900/60 to-blue-800/40'
          : 'from-gray-900/60 to-gray-800/40'
      } backdrop-blur-sm border-2 ${
        active
          ? isWhite
            ? 'border-blue-400/50 shadow-lg shadow-blue-500/25'
            : 'border-gray-400/50 shadow-lg shadow-gray-500/25'
          : 'border-gray-700/30'
      } rounded-xl p-3 transition-all duration-300 w-64`}
    >
      {/* Compact Player Info */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
            isWhite
              ? 'bg-gradient-to-br from-blue-600 to-blue-700'
              : 'bg-gradient-to-br from-gray-600 to-gray-700'
          }`}
        >
          <span className="text-white font-black text-sm">
            {playerData.name[0]}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-lg">{isWhite ? '👑' : '⚔️'}</span>
            <span className="text-white font-bold text-sm">
              {playerData.name}
            </span>
            {playerData.isHost && <Crown className="w-3 h-3 text-yellow-400" />}
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-xs">
              {playerData.rating}
            </span>
            <span
              className={`text-xs px-1 py-0.5 rounded ${
                isWhite
                  ? 'bg-blue-900/40 text-blue-300'
                  : 'bg-gray-900/40 text-gray-300'
              }`}
            >
              {playerData.rating > 1800 ? 'MASTER' : 'EXPERT'}
            </span>
          </div>
        </div>
      </div>

      {/* Compact Timer */}
      <div className="relative">
        <div
          className={`absolute inset-0 rounded-lg blur-md transition-all duration-300 ${
            active && isCritical
              ? 'bg-red-500/40 animate-pulse'
              : active && isLowTime
              ? 'bg-yellow-500/30'
              : active
              ? isWhite
                ? 'bg-blue-500/20'
                : 'bg-gray-500/20'
              : 'bg-transparent'
          }`}
        />

        <div
          className={`relative px-3 py-2 rounded-lg border backdrop-blur-lg transition-all duration-300 ${
            active && isCritical
              ? 'bg-red-900/30 border-red-400/50'
              : active && isLowTime
              ? 'bg-yellow-900/30 border-yellow-400/50'
              : active
              ? isWhite
                ? 'bg-blue-900/30 border-blue-400/50'
                : 'bg-gray-900/30 border-gray-400/50'
              : 'bg-gray-900/20 border-gray-700/30'
          }`}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock
                className={`w-3 h-3 ${
                  active && isCritical
                    ? 'text-red-400 animate-bounce'
                    : active
                    ? 'text-white'
                    : 'text-gray-500'
                }`}
              />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  active ? 'text-white' : 'text-gray-500'
                }`}
              >
                {active ? 'ATTACKING' : 'WAITING'}
              </span>
            </div>

            <div
              className={`text-xl font-black leading-none ${
                isCritical && active
                  ? 'text-red-400 animate-pulse'
                  : isLowTime && active
                  ? 'text-yellow-400'
                  : active
                  ? 'text-white'
                  : 'text-gray-500'
              }`}
            >
              {timeStr}
            </div>

            {active && isCritical && (
              <div className="text-red-300 text-xs mt-1 font-bold uppercase animate-pulse">
                ⚠️ CRITICAL!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
