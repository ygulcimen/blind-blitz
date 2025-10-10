import React from 'react';
import { Card } from '../../ui/card';

interface PlayerBarProps {
  player: {
    name: string;
    rating: number;
    avatar?: string;
  };
  timeRemaining: string;
  isActive: boolean;
  color: 'white' | 'black';
  position: 'top' | 'bottom';
  className?: string;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  player,
  timeRemaining,
  isActive,
  className = '',
}) => {
  const isMyTurn = isActive;

  return (
    <Card className={`h-[42px] sm:h-[50px] lg:h-[60px] flex items-center px-2 sm:px-3 lg:px-4 gap-1.5 sm:gap-2 lg:gap-3 ${isMyTurn ? 'ring-1 sm:ring-2 ring-blue-400' : ''} ${className}`}>
      {/* Avatar - Hidden on mobile to save space */}
      <div className="relative hidden sm:block">
        <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-bold text-xs sm:text-sm border-2 border-white/20">
          {player.avatar ? (
            <img src={player.avatar} alt={player.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            player.name.charAt(0).toUpperCase()
          )}
        </div>
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-white truncate text-xs sm:text-sm lg:text-base">{player.name}</span>
          <span className="text-gray-400 text-[9px] sm:text-xs lg:text-sm">({player.rating})</span>
        </div>
        {isMyTurn && (
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[9px] sm:text-[10px] lg:text-xs text-blue-400 font-medium">Your Turn</span>
          </div>
        )}
      </div>

      {/* Timer */}
      <div className={`px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-mono text-xs sm:text-sm lg:text-lg font-bold ${
        isMyTurn
          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
          : 'bg-gray-700/50 text-gray-300'
      }`}>
        {timeRemaining}
      </div>
    </Card>
  );
};