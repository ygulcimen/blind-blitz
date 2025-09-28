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
    <Card className={`h-[60px] flex items-center px-4 gap-3 ${isMyTurn ? 'ring-2 ring-blue-400' : ''} ${className}`}>
      {/* Avatar */}
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-bold text-sm border-2 border-white/20">
          {player.avatar ? (
            <img src={player.avatar} alt={player.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            player.name.charAt(0).toUpperCase()
          )}
        </div>
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white truncate">{player.name}</span>
          <span className="text-gray-400 text-sm">({player.rating})</span>
        </div>
        <div className="flex items-center gap-2">
          {isMyTurn && (
            <span className="text-xs text-blue-400 font-medium">Your Turn</span>
          )}
        </div>
      </div>

      {/* Timer */}
      <div className={`px-3 py-1 rounded-lg font-mono text-lg font-bold ${
        isMyTurn
          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
          : 'bg-gray-700/50 text-gray-300'
      }`}>
        {timeRemaining}
      </div>
    </Card>
  );
};